# Main Home Navigation & Advertising Integration Plan — 2026-11-21

**Target repository:** productionhome2022-hash/mawda-platform  
**Target branch:** codex/mawda-full-platform-implementation  
**Authority:** latest explicit owner instruction in Mawdda Platform 2026 — HQ  
**Status:** Approved navigation requirements; implementation audit in progress. This document does not claim the features below are complete.

## 1. Owner-approved main-screen order

The completed-member home screen must present these primary sections in this order:

1. **استكشاف الأعضاء** — member discovery and the previously approved discovery filters.
2. **الأعضاء** — member directory/presence presentation, including online and offline states; members with currently valid paid visibility/priority entitlements receive the approved priority placement. Card/avatar sizes and responsive density must be consistent and accessible.
3. **المتاجر والاقتصاد** — one clear entry to the central store experience, covering Coins, Beta Coins, premium features, badges, titles, VIP and other owner-approved catalog categories. This is one navigation entry, not permission to duplicate economic engines or invent products/prices/quotas.
4. **قسم مشاهدة الإعلانات** — a distinct primary section. Inside it:
   - **الإعلانات العادية** — geographic ad browsing, with explicit region selection from the approved geographic taxonomy and server-verified viewing eligibility/completion.
   - **مشاهدة الإعلانات المميزة** — a separate subsection, geographically filtered and governed by its own eligibility/placement rules.
5. **Media Workspace** — a distinct primary section beside the ad-viewing section, retaining its production, creator, collaboration, representative, advertiser and administrative workspace routes.
6. **العقود والتوثيق القانوني** — reserve a clear primary navigation location in the home architecture. Detailed implementation is deferred until the owner authorizes that phase after integration/merge work is complete.

Other existing navigation destinations (profile, messages, stories, rooms, notifications, safety, wallet, rewards and owner console) must remain reachable and must not be silently removed. They may be placed in secondary navigation/utility areas without displacing the six primary sections above.

## 2. Featured-ad floating shortcut

A separate floating action shortcut must open **مشاهدة الإعلانات المميزة** directly. It is not a third primary home section and must not replace the nested entry inside **قسم مشاهدة الإعلانات**.

The owner referenced previously agreed visibility exceptions. Their exact complete list was not present in the source files inspected during this audit. Therefore the floating shortcut's final show/hide conditions are a blocking requirement: do not invent exceptions or implement unconditional visibility until those approved conditions are recovered and recorded.

## 3. Existing code inspected on the target branch

- `lib/screens/main_user_screen.dart`
  - The completed-profile panel currently uses a single `Wrap` of unrelated buttons.
  - Current order includes profile, messages, stories, discovery, featured ads/rewards, reward center, wallet, rooms, conditional Super Owner, Media Workspace, and shop.
  - It does not implement the owner-approved primary ordering above.
  - Featured ads are currently a normal `FilledButton`, not a floating shortcut.
  - No dedicated primary **قسم مشاهدة الإعلانات** entry exists.
- `lib/screens/featured_ads_screen.dart`
  - Contains a geographic selector and a placeholder state saying no eligible campaigns are currently available.
  - It does not currently render a live campaign feed.
  - The rewards page describes qualification rules but explicitly says the reward history is not yet connected to the server reward service.
- `lib/screens/media_workspace_screen.dart`
  - Provides routes for representative application, direct advertising intake, creator proposals, supervisor/admin messages, contracts (web-only), and featured-ad rewards.
  - Some entries are intentionally disabled or described as pending.
  - It remains a separate workspace and must not be folded into the ordinary ad-viewing screen.
- `lib/screens/advertising_intake_screen.dart`
  - Supports advertiser/representative intake and geographic targeting selection. Intake is not equivalent to a member-facing ad feed.
- `functions/src/advertising-intake.ts`, `advertising-governance.ts`, `advertising-permissions.ts`
  - Provide validation/governance/permission foundations for the commercial advertising workflow. They do not by themselves prove member-facing delivery is complete.
- `functions/src/featured-advertising.ts`
  - Provides a pure campaign-selection helper for featured placement. It is not a callable feed/session service.
