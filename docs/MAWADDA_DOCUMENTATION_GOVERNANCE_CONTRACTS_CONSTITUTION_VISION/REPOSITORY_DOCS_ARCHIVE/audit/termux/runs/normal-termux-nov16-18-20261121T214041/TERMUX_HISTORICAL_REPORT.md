# Termux normal environment historical evidence
Collection: 2026-11-21T21:40:41+03:00
Environment: Normal Termux, not Ubuntu
Repository: productionhome2022-hash/mawda-platform
Branch: codex/mawda-full-platform-implementation
Period: 2026-11-16 through 2026-11-18
Method: Historical evidence collection only; no tests rerun.

## Device and tool versions
Linux localhost 5.10.237-android12-9-00014-gf82f7360927e-ab14119954 #1 SMP PREEMPT Wed Sep 17 09:13:52 UTC 2025 aarch64 Android
git version 2.54.0
WARNING: linker: Warning: "/data/data/com.termux/files/home/flutter/bin/cache/dart-sdk/bin/dart" unused DT entry: DT_RPATH (type 0xf arg 0x2685) (ignoring)
error: "/data/data/com.termux/files/home/flutter/bin/cache/dart-sdk/bin/dart": executable's TLS segment is underaligned: alignment is 8 (skew 0), needs to be at least 64 for ARM64 Bionic
/data/data/com.termux/files/home/mawdda_publish_nov16_18.sh: line 78: 19349 Aborted                    flutter --version 2>&1
     19350 Done                       | head -3
WARNING: linker: Warning: "/data/data/com.termux/files/home/flutter/bin/cache/dart-sdk/bin/dart" unused DT entry: DT_RPATH (type 0xf arg 0x2685) (ignoring)
error: "/data/data/com.termux/files/home/flutter/bin/cache/dart-sdk/bin/dart": executable's TLS segment is underaligned: alignment is 8 (skew 0), needs to be at least 64 for ARM64 Bionic
/data/data/com.termux/files/home/mawdda_publish_nov16_18.sh: line 78: 19378 Aborted                    dart --version 2>&1

## Current repository identity
4416ab336357c1bf95514d187ee205cd738a0abb
## codex/mawda-full-platform-implementation...origin/codex/mawda-full-platform-implementation
?? docs/audit/termux/runs/normal-termux-nov16-18-20261121T214041/

