# سجل توحيد الفروع — 2026-11-18

## النطاق والضوابط

- فرع التجميع الوحيد: `codex/mawdda-unified-test-2026-11-18`.
- يمنع الدمج إلى `main` قبل إغلاق المرحلة الاقتصادية والاختبارات المحلية والقبول الصريح.
- مستودع `productionhome2022-hash/mawdda-5000-simulation-lab` خارج النطاق تماماً؛ لا دمج ولا تعديل.
- لا تُشغّل GitHub Actions أو CI البعيد ضمن هذه المرحلة.
- لا تُدمج ملفات المحاور المشتركة (خصوصاً `functions/src/index.ts`, `functions/src/media.ts`, `functions/package.json`, `firestore.indexes.json`, وشاشات الاقتصاد/الملف الشخصي) آلياً دون مراجعة دلالية واختبارات محلية.
- لا يُقبل أي دمج متعارض لمجرد أن GitHub يسمح بتغيير حالة PR؛ يجب أولاً حل التعارضات وفحص السلوك.

## لقطة مرجعية موثقة

- رأس فرع التجميع الحالي بعد دفعة النقل الانتقائي: `5e04013f5d250ccf914699a4611c31690887c98c`.
- كان رأس الفرع قبل إضافة هذا السجل أول مرة: `fb9cfce8c4d0743d06b8a0001e370007896b79a8`.
- رأس `main` عند الفحص: `460a79a7dc2e16f4ad146af22aab58e152ad1e8c`.
- المقارنة أظهرت أن فرع التجميع متقدم عن `main` دون commits خلفه في لحظة الفحص.
- طلب الدمج #2 إلى `main` بقي مفتوحاً كمسودة وغير مدمج.
- هذه اللقطة لا تعني أن البناء أو الاختبارات أو قبول الإصدار قد نجحت.

## قرارات دمج طلبات المراجعة

| PR | المسار | الحالة وقت الفحص | القرار التنفيذي |
|---|---|---|---|
| #22 | الإغلاق الاقتصادي والمكالمات والإهداء | Draft، غير قابل للدمج تلقائياً | إبقاؤه للمراجعة؛ يتضمن تغييرات متداخلة في ملفات المحفظة والملف الشخصي و`index.ts`. لا تعتمد ملاحظات المكالمات التي تخالف قرار المالك النهائي بسقف الصوت الجماعي 5 أشخاص إجمالاً. |
| #24 | الإعلانات المميزة والوسائط والسعة والملصقات | Draft، غير قابل للدمج تلقائياً | تقسيمه إلى وحدات مستقلة؛ توجد تغييرات كبيرة ومتداخلة في `index.ts`, `media.ts`, `firestore.indexes.json`, الواجهات، والاختبارات. لا تُدمج دفعة واحدة. |
| #25 | تقوية أمن الوسائط | Draft، غير قابل للدمج تلقائياً | مراجعة خدمة الفحص والماسح والتبعيات والعقود؛ توجد تداخلات في `media.ts`, `media-quota.ts`, `media-scanner.ts`, الفهارس والحزم. لا تفعيل لخدمات أو موارد مدفوعة. |
| #26 | حسابات الاختبار ومصفوفة التغطية | Draft، غير قابل للدمج تلقائياً | فُحصت الملفات؛ مواصفة حسابات الاختبار أضيفت بصورة مستقلة إلى فرع التجميع. ملفات الكتالوج والاختبار موجودة أصلاً في فرع التجميع بنسخ مختلفة، لذلك لم تُستبدل. لم تُدمج سكربتات التهيئة أو تغييرات الحزم أو Workflow. |
| #27 | الملف الشخصي وتجديد التحقق بالبريد | Draft، غير قابل للدمج تلقائياً | مراجعة منفصلة مطلوبة بسبب التداخل في `index.ts`, `profile_screen.dart`, `functions/package.json`، ولأن مسار المكافأة يحتاج مطابقة مع السياسة الاقتصادية المعتمدة واختبارات محلية. |

## ما أُنجز في هذه اللقطة

1. إعادة فحص الفروع المفتوحة وطلبات الدمج الخمسة وحالة فرع التجميع.
2. مقارنة كل فرع مصدر بفرع التجميع الحالي وتحديد الملفات المتداخلة.
3. إضافة `docs/testing/MAWDDA_TEST_ACCOUNT_SYSTEM.md` إلى فرع التجميع فقط؛ لم تُنسخ ملفات تنفيذية أو إعدادات CI معها.
4. الحفاظ على الفروع المصدرية وطلبات الدمج كمرجع دون حذف أو فرض دمج.
5. التأكد من أن `main` لم يتغير خلال هذه الإجراءات.

## المتبقي ومعايير الإغلاق

- إعداد قائمة ملفات/رموز مستقلة لكل PR، مع التحقق من عدم تعارضها مع الحالة الحالية.
- دمج الوحدات الصغيرة فقط بعد قراءة المصدر والاعتماديات والاختبارات المرتبطة.
- حل التعارضات الدلالية في الخدمات المحورية داخل بيئة محلية قابلة للبناء والاختبار؛ واجهة GitHub وحدها لا تكفي لهذا العمل.
- إجراء الاختبارات المحلية المطلوبة وتسجيل الأوامر والنتائج الفعلية وSHA.
- عدم اعتبار أي PR مدموجاً أو أي ميزة مكتملة قبل تحقق معيار قبولها.
- بعد اكتمال المرحلة الاقتصادية والاختبارات والقبول: طلب موافقة مستقلة على الدمج إلى `main`، ثم موافقة مستقلة على نشر Firebase.

## دفعة النقل الانتقائي الإضافية

تمت إضافة مواد مستقلة بعد فحص مساراتها في فروع المصدر:

- `docs/testing/MAWDDA_TEST_CENTER_RUNBOOK.md`: دليل تشغيل مركز الاختبار. تمت مطابقة أوامر الاختبار المذكورة مع scripts الموجودة فعلياً في `functions/package.json` الحالي.
- `functions/src/sticker-policy.ts` و`functions/src/sticker-catalog.ts` مع `functions/test/sticker-policy.test.js`: قواعد مستقلة للتحقق من ملصقات الصور الثابتة والمتحركة، manifest، وإسقاط الكتالوج المنشور النظيف. تم تحويل الاختبار إلى CommonJS ليستهدف ملفات البناء `lib` ويتوافق مع Node 20 بدلاً من استيراد TypeScript مباشرة.
- `functions/src/room-call-policy.ts` مع اختباره: تحقق مستقل من أن الغرفة خاصة ومستأجرة ونشطة وأن سجل الإيجار مطابق وغير منتهٍ.
- `functions/src/store-gifting.ts` مع اختباره: قواعد نقية لفحص توافق إعادة الطلب، أهلية المستلم، وحساب انتهاء الاستحقاق.
- `functions/src/group-call-economy.ts` مع اختباره: تقسيم BetaCoins بأعداد صحيحة، مع فرض حد أعلى خمسة مشاركين في هذه الوحدة. أزيلت حالات 7 و9 من اختبار المصدر لأنها تتعارض مع قرار المالك النهائي بشأن الصوت الجماعي.

**حدود هذه الإضافات:** هذه وحدات سياسة/حساب واختبارات وحدة فقط؛ لم تُربط بعد بمسارات callable أو واجهات المستخدم. لا تعتبر دورة الملصقات أو الإهداء أو المكالمات مكتملة بمجرد وجود هذه الملفات. تم حذف `call-entitlements.ts` المنقول مؤقتاً بعد اكتشاف أن فرع التجميع يملك بالفعل تحقق استحقاق داخل `index.ts`؛ لتجنب تكرار منطق الاستحقاق.

لم تُستبدل أي نسخة قائمة من `functions/package.json` أو `index.ts` أو `media.ts` أو الفهارس أو شاشات Flutter. لم يتم نقل Workflow أو تشغيل CI.

- commits النقل الانتقائي: `9f833e9ee76483d94db6cd921016e544f229e279` (runbook)، `28182105618fa55fc23b3ef3304cee9b25f54088` و`8ba9e47864ab209348984b017152a346e18c7c1e` و`af4d92ea08e52d07b883e46c1f7dbde094a8b62b` (سياسة الملصقات والكتالوج واختبارهما)، `f010ad25698d6cc504b9eecf2ed7a049d05f0848` و`8cde29586b8625657e2d2433e1864a47b81e8a0f` (سياسة الغرف واختبارها)، `513ca3b042f9be33e2b553177fab50a4c6246f98` و`388f4c83dc911e6c25231ecc1d5ff532a1a50d43` (سياسة الإهداء واختبارها)، `44fcfb216145b02f725e9df5959c2cf655008355` و`cf0e239febb207d8678725a5c0331bd7ed2b2d7f` (توزيع المكالمات وحد المشاركين واختباره).

## حدود التحقق

