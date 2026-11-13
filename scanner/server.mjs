import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import net from "node:net";
import { pathToFileURL } from "node:url";

const UUID = /^[0-9a-f-]{36}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const MAX_DEFAULT_BYTES = 100 * 1024 * 1024;

function secureEqual(left, right) {
  const a = Buffer.from(String(left ?? ""));
  const b = Buffer.from(String(right ?? ""));
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

export function parseClamAvVersion(response) {
  const match = /^ClamAV\s+([^/\s]+)\/([^/\s]+)\/(.+)$/.exec(String(response).trim());
  if (!match) throw new Error("CLAMAV_VERSION_RESPONSE_INVALID");
  const signatureUpdatedAtMs = Date.parse(match[3].trim());
  if (!Number.isFinite(signatureUpdatedAtMs)) throw new Error("CLAMAV_SIGNATURE_DATE_INVALID");
  return {
    engine: "ClamAV",
    engineVersion: match[1],
    signatureVersion: match[2],
    signatureUpdatedAtMs,
  };
}

export function assertSignatureFresh(version, nowMs = Date.now(), maxAgeMs = 48 * 60 * 60 * 1000) {
  if (!Number.isFinite(version?.signatureUpdatedAtMs) ||
      !Number.isFinite(nowMs) || !Number.isSafeInteger(maxAgeMs) || maxAgeMs <= 0) {
    throw new Error("CLAMAV_SIGNATURE_FRESHNESS_INPUT_INVALID");
  }
  const ageMs = nowMs - version.signatureUpdatedAtMs;
  if (ageMs < -5 * 60 * 1000 || ageMs > maxAgeMs) {
    throw new Error("CLAMAV_SIGNATURE_DATABASE_STALE");
  }
  return true;
}

export function parseClamAvScanResponse(response) {
  const text = String(response).trim();
  if (/^stream:\s*OK$/i.test(text)) return "clean";
  if (/^stream:.+\sFOUND$/i.test(text)) return "malicious";
  throw new Error("CLAMAV_SCAN_DID_NOT_RETURN_A_VERDICT");
}

export function buildClamAvInstreamFrames(payload, chunkSize = 1024 * 1024) {
  if (!Buffer.isBuffer(payload) || payload.length === 0 ||
      !Number.isSafeInteger(chunkSize) || chunkSize < 1 || chunkSize > 1024 * 1024) {
    throw new TypeError("Invalid ClamAV INSTREAM payload or chunk size.");
  }
  const frames = [Buffer.from("zINSTREAM\0")];
  for (let offset = 0; offset < payload.length; offset += chunkSize) {
    const part = payload.subarray(offset, Math.min(offset + chunkSize, payload.length));
    const length = Buffer.alloc(4);
    length.writeUInt32BE(part.length, 0);
    frames.push(length, part);
  }
  frames.push(Buffer.alloc(4));
  return frames;
}

function clamdCommand(config, command, payload) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: config.clamdHost, port: config.clamdPort });
    let response = Buffer.alloc(0);
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      error ? reject(error) : resolve(value);
    };
    socket.setTimeout(config.clamdTimeoutMs, () => finish(new Error("CLAMAV_TIMEOUT")));
    socket.on("error", (error) => finish(error));
    socket.on("end", () => finish(new Error("CLAMAV_CONNECTION_CLOSED_BEFORE_VERDICT")));
    socket.on("data", (chunk) => {
      response = Buffer.concat([response, chunk]);
      if (response.includes(0)) finish(null, response.toString("utf8").replace(/\0.*$/s, ""));
    });
    socket.on("connect", () => {
      if (payload) {
        for (const frame of buildClamAvInstreamFrames(payload)) socket.write(frame);
      } else {
        socket.write(Buffer.from(`z${command}\0`));
      }
    });
  });
}

export async function scanWithClamAv(bytes, config) {
  const versionText = await clamdCommand(config, "VERSION");
  const version = parseClamAvVersion(versionText);
  assertSignatureFresh(version, Date.now(), config.maxSignatureAgeMs);
  const scanText = await clamdCommand(config, "INSTREAM", bytes);
  return { ...version, verdict: parseClamAvScanResponse(scanText) };
}

async function readBoundedBody(request, maxBytes) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    const part = Buffer.from(chunk);
    total += part.length;
    if (total > maxBytes) {
      const error = new Error("MEDIA_SCAN_SIZE_LIMIT_EXCEEDED");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(part);
  }
  if (total === 0) {
    const error = new Error("EMPTY_SCAN_PAYLOAD");
    error.statusCode = 400;
    throw error;
  }
  return Buffer.concat(chunks, total);
}