- `functions/src/featured-ad-rewards.ts`
  - Provides reward-policy validation/decision logic. It is not by itself a callable viewing-session/claim lifecycle.
- `functions/src/index.ts`
  - Exposes a separate timed-ad campaign/session lifecycle, including `getActiveTimedAdCampaigns`, `startTimedAdvertisement`, `getActiveTimedAdSession`, `heartbeatTimedAdvertisement`, and `completeTimedAdvertisement`.
  - This timed-ad lifecycle must not be assumed to be the ordinary geographic advertising feed or the featured-ad feed without an explicit product/architecture mapping and verified campaign semantics.
  - Owner-side timed-ad campaign management and featured-ad financial event handling also exist; they are not proof of a complete member-facing geographic ad-viewing experience.

## 4. Confirmed implementation gaps

1. No dedicated home entry named **قسم مشاهدة الإعلانات** with the required two nested destinations.
2. No verified ordinary geographic member ad-feed screen/service was found in the inspected screen and callable entry points.
3. Featured-ad UI currently shows a placeholder rather than a live campaign feed.
4. Featured-ad reward policy helpers exist, but the inspected member UI does not demonstrate a complete server-authoritative featured viewing session, heartbeat, completion, idempotent claim and member reward-history flow.
5. The separate timed-ad session lifecycle exists; its relationship to ordinary versus featured advertising must be explicitly reconciled before reuse.
6. The floating featured-ad shortcut and its owner-approved visibility exceptions are not implemented/verified.
7. The current home screen is an ungrouped button collection and does not preserve the required primary section order.

## 5. Required end-to-end wiring before advertising can be accepted

### Ordinary geographic ads
- Read the canonical enabled geographic taxonomy from the approved configuration; do not infer a member's country from device language or IP.
- Let the member select an enabled geographic scope.
- Fetch only campaigns that are published, owner-approved, payment-confirmed where required, within schedule/budget/caps, not paused/withdrawn, and eligible for the selected scope.
- Start a server-authoritative viewing session; enforce foreground/visibility and valid heartbeat progression.
- Complete only after server-verified criteria; award only through the central wallet ledger with idempotency and audit evidence.
- Prevent duplicate viewing/reward across overlapping geographic scopes according to the approved campaign policy.
- Show the member the applicable reward and eligibility rules; never reward opening a screen or previewing an ad.

### Featured ads
- Keep featured selection/placement separate from ordinary ad delivery.
- Preserve geographic eligibility and Owner stop/withdrawal precedence across every feed and cache.
- Implement a real featured campaign feed, dedicated session/qualification lifecycle, idempotent reward claim and member reward history before representing the feature as operational.
- Keep the floating shortcut as an alternate entry to this same featured experience, subject to the recovered visibility exceptions.

### Commercial advertising governance
- Keep advertiser intake, representative onboarding, Media Workspace, creative review, Owner-set per-ad commission, payment confirmation, agreement signing, publication authorization and audit records distinct from member ad viewing.
- The Super Owner remains the sovereign authority; delegated UI visibility never replaces server-side permission checks.
- Do not invent pricing, commission, quotas or live payment behavior.

## 6. Delivery sequence

1. Reconcile advertising requirements and current callable/service contracts; document whether the existing timed-ad engine can safely support either member-facing ad category.
2. Implement the **قسم مشاهدة الإعلانات** hub with separate ordinary and featured destinations; do not expose a fake live feed.
3. Implement and test ordinary geographic delivery end to end.
4. Complete featured delivery, reward claims and history end to end.
5. Add the floating featured shortcut only after the exact visibility exceptions are recovered and tested.
6. Reorganize the home screen into the approved primary sections while preserving secondary routes.
7. Add Flutter/widget, Functions, emulator, authorization, idempotency, geographic-overlap and accessibility tests.
8. Update `IMPLEMENTATION_TRACEABILITY.md` with evidence and exact tested commit SHA.

## 7. Safety and release boundaries

All work is limited to the development branch. No merge to `main`, production deployment, production Firebase mutation, paid-service activation, live deletion-policy change, or financial action is authorized by this navigation request. Do not activate reward or payment flows with placeholder configuration. Do not claim a feature is complete until its UI, trusted backend, authorization, ledger, tests and platform evidence agree.
