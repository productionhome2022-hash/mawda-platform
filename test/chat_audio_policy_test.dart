import 'package:flutter_test/flutter_test.dart';

import '../lib/policies/chat_audio_policy.dart';

void main() {
  test('live microphone chat recordings are capped at exactly 60 seconds', () {
    expect(maxLiveChatAudioRecordingSeconds, 60);
  });
}
