# Room rentals and editable economy prices

## Owner-approved engineering baseline — 2026-11-16

The platform owner explicitly authorizes the starter prices and durations in this document and in the server-side default catalogs to be used as **initial experimental values for implementation, development, emulator tests, and the isolated 5,000-persona simulation**. They are not final commercial prices or a commitment to launch at these values. The owner may revise prices, durations, package availability, and related economic settings through the Super Admin / Owner controls before launch, including after phase-two simulation.

Do not block engineering work merely because final commercial prices have not been selected. Keep values centralized, validated server-side, versioned, and audited. Do not hard-code price copies into client purchase authority. Price configuration does not authorize live payment processing, real-money checkout, production activation, or billing.

All amounts below are experimental starter values, not fixed commercial commitments. Callable validation, versioning and audit logging remain server-side.

## Private room rental (coins)

| Plan | Duration | Experimental price |
|---|---:|---:|
| room_30d | 30 days | 1,000 coins |
| room_90d | 90 days | 2,700 coins |
| room_180d | 180 days | 5,000 coins |
| room_365d | 365 days | 9,000 coins |

The member room flow reads published plans, displays the current price, and submits the displayed price as an expected-price confirmation. The server re-reads the current plan and performs the coin debit, room creation, rental receipt and wallet ledger write in one Firestore transaction. Request IDs make retries idempotent.

Renewal uses the same server-side pricing and transaction rules. Existing rental expiry is extended from the later of now or the current expiry. Expired rentals enter a 24-hour frozen grace period, then close without deleting room history. Closing does not refund already-consumed rental time. Ownership transfer requires an eligible existing room member and is audited. Members can leave rooms; owners must transfer or close first.

## Premium store starter prices (coins)

These are editable starter catalog rows. The owner catalog seeds missing rows only and never overwrites an existing owner-edited item. A row may be published for display when its feature fulfillment is ready, but **purchaseEnabled remains false on first seed**. Charging remains fail-closed until the matching fulfillment implementation and acceptance tests are complete and the owner explicitly enables purchasing. Items whose fulfillment is not ready remain unpublished/inactive.

| Item | Suggested price | Duration |
|---|---:|---:|
| VIP membership | 5,000 | 30 days |
| Custom title | 800 | Permanent |
| Special badge | 1,200 | Permanent |
| Animated avatar frame | 2,500 | 30 days |
| Colored username | 1,200 | 30 days |
| Animated username | 3,000 | 30 days |
| Profile analytics | 1,800 | 30 days |
| Professional profile layout | 3,500 | 30 days |
| Pinned profile section | 900 | 30 days |
| Discovery boost | 1,500 | 7 days |
| Profile theme/background | 2,000 | 30 days |
| Visitor greeting | 1,000 | 30 days |
| Hide coin balance | 1,000 | 30 days |
| Ghost mode | 1,800 | 7 days |
| Voice calls entitlement | 100 / 500 / 1,500 | 24 hours / 7 days / 30 days |
| Video calls entitlement | 250 / 1,250 / 3,750 | 24 hours / 7 days / 30 days |

Voice/video call plans require entitlement checks for both participants. Their catalog entries remain inactive and non-purchasable until the complete call entitlement and fulfillment flow is implemented and tested.

## Coin packages (EUR, price in euro cents)

## Coin purchase channel configuration

The owner is one person holding both Owner and Super Admin titles under one canonical owner UID.

- **Manual owner contact:** default supported purchase channel. The owner may enable/disable it and select which coin packages are offered. A custom quantity is submitted as a request and handled only through the member's direct conversation with the owner; the owner sends the negotiated payment instructions and approves issuance after independently verifying payment.
- **Automated provider checkout:** future optional channel, disabled by default. It can later be enabled for selected fixed packages only after a provider contract, secure provider adapter, signed server-to-server confirmation, replay/idempotency protection, refund/chargeback and reconciliation workflows, fraud controls, tax/legal review, and explicit owner activation are complete.
- The owner controls channel and package availability separately. When automated checkout is disabled, members see the manual contact route, not a simulated checkout.
- Custom-quantity requests remain manually negotiated by the owner; they do not use automated checkout under the current approved scope.
- No client redirect, screenshot, self-declared payment or unverified callback can issue coins. Manual approval or verified provider settlement must precede the atomic wallet/ledger credit.
- Do not store card details or bank credentials in the app or Firestore.

