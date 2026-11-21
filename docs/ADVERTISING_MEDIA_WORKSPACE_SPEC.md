# Mawdda — Advertising Department & Media Workspace Specification

**Status:** Owner-approved product requirements for phase-one engineering. This document is a requirements contract, not proof of implementation, legal validity, or production activation.

## 1. Purpose and product boundary

Build the Advertising Department as an independent, auditable subsystem within Mawdda. It is not ordinary member chat plus a media upload button. It includes applicant onboarding and electronic commercial-cooperation agreements; up to five Admin Media 1–5 with individually delegated permissions; an unlimited number of approved Advertising Representatives (مندوب إعلانات معتمد); a dedicated Media Workspace separated from personal chats; structured requests with mandatory creative descriptions; secure media/link intake and previews; owner-controlled per-ad commission terms and acceptance; review, scheduling, publication, emergency pause/withdrawal and geographic distribution; durable notifications, finance handoff, audit evidence and retention controls.

Existing member-to-member chats, personal disappearing messages and personal retention settings must not be reused as the authority or storage model for Media Workspace.

## 2. Roles and capacity

### 2.1 Super Owner (مالك المنصة)

The Owner is the sovereign role. Only the Owner can appoint, suspend, reactivate and revoke Admin Media 1–5; assign and revoke each supervisor's individual permissions; set or change the commission rate for each advertisement; approve final advertising price and duration; confirm actual receipt of advertiser funds; sign/countersign representative agreements for the Company; access the advertising financial ledger and Company revenue reports; override all delegated actions; immediately pause/withdraw any campaign from every placement/feed/cache; and change global geographic configuration.

Delegation never removes Owner override or exclusive commission authority.

### 2.2 Admin Media 1–5

The Owner may appoint **up to five (5)** Admin Media 1–5. Seats may remain vacant. Each supervisor has an independent, server-enforced permission set. Supervisors cannot set, change, accept on behalf of a representative, or override any per-ad commission rate; confirm advertiser payment; access Company-wide financial ledgers or settlements by default; appoint or permission other supervisors; change Owner authority, global security settings or geographic taxonomy; remove or reverse an Owner pause/withdrawal; or delete signed agreements and official evidence.

The Owner may optionally grant the permission advertising.campaign.publish. Even when granted, Owner emergency stop/withdrawal always takes precedence and is enforced server-side across every placement, geographic feed, delivery endpoint and cache invalidation path. A supervisor cannot republish an Owner-withdrawn campaign.

### 2.3 Advertising Representatives

The approved representative role is **مندوب إعلانات معتمد** (Advertising Representative). The number of representatives is not capped by the five-supervisor limit. Each representative has one assigned primary/home geographic scope and may select up to two additional enabled scopes (maximum three total). Representatives can create and submit their own requests, provide advertiser information, mandatory description, media/link, targeting, initial proposed price and requested duration, discuss and follow their own requests, and accept the commission terms set by the Owner for each individual advertisement. They cannot set final price/duration, confirm payment, approve/publish campaigns, manage other representatives or access general financial reports.

Appointment is inactive until both parties complete the approved electronic agreement process.

## 3. Delegated permission catalogue

Permissions are individual capabilities, not broad implicit role powers. The Owner may assign any suitable subset to each supervisor. Default is deny. Permission changes are versioned, audited and enforced server-side.

### Applicant and agreement administration
- advertising.applicants.view
- advertising.applicants.review_profile
- advertising.applicants.request_information
- advertising.applicants.discuss
- advertising.agreements.prepare_and_send
- advertising.agreements.view_status
- advertising.agreements.route_to_owner
- advertising.representatives.activate (must never bypass Owner countersignature)
- advertising.representatives.suspend (within assigned scope; Owner retains override)

### Request intake and review
- advertising.requests.view_assigned
- advertising.requests.view_all
- advertising.requests.assign
- advertising.requests.return_for_correction
- advertising.requests.reject_with_reason
- advertising.requests.review_description
- advertising.requests.review_media
- advertising.requests.preview_external_link
- advertising.requests.validate_geographic_target
- advertising.requests.accept_preliminary
- advertising.requests.route_to_owner

### Non-financial campaign operations
- advertising.campaign.edit_nonfinancial_metadata
- advertising.campaign.propose_schedule
- advertising.campaign.schedule_within_owner_limits
- advertising.campaign.pause_operationally
- advertising.campaign.resume_if_not_owner_blocked
- advertising.campaign.view_delivery_status
- advertising.campaign.view_aggregate_performance

### Optional publication capability
- advertising.campaign.publish
- advertising.campaign.unpublish_operationally

Publication is optional and must be explicitly granted. It never includes authority to change commission, final price, confirm payment or override an Owner stop. If the Owner pauses/withdraws a campaign, delegated publication/resume actions are denied until Owner reauthorization.

### Communication and reporting
- advertising.workspace.message_representatives
- advertising.workspace.message_advertisers
- advertising.notifications.send_approved_templates
- advertising.reports.view_requests
- advertising.reports.export_nonfinancial

### Always denied to supervisors and representatives
- set/change campaign commission rate;
- approve or modify commission acceptance on behalf of a representative;
- confirm advertiser payment receipt;
- administer Company-wide finance/revenue/settlement/payout records;
- grant or alter supervisor permissions;
- change Owner authority or remove Owner emergency controls;
- delete signed agreements, immutable audit events or legally retained financial records.

