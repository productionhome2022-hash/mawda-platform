from pathlib import Path
import json
import re
import unittest


class NativeWorkflowFirebaseConfigurationTests(unittest.TestCase):
    def test_committed_firebase_options_and_android_service_config_are_nonproduction(self):
        root = Path(__file__).parents[1]
        options = (root / "lib" / "firebase_options_nonprod.dart").read_text()
        android = json.loads((root / "android" / "app" / "google-services.json").read_text())
        for platform in ("web", "android", "ios"):
            match = re.search(
                rf"static const FirebaseOptions {platform} = FirebaseOptions\((.*?)\n  \);",
                options,
                re.S,
            )
            self.assertIsNotNone(match, f"Missing {platform} Firebase options.")
            self.assertIn("projectId: 'mawda-platform-nonprod-2026'", match.group(1))
        self.assertEqual(android["project_info"]["project_id"], "mawda-platform-nonprod-2026")
        self.assertEqual(
            android["client"][0]["client_info"]["android_client_info"]["package_name"],
            "com.mawdda.platform.app",
        )

    def test_native_validation_does_not_mutate_firebase_projects_or_deploy(self):
        root = Path(__file__).parents[1]
        workflow = (root / ".github" / "workflows" / "bootstrap-native-platforms.yml").read_text()
        for forbidden in (
            "FIREBASE_TOKEN",
            "flutterfire configure",
            "firebase apps:list",
            "firebase apps:sdkconfig",
            "GoogleService-Info.plist",
            "firebase deploy",
            "gcloud run deploy",
        ):
            self.assertNotIn(forbidden, workflow)
        self.assertIn("Verified committed non-production Firebase configuration without contacting Firebase.", workflow)
        self.assertIn("Verified committed non-production iOS Firebase options without contacting Firebase.", workflow)

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

    def test_ios_nonproduction_options_are_verified_before_unsigned_build(self):
        workflow = (Path(__file__).parents[1] / ".github" / "workflows" / "bootstrap-native-platforms.yml").read_text()
        verification = workflow.index("Verified committed non-production iOS Firebase options without contacting Firebase.")
        build = workflow.index("flutter build ios --no-codesign")
        self.assertLess(verification, build)
        self.assertIn("projectId: 'mawda-platform-nonprod-2026'", workflow)
        self.assertIn("iosBundleId: 'com.mawdda.platform.app'", workflow)


if __name__ == "__main__":
    unittest.main()