لا تتوفر في جلسة التنفيذ الحالية نسخة مستودع محلية مع Flutter/Dart/Firebase CLI أو اتصال Termux الخاص بالمالك. لذلك لم يُشغّل بناء أو اختبار محلي في هذه اللقطة، ولم يُشغّل CI بعيد، ولم يُنفذ نشر أو اتصال بموارد Firebase الإنتاجية.


## تدقيق شامل إضافي للملفات المتداخلة — 2026-11-18

### لقطة طلبات الدمج بعد إعادة الفحص

| PR | عدد الملفات | commits | الإضافات/الحذف | الحالة |
|---|---:|---:|---:|---|
| #22 الاقتصادي | 34 | 124 | +2159 / -152 | Draft، تعارض |
| #24 الإعلانات/الوسائط/الملصقات | 58 | 199 | +6143 / -341 | Draft، تعارض |
| #25 أمن الوسائط | 23 | 78 | +1318 / -156 | Draft، تعارض |
| #26 حسابات الاختبار | 11 | 37 | +1479 / -2 | Draft، تعارض |
| #27 الملف الشخصي/تجديد البريد | 5 | 17 | +487 / -46 | Draft، تعارض |

لم يُدمج أي من هذه الطلبات. PR #2 إلى main ما زال Draft وغير مدمج. لا تغيير في main، ولا CI بعيد، ولا نشر.

### خريطة مناطق التعارض الدلالي

1. **وظائف الخادم:** `functions/src/index.ts` يتغير في #22 و#24 و#27، مع اختلافات كبيرة في مسارات المكالمات والمكافآت والإعلانات والتحقق بالبريد. يمنع استبدال الملف بنسخة فرع واحد أو دمج المقاطع آلياً.
2. **خدمة الوسائط:** `functions/src/media.ts` مشتركة بين #24 و#25. يجب تركيب التغييرات على أساس تدفق واحد: رفع آمن، فحص، مشتقات، حصص، signed URLs، تنظيف، ثم اختبارات callables. لا يجوز إسقاط أي حارس أمني من أي فرع.
3. **سياسة الحزم:** نسخة فرع الاختبار الحالية تستخدم Node 22. نسخة حسابات الاختبار المصدرية تستخدم Node 20، ولذلك لا تُستبدل الحزمة بها. كما أن سكربتات الاختبار فيها اختلافات متراكمة. يلزم دمج تغييرات scripts المطلوبة فقط مع الحفاظ على Node 22 ومجموعة الاختبارات الحالية.
4. **فهارس Firestore:** تمت مقارنة JSON فعلياً. فرع التجميع كان يحوي 33 فهرساً، ووجدت 4 فهارس إضافية للإعلانات المميزة و2 للوسائط. أضيفت الستة إلى الفرع الموحد دون حذف أو استبدال أي فهرس قائم، ليصبح المجموع 39. commit: `effe4ac858b6b5557b3b05e32b82d586d5e0da34`. هذا تعديل ملف مصدر فقط، ولم يتم نشر الفهارس إلى Firebase.
5. **الملف الشخصي:** `lib/screens/profile_screen.dart` في #22 و#27 يحتوي تغييرات مختلفة ومتداخلة. لا يعتمد أي استبدال كامل؛ يلزم دمج وظائف الإهداء/الخصوصية والملف الشخصي وتجديد البريد مع إبقاء جميع عناصر الواجهة الحالية.
6. **واجهة الإعلانات المميزة:** `lib/screens/featured_ads_screen.dart` فيها اختلافات كبيرة بين فرع التجميع وفرع دورة الإعلانات. يجب دمج الواجهة بحسب الوظائف لا بحسب نسخ الملف، مع مطابقة المشغل والجلسات والمكافآت ودورة الحملة.
7. **الماسح المستقل:** #25 يضيف خدمة ClamAV منفصلة وملفات Docker/entrypoint/config واختبارات. لا يتم تشغيلها أو نشرها تلقائياً. يلزم فحص التوثيق، المصادقة بين الخدمة والخادم، حد الحجم، freshness للتواقيع، مهلات الاتصال، سلوك الفشل، وعدم تسريب محتوى الملفات قبل نقلها.
8. **حسابات الاختبار:** سكربت seeding المصدر يشترط Emulator hosts وproject ID يبدأ ببادئة تجريبية وopt-in صريح، لكنه يكتب أرصدة اختبارية وملفات مستخدمين في emulator. يجب إبقاؤه محصوراً بالـ demo project، ومراجعة fixtures والـ tests قبل نقله. لم يتم نقله أو تشغيله.
9. **تدفق البريد:** #27 يضيف اختبار تجديد التحقق بالبريد ويعدل الملف الشخصي والخادم والحزمة. يلزم التحقق من انتهاء صلاحية الرموز، إعادة الاستخدام، تحديد المعدل، وعدم منح مكافأة مرتين قبل نقل التغيير.

### نتائج المقارنة الفعلية للملفات الأساسية

- `functions/src/index.ts`: نسخ الفروع الاقتصادي والمميز تختلف فعلياً عن فرع التجميع؛ ليست اختلافات تنسيق.
- `functions/src/media.ts`: نسخة فرع المميز أكبر كثيراً من نسخة التجميع، وفرع hardening يحتوي مساراً مستقلاً أقدم؛ لا يمكن اختيار نسخة واحدة بأمان.
- `functions/package.json`: نسخة الاقتصادي مطابقة لنسخة التجميع، لكن featured يغير أمر اختبار الوسائط، وtest-account يغير Node إلى 20 ويعيد تشكيل scripts؛ احتُفظ بإعداد Node 22.
- `firestore.indexes.json`: تم إجراء اتحاد إضافي غير هدّام لستة فهارس فريدة، دون حذف الفهارس الـ33 الأصلية.
- `profile_screen.dart` و`featured_ads_screen.dart`: نسخ المصدر تختلف في الوظائف والكتل، وتتطلب دمجاً دلالياً وليس نسخاً شاملاً.

### القرار التنفيذي بعد هذا التدقيق

- تم تنفيذ دمج آمن واحد قابل للتحقق: إضافة ستة فهارس Firestore المفقودة إلى ملف الفرع الموحد.
- لا تزال بقية التغييرات المتداخلة محفوظة في فروع المصدر وطلبات PR المفتوحة؛ لم يُحذف أي فرع أو commit.
- لم تُدمج تغييرات `index.ts` أو `media.ts` أو شاشات Flutter أو إعدادات الحزم دفعة واحدة، لأن ذلك قد يسقط وظائف متزامنة أو يسبب أخطاء تجميع/تشغيل.
- الوحدات المنقولة سابقاً (سياسات الملصقات والغرف والإهداء وتوزيع المكالمات) لا تزال وحدات مستقلة غير مربوطة بالواجهات أو callable؛ لا تُحسب ميزات مكتملة.
- سقف الصوت الجماعي المعتمد يظل خمسة أشخاص إجمالاً، والفيديو أربعة؛ أي كود مصدر مخالف يُرفض أو يُصحح قبل الدمج.
- الخطوة الحاسمة المتبقية لحل التعارضات البرمجية هي بيئة عمل محلية حقيقية للمستودع تسمح بتشغيل merge/diff واختبارات Node/TypeScript/Flutter/Emulator. واجهة GitHub contents API لا توفر بيئة بناء ولا تضمن تكامل الملفات الكبيرة.

### حالة التحقق

تمت قراءة ومقارنة ملفات محورية فعلية وبيانات الفهارس والحزمة وسكربت seeding وخدمة الماسح. لم يتم تشغيل `tsc` أو `npm test` أو Flutter أو Emulator في هذه الجلسة؛ لذلك لا يوجد ادعاء باجتياز بناء أو اختبار. لم تُشغّل GitHub Actions أو CI بعيد، ولم يتم الاتصال بمشروع Firebase الإنتاجي أو تعديل موارده.


## مراجعة الفروع الإضافية خارج طلبات PR الخمسة

أعيدت مقارنة الفروع ذات commits فريدة مقابل فرع التجميع. لا يجوز تجاهل هذه الفروع لمجرد عدم وجود PR مفتوح لها؛ وفي المقابل لا يجوز ضمها عشوائياً بسبب تاريخها المتشعب.

