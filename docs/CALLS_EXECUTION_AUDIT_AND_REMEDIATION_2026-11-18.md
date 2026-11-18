# تدقيق تنفيذي وخطة معالجة دورة المكالمات — 2026-11-18

الحالة: **تدقيق مصدر موثق؛ إصلاح اختباري محدود؛ التنفيذ الوظيفي غير مكتمل**  
المستودع: `productionhome2022-hash/mawda-platform`  
فرع العمل: `codex/economic-phase1-closeout-2026-11-18`  
مرجع التدقيق: HEAD السابق `e75c15e913aec676930c279fbcbedf4f53016513`  
Commit هذا التحديث الاختباري: `b0ddd12c4b7675e34fe7b69faa18bc533ac69e6d`

## 1. ما تم فحصه

تمت مراجعة الملفات الفعلية التالية على فرع العمل:

- `functions/src/index.ts` — `startCall`, `respondToCall`, `markCallConnected`, signaling, `getActiveCall`.
- `functions/src/call-signaling.ts`.
- `functions/src/group-call-economy.ts`.
- `functions/src/room-call-policy.ts`.
- `functions/src/store-purchase.ts`, `functions/src/default-store-catalog.ts`.
- `functions/test/integration/call-signaling.integration.test.js`.
- `lib/screens/mawdda_call_screen.dart`.
- `functions/package.json`.

## 2. إصلاح اختباري منفذ

كان اختبار تكامل مكالمات الغرف يجهز غرفة عامة غير مستأجرة، بينما `startCall` يرفض الغرف العامة ويشترط غرفة خاصة مستأجرة مع سجل إيجار مطابق وساري. هذا يجعل fixture الاختبار غير متوافق مع السياسة الحالية.

تم تعديل fixture ليستخدم:

- غرفة خاصة نشطة مع `isRented=true` ومعرف إيجار.
- وثيقة `roomRentals` مطابقة للغرفة والمالك وبانتهاء مستقبلي.
- تنظيف وثيقة الإيجار وسجل حصة محاولات المكالمات عند نهاية الاختبار.

الملف: `functions/test/integration/call-signaling.integration.test.js`  
Commit: `b0ddd12c4b7675e34fe7b69faa18bc533ac69e6d`

**لم يتم تشغيل الاختبار أو Emulator أو TypeScript build**؛ هذا تعديل fixture فقط، وليس إثبات نجاح الاختبار.

## 3. الفجوات الحرجة المثبتة في المصدر

### CALL-P0-A — اختيار المشاركين والموافقة

- `startCall` يقرأ أعضاء الغرفة تلقائياً عبر `members.limit(6)`.
- يشترط حالياً 2–5 أعضاء، وهو حد ثابت يتعارض مع سياسة الصوت التي تجعل العدد تابعاً لسعة الغرفة.
- ينشئ قائمة المشاركين من جميع الأعضاء، ولا يستقبل طلب انضمام مستقل من العضو.
- يضع أقفال المكالمة لكل أعضاء الغرفة المحددين قبل موافقة المرسل.
- `respondToCall` يسمح للمدعو بقبول/رفض المكالمة، لكنه لا يملك مسار طلب انضمام يراجعه المرسل ويوافق عليه أو يرفضه.
- سقف الفيديو أربعة موجود في الخادم، لكنه مطبق على حجم مجموعة الأعضاء المختارة تلقائياً، لا على مجموعة المشاركين المقبولين فعلياً.

**المطلوب:** طلب انضمام مستقل، قرار مرسل مستقل لكل طلب، تحقق خادمي من سعة الغرفة عند الطلب وعند القبول، وقفل العضو فقط بعد استكمال شروط الانضمام. الصوت لا يملك سقفاً ثابتاً مستقلاً؛ الفيديو أربعة أشخاص إجمالاً بمن فيهم المرسل.

### CALL-P0-B — الاستحقاق والموافقة المالية

- مصدر الاستحقاق القائم في المتجر هو `users/{uid}/entitlements/{itemId}`.
- كتالوج العناصر يتضمن `voice_call_24h/7d/30d` و`video_call_24h/7d/30d`، ووصفه يذكر اشتراك الطرفين.
- مسار المكالمات الحالي لا يقرأ استحقاقات المشاركين ولا يتحقق من صلاحيتها أو انتهاء مدتها.
- لا يوجد سجل موافقة مالية مستقلة لكل مشارك أو إثبات أنه وافق على السعر والحصة المعروضة.

