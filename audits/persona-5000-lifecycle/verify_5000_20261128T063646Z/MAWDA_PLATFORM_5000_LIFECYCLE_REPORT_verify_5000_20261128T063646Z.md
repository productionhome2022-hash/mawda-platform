# Mawdda Platform — 5,000-Persona Lifecycle & Stress Verification Report (verify_5000_20261128T063646Z)

- RUN_ID: verify_5000_20261128T063646Z
- TARGET_GITHUB_RUN: 46115183044
- START_UTC: 2026-11-28T06:36:46Z
- END_UTC: 2026-11-28T06:36:59Z
- DURATION_SEC: 13
- REPOSITORY: productionhome2022-hash/mawda-platform
- BRANCH: codex/mawda-full-platform-implementation
- CORRESPONDING_LAB_REPORT: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/blob/codex/mawda-full-platform-implementation/audits/persona-5000-lifecycle/verify_5000_20261128T063646Z/MAWDDA_5000_LAB_LIFECYCLE_REPORT_verify_5000_20261128T063646Z.md

## Mandatory Guardrails
- Strictly no Firebase production execution, no app/hosting deployments, no merges to main, no Blaze/billing activation, and no live production data mutation or physical side effects.
- Simulation/CI findings are strictly separated from live production readiness.

## Covered Domains & Persona Lifecycle Scope
- Persona lifecycle: 5,000 personas (provisioning, active load, domain transitions, completion/failure/cancellation accounting).
- All 9 domains & policies: Auth/Sessions/Biometrics, Profiles/Discovery/Visits, Private/Public Chats, Rooms/Rentals/Bookings, Wallet/Coins/Store/Entitlements, Media Limits/Retention/Media Saver/GIF/Audio/Video/PDF, Calls/Signaling, Safety/Blocks/Reports, Notifications/Analytics.

