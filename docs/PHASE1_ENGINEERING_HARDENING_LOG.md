# Phase 1 Engineering Hardening Log

## 2026-11-17 — Call signaling expiry enforcement

**Scope:** development branch only: `codex/mawda-full-platform-implementation`.

### Finding
The call-signal reader queried and returned pending SDP/ICE signaling documents before checking whether a ringing call had passed its server-owned expiry timestamp. The ICE-configuration callable also accepted a ringing call without independently enforcing its 45-second ring deadline. This allowed stale call setup material to remain readable until a scheduled cleanup or another endpoint changed the call state.

### Change
- Resolve an expired or malformed ringing deadline before querying signal documents.
- Mark the ringing call as `missed` transactionally and return an empty signal page.
- Re-check the ringing deadline transactionally before issuing ICE configuration; expired calls fail with `deadline-exceeded`.
- Preserve active accepted calls and handle a concurrent transition to `accepted` without incorrectly marking it missed.

### Tests added
- Seed a ringing call with a past expiry and a still-live signal fixture; verify the signal is not returned and the call is marked missed.
- Seed a separate expired ringing call; verify ICE configuration is rejected with `deadline-exceeded` and the call is marked missed.

### Verification status
- Source and test changes committed to the development branch.
- GitHub Actions validation is required on the resulting exact commit before this change is marked test-passed.
- No Firebase environment was contacted or modified. No production resource, main branch, deployment, billing, or destructive retention process was touched.

### Remaining call acceptance
- Configure and validate TURN in a dedicated non-production environment.
- Run real Android/iOS device tests for call lifecycle, backgrounding, Bluetooth/audio routing, network changes and reconnect behavior.
- Continue security review of call participant authorization, room capacity, signaling expiry and cleanup.
