# Mawdda Network and Android SDK Diagnostic

- Date: Tue Nov 24 20:19:19 UTC 2026
- Architecture: arm64

## Ubuntu repository connectivity

### http://ports.ubuntu.com/ubuntu-ports/
IPv4 HTTP=200 IP=104.20.28.246
curl: (7) Failed to connect to ports.ubuntu.com port 80 after 156 ms: Could not connect to server
IPv6 HTTP=000 IP=

### https://ports.ubuntu.com/ubuntu-ports/
IPv4 HTTP=200 IP=104.20.28.246
curl: (7) Failed to connect to ports.ubuntu.com port 443 after 145 ms: Could not connect to server
IPv6 HTTP=000 IP=

## Android repository connectivity

### https://dl.google.com/android/repository/repository2-1.xml
IPv4 HTTP=200 IP=74.125.29.190

### https://dl.google.com/android/repository/repository2-3.xml
IPv4 HTTP=200 IP=74.125.29.91

## Android SDK environment
ANDROID_HOME=not-set
ANDROID_SDK_ROOT=not-set

### Found: /opt/android-sdk
total 9
drwx------+ 3 root root 3452 Nov 24 23:13 .
drwxr-xr-x+ 4 root root 3452 Nov 24 23:13 ..
drwx------+ 2 root root 3452 Nov 24 23:13 cmdline-tools

## Existing tool versions
git: /usr/bin/git
gh: /data/data/com.termux/files/usr/bin/gh
flutter: /root/flutter/bin/flutter
dart: /root/flutter/bin/dart
java: /data/data/com.termux/files/usr/bin/java
node: /usr/bin/node
npm: /usr/bin/npm
firebase: /data/data/com.termux/files/usr/bin/firebase
sdkmanager: NOT FOUND
adb: NOT FOUND

## Package manager audit
