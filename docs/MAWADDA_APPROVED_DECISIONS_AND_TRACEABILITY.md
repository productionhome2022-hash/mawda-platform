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
| GOV-001 | مالك واحد وهوية UID واحدة؛ Owner وSuper Admin تسميتان لهوية واحدة؛ الصلاحيات خادمية وMFA وجلسة حديثة | أساس برمجي موجود؛ تهيئة المالك الفعلي وMFA والاسترداد لم تُقبل بعد | إثبات UID وMFA وsession revoke/audit على non-production |
| ID-001 | التسجيل والبريد والملف الشخصي والاسم الفريد والخصوصية وإقرار سياسة الخصوصية | أساس التنفيذ موجود؛ بعض دورات التحقق والاختبارات الواقعية مفتوحة | اختبارات Auth والأجهزة وتجديد البريد والقانون |
| GST-001 | الضيف: اسم وبلد وجنس فقط، 60 دقيقة لكل 24 ساعة، غرف all_ages، نص وصوت فقط، دون محفظة/متجر/خاص | أساس الضيف ومحاكياته موثق؛ مكافحة تكرار الهويات والاختبارات المادية مفتوحة | اختبارات abuse/App Check والأجهزة |
| PROF-001 | ملفات عامة/خاصة واكتشاف وحظر وإبلاغ وروابط اجتماعية موثقة | واجهات ووظائف أساسية موجودة؛ ربط OAuth الفعلي والتحقق الخارجي ما زال بوابة | اختبارات provider ownership والخصوصية والروابط |
| CHAT-001 | محادثات خاصة وغرف، إيصالات، إشعارات، حظر وإبلاغ واستئناف وصندوق رسائل | callable صندوق المحادثات، حالة غير المقروء، إيصالات القراءة، إخفاء المحادثة عند حظر أي طرف، وشاشة Flutter موجودة؛ قبول الأجهزة/الإشعارات الحية ما زال مفتوحاً | اختبارات تكامل عابرة للحسابات وأجهزة حقيقية |
| MEDIA-001 | الأعضاء: صور/GIF/صوت/فيديو فقط؛ منع PDF والمستندات؛ استثناء المالك المثبت | قواعد وسياسات وفحوص ماسح موجودة؛ GCS/Cloud Run الحي والأجهزة مفتوحة | signed URL، scanner live، MIME، deletion، أجهزة |
| MEDIA-002 | التدمير الذاتي لوسائط الدردشة/الغرف بعد 4 ساعات، بما فيها الأصل والمشتقات والنسخ السحابية القابلة للحذف | منطق احتفاظ/حذف واختبارات محاكي موجودة؛ إثبات الحذف الفعلي من GCS/CDN والنسخ مفتوح | تشغيل non-production وgeneration delete وrestore proof |
| ROOM-001 | غرف عامة/خاصة، إيجارات، مشرفون، فعاليات وRSVP | أساس الغرف والإيجارات والفعاليات واختبارات emulator موجود؛ القبول التشغيلي/الأجهزة مفتوح | lifecycle + notifications + devices + reconciliation |
| CALL-001 | صوت ومرئي منفصلان؛ باقات 24h/7d/30d؛ 5 صوت و3 مرئي لكل 24h متحركة؛ 5 دقائق لكل مكالمة | كتالوج/disclosure جزئي؛ لا محرك WebRTC/Signaling مكتمل | WebRTC/TURN/STUN، quota، entitlement، أجهزة واختبارات |
| CALL-002 | المكالمة المفتوحة استمرار للباقة نفسها بعد استنفاد المتصل حصته؛ 120 صوت/400 فيديو إجمالي بالدقيقة؛ إذا استنفد الطرفان يدفع كل منهما 60/200؛ وإذا استنفد المتصل وحده يدفع 120/400 وحده | القرار موحد الآن في الدستور؛ التنفيذ الخادمي غير موجود | allocation خادمي ذري، metering، idempotency، ledger، consent، rounding |
| WAL-001 | تحويل كوينز ذري بمعرف موحد وسجل المرسل والمستلم والمنصة والعمولة | تنفيذ backend واختبارات emulator موثقة في وثائق الحالة؛ قبول التشغيل الحي غير حاصل | مراجعة reconciliation والاختبارات الحالية وnon-prod |
| STORE-001 | متجر ديناميكي وأسعار ومدة واستحقاقات خادمية؛ لا تفعيل دون fulfillment فعلي | شاشة المتجر تتحقق من purchaseId وitemId وnewBalance قبل النجاح؛ اختبارات emulator تغطي الخصم الذري والسجل والاستحقاق وربطه بالملف الشخصي؛ قبول كل SKU والأجهزة ما زال مفتوحاً | كل SKU مع consumer واختبار end-to-end |
| STORE-002 | الإطارات المتحركة، الأسماء الملونة/المتحركة، التحليلات، التصميم الاحترافي، الأقسام المثبتة، boosts، الثيمات، التحية، VIP والشارات والألقاب | أجزاء من وظائف الاستحقاق والملف الشخصي موثقة؛ لا تعني كل المزايا مكتملة في تجربة المنتج | تحقق كل entitlement عبر كل الشاشة/السيناريو |
| REWARD-001 | 500 كوين لكل دورة بريد 90 يوماً بعد إثبات خادمي | تجديد البريد/المكافأة له أساس backend واختبارات؛ قبول Auth حي مفتوح | اختبارات Auth/device والـ exactly-once |
| REWARD-002 | 1500 كوين لكل دورة بيومترية 30 يوماً فقط بعد إثبات خادمي تشفيري مقاوم للتزوير؛ local_auth وحده غير كافٍ | **معطل fail-closed**؛ لا تمنح مكافأة أو امتيازاً من ادعاء العميل | challenge-bound key proof/attestation، nonce، signature، replay/revocation، ledger |
| OWNER-001 | لوحة المالك: الأعضاء والسلامة والمحادثات والاقتصاد والمتجر والغرف والوسائط والخلفيات والإعلانات والسحابة والتكلفة والنسخ والاستعادة والتدقيق | أجزاء متعددة موجودة؛ مركز العمليات السيادي الكامل غير مكتمل | اختبارات owner MFA، كل وحدة backend، audit، restore |
| AI-001 | مساعد تقني وشخصيات اجتماعية AI مع وسم مرئي صغير، خصوصية، 18+ للرومانسي، ميزانيات وkill switches | رؤية معتمدة، غير منفذة كخدمة مكتملة | gateway، isolation، consent, moderation, safety, budget tests |