Any future permission must be introduced through an explicit Owner-approved versioned catalogue and server tests. UI visibility is not authorization.

## 4. Media Workspace

### 4.1 Separation

Create a distinct workspace type named **Media Workspace**. It is not an ordinary direct chat and must not inherit self-destruct behavior, deletion timers or permissions from personal chats.

Each representative sees a dedicated Advertising area in their profile after activation. The workspace supports a private operational conversation with the authorized advertising team; structured requests with unique IDs; per-request media/link previews, status, decisions and commercial terms; versioned messages, actions and official notifications; and access limited to the submitting representative, Owner and supervisors authorized for that scope/task.

The same request record is shown to the representative and authorized administrators with role-specific controls. Shared visibility does not imply shared authority.

### 4.2 Required request form

Every advertising request must include:
- advertiser/client name or approved business identifier;
- contact method and authority to use supplied contact details;
- **mandatory advertising description** explaining exactly what product, service, business or subject is advertised;
- creative type: uploaded image, uploaded video, or external URL;
- uploaded media reference or submitted URL;
- for external URLs: exact URL and source platform/site name;
- required geographic target (supported country/region or All Arab countries);
- initial proposed price and currency;
- requested campaign duration;
- representative identity and server-generated request ID.

The description is required regardless of creative type. It remains part of the official request record after media/link deletion. Validate length, content and prohibited data server-side.

### 4.3 Media and URL security

Uploaded media uses the existing secure media intake path, MIME/content sniffing, size/type/duration checks, malware scanning, quarantine, approved derivative and access-controlled delivery. Do not trust filename extensions or client-supplied MIME.

External URLs are parsed and checked server-side; reject private/local network destinations, unsafe schemes, credential-bearing URLs, invalid redirects and disallowed hosts according to a versioned URL safety policy. Never server-fetch arbitrary URLs without SSRF-safe egress controls. Preview must be isolated and safe; do not auto-play untrusted active content. A submitted link is not proof of content ownership or permission. Capture an authorization declaration and provide moderation/reporting.

## 5. Advertising request lifecycle

Suggested server-authoritative state machine:

draft → submitted_pending_review → under_review → needs_correction | preliminarily_accepted | rejected → owner_terms_pending → representative_terms_pending → payment_pending → ready_to_publish → published → paused | withdrawn | completed | cancelled

The implementation may refine states but must not bypass required conditions.

1. Representative submits; server assigns immutable request/ad ID and records actor/time.
2. Request enters review queue. No auto-publication.
3. Authorized supervisor may review, request corrections, preliminarily accept or reject within granted permissions.
4. Owner approves final price and duration and sets this advertisement's commission rate.
5. Representative explicitly accepts the per-ad commission and commercial terms. Rate change invalidates prior acceptance and requires renewed acceptance.
6. Owner confirms actual receipt of advertiser payment through the approved manual process. A representative/supervisor statement or uploaded receipt is not authoritative.
7. Publication occurs only if all required approvals, accepted terms and Owner payment confirmation are present. A supervisor may publish only if advertising.campaign.publish is granted and all server gates pass.
8. Owner may pause/withdraw any campaign immediately. Owner stop is higher priority than all delegated actions and must invalidate active delivery eligibility and caches. Re-publication requires Owner authorization.
9. Every transition records actor, role, timestamp, previous/new state, reason, request version and idempotency key.

No real-money checkout, payment gateway, advertiser collection or commission payout is authorized by this specification.

## 6. Per-ad commission and financial boundary

There is no global commission percentage, default rate or fallback. Only Owner sets the percentage for an individual ad. Missing rate means incomplete request: no publication and no commission calculation. Representative accepts that ad's exact rate and calculation basis explicitly. A changed rate requires a versioned amendment and renewed acceptance. Store rate/version, acceptance actor/time, eligible amount received, currency, adjustments and ledger references per ad. Keep estimated Company net separate from settled funds. Owner alone confirms receipt and controls the finance ledger. Define refund, cancellation, partial payment, tax, fee, chargeback, dispute, earned-event and payable-event rules before any payout. Payout remains disabled until separate legal/accounting/security review.

## 7. Electronic agreement and email exchange

### 7.1 Official email identity

- Representative's official notice address is the verified email on their Mawdda account. Changing it requires re-verification and an auditable event.
- Company's notice address is the actual official company email stored in approved server-controlled company settings; do not invent or hardcode an unverified address.
- Owner's Firebase identity authenticates the authorized Company signatory. It must be linked to the Company email/authorized actor through verified configuration; Firebase account existence alone is not a signature.

### 7.2 Two-party signing flow

1. System renders exact agreement version/language and privacy notice; representative can review/download.
2. Representative confirms profile data and actively accepts; acceptance is unchecked by default.
3. Step-up verification is sent to the representative's verified email or another approved factor. Server records authenticated UID, exact agreement hash/version, language, UTC timestamp, signature event ID and verification method.
4. Pending countersignature appears in Owner dashboard and a notice is sent to Company's official email.
5. Owner reviews the same immutable version and signs/countersigns from the authorized Firebase account with MFA/step-up.
6. Server records Owner actor, authority, timestamp, authentication context and exact same agreement hash/version.
7. Only after both signatures verify server-side does agreement become active and representative role activate.
8. Generate final read-only copy for both parties and send in-app plus email notices.
9. Preserve every signed version and evidence record. Amendments create a new version and never overwrite a signed document.

