const fs = require("node:fs/promises");
const path = require("node:path");
const { promisify } = require("node:util");
const { execFile } = require("node:child_process");
const { createHash } = require("node:crypto");

const execFileAsync = promisify(execFile);
const LIMITS = Object.freeze({
  gif: { maxFrames: 50, maxPixels: 40_000_000, maxDurationSeconds: 20, maxBytes: 3 * 1024 * 1024 },
  audio: { maxDurationSeconds: 60, roomMaxDurationSeconds: 60, maxBytes: 5 * 1024 * 1024 },
  video: { maxDurationSeconds: 90, maxBytes: 15 * 1024 * 1024 },
  pdf: { maxPages: 30, maxBytes: 20 * 1024 * 1024 },
});

function safeOutputPath(ownerUid, mediaId, filename) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(ownerUid) ||
      !/^[0-9a-f-]{36}$/i.test(mediaId) ||
      !/^[a-z0-9.-]{1,48}$/.test(filename)) {
    throw new Error("INVALID_DERIVATIVE_PATH");
  }
  return `processed/${ownerUid}/${mediaId}/${filename}`;
}

async function probeMedia(sourcePath) {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration:stream=codec_type",
    "-of", "json", sourcePath,
  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
  const result = JSON.parse(stdout);
  const duration = Number(result.format && result.format.duration);
  const streams = Array.isArray(result.streams) ? result.streams : [];
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("MEDIA_DURATION_INVALID");
  return { duration, hasAudio: streams.some((s) => s.codec_type === "audio"),
    hasVideo: streams.some((s) => s.codec_type === "video") };
}

async function uploadDerivative({ storage, bucketName, outputPath, request, sourceSha256, provider, filename, contentType, pipelineVersion, maxBytes }) {
  const stat = await fs.stat(outputPath);
  if (!stat.isFile() || stat.size <= 0 || stat.size > maxBytes) throw new Error("DERIVATIVE_SIZE_INVALID");
  const uid = request.objectPath.split("/")[1];
  const objectPath = safeOutputPath(uid, request.mediaId, filename);
  const file = storage.bucket(bucketName).file(objectPath);
  const metadata = {
    mediaId: request.mediaId,
    sourceGeneration: request.objectGeneration,
    sourceSha256,
    scannerProvider: provider,
    processing: pipelineVersion,
  };
  try {
    await file.save(await fs.readFile(outputPath), {
      resumable: false,
      preconditionOpts: { ifGenerationMatch: 0 },
      metadata: {
        contentType,
        cacheControl: "private, no-store, max-age=0",
        metadata,
      },
    });
  } catch (error) {
    if (Number(error && error.code) !== 412) throw error;
    const [existing] = await file.getMetadata();
    const custom = existing.metadata || {};
    if (existing.contentType !== contentType ||
        String(custom.mediaId) !== request.mediaId ||
        String(custom.sourceGeneration) !== request.objectGeneration ||
        String(custom.sourceSha256) !== sourceSha256 ||
        String(custom.scannerProvider) !== provider ||
        String(custom.processing) !== pipelineVersion ||
        Number(existing.size) <= 0 || Number(existing.size) > maxBytes) {
      throw new Error("EXISTING_DERIVATIVE_PROVENANCE_MISMATCH");
    }
    return {
      path: objectPath, generation: String(existing.generation),
      sha256: await sha256StorageObject(file), contentType, pipelineVersion,
    };
  }
  const [saved] = await file.getMetadata();
  const custom = saved.metadata || {};
  if (saved.contentType !== contentType ||
      String(custom.mediaId) !== request.mediaId ||
      String(custom.sourceGeneration) !== request.objectGeneration ||
      String(custom.sourceSha256) !== sourceSha256 ||
      String(custom.scannerProvider) !== provider ||
      String(custom.processing) !== pipelineVersion) {
    throw new Error("DERIVATIVE_METADATA_MISMATCH");
  }
  return {
    path: objectPath, generation: String(saved.generation),
    sha256: await sha256StorageObject(file), contentType, pipelineVersion,
  };
}

async function sha256StorageObject(file) {
  const hash = createHash("sha256");
  for await (const chunk of file.createReadStream()) hash.update(chunk);
  return hash.digest("hex");
}

async function probeGif(sourcePath) {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error", "-count_frames", "-select_streams", "v:0",
    "-show_entries", "format=duration:stream=width,height,nb_read_frames",
    "-of", "json", sourcePath,
  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
  const result = JSON.parse(stdout);
  const stream = Array.isArray(result.streams) ? result.streams[0] : null;
  const duration = Number(result.format && result.format.duration);
  const frames = Number(stream && stream.nb_read_frames);
  const width = Number(stream && stream.width);
  const height = Number(stream && stream.height);
  if (!Number.isSafeInteger(frames) || frames < 1 || frames > LIMITS.gif.maxFrames ||
      !Number.isSafeInteger(width) || width < 1 ||
      !Number.isSafeInteger(height) || height < 1 ||
      !Number.isFinite(duration) || duration <= 0 ||
      duration > LIMITS.gif.maxDurationSeconds ||
      width * height * frames > LIMITS.gif.maxPixels) {
    throw new Error("GIF_COMPLEXITY_EXCEEDS_SAFE_LIMIT");
  }
  return { frames, width, height, durationSeconds: duration };
}