## Commit history: requested dates
7fd1c6cd9b3810047bb0d87f1b6dd5d0dc8b4dd1 | c759083e04ffd98616691c2e736207095aaf2dbc | 2026-11-18T05:50:09+03:00 | production home | docs: record exact-head validation and prioritized implementation gaps
c759083e04ffd98616691c2e736207095aaf2dbc | 917a7cc61dd4f9f8fb3bffb160b407bf85130b85 | 2026-11-18T00:48:30+03:00 | production home | docs: reconcile call readiness with current signaling code
917a7cc61dd4f9f8fb3bffb160b407bf85130b85 | 67afa6fb73a9054efba39c7f62f6f8aa437f4f46 | 2026-11-18T00:47:37+03:00 | production home | docs: trace featured advertising implementation gap
67afa6fb73a9054efba39c7f62f6f8aa437f4f46 | 47a193bff2981d7e8dfcc8ad1d5f623ba9ff6646 | 2026-11-18T00:31:38+03:00 | production home | docs: record reward center discovery regression
47a193bff2981d7e8dfcc8ad1d5f623ba9ff6646 | 988872266d842d919b11898aa55330235d0cd939 | 2026-11-18T00:30:03+03:00 | production home | fix(ads): align reward center campaign discovery filters
988872266d842d919b11898aa55330235d0cd939 | 084c79b2a278429873c3b29c68ef9118a7166e04 | 2026-11-18T00:28:38+03:00 | production home | docs: record timed ad discovery regression evidence
084c79b2a278429873c3b29c68ef9118a7166e04 | 532c0b0fb2033bbcf2735c521cd0847158e130a0 | 2026-11-18T00:24:31+03:00 | production home | fix(ads): filter active reward campaigns before limiting
532c0b0fb2033bbcf2735c521cd0847158e130a0 | 7c8e6985ddf11ef32417e7b61c1bce9fe373cf9a | 2026-11-18T00:20:13+03:00 | production home | docs(calls): record deadline hardening and regression coverage
7c8e6985ddf11ef32417e7b61c1bce9fe373cf9a | c67a11c2e94993eb4cf707c1c262c710e97d8acc | 2026-11-18T00:19:59+03:00 | production home | ci(calls): run call lifecycle emulator regression
c67a11c2e94993eb4cf707c1c262c710e97d8acc | cc7a7c73db63e87dc29ef31e2ef93711ac809b9e | 2026-11-18T00:19:54+03:00 | production home | test(calls): cover expired reconnect confirmation
cc7a7c73db63e87dc29ef31e2ef93711ac809b9e | ae10bfc5273dcc0f5b3650133af0b3d9cdf7953c | 2026-11-18T00:19:45+03:00 | production home | fix(calls): reject reconnect confirmation after call deadline
ae10bfc5273dcc0f5b3650133af0b3d9cdf7953c | 5351887c9d02cc0a1aece7612f550e57f2cad527 | 2026-11-18T00:09:50+03:00 | production home | fix(ui): constrain room discovery width on desktop
5351887c9d02cc0a1aece7612f550e57f2cad527 | 6bd5cb1a73049e959bed47fe40f45421f2c051d4 | 2026-11-18T00:08:58+03:00 | production home | docs(traceability): add viewport coverage for responsive room cards
6bd5cb1a73049e959bed47fe40f45421f2c051d4 | 909fb66bbead41418f18b6e0058368db92c32fec | 2026-11-18T00:08:51+03:00 | production home | test(ui): cover responsive room cards across viewport widths
909fb66bbead41418f18b6e0058368db92c32fec | 40f9cd287a5cf3b5bd22453f4a49821c5fd1875b | 2026-11-18T00:08:37+03:00 | production home | refactor(ui): extract responsive room card layout
40f9cd287a5cf3b5bd22453f4a49821c5fd1875b | 8f0f18d2c49cc8b4cd7e2675bcff9463c7bd35a0 | 2026-11-18T00:08:30+03:00 | production home | feat(ui): add reusable responsive room card layout
8f0f18d2c49cc8b4cd7e2675bcff9463c7bd35a0 | 563c7466210c084a03b5d16f15ed73122da4f61e | 2026-11-18T00:07:55+03:00 | production home | docs(traceability): record responsive room card improvement
563c7466210c084a03b5d16f15ed73122da4f61e | da6e0cd9638a8fcbea09255cdce6e2c800eb2742 | 2026-11-18T00:07:37+03:00 | production home | fix(ui): make room cards adaptive on narrow screens
da6e0cd9638a8fcbea09255cdce6e2c800eb2742 | 9488b928d341301af4c55e76067839bd6bc3257e | 2026-11-18T00:02:29+03:00 | production home | docs(release): require owner visual signoff and full UI action audit
9488b928d341301af4c55e76067839bd6bc3257e | 3a30b41de2812567fecba6cff8330817c393b5c1 | 2026-11-18T00:02:18+03:00 | production home | fix(web): make PWA install guidance resilient and accessible
3a30b41de2812567fecba6cff8330817c393b5c1 | 7f677343c2199d6daf0b2ac799fd0457c92f0aac | 2026-11-18T00:00:20+03:00 | production home | docs: mark verified call quota and duration gates
7f677343c2199d6daf0b2ac799fd0457c92f0aac | 75dd1c5c4725356916bdf0e28cb184082df09ad0 | 2026-11-18T00:00:16+03:00 | production home | docs: record call duration guard and exact-head web CI evidence
75dd1c5c4725356916bdf0e28cb184082df09ad0 | 0dad356bb64e022e0d3c0442b6e423304239246e | 2026-11-17T23:53:29+03:00 | production home | fix(calls): retry transient server connection confirmation
0dad356bb64e022e0d3c0442b6e423304239246e | 564f5fe483ee4c07cbb921d9e6740637afad37da | 2026-11-17T23:53:25+03:00 | production home | fix(calls): sweep duration-expired sessions without starvation
564f5fe483ee4c07cbb921d9e6740637afad37da | 888b0aab50781df5586d0134e7c012cec58edc4c | 2026-11-17T23:52:57+03:00 | production home | fix(calls): distinguish duration expiry from manual termination
888b0aab50781df5586d0134e7c012cec58edc4c | b1cdb351d4315bf3c8f77f258cafee53446c2833 | 2026-11-17T23:49:03+03:00 | production home | fix(ads): align reward guidance with approved campaign cap
b1cdb351d4315bf3c8f77f258cafee53446c2833 | 9aa97d1faa0b878679b4e52a1eab322e578fc732 | 2026-11-17T23:49:00+03:00 | production home | test(ads): cover three rewards per campaign per rolling day
9aa97d1faa0b878679b4e52a1eab322e578fc732 | e7dcf51be028f9538e3cac9f70959a0f8eb921ff | 2026-11-17T23:48:54+03:00 | production home | fix(ads): enforce approved rolling campaign reward cap
e7dcf51be028f9538e3cac9f70959a0f8eb921ff | fa1578ee63383a612b85d4090b6a880fc8a5dbfb | 2026-11-17T23:47:47+03:00 | production home | fix(calls): use explicit Firestore reference type and guard call responses
fa1578ee63383a612b85d4090b6a880fc8a5dbfb | 2897eabd4e7b63890ce7b75f0dc9bfa9b50af38d | 2026-11-17T23:47:31+03:00 | production home | feat(calls): report WebRTC connection to duration guard
2897eabd4e7b63890ce7b75f0dc9bfa9b50af38d | 2a2ac64e95d13d372efac54c74fd13cf20080b90 | 2026-11-17T23:47:26+03:00 | production home | test(calls): cover connected duration enforcement
2a2ac64e95d13d372efac54c74fd13cf20080b90 | 47ce01c5e1e5e013ee49052ec96cab07d21b81b8 | 2026-11-17T23:47:21+03:00 | production home | feat(calls): enforce server-timed five-minute call ceiling
47ce01c5e1e5e013ee49052ec96cab07d21b81b8 | 991187c809c680e51a2c313bce4fe7bca1ecf763 | 2026-11-17T23:35:51+03:00 | production home | fix: evaluate call quota window at transaction execution
991187c809c680e51a2c313bce4fe7bca1ecf763 | 4d89b4ec370cf2198c2ef8307d14b35aa135e566 | 2026-11-17T23:33:47+03:00 | production home | test: cover rolling call attempt quotas and idempotency
4d89b4ec370cf2198c2ef8307d14b35aa135e566 | 7601c427a66b366c999f9eacba36d2fe1e812be6 | 2026-11-17T23:33:23+03:00 | production home | fix: fail closed on malformed call quota history
7601c427a66b366c999f9eacba36d2fe1e812be6 | 3536d902bbf1d654eac46932528ea4ed955c92a1 | 2026-11-17T23:33:01+03:00 | production home | feat: enforce rolling server-side call attempt limits
3536d902bbf1d654eac46932528ea4ed955c92a1 | 1b96fcd21a01dc4f63d90e719f761442cd4ba5be | 2026-11-17T23:32:21+03:00 | production home | docs: restore call emulator test gate rationale
1b96fcd21a01dc4f63d90e719f761442cd4ba5be | fd9aad15e9ca12594a396680970f6d02530adb31 | 2026-11-17T23:32:13+03:00 | production home | ci: run call signaling emulator integration before release
fd9aad15e9ca12594a396680970f6d02530adb31 | 0159805d1da3ef46c8d99caa5428d20003068f0e | 2026-11-17T23:32:05+03:00 | production home | test: include call signaling emulator integration in full suite
0159805d1da3ef46c8d99caa5428d20003068f0e | adc82c3a42f3c5b3a8ce5ab952f355205638024a | 2026-11-17T23:27:56+03:00 | production home | docs: record web-first calls and featured ads audit
adc82c3a42f3c5b3a8ce5ab952f355205638024a | ebed7d7a5fa83f6dc99824621a5bd4a37496d55d | 2026-11-17T23:22:04+03:00 | production home | docs: record deferred call test entry point
ebed7d7a5fa83f6dc99824621a5bd4a37496d55d | 2f259285a382e6b9faab1c6acb92a4b8ac4d4cbb | 2026-11-17T23:21:57+03:00 | production home | test: defer call integration from current all-tests suite
2f259285a382e6b9faab1c6acb92a4b8ac4d4cbb | 7ebb9a9e23839c37935aa8dbba9bdf7cce230cab | 2026-11-17T23:21:29+03:00 | production home | docs: record owner-directed web-first test scope
7ebb9a9e23839c37935aa8dbba9bdf7cce230cab | da93beedb9381da9c3faafeb90bf1854af05f950 | 2026-11-17T23:21:19+03:00 | production home | docs: defer 5000-persona simulation from web launch gate
da93beedb9381da9c3faafeb90bf1854af05f950 | b14d684e45ea31995ec4f35656b44a93f3478536 | 2026-11-17T23:21:10+03:00 | production home | docs: separate call implementation from post-launch acceptance
b14d684e45ea31995ec4f35656b44a93f3478536 | 35ec33ad8653359b8aaabe9dea544cf02501321a | 2026-11-17T23:20:52+03:00 | production home | ci: defer live-call integration gate until web launch
35ec33ad8653359b8aaabe9dea544cf02501321a | a43dbb95529ed6b4f38034c72b364e84878ea589 | 2026-11-17T23:16:20+03:00 | production home | docs: clarify exact-head CI evidence for PWA fix
a43dbb95529ed6b4f38034c72b364e84878ea589 | b7cb42cb46a5d2f945d6c30af8c949f792c8c508 | 2026-11-17T23:16:06+03:00 | production home | docs: record PWA CI validator correction
b7cb42cb46a5d2f945d6c30af8c949f792c8c508 | 0e3a8898fd93b37f93960b64fff9e907e3086cf6 | 2026-11-17T23:15:57+03:00 | production home | ci: fix PWA asset validator shell quoting
0e3a8898fd93b37f93960b64fff9e907e3086cf6 | d69c722d7bf5642e14897fb96e24adbeb941cb32 | 2026-11-17T23:07:07+03:00 | production home | docs(phase1): record web member-home and release candidate hardening
d69c722d7bf5642e14897fb96e24adbeb941cb32 | 84c2b2d80831c239a05b57166ea2b96309ee5f9b | 2026-11-17T23:06:07+03:00 | production home | fix(ci): select production Firebase config for release candidate
84c2b2d80831c239a05b57166ea2b96309ee5f9b | 08a1bea61ee9060239a441d9a0b75d5795d6eec2 | 2026-11-17T23:05:29+03:00 | production home | fix(member-home): avoid duplicate push init and allow compact-screen scrolling
08a1bea61ee9060239a441d9a0b75d5795d6eec2 | 6aa25845890cc7c2b18ec95c62ff3df453cbe033 | 2026-11-17T23:03:21+03:00 | production home | ci(web): build production-configured release candidate without deployment
6aa25845890cc7c2b18ec95c62ff3df453cbe033 | 73b95606c09a73989b7f297b56071a336290cb1f | 2026-11-17T23:02:31+03:00 | production home | fix(notifications): remove duplicate authenticated FCM bootstrap
73b95606c09a73989b7f297b56071a336290cb1f | 2e05d1cf586d9aa7ecd1375a75efbc03a33a776e | 2026-11-17T23:02:27+03:00 | production home | fix(notifications): route opened member pushes from the single bootstrap
2e05d1cf586d9aa7ecd1375a75efbc03a33a776e | a50d205397b755997bb7a08e88616fa19970c257 | 2026-11-17T23:01:19+03:00 | production home | fix(ci): correct PWA icon path validation shell syntax
a50d205397b755997bb7a08e88616fa19970c257 | 4088e97d2cb62d3cf6c9115659294cbe437a7b1b | 2026-11-17T22:57:23+03:00 | production home | test(web): verify PWA and push notification assets
4088e97d2cb62d3cf6c9115659294cbe437a7b1b | 389f78fef895484a3247fd1a2757df28b83baa09 | 2026-11-17T22:57:16+03:00 | production home | fix(web): use an existing Mawdda icon for push notifications
389f78fef895484a3247fd1a2757df28b83baa09 | 23d83ce42f15b6b201a2313011b061eca423c519 | 2026-11-17T22:15:10+03:00 | production home | docs: record launch readiness baseline commit evidence
23d83ce42f15b6b201a2313011b061eca423c519 | c9ed620372333690393453c04cb84ed853bca75a | 2026-11-17T22:14:43+03:00 | production home | docs: define free-first Mawdda launch readiness gates
c9ed620372333690393453c04cb84ed853bca75a | 2f3bd7a4fa645f07e2f328496de51af159d4de12 | 2026-11-17T16:58:03+03:00 | production home | docs(android): link official Flutter ABI versioning guidance
2f3bd7a4fa645f07e2f328496de51af159d4de12 | b4d27031ff4815ad0f3ace2f4d84fa12cab8d15c | 2026-11-17T16:57:57+03:00 | production home | docs(android): record ABI version-code compatibility correction
b4d27031ff4815ad0f3ace2f4d84fa12cab8d15c | 8e095965a6e56c1b12ddccc626f8c1a410ed57fd | 2026-11-17T16:57:46+03:00 | production home | docs(android): align release checklist with ABI version offsets
8e095965a6e56c1b12ddccc626f8c1a410ed57fd | f02a66a03bdfbe5a900477b307095da882272b12 | 2026-11-17T16:57:36+03:00 | production home | docs(android): clarify Flutter ABI-specific version codes
f02a66a03bdfbe5a900477b307095da882272b12 | 454eb51aa02df463bc5e1c015e3ae5fbe80a5e64 | 2026-11-17T16:57:29+03:00 | production home | test(android): lock Flutter ABI version code policy
454eb51aa02df463bc5e1c015e3ae5fbe80a5e64 | 219e1cf4114dab6b359409d27088edd1818110b9 | 2026-11-17T16:57:23+03:00 | production home | test(android): cover Flutter ABI version code offsets
219e1cf4114dab6b359409d27088edd1818110b9 | 502d4641b330f5abdba046695361bee7e384daff | 2026-11-17T16:57:18+03:00 | production home | fix(android): validate Flutter ABI-specific version codes
502d4641b330f5abdba046695361bee7e384daff | 0627c231fb5da6a0b06f97117330bf6e4d9298cc | 2026-11-17T16:55:48+03:00 | production home | docs(security): record immutable Android release source pin
0627c231fb5da6a0b06f97117330bf6e4d9298cc | 24ec36e27cafd73d00301bc22090768237aef2d0 | 2026-11-17T16:55:38+03:00 | production home | docs(android): document immutable signed-release source pin
24ec36e27cafd73d00301bc22090768237aef2d0 | 67f193f699d1b2518e27ae869ec6a70cc9bbe75a | 2026-11-17T16:55:30+03:00 | production home | test(security): require immutable release source SHA
67f193f699d1b2518e27ae869ec6a70cc9bbe75a | 26ee5c246e96cd2a5457ed135e510dda31b97979 | 2026-11-17T16:55:23+03:00 | production home | security(android): pin signed release checkout to immutable SHA
26ee5c246e96cd2a5457ed135e510dda31b97979 | 4e96125a44fbf0722a592771d79d3831cfeacd9f | 2026-11-17T16:53:28+03:00 | production home | docs: record Android release artifact verification hardening
4e96125a44fbf0722a592771d79d3831cfeacd9f | 5306fe37ab674cd432097b70ef632062450a9a66 | 2026-11-17T16:52:59+03:00 | production home | docs(security): record signed artifact malware scan gate
5306fe37ab674cd432097b70ef632062450a9a66 | 66680b2b06dab92821866a4222f32f21dba20903 | 2026-11-17T16:52:52+03:00 | production home | test(security): require ClamAV scan for signed artifacts
66680b2b06dab92821866a4222f32f21dba20903 | 4472ac9c71737b325b6f5f84ef91339388aac3d2 | 2026-11-17T16:52:45+03:00 | production home | fix(security): persist ClamAV release scan log safely
4472ac9c71737b325b6f5f84ef91339388aac3d2 | 5bb2a963aedc3ac726b0edd49998db2f19c4d4d1 | 2026-11-17T16:52:30+03:00 | production home | ci(android): run release metadata tests from repository root
5bb2a963aedc3ac726b0edd49998db2f19c4d4d1 | 17204122954ef7814837676041356c41e26e3b37 | 2026-11-17T16:52:23+03:00 | production home | security(android): scan signed release artifacts with ClamAV
17204122954ef7814837676041356c41e26e3b37 | 137f29072f088421b95560f83b15b8e983efbc2d | 2026-11-17T16:52:04+03:00 | production home | docs(release): strengthen Android artifact acceptance checks
137f29072f088421b95560f83b15b8e983efbc2d | e59504862b8541ff4fb1257611c0414d088e4f03 | 2026-11-17T16:51:57+03:00 | production home | docs(android): document APK and AAB metadata verification
e59504862b8541ff4fb1257611c0414d088e4f03 | 4e0970b7fe49c9b08aae8272f5782022c4ca5ec5 | 2026-11-17T16:51:47+03:00 | production home | ci(android): run signed release metadata contract tests
4e0970b7fe49c9b08aae8272f5782022c4ca5ec5 | 0b80eeb08edfb91bb61d04561dcb323404f2a991 | 2026-11-17T16:51:42+03:00 | production home | test(android): require release metadata verification
0b80eeb08edfb91bb61d04561dcb323404f2a991 | 3974256c57d2933c3853ae6d41af18fce70665f4 | 2026-11-17T16:51:36+03:00 | production home | fix(android): correct release metadata manifest script
3974256c57d2933c3853ae6d41af18fce70665f4 | 2a3d795de0e711ca11c5f626e6e86c7763e0420f | 2026-11-17T16:51:24+03:00 | production home | build(android): verify release APK and AAB identity metadata
2a3d795de0e711ca11c5f626e6e86c7763e0420f | 98b9bc60cdd5970d47f6c45fd7c038d6fd03a75b | 2026-11-17T16:50:53+03:00 | production home | test(android): cover APK and AAB release metadata
98b9bc60cdd5970d47f6c45fd7c038d6fd03a75b | 6e4a7f12666d2ec2b15c3211d6fa49e3bbc72494 | 2026-11-17T16:50:50+03:00 | production home | build(android): validate release APK and AAB metadata
6e4a7f12666d2ec2b15c3211d6fa49e3bbc72494 | c87336128d56f0433e498ffe9a59d19f5e322ec8 | 2026-11-17T16:32:00+03:00 | production home | test(firebase): fail closed without production native app identities
c87336128d56f0433e498ffe9a59d19f5e322ec8 | bce3f2590614dcb5e11a7ea2c97e81b85690e6a6 | 2026-11-17T16:31:39+03:00 | production home | test(android): build and verify nonproduction debug AAB in CI
bce3f2590614dcb5e11a7ea2c97e81b85690e6a6 | 92ce92df10547a63d2bb0af53bda2bc72ed05da3 | 2026-11-17T16:30:54+03:00 | production home | docs(firebase): clarify validated production native identities
92ce92df10547a63d2bb0af53bda2bc72ed05da3 | e23d873dd73c8b475cf387687294462a63826330 | 2026-11-17T16:30:09+03:00 | production home | docs(android): record production Firebase release gate
e23d873dd73c8b475cf387687294462a63826330 | b6bba8b0085d9ff6d6140a1017a7cc0799aa4bf9 | 2026-11-17T16:29:08+03:00 | production home | fix(android): require production Firebase config for signed artifacts
b6bba8b0085d9ff6d6140a1017a7cc0799aa4bf9 | c4c64caf82516fc8f3aefad8bf6d0882553485d9 | 2026-11-17T16:28:43+03:00 | production home | test(firebase): validate production Android and iOS app identities
c4c64caf82516fc8f3aefad8bf6d0882553485d9 | 80bdfa593be92564c35e093b85663c83c5f553a8 | 2026-11-17T16:24:55+03:00 | production home | test(android): match dynamic apksigner invocation in contract check
80bdfa593be92564c35e093b85663c83c5f553a8 | 68010b0e771b5c8005756baaedf9705a1c0b32b8 | 2026-11-17T16:24:27+03:00 | production home | fix(android): keep ABI APK collection separate from universal APK
68010b0e771b5c8005756baaedf9705a1c0b32b8 | fe0b6ff0178433151637b621c101a5facdf646cc | 2026-11-17T16:23:25+03:00 | production home | feat(android): prepare signed APK and Google Play AAB releases
fe0b6ff0178433151637b621c101a5facdf646cc | f391908c4c58004b6cafd3d9b4abbd5785471be8 | 2026-11-17T16:14:21+03:00 | production home | fix: normalize configured APK download URL
f391908c4c58004b6cafd3d9b4abbd5785471be8 | 41151ac2762d3800f63f14844196824772a3cb80 | 2026-11-17T16:14:01+03:00 | production home | docs: align execution plan with phased launch decision
41151ac2762d3800f63f14844196824772a3cb80 | fd9cd145604bd955415786f35eb176789bb2c080 | 2026-11-17T16:13:46+03:00 | production home | docs: record phased launch gates in RELEASE_READINESS_CHECKLIST.md
fd9cd145604bd955415786f35eb176789bb2c080 | eda27603b5108dddf0bd4b83d3d20601517deaf1 | 2026-11-17T16:13:44+03:00 | production home | docs: record phased launch gates in MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md
eda27603b5108dddf0bd4b83d3d20601517deaf1 | b38fd97717c0ec3b2caeb6670219d38b63e934d2 | 2026-11-17T16:13:41+03:00 | production home | docs: record phased launch gates in MAWADDA_PRODUCT_CONSTITUTION.md
b38fd97717c0ec3b2caeb6670219d38b63e934d2 | 85d027fa945b42628a55833e42fc610133b4ad67 | 2026-11-17T16:13:20+03:00 | production home | docs: record approved phased launch and distribution plan
85d027fa945b42628a55833e42fc610133b4ad67 | fa4543fd03e018c8f68fe191485c8803f5ef4552 | 2026-11-17T16:12:45+03:00 | production home | fix: restrict APK downloads to approved HTTPS hosts
fa4543fd03e018c8f68fe191485c8803f5ef4552 | 3fe09d718879ba2b872cc5e479a5ca3a5ebed125 | 2026-11-17T16:12:43+03:00 | production home | test: cover approved Android download hosts
3fe09d718879ba2b872cc5e479a5ca3a5ebed125 | 4be7c5c07aa995e30d350e624d6d0cc0e58efaf8 | 2026-11-17T16:12:41+03:00 | production home | feat: add approved Android download host policy
4be7c5c07aa995e30d350e624d6d0cc0e58efaf8 | 734f76cdd928824ef56225ce5b70ecc1d0108d95 | 2026-11-17T15:40:56+03:00 | production home | docs: record Firebase identity validation and exact-head evidence
734f76cdd928824ef56225ce5b70ecc1d0108d95 | 797030153b1a2e570a61aac8c0f9e7cd138ed7f5 | 2026-11-17T15:36:26+03:00 | production home | test: validate production and non-production Firebase app identities
797030153b1a2e570a61aac8c0f9e7cd138ed7f5 | f786b646330ca85aab0be909a8e2d4259e2d8de0 | 2026-11-17T15:21:49+03:00 | production home | docs: record featured reward policy reconciliation
f786b646330ca85aab0be909a8e2d4259e2d8de0 | baa0af88a5e16a5ec36b05a0109edb645888045d | 2026-11-17T15:21:47+03:00 | production home | fix(ads): align featured reward cooldown copy with approved policy
baa0af88a5e16a5ec36b05a0109edb645888045d | 463f20a4338e4ec785450f073e86dbde97cc7d04 | 2026-11-17T15:19:26+03:00 | production home | docs: record phase one call signaling hardening
463f20a4338e4ec785450f073e86dbde97cc7d04 | f5a3c7a6325b51a31aa466637896ab852df20137 | 2026-11-17T15:19:24+03:00 | production home | test(calls): cover expired ringing signal and ICE access
f5a3c7a6325b51a31aa466637896ab852df20137 | 86c13296d3efecd8eb4daf0c66604f534fd97af8 | 2026-11-17T15:19:22+03:00 | production home | fix(calls): reject expired ringing signal and ICE reads
86c13296d3efecd8eb4daf0c66604f534fd97af8 | 12ae540db329048db02ff6c8df67eee805666282 | 2026-11-16T22:32:48+03:00 | production home | fix(calls): stop serving SDP and ICE signals after a call terminates
12ae540db329048db02ff6c8df67eee805666282 | ccfba350f216040f90419079df883f522a9a2818 | 2026-11-16T22:32:06+03:00 | production home | fix(calls): reject malformed direct-chat participant sets before call setup
ccfba350f216040f90419079df883f522a9a2818 | 26696497648c7cec421c69ec0290d08460a3b1d4 | 2026-11-16T22:31:39+03:00 | production home | perf(calls): resolve active call from atomic member lock instead of scanning sessions
26696497648c7cec421c69ec0290d08460a3b1d4 | b2e73a78d980aa33addfb5fe2289cae34e7b1f45 | 2026-11-16T22:30:55+03:00 | production home | fix(calls): batch signal cleanup below Firestore write limit
b2e73a78d980aa33addfb5fe2289cae34e7b1f45 | 720a7c262e88c313aca40b9bb91c2b11ab8011f6 | 2026-11-16T22:30:17+03:00 | production home | fix(calls): refresh TURN credentials and make media cleanup idempotent
720a7c262e88c313aca40b9bb91c2b11ab8011f6 | 9b130430508daaca8afe459e583364d18ba42461 | 2026-11-16T22:29:36+03:00 | production home | fix(calls): clarify signaling cleanup completion timestamp field
9b130430508daaca8afe459e583364d18ba42461 | 1b40590385ce9014587ade5d1ed2727ffbf10a9f | 2026-11-16T22:29:27+03:00 | production home | perf(calls): index one-time expired signaling cleanup scan
1b40590385ce9014587ade5d1ed2727ffbf10a9f | 992eeba42240e88bb7f5a8f7ad8d8c5f743c9874 | 2026-11-16T22:29:21+03:00 | production home | fix(calls): make expired signaling cleanup paginated and idempotent
992eeba42240e88bb7f5a8f7ad8d8c5f743c9874 | b24c59de56d0af5b25891ecdc313156fb696ead5 | 2026-11-16T22:29:07+03:00 | production home | perf(calls): use server-side signaling cursor to avoid repeated Firestore reads
b24c59de56d0af5b25891ecdc313156fb696ead5 | cece0b7f8a106b537c3189c375ea857595718d20 | 2026-11-16T22:29:00+03:00 | production home | fix(calls): recover signaling pagination when an expired cursor is cleaned up
cece0b7f8a106b537c3189c375ea857595718d20 | 4c44e32d3df28288ceef20ffd2c70b9b55536bfd | 2026-11-16T22:28:51+03:00 | production home | perf(calls): index recipient-scoped signal cursor queries
4c44e32d3df28288ceef20ffd2c70b9b55536bfd | 292573e676397af7ed048323baf645fd90c5d7da | 2026-11-16T22:28:38+03:00 | production home | perf(calls): paginate recipient-scoped signaling by server cursor
292573e676397af7ed048323baf645fd90c5d7da | 2f5647d41fe479f37d1d37f2f96422db1355ce62 | 2026-11-16T22:27:56+03:00 | production home | docs(traceability): record WebRTC call implementation and evidence boundaries
2f5647d41fe479f37d1d37f2f96422db1355ce62 | f1308b202163bb1fe6a1d5a7abce26b6dcea7e03 | 2026-11-16T22:27:49+03:00 | production home | docs(status): record WebRTC call implementation and remaining acceptance blockers
f1308b202163bb1fe6a1d5a7abce26b6dcea7e03 | ec275e7832f6953fc65e125863f6de5069fa7841 | 2026-11-16T22:27:35+03:00 | production home | docs(coverage): add explicit partial WebRTC call journey and release gates
ec275e7832f6953fc65e125863f6de5069fa7841 | edd902b02d92638860e9aa4fad8ccb5d71011beb | 2026-11-16T22:27:23+03:00 | production home | fix(calls): preserve explicit pre-acceptance answer rejection semantics
edd902b02d92638860e9aa4fad8ccb5d71011beb | 71a0156eb1bdc347330a6efb119274bb2488f7bb | 2026-11-16T22:26:53+03:00 | production home | test(calls): verify authenticated ICE configuration and TURN fail-safe
71a0156eb1bdc347330a6efb119274bb2488f7bb | ca6adb7047ec7427cac4229c2cdadf006f8b04a0 | 2026-11-16T22:26:31+03:00 | production home | fix(calls): enforce age-band and mutual block checks for room call participants
ca6adb7047ec7427cac4229c2cdadf006f8b04a0 | 9e69fad84b28faa80ca8b201cac33591473ab290 | 2026-11-16T22:26:20+03:00 | production home | fix(calls): allow fresh ICE renegotiation signals during long-running calls
9e69fad84b28faa80ca8b201cac33591473ab290 | 244b31a977e8a96df7bb76391211920d7b2177de | 2026-11-16T22:26:06+03:00 | production home | test(calls): verify atomic member call locks and clean test fixtures
244b31a977e8a96df7bb76391211920d7b2177de | bcf190736e692d504151e62e00463543d9551ac8 | 2026-11-16T22:26:03+03:00 | production home | fix(calls): rely on inferred Firestore reference types for participant locks
bcf190736e692d504151e62e00463543d9551ac8 | 328103fdbbc433b81dcb5d74fcd2e59e14e5f4a3 | 2026-11-16T22:25:51+03:00 | production home | feat(calls): reserve participants atomically to prevent overlapping calls
328103fdbbc433b81dcb5d74fcd2e59e14e5f4a3 | 1f119d53a51e10f0f07831a438bc032f95461b57 | 2026-11-16T22:25:29+03:00 | production home | fix(calls): enforce caller offer and recipient answer signaling roles
1f119d53a51e10f0f07831a438bc032f95461b57 | d1e7f03499ee294d086239f8687669fd3bedcaf4 | 2026-11-16T22:25:21+03:00 | production home | fix(calls): revoke signaling and ICE access for declined or departed participants
d1e7f03499ee294d086239f8687669fd3bedcaf4 | e23ef1eb9e6d245005cbcb53a02a5f8c5d52c62a | 2026-11-16T22:25:03+03:00 | production home | feat(calls): surface missing TURN relay configuration in call UI
e23ef1eb9e6d245005cbcb53a02a5f8c5d52c62a | 14310f8aa9fba1d131f8b3cdfc2c035cbf93a85a | 2026-11-16T22:24:05+03:00 | production home | fix(tests): correct compiled call policy import path
14310f8aa9fba1d131f8b3cdfc2c035cbf93a85a | 30bcb20a8b93c433726d1260dfb1c584c8f0d6bc | 2026-11-16T22:23:02+03:00 | production home | fix(calls): resolve Cloud Functions type errors in peer authorization and signal projection
30bcb20a8b93c433726d1260dfb1c584c8f0d6bc | 0ab3f9956ff39590059e396c63f0eb0ed02e3d1b | 2026-11-16T19:22:50Z | github-actions[bot] | build(deps): resolve Flutter WebRTC lockfile
0ab3f9956ff39590059e396c63f0eb0ed02e3d1b | cd541ab86db6a4e1685b173ab1c5b4448be9636d | 2026-11-16T22:22:33+03:00 | production home | fix(calls): cancel failed setup sessions and avoid async disposal type mismatch
cd541ab86db6a4e1685b173ab1c5b4448be9636d | 73a6b989f8fb31ce27b5a91dcc21c7698910d4a8 | 2026-11-16T22:22:09+03:00 | production home | fix(ci): retry Flutter lockfile update after concurrent branch pushes
73a6b989f8fb31ce27b5a91dcc21c7698910d4a8 | 08363c434985ebbec65f0cb29a832971726bf983 | 2026-11-16T22:22:00+03:00 | production home | test(calls): align signaling payload boundary test with bounded SDP limit
08363c434985ebbec65f0cb29a832971726bf983 | e2a7d14570097439ef92e37eaf8fcc00fb4961cf | 2026-11-16T22:21:52+03:00 | production home | test(calls): cover room multi-peer signaling isolation and participant leave
e2a7d14570097439ef92e37eaf8fcc00fb4961cf | 0e87d9dfcc01d8f567d3fb9263c016933ad45908 | 2026-11-16T22:21:40+03:00 | production home | fix(calls): close expired ringing sessions and deny departed participants
0e87d9dfcc01d8f567d3fb9263c016933ad45908 | 8246254962493007a234c134580aefe3e7fb0bef | 2026-11-16T22:21:35+03:00 | production home | fix(calls): allow realistic SDP and bounded ICE candidate payload sizes
8246254962493007a234c134580aefe3e7fb0bef | 4d10b6275a81a9da346de5c8c709198dbdd46114 | 2026-11-16T22:21:07+03:00 | production home | fix(tests): target each signaling exchange to its intended peer
4d10b6275a81a9da346de5c8c709198dbdd46114 | b4f62de0acf1c0ddbc874dd5a68116b0ccf58d0f | 2026-11-16T22:20:55+03:00 | production home | fix(calls): allow remaining room members to join an already accepted call
b4f62de0acf1c0ddbc874dd5a68116b0ccf58d0f | 2d1735c957dfefce95b2a0e23b6dcd55f2c6b172 | 2026-11-16T22:20:46+03:00 | production home | fix(calls): preserve active room calls when individual participants decline or leave
2d1735c957dfefce95b2a0e23b6dcd55f2c6b172 | ba6d48773d39bff0d8ea7383ea80b64d49fde4ba | 2026-11-16T22:20:25+03:00 | production home | fix(tests): provide explicit recipient for call signaling fixtures
ba6d48773d39bff0d8ea7383ea80b64d49fde4ba | fb308e227e5b4abedfde23830878fd7d396aa31d | 2026-11-16T22:20:17+03:00 | production home | test(calls): assert recipient-scoped WebRTC signaling delivery
fb308e227e5b4abedfde23830878fd7d396aa31d | c2ec0418aa3abb6d4dedd871b6a8703b0394dbd4 | 2026-11-16T22:20:15+03:00 | production home | fix(calls): reuse validated ICE server configuration for peer creation
c2ec0418aa3abb6d4dedd871b6a8703b0394dbd4 | 07dd651c4050883639332739801d0529d8286218 | 2026-11-16T22:20:03+03:00 | production home | feat(calls): support targeted peer connections for room audio and video calls
07dd651c4050883639332739801d0529d8286218 | 7e556adfc8ce99eb67de9dea92973892436460fe | 2026-11-16T22:19:38+03:00 | production home | feat(calls): route signaling per participant for multi-party room calls
7e556adfc8ce99eb67de9dea92973892436460fe | 12e409cce6e4310c56b91e5b9d4950f107bf442a | 2026-11-16T22:19:21+03:00 | production home | feat(calls): route foreground and opened incoming-call notifications to chats
12e409cce6e4310c56b91e5b9d4950f107bf442a | 50adf56bf96eee61bb7d95ec49a99636ebada7c4 | 2026-11-16T22:18:50+03:00 | production home | ci(deps): trigger lock resolution for dependency workflow updates
50adf56bf96eee61bb7d95ec49a99636ebada7c4 | d28da43eb65d781ee11c92acf65d893c2a0984a1 | 2026-11-16T22:18:40+03:00 | production home | feat(calls): add incoming room call accept and reject flow
d28da43eb65d781ee11c92acf65d893c2a0984a1 | 0532fc57ae9147a1923a5be73a385cd2a9bf7ad2 | 2026-11-16T22:18:30+03:00 | production home | feat(calls): surface incoming direct calls with accept and reject actions
0532fc57ae9147a1923a5be73a385cd2a9bf7ad2 | f11f953ed3b8804a857a8a49ed68e59e7e53066f | 2026-11-16T22:18:12+03:00 | production home | fix(calls): release WebRTC resources safely when call route is dismissed
f11f953ed3b8804a857a8a49ed68e59e7e53066f | 8f9393484c95ba74ffab2cf9a85653731c60c2e2 | 2026-11-16T22:18:09+03:00 | production home | fix(calls): enforce ring expiry and avoid compound-index cleanup dependency
8f9393484c95ba74ffab2cf9a85653731c60c2e2 | 42b4d4394995b290efef6590e82253b1c78ef661 | 2026-11-16T22:17:56+03:00 | production home | feat(calls): expose audio and video call actions in chat screens
42b4d4394995b290efef6590e82253b1c78ef661 | f5af668fc58f224043efb19e32be69a6afd69361 | 2026-11-16T22:17:53+03:00 | production home | feat(calls): expose audio and video call actions in chat screens
f5af668fc58f224043efb19e32be69a6afd69361 | 53cda02767e02f5a7386c8ff8f0b9e55b9a05886 | 2026-11-16T22:17:43+03:00 | production home | feat(calls): add Flutter WebRTC call screen with media controls and signaling
53cda02767e02f5a7386c8ff8f0b9e55b9a05886 | 2e8e3d8fadbc1a276da9d7d68127a79ffcf367c2 | 2026-11-16T22:17:19+03:00 | production home | feat(calls): issue short-lived authenticated TURN credentials to call participants
2e8e3d8fadbc1a276da9d7d68127a79ffcf367c2 | 7ef90d0c5e5e150468dfc82cc86d890d56854e43 | 2026-11-16T22:17:07+03:00 | production home | ci(deps): resolve Flutter lockfile on pinned SDK when dependencies change
7ef90d0c5e5e150468dfc82cc86d890d56854e43 | 61e41646463342f0776af68fc8beff7fe960a7f3 | 2026-11-16T22:17:00+03:00 | production home | feat(calls): add iOS camera permission purpose for video calls
61e41646463342f0776af68fc8beff7fe960a7f3 | b1f183cc5bc5eda7823a765fa0a249d6da2c28ee | 2026-11-16T22:16:57+03:00 | production home | feat(calls): declare Android camera and real-time media permissions
b1f183cc5bc5eda7823a765fa0a249d6da2c28ee | b0cc7c11dab7c7dce2fc46be0b3d103e140bf28b | 2026-11-16T22:16:54+03:00 | production home | feat(calls): add cross-platform WebRTC media dependency
b0cc7c11dab7c7dce2fc46be0b3d103e140bf28b | ffb28227eb8ebf368c47d2bea88fda5fafaf79bd | 2026-11-16T22:16:27+03:00 | production home | ci(calls): run WebRTC signaling lifecycle emulator integration
ffb28227eb8ebf368c47d2bea88fda5fafaf79bd | abf097045576198fce32cb0e7d8452f5786befe1 | 2026-11-16T22:16:24+03:00 | production home | test(calls): add emulator integration suite to backend test aggregator
abf097045576198fce32cb0e7d8452f5786befe1 | ff1636da80105c372d64f0d683e0702593f36912 | 2026-11-16T22:16:10+03:00 | production home | fix(calls): support multi-member room acceptance and expire stale signaling
ff1636da80105c372d64f0d683e0702593f36912 | c310674193184d7a498072589838ff312fe2f48a | 2026-11-16T22:16:06+03:00 | production home | fix(calls): validate SDP and ICE signal shapes
c310674193184d7a498072589838ff312fe2f48a | a06dcb2f35b6372c24644fffaf3f1a6d205d5d1c | 2026-11-16T22:15:35+03:00 | production home | test(calls): exercise direct call and signaling lifecycle in emulator
a06dcb2f35b6372c24644fffaf3f1a6d205d5d1c | 5f8aae21297257de038295282770f0532177377c | 2026-11-16T22:15:20+03:00 | production home | feat(calls): add authenticated call lifecycle and WebRTC signaling callables
5f8aae21297257de038295282770f0532177377c | ea77809793974e8c588de528584fdd4375ca8911 | 2026-11-16T22:14:45+03:00 | production home | test(calls): cover signaling validation and call state transitions
ea77809793974e8c588de528584fdd4375ca8911 | 30066b4ae8e7e3c1a388cad11d84d58d95e9b65a | 2026-11-16T22:14:36+03:00 | production home | feat(calls): add validated call and signaling lifecycle policy
30066b4ae8e7e3c1a388cad11d84d58d95e9b65a | c3d32d660ac9e8195ad1b13a01a87b5bbc7ad1d0 | 2026-11-16T21:59:33+03:00 | production home | test: isolate collision regression fixtures per run
c3d32d660ac9e8195ad1b13a01a87b5bbc7ad1d0 | 3ecea1b1d231dbff443cadecc9d046ade18f5779 | 2026-11-16T21:59:07+03:00 | production home | docs: trace timed-ad counter collision integration coverage
3ecea1b1d231dbff443cadecc9d046ade18f5779 | 8c228b43626cc19196641ca238726d1260d94039 | 2026-11-16T21:59:04+03:00 | production home | test: cover timed-ad legacy counter collision in emulator
8c228b43626cc19196641ca238726d1260d94039 | bc6620d04e9ac5cd26131efe863ceddab57a9eb6 | 2026-11-16T19:53:41+03:00 | production home | test: prove native portal denial survives allowlist misconfiguration
bc6620d04e9ac5cd26131efe863ceddab57a9eb6 | e73d6a553faaa1c5beeb003ba82873824739912f | 2026-11-16T19:53:36+03:00 | production home | security: hard-deny native app identities from legal portal
e73d6a553faaa1c5beeb003ba82873824739912f | 7b7822ece4fd81325552b162c40bfaa105d8d986 | 2026-11-16T19:53:11+03:00 | production home | security: test and centralize legal portal app identity guard
7b7822ece4fd81325552b162c40bfaa105d8d986 | 6e35002b7b7e9c7b415801b49b52183c4a55d7c6 | 2026-11-16T19:53:04+03:00 | production home | test: cover fail-closed web portal app identity allowlist
6e35002b7b7e9c7b415801b49b52183c4a55d7c6 | e86afc8ee40365fbb203c2b91f47f44f913104bd | 2026-11-16T19:53:02+03:00 | production home | security: isolate exact legal portal app allowlist check
e86afc8ee40365fbb203c2b91f47f44f913104bd | 9f3bc90bc17ecf4d2f381cc8ef4d5e368dc74b02 | 2026-11-16T19:48:40+03:00 | production home | docs: record exact-head green CI after media workspace test fix
9f3bc90bc17ecf4d2f381cc8ef4d5e368dc74b02 | ac82754208e3dd0092b3ebe2a9b38ad71c10e78c | 2026-11-16T19:44:47+03:00 | production home | test: assert creator contract notice before scrolling form
ac82754208e3dd0092b3ebe2a9b38ad71c10e78c | 08b8a6baa028b609feca90f5c0323fcaee5c27e1 | 2026-11-16T19:16:02+03:00 | production home | docs: record CI regression remediation and remaining gates
08b8a6baa028b609feca90f5c0323fcaee5c27e1 | 5a15641a7babcb12706e0ce8bfd2779fa89c850b | 2026-11-16T19:15:39+03:00 | production home | test(flutter): scroll through creator proposal form
5a15641a7babcb12706e0ce8bfd2779fa89c850b | 6dd53f8537b543b314f8f061e2c3bb9c731067b7 | 2026-11-16T19:15:36+03:00 | production home | test(flutter): target the outer scrollable in featured ads
6dd53f8537b543b314f8f061e2c3bb9c731067b7 | 502fd1c22cec55c3fed1c1c2f7ecc3691d159d1e | 2026-11-16T19:15:34+03:00 | production home | fix(functions): filter advertising intake by stored kind
502fd1c22cec55c3fed1c1c2f7ecc3691d159d1e | 7e761cc413f220e4e22f5e71afcb2693228f462e | 2026-11-16T19:14:09+03:00 | production home | test(flutter): assert creator portal web-only gating
7e761cc413f220e4e22f5e71afcb2693228f462e | 93136449041736c14c0f3b73db1a641711b5f123 | 2026-11-16T19:14:06+03:00 | production home | test(flutter): disambiguate featured ads scrollable
93136449041736c14c0f3b73db1a641711b5f123 | efcb7fccf58eafc2de78319e803c6f1bfa320836 | 2026-11-16T19:14:04+03:00 | production home | fix(functions): type advertising intake records explicitly
efcb7fccf58eafc2de78319e803c6f1bfa320836 | 10aae3aaf01b92f6b134b52700f26aa0a953d699 | 2026-11-16T18:49:54+03:00 | production home | docs: trace timed ad reward counter hardening
10aae3aaf01b92f6b134b52700f26aa0a953d699 | 6e25af97333c1c236d4f4a5f21fd453c7147be42 | 2026-11-16T18:49:35+03:00 | production home | test: cover collision-resistant timed ad counters
6e25af97333c1c236d4f4a5f21fd453c7147be42 | 457e7773157d6ea493ccb11bea81f2742dae6a4d | 2026-11-16T18:49:24+03:00 | production home | style: place timed ad counter import with module imports
457e7773157d6ea493ccb11bea81f2742dae6a4d | 2d3dba74195cd9c2b6bb678ea0646e38b9721a45 | 2026-11-16T18:49:10+03:00 | production home | fix: prevent timed ad reward counter key collisions
2d3dba74195cd9c2b6bb678ea0646e38b9721a45 | 76308107078af7b0a8bf579ffd012793d0eff47b | 2026-11-16T18:48:27+03:00 | production home | fix: add collision-resistant timed ad counter keys
76308107078af7b0a8bf579ffd012793d0eff47b | f8ecb025fdcba2a219962fd26100f39f636b77e8 | 2026-11-16T18:40:47+03:00 | production home | docs: trace atomic advertising review audit
f8ecb025fdcba2a219962fd26100f39f636b77e8 | 29292dda48eb488a2857223ef87b35d620e1de1f | 2026-11-16T18:40:39+03:00 | production home | test: cover versioned advertising review audit IDs
29292dda48eb488a2857223ef87b35d620e1de1f | 78738169ea658cf50f19a215e98f1ea620054cde | 2026-11-16T18:40:29+03:00 | production home | refactor: centralize advertising review audit identity
78738169ea658cf50f19a215e98f1ea620054cde | 345eaf005603294c9eaaa4be2d4461abe774385c | 2026-11-16T18:40:22+03:00 | production home | feat: add stable advertising review audit identifiers
345eaf005603294c9eaaa4be2d4461abe774385c | 903fc7a436b77c0d2414726d12c0023476537edf | 2026-11-16T18:40:15+03:00 | production home | fix: atomically audit advertising intake reviews
903fc7a436b77c0d2414726d12c0023476537edf | 728717b9cf2977a88935a6ea3bedeab0338cdccf | 2026-11-16T18:39:31+03:00 | production home | docs: trace advertising intake audit retry hardening
728717b9cf2977a88935a6ea3bedeab0338cdccf | 00c92e8df5195e898cb2461f6b3faeb8034bfd81 | 2026-11-16T18:39:18+03:00 | production home | test: cover stable advertising intake audit IDs
00c92e8df5195e898cb2461f6b3faeb8034bfd81 | bc304a375dc6f76f6418ab4b50ea519234ee745e | 2026-11-16T18:39:08+03:00 | production home | refactor: centralize advertising intake audit identity
bc304a375dc6f76f6418ab4b50ea519234ee745e | ed70c8cd09d7294865cff589ec337cefb121a8ca | 2026-11-16T18:38:57+03:00 | production home | feat: add stable advertising intake audit identifiers
ed70c8cd09d7294865cff589ec337cefb121a8ca | 12a184fcaa9f7633a2ef8e27e3c05ef38aaf8624 | 2026-11-16T18:38:47+03:00 | production home | fix: make advertising intake audit retry-safe
12a184fcaa9f7633a2ef8e27e3c05ef38aaf8624 | 176d87051f81909c813bac45d52f813e034c56db | 2026-11-16T14:37:17+03:00 | production home | docs: trace media boundary tests and policy alignment
176d87051f81909c813bac45d52f813e034c56db | 4f23ba6f489e593449d30cfca79b99bda1958f7e | 2026-11-16T14:37:09+03:00 | production home | docs(media): align policy comments with retention implementation
4f23ba6f489e593449d30cfca79b99bda1958f7e | f6c57d2cc90b675b460b06e302da0d8bcb354f7b | 2026-11-16T14:37:04+03:00 | production home | docs(scanner): describe implemented safe media pipelines
f6c57d2cc90b675b460b06e302da0d8bcb354f7b | e973129c24fb5685e2dcf1e3b066571f4e130876 | 2026-11-16T14:36:57+03:00 | production home | test(media): cover exact 60-second audio boundary
e973129c24fb5685e2dcf1e3b066571f4e130876 | 58cfab19f98c9ebb634547386a2996a1f24e9317 | 2026-11-16T14:32:42+03:00 | production home | docs: trace store purchase replay validation
58cfab19f98c9ebb634547386a2996a1f24e9317 | 282bd777367d976cb7129498c102c896329d8ab9 | 2026-11-16T14:32:32+03:00 | production home | test(economy): cover conflicting store purchase replays
282bd777367d976cb7129498c102c896329d8ab9 | 3a7b76f41564a6d8c7bc09a5ce50d72356294448 | 2026-11-16T14:32:26+03:00 | production home | fix(economy): bind purchase retries to confirmed price
3a7b76f41564a6d8c7bc09a5ce50d72356294448 | 5ece220a3d99cefde288e3b13786aafe006f0fda | 2026-11-16T14:32:19+03:00 | production home | fix(economy): validate store purchase replay price
5ece220a3d99cefde288e3b13786aafe006f0fda | 32d3bffb293b8e5e43de40c58c97c6d112e9a7c5 | 2026-11-16T14:31:28+03:00 | production home | docs: record inactive room invitation guard
32d3bffb293b8e5e43de40c58c97c6d112e9a7c5 | 64f2e9c8710dd36d867e08387e5f338e6de3d7a0 | 2026-11-16T14:31:21+03:00 | production home | test(rooms): reject invitations after room closure
64f2e9c8710dd36d867e08387e5f338e6de3d7a0 | 9c586925c15ffadafcd7daa7424cd14830740aeb | 2026-11-16T14:31:14+03:00 | production home | fix(rooms): reject invitations to inactive rooms
9c586925c15ffadafcd7daa7424cd14830740aeb | b8b61fe42f91fe59bd6baa8d747a7187db5870d5 | 2026-11-16T14:23:08+03:00 | production home | docs: trace room rental idempotency safeguards
b8b61fe42f91fe59bd6baa8d747a7187db5870d5 | e66b74ad64d67351fa391832ac2c9026e450035b | 2026-11-16T14:22:55+03:00 | production home | docs: record room rental lifecycle hardening
e66b74ad64d67351fa391832ac2c9026e450035b | 5de6a9e3309f75cd4ba59bb3df309663ed4f3446 | 2026-11-16T14:22:44+03:00 | production home | test: verify superseded rental state after renewal
5de6a9e3309f75cd4ba59bb3df309663ed4f3446 | c244e81c90c84fe7609a218ceff8fa9a4e610b41 | 2026-11-16T14:22:33+03:00 | production home | fix: close prior rental lifecycle when renewing a room
c244e81c90c84fe7609a218ceff8fa9a4e610b41 | 3782b0576a3e494d8027e355e388298925e194ca | 2026-11-16T14:22:19+03:00 | production home | test: reject conflicting room rental idempotency replays
3782b0576a3e494d8027e355e388298925e194ca | 3cea8c1edcba7a3588ff2ba21f9becd91c5af6f9 | 2026-11-16T14:22:10+03:00 | production home | fix: bind room rental idempotency keys to original request details
3cea8c1edcba7a3588ff2ba21f9becd91c5af6f9 | 058743e88749f9b872617a5ea56c96c3fae5d349 | 2026-11-16T13:56:34+03:00 | production home | docs: record App Check client integration blocker
058743e88749f9b872617a5ea56c96c3fae5d349 | ae39f1d5c7f80fc2299a9ec099680f5ce0090c1d | 2026-11-16T13:56:32+03:00 | production home | docs: record web portal App Check integration blocker
ae39f1d5c7f80fc2299a9ec099680f5ce0090c1d | 3d53cc541d44392e7cf111c90b1ad912093e79c2 | 2026-11-16T13:54:47+03:00 | production home | docs: note optional creative trial consent correction
3d53cc541d44392e7cf111c90b1ad912093e79c2 | ed2f5330260f5dd25e95e70ed069918766fde388 | 2026-11-16T13:54:44+03:00 | production home | docs: record voluntary production trial consent
ed2f5330260f5dd25e95e70ed069918766fde388 | 210a2f62b27539c80246389d579d7810490cfc04 | 2026-11-16T13:54:35+03:00 | production home | fix: keep creative trial consent optional for applicants
210a2f62b27539c80246389d579d7810490cfc04 | b77883c5a0faf065fa5c205666e8c8dccc61a98d | 2026-11-16T13:53:44+03:00 | production home | docs: update execution baseline with audit atomicity fix
b77883c5a0faf065fa5c205666e8c8dccc61a98d | 44d2b37bc546aa1245ca5309edba8cc16da40e03 | 2026-11-16T13:53:42+03:00 | production home | docs: record atomic production application review audit
44d2b37bc546aa1245ca5309edba8cc16da40e03 | 08387a13f5e31fce2819c31496d375481990007f | 2026-11-16T13:53:30+03:00 | production home | fix: commit production application review and audit atomically
08387a13f5e31fce2819c31496d375481990007f | f3e91e4aced58e3f58ac0b3f6393f6960dc6cad0 | 2026-11-16T13:47:55+03:00 | production home | Retry-safe production application audit event
f3e91e4aced58e3f58ac0b3f6393f6960dc6cad0 | 5f963ec1b12537a5d779812322d061d61d1c1356 | 2026-11-16T13:47:29+03:00 | production home | Require Firebase App Check on every web-only contract and intake callable
5f963ec1b12537a5d779812322d061d61d1c1356 | 530853bb3261bbb0f88b91808fb1c49284face83 | 2026-11-16T13:47:15+03:00 | production home | Trace production application workflow and web-only legal boundary
530853bb3261bbb0f88b91808fb1c49284face83 | 2ee99c21d9ee9dcacda257a7dd03f6a0073915f6 | 2026-11-16T13:47:12+03:00 | production home | Record production application implementation and remaining gates
2ee99c21d9ee9dcacda257a7dd03f6a0073915f6 | 385e1a13d28ab3f89a5fff9cac9d1937532585e5 | 2026-11-16T13:46:46+03:00 | production home | Connect production application review to web-only owner console
385e1a13d28ab3f89a5fff9cac9d1937532585e5 | 7ac6467978e6d195f5636a85cbe6cdba568a762f | 2026-11-16T13:46:38+03:00 | production home | Add owner review console for production membership applications
7ac6467978e6d195f5636a85cbe6cdba568a762f | bc6052550dcf21ea01184a66799846c2f99cbf37 | 2026-11-16T13:46:20+03:00 | production home | Connect web-only production membership applications in Media Workspace
bc6052550dcf21ea01184a66799846c2f99cbf37 | 4b6c2f3b870b677d0c3c50d159cf46765063ad59 | 2026-11-16T13:46:09+03:00 | production home | Add web-only Mawdda production membership application form
4b6c2f3b870b677d0c3c50d159cf46765063ad59 | 301d35cf9bf6d02e2cb7b4f40e55984a78482eb9 | 2026-11-16T13:45:46+03:00 | production home | Implement web-only production membership application and owner review callables
301d35cf9bf6d02e2cb7b4f40e55984a78482eb9 | bd1cab8f9a87d73880bfe809c560f5de7ced29e6 | 2026-11-16T13:43:57+03:00 | production home | Apply web and desktop-only channel clause across contract templates
bd1cab8f9a87d73880bfe809c560f5de7ced29e6 | e491771de95623c1dfd29e51e9d89474050780cc | 2026-11-16T13:43:54+03:00 | production home | Clarify web and desktop-only legal portal policy
e491771de95623c1dfd29e51e9d89474050780cc | 88d840007970b8adde49ef3af236a04b70cab7ff | 2026-11-16T13:43:34+03:00 | production home | Allow only explicitly registered legal web and desktop portal App Check identities
88d840007970b8adde49ef3af236a04b70cab7ff | 004e960260a9f08c0f8ab6e9d2e36e95a5b8844b | 2026-11-16T13:42:38+03:00 | production home | Add web-only channel clause to all contract templates
004e960260a9f08c0f8ab6e9d2e36e95a5b8844b | a2dd9fa7696ad8d19e6a2f2b4047317a2edccde8 | 2026-11-16T13:42:36+03:00 | production home | Document mandatory web-only legal and professional workflows
a2dd9fa7696ad8d19e6a2f2b4047317a2edccde8 | db695c6afd923bd506499131a3129691e44e1953 | 2026-11-16T13:42:11+03:00 | production home | Show owner contract and intake consoles only on web
db695c6afd923bd506499131a3129691e44e1953 | 1921a64b290db8d0054259ea56820bcea3777bf1 | 2026-11-16T13:41:53+03:00 | production home | Enforce web App Check identity for contract and creator workflows
1921a64b290db8d0054259ea56820bcea3777bf1 | bd53a62c5d0a4871396529fb74d9cf47b2fbb0ab | 2026-11-16T13:41:23+03:00 | production home | Fix web-only Media Workspace entry declarations
bd53a62c5d0a4871396529fb74d9cf47b2fbb0ab | dd6a55d1e194d89e203564aa0526525b5d02950b | 2026-11-16T13:41:15+03:00 | production home | Restrict contracts, representative and creator workflows to Mawdda web portal
dd6a55d1e194d89e203564aa0526525b5d02950b | fb66e2acdab6df62c8c346294d594ea3f31df005 | 2026-11-16T13:40:25+03:00 | production home | Add structured validation for Mawdda production membership applications
fb66e2acdab6df62c8c346294d594ea3f31df005 | b2f830ce67888d2a5b1feba4b7648e66c5bae256 | 2026-11-16T13:39:56+03:00 | production home | Constrain advertising intake review transitions and avoid compound index dependency
b2f830ce67888d2a5b1feba4b7648e66c5bae256 | 90ad904bd6609f2a0bf9b734639cee52ad2a2554 | 2026-11-16T13:39:36+03:00 | production home | Add owner advertising intake review to Super Admin console
90ad904bd6609f2a0bf9b734639cee52ad2a2554 | 0ec2028e077347aaaecdc00c963f0241fc70b77f | 2026-11-16T13:39:29+03:00 | production home | Add owner review console for advertising intake and representative applications
0ec2028e077347aaaecdc00c963f0241fc70b77f | 116b9701c8e68464e98c62ec139a0d98655c1483 | 2026-11-16T13:39:11+03:00 | production home | Connect representative and direct advertiser intake forms to Media Workspace
116b9701c8e68464e98c62ec139a0d98655c1483 | 589947f38072643a6769f6a81b9fe31b83805b71 | 2026-11-16T13:39:03+03:00 | production home | Add member-facing advertising representative and direct advertiser request forms
589947f38072643a6769f6a81b9fe31b83805b71 | 5b544019d0c0024f347f5e380af8a6a78f1376b6 | 2026-11-16T13:38:43+03:00 | production home | Avoid undefined Firestore fields in advertising intake records
5b544019d0c0024f347f5e380af8a6a78f1376b6 | 3718d6b666c3a7c04454effabaf14cb7692b8a81 | 2026-11-16T13:38:30+03:00 | production home | Implement server-owned advertising intake and owner review lifecycle
3718d6b666c3a7c04454effabaf14cb7692b8a81 | 4c1afb43cd70ad3ce41365fa7b850d1108abdb6b | 2026-11-16T13:38:13+03:00 | production home | Add strict validation for representative and direct advertiser intake
4c1afb43cd70ad3ce41365fa7b850d1108abdb6b | 3e05f6a78c629aaf9338a5c259956c4a79875baf | 2026-11-16T13:32:59+03:00 | production home | Keep creator route visible before scrolling the workspace menu
3e05f6a78c629aaf9338a5c259956c4a79875baf | 01f65407679244154f6e5b27b353a99dcac3e3ca | 2026-11-16T13:32:48+03:00 | production home | Scroll Media Workspace widget tests to lazily built menu entries
01f65407679244154f6e5b27b353a99dcac3e3ca | 79fd096d8c9252f5904951b47bf19b7801a05fb4 | 2026-11-16T13:32:45+03:00 | production home | Fix featured ad tests for combined geography notice and scrollable reward history
79fd096d8c9252f5904951b47bf19b7801a05fb4 | 8da151cb73a8b2e50e58d386779aa4e55c662033 | 2026-11-16T13:32:42+03:00 | production home | Correct ad reward page scope and show approved rolling campaign cap honestly
8da151cb73a8b2e50e58d386779aa4e55c662033 | 9555f63ac58bed1d4eaaa4b6b87c77c9d9bf615a | 2026-11-16T13:30:36+03:00 | production home | Use inferred Firestore document reference type for contract audit events
9555f63ac58bed1d4eaaa4b6b87c77c9d9bf615a | 32f300865918d58bd56626a7ae6d7fb1aff150bc | 2026-11-16T13:30:28+03:00 | production home | Stage contract audit chain reads before transactional writes
32f300865918d58bd56626a7ae6d7fb1aff150bc | 4e45cea06f1380a5bfa865017153540f3c2998ee | 2026-11-16T13:29:59+03:00 | production home | Make contract lifecycle audit events hash chained and atomic with each transaction
4e45cea06f1380a5bfa865017153540f3c2998ee | 618b63d05b951ba8d18b9806c4f19c1ce7d969d2 | 2026-11-16T13:29:05+03:00 | production home | Validate contract commitment amount and clarify in-app signature availability
618b63d05b951ba8d18b9806c4f19c1ce7d969d2 | adf77c8e0d976516dcf64fc242385c3d17be8fd4 | 2026-11-16T13:28:53+03:00 | production home | Replace deprecated dropdown value with initialValue
adf77c8e0d976516dcf64fc242385c3d17be8fd4 | 92f0f11124833c8714b02a32ceb37ba69b128eb9 | 2026-11-16T13:28:49+03:00 | production home | Replace deprecated dropdown value with initialValue
92f0f11124833c8714b02a32ceb37ba69b128eb9 | de45d123f00e824515c3aa8aa62dd817ef4002d4 | 2026-11-16T13:27:43+03:00 | production home | Record Damascus head office and subordinate office structure
de45d123f00e824515c3aa8aa62dd817ef4002d4 | c79e3c5b376f916dd1fdf1967a617a713a0a161c | 2026-11-16T13:27:40+03:00 | production home | Document company office hierarchy and contract center workflow
c79e3c5b376f916dd1fdf1967a617a713a0a161c | 68f763df8002a39f8fbf432d8b381dcbb58995ca | 2026-11-16T13:27:00+03:00 | production home | Provide a unique idempotency key for contract draft creation
68f763df8002a39f8fbf432d8b381dcbb58995ca | 8a95b017d059cf2c27d457ab55ad8c7820a2b24a | 2026-11-16T13:26:56+03:00 | production home | Make contract draft creation idempotent and bind retries to identical content
8a95b017d059cf2c27d457ab55ad8c7820a2b24a | ebdfbb16a158f0c56b51a0c6e9392617f5ee9561 | 2026-11-16T13:26:34+03:00 | production home | Assert member contract inbox is available in Media Workspace
ebdfbb16a158f0c56b51a0c6e9392617f5ee9561 | 2698137cb2d7f96a1e7fc67532a2b3d96ccbaaa2 | 2026-11-16T13:26:28+03:00 | production home | Expose member contract inbox in Media Workspace
2698137cb2d7f96a1e7fc67532a2b3d96ccbaaa2 | 1a38331d2d981304d67d94c3195507b3d20991ed | 2026-11-16T13:26:22+03:00 | production home | Add member contract inbox and verified counterparty signing flow
1a38331d2d981304d67d94c3195507b3d20991ed | 059b4b8db547391a7fdad7d998cf9384b93317ec | 2026-11-16T13:25:41+03:00 | production home | Capture reason before contract cancellation suspension or termination
059b4b8db547391a7fdad7d998cf9384b93317ec | b7c648daff7e86fd2a766c313ff8a95eb725bfcd | 2026-11-16T13:25:37+03:00 | production home | Require documented reasons for contract suspension cancellation and termination
b7c648daff7e86fd2a766c313ff8a95eb725bfcd | 5de38193346f7e2d136a57b7c1521103d41beec4 | 2026-11-16T13:24:59+03:00 | production home | Expose contract center in Super Admin controls
5de38193346f7e2d136a57b7c1521103d41beec4 | 31766848de7908d22c9dd7a7822e5ae89877fdf2 | 2026-11-16T13:24:56+03:00 | production home | Make contract lifecycle actions explicit Dart switch branches
31766848de7908d22c9dd7a7822e5ae89877fdf2 | 1b432d7ee6ddb65e9e0e62122028185a6e3fe1b5 | 2026-11-16T13:24:40+03:00 | production home | Add owner contract center UI for drafts and signature lifecycle
1b432d7ee6ddb65e9e0e62122028185a6e3fe1b5 | 301ec2f5ac3612685b17e074f3aefc04859da28c | 2026-11-16T13:24:00+03:00 | production home | Avoid unnecessary composite index for owner contract list
301ec2f5ac3612685b17e074f3aefc04859da28c | 1c7b4fd3a5474d6f47367b8a669acd0cf0c7bc01 | 2026-11-16T13:23:30+03:00 | production home | Add owner-controlled contract center and verified signature callables
1c7b4fd3a5474d6f47367b8a669acd0cf0c7bc01 | c0a86886ec8eb97a62fb2abf6e2792b9f17acc9e | 2026-11-16T13:22:14+03:00 | production home | Test contract lifecycle, identity, version and signature gates
c0a86886ec8eb97a62fb2abf6e2792b9f17acc9e | 7017c0c36c673fd0fc6c23596e1ca9728338b82b | 2026-11-16T13:22:11+03:00 | production home | Add validated contract lifecycle and signature evidence domain
7017c0c36c673fd0fc6c23596e1ca9728338b82b | fdb07a1793010c6282d7a4ea3a740f850f854d0f | 2026-11-16T13:20:32+03:00 | production home | Cover corrected Media Workspace routes and creator intake
fdb07a1793010c6282d7a4ea3a740f850f854d0f | 7b4560f39484216a9d59d6cd2924c20858d33144 | 2026-11-16T13:20:29+03:00 | production home | Fix duplicated Media Workspace creator intake and align approved routes
7b4560f39484216a9d59d6cd2924c20858d33144 | 397eb06767fc19984d3c8878b82314d6387b8293 | 2026-11-16T12:35:38+03:00 | production home | Add official company and Mawdda contract header specification
397eb06767fc19984d3c8878b82314d6387b8293 | 6956171e99fd7ab352d87291b4afe4a58c10540b | 2026-11-16T12:35:35+03:00 | production home | Document official brand asset placement for advertising system
6956171e99fd7ab352d87291b4afe4a58c10540b | 2c48980a315be5b1841206398a0341cd04990ce2 | 2026-11-16T12:35:09+03:00 | production home | Use stable IDs for owner-managed advertising role grants
2c48980a315be5b1841206398a0341cd04990ce2 | c89f563bad24d3e6a2a3f6e37d2a5e98373198b0 | 2026-11-16T12:35:07+03:00 | production home | Test stable specialized role grant identity
c89f563bad24d3e6a2a3f6e37d2a5e98373198b0 | 7292e6100231e8e1dd3ee0a26f7f065cc8e217b0 | 2026-11-16T12:35:04+03:00 | production home | Stabilize specialized role grant identity
7292e6100231e8e1dd3ee0a26f7f065cc8e217b0 | c936eb379a7d5dc53eabe281e9f0735b949b5f1a | 2026-11-16T12:28:43+03:00 | production home | fix: accept valid Firebase UID punctuation in specialized grants
c936eb379a7d5dc53eabe281e9f0735b949b5f1a | bf4deffe401234308e8145a9ca1290bafb7d7ff7 | 2026-11-16T12:28:30+03:00 | production home | docs: link advertising governance and decision traceability
bf4deffe401234308e8145a9ca1290bafb7d7ff7 | 47fc347529294d9440473d15c3377124b9c45f69 | 2026-11-16T12:28:26+03:00 | production home | docs: link advertising governance and decision traceability
47fc347529294d9440473d15c3377124b9c45f69 | 3d9ab23f72970ec8d098d5257220da8e1b3501a7 | 2026-11-16T12:28:22+03:00 | production home | docs: link advertising governance and decision traceability
3d9ab23f72970ec8d098d5257220da8e1b3501a7 | 18dee90da08d9ab9bd6dcbaf9254def56af37f47 | 2026-11-16T12:27:36+03:00 | production home | feat: add owner-managed scoped advertising role grants
18dee90da08d9ab9bd6dcbaf9254def56af37f47 | 03b2ecbae84afffb59b1c0b0e2bce697f90881ed | 2026-11-16T12:26:59+03:00 | production home | test: cover advertising governance permission boundaries
03b2ecbae84afffb59b1c0b0e2bce697f90881ed | 56f44364625095364c2f57a93687f2b0058fff81 | 2026-11-16T12:26:57+03:00 | production home | feat: add isolated advertising governance authorization primitives
56f44364625095364c2f57a93687f2b0058fff81 | 593a42983afd60a3ae44374dba44d6eb5463c632 | 2026-11-16T12:26:23+03:00 | production home | docs: add advertising and production contract templates
593a42983afd60a3ae44374dba44d6eb5463c632 | 6c67667532c359d512e585b8cef72d18e5eae9b6 | 2026-11-16T12:26:20+03:00 | production home | docs: add owner-approved advertising and production governance
6c67667532c359d512e585b8cef72d18e5eae9b6 | bdc3266309ae34902ca63482b8f78dc98ba5a4d2 | 2026-11-16T06:44:27+03:00 | production home | test: align Media Workspace test title with six approved routes
bdc3266309ae34902ca63482b8f78dc98ba5a4d2 | c53700a6ae63930779aad3aedcc50ba11a727a25 | 2026-11-16T06:44:13+03:00 | production home | docs: clarify featured ads scaffolding and server integration gate
c53700a6ae63930779aad3aedcc50ba11a727a25 | 92295ca520ef3862143c368923bd57364de32893 | 2026-11-16T06:43:11+03:00 | production home | docs: track featured ad reward policy module and integration gaps
92295ca520ef3862143c368923bd57364de32893 | 5c6be8f944954b87a74d6fc49a9e4cf7e4d39c42 | 2026-11-16T06:42:54+03:00 | production home | test: cover featured ad reward policy and caps
5c6be8f944954b87a74d6fc49a9e4cf7e4d39c42 | d33940220f3124552512d67644eb8c5a1a89b804 | 2026-11-16T06:42:52+03:00 | production home | feat: add featured ad reward eligibility policy module
d33940220f3124552512d67644eb8c5a1a89b804 | c2cd2b29b945ed967ca969499f4239b3f561f07e | 2026-11-16T06:42:18+03:00 | production home | test: cover featured ad rewards route in Media Workspace
c2cd2b29b945ed967ca969499f4239b3f561f07e | 8e113aef6b8125aa9b49d2758b866c2aa21d22ce | 2026-11-16T06:42:16+03:00 | production home | docs: include sixth Media Workspace reward route in charter
8e113aef6b8125aa9b49d2758b866c2aa21d22ce | f31ad0b59061c3f1f9757509f56e266776f54c06 | 2026-11-16T06:42:14+03:00 | production home | docs: include featured ad reward history route in product vision
f31ad0b59061c3f1f9757509f56e266776f54c06 | 2b37f0c1073838ca31e055b75ebe5d4c8b280eed | 2026-11-16T06:42:12+03:00 | production home | docs: record featured ad entry UI progress and remaining backend gaps
2b37f0c1073838ca31e055b75ebe5d4c8b280eed | 65951d6074308a58fd64afc7685a549f65c929d1 | 2026-11-16T06:41:57+03:00 | production home | test: cover featured ads discovery and reward guidance screens
65951d6074308a58fd64afc7685a549f65c929d1 | d4efb8089fcc6370dee6ac79b3d21c94740f4a6b | 2026-11-16T06:41:55+03:00 | production home | feat: add featured ad reward history route to Media Workspace
d4efb8089fcc6370dee6ac79b3d21c94740f4a6b | 6d6b5705dbc9ca7910f62b0e49cd55f9902fe67c | 2026-11-16T06:41:52+03:00 | production home | feat: add direct featured ads entry to member home
6d6b5705dbc9ca7910f62b0e49cd55f9902fe67c | b9e91096994f72c4cfaec484c0bb12caaf8d5325 | 2026-11-16T06:41:49+03:00 | production home | feat: add featured ads discovery and reward guidance screens
b9e91096994f72c4cfaec484c0bb12caaf8d5325 | 76a911133b872af047a530d39025d2d0b9bc17b3 | 2026-11-16T06:41:17+03:00 | production home | fix: remove duplicate crypto createHash import
76a911133b872af047a530d39025d2d0b9bc17b3 | 2acaf121cc34033e41edafd04b4ac683766e4727 | 2026-11-16T06:41:14+03:00 | production home | docs: add featured ad rewards destination to master charter
2acaf121cc34033e41edafd04b4ac683766e4727 | 2c0fcb527045dbb2bb815fe7fe50f2623c11bdd1 | 2026-11-16T06:41:11+03:00 | production home | docs: add featured ad reward entry to product vision
2c0fcb527045dbb2bb815fe7fe50f2623c11bdd1 | 27bee93a564379b7fbf069419ef962a21bac76d5 | 2026-11-16T06:41:09+03:00 | production home | docs: track featured ad rewards entry implementation
27bee93a564379b7fbf069419ef962a21bac76d5 | ce4efa179044d2b046724e4b9272263a20e2c091 | 2026-11-16T06:41:07+03:00 | production home | docs: record featured ad rewards entry decision
ce4efa179044d2b046724e4b9272263a20e2c091 | e5034d0f1d66e77e322116c45a9f04bc8023b622 | 2026-11-16T06:41:04+03:00 | production home | docs: approve featured ads home entry and reward history route
e5034d0f1d66e77e322116c45a9f04bc8023b622 | c3bd17d2f2917b7bedc62814befabcaad70c58be | 2026-11-16T06:29:30+03:00 | production home | docs: add Media Workspace scope to master development charter
c3bd17d2f2917b7bedc62814befabcaad70c58be | 9678675b18f96d343887dfd2698971d5d280de40 | 2026-11-16T06:29:27+03:00 | production home | docs: include approved Media Workspace and creator routes in product vision
9678675b18f96d343887dfd2698971d5d280de40 | 3e2bb911fb7755c1bc8ff0014125495f9b63cb72 | 2026-11-16T06:28:23+03:00 | production home | security: require verified member email for creator proposals
3e2bb911fb7755c1bc8ff0014125495f9b63cb72 | cb1bd3538abe1c98a6b2969d0cfe3bebcaf88ef9 | 2026-11-16T06:28:20+03:00 | production home | test: require explicit creator commercial proposal choice
cb1bd3538abe1c98a6b2969d0cfe3bebcaf88ef9 | cbe4c3e3d9f09b39bb0ce6ef6349406ec4012ce3 | 2026-11-16T06:28:18+03:00 | production home | fix: require explicit creator quote or budget choice
cbe4c3e3d9f09b39bb0ce6ef6349406ec4012ce3 | 4bee60bb5fc1c373192d1e11d21ce431cfec9c7e | 2026-11-16T06:27:52+03:00 | production home | docs: record first creator proposal implementation slice
4bee60bb5fc1c373192d1e11d21ce431cfec9c7e | f1f7b7faae7f0fbf35fa0eeb16e851e054f9654c | 2026-11-16T06:27:50+03:00 | production home | test: reject unsupported creator proposal geographies
f1f7b7faae7f0fbf35fa0eeb16e851e054f9654c | 76673689c9cf8dd98b2b45b3d59a36fec96dc6a1 | 2026-11-16T06:27:48+03:00 | production home | feat: constrain creator proposals to approved geographic scopes
76673689c9cf8dd98b2b45b3d59a36fec96dc6a1 | 999520880968588eb47e07d6691a362bfb70a818 | 2026-11-16T06:27:23+03:00 | production home | fix: correct creator budget decimal input validation
999520880968588eb47e07d6691a362bfb70a818 | 6cb5c79af23bb6b15520bdd12cafd8aaf413a4e4 | 2026-11-16T06:27:21+03:00 | production home | fix: correct creator budget decimal validation regex
6cb5c79af23bb6b15520bdd12cafd8aaf413a4e4 | fb36adcdf3e516b4015fc11b6621a87fcc979447 | 2026-11-16T06:27:10+03:00 | production home | fix: avoid assuming currency minor-unit exponent in creator form
fb36adcdf3e516b4015fc11b6621a87fcc979447 | b2d5f7a78c7a6fa0d9365c44c70d45b6fa0583a4 | 2026-11-16T06:27:08+03:00 | production home | test: validate proposed creator budget as decimal text
b2d5f7a78c7a6fa0d9365c44c70d45b6fa0583a4 | b59c204c6696c2fa4cd581191c7be0ec316fcc04 | 2026-11-16T06:27:05+03:00 | production home | fix: preserve proposed budget without currency exponent assumptions
b59c204c6696c2fa4cd581191c7be0ec316fcc04 | 7a7eeac3e5b8af36b9be5ed4a6e201fa29027467 | 2026-11-16T06:26:24+03:00 | production home | test: cover Media Workspace creator proposal navigation
7a7eeac3e5b8af36b9be5ed4a6e201fa29027467 | d64f2bdbcd22646940f42ce4bbdee82f55a9fc4b | 2026-11-16T06:26:22+03:00 | production home | feat: add Media Workspace entry to member home
d64f2bdbcd22646940f42ce4bbdee82f55a9fc4b | c955b0aaf7cf5fa7845b63c6902425cb2ea704b8 | 2026-11-16T06:26:19+03:00 | production home | feat: add Media Workspace and creator proposal form
c955b0aaf7cf5fa7845b63c6902425cb2ea704b8 | dc2a6d2c12b688b7aa44f3438fb62ab14583e40f | 2026-11-16T06:24:59+03:00 | production home | feat: add private idempotent creator proposal submission
dc2a6d2c12b688b7aa44f3438fb62ab14583e40f | 88286f1a32f216d7b2760cd91a1062e1426f3e4f | 2026-11-16T06:24:56+03:00 | production home | test: cover creator proposal intake validation
88286f1a32f216d7b2760cd91a1062e1426f3e4f | e57fdf4469a7942eb7c8cf4b4d0be05d0f096c9d | 2026-11-16T06:24:53+03:00 | production home | feat: add creator proposal intake validation
e57fdf4469a7942eb7c8cf4b4d0be05d0f096c9d | 7f80d29ec7ceaa0472d026d07fb1bbff93eaeeda | 2026-11-16T06:23:38+03:00 | production home | docs: record owner approval for creator proposals
7f80d29ec7ceaa0472d026d07fb1bbff93eaeeda | 7c136321f1802d50b080174166a2fa0a7681d502 | 2026-11-16T06:23:35+03:00 | production home | docs: track creator proposal workflow implementation
7c136321f1802d50b080174166a2fa0a7681d502 | 85db041cc2e57c863f515ba371f9ef6a24996b8d | 2026-11-16T06:23:32+03:00 | production home | docs: approve creator proposals as fifth Media Workspace route
85db041cc2e57c863f515ba371f9ef6a24996b8d | 01eb339dd15cae39ca1ceec274c04950b568ff05 | 2026-11-16T06:18:17+03:00 | production home | docs(traceability): track advertising and media workspace implementation gates
01eb339dd15cae39ca1ceec274c04950b568ff05 | 0f0a882ccc78717d0ba550283c8959328ee3f5ec | 2026-11-16T06:17:37+03:00 | production home | test(advertising): cover featured showcase selection policy
0f0a882ccc78717d0ba550283c8959328ee3f5ec | dfd602929a2ea3df6a11f91f430c6f51b9050cbf | 2026-11-16T06:17:35+03:00 | production home | feat(advertising): add featured showcase selection policy
dfd602929a2ea3df6a11f91f430c6f51b9050cbf | a8b57d5878ea6fa4e8b1505afa3a58c390d4ff87 | 2026-11-16T06:16:15+03:00 | production home | docs(advertising): specify owner-approved featured preview modes
a8b57d5878ea6fa4e8b1505afa3a58c390d4ff87 | 9a6456dafd6db5306d951bf810d6951c355558aa | 2026-11-16T06:10:33+03:00 | production home | docs: reconcile Watch Ads reward policy and legacy client defaults
9a6456dafd6db5306d951bf810d6951c355558aa | 4f52cb2aa9c35cfdcd9e1564c990a0838d783204 | 2026-11-16T06:10:20+03:00 | production home | docs: specify rewarded ad viewing layout and provisional rewards
4f52cb2aa9c35cfdcd9e1564c990a0838d783204 | 0b288c9ad0a9b3be70660c2195b0443068b36c1f | 2026-11-16T06:05:10+03:00 | production home | docs: separate Media Workspace from Watch Ads on homepage
0b288c9ad0a9b3be70660c2195b0443068b36c1f | 7ff8f26715d6ced21b0df9799c47aaf5406caf88 | 2026-11-16T05:54:35+03:00 | production home | docs: record initial advertising permission helper status
7ff8f26715d6ced21b0df9799c47aaf5406caf88 | bbfb7d18da793b89746509b2ec743b81705400e5 | 2026-11-16T05:54:16+03:00 | production home | test: cover advertising supervisor delegation and owner gates
bbfb7d18da793b89746509b2ec743b81705400e5 | b9ca50f21b5e1df10fd541634433236a22476fc2 | 2026-11-16T05:54:14+03:00 | production home | feat: add fail-closed advertising supervisor permission model
b9ca50f21b5e1df10fd541634433236a22476fc2 | a1da56ed6c37db488c773132899150b13f63f8bf | 2026-11-16T05:53:26+03:00 | production home | docs: clarify owner-approved advertising supervisor and workspace governance
a1da56ed6c37db488c773132899150b13f63f8bf | a62883622d39ab3e5240674facd95b20ff306f75 | 2026-11-16T05:52:47+03:00 | production home | docs: specify advertising media workspace and delegated supervisor controls
a62883622d39ab3e5240674facd95b20ff306f75 | 143b72dd45ffcb2427f32f56066c16678d87b69b | 2026-11-16T05:52:44+03:00 | production home | docs: align advertising representative agreement with owner-approved workflow
143b72dd45ffcb2427f32f56066c16678d87b69b | 3bf0bf0a529be542760e17920683d73dcb988e00 | 2026-11-16T04:48:01+03:00 | production home | docs: remove global ad commission from moderator agreement
3bf0bf0a529be542760e17920683d73dcb988e00 | fe359fadec6c8c660658ad2790380e36e15641eb | 2026-11-16T04:47:50+03:00 | production home | docs: make advertising commission per-ad only
fe359fadec6c8c660658ad2790380e36e15641eb | 13a3643bb04b4e4a4d1066672813cbe0ac69be77 | 2026-11-16T04:47:30+03:00 | production home | docs: define per-campaign ad commission and moderator agreement
13a3643bb04b4e4a4d1066672813cbe0ac69be77 | 0006e266df1d90b7e2567f0bc16bba4e1659d156 | 2026-11-16T04:47:19+03:00 | production home | docs: add advertising moderator commission agreement draft
0006e266df1d90b7e2567f0bc16bba4e1659d156 | bf750ef924bbc3f118b41cc69d77c7fad95475c1 | 2026-11-16T04:38:59+03:00 | production home | docs: clarify shared ad review and owner-controlled commission
bf750ef924bbc3f118b41cc69d77c7fad95475c1 | 968217bb8fb6071006e45338ea7cd561f634352f | 2026-11-16T04:33:42+03:00 | production home | docs: correct ad moderator scopes pricing and duration workflow
968217bb8fb6071006e45338ea7cd561f634352f | a098075443d6b30879417d3b7374da6103267d83 | 2026-11-16T04:27:51+03:00 | production home | docs: revise ad moderator scopes and owner approval workflow
a098075443d6b30879417d3b7374da6103267d83 | 93839a8419c47f1b2eef63c962e69827efe39cef | 2026-11-16T04:22:01+03:00 | production home | docs: define Arabic ad targeting and upload moderator controls
93839a8419c47f1b2eef63c962e69827efe39cef | 0cba5df076d770c9498bf46d1f628c81079b5df2 | 2026-11-16T04:14:03+03:00 | production home | docs: define regional advertising feeds and interfaces
0cba5df076d770c9498bf46d1f628c81079b5df2 | 821ee6fbc1953d3a34b61a71de22a651728c956f | 2026-11-16T04:11:24+03:00 | production home | docs: add owner control contract for advertising and ad viewing
821ee6fbc1953d3a34b61a71de22a651728c956f | 471abbdfa3bc398a3399311775afedc990c130a2 | 2026-11-16T04:10:01+03:00 | production home | docs: require owner-editable terms across all monetized features
471abbdfa3bc398a3399311775afedc990c130a2 | fc1c537c61d9672b71cf80682eca4005d1916a71 | 2026-11-16T04:08:54+03:00 | production home | docs: record owner-approved experimental economy baseline
fc1c537c61d9672b71cf80682eca4005d1916a71 | 7b3ec6a4ad9a0c1d5e8055271fb748691aa580a8 | 2026-11-16T04:02:55+03:00 | production home | docs: align traceability execution order with three owner-directed stages
7b3ec6a4ad9a0c1d5e8055271fb748691aa580a8 | a821fc787425ad099ace2b547cdad4d8dd6f5842 | 2026-11-16T04:02:31+03:00 | production home | docs: record owner-directed three-phase delivery sequence
a821fc787425ad099ace2b547cdad4d8dd6f5842 | 108fb703e1b34e8bafd97b4c4ca3478bcc6a7351 | 2026-11-16T04:02:20+03:00 | production home | docs: reorganize Mawdda delivery into three owner-directed phases
108fb703e1b34e8bafd97b4c4ca3478bcc6a7351 | afbffd36103c4a23d715be1866563c069b938927 | 2026-11-16T03:56:46+03:00 | production home | docs: record accelerated execution baseline and 5000 RSVP contention finding
afbffd36103c4a23d715be1866563c069b938927 | 1cb1fe268f0d0a84aefae61fe53a583c619fceb4 | 2026-11-16T03:51:19+03:00 | production home | docs: add premium UX and cloud sync acceptance gates
1cb1fe268f0d0a84aefae61fe53a583c619fceb4 | c70c2b6885cd29e344c06336a3da81e347eefbc3 | 2026-11-16T03:50:30+03:00 | production home | docs: record 5000 persona contention blocker for sprint
c70c2b6885cd29e344c06336a3da81e347eefbc3 | 7abb3cbd1b1ed520c61f5054b9e215d7ba3dc12f | 2026-11-16T03:50:12+03:00 | production home | docs: record 48-hour accelerated engineering target
7abb3cbd1b1ed520c61f5054b9e215d7ba3dc12f | 98cb12e94bca260dbda4aa3a1817a9b2c2d5a2e7 | 2026-11-16T03:49:57+03:00 | production home | docs: add 48-hour accelerated engineering execution plan
98cb12e94bca260dbda4aa3a1817a9b2c2d5a2e7 | d3d3b5e5843644f64c6d48c44bbcc696539616bd | 2026-11-16T03:38:01+03:00 | production home | docs: audit GitHub workflows and branch protection rollout
d3d3b5e5843644f64c6d48c44bbcc696539616bd | b1bf19fa498b91e50e8c8796d48e12ec42229e8a | 2026-11-16T02:35:13+03:00 | production home | docs: append verified execution and cloud trial audit findings
b1bf19fa498b91e50e8c8796d48e12ec42229e8a | ba2470869cc3d28e6e1a7633bcd6b07c498ec449 | 2026-11-16T02:31:42+03:00 | production home | docs: clarify Google Cloud trial exclusions effective 2026-11-16
ba2470869cc3d28e6e1a7633bcd6b07c498ec449 | 830498d02c96fc3dd0a7225eaaaceef51b2d4323 | 2026-11-16T02:31:19+03:00 | production home | docs: record verified Mawdda execution baseline for 2026-11-16
830498d02c96fc3dd0a7225eaaaceef51b2d4323 | 01d7ecd6fdb541457aa4c7d5f26d7e0ffb051373 | 2026-11-16T02:04:00+03:00 | production home | docs: clarify exact simulation checkout and current audit pointer
01d7ecd6fdb541457aa4c7d5f26d7e0ffb051373 | 9715485b637998c53bdf0e592e24842255f20fb2 | 2026-11-16T02:03:35+03:00 | production home | docs: record 5000-persona RSVP failure and retention policy correction
9715485b637998c53bdf0e592e24842255f20fb2 | 7807cc257dfbaece7373a3a3e54d289c47b91400 | 2026-11-16T02:03:07+03:00 | production home | docs: align retention operations with approved three-mode policy
7807cc257dfbaece7373a3a3e54d289c47b91400 | 46f1021c98701a42fb85a02757f35166edf7c866 | 2026-11-16T02:01:25+03:00 | production home | docs: refresh executive status with 16 Nov exact-head evidence

