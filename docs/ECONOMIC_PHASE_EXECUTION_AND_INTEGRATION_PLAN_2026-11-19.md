# المرحلة الاقتصادية الشاملة — خطة التكامل التنفيذي والحوكمة والإغلاق

**الإصدار:** 1.0  
**التاريخ:** 19 نوفمبر 2026  
**فرع التكامل المخصص:** `codex/economic-phase-controlled-integration-2026-11-19`  
**الفرع المرجعي الذي أُنشئ منه:** `codex/mawda-full-platform-implementation`  
**SHA الأساس عند إنشاء الفرع:** `8a1c8d0b93ed43570c523ab2d8c2598648ddac0e`  
**الحالة:** OPEN — خطة تنفيذ وضبط تكامل، وليست شهادة اكتمال أو إذناً للنشر.

## 1. الغرض والنطاق

تُدار المرحلة الاقتصادية الشاملة بوصفها برنامج تكامل واحداً يربط المحفظة والكوينز والتحويلات والشراء والمتجر والاستحقاقات والمكافآت والإعلانات المميزة والإعلانات المؤقتة والمكالمات والغرف والإيجارات والفعاليات ووسائط الحفظ ولوحة المالك والتكاليف والحوكمة.

الهدف ليس جمع الملفات أو دمج الفروع دفعة واحدة؛ بل بناء خط أساس موحد، وانتقاء التغييرات الصحيحة من كل فرع، وحل التعارضات، وربط واجهات العميل بالوظائف الخادمية والبيانات والسجلات، ثم التحقق باختبارات متدرجة على SHA ثابت.

## 2. قواعد حاكمة لا يجوز تجاوزها

1. هذا الفرع هو مساحة التكامل المعزولة. لا دمج إلى `main` ولا إلى الإنتاج ولا نشر ولا تغيير Firebase حي ولا تفعيل Billing/Blaze أو خدمات مدفوعة دون موافقة مالك منفصلة.
2. لا دمج شامل لأي فرع متشعب. كل تغيير يراجع على مستوى commit/file/API/schema/rules/index/test ثم يُنقل انتقائياً.
3. لا حذف للفروع أو الملفات أو السجلات التاريخية قبل إثبات نقل كل تغيير فريد وحفظ مرجعه.
4. لا اعتبار لميزة مكتملة بسبب وجود واجهة أو callable أو اختبار منفرد. يجب إثبات دورة end-to-end، وحماية الخادم، والتكامل، واختبارات الحدود والفشل والتزامن.
5. كل تعديل مالي خادمي، ذري، idempotent، قابل للتدقيق والمصالحة، ويفشل مغلقاً عند نقص البيانات أو الصلاحيات أو الاستحقاق.
6. لا تعديل تلقائي للأرصدة أو إعادة كتابة التاريخ المالي أثناء المصالحة؛ تبدأ المصالحة للقراءة فقط وتُظهر mismatch/incomplete/corrupt.
7. لا يُسمح بتفعيل خصم مكالمات أو تحصيل آلي أو دفع عمولة أو إعلان مدفوع أو استحقاق غير مكتمل.
8. لا يُسمح للواجهة بتحديد السعر أو الرصيد أو إثبات الدفع أو حالة المشاهدة أو أهلية المكافأة.
9. كل قيمة تجارية قابلة للضبط من المالك وفق القرار المعتمد؛ لا أسعار بديلة أو حصص أو مدد مخترعة.
10. يبقى مختبر 5,000 شخصية في مستودعه المستقل، ويختبر SHA مثبتاً من المنصة ولا ينقل harness إلى مستودع التطبيق.
11. موافقة المالك الصريحة الأحدث هي مرجع القرار. سياسة نص المحادثة المهمة 30 يوماً، العادية 7 أيام، الوسائط 4 ساعات، والمؤقتة حذف المحادثة بعد 4 ساعات من خمول خادمي؛ تفاصيل اختيار النمط وموافقة الطرفين ما زالت مفتوحة.
12. المستندات القانونية مسودات حتى مراجعة الاختصاص القانوني والكيان والتوقيع الصحيح. لا يصطنع النظام أرقام تسجيل أو عناوين أو بيانات اتصال.

## 3. جرد الفروع وطلبات الدمج التي يجب مصالحتها

الأعداد أدناه ناتجة عن مقارنة GitHub بين الفرع المرجعي وقت إنشاء الخطة وبين رؤوس الفروع الظاهرة في المستودع. التفرع الكبير يعني اختلاف تاريخ الأساس، ولا يعني أن كل commits مستقلة أو صالحة للدمج.

