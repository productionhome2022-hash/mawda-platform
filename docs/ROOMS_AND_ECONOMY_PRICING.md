# Room rentals and editable economy prices

All amounts below are suggested starting values, not fixed commercial commitments. The platform owner can change them from the Super Admin console. Callable validation, versioning and audit logging remain server-side.

## Private room rental (coins)

| Plan | Duration | Suggested price |
|---|---:|---:|
| room_30d | 30 days | 1,000 coins |
| room_90d | 90 days | 2,700 coins |
| room_180d | 180 days | 5,000 coins |
| room_365d | 365 days | 9,000 coins |

The member room flow reads published plans, displays the current price, and submits the displayed price as an expected-price confirmation. The server re-reads the current plan and performs the coin debit, room creation, rental receipt and wallet ledger write in one Firestore transaction. Request IDs make retries idempotent.

Renewal uses the same server-side pricing and transaction rules. Existing rental expiry is extended from the later of now or the current expiry. Expired rentals enter a 24-hour frozen grace period, then close without deleting room history. Closing does not refund already-consumed rental time. Ownership transfer requires an eligible existing room member and is audited. Members can leave rooms; owners must transfer or close first.

## Premium store starter prices (coins)

All new starter entries are intentionally inactive and non-purchasable until the matching complete consumer and acceptance tests are enabled.

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

The owner catalog screen seeds missing rows only and never overwrites an existing owner-edited item. Existing implemented VIP/title consumers remain governed by the validated purchase gate. Other feature categories stay fail-closed (purchaseEnabled=false) until the full behavior is implemented.

## Coin packages (EUR, price in euro cents)

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
- Premium catalog: seeded editable price rows; non-ready categories are inactive and non-purchasable.
- Economy schedules: owner/MFA-only editable coin and advertising prices, versioned and audited.
- Real-money checkout and live payment processing: intentionally disabled.
