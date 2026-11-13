const test = require("node:test");
const assert = require("node:assert/strict");
const {
  chatMediaProcessorFor,
  chatMediaUploaderAllowed,
  resolveChatMediaDeliveryArtifact,
} = require("../lib/chat-media-policy");

const id = "123e4567-e89b-12d3-a456-426614174000";
const hash = "a".repeat(64);
const base = {
  mediaId: id, mediaPurpose: "chat", uploaderRole: "member",
  mediaCategory: "image", detectedContentType: "image/png",
  status: "security_approved", safePreviewPath: `processed/member/${id}/preview.webp`,
  safePreviewGeneration: "12", safePreviewSha256: hash,
  processingPipelineVersion: "sharp-decode-reencode-v1",
};

test("routes each supported MIME to a dedicated processor", () => {
  assert.equal(chatMediaProcessorFor("image/png"), "image-raster-v1");
  assert.equal(chatMediaProcessorFor("image/gif"), "gif-animation-v1");
  assert.equal(chatMediaProcessorFor("audio/ogg"), "audio-transcode-v1");
  assert.equal(chatMediaProcessorFor("video/mp4"), "video-transcode-v1");
  assert.equal(chatMediaProcessorFor("application/pdf"), "pdf-sanitize-v1");
  assert.equal(chatMediaProcessorFor("application/msword"), null);
});

test("only a scanned and sanitized image derivative can be delivered", () => {
  const artifact = resolveChatMediaDeliveryArtifact(base, false);
  assert.equal(artifact?.objectPath, base.safePreviewPath);
  assert.equal(artifact?.contentType, "image/webp");
});

test("scanner-clean without safe processing is never deliverable", () => {
  assert.equal(resolveChatMediaDeliveryArtifact({ ...base, status: "scanner_clean_pending_processing" }, false), null);
  assert.equal(resolveChatMediaDeliveryArtifact({ ...base, safePreviewPath: undefined }, false), null);
  assert.equal(resolveChatMediaDeliveryArtifact({ ...base, processingPipelineVersion: "unknown" }, false), null);
});

test("GIF, audio and video remain blocked until their own safe derivative exists", () => {
  for (const contentType of ["image/gif", "audio/mpeg", "video/mp4"]) {
    const asset = { ...base, detectedContentType: contentType, safePreviewPath: undefined };
    assert.equal(resolveChatMediaDeliveryArtifact(asset, false), null);
  }
});

test("documents are owner-only even if a member forges uploaderRole", () => {
  const pdf = {
    ...base, detectedContentType: "application/pdf", uploaderRole: "member",
    safeDocumentPath: `processed/member/${id}/document.pdf`,
    safeDocumentGeneration: "3", safeDocumentSha256: hash,
    processingPipelineVersion: "pdf-sanitize-v1",
  };
  assert.equal(chatMediaUploaderAllowed(pdf, false), false);
  assert.equal(resolveChatMediaDeliveryArtifact(pdf, false), null);
  assert.equal(resolveChatMediaDeliveryArtifact({ ...pdf, uploaderRole: "platform_owner" }, false), null);
  assert.equal(resolveChatMediaDeliveryArtifact({ ...pdf, uploaderRole: "platform_owner" }, true)?.category, "document");
});

test("rejects path traversal, generation and hash substitution", () => {
  assert.equal(resolveChatMediaDeliveryArtifact({ ...base, safePreviewPath: `processed/x/${id}/../../secret` }, false), null);
  assert.equal(resolveChatMediaDeliveryArtifact({ ...base, safePreviewGeneration: "0" }, false), null);
  assert.equal(resolveChatMediaDeliveryArtifact({ ...base, safePreviewSha256: "bad" }, false), null);
});

test("attachment role policy rejects spoofed owner flags and unsupported document formats", () => {
  assert.equal(chatMediaUploaderAllowed({ uploaderRole: "platform_owner", detectedContentType: "application/pdf" }, false), false);
  assert.equal(chatMediaUploaderAllowed({ uploaderRole: "platform_owner", detectedContentType: "application/pdf" }, true), true);
  assert.equal(chatMediaUploaderAllowed({ uploaderRole: "member", detectedContentType: "application/msword" }, true), false);
});