| Package | Coins | Suggested price |
|---|---:|---:|
| Starter | 1,000 | €0.99 |
| Value | 5,500 | €4.99 |
| Premium | 12,000 | €9.99 |
| Pro | 30,000 | €19.99 |
| Elite | 65,000 | €39.99 |

## Advertising starter schedule (EUR, price in euro cents)

| Placement | Model | Suggested price |
|---|---|---:|
| Banner | CPM (per 1,000 impressions) | €2.50 |
| Interstitial | CPM (per 1,000 impressions) | €5.00 |
| Sponsored room | Daily | €10.00 |
| Profile boost | Daily | €5.00 |

These are editable pricing schedules only. They do not represent ad delivery, billing, invoices, tax handling or a payment checkout. The server deliberately returns realMoneyCheckoutEnabled=false; do not collect money or mint coins until a payment provider, refunds, fraud controls, reconciliation, taxes and legal review have been integrated and tested.


## Owner-controlled pricing and duration contract — all monetized features

This requirement applies platform-wide, not only to the starter catalogues listed above. Every present or future feature involving money, coins, sale, purchase, top-up, booking, rental, calls, paid access, paid promotion, or any other material/economic exchange must expose its configurable commercial terms to the authenticated Super Admin / Owner control plane.

For each applicable product, service, plan, package, booking or entitlement, owner-manageable fields must include as relevant:

- Price and currency or coin denomination.
- Duration, expiry period, billing interval, rental term, or entitlement validity.
- Available variants, quantities, tiers, and package options.
- Publication/availability, activation, suspension, and purchase eligibility.
- Any configurable limits or terms that affect what the member receives.

Engineering requirements:

1. Keep economic settings in centralized server-authoritative configuration/catalogues. Do not scatter authoritative prices or durations across client code.
2. The owner must be able to create or edit supported prices and durations from the Super Admin / Owner UI without an application code change or client release.
3. Validate every update on the server, enforce owner authorization and required MFA, version the configuration, and write an audit record.
4. A purchase, renewal, booking, rental or call-entitlement transaction must read the current authoritative configuration on the server and atomically apply the applicable price, duration, wallet/ledger changes, receipt and idempotency controls.
5. A client-submitted price or duration is only an expected-value confirmation; it is never authority. Reject stale price/version confirmations safely and require the member to confirm the current terms.
6. Preserve the terms already accepted for an existing order or active entitlement where contractually appropriate; changing the catalogue must not silently rewrite historical receipts or unexpectedly shorten/extend an existing paid term.
7. If a feature's fulfillment, refund/cancellation, or entitlement lifecycle is not implemented and tested, keep its purchase/booking gate disabled even when an experimental price is configured.
8. Starter values are experimental engineering defaults. The owner may revise them before launch, including after phase-two simulation. This authorization does not enable live payment processing, production changes, billing, or deployment.

This contract is a cross-cutting acceptance requirement for all monetized modules and all future additions. The catalogue examples above are not an exhaustive list of monetized features.


## Advertising, ad viewing, and time controls

Advertising is explicitly included in the owner-controlled economic and scheduling contract. The Super Admin is the primary control authority, with the Owner retaining the platform's sovereign authority. No advertiser, member, client app, or ordinary administrator may override these settings.

The Super Admin / Owner control plane must be able to configure, as applicable to each advertising format and campaign:

- Pricing and billing model (including CPM, CPC, fixed-period or other supported models).
- Ad/campaign start and end dates, active time windows, timezone, days of week, and total campaign duration.
- Creative duration / playback length for video or animated placements, plus any supported minimum/maximum viewing or display interval.
- Placement availability, eligible surfaces/audiences, priority/rotation, and pause/resume/expiry.
- Per-member frequency caps, repeat intervals, daily limits, and other display throttles.
- Any rewarded-view rules, including required watch duration, completion criteria, reward amount/type, eligibility, and per-member limits, if rewarded advertising is implemented.
- Campaign budget or delivery limits where supported, and the controls to stop delivery when a configured limit or schedule is reached.

All time, schedule, playback, viewing, repetition, reward and pricing rules must be server-authoritative and editable by the Super Admin / Owner without a client application release. Client-side timers or self-reported view completion must not independently authorize rewards, charge advertisers, or establish billable impressions. Record verifiable delivery/view events and apply idempotency and anti-fraud checks server-side.

