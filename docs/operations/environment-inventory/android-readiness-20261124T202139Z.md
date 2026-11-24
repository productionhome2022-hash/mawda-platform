# Mawdda Android Build Readiness

- Date: Tue Nov 24 20:21:39 UTC 2026
- Architecture: arm64

## Flutter version
   Woah! You appear to be trying to run flutter as root.
   We strongly recommend running the flutter tool without superuser privileges.
  /
📎
Flutter 3.47.9 • channel stable • https://github.com/flutter/flutter.git
Framework • revision c197ca5199 (4 weeks ago) • 2026-10-29 10:10:20 -0400
Engine • hash 9e025265bef30b838c0c1b68cad19decf97048f2 (revision 89c39edfdf) (28 days ago) • 2026-10-27 19:51:20.000Z
Tools • Dart 3.13.7 • DevTools 2.60.0

## Flutter configuration
   Woah! You appear to be trying to run flutter as root.
   We strongly recommend running the flutter tool without superuser privileges.
  /
📎
All Settings:
  enable-web: true
  enable-linux-desktop: (Not set)
  enable-macos-desktop: (Not set)
  enable-windows-desktop: (Not set)
  enable-android: (Not set)
  enable-ios: (Not set)
  enable-fuchsia: (Not set) (Unavailable)
  enable-custom-devices: (Not set)
  cli-animations: (Not set)
  enable-native-assets: (Not set)
  enable-dart-data-assets: (Not set) (Unavailable)
  enable-record-use: (Not set)
  enable-swift-package-manager: (Not set)
  omit-legacy-version-file: (Not set)
  enable-windowing: (Not set) (Unavailable)
  enable-accessibility-evaluations: (Not set) (Unavailable)
  enable-lldb-debugging: (Not set)
  enable-uiscene-migration: (Not set)
  enable-riscv64: (Not set)
  enable-macos-arm64-only: (Not set)


## Flutter doctor
   Woah! You appear to be trying to run flutter as root.
   We strongly recommend running the flutter tool without superuser privileges.
  /
📎
[✓] Flutter (Channel stable, 3.47.9, on Ubuntu 26.04.1 LTS 6.17.0-PRoot-Distro, locale en_US) [121ms]
    • Flutter version 3.47.9 on channel stable at /root/flutter
    • Upstream repository https://github.com/flutter/flutter.git
    • Framework revision c197ca5199 (4 weeks ago), 2026-10-29 10:10:20 -0400
    • Engine revision 89c39edfdf
    • Dart version 3.13.7
    • DevTools version 2.60.0
    • Feature flags: enable-web, enable-linux-desktop, enable-macos-desktop, enable-windows-desktop, enable-android, enable-ios, cli-animations, enable-native-assets, enable-record-use, enable-swift-package-manager, omit-legacy-version-file, enable-lldb-debugging, enable-uiscene-migration

[✗] Android toolchain - develop for Android devices [56ms]
    ✗ Unable to locate Android SDK.
      Install Android Studio from: https://developer.android.com/studio/index.html
      On first launch it will assist you in installing the Android SDK components.
      (or visit https://flutter.dev/to/linux-android-setup for detailed instructions).
      If the Android SDK has been installed to a custom location, please use
      `flutter config --android-sdk` to update to that location.


[✗] Chrome - develop for the web (Cannot find Chrome executable at google-chrome) [28ms]
    ! Cannot find Chrome. Try setting CHROME_EXECUTABLE to a Chrome executable.

[✗] Linux toolchain - develop for Linux desktop [819ms]
    • clang version 21.1.8
    • cmake version 4.3.4
    • ninja version 1.13.2
    • pkg-config version 0.29.2
    ✗ GTK 3.0 development libraries are required for Linux development.
      They are likely available from your distribution (e.g.: apt install libgtk-3-dev)
    ! Unable to access driver information using 'eglinfo'.
      It is likely available from your distribution (e.g.: apt install mesa-utils)

[✓] Connected device (1 available) [50ms]
    • Linux (desktop) • linux • linux-arm64 • Ubuntu 26.04.1 LTS 6.17.0-PRoot-Distro

[✓] Network resources [842ms]
    • All expected network resources are available.

! Doctor found issues in 3 categories.

## Android SDK directory inventory

### /opt/android-sdk
/opt/android-sdk
/opt/android-sdk/cmdline-tools

## Android and Java environment
ANDROID_HOME=not-set
ANDROID_SDK_ROOT=not-set
JAVA_HOME=not-set
openjdk version "21.0.11" 2026-04-21
OpenJDK Runtime Environment (build 21.0.11)
OpenJDK 64-Bit Server VM (build 21.0.11, mixed mode)

## Available commands
sdkmanager: NOT FOUND
adb: NOT FOUND
gradle: NOT FOUND
/root/flutter/bin/flutter
/root/flutter/bin/dart
/data/data/com.termux/files/usr/bin/java

## Disk space
Filesystem        Size  Used Avail Use% Mounted on
/dev/block/dm-60  225G  106G  120G  47% /
/dev/block/dm-60  225G  106G  120G  47% /
