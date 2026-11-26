# المرحلة الرابعة — جرد الفروع والتحقق من نقاط المقارنة

التاريخ: 2026-11-26  
المستودع: `productionhome2022-hash/mawda-platform`  
الشجرة الوحيدة: `codex/mawda-full-platform-implementation`  
المرجع الحاكم: `FULL_PLATFORM_SINGLE_CANONICAL_TREE_RULE_2026-11-26.md`  
سياسة المطابقة: `FULL_PLATFORM_BRANCH_UNIFICATION_POLICY_2026-11-26.md`

## 1. إعادة التحقق من العدد

تم جلب قائمة الفروع الحالية من GitHub API للمستودع الأساسي:
- إجمالي الفروع: 35
- فروع `codex/*`: 34
- Full Platform المعتمد: فرع واحد
- الفروع التاريخية الأخرى المدرجة في سياسة التوحيد: 33
- فرع `main`: موجود ضمن إجمالي الفروع وليس ضمن فروع codex التاريخية.

إذن جرد الـ33 التاريخية في السياسة يتطابق مع قائمة الفروع الحالية عند استبعاد Full Platform.

## 2. نتائج compare refs — فحص بنيوي فقط

تمت مقارنة كل فرع تاريخي مع Full Platform عبر GitHub compare endpoint. هذه النتائج تقيس علاقة التاريخ والملفات المتغيرة، ولا تحسم وحدها التفرد الدلالي أو النقل أو قابلية الحذف.

| الفرع التاريخي | الحالة | ahead | behind | ملفات المقارنة |
|---|---:|---:|---:|---:|
| biometric-server-lifecycle-2026-11-20 | diverged | 73 | 993 | 23 |
| canonical-role-terminology-owner-confirmation-2026-11-19 | diverged | 5 | 1251 | 4 |
| economic-phase1-closeout-2026-11-18 | diverged | 124 | 1343 | 34 |
| economic-phase-completion-2026-11-18 | diverged | 181 | 1343 | 45 |
| economic-phase-controlled-integration-2026-11-19 | diverged | 21 | 1251 | 8 |
| economy-official-port-2026-11-18 | diverged | 20 | 1343 | 9 |
| featured-ads-secure-lifecycle-20261118 | diverged | 199 | 1344 | 58 |
| featured-ads-serving-foundation | diverged | 139 | 1343 | 31 |
| governance-biometric-integration-2026-11-19 | diverged | 89 | 1340 | 39 |
| mawda-unified-constitution-vision-2026-11-19 | diverged | 142 | 1251 | 64 |
| mawdda-biometric-proof-gate-2026-11-20 | diverged | 12 | 1035 | 9 |
| mawdda-cleanup-report-20261125T163333Z | no common ancestor / compare 404 | — | — | — |
| mawdda-deep-governance-audit-2026-11-19 | diverged | 10 | 1251 | 1 |
| mawdda-economy-selective-port-2026-11-19 | diverged | 10 | 1167 | 9 |
| mawdda-group-call-capacity-2026-11-20-r2 | diverged | 5 | 1033 | 4 |
| mawdda-group-call-capacity-2026-11-20 | diverged | 6 | 1035 | 4 |
| mawdda-independent-verification-cycles-2026-11-20 | diverged | 12 | 1033 | 9 |
| mawdda-independent-verification-cycles-dev-2026-11-20 | diverged | 11 | 1111 | 9 |
| mawdda-retention-approval-ci-repair-2026-11-19 | diverged | 17 | 1251 | 10 |
| mawdda-role-capacity-after-retention-2026-11-19 | diverged | 22 | 1251 | 12 |
| mawdda-role-capacity-consolidation-2026-11-19 | diverged | 6 | 1251 | 6 |
| mawdda-role-capacity-final-2026-11-19 | diverged | 40 | 1251 | 16 |
| mawdda-step1-role-reconcile-2026-11-19 | diverged | 32 | 1251 | 18 |
| mawdda-super-owner-biometric-state-machine-2026-11-20 | diverged | 6 | 1032 | 4 |
| phase1-ci-coverage-role-store-2026-11-20 | diverged | 1 | 1076 | 1 |
| phase1-direct-call-transaction-revalidation-2026-11-20 | diverged | 5 | 1060 | 3 |
| phase1-featured-ad-geography-all-arab-2026-11-20 | diverged | 2 | 1053 | 2 |
| phase1-media-direct-delivery-denials-2026-11-20 | diverged | 3 | 1042 | 2 |
| phase1-media-hold-delete-race-2026-11-20 | diverged | 7 | 1054 | 3 |
| phase1-rented-room-call-gate-2026-11-20 | diverged | 6 | 1076 | 4 |
| phase1-scanner-error-callback-test-2026-11-20 | diverged | 12 | 1076 | 2 |
| phase1-store-gift-concurrency-2026-11-20 | diverged | 2 | 1076 | 2 |
| structural-governance-biometric-roles-2026-11-19 | diverged | 79 | 1343 | 35 |