| الفرع | commits فريدة تقريباً | الملفات المتغيرة | قرار المراجعة |
|---|---:|---:|---|
| `codex/mawdda-member-inbox` | 5 | 5 | مراجعة متداخلة: `index.ts` و`firestore.indexes.json` مع شاشات المحادثات؛ لا دمج شامل. |
| `codex/mawdda-member-inbox-rebased` | 7 | 7 | يضيف أيضاً `media.ts` واختبار media callables؛ يجب دمجه مع مسارات الخصوصية والحذف الحالية لا استبدالها. |
| `codex/mawdda-premium-effects` | 5 | 4 | عنصر واجهة مستقل قابل للنقل لاحقاً، لكن AuthService وprofile screen متداخلان؛ لا نقل قبل فحص التكامل والاستحقاق. |
| `codex/mawdda-room-audio-duration-enforcement` | 5 | 12 | **مرفوض بصورته الحالية**: الواجهة تسمح حتى 120 ثانية، والمعالج يضع الصوت العام 120 ثانية و25 MiB وGIF 100 إطار/30 ثانية/5 MiB؛ هذا يخالف الحدود المعتمدة للصوت 60 ثانية/5 MiB وGIF 20 ثانية/50 إطار/3 MiB. لا يُنقل قبل تصحيح كل الحدود والاختبارات. |
| `codex/mawdda-room-events` | 5 | 4 | وحدة أرشفة سجل التدقيق واختباراتها مستقلة نسبياً، لكن تتطلب مراجعة سياسة الاحتفاظ ومخزن GCS والجدولة قبل إدخالها. |
| `codex/mawdda-store-entitlement-coverage` | 2 | 2 | اختبارات تكامل المتجر وشاشة المتجر؛ تتطلب مطابقة مع الكتالوج المركزي الحالي قبل الدمج. |
| `codex/mawdda-store-entitlement-hardening` | 2 | 2 | اختبارات تكامل فقط؛ يلزم فحص fixtures وتوقعات الاستحقاقات مقابل السياسة الحالية. |
| `codex/mawdda-store-entitlement-hardening-v2` | 1 | 1 | نسخة متفرعة من اختبار المحفظة؛ لا تدمج فوق النسخ الأخرى قبل اختيار اختبار مرجعي واحد ودمج تغطيتها. |
| `codex/mawdda-store-wallet-entitlement-closure` | 4 | 3 | تغييرات اختبار وشاشات المتجر والملف الشخصي؛ تداخل مع #22 و#27. |
| `codex/mawdda-phase1-phase2-hardening` | 1 | 1 | مصفوفة إغلاق مفيدة كوثيقة مراجعة، لكنها تسجل إخفاقات تكامل سابقة؛ لا تُعامل كدليل نجاح. |
| `codex/mawdda-unified-release` | 4 | 4 | وحدة تحقق بيومتري ومكافأة 1,500 BetaCoins كل 30 يوماً؛ **لا تعتمد** لأن مبلغ/دورية المكافأة غير معتمدين في قرارات المالك، ولأن دورة التحقق المحلي ليست إثبات هوية حيوي خادمي. |
| `codex/mawdda-audit-archive` | 14 | 6 | كود أرشفة + Terraform لمخزن GCS يتطلب قفل احتفاظ غير قابل للعكس؛ لا تفعيل أو تطبيق أو دمج بنية تحتية قبل موافقة مستقلة وسياسة احتفاظ معتمدة. |
| `codex/mawdda-final-archive-v2` | 3 | لا تغييرات ملفات ظاهرة في compare | يبقى مرجعاً تاريخياً ولا يطبق منه شيء حتى تحديد محتوى commits الفريد. |
| `codex/production-readiness-tests` | 0 | 0 | خلف فرع التجميع ولا يحمل تغييرات فريدة حالياً. |

### قرارات رفض/حماية مؤكدة من فحص المصدر

- لا نأخذ حد الصوت 120 ثانية أو 25 MiB من فرع room-audio؛ الحد المعتمد 60 ثانية و5 MiB.
- لا نأخذ GIF 100 إطار أو 30 ثانية أو 5 MiB؛ الحد المعتمد 50 إطاراً و20 ثانية و3 MiB.
- لا نأخذ مكافأة التحقق البيومتري 1,500 BetaCoins أو دورة 30 يوماً كسياسة إطلاق؛ لم يصدر اعتماد مالك لها.
- لا ننفذ Terraform لأرشيف التدقيق ولا نقفل retention policy؛ القفل إجراء غير قابل للعكس ويتطلب موافقة مستقلة.
- لا نشغل Workflows التي ظهرت في فروع حسابات الاختبار أو غيرها، التزاماً بطلب الاختبارات المحلية فقط.
- فرع مختبر 5000 شخصية خارج كل المقارنات والدمج والتعديل، كما تقرر سابقاً.

### حالة ما بعد الدمج الآمن للفهارس

- فرع التجميع يتضمن الآن ستة فهارس إضافية فريدة، مع الاحتفاظ بجميع فهارسه السابقة.
- وحدات الملصقات وسياسة الغرف والإهداء وتوزيع المكالمات موجودة، لكن بعض الاختبارات/الوحدات تختلف عن المصدر عمداً بسبب تحويل الاستيراد إلى CommonJS وفرض سقف الصوت الجماعي خمسة أشخاص.
- لم يتم نقل ملفات تشغيل ClamAV أو Terraform أو سكربت seeding أو أي تغييرات core إضافية في هذه الجولة.


## خطوة دمج آمنة إضافية — فحص أداة حسابات الاختبار

بعد مراجعة `functions/package.json` بين فرع الاختبار وفرع حسابات الاختبار، ثبت أن التغيير المفيد المطلوب لا يحتاج نقل الحزمة أو خفض Node من 22 إلى 20. أضفت فقط فحص صياغة سكربت seeder إلى أمر الاختبارات المحلية:

`node --check scripts/seed-test-accounts.cjs`

وحافظت على:
- Node.js 22.
- أوامر البناء والاختبارات الحالية.
- أوامر Emulator ذات project IDs التجريبية.
- عدم إدراج سيناريو 5000 شخصية في `test:all`.
- عدم تشغيل seeder أو أي Emulator في هذه الجلسة.

Commit: `efb80d130793ba2f3f5c5d6a58ced11f4fb08736`.

هذه إضافة تحقق ساكن فقط؛ لم يتم تنفيذ السكربت أو إثبات تكامل الحسابات.


## مراجعة تقنية تكميلية وترتيب التنفيذ — 2026-11-18

### نتائج مراجعة المصدر المباشرة

1. **عقد ماسح الوسائط:** نسخة فرع التجميع الحالية `functions/src/media-scanner.ts` مرتبطة باختبار `functions/test/media-scanner.test.js` وتتحقق من purpose وClamAV وإصدار التواقيع وحداثتها (36 ساعة كحد أعلى) وربط generation وSHA-256 والمشتقات الآمنة لكل نوع. نسخة فرع hardening أقدم وأقل تفصيلاً ولا تحتوي عقد purpose أو derivative. القرار: الإبقاء على عقد فرع التجميع وعدم استبداله بالنسخة القديمة. أي نقل لتشغيل ClamAV يجب أن يطابق العقد الحالي واختباراته.
2. **إعفاءات حصص الوسائط:** فرع الإعلانات يضيف إلى `media-quota.ts` إعفاءات منفصلة لرفع المالك وللنقل بين العضو والمالك، مع بقاء قيود التزامن والحجم النشط. النسخة الموحدة لا تحتوي هذه الدوال. لا تنقل الدوال وحدها قبل تحديد جميع نقاط الاستدعاء واختبار عدم إمكانية انتحال صفة المالك أو المستلم؛ المطلوب ربطها بتحقق خادمي موثوق لا بمدخلات العميل.
3. **تكامل الملصقات:** فرع الإعلانات يضيف استدعاء `validateStickerMediaMetadata` و`validateStickerPackManifest` و`validateStickerSendRequest` داخل خدمة الوسائط. وحدات `sticker-policy` و`sticker-catalog` موجودة في فرع التجميع، لكن خدمة الوسائط الموحدة لا تستدعيها حتى الآن. هذه فجوة ربط حقيقية وليست مبرراً لاستبدال `media.ts` كاملاً.
4. **المالية الخاصة بالإعلانات:** `featured-ad-finance.ts` موجودة في فرع الإعلانات فقط وليست في فرع التجميع. الوحدة تتعامل مع مبالغ نقدية بوحدات minor/currency، واستلام/استرداد/تسوية/مراجعة حملات. لا يوجد حتى الآن دليل كافٍ من هذه الوحدة وحدها على تكاملها مع دفتر BetaCoins أو على دورة اعتماد مالية كاملة؛ تبقى مرشحة لمراجعة مستقلة مع اختبارها قبل النقل.
5. **الاختبارات:** اختبار ماسح الوسائط الحالي في فرع التجميع يغطي HMAC، رفض الأسرار الضعيفة، freshness، ربط provider وgeneration وhash، واشتراط المشتقات الآمنة الدقيقة لـ GIF/audio/video/PDF. وجود الاختبار لا يثبت تشغيله؛ لم يُشغّل في هذه البيئة.

### ترتيب التنفيذ الملزم للدفعة التالية

