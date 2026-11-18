# Owner live-stream links, video playback, and manual coin requests

**Status:** approved requirements; implementation and acceptance remain open  
**Applies to:** Phase 1 communication/economy and Phase 2 secure message delivery  
**Authority:** owner-approved Mawda product decisions

## 1. Owner-originated live-stream links

The platform owner may send an HTTPS live-stream or video URL to:
- Any existing one-to-one conversation between the owner and a member.
- Any active public room.
- Any active rented private room.

The owner must be authorized by the server-side `platformOwner` claim and recent MFA/step-up session. Client role flags are never sufficient. Room delivery must not require the owner to become an ordinary room member, and the owner must not be able to post to a room that is closed, expired, or otherwise inactive.

Each message is an auditable, idempotent `live_stream` message with:
- Canonical URL and hostname.
- Sender UID and verified owner context.
- Scope and conversation/room ID.
- Creation timestamp and client request ID.
- Optional human-readable title/description, with bounded length.

Only HTTPS URLs are accepted. Reject credentials, malformed hosts, control characters, unsafe schemes, localhost/private/link-local IP destinations, non-standard ports, and known redirect shorteners. Do not fetch or resolve arbitrary user URLs from the backend; this avoids SSRF and redirect-based trust bypass. The owner may use legitimate official sports, news, event and streaming sites, subject to the same safe URL syntax checks.

## 2. Recipient playback experience

Tapping a supported live-stream/video link opens an in-app playback panel occupying approximately the upper half of the available conversation viewport. The original direct conversation, public room, or rented private room remains visible and usable below it. The recipient can close the panel at any time without leaving the conversation.

The player must:
- Prefer the provider's official embed/player interface and preserve the original canonical URL.
- Support provider-specific adapters where officially permitted (initial candidates: YouTube, YouTube Shorts, Facebook Reels, Instagram Reels and TikTok).
- Respect provider embedding, login, geographic, age, copyright and access restrictions.
- Never scrape, proxy, download, restream, bypass DRM, defeat paywalls, or circumvent provider restrictions.
- Show a clear unsupported/unavailable message and an explicit “open original link” action when embedding is blocked or unavailable.
- Avoid autoplay with sound; playback starts only after the recipient taps.
- Keep the panel state local to the current screen and release player resources when closed/disposed.

Generic live-stream links may use an official HTML5 HLS/DASH or provider embed only where the source explicitly supports it and the client has a compatible, safe player. Do not claim universal compatibility.

## 3. Existing member link permissions

Existing biometric/member link entitlements remain governed by server-side link policy. The owner-only live-stream sending path is separate from ordinary member link permissions. Do not broaden member privileges merely to implement owner broadcasts. The owner may send a wider set of safe HTTPS destinations; recipients can only play them when the source officially permits embedding.

## 4. Manual coin purchase request workflow

### 4A. One owner identity

The labels **Owner** and **Super Admin** refer to one person and one canonical owner UID. There must not be a separate Super Admin account belonging to another person. Internal legacy claims may be normalized as aliases, but every privileged operation resolves to the same owner identity, with recent MFA/step-up and audit logging. Scoped moderators are not owners and cannot approve coin issuance or change owner-only payment settings.

### 4B. Owner-configurable dual payment modes for the entire economy

**Owner decision (2026-11-18):** Mawdda must support two distinct payment modes, controlled by the canonical platform owner from the Super Admin console. This is the target product architecture for every economic area that requires payment, not a permanent manual-only restriction.

1. **Manual external payment:** the member opens/links an administrative conversation, agrees terms with the owner, pays outside Mawdda, and the owner manually attests receipt after checking their own external records. The server then fulfils the request.
2. **Automated electronic payment:** when an electronic payment provider has been formally selected, onboarded, configured, tested, and explicitly enabled by the owner, the member may pay directly through that provider's supported checkout flow. Provider-side verified server callbacks/webhooks (or an equivalent provider-authenticated server verification flow) authorize fulfilment. Client redirects, screenshots, uploaded receipts, and client-supplied booleans are never proof of payment.

