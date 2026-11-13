import hashlib
import hmac
import io
import json
import os
import re
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import warnings
from PIL import Image, ImageOps, UnidentifiedImageError
from google.api_core.exceptions import PreconditionFailed
from google.cloud import storage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

MAX_UPLOAD_BYTES = 100 * 1024 * 1024
MAX_CONTROL_BODY = 64 * 1024
MAX_SAFE_PREVIEW_BYTES = 2 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
MEDIA_ID_RE = re.compile(r"^[0-9a-f-]{36}$", re.I)
GENERATION_RE = re.compile(r"^\d+$")
ALLOWED_DOWNLOAD_HOSTS = {"storage.googleapis.com"}
PROVIDER = os.environ.get("MAWDA_SCANNER_PROVIDER", "clamav-mawadda-gateway")


class RejectRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("redirects are not permitted for signed scanner capabilities")


SAFE_OPENER = urllib.request.build_opener(RejectRedirect)


def constant_time_token_match(supplied, expected):
    return bool(supplied and expected and hmac.compare_digest(supplied, expected))


def validate_dispatch(payload):
    if not isinstance(payload, dict):
        raise ValueError("invalid payload")
    media_id = payload.get("mediaId")
    generation = payload.get("objectGeneration")
    provider = payload.get("provider")
    download_url = payload.get("downloadUrl")
    callback_url = payload.get("callbackUrl")
    object_path = payload.get("objectPath")
    if not isinstance(media_id, str) or not MEDIA_ID_RE.fullmatch(media_id):
        raise ValueError("invalid media ID")
    if not isinstance(generation, str) or not GENERATION_RE.fullmatch(generation):
        raise ValueError("invalid object generation")
    if provider != PROVIDER:
        raise ValueError("provider mismatch")
    if not isinstance(object_path, str):
        raise ValueError("invalid quarantine path")
    path_parts = object_path.split("/")
    if (len(path_parts) != 3 or path_parts[0] != "quarantine" or
            not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", path_parts[1]) or
            path_parts[2] != media_id):
        raise ValueError("invalid quarantine path")
    download = urllib.parse.urlparse(download_url or "")
    download_query = urllib.parse.parse_qs(download.query)
    if (download.scheme != "https" or download.hostname not in ALLOWED_DOWNLOAD_HOSTS or
            not download_query.get("X-Goog-Signature") or
            not download_query.get("X-Goog-Algorithm")):
        raise ValueError("download URL host, scheme or signature is not allowed")
    callback = urllib.parse.urlparse(callback_url or "")
    if callback.scheme != "https" or not callback.hostname or not callback.hostname.endswith(".cloudfunctions.net"):
        raise ValueError("callback URL host or scheme is not allowed")
    if not callback.path.rstrip("/").endswith("/receiveMediaScanVerdict"):
        raise ValueError("callback path is not allowed")
    return media_id, generation, download_url, callback_url


def download_to_temp(url):
    digest = hashlib.sha256()
    total = 0
    temp = tempfile.NamedTemporaryFile(prefix="mawadda-scan-", delete=False)
    path = Path(temp.name)
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "Mawadda-ClamAV-Gateway/1.0"})
        with SAFE_OPENER.open(request, timeout=45) as response, temp:
            length = response.headers.get("Content-Length")
            if length and int(length) > MAX_UPLOAD_BYTES:
                raise ValueError("file exceeds scanner transport limit")
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise ValueError("file exceeds scanner transport limit")
                digest.update(chunk)
                temp.write(chunk)
        if total <= 0:
            raise ValueError("empty file")
        return path, total, digest.hexdigest()
    except Exception:
        try:
            temp.close()
        finally:
            path.unlink(missing_ok=True)
        raise


def clamd_ready():
    try:
        with socket.create_connection(("127.0.0.1", 3310), timeout=2) as connection:
            connection.sendall(b"PING\n")
            return connection.recv(16).strip() == b"PONG"
    except OSError:
        return False


def scan_file(path):
    result = subprocess.run(
        ["clamdscan", "--no-summary", str(path)],
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )
    if result.returncode == 0 and "OK" in result.stdout:
        return "clean"
    if result.returncode == 1 and "FOUND" in result.stdout:
        return "malicious"
    raise RuntimeError("ClamAV scan failed or returned an indeterminate result")


def signature_database_version():
    databases = sorted(Path('/var/lib/clamav').glob('*.cvd')) + sorted(Path('/var/lib/clamav').glob('*.cld'))
    versions = []
    for database in databases:
        result = subprocess.run(['sigtool', '--info', str(database)], capture_output=True, text=True, timeout=10, check=False)
        if result.returncode == 0:
            version = next((line.split(':', 1)[1].strip() for line in result.stdout.splitlines() if line.lower().startswith('version:')), '')
            if version:
                versions.append(database.name + ':' + version)
    if not versions:
        raise RuntimeError('ClamAV signature database version is unavailable')
    return ','.join(versions)



def make_safe_webp_preview(source_path):
    """Decode a bounded static raster and re-encode metadata-free WebP."""
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(source_path) as probe:
                if probe.format not in {"JPEG", "PNG", "WEBP"} or getattr(probe, "n_frames", 1) != 1:
                    return None
                width, height = probe.size
                if width <= 0 or height <= 0 or width > 10000 or height > 10000 or width * height > MAX_IMAGE_PIXELS:
                    return None
                probe.verify()
            with Image.open(source_path) as source:
                source.load()
                normalized = ImageOps.exif_transpose(source)
                has_alpha = "A" in normalized.getbands() or (
                    normalized.mode == "P" and "transparency" in normalized.info
                )
                raster = normalized.convert("RGBA" if has_alpha else "RGB")
                output = io.BytesIO()
                raster.save(output, format="WEBP", quality=88, method=4, exact=True)
                result = output.getvalue()
                if not result or len(result) > MAX_SAFE_PREVIEW_BYTES:
                    return None
                return result
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        return None


