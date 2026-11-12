const test = require("node:test");
const assert = require("node:assert/strict");
const {
  detectMediaSignature,
  mediaPolicyFor,
  normalizeMediaRequest,
  mediaUploaderTypeFromToken,
} = require("../lib/media-security");

test("media policy allowlists supported types and applies per-category size caps", () => {
  assert.equal(mediaPolicyFor("image/png").category, "image");
  assert.equal(mediaPolicyFor("video/mp4").maxBytes, 100 * 1024 * 1024);
  assert.equal(mediaPolicyFor("application/x-msdownload"), null);
});

test("upload request rejects unsafe names, unsupported types and invalid sizes", () => {
  assert.throws(() => normalizeMediaRequest({ originalName: "../secret.pdf", contentType: "application/pdf", sizeBytes: 20 }));
  assert.throws(() => normalizeMediaRequest({ originalName: "file.exe", contentType: "application/x-msdownload", sizeBytes: 20 }));
  assert.throws(() => normalizeMediaRequest({ originalName: "file.png", contentType: "image/png", sizeBytes: -1 }));
  assert.deepEqual(normalizeMediaRequest({ originalName: "photo.png", contentType: "image/png", sizeBytes: 1024 }), {
    originalName: "photo.png", contentType: "image/png", declaredSizeBytes: 1024,
  });
});

test("file signature detection identifies PNG, JPEG, WebP, PDF, MP4, OGG and WAV", () => {
  assert.equal(detectMediaSignature(Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])), "image/png");
  assert.equal(detectMediaSignature(Uint8Array.from([0xff,0xd8,0xff,0x00])), "image/jpeg");
  assert.equal(detectMediaSignature(new TextEncoder().encode("RIFF0000WEBP")), "image/webp");
  assert.equal(detectMediaSignature(new TextEncoder().encode("%PDF-1.7")), "application/pdf");
  assert.equal(detectMediaSignature(new TextEncoder().encode("0000ftypisom")), "video/mp4");
  assert.equal(detectMediaSignature(new TextEncoder().encode("0000ftypM4A ")), "audio/mp4");
  assert.equal(detectMediaSignature(new TextEncoder().encode("OggS0000")), "audio/ogg");
  assert.equal(detectMediaSignature(new TextEncoder().encode("RIFF0000WAVE")), "audio/wav");
  assert.equal(detectMediaSignature(new TextEncoder().encode("unknown")), null);
});

test("signature mismatch cannot be mistaken for an allowed media format", () => {
  assert.notEqual(detectMediaSignature(new TextEncoder().encode("MZ executable")), "application/pdf");
});


test("uploader classification trusts Firebase Auth provider claims, not client fields", () => {
  assert.equal(mediaUploaderTypeFromToken({ firebase: { sign_in_provider: "anonymous" } }), "guest");
  assert.equal(mediaUploaderTypeFromToken({ firebase: { sign_in_provider: "password" } }), "member");
  assert.equal(mediaUploaderTypeFromToken({ uploaderType: "guest" }), "member");
  assert.equal(mediaUploaderTypeFromToken({ firebase: "anonymous" }), "member");
});
