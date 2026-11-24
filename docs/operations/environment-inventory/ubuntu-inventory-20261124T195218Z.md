# Mawdda Ubuntu Environment Inventory

- Generated UTC: 20261124T195218Z
- Account: productionhome2022-hash
- Repository: productionhome2022-hash/mawda-platform
- Target branch: codex/mawda-full-platform-implementation
- Starting branch SHA: 925fd3606ff9534c7a580fecdd6cacdbf5dfbf73
- Scope: environment inventory; no software changes.

## 1. Operating system
```
Linux localhost 6.17.0-PRoot-Distro #1 SMP PREEMPT_DYNAMIC Fri, 10 Oct 2025 00:00:00 +0000 aarch64 GNU/Linux
PRETTY_NAME="Ubuntu 26.04.1 LTS"
NAME="Ubuntu"
VERSION_ID="26.04"
VERSION="26.04.1 LTS (Resolute Raccoon)"
VERSION_CODENAME=resolute
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
UBUNTU_CODENAME=resolute
LOGO=ubuntu-logo
```

## 2. Storage and memory
```
Filesystem                   Size  Used Avail Use% Mounted on
/dev/block/dm-60             225G  105G  120G  47% /
/dev                         3.7G  3.4M  3.7G   1% /dev
/linkerconfig/ld.config.txt  3.7G  976K  3.7G   1% /linkerconfig/ld.config.txt
/vendor                      1.5G  1.5G     0 100% /vendor
/system_ext                  2.8G  2.8G     0 100% /system_ext
/odm                         793M  793M     0 100% /odm
/product                     4.5G  4.5G     0 100% /product
/apex                        3.7G   44K  3.7G   1% /apex
/storage/emulated/0          225G  105G  120G  47% /sdcard
               total        used        free      shared  buff/cache   available
Mem:           7.4Gi       5.4Gi       135Mi        22Mi       2.3Gi       2.0Gi
Swap:          7.4Gi       2.7Gi       4.7Gi
```

## 3. Package managers
```
/usr/bin/apt
/usr/bin/apt-get
/usr/bin/dpkg
/usr/bin/pip
/usr/bin/pip3
/usr/bin/npm
/data/data/com.termux/files/usr/bin/cargo
/data/data/com.termux/files/usr/bin/go
```

## 4. Development tools

| Tool | Availability | Version / details |
|---|---|---|
| git | Available | git version 2.53.0 |
| gh | Available | gh version 2.95.0 https://github.com/cli/cli/releases/tag/v2.95.0 |
| git-lfs | Not found in PATH | - |
| git-filter-repo | Not found in PATH | - |
| curl | Available | curl 8.18.0 (aarch64-unknown-linux-gnu) libcurl/8.18.0 OpenSSL/3.5.5 zlib/1.3.1 brotli/1.2.0 zstd/1.5.7 libidn2/2.3.8 libpsl/0.21.2 libssh2/1.11.1 nghttp2/1.68.0 librtmp/2.3 mit-krb5/1.22.1 OpenLDAP/2.6.10 Release-Date:  |
| wget | Available | GNU Wget 1.25.0 built on linux-gnu. |
| ssh | Available | unknown option -- -
 usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface] [-b bind_address] |
| ssh-keygen | Available | unknown option -- ?
 |
| rsync | Not found in PATH | - |
| jq | Available | jq-1.8.1 |
| yq | Not found in PATH | - |
| rg | Available | ripgrep 15.1.0 |
| fd | Available | fd 10.4.2 |
| fzf | Not found in PATH | - |
| tree | Available | tree v2.3.2 © 1996 - 2026 by Steve Baker, Thomas Moore, Francesc Rocher, Florian Sesser, Kyosuke Tokoro |
| make | Available | GNU Make 4.4.1 Built for aarch64-unknown-linux-gnu |
| cmake | Available | cmake version 4.3.4 |
| ninja | Available | 1.13.2 |
| gcc | Available | gcc (Ubuntu 15.2.0-16ubuntu1) 15.2.0 Copyright (C) 2025 Free Software Foundation, Inc. |
| g++ | Available | g++ (Ubuntu 15.2.0-16ubuntu1) 15.2.0 Copyright (C) 2025 Free Software Foundation, Inc. |
| clang | Available | clang version 21.1.8 Target: aarch64-unknown-linux-android30 |
| python | Available | Python 3.13.13 |
| python3 | Available | Python 3.14.4 |
| pip | Available | pip 25.1.1 from /usr/lib/python3/dist-packages/pip (python 3.14) |
| pip3 | Available | pip 25.1.1 from /usr/lib/python3/dist-packages/pip (python 3.14) |
| node | Available | v22.22.1 |
| npm | Available | 9.2.0 |
| pnpm | Not found in PATH | - |
| yarn | Not found in PATH | - |
| java | Available | openjdk version "21.0.11" 2026-04-21 OpenJDK Runtime Environment (build 21.0.11) |
| javac | Available | javac 21.0.11 |
| gradle | Not found in PATH | - |
| dart | Available |    Woah! You appear to be trying to run flutter as root.    We strongly recommend running the flutter tool without superuser privileges.   / 📎 Dart SDK version: 3.13.7 (stable) (Thu Oct 22 14:28:57 2026 -0700) on "lin |
| flutter | Available |    Woah! You appear to be trying to run flutter as root.    We strongly recommend running the flutter tool without superuser privileges.   / |
| ruby | Not found in PATH | - |
| go | Available | Go is a tool for managing Go source code. |
| rustc | Available | rustc 1.96.0 (ac68faa20 2026-05-25) (built from a source tarball) |
| cargo | Available | cargo 1.96.0 (30a34c682 2026-05-25) (built from a source tarball) |
| docker | Not found in PATH | - |
| podman | Not found in PATH | - |
| shellcheck | Available | ShellCheck - shell script analysis tool version: 0.11.0 |
| shfmt | Not found in PATH | - |
| firebase | Available | 15.35.0 |
| adb | Not found in PATH | - |
| fastboot | Not found in PATH | - |
| sqlite3 | Available | 3.53.2 2026-06-03 19:12:13 d6e03d8c777cfa2d35e3b60d8ec3e0187f3e9f99d8e2ee9cac695fd6fcdfalt1 (64-bit) |
| psql | Not found in PATH | - |
| mysql | Not found in PATH | - |
| redis-cli | Not found in PATH | - |
| php | Not found in PATH | - |
| composer | Not found in PATH | - |

