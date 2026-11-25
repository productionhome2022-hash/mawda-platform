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

function durationFromHeader(buffer: Buffer, header: Mp4Atom, label: string): number {
  const offset = header.payloadStart;
  if (offset + 20 > header.end) throw new Error(`BIOMETRIC_${label}_HEADER_INVALID`);
  const version = buffer.readUInt8(offset);
  let timescale: number;
  let duration: number;
  if (version === 0) {
    timescale = buffer.readUInt32BE(offset + 12);
    duration = buffer.readUInt32BE(offset + 16);
  } else if (version === 1) {
    if (offset + 32 > header.end) throw new Error(`BIOMETRIC_${label}_HEADER_INVALID`);
    timescale = buffer.readUInt32BE(offset + 20);
    const duration64 = buffer.readBigUInt64BE(offset + 24);
    if (duration64 > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error(`BIOMETRIC_${label}_DURATION_INVALID`);
    }
    duration = Number(duration64);
  } else {
    throw new Error(`BIOMETRIC_${label}_VERSION_UNSUPPORTED`);
  }
  if (!Number.isSafeInteger(timescale) || timescale < 1 ||
      !Number.isSafeInteger(duration) || duration < 1) {
    throw new Error(`BIOMETRIC_${label}_DURATION_INVALID`);
  }
  const durationMs = (duration / timescale) * 1000;
  if (!Number.isFinite(durationMs) || durationMs < 1) {
    throw new Error(`BIOMETRIC_${label}_DURATION_INVALID`);
  }
  return durationMs;
}

/** Reads the ISO-BMFF movie header duration from uploaded bytes, never client metadata. */
export function readMp4DurationMs(buffer: Buffer): number {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16) {
    throw new Error("BIOMETRIC_VIDEO_CONTAINER_INVALID");
  }
  const movie = findAtom(buffer, 0, buffer.length, "mvhd", CONTAINER_ATOMS);
  if (!movie) throw new Error("BIOMETRIC_VIDEO_DURATION_MISSING");
  return durationFromHeader(buffer, movie, "VIDEO");
}

/** Returns the duration of every video media track, using mdhd rather than client claims. */
export function readMp4VideoTrackDurationsMs(buffer: Buffer): number[] {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16) return [];
  let topOffset = 0;
  while (topOffset < buffer.length) {
    const top = readAtom(buffer, topOffset, buffer.length);
    if (!top) return [];
    if (top.type === "moov") {
      const durations: number[] = [];
      let trackOffset = top.payloadStart;
      while (trackOffset < top.end) {
        const track = readAtom(buffer, trackOffset, top.end);
        if (!track) throw new Error("BIOMETRIC_VIDEO_TRACK_CONTAINER_INVALID");
        if (track.type === "trak") {
          const handler = findAtom(buffer, track.payloadStart, track.end, "hdlr", CONTAINER_ATOMS);
          if (handler && handler.payloadStart + 12 <= handler.end) {
            const handlerType = buffer.toString("ascii", handler.payloadStart + 8, handler.payloadStart + 12);
            if (handlerType === "vide") {
              const mediaHeader = findAtom(buffer, track.payloadStart, track.end, "mdhd", CONTAINER_ATOMS);
              if (!mediaHeader) throw new Error("BIOMETRIC_VIDEO_TRACK_DURATION_MISSING");
              durations.push(durationFromHeader(buffer, mediaHeader, "VIDEO_TRACK"));
            }
          }
        }
        trackOffset = track.end;
      }
      return durations;
    }
    topOffset = top.end;
  }
  return [];
}

export function hasMp4VideoTrack(buffer: Buffer): boolean {
  try { return readMp4VideoTrackDurationsMs(buffer).length > 0; }
  catch { return false; }
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

/** Rejects missing video tracks and any movie/track duration outside the strict inclusive range. */
export function assertBiometricVideoFileAllowed(buffer: Buffer): number {
  if (!hasMp4VideoTrack(buffer)) throw new Error("BIOMETRIC_VIDEO_TRACK_MISSING");
  const movieDurationMs = readMp4DurationMs(buffer);
  assertBiometricVideoDurationAllowed(movieDurationMs);
  const trackDurations = readMp4VideoTrackDurationsMs(buffer);
  if (trackDurations.length === 0 || trackDurations.some((duration) => !isBiometricVideoDurationAllowed(duration))) {
    throw new Error("BIOMETRIC_VIDEO_TRACK_DURATION_OUT_OF_RANGE");
  }
  return Math.max(...trackDurations);
}


/** Returns the duration of every audio media track, using uploaded mdhd headers. */
export function readMp4AudioTrackDurationsMs(buffer: Buffer): number[] {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16) return [];
  let topOffset = 0;
  while (topOffset < buffer.length) {
    const top = readAtom(buffer, topOffset, buffer.length);
    if (!top) return [];
    if (top.type === "moov") {
      const durations: number[] = [];
      let trackOffset = top.payloadStart;
      while (trackOffset < top.end) {
        const track = readAtom(buffer, trackOffset, top.end);
        if (!track) throw new Error("BIOMETRIC_AUDIO_TRACK_CONTAINER_INVALID");
        if (track.type === "trak") {
          const handler = findAtom(buffer, track.payloadStart, track.end, "hdlr", CONTAINER_ATOMS);
          if (handler && handler.payloadStart + 12 <= handler.end) {
            const handlerType = buffer.toString("ascii", handler.payloadStart + 8, handler.payloadStart + 12);
            if (handlerType === "soun") {
              const mediaHeader = findAtom(buffer, track.payloadStart, track.end, "mdhd", CONTAINER_ATOMS);
              if (!mediaHeader) throw new Error("BIOMETRIC_AUDIO_TRACK_DURATION_MISSING");
              durations.push(durationFromHeader(buffer, mediaHeader, "AUDIO_TRACK"));
            }
          }
        }
        trackOffset = track.end;
      }
      return durations;
    }
    topOffset = top.end;
  }
  return [];
}

export function assertBiometricAudioFileAllowed(buffer: Buffer): number {
  const trackDurations = readMp4AudioTrackDurationsMs(buffer);
  if (trackDurations.length === 0) throw new Error("BIOMETRIC_AUDIO_TRACK_MISSING");
  const movieDurationMs = readMp4DurationMs(buffer);
  if (movieDurationMs > 60_000 || movieDurationMs < 1 ||
      trackDurations.some((duration) => duration < 1 || duration > 60_000)) {
    throw new Error("BIOMETRIC_AUDIO_DURATION_OUT_OF_RANGE");
  }
  return Math.max(...trackDurations);
}