## Reflog evidence

## Relevant changed paths
COMMIT 825e9489b5dcb351998229fc062d71ce0489044b 2026-11-19 fix: narrow capacity role in seat counter transaction
M	functions/src/index.ts

COMMIT 8f448b686eac83ec6a2cd29f317e9ebaa2d83585 2026-11-19 fix: narrow specialist capacity roles and validate nullable defaults
M	functions/src/index.ts

COMMIT 65f48d827345c178488f95a5d0fc14dc584c3de7 2026-11-19 test: verify owner-controlled production capacity increase
M	functions/test/integration/specialized-role-capacity.integration.test.js

COMMIT 7b9ab836317c0f0fa82d74b7d88760efef61b6dd 2026-11-19 feat: add owner-controlled production supervisor capacity and enforce all team seats
M	functions/src/index.ts

COMMIT d70e687de541f381ef208972185a9a1999971722 2026-11-19 test: enforce fixed capacity for legal and production review teams
M	functions/test/integration/specialized-role-capacity.integration.test.js

COMMIT a4bc1c939b53ee9b79fd7ba920677917731d7829 2026-11-19 test: cover all specialist seat limits and capacity overrides
M	functions/test/platform-role-identities.test.js

COMMIT 8fceba7bbc9a9ebc22eb897340f44b0e139ef081 2026-11-19 refactor: reuse canonical Admin Media permission catalogue
M	functions/src/advertising-governance.ts

