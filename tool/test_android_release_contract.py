from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = (ROOT / ".github/workflows/android-signed-release.yml").read_text()
BOOTSTRAP_WORKFLOW = (ROOT / ".github/workflows/bootstrap-native-platforms.yml").read_text()
GRADLE = (ROOT / "android/app/build.gradle.kts").read_text()
ANDROID_GITIGNORE = (ROOT / "android/.gitignore").read_text()
RELEASE_METADATA = (ROOT / "tool/verify_android_release_metadata.py").read_text()


class AndroidReleaseContractTests(unittest.TestCase):
    def test_application_id_and_release_signing_identity_are_fixed(self):
        self.assertIn('applicationId = "com.mawdda.platform.app"', GRADLE)
        self.assertIn('signingConfig = signingConfigs.getByName("release")', GRADLE)
        self.assertIn("MISSING_RELEASE_KEYSTORE_CONFIG", GRADLE)

    def test_release_checkout_is_pinned_to_dispatch_commit(self):
        self.assertIn("ref: ${{ github.sha }}", WORKFLOW)
        self.assertNotIn("ref: codex/mawda-full-platform-implementation", WORKFLOW)

    def test_release_workflow_builds_apk_and_aab(self):
        self.assertIn("flutter build apk --release", WORKFLOW)
        self.assertIn("flutter build apk --release --split-per-abi", WORKFLOW)
        self.assertIn("flutter build appbundle --release --dart-define=MAWDDA_FIREBASE_ENV=production", WORKFLOW)
        self.assertIn("MAWDDA_PRODUCTION_GOOGLE_SERVICES_JSON_B64", WORKFLOW)
        self.assertEqual(WORKFLOW.count("--dart-define=MAWDDA_FIREBASE_ENV=production"), 3)
        self.assertIn("mawdda-google-play-release.aab", WORKFLOW)
        self.assertIn("mawdda-universal-release.apk", WORKFLOW)

    def test_release_workflow_validates_aab_and_apk_package_versions(self):
        self.assertIn("tool/verify_android_release_metadata.py", WORKFLOW)
        self.assertIn("--bundle-metadata build/app/outputs/bundle/release/output-metadata.json", WORKFLOW)
        self.assertIn("android-artifact-metadata.txt", WORKFLOW)
        self.assertIn("sizeBytes=", WORKFLOW)

    def test_release_metadata_validator_accounts_for_flutter_abi_version_offsets(self):
        self.assertIn('"app-armeabi-v7a-release.apk": 1000', RELEASE_METADATA)
        self.assertIn('"app-arm64-v8a-release.apk": 2000', RELEASE_METADATA)
        self.assertIn('"app-x86_64-release.apk": 4000', RELEASE_METADATA)
        self.assertIn("actual_names != expected_names", RELEASE_METADATA)

    def test_signed_artifacts_are_scanned_with_fresh_clamav_signatures(self):
        self.assertIn("freshclam --stdout", WORKFLOW)
        self.assertIn("clamscan --infected --no-summary --alert-exceeds-max=yes", WORKFLOW)
        self.assertIn("clamav-release-scan.log", WORKFLOW)
        self.assertIn("--scan-archive=yes", WORKFLOW)

    def test_nonproduction_debug_aab_packaging_is_exercised_in_ci(self):
        self.assertIn("flutter build appbundle --debug", BOOTSTRAP_WORKFLOW)
        self.assertIn("app-debug.aab", BOOTSTRAP_WORKFLOW)
        self.assertIn("mawdda-android-debug-aab-nonprod", BOOTSTRAP_WORKFLOW)

    def test_both_artifact_types_are_verified_against_the_owner_certificate(self):
        self.assertIn('"$APKSIGNER" verify --verbose', WORKFLOW)
        self.assertIn("jarsigner -verify -verbose -certs", WORKFLOW)
        self.assertIn("keytool -printcert -jarfile", WORKFLOW)
        self.assertIn("21:F9:E6:01:80:E2:03:8D:DD:57:4E:DC:F1:2A:63:4B:C6:25:D9:BA:3F:65:53:B2:9D:61:70:62:C6:36:84:56", WORKFLOW)

    def test_production_build_cannot_fall_back_to_nonproduction_firebase(self):
        self.assertIn("refusing to build a production release with non-production Firebase settings", WORKFLOW)
        self.assertIn("mawda-app-2026", WORKFLOW)
        self.assertIn("Verified production Android Firebase project", WORKFLOW)

    def test_signing_material_is_excluded_from_source_control(self):
        self.assertIn("key.properties", ANDROID_GITIGNORE)
        self.assertIn("**/*.jks", ANDROID_GITIGNORE)
        self.assertIn("MAWDDA_IDENTITY_KEY_B64", WORKFLOW)
        self.assertIn("MAWDDA_STORE_PASSWORD", WORKFLOW)
        self.assertIn("MAWDDA_KEY_ALIAS", WORKFLOW)
        self.assertIn("MAWDDA_KEY_PASSWORD", WORKFLOW)

    def test_workflow_is_manual_and_does_not_publish_to_google_play(self):
        self.assertIn("workflow_dispatch:", WORKFLOW)
        self.assertIn("if: github.ref == 'refs/heads/codex/mawda-full-platform-implementation'", WORKFLOW)
        self.assertNotIn("gradle-play-publisher", WORKFLOW)
        self.assertNotIn("publishBundle", WORKFLOW)
        self.assertNotIn("play.google.com", WORKFLOW)


if __name__ == "__main__":
    unittest.main()