async function inspectStickerMedia({ sourcePath, contentType }) {
  if (typeof sourcePath !== "string" || !sourcePath ||
      !["image/gif", "image/png", "image/webp"].includes(contentType)) {
    throw new Error("STICKER_MEDIA_TYPE_INVALID");
  }
  const stat = await fs.stat(sourcePath);
  if (!stat.isFile() || stat.size < 1) throw new Error("STICKER_SOURCE_INVALID");
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error", "-count_frames", "-select_streams", "v:0",
    "-show_entries", "format=duration:stream=width,height,nb_read_frames",
    "-of", "json", sourcePath,
  ], { timeout: 15_000, maxBuffer: 64 * 1024 });
  const result = JSON.parse(stdout);
  const stream = Array.isArray(result.streams) ? result.streams[0] : null;
  const width = Number(stream && stream.width);
  const height = Number(stream && stream.height);
  const frames = Number(stream && stream.nb_read_frames);
  if (!Number.isSafeInteger(width) || width < 1 || width > 512 ||
      !Number.isSafeInteger(height) || height < 1 || height > 512 ||
      !Number.isSafeInteger(frames) || frames < 1 || frames > 50) {
    throw new Error("STICKER_DIMENSIONS_OR_FRAMES_INVALID");
  }
  if (contentType === "image/gif") {
    const durationMs = Math.round(Number(result.format && result.format.duration) * 1000);
    if (!Number.isSafeInteger(durationMs) || durationMs < 1 || durationMs > 5000 ||
        stat.size > 512 * 1024) throw new Error("STICKER_ANIMATION_LIMIT_EXCEEDED");
    return { kind: "animated", contentType, width, height, sizeBytes: stat.size, durationMs, frameCount: frames };
  }
  if (frames !== 1 || stat.size > 256 * 1024) {
    throw new Error("STICKER_STATIC_LIMIT_EXCEEDED");
  }
  return { kind: "static", contentType, width, height, sizeBytes: stat.size };
}