| المرجع | الفرع | مقارنة تقريبية بالأساس 8a1c... | المعالجة |
|---|---|---:|---|
| PR #30 | `codex/economy-official-port-2026-11-18` | +20 / -92، 9 ملفات | مراجعة انتقائية لدورة طلب شراء الكوينز اليدوية، إثباتات المالك، replay، الغرف والمتجر |
| PR #31 | `codex/economic-phase-completion-2026-11-18` | +181 / -92، 45 ملفاً | مصدر مرشح لسياسة الاقتصاد، التسعير، الهدايا، المصالحة، featured-ad finance، group calls؛ ممنوع الدمج الشامل |
| PR #22 | `codex/economic-phase1-closeout-2026-11-18` | +124 / -92، 34 ملفاً | مراجعة تقارير الإغلاق والقرارات واختبارات المكالمات والمكافآت؛ تحقق من تكرار/تعارض PR #31 |
| PR #28 | `codex/economy-recovery-2026-11-18` | +618 / -92، 105 ملفات | فرع تجميعي شديد الاتساع؛ لا دمج شامل. استخراج فقط التغييرات الفريدة الموثقة بعد تحليل الاعتماديات |
| PR #24 | `codex/featured-ads-secure-lifecycle-20261118` | +199 / -93، 58 ملفاً | مراجعة دورة الإعلانات المميزة/الوسائط/الملصقات والاختبارات، ومقارنتها مع PR #31 |
| PR #25 | `codex/mawda-phase2-hardening` | +78 / -2120، 23 ملفاً | خط أساس قديم جداً؛ مراجعة تغييرات أمان الوسائط فقط مقابل الكود الحالي، لا إعادة دمج البنية القديمة |
| PR #26 | `codex/mawdda-test-account-system` | +37 / -1124، 11 ملفاً | استخراج مصفوفة التغطية وأدوات الحسابات التجريبية الآمنة فقط؛ عدم خلطها بمختبر 5,000 |
| PR #27 | `codex/mawdda-unified-final` | +17 / -1249، 5 ملفات | مراجعة تجديد البريد والملف الشخصي فقط؛ انتقاء أي delta غير موجود بالأساس الحالي |
| PR #35 | `codex/mawdda-retention-approval-ci-repair-2026-11-19` | +12 / 0، 8 ملفات | فرع قريب من التطوير الحالي؛ إصلاح version لكتالوج المتجر وقرار الاحتفاظ واختبارات المحفظة. لا يُدمج قبل CI كامل أخضر |
| PR #38 | `codex/mawdda-role-capacity-final-2026-11-19` | +24 / 0، 12 ملفاً | فرع مكدّس فوق PR #35؛ مراجعة سعة الأدوار واختباراته، ولا يخلط بمتطلبات اقتصاد المستخدم إلا حيث تؤثر صلاحيات المالك |
| PR #34 | `codex/mawdda-deep-governance-audit-2026-11-19` | وثائق تدقيق | مصدر تدقيق حوكمي؛ ترحيل النتائج إلى هذا المسار مع حفظ التقرير الأصلي |
| PR #32/#33 | فروع الحوكمة/البيومتري | متشعبة ومتداخلة | مصالحة مستقلة؛ لا دمج الاثنين. نقل ما يلزم من صلاحيات المالك والتدقيق فقط بعد حسم سياسة البيومتري |
| PR #2 | فرع المنصة الكامل مقابل main | واسع النطاق | خارج نطاق دمج هذه المرحلة إلى main؛ main غير صالح كهدف دمج مباشر حتى استبدال قواعده وبنيته القديمة بمراجعة شاملة |

**تنبيه:** توجد فروع أخرى ظاهرة (premium effects/features, room events/audio, safety UI, store entitlement, native scaffold, MFA وغيرها). تُحصر في سجل تغييرات تفصيلي لاحقاً، ولا تُعتبر مدمجة لمجرد وجود PR مغلق؛ يجب فحص حالة merged والـ ancestry والـ file diff لكل فرع.

## 4. خريطة المجالات والاعتماديات

### A. الهوية والصلاحيات والحوكمة
- هوية المالك الواحدة، MFA/step-up، صلاحيات الخادم، حالة الحساب، التدقيق، التفويض والسحب.
- ربط كل إجراء اقتصادي حساس بصلاحية محددة، ومنع استخدام دور أو مقعد غير معتمد.
- لا منح أو تعديل أسعار أو تسوية أو اعتماد إثبات دفع من الواجهة.

### B. دفتر الكوينز والمحفظة والتحويلات
- مصدر رصيد خادمي موحد.
- دفتر immutable منطقي بسجلات مترابطة للمرسل والمستلم والمنصة والرسوم.
- idempotency ومفاتيح replay وatomicity وقيود الحالة والرصيد.
- مصالحة قراءة فقط مع pagination completeness وتحديد legacy/incomplete/corrupt.
- عدم إعادة حساب المشتريات التاريخية أو تغيير أسعارها.

### C. طلبات شراء الكوينز والدفع
- طلب العضو ادعاء غير مالي، لا يضيف رصيداً.
- تعليمات الدفع immutable/versioned؛ التحقق والموافقة للمالك فقط.
- ربط الطلب بإثبات ومبلغ وعملة ومرجع، ومنع إعادة الاعتماد.
- الدفع الآلي معطل حتى اختيار مزود، webhook موقع، مطابقة المبلغ/العملة/الطلب، refunds/reversals وتسوية، وموافقة مستقلة.

