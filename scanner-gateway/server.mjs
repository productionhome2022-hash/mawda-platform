import http from "node:http";
import net from "node:net";
import { createHash, createHmac } from "node:crypto";
import { Readable } from "node:stream";
import { classifyClamDResponse, constantTimeBearerMatch, parseAllowedHosts, validateScanRequest } from "./security.mjs";

const PORT = Number(process.env.PORT ?? 8080);
const API_TOKEN = process.env.MAWDA_SCANNER_API_TOKEN ?? "";
const HMAC_SECRET = process.env.MAWDA_SCANNER_HMAC_SECRET ?? "";
const PROVIDER = process.env.MAWDA_SCANNER_PROVIDER ?? "clamav-mawadda-gateway";
const STORAGE_HOSTS = parseAllowedHosts(process.env.MAWDA_ALLOWED_STORAGE_HOSTS ?? "storage.googleapis.com");
const CALLBACK_HOSTS = parseAllowedHosts(process.env.MAWDA_ALLOWED_CALLBACK_HOSTS ?? "");
const CLAMD_HOST = process.env.CLAMD_HOST ?? "127.0.0.1";
const CLAMD_PORT = Number(process.env.CLAMD_PORT ?? 3310);
const MAX_SCAN_BYTES = Number(process.env.MAX_SCAN_BYTES ?? 100 * 1024 * 1024);
const SCAN_TIMEOUT_MS = Number(process.env.SCAN_TIMEOUT_MS ?? 7 * 60 * 1000);

function writeSocket(socket, data) {
  return new Promise((resolve, reject) => socket.write(data, (error) => error ? reject(error) : resolve()));
}
async function scanStreamWithClamD(readable) {
  const socket = net.createConnection({ host: CLAMD_HOST, port: CLAMD_PORT });
  await new Promise((resolve, reject) => { socket.once("connect", resolve); socket.once("error", reject); });
  let daemonReply = "";
  const reply = new Promise((resolve, reject) => {
    socket.on("data", (chunk) => { daemonReply += chunk.toString("utf8"); });
    socket.once("end", () => resolve(daemonReply));
    socket.once("error", reject);
  });
  const hash = createHash("sha256");
  let totalBytes = 0;
  try {
    await writeSocket(socket, Buffer.from("zINSTREAM\\0"));
    for await (const rawChunk of readable) {
      const chunk = Buffer.from(rawChunk);
      totalBytes += chunk.length;
      if (totalBytes > MAX_SCAN_BYTES) throw new Error("Object exceeds scanner byte limit.");
      hash.update(chunk);
      const frame = Buffer.alloc(4);
      frame.writeUInt32BE(chunk.length);
      await writeSocket(socket, frame);
      await writeSocket(socket, chunk);
    }
    await writeSocket(socket, Buffer.alloc(4));
    const responseText = await reply;
    return { verdict: classifyClamDResponse(responseText), sha256: hash.digest("hex"), sizeBytes: totalBytes };
  } catch (error) { socket.destroy(); throw error; }
}
async function sendCallback(url, payload) {
  const body = Buffer.from(JSON.stringify(payload));
  const signature = createHmac("sha256", HMAC_SECRET).update(body).digest("hex");
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const result = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-mawadda-scanner-signature": signature },
        body, signal: AbortSignal.timeout(20000), redirect: "error",
      });
      if (result.ok || result.status === 409) return;
      lastError = new Error("Scanner callback HTTP " + result.status);
      if (result.status >= 400 && result.status < 500) break;
    } catch (error) { lastError = error; }
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
  throw lastError ?? new Error("Scanner callback failed.");
}
async function scan(input) {
  const download = await fetch(input.downloadUrl, {
    method: "GET", redirect: "error", signal: AbortSignal.timeout(SCAN_TIMEOUT_MS),
  });
  if (!download.ok || !download.body) throw new Error("Storage download HTTP " + download.status);
  const declared = Number(download.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_SCAN_BYTES) throw new Error("Object exceeds scanner byte limit.");
  const result = await scanStreamWithClamD(Readable.fromWeb(download.body));
  await sendCallback(input.callbackUrl, {
    mediaId: input.mediaId, provider: PROVIDER, verdict: result.verdict,
    objectGeneration: input.objectGeneration, sha256: result.sha256, scannedAtMs: Date.now(),
  });
  return { mediaId: input.mediaId, verdict: result.verdict, sizeBytes: result.sizeBytes };
}
const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    const probe = net.createConnection({ host: CLAMD_HOST, port: CLAMD_PORT });
    probe.once("connect", () => { probe.end(); res.writeHead(200).end("ok"); });
    probe.once("error", () => res.writeHead(503).end("scanner-unavailable"));
    return;
  }
  if (req.method !== "POST" || req.url !== "/scan") { res.writeHead(404).end("not-found"); return; }
  if (!constantTimeBearerMatch(req.headers.authorization, API_TOKEN)) {
    res.writeHead(401, { "cache-control": "no-store" }).end("unauthorized"); return;
  }
  let raw = Buffer.alloc(0);
  try {
    for await (const chunk of req) {
      raw = Buffer.concat([raw, chunk]);
      if (raw.length > 16 * 1024) { res.writeHead(413).end("request-too-large"); return; }
    }
    const body = JSON.parse(raw.toString("utf8"));
    const input = validateScanRequest(body, { storageHosts: STORAGE_HOSTS, callbackHosts: CALLBACK_HOSTS });
    if (!input || body.provider !== PROVIDER) { res.writeHead(400).end("invalid-scan-request"); return; }
    const result = await scan(input);
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(JSON.stringify(result));
  } catch (error) {
    // Never log signed URLs, bearer tokens, raw request bodies or file contents.
    process.stderr.write(JSON.stringify({ event: "media_scan_failed", errorType: error?.name ?? "unknown" }) + "\\n");
    if (!res.headersSent) res.writeHead(503, { "cache-control": "no-store" }).end("scan-unavailable");
    else res.destroy();
  }
});
if (API_TOKEN.length < 32 || HMAC_SECRET.length < 32 || !CALLBACK_HOSTS.size || !STORAGE_HOSTS.size ||
    !Number.isSafeInteger(MAX_SCAN_BYTES) || MAX_SCAN_BYTES <= 0) {
  throw new Error("Scanner gateway requires strong secrets, explicit host allowlists and a valid byte cap.");
}
server.listen(PORT, "0.0.0.0");