**المطلوب:** التحقق الخادمي من عنصر الاستحقاق الصحيح لكل مشارك بما في ذلك المرسل، ورفض غير المستحق أو المنتهي. قبول المكالمة أو موافقة المرسل على طلب الانضمام لا تعني موافقة مالية. يجب حفظ موافقة العضو على عرض واضح مرتبط بإصدار السعر والمكالمة والفترة.

### CALL-P0-C — اتصال فعلي وقياس وفوترة

- `markCallConnected` يعتمد على تقارير اتصال من العميل، ثم ينشئ مؤقتاً عاماً عند وجود المرسل ومستلم مقبول واحد.
- لا توجد فترات اتصال مستقلة لكل مشارك، ولا immutable participant set لكل فترة فوترة.
- لم يظهر ربط فعلي لدالة `calculateGroupCallCoinShares` بتسوية محفظة جماعية أو قيود ledger.
- لا توجد دورة تسوية جماعية ذرية/idempotent تمنع الخصم المكرر والرصيد السالب.

**المطلوب:** تحديد موثوقية الاتصال من مزود الوسائط/خادم الجلسة، وإغلاق فترات المشاركين عند الدخول والخروج والانقطاع، ثم تسوية كل فترة بمعاملة ذرية. لا يجوز بدء الفوترة من إشعار عميل وحده باعتباره إثباتاً موثوقاً لتسليم الوسائط.

### CALL-P0-D — طوبولوجيا WebRTC لا تحقق رؤية الجميع

- المرسل ينشئ عروض الاتصال للمدعوين.
- الخادم يسمح بإنشاء `offer` من منشئ المكالمة فقط، وبـ`answer` من الطرف الآخر.
- العميل عند الطرف المستقبل يضبط `_remoteUids` على منشئ المكالمة فقط.
- نتيجة ذلك أن التصميم الحالي نجمي بين المرسل وكل مشارك؛ لا يثبت أن المشاركين يرون/يسمعون بعضهم بعضاً مباشرة.
- واجهة `MawddaCallScreen` تعرض البثوث البعيدة في Grid، لكنها تعرض البث المحلي في نافذة عائمة منفصلة؛ ولا تنفذ بعد شبكة متناظرة تشمل كل المشاركين أو خانة الأدوات الرابعة في حالة ثلاثة أشخاص.

**المطلوب:** حسم طوبولوجيا وسائط مناسبة قبل اعتماد واجهة الفيديو. للفيديو حتى أربعة مشاركين يمكن دراسة mesh كامل مع تفاوض آمن لكل زوج، أو SFU. للصوت الذي يتبع سعة الغرفة دون سقف صغير، mesh الكامل ينمو بعدد اتصالات تربيعي ولا ينبغي افتراض أنه قابل للتوسع؛ يلزم SFU أو بنية وسائط جماعية مناسبة. TURN ليس SFU ولا يحل مزج/توزيع الوسائط الجماعية وحده. لم يُعثر في الملفات المفحوصة على عقد SFU قائم أو مورد مهيأ. لا يتم إنشاء أو تفعيل مورد مدفوع أو بنية خارجية دون موافقة المالك.

### CALL-P1-E — تخطيط الفيديو وأدوات المكالمة

متطلبات المالك الموثقة:

- فيديو لشخصين: عرض متوازن للطرفين.
- ثلاثة أشخاص: ثلاثة مربعات فيديو متساوية، والخانة الرابعة في شبكة 2×2 مخصصة لأدوات التفاعل، لا تترك فارغة.
- أدوات الخانة الرابعة: الملصقات، الكتابة/الدردشة، الإشعارات، وأدوات إضافية مناسبة؛ تظهر لكل مشارك وفق الصلاحيات.
- أربعة أشخاص: أربع خانات فيديو متساوية 2×2، وتنقل الأدوات إلى لوحة/شريط منفصل قابل للفتح.
- لا يُحجب الفيديو أو الوجوه بسبب الأدوات أو الإشعارات، ويعاد التخطيط بسلاسة عند الانضمام والمغادرة.
- يجب اختبار الاتجاهين العمودي والأفقي ومقاسات Android المختلفة.