### D. المحرك التجاري والمتجر والهدايا والاستحقاقات
- محرك موحد لكل SKU حالي/مستقبلي: 24 ساعة، أسبوع، شهر، دائم عند السماح.
- سعر مستقل لكل مدة، كمية وحدود وتجديد وحالة تشغيل يتحكم بها المالك.
- snapshot للسعر والنسخة عند الشراء؛ خصم وإيصال واستحقاق وسجل ذري.
- gift/grant/renewal/revoke/expiry consumers؛ لا تفعيل SKU بلا مستهلك فعلي واختبار.
- Media Saver entitlement لا يمدد الاحتفاظ بالخادم.

### E. المكافآت والتفاعل
- بريد 500 كوين لكل دورة مؤهلة 90 يوماً exactly-once.
- البيومتري 1500 كوين معطل حتى إثبات خادمي تشفيري مقاوم للتزوير وإعادة التشغيل.
- مكافآت الإعلانات والفعاليات والأنشطة تتطلب evidence خادمياً وlimits وanti-abuse وledger.
- إلغاء/انتهاء/سحب المكافأة حسب سياسة موثقة دون حذف الأثر المالي.

### F. الإعلانات المؤقتة والمميزة
- عدم الخلط بين timed ads وfeatured ads وrewarded ads.
- ملكية المادة والموافقة والسلامة والاستهداف والمدة والميزانية والمشغل.
- جلسات مشاهدة موثوقة، حجز ميزانية، أحداث مالية مستقلة، منح مكافأة ذرية.
- نشر/سحب/إيقاف/استرداد/تسوية، ربط واجهات العضو والمالك، وإثبات عدم التكرار.
- لا مزود خارجي ولا تحصيل حقيقي قبل تكامل معتمد.

### G. المكالمات الفردية والجماعية والغرف
- ربط الاستحقاق لكل مشارك عند الإنشاء والانضمام.
- حد 5 دقائق للمكالمة، 5 صوت و3 فيديو خلال 24 ساعة متحركة وفق السياسة المعتمدة.
- أسعار المكالمات المفتوحة 120 صوت/400 فيديو إجمالاً للدقيقة؛ إذا استنفد الطرفان الحصة 60/200 لكل طرف، وإذا استنفد المتصل وحده يدفع 120/400 وحده.
- يلزم حسم وحدة التقريب والفوترة وموافقة الدافع، trusted media start/stop/reconnect، reservation/hold، insufficient funds، atomic idempotent settlement.
- مكالمات المجموعة: لا فوترة قبل إثبات topology مناسبة (SFU عند الحاجة)، اتصال كل مشارك فعلياً، إشارات وسائط موثوقة لا ادعاءات العميل، consent، توزيع التكلفة، واختبارات الضغط. تظل fail-closed.
- الغرف المستأجرة والفعاليات/RSVP تتطلب billing lifecycle، capacity، cancellation، reconciliation.

### H. الوسائط والحفظ والاحتفاظ
- MIME/size/duration validation، scanner، signed URLs، quotas، derivatives.
- 4 ساعات للوسائط، حفظ محلي فقط باستحقاق Media Saver فعال؛ لا يمدد retention.
- حذف الأصل والمشتقات والنسخ السحابية القابلة للحذف مع retries وaudit.
- استكمال temporary-chat full deletion وmode consent، مع استبعاد legal/financial holds وفق أساس موثق.

### I. إدارة التكاليف وحماية التشغيل
- خط الأساس التخطيطي: 1,000 MAU؛ هدف 7.50 USD تشغيل + 2.50 USD احتياطي، إجمالي 10 USD شهرياً كهدف تخطيطي لا سقف مضمون.
- قياس التخزين/التحميل/egress/processing/functions/ads/call usage.
- quotas/alerts/circuit breakers/protect mode، مع إبقاء النص والسلامة الأساسيين.
- تحقق من SKU والمنطقة وbucket والفوترة الفعلية قبل أي التزام مالي. لا تفعيل Billing أو Blaze ضمن هذا المسار دون موافقة منفصلة.

### J. الحوكمة القانونية والعقود والسجلات
- فهرسة كل دستور/رؤية/قرار/ميثاق/سياسة/اتفاقية/نموذج/ملحق.
- تثبيت سلطة المرجع، معرف لكل قرار، مصدر موافقة وتاريخ، قيمة حالية، حالة تنفيذ، owner وevidence.
- حفظ النماذج الأصلية وعدم صهر العقود المختلفة؛ كل عقد حسب العلاقة والغرض.
- التحقق من كيان الشركة والبيانات والعناوين وحقوق العلامة والأصول؛ لا اختراع حقائق.
- تدقيق النسخ والبصمات والتوقيع المتبادل والتفويض والإشعار والأرشفة والإنهاء وتسوية الحقوق.
- فصل المسودة التقنية عن الرأي القانوني؛ مراجعة محامٍ مختص بكل ولاية قضائية قبل النفاذ.

