# Practical Test Logs & Discovered Suite - practical_exec_20261127T214527Z

## Discovered Test & Script Inventory
=== LAB PACKAGE SCRIPTS ===
no root package.json in lab
{
  "name": "mawda-platform-functions",
  "private": true,
  "main": "lib/index.js",
  "engines": {
    "node": "22"
  },
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "test": "npm run build && node --check scripts/bootstrap-owner.cjs && node --check scripts/test-signed-urls-http.cjs && node --check scripts/test-retention-storage.cjs && node --test test/*.test.js",
    "bootstrap:owner": "node scripts/bootstrap-owner.cjs",
    "test:rules": "firebase emulators:exec --config ../firebase.json --only firestore,storage --project demo-mawda-rules \"node --test test/rules/*.test.js\"",
    "test:media-integration": "npm run build && firebase emulators:exec --config ../firebase.json --only firestore,storage --project demo-mawda-media \"node --test test/integration/media-callables.integration.test.js\"",
    "test:media-signed-urls-http": "npm run build && node scripts/test-signed-urls-http.cjs",
    "test:signed-urls-http": "node scripts/test-signed-urls-http.cjs",
    "test:retention-integration": "firebase emulators:exec --config ../firebase.json --only firestore,storage --project demo-mawda-retention \"node --test test/integration/chat-retention.integration.test.js\"",
    "test:message-deletion-integration": "firebase emulators:exec --config ../firebase.json --only firestore,storage --project demo-mawda-message-deletion \"node --test test/integration/direct-message-deletion.integration.test.js\"",
    "test:retention-gcs": "npm run build && node scripts/test-retention-storage.cjs",
    "test:owner-audit-export-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-owner-audit \"node --test test/integration/owner-audit-export.integration.test.js\"",
    "test:media-legal-hold-integration": "firebase emulators:exec --config ../firebase.json --only firestore,storage --project demo-mawda-legal-hold \"node --test test/integration/media-legal-hold.integration.test.js\"",
    "test:media-scanner-live-e2e": "npm run build && node scripts/test-live-media-scanner-e2e.cjs",
    "test:profile-media-integration": "firebase emulators:exec --config ../firebase.json --only firestore,storage --project demo-mawda-profile-media \"node --test test/integration/member-profile-media.integration.test.js\"",
    "test:message-legal-hold-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-message-hold \"node --test test/integration/message-legal-hold.integration.test.js\"",
    "test:wallet-store-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-wallet-store \"node --test test/integration/wallet-store.integration.test.js\"",
    "test:guest-privacy-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-guest-privacy \"node --test test/integration/guest-privacy.integration.test.js\"",
    "test:safety-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-safety \"node --test test/integration/safety-cases.integration.test.js\"",
    "test:push-token-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-push-tokens \"node --test test/integration/push-token.integration.test.js\"",
    "test:room-rental-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-room-rental \"node --test test/integration/room-rental.integration.test.js\"",
    "test:biometric-integration": "npm run build && firebase emulators:exec --config ../firebase.json --only firestore,storage --project demo-mawda-biometric \"node --test test/integration/biometric-verification.integration.test.js\"",
    "test:email-renewal-integration": "firebase emulators:exec --config ../firebase.json --only auth,firestore --project demo-mawda-email-renewal \"node --test test/integration/email-verification-renewal.integration.test.js\"",
    "test:premium-profile-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-premium-profile \"node --test test/integration/premium-profile.integration.test.js\"",
    "test:room-events-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-room-events \"node --test test/integration/room-events.integration.test.js\"",
    "test:emulator-backup-restore": "node scripts/test-emulator-backup-restore.cjs",
    "test:guest-session-integration": "firebase emulators:exec --config ../firebase.json --only auth,firestore --project demo-mawda-guest-session \"MAWDDA_ALLOW_TEST_SEED=1 node scripts/seed-test-accounts.cjs && node --test test/integration/guest-session.integration.test.js\"",
    "test:seeded-persona-interaction": "firebase emulators:exec --config ../firebase.json --only auth,firestore --project demo-mawda-personas \"MAWDDA_ALLOW_TEST_SEED=1 node scripts/seed-test-accounts.cjs && node --test test/integration/test-persona-interaction.integration.test.js\"",
    "test:engagement-rewards-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-engagement-rewards \"node --test test/integration/engagement-rewards.integration.test.js\"",
    "test:seed-accounts": "firebase emulators:exec --config ../firebase.json --only auth,firestore --project demo-mawda-test-accounts \"MAWDDA_ALLOW_TEST_SEED=1 node scripts/seed-test-accounts.cjs\"",
    "test:all": "npm test && npm run test:seed-accounts && npm run test:seeded-persona-interaction && npm run test:rules && npm run test:media-integration && npm run test:sticker-lifecycle-integration && npm run test:retention-integration && npm run test:message-deletion-integration && npm run test:owner-entitlement-grants-integration && npm run test:wallet-store-integration && npm run test:coin-package-gifts-integration && npm run test:featured-ad-finance-integration && npm run test:featured-ad-reward-policy-integration && npm run test:featured-ad-reward-settlement-integration && npm run test:room-rental-integration && npm run test:room-events-integration && npm run test:call-signaling-integration && npm run test:call-economy-gifts-integration && npm run test:emulator-backup-restore && npm run test:push-token-integration && npm run test:biometric-integration && npm run test:engagement-rewards-integration && npm run test:email-renewal-integration && npm run test:safety-integration && npm run test:guest-privacy-integration && npm run test:guest-session-integration && npm run test:owner-audit-export-integration && npm run test:media-legal-hold-integration && npm run test:profile-media-integration && npm run test:premium-profile-integration && npm run test:message-legal-hold-integration && npm run test:specialized-role-capacity-integration && npm run test:capacity-media-integration && npm run test:store-gifting-integration",
    "test:owner-entitlement-grants-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-owner-entitlement-grants \"node --test test/integration/owner-entitlement-grants.integration.test.js\"",
    "test:call-signaling-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-calls \"node --test test/integration/call-signaling.integration.test.js\"",
    "test:featured-ad-finance-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-featured-ad-finance \"node --test test/integration/featured-ad-finance.integration.test.js\"",
    "test:specialized-role-capacity-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-role-capacity \"node --test test/integration/specialized-role-capacity.integration.test.js\"",
    "test:store-gifting-integration": "firebase emulators:exec --config ../firebase.json --only firestore,auth --project demo-mawda-store-gifting \"node --test test/integration/store-gifting.integration.test.js\"",
    "test:call-economy-gifts-integration": "npm run build && firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-call-economy-gifts \"node --test test/integration/call-economy-gifts.integration.test.js\"",
    "test:coin-package-gifts-integration": "npm run build && firebase emulators:exec --config ../firebase.json --only auth,firestore --project demo-mawda-coin-gifts \"node --test test/integration/coin-package-gifts.integration.test.js\"",
    "test:featured-ad-reward-policy-integration": "npm run build && firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-featured-ad-reward-policy \"node --test test/integration/featured-ad-reward-policy.integration.test.js\"",
    "test:capacity-media-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-capacity-media \"node --test test/integration/capacity-media-management.integration.test.js\"",
    "test:persona-load": "node scripts/generate-persona-load-fixtures.cjs --count=5000 --output=mawdda-load-artifacts/personas.json && firebase emulators:exec --config ../firebase.json --only auth,firestore --project demo-mawda-persona-load 'MAWDDA_LOAD_FIXTURE=mawdda-load-artifacts/personas.json MAWDDA_LOAD_REPORT=mawdda-load-artifacts/report.json node --test test/integration/persona-load.integration.test.js'",
    "test:store-catalog-integration": "firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-store-catalog \"node --test test/integration/store-catalog.integration.test.js\"",
    "test:sticker-lifecycle-integration": "npm run build && firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-sticker-lifecycle \"node --test test/integration/sticker-lifecycle-gates.integration.test.js\"",
    "test:featured-ad-reward-settlement-integration": "npm run build && firebase emulators:exec --config ../firebase.json --only firestore --project demo-mawda-featured-ad-reward-settlement \"node --test test/integration/featured-ad-reward-settlement.integration.test.js\""
  },
  "dependencies": {
    "firebase-admin": "^13.0.0",
    "firebase-functions": "^6.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "@firebase/rules-unit-testing": "^4.0.1",
    "firebase": "^11.0.0",
    "firebase-tools": "^14.0.0"
  }
}
=== LAB TEST & SCRIPT FILES ===
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/scripts/bootstrap-owner.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/scripts/seed-test-accounts.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/scripts/test-emulator-backup-restore.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/scripts/test-live-media-scanner-e2e.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/scripts/test-retention-storage.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/scripts/test-signed-urls-http.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/scripts/validate-firebase-config.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/advertising-governance.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/advertising-intake.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/advertising-permissions.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/audit-archive.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-evidence.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-lifecycle.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-media.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-review-state.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-review.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-verification-cycle.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/biometric-verification.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/call-entitlements.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/call-signaling.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/call-usage-policy.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/capacity-media-management.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/chat-media-policy.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/chat-retention-policy.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/coin-math.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/coin-purchase-requests.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/contracts-workflow.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/creator-proposals.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/default-store-catalog.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/direct-chat-id.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/direct-message-receipts.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/direct-message.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/economy-payment-policy.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/economy-pricing.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/email-verification-cycle.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/engagement-rewards.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/featured-ad-finance.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/featured-ad-rewards.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/featured-advertising.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/group-call-economy.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/guest-sessions.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/index.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/legal-portal-access.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/link-policy.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/mawdda-media-plane.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-cleanup.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-controls.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-derivative-contract.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-legal-hold.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-quota.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-scanner.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media-security.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/media.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-access.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-message-pagination.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-profile-update.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-profile-view.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-profile.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-social-links-access.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/member-social-links.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/message-legal-hold.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/nonproduction-target.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/owner-access.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/owner-audit-chain.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/owner-audit-export.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/owner-chat-review.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/owner-live-stream.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/platform-economic-policy.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/platform-role-identities.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/privacy-acknowledgement.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/production-applications.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/registration-policy.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/retention.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/room-call-policy.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/room-events.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/room-policy.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/room-rental.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/safety-cases.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/sticker-catalog.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/sticker-policy.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/store-catalog.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/store-gifting.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/store-purchase.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/verification-calendar.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/wallet-ledger.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/src/wallet-reconciliation.ts
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/advertising-governance.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/advertising-intake.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/advertising-permissions.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/audit-archive.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-evidence.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-media.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-review-state.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-review.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-reward-security.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-verification-cycle.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/biometric-verification.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-entitlements.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-signaling-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-signaling.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-usage-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/capacity-media-management.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-media-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-retention-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/coin-math.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/coin-purchase-requests.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/contracts-workflow.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/creator-proposals.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/direct-chat-id.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/direct-message-receipts.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/direct-message.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/economy-payment-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/economy-pricing.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/email-verification-cycle.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/engagement-rewards.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/feature-coverage-matrix.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/featured-ad-finance.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/featured-ad-rewards.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/featured-advertising.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/fixtures/feature-coverage-matrix.json
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/fixtures/test-account-personas.json
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/gcs-signed-url.http.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/group-call-economy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/guest-sessions.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/biometric-verification.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/call-economy-gifts.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/call-signaling.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/capacity-media-management.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/chat-retention.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/coin-package-gifts.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/direct-message-deletion.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/email-verification-renewal.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/engagement-rewards.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/featured-ad-finance.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/featured-ad-reward-policy.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/featured-ad-reward-settlement.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/guest-privacy.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/guest-session.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/media-callables.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/media-legal-hold.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/member-profile-media.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/message-legal-hold.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/owner-audit-export.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/owner-entitlement-grants.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/premium-profile.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/push-token.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/room-events.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/room-rental.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/safety-cases.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/specialized-role-capacity.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/sticker-lifecycle-gates.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/store-catalog.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/store-gifting.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/test-persona-interaction.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/integration/wallet-store.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/legal-portal-access.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/link-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/mawdda-media-plane.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-cleanup.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-controls.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-derivative-contract.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-legal-hold.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-quota.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-scanner.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/media-security.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-access.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-message-pagination.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-profile-update.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-profile-view.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-profile.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-social-links-access.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/member-social-links.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/message-legal-hold.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/nonproduction-target.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-access.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-chain.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-export.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-chat-review.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-live-stream.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/platform-economic-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/platform-role-identities.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/platform-terminology-docs.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/privacy-acknowledgement.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/registration-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/retention.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/room-call-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/room-events.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/room-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/room-rental-catalog.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/room-rental-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/room-rental.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/rules/firestore.rules.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/rules/storage.rules.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/safety-cases.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/sticker-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/store-catalog.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/store-gifting.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/store-purchase.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/test-account-personas.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/validate-firebase-config.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/verification-calendar.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/wallet-reconciliation.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/test/processors.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/test/processors.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/test/security.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scanner/test/server.test.mjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scripts/firestore-transient-retry.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scripts/generate-persona-load-fixtures.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scripts/run-load-test.sh
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/scripts/sync-from-platform.sh
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/audio_wav_encoder_test.dart
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/chat_audio_policy_test.dart
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/coin_transfer_models_test.dart
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/featured_ads_screen_test.dart
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/firestore-transient-retry.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/media_workspace_screen_test.dart
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/persona-load.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/policies/android_download_policy_test.dart
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/services/direct_message_page_test.dart
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/services/local_biometric_service_test.dart
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/services/media_status_polling_test.dart
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/widgets/mawdda_app_downloads_test.dart
/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/test/widgets/responsive_room_card_test.dart
=== PLAT TEST & SCRIPT FILES ===
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/scripts/bootstrap-owner.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/scripts/seed-test-accounts.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/scripts/test-emulator-backup-restore.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/scripts/test-live-media-scanner-e2e.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/scripts/test-retention-storage.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/scripts/test-signed-urls-http.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/scripts/validate-firebase-config.cjs
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/advertising-governance.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/advertising-intake.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/advertising-permissions.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/audit-archive.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-evidence.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-media.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-review-state.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-review.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-reward-security.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-verification-cycle.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/biometric-verification.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/call-entitlements.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/call-signaling-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/call-signaling.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/call-usage-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/capacity-media-management.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/chat-media-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/chat-retention-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/coin-math.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/coin-purchase-requests.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/contracts-workflow.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/creator-proposals.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/direct-chat-id.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/direct-message-receipts.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/direct-message.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/economy-payment-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/economy-pricing.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/email-verification-cycle.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/engagement-rewards.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/feature-coverage-matrix.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/featured-ad-finance.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/featured-ad-rewards.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/featured-advertising.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/fixtures/feature-coverage-matrix.json
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/fixtures/test-account-personas.json
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/gcs-signed-url.http.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/group-call-economy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/guest-sessions.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/biometric-verification.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/call-economy-gifts.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/call-signaling.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/capacity-media-management.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/chat-retention.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/coin-package-gifts.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/direct-message-deletion.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/email-verification-renewal.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/engagement-rewards.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/featured-ad-finance.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/featured-ad-reward-policy.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/featured-ad-reward-settlement.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/guest-privacy.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/guest-session.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/media-callables.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/media-legal-hold.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/member-profile-media.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/message-legal-hold.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/owner-audit-export.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/owner-entitlement-grants.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/premium-profile.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/push-token.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/room-events.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/room-rental.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/safety-cases.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/specialized-role-capacity.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/sticker-lifecycle-gates.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/store-catalog.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/store-gifting.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/test-persona-interaction.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/integration/wallet-store.integration.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/legal-portal-access.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/link-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/mawdda-media-plane.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-cleanup.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-controls.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-derivative-contract.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-legal-hold.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-quota.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-scanner.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/media-security.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-access.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-message-pagination.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-profile-update.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-profile-view.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-profile.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-social-links-access.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/member-social-links.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/message-legal-hold.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/nonproduction-target.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/owner-access.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/owner-audit-chain.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/owner-audit-export.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/owner-chat-review.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/owner-live-stream.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/platform-economic-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/platform-role-identities.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/platform-terminology-docs.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/privacy-acknowledgement.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/registration-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/retention.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/room-call-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/room-events.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/room-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/room-rental-catalog.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/room-rental-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/room-rental.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/rules/firestore.rules.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/rules/storage.rules.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/safety-cases.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/sticker-policy.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/store-catalog.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/store-gifting.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/store-purchase.test.js
/data/data/com.termux/files/home/Mawdda-Workspace/mawda-platform/functions/test/test-account-personas.test.js

