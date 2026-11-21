import tempfile
import unittest
import zipfile
from pathlib import Path

from verify_android_release_metadata import (
    APK_VERSION_CODE_OFFSETS,
    PACKAGE_ID,
    expected_apk_version_code,
    parse_pubspec_version,
    validate_aab_archive,
    validate_aab_output_metadata,
    validate_apk_badging,
)


class AndroidReleaseMetadataTests(unittest.TestCase):
    def test_pubspec_version_requires_numeric_build_number(self):
        self.assertEqual(parse_pubspec_version("name: mawdda\nversion: 1.2.3+42\n"), ("1.2.3", 42))
        with self.assertRaises(ValueError):
            parse_pubspec_version("version: 1.2.3\n")

    def test_split_apk_version_codes_use_flutter_abi_offsets(self):
        self.assertEqual(APK_VERSION_CODE_OFFSETS, {
            "mawdda-universal-release.apk": 0,
            "app-armeabi-v7a-release.apk": 1000,
            "app-arm64-v8a-release.apk": 2000,
            "app-x86_64-release.apk": 4000,
        })
        self.assertEqual(expected_apk_version_code("mawdda-universal-release.apk", 42), 42)
        self.assertEqual(expected_apk_version_code("app-armeabi-v7a-release.apk", 42), 1042)
        self.assertEqual(expected_apk_version_code("app-arm64-v8a-release.apk", 42), 2042)
        self.assertEqual(expected_apk_version_code("app-x86_64-release.apk", 42), 4042)
        with self.assertRaisesRegex(ValueError, "Unexpected APK"):
            expected_apk_version_code("app-unknown-release.apk", 42)

    def test_apk_badging_must_match_package_and_version(self):
        valid = "package: name='com.mawdda.platform.app' versionCode='1042' versionName='1.2.3' platformBuildVersionName='16'\n"
        validate_apk_badging(valid, PACKAGE_ID, "1.2.3", 1042)
        with self.assertRaisesRegex(ValueError, "package ID mismatch"):
            validate_apk_badging(valid.replace(PACKAGE_ID, "com.other.app"), PACKAGE_ID, "1.2.3", 1042)
        with self.assertRaisesRegex(ValueError, "version mismatch"):
            validate_apk_badging(valid, PACKAGE_ID, "1.2.4", 1042)

    def metadata(self):
        return {
            "artifactType": {"type": "AAB", "kind": "File"},
            "applicationId": PACKAGE_ID,
            "variantName": "release",
            "elements": [{
                "type": "SINGLE",
                "filters": [],
                "attributes": [],
                "versionCode": 42,
                "versionName": "1.2.3",
                "outputFile": "app-release.aab",
            }],
        }

    def test_aab_gradle_metadata_must_match_identity_and_base_version(self):
        validate_aab_output_metadata(self.metadata(), "app-release.aab", PACKAGE_ID, "1.2.3", 42)
        wrong = self.metadata()
        wrong["applicationId"] = "com.other.app"
        with self.assertRaisesRegex(ValueError, "applicationId"):
            validate_aab_output_metadata(wrong, "app-release.aab", PACKAGE_ID, "1.2.3", 42)
        wrong = self.metadata()
        wrong["elements"][0]["versionCode"] = 41
        with self.assertRaisesRegex(ValueError, "versionCode"):
            validate_aab_output_metadata(wrong, "app-release.aab", PACKAGE_ID, "1.2.3", 42)

    def test_aab_archive_requires_bundle_manifest_and_config(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "valid.aab"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("BundleConfig.pb", b"config")
                archive.writestr("base/manifest/AndroidManifest.xml", b"manifest")
            validate_aab_archive(path)
            invalid = Path(directory) / "invalid.aab"
            with zipfile.ZipFile(invalid, "w") as archive:
                archive.writestr("BundleConfig.pb", b"config")
            with self.assertRaisesRegex(ValueError, "missing required"):
                validate_aab_archive(invalid)


if __name__ == "__main__":
    unittest.main()
