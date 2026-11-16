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

## Validation status

- Room rental plans: owner/MFA-only update, validation, version increment, audit record.
- Room rental purchase and renewal: server price confirmation, atomic debit, wallet ledger and idempotent receipt.
- Room ownership transfer, member leave and owner close: authorization and audit trail.
- Scheduled expiry: 24-hour freeze then closure; no destructive room deletion.
- Premium catalog: missing rows are seeded without overwriting owner edits; first-seed purchases remain disabled; non-ready features remain fail-closed.
- Economy schedules: owner/MFA-only editable coin and advertising prices, versioned and audited.
- Real-money checkout and live payment processing: intentionally disabled.
