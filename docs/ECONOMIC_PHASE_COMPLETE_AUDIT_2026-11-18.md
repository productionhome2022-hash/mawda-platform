# المرحلة الاقتصادية الشاملة — تدقيق وإغلاق 2026-11-18

## نطاق المرحلة

هذه المرحلة هي المسار الاقتصادي الموحد للمنصة وتطبيقاتها، وتشمل:

- BetaCoins والمحفظة والتحويلات والعمولات وسجل التدقيق.
- جميع المتاجر والـSKU والاستحقاقات والمدد والأسعار التجريبية.
- شراء المزايا، المنح، الإهداء، والهدايا.
- مكافآت الحضور الساعي واليومي والأسبوعي.
- مكافآت التحقق من البريد.
- مكافآت الإعلانات العادية والمميزة.
- الإعلانات والحملات والجلسات والنبضات والسحب.
- Advertising Media Workspace وطلبات المحتوى وصنّاع المحتوى والاتفاقيات.
- Media Saver والوسائط الآمنة.
- المكالمات الصوتية والمرئية واستحقاقاتها وحصصها والفوترة التجريبية.
- Android وiOS وWeb كعملاء لنفس المحرك الاقتصادي المركزي.

## قواعد سيادية

- المالك وSuper Admin هوية واحدة وشخص واحد.
- كلمة «الإدارة» في الاقتصاد تعني المالك/Super Admin فقط.
- المشرفون العامون لا يحصلون على صلاحيات المالك أو رؤية الرصيد المالي لمجرد امتلاك دور إشرافي.
- لا توجد أسعار أو حصص إطلاق مثبتة في العميل.
- قيم الاختبار/التطوير قابلة للتعديل من المالك وليست أسعار إطلاق.
- لا نشر أو دمج إلى main أو فوترة إنتاجية من هذه المرحلة.

## BetaCoins

الاسم التجاري الظاهر المعتمد في جميع واجهات المنصة والتطبيقات هو **BetaCoins** كلمة إنجليزية واحدة دون مسافة.

المعرفات التقنية القديمة مثل `coins` تبقى مؤقتاً حفاظاً على التوافق مع البيانات والعقود الخادمية، ولا يتم تغييرها لمجرد تغيير الاسم التجاري.

## خصوصية الرصيد

- صاحب الملف يرى رصيده.
- المالك/Super Admin يرى رصيد أي ملف.
- العضو العادي والصديق وغير الصديق والمشرف العام لا يرى الرقم.
- عند إخفاء الرصيد يظهر قفل بدلاً من الرقم.
- الحماية خادمية: الرصيد لا يدخل الإسقاط العام للملف للمستخدم غير المصرح له.

## Hide Coins

تم إغلاق قاعدة الصلاحيات وتنفيذ إسقاط الرصيد الخادمي في ملف العضو، مع اختبار مصفوفة:
- self
- ordinary member
- moderator
- sole owner/Super Admin

ولا يكفي إخفاء الرقم في Flutter وحده.

## المشغل الإعلاني

النسبة المعتمدة للتجربة المرئية هي **60% للمشغل و40% للمعلومات**، وتُفسر حسب عرض الشاشة، وليس 75/25. أي مواصفة قديمة تقول 75/25 يجب ألا تستخدم في التنفيذ.

## المكالمات

المكالمات جزء من الاقتصاد الشامل، لكن لا تُعلن مكتملة حتى تتوافر:
- استحقاقات الطرفين.
- الحصص 5 صوت/3 مرئي لكل نافذة 24 ساعة متحركة.
- سقف المكالمة 5 دقائق.
- الفوترة المفتوحة بعد استنفاد الحصة.
- خصم ذري وidempotency وledger.
- إفصاح وموافقة كل طرف قابل للخصم.
- اختبار إعادة الاتصال والتزامن ونفاد الرصيد.
- TURN/STUN وقبول جهاز فعلي.

**قيمة اختبار التطوير المقترحة لوحدة الفوترة:** دقيقة متصلة واحدة، مع تقريب إلى الأعلى عند استهلاك الوحدة التالية. هذه قيمة اختبارية فقط وليست سعر إطلاق.

## Media Saver

المواصفة: منتج مدفوع موحد للمحادثات الخاصة والغرف العامة والغرف الخاصة المستأجرة، يحفظ الصور/GIF/الفيديو/الصوت محلياً ولا يمدد الاحتفاظ الخادمي.

