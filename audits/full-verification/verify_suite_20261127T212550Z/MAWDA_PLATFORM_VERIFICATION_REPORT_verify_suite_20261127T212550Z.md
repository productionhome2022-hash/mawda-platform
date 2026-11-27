# Mawdda Platform 2026 - Platform & 5,000-Persona Integration Verification Report

- RUN_ID: verify_suite_20261127T212550Z
- START_UTC: 2026-11-27T21:25:50Z
- GENERATED_UTC: 2026-11-27T21:26:09Z
- TARGET_BRANCH: codex/mawda-full-platform-implementation
- MAIN_PLATFORM_REPO: productionhome2022-hash/mawda-platform (PRE_SHA: c227e29612c640ef46e9e57e73c1f979b65ab43d)
- SIMULATION_LAB_REPO: productionhome2022-hash/mawdda-5000-simulation-lab (PRE_SHA: fee3325f4bdaf6f2b76c327739af596574b2bed2)
- CROSS_REF_PLATFORM_REPORT: https://github.com/productionhome2022-hash/mawda-platform/blob/codex/mawda-full-platform-implementation/audits/full-verification/verify_suite_20261127T212550Z/MAWDA_PLATFORM_VERIFICATION_REPORT_verify_suite_20261127T212550Z.md
- CROSS_REF_LAB_REPORT: https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/blob/codex/mawda-full-platform-implementation/audits/full-verification/verify_suite_20261127T212550Z/MAWDDA_5000_LAB_VERIFICATION_REPORT_verify_suite_20261127T212550Z.md

## 1. Environment & Termux Runtime
RUN_ID=verify_suite_20261127T212550Z
START_UTC=2026-11-27T21:25:50Z
TERMUX_VERSION=googleplay.2026.10.09
ANDROID_API=unknown
OS_KERNEL=Linux localhost 5.10.237-android12-9-00014-gf82f7360927e-ab14119954 #1 SMP PREEMPT Wed Sep 17 09:13:52 UTC 2025 aarch64 Android 
SHELL_NAME=/data/data/com.termux/files/usr/bin/bash
HAS_NODE=1
HAS_NPM=1
HAS_GH=1
HAS_FLUT=1
HAS_FB=1
NODE_VER=v24.17.0
NPM_VER=11.17.0
GH_VER=gh version 2.95.0

## 2. Main Platform Git State
REPO_TAG=PLAT
REPO_PATH=/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform
REMOTE_STATUS=reachable
BRANCH_INITIAL=codex/mawda-full-platform-implementation
SHA_INITIAL=c227e29612c640ef46e9e57e73c1f979b65ab43d
DIRTY_COUNT=0
BRANCH_ACTION=checked_out_local
BRANCH_ACTIVE=codex/mawda-full-platform-implementation
SHA_PRE_DEPOSIT=c227e29612c640ef46e9e57e73c1f979b65ab43d
--- DIRTY_FILES ---

--- LAST_12_COMMITS ---
c227e29612c640ef46e9e57e73c1f979b65ab43d | 2026-11-27T12:42:53+03:00 | production home | docs: record complete device synchronization 20261127T094156Z
65b83f035da3c8dc51f5613799a811fb26c68272 | 2026-11-27T12:32:00+03:00 | production home | docs: record Mawdda repository cleanup execution 20261127T093142Z
cb05bcaf72d91b266dea8bc8b5cb5832f00c3dd8 | 2026-11-27T12:16:13+03:00 | production home | docs(cleanup): record pre-cleanup readiness and deletion gate
c840e7953cbd6e588774d6ea4e7a618a53e2bb53 | 2026-11-27T11:50:50+03:00 | production home | docs(governance): record Firebase Google Cloud Cloudflare boundary
a20ccb16e2d0ca9ac6f08957ea69cae1736a0db8 | 2026-11-27T11:50:33+03:00 | production home | test(media-plane): cover case-insensitive duplicate TURN endpoints
5e78a03f0c3afc3f198925d581caa6aeddc017bb | 2026-11-27T11:50:31+03:00 | production home | fix(media-plane): reject case-insensitive duplicate TURN endpoints
d1746364b7894cf069da1475c7067d91ca1f4a4f | 2026-11-27T11:29:25+03:00 | production home | test(media-plane): import TURN URI validator in regression suite
b2a770fa562c1bc0f86ec82bd441a1e867186694 | 2026-11-27T11:28:34+03:00 | production home | fix(media-plane): correct TURN URI whitespace and query parsing
78c5a39f8c44d432970cfd0aeecb3ac3f830429e | 2026-11-27T11:28:12+03:00 | production home | test(media-plane): cover TURN ICE URI validation and fallback safety
de370bc248307eeb9cb6d31b95e79b5d6fa39b2a | 2026-11-27T11:28:09+03:00 | production home | fix(calls): fail closed on malformed TURN configuration
43d2f89c9a6ecdb6dd7dddbe2f15c26175988a94 | 2026-11-27T11:28:07+03:00 | production home | fix(media-plane): validate TURN ICE endpoint URIs
c2ace23ef591f7697c60641d938b32b095dc306e | 2026-11-27T11:15:08+03:00 | production home | test(media): use explicit URL scheme assertion in Media Saver regression

