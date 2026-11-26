# سجل توحيد مهام GitHub داخل Full Platform — 2026-11-26

## السلطة والنطاق

هذا السجل هو مرجع التسوية للمهام الأربع عشرة الظاهرة في قائمة Issues المصورة (#87، #72، #69، #66، #52، #51، #49، #48، #44، #23، #20، #19، #5، #4).

المرجع التنفيذي الوحيد:
- المستودع: `productionhome2022-hash/mawda-platform`
- الفرع: `codex/mawda-full-platform-implementation`
- SHA المقارنة قبل إضافة هذا السجل: `c7997d2e23bc2e91ab472e6f1921ed892c3c53e4`

المقارنة المرجعية السابقة: `c46f890f909cf85544cbbca7ab5973a047bdf26d`.
نتيجة المقارنة: Full Platform متقدم بـ477 commit ومتأخر بـ0. كما أن Full Platform متقدم بـ214 commit عن SHA التدقيق الجماعي الأقدم `1a7884841a07d04ae543154f4fe72cf3b8317535). شجرة SHA الحالي تضم 3,368 مدخلاً، وفحص الشجرة لم يكن مقتصراً على أسماء الملفات؛ تمت مراجعة محتويات ملفات التنفيذ والواجهات والوثائق ذات الصلة أدناه.

هذا السجل لا يعلن اكتمال الميزات ولا نجاح الاختبارات. إغلاق Issue يعني استبدال بطاقة العمل المنفصلة بمرجع Full Platform الموحد فقط. كل فجوة أو قرار غير محسوم أدناه يبقى متطلباً قائماً داخل Full Platform.

## معيار المقارنة والتصنيف

لكل Issue تمت مراجعة وصفها الأصلي ومقارنة المتطلبات الجوهرية مع الملفات البرمجية والواجهات والاختبارات والوثائق الموجودة على SHA أعلاه. التصنيفات:
- **مستوعبة/مستبدلة:** محتوى المهمة أصبح جزءاً من هيكل Full Platform أو سجلها الموحد؛ لا يعني ذلك قبولاً نهائياً.
- **مستوعبة جزئياً:** توجد أكواد أو واجهات أحدث، لكن دورة الاستخدام أو الاختبارات أو البنية الحية ما زالت ناقصة.
- **فجوة/قرار محفوظ:** لا يوجد تنفيذ كافٍ أو يتطلب قراراً سيادياً/قبولاً مستقلاً؛ يبقى المتطلب محفوظاً ولا يُسجل كإنجاز.

## سجل المطابقة التفصيلي

| Issue | المجال | الأدلة الحالية في Full Platform | نتيجة المقارنة والفجوات المحفوظة |
|---|---|---|---|
| #87 | الإعلانات العادية والمميزة والاقتصاد | `docs/AD_VIEWING_AND_OWNER_SOVEREIGN_ECONOMY_POLICY_2026-11-22.md`؛ `functions/src/featured-advertising.ts`؛ `functions/src/featured-ad-rewards.ts`؛ `functions/src/featured-ad-finance.ts`؛ `functions/src/index.ts`؛ `lib/screens/ad_viewing_screen.dart`؛ `lib/screens/featured_ads_screen.dart`؛ `lib/screens/owner_featured_ads_dashboard_screen.dart`؛ `docs/FEATURED_ADVERTISING_SECURE_LIFECYCLE_IMPLEMENTATION.md` | **مستوعبة جزئياً مع تعارض واجب الإصلاح.** توجد حملات مميزة منفصلة، مشغل وجلسات start/heartbeat/complete، وحجوزات/مطالبات مكافأة ودفتر مركزي وواجهات مالك وعضو. سياسة 22 نوفمبر تمنع الجغرافيا في المميز، والكود الخادمي الحالي يفرض أن تكون `geographicTargets` فارغة عند نشر الحملة المميزة، ويستثني النوع المميز من مطابقة الاستهداف الجغرافي. دالة مساعدة جغرافية قديمة في ملف الاختيار لا يظهر استدعاؤها في `index.ts` الحالي؛ لذلك لا أسجلها كتعارض تنفيذي مثبت. تبقى مراجعة إزالة/تقاعد الدالة القديمة وفحص UI واختبارات exact-head ضمن التنظيف والتحقق. يجب أيضاً إثبات exact-head CI واختبارات دورة العرض/المكافأة قبل إعلان الاكتمال. |
| #72 | مراجعة Super Owner البيومترية ودورة الأدلة | `functions/src/biometric-evidence.ts`؛ `functions/src/biometric-lifecycle.ts`؛ `functions/src/biometric-review-state.ts`؛ `functions/src/biometric-media.ts`؛ `lib/screens/biometric_verification_screen.dart`؛ `lib/screens/owner_biometric_review_screen.dart`؛ `docs/BIOMETRIC_CROSS_PLATFORM_REQUIREMENTS_2026-11-21.md` | **مستوعبة جزئياً.** توجد دورة خادمية ورفع أدلة ومراجعة مالك وواجهة عضو/مالك وربط بمكافأة المحفظة. القبول عبر الويب/PWA وAndroid وiOS يتطلب اختبارات منصات وأجهزة فعلية؛ لا توجد أهداف تطبيق سطح مكتب أصلية في الشجرة الحالية. لا يُستنتج قبول متعدد المنصات من وجود الشاشات أو بناء الويب. |
| #69 | مصدر شعار MAWADDA الموحد | `docs/MAWADDA_BRAND_AND_PRODUCT_EXPERIENCE.md`؛ `web/mawdda-app-icon.svg`؛ `web/icons/mawdda-192.svg`؛ `web/icons/mawdda-512.svg`؛ أصول Android وiOS | **فجوة محفوظة.** توجد أصول شعار حالية، لكن SVG المفحوص ما زال شكلاً قلبياً عاماً، بينما مواصفة العلامة تطلب رمزاً نحتياً/متشابكاً ولا تعتمد القلب المسطح كشعار نهائي. لا يوجد في الأدلة المفحوصة إثبات مصدر رئيسي نهائي معتمد من المالك أو اشتقاق موحد واختبار بصري لكل المنصات. لا تغيّر هوية iOS أو Bundle ID. |
| #66 | تسعير المكالمات الفردية المدفوعة والموافقة والقياس والتسوية | `functions/src/call-signaling.ts`؛ `functions/src/call-usage-policy.ts`؛ `functions/src/index.ts`؛ `docs/CALLS_EXECUTION_AUDIT_AND_REMEDIATION_2026-11-18.md`؛ `docs/CALL_ENTITLEMENT_IMPLEMENTATION_RECORD.md` | **مستوعبة جزئياً فقط.** توجد إشارة المكالمة والتحقق من المشاركين والحصص والمدة. لم يظهر في سطح المصدر الحالي callable لتسوية المكالمات الفردية أو خصم ذري من المحفظة، ولا دورة مكتملة لتسعير المالك/الاستحقاق المدفوع/الموافقة المالية/قياس مدة اتصال موثوقة. لا تفعيل للفوترة. |
| #52 | استخراج الفروقات الفريدة من الفروع القديمة | `docs/BRANCH_UNIFICATION_REGISTER_2026-11-18.md`؛ `docs/ENGINEERING_WORK_HISTORY_AND_MERGE_LEDGER_2026.md`؛ فهرس وأرشيف تدقيق التوحيد داخل `docs/MAWADDA_DOCUMENTATION_GOVERNANCE_CONTRACTS_CONSTITUTION_VISION/` | **مستبدلة تنظيمياً مع استمرار شرط التتبع.** Full Platform يضم سجلات توحيد وفهارس وأرشيفات ومكونات الاقتصاد والوسائط والحوكمة. لا يجوز اعتبار وجود السجل وحده دليلاً على أن كل ملف فريد من كل فرع قد دُمج؛ يجب أن تبقى المطابقة الدلالية ومصدر كل تغيير ونتائج اختباره في سجل التكامل الموحد. |
| #51 | حوكمة الفروع والتحقق الإلزامي للـPR | `docs/ENGINEERING_WORK_HISTORY_AND_MERGE_LEDGER_2026.md`؛ `docs/BRANCH_UNIFICATION_REGISTER_2026-11-18.md`؛ `.github/workflows/validate.yml`؛ `.github/workflows/mawdda-domain-regression.yml` | **مستبدلة تنظيمياً/فجوة إعدادات.** توجد سياسة وسجلات تحقق وملفات workflows. تعذر على تكامل GitHub قراءة إعدادات Branch Protection (403 Resource not accessible)، لذلك لم يتم إثبات إعدادات الحماية الفعلية أو required checks على GitHub. لا تغيير لإعدادات الحماية دون تفويض صريح مستقل. |
| #49 | دورة تسليم الوسائط الآمنة وEmulator | `functions/src/media-security.ts`؛ `functions/src/media-scanner.ts`؛ `functions/src/media-derivative-contract.ts`؛ `functions/src/media.ts`؛ `functions/src/media-legal-hold.ts`؛ `functions/src/retention.ts`؛ اختبارات Functions/Rules وملفات scanner | **مستوعبة جزئياً.** توجد بوابة رفع موقعة، quarantine/scanner/verdict، مشتقات آمنة، تفويض تنزيل، legal holds، حذف وتغطية Emulator. تبقى اختبارات GCS الحية وCloud Run/ClamAV non-production والنسخ الاحتياطية/PITR/CDN والحذف الفعلي وإثبات الإعدادات التشغيلية بوابات منفصلة. |
| #48 | تفويض الصلاحيات المتخصصة عند callable المحمي | `functions/src/advertising-governance.ts`؛ `functions/src/advertising-permissions.ts`؛ `docs/PHASE1_SPECIALIZED_CALLABLE_AUTH_AUDIT_2026-11-20.md`؛ `functions/src/index.ts` | **فجوة محفوظة مع fail-closed.** نموذج المنح ومقيّم الصلاحيات موجودان، لكن التدقيق التوثيقي يقول إن `hasAdvertisingPermission` غير موصول بالـcallables المحمية، وفحص SHA الحالي لم يجد استدعاءً له داخل `functions/src/index.ts`. تبقى العمليات Owner-only حتى اعتماد مصفوفة الصلاحيات والنطاق وربطها واختبارها. |
| #44 | سلامة معاملات سعة الأدوار المتخصصة | `functions/src/platform-role-identities.ts`؛ `functions/test/platform-role-identities.test.js`؛ `functions/src/index.ts`؛ وثائق الحوكمة | **مستوعبة جزئياً.** توجد حراسة سعة وأسماء أدوار واختبارات وحدات للحالات الحدية. لم يتوفر في الشجرة الملف المحدد لاختبار تكامل السعة الذي توقعه الفحص، لذلك لا يُدعى أن تزامن معاملات Firestore واختبار التنافس قد اجتازا على SHA الحالي. |
| #23 | انضمام المكالمات الجماعية والاستحقاق والقياس والتسوية | `functions/src/group-call-economy.ts`؛ `functions/src/call-entitlements.ts`؛ `functions/src/index.ts`؛ `docs/GROUP_CALL_P0_ENGINEERING_AUDIT_2026-11-25.md` | **مستوعبة جزئياً، والتدقيق الأقدم يحتاج تحديثاً.** على SHA الحالي توجد callables لطلبات الانضمام وموافقة المنشئ و`consentToRoomCallBilling`؛ لذا فإن ملاحظة غيابها في تدقيق 25 نوفمبر عند SHA `1a788484...` أصبحت متجاوزة بعد 214 commit. لكن لم يظهر callable تسوية فعلي مثل `processGroupCallBillingSettlement` أو دليل على أحداث اتصال وسائط موثوقة وفترات اتصال لكل عضو وخصم/استرداد ذري idempotent. لا فوترة جماعية حتى إغلاق هذه الفجوات. |
| #20 | سياسة إلغاء استئجار الغرف والاسترداد | `functions/src/room-rental.ts`؛ `docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md`؛ وصف Issue الأصلي | **قرار مالك غير محسوم ومحفوظ.** يوجد تأجير وتجديد وانتهاء، لكن قواعد الطرف المخول بالإلغاء ونسب الاسترداد والتناسب الزمني وعكس الدفتر لم تُعتمد. لا تُنشأ سياسة أو عملية refund افتراضية. |
| #19 | Firebase App Check لبوابة الويب | `functions/src/legal-portal-access.ts`؛ `functions/src/index.ts`؛ `pubspec.yaml`؛ `lib/main.dart`؛ `web/index.html` | **مستوعبة جزئياً مع بقاء تكامل العميل.** توجد callables بفرض App Check وقائمة سماح لهوية تطبيق الويب مع استبعاد هويات Android/iOS. لكن `pubspec.yaml` لا يحتوي `firebase_app_check`، وتهيئة `lib/main.dart` تهيئ Firebase Core فقط، و`web/index.html` لا يهيئ App Check. تبقى البوابة مغلقة حتى ربط العميل بمزود معتمد ومفتاح إعداد غير مخترع وبيئة non-production مصرح بها. |
| #5 | إغلاق Phase 1/2 وبوابات قبول المنتج والبنية | `docs/MAWADDA_DOCUMENTATION_GOVERNANCE_CONTRACTS_CONSTITUTION_VISION/REPOSITORY_DOCS_ARCHIVE/PHASE1_PHASE2_CLOSURE_MATRIX.md`؛ `docs/IMPLEMENTATION_TRACEABILITY.md`؛ `docs/ENGINEERING_WORK_HISTORY_AND_MERGE_LEDGER_2026.md` | **مستبدلة بسجل إغلاق Full Platform، والبوابات باقية.** مصفوفة الإغلاق تحفظ متطلبات الاقتصاد والمكالمات والعضوية والوسائط والاختبارات والأجهزة. لا تعتبر المراحل مغلقة؛ يجب نقل كل بوابة مفتوحة إلى سجل التنفيذ الموحد وربطها بدليل exact SHA. |
| #4 | بوابات Phase 2: scanner/GCS والأرشيف والاحتفاظ | `docs/PHASE2_NONPRODUCTION_LIVE_VALIDATION.md`؛ `docs/PHASE2_VALIDATION_AND_CLOSURE_PROGRESS.md`؛ `functions/src/owner-audit-export.ts`؛ `functions/src/retention.ts` | **مستوعبة جزئياً والقبول الحي ما زال مفتوحاً.** يوجد runbook واختبارات Emulator وتصدير تدقيق وآليات احتفاظ/حجز قانوني. لا يوجد إثبات في هذه المراجعة لتشغيل GCS signed HTTP الحقيقي أو Cloud Run scanner E2E أو اختبار backup/PITR/WORM/retention-lock؛ كما أن تفعيل الحذف الحي محظور حتى استيفاء الموافقات والاختبارات. |

## بوابات لا يجوز إسقاطها عند إغلاق Issues

1. لا تعني حالة Issue المغلقة أن الميزة مكتملة أو مختبرة أو مقبولة للإطلاق.
2. تبقى الفجوات أعلاه ضمن قائمة أعمال Full Platform، ويجب أن تُسجل كتغييرات موحدة في وثائق المجال وسجل العمل الهندسي.
3. لا دمج إلى `main` أو نشر أو تعديل Firebase الإنتاجي أو تشغيل فوترة/موارد مدفوعة أو تغيير سياسات الاحتفاظ الحية.
4. لا تُغيّر هوية iOS أو تسجيل Firebase أو Bundle ID.
5. لا تُعلن نتائج اختبارات على SHA الحالي؛ استعلام combined status لـ`c7997d2...` لم يُرجع status checks. يجب تشغيل/توثيق CI على الرأس النهائي قبل أي ادعاء نجاح.
6. إغلاق Issues هنا سببه **الاستبدال بمرجع Full Platform الموحد** (`state_reason=not_planned`) وليس `completed`. سجل GitHub الأصلي وتعليقاته لا تُحذف؛ تبقى محفوظة للتاريخ والتدقيق.

## النتيجة

Full Platform هو المرجع الوحيد للمحتوى البرمجي والتقني والتوثيقي. تم حفظ المقارنة والفجوات وقرارات عدم الاكتمال في هذا السجل حتى لا يؤدي إغلاق البطاقات القديمة إلى إسقاط متطلب أو الإيحاء بقبول غير مثبت.
