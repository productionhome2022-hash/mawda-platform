import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createHash, createHmac } from "node:crypto";
import {
  createScannerHandler,
  parseClamAvScanResponse,
  parseClamAvVersion,
  loadScannerConfig,
  scanWithClamAv,
} from "../server.mjs";

async function listen(server) {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return `http://127.0.0.1:${server.address().port}`;
}

async function close(server) {
  if (server.listening) await new Promise((resolve) => server.close(resolve));
}

function makeConfig(callbackUrl, overrides = {}) {
  return {
    bearerToken: "scanner-bearer-secret-".padEnd(48, "x"),
    hmacSecret: "scanner-hmac-secret-".padEnd(48, "y"),
    provider: "mawadda-malware-gateway",
    callbackUrl,
    maxBytes: 1024,
    clamdHost: "127.0.0.1",
    clamdPort: 3310,
    clamdTimeoutMs: 1000,
    callbackTimeoutMs: 2000,
    ...overrides,
  };
}

function requestHeaders(config, bytes, overrides = {}) {
  return {
    "content-type": "application/octet-stream",
    "x-mawadda-scanner-token": config.bearerToken,
    "x-mawadda-media-id": "123e4567-e89b-12d3-a456-426614174000",
    "x-mawadda-object-generation": "17",
    "x-mawadda-expected-sha256": createHash("sha256").update(bytes).digest("hex"),
    "x-mawadda-provider": config.provider,
    "x-mawadda-callback-url": config.callbackUrl,
    ...overrides,
  };
}

test("ClamAV response parsers require a known engine, signature database and explicit verdict", () => {
  assert.deepEqual(parseClamAvVersion("ClamAV 1.4.2/28145/Fri Nov 13 2026"), {
    engine: "ClamAV", engineVersion: "1.4.2", signatureVersion: "28145",
  });
  assert.equal(parseClamAvScanResponse("stream: OK"), "clean");
  assert.equal(parseClamAvScanResponse("stream: Eicar-Test-Signature FOUND"), "malicious");
  assert.throws(() => parseClamAvVersion("unknown"));
  assert.throws(() => parseClamAvScanResponse("stream: ERROR"));
});

test("scanner requires HTTPS callback URL and strong secrets", () => {
  assert.throws(() => loadScannerConfig({
    MAWDA_MEDIA_SCANNER_CALLBACK_URL: "http://callback.invalid/scan",
    MAWDA_MEDIA_SCANNER_BEARER_TOKEN: "b".repeat(48),
    MAWDA_MEDIA_SCANNER_HMAC_SECRET: "h".repeat(48),
  }), /HTTPS/i);
  assert.throws(() => loadScannerConfig({
    MAWDA_MEDIA_SCANNER_CALLBACK_URL: "https://callback.invalid/scan",
    MAWDA_MEDIA_SCANNER_BEARER_TOKEN: "weak",
    MAWDA_MEDIA_SCANNER_HMAC_SECRET: "h".repeat(48),
  }), /secrets/i);
});

test("clean verdict is hashed, HMAC-signed and posted to the configured callback", async () => {
  let callbackPayload;
  const callback = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);
    const expected = createHmac("sha256", config.hmacSecret).update(rawBody).digest("hex");
    assert.equal(req.headers["x-mawadda-scanner-signature"], expected);
    callbackPayload = JSON.parse(rawBody.toString("utf8"));
    res.writeHead(200);
    res.end("accepted");
  });
  const callbackUrl = await listen(callback);
  const config = makeConfig(`${callbackUrl}/callback`);
  const scanner = createServer(createScannerHandler(config, async (bytes) => {
    assert.equal(bytes.toString(), "known safe fixture");
    return { verdict: "clean", engine: "ClamAV", engineVersion: "1.4.2", signatureVersion: "db-28145" };
  }));
  const scannerUrl = await listen(scanner);
  try {
    const bytes = Buffer.from("known safe fixture");
    const response = await fetch(`${scannerUrl}/scan`, {
      method: "POST", headers: requestHeaders(config, bytes), body: bytes,
    });
    assert.equal(response.status, 200);
    assert.equal(callbackPayload.verdict, "clean");
    assert.equal(callbackPayload.engine, "ClamAV");
    assert.equal(callbackPayload.engineVersion, "1.4.2");
    assert.equal(callbackPayload.signatureVersion, "db-28145");
    assert.equal(callbackPayload.objectGeneration, "17");
    assert.equal(callbackPayload.sha256, createHash("sha256").update(bytes).digest("hex"));
  } finally {
    await close(scanner);
    await close(callback);
  }
});

