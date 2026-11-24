# سجل التنفيذ الأولي — مطابقة الفروع مع Full Platform
- التاريخ: 2026-11-24
- المستودع: `productionhome2022-hash/mawda-platform`
- الهدف: `codex/mawda-full-platform-implementation`
- مرجع السياسة: [MAWDDA_FULL_PLATFORM_BRANCH_CONSOLIDATION_POLICY_20261124.md](MAWDDA_FULL_PLATFORM_BRANCH_CONSOLIDATION_POLICY_20261124.md)
- هذا سجل جرد ومقارنة أولي، وليس إقراراً باكتمال المطابقة أو النقل.

## 1. نطاق الجرد

أعاد بحث GitHub للفروع 37 اسماً: فرع Full Platform المستهدف، و35 فرع تطوير/عمل آخر، و`main`. المستودع الافتراضي هو `main`، بينما فرع التطوير الذي حدده المالك هو جسم الاستيعاب. تمت مقارنة كل فرع آخر مقابل فرع Full Platform باستخدام GitHub Compare.

## 2. نتائج المقارنة الهيكلية

الأرقام التالية هي `ahead_by / behind_by / عدد الملفات` كما أعادها Compare. تعني ahead_by التزامات موجودة في الفرع المقارن وليست في سلسلة سلف Full Platform عند نقطة المقارنة؛ ولا تعني وحدها أن كل تغيير فريد أو صالح للنقل.

| الفرع | Ahead | Behind | الملفات |
|---|---:|---:|---:|
| codex/biometric-server-lifecycle-2026-11-20 | 73 | 561 | 23 |
| codex/canonical-role-terminology-owner-confirmation-2026-11-19 | 5 | 819 | 4 |
| codex/economic-phase1-closeout-2026-11-18 | 124 | 911 | 34 |
| codex/economic-phase-completion-2026-11-18 | 181 | 911 | 45 |
| codex/economic-phase-controlled-integration-2026-11-19 | 21 | 819 | 8 |
| codex/economy-official-port-2026-11-18 | 20 | 911 | 9 |
| codex/economy-recovery-2026-11-18 | 618 | 911 | 105 |
| codex/featured-ads-secure-lifecycle-20261118 | 199 | 912 | 58 |
| codex/featured-ads-serving-foundation | 139 | 911 | 31 |
| codex/governance-biometric-integration-2026-11-19 | 89 | 908 | 39 |
| codex/mawda-recovery-integration-2026-11-21 | 288 | 11 | 300* |
| codex/mawda-unified-constitution-vision-2026-11-19 | 142 | 819 | 64 |
| codex/mawdda-biometric-proof-gate-2026-11-20 | 12 | 603 | 9 |
| codex/mawdda-deep-governance-audit-2026-11-19 | 10 | 819 | 1 |
| codex/mawdda-economy-selective-port-2026-11-19 | 10 | 735 | 9 |
| codex/mawdda-group-call-capacity-2026-11-20-r2 | 5 | 601 | 4 |
| codex/mawdda-group-call-capacity-2026-11-20 | 6 | 603 | 4 |
| codex/mawdda-independent-verification-cycles-2026-11-20 | 12 | 601 | 9 |
| codex/mawdda-independent-verification-cycles-dev-2026-11-20 | 11 | 679 | 9 |
| codex/mawdda-retention-approval-ci-repair-2026-11-19 | 17 | 819 | 10 |
| codex/mawdda-role-capacity-after-retention-2026-11-19 | 22 | 819 | 12 |
| codex/mawdda-role-capacity-consolidation-2026-11-19 | 6 | 819 | 6 |
| codex/mawdda-role-capacity-final-2026-11-19 | 40 | 819 | 16 |
| codex/mawdda-step1-role-reconcile-2026-11-19 | 32 | 819 | 18 |
| codex/mawdda-super-owner-biometric-state-machine-2026-11-20 | 6 | 600 | 4 |
| codex/mawdda-unified-test-2026-11-18 | 311 | 911 | 77 |
| codex/phase1-ci-coverage-role-store-2026-11-20 | 1 | 644 | 1 |
| codex/phase1-direct-call-transaction-revalidation-2026-11-20 | 5 | 628 | 3 |
| codex/phase1-featured-ad-geography-all-arab-2026-11-20 | 2 | 621 | 2 |
| codex/phase1-media-direct-delivery-denials-2026-11-20 | 3 | 610 | 2 |
| codex/phase1-media-hold-delete-race-2026-11-20 | 7 | 622 | 3 |
| codex/phase1-rented-room-call-gate-2026-11-20 | 6 | 644 | 4 |
| codex/phase1-scanner-error-callback-test-2026-11-20 | 12 | 644 | 2 |
| codex/phase1-store-gift-concurrency-2026-11-20 | 2 | 644 | 2 |
| codex/structural-governance-biometric-roles-2026-11-19 | 79 | 911 | 35 |
| main | 4 | 3503 | 2 |

