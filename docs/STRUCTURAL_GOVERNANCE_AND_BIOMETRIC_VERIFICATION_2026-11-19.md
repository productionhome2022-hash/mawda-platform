# Mawdda Platform 2026 — Structural Governance & Biometric Verification Decisions

**Decision date:** 2026-11-19  
**Status:** Owner-approved requirements; implementation is in progress on an isolated development branch. This document is not evidence that the workflows are already implemented or production-ready.

## 1. Scope and non-negotiable boundaries

This change set covers:
1. A manual owner-reviewed member biometric-verification request workflow.
2. The user-facing owner title **Super Owner** throughout the product.
3. A distinct, open-ended general administration team titled **Admin 1**, **Admin 2**, etc.
4. Three strictly separate Media / Advertising / Workspace supervisor classes.

Do not deploy, merge to `main`, change production Firebase resources, enable paid services, or alter live member data as part of this work. All authorization must be enforced by trusted server code and security rules; hiding a control in Flutter is not authorization.

## 2. Verification cadence — email and biometric are separate

- Email verification renewal remains every **three calendar months**. Preserve the existing email-verification lifecycle and its separate 500 BetaCoins reward; do not change it as part of biometric work.
- Biometric verification renewal is every **one calendar month** after successful owner approval. The server must record the approval timestamp and calculate the next due date using calendar-month arithmetic (not a fixed 90-day period and not the email cadence). Once due, the member may submit a new biometric review request; a currently pending request still blocks duplicates.
- The three-month lockout after the third rejected biometric attempt is a separate abuse-control rule and remains three months. It must not be confused with the normal one-month biometric renewal cadence.

## 2. Biometric verification request workflow

### 2.1 Member submission

- Biometric verification is voluntary and initiated from the member's account.
- The member records an audio sample reading a short phrase generated/displayed by Mawdda from the platform's approved phrase options.
- The member then records a live video clip of movement using the in-app camera. Required duration: **3–5 seconds**.
- The request is submitted with the account's registered full name, username, immutable UID, and registered gender value, plus submission timestamp and attempt number.
- A member may have only one active/pending request at a time. Repeated submissions, modified clients, and concurrent calls must not create parallel requests or extra attempts.
- Immediately after successful submission, the member sees **«طلب التوثيق البيومتري قيد المراجعة»**. The request remains pending indefinitely until the Super Owner makes a decision; there is no automatic rejection or expiry merely because the owner is busy.

### 2.2 Owner review

- A dedicated **«طلبات التوثيق البيومتري»** inbox is available only to the Super Owner in the primary owner console.
- The inbox shows the submitted identity fields, registered gender, attempt number, and secure playback/preview controls for the audio and video.
- Only the Super Owner can accept or reject. The owner manually listens to the phrase and reviews the short video against the submitted account information and the platform's review criteria. No automated voice/face/gender classifier is part of this approved initial workflow.
- Every decision is server-authoritative, version-checked, reason-capable, timestamped, and written to an append-only audit record. Pending requests remain pending until an explicit decision.

### 2.3 Accept / reject / retry lifecycle

- **Accepted:** atomically set biometric verification to verified, set `biometricVerifiedAt` and the next renewal due date exactly one calendar month later, grant the member **1,500 BetaCoins** exactly once for that accepted verification, write the wallet ledger/reward record, add the biometric verification badge to the member profile, and create a member notification. A repeated decision/call must not grant another reward. Each later monthly renewal is a new review cycle; reward eligibility must follow the approved reward policy and must never be inferred from a client flag.
- **Rejected:** do not grant the reward; notify the member in their profile/inbox that this attempt was rejected and show the number of attempts remaining.
- Maximum: **three total submitted attempts**. After rejection of attempt 1, two remain; after rejection of attempt 2, one remains; after rejection of attempt 3, the biometric-verification application is locked for **three months**.
- During the lockout and after an unsuccessful biometric process, the member remains an ordinary member and retains email verification. The existing **500 BetaCoins email-verification reward** is not clawed back or replaced. The member may continue using the platform under ordinary account permissions.
- The server, not the client, owns attempt counters, lockout timestamps, status transitions, reward idempotency, and notification creation.

### 2.4 Data minimization, access, and destruction

- Audio/video are sensitive temporary evidence. Encrypt in transit and at rest; use private storage, short-lived access, strict Super Owner-only authorization, and access audit events.
- Never store biometric templates, face embeddings, voiceprints, or use these recordings to train recognition systems.
- On final accept/reject, revoke access and delete the source objects and temporary derivatives. A deletion job must be retryable and auditable; the request's non-media decision record remains.
- Retain only the minimum operational record: UID, attempt, request/decision status, decision actor/time, concise reason code if needed, reward ledger reference (accepted only), lockout timestamps, and deletion completion state. Do not retain the audio/video or their content in audit logs, analytics, notifications, or crash reports.
- Do not claim physical deletion from backups until the configured backup lifecycle has actually expired or the relevant encryption key has been destroyed. Any legal hold or backup-retention exception must be explicit, access-restricted, and documented. No media is added to the member's ordinary media quota.
- Submission consent and a clear explanation of purpose, review access, retention/deletion, and consequences must be shown before recording. Provide an accessible alternative support path if a member cannot complete the recording; do not silently classify inability as fraud.