COMMIT 2a28105ea39e885ddd106605127c277506a1a373 2026-11-19 feat: enforce capacities for all numbered specialist teams
M	functions/src/platform-role-identities.ts

COMMIT a605f4aed31e080060ca4990f5dafaa760a73230 2026-11-19 test: enforce role-bound delegated permission catalogues
M	functions/test/advertising-governance.test.js

COMMIT 588c7dab05decf3ef6e3926a3abfd39c2945c851 2026-11-19 fix: bind specialized grants to owner-approved role permission families
M	functions/src/advertising-governance.ts

COMMIT ee807cd3453f089dc7d286693dd5dd0eb8f1e55d 2026-11-19 test: use approved store SKUs for catalog version integration cases
M	functions/test/integration/wallet-store.integration.test.js

COMMIT 87565d603048c7ee8704233e64f2aea3fbb47ac9 2026-11-19 docs: complete 51-branch and 38-pr phase one inventory
M	docs/PHASE1_UNIFIED_INTEGRATION_STATUS_2026-11-19.md

COMMIT 79d495303725ca8266c27dbd4bf08a6be2570148 2026-11-19 docs: record exact source reconciliation and first CI evidence
M	docs/PHASE1_UNIFIED_INTEGRATION_STATUS_2026-11-19.md