| الترتيب | المسار | الإجراء | معيار القبول |
|---|---|---|---|
| 1 | وسائط/حصص | تحليل كل مواضع حجز وتحرير الحصة وتحديد هوية المالك/المستلم خادمياً؛ ثم دمج إعفاءات النقل عند ثبوت سلامة كل المسارات | لا تجاوز لحصص التزامن/الحجم، لا اعتماد على claim من العميل، اختبارات owner/member/transfer/replay |
| 2 | وسائط/ملصقات | ربط وحدات سياسة الملصقات الموجودة بخط الرفع والإرسال والتحقق من manifest والحدود والملكية | رفض metadata/manifest المزور، عدم قبول إرسال أصل غير آمن، اختبارات خدمة |
| 3 | ماسح ومشتقات | مواءمة أي خدمة ClamAV خارجية مع العقد الحالي، ثم مراجعة timeout/fail-closed/signature freshness وحماية callback | رفض التوقيع/التواقيع القديمة، رفض generation/hash mismatch، عدم تسليم أصل quarantine |
| 4 | اقتصاد الإعلانات | مراجعة وحدة المالية واختبارها وتحديد علاقتها المنفصلة بدفتر BetaCoins ثم ربطها بالمسارات الخادمية عند ثبوت عدم التكرار | idempotency ذري، لا استرداد يتجاوز المقبوض، لا تسوية تتجاوز الصافي، سجل تدقيق |
| 5 | وظائف الخادم | معالجة فروق `index.ts` من PR #22/#24/#27 بوحدات صغيرة ومقارنة كل export/trigger/callable | عدم تكرار exports أو تغيير auth/roles، اختبارات لكل مسار |
| 6 | الواجهات | دمج واجهات الملف الشخصي والإعلانات والمتجر والمكالمات بحسب الوظائف لا باستبدال الملفات | تطابق الواجهة مع صلاحيات الخادم والكتالوج الاقتصادي |
| 7 | الحزم والفهارس | مراجعة scripts/dependencies وJSON indexes بعد اكتمال الوظائف | Node 22 محفوظ، لا secrets، لا فهارس مكررة/مفقودة |
| 8 | الإغلاق المحلي | Flutter Analyze/Tests وFunctions build/tests وEmulator/security/integration محلياً حسب التغطية | حفظ الأوامر والنتائج وSHA؛ لا ادعاء نجاح دون تشغيل |
| 9 | الأداء والأمن | فحص التزامن والتكرار والحدود والخصوصية والتكلفة، ثم قبول مالك المشروع | تقارير موثقة، دون CI بعيد في هذه المرحلة |

### العوائق الحالية

- لا توجد بيئة clone محلية قابلة للبناء في جلسة التنفيذ الحالية، ولا وصول إلى Termux الخاص بالمالك؛ لذلك لا يمكن إجراء تعديل آمن واسع داخل `media.ts` أو `index.ts` مع تشغيل اختبارات الوحدة والتكامل هنا.
- لم يُنفذ في هذه المراجعة أي تغيير على `main` أو Firebase أو الموارد المدفوعة، ولم يُشغّل CI بعيداً.
- مستودع محاكاة 5000 شخصية ما زال خارج النطاق تماماً.


### تدقيق أمني لمسار إعفاء حصص الوسائط

- في نسخة `media.ts` بفرع الإعلانات، يحدد الخادم هوية المستلم عبر Firebase Auth custom claims، ثم يسمح بإعفاء الاستخدام اليومي عندما يكون المستلم مالك المنصة. هذا أفضل من قبول claim من العميل، لكنه لا يثبت بمفرده أن المستلم عضو فعلي في المحادثة المقصودة أو أن الرفع سينتهي إلى ذلك المستلم.
- لا يُنقل هذا المسار قبل التحقق خادمياً من عضوية المحادثة/الغرفة وربط `recipientUid` بهوية الطرف المقابل الفعلية، والتحقق من عدم إمكان استغلال طلبات الرفع المتكررة لمجرد تمرير UID المالك. يجب أيضاً أن تبقى صلاحية PDF للمالك المثبت فقط كما هي، وألا يتحول إعفاء الاستخدام اليومي إلى تجاوز لحدود الحجم/التزامن/الفحص/الاحتفاظ.
- في النسخة المصدرية، المالك الموثق معفى بالكامل من حجز الحصة، بينما نقل العضو إلى المالك يحتفظ بحجز الحجم والتزامن ويعفى من عداد الاستخدام اليومي. هذا اختلاف سلوكي جوهري عن النسخة الموحدة، ولا يُعتمد دون مراجعة سياسة الحصص المعتمدة وتغطية كل مسارات finalize/cleanup/release.
- الاختبارات المصدرية تغطي الحساب النقي للإعفاءات وتحرير الحصة، لكنها لا تثبت صحة authorization أو عضوية المحادثة أو مقاومة إساءة استخدام recipientUid؛ يلزم اختبار تكامل خادمي لهذه الحالات قبل الدمج.


## تنفيذ مسار الملصقات الآمن — تحديث 2026-11-18

### التغييرات المنفذة على فرع الاختبار الموحد

1. **عامل الفحص الخاص:** نُقلت إضافات sticker-only إلى `scanner/server.js`, `scanner/security.js`, `scanner/processors.js` مع اختبارات المعالج والأمان. العامل يقيس الأبعاد والإطارات والمدة والحجم من الملف الفعلي، ولا يعتمد على بيانات العميل.
2. **عقد الفحص الخادمي:** أصبح `media-scanner.ts` يقبل purpose=sticker فقط مع metadata مقاسة وصحيحة للنتيجة النظيفة؛ لا يشترط تحليل metadata للملف عند نتيجة malware، حتى لا يمنع الرفض الأمني عند فساد/تعذر تحليل الملف الخبيث.
3. **سياسة الرفع:** أضيف غرض sticker إلى `media-security.ts` مع قصر الرفع على جلسة المالك الموثقة، وقصر الأنواع على PNG/WebP/GIF، وحدود الرفع المصغرة: 256 KiB للثابت و512 KiB للمتحرك.
4. **المشتقات:** أضيف السماح بمشتقات GIF لغرض sticker لمالك المنصة فقط، مع سقف 512 KiB للمتحرك و256 KiB لمعاينة الملصق الثابت.
5. **استقبال نتيجة الفحص:** `media.ts` يرفض metadata غير الصالحة أو التي لا تطابق نوع/حجم المصدر، ويتحقق من سقوف المشتقات قبل اعتمادها، ويحفظ metadata المقاسة فقط. كما يعيد metadata للمالك صاحب الأصل بعد الاعتماد.
6. **إكمال الرفع:** أضيف تحقق جلسة المالك عند finalize لطلبات sticker؛ فلا يكفي claim قديم أو دور مخزن في مستند الأصل وحده.
7. **دورة الحزم والإرسال:** أضيفت callable لخزن/نشر الحزم من المالك بعد التحقق من كل أصل scanner-approved، وcallable لكتالوج الحزم المنشورة، وإرسال ملصق للمحادثة الخاصة/الغرفة بمعاملة خادمية، ورابط مشتق قصير العمر يتحقق من generation/hash/provenance قبل إصداره.
8. **مقاومة إعادة الطلب:** أضيف `stickerMessageReplayMatches` لربط إعادة الإرسال بهوية المرسل والأصل والحزمة والملصق كاملة، بدلاً من الاكتفاء بمطابقة mediaId؛ وأضيفت اختبارات الوحدة للحالات المتطابقة والمختلفة.
9. **الاختبارات المكتوبة:** أضيفت تغطية لحدود رفع الملصقات، وصحة metadata في نتيجة الفحص، وسلامة توجيه المشتقات، وهوية idempotency. هذه اختبارات مكتوبة في المستودع وليست نتائج تشغيل.

### حدود لم تُغلق بعد

- تم دمج أساس واجهات Flutter على فرع الاختبار: `MemberMediaUploadService` لرفع الملصق والتحقق من نتيجة الفحص وإدارة الحزم/الكتالوج/الإرسال، شاشة إدارة حزم المالك، منتقي الملصقات وعارضها، وربط زر الإرسال والعرض في المحادثة الخاصة والغرف، وإضافة مدخل الشاشة إلى لوحة السوبر أدمن. لم تُشغّل Flutter Analyze أو اختبارات Widget، لذلك لا تُعد الواجهات مقبولة نهائياً حتى فحص التحليل والبناء والاختبار على الأجهزة.
- لم يُضف بعد اختبار Emulator شامل يثبت المسار: جلسة المالك → رفع sticker → callback → اعتماد المشتق → نشر الحزمة → الكتالوج → URL → إرسال مباشر/غرفة → العرض.
- لم يُنشر scanner worker ولم يُربط ببيئة Firebase غير إنتاجية. لم تُختبر callback حية أو Storage generations في بيئة فعلية.
- لم تُنفذ ميزات البحث والمفضلة والمستخدمة حديثاً، ولا ضوابط الحركة المخففة/إيقاف autoplay عند إخفاء الشاشة/حدود الذاكرة وإمكانية الوصول.
- يلزم اعتماد سياسة دورة حياة أصول الملصقات وإزالة الحزم والأصول اليتيمة قبل تفعيل أي حذف آلي لها.
- لا توجد بيئة محلية متصلة بالمستودع في جلسة التنفيذ: محاولة clone إلى `/tmp/mawda-unified` فشلت بسبب تعذر حل `github.com`. لذلك لم تُشغّل اختبارات Node/Functions أو scanner أو Flutter أو Emulator. لا توجد شهادة build أو test pass لهذه التغييرات.

### سياسة الحصص

