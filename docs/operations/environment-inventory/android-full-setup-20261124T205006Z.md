# Mawdda Android Full Toolchain Setup

- Date: Tue Nov 24 20:57:56 UTC 2026
- Architecture: arm64
- Overall failure flag: 1
- APT status: 0
- Android SDK status: DOWNLOAD_OR_CHECKSUM_FAILED
- Android licenses: SDKMANAGER_MISSING
- NDK status: VERSION_NOT_DETECTED_OR_SDKMANAGER_MISSING
- Gradle status: DOWNLOAD_FAILED

## Installed tool versions
- git: /usr/bin/git
git version 2.53.0
- gh: /data/data/com.termux/files/usr/bin/gh
- flutter: /root/flutter/bin/flutter
   Woah! You appear to be trying to run flutter as root.
   We strongly recommend running the flutter tool without superuser privileges.
  /
- dart: /root/flutter/bin/dart
- java: /data/data/com.termux/files/usr/bin/java
openjdk version "21.0.11" 2026-04-21
OpenJDK Runtime Environment (build 21.0.11)
- node: /usr/bin/node
v22.22.1
- npm: /usr/bin/npm
9.2.0
- firebase: /data/data/com.termux/files/usr/bin/firebase
- sdkmanager: NOT FOUND
- adb: NOT FOUND
- gradle: NOT FOUND

## Android SDK packages

## Native binary architecture

## Flutter doctor
   Woah! You appear to be trying to run flutter as root.
   We strongly recommend running the flutter tool without superuser privileges.
  /
📎
[✓] Flutter (Channel stable, 3.47.9, on Ubuntu 26.04.1 LTS 6.17.0-PRoot-Distro, locale en_US) [292ms]
    • Flutter version 3.47.9 on channel stable at /root/flutter
    • Upstream repository https://github.com/flutter/flutter.git
    • Framework revision c197ca5199 (4 weeks ago), 2026-10-29 10:10:20 -0400
    • Engine revision 89c39edfdf
    • Dart version 3.13.7
    • DevTools version 2.60.0
    • Feature flags: enable-web, enable-linux-desktop, enable-macos-desktop, enable-windows-desktop, enable-android, enable-ios, cli-animations, enable-native-assets, enable-record-use, enable-swift-package-manager, omit-legacy-version-file, enable-lldb-debugging, enable-uiscene-migration

[✗] Android toolchain - develop for Android devices [85ms]
    ✗ ANDROID_HOME = /opt/android-sdk
      but Android SDK not found at this location.

[✗] Chrome - develop for the web (Cannot find Chrome executable at google-chrome) [35ms]
    ! Cannot find Chrome. Try setting CHROME_EXECUTABLE to a Chrome executable.

[✗] Linux toolchain - develop for Linux desktop [1,170ms]
    • clang version 21.1.8
    • cmake version 4.3.4
    • ninja version 1.13.2
    • pkg-config version 0.29.2
    ✗ GTK 3.0 development libraries are required for Linux development.
      They are likely available from your distribution (e.g.: apt install libgtk-3-dev)
    ! Unable to access driver information using 'eglinfo'.
      It is likely available from your distribution (e.g.: apt install mesa-utils)

[✓] Connected device (1 available) [77ms]
    • Linux (desktop) • linux • linux-arm64 • Ubuntu 26.04.1 LTS 6.17.0-PRoot-Distro

[✓] Network resources [1,665ms]
    • All expected network resources are available.

! Doctor found issues in 3 categories.

## Disk space
Filesystem        Size  Used Avail Use% Mounted on
/dev/block/dm-60  225G  106G  120G  47% /
/dev/block/dm-60  225G  106G  120G  47% /

## Package manager audit

## Setup log
/opt/mawdda-toolchain/logs/android-full-setup-20261124T205006Z.log
Hit:1 http://ports.ubuntu.com/ubuntu-ports resolute InRelease
Hit:2 http://ports.ubuntu.com/ubuntu-ports resolute-updates InRelease
Hit:3 https://packages.cloud.google.com/apt cloud-sdk InRelease
Hit:4 http://ports.ubuntu.com/ubuntu-ports resolute-backports InRelease
Hit:5 http://ports.ubuntu.com/ubuntu-ports resolute-security InRelease
Reading package lists...
Reading package lists...
Building dependency tree...
Reading state information...
curl is already the newest version (8.18.0-1ubuntu2.8).
wget is already the newest version (1.25.0-2ubuntu4.4).
ca-certificates is already the newest version (20260816ubuntu0.26.04.2).
unzip is already the newest version (6.0-29ubuntu1).
zip is already the newest version (3.0-15ubuntu3).
xz-utils is already the newest version (5.8.3-1ubuntu0.1).
python3 is already the newest version (3.14.3-0ubuntu2).
python3-venv is already the newest version (3.14.3-0ubuntu2).
jq is already the newest version (1.8.1-4ubuntu2).
Solving dependencies...
The following additional packages will be installed:
  libnuma1 libpopt0 libyaml-0-2 python3-argcomplete python3-tomlkit
  python3-xmltodict python3-yaml