COMMIT b0767d99450147a22aa1db93a994508822c652a1 2026-11-19 docs: track phase one unified integration and acceptance gates
A	docs/PHASE1_UNIFIED_INTEGRATION_STATUS_2026-11-19.md

COMMIT 9c1313df6c9cb44b0f80df3de138d8883f7c7342 2026-11-19 ci: run domain regression on phase one unified branch
M	.github/workflows/mawdda-domain-regression.yml

COMMIT 6c4c3aaaa5cb2abbb2b6c1122acb66caac3ee3ab 2026-11-19 ci: validate phase one unified integration branch
M	.github/workflows/validate.yml

COMMIT a86fc878a7f5a29d68271bf08bec041a2fb31f80 2026-11-19 docs(economy): record safe group-call policy port and keep billing blocked
M	docs/GROUP_CALL_P0_ENGINEERING_AUDIT_2026-11-19.md

COMMIT 2dc1143f0f9b4f04e8b03684ea39e8438988deac 2026-11-19 feat(step1): port owner-configured call policy and settlement math
A	docs/GROUP_CALL_P0_ENGINEERING_AUDIT_2026-11-19.md

COMMIT 2f2bb212088083a4e35ed62be5b35ad1be042ebd 2026-11-19 feat(step1): port owner-configured call policy and settlement math
A	functions/test/group-call-economy.test.js

COMMIT 2e3fdcb91835005a5b8affcaca8f31fc819cf628 2026-11-19 feat(step1): port owner-configured call policy and settlement math
A	functions/test/call-usage-policy.test.js

COMMIT c69c7a2c6593f0d6dc4c2905d08e65f215429ac0 2026-11-19 feat(step1): port owner-configured call policy and settlement math
A	functions/src/group-call-economy.ts

COMMIT 04c887ddaae36dfa43a536245e87d1439d204a2b 2026-11-19 feat(step1): port owner-configured call policy and settlement math
A	functions/src/call-usage-policy.ts

COMMIT d5e44bb3107c9af9177b846fe00dd0a51b06b7ae 2026-11-19 test(economy): isolate store purchase catalog version fixture per run
M	functions/test/integration/wallet-store.integration.test.js

COMMIT 6da6fa91526e36a20b9c81506fc77e26fb31452d 2026-11-19 test(economy): cover catalog version overflow guard on unified branch
M	functions/test/integration/wallet-store.integration.test.js

COMMIT a544522193b65340e87e7cc77032ceb88c2e8761 2026-11-19 docs(step1): align retention traceability with owner decision and passing exact-head CI
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 2f4aa28be7d915a65fa5f20f64c22668fbf6b1f9 2026-11-19 fix(economy): upgrade legacy unversioned catalog rows safely
M	functions/src/index.ts

COMMIT 4f45412bbac3ad5e85896243a400a1844ea01b34 2026-11-19 test(economy): verify idempotency collision with a registered alternate recipient
M	functions/test/integration/store-gifting.integration.test.js

COMMIT dfe05863fe89567fd2ddec1fac40d4f7936fa3bc 2026-11-19 fix(test): use supported VIP SKU and restore prior wallet catalog state
M	functions/test/integration/wallet-store.integration.test.js

COMMIT 3ff6fb3a7dde02b34ca0ccbaf387ce7d195f1c28 2026-11-19 fix(test): use supported VIP catalog ID and restore its prior snapshot
M	functions/test/integration/store-gifting.integration.test.js

COMMIT 088a208c6fc54dc5c328abefbf64946a066a6701 2026-11-19 docs(governance): preserve audit snapshot with current integration addendum
A	docs/DEEP_GOVERNANCE_AND_IMPLEMENTATION_AUDIT_2026-11-19.md

COMMIT 9318f46db35b9f29aa021fb8b1471f48823d66f2 2026-11-19 fix(economy): bind gift replay to matching immutable ledger and audit
M	functions/src/index.ts

COMMIT 62f89c7412d7161aabe10ae98251880c456fdcf7 2026-11-19 test(economy): assert gift receipt binds immutable catalog snapshot
M	functions/test/integration/store-gifting.integration.test.js

COMMIT 8e20becddc3833b8888d909c1c4a07a6c575bbff 2026-11-19 fix(economy): verify immutable catalog snapshot for every store gift
M	functions/src/index.ts

COMMIT 71b3b2a09d12dc3dd2d561a74fcaa7890204ead6 2026-11-19 fix(economy): fail closed on malformed boost expiry during gifting
M	functions/src/index.ts

COMMIT 71c029f0c531bc96aac5577b23b138dd986c5fc0 2026-11-19 test(economy): allow purchase after owner grant in integration fixture
M	functions/test/integration/owner-entitlement-grants.integration.test.js

COMMIT 50f67ce4b69fa2c19c316e7284f5bb5b14b97c5e 2026-11-19 fix(step1): remove duplicate store gifting import
M	functions/src/index.ts

COMMIT a6bc6361e08e6628c6c98f79a59aa6fb876d0472 2026-11-19 docs(step1): reconcile economic phase execution controls
M	docs/MAWADDA_UNIFIED_PLATFORM_VISION_2026.md

COMMIT df0f053cb434d9aefb905cd466efa94bdad13417 2026-11-19 docs(step1): reconcile economic phase execution controls
M	docs/MAWADDA_UNIFIED_CONSTITUTION_2026.md

COMMIT cfaf68ae205e8cbc4aa700e7e5ed208fbb601df8 2026-11-19 docs(step1): reconcile economic phase execution controls
M	docs/MAWADDA_DOCUMENTATION_MASTER_INDEX_2026.md

COMMIT 63ba9b10a11d8cf21c2e715f3605b01a0ecc5041 2026-11-19 docs(step1): reconcile economic phase execution controls
M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md

COMMIT a951169a265a4d930ffb707caba7859468929237 2026-11-19 docs(step1): add economic phase execution reference
A	docs/LEGAL_GOVERNANCE_DOCUMENT_CONTROL_AUDIT_2026-11-19.md

COMMIT 08d45f68cca524263095865fa4865c3ac7eaa667 2026-11-19 docs(step1): reconcile economic phase execution controls
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT cb81af8ff0fd7f0e76636a78c141c6bbcf69ece1 2026-11-19 docs(step1): add economic phase execution reference
A	docs/ECONOMIC_PHASE_EXECUTION_CHECKLIST_AND_STAGE_CLOSURE_2026-11-19.md

COMMIT e8a5bdf3d11afca88219c816401747e95c74794a 2026-11-19 docs(step1): add economic phase execution reference
A	docs/ECONOMIC_PHASE_EXECUTION_AND_INTEGRATION_PLAN_2026-11-19.md

COMMIT 70db60e1bdb381a4f7eca3f5342427409b4bf434 2026-11-19 docs(governance): reconcile owner-approved role hierarchy
M	docs/RELEASE_READINESS_CHECKLIST.md

COMMIT 4f48a495dd1ce0425e7e0aadb392f3e856ee1b67 2026-11-19 docs(governance): reconcile owner-approved role hierarchy
M	docs/MAWADDA_MASTER_DEVELOPMENT_CHARTER_2026.md

COMMIT 6d047dd19293c209c8811fa905b558c72f9d4687 2026-11-19 docs(governance): reconcile owner-approved role hierarchy
M	docs/MAWADDA_CANONICAL_ADMIN_TERMINOLOGY.md

COMMIT 39a6c39a1aff6faafa7c8b9df1ea72cf0a1d5ff0 2026-11-19 docs(governance): reconcile owner-approved role hierarchy
M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md

COMMIT 3dc76082d88339ab0199d5326247aa8aa226656f 2026-11-19 docs(step1): reconcile approved retention and role decisions
M	docs/MAWADDA_UNIFIED_PLATFORM_VISION_2026.md

COMMIT 6ad016749c9db08adda6c25555cf32d6b7faee9b 2026-11-19 docs(step1): reconcile approved retention and role decisions
M	docs/MAWADDA_DOCUMENTATION_MASTER_INDEX_2026.md

COMMIT ba2c588009617f88a9deb953a85f743191c3a564 2026-11-19 docs(step1): reconcile approved retention and role decisions
M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md

