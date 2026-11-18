# المرحلة الاقتصادية الشاملة — تدقيق وإغلاق 2026-11-18

## نطاق المرحلة

هذه المرحلة هي المسار الاقتصادي الموحد للمنصة وتطبيقاتها، وتشمل:

- Beta Coins والمحفظة والتحويلات والعمولات وسجل التدقيق.
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

## Beta Coins

الاسم التجاري الظاهر المعتمد هو **Beta Coins — بيتا كوينز**.

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

تم تنفيذ حماية رصيد Beta Coins خادمياً، وتوحيد اسم Beta Coins في واجهات الملف والإعلانات المميزة، وتثبيت نسبة 60/40 في وثيقة المرحلة، مع عدم دمج main أو لمس الإنتاج.

## New hardening in this execution pass

- Timed-ad reward caps are now enforced server-side for the development environment: maximum 10 rewarded ad claims per member per UTC day, maximum 20 Beta Coins from rewarded ads per member per UTC day, and maximum 3 rewarded claims per member per campaign.
- The daily cap is stored in a dedicated per-member/per-UTC-day counter inside the same transaction as the wallet credit and reward claim, preventing concurrent requests from bypassing the cap.
- Campaign validation rejects a per-member campaign limit above the experimental maximum.

## Source audit findings — call economy and Media Saver (2026-11-18)

### Calls
The current call backend implements authenticated WebRTC signaling, participant locks, rolling 24-hour attempt counters (5 audio / 3 video), and a server-recorded five-minute maximum beginning after connection confirmation. The Flutter call screen invokes signaling/connection functions and displays the five-minute ceiling.

The inspected call lifecycle does **not** yet implement economic entitlement checks, explicit per-party billing consent, a metered connected-duration ledger, atomic Beta Coins debit/refund, or an idempotent call-settlement record. The existing 5/3 quota counts attempts, not billable completed calls. Do not represent it as a free-call entitlement or a paid-call billing system. Multi-party room-call settlement also requires a deliberate policy before implementation.

### Media Saver
The development branch tree inspected in this pass contains no dedicated Media Saver client service/screen or end-to-end local-save workflow. The secure media gateway and entitlement/store infrastructure exist separately, but their presence does not prove local save fulfillment. Keep Media Saver purchase fulfillment disabled until the client-side secure download/save, per-operation server entitlement verification, platform permission handling, and tests are implemented.

### Call UI lifecycle audit
The inspected Flutter call screen reports connection and uses a five-minute display, but it does not show a billing-consent step or billing status. This is a concrete integration gap, not a cosmetic issue. The next call-economy implementation must fail closed when entitlement/consent/settlement state is missing and must not infer consent from accepting a call.
