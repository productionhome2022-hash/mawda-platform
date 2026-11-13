const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs/promises");
const { createReadStream, createWriteStream } = require("node:fs");
const { createHash, createHmac } = require("node:crypto");
const { pipeline } = require("node:stream/promises");
const { Transform } = require("node:stream");
const { promisify } = require("node:util");
const { execFile } = require("node:child_process");
const sharp = require("sharp");
const { Storage } = require("@google-cloud/storage");
const { equalSecret, validateScanRequest } = require("./security");

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.PORT || 8080);
const PROVIDER = process.env.SCANNER_PROVIDER || "clamav-mawadda-gateway";
const API_TOKEN = process.env.SCANNER_API_TOKEN || "";
const HMAC_SECRET = process.env.SCANNER_HMAC_SECRET || "";
const CALLBACK_URL = process.env.SCANNER_CALLBACK_URL || "";
const BUCKET_NAME = process.env.GCS_BUCKET || "";
const MAX_DOWNLOAD_BYTES = Number(process.env.MAX_DOWNLOAD_BYTES || 100 * 1024 * 1024);
const SCAN_TIMEOUT_MS = Number(process.env.SCAN_TIMEOUT_MS || 150_000);
const storage = new Storage();

function json(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16 * 1024) throw new Error("REQUEST_TOO_LARGE");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function sha256File(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex");
}

async function downloadToFile(url, destination) {
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok || !response.body) throw new Error(`SOURCE_DOWNLOAD_HTTP_${response.status}`);
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_DOWNLOAD_BYTES) {
    throw new Error("SOURCE_EXCEEDS_SCAN_LIMIT");
  }
  let received = 0;
  const limiter = new Transform({
    transform(chunk, encoding, callback) {
      received += chunk.length;
      if (received > MAX_DOWNLOAD_BYTES) return callback(new Error("SOURCE_EXCEEDS_SCAN_LIMIT"));
      callback(null, chunk);
    },
  });
  await pipeline(require("node:stream").Readable.fromWeb(response.body), limiter, createWriteStream(destination, { flags: "wx", mode: 0o600 }));
  if (received < 1) throw new Error("EMPTY_SOURCE_OBJECT");
  return received;
}

async function scanWithClamAv(filePath) {
  try {
    await execFileAsync("clamscan", [
      "--infected", "--no-summary", "--alert-exceeds-max=yes",
      "--max-filesize=105M", "--max-scansize=210M",
      "--max-recursion=16", "--max-files=1000",
      "--scan-archive=yes", "--scan-pdf=yes", "--scan-html=yes",
      "--scan-pe=yes", "--scan-ole2=yes", "--scan-mail=yes",
      filePath,
    ], { timeout: SCAN_TIMEOUT_MS, maxBuffer: 1024 * 1024 });
    return "clean";
  } catch (error) {
    const code = Number(error && error.code);
    const output = String(error && error.stdout || "") + String(error && error.stderr || "");
    if (code === 1 && /FOUND/.test(output) && !/Heuristics\.Limits\.Exceeded|Not Scanned/i.test(output)) {
      return "malicious";
    }
    throw new Error("CLAMAV_SCAN_INCOMPLETE");
  }
}

