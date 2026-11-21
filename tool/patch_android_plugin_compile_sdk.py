#!/usr/bin/env python3
"""Normalize Flutter plugin Android compileSdk before CI native builds.

Some pinned plugins (including file_picker 8.3.x) declare API 34 while a
transitive Android lifecycle plugin requires API 36. The app already compiles
against API 36. This CI-only patch aligns plugin modules with the app; it does
not change targetSdk, minSdk, application identity, signing, or runtime policy.
"""

from __future__ import annotations

import os
import re
from pathlib import Path

ANDROID_COMPILE_SDK = 36

COMPILE_SDK = re.compile(
    r"(?m)^(\s*(?:compileSdk|compileSdkVersion)\s*(?:=\s*)?)"
    r"(?:flutter\.compileSdkVersion|\d+)(\s*(?://.*)?$)"
)


def patch_gradle_file(path: Path) -> bool:
    source = path.read_text(encoding="utf-8")
    updated, count = COMPILE_SDK.subn(rf"\g<1>{ANDROID_COMPILE_SDK}\g<2>", source)
    if count:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def patch_android_plugin_compile_sdk(pub_cache: Path) -> list[Path]:
    gradle_files = sorted(pub_cache.glob("hosted/*/*/android/build.gradle*"))
    if not gradle_files:
        raise SystemExit(f"No Flutter plugin Android Gradle files found in {pub_cache}")

    patched = [path for path in gradle_files if patch_gradle_file(path)]
    file_picker_files = [
        path for path in gradle_files
        if path.parent.parent.name.startswith("file_picker-")
    ]
    if not file_picker_files:
        raise SystemExit("file_picker Android Gradle project was not found in the resolved pub cache.")
    if not any(
        re.search(rf"(?m)^\s*(?:compileSdk|compileSdkVersion)\s*(?:=\s*)?{ANDROID_COMPILE_SDK}\s*(?://.*)?$", path.read_text(encoding="utf-8"))
        for path in file_picker_files
    ):
        raise SystemExit("file_picker compileSdk could not be verified as API 36.")

    return patched


def main() -> None:
    pub_cache = Path(os.environ.get("PUB_CACHE", Path.home() / ".pub-cache")).expanduser()
    patched = patch_android_plugin_compile_sdk(pub_cache)
    print(f"Mawdda: patched compileSdk=36 in {len(patched)} Flutter Android plugin module(s).")
    for path in patched:
        print(f"  - {path}")


if __name__ == "__main__":
    main()
