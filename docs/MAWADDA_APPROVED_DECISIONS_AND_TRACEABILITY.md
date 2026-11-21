# سجل القرارات المعتمدة وتتبع التنفيذ — MAWADDA 2026

هذا السجل يربط قرارات المالك بالرؤية والدستور والتنفيذ والاختبارات. عند التعارض، تكون أحدث موافقة صريحة للمالك هي المرجع، ويجب تصحيح الوثائق والكود قبل التنفيذ. لا تعني حالة «معتمد» أن الميزة منفذة.

## قواعد الحالة

- **معتمد — لم يبدأ:** المتطلب ثابت لكن لا يوجد تنفيذ كافٍ.
- **قيد التنفيذ:** توجد تغييرات غير مكتملة.
- **منفذ جزئياً:** توجد أجزاء في المصدر، لكن دورة الاستخدام أو الضوابط أو الاختبارات غير مكتملة.
- **منفذ ومختبر آلياً:** الكود والاختبارات المحددة موجودة ونجحت على SHA معلوم.
- **قبول أجهزة/تشغيل حي:** اختبارات أجهزة فعلية أو موارد non-production الحية موثقة.
- **جاهز للإطلاق:** كل بوابات الأمن والخصوصية والقانون والتشغيل والمالك مكتملة. لا يوجد ادعاء بهذه الحالة لمجرد نجاح CI.

## المراجع الرسمية

1. [الرؤية الشاملة](MAWADDA_COMPREHENSIVE_PRODUCT_VISION_2026.md) — نطاق المنتج وتجربة المستخدم والأنظمة.
2. [الدستور](MAWADDA_PRODUCT_CONSTITUTION.md) — قواعد ملزمة للمنتج والأمن والاقتصاد والحوكمة.
3. [العلامة وتجربة المنتج](MAWADDA_BRAND_AND_PRODUCT_EXPERIENCE.md) — الهوية والألوان والشعار والخلفيات.
4. [خطة المراحل السبع](SEVEN_PHASE_EXECUTION_PLAN.md) — ترتيب التسليم والمخرجات.
5. [التتبع الهندسي التفصيلي](IMPLEMENTATION_TRACEABILITY.md) — المتطلبات الفنية والاختبارات.
6. [قائمة قبول الإطلاق](RELEASE_READINESS_CHECKLIST.md) — بوابات القبول.
7. [حدود المختبر والمستودع الأساسي](DEVELOPMENT_AND_SIMULATION_BOUNDARY.md) — فصل اختبار 5000 شخصية.

## سجل القرارات والميزات

| المعرّف | المجال / القرار المعتمد | الحالة الحالية بحسب الأدلة المتاحة | بوابة الإغلاق |
|---|---|---|---|
| GOV-001 | مالك فعلي واحد وهوية UID واحدة؛ Super Owner هو المالك الوحيد وصاحب السلطة السيادية المطلقة على جميع مفاصل المنصة. يعين Admin 1..N لمساعدته ويمنح كل واحد صلاحيات محددة صراحة. توجد خمس وظائف Admin Media لإدارة قسم الإعلانات والميديا وورك سبيس المتكامل، وخمسة «المشرف العام للإنتاج» مع صلاحيات الإرسال المحددة، وعدد غير محدود من «مشرف إنتاج الفريق» ضمن الفريق/الغرفة المعيّنة فقط. الفئات منفصلة ولا تورّث صلاحيات بعضها | توثيق التسلسل والمسميات موحّد في GOV-001؛ التنفيذ الفعلي للصلاحيات الخادمية، حدود التعيين، سجل التفويض والإلغاء، وMFA/استرداد المالك لا يزال يحتاج تدقيقاً واختبارات على HEAD | إثبات هوية المالك الوحيدة وMFA؛ اختبارات التعيين/الإلغاء/الترقيم والسعة والفصل بين النطاقات؛ deny-by-default وaudit وsession revoke على non-production |
| ID-001 | التسجيل والبريد والملف الشخصي والاسم الفريد والخصوصية وإقرار سياسة الخصوصية | أساس التنفيذ موجود؛ بعض دورات التحقق والاختبارات الواقعية مفتوحة | اختبارات Auth والأجهزة وتجديد البريد والقانون |
| GST-001 | الضيف: اسم وبلد وجنس فقط، 60 دقيقة لكل 24 ساعة، غرف all_ages، نص وصوت فقط، دون محفظة/متجر/خاص | أساس الضيف ومحاكياته موثق؛ مكافحة تكرار الهويات والاختبارات المادية مفتوحة | اختبارات abuse/App Check والأجهزة |
| PROF-001 | ملفات عامة/خاصة واكتشاف وحظر وإبلاغ وروابط اجتماعية موثقة | واجهات ووظائف أساسية موجودة؛ ربط OAuth الفعلي والتحقق الخارجي ما زال بوابة | اختبارات provider ownership والخصوصية والروابط |
| CHAT-001 | محادثات خاصة وغرف، إيصالات، إشعارات، حظر وإبلاغ واستئناف وصندوق رسائل | callable صندوق المحادثات، حالة غير المقروء، إيصالات القراءة، إخفاء المحادثة عند حظر أي طرف، وشاشة Flutter موجودة؛ قبول الأجهزة/الإشعارات الحية ما زال مفتوحاً | اختبارات تكامل عابرة للحسابات وأجهزة حقيقية |
| MEDIA-001 | الأعضاء: صور/GIF/صوت/فيديو فقط؛ منع PDF والمستندات؛ استثناء المالك المثبت | قواعد وسياسات وفحوص ماسح موجودة؛ GCS/Cloud Run الحي والأجهزة مفتوحة | signed URL، scanner live، MIME، deletion، أجهزة |
| MEDIA-002 | التدمير الذاتي لوسائط الدردشة/الغرف بعد 4 ساعات، بما فيها الأصل والمشتقات والنسخ السحابية القابلة للحذف | منطق احتفاظ/حذف واختبارات محاكي موجودة؛ إثبات الحذف الفعلي من GCS/CDN والنسخ مفتوح | تشغيل non-production وgeneration delete وrestore proof |
| ROOM-001 | غرف عامة/خاصة، إيجارات، مشرفون، فعاليات وRSVP | أساس الغرف والإيجارات والفعاليات موجود. أضيفت سعة مقاعد مستقلة للحدث مع تحقق ذري من الامتلاء، RSVP idempotency، وإلغاء التسجيل قبل بدء الحدث مع تحرير المقعد؛ اختبارات emulator تغطي الامتلاء والإلغاء وإعادة المحاولة. التحقق الدقيق على HEAD قيد التشغيل؛ القبول التشغيلي/الأجهزة مفتوح | lifecycle + notifications + devices + reconciliation + concurrency/seat-capacity tests |
| CALL-001 | صوت ومرئي منفصلان؛ باقات 24h/7d/30d؛ 5 صوت و3 مرئي لكل 24h متحركة؛ 5 دقائق لكل مكالمة | **منفذ جزئياً:** signaling/session lifecycle موجود للمحادثات المباشرة والغرف، مع قفل المشاركين، حصة محاولات 5/3، وتسقيف خادمي 300 ثانية بعد إبلاغ الطرفين بالاتصال؛ لكن لا يوجد تحقق من استحقاق صوت/فيديو لدى الطرفين عند الإنشاء/الانضمام، ولا consent/preferences كامل، ولا TURN provisioned. | ربط باقات الصوت/الفيديو بالمحرك المركزي، تحقق الطرفين خادمياً في الإنشاء والانضمام، استهلاك quota صحيح، consent/preferences، TURN/STUN، اختبارات التكامل والأجهزة؛ لا تعتبر signaling وحده مكالمات مدفوعة مكتملة |
| CALL-002 | المكالمة المفتوحة استمرار للباقة نفسها بعد استنفاد المتصل حصته؛ 120 صوت/400 فيديو إجمالي بالدقيقة؛ إذا استنفد الطرفان يدفع كل منهما 60/200؛ وإذا استنفد المتصل وحده يدفع 120/400 وحده | **غير منفذ:** لا يوجد metering للوقت المتصل، ولا allocation مالي بين الطرفين، ولا خصم ذري أو قيود رصيد أو ledger مرتبط بفترات الفوترة. قاعدة التقريب/وحدة الفوترة لم تُحسم بعد، لذلك لا يجوز تفعيل open calling. | allocation خادمي ذري حسب quota الطرفين، تحديد وحدة الفوترة والتقريب بموافقة المالك، disclosures وموافقة كل طرف ملزم بالدفع، خصم ذري idempotent وسجلات ledger ومصالحة، اختبارات حدود/إعادة اتصال/تزامن |
| WAL-001 | تحويل كوينز ذري بمعرف موحد وسجل المرسل والمستلم والمنصة والعمولة | تنفيذ backend واختبارات emulator موثقة في وثائق الحالة؛ قبول التشغيل الحي غير حاصل | مراجعة reconciliation والاختبارات الحالية وnon-prod |
| STORE-001 | متجر ديناميكي وأسعار ومدة واستحقاقات خادمية؛ لا تفعيل دون fulfillment فعلي | شاشة المتجر تتحقق من purchaseId وitemId وnewBalance قبل النجاح؛ اختبارات emulator تغطي الخصم الذري والسجل والاستحقاق وربطه بالملف الشخصي؛ قبول كل SKU والأجهزة ما زال مفتوحاً | كل SKU مع consumer واختبار end-to-end |
| STORE-002 | الإطارات المتحركة، الأسماء الملونة/المتحركة، التحليلات، التصميم الاحترافي، الأقسام المثبتة، boosts، الثيمات، التحية، VIP والشارات والألقاب | أجزاء من وظائف الاستحقاق والملف الشخصي موثقة؛ لا تعني كل المزايا مكتملة في تجربة المنتج | تحقق كل entitlement عبر كل الشاشة/السيناريو |
| REWARD-001 | 500 كوين لكل دورة بريد 90 يوماً بعد إثبات خادمي | تجديد البريد/المكافأة له أساس backend واختبارات؛ قبول Auth حي مفتوح | اختبارات Auth/device والـ exactly-once |
| REWARD-002 | 1,500 BetaCoins مرة واحدة لكل دورة توثيق بيومتري مقبولة؛ التجديد كل شهر تقويمي مستقل عن البريد | **منفذ خادمياً على HEAD `25efc997` مع بوابة اختبار مفتوحة:** قرار Super Owner مع MFA، الأدلة الخاصة، الحالات والمحاولات، التدقيق، ومكافأة ذرية عبر `creditMemberWalletInTransaction` من `functions/src/wallet-ledger.ts` داخل معاملة القرار؛ اختبار التكامل يغطي التزامن ومنح 1,500 مرة واحدة. تشغيل CI رقم `44840631959` كشف fixture وحدة قديم 60 ثانية، وتشغيل `44840941680` كشف حدّاً قديماً 60 ثانية في استجابة بدء الطلب وfixture تكامل يستخدم 30 ثانية؛ فشل الاختبار يمنع إعلان اجتياز HEAD | توحيد استجابة callable إلى الثابت `BIOMETRIC_AUDIO_MAX_DURATION_MS`، وضبط fixture التكامل على 20,000ms، ثم إعادة اختبارات Functions والوحدة والتكامل البيومتري، Flutter Analyze/Tests/Web، وحزمة التكامل على SHA النهائي؛ تجربة Android وnon-production ما زالت مطلوبة؛ لا يشترط Play Integrity أو App Attest
| AD-001 | الإعلانات المميزة وإعلانات المكافآت: اعتماد المالك، سلامة المادة، الاستهداف الجغرافي، المشغل، حدود المكافآت، وسجل المحفظة | **منفذ جزئياً:** دورة timed-ad المستقلة فيها إنشاء/تعديل حملات للمالك، نشر/إيقاف/أرشفة، تحقق من مادة المالك المعتمدة أمنياً، جلسات وheartbeats خادمية، حجز ميزانية، ومنح ذري مع claim وwallet ledger؛ واجتازت اختبارات emulator المحددة. وحدة featured showcase/reward تحتوي منطق اختيار وسياسة مكافأة واختبارات وحدات فقط، لكنها غير موصولة بواجهات Firestore/Cloud Functions أو شاشة عرض فعلية؛ `FeaturedAdsScreen` ما زالت تعرض حالة ثابتة، ولا يوجد سجل مكافآت متصل بها. لا يوجد تكامل مزود إعلانات خارجي. | API خادمي وملكية/موافقة واستهداف موثقة، ربط المشغل الآمن، policy owner-configured دون افتراض أسعار/حصص، منح ذري idempotent وسجل عضو، اختبارات emulator للحدود والتزامن والإلغاء/السحب، وربط واجهة فعلية واختبارات أجهزة؛ لا إعلان اكتمال قبلها |
| OWNER-001 | لوحة المالك: الأعضاء والسلامة والمحادثات والاقتصاد والمتجر والغرف والوسائط والخلفيات والإعلانات والسحابة والتكلفة والنسخ والاستعادة والتدقيق | أجزاء متعددة موجودة؛ مركز العمليات السيادي الكامل غير مكتمل | اختبارات owner MFA، كل وحدة backend، audit، restore |
| AI-001 | مساعد تقني وشخصيات اجتماعية AI مع وسم مرئي صغير، خصوصية، 18+ للرومانسي، ميزانيات وkill switches | رؤية معتمدة، غير منفذة كخدمة مكتملة | gateway، isolation، consent, moderation, safety, budget tests |

