# المرحلة السابعة — تشخيص وإصلاح فشل GitHub Actions

التاريخ: 2026-11-26  
المستودع: `productionhome2022-hash/mawda-platform`  
الفرع: `codex/mawda-full-platform-implementation`

## 1. حالات Workflow التي تمت مراجعتها

تم فحص سجلات التشغيل الفعلية بدلاً من الاعتماد على حالة commit فقط.

| Workflow run | SHA | النتيجة | السبب |
|---|---|---|---|
| 45831437451 — Mawdda Test Center | `95bfe512...` | failure | اختبار واحد فاشل في media scanner |
| 45831430823 — Validate Mawda | `311f54a9...` | failure | مجموعة Cloud Functions unit نفسها |
| 45831430801 — Mawdda economy regression | `311f54a9...` | failure | مجموعة regression نفسها |
| 45831791043 — Mawdda Test Center | `d2849f10...` | failure | بقيت نسخة fixture القديمة في هذا SHA |
| 45831437436 / 45831430913 وغيرها | SHA سابق | cancelled | إلغاءات نتيجة دفع commits متقاربة مع تفعيل concurrency/cancel-in-progress؛ ليست فشل اختبار بذاتها |

## 2. السبب الجذري المؤكد

الاختبار رقم 253:
`scanner callback validates clean biometric media and defers advertisement purpose authorization to the media contract`

كان fixture الصوت البيومتري ينشئ مشتقاً صوتياً بلا `durationMs`. بعد إصلاح التحقق في المرحلة السادسة، أصبح callback يشترط مدة موثوقة للصوت (حتى 60 ثانية للمرفقات العامة)، ولذلك أعاد `validateScannerVerdict` القيمة `null`. الاختبار كان يحاول قراءة `purpose` من القيمة null، ففشل.

هذا فشل fixture اختبار، وليس دليلاً على عطل في تحصيل أو Firebase إنتاجي.

## 3. الإصلاح المطبق

في `functions/test/media-scanner.test.js`:
- أضيفت مدة صريحة 20,000 ms إلى fixture الصوت البيومتري، بما يتوافق مع حد الصوت البيومتري الخاص.
- أزيل تكرار اختبار حد الصوت الذي كان قد أضيف مرتين.
- بقي اختبار المرفقات الصوتية العامة مستقلاً ويختبر حد 60,000 ms والرفض عند تجاوزه أو فقدانه أو فساد قيمته.

Commit الإصلاح:
`140c8b7cd68343e649340e54f7716f300fbe8a44`

Blob SHA:
`52a389eba94c0c3a1c8e276a0dc62723dba1b83b`

## 4. إعادة التحقق عبر GitHub Actions

أدى دفع الإصلاح إلى إنشاء تشغيلين جديدين على SHA الإصلاح:
- Validate Mawda: run `45832086657`، بدأ التنفيذ.
- Economic phase verification: run `45832086550`، في قائمة الانتظار عند إعداد التقرير.

لم تكن نتائج التشغيل الجديد نهائية وقت إنشاء هذا التقرير. لذلك لا يعلن هذا التقرير نجاح إعادة الاختبار. يجب متابعة run `45832086657` حتى اكتماله وقراءة كل jobs، ثم متابعة الاقتصادي.

## 5. ملاحظة على إلغاءات التشغيل

تظهر إلغاءات متعددة لعمليات push المتقاربة في الزمن. الإلغاء ناتج عن سياسة concurrency في Actions أو استبدال التشغيل الأحدث للأقدم؛ لا يجوز تصنيفها كاختبارات فاشلة. لا ينبغي إعادة تشغيل كل الإلغاءات القديمة عشوائياً؛ المرجع هو أحدث SHA على فرع Full Platform.

## 6. النطاق والسلامة

- لا تغيير في منطق الإنتاج ضمن إصلاح هذا الفشل؛ التغيير في fixture الاختبار فقط.
- لم يتم تعديل Firebase الإنتاجي أو إعدادات الهوية.
- لم يتم تفعيل تحصيل أو دفع أو خدمة مدفوعة.
- لم يحدث دمج إلى main أو نشر.
- لم يُمس مختبر 5000 شخصية.
- لم تُحذف أي فروع.

## 7. الإجراء التالي

1. متابعة Validate Mawda على SHA الإصلاح وقراءة نتائج جميع الوظائف.
2. إذا ظهر فشل جديد، تحديد أول stack trace/ assertion فاشل وإصلاح السبب لا تعطيل الاختبار.
3. متابعة Economic phase verification.
4. إعادة توثيق النتائج النهائية في تقرير متابعة جديد بعد ظهورها.

## 8. متابعة الفشل الثاني والثالث — عقد معالج الصوت

بعد إصلاح fixture البيومتري، أظهر تشغيل `45832086657` في وظيفة Backend integration فشلاً آخر في الاختبار:
`safe audio attachment links and delivers only after its dedicated processor`.