export function createScannerHandler(config, scan = scanWithClamAv) {
  return async (request, response) => {
    if (request.method === "GET" && request.url === "/healthz") {
      try {
        const version = parseClamAvVersion(await clamdCommand(config, "VERSION"));
        assertSignatureFresh(version, Date.now(), config.maxSignatureAgeMs);
        await clamdCommand(config, "PING");
        response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
        response.end(JSON.stringify({ status: "ready", ...version }));
      } catch {
        response.writeHead(503, { "cache-control": "no-store" });
        response.end("scanner unavailable");
      }
      return;
    }
    if (request.method !== "POST" || request.url !== "/scan") {
      response.writeHead(404, { "cache-control": "no-store" });
      response.end("not found");
      return;
    }
    if (request.headers["content-type"] !== "application/octet-stream") {
      response.writeHead(415, { "cache-control": "no-store", "x-content-type-options": "nosniff" });
      response.end("unsupported content type");
      return;
    }
    const declaredLength = request.headers["content-length"] === undefined
      ? null : Number(request.headers["content-length"]);
    if (declaredLength !== null && (!Number.isSafeInteger(declaredLength) ||
        declaredLength <= 0 || declaredLength > config.maxBytes)) {
      response.writeHead(413, { "cache-control": "no-store" });
      response.end("payload too large");
      return;
    }
    if (!secureEqual(request.headers["x-mawadda-scanner-token"], config.bearerToken)) {
      response.writeHead(401, { "cache-control": "no-store" });
      response.end("unauthorized");
      return;
    }

    try {
      const mediaId = String(request.headers["x-mawadda-media-id"] ?? "");
      const objectGeneration = String(request.headers["x-mawadda-object-generation"] ?? "");
      const expectedSha256 = String(request.headers["x-mawadda-expected-sha256"] ?? "");
      const provider = String(request.headers["x-mawadda-provider"] ?? "");
      const callbackUrl = String(request.headers["x-mawadda-callback-url"] ?? "");
      if (!UUID.test(mediaId) || !/^\d+$/.test(objectGeneration) ||
          !SHA256.test(expectedSha256) || provider !== config.provider ||
          callbackUrl !== config.callbackUrl) {
        response.writeHead(400, { "cache-control": "no-store" });
        response.end("invalid scan metadata");
        return;
      }

      const bytes = await readBoundedBody(request, config.maxBytes);
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      if (sha256 !== expectedSha256) {
        response.writeHead(409, { "cache-control": "no-store" });
        response.end("payload hash mismatch");
        return;
      }

      const result = await scan(bytes, config);
      if (!["clean", "malicious"].includes(result.verdict)) {
        throw new Error("CLAMAV_VERDICT_INVALID");
      }
      const verdict = {
        mediaId,
        provider: config.provider,
        engine: result.engine,
        engineVersion: result.engineVersion,
        signatureVersion: result.signatureVersion,
        verdict: result.verdict,
        objectGeneration,
        sha256,
        scannedAtMs: Date.now(),
      };
      const rawBody = Buffer.from(JSON.stringify(verdict));
      const signature = createHmac("sha256", config.hmacSecret).update(rawBody).digest("hex");
      const callback = await fetch(config.callbackUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mawadda-scanner-signature": signature,
        },
        body: rawBody,
        signal: AbortSignal.timeout(config.callbackTimeoutMs),
      });
      if (!callback.ok) throw new Error(`SCANNER_CALLBACK_HTTP_${callback.status}`);
      response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
      response.end(JSON.stringify({ accepted: true, verdict: result.verdict, sha256 }));
    } catch (error) {
      const status = Number(error?.statusCode) || 503;
      response.writeHead(status, { "content-type": "text/plain", "cache-control": "no-store" });
      response.end(status === 413 ? "payload too large" : status === 400 ? "invalid payload" : "scan unavailable");
    }
  };
}

export function loadScannerConfig(env = process.env) {
  const callbackUrl = new URL(env.MAWDA_MEDIA_SCANNER_CALLBACK_URL ?? "");
  if (callbackUrl.protocol !== "https:") throw new Error("SCANNER_CALLBACK_MUST_USE_HTTPS");
  const bearerToken = env.MAWDA_MEDIA_SCANNER_BEARER_TOKEN ?? "";
  const hmacSecret = env.MAWDA_MEDIA_SCANNER_HMAC_SECRET ?? "";
  const provider = env.MAWDA_MEDIA_SCANNER_PROVIDER ?? "mawadda-malware-gateway";
  if (bearerToken.length < 32 || hmacSecret.length < 32 || provider.length < 3) {
    throw new Error("SCANNER_SECRETS_OR_PROVIDER_NOT_CONFIGURED");
  }
  const maxBytes = Number(env.MAWDA_MEDIA_SCANNER_MAX_BYTES ?? MAX_DEFAULT_BYTES);
  const maxSignatureAgeMs = Number(env.MAWDA_MEDIA_SCANNER_MAX_SIGNATURE_AGE_MS ?? 48 * 60 * 60 * 1000);
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0 || maxBytes > MAX_DEFAULT_BYTES) {
    throw new Error("SCANNER_MAX_BYTES_INVALID");
  }
  if (!Number.isSafeInteger(maxSignatureAgeMs) || maxSignatureAgeMs < 60 * 60 * 1000 ||
      maxSignatureAgeMs > 7 * 24 * 60 * 60 * 1000) {
    throw new Error("SCANNER_SIGNATURE_MAX_AGE_INVALID");
  }
  const port = Number(env.PORT ?? 8080);
  const clamdPort = Number(env.CLAMD_PORT ?? 3310);
  if (!Number.isInteger(port) || port < 1 || port > 65535 ||
      !Number.isInteger(clamdPort) || clamdPort < 1 || clamdPort > 65535) {
    throw new Error("SCANNER_PORT_CONFIGURATION_INVALID");
  }
  return {
    port,
    bearerToken,
    hmacSecret,
    provider,
    callbackUrl: callbackUrl.toString(),
    clamdHost: env.CLAMD_HOST ?? "127.0.0.1",
    clamdPort,
    clamdTimeoutMs: 120_000,
    callbackTimeoutMs: 30_000,
    maxBytes,
    maxSignatureAgeMs,
  };
}

export function startScannerServer(config = loadScannerConfig()) {
  const server = createServer(createScannerHandler(config));
  server.requestTimeout = 600_000;
  server.headersTimeout = 65_000;
  server.keepAliveTimeout = 5_000;
  server.listen(config.port, "0.0.0.0");
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startScannerServer();
}
