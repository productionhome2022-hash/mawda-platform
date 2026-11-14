#!/usr/bin/env python3
"""Apply Mawdda's native configuration after Flutter creates Android/iOS runners."""

from __future__ import annotations

import plistlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = "com.mawdda.platform.app"
APP_NAME = "Mawdda Platform 2026"


def configure_android() -> None:
    android = ROOT / "android"
    if not android.is_dir():
        raise SystemExit("Flutter did not generate the Android project directory.")

    candidates = list((android / "app" / "src" / "main").rglob("MainActivity.kt"))
    if candidates:
        activity = candidates[0]
        package_match = re.search(r"^package\s+([A-Za-z0-9_.]+)", activity.read_text(), re.M)
        package = package_match.group(1) if package_match else PACKAGE
        activity.write_text(
            f"package {package}\n\n"
            "import io.flutter.embedding.android.FlutterFragmentActivity\n\n"
            "class MainActivity : FlutterFragmentActivity()\n",
            encoding="utf-8",
        )
    else:
        java_candidates = list((android / "app" / "src" / "main").rglob("MainActivity.java"))
        if not java_candidates:
            raise SystemExit("Flutter-generated MainActivity source was not found.")
        activity = java_candidates[0]
        package_match = re.search(r"^package\s+([A-Za-z0-9_.]+)", activity.read_text(), re.M)
        package = package_match.group(1) if package_match else PACKAGE
        activity.write_text(
            f"package {package};\n\n"
            "import io.flutter.embedding.android.FlutterFragmentActivity;\n\n"
            "public class MainActivity extends FlutterFragmentActivity {}\n",
            encoding="utf-8",
        )

    manifest = android / "app" / "src" / "main" / "AndroidManifest.xml"
    xml = manifest.read_text(encoding="utf-8")
    permissions = [
        '    <uses-permission android:name="android.permission.USE_BIOMETRIC" />',
        '    <uses-permission android:name="android.permission.USE_FINGERPRINT" />',
        '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
    ]
    for permission in permissions:
        if permission not in xml:
            xml = xml.replace("<application", permission + "\n    <application", 1)
    xml = re.sub(r'android:label="[^"]+"', f'android:label="{APP_NAME}"', xml, count=1)
    manifest.write_text(xml, encoding="utf-8")

    gradle_files = [
        android / "app" / "build.gradle.kts",
        android / "app" / "build.gradle",
    ]
    gradle = next((candidate for candidate in gradle_files if candidate.is_file()), None)
    if gradle is None:
        raise SystemExit("Android app Gradle build file was not generated.")
    source = gradle.read_text(encoding="utf-8")
    if gradle.suffix == ".kts":
        source, namespace_count = re.subn(
            r'namespace\s*=\s*"[^"]+"',
            f'namespace = "{PACKAGE}"',
            source,
            count=1,
        )
        source, app_id_count = re.subn(
            r'applicationId\s*=\s*"[^"]+"',
            f'applicationId = "{PACKAGE}"',
            source,
            count=1,
        )
        source, min_count = re.subn(
            r'minSdk\s*=\s*flutter\.minSdkVersion',
            "minSdk = 23",
            source,
            count=1,
        )
        source, compile_count = re.subn(
            r'compileSdk\s*=\s*flutter\.compileSdkVersion',
            "compileSdk = 36",
            source,
            count=1,
        )
    else:
        source, namespace_count = re.subn(
            r'namespace\s+["\'][^"\']+["\']',
            f'namespace "{PACKAGE}"',
            source,
            count=1,
        )
        source, app_id_count = re.subn(
            r'applicationId\s+["\'][^"\']+["\']',
            f'applicationId "{PACKAGE}"',
            source,
            count=1,
        )
        source, min_count = re.subn(
            r'minSdkVersion\s+flutter\.minSdkVersion',
            "minSdkVersion 23",
            source,
            count=1,
        )
        source, compile_count = re.subn(
            r'compileSdkVersion\s+flutter\.compileSdkVersion',
            "compileSdkVersion 36",
            source,
            count=1,
        )
    if not namespace_count or not app_id_count or not min_count or not compile_count:
        raise SystemExit("Could not safely set Android namespace, applicationId, minSdk=23 and compileSdk=36.")
    gradle.write_text(source, encoding="utf-8")

    # Flutter plugins build as independent Android subprojects. Some currently
    # declare API 34 internally even when the app uses API 36. Override every
    # Android library/application extension before its AAR metadata check.
    root_kts = android / "build.gradle.kts"
    root_groovy = android / "build.gradle"
    root_build = root_kts if root_kts.is_file() else root_groovy
    if not root_build.is_file():
        raise SystemExit("Android root Gradle build file was not generated.")
    root_source = root_build.read_text(encoding="utf-8")
    if root_kts.is_file():
        override = """
// Mawdda: align every plugin subproject with Android API 36 metadata requirements.
subprojects {
    afterEvaluate {
        val androidExtension = extensions.findByName("android")
        if (androidExtension != null) {
            val setter = androidExtension.javaClass.methods.firstOrNull {
                it.name == "setCompileSdkVersion" && it.parameterCount == 1
            }
            setter?.invoke(androidExtension, 36)
        }
    }
}
"""
    else:
        override = """
// Mawdda: align every plugin subproject with Android API 36 metadata requirements.
subprojects {
    afterEvaluate { project ->
        def androidExtension = project.extensions.findByName('android')
        if (androidExtension != null) {
            androidExtension.compileSdkVersion 36
        }
    }
}
"""
    if "align every plugin subproject with Android API 36" not in root_source:
        root_source = root_source.rstrip() + "\n" + override
    root_build.write_text(root_source, encoding="utf-8")


def configure_ios() -> None:
    ios = ROOT / "ios"
    info = ios / "Runner" / "Info.plist"
    if not info.is_file():
        raise SystemExit("Flutter did not generate ios/Runner/Info.plist.")
    with info.open("rb") as handle:
        values = plistlib.load(handle)
    values["CFBundleDisplayName"] = APP_NAME
    values["NSFaceIDUsageDescription"] = (
        "Mawdda uses Face ID only when you explicitly choose local device authentication. "
        "Biometric data remains on your Apple device and is never collected by Mawdda."
    )
    with info.open("wb") as handle:
        plistlib.dump(values, handle, sort_keys=False)

    project = ios / "Runner.xcodeproj" / "project.pbxproj"
    if not project.is_file():
        raise SystemExit("Flutter did not generate the Runner Xcode project.")
    pbx = project.read_text(encoding="utf-8")
    if f"PRODUCT_BUNDLE_IDENTIFIER = {PACKAGE};" not in pbx:
        pbx, count = re.subn(
            r"PRODUCT_BUNDLE_IDENTIFIER = com\.example\.app;",
            f"PRODUCT_BUNDLE_IDENTIFIER = {PACKAGE};",
            pbx,
        )
        if count == 0:
            raise SystemExit("Could not verify/set the iOS bundle identifier.")
    project.write_text(pbx, encoding="utf-8")


def main() -> None:
    configure_android()
    configure_ios()
    print("Mawdda Android/iOS native configuration applied.")


if __name__ == "__main__":
    main()
