from pathlib import Path
import tempfile
import unittest

from patch_android_plugin_compile_sdk import patch_android_plugin_compile_sdk, patch_gradle_file


class AndroidPluginCompileSdkTests(unittest.TestCase):
    def test_patches_groovy_and_kotlin_compile_sdk_forms(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            groovy = root / "groovy.gradle"
            kotlin = root / "kotlin.gradle.kts"
            groovy.write_text("android {\n    compileSdkVersion flutter.compileSdkVersion\n}\n")
            kotlin.write_text("android {\n    compileSdk = 34\n}\n")

            self.assertTrue(patch_gradle_file(groovy))
            self.assertTrue(patch_gradle_file(kotlin))
            self.assertIn("compileSdkVersion 36", groovy.read_text())
            self.assertIn("compileSdk = 36", kotlin.read_text())

    def test_patches_resolved_plugin_modules_and_requires_file_picker(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp) / "hosted" / "pub.dev"
            picker = root / "file_picker-8.3.7" / "android" / "build.gradle"
            lifecycle = root / "flutter_plugin_android_lifecycle-2.0.28" / "android" / "build.gradle"
            picker.parent.mkdir(parents=True)
            lifecycle.parent.mkdir(parents=True)
            picker.write_text("android {\n    compileSdkVersion 34\n}\n")
            lifecycle.write_text("android {\n    compileSdk = 34\n}\n")

            patched = patch_android_plugin_compile_sdk(Path(temp))
            self.assertEqual(len(patched), 2)
            self.assertIn("compileSdkVersion 36", picker.read_text())
            self.assertIn("compileSdk = 36", lifecycle.read_text())

    def test_fails_when_file_picker_is_not_present(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp) / "hosted" / "pub.dev" / "some_plugin-1.0.0" / "android"
            root.mkdir(parents=True)
            (root / "build.gradle").write_text("android {\n    compileSdkVersion 34\n}\n")
            with self.assertRaises(SystemExit):
                patch_android_plugin_compile_sdk(Path(temp))


if __name__ == "__main__":
    unittest.main()
