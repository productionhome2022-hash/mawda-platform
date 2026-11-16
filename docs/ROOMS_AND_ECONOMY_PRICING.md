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

### Advertising upload moderators — unlimited count, two geographic scopes each

The number of advertising upload moderators is **unlimited**. The previous proposed cap of 36 is withdrawn and must not be enforced as a product or database limit. The Super Admin / Owner may appoint, suspend, reactivate, and revoke any number of moderators, subject to ordinary platform security and operational safeguards.

Each moderator has one owner-assigned **primary/home geographic scope** associated with the country or region in which that moderator is registered. This primary scope is fixed for the moderator's active assignment and can be changed only by the Super Admin / Owner. Each moderator may additionally choose **one (1) secondary geographic target** from the currently supported geographic targets. Therefore, each moderator may submit ads to no more than two scopes in total:

1. Their assigned primary/home scope.
2. One additional scope selected by the moderator from the targets the Owner has made available.

The secondary scope may be any supported target (for example, All Arab countries, another Arab country/group, Europe and Turkey, or Asia and the Middle East), subject to the Owner's platform-wide availability settings. The moderator cannot replace or bypass the primary scope, add a third scope, or expand their own permissions. The server must enforce the two-scope limit and validate both scopes against the current versioned geographic configuration.

#### Moderator submission permissions

Moderator permissions are strictly limited to preparing and submitting advertising requests:

- Upload image and video advertising creatives from the moderator's device, subject to the platform's media type, size, duration, safety and malware checks.
- Submit an external advertising link or an external video playback/streaming URL hosted by another platform, subject to server-side URL, destination, redirect, content and safety validation.
- Select the primary/home scope or their one permitted secondary target.
- Enter the advertiser-provided campaign request details needed for Owner review, such as advertiser/client identity or reference, requested campaign duration, creative details and contact/reference information.
- Submit the request into the Owner approval queue and view the status of their own submissions.

Moderators cannot set or approve the final advertising price, final campaign duration, campaign schedule, budget, billing terms, publication status, revenue treatment, refunds, settlements or payouts. Requested duration and advertiser-provided details are request information only; they are not approved campaign terms. Moderators cannot publish ads themselves, approve their own submissions, view platform revenue reports, alter geographic mappings, manage other moderators, or access unrelated administrative functions.

The Owner/Super Admin controls each moderator's account status, primary/home scope, availability of the secondary-scope selector, and upload methods (device upload and/or external URL submission). All submissions and moderator actions must be attributed to the moderator and recorded in an auditable history.

#### Owner approval, payment confirmation and publication workflow

Every moderator submission must enter a **Pending Owner Approval** queue in the Super Admin / Owner advertising dashboard. There is no automatic publication after upload or technical validation.

Each queue item must present enough information for an informed decision, including:

- Moderator's name and unique moderator/account identifier.
- Submission/request ID and advertisement/creative ID.
- Advertiser/client name or supplied reference and contact details.
- Requested geographic target (primary or secondary scope).
- Advertiser-requested duration and campaign details.
- Creative preview or validated external playback link.
- Proposed commercial terms as prepared/controlled by the Owner, including the final price and approved duration.
- Payment verification status and review/audit history.

The Owner contacts the responsible moderator/advertiser as needed, independently confirms receipt of the agreed advertising payment through the approved out-of-platform/manual process, reviews the creative and targeting, and then explicitly approves or rejects the request. The Owner alone sets or confirms the final price, approved duration and publication schedule. Only after the Owner records approval and payment verification may the server publish/activate the campaign in its approved geographic interface(s), including All Arabic ads when the target includes Arab countries.

A moderator's requested duration, a payment claim, an uploaded file, a URL, or a client-side action is never proof of payment or authorization to publish. Approval and payment verification must be server-authorized, audited, versioned where commercial terms are involved, and protected against duplicate processing. Rejection, return-for-correction, cancellation and expiry states must be recorded. Until the Owner approves and confirms payment, the campaign remains unpublished and non-billable. This manual approval workflow does not enable live payment processing or advertiser billing.

#### Security and content validation

External URLs must be fetched/validated through a controlled server-side process. Do not trust client-provided URL metadata; reject unsafe schemes, private-network destinations, prohibited redirects, and arbitrary executable content. Uploaded media must pass type, size, duration, malware and content-safety checks. Keep all publication and financial actions fail-closed when validation or authorization is unavailable.

### Advertising revenue and earnings management

Provide a dedicated advertising revenue management view for the Super Admin / Owner, separate from the upload-moderator interface. It should support auditable reporting, as applicable once billing is implemented, for campaign sales, billable impressions/clicks, gross revenue, refunds/credits, fees/costs, net revenue, outstanding amounts and settlement status. Reports should be filterable by campaign, advertiser, geography, placement and time period, with exportable audit/report records where supported.

Only the Super Admin / Owner may view financial totals or configure commercial terms, advertiser billing, revenue recognition, refunds, settlements or payout settings. Upload moderators must not see financial reports or sensitive advertiser/accounting information. Do not invent moderator commissions, revenue shares, payout rates, or settlement schedules; none have been approved. Keep real-money billing, collection, revenue settlement and payouts disabled until their provider integration, accounting/reconciliation, fraud controls, refund handling, tax/legal review and owner authorization are complete.

## Validation status

- Room rental plans: owner/MFA-only update, validation, version increment, audit record.
- Room rental purchase and renewal: server price confirmation, atomic debit, wallet ledger and idempotent receipt.
- Room ownership transfer, member leave and owner close: authorization and audit trail.
- Scheduled expiry: 24-hour freeze then closure; no destructive room deletion.
- Premium catalog: missing rows are seeded without overwriting owner edits; first-seed purchases remain disabled; non-ready features remain fail-closed.
- Economy schedules: owner/MFA-only editable coin and advertising prices, versioned and audited.
- Real-money checkout and live payment processing: intentionally disabled.