The Super Admin console must expose independent owner-controlled settings for each supported economic product/flow:
- Manual payment enabled/disabled.
- Automated electronic payment enabled/disabled, but only when a supported provider integration is configured and passes its server-side readiness checks.
- If both are enabled, the customer can choose either available method at request/checkout time.
- If only one is enabled, expose only that method.
- If neither is enabled, block new paid requests/orders for that flow with a clear unavailable state.
- Owner can disable a method for new requests without corrupting or silently rewriting already-created requests. Existing pending requests retain their recorded method and policy snapshot and must be handled by an explicit safe transition.

This applies consistently to direct coin top-ups (including custom/open quantities where the owner agrees the quantity and price), featured and general advertising, creator/influencer placements, store purchases, subscriptions/entitlements, and future paid economic items. Each product may expose only the modes actually supported and enabled for it; do not assume that one provider integration automatically covers every product.

### 4C. Shared request, agreement, and fulfilment lifecycle

1. **Request/quote:** the server creates a uniquely identified pending request with authenticated requester, target item, quantity/duration/placement details, selected payment mode, applicable pricing/configuration snapshot, timestamps, version, and idempotency identity. Creating a request never credits coins, activates an advertisement, or grants an entitlement.
2. **Manual mode:** the request opens or links to an administrative conversation. The member and owner agree the final quantity, price, currency, schedule, placement, and external payment method. For custom/open coin quantities, the agreed coin amount and price must be explicitly recorded before owner approval. The member pays outside Mawdda. The owner records a privileged manual receipt attestation after checking their own records; any receipt/reference is supporting context only.
3. **Automated mode:** the server creates a provider checkout/payment intent using a server-side configured provider account and a stable idempotency key. The server stores provider identifiers and the immutable request/amount/currency snapshot. The provider's authenticated server-to-server confirmation is validated for signature/authenticity, environment, merchant/account, amount, currency, transaction identity, and final paid status. Duplicate and out-of-order callbacks are handled idempotently. A browser return/redirect alone never fulfils an order.
4. **Atomic fulfilment:** a server-only operation verifies the request state, payment mode, actor/provider authorization, expected request/campaign version, exact agreed amount and target, and idempotency identity. In one Firestore transaction it records the verified manual attestation or provider-confirmed payment event, changes payment/request state, performs the requested fulfilment (coin credit, ad activation, or entitlement/order fulfilment), writes immutable wallet/financial ledger entries where applicable, and appends the audit event. If any required write cannot be committed, fulfilment fails without partial effects.
5. **No duplicate or altered fulfilment:** concurrent, stale, repeated, or altered requests must be rejected or return the exact previously committed result only when immutable request, payment, ledger, and audit evidence matches. A changed quantity, price, currency, campaign, recipient, or target item requires a new request/version and cannot reuse a prior approval or provider payment.
6. **Other outcomes:** pending requests may be cancelled/rejected/withdrawn through explicit state transitions with actor and reason. Failed, expired, refunded, disputed, cancelled, rejected, or merely initiated payments never grant coins or entitlements and never activate advertising. Refunds/reversals require separate auditable compensating ledger entries; never edit historical ledger rows.

### 4D. Owner authority, provider readiness, and pricing

The labels **Owner** and **Super Admin** refer to the one canonical platform-owner identity defined in section 4A. Manual receipt attestations and payment-mode/provider configuration are owner-only operations. A moderator or ordinary administrator must not gain these powers from a client role flag; any delegated authority requires a separate owner-approved permission decision.

Automated provider mode remains unavailable until a specific provider is selected and its integration, credentials, webhook authentication, test-mode verification, failure handling, refunds/disputes policy, and security review are implemented and tested. Do not invent provider credentials, claim provider verification, enable a gateway, or move live money as part of ordinary development. Provider secrets must remain in approved secret storage and never be committed to GitHub. Provider configuration and live activation require the owner's explicit approval.