- لم تُعتمد إعفاءات quota من فروع المصدر؛ أُعيدت `media-quota.ts` و`media-quota.test.js` إلى blob SHA الأصليين `a322b83b5f52703c226e9f9da9f19c4b3d0f7bf1` و`36e71c48a8aa7cbe58b6f003cd2a7a7b1c5b4d5f` على الترتيب.
- لم يُطبق تجاوز لحصة المالك أو العضو الذي يرسل إلى المالك. أي تغيير في الإعفاءات اليومية أو حواجز التزامن/الحجم يحتاج قراراً صريحاً مستقلاً، واختبارات تمنع إساءة الاستخدام والرفع غير المرتبط برسالة.
- لم تُغيّر قيم حدود الحصص أو حدود الوسائط المعتمدة.

### سجل commits التنفيذية

- `7b6d4f9dd54f32ceb3ac239b48153608367abe4b` — scanner sticker preview/inspection.
- `e62ececc2387bbfa5f74a58e2afde2acb97e91a4` — scanner purpose validation.
- `03f5f360f33bfacf83355f0024a28fbfce79b60e` — actual sticker metadata and animated derivative limits.
- `1243a14f37f3110daddb6d0212a152726cf6f30c`, `fefa499fcae5d00b6105e827758b6c14ffff54f0` — scanner integration/security tests.
- `adfa4612d946491d9cf4a6eb8cd369b9661178cd`, `45e362a58f435f0b11fab6c8306913551d257272` — Functions scanner contract and tests.
- `17941d27a74f9d58c348ea9afb0837ed791e8e21`, `d40e18fbcc1531f2b3416208263c8dfc77ad86d0` — owner-only sticker upload policy and tests.
- `e1e390adff33b8cb20557841e75cab3b5f7ad4ba`, `8c541981852740e2172e35885e81032f7e2ba0d5` — derivative policy and tests.
- `92b50c4c2d111c91f234acd787c19bf75c0d100a` — scanner callback validation, finalization and owner metadata projection.
- `63695d8153e811c4ecbf675cd6ba002a3783c28b` — owner pack authoring, send, and secure derivative URL callables.
- `5e9f4d15c8f5f805713ba1ce0e6822aafdeab296` — catalog callable and public exports.
- `a43a8db9e1b06bd125eb10a1cb401b1ae8452405`, `0b8b00a142cc4aaf5c87714face3bc90e03dcfb4`, `c3b48f9c8ae45a6f8fe63740a94d2b76a22fd6ed` — full sticker replay identity hardening.
- `e9e3cb6e43e3a680f1de05f910e2583d8a158bd3` — import consolidation.
- `5cdea71ecb890beabe393e1b3fabd5e91f6f0ed1` — client sticker upload/catalog/send service methods.
- `7a88ebf2eb2db209618e2c8bcbfce1ff3825deca`, `41eeaba73512e3e0322c9e5afcb363c95abdcb56` — owner pack editor and picker/renderer widgets.
- `2d91f7baae1b7d9b743fb26019a2ec15f2be0f2d` — owner dashboard entry point.
- `8c665200e16fa6b75a6cdeaef587cc7ee065320d`, `08230028d65d7a643e87bfea997a2ca0c31dd2d8` — direct-chat and room picker/send/render integration.
- `8f2d0863d36901d6e1906d7b46c0754feb32153e` — account eligibility hardening; `7efd056aefc626151297d96735640c1666ea96d9` — room membership alignment.


### مراجعة أخيرة لمسار إرسال الملصقات

- عولجت فجوة idempotency: إعادة الطلب لا تُقبل إلا إذا تطابقت هوية المرسل والأصل والحزمة والملصق، وليس mediaId وحده. الاختبارات تغطي تغيير الحزمة/الملصق/المرسل والنوع.
- عُدلت أهلية الحساب في مسار الإرسال المباشر لتستخدم `isMemberAccountInGoodStanding` إلى جانب اكتمال الملف، بدلاً من فحص حالة التعليق وحدها.
- عُدلت أهلية الغرفة لتطابق نموذج الرسائل المعتمد: وجود سجل عضوية الغرفة، رفض حساب الزائر، وفحص حساب العضو من مستند `users` عبر `isMemberAccountInGoodStanding`. يبقى فحص الكتم خادمياً.
- آخر commit code موثق لهذه المراجعة: `7efd056aefc626151297d96735640c1666ea96d9`.
- SHA الحالي للفرع يحتاج قراءة branch ref مباشرة؛ آخر commit مؤكد من سجل التنفيذ هو أعلاه. مقارنة الفرع مع `main` تُظهر 2791 commits ahead و0 behind، وقاعدة المقارنة ما زالت SHA `460a79a7dc2e16f4ad146af22aab58e152ad1e8c`. لم يتغير `main`.
- طلبات الدمج #22 و#24 و#25 و#26 و#27 ما زالت مفتوحة؛ لا دمج تلقائي أو دمج إلى main.


### آخر تدقيق للربط الواجهاتي وحماية المحادثات

- أُضيفت خدمة العميل للرفع حتى اعتماد الفحص، وقراءة metadata المقاسة، وحفظ/نشر الحزم، وجلب الكتالوج، وإصدار URL الآمن، وإرسال الملصق.
- أُضيفت شاشة مالك لإنشاء مسودة/نشر حزم الملصقات، وأضيف مدخلها إلى لوحة السوبر أدمن.
- أُضيف منتقي الحزم وعارض الملصقات وربطهما بالمحادثات الخاصة والغرف، مع تعطيل زر الإرسال أثناء الإرسال وإظهار أخطاء واضحة.
- حُسّن إرسال المحادثة الخاصة لرفض مستند محادثة قائم لا تطابق أطرافه UID المرسل/المستلم المتوقع، وتحديث `lastMessageId` مع معاينة الرسالة.
- لا تزال ضوابط reduced-motion/animation lifecycle ومدة صلاحية URL في واجهة طويلة البقاء بحاجة إلى تحسين؛ URL الخادم قصير العمر (دقيقتان)، والمنتقي يحتفظ بمستقبلات URL داخل الذاكرة. يلزم إضافة إعادة جلب واعية بالانتهاء واختبارات إمكانية الوصول والأداء قبل القبول النهائي.
- آخر commit برمجي مؤكد: `9f4aa52f45664313449cb9a46ac596c35f2e8072`.
- مقارنة الفرع مع main: `ahead=2800`, `behind=0`, والـmain SHA ثابت `460a79a7dc2e16f4ad146af22aab58e152ad1e8c`.
- ما زالت PRs #22/#24/#25/#26/#27 و#2 مفتوحة؛ لم يتم الدمج إلى main.


## تنفيذ دفعة مالية معزولة — سياسة مالية الإعلانات المميزة

نُقلت من فرع `codex/featured-ads-secure-lifecycle-20261118` إلى فرع الاختبار الموحد الملفات التالية كما هي، دون تعديل دفتر المحفظة أو ربطها بمسار الإنتاج:

- `functions/src/featured-ad-finance.ts`
- `functions/test/featured-ad-finance.test.js`

Commits:
- `64677c63423f26d86afe822983db25e42f4a1e62` — إضافة وحدة السياسة.
- `1a9dc1ec5fd770e11ba69d033de1a98d20ee13ea` — إضافة اختبارات الوحدة.

### نطاق ما توفره الوحدة

- التحقق من أنواع أحداث الدفع والاسترداد والتسوية والمراجعة.
- التحقق من المبالغ الصحيحة الآمنة ورمز العملة والمراجع والأدلة.
- منع الاسترداد فوق صافي المبالغ المستلمة.
- منع التسوية فوق الرصيد غير المسوى.
- إعادة فتح المراجعة عند تسجيل استرداد لاحق.
- إنشاء هوية idempotency مبهمة باستخدام SHA-256.

### حدود صريحة قبل اعتبار الاقتصاد مكتملاً

هذه وحدة سياسة نقية واختبارات Node مبنية على `node:test`؛ ليست تكاملاً مالياً خادمياً بعد. لا تكتب Firestore ولا تنفذ معاملة ذرية، ولا تثبت وحدها صلاحية المالك، ولا تربط مع مزود دفع أو دفتر BetaCoins. كما أن تمرير `idempotencyKey` إلى validator لا ينفذ قيد التكرار بمفرده. لذلك يمنع استخدامها حالياً كمسار دفع أو استرداد فعلي.

### معايير الدمج التالية لهذه الوحدة

1. بناء خدمة خادمية لا تقبل تسجيل دفع/استرداد إلا من صلاحية مالك موثقة server-side.
2. تنفيذ transaction واحدة تسجل مفتاح idempotency، الحدث، وتحديث snapshot مع منع التكرار المتزامن.
3. فصل reconciliation المحاسبي عن حركة النقد الفعلية وعدم تسميته payout.
4. ربط العملات والمبالغ بعملة الحملة المعتمدة ومصدر دفع موثق؛ لا اختراع أسعار أو مكافآت.
5. إضافة اختبارات Emulator للتزامن، replay، تبدل الصلاحية، الاسترداد الجزئي والكامل، وتعارض المعاملات.
6. لا تكرار أو تعديل رصيد BetaCoins بسبب تسوية إعلان نقدية إلا إذا ثبت قرار معماري معتمد يحدد العلاقة.

