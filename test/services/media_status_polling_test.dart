import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/services/media_status_polling.dart';

void main() {
  test('media status polling backs off quickly and then stays bounded', () {
    expect(
      List<Duration>.generate(7, mediaStatusPollDelay),
      const [
        Duration(seconds: 1),
        Duration(seconds: 2),
        Duration(seconds: 4),
        Duration(seconds: 8),
        Duration(seconds: 10),
        Duration(seconds: 10),
        Duration(seconds: 10),
      ],
    );
  });

  test('media status polling rejects a negative poll count', () {
    expect(() => mediaStatusPollDelay(-1), throwsArgumentError);
  });
}
