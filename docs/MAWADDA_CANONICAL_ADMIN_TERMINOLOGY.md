# Mawdda Platform 2026 — Canonical Administrative Terminology

**Status:** Approved naming standard. This document governs display terminology; it does not itself grant permissions or authorize a role migration.

## Canonical role names

| Role | Display name | Capacity | Scope |
|---|---|---:|---|
| Platform owner | **Super Owner**; Arabic **المالك الوحيد وصاحب الصلاحيات المطلقة والسيادية** | Exactly one | Sole actual platform owner; sovereign authority over every platform domain, system and administrative function. No Admin or other role may become a co-owner or inherit owner sovereignty. |
| General administration | **Admin 1, Admin 2, Admin 3…**; Arabic **أدمن 1، أدمن 2، أدمن 3…** | Open-ended | Appointed by Super Owner to assist with platform administration; each Admin receives only the specific permissions explicitly delegated by Super Owner. The Admin title grants no automatic sovereign or unrestricted authority. |
| Media administration | **Admin Media 1–5**; Arabic **أدمن ميديا 1–5** | Exactly five | The five general administrators of the integrated Advertising Department and Media Workspace system, covering both advertising and the Media Workspace. This is a separate role family from platform Admin and production supervisors. |
| General production supervision | **المشرف العام للإنتاج 1–5** / **General Production Supervisor 1–5** | Exactly five | The five general production supervisors. Preserve this exact Arabic title; they retain their defined sending permissions. They are distinct from Admin Media and Team Production Supervisors. |
| Team production supervision | **مشرف إنتاج الفريق** / **Team Production Supervisor** | Open-ended | Open-ended number of supervisors; each is scoped to the assigned team and its specific assigned/rented room only. |

## Separation and authorization

- Super Owner is the sole platform owner and final sovereign authority across all platform domains.
- Admin N is appointed by Super Owner and receives only individually delegated permissions; Admin N is independent of Admin Media, General Production Supervisor and Team Production Supervisor.
- Admin Media is not a general platform Admin and does not inherit general production authority. Admin Media 1–5 jointly cover the Advertising Department and Media Workspace as one integrated administrative scope.
- General Production Supervisors do not inherit Admin Media authority or team-room authority. Their canonical Arabic title is exactly «المشرف العام للإنتاج» (five seats), not «مشرف إنتاج عام».
- Team Production Supervisor is scoped to the assigned team/room and cannot act across other teams. Its canonical Arabic title is exactly «مشرف إنتاج الفريق» and its capacity is open-ended.
- Each role is deny-by-default and server-authorized. Display labels must never be parsed to make authorization decisions.
- Admin N sequence numbers are permanent and must never be reused. The reappointment/number-reuse rule for the fixed five-seat Admin Media and General Production groups remains unresolved; do not infer or implement a reuse policy until the owner explicitly approves it.
- Super Owner authority belongs exclusively to the single actual owner identity and covers the entire platform. No Admin appointment, Admin Media appointment, production assignment or delegated permission can grant, reproduce or transfer Super Owner authority.

## Compatibility

This is a user-facing naming standard, not a wholesale identifier migration. Preserve stable claims, role IDs, Firestore fields, collection names and callable names where required for compatibility. Legacy identifiers may remain internal-only and must not leak into user-visible copy. In the inspected implementation, `SuperAdminScreen`, `SuperAdminSecurityService`, `isSuperAdmin`, and the callable display-mode key `super_admin` are legacy/internal compatibility identifiers; they are not canonical user-facing role names. Preserve them until a separately reviewed, tested migration proves all call sites and authorization contracts remain safe. The backend owner authority is checked through the trusted `platformOwner` claim/session helpers; never replace that check with a client-side display label or boolean.

## Required coverage

Apply the terminology consistently to Android, iOS, PWA and web; profiles, badges, chat participants, room member lists, workspaces, advertising, production screens, notifications, push messages, email templates, audit-log presentation, errors/success messages, and all supported locales.

## Acceptance gate

Before release, run a repository-wide search for legacy owner and supervisor labels, classify each match as display text, documentation, historical note or internal compatibility identifier, and verify every user-visible match. Add regression tests for role capacity, numbering, scope separation and display terminology. Do not claim global completion based only on a few screen labels.

## هوية الجهة المالكة والعلامة المؤسسية — Production Home Company

- الجهة المالكة للمنصة وفق اعتماد مالك المشروع: **Production Home Company**. ويُعتمد شعار الشركة الذي زوّد به المالك بتاريخ 19 نوفمبر 2026 بوصفه أصل الهوية البصرية المؤسسية المرجعي في مستندات Mawdda واتفاقياتها الإلكترونية.
- **Super Owner** هو المسمى الوظيفي/التمثيلي المعتمد لمالك المنصة في الواجهات والمراسلات. وفي العقود والاتفاقيات تكون صياغة الطرف الممثل: **Production Home Company، ممثلةً بواسطة Super Owner (مالك المنصة)، أو من يفوضه تفويضاً صحيحاً وموثقاً**، مع استكمال الاسم القانوني المسجل وبيانات التسجيل والعنوان والتوقيع بحسب ما يقدمه المالك ويعتمده قبل استخدام أي قالب قانوني.
- لا يُفترض أن عبارة Super Owner وحدها تحل محل الاسم القانوني للشخص أو الكيان أو تمنح سلطة توقيع تلقائية. يجب أن تُظهر النماذج صفة الموقّع وسند تفويضه، وأن تظل حقول بيانات الطرف القانونية قابلة للاستكمال والتحقق. لا تُخترع أرقام تسجيل أو عناوين أو أسماء ممثلين.
- يسري معيار الهوية هذا على اتفاقيات التوظيف والتعاون ومقدمي الخدمات والشراكات، وعقود الإعلانات والحملات التجارية، وأوامر العمل والموافقات والملاحق والفواتير/المستندات المرتبطة بها، مع مراجعة قانونية محلية قبل تفعيل أي نموذج للتوقيع.
- يوضع شعار Production Home Company في رأس/ترويسة العقود والاتفاقيات الإلكترونية وفي صفحات الغلاف أو التذييل بحسب تصميم القالب، مع الحفاظ على نسبه وألوانه ووضوحه وعدم تشويهه. لا يُعد إدراج الشعار وحده إثباتاً للتوقيع أو الصفة القانونية.
- يُعتمد الشعار أيضاً كأصل خلفية/هوية مرئي ضمن قسم مشاهدة الإعلانات وMedia Workspace، على أن يكون التنفيذ اللاحق عبر نظام الأصول والخلفيات المعتمد: نسخة محسّنة ومهيأة للأحجام المختلفة، خلفية لا تحجب المحتوى، وتوزيع هندسي واضح للأزرار والبطاقات مع تباين وإتاحة جيدين. لا يُستبدل الشعار أو يُنشر أصل معدل قبل مراجعة واعتماد المالك.
- الملف المرفق في محادثة المالك هو المرجع البصري الأولي. إدراجه الفعلي كملف binary داخل المستودع، وإنشاء نسخ شفافة/عالية الدقة أو مؤثرات بصرية، وتنفيذ خلفيات التطبيق والعقود هي أعمال أصول وتصميم وتنفيذ لاحقة؛ لا تدّعي هذه الوثيقة أنها أُنجزت بمجرد اعتماد المرجع.
- لا يُسمح باستخدام الشعار في إعلانات أو عقود منشورة خارج المنصة أو توزيعها فعلياً دون مراجعة المالك وموافقته على النسخة النهائية.
