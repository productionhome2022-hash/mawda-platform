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

The labels **Owner** and **Super Owner** refer to one person and one canonical owner UID. There must not be a separate Super Owner account belonging to another person. Internal legacy claims may be normalized as aliases, but every privileged operation resolves to the same owner identity, with recent MFA/step-up and audit logging. Scoped moderators are not owners and cannot approve coin issuance or change owner-only payment settings.

### 4B. Two configurable payment channels

The purchase experience must be designed for future owner-controlled channel selection:

- **Direct/manual contact (available default):** the owner enables this channel and members can request a published package or a custom quantity. The custom-quantity path always creates a request and opens/links the member's one-to-one conversation with the owner. The owner can negotiate the amount and send the agreed payment method/instructions directly in that conversation. The request remains pending until the owner records external payment verification and explicitly approves it.
- **Automated checkout (future, disabled by default):** the owner may later configure one or more contracted payment providers and enable checkout for selected fixed packages. The architecture must use a provider adapter and server-to-server signed payment confirmation. Only verified, captured/settled payment events can trigger one idempotent coin-credit transaction. A browser success redirect or member-uploaded receipt is not proof of payment.

The owner can configure channel availability and package availability independently. If automated checkout is unavailable or disabled, the UI must not show a dead payment button; it offers the manual owner-contact route instead. A member's custom quantity request is always manually negotiated unless the owner approves a separate future product amendment.

Before enabling any automated provider, require owner-supplied provider/contract details, secure secret provisioning, webhook signature and replay tests, refund/chargeback handling, reconciliation, fraud/risk controls, tax and legal review, and explicit owner activation. Never store card or bank login credentials in Mawda. Never issue coins from an unverified client event.



Real-money coin acquisition is a manual, owner-approved process; no payment gateway or automatic payment collection is enabled.

1. A member submits either an owner-configured coin package or a custom positive integer quantity.
2. The server creates a pending request with a unique request ID, member UID, quantity, selected package/price snapshot (if applicable), timestamps and idempotency key. Submission never credits coins.
3. The owner sees the request in the owner console and contacts the member through the platform to agree the payment method/instructions.
4. The owner records the agreed instructions and later marks the payment as externally verified based on the owner's own payment records. This is an explicit privileged action requiring recent MFA and an audit reason/reference; the platform does not assert it independently verified a bank/card transaction.
5. Only the owner approval callable may atomically change the request to approved, credit the member balance, create the wallet ledger entry and immutable audit record. The same transaction enforces exactly-once issuance and rejects replay or a changed quantity.
6. Owner may reject/cancel a request with a reason while it is awaiting owner action. A member may withdraw only before the owner issues payment instructions. Once instructions are issued, the agreed terms are immutable and the member cannot withdraw directly; the owner must close/reject the request if correction or cancellation is needed. Approved requests cannot be silently edited or re-approved.
7. A member may report that an external transfer was initiated. This only moves the request to `awaiting_payment_verification`; it is a claim-only signal, not proof of receipt, and creates no coin credit. Owner approval remains the only issuance authority. Repeated reports for the same instruction version are idempotent.
7. No coins are issued while pending, awaiting instructions, awaiting external verification, rejected, cancelled, or withdrawn.

Prices and packages are owner-editable server configuration. Seed prices are illustrative defaults, not final contractual prices. Custom quantity requests must be subject to owner-configured minimum/maximum bounds and the owner must confirm the final agreed amount before issuance.

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
- Manual coin request tests cover package/custom requests, duplicate submission, pending/no-credit, versioned owner instructions, member claim-only payment report, no-credit until owner approval, instruction immutability, withdrawal lock after instructions, owner approval, atomic balance+ledger, replay/audit integrity, changed quantity, reject, pre-instruction member withdrawal and unauthorized callers.
- Logout tests cover member and owner Firebase sign-out, token-unregister failure, auth-gate transition and clearing privileged state.

## 7. Current implementation boundary

The repository already has an owner link allowance in text-message policy and a Firebase sign-out service/action in the main member shell. That is not the requested integrated live-stream player, room-wide owner broadcast path, or manual coin-request lifecycle. Those remain implementation work and must not be represented as complete until the acceptance tests above pass on an exact CI-tested commit.


## 8. Official development branch follow-up — 2026-11-18

The separate port branch `codex/economy-official-port-2026-11-18` is based on `codex/mawda-full-platform-implementation`, not the unified test branch. The following source changes have been ported independently against that branch's current code:

- Coin purchase requests snapshot the manual channel and policy version; the manual path is not disabled solely because a future automated path may be enabled independently.
- Owner instruction issuance is version-checked and terms are immutable after first issuance.
- Member payment reporting is a claim-only transition to `awaiting_payment_verification`; it does not credit coins. Member withdrawal is locked after instructions issue. Owner approval is accepted from either instructions-sent or awaiting-verification state.
- Owner approval replay now requires the corresponding immutable audit record and checks wallet-ledger balance arithmetic and key owner/payment fields.
- Store purchase records and ledgers now capture balance-before/after values; replay validates receipt/ledger arithmetic and fails closed if the ledger is missing.
- Room rental creation and renewal records/ledgers now capture balance-before/after values. Creation replay validates the original room/member and debit ledger; renewal replay validates the immutable renewal receipt and ledger. Missing or inconsistent financial evidence fails closed.
- Owner entitlement grant replay verifies the grant, grant-ledger and audit evidence, and does not overwrite a newer paid entitlement after the original grant has expired or been superseded.
- Unit and emulator test source has been updated. No build, test, emulator or Flutter analysis was run; final validation remains deferred until internal implementation is complete.


## 2026-11-19 payment policy and currency controls

- The owner payment policy is service-scoped. Manual coin purchases and owner-recorded featured-ad financial events are the only currently permitted manual paths. Public advertising, influencer services and paid store entitlements remain disabled until their complete request, fulfilment, refund and audit paths are implemented.
- Automated checkout is disabled for every service. Enabling it requires a verified payment provider, signed webhook validation, amount/currency/order matching, idempotent fulfilment, refund/reversal and reconciliation coverage, plus separate owner approval.
- Owner pricing has no implicit commercial defaults. The owner must configure coin packages, advertising prices, supported currency codes and custom coin-request bounds. The server derives the currency minor-unit exponent; client input cannot choose it.
- Coin purchase requests capture immutable pricing/payment-policy versions. Payment instructions are versioned and cannot be silently edited after issue. A member payment report is only a claim and never credits coins. The owner must verify the external payment and approve the request; approval atomically updates the wallet, ledger and audit records.
- Featured-ad finance events record external receipts, refunds, settlement and review only. They do not activate or publish a campaign, and they do not represent movement of external funds by Mawdda.


## NOM-001 terminology clarification — 21 November 2026

All user-facing references in this historical requirements document to “coin/coins” or «كوينز» must be rendered as **بيتاكوينز / BetaCoins** in current Mawdda interfaces, notifications and user-facing copy. This does not rename technical identifiers, API fields, ledger keys or historical records. The owner-controlled pricing and manual verification rules remain unchanged; no price or package amount is inferred by this terminology correction.