Email delivery/return alone is not the signature. It supports notice and evidence, but authoritative acceptance is the in-app, authenticated, version-bound, tamper-evident signing event. Counsel must confirm acceptable electronic-signature level and evidence requirements in relevant jurisdictions. A typed name or email OTP alone is not presumed sufficient everywhere.

## 8. Five-supervisor permission management

Owner dashboard shows five supervisor slots, each independently assignable to an eligible account. Owner can appoint/remove a supervisor; grant/revoke each capability separately; see current permission set and version; set geographic/team scope; suspend/reinstate access; and inspect permission audit history.

All permission changes require Owner authorization and MFA/step-up, server validation and audit logging. Supervisors cannot edit their own permission set or each other's. Do not create five fixed identities or seed supervisor accounts; these are five available appointment slots.

## 9. Owner emergency stop and withdrawal

Owner must have an always-available emergency action to pause/withdraw any campaign, even if a supervisor published it while Owner was unavailable.

The operation must be Owner-only with step-up authentication; server-authoritatively block the campaign; prevent new impressions, playback sessions and delivery; invalidate relevant feed/placement caches and signed delivery tokens as far as technically supported; notify relevant operators; and preserve reason/actor/time. Re-publication requires explicit Owner authorization.

A UI hide or delayed client refresh is not sufficient. Test every serving path and race condition. If instantaneous global withdrawal cannot be guaranteed, fail closed and document the actual maximum propagation behavior before release.

## 10. Retention and deletion

### 10.1 Six-month inactivity policy

The operational Media Workspace conversation is retained for **six months from its last qualifying activity**. After the inactivity deadline, delete operational messages and advertising creative assets/links, except retained records below and any legal hold or active campaign dependency.

### 10.2 Delete after the six-month inactivity period
- operational conversation messages not constituting official notices or signed agreements;
- uploaded advertising images and videos;
- external creative URLs and stored link-preview/thumbnail derivatives;
- temporary preview files and other nonessential creative derivatives.

### 10.3 Preserve
- mandatory advertising description and request/ad ID;
- minimum request metadata needed to explain the transaction;
- signed agreement versions, signatures, hashes and verification evidence;
- formal notices and delivery records relating to agreement/onboarding;
- official advertising submission/approval/rejection/publication/withdrawal notices;
- Owner payment-received confirmations and payment/commission/settlement notices;
- commission-rate versions and representative acceptances;
- financial ledger references, audit events and dispute/legal-hold records;
- required accounting/tax records for the legally mandated period.

Exact retention periods for preserved records must be set after legal/accounting review; do not assume six months is enough or retain forever without basis.

Do not delete media still required by an active published campaign, unresolved payment, dispute, investigation or legal hold. Resolve or explicitly preserve the dependency first. Deletion is server-scheduled, idempotent, retryable and auditable. A client timer must never delete records. Preserve the mandatory description even when media and URL are removed. Owner archive/delete actions follow the same legal/audit safeguards and cannot erase immutable official evidence.

## 11. Notifications and delivery

Notifications are durable, recipient-scoped, idempotent and server-triggered. Events include application received/information requested/accepted/rejected; agreement sent/representative signed/Owner countersigned/activated; ad submitted/correction requested/accepted/rejected; final price and duration set; per-ad commission proposed/changed/accepted; payment confirmed by Owner; ad published/paused/withdrawn/completed; and retention warning/deletion where applicable.

Recipients receive only what their role is allowed to know. A rejection notice goes to the submitting representative and authorized administrators only, not unrelated representatives. Email is a delivery channel, not the source of authorization.

## 12. Suggested data boundaries

Reuse existing architecture and avoid duplicate services. The eventual schema must represent supervisor assignments and versioned permission sets; representative appointment and agreement lifecycle; immutable agreement versions/signature evidence; Media Workspace membership and retention state; ad request/campaign state and immutable transition history; mandatory description and creative references; structured geographic targets and mapping version; per-ad commercial terms and representative acceptance; Owner payment confirmation; durable notification/outbox events; media deletion schedule and legal-hold state; and audit events.

Choose final collection/document names only after inspecting current models, Firestore rules, callable functions and tests. Do not introduce duplicate member identities or parallel chat/message infrastructure without architectural need.

## 13. Security and abuse controls

Server-side authorization on every read/write/action; no client-authoritative role or permission claims. Owner actions require existing Owner authorization and MFA/step-up. Five supervisor seats are maximum active appointments; permission catalogue is explicit and deny-by-default. Representatives see only their own requests, workspace and agreement. Supervisor visibility is scope- and permission-bound. Media/URL intake is quarantined, validated, scanned and safely previewed. Rate changes, price, duration, payment, publication and emergency withdrawal are versioned and audited. Idempotency protects request submission, signature, notification, payment confirmation and state transitions. Avoid logging full personal data, URLs containing sensitive query tokens, payment credentials or private creative contents. Firestore and Storage rules deny unauthorized direct writes; server code owns sensitive transitions.

## 14. Required tests and acceptance criteria

### Roles and permissions
- Owner can appoint up to five supervisors and rejects a sixth.
- Each supervisor has an independent permission set; no self-escalation or peer escalation.
- Every permission is tested for allow and deny at API/rules level.
- Representatives cannot read other representatives' requests or finance data.
- Optional publish permission works only when granted.
- Owner emergency withdrawal blocks all supervisors and all delivery paths, including races and stale clients.

