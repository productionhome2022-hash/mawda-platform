from pathlib import Path
import unittest

from configure_native_platforms import configure_android_gradle


class NativeGradleConfigurationTests(unittest.TestCase):
    def test_kotlin_flutter_defaults_are_configured_and_repeatable(self):
        source = """
android {
    namespace = "com.example.app"
    compileSdk = flutter.compileSdkVersion
    defaultConfig {
        applicationId = "com.example.app"
        minSdk = flutter.minSdkVersion
    }
}
"""
        configured = configure_android_gradle(source, kotlin_dsl=True)
        self.assertIn('namespace = "com.mawdda.platform.app"', configured)
        self.assertIn("compileSdk = 36", configured)
        self.assertIn('applicationId = "com.mawdda.platform.app"', configured)
        self.assertIn("minSdk = 23", configured)
        self.assertEqual(configure_android_gradle(configured, kotlin_dsl=True), configured)

    def test_kotlin_existing_numeric_sdk_values_are_normalized(self):
        source = """
android {
    namespace = "com.example.app"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.example.app"
        minSdk = 21
    }
}
"""
        configured = configure_android_gradle(source, kotlin_dsl=True)
        self.assertIn("compileSdk = 36", configured)
        self.assertIn("minSdk = 23", configured)

    def test_groovy_defaults_and_existing_numeric_values_are_repeatable(self):
        source = """
android {
    namespace "com.example.app"
    compileSdkVersion flutter.compileSdkVersion
    defaultConfig {
        applicationId "com.example.app"
        minSdkVersion flutter.minSdkVersion
    }
}
"""
        configured = configure_android_gradle(source, kotlin_dsl=False)
        self.assertIn('namespace "com.mawdda.platform.app"', configured)
        self.assertIn("compileSdkVersion 36", configured)
        self.assertIn('applicationId "com.mawdda.platform.app"', configured)
        self.assertIn("minSdkVersion 23", configured)
        self.assertEqual(configure_android_gradle(configured, kotlin_dsl=False), configured)

    def test_missing_required_gradle_setting_fails_closed(self):
        with self.assertRaises(SystemExit):
            configure_android_gradle('android { namespace = "x" }', kotlin_dsl=True)

    def test_generated_runners_declare_microphone_permissions(self):
        source = Path(__file__).with_name("configure_native_platforms.py").read_text()
        self.assertIn("android.permission.RECORD_AUDIO", source)
        self.assertIn("NSMicrophoneUsageDescription", source)


if __name__ == "__main__":
    unittest.main()