### 2.5 Security and abuse controls

- Validate authenticated UID, account state, profile completion, payload size/type, video duration, phrase challenge version, upload ownership, and request state on the server.
- Use server-generated request IDs, one-active-request constraints, transactionally incremented attempt counters, expected-version checks, idempotency keys, rate limits, and signed short-lived upload/download access.
- Prevent client-supplied identity fields from overriding canonical profile fields. Snapshot the canonical values at submission and show the snapshot to the owner.
- The reward must be credited only by the owner decision transaction; client booleans, local OS biometric prompts, client-generated status flags, and replayed calls are never reward proof.
- A profile may be considered actively biometrically verified only when the server record proves `verificationMethod: owner_manual_review`, `reviewedBySuperOwner: true`, a non-empty `reviewRequestId`, and a future server-controlled expiry. Missing or legacy local-device-only evidence fails closed; it must not unlock biometric-only privileges or rewards.
- Do not enable this workflow until storage lifecycle deletion, authorization, notifications, wallet ledger atomicity, and emulator tests are implemented.

## 3. Canonical owner title: Super Owner

- Replace all user-visible owner-role labels and references to **Super Owner**, **Super Owner**, or equivalent owner labels with the exact canonical English title **Super Owner**.
- Apply consistently across Flutter screens, web/mobile surfaces, profile/role badges, navigation, dialogs, notifications, push copy, help text, audit-log display labels, and all supported locales (Arabic, English, French, Spanish).
- Arabic display translation should be consistent with the product glossary for **Super Owner**; do not expose mixed legacy labels.
- Keep stable internal authorization claims, database fields, callable names, collection names, and migration identifiers unchanged unless a separately reviewed compatibility migration is required. User-facing copy changes must never alter authority or security semantics.
- Search for case variants and translated legacy labels; add regression tests that prevent reintroduction in user-visible strings.

## 4. General administration team: Admin N

- This team is separate from all Media/Advertising teams.
- The Super Owner may appoint an open-ended number of general administrators (no hard-coded cap of five or ten).
- Assign a permanent, monotonically increasing sequence at the time the person is appointed: **Admin 1**, **Admin 2**, **Admin 3**, etc. Sequence numbers are not reused or renumbered after removal, suspension, or permission changes.
- Display the assigned title/number beside the member's name and on their profile wherever their role is shown, including chats, public/private rooms, member lists, and other visible member surfaces.
- Each Admin receives only explicitly delegated permissions. Default deny. No Admin can grant themselves permissions, appoint another Admin unless explicitly authorized by the Super Owner, alter Super Owner authority, or become Super Owner.
- Backend authorization and audit records use stable role identifiers and immutable appointment sequence, not display text. Never authorize by parsing a label such as “Admin 1”.

## 5. Media / Advertising / Workspace supervisor classes

These are three separate classes. Their labels, memberships, sequence spaces, permission catalogues, and audit scopes must never be mixed.

### 5.1 Admin Media — fixed five seats

- Exactly five designated **Admin Media** seats, individually numbered **Admin Media 1** through **Admin Media 5**.
- They are the general administrators for the Advertising Department and the general Media Workspace.
- They are not general platform Admins, not General Production Supervisors, and not Team Production Supervisors.
- Their delegated scope is limited to the Advertising / Media Workspace governance assigned by the Super Owner.

### 5.2 General Production Supervisors — fixed five seats

- Exactly five designated **مشرف إنتاج عام** (General Production Supervisor) seats, numbered 1 through 5 for display.
- They supervise production operations within the general Media / Workspace production system.
- They are separate from Admin Media and do not inherit Admin Media permissions.
- They are not supervisors of rented team production rooms merely because they hold this role.

### 5.3 Team Production Supervisor — open-ended

- Canonical Arabic title: **مشرف إنتاج الفريق**. English display title: **Team Production Supervisor**.
- No fixed maximum number.
- Each supervises their own production team within the specific rented/assigned team production room and its approved workspace.
- Permissions are scoped to the assigned room/team and cannot spill into other teams, general production governance, advertising administration, or platform administration unless the Super Owner separately grants a narrow explicit capability.
- Room/team creation, rental, membership, and lifecycle remain separate from the general production supervisor appointment.

### 5.4 Separation requirements