**ملاحظة:** لا يصح تقديم تعديل واجهة الشبكة وحده كحل نهائي قبل إصلاح طوبولوجيا الوسائط حتى تتوفر بثوث جميع المشاركين فعلياً لدى كل طرف.

## 4. ترتيب التنفيذ الإلزامي

1. **CALL-P0-A:** تصميم ونشر state machine لطلبات الانضمام وموافقة المرسل مع قيود سعة الغرفة؛ دون auto-invite ودون قفل أعضاء غير مشاركين.
2. **CALL-P0-B:** ربط مصدر الاستحقاق الفعلي وموافقة مالية مستقلة قابلة للتدقيق.
3. **CALL-P0-D:** حسم وتنفيذ طوبولوجيا الوسائط: mesh محدود للفيديو أو SFU؛ وتحديد مسار قابل للتوسع للصوت. لا تفعيل موارد مدفوعة دون موافقة.
4. **CALL-P0-C:** بناء الاتصال الموثوق والفترات الفردية والتسوية الذرية وLedger.
5. **CALL-P1-E:** تنفيذ تخطيط الفيديو والخانة الرابعة التفاعلية بعد استقرار بث جميع المشاركين.
6. إضافة اختبارات وحدة وCallable/Firestore Emulator وFlutter Widget/Integration لكل حالة، ثم تشغيلها وتوثيق النتائج على SHA محدد.

## 5. بوابات قبول لا يجوز تجاوزها

- الصوت: 2 و4 و7 و9 مشاركين، ثم الحد التشغيلي الفعلي لسعة الغرفة؛ لا سقف ثابت مصطنع في منطق الصوت.
- الفيديو: 2 و3 و4 مقبولون؛ الخامس مرفوض خادمياً.
- طلبات الانضمام: قبول/رفض مستقل لكل عضو، لا يدخل العضو قبل قرار المرسل واستحقاقه وموافقته المالية.
- كل مشارك يرى/يسمع المشاركين الآخرين فعلياً؛ اختبار بث متعدد الأطراف، لا مجرد وجود عناصر UI.
- اتصال/انقطاع/إعادة اتصال/مغادرة ودخول متزامن دون تكرار أو فقد قيود.
- مجموع الخصومات في كل فترة يساوي السعر المعتمد تماماً، والأرصدة أعداد صحيحة ولا تصبح سالبة.
- اختبارات الواجهة: شخصان، ثلاثة مع خانة أدوات، أربعة 2×2، شاشات صغيرة وكبيرة واتجاهان.
- لا فوترة جماعية قبل اكتمال جميع بوابات P0.

## 6. حالة العمل والقيود

- المنجز في هذه الجولة: تدقيق المصدر وتحديد فجوات موثقة، وإصلاح fixture اختبار الغرفة ليطابق شرط الغرفة الخاصة المستأجرة.
- غير المنجز: إعادة تصميم دورة الانضمام، الاستحقاقات، الموافقة المالية، SFU/mesh، القياس والتسوية، وواجهة الفيديو.
- لم يتم تشغيل `npm test` أو `npm run test:call-signaling-integration` أو Firestore Emulator أو Flutter Analyze/Tests.
- لا توجد نتائج CI مرتبطة بCommit الاختبار وقت التحقق.
- لم يتم تعديل Firebase أو الإنتاج أو تفعيل فوترة أو مورد مدفوع.
- لم يحدث دمج إلى `main` أو نشر.

هذا السجل يصف فجوات مثبتة وخطة تنفيذ. لا يعد ادعاءً باكتمال المكالمات أو قبولها.


## مراجعة متابعة على رأس فرع الإغلاق الاقتصادي — 2026-11-18