### Agreement
- Verified representative email, changed email re-verification, wrong/expired/replayed OTP.
- Representative signs exact version; Owner countersigns same hash/version.
- Owner denial, missing MFA, altered document hash, duplicate signature and retries fail safely/idempotently.
- No role activation before both signatures.
- Both parties can retrieve their own immutable copy; unrelated users cannot access it.

### Requests and creatives
- Description required for image, video and external-link requests.
- Missing/oversized/unsafe description rejected.
- External URL SSRF, redirects, private IP, unsafe schemes, malformed URLs and untrusted previews rejected safely.
- Media MIME mismatch, oversize, malicious file, scanner unavailable and quarantine failure fail closed.
- Request ownership, geographic scope and duplicate submission idempotency.

### Commercial workflow
- No commission rate: cannot publish or calculate commission.
- Per-ad rate only; no global default.
- Changed rate requires renewed representative acceptance.
- Supervisor cannot set rate, confirm payment or access finance ledger.
- No publication without required approvals and Owner payment confirmation.
- Owner can immediately withdraw a supervisor-published ad.

### Retention
- Inactivity deadline computed from server activity only.
- At six months, eligible messages/media/URLs are deleted; description and official notices/agreement/payment/commission/audit records remain.
- Active campaign, unresolved payment/dispute and legal hold prevent deletion of required media.
- Retries, duplicate scheduled runs and partial failures are idempotent and auditable.
- No live destructive deletion until explicit legal/Owner release gate.

### Notifications
- Durable, idempotent, correct recipient scoping.
- Email failure does not fabricate delivery or approval.
- Rejection and financial notices do not leak to unrelated representatives.

## 15. Implementation status and release gates

This specification is approved for engineering design and development on the development branch only. It does not authorize production deployment, real-money billing, commission payouts, live destructive retention, or merge to main.

Before implementation, inspect existing code, models, owner authorization, chat/message infrastructure, media pipeline, retention/legal holds, Firestore/Storage rules and tests. Reuse existing services where safe. Implement in small reviewable steps with tests. Keep the logo placeholder until the Owner supplies the official asset. Complete legal review before activating agreements or collecting sensitive data.


## Engineering progress note — 2026-11-16

- Added the initial pure permission-domain helper at `functions/src/advertising-permissions.ts`. It defines the five-supervisor capacity, validates the explicit supervisor permission catalogue, reserves commission/payment/finance/Owner countersignature/emergency withdrawal actions to the Owner, and models the publication gates.
- Added focused Node test cases at `functions/test/advertising-permissions.test.js`.
- This is only a first domain-layer building block. It is **not yet wired into callable functions, Firestore/Storage authorization, supervisor management UI, representative onboarding, agreement signing, Media Workspace, request lifecycle, notification outbox, or retention scheduling**.
- No test command or CI workflow run has been observed for these commits. Therefore the new tests are written but **not yet executed or passed**.
- The existing Firestore rules remain default-deny for all not-yet-implemented collections. Do not loosen them to make the new feature appear functional; implement server callables and emulator/rules tests first.


## 16. Owner-approved homepage placement and independent ad viewing

### 16.1 Two distinct homepage destinations

The Mawdda main screen on both the mobile application and web platform must present two separate, peer-level destinations alongside one another:

1. **Media Workspace** — the operational hub for advertising requests, collaboration applications and authorized administrative communication.
2. **Watch Ads / مشاهدة الإعلانات** — the member-facing experience for discovering and watching eligible advertisements, with its own reward-eligibility and reward-accounting flow.

These are separate product areas, not tabs or modes of one shared section. Their navigation entries, route boundaries, access rules, data models and lifecycle responsibilities must remain distinct. A member selecting Media Workspace enters its six-option landing screen; a member selecting Watch Ads enters the ad-viewing experience directly.

### 16.2 Media Workspace landing screen

On entry, Media Workspace presents exactly these six primary options:

1. **Join / Collaboration Applications** — submit an application to cooperate with Mawdda, including an application to become an Advertising Representative. Do not describe the relationship as employment by default; any legal classification requires jurisdiction-specific review.
2. **Message Admin Media** — show the actual currently appointed and active Admin Media 1–5 by their configured display names and permitted contact availability. Never seed fictitious names or expose personal contact details. The maximum is five appointed supervisors, with individually delegated permissions.
3. **Message Admin N** — a distinct route to the Super Owner administration inbox. The Owner can answer directly or assign/route the conversation to a specifically authorized Admin Media. Routing must be auditable and must not grant the assignee broader permissions.
4. **Advertise Directly** — submit a direct advertising inquiry/request as an individual or business without requiring Advertising Representative status or a signed representative agreement.
5. **Creator Content & Influencer Proposals** — a separate intake route for influencers, YouTubers, public-page owners, video creators, photographers and advertising-content producers who want to present their channels, published work, creator portfolio or completed campaigns directly to Mawdda administration for review and possible commercial collaboration.
6. **Featured Ad Viewing Rewards / مكافآت مشاهدة الإعلانات المميزة** — a member-facing information and history route showing the eligibility rules, qualified featured-ad views, earned coin credits and reward history. It is not an advertising-request route and does not grant coins merely when opened; members must enter the separate Watch Ads destination and complete a server-validated eligible view.