| TEST-001 | مركز اختبارات يدوي ومحاكيات وشخصيات تجريبية معزولة | Workflow يدوي، seed محمي بمشاريع demo ومحاكيات فقط، كتالوج personas ومصفوفة تغطية الرحلات موجودة؛ تشغيل مختبر 5000 ما زال يحتاج نجاحاً كاملاً على SHA ثابت | تشغيل كامل exact-head، مراجعة عزل البيئة، ثم تقرير 5000 موثق |
| SIM-5000 | مختبر منفصل لمحاكاة 5000 شخصية؛ المشروع الأساسي يحتفظ بكل الاختبارات العادية | المستودع الخاص أُنشئ ونُقلت إليه ملفات harness؛ تحقق syntax/safety CI نجح في run 43667179459؛ لم يُثبت تشغيل 5000 فعلياً بعد. يتطلب checkout للمستودع الأساسي السري Actions secret باسم MAWDDA_PLATFORM_READ_TOKEN بصلاحية Contents: read فقط | إضافة السر من إعدادات GitHub، ثم تشغيل يدوي على SHA محدد، تقرير 5000، مراجعة العزل والأداء |
| CI-001 | المشروع الأساسي يشغل analyze/unit/integration/security/build فقط؛ لا deploy ولا تغييرات Firebase حية من CI | شجرة التطوير تحتوي ثلاثة workflows للتحقق والبناء فقط؛ Hosting workflow محذوف، والـ native workflow يتحقق من إعدادات non-production الملتزمة دون Firebase CLI أو FIREBASE_TOKEN أو تعديل المشروع. أحدث تشغيل تحقق أساسي على SHA 3c6fdfdf9ad3445748708ac2aec409f95ddf9b9a اجتاز الوظائف الثلاث؛ Android native build اجتاز على التشغيل 43667249374، وiOS كان قيد البناء وقت تحرير هذا السجل | استمرار مراجعة scripts/terraform وملفات التشغيل؛ إثبات iOS native build و5000-persona lab على SHA ثابت؛ لا deploy |
| COST-001 | البقاء على Firebase Spark/Emulator-first؛ لا Blaze أو موارد مدفوعة أو WORM/retention lock دون موافقة منفصلة | خطة التكلفة والدستور يثبتان عدم تفعيل موارد مدفوعة أو WORM؛ لا Terraform apply أو نشر موارد تم بواسطة هذه الأعمال | مراجعة تكلفة/قانون وموافقة مالك مستقلة قبل أي تفعيل |
| REL-001 | لا دمج إلى main ولا نشر إنتاجي إلا بعد بوابات ناجحة وموافقة منفصلة | PR #2 Draft ومفتوح؛ لا دمج ولا نشر | exact-head green، 5000 lab pass، review، release checklist، موافقة مالك مستقلة |

## قرارات المالك المضافة — 2026-11-20

### CALL-003 — حد المكالمات المرئية الجماعية
- **معتمد:** الحد الأقصى للمكالمة المرئية الجماعية أربعة مشاركين إجمالاً، ويشمل منشئ/مرسل المكالمة ضمن الأربعة.
- المكالمات الصوتية الجماعية تتبع سعة الغرفة المستأجرة المعتمدة؛ لا يغيّر هذا القرار حدود المحاولات أو المدد أو الأسعار.
- يجب فرض الحد خادمياً قبل إنشاء المكالمة، وإعادة التحقق من العضوية والسعة داخل معاملة Firestore لمنع السباق.
- PR #76 ينفذ هذا الحد في `roomCallParticipantLimit` ويضيف اختبارات تقبل 4 وترفض 5؛ دُمج في فرع التكامل فقط.
- لا يعني هذا القرار اعتماداً مالياً أو اكتمال دورة طلب الانضمام أو الموافقة أو metering أو تسوية المحفظة.

### BIO-003 — الحد الأقصى لتسجيل صوت دليل التوثيق البيومتري (2026-11-21)

- **معتمد:** تسجيل الصوت المرفوع كدليل لطلب التوثيق البيومتري حصراً لا يتجاوز **20 ثانية**، وبحد حجم **5 MiB**.
- يُفرض الحد في واجهة التسجيل، وخط الرفع، وفحص مدة الملف/المسارات الصوتية من البايتات على الخادم، والاختبارات. أي ملف يتجاوز 20,000ms يُرفض خادمياً.
- لا يغيّر هذا القرار حد التسجيل الصوتي الحي البالغ 60 ثانية في المحادثات والغرف، ولا أي سياسة صوت خارج مسار دليل التوثيق البيومتري.
- تبقى بقية BIO-001/BIO-002 دون تغيير: فيديو 3–5 ثوانٍ، مراجعة بشرية حصرية من Super Owner، ومكافأة 1,500 BetaCoins عبر دفتر الاقتصاد المركزي مرة واحدة.

### BIO-001 — مرجعية التوثيق البيومتري
- **معتمد:** سياسة Super Owner اليدوية في PR #77 هي المرجع الوحيد والأحدث، وتلغي أي شرط متعارض يفرض مزود attestation أو تصنيفاً آلياً قبل قرار المراجعة.
- يبقى المسار مغلقاً fail-closed حتى تنفيذ واختبار دورة خادمية كاملة: صلاحية Super Owner مع MFA، تقديم خاص للصوت والفيديو، سجل قرارات/وصول، معاملات ذرية، idempotency، مكافأة 1,500 مرة واحدة، التجديد الشهري المستقل، وإلغاء الوصول والحذف القابل لإعادة المحاولة.
- لا تُزال بوابات الحماية الحالية ولا تُفتح امتيازات بديلة قبل اكتمال هذه المراجعة والتنفيذ. إثبات المزود/الجهاز ليس بديلاً عن قرار Super Owner ولا شرطاً مسبقاً له.

## Canonical administrative hierarchy — owner confirmation 2026-11-19

- **Super Owner:** one actual owner only; sole sovereign authority across every platform domain and system.
- **Admin 1..N:** open-ended appointments by Super Owner; each Admin receives only explicitly delegated permissions. The title itself grants no implicit privilege.
- **Admin Media 1..5:** exactly five administrators for the integrated Advertising Department and Media Workspace.
- **المشرف العام للإنتاج 1..5:** exactly five general production supervisors; preserve this exact Arabic title and their defined sending permissions.
- **مشرف إنتاج الفريق:** open-ended capacity; each supervisor is limited to the assigned team and its assigned/rented room.
- These are separate role families. Authorization must use stable server-side role identifiers and explicit scope checks, never display labels. Do not migrate claims/IDs or change owner identity as part of a naming-only change.