async function createSafeImageDerivative(sourcePath, request) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(request.contentType)) return null;
  const outputPath = path.join(path.dirname(sourcePath), "preview.webp");
  await sharp(sourcePath, {
    failOn: "error",
    limitInputPixels: 40_000_000,
    animated: false,
  }).rotate().resize({
    width: 4096,
    height: 4096,
    fit: "inside",
    withoutEnlargement: true,
  }).webp({ quality: 82, effort: 4 }).toFile(outputPath);
  const outputStat = await fs.stat(outputPath);
  if (!outputStat.size || outputStat.size > 20 * 1024 * 1024) {
    throw new Error("SAFE_DERIVATIVE_SIZE_INVALID");
  }

  const uid = request.objectPath.split("/")[1];
  const derivativePath = `processed/${uid}/${request.mediaId}/preview.webp`;
  const derivative = storage.bucket(BUCKET_NAME).file(derivativePath);
  await derivative.save(await fs.readFile(outputPath), {
    resumable: false,
    preconditionOpts: { ifGenerationMatch: 0 },
    metadata: {
      contentType: "image/webp",
      cacheControl: "private, no-store, max-age=0",
      metadata: {
        mediaId: request.mediaId,
        sourceGeneration: request.objectGeneration,
        scannerProvider: PROVIDER,
        processing: "sharp-decode-reencode-v1",
      },
    },
  });
  const [metadata] = await derivative.getMetadata();
  return {
    safePreviewPath: derivativePath,
    safePreviewGeneration: String(metadata.generation),
    safePreviewSha256: await sha256File(outputPath),
    safePreviewContentType: "image/webp",
  };
}

async function sendVerdict(payload) {
  if (!CALLBACK_URL || !HMAC_SECRET || HMAC_SECRET.length < 32) {
    throw new Error("SCANNER_CALLBACK_NOT_CONFIGURED");
  }
  const body = Buffer.from(JSON.stringify(payload));
  const signature = createHmac("sha256", HMAC_SECRET).update(body).digest("hex");
  const response = await fetch(CALLBACK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-mawadda-scanner-signature": signature,
      "idempotency-key": `${payload.mediaId}:${payload.objectGeneration}`,
    },
    body,
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`SCANNER_CALLBACK_HTTP_${response.status}`);
}

async function handleScan(request, response) {
  const started = Date.now();
  let tempDir;
  let scanRequest;
  try {
    if (!equalSecret(request.headers.authorization?.replace(/^Bearer\s+/i, ""), API_TOKEN)) {
      json(response, 401, { error: "unauthorized" });
      return;
    }
    if (!API_TOKEN || API_TOKEN.length < 32 || !BUCKET_NAME) {
      json(response, 503, { error: "scanner_not_configured" });
      return;
    }
    const body = await readJson(request);
    scanRequest = validateScanRequest(body, PROVIDER, BUCKET_NAME);
    if (!scanRequest) {
      json(response, 400, { error: "invalid_scan_request" });
      return;
    }

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mawadda-scan-"));
    const sourcePath = path.join(tempDir, "source.bin");
    await downloadToFile(scanRequest.downloadUrl, sourcePath);
    const sourceSha256 = await sha256File(sourcePath);
    const verdict = await scanWithClamAv(sourcePath);
    let derivative = null;
    if (verdict === "clean") derivative = await createSafeImageDerivative(sourcePath, scanRequest);

    await sendVerdict({
      mediaId: scanRequest.mediaId,
      provider: PROVIDER,
      verdict,
      objectGeneration: scanRequest.objectGeneration,
      sha256: sourceSha256,
      scannedAtMs: Date.now(),
      ...(derivative || {}),
    });
    console.info(JSON.stringify({
      event: "media_scan_completed",
      mediaId: scanRequest.mediaId,
      provider: PROVIDER,
      verdict,
      derivativeCreated: Boolean(derivative),
      durationMs: Date.now() - started,
    }));
    json(response, 202, { accepted: true, mediaId: scanRequest.mediaId, verdict });
  } catch (error) {
    console.error(JSON.stringify({
      event: "media_scan_failed",
      mediaId: scanRequest?.mediaId || null,
      errorCode: error instanceof Error ? error.message : "scanner_error",
      durationMs: Date.now() - started,
    }));
    json(response, 503, { error: "scan_unavailable" });
  } finally {
    if (tempDir) await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/healthz") {
    json(response, 200, { status: "ok", provider: PROVIDER });
    return;
  }
  if (request.method !== "POST" || request.url !== "/scan") {
    json(response, 404, { error: "not_found" });
    return;
  }
  await handleScan(request, response);
});

server.listen(PORT, "0.0.0.0", () => {
  console.info(JSON.stringify({ event: "scanner_started", port: PORT, provider: PROVIDER }));
});