## 5. Installed Ubuntu packages
```
adduser	3.153ubuntu1	installed
alacritty	0.16.1-2ubuntu1	installed
apt	3.2.1ubuntu0.1	installed
apt-transport-https	3.2.1ubuntu0.1	installed
base-files	14ubuntu6.3	installed
base-passwd	3.6.8	installed
bash	5.3-2ubuntu1	installed
bash-completion	1:2.16.0-8build1	installed
binutils	2.46-3ubuntu2	installed
binutils-aarch64-linux-gnu	2.46-3ubuntu2	installed
binutils-common:arm64	2.46-3ubuntu2	installed
bsdutils	1:2.41.3-3ubuntu2.2	installed
bubblewrap	0.11.1-1ubuntu0.3	installed
build-essential	12.12ubuntu2.26.04.2	installed
bzip2	1.0.8-6ubuntu0.1	installed
ca-certificates	20260816ubuntu0.26.04.2	installed
coreutils	9.5-1ubuntu2+0.0.0~ubuntu25	installed
coreutils-from-uutils	0.0.0~ubuntu25	installed
cpp	4:15.2.0-5ubuntu1	installed
cpp-15	15.2.0-16ubuntu1	installed
cpp-15-aarch64-linux-gnu	15.2.0-16ubuntu1	installed
cpp-aarch64-linux-gnu	4:15.2.0-5ubuntu1	installed
curl	8.18.0-1ubuntu2.8	installed
dash	0.5.12-12ubuntu3	installed
dbus	1.16.2-2ubuntu4	installed
dbus-bin	1.16.2-2ubuntu4	installed
dbus-daemon	1.16.2-2ubuntu4	installed
dbus-session-bus-common	1.16.2-2ubuntu4	installed
dbus-system-bus-common	1.16.2-2ubuntu4	installed
debconf	1.5.92	installed
debianutils	5.23.2build1	installed
diffutils	1:3.12-1ubuntu0.1	installed
dirmngr	2.4.8-4ubuntu3.1	installed
dpkg	1.23.7ubuntu1	installed
dpkg-dev	1.23.7ubuntu1	installed
e2fsprogs	1.47.2-3ubuntu4	installed
eslint	6.4.0~dfsg+~6.1.9-12	installed
fakeroot	1.37.2-1	installed
findutils	4.10.0-3build2	installed
fontconfig	2.17.1-3ubuntu1	installed
fontconfig-config	2.17.1-3ubuntu1	installed
fonts-dejavu-core	2.37-8build1	installed
fonts-dejavu-mono	2.37-8build1	installed
g++	4:15.2.0-5ubuntu1	installed
g++-15	15.2.0-16ubuntu1	installed
g++-15-aarch64-linux-gnu	15.2.0-16ubuntu1	installed
g++-aarch64-linux-gnu	4:15.2.0-5ubuntu1	installed
gcc	4:15.2.0-5ubuntu1	installed
gcc-15	15.2.0-16ubuntu1	installed
gcc-15-aarch64-linux-gnu	15.2.0-16ubuntu1	installed
gcc-15-base:arm64	15.2.0-16ubuntu1	installed
gcc-16-base:arm64	16-20260322-1ubuntu1	installed
gcc-aarch64-linux-gnu	4:15.2.0-5ubuntu1	installed
git	1:2.53.0-1ubuntu1.1	installed
git-man	1:2.53.0-1ubuntu1.1	installed
glycin-loaders	2.1.5+ds-0ubuntu0.2	installed
glycin-thumbnailers	2.1.5+ds-0ubuntu0.2	installed
gnu-coreutils	9.7-3ubuntu2.1	installed
gnupg	2.4.8-4ubuntu3.1	installed
gnupg-l10n	2.4.8-4ubuntu3.1	installed
gnupg-utils	2.4.8-4ubuntu3.1	installed
google-cloud-cli	593.0.0-0	installed
gpg	2.4.8-4ubuntu3.1	installed
gpg-agent	2.4.8-4ubuntu3.1	installed
gpg-wks-client	2.4.8-4ubuntu3.1	installed
gpgconf	2.4.8-4ubuntu3.1	installed
gpgsm	2.4.8-4ubuntu3.1	installed
gpgv	2.4.8-4ubuntu3.1	installed
grep	3.12-1	installed
gyp	0.16.2-2build1	installed
gzip	1.14-1~exp2ubuntu1.1	installed
handlebars	3:4.7.7+~4.1.0-1	installed
hostname	3.25build1	installed
init-system-helpers	1.69	installed
javascript-common	12+nmu1build1	installed
jq	1.8.1-4ubuntu2	installed
krb5-locales	1.22.1-2ubuntu4.1	installed
less	668-1build1	installed
libabsl20260107:arm64	20260107.0-4	installed
libacl1:arm64	2.3.2-2	installed
libada-url0-3:arm64	3.4.3-1	installed
libalgorithm-diff-perl	1.201-1	installed
libalgorithm-diff-xs-perl	0.04-9	installed
libalgorithm-merge-perl	0.08-5	installed
libaom3:arm64	3.13.1-2ubuntu0.1	installed
libapparmor1:arm64	5.0.2-0ubuntu1~26.04.1	installed
libapt-pkg7.0:arm64	3.2.1ubuntu0.1	installed
libasan8:arm64	16-20260322-1ubuntu1	installed
libassuan9:arm64	3.0.2-2build1	installed
libatomic1:arm64	16-20260322-1ubuntu1	installed
libattr1:arm64	1:2.5.2-4ubuntu0.1	installed
libaudit-common	1:4.1.2-1ubuntu0.1	installed
libaudit1:arm64	1:4.1.2-1ubuntu0.1	installed
libauthen-sasl-perl	2.2000-1ubuntu0.1	installed
libbinutils:arm64	2.46-3ubuntu2	installed
libblkid1:arm64	2.41.3-3ubuntu2.2	installed
libbrotli1:arm64	1.2.0-3ubuntu0.1	installed
libbsd0:arm64	0.12.2-2build2	installed
libbz2-1.0:arm64	1.0.8-6ubuntu0.1	installed
libc-bin	2.43-2ubuntu2.4	triggers-pending
libc-dev-bin	2.43-2ubuntu2.4	installed
libc-gconv-modules-extra:arm64	2.43-2ubuntu2.4	installed
libc6-dev:arm64	2.43-2ubuntu2.4	installed
libc6:arm64	2.43-2ubuntu2.4	installed
libcairo-gobject2:arm64	1.18.4-3	installed
libcairo2:arm64	1.18.4-3	installed
libcap-ng0:arm64	0.8.5-4build5	installed
libcap2:arm64	1:2.75-10ubuntu2	installed
libcares2:arm64	1.34.6-1ubuntu0.2	installed
libcbor0.10:arm64	0.10.2-2ubuntu3	installed
libcc1-0:arm64	16-20260322-1ubuntu1	installed
libclone-perl:arm64	0.47-1	installed
libcom-err2:arm64	1.47.2-3ubuntu4	installed
libcrypt-dev:arm64	1:4.5.1-1	installed
libcrypt-urandom-perl	0.55-1	installed
libcrypt1:arm64	1:4.5.1-1	installed
libctf-nobfd0:arm64	2.46-3ubuntu2	installed
libctf0:arm64	2.46-3ubuntu2	installed
libcurl3t64-gnutls:arm64	8.18.0-1ubuntu2.8	installed
libcurl4t64:arm64	8.18.0-1ubuntu2.8	installed
libdata-dump-perl	1.25-1	installed
libdatrie1:arm64	0.2.14-1	installed
libdb5.3t64:arm64	5.3.28+dfsg2-10ubuntu1	installed
libdbus-1-3:arm64	1.16.2-2ubuntu4	installed
libdebconfclient0:arm64	0.280ubuntu1	installed
libdisplay-info3:arm64	0.3.0-1	installed
libdpkg-perl	1.23.7ubuntu1	installed
libdrm-amdgpu1:arm64	2.4.131-1	installed
libdrm-common	2.4.131-1	installed
libdrm2:arm64	2.4.131-1	installed
libedit2:arm64	3.1-20251016-1	installed
libelf1t64:arm64	0.194-4	installed
libencode-locale-perl	1.05-3	installed
liberror-perl	0.17030-1	installed
libexpat1-dev:arm64	2.7.4-1ubuntu0.2	installed
libexpat1:arm64	2.7.4-1ubuntu0.2	installed
libext2fs2t64:arm64	1.47.2-3ubuntu4	installed
libfakeroot:arm64	1.37.2-1	installed
libffi8:arm64	3.5.2-4	installed
libfido2-1:arm64	1.16.0-2build1	installed
libfile-basedir-perl	0.09-2	installed
libfile-desktopentry-perl	0.23-1	installed
libfile-fcntllock-perl	0.22-4ubuntu6	installed
libfile-listing-perl	6.16-1	installed
libfile-mimeinfo-perl	0.36-2	installed
libfont-afm-perl	1.20-4	installed
libfontconfig1:arm64	2.17.1-3ubuntu1	installed
libfreetype6:arm64	2.14.2+dfsg-1ubuntu0.2	installed
libfribidi0:arm64	1.0.16-5	installed
libgbm1:arm64	26.0.8-1ubuntu0.3	installed
libgcc-15-dev:arm64	15.2.0-16ubuntu1	installed
libgcc-s1:arm64	16-20260322-1ubuntu1	installed
libgcrypt20:arm64	1.12.0-2ubuntu1.1	installed
libgdbm-compat4t64:arm64	1.26-1build1	installed
libgdbm6t64:arm64	1.26-1build1	installed
libgdk-pixbuf-2.0-0:arm64	2.44.5+dfsg-4ubuntu1	installed
libgdk-pixbuf2.0-common	2.44.5+dfsg-4ubuntu1	installed
libgl1-mesa-dri:arm64	26.0.8-1ubuntu0.3	installed
libgl1:arm64	1.7.0-3	installed
libglib2.0-0t64:arm64	2.88.0-1ubuntu0.1	installed
libglib2.0-data	2.88.0-1ubuntu0.1	installed
libglu1-mesa:arm64	9.0.2-1.1build2	installed
libglvnd0:arm64	1.7.0-3	installed
libglx-mesa0:arm64	26.0.8-1ubuntu0.3	installed
libglx0:arm64	1.7.0-3	installed
libglycin-2-0:arm64	2.1.5+ds-0ubuntu0.2	installed
libgmp10:arm64	2:6.3.0+dfsg-5ubuntu2	installed
libgnutls30t64:arm64	3.8.12-2ubuntu1.1	installed
libgomp1:arm64	16-20260322-1ubuntu1	installed
libgpg-error0:arm64	1.58-2	installed
libgprofng0:arm64	2.46-3ubuntu2	installed
libgraphite2-3:arm64	1.3.14-11ubuntu1.1	installed
libgssapi-krb5-2:arm64	1.22.1-2ubuntu4.1	installed
libharfbuzz0b:arm64	12.3.2-2	installed
libheif-plugin-aomdec:arm64	1.21.2-3ubuntu0.7	installed
libheif-plugin-aomenc:arm64	1.21.2-3ubuntu0.7	installed
libheif1:arm64	1.21.2-3ubuntu0.7	installed
libhogweed6t64:arm64	3.10.2-1	installed
libhtml-form-perl	6.13-1build1	installed
libhtml-format-perl	2.16-2	installed
libhtml-parser-perl:arm64	3.83-1ubuntu0.1	installed
libhtml-tagset-perl	3.24-1	installed
libhtml-tree-perl	5.07-3	installed
libhttp-cookies-perl	6.11-1	installed
libhttp-daemon-perl	6.16-1ubuntu0.26.04.1	installed
libhttp-date-perl	6.06-1ubuntu0.26.04.1	installed
libhttp-message-perl	7.01-1ubuntu1	installed
libhttp-negotiate-perl	6.01-2	installed
libhwasan0:arm64	16-20260322-1ubuntu1	installed
libhwy1t64:arm64	1.3.0-2	installed
libice6:arm64	2:1.1.1-1build1	installed
libicu78:arm64	78.2-2ubuntu1	installed
libidn2-0:arm64	2.3.8-4build1	installed
libio-html-perl	1.004-3	installed
libio-socket-ssl-perl	2.098-1	installed
libio-stringy-perl	2.113-2	installed
libipc-system-simple-perl	1.30-2	installed
libisl23:arm64	0.27-1build1	installed
libitm1:arm64	16-20260322-1ubuntu1	installed
libjansson4:arm64	2.14-2build4	installed
libjq1:arm64	1.8.1-4ubuntu2	installed
libjs-events	3.3.0+~3.0.3-1	installed
libjs-inherits	2.0.4-6	installed
libjs-prettify	2015.12.04+dfsg-3	installed
libjs-regenerate	1.4.2-3	installed
libjs-source-map	0.7.0++dfsg2+really.0.6.1-15	installed
libjs-sphinxdoc	8.2.3-12	installed
libjs-sprintf-js	1.1.3+ds1+~1.1.4-2	installed
libjs-util	0.12.5+~1.0.10-2	installed
libjxl0.11:arm64	0.11.1-6ubuntu4.2	installed
libk5crypto3:arm64	1.22.1-2ubuntu4.1	installed
libkeyutils1:arm64	1.6.3-6ubuntu3	installed
libkrb5-3:arm64	1.22.1-2ubuntu4.1	installed
libkrb5support0:arm64	1.22.1-2ubuntu4.1	installed
libksba8:arm64	1.6.7-2build1	installed
liblcms2-2:arm64	2.17-1ubuntu0.2	installed
libldap-common	2.6.10+dfsg-1ubuntu5	installed
libldap2:arm64	2.6.10+dfsg-1ubuntu5	installed
libllhttp9.3	9.3.3~really9.3.0+~cs12.11.8-3build1	installed
libllvm21:arm64	1:21.1.8-6ubuntu1	installed
liblocale-gettext-perl	1.07-8	installed
liblsan0:arm64	16-20260322-1ubuntu1	installed
liblsof0	4.99.4+dfsg-2build2	installed
liblwp-mediatypes-perl	6.04-2	installed
liblwp-protocol-https-perl	6.14-1	installed
liblz4-1:arm64	1.10.0-8	installed
liblzma5:arm64	5.8.3-1ubuntu0.1	installed
libmailtools-perl	2.22-1	installed
libmd0:arm64	1.1.0-2build4	installed
libmount1:arm64	2.41.3-3ubuntu2.2	installed
libmpc3:arm64	1.3.1-3	installed
libmpfr6:arm64	4.2.2-3	installed
libncursesw6:arm64	6.6+20251231-1	installed
libnet-dbus-perl	1.2.0-2build4	installed
libnet-http-perl	6.24-1build1	installed
libnet-smtp-ssl-perl	1.04-2	installed
libnet-ssleay-perl:arm64	1.94-3	installed
libnettle8t64:arm64	3.10.2-1	installed
libnghttp2-14:arm64	1.68.0-2ubuntu0.2	installed
libnode-dev	22.22.1+dfsg+~cs22.19.15-1ubuntu1	installed
libnode127:arm64	22.22.1+dfsg+~cs22.19.15-1ubuntu1	installed
libnotify-bin	0.8.8-1	installed
libnotify4:arm64	0.8.8-1	installed
libnpth0t64:arm64	1.8-3build1	installed
libonig5:arm64	6.9.10-1build1	installed
libopengl0:arm64	1.7.0-3	installed
libp11-kit0:arm64	0.26.2-2	installed
libpam-modules-bin	1.7.0-5ubuntu3.2	installed
libpam-modules:arm64	1.7.0-5ubuntu3.2	installed
libpam-runtime	1.7.0-5ubuntu3.2	installed
libpam0g:arm64	1.7.0-5ubuntu3.2	installed
libpango-1.0-0:arm64	1.57.0-1	installed
libpangocairo-1.0-0:arm64	1.57.0-1	installed
libpangoft2-1.0-0:arm64	1.57.0-1	installed
libpcre2-8-0:arm64	10.46-1ubuntu0.1	installed
libperl5.40:arm64	5.40.1-7ubuntu0.4	installed
libpixman-1-0:arm64	0.46.4-1	installed
libpng16-16t64:arm64	1.6.57-1ubuntu0.1	installed
libproc2-0:arm64	2:4.0.4-9ubuntu1	installed
libpsl5t64:arm64	0.21.2-1.1build2	installed
libpython3-dev:arm64	3.14.3-0ubuntu2	installed
libpython3-stdlib:arm64	3.14.3-0ubuntu2	installed
libpython3.14-dev:arm64	3.14.4-1ubuntu0.2	installed
libpython3.14-minimal:arm64	3.14.4-1ubuntu0.2	installed
libpython3.14-stdlib:arm64	3.14.4-1ubuntu0.2	installed
libpython3.14:arm64	3.14.4-1ubuntu0.2	installed
libre2-11:arm64	20250805-1build3	installed
libreadline8t64:arm64	8.3-4	installed
librsvg2-2:arm64	2.61.3+dfsg-3ubuntu0.1	installed
librsvg2-common:arm64	2.61.3+dfsg-3ubuntu0.1	installed
librtmp1:arm64	2.4+20151223.gitfa8646d.1-3	installed
libsasl2-2:arm64	2.1.28+dfsg1-9ubuntu3	installed
libsasl2-modules-db:arm64	2.1.28+dfsg1-9ubuntu3	installed
libsasl2-modules:arm64	2.1.28+dfsg1-9ubuntu3	installed
libseccomp2:arm64	2.6.0-2ubuntu5	installed
libselinux1:arm64	3.9-4build1	installed
libsemanage-common	3.9-1build1	installed
libsemanage2:arm64	3.9-1build1	installed
libsensors-config	1:3.6.2-2build1	installed
libsensors5:arm64	1:3.6.2-2build1	installed
libsepol2:arm64	3.9-2	installed
libsframe3:arm64	2.46-3ubuntu2	installed
libsharpyuv0:arm64	1.5.0-0.1build1	installed
libsimdjson29:arm64	4.2.4-1	installed
libsimdutf31:arm64	8.0.0-1	installed
libsm6:arm64	2:1.2.6-1build1	installed
libsmartcols1:arm64	2.41.3-3ubuntu2.2	installed
libsqlite3-0:arm64	3.46.1-9ubuntu0.3	installed
libss2:arm64	1.47.2-3ubuntu4	installed
libssh2-1t64:arm64	1.11.1-1ubuntu0.26.04.4	installed
libssl-dev:arm64	3.5.5-1ubuntu3.7	installed
libssl3t64:arm64	3.5.5-1ubuntu3.7	installed
libstdc++-15-dev:arm64	15.2.0-16ubuntu1	installed
libstdc++6:arm64	16-20260322-1ubuntu1	installed
libsystemd0:arm64	259.9-0ubuntu0.1	installed
libtasn1-6:arm64	4.21.0-2	installed
libtext-iconv-perl:arm64	1.7-8.1	installed
libthai-data	0.1.30-1	installed
libthai0:arm64	0.1.30-1	installed
libtie-ixhash-perl	1.23-4	installed
libtimedate-perl	2.3300-2	installed
libtinfo6:arm64	6.6+20251231-1	installed
libtirpc-common	1.3.7-0.1	installed
libtirpc3t64:arm64	1.3.7-0.1	installed
libtry-tiny-perl	0.32-1	installed
libtsan2:arm64	16-20260322-1ubuntu1	installed
libubsan1:arm64	16-20260322-1ubuntu1	installed
libudev1:arm64	259.9-0ubuntu0.1	installed
libunistring5:arm64	1.3-2build1	installed
liburi-perl	5.34-2build1	installed
libuuid1:arm64	2.41.3-3ubuntu2.2	installed
libuv1-dev:arm64	1.51.0-2ubuntu1	installed
libuv1t64:arm64	1.51.0-2ubuntu1	installed
libvulkan1:arm64	1.4.341.0-1	installed
libwayland-client0:arm64	1.24.0-2	installed
libwayland-egl1:arm64	1.24.0-2	installed
libwww-perl	6.81-1ubuntu0.1	installed
libwww-robotrules-perl	6.02-1build1	installed
libx11-6:arm64	2:1.8.13-1ubuntu0.1	installed
libx11-data	2:1.8.13-1ubuntu0.1	installed
libx11-protocol-perl	0.56-9	installed
libx11-xcb1:arm64	2:1.8.13-1ubuntu0.1	installed
libxau6:arm64	1:1.0.11-1build2	installed
libxaw7:arm64	2:1.0.16-1build1	installed
libxcb-dri3-0:arm64	1.17.0-2ubuntu1	installed
libxcb-glx0:arm64	1.17.0-2ubuntu1	installed
libxcb-present0:arm64	1.17.0-2ubuntu1	installed
libxcb-randr0:arm64	1.17.0-2ubuntu1	installed
libxcb-render0:arm64	1.17.0-2ubuntu1	installed
libxcb-shape0:arm64	1.17.0-2ubuntu1	installed
libxcb-shm0:arm64	1.17.0-2ubuntu1	installed
libxcb-sync1:arm64	1.17.0-2ubuntu1	installed
libxcb-xfixes0:arm64	1.17.0-2ubuntu1	installed
libxcb-xkb1:arm64	1.17.0-2ubuntu1	installed
libxcb1:arm64	1.17.0-2ubuntu1	installed
libxcomposite1:arm64	1:0.4.6-1build1	installed
libxcursor1:arm64	1:1.2.3-1build1	installed
libxdmcp6:arm64	1:1.1.5-2	installed
libxext6:arm64	2:1.3.4-1build3	installed
libxfixes3:arm64	1:6.0.0-2build2	installed
libxft2:arm64	2.3.6-1build2	installed
libxi6:arm64	2:1.8.2-2	installed
libxinerama1:arm64	2:1.1.4-3build2	installed
libxkbcommon-x11-0:arm64	1.13.1-1	installed
libxkbcommon0:arm64	1.13.1-1	installed
libxkbfile1:arm64	1:1.1.0-1build5	installed
libxml-parser-perl	2.47-1ubuntu1	installed
libxml-twig-perl	1:3.54-1build1	installed
libxml-xpathengine-perl	0.14-2	installed
libxml2-16:arm64	2.15.2+dfsg-0.1ubuntu0.3	installed
libxmu6:arm64	2:1.1.3-4	installed
libxmuu1:arm64	2:1.1.3-4	installed
libxpm4:arm64	1:3.5.17-1ubuntu0.26.04.2	installed
libxrandr2:arm64	2:1.5.4-1build1	installed
libxrender1:arm64	1:0.9.12-1build1	installed
libxshmfence1:arm64	1.3.3-1build1	installed
libxt6t64:arm64	1:1.2.1-1.3build1	installed
libxtst6:arm64	2:1.2.5-1ubuntu0.1	installed
libxv1:arm64	2:1.0.13-1	installed
libxxf86dga1:arm64	2:1.1.5-1build2	installed
libxxf86vm1:arm64	1:1.1.4-2	installed
libxxhash0:arm64	0.8.3-2build1	installed
libzstd1:arm64	1.5.7+dfsg-3	installed
linux-libc-dev:arm64	7.0.0-43.43	installed
login	1:4.16.0-2+really2.41.3-3ubuntu2.2	installed
login.defs	1:4.17.4-2ubuntu3	installed
logsave	1.47.2-3ubuntu4	installed
lsb-release	12.1-2build1	installed
lsof	4.99.4+dfsg-2build2	installed
lto-disabled-list	79	installed
luit	2.0.20250912-1	installed
make	4.4.1-3	installed
manpages	6.17-1	installed
manpages-dev	6.17-1	installed
mawk	1.3.4.20260129-1	installed
media-types	14.0.0build1	installed
mesa-libgallium:arm64	26.0.8-1ubuntu0.3	installed
mesa-vulkan-drivers:arm64	26.0.8-1ubuntu0.3	installed
mount	2.41.3-3ubuntu2.2	installed
nano	8.7.1-1ubuntu0.1	installed
ncurses-base	6.6+20251231-1	installed
ncurses-bin	6.6+20251231-1	installed
ncurses-term	6.6+20251231-1	installed
net-tools	2.10-2ubuntu1	installed
netbase	6.5build1	installed
netcat-openbsd	1.234-1	installed
node-abbrev	1.1.1+~1.1.2-1	installed
node-acorn	8.16.0+ds+~cs25.18.7-4	installed
node-agent-base	7.1.4~0~2025070717+~cs15.2.7-1build1	installed
node-ajv	8.17.1~ds+~3.0.1+~3.1.0-4build1	installed
node-ajv-keywords	5.1.0-4	installed
node-ampproject-remapping	2.2.0+~cs5.15.37-1	installed
node-ansi-escapes	5.0.0+really.4.3.1-1	installed
node-ansi-regex	6.2.2+~cs4.0.2-1build3	installed
node-ansi-styles	6.2.3-1	installed
node-anymatch	3.1.3+~cs8.0.6-1	installed
node-aproba	2.1.0-1	installed
node-archy	1.0.0-7	installed
node-are-we-there-yet	4.0.2+~1.1.2-1	installed
node-argparse	2.0.1-3	installed
node-arrify	2.0.1-3	installed
node-assert	2.0.0+~cs3.9.8-2	installed
node-async	3.2.6+dfsg-3	installed
node-async-each	1.0.3-3	installed
node-auto-bind	4.0.0-2	installed
node-babel-helper-define-polyfill-provider	0.3.3~0~20220913+ds1-1	installed
node-babel-plugin-add-module-exports	1.0.4+dfsg1~cs5.8.0-4	installed
node-babel-plugin-lodash	3.3.4+~cs2.0.1-8build1	installed
node-babel-plugin-polyfill-corejs2	0.3.3~0~20220913+ds1-1	installed
node-babel-plugin-polyfill-corejs3	0.6.0~0~20220913+ds1-1	installed
node-babel-plugin-polyfill-regenerator	0.4.1~0~20220913+ds1-1	installed
node-babel7	7.20.15+ds1+~cs214.269.168-16	installed
node-babel7-runtime	7.20.15+ds1+~cs214.269.168-16	installed
node-balanced-match	2.0.0-1	installed
node-base	3.0.0-3	installed
node-base64-js	1.5.1+dfsg+~1.3.0-3	installed
node-binary-extensions	2.2.0-2	installed
node-brace-expansion	2.0.1+~1.1.0-2	installed
node-braces	3.0.3+~3.0.5-1	installed
node-browserslist	4.28.1+~cs8.14.48-1	installed
node-builtins	5.0.1-1	installed
node-cacache	17.0.3+ds1+~cs8.2.7-3	installed
node-cache-base	4.0.2-2	installed
node-camelcase	7.0.0-4	installed
node-caniuse-lite	1.0.30001780+dfsg+~1.0.5-1	installed
node-chalk	5.6.2+dfsg-5build3	installed
node-chokidar	3.6.0-5	installed
node-chownr	3.0.0-2	installed
node-chrome-trace-event	1.0.3-2	installed
node-ci-info	4.4.0+~cs8.2.0-3build3	installed
node-cjs-module-lexer	1.2.3+dfsg-1	installed
node-cli-boxes	3.0.0-1build2	installed
node-cli-cursor	4.0.0-4	installed
node-cli-table	0.3.11+~cs0.13.4-3	installed
node-cli-truncate	2.1.0-5	installed
node-cliui	7.0.4+repack+1+~cs1.4.2-2	installed
node-clone	2.1.2+~2.1.4-1	installed
node-clone-deep	4.0.1+~cs7.0.2-1	installed
node-collection-visit	1.0.0-4	installed
node-color-convert	2.0.1+~cs2.0.0-2	installed
node-color-name	1.1.4+~1.1.1-2	installed
node-colors	1.4.0-4build1	installed
node-columnify	1.6.0+~1.5.4-1	installed
node-commander	14.0.3-7	installed
node-commondir	1.0.1+~1.0.0-1	installed
node-component-emitter	1.3.0+~1.2.11-2	installed
node-concat-stream	2.0.0+~2.0.3-1	installed
node-console-control-strings	1.1.0-3	installed
node-convert-source-map	2.0.0+~2.0.3-2	installed
node-copy-concurrently	1.0.5-11	installed
node-core-js	3.33.2-1build2	installed
node-core-js-compat	3.33.2-1build2	installed
node-core-js-pure	3.33.2-1build2	installed
node-core-util-is	1.0.3-1	installed
node-corepack	0.24.0-5build1	installed
node-coveralls	3.1.1-4	installed
node-css-loader	6.8.1+~cs14.0.17-2	installed
node-css-selector-tokenizer	0.8.0+~cs4.8.3-1	installed
node-data-uri-to-buffer	6.0.2~0~2025070717+~cs15.2.7-1build1	installed
node-debbundle-es-to-primitive	1.2.1+~cs9.7.25-2	installed
node-debug	4.4.3+~4.1.13-1	installed
node-decamelize	4.0.0-2	installed
node-decompress-response	6.0.0-3	installed
node-deep-equal	2.2.3+~cs43.15.94-1	installed
node-deep-is	0.1.4-1	installed
node-defaults	1.0.4+~1.0.3-1	installed
node-define-properties	1.2.1+~cs2.2.3-1	installed
node-define-property	2.0.2+really+2.0.2-3	installed
node-defined	1.0.1+~1.0.2-1	installed
node-del	7.1.0-2	installed
node-delegates	1.0.0-3	installed
node-depd	2.0.0-2	installed
node-diff	5.0.0~dfsg+~5.0.1-6	installed
node-doctrine	3.0.0-4	installed
node-electron-to-chromium	1.5.322-1	installed
node-encoding	0.1.13-2	installed
node-enhanced-resolve	5.15.0-1	installed
node-envinfo	7.11.0+~cs14.3.0-7build1	installed
node-err-code	2.0.3+dfsg-3	installed
node-errno	1.0.0-3	installed
node-error-ex	1.3.4-1	installed
node-es-abstract	1.20.4+~cs26.27.47-2	installed
node-es-module-lexer	1.1.0+dfsg-3	installed
node-es6-error	4.1.1-5	installed
node-escape-string-regexp	4.0.0-2	installed
node-escodegen	2.1.0+dfsg+~0.0.10-2	installed
node-eslint-scope	7.1.1+~3.7.4-1	installed
node-eslint-utils	3.0.0-4	installed
node-eslint-visitor-keys	3.3.0+~1.0.0-2	installed
node-espree	9.4.1~dfsg-2	installed
node-esprima	4.0.1+ds+~4.0.3-2	installed
node-esquery	1.4.2~ds-2	installed
node-esrecurse	4.3.0-2	installed
node-estraverse	5.3.0+ds+~5.1.1-1	installed
node-esutils	2.0.3+~2.0.2-2	installed
node-events	3.3.0+~3.0.3-1	installed
node-execa	8.0.1+dfsg1+~cs12.0.0-1build2	installed
node-fancy-log	1.3.3+~cs1.3.1-2	installed
node-fast-deep-equal	3.1.3-3	installed
node-fast-levenshtein	2.0.6+ds-3	installed
node-fetch	3.3.2+~cs11.4.11-3	installed
node-file-entry-cache	6.0.1+~3.0.4+~2.0.0+~1.0.0+~2.0.1-5	installed
node-fill-range	7.1.1+~7.0.3-1	installed
node-find-cache-dir	3.3.2+~3.2.1-1	installed
node-find-up	6.3.0-8	installed
node-flat-cache	3.0.4~6.0.1+~3.0.4+~2.0.0+~1.0.0+~2.0.1-5	installed
node-flatted	3.4.2~ds-1	installed
node-for-in	1.0.2-4	installed
node-for-own	1.0.0-3	installed
node-foreground-child	4.0.3-1	installed
node-fs-readdir-recursive	1.1.0+~1.1.3-1	installed
node-fs-write-stream-atomic	1.0.10-6	installed
node-function-bind	1.1.2+~cs2.1.14-2	installed
node-functional-red-black-tree	1.0.1+20181105-8	installed
node-gauge	4.0.4-2	installed
node-get-caller-file	2.0.5+~cs1.1.1-4	installed
node-get-stream	8.0.1-11	installed
node-get-value	1:3.0.1-4	installed
node-glob	10.3.6+~cs0.4.15-8build1	installed
node-glob-parent	6.0.2+~5.1.3-1	installed
node-globals	13.23.0-1	installed
node-globby	13.1.3+~cs16.25.40-4	installed
node-got	11.8.5+~cs58.13.36-6	installed
node-graceful-fs	4.2.11-1	installed
node-growl	1.10.5-4	installed
node-gyp	12.1.0+~6.1.0-3	installed
node-has-flag	5.0.1-1	installed
node-has-unicode	2.0.1-5	installed
node-has-value	2.0.2-4	installed
node-has-values	2.0.1-4	installed
node-hosted-git-info	9.0.2-1build1	installed
node-http-proxy-agent	7.0.2~0~2025070717+~cs15.2.7-1build1	installed
node-https-proxy-agent	7.0.6~0~2025070717+~cs15.2.7-1build1	installed
node-iconv-lite	0.6.3-3	installed
node-icss-utils	5.1.0+~5.1.2-1	installed
node-ieee754	1.2.1-3	installed
node-iferr	1.0.2+~1.0.4-1	installed
node-ignore	5.2.1-1	installed
node-imurmurhash	0.1.4+dfsg+~0.1.1-2	installed
node-indent-string	4.0.0-2	installed
node-inherits	2.0.4-6	installed
node-ini	3.0.1-2	installed
node-interpret	2.2.0-3	installed
node-ip	2.0.1+~1.1.3-3	installed
node-ip-regex	4.3.0+~4.1.1-1	installed
node-is-arrayish	0.3.4-1	installed
node-is-binary-path	2.1.0-5	installed
node-is-buffer	2.0.5-2	installed
node-is-descriptor	3.0.0-2	installed
node-is-extendable	1.0.1-3	installed
node-is-extglob	2.1.1-5	installed
node-is-glob	4.0.3-2	installed
node-is-number	7.0.0-4	installed
node-is-path-cwd	2.2.0-2	installed
node-is-path-inside	3.0.3-2	installed
node-is-plain-obj	3.0.0-2	installed
node-is-plain-object	5.0.0-8	installed
node-is-primitive	3.0.1-3	installed
node-is-stream	3.0.0-5	installed
node-is-windows	1.0.2+~cs1.0.0-1	installed
node-isarray	2.0.5-4	installed
node-isexe	2.0.0+~2.0.1-5	installed
node-isobject	4.0.0-2	installed
node-istanbul	0.4.5+repack10+~cs98.25.59-7	installed
node-jest-debbundle	29.6.2~ds3+~cs73.45.28-3build3	installed
node-jest-worker	29.6.2~ds3+~cs73.45.28-3build3	installed
node-js-tokens	8.0.0-2	installed
node-js-yaml	4.1.1+dfsg+~4.0.9-1	installed
node-jsesc	3.0.2+~3.0.1-1	installed
node-json-buffer	3.0.1+~3.0.2-1	installed
node-json-parse-better-errors	1.0.2+~cs3.3.1-3	installed
node-json-schema	0.4.0+~7.0.15-1	installed
node-json-schema-traverse	1.0.0-3	installed
node-json-stable-stringify	1.0.2+repack1+~cs1.0.34-2	installed
node-json5	2.2.3+dfsg-3	installed
node-jsonify	0.0.1-1	installed
node-jsonparse	1.3.1-10	installed
node-kind-of	6.0.3+dfsg-2	installed
node-lcov-parse	1.0.0+20170612git80d039574ed9-7	installed
node-levn	0.4.1+dfsg-2	installed
node-llhttp	9.3.3~really9.3.0+~cs12.11.8-3build1	installed
node-loader-runner	4.3.1-1	installed
node-locate-path	7.1.1-2	installed
node-lodash	4.17.23+dfsg-1	installed
node-lodash-packages	4.17.23+dfsg-1	installed
node-log-driver	1.2.7+git+20180219+bba1761737-8	installed
node-long	5.2.3-3	installed
node-lowercase-keys	2.0.0-2	installed
node-lru-cache	10.0.1-3	installed
node-make-dir	3.1.0-3	installed
node-map-visit	1.0.0-4	installed
node-memfs	3.4.12+~cs1.0.3-1	installed
node-memory-fs	0.5.0+~0.3.3-2	installed
node-merge-stream	2.0.0+~1.1.2-2	installed
node-micromatch	4.0.8+~4.0.10-2	installed
node-mime	4.1.0+dfsg+~cs8.97.10-6build5	installed
node-mime-types	3.0.2+~3.0.1-1	installed
node-mimic-fn	4.0.0-6	installed
node-mimic-response	3.1.0-9	installed
node-minimatch	9.0.3-6	installed
node-minimist	1.2.8+~cs5.3.5-1	installed
node-minipass	5.0.0+~cs13.3.24-1build1	installed
node-mixin-deep	2.0.1-3	installed
node-mkdirp	2.1.6+~cs5.2.1-5	installed
node-move-concurrently	1.0.1-7	installed
node-ms	2.1.3+~cs0.7.31-3	installed
node-mute-stream	0.0.8+~0.0.1-3	installed
node-n3	1.16.3+~1.2.3+~1.10.4-3	installed
node-negotiator	0.6.3+~0.6.1-1	installed
node-neo-async	2.6.2+~cs3.0.0-3	installed
node-nopt	9.0.0-1build1	installed
node-normalize-package-data	8.0.0+~2.4.4-3build1	installed
node-normalize-path	3.0.0+~3.0.2-1	installed
node-npm-bundled	2.0.1-2	installed
node-npm-package-arg	10.0.0+~3.0.0-2	installed
node-npm-run-path	5.1.0+~4.0.0-9	installed
node-npmlog	7.0.1+~4.1.4-1	installed
node-object-assign	4.1.1-7	installed
node-object-inspect	1.12.2+~cs1.8.1-1	installed
node-object-visit	1.0.1-5	installed
node-once	1.4.1-1	installed
node-opener	1.5.2+~1.4.3-1	installed
node-optimist	0.6.1+~0.0.30-2	installed
node-optionator	0.9.1+dfsg+~cs1.2.3-1	installed
node-osenv	0.1.5+~0.1.3-1	installed
node-p-cancelable	2.1.1-1	installed
node-p-limit	4.0.0+~cs4.0.0-5	installed
node-p-locate	6.0.0-14	installed
node-p-map	4.0.0+~3.1.0+~3.0.1-2	installed
node-parse-json	5.2.0+~cs5.1.7-2	installed
node-pascalcase	1.0.0-1	installed
node-path-dirname	1.0.2-2	installed
node-path-exists	5.0.0-9	installed
node-path-is-absolute	2.0.0-2	installed
node-path-is-inside	1.0.2+~1.0.3-1	installed
node-path-scurry	1.9.2-2	installed
node-path-type	4.0.0-3	installed
node-picocolors	1.1.1-1	installed
node-pify	5.0.0+~cs5.0.1-1	installed
node-pkg-dir	5.0.0-2	installed
node-postcss	8.5.8+~cs9.3.30-1	installed
node-postcss-modules-extract-imports	3.1.0-1	installed
node-postcss-modules-values	4.0.0+~4.0.2-1	installed
node-postcss-value-parser	4.2.0-1	installed
node-prelude-ls	1.2.1+dfsg-3	installed
node-process-nextick-args	2.0.1-3	installed
node-progress	2.0.3-2	installed
node-promise-inflight	1.0.1+~1.0.3-1	installed
node-promise-retry	2.0.1-4	installed
node-promzard	0.3.0-2	installed
node-prr	1.0.1-3	installed
node-punycode	2.3.1+~2.1.4-1	installed
node-quick-lru	6.1.1-4	installed
node-randombytes	2.1.0+~2.0.3-1	installed
node-re2:arm64	1.23.3+~cs1.3.5-1	installed
node-read	1.0.7-5	installed
node-read-package-json	5.0.2+~2.0.0-5build1	installed
node-read-pkg	5.2.0-2	installed
node-readable-stream	3.6.0+~cs3.0.0-4build1	installed
node-readdirp	3.6.0-3	installed
node-rechoir	0.8.0+~0.6.4-1	installed
node-regenerate	1.4.2-3	installed
node-regenerate-unicode-properties	10.2.2+ds-2	installed
node-regenerator-runtime	0.15.2+~0.10.8-1	installed
node-regenerator-transform	0.15.2+~0.10.8-1	installed
node-regexpp	3.2.0-7	installed
node-regexpu-core	6.2.0-2build1	installed
node-regjsgen	0.8.0+ds-1	installed
node-regjsparser	0.12.0+ds-2	installed
node-repeat-string	1.6.1+repack-1	installed
node-require-directory	2.1.1+~2.1.7-1	installed
node-require-from-string	2.0.2+~1.2.3-1	installed
node-resolve	1.22.10+~cs5.37.15-1	installed
node-resolve-cwd	3.0.0-2	installed
node-resolve-from	5.0.0+~3.1.0+~3.3.0+~2.0.0-1	installed
node-restore-cursor	4.0.0-4	installed
node-resumer	0.0.0-6	installed
node-retry	0.13.1.+~cs2.19.16-1	installed
node-rimraf	4.4.1-6	installed
node-run-queue	2.0.0-3	installed
node-safe-buffer	5.2.1+~cs2.1.2-3	installed
node-schema-utils	4.2.0~ds-4	installed
node-semver	7.6.1+~7.5.8-2	installed
node-serialize-javascript	7.0.4+~5.0.4-1	installed
node-set-blocking	2.0.0-2	installed
node-set-immediate-shim	2.0.0-2	installed
node-set-value	4.1.0+~4.0.3-1	installed
node-shebang-command	2.0.0-1	installed
node-shebang-regex	3.0.0-2	installed
node-shell-quote	1.8.3+~1.7.5-1	installed
node-signal-exit	4.1.0-8	installed
node-slash	5.1.0-2build1	installed
node-slice-ansi	5.0.0+~cs9.0.0-5	installed
node-source-list-map	2.0.1+dfsg+~0.1.2-1	installed
node-source-map	0.7.0++dfsg2+really.0.6.1-15	installed
node-source-map-support	0.5.21+ds+~0.5.10-2	installed
node-spdx-correct	3.2.0+~3.1.3-1	installed
node-spdx-exceptions	2.5.0-1	installed
node-spdx-expression-parse	4.0.0+~3.0.5-1	installed
node-spdx-license-ids	3.26.0-1	installed
node-sprintf-js	1.1.3+ds1+~1.1.4-2	installed
node-ssri	9.0.1-3	installed
node-stack-utils	2.0.6+~2.0.3-1	installed
node-string-decoder	1.3.0-6	installed
node-string-width	4.2.3+~cs13.2.3-1	installed
node-strip-ansi	7.2.0-1	installed
node-strip-bom	4.0.0-2	installed
node-strip-eof	3.0.0-6	installed
node-strip-json-comments	4.0.0-4	installed
node-supports-color	10.2.2+ds-3	installed
node-tap	16.3.7+ds3+~cs49.5.20-6	installed
node-tap-mocha-reporter	5.0.4+~2.1.0-1	installed
node-tap-parser	13.0.1+~cs4.1.3-4	installed
node-tapable	2.2.1-3	installed
node-tape	5.6.1+~cs8.20.19-5	installed
node-tar	6.2.1+ds1+~cs6.1.13-10	installed
node-terser	5.46.1-4	installed
node-text-table	0.2.0-5	installed
node-through	2.3.8+~cs0.0.33-1	installed
node-time-stamp	2.2.0-2	installed
node-to-fast-properties	3.0.1-3	installed
node-to-regex-range	5.0.1-4	installed
node-tslib	2.4.1-1	installed
node-type-check	0.4.0+dfsg-3	installed
node-typedarray	0.0.7-1	installed
node-undici	7.18.2+dfsg+~cs3.2.0-1build1	installed
node-unicode-canonical-property-names-ecmascript	2.0.1-1	installed
node-unicode-match-property-ecmascript	2.0.0-2	installed
node-unicode-match-property-value-ecmascript	2.2.0+ds-1build1	installed
node-unicode-property-aliases-ecmascript	2.1.0+ds-1	installed
node-union-value	2.0.1-4	installed
node-unique-filename	1.1.1+ds-2	installed
node-unset-value	2.0.1-1	installed
node-util	0.12.5+~1.0.10-2	installed
node-util-deprecate	1.0.2-4	installed
node-uuid	8.3.2+~8.3.4-3	installed
node-v8-compile-cache	2.4.0-4	installed
node-v8flags	3.2.0+~3.1.1-1	installed
node-validate-npm-package-license	3.0.4-3	installed
node-validate-npm-package-name	5.0.0+~4.0.0-1	installed
node-watchpack	2.4.0+~cs2.8.1-1	installed
node-wcwidth.js	1.0.2-2	installed
node-webassemblyjs	1.14.1+dfsg3+~cs1.2.7-2	installed
node-webpack-sources	3.2.3+~3.2.0-2	installed
node-which	2.0.2+~cs1.3.2-5	installed
node-wide-align	1.1.3-4	installed
node-widest-line	3.1.0-2	installed
node-wordwrap	1.0.0-4	installed
node-wrap-ansi	8.0.1+~8.0.1-3	installed
node-wrappy	1.0.2-3	installed
node-write	2.0.0~6.0.1+~3.0.4+~2.0.0+~1.0.0+~2.0.1-5	installed
node-write-file-atomic	7.0.1+~4.0.3-1	installed
node-ws	8.19.0+~cs14.19.1-1	installed
node-xtend	4.0.2-3	installed
node-y18n	5.0.8+~5.0.0-4	installed
node-yallist	4.0.0+~4.0.1-2	installed
node-yaml	2.8.3+~cs0.4.0-1	installed
node-yargs	16.2.0+~16.0.4-7	installed
node-yargs-parser	21.1.1+~21.0.0-4	installed
nodejs	22.22.1+dfsg+~cs22.19.15-1ubuntu1	installed
nodejs-doc	22.22.1+dfsg+~cs22.19.15-1ubuntu1	installed
npm	9.2.0~ds3-1	installed
openssh-client	1:10.2p1-2ubuntu3.8	installed
openssl	3.5.5-1ubuntu3.7	installed
openssl-provider-legacy	3.5.5-1ubuntu3.7	installed
passwd	1:4.17.4-2ubuntu3	installed
patch	2.8-2build1	installed
perl	5.40.1-7ubuntu0.4	installed
perl-base	5.40.1-7ubuntu0.4	installed
perl-modules-5.40	5.40.1-7ubuntu0.4	installed
perl-openssl-defaults:arm64	7build4	installed
pinentry-curses	1.3.2-3ubuntu1	installed
procps	2:4.0.4-9ubuntu1	installed
publicsuffix	20260129.1928-1	installed
python3	3.14.3-0ubuntu2	installed
python3-dev	3.14.3-0ubuntu2	installed
python3-minimal	3.14.3-0ubuntu2	installed
python3-packaging	26.0-1	installed
python3-pip	25.1.1+dfsg-1ubuntu2	installed
python3-pip-whl	25.1.1+dfsg-1ubuntu2	installed
python3-setuptools-whl	78.1.1-0.1build1	installed
python3-venv	3.14.3-0ubuntu2	installed
python3-wheel	0.46.3-2	installed
python3.14	3.14.4-1ubuntu0.2	installed
python3.14-dev	3.14.4-1ubuntu0.2	installed
python3.14-minimal	3.14.4-1ubuntu0.2	installed
python3.14-venv	3.14.4-1ubuntu0.2	installed
readline-common	8.3-4	installed
rpcsvc-proto	1.4.3-1build1	installed
rust-coreutils	0.10.0-1ubuntu2~26.04.1	installed
sed	4.9-2ubuntu1	installed
sensible-utils	0.0.26build1	installed
shared-mime-info	2.4-5build3	installed
sysvinit-utils	3.15-5ubuntu1	installed
tar	1.35+dfsg-4ubuntu0.4	installed
terser	5.46.1-4	installed
tzdata	2026e-0ubuntu0.26.04.1	installed
ubuntu-keyring	2023.11.28.1build1	installed
unzip	6.0-29ubuntu1	installed
util-linux	2.41.3-3ubuntu2.2	installed
wabt	1.0.36+dfsg+~cs1.0.36-2ubuntu1	installed
webpack	5.105.4+dfsg1+~cs15.13.23-2	installed
wget	1.25.0-2ubuntu4.4	installed
x11-common	1:7.7+26ubuntu1	installed
x11-utils	7.7+7build1	installed
x11-xserver-utils	7.7+11build1	installed
xauth	1:1.1.2-1.1build1	installed
xdg-user-dirs	0.19-1	installed
xdg-utils	1.2.1-2ubuntu2	installed
xkb-data	2.46-2	installed
xz-utils	5.8.3-1ubuntu0.1	installed
zip	3.0-15ubuntu3	installed
zlib1g-dev:arm64	1:1.3.dfsg+really1.3.1-1ubuntu3.2	installed
zlib1g:arm64	1:1.3.dfsg+really1.3.1-1ubuntu3.2	installed
```