Prices, coin packages, custom-quantity rules, ad rates, durations, limits, and quotas remain under owner control through the owner/Super Admin console. Existing seed values are illustrative/test values only, not final contractual prices. Do not invent, hard-code, or silently promote prices or quotas to final values. Do not enable purchases merely because a catalogue item or payment method exists.


## 5. Logout

A visible sign-out action must be reachable for ordinary members and the platform owner. It must unregister the current push token where possible, call Firebase Authentication `signOut()`, clear local privileged/player state, and return through the auth-state gate to the login/guest entry screen. A UI-only navigation or hiding privileged controls is not logout. If token unregistration fails, Firebase sign-out must still proceed.

## 6. Acceptance tests required before closure

- Owner can send a live-stream message to an owner/member direct chat, public room and active rented private room.
- Non-owner, forged client owner flags, stale MFA and unauthenticated callers are denied and audited where applicable.
- Owner can send to an active room without ordinary membership; inactive/expired/closed rooms reject delivery.
- HTTPS URL validation rejects unsafe schemes, credentials, localhost/private/link-local addresses, malformed hostnames, nonstandard ports and redirect shorteners; no backend network fetch occurs.
- Direct and room message reads preserve message type, canonical URL, sender and audit metadata.
- Flutter player panel uses approximately the top 50% of the available conversation viewport; chat remains visible below; close restores the full conversation.
- Provider-specific embedding success and failure are tested; blocked embedding always offers original-link fallback and never bypasses provider restrictions.
- Manual coin request tests cover package/custom requests, duplicate submission, pending/no-credit, owner instructions, external-verification state, owner approval, atomic balance+ledger, concurrent/replayed approval, changed quantity, reject, member withdrawal, audit failure and unauthorized callers.
- Logout tests cover member and owner Firebase sign-out, token-unregister failure, auth-gate transition and clearing privileged state.

## 7. Current implementation boundary

The repository already has an owner link allowance in text-message policy and a Firebase sign-out service/action in the main member shell. That is not the requested integrated live-stream player, room-wide owner broadcast path, or manual coin-request lifecycle. Those remain implementation work and must not be represented as complete until the acceptance tests above pass on an exact CI-tested commit.


## 8. Call-economy tariff authority and experimental examples

Any previously discussed example voice/video rates (including 120/400 or 60/200 coins per minute) are experimental placeholders only. They are not final prices and must not be hard-coded, auto-published, or treated as approved defaults. The canonical platform owner/Super Admin must be able to independently change, increase, decrease, disable, or leave voice and video tariffs unconfigured through versioned server-side settings. Each call must snapshot the applicable approved tariff and billing policy at its billable start; later owner edits apply only to future billable sessions. The same owner authority applies to mutual charging and the caller-only exception when the recipient still has included quota. No actual tariff amount, rounding rule, commission or final price is approved by this clause.

Call charges remain fail-closed until the economic implementation supports authoritative connected/billable time, daily included quota eligibility and consumption, caller/receiver allocation, safe rounding, wallet sufficiency, atomic immutable ledger legs, idempotent end-of-call settlement, retry/recovery, and auditable reversals/refunds. A call admission entitlement is not itself proof that per-minute billing or included quota logic exists. The example values above must remain absent from production constants and customer-facing final-price claims.

## Owner clarification — one total bilateral call tariff, automatically split 50/50 — 2026-11-18

- The owner configures **one total per-minute price for the bilateral call** (voice or video), not two independent participant prices. The configured amount represents the combined charge for both participants together.
- For ordinary bilateral billing, the server automatically allocates exactly half of that configured total to the caller and half to the recipient. Examples only: a total voice tariff of 500 coins/minute means 250 coins/minute per participant; a total voice tariff of 1,000 means 500 each. A total video tariff of 1,000 means 500 each; a total video tariff of 2,000 means 1,000 each. These amounts are illustrations of the split rule, not approved tariffs.
- This 50/50 allocation is deterministic server-side policy. The owner changes only the total tariff; the platform calculates both participant shares. Do not require the owner to enter two halves or allow client-supplied participant amounts.
- The earlier caller-only exception remains a separately defined eligibility case: if the caller has exhausted their included quota while the recipient still has eligible included quota, charge only the caller at the configured total bilateral rate (the full combined tariff), and do not charge the recipient. This exception must be explicit in the session's immutable billing-policy snapshot and ledger allocation.
- The total tariff and 50/50 allocation rule must be snapshotted at the billable session start. Later owner price changes apply only to new sessions. Currency/coin precision, odd-number split remainder handling, minute rounding and insufficient-balance behavior must be explicitly validated and tested before collection is enabled; never silently lose or create coins.
- All numeric examples remain experimental illustrations only. No final tariff amount is approved by this clarification.

