# Advertising Moderator Commission-Only Agreement — Draft for Legal Review

**Company / Platform rights holder:** Production Home Company  
**Platform:** Mawdda / MAWDDA  
**Document status:** Product and legal-workflow specification; draft agreement template, not yet legally approved or activated  
**Version:** 1.0 — 2026-11-16

> **Legal review required:** This draft expresses the platform owner's intended commercial arrangement. It is not a legal opinion and must not be represented as a legally enforceable employment contract in every jurisdiction. Before activation, qualified counsel must review the company's registered legal name and form, authorized signatory, governing law, worker classification, minimum-wage/commission rules, tax/social-insurance obligations, privacy requirements, electronic-signature rules, dispute forum, and any mandatory local terms in the moderator's country and the company's jurisdiction. The product must not onboard or collect sensitive identity documents until the privacy, security and legal basis are approved.

## 1. Company identity and document presentation

1. The contracting company name displayed throughout the agreement is **Production Home Company**. The spelling is exactly **Production**, not “Protection”.
2. The agreement is issued on behalf of Production Home Company, owner/operator of the Mawdda platform and application, by the authorized Owner / Super Admin representative.
3. The electronic agreement must use the approved company logo/cover artwork supplied and verified by the platform Owner. Do not recreate, approximate, substitute, or invent a logo. The current repository's `assets/` directory contains only `.gitkeep`; therefore the artwork is **not yet present in the repository**. Until the owner-provided source asset is added and verified, render a neutral company-name wordmark placeholder in the draft preview and do not claim it is the official logo.
4. The agreement must be available in the moderator's selected supported language, with a canonical version and language recorded at signing. Translations must preserve the same legal meaning and be reviewed before use.

## 2. Purpose and relationship

1. The Company may appoint an approved person as an advertising acquisition/submission moderator for the limited purpose of introducing advertisers, preparing advertising requests, and following their own requests through the Mawdda advertising workflow.
2. The commercial model intended by the Owner is **commission-only**. No fixed salary, hourly wage, guaranteed minimum income, or employee benefits are promised by this product specification. This clause must be adapted by counsel to the legally correct worker classification; calling a relationship “commission-only” does not by itself determine whether the person is legally an employee, agent, or independent contractor.
3. The moderator receives no authority to bind the Company, sign contracts for the Company, promise publication, collect or confirm advertiser payments on behalf of the Company, set final advertising prices, approve creatives, publish campaigns, appoint moderators, or access Company financial records.
4. Appointment is not effective until the Company approves the applicant, the required profile information is verified to the approved level, and both parties complete the electronic signing flow.

## 3. Moderator identity and contact information

Before signing, the moderator must review and provide accurate, current information in the secure onboarding form. Collect only fields approved by the Company's privacy/legal review and necessary for identity, communication, contract administration, and lawful payment of commissions.

Required or conditionally required fields:
- Full legal name as shown on the identity document, where lawful and necessary.
- Display name / name used in the platform.
- Mawdda account UID (system-generated; never ask the moderator to type a password or access token).
- Country of residence and country/region of assigned primary advertising scope.
- City and residential/contact address, to the level legally necessary.
- Primary mobile telephone number, including country code.
- WhatsApp contact number, with an explicit confirmation whether it is the same as the primary number.
- Secondary ordinary-call number, if different.
- Email address for formal notices and contract copy.
- Preferred language and time zone.
- Any legally required tax/business registration details, only where counsel confirms they are necessary.

Identity-document number, copy of an identity document, date of birth, bank/payment details, and other highly sensitive data must **not** be mandatory by default. Request them only where a documented legal requirement or approved payout process requires them, through a restricted secure flow, with retention and access controls. Never place such data in GitHub, source code, analytics, ordinary application logs, or moderator-visible shared request records.

The moderator must confirm that the submitted information is accurate and update it when it changes. The Company may suspend new submissions or commission settlement while materially necessary details are inaccurate or cannot be verified, subject to applicable law and notice.

## 4. Scope, geographic assignment and permissions

1. The moderator has one Company-assigned primary/home geographic scope and may select up to two additional scopes from the currently enabled list, for a maximum of three scopes total. The moderator cannot change their own primary scope or expand this limit.
2. The moderator may introduce advertisers, enter advertiser-provided contact details, upload eligible image/video creatives, submit eligible external links, select authorized geographic targets, enter an initial proposed price, propose an advertising duration, submit the request, respond to correction requests, and view the status of their own requests.
3. All uploaded media and external links are subject to server-side validation, safety review and platform policy.
4. The moderator may not access another moderator's private requests, the general financial ledger, revenue reports, Company-wide commission settings, or private member data unrelated to the assigned work.
5. All role permissions are enforced on the server. Hiding a control in the interface is not an authorization mechanism.