These five options must be independently permissioned and route to their respective workflows. Direct advertiser inquiries must not be forced into the representative-only request flow.

### 16.3 Creator content and influencer proposals

This route is distinct from **Advertise Directly**. Direct advertising is for an individual or business seeking to promote a product, service or activity. Creator proposals are submitted by creators who want Mawdda to review and potentially collaborate around their channel, audience, published content, creator portfolio or advertising work. Similar media may appear in both routes, but each request keeps its own request type, review checklist, terms and audit trail.

The intake must support:
- Creator identity and professional/display name, linked Mawdda account, preferred verified contact channel and creator category (influencer, YouTuber, public-page owner, video creator, photographer, advertising producer or extensible Owner-controlled category).
- Platform name and exact public channel/account/post/portfolio URL, with an optional description of the creator's audience and content focus.
- One or more presentation methods: external public URL with source platform/name; secure upload of supported image/video/design media; or a written proposal with title, description and optional attachments.
- Mandatory explanation of the proposed content/collaboration and confirmation that the submitter has the rights or permissions needed to submit the material and authorize the proposed use. A submitted URL is not proof of ownership or usage rights.
- Proposed campaign/collaboration duration, target geography using the existing approved advertising taxonomy, and either a proposed budget/price or an explicit request for an administration quote.
- A server-generated unique request ID, immutable submitter identity and timestamps, versioned attachments/links metadata and idempotency protection.

On submission, create a private creator-proposal record and a private request-bound conversation visible only to the submitter, Owner and explicitly authorized assignees. The Owner may review directly or assign a named supervisor/authorized reviewer within their server-enforced scope. Review includes content/link safety, rights declaration, suitability, geography and commercial feasibility. The parties may negotiate through the private conversation. Every offer must preserve versioned price, duration, geography, placement scope and terms; an amended offer requires fresh explicit acceptance by the creator.

No proposal automatically creates an advertising campaign, inventory reservation, featured placement, publication or reward eligibility. Any resulting campaign must enter the established campaign approval lifecycle, use Owner-approved commercial terms and targeting, and pass the actual-payment-confirmation and publication gates. Creator status does not confer free advertising, priority placement, guaranteed reach, commission entitlement or Watch Ads rewards. Any later conversion into a campaign must preserve the original creator request ID and audit linkage.

### 16.4 Direct advertiser request and administration workflow

The direct advertising form must support structured categories, including but not limited to: image creative, video creative, product promotion, service promotion, company/brand, retail/store, food and beverages, real estate/land, construction/contracting, digital marketing/technology, education/training, travel/hospitality, vehicles, health/beauty/personal care, events, applications/websites/digital services, and Other with a free-text category. The taxonomy is extensible and Owner-controlled; multiple applicable categories may be selected.

The form collects advertiser identity/business name, Mawdda account identity, contact preference, mandatory detailed advertisement description, creative format and secure upload or external URL (including source platform/site name), requested target geography, requested display duration, and proposed/expected budget. The proposed budget may be omitted through an explicit “request an administration quote” choice. The requested duration and budget are proposals only, not accepted price, availability, booking or publication commitments.

On submission, the server creates a unique inquiry/request ID and a private conversation bound to that request. The inquiry enters an administrative review queue and is visible only to the advertiser, Owner and explicitly authorized assignees. The Owner may handle it directly, assign a named Admin Media with suitable permissions, or route it to an Advertising Representative when appropriate. Assignment does not itself authorize the representative to act outside their own role and agreement.

Administration responds through the advertiser's Mawdda account-bound private inbox/conversation. Offers must state the proposed final price, duration, placement/geographic scope and relevant terms. Preserve versioned offers, advertiser acceptance/rejection, assignment history and audit events. No direct inquiry may publish or reserve inventory automatically. Publication requires the existing Owner-controlled approval and actual-payment-confirmation gates. Any later handoff into the representative campaign workflow must preserve the original inquiry ID and audit linkage.

### 16.5 Watch Ads is a separate member-facing system

Watch Ads is a separate homepage destination and a distinct subsystem from Media Workspace. It serves eligible campaigns to members for viewing and may participate in a member reward program. It must not expose advertiser intake forms, representative commissions, supervisor administration controls or Owner finance operations.

The viewing/reward subsystem requires its own server-authoritative eligibility checks, impression/view session identity, completion and fraud validation, per-member limits or policy controls, idempotent reward issuance, abuse/risk signals, and auditable reward ledger. A view must not be counted more than once across overlapping geographic feeds, placements, refreshes or retries. Client-side playback completion alone is not proof of a qualified view and must never authorize a reward. The provisional engineering reward values and qualification rules subsequently approved by the Owner are specified in section 17.4 below. Cash redemption and final launch policy remain unapproved.

Keep member rewards financially and technically separate from advertiser payments, Advertising Representative per-ad commissions and Company revenue accounting, while retaining auditable links to the originating campaign and eligible view event.

The campaign delivery service may supply eligible campaign metadata to Watch Ads, but viewing events and rewards must be recorded by the dedicated viewing/reward domain. Owner campaign pause/withdrawal remains authoritative and must stop eligibility across Watch Ads and every other placement.

### 16.6 Homepage and acceptance criteria