لم يتم تشغيل هذه الاختبارات في جلسة التنفيذ الحالية، ولم يتم تفعيل أي معاملة مالية أو مورد خارجي.


### Financial policy boundary hardening — 2026-11-18

- Hardened `applyFeaturedAdFinancialEvent` to re-run runtime validation at the state-transition boundary. Static TypeScript types alone are not treated as runtime trust.
- Added snapshot consistency checks for currency, payment/review states, and zero/non-zero receipt invariants before applying any event.
- Added unit cases for forged fractional/unsafe-precision events and inconsistent persisted snapshots.
- Commits: `b8cc837ab2694860c18302f8e3f5bbba9114c8f0` (policy), `875d42dd435067bc5c497ce00c336b29be0ee3ee` (tests).
- These changes harden the pure policy module only. They do not close the server-side owner authorization, Firestore transaction/idempotency, payment-provider evidence, or reconciliation integration gaps listed above.
- Tests remain unexecuted in this environment; no CI was triggered. No main, Firebase, production, billing, or 5,000-persona lab changes were made.


## Reconciliation checkpoint — 2026-11-18 14:50 (+03:00)

### Immutable branch evidence

- Unified test branch: `codex/mawdda-unified-test-2026-11-18`.
- Branch HEAD verified from GitHub: `37e0b27dd2c676ac67e5d1e27dfb565cd831c722`.
- Comparison against `main`: ahead 2807, behind 0; main base SHA remains `460a79a7dc2e16f4ad146af22aab58e152ad1e8c`.
- No workflow runs were returned for this exact HEAD. No CI or remote Actions run was initiated in this checkpoint.

### Open PR disposition — no blind merges

- PR #22 (economic closeout): draft, 34 changed files, diverged from the unified branch (124 commits unique to its head; 215 unique to the unified branch from the common base). Its source audit explicitly leaves call admission/consent, entitlement, trusted per-participant measurement, topology, and atomic settlement incomplete. Do not merge as a whole.
- PR #24 (featured ads/media/stickers): draft, 58 changed files, diverged (199 head-only; 216 unified-only). It overlaps `functions/src/index.ts`, `functions/src/media.ts`, media scanner/security/quota, indexes, UI and workflow configuration. The source branch's workflow changes add additional test jobs; do not merge workflow changes or trigger remote CI under the current local-only test instruction. Only isolated, reviewed deltas may be considered.
- PR #25 (media hardening): draft, 23 changed files; GitHub reports not mergeable against its recorded base. Preserve the unified branch's newer scanner contract; compare individual changes only.
- PR #26 (test account system): draft, 11 changed files; not mergeable against its recorded base. Treat test fixtures/scripts as isolated candidates; inspect for destructive seeding, production project targeting, credentials, and any workflow dispatch before transfer.
- PR #27 (profile/email verification): draft, not mergeable against its recorded base. It changes `functions/src/index.ts`, `functions/package.json`, workflow configuration and profile UI. Review the full callable lifecycle and Auth/Firestore consistency before any selective transfer; do not copy its workflow trigger changes.
- PR #2 remains a draft targeting `main`; it is outside this branch integration and remains untouched.

### Current review findings and gates

- Current `media.ts` contains active sticker upload/finalization/send and secure derivative delivery paths, including server-side membership/account checks, replay identity checks, generation/hash/provenance checks and short-lived URLs. This is source inspection only, not runtime proof.
- `featured-ad-finance.ts` remains a pure policy module. It does not implement owner authorization, Firestore transaction/idempotency, payment-provider verification, or a wallet ledger integration. No real payment/refund/settlement path is authorized by this code alone.
- The branch contains significant production-sensitive workflow/configuration and Firebase-related diffs relative to `main`; this checkpoint did not alter them. No merge to `main`, Firebase mutation, deployment, billing, or 5,000-persona lab access occurred.
- Tests remain unexecuted. Exact-HEAD workflow lookup returned an empty list; this is not a passing CI result. Local Flutter/Dart/Node/Emulator execution remains blocked until a checked-out local environment is available.

### Next safe integration order

1. Select PR #26 test-only files after inspecting each complete diff and confirming all project IDs are emulator/demo-only; exclude workflow dispatch and any production-seeding capability.
2. Reconcile PR #27's email-renewal state machine and reward path against the current member/account and wallet contracts; transfer only discrete files after checking exports, Auth/Firestore failure recovery and UI behavior.
3. Continue PR #24/25 media work by semantic units, retaining the current scanner contract and refusing quota exemptions until recipient identity and conversation membership are proven server-side.
4. Keep PR #22 call charging fail-closed until invitation approval, independent financial consent, entitlement, trusted participant intervals, scalable media topology and atomic idempotent ledger settlement are implemented together.
5. Run the full required local suite on one immutable SHA and record actual output before any acceptance claim. No remote CI, production action, or main merge is part of this checkpoint.


## Selective integration audit — PR #26, #27, #25 and #24 — 2026-11-18

### PR #26 — test-account system and coverage matrix

Decision: **no cherry-pick required; the safe assets are already present on the unified branch, with later/evolved versions in several files.** Compared source branch `codex/mawdda-test-account-system` with the unified branch:

- Both test-account specifications and the operator runbook are byte-identical to the source PR.
- The unified branch already has `functions/scripts/seed-test-accounts.cjs`, the emulator-only persona catalogue, coverage matrix, static tests, and the seeded-persona integration test. The unified persona/matrix test fixtures differ from the PR's older versions and include later guest-session and call-journey coverage; do not overwrite them with the older PR versions.
- The unified `.gitignore` already excludes local test credentials and emulator data.
- The unified `functions/package.json` already contains the seed and integration scripts and is on Node 22. The PR's workflow was deliberately excluded: it adds pull-request, push and manual-dispatch triggers and runs a broad matrix. No workflow was imported or triggered.
- The PR's seeded-persona integration test mutates test wallet balances and platform transfer settings before restoring them in `finally`; it remains emulator-only and was not newly copied or executed in this pass.

### PR #27 — profile and email-verification renewal

Decision: **the email-renewal server lifecycle and integration test are already present; no source replacement is needed.** The 90-day renewal helper module and its integration test are byte-identical between PR head `ddf9594ea6029036512ace621f513d6edf58a068` and the unified branch. The `startEmailVerificationRenewal` server implementation segment is also identical. The unified branch has a more developed `profile_screen.dart` and a broader Node 22 package manifest; retain those rather than replacing them with the older PR versions. The package already defines `test:email-renewal-integration`.

- The PR's `.github/workflows/validate.yml` change was not imported. Its workflow is not a local test and must not be triggered during this local-only validation phase.
- The current emulator integration test exercises the 90-day eligible renewal, email-verification gate, 500-coin once-only reward and repeat denial, but does not by itself prove every concurrency, changed-email, expired-pending-cycle, provider-delivery and client-refresh failure mode. Those remain additional test cases before final acceptance.
- No email-reward test was run in this environment. The configured reward amount is retained from the existing code and has not been altered by this audit.

### PR #25 — media hardening

Decision: **do not merge the branch or replace media files.** Its scanner contract file is identical to the unified branch, but the PR adds a separate older ClamAV gateway (`scanner/server.mjs`) with a 48-hour signature-age threshold, whereas the unified branch already has the newer scanner implementation and stricter contract. The PR changes `media.ts`, `media-security.ts`, quota and integration files; these overlap with the newer unified media/sticker lifecycle. The PR's workflow change is excluded. Any remaining unique fix must be reviewed as a narrow semantic patch against the current implementation, not copied as a file replacement.

### PR #24 — featured ads, stickers, media and calls

Decision: **no whole-PR merge.** The current unified branch has evolved versions of the featured-ad finance/reward/selector policies, media upload/security pipeline, sticker policy, UI and scanner. Exact source equality was confirmed for `functions/src/media-scanner.ts`, `scanner/server.js` and `scanner/processors.js` in the inspected source/head comparisons; other critical files differ and must remain on the unified versions until a focused diff proves a missing behavior. The PR also includes a distinct call-entitlement module and changes to call signaling; those require separate review against the approved entitlement and billing lifecycle before transfer. Its workflow and any change that relaxes owner-configured reward/campaign limits are not accepted implicitly.

### Current execution result

- PR #26 safe test assets: already integrated; no duplicate files written.
- PR #27 email-renewal backend/test: already integrated; no stale files overwritten.
- PR #25 and #24: whole-branch integration rejected due to overlap and older/divergent implementations; targeted review remains open.
- PR #22: remains blocked from whole-branch merge because call entitlements, consent, trusted participant measurement/topology and atomic billing must be verified as one lifecycle.
- No workflow was triggered, no CI was run, and no local Node/Flutter/Emulator test was executed. Source presence and static comparisons are not test passes.
- No main/Firebase/production/billing/5,000-persona repository changes were made.