## 5. Commission-only compensation

1. The intended commercial arrangement is **commission-only**. There is **no platform-wide or global advertising commission percentage**. No universal percentage is promised, assumed, seeded or applied across campaigns.
2. For **each individual advertising request/campaign**, the Super Admin / Owner explicitly sets the moderator's commission percentage for that advertisement. The percentage may differ from one advertisement to another. A campaign cannot proceed to final commercial commitment, publication approval or commission calculation until the Owner has explicitly entered that campaign's rate.
3. The moderator cannot set, alter or approve their own commission rate. The rate for that advertisement, its calculation basis, commission amount and estimated Company net must be shown in the shared request workspace.
4. The moderator must explicitly accept the campaign-specific commission rate and commercial terms before the campaign is committed for publication processing. If the Owner changes the rate after acceptance, renewed explicit acceptance is required and recorded as a versioned amendment. Silence or continued login is not acceptance.
5. The request record must preserve the campaign-specific rate, rate/version identifier, moderator acceptance evidence, calculation basis, currency, amount actually received, adjustments, and final commission amount. A rate accepted for one advertisement does not apply to any other advertisement.
6. Intended calculation, subject to counsel-approved accounting rules: `commission = eligible commission base × the rate explicitly set and accepted for this advertisement`. The intended base is the campaign amount actually received and confirmed by the Owner, excluding separately identified taxes, refunds, chargebacks and pass-through fees where applicable. The Company net amount is the eligible amount received minus the moderator commission and any separately accounted taxes/fees/refunds. The interface must show gross amount, this advertisement's commission rate, commission amount, deductions (if any), and estimated Company net separately; it must never label an estimate as settled cash.
7. Example only: if the eligible amount actually received is 100 currency units and the Owner sets and the moderator accepts a 10% commission for that advertisement, the commission is 10 and the Company's amount before other separately accounted deductions is 90. This is an arithmetic example, not a default rate or a promised rate.
8. No commission is earned merely because a request was submitted, a price was proposed, or a campaign was approved. The earning event and payable date must be explicitly configured and disclosed. The intended basis is a valid campaign approved by the Owner and the corresponding advertiser funds actually received and confirmed by the Owner, subject to refunds, cancellations, chargebacks, partial payments, fraud review and applicable law.
9. No commission payout is authorized by this document alone. Payout channels, identity/tax checks, payment schedule, minimum payout thresholds (if any), currency conversion, fees, withholding, disputes and reconciliation must be separately defined and legally reviewed before payout activation.
10. The accepted rate for an advertisement is locked to that advertisement. It cannot be changed retroactively without a recorded amendment and renewed moderator acceptance. No global rate exists as a fallback.

## 6. Advertising request, price and duration workflow

1. The moderator enters the initial advertiser-agreed proposed price and requested campaign duration. These are proposals, not final Company commitments.
2. The Super Admin / Owner may accept or reject the proposed price and may optionally increase or decrease it. Any final price must be explicitly recorded by the Owner.
3. The moderator may propose a duration. The Owner may enter or revise the duration and is the only role authorized to approve the final duration and schedule.
4. The shared request workspace must show the actual creative or a safe playable preview, advertiser details, targeting, proposed and final price, proposed and final duration, campaign-specific commission rate, commission calculation, Company net estimate, payment state, approval state and audit history.
5. The Owner alone confirms actual receipt of advertiser funds, approves or rejects publication, and activates a campaign. A moderator must never collect money on behalf of the Company unless a separate written authority is issued and legally approved.
6. The campaign remains unpublished until all required Owner approvals and payment confirmation are recorded server-side.

## 7. Company and moderator obligations

**Company obligations (subject to applicable law):**
- Provide the moderator with the approved scope and the tools necessary to submit requests.
- Make the applicable commission rate and calculation basis visible before the moderator accepts each campaign's terms.
- Maintain an auditable record of requests, rate versions, approvals, payment confirmations, commission calculations, adjustments and settlement status.
- Provide a secure way to access the moderator's own contract and relevant commission statements.
- Handle personal information only for disclosed and lawful purposes with appropriate security and retention limits.

**Moderator obligations:**
- Provide truthful and current identity/contact information.
- Obtain permission to share advertiser contact details and creative materials.
- Not make false claims about Mawdda, the Company, prices, guaranteed reach, publication, campaign performance, or approval.
- Not promise discounts, durations, publication or services that the Owner has not approved.
- Not collect advertiser money, payment credentials, passwords or verification codes on the Company's behalf.
- Not upload unlawful, infringing, deceptive, malicious or prohibited material.
- Protect confidential Company, advertiser and platform information and use it only for the assigned work.
- Follow platform safety, advertising, privacy, anti-fraud and communications policies.
- Disclose conflicts of interest and avoid duplicate or misleading attribution claims.