* أرجع Compare لهذه المقارنة 300 ملف بالضبط؛ لذلك تعامل القائمة على أنها قد تكون مقيدة بحد الاستجابة، ولا تعتبر قائمة ملفات الفرع كاملة قبل مراجعة شجرة الفرع/دفعات الملفات.

## 3. نتائج فحص الملفات الأولي — مرشحات متابعة

### أ. فرع الاسترداد
`codex/mawda-recovery-integration-2026-11-21` يتضمن مجموعة كبيرة من إضافات الوثائق والسجلات والأرشيف، إضافة إلى تعديلات على:
- `.github/workflows/economic-phase-verification.yml`
- `.github/workflows/economy-regression.yml`
- `.github/workflows/mawdda-test-center.yml`
- `.github/workflows/validate.yml`
- سياسة عرض الإعلان والاقتصاد وملف القرارات المعتمدة.
- أرشيف واسع لوثائق الحوكمة والعقود والتنفيذ والتدقيق، وملفات أدلة/patches وتقارير سابقة.

**التصنيف الحالي:** أولوية فحص مرتفعة؛ لا نقل جماعي ولا حذف. يجب فرز الوثائق بحسب كونها مرجعية حالية أو تاريخية/مكررة أو سجلات إثبات، ومقارنة كل ملف بنظيره في Full Platform. لا يُنقل أرشيف الأدلة الضخم تلقائياً دون التأكد من سياسة الاحتفاظ والتنظيم داخل شجرة المنصة.

### ب. فرع الاقتصاد الانتقائي
`codex/mawdda-economy-selective-port-2026-11-19` يغيّر `functions/src/index.ts` و`functions/package.json` و`lib/screens/shop_screen.dart`، ويضيف:
- `functions/src/store-gifting.ts`
- `functions/test/store-gifting.test.js`
- `functions/test/integration/store-gifting.integration.test.js`
- workflow وملف توثيق تحقق.

**التصنيف الحالي:** مرشح تقني عالي الأهمية للمراجعة الدقيقة؛ لا يُفترض أنه غير موجود أو صالح للنقل قبل مقارنة التنفيذ الحالي والاختبارات على فرع الهدف.

### ج. فرع تدقيق الحوكمة
`codex/mawdda-deep-governance-audit-2026-11-19` يضيف ملف تدقيق واحداً: `docs/DEEP_GOVERNANCE_AND_IMPLEMENTATION_AUDIT_2026-11-19.md`.

**التصنيف الحالي:** وثيقة فريدة ظاهرياً؛ يلزم فحص محتواها ومقارنة ادعاءاتها بالكود والقرارات الأحدث قبل حفظها في مسار الحوكمة داخل Full Platform.

### د. فروع Phase 1 المتخصصة
تظهر فروق محددة تستحق مراجعة كود واختبارات على الأقل:
- `phase1-direct-call-transaction-revalidation`: تغييرات `index.ts` و`room-call-policy.ts` واختبار الوحدة.
- `phase1-featured-ad-geography-all-arab`: تغييرات سياسة الإعلان واختبارها.
- `phase1-media-direct-delivery-denials`: تغييرات الوسائط واختبار التكامل.
- `phase1-media-hold-delete-race`: تغييرات الوسائط/الحذف واختبار تكامل موسع.
- `phase1-rented-room-call-gate`: إضافة سياسة اتصال الغرف واختبارات وحدة وتكامل.
- `phase1-store-gift-concurrency`: تحديث اختبار تكامل هدايا المتجر.
- `phase1-ci-coverage-role-store`: تعديل workflow التحقق.
- `phase1-scanner-error-callback-test`: يحتاج فحص diff لتحديد ملفي التغيير بدقة.