Do not invent a universal ad playback length, viewing threshold, reward, or frequency cap as a final policy. Use clearly marked experimental defaults only where needed for development and tests, and make every such value owner-editable. Keep actual ad delivery, advertiser billing, and rewarded-view issuance disabled until their complete server-side verification, accounting, fraud controls, and acceptance tests are ready.


## Advertising geographic sections and member-facing interfaces

The member-facing Advertising area must expose the following initial browse interfaces in this order:

1. **All Arabic ads** — all eligible advertisements whose geographic targeting includes one or more Arab countries. This is not a worldwide/all-countries feed.
2. **Syria** — Syria only.
3. **Lebanon and Palestine** — one shared interface for Lebanon and Palestine.
4. **Iraq and Jordan** — one shared interface for Iraq and Jordan.
5. **Gulf Cooperation Council (GCC)** — the GCC member countries.
6. **Egypt** — Egypt only.
7. **Tunisia, Libya and Sudan** — one shared interface.
8. **Algeria and Morocco** — one shared interface.
9. **Europe and Turkey** — one shared interface.
10. **Asia and the Middle East** — one broad regional interface.

There is no interface or targeting category named "Levant". Syria is its own interface; Lebanon and Palestine are grouped together; Iraq and Jordan are grouped together. The remaining groupings above stay as listed.

### Required geographic targeting when an ad is submitted

Every ad submission must include a required **Target geographic area** field, whether the ad creative is uploaded from the moderator's device or supplied through an external ad URL. The submitter chooses a supported country or region, for example:

- Egypt → Egypt interface and All Arabic ads.
- Syria → Syria interface and All Arabic ads.
- Lebanon or Palestine → Lebanon and Palestine interface and All Arabic ads.
- Iraq or Jordan → Iraq and Jordan interface and All Arabic ads.
- All Arab countries → All Arabic ads and all applicable Arab country/region interfaces.

The targeting selector must support both a specific country and the explicit **All Arab countries** target. For grouped interfaces, selecting either member country routes the ad to the corresponding shared interface. A non-Arab target such as Europe/Turkey or Asia/Middle East is routed to its corresponding regional interface and is not included in All Arabic ads unless the campaign also explicitly targets Arab countries.

The selected target is stored as structured server-side campaign data. Country-to-region membership is maintained as versioned configuration controlled by the Super Admin / Owner, not inferred from language, IP address, or device locale. Country targeting remains distinct from language targeting. Validate the selected target against the current supported-country/region configuration on the server.

### Advertising feed behavior

- All Arabic ads aggregates only currently eligible campaigns targeting Arab countries; it does not include every country worldwide.
- Regional feeds show campaigns eligible for their configured countries/regions.
- A campaign can appear in All Arabic ads and its matching regional feed(s), but one actual impression/view must not be counted or rewarded more than once because it was discoverable through multiple interfaces.
- Apply campaign dates, time windows, frequency caps, member eligibility, placement rules and delivery limits consistently across all feeds.
- Respect campaign targeting and member privacy. Do not expose advertiser targeting criteria or another member's personal/location data.
- If a member has not supplied or selected a country/region, do not silently infer a precise location. All Arabic ads may still be browsed as a broad feed; regional personalization requires an explicit supported country/region selection or another owner-approved privacy-safe basis.
- Each interface needs loading, empty, error and no-eligible-ad states. Never fabricate ads to fill a feed.
- The Super Admin / Owner can manage regional definitions, supported countries, section availability and ordering through versioned, audited controls.
- These browse interfaces do not themselves activate advertiser billing or rewarded viewing. Those remain gated by the advertising readiness requirements above.

### Advertising upload moderators — unlimited count and up to two additional geographic scopes

The number of advertising upload moderators is **unlimited**. No fixed cap such as 36 may be enforced as a product or database limit. The Super Admin / Owner may appoint, suspend, reactivate, and revoke any number of moderators, subject to ordinary platform security and operational safeguards.

Each moderator has one assigned **primary/home geographic scope** associated with the country or region in which the moderator is registered. In addition to that home scope, the moderator may select **up to two (2) additional geographic targets** from the currently supported targets. Therefore, a moderator may submit advertising requests for up to three scopes in total: the assigned home scope plus two additional scopes. The additional targets may be any supported country or region made available by the Owner, including All Arabic countries, another Arab country/group, Europe and Turkey, or Asia and the Middle East. The moderator cannot change or bypass the assigned home scope, select more than two additional targets, or expand their own permissions. The server must enforce these limits and validate every selected scope against the current versioned geographic configuration.