COMMIT 599c54da0fd114f55b510d7cd9d0279c516b0b28 2026-11-19 docs(step1): reconcile approved retention and role decisions
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 0082e3fb0c68218b6ced88d69c209846273a3774 2026-11-19 test(economy): verify transactional catalog versions without shared fixture mutation
M	functions/test/integration/wallet-store.integration.test.js

COMMIT aacf985becbb8d57751b8179b8c6716f3183d9d4 2026-11-19 ci(step1): restrict validation to canonical development branch
M	.github/workflows/validate.yml

COMMIT 25c0d6b026869bc3f8af5e1f0c0718349745c6f6 2026-11-19 ci(step1): run role capacity and store gifting regressions on unified branch
M	.github/workflows/mawdda-domain-regression.yml

COMMIT f76a5a68ea6d19eec3468770d631bb376208cfdf 2026-11-19 test(step1): register role capacity and store gifting integration suites
M	functions/package.json

COMMIT 4a47770145e8142ad055efe5fae2005ac0c3217d 2026-11-19 fix(step1): reconcile PR #42 advertising-governance.test.js
M	functions/test/advertising-governance.test.js

COMMIT 3f1b04b3161ca28b983a507e74b4bd698eddf886 2026-11-19 feat(step1): port store-gifting.integration.test.js
A	functions/test/integration/store-gifting.integration.test.js

COMMIT 4c9e1166078d89b230706fd0eee4316a445c7385 2026-11-19 feat(step1): port store-gifting.test.js
A	functions/test/store-gifting.test.js

COMMIT 8f22b38f26f1b31b30fe50b176e4fcc99af294a9 2026-11-19 feat(step1): port store-gifting.ts
A	functions/src/store-gifting.ts

COMMIT 32cf602ed583eb897fcef94755163761b4810f68 2026-11-19 feat(step1): port specialized-role-capacity.integration.test.js
A	functions/test/integration/specialized-role-capacity.integration.test.js

COMMIT 0195271fc9ace0345f5fbee20893030be1a5a7bd 2026-11-19 feat(step1): port platform-role-identities.test.js
A	functions/test/platform-role-identities.test.js

COMMIT 230fcfe1c9122a9032bf4dcfb5a13ce7329bf0a9 2026-11-19 feat(step1): port platform-role-identities.ts
A	functions/src/platform-role-identities.ts

COMMIT dd7fef947c8dca40295cc635ab0fdf624c7ffdaa 2026-11-19 feat(step1): integrate audited store gifting and transactional role capacity
M	functions/src/index.ts

COMMIT 2fff6276055de44bc488cc123cec16491421a8e6 2026-11-19 docs: record store catalog version boundary fix
M	docs/PHASE1_BRANCH_AND_PULL_REQUEST_INTEGRATION_INVENTORY_2026-11-19.md

COMMIT 8a3b72d3a42f8d5d7a3e745d4b26c0bdc542e22f 2026-11-19 docs: identify workflow branch trigger coverage gap
M	docs/PHASE1_BRANCH_AND_PULL_REQUEST_INTEGRATION_INVENTORY_2026-11-19.md

COMMIT 117758e862af87ce05ee68faef47980cfae47254 2026-11-19 docs: extend phase 1 parallel PR overlap and CI audit
M	docs/PHASE1_BRANCH_AND_PULL_REQUEST_INTEGRATION_INVENTORY_2026-11-19.md

COMMIT 8c3025ff1eb4486d49c5388957c29697372b0682 2026-11-19 docs: require deep semantic review before duplicate consolidation
M	docs/PHASE1_BRANCH_AND_PULL_REQUEST_INTEGRATION_INVENTORY_2026-11-19.md

COMMIT 7fa6c2c83fd8fb54eb74fd9cb8638913c78d273e 2026-11-19 docs: add phase 1 branch and PR integration inventory
A	docs/PHASE1_BRANCH_AND_PULL_REQUEST_INTEGRATION_INVENTORY_2026-11-19.md

COMMIT 946ead61208f5007299802c5293f31c329b7c2d2 2026-11-19 docs(governance): link approved legal contract lifecycle policy
M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md

COMMIT a6243be5f775191d6088c26a0f91ae805e013733 2026-11-19 docs(governance): link approved legal contract lifecycle policy
M	docs/MAWADDA_UNIFIED_CONSTITUTION_2026.md

COMMIT f0375d761fa692eb6aa4058d7acd6ebf19dce73e 2026-11-19 docs(governance): link approved legal contract lifecycle policy
M	docs/MAWADDA_DOCUMENTATION_MASTER_INDEX_2026.md

COMMIT 10ad5e947e43af36362afbbb86f319881625730d 2026-11-19 docs(governance): link approved legal contract lifecycle policy
M	docs/MAWADDA_CONTRACTS_AND_GOVERNANCE_REGISTER_2026.md

COMMIT 116e9e40873324ea3049d6de59ea6ffd82376ef9 2026-11-19 docs(governance): record owner-approved legal contract lifecycle controls
A	docs/LEGAL_CONTRACT_ACCESS_AND_LIFECYCLE_GOVERNANCE_2026.md

COMMIT 63a045173654d5f52beb7bdc55d7cd7329af7819 2026-11-19 Fix wallet pricing integration currency assertion
M	functions/test/integration/wallet-store.integration.test.js

COMMIT d74c4b621eb64d8faabbb0314fe478cc18f72f45 2026-11-19 Align wallet integration fixtures with provisional pricing and owner bounds
M	functions/test/integration/wallet-store.integration.test.js

COMMIT f29c275f6f603f3905c52e2c01bce5dc101d03b8 2026-11-19 Exercise actual control characters in production roster regression
M	functions/test/advertising-governance.test.js

COMMIT bc12fcc916da078709282e8f9c5d7927fb72919c 2026-11-19 Add regression tests for malformed delegation and roster inputs
M	functions/test/advertising-governance.test.js

COMMIT 0820580558dd4136060e8a88d7aca25905e13670 2026-11-19 Harden delegated authorization and production roster validation
M	functions/src/advertising-governance.ts

COMMIT e3f44ccfa216bf80ede588cd21a3ff46fc2ad2ec 2026-11-19 Test owner-configurable room rental prices and durations
M	functions/test/room-rental.test.js

COMMIT c43b14b9c3fda6deeb30377e248ac6ee6b5b86df 2026-11-19 Cover malformed owner bypass contexts in advertising governance tests
M	functions/test/advertising-governance.test.js

COMMIT 5cb6d8a434f7a98fa411dca27cc785a59bb08a31 2026-11-19 Harden advertising permission helper runtime validation
M	functions/src/advertising-governance.ts

COMMIT a482ee4e360967e0a08b79e4328330d8ed551782 2026-11-19 Verify all seeded shop items have provisional prices
M	functions/test/store-catalog.test.js

COMMIT b3d8a559b1cfd7a794e8b4a6e5247423307d5660 2026-11-19 Label partially seeded economy pricing as provisional
M	functions/src/index.ts

COMMIT b489577069937ba23de96624829594edb2af87e9 2026-11-19 Align store catalog tests with owner-configurable durations
M	functions/test/store-catalog.test.js

COMMIT 9464ebb0cc03233a37987d932b9c08b5dea7480a 2026-11-19 Test owner-configurable custom store durations
M	functions/test/store-catalog.test.js

COMMIT f7b7ff81f732d7124e8f6d52b9acdbd376e57eb1 2026-11-19 Test provisional coin and advertising pricing defaults
M	functions/test/economy-pricing.test.js

COMMIT e3e67652cdf21f3f5a04f3c5df5d4af6ad1a9e8c 2026-11-19 Expose provisional editable economy pricing defaults to owner
M	functions/src/index.ts

COMMIT 0f5386c35157b17c687cbfba459b7fd56f38715a 2026-11-19 Allow Super Owner custom store entitlement durations
M	functions/src/store-catalog.ts

COMMIT 5f1f99b716c36f274fa222584db5decb68029587 2026-11-19 Add provisional coin and advertising price catalogs
M	functions/src/economy-pricing.ts

COMMIT a185b644020bc171bb406e35ea7a318874f668ae 2026-11-19 test(economy): lock experimental room rental price baseline
M	functions/test/room-rental.test.js

COMMIT 68931f839ceaebcfb0f7c9ec3acf90914c8035a8 2026-11-19 docs(economy): label room rental defaults as experimental pricing
M	functions/src/room-rental.ts

COMMIT 8a68e90618dd482b5b483172818f0f44ce8be50e 2026-11-19 test(room-rental): cover expiry overflow and plan validation
A	functions/test/room-rental.test.js

COMMIT 15c672e4c0cea4ead27b84f6ed88d2aacc66dba3 2026-11-19 fix(room-rental): reject unsafe expiry timestamps
M	functions/src/room-rental.ts

COMMIT 1c768b156c7bf4e8337d1892c5bf60adab89b826 2026-11-19 test: reject malformed contract signing delegations
M	functions/test/advertising-governance.test.js

COMMIT 5aa12ac01883838f0c7683ea8130197fc9005f78 2026-11-19 fix: fail closed on malformed contract signing delegations
M	functions/src/advertising-governance.ts

COMMIT ff32e6643ba001b8e185db82a5810cbbf69b74a3 2026-11-19 test: reject malformed persisted specialist grants
M	functions/test/advertising-governance.test.js

COMMIT c6879b2063eb8b2c777ac67ec6c80135c3c0ec5b 2026-11-19 fix: validate persisted specialist grants before permission checks
M	functions/src/advertising-governance.ts

COMMIT 2d070391938ddde642800e52deb1a5a91b6e1bcb 2026-11-19 docs: record step 1 specialist authorization enforcement audit
A	docs/STEP1_SPECIALIZED_AUTHORIZATION_AUDIT_2026-11-19.md

COMMIT 721f22246dee9597e84a2d1ae4e5b7c48b8fdc02 2026-11-19 docs: record atomic specialized-role audit correction and validation gate
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT ec4b7b4f27e99231cd3c787a3e8c4d023a67b62c 2026-11-19 fix: use imported Firestore transaction type for atomic role audit
M	functions/src/index.ts

COMMIT 62a52ce734daac3e90e983790618b009f2372fbe 2026-11-19 fix: make specialized role grant changes and audit atomic
M	functions/src/index.ts

COMMIT 255613920d1eacf122fbec256b8e2bee3c9cb411 2026-11-19 docs: record cross-workstream phase one audit and paused load lab
M	docs/PHASES_1_2_CLOSEOUT_STATUS.md

COMMIT ca3c4516637f55e91223bcd9853d52a609daa904 2026-11-19 docs: add owner-approved Mawdda contracts package register
A	docs/legal-governance/MAWDDA_CONTRACTS_PACKAGE_APPROVAL_REGISTER_2026.md

COMMIT e762e233c87ec13ec1462e0785b9c41097c67c7d 2026-11-19 docs: record owner-approved company logo and asset status
M	docs/company-identity/PRODUCTION_HOME_COMPANY_IDENTITY_AND_CONTRACTS_2026.md

COMMIT 0b0dea6345f630cced4d978897a0eb451bef5ea2 2026-11-19 docs(contracts): require full contact and office footer on every page
M	docs/MAWDDA_ADVERTISING_CONTRACT_TEMPLATES_2026.md

COMMIT b2192fd2f2b39781165dabc422ed12dd89d300e7 2026-11-19 docs(contracts): add official company identity and contract pack index
A	docs/company-identity/PRODUCTION_HOME_COMPANY_IDENTITY_AND_CONTRACTS_2026.md

COMMIT 49c51da1722ec23e025e0c1f391b973640ba2f5c 2026-11-19 docs(contracts): standardize company letterhead and official contact details
M	docs/MAWDDA_ADVERTISING_CONTRACT_TEMPLATES_2026.md

COMMIT 3fcafd5a78a192893833a13510b58682a26d697d 2026-11-19 docs(governance): add owner-confirmed company contact details
M	docs/MAWADDA_CONTRACTS_AND_GOVERNANCE_REGISTER_2026.md

COMMIT 2e0ff25006228cbbe3b02c44cc20fc6881da2dc3 2026-11-19 docs(governance): add approved Saudi and UAE office locations
M	docs/MAWADDA_CONTRACTS_AND_GOVERNANCE_REGISTER_2026.md

COMMIT d5217c8c2769854372feaedea6024334cb365c0d 2026-11-19 docs: reconcile media policy and permission editor status
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT e7ac75b2600cba410ab43046e67dd9a5f20b0a26 2026-11-19 feat: add owner partial permission update callable
M	functions/src/index.ts

COMMIT 71095c35a5d96ce280b6dea2dd6d7a3e2bc16bda 2026-11-19 test: align wallet economy fixtures with catalog contracts
M	functions/test/integration/wallet-store.integration.test.js

COMMIT cca2813e84bc82e0f6509894d8e6f8da841628f0 2026-11-19 docs: trace granular owner permission foundation
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 935480b90c77c138018f946914ec3c31dce3452d 2026-11-19 test: cover additive and partial permission changes
M	functions/test/advertising-governance.test.js

COMMIT 1a8e2d5e594863497714c66e5ae846b22a684564 2026-11-19 feat: add granular owner permission delta validation
M	functions/src/advertising-governance.ts

COMMIT 261e987bb6c0c826f8f34685a5f6e0f7535300ff 2026-11-19 docs: record super owner authority approval
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 94e93d01569cab80442d3bf667164c860ecc7489 2026-11-19 docs: add owner sovereignty and delegation constitution
A	docs/OWNER_SOVEREIGN_AUTHORITY_AND_DELEGATION_CONSTITUTION.md

COMMIT 4f04908af275a7a99ad3dfba230f15bd596eab71 2026-11-19 docs: reconcile approved admin and production permission sources
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 6c965180b6666410576579304a21e3259f5b8f58 2026-11-19 docs: trace owner-approved role refund and media saver requirements
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 3225d444f3fa5627055beff99b54d01d9ba8c897 2026-11-19 docs: record owner decisions for scoped roles refunds and media saver
M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md

COMMIT 657f3025496098cbc06d0e077e079617d783a5b6 2026-11-19 docs: record exact-head integration checkpoint and simulation hold
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 20efef2b34bf45d626defc2293d690680945c775 2026-11-19 test(authz): exercise literal control characters in scopes
M	functions/test/advertising-governance.test.js

COMMIT e6d005f19cacb4da178a576f13e3ade188c57b05 2026-11-19 fix(authz): validate advertising scope control characters
M	functions/src/advertising-governance.ts

COMMIT 3ee0c7ab1662bd5957b4800f001d64e8768f9bcd 2026-11-19 test(authz): cover malformed advertising resource scopes
M	functions/test/advertising-governance.test.js

COMMIT cd1d66e94fde05857f2fb24ff063ec448c2062b8 2026-11-19 fix(authz): reject malformed advertising resource scopes
M	functions/src/advertising-governance.ts

COMMIT 3dd094101d6cf1722e74ea75d75503c208a75579 2026-11-19 test(store): version premium profile purchase fixtures
M	functions/test/integration/premium-profile.integration.test.js

COMMIT 5f2e3cdc23090ea724ddf803d9490238826091be 2026-11-19 docs(economy): record official MAD and TRY currency support
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 22396d5bc95c9e1cef6af48e8edb1da5c3965c37 2026-11-19 test(economy): cover MAD and TRY in amount and ad pricing
M	functions/test/economy-pricing.test.js

COMMIT 9b06ffcf966e02d74be1b61ae3b973ba070350dd 2026-11-19 test(economy): complete MAD and TRY catalog fixtures
M	functions/test/economy-pricing.test.js

COMMIT b63eb0311428261c92aec2c1987d26d6d421bd82 2026-11-19 test(economy): cover MAD and TRY owner payment instructions
M	functions/test/coin-purchase-requests.test.js

COMMIT b426bc6e83ede0ab59293feb6647e98f3274bfde 2026-11-19 test(economy): cover MAD and TRY currency precision
M	functions/test/economy-pricing.test.js

COMMIT 7428c7ccece4f56a28e8762c5f0187160cfec07b 2026-11-19 feat(economy): support Moroccan dirham and Turkish lira
M	functions/src/economy-pricing.ts

COMMIT b8595f706b13a1953e2df9c7f64928e551574f7d 2026-11-19 test: verify timed ad campaign snapshots remain immutable across versions
M	functions/test/integration/featured-ad-finance.integration.test.js

COMMIT a435efb4993110faaa7ae3834f75ae085f400c26 2026-11-19 docs: trace featured ad immutable snapshot and currency fixes
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT c58c7db27fa3490e777bb6919663dfac027661c1 2026-11-19 test: align featured ad finance with official currency and event snapshots
M	functions/test/integration/featured-ad-finance.integration.test.js

COMMIT 7d6ba3210aee1248a3cdf6f868d5a016ab00e953 2026-11-19 fix: persist immutable timed-ad and financial event snapshots
M	functions/src/index.ts

COMMIT 075cfcdb2742e66c3b359b3c48a66b8156843723 2026-11-19 test: fail closed on corrupt owner catalog version
M	functions/test/integration/wallet-store.integration.test.js

COMMIT f425137ef723fb787949cc73d19727f3d3a903b4 2026-11-19 docs: trace versioned owner store catalog publication fix
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT f2e00e37c064c8f31d16705058779ab7c0036b84 2026-11-19 test: verify owner catalog publishing assigns monotonic versions
M	functions/test/integration/wallet-store.integration.test.js

COMMIT a2f40c340bf00f59a78242a32f74cad68d076e64 2026-11-19 fix: version owner-published store catalog items transactionally
M	functions/src/index.ts

COMMIT 169b39f84c75b8e737c7849dffb028f870d3b582 2026-11-19 test: assert official economy currency allowlist and precision
M	functions/test/economy-pricing.test.js

COMMIT e9843088496b4a7280f1385c914c680949d33da9 2026-11-19 docs: record owner entitlement CI failure root cause and fixture fix
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT ce478650ab0c8c79dae6ff7ef0fa91407c5a4d71 2026-11-19 test: include catalog version in owner entitlement purchase fixture
M	functions/test/integration/owner-entitlement-grants.integration.test.js

COMMIT 7fa84ad0786fc9237f6bdec626de0fab3f9c24af 2026-11-19 test: cover expanded official currencies in coin purchase flow
M	functions/test/coin-purchase-requests.test.js

COMMIT 31729b0e2e17c8dbea2156ffefc768e73c209c51 2026-11-19 test: cover nine official currencies and their minor units
M	functions/test/economy-pricing.test.js

COMMIT c26f79e5213cdb82939f352fe780c01835080d0f 2026-11-19 feat: add JOD IQD AED and DZD to official economy currencies
M	functions/src/economy-pricing.ts

COMMIT f1c3a2259a02f1f13249a79a12c0c6859bdf02ac 2026-11-19 test: assert official currencies across manual payment instructions
M	functions/test/coin-purchase-requests.test.js

COMMIT eddb85ff1a1958606aea17d36aa394235007d1b8 2026-11-19 test: align manual coin purchase with official currency allowlist
M	functions/test/coin-purchase-requests.test.js

COMMIT 7d113fe61ee27d8833f628432810b5af985db71b 2026-11-19 test: cover five official platform currencies and reject others
M	functions/test/economy-pricing.test.js

COMMIT ce02b29b8da39d751e64e189acd0b8f4c30b0d05 2026-11-19 feat: enforce owner-approved official economy currencies
M	functions/src/economy-pricing.ts

COMMIT 4cc52e309c85fe6ddf01039c279d6347f4d63e8a 2026-11-19 test: reject store durations outside approved terms
M	functions/test/store-catalog.test.js

COMMIT 4a3800ee21f90438daec3233b5adfc614a2137c3 2026-11-19 fix: restrict store durations to approved commercial terms
M	functions/src/store-catalog.ts

COMMIT 8a1c8d0b93ed43570c523ab2d8c2598648ddac0e 2026-11-19 docs: record divergent economy and governance branch sources
M	docs/MAWADDA_DOCUMENTATION_MASTER_INDEX_2026.md

COMMIT cf6c364c25613348c270efd4d005e9bc28338c57 2026-11-19 docs: include owner live-stream and manual coin request governance
M	docs/MAWADDA_UNIFIED_CONSTITUTION_2026.md

COMMIT 2c178c1af2f22a9b725a032d29f7626bc0496ded 2026-11-19 docs: align unified vision with approved role and biometric workflow
M	docs/MAWADDA_UNIFIED_PLATFORM_VISION_2026.md

COMMIT b36f7887c2b9525f1765d731537482cb17bddf83 2026-11-19 docs: reconcile owner-reviewed biometric and canonical role decisions
M	docs/MAWADDA_UNIFIED_CONSTITUTION_2026.md

COMMIT c9788e5fc94b41b332f5bd4268d7167d222a176c 2026-11-19 docs: connect contract governance register to unified references
M	docs/MAWADDA_UNIFIED_CONSTITUTION_2026.md

COMMIT ce414f45c47ad10cafedf7242547aaa202159a12 2026-11-19 docs: connect contract governance register to unified references
M	docs/MAWADDA_DOCUMENTATION_MASTER_INDEX_2026.md