- General Admin N must use a separate platform-administration assignment model and must not be inserted into the specialized advertising/production grant collection. The current specialized role IDs for the three Media/production classes are `ad_general_supervisor`, `production_general_supervisor`, and `production_supervisor`; retain these IDs while enforcing their independent scopes. The `platform_admin` identity is a proposed stable ID for the new Admin N model, not proof that its server-side assignment schema already exists. Super Owner authority remains the existing owner claim/session and must never be granted by an Admin N appointment.
- The existing specialized grant implementation reuses `ad_general_supervisor`, `production_general_supervisor`, and `production_supervisor` for the three corresponding identities. Admin Media and General Production Supervisor seats are guarded by a shared Firestore seat-counter document and an authoritative grant query in the same transaction; this serializes concurrent assignments, and revocation reconciles the counter. Team Production Supervisor remains open-ended. Role validation rejects cross-team permission combinations, and Team Production Supervisor is restricted to assigned-team production actions.
- Store scope/assignment records separately from presentation labels.
- Permission checks must be deny-by-default and enforce scope server-side for every callable, Firestore rule, Storage rule, and relevant client route.
- A member may hold multiple roles only if explicitly appointed; role combination must not silently merge permissions.
- Do not reuse one team's sequence counter for another team.
- Removing a role revokes its permissions immediately while preserving immutable historical audit records and sequence assignments.
- UI must show the correct role badge in profiles, chat participants, public/private rooms, workspace membership, and other member identity surfaces. Where several roles are held, show only the context-relevant role(s) without implying higher authority.

## 6. Implementation and acceptance gates

Implementation must be incremental on a dedicated branch and must include:
1. Schema and migration review against existing user claims, profile documents, advertising permissions, production applications, rented-room ownership, and existing moderator contracts.
2. Server-side authorization helpers and deny-by-default tests for cross-role privilege escalation.
3. Owner-only biometric inbox and decision callables, member submission/status UI, notification delivery, profile badge, atomic BetaCoins ledger credit, and media deletion lifecycle.
4. Role assignment/revocation APIs with permanent sequence allocation and audit history.
5. End-to-end role badge projection in every identity surface.
6. Localized Super Owner labels and regression tests.
7. Emulator tests for concurrent submissions, three attempts, three-month lockout, owner-only review, delayed owner review, accept/reject notifications, exactly-once 1,500 BetaCoins credit, deletion retries, and no media persistence.
8. Permission matrix tests proving Admin, Admin Media, General Production Supervisor, and Team Production Supervisor cannot cross their assigned scopes.
9. Flutter analyze/tests, Functions build/unit/emulator tests, and security-rules tests on the exact final commit.

No merge to `main`, production deployment, production Firebase mutation, or production role migration until all gates pass and the owner explicitly approves release.

## معيار المصطلحات والهوية الإدارية الموحد — إلزامي على مستوى المنصة والوثائق

هذا القسم مرجع موحد ملزم، ويُقرأ مع بقية قرارات المنتج دون أن يغيّر مفاتيح الصلاحيات أو هويات البيانات الداخلية:

- **Super Owner**: المسمى الإنجليزي الرسمي الوحيد لمالك المنصة في جميع النصوص والواجهات والوثائق. التسمية العربية التفسيرية الموحدة: **مالك المنصة**. لا تُعرض تسميات بديلة أو قديمة للمالك.
- **Admin 1, Admin 2, Admin 3, ...**: فريق الإدارة العامة المفتوح العدد، بتسلسل دائم متزايد لا يعاد استخدامه ولا يعاد ترقيمه.
- **Admin Media 1–5**: خمسة مقاعد مستقلة حصراً لإدارة الإعلام/الإعلانات وMedia Workspace.
- **مشرف إنتاج عام 1–5**: خمسة مقاعد مستقلة للإشراف على الإنتاج العام.
- **مشرف إنتاج الفريق** / **Team Production Supervisor**: فئة مستقلة مفتوحة العدد، ونطاقها الفريق/الغرفة المخصصة أو المستأجرة فقط.

يجب تطبيق هذه المسميات حرفياً وباتساق في دستور المنتج، والرؤية الشاملة، وسجل القرارات، ومواصفات العلامة وتجربة المنتج، وخطط التنفيذ، ومصفوفات التتبع، وأدلة التشغيل والهندسة والاختبار، وREADME، وكل وثائق GitHub ذات الصلة. كما يجب أن تتطابق مع جميع واجهات Android وiOS وPWA والويب، والملفات الشخصية والشارات والقوائم والغرف والمحادثات وWorkspace والإعلانات ولوحات الإدارة، ورسائل النظام والإشعارات الفورية وسجلات العرض الموجهة للمستخدم.

أي ذكر تاريخي لمسمى قديم داخل سجل ترحيل أو وصف توافق تقني يجب أن يكون موسوماً بوضوح بأنه legacy/internal-only، وألا يظهر كخيار أو لقب أو نص للمستخدم. تُحفظ مفاتيح التفويض والـclaims وأسماء المجموعات والحقول وواجهات callable القديمة عند الحاجة للتوافق، ولا يجوز استبدالها آلياً لمجرد تشابه الاسم.

بوابة القبول: فحص شامل متعدد اللغات لكل ملفات الوثائق ومصادر النصوص والواجهات والإشعارات والرسائل، مع قائمة نتائج قابلة للمراجعة واختبارات تمنع إعادة إدخال المسميات القديمة في النصوص الظاهرة. يجب تدقيق مواضع الظهور الديناميكية ومخرجات الخادم وبيانات الإشعار، وليس ملفات Flutter وحدها. لا يُعلن اكتمال التوحيد ولا يُرفع طلب الدمج من Draft قبل إغلاق نتائج الفحص والاختبارات على SHA النهائي.