async function processGif({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
  const { frames } = await probeGif(sourcePath);
  const output = path.join(tempDir, "safe-animation.gif");
  await execFileAsync("ffmpeg", [
    "-nostdin", "-v", "error", "-y", "-i", sourcePath,
    "-map", "0:v:0", "-map_metadata", "-1", "-map_chapters", "-1",
    "-vf", "scale=2048:2048:force_original_aspect_ratio=decrease:flags=lanczos",
    "-vsync", "0", "-frames:v", String(LIMITS.gif.maxFrames),
    "-loop", "0", "-f", "gif", output,
  ], { timeout: 120_000, maxBuffer: 64 * 1024 });
  const outputFrames = await probeGif(output);
  if (outputFrames.frames !== frames) throw new Error("GIF_ANIMATION_FRAME_COUNT_CHANGED");
  const artifact = await uploadDerivative({
    storage, bucketName, outputPath: output, request, sourceSha256, provider,
    filename: "animation.gif", contentType: "image/gif",
    pipelineVersion: request.purpose === "sticker"
      ? "gif-sticker-sanitize-preserve-animation-v1"
      : "gif-sanitize-preserve-animation-v1",
    maxBytes: request.purpose === "sticker" ? 512 * 1024 : LIMITS.gif.maxBytes,
  });
  return { safeDerivative: { category: "gif", ...artifact }, processingStatus: "safe_animation_derivative_ready" };
}

function audioDurationLimitForPurpose(purpose) {
  if (purpose === "room" || purpose === "chat" || purpose === "biometric") return 60;
  throw new Error("AUDIO_PURPOSE_INVALID");
}

function videoDurationAllowedForPurpose(purpose, durationSeconds) {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return false;
  if (purpose === "biometric") return durationSeconds >= 3 && durationSeconds <= 5;
  return durationSeconds <= LIMITS.video.maxDurationSeconds;
}

async function processAudio({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
  const probe = await probeMedia(sourcePath);
  const maxDurationSeconds = audioDurationLimitForPurpose(request.purpose);
  if (!probe.hasAudio || probe.hasVideo || probe.duration > maxDurationSeconds) {
    throw new Error("AUDIO_STREAM_OR_DURATION_INVALID");
  }
  const output = path.join(tempDir, "safe-audio.mp3");
  await execFileAsync("ffmpeg", [
    "-nostdin", "-v", "error", "-y", "-i", sourcePath,
    "-map", "0:a:0", "-vn", "-map_metadata", "-1", "-map_chapters", "-1",
    "-t", String(maxDurationSeconds), "-ac", "1", "-ar", "44100",
    "-c:a", "libmp3lame", "-b:a", "96k", "-f", "mp3", output,
  ], { timeout: 120_000, maxBuffer: 64 * 1024 });
  const artifact = await uploadDerivative({
    storage, bucketName, outputPath: output, request, sourceSha256, provider,
    filename: "audio.mp3", contentType: "audio/mpeg",
    pipelineVersion: "ffmpeg-audio-purpose-limit-v2", maxBytes: LIMITS.audio.maxBytes,
  });
  return { safeDerivative: { category: "audio", ...artifact }, processingStatus: "safe_audio_derivative_ready" };
}

async function processVideo({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
  const probe = await probeMedia(sourcePath);
  if (!probe.hasVideo || !videoDurationAllowedForPurpose(request.purpose, probe.duration)) {
    throw new Error("VIDEO_STREAM_OR_DURATION_INVALID");
  }
  const output = path.join(tempDir, "safe-video.mp4");
  await execFileAsync("ffmpeg", [
    "-nostdin", "-v", "error", "-y", "-i", sourcePath,
    "-map", "0:v:0", "-map", "0:a:0?", "-map_metadata", "-1", "-map_chapters", "-1",
    "-t", String(LIMITS.video.maxDurationSeconds),
    "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "28", "-threads", "2",
    "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", "-f", "mp4", output,
  ], { timeout: 180_000, maxBuffer: 64 * 1024 });
  const artifact = await uploadDerivative({
    storage, bucketName, outputPath: output, request, sourceSha256, provider,
    filename: "video.mp4", contentType: "video/mp4",
    pipelineVersion: "ffmpeg-video-transcode-v1", maxBytes: LIMITS.video.maxBytes,
  });
  return { safeDerivative: { category: "video", ...artifact }, processingStatus: "safe_video_derivative_ready" };
}

async function processPdf({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
  const { stdout } = await execFileAsync("pdfinfo", [sourcePath], {
    timeout: 15_000, maxBuffer: 64 * 1024,
  });
  const pagesMatch = stdout.match(/^Pages:\s+(\d+)\s*$/m);
  const pages = pagesMatch ? Number(pagesMatch[1]) : 0;
  if (!Number.isSafeInteger(pages) || pages < 1 || pages > LIMITS.pdf.maxPages) {
    throw new Error("PDF_PAGE_COUNT_INVALID");
  }
  // Rasterize every page and rebuild a flat image-only PDF. This strips scripts,
  // embedded files, forms, annotations, links and original document objects.
  const prefix = path.join(tempDir, "pdf-page");
  await execFileAsync("pdftoppm", [
    "-scale-to", "1600", "-png", "-f", "1", "-l", String(LIMITS.pdf.maxPages),
    sourcePath, prefix,
  ], { timeout: 120_000, maxBuffer: 64 * 1024 });
  const names = (await fs.readdir(tempDir))
    .filter((name) => /^pdf-page-\d+\.png$/.test(name))
    .sort((a, b) => Number(a.match(/(\d+)/)[1]) - Number(b.match(/(\d+)/)[1]));
  if (names.length !== pages) throw new Error("PDF_RASTER_PAGE_COUNT_MISMATCH");
  const output = path.join(tempDir, "safe-document.pdf");
  const script = "import img2pdf,sys; open(sys.argv[1],'wb').write(img2pdf.convert(sys.argv[2:]))";
  await execFileAsync("python3", ["-c", script, output, ...names.map((name) => path.join(tempDir, name))], {
    timeout: 60_000, maxBuffer: 64 * 1024,
  });
  const artifact = await uploadDerivative({
    storage, bucketName, outputPath: output, request, sourceSha256, provider,
    filename: "document.pdf", contentType: "application/pdf",
    pipelineVersion: "pdf-raster-flatten-v1", maxBytes: LIMITS.pdf.maxBytes,
  });
  return { safeDerivative: { category: "document", ...artifact }, processingStatus: "safe_document_derivative_ready" };
}

async function processSafeDerivative(context) {
  switch (context.request.contentType) {
    case "image/gif": return processGif(context);
    case "audio/mpeg":
    case "audio/mp4":
    case "audio/ogg":
    case "audio/wav": return processAudio(context);
    case "video/mp4": return processVideo(context);
    case "application/pdf": return processPdf(context);
    default: return null;
  }
}

module.exports = { LIMITS, audioDurationLimitForPurpose, videoDurationAllowedForPurpose, safeOutputPath, probeMedia, probeGif, inspectStickerMedia, processSafeDerivative };