- أعيدت قراءة ملفات المكالمات على رأس الفرع الذي راجعته قائمة الفروع في GitHub: `24fb901684d851108d47c476b7030695cd01194c`.
- تأكد من المصدر أن `startCall` ما زال يقرأ أعضاء الغرفة عبر `members.limit(6)`، ويقبل عملياً 2–5 فقط، ثم يضع أقفال المكالمة على كل الأعضاء المحددين قبل صدور موافقتهم. هذا السلوك لا يطابق قرار طلب الانضمام المستقل وموافقة منشئ المكالمة.
- تأكد أن `respondToCall` يقبل/يرفض المكالمة الواردة فقط، ولا يحتوي مساراً منفصلاً لطلب الانضمام إلى مكالمة قائمة ولا موافقة مالية مستقلة.
- تأكد أن `markCallConnected` يجمع بلاغات `connectedUids` من العملاء ويبدأ ساعة عامة عند وجود المنشئ ومشارك مقبول واحد؛ لا ينشئ فترات اتصال موثوقة مستقلة لكل مشارك ولا يصلح وحده أساساً للخصم.
- مصدر الاستحقاقات في كتالوج المتجر يحتوي أسماء `voice_call_24h/7d/30d` و`video_call_24h/7d/30d`، لكن `store-catalog.ts` لا يدرج هذه العناصر ضمن `FULFILLMENT_READY_ITEM_CATEGORIES`. لذلك `isStoreItemPurchasable` يرفض شراءها حالياً حتى لو ظهرت سجلاتها في كتالوج افتراضي؛ وهذا حاجز fail-closed يجب عدم تجاوزه قبل اكتمال تنفيذ المكالمات.
- دالة `calculateGroupCallCoinShares` موجودة كدالة حسابية نقية، لكن لم يظهر استدعاؤها من `index.ts` أو ربطها بخصومات المحفظة وقيود Ledger.
- في شجرة المستودع توجد وحدات رفع الوسائط والحصص والأمن والفحص، ولا توجد وحدة/واجهة مستقلة واضحة باسم Media Saver أو Callable لحفظ ملف محلي مع إعادة تحقق خادمي من الاستحقاق عند كل عملية. لا تخلط بين رفع الوسائط إلى الخادم وبين حفظ نسخة محلية على جهاز العضو.
- توجيه المالك للاختبارات: لا تُشغّل CI أو GitHub Actions أو Emulator سحابياً؛ تُجرى الاختبارات المطلوبة محلياً في بيئة معزولة بعد إكمال مسارات المرحلة الاقتصادية. لم تُشغّل اختبارات في هذه المراجعة.
- لا تغيير في أسعار أو كتالوج منشور أو صلاحيات إنتاج أو إعدادات Firebase. تبقى جميع مسارات فوترة المكالمات معطلة/غير مقبولة حتى إغلاق CALL-P0-A/B/C/D.

## Re-audit evidence — 2026-11-18 13:23 (+03:00)

Reviewed the current branch source directly at `functions/src/index.ts` (call lifecycle region, approximately lines 9630–10380), plus `call-signaling.ts`, `room-call-policy.ts`, `group-call-economy.ts`, and the call-signaling integration test.

Confirmed implementation gaps (not fixed in this audit):

1. **Room invitee selection is absent.** `startCall` reads room members itself and treats all current members as recipients. The request contract only carries callId/scope/targetId/mode; it does not carry an explicit caller-selected invitee set.
2. **Consent is not the admission boundary.** `startCall` creates active-member locks for every selected-by-server participant before they accept. `respondToCall` records acceptance/rejection later. This reserves non-consenting invitees and can block their unrelated calls.
3. **Audio participant count is hard-coded.** Room membership is constrained to 2–5 for both modes, even though the approved product rule is audio participation according to room capacity and explicit sender-approved invitees. Video's four-person maximum is a separate approved rule.
4. **Connection measurement is coarse.** `markCallConnected` records client-reported connected UIDs and starts one call-wide five-minute ceiling when caller plus any accepted recipient report connected. It does not establish per-participant billable intervals and is not proof of media delivery.
5. **No group-call charge settlement is present in this call lifecycle region.** The existing `calculateGroupCallCoinShares` helper only calculates integer shares; it does not create atomic wallet debits, idempotent per-call/per-interval ledger entries, or reconcile participant connection intervals.
6. **The current room-call integration test reflects the automatic-membership behavior** by expecting all three room members in the call. It must be replaced/extended to test explicit invitees, pending requests, sender approval, participant-specific admission/locks, disconnect/reconnect intervals, and replay-safe settlement.

Safety boundary: do not enable call charging or mark this path economically complete until invitation/approval, entitlement checks, explicit financial consent, trusted per-participant measurement, atomic settlement, and emulator tests are implemented together.

Validation status: source review only. No local tests were run in this audit. The connected execution container does not contain a checked-out Mawdda repository; an attempted shallow clone could not resolve github.com. No CI/workflow was triggered, per the owner's local-only testing instruction.

## Owner clarification — group audio capacity (2026-11-18)

