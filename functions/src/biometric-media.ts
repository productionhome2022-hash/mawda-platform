const VIDEO_MIN_DURATION_MS = 3000;
const VIDEO_MAX_DURATION_MS = 5000;

type Mp4Atom = { type: string; start: number; end: number; payloadStart: number };

function readAtom(buffer: Buffer, offset: number, parentEnd: number): Mp4Atom | null {
  if (offset < 0 || offset + 8 > parentEnd || parentEnd > buffer.length) return null;
  const size32 = buffer.readUInt32BE(offset);
  const type = buffer.toString("ascii", offset + 4, offset + 8);
  let size = size32;
  let headerSize = 8;
  if (size32 === 1) {
    if (offset + 16 > parentEnd) return null;
    const largeSize = buffer.readBigUInt64BE(offset + 8);
    if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    size = Number(largeSize);
    headerSize = 16;
  } else if (size32 === 0) {
    size = parentEnd - offset;
  }
  if (size < headerSize || offset + size > parentEnd) return null;
  return { type, start: offset, end: offset + size, payloadStart: offset + headerSize };
}

function findMovieHeader(buffer: Buffer, start: number, end: number): Mp4Atom | null {
  let offset = start;
  while (offset < end) {
    const atom = readAtom(buffer, offset, end);
    if (!atom) return null;
    if (atom.type === "mvhd") return atom;
    if (["moov", "trak", "mdia", "minf", "stbl", "edts", "udta"].includes(atom.type)) {
      const nested = findMovieHeader(buffer, atom.payloadStart, atom.end);
      if (nested) return nested;
    } else if (atom.type === "meta") {
      const nestedStart = atom.payloadStart + 4;
      if (nestedStart <= atom.end) {
        const nested = findMovieHeader(buffer, nestedStart, atom.end);
        if (nested) return nested;
      }
    }
    offset = atom.end;
  }
  return null;
}

/**
 * Reads the container's declared movie duration from an ISO-BMFF/MP4 mvhd
 * header. This validates the uploaded file itself, not a client duration claim.
 * Unsupported/corrupt containers fail closed.
 */
export function readMp4DurationMs(buffer: Buffer): number {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16) {
    throw new Error("BIOMETRIC_VIDEO_CONTAINER_INVALID");
  }
  const movie = findMovieHeader(buffer, 0, buffer.length);
  if (!movie) throw new Error("BIOMETRIC_VIDEO_DURATION_MISSING");
  const offset = movie.payloadStart;
  if (offset + 20 > movie.end) throw new Error("BIOMETRIC_VIDEO_HEADER_INVALID");
  const version = buffer.readUInt8(offset);
  let timescale: number;
  let duration: number;
  if (version === 0) {
    timescale = buffer.readUInt32BE(offset + 12);
    duration = buffer.readUInt32BE(offset + 16);
  } else if (version === 1) {
    if (offset + 32 > movie.end) throw new Error("BIOMETRIC_VIDEO_HEADER_INVALID");
    timescale = buffer.readUInt32BE(offset + 20);
    const duration64 = buffer.readBigUInt64BE(offset + 24);
    if (duration64 > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error("BIOMETRIC_VIDEO_DURATION_INVALID");
    }
    duration = Number(duration64);
  } else {
    throw new Error("BIOMETRIC_VIDEO_VERSION_UNSUPPORTED");
  }
  if (!Number.isSafeInteger(timescale) || timescale < 1 ||
      !Number.isSafeInteger(duration) || duration < 1) {
    throw new Error("BIOMETRIC_VIDEO_DURATION_INVALID");
  }
  const durationMs = Math.round((duration / timescale) * 1000);
  if (!Number.isSafeInteger(durationMs) || durationMs < 1) {
    throw new Error("BIOMETRIC_VIDEO_DURATION_INVALID");
  }
  return durationMs;
}

export function isBiometricVideoDurationAllowed(durationMs: number): boolean {
  return Number.isSafeInteger(durationMs) &&
    durationMs >= VIDEO_MIN_DURATION_MS &&
    durationMs <= VIDEO_MAX_DURATION_MS;
}

export function assertBiometricVideoDurationAllowed(durationMs: number): void {
  if (!isBiometricVideoDurationAllowed(durationMs)) {
    throw new Error("BIOMETRIC_VIDEO_DURATION_OUT_OF_RANGE");
  }
}