## Platform-wide economic authority — experimental values are test fixtures only — 2026-11-18

### Non-negotiable owner authority

This policy applies to **every economic surface and every present or future paid, rewarded, timed, metered, promotional or entitlement-bearing feature throughout Mawdda Platform**, not merely calls or the store. This includes (without limitation): BetaCoins and wallet operations; coin packages/top-ups/gifts/transfers/commissions/rewards; all store products, features, badges, titles and gifts; subscriptions and renewals; room rentals and extensions; voice/video calls and quotas; Media Saver and all media-related paid entitlements; advertising, featured campaigns, creator/production monetization, referral/attendance/engagement rewards, service fees, discounts, taxes/fees if applicable, limits and usage-based charges.

The platform owner (Super Admin) must have complete, granular, auditable control over each applicable economic parameter through the owner console, including:

- Price/amount/rate, currency or coin denomination, price tiers and per-period pricing.
- Duration, validity, expiry, renewal, grace period, cooldown, retention window where it is an economic entitlement, and any other time interval.
- Quantity, quota, usage caps, per-user/per-period limits, capacity, minimum/maximum purchase, stacking and concurrency policy.
- Active/inactive/paused/hidden state; availability by account/region/feature as supported by policy; manual versus automated payment mode for each independently supported flow.
- Reward, commission, split/allocation, discount and fee rules, including the bilateral call tariff split and exception policy.

Every setting must be independently configurable where the business rule requires it, validated server-side, versioned, auditable, and enforced by server-authoritative logic. The owner console must expose the full supported control surface; it must not show editable controls that the backend ignores. A missing, invalid, expired or unconfigured policy must fail closed for paid collection/entitlement grants rather than silently fall back to a hard-coded commercial value.

### Experimental/test data policy

1. All numeric prices, durations, quotas, quantities, commissions, rates and limits introduced by engineering for development, automated tests, emulator fixtures, demos or internal verification are **experimental test values only**.
2. Such values must be clearly marked as test/fixture/sample values in source, seed data, documentation and test reports. They must never be represented as approved production defaults, final prices, or launch-ready commercial policy.
3. No test fixture or development fallback may silently seed or overwrite production owner settings. No production migration may promote experimental values into active production configuration.
4. At real-user trial/release preparation, all economic settings must remain unconfigured/disabled or be explicitly reviewed and approved by the owner through the production owner console. Engineering examples are not owner approval.
5. Tests should use named fixture factories and isolated emulator/test namespaces, with assertions proving that fixture settings cannot leak into production configuration. Avoid hard-coded commercial constants in runtime code; technical safety ceilings may exist only when they are clearly identified as security/resource-protection limits rather than owner-set commercial prices or durations, and must be documented separately.
6. If a parameter must have a technical invariant (for example, a safety maximum imposed for abuse or infrastructure protection), distinguish it from the commercial policy: the owner can configure values within the safe envelope, while the invariant is not mislabeled as a product price or commercial duration.

### Configuration model and lifecycle requirements

