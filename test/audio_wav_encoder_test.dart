import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/services/audio_wav_encoder.dart';

void main() {
  group('encodePcm16MonoToWav', () {
    test('writes a valid little-endian RIFF/WAVE PCM16 header', () {
      final pcm = Uint8List.fromList([0x01, 0x02, 0x03, 0x04]);
      final wav = encodePcm16MonoToWav(pcm);
      final header = ByteData.sublistView(wav);

      expect(String.fromCharCodes(wav.sublist(0, 4)), 'RIFF');
      expect(header.getUint32(4, Endian.little), 40);
      expect(String.fromCharCodes(wav.sublist(8, 12)), 'WAVE');
      expect(String.fromCharCodes(wav.sublist(12, 16)), 'fmt ');
      expect(header.getUint32(16, Endian.little), 16);
      expect(header.getUint16(20, Endian.little), 1);
      expect(header.getUint16(22, Endian.little), 1);
      expect(header.getUint32(24, Endian.little), 24000);
      expect(header.getUint32(28, Endian.little), 48000);
      expect(header.getUint16(32, Endian.little), 2);
      expect(header.getUint16(34, Endian.little), 16);
      expect(String.fromCharCodes(wav.sublist(36, 40)), 'data');
      expect(header.getUint32(40, Endian.little), 4);
      expect(wav.sublist(44), pcm);
    });

    test('rejects empty or partial PCM16 samples', () {
      expect(() => encodePcm16MonoToWav(Uint8List(0)), throwsArgumentError);
      expect(() => encodePcm16MonoToWav(Uint8List.fromList([1])), throwsArgumentError);
    });

    test('rejects unsupported sample rates', () {
      expect(
        () => encodePcm16MonoToWav(Uint8List.fromList([1, 2]), sampleRate: 96000),
        throwsArgumentError,
      );
    });
  });
}