## تصحيح التعارضات المعروفة

1. **فوترة المكالمات:** بعض مسودات 15 نوفمبر القديمة وصفت 60 صوتاً/200 فيديو كسعر مستقل لكل دقيقة، ثم جاءت موافقة أوضح تحدد السعر الإجمالي 120/400. تم توحيد مادة المكالمات في الدستور إلى قاعدة واحدة: 120/400 إجمالي؛ 60/200 لكل طرف فقط إذا استنفد الطرفان الحصة؛ المتصل وحده يدفع 120/400 إذا كان المستقبل لا يزال يملك محاولات. لا يجوز إحياء الصياغات القديمة.
2. **المراجعة والمكافأة البيومترية — القرار النهائي 2026-11-20:** المرجع الوحيد هو `docs/phase1/BIOMETRIC_FINAL_OWNER_POLICY_2026-11-20.md` الموثق في PR #82. Super Owner حصراً يراجع الأدلة البشرية بنفسه؛ يجب أن يقرأ العضو عبارة صوتية موجودة مسبقاً ويرسل تسجيل دليل لا يتجاوز 20 ثانية (5 MiB كحد للحجم)، وأن يرسل فيديو مدته من 3 إلى 5 ثوانٍ حصراً، ويُطابق الجنس مع القيمة المسجلة أصلاً ولا يختارها في نموذج التوثيق. ثلاث محاولات إجمالاً، وبين كل رفض والمحاولة التالية شهر تقويمي كامل؛ الرفض الثالث يغلق الملف نهائياً بلا محاولة رابعة أو قفل إضافي لثلاثة أشهر. القبول يفعّل التوثيق فوراً ويمنح 1,500 BetaCoins مرة واحدة عبر دفتر الاقتصاد المركزي. التجديد البيومتري شهري مستقل عن البريد الذي يتجدد كل ثلاثة أشهر. لا Play Integrity أو App Attest أو إثبات جهاز ولا تصنيف آلي؛ القرار بشري حصراً. تبقى الميزة fail-closed حتى اكتمال التفويض الخادمي، إعداد العبارة المعتمدة، التحقق الفعلي من الوسائط الخاصة ومددها، التدقيق، المعاملة الذرية للمكافأة، منع الإعادة، التجديد والحذف والاختبارات.
3. **مختبر 5000:** لا تُنقل اختبارات الوحدة أو التكامل أو قواعد Firebase أو اختبارات scanner من المستودع الأساسي. ينقل المختبر فقط مولد الشخصيات وسيناريوهات التحميل واسعة النطاق وأدواتها، ويختبر كود المنصة الأصلي من commit مثبت.
4. **حالة الإنجاز:** لا يُستنتج قبول ميزة من وجود UI أو callable أو test واحد. يلزم تنفيذ end-to-end واختبار مناسب، ثم قبول أجهزة/تشغيل حي عندما يتطلب الأمر.

## قاعدة تحديث هذا السجل

يُحدّث هذا الملف مع كل قرار جديد أو تغيير حالة. أي تعديل دستوري يجب أن يحدّث الرؤية وهذا السجل والاختبارات/المتطلبات المتأثرة في commit واحد أو سلسلة commits مترابطة. عند عدم وجود دليل كافٍ تبقى الحالة «جزئي» أو «غير مقبول»، ولا ترفع إلى «مكتمل».


## Approved owner amendments — 15 November 2026

The following decisions are binding and are also specified in [the Master Development Charter](MAWADDA_MASTER_DEVELOPMENT_CHARTER_2026.md). They must be linked to code, tests and evidence before their implementation status can be raised.

| ID | Approved decision | Required implementation / acceptance gate | Status |
|---|---|---|---|
| STORE-003 | One central commercial engine for every current/future store, feature, title, badge, medal, membership and product; durations 24 hours, one week, one month; separate owner-set price for each; configurable quantities, limits, renewal and enable/disable; permanent items supported | Shared catalog schema, owner settings UI/API, price snapshots, entitlement fulfillment and expiry, future-SKU contract tests | Approved — implementation to be reconciled and extended |
| MEDIA-003 | Mawdda Media Saver is one paid product across direct chats, public rooms and rented private rooms; saves images/GIF/video/audio locally; does not extend server retention | Backend entitlement check on every save; local save flow; expiry and retention tests; no server timer reset | Approved — implementation not yet evidenced as complete |
| ECON-001 | Initial financial planning baseline: 1,000 monthly active members; target no more than USD 10/month in Google/Firebase billable charges after applicable no-cost usage. Operate to an estimated USD 7.50 ceiling and retain USD 2.50 contingency. This is not a provider-guaranteed hard cap. | Added `functions/src/platform-economic-policy.ts` with project-level no-cost planning baselines and thresholds; added tests; documented protect-mode design and provider billing limitations. | Planning policy and tests committed on development branch only; not connected to live billing or usage enforcement. | Must verify actual bucket region/SKUs, enable billing export only with owner approval, implement measured storage/egress/processing ledger and project-wide quotas, wire alerts/circuit-breakers, run 1,000-MAU profile in isolated 5,000-persona lab, and reconcile actual invoices. Preserve core text chat and safety flows during protect mode. |
| MEDIA-004 | Owner-approved technical ceilings: images 3 MiB; GIF 3 MiB/20 seconds/50 frames (40MP aggregate frame-pixel ceiling); chat/room audio 5 MiB/60 seconds; video source 25 MiB and safe derivative 15 MiB/90 seconds; owner-verified PDF 20 MiB only. Live microphone recordings remain hard-capped at 60 seconds across direct/public/rented rooms. | Updated backend MIME ceilings for every supported image/audio type; client-side file-length preflight; scanner source-download cap 25 MiB; GIF/audio/video/PDF derivative contracts and delivery checks; scanner and backend test assertions aligned. | Partial implementation committed on development branch; exact-head validation is running and has not yet passed. | Still required: end-to-end picker/composer audit, exact-head CI success, versioned owner-configurable role/category/entitlement budgets, global system budget, verified storage byte-hours/egress/processing accounting, quota reconciliation and 5,000-persona cost/load evidence. Existing per-user reservations (5 concurrent, 150 MiB reserved active bytes, 500 MiB daily upload bytes, 100 uploads/day) are admission controls, not a storage/egress cost ledger. No prices or new entitlements are inferred. |
| RET-003 | Temporary direct chat deletes all text/media after 4h server inactivity; normal chat media 4h/text 7d; important chat media 4h/text 30d | Server activity timestamps, immutable mode selection at conversation start, participant notice, mode-aware text expiry, scheduled full-conversation deletion with legal-hold protection, and integration tests for boundaries/retries/derivatives | Partial implementation on development branch: text worker now applies persisted `retentionMode` (legacy/default normal = 7d; important = 30d), scans the full 30-day window, preserves temporary-mode messages for the separate full-chat sweep, and fails closed on corrupt modes. Emulator coverage added; exact-head CI pending. Still open: trusted immutable mode assignment at conversation start, participant notices, server activity writes, consent/selection semantics, and full temporary-chat deletion of text + media + derivatives. No destructive lifecycle has been enabled. |
| REWARD-003 | Owner-configurable daily, hourly and weekly attendance rewards | Server eligibility/cycle calculation, exactly-once grant, owner configuration, ledger and abuse tests | Approved — implementation to be verified |
| REWARD-004 | Ad-view rewards only after owner-defined duration and trusted server evidence of actual foreground viewing; owner-uploaded ads and future provider adapters | Campaign console, signed/validated provider events or trusted heartbeat protocol, fraud/idempotency tests and audit | Approved — implementation to be verified |
| OWNER-002 | Owner grant center for free coins, features, products, memberships, titles, badges and group/room rewards; target one UID, selected group, all connected users in a selected public room, or collective room/group | Owner-only server operations, attendance snapshot, recipient preview/confirmation, idempotency, recipient histories, wallet ledger and partial retry tests | Partial implementation: single/bulk free store-entitlement grants now have owner MFA authorization, 24h/7d/30d duration, expiry extension, per-target idempotency, ledger/audit, partial failures and a UID-based Super Owner screen. Still open: free coin grants, group/room audience snapshots, collective prizes, recipient history/notifications and exact-head CI. No production action enabled |
| GOV-002 | All future commercial items must integrate with central owner controls; no hardcoded prices/durations/limits in client code | Catalog/entitlement extension contract and CI checks for new SKU integration | Approved — ongoing invariant |

### Clarifications
- The one-week / 200-coin Media Saver value is a provisional test baseline only, not a production price.
- A free administrative grant is not a purchase and must not debit the recipient.
- Existing price changes do not rewrite historic receipts or entitlements.
- The 1,500 BetaCoins biometric reward is governed by the final human-review policy: the Super Owner's personal review and explicit approval of the submitted evidence are sufficient; no Play Integrity, App Attest, device attestation, cryptographic device proof, or automated biometric score is a prerequisite. The reward is issued only after that approval, once per eligible verification cycle, through the central server-authoritative economy ledger. The feature remains fail-closed until the complete secure workflow and tests are implemented.
- These decisions do not authorize merge to main, production deployment, paid infrastructure or real-money payment activation.



## GOV-003 — Technical collaborators and owner authorization (approved 15 November 2026)

| Decision | Binding rule | Status / evidence required |
|---|---|---|
| GOV-003 | ChatGPT and Gemini are the designated technical/software-development collaborators; the human owner remains the sole product and operational authority. No secret/credential access or use, deployment, protected-branch merge, production/live-system change, paid action, destructive operation, external publication/message, or third-party authorization without prior explicit personal approval for that exact action and scope. Routine isolated-branch coding and local/emulator tests may proceed under the standing development mandate only when no secrets, charges, live external effects, or real-user data are involved. | Approved governance rule. Apply to all future work; each approval-gated action must have an explicit approval record and evidence of execution or non-execution. |