- Use a canonical, typed, versioned economic policy/catalog model rather than scattered constants or per-screen local defaults.
- Support independently configurable duration/price options wherever relevant (including the owner's previously specified 24-hour, one-week and one-month examples); these are option examples, not mandatory fixed durations. The owner may add, remove, reorder, disable or change supported periods and their independent prices, subject to technical constraints.
- Persist a complete immutable policy snapshot with every order, purchase, renewal, rental, call settlement, campaign financial event, reward claim or other economic transaction. The snapshot must identify policy version, selected product/period, applied amounts, allocation rules, actor and timestamps. Later edits apply prospectively and never rewrite historical transactions.
- Enforce optimistic concurrency/version checks on owner edits; reject stale updates. Record before/after values, owner identity, reason and timestamp in an append-only audit trail. Require appropriate recent owner authentication for sensitive changes.
- Ensure UI, callable/API validation, transaction processing, ledger, receipts, reports and tests all use the same canonical policy contract. Never trust a price, duration, quota, split or discount supplied by the client as authoritative.
- Include a safe preview/simulation mode for testing a proposed policy before activation, and separate draft/test values from explicitly owner-approved active values.

### Release gate

No economic parameter is considered final or ready for real users merely because it appears in code, a test, a sample catalog, a demo screen or a documentation example. The owner must explicitly review and activate the production values. Before the economic phase is declared complete, audit all economic domains for hard-coded commercial values, missing owner controls, inconsistent UI/backend contracts, missing policy snapshots, unsafe fallback behavior, and test-to-production configuration leakage. Record each gap and its disposition in the economic verification register.

## Owner rule — bilateral prices must split into whole coins — 2026-11-18

For every economic price that is defined as one combined amount and divided equally between exactly two participants (including bilateral voice/video calls), the owner will enter only a **non-negative whole-number amount divisible by 2**. The owner will not configure an odd amount that produces fractional participant shares. Therefore:

- Validate the configured combined amount as an integer and require `amount % 2 === 0` before saving or activating the bilateral tariff.
- Reject invalid values in the Super Admin UI and independently on the server; do not round, truncate, redistribute a remainder, or silently adjust the entered amount.
- Each participant receives an exact whole-coin half of the configured combined amount under standard 50/50 bilateral billing.
- The caller-only exception continues to charge the caller the full configured combined amount when that exception's eligibility conditions are met; the tariff itself must still satisfy the even-integer validation rule.
- This restriction is specifically for owner-defined combined prices that are split equally between two parties. It does not impose a blanket even-number restriction on unrelated single-recipient products, fees, rewards or prices.
- Add positive and negative validation tests: even whole numbers accepted; odd whole numbers, fractional values, non-finite values and negative values rejected. No fractional coin arithmetic or remainder policy is needed for this bilateral split.


## 5. Service-scoped manual payment policy (2026-11-18)

The owner economy policy now carries independent manual-payment switches for:
- `coin_purchases`
- `featured_ads`
- `public_ads`
- `influencer_services`
- `store_entitlements`

The owner economy screen exposes these switches separately and persists them through the versioned `paymentPolicy` field. The legacy `manualCoinPurchasesEnabled` and `manualFeaturedAdsEnabled` fields remain synchronized for backwards compatibility with existing callable handlers and clients. A supplied service policy must agree with those legacy fields; mismatches are rejected rather than silently choosing one source.

Automated payment remains fail-closed for every service. The policy validator rejects `automatedEnabled: true`; this is intentional until a selected provider has a server-side intent lifecycle, authenticated signed webhooks, amount/currency/order binding, idempotent atomic fulfilment, refund/reversal handling, reconciliation, security review, and explicit owner activation. No provider credentials, production payment activity, or live configuration are introduced by this change.

The policy schema is a configuration foundation, not a claim that every service's end-to-end paid order workflow is complete. In particular, public-ad, influencer-service and store-entitlement manual requests still require their own domain lifecycle and fulfilment integration before their switches may be enabled operationally. Their default remains disabled.

Regression coverage added in `functions/test/economy-payment-policy.test.js` covers legacy migration, independent service flags, unknown services, malformed values, and fail-closed automated checkout. The test is included by the existing `node --test test/*.test.js` command through `npm test`; execution is pending because this pass is limited to repository editing and does not have an available GitHub Actions dispatch/run facility.