## Actual Execution Log Output
```text
--- RUNNING LAB FUNCTIONS NPM TEST ---

> test
> npm run build && node --check scripts/bootstrap-owner.cjs && node --check scripts/test-signed-urls-http.cjs && node --check scripts/test-retention-storage.cjs && node --test test/*.test.js


> build
> tsc

/data/data/com.termux/files/usr/bin/sh: 1: tsc: not found
--- INSPECT/RUN CANDIDATE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/audit-archive.test.js ---
node:internal/modules/cjs/loader:1503
  throw err;
  ^

Error: Cannot find module '../lib/owner-audit-chain'
Require stack:
- /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/audit-archive.test.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
    at Module._load (node:internal/modules/cjs/loader:1285:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1600:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/audit-archive.test.js:3:37)
    at Module._compile (node:internal/modules/cjs/loader:1854:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/audit-archive.test.js'
  ]
}

Node.js v24.17.0
--- INSPECT/RUN CANDIDATE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-signaling-policy.test.js ---
node:internal/modules/cjs/loader:1503
  throw err;
  ^

Error: Cannot find module '../lib/call-signaling.js'
Require stack:
- /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-signaling-policy.test.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
    at Module._load (node:internal/modules/cjs/loader:1285:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1600:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-signaling-policy.test.js:3:39)
    at Module._compile (node:internal/modules/cjs/loader:1854:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-signaling-policy.test.js'
  ]
}

Node.js v24.17.0
--- INSPECT/RUN CANDIDATE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-usage-policy.test.js ---
node:internal/modules/cjs/loader:1503
  throw err;
  ^

Error: Cannot find module '../lib/call-usage-policy'
Require stack:
- /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-usage-policy.test.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
    at Module._load (node:internal/modules/cjs/loader:1285:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1600:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-usage-policy.test.js:5:5)
    at Module._compile (node:internal/modules/cjs/loader:1854:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/call-usage-policy.test.js'
  ]
}

Node.js v24.17.0
--- INSPECT/RUN CANDIDATE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-media-policy.test.js ---
node:internal/modules/cjs/loader:1503
  throw err;
  ^

Error: Cannot find module '../lib/chat-media-policy'
Require stack:
- /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-media-policy.test.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
    at Module._load (node:internal/modules/cjs/loader:1285:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1600:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-media-policy.test.js:7:5)
    at Module._compile (node:internal/modules/cjs/loader:1854:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-media-policy.test.js'
  ]
}

Node.js v24.17.0
--- INSPECT/RUN CANDIDATE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-retention-policy.test.js ---
node:internal/modules/cjs/loader:1503
  throw err;
  ^

Error: Cannot find module '../lib/chat-retention-policy'
Require stack:
- /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-retention-policy.test.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
    at Module._load (node:internal/modules/cjs/loader:1285:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1600:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-retention-policy.test.js:14:5)
    at Module._compile (node:internal/modules/cjs/loader:1854:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/chat-retention-policy.test.js'
  ]
}

Node.js v24.17.0
--- INSPECT/RUN CANDIDATE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/economy-payment-policy.test.js ---
node:internal/modules/cjs/loader:1503
  throw err;
  ^

Error: Cannot find module '../lib/economy-payment-policy'
Require stack:
- /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/economy-payment-policy.test.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
    at Module._load (node:internal/modules/cjs/loader:1285:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1600:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/economy-payment-policy.test.js:6:5)
    at Module._compile (node:internal/modules/cjs/loader:1854:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/economy-payment-policy.test.js'
  ]
}

Node.js v24.17.0
--- INSPECT/RUN CANDIDATE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/link-policy.test.js ---
node:internal/modules/cjs/loader:1503
  throw err;
  ^

Error: Cannot find module '../lib/link-policy'
Require stack:
- /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/link-policy.test.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
    at Module._load (node:internal/modules/cjs/loader:1285:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1600:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/link-policy.test.js:7:5)
    at Module._compile (node:internal/modules/cjs/loader:1854:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/link-policy.test.js'
  ]
}

Node.js v24.17.0
--- INSPECT/RUN CANDIDATE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-chain.test.js ---
node:internal/modules/cjs/loader:1503
  throw err;
  ^

Error: Cannot find module '../lib/owner-audit-chain'
Require stack:
- /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-chain.test.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
    at Module._load (node:internal/modules/cjs/loader:1285:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1600:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-chain.test.js:6:5)
    at Module._compile (node:internal/modules/cjs/loader:1854:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-chain.test.js'
  ]
}

Node.js v24.17.0
--- INSPECT/RUN CANDIDATE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-export.test.js ---
node:internal/modules/cjs/loader:1503
  throw err;
  ^

Error: Cannot find module '../lib/owner-audit-export'
Require stack:
- /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-export.test.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
    at Module._load (node:internal/modules/cjs/loader:1285:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1600:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-export.test.js:6:5)
    at Module._compile (node:internal/modules/cjs/loader:1854:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/owner-audit-export.test.js'
  ]
}

Node.js v24.17.0
--- INSPECT/RUN CANDIDATE: /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/platform-economic-policy.test.js ---
node:internal/modules/cjs/loader:1503
  throw err;
  ^

Error: Cannot find module '../lib/platform-economic-policy.js'
Require stack:
- /data/data/com.termux/files/home/Mawdda-Workspace/mawdda-5000-simulation-lab/functions/test/platform-economic-policy.test.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1500:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1116:12)
    at Module._load (node:internal/modules/cjs/loader:1285:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1600:12)
```