## GOV-004 — Cross-project owner-control agreement
**Owner direction — 15 November 2026**
- Establish `docs/OWNER_CONTROL_MASTER_AGREEMENT.md` (OCA-001) as the reusable governance baseline for Mawdda and future owner-controlled projects.
- Extend owner protections beyond coding and credentials to ownership/IP, account and asset control, data/privacy, finance, third parties, vendor lock-in, security, auditability, handover, and revocation of permissions.
- New projects must copy and tailor OCA-001 before substantive development; each repository must record project-specific acceptance and implementation evidence.
- This repository change is a governance document, not proof that external parties have signed it or that legal enforceability is guaranteed. Obtain appropriate signed IP/confidentiality/data-processing agreements and local legal review where needed.
- No broad blanket authorization is created: approval remains specific to each consequential action.

## GOV-005 — AI assistants' financial and employment status

**Decision:** ChatGPT and Gemini are provider-operated AI services, not employees or contractors hired by the project owner merely through free or paid subscriptions. Subscription fees are payable to the service provider, not as wages to the assistants. The owner incurs no salary, wage, bonus, commission, profit-share, equity, or employment-benefit obligation to either assistant solely by using those services or receiving their technical outputs. Any human contractor or employee requires a separate agreement. This internal rule does not waive or determine the legal obligations of OpenAI, Google, or any other third party.

**Authority and scope:** Owner-approved on 15 November 2026. Applies to Mawdda governance and is incorporated into OCA-001 section 26. It is an internal project rule, not a contract binding a third party.

**Implementation evidence:** OCA-001 updated in the development branch; project constitution and master charter cross-reference this decision. No external provider terms or legal relationship has been modified.


## MEDIA-005 — Universal 60-second live audio recording cap and economic media enforcement

**Owner clarification — 15 November 2026 (supersedes any earlier 10-minute direct-chat voice-note wording):**
- Every live microphone recording/chat-room audio message is limited to 60 seconds per recording in direct conversations, public rooms and rented private rooms. The limit applies to members and guests according to their permissions. No direct-chat exception and no 10-minute allowance.
- Backend and trusted scanner enforce the same maximum; the client timer is only a usability layer. Current chat/room scanner enforcement also caps uploaded audio files at 60 seconds until a distinct uploaded-audio purpose is explicitly designed and approved.
- Media cost controls include atomic upload quota reservations, per-user concurrent/active/daily byte budgets, actual content/type/size/duration/dimension validation, safe transcoded derivatives, retention enforcement, and quota release on rejected/abandoned/deleted media.
- Owner-approved technical ceilings: image 3MB; GIF 3MB/20 seconds/50 frames (40MP complexity ceiling retained); uploaded chat/room audio 5MB/60 seconds; video ingress 25MB and safe derivative 15MB/90 seconds; owner-verified PDF 20MB only. Live microphone recordings remain 60 seconds maximum. These are technical safeguards, not commercial entitlements or daily/monthly quotas; economic entitlement budgets remain owner-configurable and require a separate cost-accounted catalogue.

**Implementation evidence required:** scanner unit tests for both chat and room purposes; emulator integration tests for member direct chat, public room, rented private room and guest room; client recording timers set to 60 seconds; exact-head Flutter, Functions, scanner and rules CI. Physical-device and live non-production media tests remain separate release gates.


## Approved owner amendment — cross-platform access and launch download choices (15 November 2026)

| ID | Approved decision | Required implementation / acceptance gate | Status |
|---|---|---|---|
| PLAT-001 | MAWADDA is one unified platform accessible across supported operating systems, browsers, device classes and screen sizes. One identity and shared backend govern web, installed web app and native clients; platform differences must not create separate wallets, entitlements, prices or authorization rules. | Responsive/adaptive layouts, RTL/LTR and breakpoint coverage; shared authenticated backend; documented per-platform capability matrix; security and accessibility review. | Approved — existing foundations require end-to-end reconciliation and platform acceptance. |
| DIST-001 | The public landing experience, before registration/login, must clearly present three access choices: (1) Android APK download/install; (2) install MAWADDA as a desktop web app where supported; (3) iOS native app marked “coming soon / in preparation” until the owner funds and approves Apple distribution. Do not expose a fake or unavailable download link. | APK button is enabled only for a verified, release-signed artifact whose signing certificate matches the owner's established Android upload/release key; desktop button uses native browser install prompt where available and accurate browser-specific fallback guidance; iOS card is explicitly informational and has no download action. | Approved — UI and release artifact acceptance remain open. |
| PWA-001 | Explain that browser menus may offer “Install app”, “Add to Home Screen”, or “Add to Dock”; on iOS, guide users through Share → Add to Home Screen. Distinguish an installed standalone PWA from a bookmark/shortcut that opens a browser tab. Never claim the prompt can be forced: browser/OS controls eligibility and presentation. | Test Chrome/Edge desktop install, Safari macOS Add to Dock where supported, iOS Safari home-screen installation, and fallback browsers; verify standalone display, app identity/icons, launch URL, updates, accessibility and offline behavior. | Approved — existing manifest and install guidance are partial foundations, not proof of acceptance. |
| ANDROID-REL-001 | Launch Android distribution must use the owner's existing Android keystore identity; do not generate a replacement key or sign public release APKs with the debug key. Private key and passwords must never enter source control or chat. | Secure secret delivery, reproducible release signing, apksigner verification, certificate SHA-256 comparison to the owner's preserved certificate, version/build metadata, clean-device install/update test and archived artifact checksum. If key bytes or credentials are not securely available, block public APK release and request secure owner-side provisioning. | Approved — local keystore creation was previously verified, but secure GitHub secret provisioning and a matching signed release artifact are not yet evidenced. |

### Landing-page presentation requirements

- Present the Android, desktop-install and iOS-coming-soon choices before registration/login, in Arabic and all supported launch languages.
- Android download must point to the exact verified signed release artifact or approved distribution URL; never point to a debug APK.
- Desktop install must call the browser's install prompt only after the browser exposes it. If unavailable, show contextual instructions for the browser menu. Avoid falsely labeling a shortcut as a standalone app.
- iPhone/iPad guidance must explain Share → Add to Home Screen; mention that some browser versions may offer “Add to Home Screen” or a shortcut rather than a native iOS app.
- Keep the native iOS card visible but explicitly “قريباً — تطبيق iOS قيد التجهيز” until Apple signing/distribution is separately funded and approved.
- Keep the landing experience responsive, keyboard accessible, screen-reader labelled, localized, and consistent with the approved MAWADDA brand.
- The PWA cache must not expose private messages, wallet data, credentials, or account-specific sensitive content after logout/account switching. Test logout, account switching, stale cache, service-worker update and offline states.
- Every requirement above must link to concrete source files, automated tests, platform/device acceptance evidence, and a release checklist entry. A manifest, install prompt, successful web build, or debug APK alone is not acceptance.
- These decisions do not authorize deployment, Firebase/production changes, paid services, Apple enrollment, or merging to main.


## ANDROID-REL-002 — Android release signing custody and iOS deferral (owner clarification, 15 November 2026)

- Android upload/signing identity remains the owner's existing keystore: `mawdda-identity-key.jks`, alias `mawdda-identity`, RSA-2048, certificate SHA-256 `21:F9:E6:01:80:E2:03:8D:DD:57:4E:DC:F1:2A:63:4B:C6:25:D9:BA:3F:65:53:B2:9D:61:70:62:C6:36:84:56`. The previously verified entry type was `PrivateKeyEntry`; do not generate a replacement key.
- The owner reports having created and transferred the key material previously. Repository review does not establish that the JKS bytes and passwords were provisioned to GitHub Actions Secrets. The key must never be committed, pasted into chat, or placed in an ordinary workflow artifact.
- Current Gradle configuration fails closed for Release when local `android/key.properties`/keystore configuration is absent. The current native workflow builds **Debug** only; it is not a signed Release APK workflow. No signed Release artifact or signature-match verification is evidenced.
- Future signing gate: provision the existing keystore and its passwords through an approved encrypted secret channel (for example, repository Actions Secrets), build Release without exposing credentials, verify the resulting APK with `apksigner`, and compare its signer certificate SHA-256 with the fingerprint above. Then verify install/update compatibility on a physical Android device. Do not publish the APK until every check passes.
- iOS native app work is deferred by owner direction. Do not build, sign, distribute, or link an iOS native app for the current experimental launch. On the public pre-authentication landing/portal, the iOS option opens a small localized notice explaining that the native iOS app is currently being prepared/tested; users may use the web version meanwhile. This is a UI notice, not an iOS download link or a claim of App Store availability.
- This decision does not authorize GitHub secret mutation, key transfer, signing, merge to `main`, production deployment, or paid infrastructure. The Android signing workflow and the iOS portal notice remain implementation/acceptance tasks.


## PLAT-002 — Cross-platform install portal implementation status (15 November 2026)

The owner reaffirmed that desktop PWA installation and usable experiences across conventional operating systems, screen sizes and input methods are foundational launch requirements, equivalent in priority to Android APK availability.

- Public pre-authentication login portal: `lib/widgets/mawdda_app_downloads.dart` now exposes Android release status, desktop/mobile web install guidance, and an iOS coming-soon dialog with a web fallback. Android remains disabled unless a release URL is explicitly configured.
- Browser install experience: `web/install-prompt.js` captures `beforeinstallprompt`, defers the native prompt until a user click, detects standalone mode, hides after `appinstalled`, and supplies platform-specific fallback guidance for desktop browsers, Android and iOS Safari.
- PWA shell: `web/manifest.json` declares standalone display, 192/512 SVG icons and display fallbacks; `web/index.html` carries PWA metadata and iOS home-screen metadata. These source declarations are not yet proof of installability on every target browser.
- iOS native app: explicitly deferred for the current experimental launch. The portal must not expose an iOS download URL; pressing iOS opens the coming-soon/web-fallback notice.
- Tests added: `test/widgets/mawdda_app_downloads_test.dart` covers the Android disabled state, iOS notice and web-install guidance. These tests have not yet been executed on the current head.
- Remaining acceptance: exact-head Flutter CI; built Web artifact inspection; Chrome/Edge/Firefox/Safari installability matrix; Windows/macOS/Linux PWA install smoke tests; Android Chrome install smoke test; iPhone/iPad Safari Add to Home Screen smoke test; icon validation; service-worker/offline/update checks; private-data cache isolation; responsive, touch, keyboard, accessibility and localization acceptance.
- Android signing: `.github/workflows/android-signed-release.yml` provides a manual, development-branch-only signed Release build that expects the owner's existing JKS and passwords as GitHub Actions secrets and checks the APK signer fingerprint. It has not been run and no signed APK is currently evidenced. The keystore remains local to the owner's Termux environment; only verification output was shared. The owner-required encrypted backups and explicit secret-provisioning approval remain prerequisites. No keystore or password is committed or modified.

