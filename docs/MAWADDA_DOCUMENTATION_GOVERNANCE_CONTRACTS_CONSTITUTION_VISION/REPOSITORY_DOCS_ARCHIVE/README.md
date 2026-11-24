# Mawdda — Central Repository Documentation Archive

This directory is the consolidated, SHA-preserving mirror of the repository's pre-existing `docs/` tree as of 2026-11-23.

- Source files mirrored: **1,194**
- Destination: this directory, retaining each source file's relative subpath.
- Original `docs/` paths are intentionally retained for compatibility with existing relative links, workflows, and references. This is a verified copy/consolidation, not yet a destructive move.
- Git stores identical blobs by SHA, so unchanged files reuse their existing object data.
- No source document was deleted or overwritten.
- The full file-level mapping is deterministic: destination path = this directory + source path after `docs/`.

## Main subject areas

The archive contains product vision and constitution, owner decisions, contracts, governance, advertising and reward policies, economy and wallet, identity and biometrics, chat/rooms/calls, media and retention, Android/iOS/PWA, privacy/security, implementation records, branch inventories, reconciliation reports, forensic reports, Termux evidence, test records, and release/readiness documents.

## Primary current records

- [79-branch E522 reconciliation](../X_BRANCH_SECTION/E522_79_BRANCH_RECONCILIATION_2026-11-23.md)
- [Central governance and documentation index](../README.md)

## Migration rule

Do not delete the original source paths until internal links, CI references, scripts, and documentation references have been migrated and validated. The next migration pass must rewrite relative links and then remove old paths in one reviewed change. This archive mirror ensures the complete existing documentation set is already present under the central E522 documentation section while compatibility is preserved.
