# Mawdda Platform — Single Reference & Explicit Deployment Approval Policy

- **Updated (UTC):** `2026-11-27 10:52:58 UTC`
- **Repository:** `productionhome2022-hash/mawda-platform`
- **Single Development & Build Reference Branch:** `codex/mawda-full-platform-implementation`
- **Protected iOS Bundle ID:** `com.mawdda.platform.app`

## Core Policies
1. **Single Platform Reference:** `codex/mawda-full-platform-implementation` is the unified development and build reference branch for the full Mawdda platform.
2. **Branch Protection:** Deletion and non-fast-forward pushes on `codex/mawda-full-platform-implementation` are blocked via active GitHub ruleset without blocking the repository owner or requiring external third-party reviewers.
3. **Explicit Approval Required for External Deployments:** No deployment, hosting push, DNS/edge change, billing/Blaze activation, or resource mutation on **Firebase**, **Google Cloud**, **Cloudflare**, or any external environment may run automatically or without explicit owner approval.
