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

## Validation status

- Room rental plans: owner/MFA-only update, validation, version increment, audit record.
- Room rental purchase and renewal: server price confirmation, atomic debit, wallet ledger and idempotent receipt.
- Room ownership transfer, member leave and owner close: authorization and audit trail.
- Scheduled expiry: 24-hour freeze then closure; no destructive room deletion.
- Premium catalog: missing rows are seeded without overwriting owner edits; first-seed purchases remain disabled; non-ready features remain fail-closed.
- Economy schedules: owner/MFA-only editable coin and advertising prices, versioned and audited.
- Real-money checkout and live payment processing: intentionally disabled.