## Extracted Findings & Logs
```text

For more information about the job, try: gh run view --job=140887291815
View this run on GitHub: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46115183044
completed	success	Lab media scanner offline validation	Lab media scanner offline validation	codex/mawda-full-platform-implementation	workflow_dispatch	46115190369	1m42s	2026-11-28T06:07:59Z
completed	success	Mawdda domain regression	Mawdda domain regression	codex/mawda-full-platform-implementation	workflow_dispatch	46115185748	1m46s	2026-11-28T06:07:55Z
completed	success	Run 5,000-persona simulation	Run 5,000-persona simulation	codex/mawda-full-platform-implementation	workflow_dispatch	46115183044	21m29s	2026-11-28T06:07:52Z
completed	success	docs(load-5000): record emulator jar diagnostic load_5000_emu_diag_20…	Economic phase verification	codex/mawda-full-platform-implementation	push	46074938947	52s	2026-11-27T22:10:09Z
completed	success	docs(load-5000): record emulator jar diagnostic load_5000_emu_diag_20…	Mawdda Test Center	codex/mawda-full-platform-implementation	push	46074938959	6m53s	2026-11-27T22:10:09Z
completed	cancelled	docs(load-5000): record direct emulator check load_5000_direct_202611…	Mawdda Test Center	codex/mawda-full-platform-implementation	push	46074099702	8m5s	2026-11-27T22:02:16Z
completed	success	docs(load-5000): record direct emulator check load_5000_direct_202611…	Economic phase verification	codex/mawda-full-platform-implementation	push	46074099683	59s	2026-11-27T22:02:16Z
completed	cancelled	docs(load-5000): record emulator --cwd check load_5000_cwd_20261127T2…	Mawdda Test Center	codex/mawda-full-platform-implementation	push	46073613700	4m54s	2026-11-27T21:57:41Z
error downloading mawdda-5000-simulation-46115183044: error extracting zip archive: error extracting "report.json": open /data/data/com.termux/files/home/mawda_verify_5000/verify_5000_20261128T063646Z/artifacts_46115183044/mawdda-5000-simulation-46115183044/report.json: file exists
Downloaded/collected files:
/data/data/com.termux/files/home/mawda_verify_5000/verify_5000_20261128T063646Z/artifacts_46115183044/dl.log
/data/data/com.termux/files/home/mawda_verify_5000/verify_5000_20261128T063646Z/artifacts_46115183044/mawdda-5000-simulation-46115183044/report.json
/data/data/com.termux/files/home/mawda_verify_5000/verify_5000_20261128T063646Z/artifacts_46115183044/metrics_tail.txt
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.5476404Z # Subtest: emit machine-readable load-test report
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.5477310Z ok 8 - emit machine-readable load-test report
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.5477865Z   ---
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.5478175Z   duration_ms: 14.15885
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.5478534Z   type: 'test'
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.5478830Z   ...
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.6432697Z 1..8
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.6433270Z # tests 8
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.6433627Z # suites 0
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.6433980Z # pass 8
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.6434321Z # fail 0
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.6434660Z # cancelled 0
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.6435043Z # skipped 0
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.6435388Z # todo 0
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.6436028Z # duration_ms 1236481.120637
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:13.6491605Z ^[[32m^[[1m✔ ^[[22m^[[39m Script exited successfully (code 0)
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:14.1503718Z ^[[36m^[[1mi  emulators:^[[22m^[[39m Shutting down emulators.
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:14.1507986Z ^[[36m^[[1mi  firestore:^[[22m^[[39m Stopping Firestore Emulator
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:14.3426036Z ^[[36m^[[1mi  auth:^[[22m^[[39m Stopping Authentication Emulator
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:14.3428580Z ^[[36m^[[1mi  hub:^[[22m^[[39m Stopping emulator hub
Build pinned Mawdda source and simulate 5,000 personas	Run the isolated 5,000-persona emulator lifecycle	2026-11-28T06:29:14.3438333Z ^[[36m^[[1mi  logging:^[[22m^[[39m Stopping Logging Emulator
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	﻿2026-11-28T06:29:14.4542394Z ##[group]Run actions/upload-artifact@v7.0.2
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4542663Z with:
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4542850Z   name: mawdda-5000-simulation-46115183044
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4543088Z   path: artifacts/report.json
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4543298Z   if-no-files-found: error
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4543501Z   retention-days: 3
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4543680Z   compression-level: 6
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4543861Z   overwrite: false
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4544040Z   include-hidden-files: false
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4544245Z   archive: true
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4544404Z env:
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4544649Z   JAVA_HOME: /opt/hostedtoolcache/Java_Temurin-Hotspot_jdk/21.0.13-2/x64
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4545061Z   JAVA_HOME_21_X64: /opt/hostedtoolcache/Java_Temurin-Hotspot_jdk/21.0.13-2/x64
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4545368Z   MAVEN_ARGS: -ntp
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4545756Z ##[endgroup]
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.5809611Z With the provided path, there will be 1 file uploaded
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.5826170Z Artifact name is valid!
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.5826749Z Root directory input is valid!
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.9296508Z Uploading artifact: mawdda-5000-simulation-46115183044.zip
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.9326559Z Beginning upload of artifact content to blob storage
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:15.5475665Z Uploaded bytes 282675
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:15.6235021Z Finished uploading artifact content to blob storage!
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:15.6237817Z SHA256 digest of uploaded artifact is aa8ba8478810a4ec85887eb0e3d4fd021fffeba3070361be79254defa2cc2c97
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:15.6238783Z Finalizing artifact upload
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:16.1203115Z Artifact mawdda-5000-simulation-46115183044 successfully finalized. Artifact ID 15251519102
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:16.1204511Z Artifact mawdda-5000-simulation-46115183044 has been successfully uploaded! Final size is 282675 bytes. Artifact ID is 15251519102
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:16.1207495Z Artifact download URL: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46115183044/artifacts/15251519102
Build pinned Mawdda source and simulate 5,000 personas	Post Set up Java for Firebase emulators	﻿2026-11-28T06:29:16.1400207Z Post job cleanup.
Build pinned Mawdda source and simulate 5,000 personas	Post Set up Node.js	﻿2026-11-28T06:29:16.2663696Z Post job cleanup.
Build pinned Mawdda source and simulate 5,000 personas	Post Set up Node.js	2026-11-28T06:29:16.3971845Z (node:3197) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
Build pinned Mawdda source and simulate 5,000 personas	Post Set up Node.js	2026-11-28T06:29:16.3973193Z (Use `node --trace-deprecation ...` to show where the warning was created)
Build pinned Mawdda source and simulate 5,000 personas	Post Set up Node.js	2026-11-28T06:29:16.3974917Z Cache hit occurred on the primary key node-cache-Linux-x64-npm-e7086dca98bb24192e26e6406eee0c8dde5b1fd453a3edc7929cf66dca531b44, not saving cache.
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	﻿2026-11-28T06:29:16.4120286Z Post job cleanup.
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.4987741Z [command]/usr/bin/git version
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5054269Z git version 2.56.1
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5071867Z Temporarily overriding HOME='/home/runner/work/_temp/3db36434-9cb3-4d61-b85d-ce4e6e2834e5' before making global git config changes
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5073192Z Adding repository directory to the temporary git global config as a safe directory
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5086545Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/mawdda-5000-simulation-lab/mawdda-5000-simulation-lab/platform
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5281076Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5284629Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5641665Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5762458Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.6070614Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.6093091Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	﻿2026-11-28T06:29:16.6499728Z Post job cleanup.
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.7336096Z [command]/usr/bin/git version
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.7417557Z git version 2.56.1
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.7421154Z Temporarily overriding HOME='/home/runner/work/_temp/27ddf0a7-07f0-4042-9465-0d1df26e3369' before making global git config changes
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.7422697Z Adding repository directory to the temporary git global config as a safe directory
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.7424157Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/mawdda-5000-simulation-lab/mawdda-5000-simulation-lab
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.7461777Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.7565055Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.7903154Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.7947663Z http.https://github.com/.extraheader
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.7949260Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.8009926Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.8368415Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
Build pinned Mawdda source and simulate 5,000 personas	Post Check out simulation lab	2026-11-28T06:29:16.8446851Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
Build pinned Mawdda source and simulate 5,000 personas	Complete job	﻿2026-11-28T06:29:16.8994197Z Cleaning up orphan processes
=== 3. ARTIFACT & REPO METRICS SCAN ===
--- File: /data/data/com.termux/files/home/mawda_verify_5000/verify_5000_20261128T063646Z/artifacts_46115183044/dl.log ---
--- File: /data/data/com.termux/files/home/mawda_verify_5000/verify_5000_20261128T063646Z/artifacts_46115183044/mawdda-5000-simulation-46115183044/report.json ---
  "scenario": "5000-persona-full-product-lifecycle",
  "durationMs": 1236112,
  "provisionedPersonas": 5000,
  "personaCoverageCount": 5000,
  "personaCoverage": [
      "personaId": "load-0001",
      "walletTransferCompleted": true,
      "walletLedgerReconciled": true,
      "personaId": "load-0002",
      "walletTransferCompleted": true,
      "walletLedgerReconciled": true,
      "personaId": "load-0003",
      "walletTransferCompleted": true,
      "walletLedgerReconciled": true,
      "personaId": "load-0004",
      "walletTransferCompleted": true,
      "walletLedgerReconciled": true,
      "personaId": "load-0005",
      "walletTransferCompleted": true,
      "walletLedgerReconciled": true,
      "personaId": "load-0006",
      "walletTransferCompleted": true,
      "walletLedgerReconciled": true,
      "personaId": "load-0007",
      "walletTransferCompleted": true,
      "walletLedgerReconciled": true,
      "personaId": "load-0008",
      "walletTransferCompleted": true,
      "walletLedgerReconciled": true,
      "personaId": "load-0009",
--- File: /data/data/com.termux/files/home/mawda_verify_5000/verify_5000_20261128T063646Z/artifacts_46115183044/metrics_tail.txt ---
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.4545756Z ##[endgroup]
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.5809611Z With the provided path, there will be 1 file uploaded
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.5826170Z Artifact name is valid!
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.5826749Z Root directory input is valid!
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.9296508Z Uploading artifact: mawdda-5000-simulation-46115183044.zip
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:14.9326559Z Beginning upload of artifact content to blob storage
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:15.5475665Z Uploaded bytes 282675
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:15.6235021Z Finished uploading artifact content to blob storage!
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:15.6237817Z SHA256 digest of uploaded artifact is aa8ba8478810a4ec85887eb0e3d4fd021fffeba3070361be79254defa2cc2c97
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:15.6238783Z Finalizing artifact upload
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:16.1203115Z Artifact mawdda-5000-simulation-46115183044 successfully finalized. Artifact ID 15251519102
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:16.1204511Z Artifact mawdda-5000-simulation-46115183044 has been successfully uploaded! Final size is 282675 bytes. Artifact ID is 15251519102
Build pinned Mawdda source and simulate 5,000 personas	Upload synthetic simulation report	2026-11-28T06:29:16.1207495Z Artifact download URL: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/46115183044/artifacts/15251519102
Build pinned Mawdda source and simulate 5,000 personas	Post Set up Java for Firebase emulators	﻿2026-11-28T06:29:16.1400207Z Post job cleanup.
Build pinned Mawdda source and simulate 5,000 personas	Post Set up Node.js	﻿2026-11-28T06:29:16.2663696Z Post job cleanup.
Build pinned Mawdda source and simulate 5,000 personas	Post Set up Node.js	2026-11-28T06:29:16.3971845Z (node:3197) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
Build pinned Mawdda source and simulate 5,000 personas	Post Set up Node.js	2026-11-28T06:29:16.3973193Z (Use `node --trace-deprecation ...` to show where the warning was created)
Build pinned Mawdda source and simulate 5,000 personas	Post Set up Node.js	2026-11-28T06:29:16.3974917Z Cache hit occurred on the primary key node-cache-Linux-x64-npm-e7086dca98bb24192e26e6406eee0c8dde5b1fd453a3edc7929cf66dca531b44, not saving cache.
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	﻿2026-11-28T06:29:16.4120286Z Post job cleanup.
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.4987741Z [command]/usr/bin/git version
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5054269Z git version 2.56.1
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5071867Z Temporarily overriding HOME='/home/runner/work/_temp/3db36434-9cb3-4d61-b85d-ce4e6e2834e5' before making global git config changes
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5073192Z Adding repository directory to the temporary git global config as a safe directory
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5086545Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/mawdda-5000-simulation-lab/mawdda-5000-simulation-lab/platform
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5281076Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5284629Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5641665Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.5762458Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.6070614Z [command]/usr/bin/git config --local --name-only --get-regexp ^includeIf\.gitdir:
Build pinned Mawdda source and simulate 5,000 personas	Post Check out the exact Mawdda Platform revision	2026-11-28T06:29:16.6093091Z [command]/usr/bin/git submodule foreach --recursive git config --local --show-origin --name-only --get-regexp remote.origin.url
```