These tasks do not authorize merge, publication, deployment, production Firebase changes, paid infrastructure, or mutation of GitHub secrets.


## IOS-FB-001 — Preserve the existing Firebase iOS app registration and configuration (owner clarification, 15 November 2026)

**Owner decision — mandatory preservation rule:** deferring the native iOS application from the current launch does not authorize deleting, disabling, recreating, renaming, or casually changing its Firebase registration or configuration. The already-created Firebase iOS app is a retained platform asset and must remain intact for the future iOS release.

Known identity to preserve:
- Firebase project: `mawda-app-2026` (project number `697303475139`).
- iOS Firebase App ID: `1:697303475139:ios:7be58cfe1ac9c4c23ed376`.
- iOS Bundle ID: `com.mawdda.platform.app`.
- The iOS `GoogleService-Info.plist` was downloaded by the owner to the local Termux workspace at `~/mawdda-firebase-check/GoogleService-Info.plist` during the registration/configuration work.
- The current committed `lib/firebase_options.dart` contains the matching iOS App ID, project ID and bundle ID. Preserve these values; do not replace them with placeholders or values from another Firebase project.

Safeguards:
1. Do not delete or recreate the Firebase iOS app registration.
2. Do not change its App ID, Bundle ID, project association, API key, or associated Firebase settings merely because native iOS signing/build is deferred.
3. Keep the downloaded `GoogleService-Info.plist` as a protected configuration artifact under the owner's custody. Do not commit it or expose its contents in chat/logs. Maintain an owner-controlled encrypted backup before any future migration or credential-handling operation.
4. Do not overwrite the iOS section of `lib/firebase_options.dart` with experimental/placeholders. Any necessary future change requires an explicit owner-approved change plan and independent verification against Firebase Console.
5. Native iOS build, signing and store distribution remain deferred. This is a release-scope deferral only; it is not permission to remove the Firebase registration or its configuration.
6. No Firebase Console mutation, app deletion, settings change, or credential rotation was performed as part of this decision.

Current evidence boundary: repository source confirms the iOS FirebaseOptions identity values listed above. The owner previously confirmed the app registration already existed (Firebase returned `409 ALREADY_EXISTS`) and downloaded the plist. The repository does not prove the present availability or integrity of the owner's local plist/backup, nor does this documentation perform a live Firebase Console audit. Verify those custody facts before any future iOS release work.


## GOV-006 / MEDIA-006 / COM-001 / RET-004 — Owner-approved policy clarifications (15 November 2026)

**Authority:** Explicit owner approval in the project governance conversation on 15 November 2026. These entries are binding product-policy clarifications. They do not claim implementation or test completion.

### MEDIA-006 — Canonical binary media ceilings

- Canonical unit: MiB, where 1 MiB = 1,048,576 bytes.
- Images: 3,145,728 bytes.
- GIF: 3,145,728 bytes.
- Uploaded audio: 5,242,880 bytes.
- Original video ingress: 26,214,400 bytes.
- Safe video derivative: 15,728,640 bytes.
- Owner-verified PDF: 20,971,520 bytes.
- Existing independent duration/frame/owner restrictions remain in force: GIF 20 seconds and 50 frames (plus existing complexity ceiling); audio 60 seconds; safe video derivative up to 90 seconds; PDF owner-only.
- These values are technical maximums, not member quotas or purchasable entitlements. Enforce exact byte counts in the client, backend/scanner, storage checks and tests.
- **Supersedes:** ambiguous decimal “MB” labels for these ceilings in earlier wording. Do not silently treat MB and MiB as equivalent.
- **Status:** Owner-approved policy; implementation reconciliation and exact-head test evidence remain pending.

### COM-001 — Fixed 30-day commercial month

- All owner-controlled commercial products, memberships, features and entitlements that offer “one month” use exactly 30 days (720 hours), not a calendar month.
- Existing 24-hour and 7-day durations remain unchanged.
- Historical purchases and entitlements are not recalculated or rewritten.
- **Status:** Owner-approved policy; catalog/backend/client/test reconciliation remains pending.

### RET-004 — Retention selection and consent intentionally unresolved

- The owner deferred deciding who selects a direct-chat retention mode and whether both participants must consent.
- Until a later explicit owner decision defines selection authority, participant consent and notices, server-recorded activity, and complete deletion semantics, this policy remains unresolved.
- Destructive production deletion dependent on this unresolved policy must remain disabled. Isolated development/emulator testing may continue only where no real-user data can be deleted.
- Do not infer consent from silence, app presence, network state or client-only flags.
- **Status:** Explicitly deferred by owner; no production deletion authorization.

### Governance boundary

This amendment records policy approval only. It does not establish that code, tests, scanners, catalog entries or production services already enforce these rules. No merge to `main`, deployment, production Firebase mutation, paid infrastructure activation, or destructive live operation is authorized by this entry.


## CREATOR-001 — Fifth Media Workspace route: Creator Content & Influencer Proposals (16 November 2026)

**Authority:** Explicit owner approval in the Mawdda HQ conversation on 16 November 2026. This is a binding product-scope decision, not evidence of implementation or legal clearance.

- Add a fifth peer-level Media Workspace destination named **Creator Content & Influencer Proposals** for influencers, YouTubers, public-page owners, video creators, photographers and advertising-content producers.
- Creators may submit a public channel/account/post/portfolio URL, supported media uploaded through the secure media pipeline, or a written proposal with optional attachments. The platform/source name and a substantive proposal description are required.
- Capture creator identity/category, audience/content focus, target geography from the existing Owner-controlled taxonomy, proposed duration, proposed price/budget or request for an administration quote, and a rights/permission declaration.
- Create a unique request and private request-bound conversation. Access is limited to the submitter, Owner and explicitly authorized assignees. Review, assignment, discussion and commercial offers are versioned and audited.
- The Owner may handle the proposal or assign an authorized reviewer. Offers preserve price, duration, geography, placement and terms; amended terms require renewed explicit acceptance.
- This route is distinct from **Advertise Directly**. It does not automatically create a campaign, reserve inventory, publish content, grant featured priority, create representative commission rights or qualify the creator for Watch Ads rewards.
- Any accepted proposal that becomes an advertising campaign must pass the existing campaign lifecycle, Owner commercial approval, rights/media safety checks, actual-payment confirmation and publication gates. Preserve the creator request ID and audit linkage through handoff.
- Do not invent creator rates, guaranteed reach, legal classification, payment terms or usage rights. No real-money checkout, payout, or production activation is authorized.
- **Implementation status:** Requirements documented and traceability row added. UI, data model, server authorization, media/link integration, negotiation workflow and tests remain open until implemented and verified on an identified commit.


## ADS-FEATURED-ENTRY-001 — Direct featured-ad home entry and dedicated reward-history route (Owner approval, 16 November 2026)

**Decision:** Add a prominent **Featured Ads + Rewards / الإعلانات المميزة والمكافآت** button to the authenticated member home screen. It opens the featured-ad discovery/viewing experience directly. Add a sixth Media Workspace option **Featured Ad Viewing Rewards / مكافآت مشاهدة الإعلانات المميزة** for eligibility guidance and the authenticated member's own qualified-view/reward history.

**Reward rule:** Neither button press nor opening either screen, preview, carousel, category or card earns coins. Coins are credited only after a full selected-ad player session is validated server-side. Featured-ad credits carry a distinct ledger source/type (e.g. `featured_ad_reward`) but use the already approved experimental ad reward limits: 2 coins per eligible view, max 10 views / 20 coins per UTC day, and same campaign once per rolling 24 hours. No second reward or duplicate credit is created for the same qualified view. The Owner may adjust settings through the central versioned server configuration.

**Layout:** The 75% / 25% player/context split applies to the selected full-ad player using usable application viewport and safe responsive constraints. The discovery page and Media Workspace history page are not forced into that split. Preserve existing chat/room state in the lower activity area.

**Commercial separation:** Advertiser placement payments, platform-funded reward budget and member coin ledger are separate accounting domains. Priority placement is subject to geography, schedule, creative safety, Owner approval and emergency withdrawal. No payment or publication gate is bypassed.

**Implementation status:** Approved requirement only. The existing timed-ad reward center is not yet a featured-ad serving system; its current reward-center placement and completion path must not be relabelled as featured ads. Backend serving, campaign geography/featured placement integration, daily and rolling-frequency reward enforcement, dedicated ledger classification, member UI/history, owner controls and exact-head tests remain required. This decision does not authorize real-money payment, production mutation, deployment or merge to main.


## قرارات الإعلانات والإنتاج ومركز العقود — 16 نوفمبر 2026