حالة الإغلاق: ما زال يحتاج دورة حفظ محلية متعددة المنصات واختبار end-to-end قبل تفعيل الشراء.

## الإعلانات

الإعلانات المميزة والإعلانات العادية يجب أن تشتركا في محرك المكافآت المركزي دون خلط الجلسات أو السجلات.

لا تعتبر واجهة العرض الثابتة أو دوال القرار وحدها دورة إعلان مكتملة. يلزم feed خادمي، جلسة، heartbeat، completion evidence، claim idempotency، wallet ledger، history، pause/withdrawal، واختبارات التزامن.

## بوابة الاختبار

لا يرفع هذا الملف حالة المرحلة إلى «مكتملة». حالة المرحلة تبقى «قيد الإغلاق» حتى:
1. نجاح exact-head CI.
2. نجاح اختبارات Functions وEmulator وFlutter.
3. اكتمال الاختبارات المحلية الممكنة.
4. معالجة كل فشل.
5. توثيق SHA ونتائج الاختبار.
6. بعد ذلك فقط ننتقل إلى اختبار المرحلة الشامل متعدد المنصات.

## آخر تغيير في هذه الجولة

تم تنفيذ حماية رصيد BetaCoins خادمياً، وتوحيد اسم BetaCoins في واجهات الملف والإعلانات المميزة، وتثبيت نسبة 60/40 في وثيقة المرحلة، مع عدم دمج main أو لمس الإنتاج.

## New hardening in this execution pass

- Timed-ad reward caps are now enforced server-side for the development environment: maximum 10 rewarded ad claims per member per UTC day, maximum 20 BetaCoins from rewarded ads per member per UTC day, and maximum 3 rewarded claims per member per campaign.
- The daily cap is stored in a dedicated per-member/per-UTC-day counter inside the same transaction as the wallet credit and reward claim, preventing concurrent requests from bypassing the cap.
- Campaign validation rejects a per-member campaign limit above the experimental maximum.

## Source audit findings — call economy and Media Saver (2026-11-18)

### Calls
The current call backend implements authenticated WebRTC signaling, participant locks, rolling 24-hour attempt counters (5 audio / 3 video), and a server-recorded five-minute maximum beginning after connection confirmation. The Flutter call screen invokes signaling/connection functions and displays the five-minute ceiling.

The inspected call lifecycle does **not** yet implement economic entitlement checks, explicit per-party billing consent, a metered connected-duration ledger, atomic BetaCoins debit/refund, or an idempotent call-settlement record. The existing 5/3 quota counts attempts, not billable completed calls. Do not represent it as a free-call entitlement or a paid-call billing system. Multi-party room-call settlement also requires a deliberate policy before implementation.

### Media Saver
The development branch tree inspected in this pass contains no dedicated Media Saver client service/screen or end-to-end local-save workflow. The secure media gateway and entitlement/store infrastructure exist separately, but their presence does not prove local save fulfillment. Keep Media Saver purchase fulfillment disabled until the client-side secure download/save, per-operation server entitlement verification, platform permission handling, and tests are implemented.

### Call UI lifecycle audit
The inspected Flutter call screen reports connection and uses a five-minute display, but it does not show a billing-consent step or billing status. This is a concrete integration gap, not a cosmetic issue. The next call-economy implementation must fail closed when entitlement/consent/settlement state is missing and must not infer consent from accepting a call.


## Daily rewarded-ad cap testability hardening — 2026-11-18

- Extracted the daily claim/coin cap decision into the pure `decideTimedAdDailyCap` guard used by the existing Firestore transaction.
- The guard validates all counter inputs as safe non-negative integers, rejects a zero/invalid next reward, and returns a stable rejection reason for claim-count or coin-budget exhaustion.
- Added exact-boundary unit cases for 9/10 claims, 20/21 daily coins, and malformed inputs. These tests are committed but have **not** been executed in this environment.
- The transaction still reads the per-member UTC-day counter before writes and applies the wallet credit, reward claim, campaign budget, and daily counter atomically. Cap rejection continues through the existing cancellation path, which releases the reserved campaign reward and grants no coins.


## Store fulfillment safety correction — Hide Coins SKU

The server-side profile projection already withholds every member's BetaCoins balance from all non-owner viewers, regardless of whether the target member has purchased a Hide Coins entitlement. Therefore the current `hide_coins_30d` SKU would charge for no additional observable behavior under the approved privacy rule. Its fulfillment-ready allowlist entry has been removed and purchase validation now fails closed. The catalog item may remain unpublished/disabled for future redesign, but it must not be sold until a distinct, owner-approved behavior exists that does not weaken the baseline privacy rule.


