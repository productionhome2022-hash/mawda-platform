# Mawdda Platform 2026 — Canonical Administrative Terminology

**Status:** Approved naming standard. This document governs display terminology; it does not itself grant permissions or authorize a role migration.

## Canonical role names

| Role | Display name | Capacity | Scope |
|---|---|---:|---|
| Platform owner | **Super Owner**; Arabic explanatory label **مالك المنصة** | One | Entire platform, subject to owner authentication |
| General administration | **Admin 1, Admin 2, Admin 3…**; Arabic **أدمن ١، أدمن ٢…** | Open-ended | Only explicitly delegated platform administration |
| Media administration | **Admin Media 1–5**; Arabic **أدمن ميديا ١–٥** | Exactly five | Advertising Department and general Media Workspace |
| General production supervision | **مشرف إنتاج عام 1–5** | Exactly five | General production system |
| Team production supervision | **مشرف إنتاج الفريق** / **Team Production Supervisor** | Open-ended | Assigned team and its specific assigned/rented room only |

## Separation and authorization

- Admin N is independent of Admin Media, General Production Supervisor and Team Production Supervisor.
- Admin Media is not a general platform Admin and does not inherit general production authority.
- General Production Supervisors do not inherit Admin Media authority or team-room authority.
- Team Production Supervisor is scoped to the assigned team/room and cannot act across other teams.
- Each role is deny-by-default and server-authorized. Display labels must never be parsed to make authorization decisions.
- Admin N sequence numbers are permanent and must never be reused. The reappointment/number-reuse rule for the fixed five-seat Admin Media and General Production groups remains unresolved; do not infer or implement a reuse policy until the owner explicitly approves it.
- Super Owner authority remains the existing trusted owner identity and must not be obtainable through any administrator appointment.

## Compatibility

This is a user-facing naming standard, not a wholesale identifier migration. Preserve stable claims, role IDs, Firestore fields, collection names and callable names where required for compatibility. Legacy identifiers may remain internal-only and must not leak into user-visible copy.

## Required coverage

Apply the terminology consistently to Android, iOS, PWA and web; profiles, badges, chat participants, room member lists, workspaces, advertising, production screens, notifications, push messages, email templates, audit-log presentation, errors/success messages, and all supported locales.

## Acceptance gate

Before release, run a repository-wide search for legacy owner and supervisor labels, classify each match as display text, documentation, historical note or internal compatibility identifier, and verify every user-visible match. Add regression tests for role capacity, numbering, scope separation and display terminology. Do not claim global completion based only on a few screen labels.