| المعرّف | القرار | الحالة / بوابة القبول |
|---|---|---|
| ADS-GOV-001 | فصل صلاحيات المشرفين الإداريين للمنصة العامة عن المشرفين والمتعاقدين المتخصصين في الإعلانات وصناعة المحتوى؛ لا توريث صلاحيات بين المجالين | مواصفة مضافة؛ يلزم ربط كل callable وواجهة وقاعدة بيانات باختبارات deny-by-default |
| ADS-GEO-001 | واجهات الاستهداف الجغرافي العشر، وحقل استهداف إلزامي، ومطابقة منظمة versioned دون استنتاج IP/لغة | مواصفة مضافة؛ يلزم geo resolver واختبارات التداخل وعدم الازدواج |
| PROD-ROOM-001 | فريق غرفة الإنتاج خمسة أشخاص كحد أقصى بمن فيهم مشرف الإنتاج؛ المراقبون الإداريون privileged observers خارج roster | أساس validator واختبار وحدة مضاف؛ يلزم تكامل الخادم والواجهات وقواعد الوصول |
| PROD-PUB-001 | كل إنجاز عام يحتاج موافقة مالك مستقلة مع حقوق العرض وإظهار المشاركين | أساس predicate واختبار وحدة مضاف؛ يلزم workflow خادمي وتكامل الواجهة |
| CONTRACT-001 | مركز عقود سيادي، أربعة مشرفين قانونيين/إداريين، والتفويض بالتوقيع مستقل ومحدود وقابل للسحب | مواصفة ونماذج مضافة؛ يلزم مخزن العقود والتوقيع والتفويض والأرشفة والتدقيق |
| CONTRACT-002 | حق الشركة/المنصة في تعليق أو إنهاء أو فسخ أو عدم تجديد العقود وفق الشروط والقانون، مع تسوية الحقوق المكتسبة وعدم ادعاء إسقاط الحقوق الآمرة | صيغ أولية مضافة؛ مراجعة قانونية محلية مطلوبة قبل الاستخدام |
| ADS-REWARD-001 | 2 كوين/مشاهدة، 10 مشاهدات و20 كوين يومياً UTC، وحد 3 مرات لكل حملة/عضو/نافذة 24 ساعة، صورة 10 ثوان وفيديو 90% | مواصفة مضافة؛ يلزم تحديث backend الحالي الذي يستخدم حدوداً أقدم واختبارات التزامن |



## قرارات الإطلاق التجريبي والتوزيع متعدد القنوات — 17 نوفمبر 2026

| المعرّف | القرار المعتمد من المالك | حالة التنفيذ / بوابة القبول |
|---|---|---|
| LAUNCH-PAY-001 | المرحلة الأولى بلا بوابة دفع أو checkout أو تحصيل آلي؛ الاتفاق والدفع بالتواصل المباشر مع Super Owner فقط، والاعتماد اليدوي بعد تحقق خارجي موثق | مسار طلبات الشراء اليدوي موجود جزئياً؛ يلزم إثبات سجل التدقيق الكامل، حماية MFA، واختبارات عدم إصدار الكوينز قبل اعتماد المالك |
| LAUNCH-APK-001 | موقع Mawdda قناة APK الأساسية والموصى بها، وليست حصرية؛ يجوز التوزيع عبر قنوات موثوقة إضافية بموافقة المالك | أضيفت سياسة exact-host لروابط HTTPS وقائمة مضيفين معتمدة؛ يلزم ضبط النطاق الأساسي والمرايا، بناء Release موقّع، اختبار الأجهزة والنشر العام |
| LAUNCH-SIGN-001 | كل القنوات توزع التطبيق الرسمي نفسه وبهوية توقيع Mawdda المتوافقة؛ لا APK غير موقع أو Debug | workflow توقيع يدوي موجود لكنه لم يثبت تشغيله؛ النسخ الاحتياطية المشفرة والأسرار والبناء والتحقق الفعلي ما زالت بوابات مفتوحة |
| LAUNCH-PWA-001 | تثبيت نسخة الويب كتطبيق PWA في المرحلة الأولى على Android وSafari iOS ومتصفحات سطح المكتب المدعومة | manifest وإرشادات التثبيت موجودة؛ يلزم اختبار installability فعلي لكل متصفح/جهاز وتوثيق القيود |
| LAUNCH-IOS-001 | تأجيل التطبيق الأصلي ومتجر Apple ورسوم العضوية؛ لا يُخلط Safari PWA مع تطبيق iOS أصلي | قرار موثق؛ التسجيل الأصلي والتوقيع والاختبارات والنشر مؤجلة |
| LAUNCH-PLAY-001 | تأجيل Google Play ورسوم Play Console إلى ما بعد نجاح التجربة وموافقة المالك | قرار موثق؛ عند الانتقال يجب إعداد حزمة المتجر المناسبة (AAB عادة للتطبيقات الجديدة) واختبار توافق التوقيع والتحديث |
| ANDROID-REL-003 | تجهيز APK المباشر وAAB للمتجر معاً من الالتزام نفسه وبهوية توقيع Mawdda؛ لا يجوز أن يكسر إعداد Play App Signing تحديث نسخ APK المثبتة خارج المتجر | أُضيف workflow يدوي يبني Universal/ABI APK وAAB ويفحص توقيعاتها وشهادتها وSHA-256؛ لم يُشغّل بأسرار المالك بعد، ولم يُرفع أي artifact إلى المتجر أو الموقع |
| LAUNCH-CLOUD-001 | عدم تفعيل Blaze أو خدمات/اشتراكات مدفوعة أو إجراء نشر/تغيير إنتاجي دون موافقة منفصلة وتقدير تكلفة وأهلية | قرار موثق؛ لم يتم تفعيل فوترة أو نشر إنتاجي ضمن هذا التغيير |

**مراجع التنفيذ التفصيلية:** [خطة الإطلاق المرحلي والتوزيع الرسمي](MAWADDA_PHASED_LAUNCH_AND_DISTRIBUTION_PLAN_2026.md)؛ [دليل بناء Android والتوقيع وGoogle Play](ANDROID_RELEASE_AND_GOOGLE_PLAY_SIGNING_2026.md). التوثيق أو نجاح CI لا يثبت وحده جاهزية الإطلاق ولا يمنح إذناً بالنشر.


## ANDROID-REL-004 — منع إصدار Android المرتبط ببيئة Firebase غير الإنتاجية (17 نوفمبر 2026)

- إعداد Flutter الافتراضي `MAWDDA_FIREBASE_ENV=nonprod` مقصود لاختبارات التطوير والمحاكيات فقط.
- يجب أن تمرر جميع أوامر بناء APK/AAB الموقّعة `MAWDDA_FIREBASE_ENV=production` صراحة.
- يجب أن يحقن workflow ملف `google-services.json` الإنتاجي من سر `MAWDDA_PRODUCTION_GOOGLE_SERVICES_JSON_B64`، ثم يطابق project ID ورقم المشروع وApp ID واسم الحزمة ومفتاح API وStorage bucket مع FlutterFire production options.
- أُضيف تحقق آلي لهويات Android وiOS الإنتاجية في `functions/scripts/validate-firebase-config.cjs` واختبارات لها. غياب ملف Google Services الإنتاجي أو عدم التطابق يمنع بناء الإصدار.
- لم يُقدّم المالك بعد سر ملف Google Services الإنتاجي في هذه المراجعة، ولذلك لم يُشغّل workflow الموقّع ولم تُنتج حزم Release.


## ECON-PHASE-001 — البرنامج التنفيذي الموحد للمرحلة الاقتصادية الشاملة (19 نوفمبر 2026)

- **قرار المالك:** تثبيت المرحلة الاقتصادية الشاملة كبرنامج تكامل وتنفيذ واحد، وربط جميع محركات الاقتصاد والأقسام والواجهات والخدمات الخادمية والبيانات والاختبارات والحوكمة والوثائق القانونية ضمن مسار متتابع قابل للتدقيق حتى إغلاق المرحلة.
- يجب أولاً جرد جميع فروع التطوير وطلبات الدمج والـ commits والوثائق والاختبارات، ثم مصالحة التغييرات ونقلها انتقائياً إلى فرع تكامل مستقل. يمنع الدمج الشامل أو النسخ فوق الملفات المحورية دون مراجعة دلالية واعتماديات واختبارات.
- يشمل النطاق المحفظة ودفتر الكوينز والتحويلات وطلبات الشراء اليدوية وسياسة الأسعار والمتجر والهدايا والاستحقاقات والمكافآت والإعلانات المميزة والمؤقتة والمكالمات والغرف والإيجارات والفعاليات وMedia Saver والوسائط والتكاليف ولوحة المالك والأمن والحوكمة القانونية.
- كل دفعة يجب أن تكون مرتبطة بقرار موثق، وكود/واجهة/بيانات متأثرة، واختبار مناسب، ونتيجة على SHA ثابت، ومخاطر متبقية.
- تُنفذ الاختبارات الممكنة عبر GitHub Actions وFirebase Emulator وFlutter analysis/tests/build، ثم المختبر المنفصل 5,000 شخصية والقبول غير الإنتاجي/الأجهزة حسب الحاجة. لا يُدعى اختبار محلي أو جهاز فعلي دون دليل.
- لا دمج إلى `main` ولا نشر ولا تغيير Firebase حي ولا تفعيل Billing/Blaze أو خدمات مدفوعة أو تحصيل حقيقي دون موافقة مستقلة وصريحة.
- **المرجع الإجرائي:** `docs/ECONOMIC_PHASE_EXECUTION_AND_INTEGRATION_PLAN_2026-11-19.md`.
- **ضبط الوثائق القانونية:** `docs/LEGAL_GOVERNANCE_DOCUMENT_CONTROL_AUDIT_2026-11-19.md`.
- **حالة القرار:** معتمد من المالك؛ التنفيذ قيد الجرد والتكامل، والمرحلة ليست مغلقة. لا يثبت هذا القرار اكتمال أي ميزة منفردة.


## ECON-PHASE-002 — اعتماد التنفيذ المرحلي وبوابات الإغلاق (19 نوفمبر 2026)