## Owner clarification: recurring store entitlements and gifting — 2026-11-18

Approved behavior now recorded as ECON-007 in the decision traceability register:

- Entitlements run for the selected catalog duration and expire server-side. Once expired, the same member may buy that item again for a fresh term; an expired record must not block repurchase.
- A member may browse the relevant stores and gift any currently published, purchasable, fulfillment-ready item to another eligible member, regardless of whether the sender previously bought or owns that item. Gifting does not consume or transfer the sender's own entitlement.
- Visitors/guest accounts are never valid gift recipients. Enforce eligibility on the server for both parties.
- A gift is a distinct atomic transaction: price/catalog revalidation, sender debit, wallet ledger, gift record, recipient entitlement/history, and request idempotency. A new gift must not overwrite or shorten a recipient's active timed entitlement; stack from max(server-now, current expiry) unless a catalog-specific non-stackable policy is explicitly approved.
- Owner free grants remain a separate privileged audited flow and do not fulfill member gifting.

Historical gap recorded before the implementation sections below. This gap was partially addressed by the backend and recipient-profile-only UI changes documented in sections 142–167. Remaining acceptance work is Functions/Firestore Emulator execution, Flutter analysis/widget tests, renewal/expiry integration tests, and cross-platform coverage. Do not mark the gifting path fully accepted until those tests pass.


## Member-to-member gifting backend implementation — 2026-11-18

- Added the giftStoreItem callable on the development branch. Anonymous senders are rejected from the verified Firebase Auth provider claim. Recipient Auth provider data is checked server-side; a recipient must also have a completed, good-standing member profile and no dedicated guest profile/session records. Sender and recipient are checked again in the Firestore transaction.
- The transaction revalidates the published catalog item, fulfillment allowlist and exact current price; debits the sender's BetaCoins once; creates the immutable wallet-ledger debit and gift receipt; extends/creates the recipient entitlement; and writes recipient gift history plus an in-app notification. The sender's own entitlement is not read or modified.
- Request IDs are bound to sender, recipient, item and confirmed price. Replaying the same request returns the original result; a distinct request ID remains a distinct gift.
- Timed entitlements stack from the later of server time and current expiry. An active permanent entitlement is not shortened by a timed gift. Discovery boost expiry is also considered when applying a boost gift.
- Added pure domain tests for eligibility, replay compatibility, expiry stacking, permanent entitlement preservation and malformed durations. Tests are committed but have NOT been executed. UI integration, emulator transaction tests and platform acceptance remain open.


## Recipient-profile-only feature gifting UX — 2026-11-18

- Updated the Flutter member profile so a visitor to another member's profile sees two distinct actions: gifting BetaCoins and gifting a store feature. The feature flow loads the server catalog, shows only purchase-enabled and fulfillment-ready items, displays price/duration, asks for confirmation, and sends the already-open profile UID directly to giftStoreItem.
- This works for friends and non-friends and avoids ambiguous username search. Recipient identity is anchored to the profile being viewed, not user-entered text.
- Removed the gift action and username search flow from the store screen. The store remains for browsing and self-purchase. Removed the now-unneeded username lookup callable.
- Backend eligibility and guest checks remain authoritative. No client-side state is trusted for settlement.
- Static source review only; Flutter analysis/tests and Functions/Firestore Emulator tests have not been run.


## BetaCoins gifting choices on recipient profile — 2026-11-18

- The profile's existing BetaCoins gift button now opens two choices: an owner-configured active package, or a custom amount transferred from the sender's own current balance.
- The custom amount reuses the existing server quote and atomic transfer callable, showing gross debit, configured commission and recipient net amount before confirmation.
- Package gifts load only active packages from platformSettings/economyPricing. The user confirms the displayed price and target profile. Because this repository's current coin checkout is manual owner-contact (automated checkout is disabled), the UI explicitly says this creates a purchase request and that no coins are issued until the owner verifies external payment and approves it.
- Backend package requests bind giftRecipientUid to the open profile, reject self-gifting, verify recipient membership/Auth eligibility and guest exclusion, and include recipient identity in replay compatibility. Owner approval revalidates recipient eligibility and atomically credits the recipient (not the purchaser), writes the recipient wallet ledger, coinPackageGifts receipt, coinPackageGiftHistory and in-app notification, and records owner audit. Push delivery is best-effort after commit.
- Received coin package gifts are included in the member gift history. Purchaser request history and owner approval queue identify the gift recipient. Regression tests were added for package recipient validation and disallowing custom package gifts through this request path.
- Tests have NOT been executed. No real payment was processed and no coin package was credited in production.


