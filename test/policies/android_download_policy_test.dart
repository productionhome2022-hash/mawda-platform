import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/policies/android_download_policy.dart';

void main() {
  const allowed = 'mawdda.example,downloads.mawdda.example';

  test('accepts the official website host', () {
    expect(
      isApprovedAndroidDownloadUrl(
        'https://mawdda.example/downloads/mawdda.apk',
        allowed,
      ),
      isTrue,
    );
  });

  test('accepts an explicitly approved alternative distribution host', () {
    expect(
      isApprovedAndroidDownloadUrl(
        'https://downloads.mawdda.example/releases/mawdda.apk',
        allowed,
      ),
      isTrue,
    );
  });

  test('rejects hosts that are not explicitly allow-listed', () {
    expect(
      isApprovedAndroidDownloadUrl(
        'https://unapproved.example/mawdda.apk',
        allowed,
      ),
      isFalse,
    );
  });

  test('rejects non-HTTPS and credential-bearing URLs', () {
    expect(
      isApprovedAndroidDownloadUrl('http://mawdda.example/app.apk', allowed),
      isFalse,
    );
    expect(
      isApprovedAndroidDownloadUrl(
        'https://user:password@mawdda.example/app.apk',
        allowed,
      ),
      isFalse,
    );
  });

  test('rejects non-standard ports and wildcard host entries', () {
    expect(
      isApprovedAndroidDownloadUrl(
        'https://mawdda.example:8443/app.apk',
        allowed,
      ),
      isFalse,
    );
    expect(
      isApprovedAndroidDownloadUrl(
        'https://cdn.mawdda.example/app.apk',
        '*.mawdda.example',
      ),
      isFalse,
    );
  });
}