#### Moderator submission permissions and proposed commercial terms

Moderators may prepare and submit advertising requests with the following capabilities:

- Upload image and video advertising creatives from their devices, subject to platform media type, size, duration, safety and malware checks.
- Submit external advertising links or external video playback/streaming URLs hosted by other platforms, subject to server-side URL, destination, redirect, content and safety validation.
- Select their assigned home scope and up to two permitted additional geographic targets.
- Enter the advertiser/client details and the campaign request information.
- Propose the **initial/requested price** agreed with the advertiser and submit it for Owner review. This is a proposal only and is not the authoritative final price.
- Propose/request the advertising duration. Duration is an editable request field available to the moderator and is also editable/confirmable by the Owner. The moderator's requested duration is not approved until the Owner confirms it.
- Submit the request into the Owner approval queue and view the status of their own submissions.

Moderators cannot set the final approved price, confirm payment receipt, approve or publish campaigns, manage other moderators, change platform-wide geographic mappings, access the advertising financial ledger/revenue reports, or access unrelated administrative functions. They cannot grant themselves broader geographic scope or permissions.

#### Shared advertising request workspace and role-specific decisions

The moderator and Super Admin / Owner use a shared advertising-request workspace backed by the same request record and creative asset. This is a shared view of the request and its review history, not shared authority: each role sees the same core request facts while controls and permitted actions are enforced by server-side role authorization.

The shared request view must include the request and advertisement identifiers; submitting moderator identity; advertiser identity/contact details; the exact image/video creative or a safe playable preview; validated external destination/playback URL where applicable; selected geographic targets; initial proposed price; requested duration; current Owner decision; final approved price and duration when set; payment-confirmation state; publication state; timestamps; review notes and audit history. The Owner must be able to inspect the actual creative (view the image, play the video, or safely open/preview the submitted link) before deciding whether to publish it. A metadata-only request view is insufficient.

Role-specific actions are:
- **Moderator:** create and submit the request, enter the advertiser-agreed initial proposed price, propose the requested campaign duration, supply the creative/link and targeting, respond to correction requests, and follow the status of their own requests. The moderator may not approve their own price, set the final price, confirm payment, approve publication, or alter the Owner's decisions.
- **Super Admin / Owner:** accept or reject the initial proposed price; optionally increase or decrease it; set and approve the final price; propose, adjust and exclusively approve the final campaign duration and schedule; inspect the creative and targeting; record actual payment receipt; and approve or reject publication.

The initial price is a moderator-provided proposal. Price increase/decrease is an optional Owner action, not a mandatory step. The Owner must explicitly record the final approved price even when accepting the initial proposal unchanged. The moderator may propose a duration; the Owner may also enter or revise a proposed duration during review, but only the Owner can set and approve the final duration. The approved price and duration must be visible in the shared request view before payment confirmation and publication.

Every state transition and commercial-term change must be validated server-side and recorded with actor, role, timestamp, previous value, new value, reason where applicable, and configuration/version identifiers. The shared UI must not grant permissions by hiding or showing controls alone; backend authorization is mandatory.

#### Advertising decision notifications and financial handoff

When the Owner approves publication after reviewing the creative and final terms and recording actual payment receipt:
- Notify the submitting moderator in their advertising dashboard.
- Show the approval event in the Super Admin advertising dashboard.
- Emit a corresponding financial/economic notification or auditable event in the separate Owner financial/economy area, outside the advertising workspace, identifying the campaign/ad number, advertiser, submitting moderator, approved amount, approved duration, payment-confirmation status and approval time.
- Publish the campaign only after both Owner publication approval and Owner-recorded payment confirmation are present.

When the Owner rejects a request, notify the submitting moderator only. Record the rejection, reason, actor and timestamp in the Owner-side request history and audit log. The rejected request must remain unpublished. Do not send a rejection notification to unrelated moderators or expose the Owner's financial ledger to upload moderators.

Notifications must be durable, recipient-scoped, idempotent and generated from the server-side state transition; a client-side message or screen action is not proof that approval, payment or publication occurred.