Suggested packages:
  openssh-server python3-braceexpand
The following NEW packages will be installed:
  fzf git-filter-repo git-lfs libnuma1 libpopt0 libyaml-0-2
  python3-argcomplete python3-tomlkit python3-xmltodict python3-yaml rsync
  shellcheck shfmt yq
0 upgraded, 14 newly installed, 0 to remove and 9 not upgraded.
Need to get 10.7 MB of archives.
After this operation, 48.2 MB of additional disk space will be used.
Get:1 http://ports.ubuntu.com/ubuntu-ports resolute/main arm64 libpopt0 arm64 1.19+dfsg-2build1 [29.0 kB]
Get:2 http://ports.ubuntu.com/ubuntu-ports resolute/main arm64 libyaml-0-2 arm64 0.2.5-2build3 [50.4 kB]
Get:3 http://ports.ubuntu.com/ubuntu-ports resolute/main arm64 python3-yaml arm64 6.0.3-1build1 [127 kB]
Get:4 http://ports.ubuntu.com/ubuntu-ports resolute/main arm64 libnuma1 arm64 2.0.19-1build1 [23.8 kB]
Get:5 http://ports.ubuntu.com/ubuntu-ports resolute-updates/main arm64 rsync arm64 3.4.1+ds1-7ubuntu0.3 [436 kB]
Get:6 http://ports.ubuntu.com/ubuntu-ports resolute/universe arm64 fzf arm64 0.67.0-1 [1495 kB]
Get:7 http://ports.ubuntu.com/ubuntu-ports resolute/universe arm64 git-filter-repo all 2.47.0-3 [133 kB]
Get:8 http://ports.ubuntu.com/ubuntu-ports resolute/universe arm64 git-lfs arm64 3.7.1-1 [3850 kB]
Get:9 http://ports.ubuntu.com/ubuntu-ports resolute/universe arm64 python3-argcomplete all 3.6.3-1 [36.1 kB]
Get:10 http://ports.ubuntu.com/ubuntu-ports resolute/universe arm64 python3-tomlkit all 0.13.3-2 [39.1 kB]
Get:11 http://ports.ubuntu.com/ubuntu-ports resolute/main arm64 python3-xmltodict all 1.0.3-1 [19.4 kB]
Get:12 http://ports.ubuntu.com/ubuntu-ports resolute/universe arm64 shfmt arm64 3.12.0-1 [1017 kB]
Get:13 http://ports.ubuntu.com/ubuntu-ports resolute/universe arm64 yq all 3.4.3-2 [27.1 kB]
Get:14 http://ports.ubuntu.com/ubuntu-ports resolute/universe arm64 shellcheck arm64 0.11.0-2 [3458 kB]
debconf: unable to initialize frontend: Dialog
debconf: (No usable dialog-like program is installed, so the dialog based frontend cannot be used. at /usr/share/perl5/Debconf/FrontEnd/Dialog.pm line 79, <STDIN> line 14.)
debconf: falling back to frontend: Readline
Fetched 10.7 MB in 1min 8s (159 kB/s)
Selecting previously unselected package libpopt0:arm64.
(Reading database ... (Reading database ... 5%(Reading database ... 10%(Reading database ... 15%(Reading database ... 20%(Reading database ... 25%(Reading database ... 30%(Reading database ... 35%(Reading database ... 40%(Reading database ... 45%(Reading database ... 50%(Reading database ... 55%(Reading database ... 60%(Reading database ... 65%(Reading database ... 70%(Reading database ... 75%(Reading database ... 80%(Reading database ... 85%(Reading database ... 90%(Reading database ... 95%(Reading database ... 100%(Reading database ... 103853 files and directories currently installed.)
Preparing to unpack .../00-libpopt0_1.19+dfsg-2build1_arm64.deb ...
Unpacking libpopt0:arm64 (1.19+dfsg-2build1) ...
Selecting previously unselected package libyaml-0-2:arm64.
Preparing to unpack .../01-libyaml-0-2_0.2.5-2build3_arm64.deb ...
Unpacking libyaml-0-2:arm64 (0.2.5-2build3) ...
Selecting previously unselected package python3-yaml.
Preparing to unpack .../02-python3-yaml_6.0.3-1build1_arm64.deb ...
Unpacking python3-yaml (6.0.3-1build1) ...
Selecting previously unselected package libnuma1:arm64.
Preparing to unpack .../03-libnuma1_2.0.19-1build1_arm64.deb ...
Unpacking libnuma1:arm64 (2.0.19-1build1) ...
Selecting previously unselected package rsync.
Preparing to unpack .../04-rsync_3.4.1+ds1-7ubuntu0.3_arm64.deb ...
Unpacking rsync (3.4.1+ds1-7ubuntu0.3) ...
Selecting previously unselected package fzf.
Preparing to unpack .../05-fzf_0.67.0-1_arm64.deb ...
Unpacking fzf (0.67.0-1) ...
Selecting previously unselected package git-filter-repo.
Preparing to unpack .../06-git-filter-repo_2.47.0-3_all.deb ...
Unpacking git-filter-repo (2.47.0-3) ...
Selecting previously unselected package git-lfs.
Preparing to unpack .../07-git-lfs_3.7.1-1_arm64.deb ...
Unpacking git-lfs (3.7.1-1) ...
Selecting previously unselected package python3-argcomplete.
Preparing to unpack .../08-python3-argcomplete_3.6.3-1_all.deb ...
Unpacking python3-argcomplete (3.6.3-1) ...
Selecting previously unselected package python3-tomlkit.
Preparing to unpack .../09-python3-tomlkit_0.13.3-2_all.deb ...
Unpacking python3-tomlkit (0.13.3-2) ...
Selecting previously unselected package python3-xmltodict.
Preparing to unpack .../10-python3-xmltodict_1.0.3-1_all.deb ...
Unpacking python3-xmltodict (1.0.3-1) ...
Selecting previously unselected package shfmt.
Preparing to unpack .../11-shfmt_3.12.0-1_arm64.deb ...
Unpacking shfmt (3.12.0-1) ...
Selecting previously unselected package yq.
Preparing to unpack .../12-yq_3.4.3-2_all.deb ...
Unpacking yq (3.4.3-2) ...
Selecting previously unselected package shellcheck.
Preparing to unpack .../13-shellcheck_0.11.0-2_arm64.deb ...
Unpacking shellcheck (0.11.0-2) ...
Setting up libyaml-0-2:arm64 (0.2.5-2build3) ...
Setting up python3-yaml (6.0.3-1build1) ...
Setting up git-filter-repo (2.47.0-3) ...
Setting up shfmt (3.12.0-1) ...
Setting up python3-xmltodict (1.0.3-1) ...
Setting up libnuma1:arm64 (2.0.19-1build1) ...
Setting up fzf (0.67.0-1) ...
Setting up python3-argcomplete (3.6.3-1) ...
Setting up git-lfs (3.7.1-1) ...
Setting up python3-tomlkit (0.13.3-2) ...
Setting up libpopt0:arm64 (1.19+dfsg-2build1) ...
Setting up yq (3.4.3-2) ...
Setting up shellcheck (0.11.0-2) ...
Setting up rsync (3.4.1+ds1-7ubuntu0.3) ...
invoke-rc.d: could not determine current runlevel
invoke-rc.d: policy-rc.d denied execution of start.
Processing triggers for libc-bin (2.43-2ubuntu2.4) ...
curl: (56) OpenSSL SSL_read: OpenSSL/3.5.5: error:0A000126:SSL routines::unexpected eof while reading, errno 0
/tmp/mawdda-android-setup-20261124T205006Z/android-commandline-tools.zip: FAILED
sha1sum: WARNING: 1 computed checksum did NOT match
curl: (35) Recv failure: Connection reset by peer
curl: (6) Could not resolve host: services.gradle.org
curl: (6) Could not resolve host: services.gradle.org
   Woah! You appear to be trying to run flutter as root.
   We strongly recommend running the flutter tool without superuser privileges.
  /
📎
Setting "android-sdk" value to "/opt/android-sdk".

You may need to restart any open editors for them to read new settings.
   Woah! You appear to be trying to run flutter as root.
   We strongly recommend running the flutter tool without superuser privileges.
  /
📎
[✓] Flutter (Channel stable, 3.47.9, on Ubuntu 26.04.1 LTS 6.17.0-PRoot-Distro, locale en_US) [133ms]
    • Flutter version 3.47.9 on channel stable at /root/flutter
    • Upstream repository https://github.com/flutter/flutter.git
    • Framework revision c197ca5199 (4 weeks ago), 2026-10-29 10:10:20 -0400
    • Engine revision 89c39edfdf
    • Dart version 3.13.7
    • DevTools version 2.60.0
    • Feature flags: enable-web, enable-linux-desktop, enable-macos-desktop, enable-windows-desktop, enable-android, enable-ios, cli-animations, enable-native-assets, enable-record-use, enable-swift-package-manager, omit-legacy-version-file, enable-lldb-debugging, enable-uiscene-migration

[✗] Android toolchain - develop for Android devices [63ms]
    ✗ ANDROID_HOME = /opt/android-sdk
      but Android SDK not found at this location.

[✗] Chrome - develop for the web (Cannot find Chrome executable at google-chrome) [35ms]
    ! Cannot find Chrome. Try setting CHROME_EXECUTABLE to a Chrome executable.

[✗] Linux toolchain - develop for Linux desktop [761ms]
    • clang version 21.1.8
    • cmake version 4.3.4
    • ninja version 1.13.2
    • pkg-config version 0.29.2
    ✗ GTK 3.0 development libraries are required for Linux development.
      They are likely available from your distribution (e.g.: apt install libgtk-3-dev)
    ! Unable to access driver information using 'eglinfo'.
      It is likely available from your distribution (e.g.: apt install mesa-utils)

[✓] Connected device (1 available) [54ms]
    • Linux (desktop) • linux • linux-arm64 • Ubuntu 26.04.1 LTS 6.17.0-PRoot-Distro

[✓] Network resources [4.0s]
    • All expected network resources are available.

! Doctor found issues in 3 categories.