**التصنيف الحالي:** مرشحات نقل جزئي محتملة؛ يجب مقارنة الملفات والاختبارات الموجودة في الهدف أولاً، ثم نقل الفروق غير المستوعبة فقط.

## 4. الاستنتاجات والقيود الحالية

- كل الفروع المقارنة أظهرت حالة `diverged`؛ لذا لا يصلح دمج أي فرع كاملاً بناءً على عدد ahead/behind وحده.
- فرع الاسترداد قريب نسبياً من الهدف من حيث behind، لكنه يعرض عدداً كبيراً من الملفات ويتطلب فرزاً دقيقاً.
- الفروع الصغيرة المتخصصة قد تحمل إصلاحات ذرية مهمة رغم صغر عدد الالتزامات.
- لم يُنفذ في هذه المرحلة دمج كود أو حذف فرع.
- لم تُشغّل اختبارات بعد. يقتصر الاختبار في هذه المهمة على GitHub الداخلي حسب السياسة؛ لا محاكاة 5,000 شخصية ولا اختبارات أجهزة فعلية أو خارجية.
- لا تُصنف أي من الفروع كمرشح حذف نهائي حتى يكتمل فحص الملفات والالتزامات الفريدة والتأكد من حفظها.

## 5. الخطوة التالية

استكمال الفحص ملفاً بملف للمرشحات التقنية والوثائقية ذات الأولوية، مع إثبات وجود/غياب كل تغيير على Full Platform. بعد ذلك تُنفذ دفعات استيعاب صغيرة قابلة للمراجعة وتُشغّل workflows الداخلية المتاحة فقط، ثم يُحدّث هذا السجل بنتائج SHA والاختبارات.

## 6. مراجعة محتوى أولية — الاقتصاد/هدايا المتجر

تمت مقارنة الملفات الأربعة المتأثرة في `codex/mawdda-economy-selective-port-2026-11-19` مباشرة مع نظائرها في Full Platform:

| الملف | نتيجة المطابقة |
|---|---|
| `functions/src/store-gifting.ts` | SHA متطابق في الفرعين: `4afa20df18ea190a31fb416eb042f93960ff49b5` — مستوعب بالفعل |
| `functions/test/store-gifting.test.js` | SHA متطابق في الفرعين: `758c1ccdbae6b7e758313b6e3bcad8d77b6783f9` — مستوعب بالفعل |
| `functions/test/integration/store-gifting.integration.test.js` | مختلف: الهدف 266 سطراً مقابل 106 في الفرع؛ نسخة الهدف أوسع وتستخدم `vip_monthly` وتضيف سيناريوهات مستفيد ثانٍ/مستخدم ثانٍ. لا تستبدل نسخة الهدف بالأقصر؛ يلزم فحص بقية الفروق وسلوك الاختبار قبل أي قرار |
| `functions/src/index.ts` | مختلف على نطاق واسع: الهدف 11,955 سطراً مقابل 10,887؛ يبدأ الهدف بتصدير دورة biometric lifecycle، ويحتوي مساراً أحدث وأوسع. لا يُنقل الملف كاملاً من الفرع |
| `functions/package.json` | مختلف: الهدف 60 سطراً مقابل 57، ويحتوي أوامر اختبار إضافية؛ لا يُستبدل |
| `lib/screens/shop_screen.dart` | مختلف بفارق صغير؛ الهدف يتضمن فرع تسمية `media_saver` الإضافي. لا يُستبدل |

**قرار هذه المراجعة:** ميزة هدايا المتجر الأساسية واختبار الوحدة موجودان بالفعل في Full Platform. لا حاجة لنقل هذين الملفين. لا يثبت اختلاف اختبار التكامل أن فرع المصدر أفضل؛ النسخة الموجودة في الهدف أطول وتحتاج مراجعة حالات الاختبار تفصيلياً. لم يتم إجراء أي كتابة كود أو دمج من هذا الفرع.

## 7. حالة التنفيذ بعد هذه الدفعة

- تم توثيق السياسة في commit: `e4b66a283b343b74e0d2ba48f9004f75b8c10737`.
- تم توثيق سجل المقارنة الأولي في commit: `bb74d9ea44ccd61f275c5504c247283510359af6`.
- لم تُشغّل اختبارات في هذه الدفعة؛ تغييراتها توثيقية فقط.
- لا توجد فروع مصنفة للحذف النهائي حتى الآن.
