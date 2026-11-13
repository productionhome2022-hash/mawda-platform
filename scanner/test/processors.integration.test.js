const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { Readable } = require("node:stream");
const { createHash } = require("node:crypto");
const { promisify } = require("node:util");
const { execFile } = require("node:child_process");
const { processSafeDerivative } = require("../processors");

const execFileAsync = promisify(execFile);
const mediaId = "123e4567-e89b-42d3-a456-426614174000";
const provider = "clamav-mawadda-gateway";

function fakeStorage() {
  const objects = new Map();
  return {
    objects,
    bucket() {
      return {
        file(objectPath) {
          return {
            async save(data, options) {
              if (options?.preconditionOpts?.ifGenerationMatch === 0 && objects.has(objectPath)) {
                const error = new Error("precondition failed");
                error.code = 412;
                throw error;
              }
              objects.set(objectPath, {
                data: Buffer.from(data),
                metadata: {
                  generation: String(objects.size + 1),
                  size: String(data.length),
                  contentType: options.metadata.contentType,
                  metadata: options.metadata.metadata,
                },
              });
            },
            async getMetadata() {
              const object = objects.get(objectPath);
              if (!object) throw new Error("not found");
              return [object.metadata];
            },
            createReadStream() {
              const object = objects.get(objectPath);
              if (!object) throw new Error("not found");
              return Readable.from(object.data);
            },
          };
        },
      };
    },
  };
}

async function makeFixture(type, dir) {
  const output = path.join(dir, `source.${type}`);
  if (type === "gif") {
    await execFileAsync("ffmpeg", [
      "-nostdin", "-v", "error", "-y", "-f", "lavfi", "-i",
      "color=c=red:s=32x32:r=2", "-t", "1", "-loop", "0", output,
    ]);
  } else if (type === "wav") {
    await execFileAsync("ffmpeg", [
      "-nostdin", "-v", "error", "-y", "-f", "lavfi", "-i",
      "sine=frequency=440:duration=1", "-c:a", "pcm_s16le", output,
    ]);
  } else if (type === "mp4") {
    await execFileAsync("ffmpeg", [
      "-nostdin", "-v", "error", "-y", "-f", "lavfi", "-i",
      "testsrc2=size=64x64:rate=5:duration=1", "-c:v", "libx264",
      "-pix_fmt", "yuv420p", output,
    ]);
  } else if (type === "pdf") {
    const script = "from reportlab.pdfgen import canvas; import sys; c=canvas.Canvas(sys.argv[1]); c.drawString(40,800,'Mawda safe document test'); c.save()";
    await execFileAsync("python3", ["-c", script, output]);
  }
  return output;
}

const cases = [
  { fixture: "gif", contentType: "image/gif", category: "gif", path: "animation.gif", content: "image/gif", field: "safe_animation_derivative_ready" },
  { fixture: "wav", contentType: "audio/wav", category: "audio", path: "audio.mp3", content: "audio/mpeg", field: "safe_audio_derivative_ready" },
  { fixture: "mp4", contentType: "video/mp4", category: "video", path: "video.mp4", content: "video/mp4", field: "safe_video_derivative_ready" },
  { fixture: "pdf", contentType: "application/pdf", category: "document", path: "document.pdf", content: "application/pdf", field: "safe_document_derivative_ready" },
];

for (const item of cases) {
  test(`real ${item.category} processor emits a bounded, provenance-bound derivative`, async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mawadda-processor-test-"));
    try {
      const sourcePath = await makeFixture(item.fixture, tempDir);
      const sourceSha256 = createHash("sha256").update(await fs.readFile(sourcePath)).digest("hex");
      const storage = fakeStorage();
      const result = await processSafeDerivative({
        sourcePath, tempDir,
        request: {
          mediaId, objectPath: `quarantine/member_1/${mediaId}`,
          objectGeneration: "123456", contentType: item.contentType,
        },
        sourceSha256, storage, bucketName: "mawadda-test", provider,
      });
      assert.equal(result.safeDerivative.category, item.category);
      assert.equal(result.safeDerivative.path, `processed/member_1/${mediaId}/${item.path}`);
      assert.equal(result.safeDerivative.contentType, item.content);
      assert.match(result.safeDerivative.generation, /^[1-9][0-9]*$/);
      assert.match(result.safeDerivative.sha256, /^[a-f0-9]{64}$/);
      assert.ok(storage.objects.has(result.safeDerivative.path));
      const saved = storage.objects.get(result.safeDerivative.path);
      assert.equal(saved.metadata.metadata.sourceGeneration, "123456");
      assert.equal(saved.metadata.metadata.sourceSha256, sourceSha256);
      assert.equal(saved.metadata.metadata.scannerProvider, provider);
      assert.equal(saved.metadata.metadata.processing, result.safeDerivative.pipelineVersion);
      assert.ok(Number(saved.metadata.size) > 0);
      if (item.category === "gif") {
        const sharp = require("sharp");
        const metadata = await sharp(saved.data, { animated: true }).metadata();
        assert.ok(Number(metadata.pages) > 1, "animated GIF sanitizer must preserve multiple frames");
      }
      if (item.category === "document") {
        const flattenedPath = path.join(tempDir, "safe-document.pdf");
        const extracted = await execFileAsync("pdftotext", [flattenedPath, "-"]);
        assert.doesNotMatch(extracted.stdout, /Mawda safe document test/,
          "raster-flattened PDF must not retain the source text layer");
      }
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
}
