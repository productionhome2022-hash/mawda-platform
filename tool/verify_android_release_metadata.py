#!/usr/bin/env python3
"""Fail-closed identity/version validation for Android APK and AAB release outputs."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import zipfile
from pathlib import Path


PACKAGE_ID = "com.mawdda.platform.app"
APK_VERSION_CODE_OFFSETS = {
    "mawdda-universal-release.apk": 0,
    "app-armeabi-v7a-release.apk": 1000,
    "app-arm64-v8a-release.apk": 2000,
    "app-x86_64-release.apk": 4000,
}


def parse_pubspec_version(content: str) -> tuple[str, int]:
    match = re.search(r"^version:\s*([^\s#]+)", content, re.MULTILINE)
    if not match:
        raise ValueError("Missing Flutter version in pubspec.yaml")
    version = match.group(1).strip().strip("'\"")
    if "+" not in version:
        raise ValueError("pubspec.yaml version must include a numeric Android build number")
    version_name, build_number = version.rsplit("+", 1)
    if not version_name or not build_number.isdigit() or int(build_number) < 1:
        raise ValueError("pubspec.yaml versionName/versionCode is invalid")
    return version_name, int(build_number)


def expected_apk_version_code(apk_name: str, base_version_code: int) -> int:
    if apk_name not in APK_VERSION_CODE_OFFSETS:
        raise ValueError(f"Unexpected APK output name: {apk_name}")
    return base_version_code + APK_VERSION_CODE_OFFSETS[apk_name]


def validate_apk_badging(output: str, expected_package: str, version_name: str, version_code: int) -> None:
    match = re.search(
        r"^package: name='([^']+)' versionCode='([0-9]+)' versionName='([^']*)'",
        output,
        re.MULTILINE,
    )
    if not match:
        raise ValueError("aapt did not return a parseable APK package identity")
    actual_package, actual_code, actual_name = match.groups()
    if actual_package != expected_package:
        raise ValueError(f"APK package ID mismatch: {actual_package}")
    if int(actual_code) != version_code or actual_name != version_name:
        raise ValueError(
            f"APK version mismatch: got {actual_name}+{actual_code}, "
            f"expected {version_name}+{version_code}"
        )


def validate_aab_output_metadata(
    metadata: dict,
    aab_name: str,
    expected_package: str,
    version_name: str,
    version_code: int,
) -> None:
    artifact_type = metadata.get("artifactType", {})
    if artifact_type.get("type") != "AAB":
        raise ValueError("Gradle output metadata does not describe an Android App Bundle")
    if metadata.get("applicationId") != expected_package:
        raise ValueError("AAB applicationId does not match the approved Mawdda package ID")
    if str(metadata.get("variantName", "")).lower() != "release":
        raise ValueError("AAB Gradle variant is not release")
    elements = metadata.get("elements")
    if not isinstance(elements, list) or len(elements) != 1:
        raise ValueError("AAB output metadata must contain exactly one release artifact")
    element = elements[0]
    if Path(str(element.get("outputFile", ""))).name != aab_name:
        raise ValueError("AAB output metadata points to a different bundle file")
    if int(element.get("versionCode", -1)) != version_code:
        raise ValueError("AAB versionCode does not match pubspec.yaml")
    if str(element.get("versionName", "")) != version_name:
        raise ValueError("AAB versionName does not match pubspec.yaml")


def validate_aab_archive(aab_path: Path) -> None:
    if not aab_path.is_file() or aab_path.stat().st_size == 0:
        raise ValueError("AAB artifact is missing or empty")
    try:
        with zipfile.ZipFile(aab_path) as archive:
            corrupt = archive.testzip()
            if corrupt:
                raise ValueError(f"AAB archive contains a corrupt entry: {corrupt}")
            names = set(archive.namelist())
            required = {"BundleConfig.pb", "base/manifest/AndroidManifest.xml"}
            missing = required - names
            if missing:
                raise ValueError(f"AAB is missing required bundle entries: {sorted(missing)}")
    except zipfile.BadZipFile as error:
        raise ValueError("AAB is not a valid ZIP-based Android App Bundle") from error


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pubspec", type=Path, required=True)
    parser.add_argument("--aapt", required=True)
    parser.add_argument("--apk-dir", type=Path, required=True)
    parser.add_argument("--aab", type=Path, required=True)
    parser.add_argument("--bundle-metadata", type=Path, required=True)
    parser.add_argument("--evidence", type=Path, required=True)
    args = parser.parse_args()

    version_name, version_code = parse_pubspec_version(args.pubspec.read_text(encoding="utf-8"))
    apks = sorted(args.apk_dir.glob("*.apk"))
    actual_names = {apk.name for apk in apks}
    expected_names = set(APK_VERSION_CODE_OFFSETS)
    if actual_names != expected_names:
        raise ValueError(
            f"APK set mismatch: missing={sorted(expected_names - actual_names)}, "
            f"unexpected={sorted(actual_names - expected_names)}"
        )

    evidence = [
        f"applicationId={PACKAGE_ID}",
        f"versionName={version_name}",
        f"baseVersionCode={version_code}",
    ]
    seen_version_codes = set()
    for apk in apks:
        expected_code = expected_apk_version_code(apk.name, version_code)
        result = subprocess.run(
            [args.aapt, "dump", "badging", str(apk)],
            check=True,
            capture_output=True,
            text=True,
        )
        validate_apk_badging(result.stdout, PACKAGE_ID, version_name, expected_code)
        if expected_code in seen_version_codes:
            raise ValueError("ABI APK versionCodes are not unique")
        seen_version_codes.add(expected_code)
        evidence.append(
            f"apk={apk.name};versionCode={expected_code};sizeBytes={apk.stat().st_size};identity=verified"
        )

    validate_aab_archive(args.aab)
    metadata = json.loads(args.bundle_metadata.read_text(encoding="utf-8"))
    validate_aab_output_metadata(metadata, "app-release.aab", PACKAGE_ID, version_name, version_code)
    evidence.append(
        f"aab={args.aab.name};versionCode={version_code};sizeBytes={args.aab.stat().st_size};identity=verified"
    )
    args.evidence.parent.mkdir(parents=True, exist_ok=True)
    args.evidence.write_text("\n".join(evidence) + "\n", encoding="utf-8")
    print("Verified APK and AAB package identity, ABI-aware version metadata and bundle structure.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError, subprocess.CalledProcessError) as error:
        raise SystemExit(f"Android release metadata validation failed: {error}")