| TEST-001 | مركز اختبارات يدوي ومحاكيات وشخصيات تجريبية معزولة | Workflow يدوي، seed محمي بمشاريع demo ومحاكيات فقط، كتالوج personas ومصفوفة تغطية الرحلات موجودة؛ تشغيل مختبر 5000 ما زال يحتاج نجاحاً كاملاً على SHA ثابت | تشغيل كامل exact-head، مراجعة عزل البيئة، ثم تقرير 5000 موثق |
| SIM-5000 | مختبر منفصل لمحاكاة 5000 شخصية؛ المشروع الأساسي يحتفظ بكل الاختبارات العادية | المستودع الخاص أُنشئ ونُقلت إليه ملفات harness؛ تحقق syntax/safety CI نجح في run 43667179459؛ لم يُثبت تشغيل 5000 فعلياً بعد. يتطلب checkout للمستودع الأساسي السري Actions secret باسم MAWDDA_PLATFORM_READ_TOKEN بصلاحية Contents: read فقط | إضافة السر من إعدادات GitHub، ثم تشغيل يدوي على SHA محدد، تقرير 5000، مراجعة العزل والأداء |
| CI-001 | المشروع الأساسي يشغل analyze/unit/integration/security/build فقط؛ لا deploy ولا تغييرات Firebase حية من CI | شجرة التطوير تحتوي ثلاثة workflows للتحقق والبناء فقط؛ Hosting workflow محذوف، والـ native workflow يتحقق من إعدادات non-production الملتزمة دون Firebase CLI أو FIREBASE_TOKEN أو تعديل المشروع. أحدث تشغيل تحقق أساسي على SHA 3c6fdfdf9ad3445748708ac2aec409f95ddf9b9a اجتاز الوظائف الثلاث؛ Android native build اجتاز على التشغيل 43667249374، وiOS كان قيد البناء وقت تحرير هذا السجل | استمرار مراجعة scripts/terraform وملفات التشغيل؛ إثبات iOS native build و5000-persona lab على SHA ثابت؛ لا deploy |
| COST-001 | البقاء على Firebase Spark/Emulator-first؛ لا Blaze أو موارد مدفوعة أو WORM/retention lock دون موافقة منفصلة | خطة التكلفة والدستور يثبتان عدم تفعيل موارد مدفوعة أو WORM؛ لا Terraform apply أو نشر موارد تم بواسطة هذه الأعمال | مراجعة تكلفة/قانون وموافقة مالك مستقلة قبل أي تفعيل |
| REL-001 | لا دمج إلى main ولا نشر إنتاجي إلا بعد بوابات ناجحة وموافقة منفصلة | PR #2 Draft ومفتوح؛ لا دمج ولا نشر | exact-head green، 5000 lab pass، review، release checklist، موافقة مالك مستقلة |