## متابعة تنفيذية انتقائية — PR #22 و#24 و#25 — 2026-11-18

### لقطة المصدر
- فرع التجميع: `codex/mawdda-unified-test-2026-11-18`.
- HEAD قبل هذا التوثيق: `5587546f46151fb8f771bbb9b005164bbeebd0a3`.
- أُعيد فحص metadata وملفات التغيير والـpatches الفعلية للطلبات #22 و#24 و#25، مع قراءة ملفات المصدر المقابلة من فرع التجميع.
- الطلبات الثلاثة ما زالت مفتوحة وغير مدمجة؛ لم يتم تغيير حالتها أو دمج أي منها.

### PR #22 — الاقتصاد والمكالمات والإهداء
- **لم يُقبل دمج PR كاملاً.** يحتوي تغييرات متزامنة واسعة في `functions/src/index.ts` والملف الشخصي والمحفظة والواجهات والاختبارات.
- فرع التجميع يملك بالفعل وحدات السياسة النقية `store-gifting.ts` و`group-call-economy.ts` و`room-call-policy.ts`؛ لا حاجة لاستبدالها بنسخ PR.
- ظهر في PR تنفيذ إضافي لـ`giftStoreItem` وسجل هدايا المتجر وتوسعة طلبات باقات BetaCoins لتدعم مستلماً. هذه الوظائف غير مربوطة حالياً في فرع التجميع كدورة خادمية وواجهات مكتملة. لم تُنقل في هذه الجولة لأن التغيير يمس خصم المحفظة والـLedger والاستحقاقات وإشعارات المستلم وتاريخ الهدايا، ويحتاج مراجعة متكاملة مع قواعد Firestore وواجهات المتجر/المحفظة واختبارات replay والتزامن. لا يجوز اعتبار وجود وحدة السياسة النقية دليلاً على اكتمال الإهداء.
- ظهر helper باسم `isCallMemberBusyInSession` يميز بين المدعو المعلّق والمشارك المقبول. **لم يُنقل منفرداً**: مسار `startCall` في PR لا يزال ينشئ أقفالاً لكل المدعوين قبل قبولهم؛ نقل helper وحده قد يسمح لطلب مكالمة آخر بتجاوز قفل الدعوة المعلقة واستبداله، مع بقاء الدعوة الأولى قابلة للرد. يلزم تعديل متسق لدورة القفل والقبول والرفض والمغادرة مع اختبارات تكامل، لا نقل الدالة وحدها.
- تأكدت من أن تحقق استحقاقات المكالمات موجود بالفعل داخل `index.ts` في فرع التجميع؛ لذلك لم تُنقل وحدة استحقاق مكررة.
- سقف الصوت الجماعي المعتمد يبقى **خمسة أشخاص إجمالاً**، والفيديو **أربعة أشخاص إجمالاً**. لا تُقبل أي اختبارات أو تغييرات تعيد إقرار 7 أو 9 مشاركين كسعة مدعومة.
- تبقى دورة طلب الانضمام المستقل وموافقة المنشئ والموافقة المالية الصريحة والقياس الموثوق والتسوية الذرية/Idempotent غير مغلقة؛ فوترة المكالمات تبقى fail-closed.

### PR #24 — الإعلانات المميزة والوسائط والملصقات
- **لا دمج شامل ولا نقل ملف كامل.** فرع التجميع يملك بالفعل سياسة الملصقات والكتالوج والإرسال الآمن ومشتقات الوسائط وروابط التسليم قصيرة العمر، كما يملك وحدة سياسة مالية للإعلانات المميزة مع تحصين runtime.
- وحدة `call-entitlements.ts` في PR تكرر تحققاً موجوداً داخل `index.ts` الحالي؛ لا تُضاف نسخة ثانية لمصدر الاستحقاق.
- اختلافات `media.ts` و`media-security.ts` واسعة ومتداخلة مع دورة الفحص والمشتقات والحصص والملصقات الحالية؛ لم يظهر patch منفرد يمكن اعتماده دون إعادة تركيب واختبارات تكامل على الملف الكامل.
- تغييرات مكافآت الإعلانات التي تغيّر حدود الحملة/المكافأة أو تستبدل سياسة rolling-window لا تُقبل دون مطابقة قرار المالك وإعدادات الحملة الخادمية. لا أسعار أو حصص افتراضية جديدة.
- استُبعدت تغييرات Workflow ولم يتم تشغيل Actions أو CI.

### PR #25 — تحصين الوسائط
- **رُفضت نسخة الماسح القديمة كبديل.** `scanner/server.mjs` في PR يضبط حد حداثة توقيعات ClamAV على 48 ساعة افتراضياً، بينما عقد الماسح الأحدث في فرع التجميع يفرض 36 ساعة. نقل النسخة سيخفف شرطاً أمنياً قائماً.
- بقية تغييرات `media.ts` و`media-quota.ts` و`media-scanner.ts` متداخلة مع النسخ الأحدث في فرع التجميع. لم يتم نقل إعفاءات حصص أو تعديل حدود الحجم/التزامن أو قواعد الفحص.
- لا نشر للماسح أو إنشاء موارد Cloud Run أو أسرار أو إعدادات Firebase؛ هذه الجولة مراجعة مصدر فقط.

### نتيجة التنفيذ والاختبار
- لم يتم تنفيذ دمج كود من PR #22/#24/#25 في هذه الجولة؛ السبب أن كل تغيير فريد ظهر إما غير مكتمل وظيفياً أو مرتبطاً بتغييرات محورية لا يمكن إثبات سلامتها دون بيئة بناء واختبار محلية.
- جرت محاولة فعلية للوصول إلى المستودع من بيئة التنفيذ عبر `git ls-remote`، لكنها فشلت بسبب تعذر حل `github.com`. لا توجد نسخة checkout محلية متاحة، وبالتالي لم يُشغّل `npm test` أو TypeScript build أو Flutter Analyze/Tests أو Firestore Emulator.
- لم يتم تشغيل CI/GitHub Actions. لم يحدث دمج إلى `main` أو نشر أو تعديل Firebase/الإنتاج/الفوترة، ولم يتم لمس مختبر 5000 شخصية.
- هذه الجولة **مراجعة وقرار دمج انتقائي موثق** وليست إغلاقاً للمرحلة الاقتصادية أو نجاحاً للاختبارات.

### بوابة الخطوة التالية
1. توفير/استعادة checkout محلي للمستودع على فرع التجميع، ثم تشغيل الاختبارات المحلية الموجودة قبل أي دمج متداخل.
2. تنفيذ دورة إهداء باقات BetaCoins وإهداء عناصر المتجر كوحدات متكاملة بعد مراجعة Ledger وقواعد Firestore والواجهات واختبارات التزامن وreplay.
3. إعادة تصميم دورة دعوات المكالمات والقفل والقبول والاستحقاق والموافقة المالية والقياس والتسوية كوحدة واحدة؛ لا تُفعّل الرسوم قبل نجاح اختبارات Emulator.
4. استكمال تدقيق الفروقات الدقيقة للوسائط والإعلانات من داخل checkout محلي، مع الحفاظ على حد توقيعات الماسح 36 ساعة والحدود المعتمدة.

## متابعة الرؤية الاقتصادية الشاملة — دفعة التنفيذ التالية (2026-11-18)

### لقطة الفروع والحماية

- رأس فرع التجميع قبل هذا التوثيق: `beab3dd2f1d4b31e90232269bc8bb36181b68498`.
- `main` بقي عند `460a79a7dc2e16f4ad146af22aab58e152ad1e8c`؛ لم يحدث دمج أو تحديث.
- مختبر `productionhome2022-hash/mawdda-5000-simulation-lab` لم يُلمس؛ رأسه المقروء عند الفحص `c9a3a330c914e84a8e0a3bbb524028d79264cf30`.
- PR #22 و#24 و#25 ما زالت مفتوحة وغير مدمجة، وقواعدها جميعاً فرع التجميع. لم يُنفذ merge أو CI بعيد.

### الإهداء والمحفظة

1. إضافة شاشة `GiftCoinsScreen` وربطها بالمحفظة:
   - إهداء باقة يحددها المالك من كتالوج الأسعار الحالي عبر طلب الشراء اليدوي مع `giftRecipientUid`. لا يصدر الرصيد حتى تحقق المالك من الدفع الخارجي واعتماده.
   - إهداء كمية حرة من رصيد المرسل عبر `getTransferQuote` ثم `transferCoins`، مع عرض العمولة والصافي قبل التأكيد.
   - ربط مفتاح إعادة المحاولة بهوية العملية نفسها (المستلم/الباقة أو المستلم/الكمية) لمنع إعادة استخدام المفتاح بعد تغيير تفاصيل الهدية.