The owner explicitly confirmed that the existing group-audio participant cap must remain unchanged:
- Group audio supports **2–5 people total, including the call initiator**.
- Do not raise the audio cap above five.
- Do not alter the existing 2–5 validation as part of the call-economy remediation.
- This clarification concerns group audio only; the separately approved group-video maximum remains four people total, including the initiator.
- Continue implementing the remaining call-economy lifecycle (individual join requests, initiator approval, entitlement and explicit financial consent, trusted participant-level connection measurement, and idempotent atomic settlement) without changing this audio capacity rule.

## Economic integration verification — 2026-11-18

A second source-level pass checked whether the existing helper/catalog are actually connected to the callable lifecycle.

- `functions/src/group-call-economy.ts` exports `calculateGroupCallCoinShares`, but the current `functions/src/index.ts` has **zero references** to that helper. It is a calculation helper only; it does not debit wallets or write ledger entries.
- The current `functions/src/index.ts` has no call-specific entitlement, billing, or settlement identifiers/references. The general wallet ledger exists for other flows, but no call-session billing flow was found in the inspected source.
- The default catalog contains `voice_call_*` and `video_call_*` entries, but catalog presence alone does not enforce entitlement checks inside `startCall`/admission or create call billing.
- `functions/test/group-call-economy.test.js` currently labels 7-person and 9-person splits as audio tests. Those test fixtures exceed the owner's explicitly approved audio maximum of five total participants. They are math-helper tests, not proof that runtime call admission allows those sizes. Future call-economy tests must use 2–5 total participants for group audio and 2–4 total participants for group video.
- The current room admission code enforces 2–5 members for room calls and additionally rejects video groups above four. Preserve the 5-person audio cap and the 4-person video cap; do not broaden them.

Execution and validation:
- Local runtime inspection: Node.js v22.16.0 and npm are present; this execution container has no Mawdda checkout, no `.git` working tree for Mawdda, and no Flutter, Dart, or Firebase CLI.
- Therefore neither the Functions build nor Node unit tests nor Firestore Emulator integration tests could be executed locally in this session. No remote CI/workflow was started, in accordance with the owner's instruction.
- No production Firebase resource, billing setting, deployment, or merge was touched.

Status: call economy is **not complete**. Do not enable call charges until the missing server-side entitlement/admission, trustworthy per-participant metering, atomic/idempotent wallet settlement, and local emulator coverage are implemented and pass.


## Partial code remediation — 2026-11-18

Status: **partial; not a completed call-economy phase**.

Implemented on `codex/economic-phase1-closeout-2026-11-18`:

- Added `isCallMemberBusyInSession` to `functions/src/call-signaling.ts`.
- Wired the helper into the `startCall` transaction in `functions/src/index.ts`.
- A caller remains reserved while their call is ringing/accepted.
- A room invitee is not treated as busy until they explicitly accept; accepted members remain reserved, while rejected/departed members do not retain a reservation.
- Added pure unit coverage in `functions/test/call-signaling-policy.test.js`.
- Added explicit five-person audio and four-person video allocation cases in `functions/test/group-call-economy.test.js`; the seven/nine-entry tests are now labelled generic arithmetic coverage, not supported audio-call capacities.

Commits:
- `7bf65b812c2f456ab4a4187f6257cb20ac42324f` — call reservation policy helper.
- `53d6a038a60158ba57ef8f4d3f968d37ef921aeb` — lifecycle wiring.
- `6d54df1b251033aecbc7ee8c25e162ce6676b87f` — unit tests.
- `6ef8fc34262d3ea8c947cf6839b0070995ecc5d2` — group-call math test corrections.

Verification: GitHub read-back confirmed the helper, wiring, and test files are present. **No local test command was executed**: this session has no checked-out repository and no installed project dependencies/TypeScript compiler/Firestore emulator. No CI/workflow was run, per owner instruction.

Still open and blocking completion:
- Explicit per-invitee selection and request/approval lifecycle for room calls.
- Server-side entitlement validation and explicit financial consent for direct and group calls.
- Trusted per-participant connected-time measurement; client connectivity reports are not billing proof.
- Atomic, idempotent call settlement and wallet-ledger integration.
- Front-end integration for invitations, consent, participant state, and call UI.
- Local unit/build/emulator verification after a runnable checkout is available; Firebase integration remains deferred until the owner-requested later stage.

No production resources, billing, deployment, or main branch were changed.
