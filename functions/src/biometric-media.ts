const VIDEO_MIN_DURATION_MS = 3_000;
const VIDEO_MAX_DURATION_MS = 5_000;

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

function findAtom(
  buffer: Buffer, start: number, end: number, wanted: string, containers: ReadonlySet<string>,
): Mp4Atom | null {
  let offset = start;
  while (offset < end) {
    const atom = readAtom(buffer, offset, end);
    if (!atom) return null;
    if (atom.type === wanted) return atom;
    if (containers.has(atom.type)) {
      const nestedStart = atom.type === "meta" ? atom.payloadStart + 4 : atom.payloadStart;
      if (nestedStart <= atom.end) {
        const nested = findAtom(buffer, nestedStart, atom.end, wanted, containers);
        if (nested) return nested;
      }
    }
    offset = atom.end;
  }
  return null;
}

const CONTAINER_ATOMS = new Set(["moov", "trak", "mdia", "minf", "stbl", "edts", "udta", "meta"]);

/** Reads the ISO-BMFF movie header duration from the uploaded bytes, never from client metadata. */
export function readMp4DurationMs(buffer: Buffer): number {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16) {
    throw new Error("BIOMETRIC_VIDEO_CONTAINER_INVALID");
  }
  const movie = findAtom(buffer, 0, buffer.length, "mvhd", CONTAINER_ATOMS);
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
  const durationMs = (duration / timescale) * 1000;
  if (!Number.isFinite(durationMs) || durationMs < 1) {
    throw new Error("BIOMETRIC_VIDEO_DURATION_INVALID");
  }
  return durationMs;
}

/** Requires at least one real video handler track; audio-only MP4 files are rejected. */
export function hasMp4VideoTrack(buffer: Buffer): boolean {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16) return false;
  let offset = 0;
  while (offset < buffer.length) {
    const top = readAtom(buffer, offset, buffer.length);
    if (!top) return false;
    if (top.type === "moov") {
      let trackOffset = top.payloadStart;
      while (trackOffset < top.end) {
        const track = readAtom(buffer, trackOffset, top.end);
        if (!track) return false;
        if (track.type === "trak") {
          const handler = findAtom(buffer, track.payloadStart, track.end, "hdlr", CONTAINER_ATOMS);
          if (handler && handler.payloadStart + 12 <= handler.end) {
            const handlerType = buffer.toString("ascii", handler.payloadStart + 8, handler.payloadStart + 12);
            if (handlerType === "vide") return true;
          }
        }
        trackOffset = track.end;
      }
    }
    offset = top.end;
  }
  return false;
}

export function isBiometricVideoDurationAllowed(durationMs: number): boolean {
  return typeof durationMs === "number" && Number.isFinite(durationMs) &&
    durationMs >= VIDEO_MIN_DURATION_MS && durationMs <= VIDEO_MAX_DURATION_MS;
}

export function assertBiometricVideoDurationAllowed(durationMs: number): void {
  if (!isBiometricVideoDurationAllowed(durationMs)) {
    throw new Error("BIOMETRIC_VIDEO_DURATION_OUT_OF_RANGE");
  }
}

export function assertBiometricVideoFileAllowed(buffer: Buffer): number {
  if (!hasMp4VideoTrack(buffer)) throw new Error("BIOMETRIC_VIDEO_TRACK_MISSING");
  const durationMs = readMp4DurationMs(buffer);
  assertBiometricVideoDurationAllowed(durationMs);
  return durationMs;
}
