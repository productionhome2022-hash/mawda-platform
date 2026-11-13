const fs = require("node:fs/promises");
const path = require("node:path");
const { promisify } = require("node:util");
const { execFile } = require("node:child_process");
const { createHash } = require("node:crypto");
const sharp = require("sharp");

const execFileAsync = promisify(execFile);
const LIMITS = Object.freeze({
  gif: { maxFrames: 100, maxPixels: 40_000_000, maxBytes: 5 * 1024 * 1024 },
  audio: { maxDurationSeconds: 600, maxBytes: 25 * 1024 * 1024 },
  video: { maxDurationSeconds: 90, maxBytes: 50 * 1024 * 1024 },
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

async function processGif({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
  const input = { failOn: "error", limitInputPixels: 40_000_000, animated: true };
  const metadata = await sharp(sourcePath, input).metadata();
  const pages = Number(metadata.pages);
  const pixels = Number(metadata.width) * Number(metadata.height) * pages;
  if (!Number.isSafeInteger(pages) || pages < 1 || pages > LIMITS.gif.maxFrames ||
      !Number.isSafeInteger(pixels) || pixels > LIMITS.gif.maxPixels) {
    throw new Error("GIF_COMPLEXITY_EXCEEDS_SAFE_LIMIT");
  }
  const output = path.join(tempDir, "safe-animation.gif");
  await sharp(sourcePath, input).resize({
    width: 2048, height: 2048, fit: "inside", withoutEnlargement: true,
  }).gif({ effort: 7 }).toFile(output);
  const outputMetadata = await sharp(output, { animated: true }).metadata();
  if (Number(outputMetadata.pages) !== pages) {
    throw new Error("GIF_ANIMATION_FRAME_COUNT_CHANGED");
  }
  const artifact = await uploadDerivative({
    storage, bucketName, outputPath: output, request, sourceSha256, provider,
    filename: "animation.gif", contentType: "image/gif",
    pipelineVersion: "gif-sanitize-preserve-animation-v1", maxBytes: LIMITS.gif.maxBytes,
  });
  return { safeDerivative: { category: "gif", ...artifact }, processingStatus: "safe_animation_derivative_ready" };
}

async function processAudio({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
  const probe = await probeMedia(sourcePath);
  if (!probe.hasAudio || probe.hasVideo || probe.duration > LIMITS.audio.maxDurationSeconds) {
    throw new Error("AUDIO_STREAM_OR_DURATION_INVALID");
  }
  const output = path.join(tempDir, "safe-audio.mp3");
  await execFileAsync("ffmpeg", [
    "-nostdin", "-v", "error", "-y", "-i", sourcePath,
    "-map", "0:a:0", "-vn", "-map_metadata", "-1", "-map_chapters", "-1",
    "-t", String(LIMITS.audio.maxDurationSeconds), "-ac", "1", "-ar", "44100",
    "-c:a", "libmp3lame", "-b:a", "96k", "-f", "mp3", output,
  ], { timeout: 120_000, maxBuffer: 64 * 1024 });
  const artifact = await uploadDerivative({
    storage, bucketName, outputPath: output, request, sourceSha256, provider,
    filename: "audio.mp3", contentType: "audio/mpeg",
    pipelineVersion: "ffmpeg-audio-transcode-v1", maxBytes: LIMITS.audio.maxBytes,
  });
  return { safeDerivative: { category: "audio", ...artifact }, processingStatus: "safe_audio_derivative_ready" };
}

async function processVideo({ sourcePath, tempDir, request, sourceSha256, storage, bucketName, provider }) {
  const probe = await probeMedia(sourcePath);
  if (!probe.hasVideo || probe.duration > LIMITS.video.maxDurationSeconds) {
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

module.exports = { LIMITS, safeOutputPath, probeMedia, processSafeDerivative };