## 5. مراحل التنفيذ الإجرائية وبوابات الانتقال

### المرحلة 0 — تجميد خط الأساس وجرد شامل
المخرجات:
- تثبيت SHA مرجعي واحد، قائمة الفروع/PRs/commits، workflow runs، artifacts، وحالة كل بند.
- جرد ملفات الكود والاختبارات والواجهات والقواعد والفهارس والوظائف والـ schemas.
- جرد الوثائق القانونية والحوكمية والمصادر المكررة والمتعارضة.
- تسجيل التغييرات الفريدة والتغييرات المتكررة والملفات عالية التعارض.
بوابة الخروج: لا فرع أو PR ذي صلة مجهول؛ لكل تغيير disposition: port / duplicate / obsolete / blocked / retain-history.

### المرحلة 1 — توحيد السلطة والقرارات والوثائق
المخرجات:
- مصفوفة أولوية الوثائق وسجل قرارات واحد.
- توحيد 30d/7d/4h retention.
- تثبيت سياسات الأسعار والعمولات والمكافآت دون اختراع قيم.
- سجل تعارضات قانونية/تجارية مفتوحة ومسؤوليتها.
- ربط كل قرار بمتطلب تقني واختبار.
بوابة الخروج: لا تعارض مؤثر غير مسجل، ولا صياغة مقترحة تعرض كقرار.

### المرحلة 2 — إنشاء فرع تكامل اقتصادي مضبوط
المخرجات:
- فرع تكامل واحد من SHA التطوير المثبت.
- نقل تغييرات PR #35 أولاً بعد CI، ثم تغييرات PR #30 في وحدات صغيرة.
- نقل التغييرات الفريدة من PR #22/#31/#24/#28 وغيرها انتقائياً وفق الاعتماديات.
- الحفاظ على branch protection وCI build/test only؛ لا deploy.
بوابة الخروج: تاريخ واضح، لا cherry-pick مكرر، لا تعارضات غير محلولة، وكل دفعة لها commit واختبار.

### المرحلة 3 — محرك المحفظة والمدفوعات
المخرجات:
- ledger invariants وcoin requests/manual approval/replay.
- store purchase, grants, gifts, renewals, expiry.
- read-only reconciliation.
بوابة الخروج: اختبارات concurrency/replay/rollback/insufficient balance/suspended state، ونتائج تطابق السجلات.

### المرحلة 4 — المكافآت والإعلانات
المخرجات:
- email reward and eligible reward lifecycle.
- timed-ad vs featured-ad separation.
- featured campaign finance, budget reservations, serving/reward evidence.
بوابة الخروج: owner/member flows مكتملة، كل event exactly-once، tests على حالات الإلغاء والسحب والميزانية.

### المرحلة 5 — المكالمات والغرف والإيجارات
المخرجات:
- entitlement gating for every participant.
- trusted metering and settlement.
- group-call architecture P0 remediation.
- rental/RSVP/cancellation finance reconciliation.
بوابة الخروج: لا خصم قبل media evidence وconsent، ولا partial inconsistent settlement، وgroup-call charging stays disabled until independently accepted.

### المرحلة 6 — الوسائط والتكلفة والحماية
المخرجات:
- Media Saver full lifecycle.
- retention/delete proof.
- cost meter, quotas, alerts, protect mode.
بوابة الخروج: اختبار deletion/retry/restore، وتحقق من cost thresholds دون إيقاف النص والسلامة.

### المرحلة 7 — ربط الواجهات وتجربة المالك والعضو
المخرجات:
- Flutter owner/member screens linked to authoritative callables/streams.
- clear pending/success/failure/refund/expiry states.
- accessibility, RTL, offline/error handling.
بوابة الخروج: لا UI وهمي ولا local financial mutation، واختبارات واجهات/مسارات مستخدم.

### المرحلة 8 — التحقق المحلي/CI المتدرج
التنفيذ عبر بيئة GitHub Actions/Emulator المصرح بها:
1. format/analyze/lint/typecheck.
2. Functions compile + unit tests.
3. targeted Firestore/Storage emulator tests.
4. domain integration regression.
5. Flutter analyze + widget tests + Web release build.
6. security/rules/dependency/secrets/config checks.
7. complete Validate workflow on exact SHA.
8. repeat failed suites after fix; no green result from another SHA counts.
بوابة الخروج: كل الوظائف المطلوبة خضراء على SHA واحد محدد، مع artifacts/logs محفوظة.

