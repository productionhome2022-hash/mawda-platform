from pathlib import Path
import unittest


class NativeWorkflowFirebaseConfigurationTests(unittest.TestCase):
    def test_ios_service_file_uses_registered_firebase_app_sdk_config(self):
        workflow = (Path(__file__).parents[1] / ".github" / "workflows" / "bootstrap-native-platforms.yml").read_text()
        self.assertIn(
            "firebase apps:sdkconfig IOS 1:697303475139:ios:7be58cfe1ac9c4c23ed376",
            workflow,
        )
        self.assertIn("--out ios/Runner/GoogleService-Info.plist", workflow)
        self.assertIn('rm -f ios/Runner/GoogleService-Info.plist', workflow)
        self.assertNotIn("--ios-out=ios/Runner/GoogleService-Info.plist", workflow)

    def test_ios_configuration_is_verified_before_unsigned_build(self):
        workflow = (Path(__file__).parents[1] / ".github" / "workflows" / "bootstrap-native-platforms.yml").read_text()
        verification = workflow.index("Verified iOS Firebase plist on macOS")
        build = workflow.index("flutter build ios --no-codesign")
        self.assertLess(verification, build)
        for key in ("BUNDLE_ID", "PROJECT_ID", "GOOGLE_APP_ID", "GCM_SENDER_ID", "API_KEY"):
            self.assertIn(key, workflow)


if __name__ == "__main__":
    unittest.main()