COMMIT e93fcf965f3f275495919b910196b516b1f49210 2026-11-19 docs: consolidate contracts and governance register
A	docs/MAWADDA_CONTRACTS_AND_GOVERNANCE_REGISTER_2026.md

COMMIT 2b02efc63cc82b6aee53c176bf5b4101ab543847 2026-11-19 docs: link unified constitution and vision references
M	docs/MAWADDA_MASTER_DEVELOPMENT_CHARTER_2026.md

COMMIT d22a38a1c2891f414f835d8ad62a8bbf566194ed 2026-11-19 docs: link unified constitution and vision references
M	docs/MAWADDA_COMPREHENSIVE_PRODUCT_VISION_2026.md

COMMIT f4f73dd357302930dbbc0c0a373a641cf0417df9 2026-11-19 docs: link unified constitution and vision references
M	docs/MAWADDA_PRODUCT_CONSTITUTION.md

COMMIT d1b9fb47b7b5373ec5f1e95153d8e0a9c76bc3a4 2026-11-19 docs: add documentation consolidation index and source register
A	docs/MAWADDA_DOCUMENTATION_MASTER_INDEX_2026.md

COMMIT 0bf6316df9f1a5b9399f503c6f854b91fb11f85f 2026-11-19 docs: add unified Mawdda platform vision 2026
A	docs/MAWADDA_UNIFIED_PLATFORM_VISION_2026.md

COMMIT a8402d85d1bf757f318d25e9e1152e7919f7eafe 2026-11-19 docs: add consolidated Mawdda constitution 2026
A	docs/MAWADDA_UNIFIED_CONSTITUTION_2026.md

COMMIT 1e2131aa65e3658d0185589738aeb187614db39a 2026-11-19 economy: version owner-managed store catalogue items
M	functions/test/store-catalog.test.js

COMMIT b995b9093548376ee96b8ca3d03563adb79a153a 2026-11-19 economy: version owner-managed store catalogue items
M	functions/src/store-catalog.ts

COMMIT 8319e4b22158e2ba381d3115c276eb1c2a833708 2026-11-19 docs: update wallet reconciliation callable scope
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 11188753a900ab607b77de603b11211beae7bce6 2026-11-19 test: cover read-only owner wallet reconciliation
M	functions/test/integration/wallet-store.integration.test.js

COMMIT 152c4b303bd443baf9040ffdb4ed3f8bfa043a05 2026-11-19 economy: add read-only owner wallet reconciliation endpoint
M	functions/src/index.ts

COMMIT f9154bda6d5524a8bae6dfb05642453d9d3fed53 2026-11-19 docs: preserve group-call billing P0 release gate
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT cb7f08a91e6fc89ba79707acbc358e1e8fc65485 2026-11-19 docs: record terminology audit scope and main branch boundary
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 218ab555ebde7235c1d6d6d13be88dfc84499113 2026-11-19 docs: add canonical administrative terminology standard
A	docs/MAWADDA_CANONICAL_ADMIN_TERMINOLOGY.md

COMMIT 13e580847b58deff6470baf4cbd5c3402a2f6731 2026-11-19 docs: clarify featured-ad payment recording scope
M	functions/src/economy-payment-policy.ts

COMMIT c5aff59c9b3599dfa89e766a57d24a4ec13ccc04 2026-11-19 docs: clarify per-service manual payment and currency controls
M	docs/OWNER_LIVE_STREAM_AND_MANUAL_COIN_REQUESTS.md

COMMIT c6ddc7a51924505da51a8d17071caa933a633ec0 2026-11-19 test: avoid composite index dependency in pricing cleanup
M	functions/test/integration/wallet-store.integration.test.js

COMMIT 1bf7f628b12a22aecf6a2dbdc98c2a8d7705a98b 2026-11-19 ci: validate governance branch on every push
M	.github/workflows/mawdda-domain-regression.yml

COMMIT 164eb6d45ca3f889f75a29f6f445eee969115060 2026-11-19 ci: validate governance branch on every push
M	.github/workflows/validate.yml

COMMIT 7d7b563ac98091a6c3859e1737c5e73993a39c9a 2026-11-19 docs: standardize Super Owner and Admin Media terminology
M	docs/OWNER_LIVE_STREAM_AND_MANUAL_COIN_REQUESTS.md

COMMIT c532a86565bfb5696db10de00017e5e5db96f611 2026-11-19 docs: standardize Super Owner and Admin Media terminology
M	docs/ADVERTISING_MEDIA_WORKSPACE_SPEC.md

COMMIT 0e34810502d1cd8d1d646632e5939726a6af2c2f 2026-11-19 docs: standardize Super Owner and Admin Media terminology
M	docs/SEVEN_PHASE_EXECUTION_PLAN.md

COMMIT 16ebbc59c453549d247e62f3ce55edc1953bb63b 2026-11-19 docs: standardize Super Owner and Admin Media terminology
M	docs/MAWADDA_PRODUCT_CONSTITUTION.md

COMMIT 178064b791549adf69b9f409b29d4c8035ca357d 2026-11-19 docs: standardize Super Owner and Admin Media terminology
M	docs/MAWADDA_COMPREHENSIVE_PRODUCT_VISION_2026.md

COMMIT a226dc8a7401603754f3a994dade00384f5a4e9d 2026-11-19 docs: standardize Super Owner and Admin Media terminology
M	docs/MAWADDA_BRAND_AND_PRODUCT_EXPERIENCE.md

COMMIT dc174d12cfffe31d9212a03421719398373af603 2026-11-19 docs: standardize Super Owner and Admin Media terminology
M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md

COMMIT 23123d5ccf9dc03db470770a6984f77c19428880 2026-11-19 docs: standardize Super Owner and Admin Media terminology
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 5e08b6309cc49d458a946936c70199c580d7e7b9 2026-11-19 fix: use canonical Super Owner sender label
M	functions/src/index.ts

COMMIT 5110ebb126ee4c95a85e1527466ad434ff558e8c 2026-11-19 refactor: narrow featured-ad snapshot references
M	functions/src/index.ts

COMMIT ab83b5516bbf38fafd01604fab3e64df1d13e5ec 2026-11-19 test: assert immutable coin payment policy evidence
M	functions/test/integration/wallet-store.integration.test.js

COMMIT f38b03f7a2c49589de49343cc98104d1bf321740 2026-11-19 security: preserve payment policy snapshot across instruction and report audit
M	functions/src/index.ts

COMMIT c49100cb2cef79efac379f07a642ee273fc821c4 2026-11-19 security: retain full payment policy snapshot in coin ledger and audit
M	functions/src/index.ts

COMMIT 8c33659b05059fd86c24a95f14305fcff86e1f51 2026-11-19 security: record payment policy version in instruction audit
M	functions/src/index.ts

COMMIT 75a4dc7edaa9d2637c74a2d2f32b6ec737f7f7dc 2026-11-19 security: bind payment report audit to immutable policy version
M	functions/src/index.ts

COMMIT 127a4527e6db5ffa519273b7481f466119cd31ca 2026-11-19 security: bind coin approval audit to payment policy version
M	functions/src/index.ts

COMMIT f52b7d445980bbb2476cdc69507949e475a0569b 2026-11-19 security: bind coin payment actions to immutable policy snapshot
M	functions/src/index.ts

COMMIT 8e8fa23cc2fa6ba2fd3e03008e5a59d8e237e041 2026-11-19 docs: record owner payment policy and featured-ad finance
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 47969c8fe9e94a091bf9222cd6883533593b54d2 2026-11-19 test: let server derive canonical currency exponent
M	functions/test/integration/wallet-store.integration.test.js

COMMIT f56fa993302e36805e71185c40db7d559dcd014a 2026-11-19 test: verify CHF coin purchase precision end to end
M	functions/test/integration/wallet-store.integration.test.js

COMMIT 323128627a7ea8602ec6a708cfdb1eb3f8439748 2026-11-19 ci: run featured-ad finance emulator tests
M	.github/workflows/validate.yml

COMMIT 10e14c04019b07acc51a3ffc3891687032237cc8 2026-11-19 test: include featured-ad finance emulator regression
M	functions/package.json

COMMIT 7966ea7836ef3fb020a0302bd9988c0d1b8096c5 2026-11-19 test: verify featured-ad finance replay evidence and payment gating
M	functions/test/integration/featured-ad-finance.integration.test.js

COMMIT 6749452a2cd36598408fcce0bdf550189561bf93 2026-11-19 security: bind featured-ad version snapshot to payment policy evidence
M	functions/src/index.ts

COMMIT 0867c5fb051a7ad65f608b3a48b3261041529d0f 2026-11-19 security: verify featured-ad financial audit and currency evidence
M	functions/src/index.ts

COMMIT 03e346d55ff1d79317932a0b60714a906eb305c7 2026-11-19 economy: add owner-only featured-ad finance ledger with replay verification
M	functions/src/index.ts

COMMIT a5a467c7a2a1e419d08afd89ae71e593c32dc78e 2026-11-19 economy: add auditable featured-ad financial events
A	functions/test/integration/featured-ad-finance.integration.test.js

COMMIT 98638d0c985849eeeca8e9ea33203f086a408eec 2026-11-19 economy: add auditable featured-ad financial events
A	functions/test/featured-ad-finance.test.js

COMMIT 4320d98a2dcff3cb200a1c71321e8755c4d0422f 2026-11-19 economy: add auditable featured-ad financial events
A	functions/src/featured-ad-finance.ts

COMMIT 8c769338930a527758e13db683568bacb596522d 2026-11-19 test: cover owner-scoped payment policy and unset pricing defaults
M	functions/test/integration/wallet-store.integration.test.js

COMMIT 2dcd3ae2f757f45c205b22d727df2235821a4c34 2026-11-19 economy: migrate legacy manual payment switches safely
M	functions/src/index.ts

COMMIT c2441a0028889bd3f2ba44ef2c61c828a8369bed 2026-11-19 economy: enforce currency precision in manual payment settlement
M	functions/src/index.ts

COMMIT 3713c04700e9a2c6464d019dac7f45539afc882c 2026-11-19 economy: validate owner-set currency precision and pricing
M	functions/test/coin-purchase-requests.test.js

COMMIT 029d41aff9bf08087189d4bd2e5680157909b9a4 2026-11-19 economy: validate owner-set currency precision and pricing
M	functions/test/economy-pricing.test.js

COMMIT b32a20611ad9f452c568af25e19b9ed413a4e7e1 2026-11-19 economy: validate owner-set currency precision and pricing
M	functions/src/coin-purchase-requests.ts

COMMIT edb8cec70d7c2b506dbc6a87011299b1b5501f74 2026-11-19 economy: validate owner-set currency precision and pricing
M	functions/src/economy-pricing.ts

COMMIT 19be160498cbc284b0399569368d388c55dd85db 2026-11-19 refactor: remove implicit default economic prices
M	functions/src/index.ts

COMMIT 275b56ef7ff0d8a461c59f3ad8869e6639ce2e17 2026-11-19 economy: centralize per-service payment controls and pricing versions
M	functions/src/index.ts

COMMIT 96fc5e440e909a0ca734549dc1d445486c66f81c 2026-11-19 economy: add per-service payment policy validator
A	functions/test/economy-payment-policy.test.js

COMMIT 062de78b78c13aa4b122acd32f0d1d76279d2c81 2026-11-19 economy: add per-service payment policy validator
A	functions/src/economy-payment-policy.ts

COMMIT c35cb4e40339f2f0d370f504265edfe963511750 2026-11-19 docs: record read-only wallet reconciliation foundation
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 62240f96d3450f7a83b7ac5bf7275ca6c057512b 2026-11-19 economy: add read-only wallet reconciliation helper
A	functions/test/wallet-reconciliation.test.js

COMMIT a8e4785c5c44714ae0fc0e5fcbc6dea1d5947eb4 2026-11-19 economy: add read-only wallet reconciliation helper
A	functions/src/wallet-reconciliation.ts

COMMIT ba66d97f1c997ef047512f6ef5b5092185886c1a 2026-11-19 docs: record manual payment and ledger replay hardening
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 2d2b68dda06d12da50ae5c9992a215d0a34fbb19 2026-11-19 test: require intact audit for payment report replay
M	functions/test/integration/wallet-store.integration.test.js

COMMIT 00b2095df9bee10eb946332b47606288a7b90429 2026-11-19 economy: preserve owner-selected exclusive payment mode
M	functions/src/index.ts

COMMIT 359af1d66518c8881faeb14e2273e52e4f7d3f12 2026-11-19 security: fail closed on inconsistent payment report audit
M	functions/src/index.ts

COMMIT 169ad8d6c18a80c6e93ce8801847136c1ea0517c 2026-11-19 docs: clarify immutable manual coin payment workflow
M	docs/OWNER_LIVE_STREAM_AND_MANUAL_COIN_REQUESTS.md

COMMIT 1dc89dc4f5008c45fe2c2b8e3787b0ea72142b90 2026-11-19 test: verify financial replay evidence and manual payment lifecycle
M	functions/test/integration/owner-entitlement-grants.integration.test.js

COMMIT bcf175b1b39d069b4a999955570c2dac7c24f942 2026-11-19 test: verify financial replay evidence and manual payment lifecycle
M	functions/test/integration/room-rental.integration.test.js

COMMIT 1e7ae4dbd6a7f47609fbcbce112e938becf533be 2026-11-19 test: verify financial replay evidence and manual payment lifecycle
M	functions/test/integration/wallet-store.integration.test.js

COMMIT 1b832ff14014847e1234f74398fd91e52fb31fc9 2026-11-19 economy: verify wallet ledger evidence on replay
M	functions/src/index.ts

COMMIT bf53a6c27a8f5ae0ee43f45282a20b4abb3f1766 2026-11-19 economy: harden manual coin payment lifecycle and replay
M	functions/src/index.ts

COMMIT 7155da87b7ec18537f7944e39d2faccb4e10dc1b 2026-11-19 test: validate payment instruction version
M	functions/test/coin-purchase-requests.test.js

COMMIT ba912e1a21be5e58c3a9f62e82509540f3099e08 2026-11-19 economy: version manual payment instructions
M	functions/src/coin-purchase-requests.ts

COMMIT 1a3d17ddde864a2649f7f0411b2f8b6552effd59 2026-11-19 docs: link economic phase controlled integration audit
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 0a697cba52484d922d8b95280062eefa18dd5f78 2026-11-19 docs: add controlled economic phase integration audit
A	docs/ECONOMIC_PHASE_CONTROLLED_INTEGRATION_AUDIT_2026-11-19.md

COMMIT d561dc445ea352d94cd346a6b745e800a9114ee1 2026-11-19 docs: record company identity treatment for media workspace and ad viewing
M	docs/MAWADDA_BRAND_AND_PRODUCT_EXPERIENCE.md

COMMIT 7fd1c6cd9b3810047bb0d87f1b6dd5d0dc8b4dd1 2026-11-18 docs: record exact-head validation and prioritized implementation gaps
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT c759083e04ffd98616691c2e736207095aaf2dbc 2026-11-18 docs: reconcile call readiness with current signaling code
M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md

COMMIT 917a7cc61dd4f9f8fb3bffb160b407bf85130b85 2026-11-18 docs: trace featured advertising implementation gap
M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md

COMMIT 67afa6fb73a9054efba39c7f62f6f8aa437f4f46 2026-11-18 docs: record reward center discovery regression
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 47a193bff2981d7e8dfcc8ad1d5f623ba9ff6646 2026-11-18 fix(ads): align reward center campaign discovery filters
M	functions/src/index.ts
M	functions/test/integration/engagement-rewards.integration.test.js

COMMIT 988872266d842d919b11898aa55330235d0cd939 2026-11-18 docs: record timed ad discovery regression evidence
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 084c79b2a278429873c3b29c68ef9118a7166e04 2026-11-18 fix(ads): filter active reward campaigns before limiting
M	.github/workflows/mawdda-domain-regression.yml
M	functions/src/index.ts
M	functions/test/integration/engagement-rewards.integration.test.js

COMMIT 532c0b0fb2033bbcf2735c521cd0847158e130a0 2026-11-18 docs(calls): record deadline hardening and regression coverage
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 7c8e6985ddf11ef32417e7b61c1bce9fe373cf9a 2026-11-18 ci(calls): run call lifecycle emulator regression
M	.github/workflows/mawdda-domain-regression.yml

COMMIT c67a11c2e94993eb4cf707c1c262c710e97d8acc 2026-11-18 test(calls): cover expired reconnect confirmation
M	functions/test/integration/call-signaling.integration.test.js

COMMIT cc7a7c73db63e87dc29ef31e2ef93711ac809b9e 2026-11-18 fix(calls): reject reconnect confirmation after call deadline
M	functions/src/index.ts

COMMIT 5351887c9d02cc0a1aece7612f550e57f2cad527 2026-11-18 docs(traceability): add viewport coverage for responsive room cards
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 6bd5cb1a73049e959bed47fe40f45421f2c051d4 2026-11-18 test(ui): cover responsive room cards across viewport widths
A	test/widgets/responsive_room_card_test.dart

COMMIT 8f0f18d2c49cc8b4cd7e2675bcff9463c7bd35a0 2026-11-18 docs(traceability): record responsive room card improvement
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT da6e0cd9638a8fcbea09255cdce6e2c800eb2742 2026-11-18 docs(release): require owner visual signoff and full UI action audit
M	docs/RELEASE_READINESS_CHECKLIST.md

COMMIT 3a30b41de2812567fecba6cff8330817c393b5c1 2026-11-18 docs: mark verified call quota and duration gates
M	docs/RELEASE_READINESS_CHECKLIST.md

COMMIT 7f677343c2199d6daf0b2ac799fd0457c92f0aac 2026-11-18 docs: record call duration guard and exact-head web CI evidence
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT 0dad356bb64e022e0d3c0442b6e423304239246e 2026-11-17 fix(calls): sweep duration-expired sessions without starvation
M	functions/src/index.ts

COMMIT 564f5fe483ee4c07cbb921d9e6740637afad37da 2026-11-17 fix(calls): distinguish duration expiry from manual termination
M	functions/src/index.ts

COMMIT b1cdb351d4315bf3c8f77f258cafee53446c2833 2026-11-17 test(ads): cover three rewards per campaign per rolling day
M	functions/test/featured-ad-rewards.test.js

COMMIT 9aa97d1faa0b878679b4e52a1eab322e578fc732 2026-11-17 fix(ads): enforce approved rolling campaign reward cap
M	functions/src/featured-ad-rewards.ts

COMMIT e7dcf51be028f9538e3cac9f70959a0f8eb921ff 2026-11-17 fix(calls): use explicit Firestore reference type and guard call responses
M	functions/src/index.ts

COMMIT 2897eabd4e7b63890ce7b75f0dc9bfa9b50af38d 2026-11-17 test(calls): cover connected duration enforcement
M	functions/test/integration/call-signaling.integration.test.js

COMMIT 2a2ac64e95d13d372efac54c74fd13cf20080b90 2026-11-17 feat(calls): enforce server-timed five-minute call ceiling
M	functions/src/index.ts

COMMIT 47ce01c5e1e5e013ee49052ec96cab07d21b81b8 2026-11-17 fix: evaluate call quota window at transaction execution
M	functions/src/index.ts

COMMIT 991187c809c680e51a2c313bce4fe7bca1ecf763 2026-11-17 test: cover rolling call attempt quotas and idempotency
M	functions/test/integration/call-signaling.integration.test.js

COMMIT 4d89b4ec370cf2198c2ef8307d14b35aa135e566 2026-11-17 fix: fail closed on malformed call quota history
M	functions/src/index.ts

COMMIT 7601c427a66b366c999f9eacba36d2fe1e812be6 2026-11-17 feat: enforce rolling server-side call attempt limits
M	functions/src/index.ts

COMMIT 3536d902bbf1d654eac46932528ea4ed955c92a1 2026-11-17 docs: restore call emulator test gate rationale
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT 1b96fcd21a01dc4f63d90e719f761442cd4ba5be 2026-11-17 ci: run call signaling emulator integration before release
M	.github/workflows/validate.yml

COMMIT fd9aad15e9ca12594a396680970f6d02530adb31 2026-11-17 test: include call signaling emulator integration in full suite
M	functions/package.json

COMMIT 0159805d1da3ef46c8d99caa5428d20003068f0e 2026-11-17 docs: record web-first calls and featured ads audit
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT adc82c3a42f3c5b3a8ce5ab952f355205638024a 2026-11-17 docs: record deferred call test entry point
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT ebed7d7a5fa83f6dc99824621a5bd4a37496d55d 2026-11-17 test: defer call integration from current all-tests suite
M	functions/package.json

COMMIT 2f259285a382e6b9faab1c6acb92a4b8ac4d4cbb 2026-11-17 docs: record owner-directed web-first test scope
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT 7ebb9a9e23839c37935aa8dbba9bdf7cce230cab 2026-11-17 docs: defer 5000-persona simulation from web launch gate
M	docs/RELEASE_READINESS_CHECKLIST.md