### المرحلة 9 — اختبار المختبر والقبول
- تشغيل مختبر 5,000 شخصية من مستودعه المنفصل وعلى SHA مثبت بعد نجاح CI.
- لا يُعاد تشغيل حمل مكلف إلا بعد مراجعة سبب الفشل وتفويض/إذن التشغيل المناسب.
- إثبات 5,000/5,000 أو تسجيل عجز واضح ومعالجته.
- قبول الأجهزة الحقيقية وnon-production وsecurity/privacy/legal review.
بوابة الخروج: تقرير قابل لإعادة الإنتاج، لا مجرد status أخضر.

### المرحلة 10 — قرار إغلاق المرحلة
- تحديث الدستور والرؤية وسجل القرارات والتتبع والفهرس وقائمة الإصدار.
- كل بند يملك implementation reference, test, exact SHA, evidence, owner disposition.
- مراجعة نهائية للتعارضات والثغرات والمخاطر المتبقية.
- إغلاق PRs المكررة بعد حفظ التغييرات الفريدة.
- الإغلاق الهندسي لا يساوي إذن الدمج إلى main أو النشر أو تفعيل billing؛ تلك موافقات منفصلة.

## 6. بروتوكول فحص كل دفعة كود

لكل فرع/commit:
1. compare base/head وتحديد merge-base وحجم التفرع.
2. فحص الملفات المتغيرة وتصنيفها (backend/client/rules/index/workflow/docs/schema).
3. قراءة diff كاملة للملفات الحرجة: `functions/src/index.ts`, ledger/payment/store/call/media modules, Firestore/Storage rules, indexes, Flutter screens.
4. تحديد العقود والواجهات والحقول والـ collections ومخططات البيانات المتأثرة.
5. كشف duplicate callable names, divergent schemas, hardcoded prices, client-trusted fields, missing auth, replay/race conditions, stale indexes, cleanup omissions.
6. مراجعة الاختبارات: ما الذي تثبته وما الذي لا تثبته؛ إضافة اختبار regression قبل إصلاح الخلل.
7. نقل التغيير إلى فرع التكامل بcommit محدود، ثم تشغيل suite المتأثرة.
8. توثيق القرار والنتيجة والـ SHA والـ run ID قبل الانتقال إلى الدفعة التالية.

## 7. نموذج حالة موحد لكل بند

كل بند يأخذ حالة واحدة فقط:
- NOT_INVENTORIED
- INVENTORIED
- BLOCKED_BY_POLICY
- READY_TO_PORT
- PORTED_UNVERIFIED
- VERIFIED_ON_SHA
- DEVICE_OR_NONPROD_ACCEPTED
- RELEASE_APPROVED

لا ترفع الحالة دون evidence. تسجل أيضاً: decision ID, source branch/PR/commit, target commit, files, dependencies, tests, run IDs, unresolved risks, owner approval.

## 8. أول دفعة تنفيذية

الترتيب الأولي:
1. مراجعة exact-head CI لPR #35 و#38، ثم معالجة كل فشل قبل النقل.
2. تحليل PR #30 ملفاً بملف ونقل manual payment/wallet replay فقط مع اختبارات emulator.
3. تحليل PR #31 و#22 معاً لاستخراج التغييرات الفريدة وتحديد تداخلها، خاصة `functions/src/index.ts` وpricing/rewards/call/group-call.
4. مراجعة PR #24 مع PR #31 لتوحيد featured-ad finance وعدم ازدواج الأحداث/ledger.
5. مراجعة PR #28 باعتباره فرع تجميعي لا مصدراً موثوقاً للدمج الشامل.
6. بعد ذلك مراجعة PR #25/#26/#27 والامتدادات الأخرى التي تؤثر على media, test coverage, profiles/email.
7. تنفيذ integration matrix وCI exact-head بعد كل دفعة.

## 9. قيود القدرة والاختبارات

- GitHub connector يستطيع قراءة الفروع والملفات والـ PRs والـ diffs والـ workflow logs/artifacts، وإجراء تغييرات موثقة في الفروع وإنشاء commits وPRs وتشغيل workflows إذا كان الإذن والـ workflow يدعمان ذلك.
- GitHub Actions/Emulator هو مسار الاختبار المحلي المعزول المتاح داخل CI؛ لا يُدّعى تشغيل emulator على جهاز المستخدم أو اختبار أجهزة حقيقية من GitHub.
- لا يمكن من هذا المسار إثبات إعدادات Firebase Console الحية أو billing/SKU أو أداء جهاز Android فعلي دون قبول منفصل/دليل من البيئة المعنية.
- لا تُطلب من المستخدم أوامر Termux إلا إذا ثبت أن هناك خطوة لا يمكن تنفيذها من GitHub connector أو CI.
- لا تجرى عمليات تشغيل 5,000 أو إعادة تشغيل باهظة لمجرد إعادة المحاولة؛ يلزم تحليل السبب أولاً.

## 10. سجل الحالة الأولي