2. إضافة سجل هدية مستلمة وإشعار خادمي لعمليات التحويل من الرصيد، وربطها بواجهة سجل الهدايا. تبقى قيود المحفظة والعمولة والسجلات داخل معاملة واحدة.
3. منع التحويل إلى حساب يملك سجلات guest profile/session، مع إبقاء رفض المرسل المجهول.
4. إصلاح أسماء حقول واجهة اعتماد طلبات باقات الكوينز لتطابق عقد الخادم (`requestedCoins` و`agreedCoins`)، وإظهار المستلم المستهدف.
5. إزالة الأسعار وباقات البداية الصلبة من مسار الإنتاج:
   - لم يعد `getOwnerEconomyPricing` ينشئ أسعاراً افتراضية تلقائياً؛ عند عدم الإعداد يعيد كتالوجاً فارغاً وإصداراً صفرياً وطلبات شراء متوقفة.
   - أزيلت ثوابت الأسعار من `economy-pricing.ts`.
   - أضيفت واجهة المالك لإدخال الباقات والمواضع والأسعار يدوياً، وتفعيل طلبات الشراء بقرار صريح.
   - حفظ إعدادات الاقتصاد يتطلب `expectedVersion` و`manualCoinPurchasesEnabled` صراحةً، ويمنع الكتابة فوق إصدار أحدث.
6. أضيفت اختبارات تكامل/وحدة لمفاتيح الإهداء، سجل الهدية والإشعار، رفض المستلمين الزوار، وعدم إظهار أو قبول باقات بلا تسعير مالك. هذه الاختبارات مكتوبة ولم تُشغّل محلياً بعد.

### دورة المكالمات

- إعادة التحقق داخل المعاملات الخادمية من قائمة أعضاء المحادثة الثنائية وأهلية الحسابات والعمر والحظر قبل إنشاء الأقفال.
- إعادة التحقق من أهلية طرفي المكالمة وعضوية المحادثة عند قبول الدعوة.
- إعادة التحقق من استئجار الغرفة وعضوية المشاركين النشطين عند تثبيت الاتصال، لتقليل سباقات انتهاء الإيجار أو إزالة العضوية.
- أضيفت تغطية تكاملية لتغير الحظر/العضوية بين الدعوة والقبول.
- يبقى حد الصوت الجماعي خمسة أشخاص إجمالاً والفيديو أربعة أشخاص إجمالاً.
- **لم تُفعّل فوترة المكالمات**؛ الاستحقاقات والقبول الحاليان لا يكفيان لتشغيل خصم مالي. تبقى الموافقة المالية الصريحة والقياس الخادمي الموثوق والتسوية الذرية/idempotent بوابات لازمة قبل أي تحصيل.

### الإعلانات المميزة والمكافآت

- إيقاف المكافآت افتراضياً وجعل مبالغها وحدودها صفراً حتى يحدد المالك سياسة فعلية.
- ربط مكافأة الحملة بسقف المالك العام، والتحقق من ميزانية الحملة المتبقية بأعداد صحيحة.
- إضافة إصدار متوقع عند تحديث سياسة المكافآت لمنع الكتابة فوق تعديل متزامن.
- توحيد اختبار النطاق الجغرافي، بما في ذلك `all_arab_countries`، بين الاختيار وبدء الجلسة وتسوية المكافأة.
- اكتشاف أن بيانات foreground/progress التي يرسلها العميل لا تثبت مشاهدة موثوقة. لذلك أصبحت تسوية BetaCoins تشترط حقول إثبات خادمية موثوقة غير متصلة حالياً؛ لا تُصرف مكافآت اعتماداً على نبضات العميل. وتعرض لوحة المالك هذا القيد بوضوح.
- أضيف اختبار تكاملي يرسل تقدماً مزوراً بنسبة 100% ويتحقق من عدم إضافة أي رصيد عند غياب الإثبات الخادمي.

### الوسائط والسعة

- فرض سقف حداثة قاعدة توقيعات ClamAV عند 36 ساعة في بوابة التحقق وفي إعدادات خدمة الماسح، مع اختبار يرفض تجاوز 36 ساعة.
- إضافة لوحة مالك لإعداد حصص وسعة الوسائط بوضع `observe_only` حصراً، مع إصدار متوقع وسجل تدقيق.
- إضافة عداد خادمي إجمالي لبايتات الرفع النهائي وعدد الملفات شهرياً UTC داخل معاملة إنهاء الرفع، دون تخزين معرفات أعضاء في العداد، واختبار الزيادة مرة واحدة وعدم تكرارها عند إعادة الطلب.
- لا تزال قياسات التنزيل والتخزين المحتفظ به والمعالجة والأعضاء النشطين غير متصلة، وتظهر `null` بدلاً من تقدير. لا توجد إنفاذات حصص أو فوترة أو قواطع تكلفة في هذه الدفعة.
- لم يُنشر الماسح، ولم تُنشأ موارد Cloud Run أو أسرار أو إعدادات Firebase إنتاجية.

### commits المرجعية لهذه الدفعة

- الإهداء: `6e45dedafb381741a8ddd37d75aa9c73559d6219`, `f2712e874acc92c40ec693c72bcab1a55736fd0d`, `af031c279008b11662cd5083d6fa67604009589a`, `1f2718ee1e9052e71ada442ddd5d0483c1765239`, `899ee1042baa198ec80a7b2cab42d987c3e35b27`.
- التسعير المملوك للمالك: `fa8c914e85e3b021a800055d06e4224d524452c7`, `0f05d6c4c248b35a7402b52ea2a9e0e794d4a6e6`, `aa4733f75411609b4bb63a84c5db1ce763b7fe43`, `a1ee706220173a8268c6a30388c7741a2d2c9b71`, `beab3dd2f1d4b31e90232269bc8bb36181b68498`.
- المكالمات: `dfcae6ce09db1a2ed97d397577db41ea33483043`, `f9e7d54816e0c92370a5570e570647c32fb5b3d6`, `2cff69bc3777188fd88b7fbf485d2166c241bab7`, `ba3d442b0f6e26599276cb0969b8f456857fb00b`.
- الإعلانات: `5eac94cd5725bdc659be077e563a74c8e6608830`, `82a99cac1bb4669b539e847bcc3565212dba3fe8`, `57befb791471abcafc3be0e59927af4cb8cd7236`, `0c247997a7a6381f22caf041b2bec8276f390ff0`.
- السعة والوسائط: `a83f81b30574c4629c9c35cb69ba05c1c26eb6b0`, `378254202e4f0fba8cd58df95c4e4c255c53c8a7`, `d84ab8a4af6097e24eca85e836a7f5df893bb4f9`, `4cd946c66a8c642a49981c8e5d7f552a3183bd88`.

### بوابات التحقق المتبقية

- لم تتوفر نسخة checkout محلية قابلة للبناء والاختبار في بيئة التنفيذ. لم يُشغّل `npm test` أو `tsc` أو Flutter Analyze/Tests أو Firebase Emulator Tests في هذه الدفعة.
- يجب توفير checkout محلي أو ZIP موثوق للفرع الموحد ثم تشغيل اختبارات Functions والوحدات والتكامل وقواعد الأمان، ثم Flutter Analyze/Tests، مع تسجيل الأوامر والنتائج وSHA.
- يلزم استكمال دورة إعلانات المميز والوسائط ومراجعة الفروقات الدلالية المتبقية في PR #24/#25، ثم استكمال الدورة الاقتصادية للمكالمات وفق بواباتها.
- لا يُسمح بالدمج النهائي إلى `main` قبل اجتياز بوابات التحقق وموافقة المالك المستقلة. لا نشر ولا تعديل إنتاجي ضمن هذه الدفعة.

### محاولة التحقق المحلية بعد هذه الدفعة

- بيئة الحاوية توفر Node.js `v22.16.0` وnpm، لكنها لا تحتوي على checkout للمستودع أو `node_modules`.
- أوامر اكتشاف الأدوات أكدت غياب Flutter وDart وFirebase CLI.
- محاولة `git ls-remote` إلى GitHub فشلت بسبب تعذر DNS (`Could not resolve host: github.com`).
- لذلك لم يبدأ `npm test` أو `tsc` أو أي Emulator/Flutter test. لا توجد نتائج اختبار محلية يمكن اعتمادها بعد؛ التغييرات أعلاه ما زالت في حالة source-updated / tests-authored فقط.

### إقفال توثيق هذه الجولة

- أضيفت أدوات إدخال وحذف باقات الكوينز ومواضع الإعلانات من لوحة الاقتصاد، دون قيم أو أسعار ابتدائية مفروضة. يتطلب الحفظ إصداراً متوقعاً وحالة صريحة لطلبات الشراء اليدوية.
- آخر commit برمجي قبل تحديث هذا السجل: `3685cd7d8ea06012799fb6b8427cd3c275502814`.
- تحقق نهائي من المراجع: `main` لا يزال `460a79a7dc2e16f4ad146af22aab58e152ad1e8c`، ومختبر 5000 لا يزال `c9a3a330c914e84a8e0a3bbb524028d79264cf30`.
- PR #22/#24/#25 لا تزال مفتوحة وغير مدمجة. لا CI بعيد ولا نشر.