الأسماء في الجدول تسبقها بادئة `codex/` كما في سياسة الجرد.

## 3. الاستنتاجات والقيود

1. 32 فرعاً أعادت مقارنة بنيوية بحالة diverged؛ وهذا لا يعني أن تغييراتها الـahead كلها فريدة أو غير منقولة.
2. فرع `codex/mawdda-cleanup-report-20261125T163333Z` أعاد خطأ 404 برسالة عدم وجود common ancestor. لم يصنف على أنه مكرر أو غير مهم؛ يحتاج تحقيقاً مستقلاً بمقارنة الأشجار والملفات والتاريخ.
3. لا يجوز استخدام أرقام ahead أو عدد الملفات كقرار نقل أو حذف.
4. لم تُنجز بعد المطابقة الدلالية لكل ملف وتغيير في الفروع الـ33. تبقى جميعها محفوظة.
5. لا توجد في هذه المرحلة موافقة على حذف أي فرع. الحذف إجراء مستقل بعد اكتمال الأدلة وموافقة المالك الصريحة.

## 4. تصحيح توثيقي للمرحلة السابقة

تم تحديث تقرير المرحلة الثالثة لتوضيح أن `testPricingSnapshot` لقطة تطوير `test_only`، وأن مسارات الموافقة المستقبلية تقرأ حقلاً آخر. لا يجوز توحيد الحقلين لأن ذلك سيحوّل معاينة سعر تجريبية إلى دلالة موافقة مالية غير معتمدة. بوابة التحصيل ما زالت مغلقة.

## 5. ما تم وما لم يتم

- تم: جلب قائمة الفروع الحالية؛ تأكيد 33 فرعاً تاريخياً خارج Full Platform؛ تنفيذ compare بنيوي للفروع الـ33؛ توثيق نتيجة كل مقارنة؛ تحديث توضيح المرحلة الثالثة.
- لم يتم: تصنيف كل تغيير دلالياً؛ نقل دفعة كود من الفروع التاريخية في هذه المرحلة؛ تشغيل اختبارات أو Actions؛ حذف فروع.
- لم يحدث: دمج إلى main، نشر، تعديل Firebase الإنتاجي، تشغيل فوترة أو تحصيل، مساس بمختبر 5000 شخصية.

## 6. التنفيذ التالي داخل Full Platform

1. معالجة الفرع الذي لا يملك common ancestor عبر فحص tree SHA والملفات وتاريخ الالتزامات دون افتراض النسب.
2. مراجعة diffs الفعلية للدفعات الأعلى أثراً: الاقتصاد/المتجر، المكالمات، الوسائط/الماسح، الأدوار والحوكمة، ثم البيومتري والإعلانات.
3. تصنيف كل تغيير حسب الفئات الخمس في السياسة، ونقل ما يثبت أنه فريد ومطلوب فقط إلى Full Platform.
4. تشغيل الاختبارات الداخلية المناسبة عبر GitHub Actions/بيئة المستودع الأساسي فقط، وتوثيق النتائج.
5. إبقاء جميع الفروع التاريخية حتى إغلاق كل سجل والحصول على موافقة مستقلة للحذف.