def upload_safe_preview(owner_uid, media_id, source_generation, source_sha256, image_bytes):
    bucket_name = os.environ.get("MAWDA_MEDIA_BUCKET", "")
    if not bucket_name:
        raise RuntimeError("media bucket is not configured for safe derivative storage")
    preview_path = f"processed/{owner_uid}/{media_id}/preview.webp"
    blob = storage.Client().bucket(bucket_name).blob(preview_path)
    metadata = {
        "mediaId": media_id,
        "sourceGeneration": source_generation,
        "sourceSha256": source_sha256,
        "scannerProvider": PROVIDER,
        "processingProfile": "raster-webp-v1",
    }
    blob.metadata = metadata
    blob.cache_control = "private,no-store,max-age=0"
    try:
        blob.upload_from_string(image_bytes, content_type="image/webp", if_generation_match=0)
        blob.reload()
    except PreconditionFailed:
        # A retried job may already have written this exact deterministic derivative.
        blob.reload()
        if blob.metadata != metadata or blob.content_type != "image/webp":
            raise RuntimeError("existing safe derivative does not match the retry identity")
        existing = blob.download_as_bytes()
        if hashlib.sha256(existing).hexdigest() != hashlib.sha256(image_bytes).hexdigest():
            raise RuntimeError("existing safe derivative hash differs from retry output")
    if not blob.generation:
        raise RuntimeError("safe derivative generation was not returned by Storage")
    return {
        "safePreviewPath": preview_path,
        "safePreviewGeneration": str(blob.generation),
        "safePreviewSha256": hashlib.sha256(image_bytes).hexdigest(),
        "safePreviewContentType": "image/webp",
    }

def signed_callback(payload, callback_url, secret):
    raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), raw, hashlib.sha256).hexdigest()
    request = urllib.request.Request(
        callback_url,
        data=raw,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Mawadda-Scanner-Signature": signature,
            "User-Agent": "Mawadda-ClamAV-Gateway/1.0",
        },
    )
    with SAFE_OPENER.open(request, timeout=30) as response:
        if response.status != 200:
            raise RuntimeError("scanner verdict callback was not accepted")
        return response.read(4096)


def process_dispatch(payload):
    media_id, generation, download_url, callback_url = validate_dispatch(payload)
    secret = os.environ.get("MAWDA_MEDIA_SCANNER_HMAC_SECRET", "")
    if len(secret) < 32:
        raise RuntimeError("scanner HMAC secret is not configured")
    if not clamd_ready():
        raise RuntimeError("ClamAV daemon is not ready")
    path, size, digest = download_to_temp(download_url)
    try:
        verdict = scan_file(path)
        version = subprocess.run(
            ["clamdscan", "--version"], capture_output=True, text=True,
            timeout=10, check=True,
        ).stdout.strip()
        result = {
            "mediaId": media_id,
            "provider": PROVIDER,
            "verdict": verdict,
            "objectGeneration": generation,
            "sha256": digest,
            "fileSizeBytes": size,
            "scannedAtMs": int(time.time() * 1000),
            "scanEngine": "ClamAV",
            "engineVersion": version,
            "signatureDatabaseVersion": signature_database_version(),
        }
        if verdict == "clean" and payload.get("contentType") in {"image/jpeg", "image/png", "image/webp"}:
            preview_bytes = make_safe_webp_preview(path)
            if preview_bytes:
                owner_uid = payload["objectPath"].split("/")[1]
                result.update(upload_safe_preview(owner_uid, media_id, generation, digest, preview_bytes))
        signed_callback(result, callback_url, secret)
        return {"accepted": True, "mediaId": media_id, "verdict": verdict}
    finally:
        path.unlink(missing_ok=True)


class Handler(BaseHTTPRequestHandler):
    server_version = "MawaddaClamAVGateway/1.0"

    def do_GET(self):
        if self.path != "/healthz":
            self.send_error(404)
            return
        ready = clamd_ready()
        body = json.dumps({"ready": ready}).encode()
        self.send_response(200 if ready else 503)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/scan":
            self.send_error(404)
            return
        expected = os.environ.get("MAWDA_SCANNER_API_TOKEN", "")
        supplied = self.headers.get("X-Mawadda-Scanner-Token", "")
        if not constant_time_token_match(supplied, expected) or len(expected) < 32:
            self.send_error(401)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_CONTROL_BODY:
                raise ValueError("invalid control payload size")
            payload = json.loads(self.rfile.read(length))
            result = process_dispatch(payload)
            body = json.dumps(result).encode()
            self.send_response(202)
        except (ValueError, json.JSONDecodeError):
            body = b'{"error":"invalid request"}'
            self.send_response(400)
        except urllib.error.HTTPError as error:
            body = json.dumps({"error": "upstream rejected", "status": error.code}).encode()
            self.send_response(502)
        except Exception:
            # Do not leak signed URLs, file paths, secrets or scanner output to clients.
            body = b'{"error":"scan could not be completed; quarantine retained"}'
            self.send_response(503)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        # Default access logs can contain query strings or secrets; keep logs metadata-only.
        print(json.dumps({"event": "http_access", "status": args[0] if args else "unknown"}))


def main():
    port = int(os.environ.get("PORT", "8080"))
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()


if __name__ == "__main__":
    main()