test("malicious verdict is forwarded, while missing auth and altered bytes are rejected", async () => {
  let callbacks = 0;
  const callback = createServer(async (req, res) => {
    callbacks += 1;
    res.writeHead(200);
    res.end("accepted");
  });
  const callbackUrl = await listen(callback);
  const config = makeConfig(`${callbackUrl}/callback`);
  const scanner = createServer(createScannerHandler(config, async () => ({
    verdict: "malicious", engine: "ClamAV", engineVersion: "1.4.2", signatureVersion: "db-28145",
  })));
  const scannerUrl = await listen(scanner);
  try {
    const bytes = Buffer.from("EICAR fixture bytes");
    const unauthorized = await fetch(`${scannerUrl}/scan`, {
      method: "POST", headers: requestHeaders(config, bytes, { "x-mawadda-scanner-token": "wrong" }), body: bytes,
    });
    assert.equal(unauthorized.status, 401);
    const mismatch = await fetch(`${scannerUrl}/scan`, {
      method: "POST", headers: requestHeaders(config, bytes, { "x-mawadda-expected-sha256": "0".repeat(64) }), body: bytes,
    });
    assert.equal(mismatch.status, 409);
    const malicious = await fetch(`${scannerUrl}/scan`, {
      method: "POST", headers: requestHeaders(config, bytes), body: bytes,
    });
    assert.equal(malicious.status, 200);
    assert.equal(callbacks, 1);
  } finally {
    await close(scanner);
    await close(callback);
  }
});

test("scanner rejects payloads over the configured transport limit", async () => {
  const callback = createServer((req, res) => { res.writeHead(200); res.end("ok"); });
  const callbackUrl = await listen(callback);
  const config = makeConfig(`${callbackUrl}/callback`, { maxBytes: 4 });
  const scanner = createServer(createScannerHandler(config, async () => ({
    verdict: "clean", engine: "ClamAV", engineVersion: "1.4.2", signatureVersion: "db-1",
  })));
  const scannerUrl = await listen(scanner);
  try {
    const bytes = Buffer.from("too large");
    const response = await fetch(`${scannerUrl}/scan`, {
      method: "POST", headers: requestHeaders(config, bytes), body: bytes,
    });
    assert.equal(response.status, 413);
  } finally {
    await close(scanner);
    await close(callback);
  }
});

test("scanner stays fail-closed when the callback endpoint is unavailable", async () => {
  const config = makeConfig("http://127.0.0.1:1/callback", { callbackTimeoutMs: 200 });
  const scanner = createServer(createScannerHandler(config, async () => ({
    verdict: "clean", engine: "ClamAV", engineVersion: "1.4.2", signatureVersion: "db-1",
  })));
  const scannerUrl = await listen(scanner);
  try {
    const bytes = Buffer.from("fixture");
    const response = await fetch(`${scannerUrl}/scan`, {
      method: "POST", headers: requestHeaders(config, bytes), body: bytes,
    });
    assert.equal(response.status, 503);
  } finally {
    await close(scanner);
  }
});


test("ClamAV INSTREAM protocol sends bounded length-prefixed chunks and accepts only daemon verdict", async () => {
  const daemon = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    let mode = "command";
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (mode === "command") {
        const end = buffer.indexOf(0);
        if (end < 0) return;
        const command = buffer.subarray(0, end).toString("utf8");
        buffer = buffer.subarray(end + 1);
        if (command === "zVERSION") {
          socket.end(Buffer.from("ClamAV 1.4.2/28145/Fri Nov 13 2026\0"));
          return;
        }
        if (command !== "zINSTREAM") {
          socket.destroy(new Error("Unexpected ClamAV command"));
          return;
        }
        mode = "stream";
      }
      if (mode === "stream") {
        while (buffer.length >= 4) {
          const length = buffer.readUInt32BE(0);
          if (buffer.length < 4 + length) return;
          buffer = buffer.subarray(4);
          if (length === 0) {
            socket.end(Buffer.from("stream: OK\0"));
            return;
          }
          buffer = buffer.subarray(length);
        }
      }
    });
  });
  const daemonUrl = await listen(daemon);
  try {
    const port = Number(new URL(daemonUrl).port);
    const bytes = Buffer.alloc(1_500_000, 0x61);
    const result = await scanWithClamAv(bytes, {
      clamdHost: "127.0.0.1", clamdPort: port, clamdTimeoutMs: 2000,
    });
    assert.deepEqual(result, {
      engine: "ClamAV", engineVersion: "1.4.2",
      signatureVersion: "28145", verdict: "clean",
    });
  } finally {
    await close(daemon);
  }
});