## تصحيح التعارضات المعروفة

1. **فوترة المكالمات:** بعض مسودات 15 نوفمبر القديمة وصفت 60 صوتاً/200 فيديو كسعر مستقل لكل دقيقة، ثم جاءت موافقة أوضح تحدد السعر الإجمالي 120/400. تم توحيد مادة المكالمات في الدستور إلى قاعدة واحدة: 120/400 إجمالي؛ 60/200 لكل طرف فقط إذا استنفد الطرفان الحصة؛ المتصل وحده يدفع 120/400 إذا كان المستقبل لا يزال يملك محاولات. لا يجوز إحياء الصياغات القديمة.
2. **المكافأة البيومترية:** أي نص أقدم يسمح بمكافأة اعتماداً على نجاح نافذة LocalAuthentication أو BiometricPrompt من العميل فقط لا يُعمل به. السياسة الحالية: المكافأة والامتيازات البيومترية معطلة حتى إثبات خادمي تشفيري موثوق مرتبط بالتحدي والحساب والجهاز ومقاوم لإعادة التشغيل والتزوير.
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
| RET-003 | Temporary direct chat deletes all text/media after 4h server inactivity; normal chat media 4h/text 7d; important chat media 4h/text 30d | Server activity timestamps, mode selection and participant notice, scheduled deletion and integration tests for boundaries/retries/derivatives | Approved — reconcile existing 4h/7d baseline with new modes |
| REWARD-003 | Owner-configurable daily, hourly and weekly attendance rewards | Server eligibility/cycle calculation, exactly-once grant, owner configuration, ledger and abuse tests | Approved — implementation to be verified |
| REWARD-004 | Ad-view rewards only after owner-defined duration and trusted server evidence of actual foreground viewing; owner-uploaded ads and future provider adapters | Campaign console, signed/validated provider events or trusted heartbeat protocol, fraud/idempotency tests and audit | Approved — implementation to be verified |
| OWNER-002 | Owner grant center for free coins, features, products, memberships, titles, badges and group/room rewards; target one UID, selected group, all connected users in a selected public room, or collective room/group | Owner-only server operations, attendance snapshot, recipient preview/confirmation, idempotency, recipient histories, wallet ledger and partial retry tests | Approved — implementation not yet evidenced as complete |
| GOV-002 | All future commercial items must integrate with central owner controls; no hardcoded prices/durations/limits in client code | Catalog/entitlement extension contract and CI checks for new SKU integration | Approved — ongoing invariant |

### Clarifications
- The one-week / 200-coin Media Saver value is a provisional test baseline only, not a production price.
- A free administrative grant is not a purchase and must not debit the recipient.
- Existing price changes do not rewrite historic receipts or entitlements.
- The 1,500-coin biometric reward remains disabled until cryptographic server proof and all existing security gates are satisfied.
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
- Current technical ceilings are documented in the comprehensive product vision: image 5MB; GIF 5MB, 30 seconds, 100 frames and 40MP; audio 25MB and 60 seconds; video ingress 100MB and safe derivative 50MB with current processing duration 90 seconds; owner-only PDF 20MB. These are technical safeguards, not commercial entitlements or permission to exceed quotas. Changes require a documented storage/egress/processing/retention cost assessment and owner approval.

**Implementation evidence required:** scanner unit tests for both chat and room purposes; emulator integration tests for member direct chat, public room, rented private room and guest room; client recording timers set to 60 seconds; exact-head Flutter, Functions, scanner and rules CI. Physical-device and live non-production media tests remain separate release gates.
