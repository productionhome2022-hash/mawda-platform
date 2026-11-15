from pathlib import Path
import json
import unittest


class NativeWorkflowFirebaseConfigurationTests(unittest.TestCase):
    def test_ios_service_file_uses_app_id_from_generated_flutterfire_options(self):
        workflow = (Path(__file__).parents[1] / ".github" / "workflows" / "bootstrap-native-platforms.yml").read_text()
        self.assertIn("IOS_APP_ID=$(python3 - <<'PY'", workflow)
        self.assertIn("app = re.search(r\"appId: '([^']+)'\", match.group(1))", workflow)
        self.assertIn('firebase apps:sdkconfig IOS "$IOS_APP_ID" --project mawda-platform-nonprod-2026 --out ios/Runner/GoogleService-Info.plist', workflow)
        self.assertIn("--out ios/Runner/GoogleService-Info.plist", workflow)
        self.assertIn("rm -f ios/Runner/GoogleService-Info.plist", workflow)
        self.assertNotIn("1:697303475139:ios:7be58cfe1ac9c4c23ed376", workflow)
        self.assertNotIn("--ios-out=ios/Runner/GoogleService-Info.plist", workflow)

    def test_nonproduction_options_are_generated_separately_from_production(self):
        workflow = (Path(__file__).parents[1] / ".github" / "workflows" / "bootstrap-native-platforms.yml").read_text()
        self.assertIn("--out=lib/firebase_options_nonprod.dart", workflow)
        self.assertIn('Path("lib/firebase_options_nonprod.dart").read_text()', workflow)
        self.assertIn("lib/firebase_options_nonprod.dart pubspec.lock", workflow)
        self.assertNotIn("--out=lib/firebase_options.dart", workflow)

    def test_runtime_defaults_to_nonproduction_and_production_is_not_deployable_by_ci(self):
        root = Path(__file__).parents[1]
        main = (root / "lib" / "main.dart").read_text()
        aliases = json.loads((root / ".firebaserc").read_text())["projects"]
        self.assertIn("defaultValue: 'nonprod'", main)
        self.assertIn("case 'production':", main)
        self.assertEqual(aliases["default"], "mawda-platform-nonprod-2026")
        self.assertEqual(aliases["production"], "mawda-app-2026")
        workflows = root / ".github" / "workflows"
        self.assertFalse((workflows / "firebase-hosting-merge.yml").exists())
        for workflow_file in workflows.glob("*.yml"):
            source = workflow_file.read_text()
            self.assertNotIn("firebase deploy", source)
            self.assertNotIn("gcloud run deploy", source)

    def test_ios_configuration_is_verified_before_unsigned_build(self):
        workflow = (Path(__file__).parents[1] / ".github" / "workflows" / "bootstrap-native-platforms.yml").read_text()
        verification = workflow.index("Verified non-production iOS Firebase plist against generated FlutterFire options.")
        build = workflow.index("flutter build ios --no-codesign")
        self.assertLess(verification, build)
        for key in ("BUNDLE_ID", "PROJECT_ID", "GOOGLE_APP_ID", "GCM_SENDER_ID", "API_KEY"):
            self.assertIn(key, workflow)


if __name__ == "__main__":
    unittest.main()