- **قرار المالك:** اعتماد خطة التنفيذ الكامل وخطة التكامل التنفيذي كمسار مراحل متتابعة؛ تُغلق كل مرحلة بأدلة قبول موثقة قبل الانتقال إلى التالية.
- لا يُسمح بتجاوز بوابة فاشلة أو اعتبار وجود الكود/الواجهة وحده إغلاقاً. يجب تسجيل الملفات والـ commits وSHA الدقيق ونتائج الاختبارات والعيوب والمخاطر وقرار الإغلاق.
- ترتيب المراحل ونطاقها وبوابات الخروج ونموذج سجل الإغلاق مثبت في [سجل الإغلاق التنفيذي المرحلي](ECONOMIC_PHASE_EXECUTION_CHECKLIST_AND_STAGE_CLOSURE_2026-11-19.md).
- **نقطة البدء:** إكمال المرحلة 1 (الجرد والمصالحة الشاملة للفروع وطلبات الدمج والـ commits والوثائق والاختبارات)، بالتوازي مع إغلاق التحقق الدقيق من PR35 وPR38. لا يبدأ دمج أو نقل واسع قبل حسم التداخلات.
- **حدود التفويض:** اعتماد هذه الخطة يجيز مواصلة التدقيق والتوثيق والتطوير والاختبارات على فروع التكامل المعزولة؛ ولا يجيز دمج `main` أو النشر أو تعديل Firebase الإنتاجي أو تفعيل Billing/Blaze أو المدفوعات الحقيقية. لكل منها موافقة مستقلة صريحة.
- **الحالة:** معتمد؛ التنفيذ المرحلي مفتوح. لا تعني الموافقة أن أياً من المراحل قد أُغلقت.


## ECON-PHASE-003 — شرط الفحص الشامل والإغلاق المرحلي (19 نوفمبر 2026)

- **قرار المالك:** لا انتقال من أي مرحلة إلى التالية إلا بعد إغلاق المرحلة الحالية رسمياً عقب فحص عميق، داخلي، ومرحلي ضمن GitHub وبيئات الاختبار المتاحة.
- يشمل الفحص جميع الاختبارات والفحوصات المتاحة والملائمة: مراجعة diff والاعتماديات، static analysis/lint/format/type-check/build، unit/component/integration/API/contract/E2E/regression/emulator، negative/authz/concurrency/idempotency/replay/migration/backup-restore، security/code scanning/dependency/SCA/secret scanning/dependency review، rules tests، performance/load/resilience، accessibility/localization/platform validation حيث تتوفر الأدوات والبيئات.
- يجب تصنيف كل عيب، إصلاح العيوب الحرجة والعالية قبل الإغلاق، ثم إعادة الفحص على SHA ثابت. لا يُقبل نجاح workflow واحد دليلاً على اكتمال المرحلة.
- كل فحص غير متاح أو غير منطبق يجب أن يُذكر مع السبب؛ لا يجوز الادعاء بتشغيل فحص لم يُشغّل أو توفر مختبر غير موجود. لا يمكن لـ GitHub وحده أن يحل محل اختبار جهاز حقيقي أو مراجعة قانونية عند الحاجة.
- **ترقيم الخطة:** بوابة المرحلة 0 تأسيسية وليست ضمن عدد المراحل؛ مراحل التنفيذ المعتمدة هي الأربع عشرة من 1 إلى 14.
- **التنفيذ:** تُطبق البوابات فوراً على جميع الأعمال الجارية، ويبدأ التنفيذ العملي بالمرحلة 1 (الجرد الشامل). لا يُغلق أي بند لمجرد اعتماده أو توثيقه.
- **المرجع:** [سجل الإغلاق التنفيذي المرحلي](ECONOMIC_PHASE_EXECUTION_CHECKLIST_AND_STAGE_CLOSURE_2026-11-19.md).
- **الحالة:** معتمد؛ جميع المراحل مفتوحة ما عدا نجاحات الاختبار الجزئية المسجلة كأدلة، ولا تُعتبر إغلاقاً للمراحل.


## RET-005 — Owner confirmation of important-chat text retention (19 November 2026)

- **Owner decision:** important-chat text retention is exactly **30 days (720 hours)** from the server-authoritative message creation timestamp. The 90-day alternative is rejected for this policy.
- Important-chat media remains subject to the existing four-hour media-retention rule; this decision changes text retention only.
- Normal-chat text remains seven days; normal/important chat media remains four hours; temporary direct-chat mode remains a full-conversation deletion after four hours of server-recorded inactivity, subject to the unresolved selection/consent and complete lifecycle gates in RET-004.
- This entry resolves any earlier documentation conflict between 30 and 90 days for important-chat text. The unified constitution, vision, decision register, implementation traceability, backend policy constants, scheduled worker and boundary tests must all remain aligned to 30 days.
- **Implementation status:** policy value is already represented as 30 days in the inspected constitution, RET-003, backend constant and unit/integration boundary tests. This approval does not certify full temporary-chat deletion, production activation, exact-head CI success, or release readiness.
- **Authority:** explicit owner confirmation in the project conversation dated 19 November 2026.


## ROLE-001 — Canonical administrative role separation and fixed-seat limits (19 November 2026)

- One Super Owner identity; Admin N is an open-ended general-administration sequence with permanent, never-reused ordinals.
- Admin Media is exactly five seats; General Production Supervisor is exactly five independent seats; Team Production Supervisor is open-ended and scoped only to its assigned team/room.
- Role families are mutually separate; no role inherits another family's permissions or owner authority.
- Fixed-seat ordinal reuse after revocation/removal remains unresolved and must fail closed; no reuse/renumbering policy is inferred.
- Implementation status: canonical terminology and transactional five-seat enforcement are represented in PR #42. Persistent Admin N appointment/revocation/ordinal allocation, complete role projections/localization, and protected-operation authorization integration remain open.
- Source of authority: unified constitution §4 and the canonical administrative terminology appendix.

## Owner clarification — 19 November 2026

The owner has explicitly clarified the following binding implementation requirements in the HQ project conversation. This amendment records the decision; it does not claim the related features are implemented or tested.

| ID | Owner-approved clarification | Required implementation / acceptance gate | Status |
|---|---|---|---|
| GOV-002 | The owner selects and assigns multiple explicit permissions to each staff member from options constrained to that member's approved job title and operational scope. The owner may edit or revoke grants. No staff role inherits owner/Super Owner authority, financial authority, or permissions outside its role/resource scope. | Define a reviewed permission catalogue per canonical role; validate role-to-permission compatibility server-side; bind grants to exact resource/team/campaign scopes; enforce permissions at every protected callable and data path; versioned grants, revocation, audit, expiry and deny-by-default tests. | Approved requirement — implementation incomplete; current generic permission list is not sufficient evidence of role-scoped enforcement. |
| ROOM-002 | Rental cancellation and refunds are discretionary owner decisions. The owner decides case by case whether to issue a refund, its amount, and whether/when to reverse a previously issued refund. No automatic refund percentage or automatic eligibility rule is authorized. | Owner-only, MFA/step-up protected cancellation/refund/reversal workflow; exact amount and reason supplied by owner; atomic wallet + ledger + rental/room state + audit; idempotency and optimistic versioning; reversal must never silently create a negative balance or erase historical entries. | Approved requirement — implementation incomplete; no automatic refund policy is authorized. |
| MEDIA-003A | Mawdda Media Saver is one paid product for local saving of eligible images, GIFs, video and audio from direct chats, public rooms and rented private rooms. The server must revalidate the active entitlement on every save. Local saving must not extend or reset server retention, and must preserve the member's access/privacy rights and the platform's economic limits. | Server-issued, short-lived, single-asset save authorization after checking authenticated member, active entitlement, source access/participation, media status and security approval, safe derivative, exact Storage generation, retention deadline and media-type limits; audit each decision; never expose raw bucket paths or quarantine originals; client performs local save only from the authorized safe artifact; enforce replay/rate/quota controls without inventing prices or quotas. | Approved requirement — implementation incomplete; upload/scanner/delivery infrastructure exists but does not establish a complete Media Saver entitlement/save lifecycle. |

## قرار LEGAL-DOCS-ACCESS-LIFECYCLE-2026-11-19

**المالك/الجهة المعتمدة:** Super Owner  
**الحالة:** متطلبات معتمدة؛ التنفيذ غير مثبت بعد.  
**المرجع التفصيلي:** `docs/LEGAL_CONTRACT_ACCESS_AND_LIFECYCLE_GOVERNANCE_2026.md`  
**النطاق:** صلاحيات القوالب والوثائق المكتملة، المشرفون القانونيون الأربعة، المفوض بالتوقيع، اكتمال التوقيع، البريد، الأرشفة، تعديل الإصدارات، سجل التدقيق واختبارات الأمن.  
**قاعدة القرار:** جميع الأعضاء ينزلون النماذج الفارغة فقط؛ المشرفون القانونيون الأربعة المعتمدون يطلعون وينزلون ويرسلون لصاحب الوثيقة فقط دون أي تعديل أو حذف؛ المفوض الرسمي يوقع فقط؛ السوبر أونر وحده يعدل المحتوى، مع إصدار جديد غير مستبدل للأصل وتوزيع وأرشفة؛ اكتمال توقيعات الأطراف يطلق إرسال النسخة إلى بريد الشركة وبريد المنصة وأرشفتها.  
**القيود:** لا تغيير إنتاجي ولا دمج إلى main ولا نشر بموجب هذا القرار.  


## GOV-DEV-001 — فرع تطوير موحد واحد فقط (20 نوفمبر 2026)

**القرار المعتمد من المالك:** اعتماد `codex/mawda-full-platform-implementation` بوصفه الفرع الوحيد والنهائي لعمليات التطوير والبرمجة والنقل والدمج الداخلي والبناء والاختبارات والتوثيق في مستودع Mawdda Platform الرئيسي. يحظر إنشاء فروع تطوير موازية للميزات أو المراحل أو الإصلاحات أو الاختبارات. `main` مخصص للإنتاج ويبقى محمياً ولا يتلقى تغييرات إلا بموافقة مستقلة بعد اجتياز بوابات القبول.

**الحالة:** معتمد وموثق؛ التطبيق الأولي تحقق بتوحيد فرع `codex/mawdda-phase1-unified-2026-11-19` على SHA `e12897ad7dc5f383501d997117fb1211c67632e7` وإغلاق PR #47 المكرر. لا تزال مصالحة بقية الفروع وطلبات الدمج عملاً مفتوحاً.

**بوابة الإغلاق الإداري:** جرد كل refs وPRs، مراجعة الفروقات الفريدة، نقل التغييرات الصالحة فقط إلى الفرع الموحد، تشغيل الاختبارات على exact SHA، توثيق ما نُقل وما استُبعد، ثم إغلاق الطلبات المكررة دون حذف تاريخ المصدر أو force-push. لا يُعلن اكتمال المصالحة الشاملة قبل إنهاء هذا الجرد.

