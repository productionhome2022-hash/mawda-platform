from pathlib import Path
import unittest


class NativeGradleConfigurationTests(unittest.TestCase):
    def test_generated_android_app_uses_api_36_and_min_sdk_23(self):
        source = Path(__file__).with_name("configure_native_platforms.py").read_text()
        self.assertIn('compileSdk = 36', source)
        self.assertIn('minSdk = 23', source)

    def test_generated_runners_declare_microphone_permissions(self):
        source = Path(__file__).with_name("configure_native_platforms.py").read_text()
        self.assertIn("android.permission.RECORD_AUDIO", source)
        self.assertIn("NSMicrophoneUsageDescription", source)


if __name__ == "__main__":
    unittest.main()