## 3. Simulation Lab Git State (Cross-Repository Context)
REPO_TAG=LAB
REPO_PATH=/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab
REMOTE_STATUS=reachable
BRANCH_INITIAL=main
SHA_INITIAL=c9a3a330c914e84a8e0a3bbb524028d79264cf30
DIRTY_COUNT=0
BRANCH_ACTION=checked_out_remote
BRANCH_ACTIVE=codex/mawda-full-platform-implementation
SHA_PRE_DEPOSIT=fee3325f4bdaf6f2b76c327739af596574b2bed2
--- DIRTY_FILES ---

--- LAST_12_COMMITS ---
fee3325f4bdaf6f2b76c327739af596574b2bed2 | 2026-11-27T23:47:23+03:00 | production home | docs(audit): freeze historical audit bundle and record acceptance scope
a40a82e0e696ab4c53b32dcf1e28391921cb8bf4 | 2026-11-27T23:39:54+03:00 | Mawda Developer | docs(audit): full 3-hour repair and simulation engine history (mawda_full_audit_3h_20261127T203941Z)
dbc86d3daeaa6fa304a120c7694d2d76b3638453 | 2026-11-27T23:36:55+03:00 | Mawda Developer | docs(audit): full 2-hour repair and simulation engine history (mawda_full_audit_2h_20261127T203641Z)
44e62f0a3498ec32344baed812b4ff9e96a82cd1 | 2026-11-27T23:28:22+03:00 | Mawda Developer | docs(audit): add complete repair and simulation engine history (mawda_audit_20261127T202803Z)
99d8b9a55f9baed93bdd87f8a908525fc1f4d844 | 2026-11-27T22:53:53+03:00 | Mawda Developer | docs(report): add detailed report for run 46055971553
896dd5ba40796b3ded04eac9c5d83de5938d6707 | 2026-11-27T22:20:09+03:00 | Mawda Developer | test(load): increase batch sizes across persona-load test and set 1500s timeout
d256671abe6275ca0c4dda3bf8e791597c261328 | 2026-11-27T21:57:22+03:00 | Mawda Developer | ci(test): increase emulator exec timeout to 900s (15 minutes)
703090b9ceed2338ba40578bbc60c8500169a049 | 2026-11-27T21:31:39+03:00 | Mawda Developer | ci(test): increase emulator exec timeout from 300s to 600s for 5000-persona lifecycle
779b831d2a9cdcf4a47efc4b1cf25db2e8e0fd96 | 2026-11-27T21:19:07+03:00 | Mawda Developer | test(load): pass expectedVersion 0 in setStoreCatalogItem lifecycle setup
7bfb849582b010c615a16b64be8abb98f596d769 | 2026-11-27T20:56:35+03:00 | Mawda Developer | ci(test): add testOnly true and @test.mawdda.invalid email to 5000 personas
93dbc2bdb3086156138df741887f404c0f6fd34a | 2026-11-27T20:43:46+03:00 | Mawda Developer | ci(test): fix mawda-platform repository slug in checkout step
973ebcd022ff96c104cbce54ccb2709d1c831250 | 2026-11-27T20:40:35+03:00 | Mawda Developer | ci(test): include environment firebase-emulator-only in 5000-persona fixture