- Both destinations appear as separate peer-level entries on the application and web platform home screens.
- Media Workspace opens a landing screen with the six options above, including the separate Featured Ad Viewing Rewards route.
- Watch Ads opens the member viewing experience, not the Media Workspace request hub.
- A prominent, clearly labelled **Featured Ads + Rewards** button on the member home screen opens the featured-ad discovery experience directly; it must not open the generic attendance reward center or an advertiser intake form.
- Media Workspace's Featured Ad Viewing Rewards route shows eligibility guidance and the member's own reward history only; it does not issue a reward on tap or duplicate the Watch Ads reward path.
- Supervisor names come only from actual active Owner appointments; vacant slots are not represented as people.
- Direct advertiser inquiry is available to members who are not approved representatives.
- Creator content/influencer proposal is a distinct fifth Media Workspace route with URL, secure-upload and written-proposal intake; mandatory rights declaration; private review conversation; versioned negotiation; and no automatic publication, booking, featured priority or reward.
- Direct inquiry assignment, response and handoff are private, auditable and permission-checked server-side.
- Proposed budget/duration cannot be mistaken for approved commercial terms or inventory reservation.
- Viewing/reward events cannot be created by advertiser or representative request workflows.
- A qualified view and reward are idempotent and server-validated; refreshes, replay and concurrent requests cannot multiply rewards.
- Owner withdrawal blocks ad delivery in Watch Ads as well as all other campaign placements.
- Reward amount and provisional view cap are defined only by section 17.4; no cash payout/redemption terms or financial promises are authorized.


## 17. Owner-approved Watch Ads viewing layout and experience

### 17.1 Watch Ads discovery screen

The separate homepage entry **Watch Ads / مشاهدة الإعلانات** opens a dedicated ad discovery screen. Preserve the following two-zone structure:

**Upper zone — featured/preview advertising strip**
- The upper half/upper prominent area contains featured ad previews that rotate/pass in a compact, fast-moving carousel/strip.
- These are previews/promotional highlights only. Merely seeing, scrolling past, or allowing these featured previews to rotate does **not** qualify as a rewarded view and must never issue member rewards.
- Each preview can open the relevant ad detail/player only when the member explicitly selects it.
- Owner-controlled campaign eligibility, geography, schedule, frequency and emergency withdrawal apply to this strip too.

**Lower zone — geographic ad directory**
- The lower area presents selectable geographic categories/regions. Selecting one opens eligible campaigns for that chosen target; do not infer targeting from device language, IP address or current location.
- Use the already owner-approved geographic advertising taxonomy and mapping, not a new overlapping taxonomy:
  1. All Arabic-country advertisements.
  2. Syria.
  3. Lebanon and Palestine.
  4. Iraq and Jordan.
  5. GCC countries.
  6. Egypt.
  7. Tunisia, Libya and Sudan.
  8. Algeria and Morocco.
  9. Europe and Turkey.
  10. Asia and the Middle East.
- Keep the established inclusion rules: campaigns targeting an Arab country appear in the relevant country/group view and the All Arabic ads view; Europe/Turkey or Asia/Middle East campaigns do not appear in All Arabic unless they also target Arab countries. The Owner-controlled mapping is versioned.
- Present campaign cards in a responsive grid, supporting four or eight cards per visible grid/page according to available space and device size. Never fabricate filler ads; provide honest loading, empty, error and no-eligible-campaign states.
- A single campaign impression/view must not be double-counted if the same campaign is reachable from multiple geographic views or placements.

### 17.2 Selected-ad viewing surface — 75% player / 25% persistent app area

When a member explicitly selects an ad card, open a focused viewing surface sized to approximately **75% of the usable application viewport** on mobile and desktop. Preserve approximately **25% of the usable application viewport** as an available lower/context area for the member's other Mawdda activity, such as a conversation, public room or other permitted application content.

This ratio refers to the usable Mawdda application viewport, not the physical display including operating-system status/navigation bars, browser chrome, safe areas or the on-screen keyboard. Respect safe areas, orientation, accessibility scaling and responsive constraints. Do not cover OS controls or trap the member in an unescapable player.

- The selected ad player occupies the upper approximately 75% viewing region.
- The lower approximately 25% remains available for the member's permitted in-app context/activity. It must not be consumed by a full-screen ad overlay.
- On narrow mobile screens, implement an adaptive vertical split; on desktop/tablet, use a responsive player/context layout while preserving the approximate 75/25 allocation of the usable app viewport.
- The player must maintain stable playback and view-session state when the member interacts with the permitted lower context area. Do not count time when the ad is not genuinely visible/eligible under the reward policy.
- Provide clear close/back, pause/resume where supported, accessibility controls, playback/error state, and safe handling of app backgrounding, route changes and connection loss.
- The player must not silently navigate the member away from an existing conversation/room or destroy its state. The lower context remains usable without turning the ad player into a floating overlay that obscures messages or controls.
- If the device cannot satisfy the 75/25 split (for example, keyboard or accessibility layout constraints), degrade responsively and safely; never shrink controls below usable accessibility sizes or falsely claim the exact ratio.

### 17.3 Reward eligibility — discovery previews never rewardable

Only an explicitly selected ad played in the dedicated viewing surface can qualify for a reward. The upper rotating featured previews, thumbnail visibility, ad cards, geographic browsing, opening a category, and passive feed impressions are non-rewardable.

