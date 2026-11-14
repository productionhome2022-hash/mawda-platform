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
  mediaId: id, ownerUid: "member", mediaPurpose: "chat", uploaderRole: "member",
  mediaCategory: "image", detectedContentType: "image/png",
  status: "security_approved", processingStatus: "safe_raster_derivative_ready", safePreviewPath: `processed/member/${id}/preview.webp`,
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
    processingStatus: "safe_document_derivative_ready",
    processingPipelineVersion: "pdf-raster-flatten-v1",
  };
  assert.equal(chatMediaUploaderAllowed(pdf, false), false);
  assert.equal(resolveChatMediaDeliveryArtifact(pdf, false), null);
  assert.equal(resolveChatMediaDeliveryArtifact({ ...pdf, uploaderRole: "platform_owner" }, false), null);
  assert.equal(resolveChatMediaDeliveryArtifact({ ...pdf, uploaderRole: "platform_owner" }, true)?.category, "document");
});

test("all owner-uploaded chat media requires a verified owner session, not just a stored role", () => {
  const ownerImage = {
    ...base,
    uploaderRole: "platform_owner",
  };
  assert.equal(resolveChatMediaDeliveryArtifact(ownerImage, false), null);
  assert.equal(resolveChatMediaDeliveryArtifact(ownerImage, true)?.category, "image");
  assert.equal(chatMediaUploaderAllowed(ownerImage, false), false);
  assert.equal(chatMediaUploaderAllowed(ownerImage, true), true);
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

test("each non-raster category requires its own exact sanitized derivative and pipeline", () => {
  const fixtures = [
    {
      category: "gif", contentType: "image/gif", path: "safeAnimationPath",
      generation: "safeAnimationGeneration", hash: "safeAnimationSha256",
      status: "safe_animation_derivative_ready", pipeline: "gif-sanitize-preserve-animation-v1",
      suffix: "animation.gif",
    },
    {
      category: "audio", contentType: "audio/wav", path: "safeAudioPath",
      generation: "safeAudioGeneration", hash: "safeAudioSha256",
      status: "safe_audio_derivative_ready", pipeline: "ffmpeg-audio-transcode-v1",
      suffix: "audio.mp3",
    },
    {
      category: "video", contentType: "video/mp4", path: "safeVideoPath",
      generation: "safeVideoGeneration", hash: "safeVideoSha256",
      status: "safe_video_derivative_ready", pipeline: "ffmpeg-video-transcode-v1",
      suffix: "video.mp4",
    },
    {
      category: "document", contentType: "application/pdf", path: "safeDocumentPath",
      generation: "safeDocumentGeneration", hash: "safeDocumentSha256",
      status: "safe_document_derivative_ready", pipeline: "pdf-raster-flatten-v1",
      suffix: "document.pdf",
    },
  ];
  for (const item of fixtures) {
    const asset = {
      ...base,
      detectedContentType: item.contentType,
      uploaderRole: item.category === "document" ? "platform_owner" : "member",
      processingStatus: item.status,
      processingPipelineVersion: item.pipeline,
      [item.path]: `processed/member/${id}/${item.suffix}`,
      [item.generation]: "77",
      [item.hash]: hash,
    };
    const artifact = resolveChatMediaDeliveryArtifact(asset, true);
    assert.equal(artifact?.category, item.category);
    assert.equal(artifact?.objectPath, asset[item.path]);
    assert.equal(resolveChatMediaDeliveryArtifact({
      ...asset, processingPipelineVersion: "untrusted",
    }, true), null);
    assert.equal(resolveChatMediaDeliveryArtifact({
      ...asset, [item.generation]: "0",
    }, true), null);
    if (item.category === "document") {
      assert.equal(resolveChatMediaDeliveryArtifact(asset, false), null);
      assert.equal(resolveChatMediaDeliveryArtifact({
        ...asset, uploaderRole: "member",
      }, true), null);
    }
  }
});


test("guest uploads can only resolve to safe audio derivatives in room scope", () => {
  const base = {
    mediaId: "123e4567-e89b-12d3-a456-426614174000",
    ownerUid: "guest-uid",
    mediaPurpose: "room",
    uploaderRole: "guest",
    mediaCategory: "audio",
    detectedContentType: "audio/mpeg",
    status: "security_approved",
    processingStatus: "safe_audio_derivative_ready",
    safeAudioPath: "processed/guest-uid/123e4567-e89b-12d3-a456-426614174000/audio.mp3",
    safeAudioGeneration: "3",
    safeAudioSha256: "a".repeat(64),
    processingPipelineVersion: "ffmpeg-audio-transcode-v1",
  };
  assert.equal(resolveChatMediaDeliveryArtifact(base, false)?.category, "audio");
  assert.equal(resolveChatMediaDeliveryArtifact({ ...base, mediaPurpose: "chat" }, false), null);
  assert.equal(resolveChatMediaDeliveryArtifact({ ...base, detectedContentType: "image/jpeg", mediaCategory: "image" }, false), null);
  assert.equal(chatMediaUploaderAllowed({ uploaderRole: "guest", detectedContentType: "audio/mpeg" }, false), true);
  assert.equal(chatMediaUploaderAllowed({ uploaderRole: "guest", detectedContentType: "image/jpeg" }, false), false);
});
