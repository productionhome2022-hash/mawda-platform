# Mawdda Platform 2026 — Canonical Administrative Terminology

**Status:** Owner-approved naming standard. Mandatory for all product documentation, UI, backend-generated user-facing copy, notifications, messages and release artifacts.

## Canonical role names

| Role | Canonical display name | Capacity and scope |
|---|---|---|
| Platform owner | **Super Owner** (Arabic explanatory label: **مالك المنصة**) | One platform owner identity; existing owner authorization remains authoritative |
| General administration | **Admin 1**, **Admin 2**, ... | Open-ended; permanent monotonic sequence; platform administration only within delegated permissions |
| Media administration | **Admin Media 1–5** | Exactly five seats; Advertising / Media Workspace scope |
| General production | **مشرف إنتاج عام 1–5** | Exactly five seats; general production scope |
| Team production | **مشرف إنتاج الفريق** / **Team Production Supervisor** | Open-ended; assigned team and its specific rented/assigned room only |

## Mandatory application scope

The canonical names must be consistent across:

- The highest-level product constitution, comprehensive vision, approved decision register, brand/product experience specification, execution plans and traceability matrices.
- All GitHub documentation, README files, architecture notes, API documentation, operational runbooks, test plans and release/acceptance checklists.
- Android, iOS, PWA and web UI: navigation, screens, dialogs, profile badges, member lists, rooms, chat participants, Workspace, advertising and every administration surface.
- Server-generated notifications, push notification titles/bodies, message sender labels, audit-log presentation labels, email templates and user-visible error/success messages.
- All supported locales and both RTL/LTR layouts. **Super Owner** remains the exact English canonical title; Arabic explanatory copy uses **مالك المنصة** consistently.

## Compatibility and authorization safety

This is a display terminology standard, not a request to rename internal identifiers. Preserve stable claims, role IDs, collection/document fields, callable names, persisted mode keys and migration identifiers unless a separately reviewed compatibility migration is approved. Existing internal `super_admin` identifiers may remain internal; they must never leak into user-facing labels. Authorization must use trusted role identity and scope, never parse display labels.

## Acceptance gate

Before the PR can leave Draft or be considered ready for merge:

1. Search the complete repository (not only Flutter screens) for old owner titles, transliterations, translated variants and stale supervisor labels.
2. Review every match and classify it as user-visible, documentation, historical migration note or internal compatibility identifier.
3. Replace stale user-facing and normative-document labels; retain a legacy string only when technically necessary and explicitly marked internal/legacy.
4. Verify role capacities, permanent numbering and scope separation in the role model and server authorization.
5. Add regression coverage for canonical documentation and user-facing string resources; inspect server-generated notification/message copy and all supported locales.
6. Record exact commit SHA, workflow runs, tests and any remaining unverified surfaces. A successful Flutter test alone is not proof of repository-wide terminology completion.

No merge to `main`, deployment, production Firebase mutation or release action is authorized by this naming standard. Those remain subject to the owner's separate explicit approval.