The reward decision is server-authoritative. Client playback callbacks are telemetry only and cannot directly credit coins. A qualifying session must be bound to the authenticated member, campaign, creative/version, server-issued session/nonce and a unique idempotency key. The server validates campaign eligibility, schedule/geography, session start, credible playback progress/visibility, foreground/active state, completion threshold, frequency policy and fraud/risk signals before issuing a single ledger credit.

### 17.4 Experimental starter reward values for development and simulation

The Owner authorizes the following **experimental engineering defaults** so implementation, development and tests can proceed without waiting for final reward policy:

| Setting | Experimental starter value |
|---|---:|
| Reward for one qualified selected-ad view | 2 coins |
| Maximum rewarded views per member per UTC day | 10 |
| Maximum daily reward per member | 20 coins |
| Video qualification | At least 90% of the approved creative duration, with valid foreground/visibility evidence |
| Static image qualification | At least 10 continuous eligible seconds visibly presented in the selected-ad player |
| Duplicate reward for the same member/campaign | At most once per 24-hour rolling period |

These are provisional test values, not launch promises, guaranteed earnings, or a final economic policy. They must be stored in the centralized server-authoritative owner-editable economy/ad-reward configuration, with versioning, validation, audit log and effective-time semantics. Do not hard-code them in Flutter/web clients. The Owner can change reward amount, daily cap, qualifying duration/completion criteria, frequency policy and active state from the Owner control plane without a client release.

A campaign or reward policy with missing/invalid configuration must fail closed (no reward), while still presenting a clear viewing state. The server must atomically enforce the per-day cap, duplicate rules, campaign eligibility and coin-ledger credit. Retries and concurrent sessions must never issue multiple credits. Do not award partial coins for incomplete views. Do not require the member to disable accessibility features or keep audio unmuted as a reward condition.

These experimental values do not authorize paid advertising delivery, real-money payments, cash redemption, withdrawal, or any change to the separately approved coin purchase/payment gates. Rewards are platform coins only in this engineering baseline. Any future cash conversion/redemption requires a separate explicit Owner decision and legal/accounting review.

### 17.5 Watch Ads acceptance tests

- Featured strip rotates previews but creates no rewarded-view event or coin credit.
- Opening a geographic category or browsing its grid creates no reward.
- All ten geographic sections use the existing Owner-controlled mapping and inclusion rules.
- Campaign appears in every applicable region without duplicate impression/reward accounting.
- Responsive grid renders four/eight cards as layout permits, with no fabricated ads.
- Selecting a card opens the focused 75/25 player/context surface on supported mobile, tablet and desktop layouts.
- The lower context remains interactive and existing room/chat state is preserved.
- Backgrounding, hiding the player, pausing, seeking, reconnecting, replaying and changing routes are handled without false completion.
- Video under 90%, image under 10 eligible continuous seconds, invalid session or non-visible playback earns zero.
- Qualified view credits exactly 2 coins under the starter configuration, never more than 10 rewarded views/20 coins per member per UTC day.
- Duplicate/replayed/concurrent requests and cross-region duplicate entries cannot multiply impressions or rewards.
- Changing the owner configuration is versioned and applies according to effective-time rules without altering prior ledger entries.
- Owner emergency withdrawal immediately removes eligibility from the featured strip, geographic cards and active player delivery.

## 18. Economic defaults and pricing continuity

The existing experimental starter prices and durations documented in docs/ROOMS_AND_ECONOMY_PRICING.md, functions/src/economy-pricing.ts and functions/src/default-store-catalog.ts remain the engineering baseline unless the Owner changes them through the approved control plane. Do not replace, reset or duplicate those values merely because Watch Ads is being added.

All present and future commercial prices, durations, variants, purchase availability and rewarded-view settings must remain centralized and Owner-editable, server-validated, versioned and audited. New Watch Ads reward settings must extend the existing economy configuration architecture where appropriate rather than create a conflicting second wallet or coin authority. Keep viewing reward ledger entries distinct by transaction type and source campaign, but integrate them with the canonical wallet/ledger service. Existing purchase gates remain closed until feature fulfillment and acceptance tests pass.


### Legacy client-model compatibility note

A legacy Flutter model currently contains a client-side default field named adWatchRewardCoins with value 20. This is not an authoritative reward policy or server-side entitlement. During implementation, do not trust or use that client default to credit coins. Migrate the effective value to the server-authoritative owner-editable configuration specified in section 17.4, and ensure there is one canonical wallet/ledger credit path. Add compatibility tests so old clients cannot self-award or override the server value.


## 15. Owner-approved featured advertising showcase behavior

The Owner approved the following featured-placement behavior as part of Watch Ads. This section supplements the existing geographic taxonomy, campaign lifecycle, reward policy and delivery safeguards; it does not replace them.

### 15.1 Featured strip is promotional preview only

- The upper featured area is a promotional showcase. Merely seeing, passing, scrolling past or repeatedly viewing an item in this area never qualifies for Watch Ads coins.
- Featured placement impressions, preview engagement, clicks and full eligible rewarded views must be recorded as separate event types and must never be conflated.
- A featured campaign remains attached to its server-defined geographic target. It may be previewed only to eligible audiences/placements within its approved targeting; its full campaign listing must also remain discoverable in the corresponding geographic feed.
- Opening a featured preview does not itself grant a reward. Reward eligibility starts only through the dedicated full-ad viewing flow reached from the relevant geographic feed, subject to the already-approved server-side session, visibility, completion, frequency and anti-replay checks.