السبب الجذري: fixture في `functions/test/integration/media-callables.integration.test.js` كان يستخدم إصدار المعالج القديم `ffmpeg-audio-transcode-v1`، بينما عقد التسليم الآمن الموحد في `functions/src/chat-media-policy.ts` يشترط `ffmpeg-audio-purpose-limit-v2`. تم تحديث fixture إلى الإصدار المعتمد.

Commit:
`2cb021555c6779c2b3c369c6ef9101affa8e4502`

Blob:
`4a4d1fea11536ed56a59973c25aca343b1637ed7`

ثم كشف Test Center run `45832363824` عن fixture آخر متقادم في اختبار جلسة الزائر:
`guest onboarding stores no age and grants only active all-ages public-room text access`.

كان الاختبار يهيئ أصلين صوتيين (عضو وزائر) بإصدار المعالج القديم نفسه. فشل الإرسال عند `sendChatMediaAttachment` لأن `resolveChatMediaDeliveryArtifact` يرفض أي أصل لا يطابق إصدار المعالج المحدد في عقد التسليم. لم يكن الخلل مبرراً لتخفيف التحقق الأمني؛ جرى تحديث fixture العضو وfixture الزائر معاً إلى `ffmpeg-audio-purpose-limit-v2`.

Commit:
`8702a0743f386c3bb5669057103c77cd403f3e5e`

Blob:
`68560d8880187793d4a4bcc5218e7656e820889a`

## 9. إعادة تشغيل التحقق بعد إصلاح جميع fixtures المكتشفة

على SHA `8702a0743f386c3bb5669057103c77cd403f3e5e` بدأت التشغيلات التالية:
- Mawdda Test Center: run `45833698179` — قيد التنفيذ عند آخر قراءة.
- Validate Mawda: run `45833698032` — pending عند آخر قراءة.
- Mawdda economy regression: run `45833698087` — قيد التنفيذ عند آخر قراءة.
- Economic phase verification: run `45833698342` — قيد التنفيذ عند آخر قراءة.

على SHA السابق `2cb021555c6779c2b3c369c6ef9101affa8e4502`:
- Economic phase verification run `45832363908` — success.
- Mawdda economy regression run `45832363709` — success.
- Mawdda Test Center run `45832363824` — failure بسبب fixture جلسة الزائر الموضح أعلاه.
- Validate Mawda run `45832363874` — ظل قيد التنفيذ في آخر قراءة، ولا يعتمد كقبول نهائي.

نتائج التشغيلات الأربعة على SHA `8702a074` لم تكن نهائية وقت هذا التحديث؛ يجب عدم إعلان إغلاق Workflow حتى تكتمل ويفحص كل job فاشل وسجله.

## 10. حدود الإصلاح

الإصلاحات في هذه الجولة اقتصرت على fixtures الاختبارية التي لم تعد تطابق عقد المعالج الصوتي المعتمد. لم يتم تخفيف عقد التسليم أو تجاوز scanner أو تعديل سياسات السماح. لا يوجد في هذه السجلات ما يثبت وجود ثغرة إنتاجية؛ المكتشف كان عدم اتساق في بيانات الاختبارات. تبقى أي إخفاقات جديدة محتاجة إلى تشخيص مستقل من سجلاتها.

## 11. النتيجة النهائية لإعادة التحقق — 2026-11-26

بعد توثيق الإصلاحات في commit `0b6413a20801558d6a89410c013ab46538a08d81`، اكتملت التشغيلات على هذا SHA بنجاح:

| Workflow run | الاسم | النتيجة |
|---|---|---|
| 45833809265 | Economic phase verification | success |
| 45833809400 | Mawdda Test Center | success |

تفاصيل الوظائف:
- Economic phase verification: وظيفة `Functions build, unit tests, and call signaling emulator` — success.
- Mawdda Test Center:
  - `Backend, Firebase rules and complete emulator journeys` — success.
  - `Flutter analysis, tests and web release build` — success.

كما اكتمل على SHA الإصلاح البرمجي `8702a0743f386c3bb5669057103c77cd403f3e5e`:
- Validate Mawda run `45833698032` — success، وجميع الوظائف الخمس ناجحة، بما فيها Cloud Functions compile/unit، server evidence/authorization/biometric reward integration، Flutter analysis/tests/web build، comprehensive backend emulator integration، وClamAV scanner gateway tests/image build.
- Mawdda economy regression run `45833698087` — success، وكلتا الوظيفتين ناجحتان.

التشغيلان `45833698179` و`45833698342` على SHA `8702a074` أُلْغيا بسبب استبدالهما بتشغيلات أحدث على SHA توثيق التقرير؛ لا يُحسبان نجاحاً ولا فشلاً. المرجع النهائي هو التشغيلان الناجحان أعلاه على SHA `0b6413a`.

هذه النتيجة تغلق إخفاقات Workflow التي شُخّصت في هذه الجولة فقط. لا تعني اكتمال مقارنة الفروع التاريخية الـ33 أو المرشحين الـ1,665، ولا تعني اكتمال جميع مسارات المنصة أو السماح بحذف الفروع.