## 8. Intellectual property, confidentiality and brand use

1. The Company retains all rights it owns or licenses in Mawdda, its application, platform, source code, trademarks, logos, designs, advertising systems, databases, documentation and confidential business information.
2. The moderator receives a limited, revocable, non-exclusive permission to use approved Company brand materials solely to perform the assigned work. No ownership or trademark license beyond that limited purpose is transferred.
3. The moderator must not copy, modify, register, resell, sublicense, publish or use Company intellectual property outside the authorized scope.
4. Advertiser creative rights remain with their lawful owners. The moderator must obtain and confirm the necessary permission for submission and campaign use.
5. Confidentiality obligations continue after suspension or termination, subject to mandatory legal rights and disclosures.

## 9. Term, suspension and termination

1. The appointment begins only when the Company countersigns/approves the electronic agreement and activates the moderator role.
2. The Company may suspend access for security concerns, suspected fraud, policy violations, inaccurate material information, or legal requirements. Where appropriate and lawful, the moderator will be notified and given an opportunity to respond.
3. Either party may request termination through the documented process. The Company may revoke access immediately where necessary to protect members, advertisers, funds, systems or legal compliance.
4. Termination does not erase valid historical records, accepted campaign terms, or commission amounts already earned under the final approved rules. Pending or disputed commissions must be reconciled under the disclosed policy and applicable law.
5. Personal data is retained only as long as necessary for contract, legal, accounting, fraud-prevention and dispute obligations, then deleted or anonymized according to the approved retention schedule. Legal holds and mandatory retention periods take precedence where required.

## 10. Disputes, governing law and mandatory rights

The governing law, competent courts or dispute-resolution method, notice addresses, mandatory employment/contractor protections, tax obligations, and language precedence must be completed by qualified counsel before publication. Do not insert a guessed country, court, arbitration seat, or waiver of mandatory rights. Nothing in this agreement waives rights that cannot lawfully be waived.

## 11. Electronic signature and evidence

The electronic signing flow must:
1. Present the complete agreement and privacy notice before acceptance, with an option to download or retain a copy.
2. Require the moderator to confirm the accuracy of the submitted profile and actively accept the exact agreement version.
3. Capture an electronic signature action such as typed full legal name plus an explicit unchecked-by-default acceptance control and an approved step-up authentication method. A typed name alone must not be assumed legally sufficient in every jurisdiction.
4. Capture a tamper-evident evidence record: agreement version and content hash, language, moderator UID, authenticated actor, timestamp in UTC, signature method, acceptance event ID, and the relevant profile snapshot/version. Capture IP/device metadata only if approved by privacy counsel, disclosed, proportionate and lawful.
5. Require the authorized Company Owner / Super Admin to countersign or approve the agreement, recording the actor, authority, timestamp and agreement hash.
6. Store the signed agreement and evidence in a restricted server-controlled location. The moderator can retrieve their own copy; only authorized Company roles can access administrative copies.
7. Prevent edits to a signed version. Any material change requires a new version and renewed acceptance; preserve prior signed versions and audit history.
8. Keep role activation blocked until both required signatures/approvals are verified server-side.

## 12. Acceptance fields

**Company**
- Legal/registered name: Production Home Company (must be verified against current company registration before activation)
- Authorized signatory: [Company Owner / authorized representative — complete in the secure admin workflow]
- Company registration/jurisdiction details: [complete after legal verification]

**Moderator**
- Full legal name: [secure onboarding field]
- Mawdda account UID: [server populated]
- Country / city / address: [secure onboarding fields]
- Primary phone: [secure onboarding field]
- WhatsApp: [secure onboarding field]
- Secondary phone: [optional secure onboarding field]
- Email: [secure onboarding field]
- Assigned primary scope and permitted additional scopes: [server/admin populated]
- Per-advertisement commission rate and request ID(s): [set by Owner and accepted by moderator for each request]

**Electronic acceptance**
- Moderator signature action and timestamp: [server generated]
- Company countersignature and timestamp: [server generated]
- Agreement version/hash: [server generated]
- Status: Draft / Pending Moderator Signature / Pending Company Approval / Active / Suspended / Terminated

---

## Implementation and activation safeguards

- This file is a draft legal/product specification, not a live contract and not proof that e-signature or moderator onboarding has been implemented.
- Do not fabricate the official logo. The Owner must supply/identify the approved cover/logo asset and approve its use.
- Do not collect identity documents, bank details or other sensitive information until legal basis, data minimization, secure storage, access controls and retention are implemented and tested.
- Do not activate moderator commission payouts, real-money checkout or payment collection through this document.
- Before activation, add localized legal review, secure onboarding, server-authoritative role activation, e-signature evidence, owner countersignature, versioned campaign commission acceptance, commission ledger and dispute/refund rules with tests.