**بوابة القبول الهندسي:** كل بناء واختبار يسجل SHA وworkflow/run IDs ونتائج الوظائف. نجاح CI لا يساوي قبول الأجهزة أو التشغيل الحي أو الجاهزية للإطلاق. لا نشر أو تعديل إنتاج أو تفعيل فوترة بموجب هذا القرار.

**المرجع التنفيذي:** [سياسة فرع التطوير الموحد الواحد وخطة المصالحة والتنفيذ](MAWADDA_SINGLE_DEVELOPMENT_BRANCH_POLICY_2026-11-20.md).


## GOV-QA-001 — الفحص العميق والتدقيق والاختبار عبر GitHub (20 نوفمبر 2026)

**القرار المعتمد:** كل عمل برمجي أو بناء أو تطوير أو إصلاح أو نقل أو دمج داخلي أو تغيير تقني يجب أن يخضع لفحص دقيق وتدقيق عميق واختبارات مناسبة لنطاقه قبل القبول. يجب الاستفادة من وسائل GitHub المجانية ذات الصلة المتاحة لنا — Actions، runners، workflows، matrices، logs، artifacts وميزات الفحص المجانية — بأقصى استخدام عملي ضمن الحصص والصلاحيات، وتشغيل كل أنواع الفحوص والاختبارات المنطبقة على التغيير.

**الحد الأدنى حسب الصلة:** static analysis/format/lint/type/compile؛ unit/widget/UI/contract/regression؛ integration وFirebase emulators؛ builds للمنصات المتأثرة عند توافر toolchain؛ security/dependency/secret/license checks؛ ومراجعة diff والـjobs والـsteps والـlogs والـartifacts. توثّق نتائج كل job على exact SHA، بما في ذلك الاختبارات المتخطاة أو غير المتاحة وأسبابها. يعاد الاختبار على SHA الجديد بعد الإصلاحات.

**بوابة القبول:** لا قبول كامل عند وجود فشل أو اختبار إلزامي غير منفذ أو تحذير أمني جوهري غير محسوم. تُسجل قيود الحصص المجانية وتستخدم البدائل المجانية؛ لا تجاوز للحصص ولا تفعيل billing أو خدمات/runner مدفوعة أو موارد إنتاجية دون موافقة مستقلة. لا يُدّعى تنفيذ اختبار غير مشغّل فعلياً، ولا تحل CI محل اختبارات الأجهزة الحقيقية أو المراجعة البشرية المتخصصة.

**الارتباط:** هذا القرار مكمل لـGOV-DEV-001، ويلزم الفرع الموحد الوحيد `codex/mawda-full-platform-implementation`. المرجع التفصيلي: `docs/MAWADDA_SINGLE_DEVELOPMENT_BRANCH_POLICY_2026-11-20.md`، القسم 11.

**الحالة:** قاعدة حوكمة معتمدة وموثقة؛ لا تمثل بحد ذاتها شهادة أن جميع مكونات المنصة قد اجتازت هذه الاختبارات.


## GOV-DEV-001 / GOV-QA-001 — سجل جولة مصالحة الفروع الأولى (20 نوفمبر 2026)

- جرى حصر 82 ref ومقارنة 78 فرعاً مرشحاً مع فرع التطوير الموحد. أظهرت المقارنة 61 تاريخاً متشعباً و17 فرعاً متأخراً فقط دون commits أمام المرجع؛ هذه أرقام ancestry وليست تصنيفاً نهائياً لسلامة أو فرادة كل تغيير.
- ثبت بتطابق SHA لملفات محددة أن عدة تغييرات في المكالمات والإعلانات والوسائط والهدايا والتحقق بالبريد وأداة حسابات الاختبار موجودة بالفعل في المرجع. لم تُكرر.
- نُقل دليل CI الفريد لتوسعة Validate Mawda، وأُغلقت PRs #26 و#30 و#34 و#35 و#55 كطلبات مكررة/متجاوزة بعد توثيق سبب الإغلاق، مع إبقاء فروعها وتاريخها.
- PR #85 أعيد إلى Draft بعد فشل الاختبارات على SHA المصدر؛ فشل scanner callback test وفشل biometric emulator test. لا دمج حتى إصلاح الفشل وإعادة التحقق.
- PR #31 لتسعير المكالمات الجماعية، وPRs #32/#33 للحوكمة والبيومتري، وPR #39 للخطة الوثائقية، ومصادر الاقتصاد والإعلانات والملصقات، ما زالت تحتاج مصالحة دلالية واختبارات/قرارات محددة؛ لا تُعد مدمجة.
- على SHA `3d4c3d7d0c2a239fa9fab47e8aadee26f349f154` نجح Validate Mawda run `44795349191` وMawdda domain regression run `44795349255`. هذا دليل exact-head لذلك SHA، لا شهادة اكتمال كل المنصة.
- لا دمج إلى `main` أو نشر أو تعديل Firebase الإنتاجي أو تفعيل فوترة. لا حذف فروع أو force-push.
- **الحالة العامة:** المصالحة الشاملة مستمرة وغير مكتملة؛ مرجع التنفيذ الوحيد يبقى `codex/mawda-full-platform-implementation`. التفاصيل وقوائم الفروع والموانع في القسم 12 من `MAWADDA_SINGLE_DEVELOPMENT_BRANCH_POLICY_2026-11-20.md`.


### BIO-002 — Owner reaffirmation and supersession of biometric proof conflicts (2026-11-20)
- **Direct owner decision, reaffirmed in this conversation:** Super Owner's personal review of the submitted evidence and explicit approval alone are sufficient to accept biometric verification. No independent cryptographic device proof, Play Integrity, App Attest, provider/device attestation, automated face/voice matching score, or automated classification is required as a condition of approval.
- **Reward:** immediately after the Super Owner approves the member's verification request, grant the member **1,500 BetaCoins** through the central economy ledger. Grant once for the accepted verification cycle; renewal follows the approved one-calendar-month biometric cycle, independently of the 90-day email-verification cycle.
- **Authority and integrity controls remain mandatory:** only the canonical Super Owner may decide, enforced server-side with owner identity/claim and MFA/session checks; the evidence and decision must be private, versioned and audited; approval/status/reward must commit atomically; idempotency must prevent replay/double credit; retries, expiry, revocation and deletion must follow the final owner policy.
- **Supersession:** this decision overrides every older clause in this repository or source branch that conditions biometric approval, verified status, entitlements, or the 1,500 BetaCoins reward on cryptographic device proof, Play Integrity, App Attest, provider attestation, or automated biometric scoring. Local device authentication may remain an optional local sign-in convenience only; it is not the biometric-verification approval criterion.
- **Implementation status is separate:** this is an approved policy, not a claim that the complete submission/review/reward/renewal lifecycle is implemented or enabled. Keep it fail-closed until server authorization, private evidence handling, audit, atomic ledger grant, idempotency and the required tests pass.



## BUILD-001 — دفعات التطوير وترتيب التحقق وتقليل تشغيل Workflows (اعتماد المالك 2026-11-20)

**قرار معتمد وملزم لجميع مراحل Mawdda وأعمالها اللاحقة:** تمنع التشغيلات العشوائية والمتكررة بسبب التحديثات الوسيطة، ويُعتمد الترتيب التالي:

1. **تجميع التغييرات:** فحص النطاق والتبعيات أولاً، ثم تجميع تغييرات المهمة/دورة العمل الواحدة (الكود والاختبارات والواجهات والوثائق وCI ذات الصلة) في دفعة متماسكة وcommit واحد متى أمكن. لا تُجمع مهام غير مترابطة لمجرد تقليل commits.
2. **CLI السريع أولاً:** اختبارات الوحدات والتحليل والفحص النحوي/النوعي السريع عبر CLI قبل التكامل. تستخدم GitHub Actions runner إذا لم تتوفر بيئة CLI محلية موثوقة، ويجب التصريح بمكان التنفيذ.
3. **تكامل الخادم:** بعد نجاح البوابة السريعة، اختبارات الخادم والأدلة والصلاحيات ودفتر المكافآت والذرية والتزامن ومنع التكرار وقواعد Firestore/Storage على المحاكيات.
4. **Flutter والمنصات المتأثرة:** بعد نجاح اختبارات الخادم المطلوبة، Flutter Analyze وUnit/Widget Tests وبناء المنصة/المنصات المتأثرة فقط.
5. **التكامل الشامل النهائي:** تشغيل حزمة التكامل الشاملة مرة واحدة على SHA النهائي الثابت بعد المراحل السابقة، مع تسجيل SHA ونتيجة كل job/step.
6. **إعادة الاختبار:** عند الفشل يُحدد السبب الجذري ويُصلح أولاً، ثم يعاد الاختبار أو job الفاشل المتأثر فقط. لا تعاد الوظائف الناجحة ولا workflow كاملاً عشوائياً. يستثنى فشل runner/البنية الذي يبطل نتيجة الاختبار مع توثيق السبب.
7. **نطاق التشغيل:** تضبط مسارات workflows بدقة. لا يُشغّل بناء Android عند تعديل واجهات Flutter أو PWA أو الوثائق وحدها؛ يقتصر على ملفات Android وأدوات توليده واعتماديات Flutter الأصلية وملف workflow نفسه. يبقى التشغيل اليدوي متاحاً.
8. **الصفوف وعدم الإلغاء:** لا تلغى عمليات التحقق الجارية تلقائياً لمجرد وصول commit أحدث؛ تُمنع الازدواجية بتجميع التغييرات وتصفية المسارات، وتنتظر العمليات في الصف عند الحاجة.

هذا القرار يسرّع العمل دون خفض الجودة أو الأمن أو تجاوز أي فحص مطلوب. يسري على التطبيق والخادم والاقتصاد والوسائط والبنية والمنصات والوثائق وCI، مع تخصيص الفحوص بحسب الأثر.