### 15.2 Dynamic featured-area modes

The featured area has two server-configured presentation modes:

1. **Priority featured campaigns:** When one or more eligible campaigns have an Owner-approved featured commercial placement, show those campaigns in the featured area according to their approved placement terms, targeting, schedule, availability and delivery limits. Higher commercial value may inform Owner prioritization, but does not create automatic eligibility, guaranteed exclusivity or permission to violate campaign terms.
2. **Automatic rotating previews:** When there is no eligible priority featured campaign, automatically rotate eligible ad previews. Selection must be randomized among the eligible pool rather than sorted by highest view/completion rate. Use a configurable default transition interval of approximately one second, with the exact interval adjustable by the Owner. Apply campaign frequency caps and fair distribution so a single campaign does not monopolize the strip.

If priority campaigns exist but do not cover the current audience/geographic placement or are paused, withdrawn, expired or otherwise ineligible, fall back to the automatic rotating mode for that audience. If no eligible campaigns exist at all, show the designed empty state; never fabricate ads.

### 15.3 Owner controls and measurement

- Owner controls the mode policy, priority designation, eligible campaign set, geographic scope, schedule, rotation interval, frequency limits and ordering/weighting rules through server-authoritative configuration.
- Priority status, commercial value and placement duration must be explicit campaign terms with versioned audit history; do not infer or fabricate prices, bids or guaranteed impression counts.
- An Owner emergency pause/withdrawal immediately removes the campaign from priority and rotating placements and invalidates serving eligibility through the existing emergency-stop contract.
- Random rotation applies only to the fallback preview pool. It must not override targeting, campaign status, safety review, payment-confirmation gates or delivery caps.
- Featured preview views never enter the rewarded-view counter or wallet ledger. Only a validated full-ad reward session from the geographic feed may issue the already-approved experimental reward (2 coins, maximum 10 eligible views / 20 coins per UTC day, same campaign no more than once per rolling 24 hours), with all reward values read from server configuration.

### 15.4 Acceptance criteria

- Repeated featured-strip visibility yields zero reward ledger entries.
- A featured campaign appears only for its approved target audience and also exists in its matching geographic feed.
- Clicking/opening a featured preview does not award coins.
- A full eligible view initiated from the geographic feed can award at most the currently configured reward once, with concurrency/replay protection.
- With eligible Owner-prioritized campaigns, the priority mode is selected; without them, automatic randomized rotation is selected.
- The fallback rotation interval is approximately one second by default and is Owner-configurable.
- Rotation is not ranked by highest view rate/completion rate.
- Paused, withdrawn, expired, geographically ineligible or payment-gate-incomplete campaigns are never served.
- Empty eligible inventory produces an honest empty state, not synthetic content.


### 15.5 Dedicated featured-ad entry point and reward-history route

The Owner approves a prominent member-home entry labelled **Featured Ads + Rewards / الإعلانات المميزة والمكافآت**. Selecting it opens the featured-ad discovery experience directly, without first entering Media Workspace, the generic attendance reward center or advertiser administration.

Media Workspace also contains a separate sixth option labelled **Featured Ad Viewing Rewards / مكافآت مشاهدة الإعلانات المميزة**. This route explains the reward conditions and displays only the authenticated member's qualified-view/reward history, current UTC-day progress and ledger credits when the server integration is ready. It is an information/history surface, not a second reward-claim mechanism.

The two entry points serve different intents:
- Home button: discover and watch featured campaigns.
- Media Workspace reward route: understand and review earned featured-ad rewards.

**Reward safety invariant:** pressing either button, opening either screen, seeing a preview, allowing the carousel to rotate, opening a geographic region or opening an ad card grants zero coins. A reward is credited only after the member explicitly starts the full selected-ad player and the server verifies the approved completion, foreground/visibility evidence, campaign and creative version, member/campaign frequency, daily UTC cap, budget reservation, and replay/concurrency protections.

Featured-ad reward credits must have a distinct ledger transaction type/source marker (for example, `featured_ad_reward`) while using the canonical wallet and the already-approved experimental baseline: 2 coins per qualified view, no more than 10 eligible views / 20 coins per member per UTC day, and no more than one reward for the same member/campaign in a rolling 24-hour window. These values remain Owner-editable server configuration; this route does not create an additional bonus on top of the existing ad-view reward.

The 75% player / 25% persistent Mawdda activity split applies to the selected full-ad player, not to the discovery screen or the home button. The discovery screen must remain responsive and provide honest empty/error/loading states. The lower context area must preserve any existing chat/room state and remain accessible. Commercial featured placement and member reward funding/accounting are separate: an advertiser's commercial payment does not itself mint member coins, and the reward budget must be explicitly reserved by the platform's approved campaign/reward configuration.

Acceptance:
- The homepage button routes directly to the featured-ad discovery route.
- Media Workspace exposes the separate reward guidance/history route as its sixth option.
- Opening or refreshing either route creates no reward claim or ledger credit.
- A qualified featured full view uses the same canonical wallet, a distinct featured-ad source marker, and the existing approved daily/frequency limits without double-crediting the same view.
- The member sees only their own reward history; administrative or other members' ledger records are never exposed.
- If the server reward policy or campaign budget is unavailable/invalid, the experience fails closed with no reward and a clear message.
- Owner pause/withdrawal stops new sessions and prevents completion credit for withdrawn/ineligible campaigns.