## 4. Protected Closed Fixes & Non-Reopening Policy
- PRESERVED_CLOSED_REGISTRY_ENTRIES: 182
- Sources:
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/artifacts/audits/repair-history/mawda_audit_20261127T202803Z/REPAIR_REGISTRY.csv (3 rows)
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/artifacts/audits/repair-history/mawda_full_audit_2h_20261127T203641Z/REPAIR_REGISTRY.csv (28 rows)
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/artifacts/audits/repair-history/mawda_full_audit_3h_20261127T203941Z/REPAIR_REGISTRY.csv (151 rows)
- Closed repairs and stable simulation engine behavior are preserved without reopening unless a new reproducible failure or regression is proven.

## 5. Platform Scenarios, Policies & Guardrails Scope
- Covers authentication/sessions/roles, profile model consistency, private/public chats, message ordering/deduplication, public/private/rented rooms, booking/rental/refund/expiry in isolated tests, wallet/coins/store/entitlements/atomic transactions, media limits (60s live audio, 3 MiB image, 3 MiB/20s/50fps GIF, 5 MiB/60s audio, 25 MiB original video, 15 MiB/90s safe derivative video, 20 MiB pinned-owner PDF), retention policies (without live destructive deletion), Media Saver authorization, security rules, retry/network resilience, and concurrency.
- Firebase project name referenced in config/docs: mawda-app-2026 (strictly non-production; no production Firebase edits, no Blaze/billing activation, no merge to main, no production deployment, no secrets).
=== 5000-PERSONA ENGINE & SCENARIO SCAN ===
LOAD_TEST_FILE=/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js
10:const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
19:const db = getFirestore();
21:const fixturePath = process.env.MAWDDA_LOAD_FIXTURE || path.join(__dirname, "..", "artifacts", "personas.json");
23:const personas = fixture.personas;
26:const metrics = { createdUsers: 0, scenarios: [], personaCoverage: [], lifecycleCoverage: [], transactionRetries: 0 };
28:  "premiumEntitlementsProvisioned", "storePurchaseCompleted", "storeReceiptAndLedgerVerified",
30:  "discoveryExecuted", "boostedDiscoveryVerified", "blockUnblockVerified",
31:  "pushTokenLifecycleVerified", "roomJoined", "eventListed", "eventRsvpConfirmed",
39:async function retryAbortedTransaction(operation, maxAttempts = 7) {
45:      const message = String(error?.message ?? "");
46:      const retryable = code === "10" || code === "aborted" ||
47:        /\bABORTED\b|Transaction lock timeout|too much contention/i.test(message);
48:      if (!retryable || attempt === maxAttempts - 1) throw error;
58:async function inBatches(items, size, worker) {
61:    results.push(...await Promise.all(items.slice(i, i + size).map(worker)));
69:test("load-test fixture is emulator-only and contains 5000 unique synthetic personas", async () => {
70:  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
73:  assert.equal(fixture.count, personas.length);
74:  assert.ok(personas.length >= 5000, "the full 5000-persona run is required");
75:  assert.equal(new Set(personas.map((p) => p.personaId)).size, personas.length);
76:  assert.ok(personas.every((p) => p.testOnly === true && p.email.endsWith("@test.mawdda.invalid")));
79:test("provision all 5000 emulator-only identities and synthetic member profiles", async () => {
80:  await inBatches(personas, 100, async (persona) => {
82:      email: persona.email,
83:      password: `Load!-${persona.personaId}-Only-Emulator-2026`,
85:      displayName: persona.displayName
87:    persona.uid = user.uid;
90:      email: persona.email,
92:      displayName: persona.displayName,
93:      fullName: persona.displayName,
94:      username: persona.username,
96:      coins: 10000,
99:      age: persona.age,
100:      gender: persona.gender,
101:      country: persona.country,
102:      region: persona.region,
103:      profession: persona.profession,
104:      bio: persona.biography,
105:      interests: persona.interests,
108:      testPersonaId: persona.personaId,
113:    await db.collection("testAccountProfiles").doc(persona.personaId).set({
115:      personaId: persona.personaId,
117:      displayName: persona.displayName,
119:      capabilities: ["profile.readWrite", "discovery.browse", "chat.direct", "wallet.transfer", "premium.profile", "rooms.public.join", "rooms.events.rsvp"],
122:        uniqueHandle: persona.username,
123:        biography: persona.biography,
124:        country: persona.country,
125:        region: persona.region,
126:        age: persona.age,
127:        gender: persona.gender,
128:        profession: persona.profession,
129:        interests: persona.interests,
134:        walletFixture: { coins: 10000, mode: "sandbox" },
135:        testLabels: ["MAWDDA_TEST_ONLY", "LOAD_TEST", persona.personaId]
141:  metrics.createdUsers = personas.length;
142:  console.log(`[persona-load] provisioned=${metrics.createdUsers}`);
145:for (const count of [500, 1000, 2500, 5000]) {
146:  test(`${count} synthetic personas concurrently transfer coins and exchange direct messages`, async () => {
147:    const cohort = personas.slice(0, count);
149:    await inBatches(cohort, BATCH_SIZE, async (persona) => {
150:      const userRef = db.collection("users").doc(persona.uid);
152:      const batch = db.batch();
153:      ledger.docs.forEach((doc) => batch.delete(doc.ref));
154:      batch.update(userRef, { coins: 10000 });
155:      await batch.commit();
157:    const settingsRef = db.doc("platformSettings/coinTransfers");
162:    for (let i = 0; i < cohort.length; i += 2) pairs.push([cohort[i], cohort[i + 1]]);
163:    const personaIdByUid = new Map(cohort.map((persona) => [persona.uid, persona.personaId]));
164:    const personaCoverage = new Map(cohort.map((persona) => [persona.personaId, {
165:      personaId: persona.personaId,
166:      uid: persona.uid,
173:    const messageTimes = [];
176:    let messageErrors = 0;
179:      await inBatches(pairs, BATCH_SIZE, async ([sender, recipient], pairIndex) => {
180:        const requestId = `load_${count}_${sender.personaId}_${recipient.personaId}`;
191:          personaCoverage.get(sender.personaId).walletTransferCompleted = true;
192:          personaCoverage.get(recipient.personaId).walletTransferCompleted = true;
198:          transferTimes.push(performance.now() - transferStart);
203:        const messageStart = performance.now();
205:          const message = await sendDirectMessage.run({
208:              text: `اختبار ضغط مودة ${count}: ${sender.personaId} إلى ${recipient.personaId}`,
209:              clientMessageId: `load_dm_${count}_${sender.personaId}_${recipient.personaId}`
213:          assert.equal(message.replayed, false);
214:          messageTimes.push(performance.now() - messageStart);
217:            data: { chatId: message.chatId },
220:          assert.ok(inbox.messages.some((item) => item.messageId === message.messageId),
221:            "the recipient must be able to read the delivered message");
222:          receiveTimes.push(performance.now() - receiveStart);
223:          personaCoverage.get(sender.personaId).directMessagesSent += 1;
224:          personaCoverage.get(recipient.personaId).directMessagesReceived += 1;
230:              text: `رد اختبار مودة ${count}: ${recipient.personaId} إلى ${sender.personaId}`,
231:              clientMessageId: `load_reply_${count}_${recipient.personaId}_${sender.personaId}`
236:          messageTimes.push(performance.now() - replyStart);
242:          assert.ok(senderInbox.messages.some((item) => item.messageId === reply.messageId),
244:          receiveTimes.push(performance.now() - replyReceiveStart);
245:          personaCoverage.get(recipient.personaId).directMessagesSent += 1;
246:          personaCoverage.get(sender.personaId).directMessagesReceived += 1;
248:          messageErrors += 1;
255:        const transferId = `${sender.uid}_load_${count}_${sender.personaId}_${recipient.personaId}`;
265:          senderBalance: senderDoc.data().coins,

=== PLATFORM SCENARIOS & POLICY SCAN (NON-DESTRUCTIVE) ===
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:10:const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:17:const { getAuth } = require("firebase-admin/auth");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:19:const db = getFirestore();
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:20:const auth = getAuth();
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:24:const BATCH_SIZE = 125;
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:28:  "premiumEntitlementsProvisioned", "storePurchaseCompleted", "storeReceiptAndLedgerVerified",
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:31:  "pushTokenLifecycleVerified", "roomJoined", "eventListed", "eventRsvpConfirmed",
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:45:      const message = String(error?.message ?? "");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:47:        /\bABORTED\b|Transaction lock timeout|too much contention/i.test(message);
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:69:test("load-test fixture is emulator-only and contains 5000 unique synthetic personas", async () => {
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:70:  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:74:  assert.ok(personas.length >= 5000, "the full 5000-persona run is required");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:79:test("provision all 5000 emulator-only identities and synthetic member profiles", async () => {
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:81:    const user = await auth.createUser({
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:96:      coins: 10000,
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:119:      capabilities: ["profile.readWrite", "discovery.browse", "chat.direct", "wallet.transfer", "premium.profile", "rooms.public.join", "rooms.events.rsvp"],
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:134:        walletFixture: { coins: 10000, mode: "sandbox" },
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:145:for (const count of [500, 1000, 2500, 5000]) {
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:146:  test(`${count} synthetic personas concurrently transfer coins and exchange direct messages`, async () => {
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:148:    // Each tier starts from a clean sandbox wallet state so results are comparable.
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:151:      const ledger = await userRef.collection("walletLedger").get();
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:154:      batch.update(userRef, { coins: 10000 });
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:157:    const settingsRef = db.doc("platformSettings/coinTransfers");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:167:      walletTransferCompleted: false,
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:168:      walletLedgerReconciled: false,
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:173:    const messageTimes = [];
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:176:    let messageErrors = 0;
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:185:            auth: callableAuth(sender.uid)
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:191:          personaCoverage.get(sender.personaId).walletTransferCompleted = true;
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:192:          personaCoverage.get(recipient.personaId).walletTransferCompleted = true;
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:195:            auth: callableAuth(sender.uid)
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:203:        const messageStart = performance.now();
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:205:          const message = await sendDirectMessage.run({
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:211:            auth: callableAuth(sender.uid)
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:213:          assert.equal(message.replayed, false);
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:214:          messageTimes.push(performance.now() - messageStart);
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:217:            data: { chatId: message.chatId },
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:218:            auth: callableAuth(recipient.uid)
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:220:          assert.ok(inbox.messages.some((item) => item.messageId === message.messageId),
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:221:            "the recipient must be able to read the delivered message");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:233:            auth: callableAuth(recipient.uid)
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:236:          messageTimes.push(performance.now() - replyStart);
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:239:            data: { chatId: reply.chatId },
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:240:            auth: callableAuth(sender.uid)
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:242:          assert.ok(senderInbox.messages.some((item) => item.messageId === reply.messageId),
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:248:          messageErrors += 1;
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:251:        return { pairIndex, chatId: null };
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:259:          db.collection("users").doc(sender.uid).collection("walletLedger").doc(transferId).get(),
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:260:          db.collection("users").doc(recipient.uid).collection("walletLedger").doc(transferId).get()
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:265:          senderBalance: senderDoc.data().coins,
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:266:          recipientBalance: recipientDoc.data().coins,
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:272:        x.senderLedger && x.recipientLedger), "all paired wallet balances and ledgers must reconcile");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:274:      assert.equal(messageErrors, 0);
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:276:        personaCoverage.get(personaIdByUid.get(transfer.senderUid)).walletLedgerReconciled = transfer.senderLedger;
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:277:        personaCoverage.get(personaIdByUid.get(transfer.recipientUid)).walletLedgerReconciled = transfer.recipientLedger;
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:281:      assert.ok(coverageRows.every((row) => row.walletTransferCompleted &&
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:282:        row.walletLedgerReconciled &&
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:284:      "every persona must complete a transfer, reconcile its ledger role, and send/receive a direct message");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:285:      if (count === 5000) metrics.personaCoverage = coverageRows;
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:296:        messageErrors,
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:299:        transferLatencyMs: { p50: percentile(transferTimes, 0.50), p95: percentile(transferTimes, 0.95), max: Number(Math.max(...transferTimes).toFixed(2)) },
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:300:        messageLatencyMs: { p50: percentile(messageTimes, 0.50), p95: percentile(messageTimes, 0.95), max: Number(Math.max(...messageTimes).toFixed(2)) },
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:301:        receiveLatencyMs: { p50: percentile(receiveTimes, 0.50), p95: percentile(receiveTimes, 0.95), max: Number(Math.max(...receiveTimes).toFixed(2)) }
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:313:test("all 5000 personas complete a connected member, premium-profile, discovery, room and event lifecycle", async () => {
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:314:  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Firestore emulator is required");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:316:  assert.equal(metrics.createdUsers, 5000, "the complete 5000-persona fixture must be provisioned first");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:319:  const expiresAt = Timestamp.fromMillis(now + 7 * 24 * 60 * 60 * 1000);
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:321:  const ROOM_COHORT_SIZE = 50;
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:322:  const roomGroups = [];
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:325:    roomGroups.push({
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:326:      roomId: "persona_lifecycle_" + runTag + "_" + String(roomGroups.length).padStart(3, "0"),
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:332:  const roomGroupByPersona = new Map();
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:337:  roomGroups.forEach((group) => group.members.forEach((persona) => roomGroupByPersona.set(persona.uid, group)));
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:341:    storePurchaseCompleted: false,
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:342:    storeReceiptAndLedgerVerified: false,
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:350:    roomJoined: false,
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:371:    const storeOwnerUid = "persona-lifecycle-emulator-owner";
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:375:        description: "Emulator-only VIP purchase used by the 5000-persona lifecycle test.",
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:380:      auth: {
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:381:        uid: storeOwnerUid,
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:383:          platformOwner: true, platformOwnerUid: storeOwnerUid,
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:384:          auth_time: Math.floor(Date.now() / 1000),
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:393:    // Sandbox entitlement fixtures for profile capabilities not purchased here.
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:396:      const entitlementIds = [
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:402:      for (const [itemId, category] of entitlementIds) {
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:403:        batch.set(userRef.collection("entitlements").doc(itemId), {
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:413:    recordLifecycleProgress("premium-entitlements-provisioned");
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:416:    // the same request, and reconciles the immutable receipt and wallet ledger.
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:419:      const before = (await userRef.get()).data().coins;
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js:421:      const request = { data: { itemId: "vip_monthly", requestId, expectedPriceCoins: 100, expectedCatalogVersion }, auth: callableAuth(persona.uid) };

=== WORKFLOWS SCAN ===
4:  workflow_dispatch:
6:      platform_sha:
7:        description: "Target mawda-platform SHA or 'latest' to resolve branch HEAD"
9:        default: "latest"
14:jobs:
16:    runs-on: ubuntu-latest
22:      GCLOUD_PROJECT: "mawdda-emulator-test"
38:      - name: Pin and verify target platform_sha
41:          REQ_SHA="${{ inputs.platform_sha }}"
43:          if [ -n "$REQ_SHA" ] && [ "$REQ_SHA" != "latest" ]; then
66:          npm install -g firebase-tools@latest
69:        uses: subosito/flutter-action@v2
73:      - name: Run Cloud Functions build and unit tests
76:          cd platform/functions
78:          npm test | tee ../../lab/ci_artifacts/functions_test.log
81:      - name: Prepare exact 5000-persona fixture and run suite against emulators
84:          NODE_PATH: "${{ github.workspace }}/platform/functions/node_modules"
88:          node --test test/firestore-transient-retry.test.js | tee ci_artifacts/firestore_retry.log
105:                testOnly: true,
106:                email: personaId + "@test.mawdda.invalid",
128:            (cd ../platform && timeout 1500s firebase emulators:exec --only auth,firestore,storage "cd '${{ github.workspace }}/lab' && MAWDA_PLATFORM_ROOT='${{ github.workspace }}/platform' NODE_PATH='${{ github.workspace }}/platform/functions/node_modules' FIRESTORE_EMULATOR_HOST='127.0.0.1:8080' FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099' FIREBASE_STORAGE_EMULATOR_HOST='127.0.0.1:9199' node --test test/persona-load.integration.test.js") | tee -a ci_artifacts/persona_emulator.log
130:            node --test test/persona-load.integration.test.js | tee -a ci_artifacts/persona_emulator.log
134:      - name: Run Flutter/Dart tests in lab
138:          flutter pub get
139:          flutter test --reporter expanded | tee ci_artifacts/flutter_test.log

## 6. Limitations, Remaining Items & Readiness Decision
- Synthetic 5,000-persona emulator runs do NOT by themselves prove live production capacity for 5,000 concurrent real users or live external calling/media hardware behavior.
- Isolated functions check status in runner: failed_or_env_restricted_isolated.
- Readiness decision: Ready for next verification step on branch codex/mawda-full-platform-implementation within isolated/emulator boundaries.