COMMIT da93beedb9381da9c3faafeb90bf1854af05f950 2026-11-17 docs: separate call implementation from post-launch acceptance
M	docs/RELEASE_READINESS_CHECKLIST.md

COMMIT b14d684e45ea31995ec4f35656b44a93f3478536 2026-11-17 ci: defer live-call integration gate until web launch
M	.github/workflows/validate.yml

COMMIT 35ec33ad8653359b8aaabe9dea544cf02501321a 2026-11-17 docs: clarify exact-head CI evidence for PWA fix
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT a43dbb95529ed6b4f38034c72b364e84878ea589 2026-11-17 docs: record PWA CI validator correction
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT b7cb42cb46a5d2f945d6c30af8c949f792c8c508 2026-11-17 ci: fix PWA asset validator shell quoting
M	.github/workflows/validate.yml

COMMIT 0e3a8898fd93b37f93960b64fff9e907e3086cf6 2026-11-17 docs(phase1): record web member-home and release candidate hardening
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT d69c722d7bf5642e14897fb96e24adbeb941cb32 2026-11-17 fix(ci): select production Firebase config for release candidate
M	.github/workflows/validate.yml

COMMIT 08a1bea61ee9060239a441d9a0b75d5795d6eec2 2026-11-17 ci(web): build production-configured release candidate without deployment
M	.github/workflows/validate.yml

COMMIT 2e05d1cf586d9aa7ecd1375a75efbc03a33a776e 2026-11-17 fix(ci): correct PWA icon path validation shell syntax
M	.github/workflows/validate.yml

COMMIT a50d205397b755997bb7a08e88616fa19970c257 2026-11-17 test(web): verify PWA and push notification assets
M	.github/workflows/validate.yml

COMMIT 389f78fef895484a3247fd1a2757df28b83baa09 2026-11-17 docs: record launch readiness baseline commit evidence
M	docs/operations/LAUNCH_READINESS_FREE_FIRST.md

COMMIT 23d83ce42f15b6b201a2313011b061eca423c519 2026-11-17 docs: define free-first Mawdda launch readiness gates
A	docs/operations/LAUNCH_READINESS_FREE_FIRST.md

COMMIT c9ed620372333690393453c04cb84ed853bca75a 2026-11-17 docs(android): link official Flutter ABI versioning guidance
M	docs/ANDROID_RELEASE_AND_GOOGLE_PLAY_SIGNING_2026.md

COMMIT 2f3bd7a4fa645f07e2f328496de51af159d4de12 2026-11-17 docs(android): record ABI version-code compatibility correction
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT b4d27031ff4815ad0f3ace2f4d84fa12cab8d15c 2026-11-17 docs(android): align release checklist with ABI version offsets
M	docs/RELEASE_READINESS_CHECKLIST.md

COMMIT 8e095965a6e56c1b12ddccc626f8c1a410ed57fd 2026-11-17 docs(android): clarify Flutter ABI-specific version codes
M	docs/ANDROID_RELEASE_AND_GOOGLE_PLAY_SIGNING_2026.md

COMMIT f02a66a03bdfbe5a900477b307095da882272b12 2026-11-17 test(android): lock Flutter ABI version code policy
M	tool/test_android_release_contract.py

COMMIT 454eb51aa02df463bc5e1c015e3ae5fbe80a5e64 2026-11-17 test(android): cover Flutter ABI version code offsets
M	tool/test_android_release_metadata.py

COMMIT 502d4641b330f5abdba046695361bee7e384daff 2026-11-17 docs(security): record immutable Android release source pin
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT 0627c231fb5da6a0b06f97117330bf6e4d9298cc 2026-11-17 docs(android): document immutable signed-release source pin
M	docs/ANDROID_RELEASE_AND_GOOGLE_PLAY_SIGNING_2026.md

COMMIT 24ec36e27cafd73d00301bc22090768237aef2d0 2026-11-17 test(security): require immutable release source SHA
M	tool/test_android_release_contract.py

COMMIT 67f193f699d1b2518e27ae869ec6a70cc9bbe75a 2026-11-17 security(android): pin signed release checkout to immutable SHA
M	.github/workflows/android-signed-release.yml

COMMIT 26ee5c246e96cd2a5457ed135e510dda31b97979 2026-11-17 docs: record Android release artifact verification hardening
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT 4e96125a44fbf0722a592771d79d3831cfeacd9f 2026-11-17 docs(security): record signed artifact malware scan gate
M	docs/ANDROID_RELEASE_AND_GOOGLE_PLAY_SIGNING_2026.md

COMMIT 5306fe37ab674cd432097b70ef632062450a9a66 2026-11-17 test(security): require ClamAV scan for signed artifacts
M	tool/test_android_release_contract.py

COMMIT 66680b2b06dab92821866a4222f32f21dba20903 2026-11-17 fix(security): persist ClamAV release scan log safely
M	.github/workflows/android-signed-release.yml

COMMIT 4472ac9c71737b325b6f5f84ef91339388aac3d2 2026-11-17 ci(android): run release metadata tests from repository root
M	.github/workflows/validate.yml

COMMIT 5bb2a963aedc3ac726b0edd49998db2f19c4d4d1 2026-11-17 security(android): scan signed release artifacts with ClamAV
M	.github/workflows/android-signed-release.yml

COMMIT 17204122954ef7814837676041356c41e26e3b37 2026-11-17 docs(release): strengthen Android artifact acceptance checks
M	docs/RELEASE_READINESS_CHECKLIST.md

COMMIT 137f29072f088421b95560f83b15b8e983efbc2d 2026-11-17 docs(android): document APK and AAB metadata verification
M	docs/ANDROID_RELEASE_AND_GOOGLE_PLAY_SIGNING_2026.md

COMMIT e59504862b8541ff4fb1257611c0414d088e4f03 2026-11-17 ci(android): run signed release metadata contract tests
M	.github/workflows/validate.yml

COMMIT 4e0970b7fe49c9b08aae8272f5782022c4ca5ec5 2026-11-17 test(android): require release metadata verification
M	tool/test_android_release_contract.py

COMMIT 0b80eeb08edfb91bb61d04561dcb323404f2a991 2026-11-17 fix(android): correct release metadata manifest script
M	.github/workflows/android-signed-release.yml

COMMIT 3974256c57d2933c3853ae6d41af18fce70665f4 2026-11-17 build(android): verify release APK and AAB identity metadata
M	.github/workflows/android-signed-release.yml

COMMIT 2a3d795de0e711ca11c5f626e6e86c7763e0420f 2026-11-17 test(android): cover APK and AAB release metadata
A	tool/test_android_release_metadata.py

COMMIT 6e4a7f12666d2ec2b15c3211d6fa49e3bbc72494 2026-11-17 test(firebase): fail closed without production native app identities
M	functions/test/validate-firebase-config.test.js

COMMIT c87336128d56f0433e498ffe9a59d19f5e322ec8 2026-11-17 test(android): build and verify nonproduction debug AAB in CI
M	.github/workflows/bootstrap-native-platforms.yml
M	docs/ANDROID_RELEASE_AND_GOOGLE_PLAY_SIGNING_2026.md
M	tool/test_android_release_contract.py

COMMIT 92ce92df10547a63d2bb0af53bda2bc72ed05da3 2026-11-17 docs(android): record production Firebase release gate
M	docs/ANDROID_RELEASE_AND_GOOGLE_PLAY_SIGNING_2026.md
M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md
M	docs/MAWADDA_PHASED_LAUNCH_AND_DISTRIBUTION_PLAN_2026.md
M	docs/MAWADDA_PRODUCT_CONSTITUTION.md
M	docs/RELEASE_READINESS_CHECKLIST.md
M	docs/SEVEN_PHASE_EXECUTION_PLAN.md

COMMIT e23d873dd73c8b475cf387687294462a63826330 2026-11-17 fix(android): require production Firebase config for signed artifacts
M	.github/workflows/android-signed-release.yml
M	tool/test_android_release_contract.py

COMMIT b6bba8b0085d9ff6d6140a1017a7cc0799aa4bf9 2026-11-17 test(firebase): validate production Android and iOS app identities
M	functions/scripts/validate-firebase-config.cjs
M	functions/test/validate-firebase-config.test.js

COMMIT c4c64caf82516fc8f3aefad8bf6d0882553485d9 2026-11-17 test(android): match dynamic apksigner invocation in contract check
M	tool/test_android_release_contract.py

COMMIT 80bdfa593be92564c35e093b85663c83c5f553a8 2026-11-17 fix(android): keep ABI APK collection separate from universal APK
M	.github/workflows/android-signed-release.yml

COMMIT 68010b0e771b5c8005756baaedf9705a1c0b32b8 2026-11-17 feat(android): prepare signed APK and Google Play AAB releases
M	.github/workflows/android-signed-release.yml
M	.github/workflows/bootstrap-native-platforms.yml
A	docs/ANDROID_RELEASE_AND_GOOGLE_PLAY_SIGNING_2026.md
M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md
M	docs/MAWADDA_PHASED_LAUNCH_AND_DISTRIBUTION_PLAN_2026.md
M	docs/MAWADDA_PRODUCT_CONSTITUTION.md
M	docs/RELEASE_READINESS_CHECKLIST.md
M	docs/SEVEN_PHASE_EXECUTION_PLAN.md
A	tool/test_android_release_contract.py

COMMIT f391908c4c58004b6cafd3d9b4abbd5785471be8 2026-11-17 docs: align execution plan with phased launch decision
M	docs/SEVEN_PHASE_EXECUTION_PLAN.md

COMMIT 41151ac2762d3800f63f14844196824772a3cb80 2026-11-17 docs: record phased launch gates in RELEASE_READINESS_CHECKLIST.md
M	docs/RELEASE_READINESS_CHECKLIST.md

COMMIT fd9cd145604bd955415786f35eb176789bb2c080 2026-11-17 docs: record phased launch gates in MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md
M	docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md

COMMIT eda27603b5108dddf0bd4b83d3d20601517deaf1 2026-11-17 docs: record phased launch gates in MAWADDA_PRODUCT_CONSTITUTION.md
M	docs/MAWADDA_PRODUCT_CONSTITUTION.md

COMMIT b38fd97717c0ec3b2caeb6670219d38b63e934d2 2026-11-17 docs: record approved phased launch and distribution plan
A	docs/MAWADDA_PHASED_LAUNCH_AND_DISTRIBUTION_PLAN_2026.md

COMMIT fa4543fd03e018c8f68fe191485c8803f5ef4552 2026-11-17 test: cover approved Android download hosts
A	test/policies/android_download_policy_test.dart

COMMIT 4be7c5c07aa995e30d350e624d6d0cc0e58efaf8 2026-11-17 docs: record Firebase identity validation and exact-head evidence
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT 734f76cdd928824ef56225ce5b70ecc1d0108d95 2026-11-17 test: validate production and non-production Firebase app identities
M	.github/workflows/validate.yml
M	functions/scripts/validate-firebase-config.cjs
M	functions/test/validate-firebase-config.test.js

COMMIT 797030153b1a2e570a61aac8c0f9e7cd138ed7f5 2026-11-17 docs: record featured reward policy reconciliation
M	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT baa0af88a5e16a5ec36b05a0109edb645888045d 2026-11-17 docs: record phase one call signaling hardening
A	docs/PHASE1_ENGINEERING_HARDENING_LOG.md

COMMIT 463f20a4338e4ec785450f073e86dbde97cc7d04 2026-11-17 test(calls): cover expired ringing signal and ICE access
M	functions/test/integration/call-signaling.integration.test.js

COMMIT f5a3c7a6325b51a31aa466637896ab852df20137 2026-11-17 fix(calls): reject expired ringing signal and ICE reads
M	functions/src/index.ts

COMMIT 86c13296d3efecd8eb4daf0c66604f534fd97af8 2026-11-16 fix(calls): stop serving SDP and ICE signals after a call terminates
M	functions/src/index.ts

COMMIT 12ae540db329048db02ff6c8df67eee805666282 2026-11-16 fix(calls): reject malformed direct-chat participant sets before call setup
M	functions/src/index.ts

COMMIT ccfba350f216040f90419079df883f522a9a2818 2026-11-16 perf(calls): resolve active call from atomic member lock instead of scanning sessions
M	functions/src/index.ts

COMMIT 26696497648c7cec421c69ec0290d08460a3b1d4 2026-11-16 fix(calls): batch signal cleanup below Firestore write limit
M	functions/src/index.ts

COMMIT 720a7c262e88c313aca40b9bb91c2b11ab8011f6 2026-11-16 fix(calls): clarify signaling cleanup completion timestamp field
M	functions/src/index.ts

COMMIT 1b40590385ce9014587ade5d1ed2727ffbf10a9f 2026-11-16 fix(calls): make expired signaling cleanup paginated and idempotent
M	functions/src/index.ts

COMMIT b24c59de56d0af5b25891ecdc313156fb696ead5 2026-11-16 fix(calls): recover signaling pagination when an expired cursor is cleaned up
M	functions/src/index.ts

COMMIT 4c44e32d3df28288ceef20ffd2c70b9b55536bfd 2026-11-16 perf(calls): paginate recipient-scoped signaling by server cursor
M	functions/src/index.ts

COMMIT 292573e676397af7ed048323baf645fd90c5d7da 2026-11-16 docs(traceability): record WebRTC call implementation and evidence boundaries
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 2f5647d41fe479f37d1d37f2f96422db1355ce62 2026-11-16 docs(status): record WebRTC call implementation and remaining acceptance blockers
M	docs/MAWDDA_PLATFORM_STATUS_2026.md

COMMIT f1308b202163bb1fe6a1d5a7abce26b6dcea7e03 2026-11-16 docs(coverage): add explicit partial WebRTC call journey and release gates
M	functions/test/fixtures/feature-coverage-matrix.json

COMMIT ec275e7832f6953fc65e125863f6de5069fa7841 2026-11-16 fix(calls): preserve explicit pre-acceptance answer rejection semantics
M	functions/src/index.ts

COMMIT edd902b02d92638860e9aa4fad8ccb5d71011beb 2026-11-16 test(calls): verify authenticated ICE configuration and TURN fail-safe
M	functions/test/integration/call-signaling.integration.test.js

COMMIT 71a0156eb1bdc347330a6efb119274bb2488f7bb 2026-11-16 fix(calls): enforce age-band and mutual block checks for room call participants
M	functions/src/index.ts

COMMIT ca6adb7047ec7427cac4229c2cdadf006f8b04a0 2026-11-16 fix(calls): allow fresh ICE renegotiation signals during long-running calls
M	functions/src/index.ts

COMMIT 9e69fad84b28faa80ca8b201cac33591473ab290 2026-11-16 test(calls): verify atomic member call locks and clean test fixtures
M	functions/test/integration/call-signaling.integration.test.js

COMMIT 244b31a977e8a96df7bb76391211920d7b2177de 2026-11-16 fix(calls): rely on inferred Firestore reference types for participant locks
M	functions/src/index.ts

COMMIT bcf190736e692d504151e62e00463543d9551ac8 2026-11-16 feat(calls): reserve participants atomically to prevent overlapping calls
M	functions/src/index.ts

COMMIT 328103fdbbc433b81dcb5d74fcd2e59e14e5f4a3 2026-11-16 fix(calls): enforce caller offer and recipient answer signaling roles
M	functions/src/index.ts

COMMIT 1f119d53a51e10f0f07831a438bc032f95461b57 2026-11-16 fix(calls): revoke signaling and ICE access for declined or departed participants
M	functions/src/index.ts

COMMIT e23ef1eb9e6d245005cbcb53a02a5f8c5d52c62a 2026-11-16 fix(tests): correct compiled call policy import path
M	functions/test/call-signaling.test.js

COMMIT 14310f8aa9fba1d131f8b3cdfc2c035cbf93a85a 2026-11-16 fix(calls): resolve Cloud Functions type errors in peer authorization and signal projection
M	functions/src/index.ts

COMMIT cd541ab86db6a4e1685b173ab1c5b4448be9636d 2026-11-16 fix(ci): retry Flutter lockfile update after concurrent branch pushes
M	.github/workflows/resolve-flutter-lock.yml

COMMIT 73a6b989f8fb31ce27b5a91dcc21c7698910d4a8 2026-11-16 test(calls): align signaling payload boundary test with bounded SDP limit
M	functions/test/call-signaling.test.js

COMMIT 08363c434985ebbec65f0cb29a832971726bf983 2026-11-16 test(calls): cover room multi-peer signaling isolation and participant leave
M	functions/test/integration/call-signaling.integration.test.js

COMMIT e2a7d14570097439ef92e37eaf8fcc00fb4961cf 2026-11-16 fix(calls): close expired ringing sessions and deny departed participants
M	functions/src/index.ts

COMMIT 0e87d9dfcc01d8f567d3fb9263c016933ad45908 2026-11-16 fix(calls): allow realistic SDP and bounded ICE candidate payload sizes
M	functions/src/call-signaling.ts

COMMIT 8246254962493007a234c134580aefe3e7fb0bef 2026-11-16 fix(tests): target each signaling exchange to its intended peer
M	functions/test/integration/call-signaling.integration.test.js

COMMIT b4f62de0acf1c0ddbc874dd5a68116b0ccf58d0f 2026-11-16 fix(calls): preserve active room calls when individual participants decline or leave
M	functions/src/index.ts

COMMIT 2d1735c957dfefce95b2a0e23b6dcd55f2c6b172 2026-11-16 fix(tests): provide explicit recipient for call signaling fixtures
M	functions/test/integration/call-signaling.integration.test.js

COMMIT 07dd651c4050883639332739801d0529d8286218 2026-11-16 feat(calls): route signaling per participant for multi-party room calls
M	functions/src/index.ts

COMMIT 12e409cce6e4310c56b91e5b9d4950f107bf442a 2026-11-16 ci(deps): trigger lock resolution for dependency workflow updates
M	.github/workflows/resolve-flutter-lock.yml

COMMIT f11f953ed3b8804a857a8a49ed68e59e7e53066f 2026-11-16 fix(calls): enforce ring expiry and avoid compound-index cleanup dependency
M	functions/src/index.ts

COMMIT 53cda02767e02f5a7386c8ff8f0b9e55b9a05886 2026-11-16 feat(calls): issue short-lived authenticated TURN credentials to call participants
M	functions/src/index.ts

COMMIT 2e8e3d8fadbc1a276da9d7d68127a79ffcf367c2 2026-11-16 ci(deps): resolve Flutter lockfile on pinned SDK when dependencies change
A	.github/workflows/resolve-flutter-lock.yml

COMMIT b1f183cc5bc5eda7823a765fa0a249d6da2c28ee 2026-11-16 feat(calls): add cross-platform WebRTC media dependency
M	pubspec.yaml

COMMIT b0cc7c11dab7c7dce2fc46be0b3d103e140bf28b 2026-11-16 ci(calls): run WebRTC signaling lifecycle emulator integration
M	.github/workflows/validate.yml

COMMIT ffb28227eb8ebf368c47d2bea88fda5fafaf79bd 2026-11-16 test(calls): add emulator integration suite to backend test aggregator
M	functions/package.json

COMMIT abf097045576198fce32cb0e7d8452f5786befe1 2026-11-16 fix(calls): support multi-member room acceptance and expire stale signaling
M	functions/src/index.ts

COMMIT ff1636da80105c372d64f0d683e0702593f36912 2026-11-16 fix(calls): validate SDP and ICE signal shapes
M	functions/src/call-signaling.ts

COMMIT c310674193184d7a498072589838ff312fe2f48a 2026-11-16 test(calls): exercise direct call and signaling lifecycle in emulator
A	functions/test/integration/call-signaling.integration.test.js

COMMIT a06dcb2f35b6372c24644fffaf3f1a6d205d5d1c 2026-11-16 feat(calls): add authenticated call lifecycle and WebRTC signaling callables
M	functions/src/index.ts

COMMIT 5f8aae21297257de038295282770f0532177377c 2026-11-16 test(calls): cover signaling validation and call state transitions
A	functions/test/call-signaling.test.js

COMMIT ea77809793974e8c588de528584fdd4375ca8911 2026-11-16 feat(calls): add validated call and signaling lifecycle policy
A	functions/src/call-signaling.ts

COMMIT 30066b4ae8e7e3c1a388cad11d84d58d95e9b65a 2026-11-16 test: isolate collision regression fixtures per run
M	functions/test/integration/engagement-rewards.integration.test.js

COMMIT c3d32d660ac9e8195ad1b13a01a87b5bbc7ad1d0 2026-11-16 docs: trace timed-ad counter collision integration coverage
M	docs/IMPLEMENTATION_TRACEABILITY.md

COMMIT 3ecea1b1d231dbff443cadecc9d046ade18f5779 2026-11-16 test: cover timed-ad legacy counter collision in emulator
M	functions/test/integration/engagement-rewards.integration.test.js