- تم إنشاء فرع التكامل المعزول من SHA `8a1c8d0b93ed43570c523ab2d8c2598648ddac0e`.
- تم التحقق من وجود الفروع الاقتصادية/الحوكمية الرئيسية المذكورة أعلاه ومقارنة رؤوسها بفرع التطوير.
- تبين أن معظم الفروع القديمة متشعبة بدرجات كبيرة، لذلك لا تصلح للدمج المباشر.
- PR #35 و#38 متقدمان فقط على فرع التطوير الحالي دون commits خلفية حسب مقارنة GitHub، لكنهما ما زالا Draft ويحتاجان exact-head CI ناجحاً.
- لا يُعلن اكتمال أي بند من هذه الخطة في هذه النسخة.


## 11. تنفيذ التدقيق الأولي ونتائج الاختبار — 19 نوفمبر 2026

### 11.1 نجاح مثبت في مختبر 5,000 شخصية

- Workflow run: `44476167496` — [تشغيل المحاكاة](https://github.com/productionhome2022-hash/mawdda-5000-simulation-lab/actions/runs/44476167496).
- Lab branch SHA: `fdc25b2893b832ec34de6ab2eb10cab73e3d764e`.
- Exact platform source SHA checked out by the lab: `63916ade25d9c6d5db640204637053042415fa06` (commit subject: return server catalog version from transactional publish).
- Result: 8/8 test cases passed; `completedRows=5000`; all 13 reported lifecycle counters reached 5000.
- Covered stages: premium entitlement provisioning, store purchase, receipt/ledger verification, greeting and pinned section, peer profile view, profile analytics, discovery, boosted discovery, block/unblock, push-token lifecycle, room join, event listing, event RSVP.
- A machine-readable report artifact was uploaded: `mawdda-5000-simulation-44476167496`, artifact ID `14507784453`, SHA-256 `dc8292bd38b0c273c5eca28c6200d97058ab98ba6f667e52621c8a33b3cecf8c`.
- **Scope limitation:** this run does not establish 5,000-persona call billing, group-call media, Media Saver/local downloads, full media scanner throughput, manual payment, featured-ad financial settlement, or every economic lifecycle. It is a successful 5,000-persona member/store/profile/discovery/room/event scenario only. It does not close the economic phase.

### 11.2 Exact-head CI findings on PR #35

- Exact tested head before fixture repair: `9d0cadc4b460b0b540a56503846977593f7994b7`.
- Domain regression run `44476789499`: success.
- Full Validate run `44476789455`: failure.
- Passed on that run: Functions compile/unit suite; media authorization; retention (including 30-day important text); direct-message deletion; owner grants; wallet/store transactional integration; room rental; room events; call signaling; FCM; biometric reward-cycle boundary; attendance/timed-ad rewards; email renewal; safety/appeals; privacy; test personas; owner audit export; legal holds; avatar/cover; message legal holds; Firestore/Storage rules; Flutter analysis/tests/Web build; scanner image/security tests.
- Failed suites:
  1. `featured-ad-finance.integration.test.js`: replay rejected because the immutable financial version/event/audit evidence comparison failed with `failed-precondition`.
  2. `premium-profile.integration.test.js`: direct test fixtures seeded store catalog entries without the server-required positive catalog `version`, so purchases correctly failed closed.
- Fixture correction committed on PR #35 branch: `b93279acbea5b5cd72b88fa5923f3ffeae0cac49`; it adds explicit version 1 to directly seeded catalog test fixtures. Exact-head reruns `44494473904` (Validate) and `44494473967` (domain regression) were started and must be read to completion before acceptance.

### 11.3 Exact-head CI findings on PR #38

- Exact tested head before fixture repair: `297e456fd68814886cbcf53b6a3b645a91d54608`.
- Full Validate run `44477211137`: failure. Flutter analysis/tests/Web build, backend compile/unit tests, media scanner and rules tests passed; the same featured-ad finance replay mismatch and premium-profile catalog fixture version omission failed.
- Domain regression run `44477211283`: failure. Retention, room reservation/cancellation, owner grant and Flutter widget suites passed; specialized role-capacity integration failed because its Admin Media fixture used the unsupported permission `advertising.requests.view_all` rather than the canonical allowed `advertising.requests.review`. The concurrency test then observed zero successful assignments because the same invalid fixture was rejected.
- Corrections committed on PR #38 branch: `5f9fded3a3cc298b2201ea5f575c55f20100c87a` (catalog version fixture) and `8175a8aaa7fcf9e6275d9c934eb6a3541037f3f7` (canonical Admin Media permission).
- Exact-head reruns `44494510348` (Validate) and `44494510469` (domain regression) were started; acceptance is pending their final results.

### 11.4 Cross-branch source audit findings

- PR #31 and PR #22 both modify the same high-conflict economic surfaces: `functions/src/index.ts`, coin purchase requests, engagement rewards, call signaling, store/catalog and Flutter economy/profile screens. PR #31 also adds the broader economic payment policy, featured-ad finance, group-call economy and read-only wallet reconciliation. PR #22 contains distinct call/phase closeout audits, gifting, profile projection and additional UI. They must be reconciled together by symbols and data contracts, not merged as whole branches.
- PR #24 overlaps PR #31 on featured-ad finance/rewards, `index.ts`, `media.ts`, `media-scanner.ts`, quotas, Firestore indexes, sticker systems and Flutter featured-ad screens. Treat PR #24 as a source for media/featured-ad/sticker deltas only after semantic comparison with PR #31.
- PR #28 is a 105-file recovery aggregation touching economy, media, ads, stickers, gifting, scanner, indexes, package manifests and many Flutter screens. It is not a safe merge unit; use it as a reference map and extract only independently verified unique changes.
- PR #25 is based on a much older source line (over 2,000 commits behind current development in the comparison). Review only unique media-security hardening; do not rebase/merge its whole branch.
- PR #26 and #27 are likewise old-line deltas. Extract safe test-center fixtures/scripts and email/profile behavior only after checking current coverage and anti-abuse semantics.
- Existing role-capacity code is separate governance work; its five-seat checks must not be conflated with economic entitlements or general owner permissions.

### 11.5 Newly confirmed blocking details

1. **Featured-ad finance replay mismatch:** still unresolved. Preserve fail-closed behavior. Before changing production logic, add targeted diagnostic assertions for the immutable event, version snapshot and audit row fields; identify the exact mismatching field; then fix the canonical write/read contract and test missing-row, tampered-row, replay, multi-receipt and concurrency paths.
2. **Group-call economy is P0 blocked:** PR #31's own engineering audit confirms no trusted provider-side media proof, incomplete participant-to-participant topology, no SFU for unrestricted audio scale, no complete entitlement check for every participant, no trusted per-participant media intervals, no all-participant reservation/settlement, and incomplete video layout acceptance. Keep group-call charging disabled.
3. **Media Saver is not end-to-end complete:** entitlement/store infrastructure does not prove secure local-save workflows, per-save server authorization, expiry handling, local platform permissions and no-retention-extension semantics.
4. **Manual payment remains owner-attested only:** member claim/receipt is not proof and must never credit coins; owner approval and replay-safe financial ledger are required. Automated checkout stays disabled.
5. **Governance/legal records remain draft:** the unified constitution and contract register explicitly do not constitute signed agreements or legal advice. The next legal audit must verify source versions, signatory authority, legal entity data, jurisdiction, privacy/retention disclosures, electronic signature, contract version/hash and records retention; no missing legal fact may be invented.

### 11.6 Immediate next actions

1. Complete the in-progress exact-head reruns for PR #35 and #38; inspect job logs and confirm the two known fixture failures are gone.
2. Diagnose the featured-ad replay mismatch with field-level test assertions and correct the canonical event/version/audit contract.
3. Re-run the featured-ad integration suite and the full Validate workflow on the resulting exact SHA.
4. Reconcile PR #30 manual-payment/wallet replay deltas against current development in small commits.
5. Review PR #31 and #22 together by function and schema, beginning with wallet reconciliation, pricing/payment policy, gifting and rewards; isolate group-call P0 work as a separately gated substream.
6. Review PR #24 featured-ad/media/sticker changes against the same symbols in PR #31; do not merge duplicate modules or duplicate callable names.
7. Perform the legal/governance source audit and create a document-to-decision-to-implementation register without replacing original agreements.
8. Only after source integration stabilizes, run the full exact-head Validate, then the appropriately scoped 5,000-persona scenarios and device/non-production acceptance.


### 11.7 PR #30 manual-payment source comparison

A direct source comparison of all seven non-document PR #30 files against the current official development branch found:
- `functions/src/coin-purchase-requests.ts` on PR #30 hardcodes EUR and omits currency exponent support. The current official development version already supports validated ISO currencies and minor-unit exponents; do not port the EUR-only version over it.
- `functions/test/integration/owner-entitlement-grants.integration.test.js` and `room-rental.integration.test.js` are byte-identical to the current development files; no code port is needed from these files.
- PR #30's wallet/store integration test is an older, shorter fixture set. Current development has additional owner-configured pricing, no-default-price fail-closed tests, payment policy versioning and wallet reconciliation coverage. Port only genuinely unique cases after comparing their assertions.
- PR #30's Flutter member/owner coin purchase screens are older and hardcode EUR; current development screens already use owner-configured currency and exponent data. Do not replace current screens with those older versions.
- The PR #30 branch remains useful as a source reference for manual payment workflow/replay semantics, but its currency implementation is stale relative to current development. No PR #30 source was merged or copied in this audit.

### 11.8 Featured-ad replay root cause and correction

The exact-head integration failure was traced to a schema mismatch in `recordFeaturedAdFinancialEvent`: the immutable event document stored the input event and metadata, but omitted the resulting financial snapshot fields (`receivedMinor`, `refundedMinor`, `reconciledMinor`, `reviewStatus`, `paymentStatus`). The replay validator compared those fields from the version snapshot against the prior event document, so a legitimate replay failed closed with `failed-precondition`.

Correction applied on both current PR branches:
- Add the derived `...next` financial snapshot to the immutable event document.
- Add integration assertions that the event contains the resulting snapshot values.
- PR #35 commits: `c9d0f68aa11c59a4fe9e20b6129d65f0b23c9965` and `6fb0091d2d8e59e48e58fbf7ce6d414e87e2d8f2`.
- PR #38 commits: `aae62fc3a63398ebfeeaef652b651993013f3500` and `1fd56b4e967072aa322f5791d8c35ea995479d35`.
- Exact-head Validate and domain regression workflows were started for the corrected heads; their final conclusions must be inspected before marking the defect resolved.

### 11.9 Role-capacity test fixture correction

The first PR #38 domain regression failed because the test fixture supplied `advertising.requests.view_all`, which is not in the canonical permission allowlist. The accepted Admin Media permission is `advertising.requests.review`. The invalid fixture also caused the concurrency case to observe no successful assignment. The fixture was corrected and the subsequent domain regression on SHA `8175a8aaa7fcf9e6275d9c934eb6a3541037f3f7` passed; a later exact-head run on SHA `1fd56b4e967072aa322f5791d8c35ea995479d35` is in progress. This validates the tested five-seat role path only, not the full Admin N permanent-number lifecycle.


### 11.10 Store catalogue defaults and duration-policy gap

Source inspection of the official development branch found two issues that must be reconciled before the commercial engine is accepted:

1. `functions/src/default-store-catalog.ts` contains hardcoded positive `priceCoins` values (for example VIP, titles, badges, frames and boosts). `getOwnerStoreCatalog` seeds these values into Firestore as initial editable suggestions while leaving `purchaseEnabled: false`. This is fail-closed against charging, but it still persists and projects sample prices into the owner/member catalogue. The approved economic policy requires owner-set prices and no default commercial pricing. Decide the safe migration: remove sample price values or store them as explicitly non-commercial suggestions that cannot be displayed as payable prices; never activate them automatically.
2. `functions/src/store-catalog.ts` accepts any integer `durationDays` from 1 to 3650. The owner-approved commercial durations are 24 hours, 7 days, 30 days (one month under the current commercial term), plus permanent items where permitted. The owner editor and server validator need a shared duration enum/SKU contract; arbitrary day counts must not silently become purchasable.
3. Call SKUs and privacy add-ons appear in the default catalogue but are not in the current fulfillment-ready allowlist. They must remain non-purchasable until entitlement consumers and lifecycle tests exist; a catalogue row is not proof of a product.

No production or user data was changed. This is a source-audit finding to be addressed in a dedicated migration-safe code/test batch after the current exact-head CI gate.


## شرط الفحص المرحلي الشامل — اعتماد المالك ECON-PHASE-003

تُعد بوابات الفحص والإغلاق الواردة في `ECONOMIC_PHASE_EXECUTION_CHECKLIST_AND_STAGE_CLOSURE_2026-11-19.md` شرطاً حاكماً لهذه الخطة. لا يجوز الانتقال بين المراحل الأربع عشرة دون إغلاق موثق للمرحلة السابقة بعد مراجعة عميقة وتشغيل جميع الاختبارات والفحوصات المتاحة والملائمة في GitHub وبيئات الاختبار. يجب معالجة الثغرات والعيوب الحرجة والعالية وإعادة الاختبارات على SHA نهائي ثابت. الفحص غير المتاح أو غير المنطبق يوثق مع السبب ولا يدعى نجاحه. بوابة المرحلة 0 تأسيسية وليست مرحلة إضافية ضمن المراحل الأربع عشرة.


### 11.11 Manual coin-purchase port — currency-contract incompatibility

A fresh source comparison between PR #30 (`codex/economy-official-port-2026-11-18`, head `d5db16e3700abafa95ea5f114bfbe3c0be8c3b7c`) and its current official-development base identified a contract mismatch in `functions/src/coin-purchase-requests.ts`:

- The official-development base imports `currencyExponentForCode` from `./economy-pricing`, while the PR #30 version does not.
- The PR #30 instruction validator fixes the currency contract to `EUR`; the current base is integrated with the central currency-pricing abstraction.
- Therefore, porting the PR #30 file wholesale would regress the current currency contract and could make manual coin-purchase instructions inconsistent with owner-configured currency settings.

**Required treatment:** retain the PR #30 state-machine and replay-hardening changes only after a semantic port onto the current currency abstraction. Keep the currency code and minor-unit validation derived from the central pricing contract; do not add EUR as a new platform-wide assumption. Add tests for the configured currency exponent, malformed/unsupported currency, and immutable instruction-version replay before accepting the port.

**Status:** OPEN — source-level incompatibility confirmed by comparing the two branch versions; no code was changed in PR #30 or the official development branch, and no payment behavior was activated.
