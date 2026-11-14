# Trusted backend (Firebase Cloud Functions)

This package is the trusted execution layer for operations that must never be authorized by Flutter client code.

## Coin transfers

The callable function `getTransferQuote` returns the server-calculated gross amount, commission, net amount and settings version for the confirmation screen. The `transferCoins` callable accepts:

- `recipientUid`: destination member UID
- `amount`: positive integer gross amount debited from the sender
- `requestId`: client-generated idempotency key (8–80 letters, digits, underscores or hyphens)
- `expectedCommissionBps`: the rate shown in the confirmation quote; the server rejects the transfer if the owner changed the rate before confirmation

The commission is read from `platformSettings/coinTransfers` as integer basis points (`commissionBps`; 2,000 = 20%). Transfers are rejected until the owner has explicitly configured a commission rate; the system never silently assumes a zero fee. When transfers are disabled, the callable rejects the request.

One Firestore transaction atomically updates both `users/{uid}.coins` balances and creates:

- `coinTransfers/{senderUid}_{requestId}`: immutable transfer snapshot and commission rate
- `users/{senderUid}/walletLedger/{transferId}`: gross debit, commission and recipient net amount
- `users/{recipientUid}/walletLedger/{transferId}`: net credit and sender UID
- `platformWalletLedger/{transferId}`: platform commission credit

A retry with the same sender and request ID returns the original transfer instead of charging again. The commission calculation uses integer arithmetic; fractional coin fees are rounded down to the nearest whole coin.

## Owner-only commission settings

The callable `setTransferCommission` accepts `commissionBps` and an optional `enabled` flag. It requires the verified Firebase Auth custom claim `platformOwner: true`, writes the setting version and a record to `adminAuditLogs`.

**Bootstrap requirement:** the owner claim must be assigned only by a trusted operator using Firebase Admin SDK after independently verifying the owner's identity. Never expose a callable endpoint that lets a client grant itself this claim. The repository does not contain service-account credentials, and none should be committed.

## Local validation

From this directory:

```sh
npm install
npm test
```

The unit tests cover commission arithmetic, username normalization, member-profile validation, and registration-policy boundaries. Emulator-backed authorization rules are tested separately; transaction concurrency and retry behavior still require dedicated integration tests before production rollout.

## Important integration boundary

The Flutter profile transfer flow now requests a server quote, displays the gross amount/commission/net amount, and calls `transferCoins` through Firebase Functions with the quoted rate. The server rejects a stale quote if the owner changed the rate before confirmation. The client must never update balances or ledger collections directly. Store purchases and coin top-ups are deliberately non-operative until their trusted purchase and payment-verification endpoints exist. Until the client integration and Firestore/Storage rules are completed, do not deploy this backend to production or enable real coin transfers.


## Age policy

Member completion requires an explicitly enabled registration policy with a minimum age of at least 16. The Flutter form submits structured goal codes: friendship, social_connection, romantic_dating, and marriage. The trusted backend rejects unknown/free-text goals and rejects romantic_dating or marriage for members under 18. Client-side chip visibility is only a usability aid: the server is authoritative. This does not replace age assurance, minor-safety controls, or a jurisdiction-by-jurisdiction launch review.