#### Owner review, final price, payment confirmation and publication

Every moderator submission must enter a **Pending Owner Approval** queue in the Super Admin / Owner advertising dashboard. No campaign is automatically published after upload or technical validation.

Each queue item must show, at minimum:

- Moderator name and unique moderator/account identifier.
- Submission/request ID and advertisement/creative ID.
- Advertiser/client identity or supplied reference and contact details.
- Selected target scope(s), clearly distinguishing the moderator's home scope from the additional target(s).
- Moderator-proposed initial price and currency, and advertiser-requested duration.
- Creative preview or validated external playback link.
- Owner's final price field, Owner-confirmed duration and campaign schedule fields.
- Payment verification state and complete review/audit history.

The moderator's proposed initial price is the starting commercial offer. The Owner may accept it or negotiate with the moderator/advertiser and increase or decrease it. **Only the Owner/Super Admin records the final approved price and confirms the final campaign terms.** The Owner may also approve or adjust the requested duration and scheduling details. The system must preserve the original moderator proposal and every subsequent Owner revision in the audit history; it must not silently overwrite the proposal.

The Owner independently confirms actual receipt of the agreed amount through the approved manual/out-of-platform process and records that confirmation in the system. A moderator's statement, payment claim, uploaded file, URL, or client-side action is never proof of payment. The Owner then explicitly approves or rejects the advertising request. Only after both (a) Owner approval of the creative, targeting and final commercial terms, and (b) Owner-recorded payment confirmation may the server publish/activate the campaign in the approved geographic interface(s), including All Arabic ads when the selected target includes Arab countries.

The Owner alone controls the final price, payment confirmation, publication approval, campaign activation, and access to the advertising financial ledger and revenue reports. Until approval and payment confirmation are both recorded, the campaign remains unpublished and non-billable. Rejection, return-for-correction, cancellation and expiry states must be recorded. This manual workflow does not enable live payment processing or advertiser billing.

#### Per-advertisement moderator commission — Owner sets each rate individually

There is **no platform-wide or global default advertising commission rate**. Do not configure, assume, seed, display or apply a universal advertising commission percentage.

For every individual advertising request/campaign, the Super Admin / Owner explicitly sets the moderator commission percentage for that advertisement. The rate may differ from one advertisement to another and is not inherited from a global default. The Owner may set any rate permitted by the Owner's validated administrative policy and applicable law. The moderator cannot set or change the rate.

The shared request workspace must show the per-advertisement commission rate, calculation basis, commission amount and Company net estimate. The moderator must explicitly accept that campaign-specific rate and commercial terms before the campaign is committed for publication processing. If the Owner changes the rate after the moderator's acceptance, the change requires renewed explicit moderator acceptance and must be recorded as a versioned amendment. Silence or continued login is not acceptance.

Each request must preserve its own commission rate, rate version, moderator acceptance evidence, calculation inputs, currency precision, adjustments and final ledger entries. The rate accepted for one advertisement must not affect any other advertisement. There is no global rate to fall back to when a campaign rate is missing: the request must remain incomplete and ineligible for publication/commission calculation until the Owner explicitly sets its rate.

The commission is attributed to the moderator who submitted the advertiser's request. The intended calculation is: eligible amount actually received and confirmed by the Owner × the explicitly accepted rate for that advertisement = moderator commission. The intended eligible base excludes separately identified taxes, refunds, chargebacks and pass-through fees where applicable, subject to counsel-approved accounting rules. The interface must separately display gross amount, per-ad commission rate, commission amount, separately accounted deductions and estimated Company net; never label an estimate as settled cash.

Before any commission is treated as payable or paid, implementation must define and test treatment of refunds, cancellations, taxes/fees, partial payments, chargebacks, disputes, and the exact point at which commission becomes earned and payable. No live commission payout is authorized by this configuration alone.

#### Moderator electronic commission-only agreement

Moderator appointment must be governed by a versioned electronic commission-only agreement between **Production Home Company** and the moderator. The agreement workflow must capture only legally necessary personal/contact details in a secure restricted onboarding flow, clearly disclose that commission is determined separately for each advertisement by the Owner, and record the moderator's acceptance of each campaign-specific rate plus the Owner's countersignature/approval of the agreement with tamper-evident version/hash and timestamps. The signed agreement and its evidence must be accessible only to the moderator concerned and authorized Company roles. No sensitive identity documents or bank details may be collected until legal basis, secure storage and retention controls are approved.