## 6. Python packages
```
Package            Version
------------------ ----------
annotated-doc      0.0.5
annotated-types    0.8.0
anyio              4.16.0
beautifulsoup4     4.15.0
blinker            1.9.0
certifi            2026.10.23
charset-normalizer 3.5.2
click              8.5.1
colorama           0.4.6
fastapi            0.162.2
Flask              3.1.3
gyp-next           0.16.2
h11                0.16.0
idna               3.20
itsdangerous       2.2.0
Jinja2             3.1.6
MarkupSafe         3.0.4
numpy              2.5.4
opentelemetry-api  1.45.2
packaging          26.0
pandas             3.1.1
pip                25.1.1
pydantic           2.14.3
pydantic_core      2.50.4
python-dateutil    4.0.0
requests           2.34.2
soupsieve          4.1
starlette          1.10.0
typing_extensions  4.16.0
typing-inspection  0.4.5
tzdata             2026.6
urllib3            2.8.0
uvicorn            0.54.0
watchdog           7.1.0
Werkzeug           3.1.9
wheel              0.46.3
```

## 7. Global Node packages
```
/usr/local/lib
+-- @openai/codex@0.171.0
`-- wrangler@4.164.0

```

## 8. GitHub CLI extensions
```
```

## 9. Local Git repositories
```
/root/flutter/.git
/root/mawda-platform/.git
/root/mawda-delete-18-20261123T174507Z/repository/.git
/root/mawda-delete-two-20261123T191956Z/repository/.git
```

## 10. Local repository status
```
```

## 11. Required tool availability summary

| Required tool | Status |
|---|---|
| git | Available |
| gh | Available |
| python3 | Available |
| jq | Available |
| rg | Available |
| curl | Available |
| wget | Available |
| git-lfs | Missing |
| flutter | Available |
| dart | Available |
| node | Available |
| npm | Available |
| java | Available |
| gradle | Missing |
| firebase | Available |
| shellcheck | Available |

## 12. Security exclusions
- No environment variable values collected.
- No tokens, passwords, private keys or credential files collected.
- No Git remote URLs recorded.
- No application source files changed.
- No deployments or workflows started.

## 13. Limitations
- Tool presence does not prove correct configuration.
- Repository search is limited to the listed directories and depth.
- This is not evidence of application test success.