## Owner-approved group-call pricing and capacity amendment — 2026-11-18

- Scope is limited to group calls inside active rented private rooms. Public rooms must reject audio and video calls.
- Audio: 1,000 BetaCoins total per connected call-minute, divided equally among the members connected in that interval.
- Video: 2,000 BetaCoins total per connected call-minute, divided equally among the members connected in that interval; maximum four members total including the initiator. The server must reject a fifth member.
- Group audio participant count follows the active rented room's approved capacity; this amendment introduces no separate fixed audio cap.
- Each participant, including the initiator, must pass server-side entitlement/open-subscription eligibility at join. Room membership does not itself grant call eligibility.
- Metering starts only after connected state is established and must track each member's actual connected intervals. Ringing/unconnected time is excluded. Joins, leaves, reconnects, concurrent joins, insufficient balances, and retries require safe, auditable handling. Show each participant's share before consent; settle with atomic, idempotent server-side debits and wallet-ledger entries.
- This is an approved policy amendment, not an implementation-complete claim. Current startCall code still accepts active rooms without verifying rented-private status, selects all room members, and applies a fixed two-to-five participant bound. The call path does not yet implement group-call metering, split allocation, or the approved video four-member rule. These are open engineering gaps; direct-call pricing is unchanged.


### Owner clarification — integer group-call billing and initiator remainder (2026-11-18)
- BetaCoins wallet balances and ledger amounts remain whole integers; fractional coin amounts are never stored or debited.
- For each billable group-call interval, divide the approved total by the actual connected participant count using integer floor shares for every participant other than the call initiator. Charge the initiator the exact remaining amount so the sum of all participant debits equals the approved interval total exactly.
- The initiator therefore absorbs the complete rounding remainder. Example for 1,000 BetaCoins audio: with 7 connected members, six non-initiators pay 142 each and the initiator pays 148; with 9 connected members, eight non-initiators pay 111 each and the initiator pays 112. With 4 members, each pays 250. For 2,000 BetaCoins video and 4 members, each pays 500.
- The split must be calculated server-side from the immutable participant set for that billed interval, validated as positive safe integers, and persisted with the corresponding idempotent wallet debits/ledger entries in one atomic settlement. A participant who is not actually connected in that interval is not included. Direct one-to-one call pricing is unchanged.
- This is an approved allocation rule, not a claim that group-call entitlement, metering, or settlement has been integrated or accepted.


## Room-call security gate implementation update — 2026-11-18

- Added `functions/src/room-call-policy.ts` and unit cases in `functions/test/room-call-policy.test.js`.
- Updated `startCall` so room-scope requests require `kind=private`, `isRented=true`, and a matching `roomRentals` record whose status and both room/rental expiries are active. The same room/rental state is re-read inside the call-creation Firestore transaction to close the preflight-to-write race.
- Public rooms, non-rented private rooms, expired rentals, mismatched rental ownership/room IDs, and grace-period rentals now fail closed at call creation.
- Video room calls now reject more than four current room members in the existing all-members invitation model.
- This is a narrow security hardening only. It does **not** complete participant selection, audio capacity handling, per-participant entitlement, explicit billing consent, connected-interval metering, wallet settlement, or ledger integration. The current all-members model and fixed room-member query bound remain known limitations; do not treat group calls as economically enabled.
- The new unit tests and Functions build have **not** been executed. Container access to GitHub was unavailable, so no local checkout or runtime test could be performed. No production resources were accessed.

## Clarification — historical timed-ad quota status (2026-11-25)

The earlier statement above about 10 rewarded-ad claims and 20 BetaCoins per member per UTC day, plus 3 claims per campaign, records a historical implementation snapshot from the economic source branch. It is not evidence that these fixed global limits are present in the current Full Platform branch, and it is not an owner-approved launch quota. The current approved-decision register does not authorize hard-coded global 10/20/3 values. The current Full Platform retains its existing campaign-level maxClaimsPerMember validation and featured-campaign maxDailyClaimsPerMember configuration; these are distinct from a global per-member daily claim/coin counter. Do not use the historical paragraph as a current enforcement or pricing/quota statement. Any global quota requires explicit owner approval and centrally configurable policy before implementation.
