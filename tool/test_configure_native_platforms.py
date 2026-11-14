from pathlib import Path
import unittest


class NativeGradleConfigurationTests(unittest.TestCase):
    def test_android_compile_sdk_override_uses_plugin_lifecycle_not_after_evaluate(self):
        source = Path(__file__).with_name("configure_native_platforms.py").read_text()
        self.assertNotIn("afterEvaluate", source)
        self.assertIn("gradle.beforeProject", source)
        self.assertIn("settings.gradle.kts", source)
        self.assertIn('pluginManager.withPlugin("com.android.library")', source)
        self.assertIn('pluginManager.withPlugin("com.android.application")', source)
        self.assertIn("plugins.withId('com.android.library')", source)
        self.assertIn("plugins.withId('com.android.application')", source)


if __name__ == "__main__":
    unittest.main()
