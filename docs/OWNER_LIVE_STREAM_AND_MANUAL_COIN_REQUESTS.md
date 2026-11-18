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

### 4B. One manual external-payment model for the entire economy

**Owner decision (2026-11-18):** every Mawdda economic flow that requires money to be paid outside the platform uses a manual, owner-administered process. This applies consistently to:
- Direct coin top-ups, including custom quantities negotiated with a member.
- Featured advertisements and every other advertising/creator/influencer placement.
- Store or service orders that the owner designates as payable externally.
- Any future economic item that explicitly requires external payment.

There is no automated checkout, payment gateway, provider webhook, in-app collection, or automatic external-payment verification in this approved model. Do not design or enable a second automated payment channel unless the owner approves a separate, explicit product decision.

### 4C. Shared manual-payment lifecycle

1. **Request:** the member/advertiser selects the relevant action (for example, “Request coin top-up” or “Request advertisement”). The server creates a uniquely identified pending request with the authenticated requester, target item, quantity/duration/placement details, the applicable owner-configured price snapshot where one exists, timestamps, and an idempotency key. Creating a request never credits coins, activates an advertisement, or grants an entitlement.
2. **Contact and agreement:** the request opens or links to the appropriate administrative conversation. The member and the owner agree the final quantity, price, currency, schedule, placement, and external payment method through their own communication. For custom coin quantities, the final agreed coin amount is recorded explicitly before approval.
3. **External payment:** the member pays the owner outside Mawdda using the method they agreed. Mawdda does not collect the money, connect to the payment provider, inspect bank/card accounts, or claim to verify the transfer automatically.
4. **Owner's manual receipt confirmation:** after checking the owner's own external records, the canonical platform owner records the manual confirmation in the owner console. This is an explicit privileged attestation, not a client assertion. Record an internal note and an external reference when available; any uploaded or supplied receipt is supporting context only and is never independently trusted as proof.
5. **Atomic fulfilment:** a server-only, owner-authorized operation verifies the pending request, actor authorization and recent MFA/step-up, expected request/campaign version, agreed amount and item details, and idempotency identity. In one Firestore transaction it records the manual confirmation, changes the request/payment state, performs the requested fulfilment (coin credit, ad activation, or entitlement/order fulfilment), writes the corresponding immutable wallet/financial ledger entries where applicable, and appends the audit event. If any required write or audit record cannot be committed, the entire operation fails without partial fulfilment.
6. **No silent edits or duplicate fulfilment:** concurrent, stale, repeated, or altered requests must be rejected or return the exact previously committed result only when all immutable request, ledger, and audit evidence matches. A changed quantity, price, campaign, recipient, or target item requires a new explicitly agreed request/version and cannot reuse the prior approval.
7. **Other outcomes:** the owner may reject/cancel a pending request with a reason; a member may withdraw a still-pending request where the flow permits it. Rejected, cancelled, withdrawn, pending, or awaiting-payment requests never fulfil the economic action.

### 4D. Owner authority and pricing

The labels **Owner** and **Super Admin** refer to the one canonical platform-owner identity defined in section 4A. The owner performs the off-platform receipt check and manually authorizes fulfilment in Mawdda. A separate moderator or ordinary administrator must not gain this authority from a client role flag; any future delegated approval authority requires a separate owner-approved permission decision.

Prices, coin packages, ad rates, quantities, limits, and quotas remain under owner control through the owner/Super Admin console. Existing seed values are illustrative/test values only, not final contractual prices. Do not invent, hard-code, or silently promote prices or quotas to final values. Do not enable purchases merely because a catalogue item or manual-payment request exists.


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