The agreement draft and product requirements are maintained in [ADVERTISING_MODERATOR_COMMISSION_AGREEMENT.md](ADVERTISING_MODERATOR_COMMISSION_AGREEMENT.md). It is a draft for jurisdiction-specific legal review, not a declaration of legal enforceability or an active contract.

### Advertising revenue and earnings management

Provide a dedicated advertising revenue management view for the Super Admin / Owner, separate from the upload-moderator interface. It should support auditable reporting, as applicable once billing is implemented, for campaign sales, billable impressions/clicks, gross revenue, refunds/credits, fees/costs, net revenue, outstanding amounts and settlement status. Reports should be filterable by campaign, advertiser, geography, placement and time period, with exportable audit/report records where supported.

Only the Super Admin / Owner may view financial totals or configure commercial terms, advertiser billing, revenue recognition, refunds, settlements or payout settings. Upload moderators must not see financial reports or sensitive advertiser/accounting information. Do not invent payout schedules, minimum payout thresholds, or settlement terms. Per-advertisement commission rates are set individually by the Owner; no global advertising commission default exists. Actual payout activation remains gated on legal, accounting, refund and payment controls. Keep real-money billing, collection, revenue settlement and payouts disabled until their provider integration, accounting/reconciliation, fraud controls, refund handling, tax/legal review and owner authorization are complete.

## Validation status

- Room rental plans: owner/MFA-only update, validation, version increment, audit record.
- Room rental purchase and renewal: server price confirmation, atomic debit, wallet ledger and idempotent receipt.
- Room ownership transfer, member leave and owner close: authorization and audit trail.
- Scheduled expiry: 24-hour freeze then closure; no destructive room deletion.
- Premium catalog: missing rows are seeded without overwriting owner edits; first-seed purchases remain disabled; non-ready features remain fail-closed.
- Economy schedules: owner/MFA-only editable coin and advertising prices, versioned and audited.
- Real-money checkout and live payment processing: intentionally disabled.


## Owner-approved advertising department governance addendum — 2026-11-16

This addendum clarifies the role terminology and governance introduced by [ADVERTISING_MEDIA_WORKSPACE_SPEC.md](ADVERTISING_MEDIA_WORKSPACE_SPEC.md), which is the detailed product/security contract for the advertising department.

- The former term "advertising upload moderator" in the earlier geographic/request requirements refers to the **Advertising Representative (مندوب إعلانات معتمد)**. The representative count remains unlimited and is distinct from the administrative supervisor capacity.
- The Owner may appoint up to **five (5) General Advertising Supervisors**, each with a separate, individually delegated, versioned permission set. Five is the maximum number of active general-supervisor appointments, not a cap on advertising representatives.
- The Owner may optionally grant a supervisor campaign publication permission. Publication delegation never grants commission authority, final-price authority, payment-confirmation authority or financial-ledger access.
- **Per-advertisement commission remains exclusively Owner-controlled.** No supervisor or representative may set, alter or approve a commission rate. No global commission rate or fallback exists.
- The Owner retains an immediate, server-enforced emergency pause/withdrawal right over every campaign, including campaigns published by a delegated supervisor. A supervisor cannot reverse an Owner withdrawal or republish without Owner reauthorization.
- Representative agreement signing is two-party and in-app: the representative signs the exact version using their verified Mawdda email and an approved step-up verification; the authorized Owner countersigns using the verified Company identity and MFA/step-up. Email is the formal notice channel, not a substitute for the version-bound signature evidence.
- The representative's advertising communications take place in a distinct **Media Workspace**, not ordinary personal direct messages.
- Every request requires a substantive advertising description regardless of whether the creative is an uploaded image, uploaded video or external link. For external links, record the source platform/site.
- After six months of qualifying inactivity, operational messages, creative images/videos and external creative links are eligible for deletion. Preserve the mandatory description, signed agreements, formal notices, publication/payment/commission notices, financial references and audit/legal-hold evidence under their separately approved retention periods. Active campaign dependencies and legal holds prevent premature creative deletion.
- These requirements do not activate real-money billing, commission payout, live destructive retention, production changes or deployment. Those remain separate release gates requiring legal/technical validation and any required Owner authorization.
