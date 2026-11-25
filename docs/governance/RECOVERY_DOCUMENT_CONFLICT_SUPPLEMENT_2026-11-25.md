# ملحق مصالحة وثائق Recovery داخل Full Platform — 2026-11-25

**توجيه المالك:** جميع وثائق Mawdda والحوكمة والعقود والقرارات والسجلات والفهارس وتقارير التدقيق والأدلة الفريدة يجب أن تكون داخل جسم `codex/mawda-full-platform-implementation`. هذا التوجيه الأحدث يحسم أي صياغة سابقة جعلت Recovery الوجهة النهائية للوثائق.

## نطاق المقارنة المثبتة

- المستودع: `productionhome2022-hash/mawda-platform`.
- Full Platform عند المقارنة: `cfaa74f834711d70ff985fbf8b5e9019e5a439dd`.
- Recovery عند المقارنة: `49b502638718e4dbb29a9429f392b3a70c8d6d95`.
- تمت مقارنة recursive Git trees كاملة، وكانت كلتا الشجرتين غير مبتورتين.
- ملفات Recovery تحت `docs/`: **2,471**.
- ملفات Full Platform تحت `docs/`: **2,581**.
- مسارات وثائق Recovery غير الموجودة في Full Platform: **0**.
- مسارات وثائق Recovery المتطابقة في المسار وBlob SHA: **2,458**.
- المسارات الوثائقية المشتركة ذات المحتوى المختلف: **13**.
- من النسخ المختلفة، كانت **10** محفوظة مسبقاً دون overwrite في `docs/_archive/recovery-conflict-snapshots-2026-11-24/`.
- كانت **3** نسخ مختلفة غير محفوظة في أرشيف التعارض؛ حُفظت الآن كـsnapshots مطابقة للـBlob SHA المصدر في `docs/_archive/recovery-conflict-snapshots-2026-11-25/`.

## النسخ الثلاث المحفوظة الآن

| المسار الأصلي في Recovery | Blob SHA المصدر | المسار الأرشيفي داخل Full Platform |
|---|---|---|
| `docs/ECONOMIC_PHASE_COMPLETE_AUDIT_2026-11-18.md` | `0e58764259e5bc28200e8ddafbe377ee31ba95f8` | `docs/_archive/recovery-conflict-snapshots-2026-11-25/ECONOMIC_PHASE_COMPLETE_AUDIT_2026-11-18.md` |
| `docs/IMPLEMENTATION_TRACEABILITY.md` | `ca99f305745e0a8ef035616737e85a3d93761949` | `docs/_archive/recovery-conflict-snapshots-2026-11-25/IMPLEMENTATION_TRACEABILITY.md` |
| `docs/phase1/BIOMETRIC_FINAL_OWNER_POLICY_2026-11-20.md` | `6b6aaf8e372233f97d6e2a98fbddd7fdc44d9d0c` | `docs/_archive/recovery-conflict-snapshots-2026-11-25/BIOMETRIC_FINAL_OWNER_POLICY_2026-11-20.md` |

النسخ المعتمدة الموجودة أصلاً في مساراتها داخل Full Platform لم تُستبدل. حُفظت نسخ Recovery المتعارضة كأدلة تاريخية منفصلة فقط، ولا تُعد تلقائياً سياسة نافذة أو قراراً أحدث.

## حدود المقارنة خارج الوثائق

على مستوى كامل الشجرة، لا توجد مسارات Recovery مفقودة من Full Platform أيضاً. توجد **85** مسارات مشتركة مختلفة المحتوى: **13 وثائق** و**72 مساراً غير وثائقي** تشمل Workflows وملفات Functions والاختبارات والواجهات. لم تُنسخ هذه الاختلافات البرمجية أو التشغيلية تلقائياً؛ تبقى خاضعة للمراجعة الدلالية والأمنية والاختبارات قبل أي نقل.

## القرار التنفيذي

1. Full Platform هو الوجهة الوحيدة لكل الوثائق والسجلات والفهارس والحوكمة والأدلة.
2. Recovery مصدر مقارنة ونسب تاريخي أثناء المصالحة، وليس الوجهة النهائية لتجميع الوثائق.
3. لا يُستبدل مستند متعارض دون مقارنة دلالية وقرار موثق؛ تحفظ النسخ المصدرية في الأرشيف مع SHA المصدر.
4. سجل النقل الزمني `docs/governance/RECOVERY_DOCUMENT_MIGRATION_CHRONOLOGY_2026-11-24.csv` أُضيفت إليه ثلاثة صفوف تكميلية لرأس Recovery الحالي `49b502638718e4dbb29a9429f392b3a70c8d6d95`.
5. هذا التدقيق يثبت اكتمال احتواء المسارات الوثائقية، ولا يثبت أن كل وثيقة خضعت لمراجعة دلالية أو أن كل قرار تاريخي لا يزال نافذاً.
6. لم يُحذف Recovery أو أي فرع، ولم يُجرَ دمج إلى `main` أو نشر أو تعديل إنتاجي.


## إعادة تحقق بعد تحديث قرار المالك — 2026-11-25

بعد حفظ هذا الملحق والتوجيه الحاكم في Full Platform، أُعيدت المقارنة على Full Platform `9a7da550d358d350016d2f27a8925d2bae83d48e` مقابل Recovery `49b502638718e4dbb29a9429f392b3a70c8d6d95`:

- مسارات Recovery الوثائقية: 2,471؛ المسارات غير الموجودة في Full: صفر.
- المسارات الوثائقية المتطابقة في Blob SHA: 2,457.
- اختلافات المحتوى الوثائقية: 14؛ 13 نسخة مصدرية محفوظة في أرشيفي 2026-11-24 و2026-11-25، والنسخة الرابعة عشرة هي النص السابق لخطة `FULL_PLATFORM_CANONICAL_BODY_AND_BRANCH_CLEANUP_PLAN_2026-11-24.md` قبل إضافة توجيه المالك الجديد. حُفظت نسخة Recovery كما هي في `docs/_archive/recovery-conflict-snapshots-2026-11-25/FULL_PLATFORM_CANONICAL_BODY_AND_BRANCH_CLEANUP_PLAN_2026-11-24.md`.
- اختلافات المحتوى غير الوثائقية: 72؛ لم تُنقل تلقائياً.
- أُضيف صف رابع إلى سجل النقل الزمني برأس Recovery نفسه وBlob SHA الأصلي.

هذا الاختلاف الرابع ناتج عن تحديث متعمد للوثيقة الحاكمة داخل Full Platform، وليس عن فقدان وثيقة من Recovery. يظل النص القديم محفوظاً للأثر التاريخي، بينما يُطبق ملحق المالك الأحدث في نسخة Full.
