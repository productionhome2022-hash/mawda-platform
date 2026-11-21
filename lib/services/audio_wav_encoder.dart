import 'dart:typed_data';

/// Encodes little-endian mono PCM16 samples as a standards-compliant RIFF/WAVE file.
Uint8List encodePcm16MonoToWav(
  Uint8List pcm, {
  int sampleRate = 24000,
}) {
  if (pcm.isEmpty || pcm.length.isOdd) {
    throw ArgumentError.value(pcm.length, 'pcm.length', 'PCM16 data must be non-empty and contain complete 16-bit samples.');
  }
  if (sampleRate < 8000 || sampleRate > 48000) {
    throw ArgumentError.value(sampleRate, 'sampleRate', 'Sample rate must be between 8 kHz and 48 kHz.');
  }

  const channels = 1;
  const bitsPerSample = 16;
  final wav = Uint8List(44 + pcm.length);
  final header = ByteData.sublistView(wav);

  void writeTag(int offset, String tag) {
    for (var i = 0; i < tag.length; i++) {
      wav[offset + i] = tag.codeUnitAt(i);
    }
  }

  writeTag(0, 'RIFF');
  header.setUint32(4, 36 + pcm.length, Endian.little);
  writeTag(8, 'WAVE');
  writeTag(12, 'fmt ');
  header.setUint32(16, 16, Endian.little);
  header.setUint16(20, 1, Endian.little); // Linear PCM.
  header.setUint16(22, channels, Endian.little);
  header.setUint32(24, sampleRate, Endian.little);
  header.setUint32(28, sampleRate * channels * bitsPerSample ~/ 8, Endian.little);
  header.setUint16(32, channels * bitsPerSample ~/ 8, Endian.little);
  header.setUint16(34, bitsPerSample, Endian.little);
  writeTag(36, 'data');
  header.setUint32(40, pcm.length, Endian.little);
  wav.setRange(44, 44 + pcm.length, pcm);
  return wav;
}
