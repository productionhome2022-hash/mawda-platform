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
