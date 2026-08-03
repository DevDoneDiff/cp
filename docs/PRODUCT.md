# Product

## Status
- State: approved
- Approved: true
- Approval_scope: complete investor-demo MVP for residential solar
- Deferred_scope: production provider operations, real financing, multi-category expansion, and post-MVP scale

No dependent spec may rely on unresolved product truth within its scope.

## Source Basis
- `docs/source/PRODUCT_SYSTEM_SPEC.md`
- `docs/source/MVP_DEMO_SYSTEM_SPEC.md`
- `docs/source/MVP_STATE_FLOW_SPEC.md`

## Product Statement
- Product: AI-first homeowner-to-contractor project platform, beginning with residential solar.
- One-sentence purpose: Turn homeowner intent into a governed project that can be priced, selected, transacted, and verified without a conventional lead funnel.
- Primary value: Homeowners receive useful project value before registration, retain control of disclosure and decisions, compare contractor-backed offers against one baseline, and keep one project record after selection.
- Why this should exist: Conventional solar funnels capture identity before value, distribute low-context leads, obscure why proposals differ, and break continuity after provider selection.

## Users
### Primary User
- Who: Homeowner exploring a residential solar project.
- Situation: The homeowner has an address and goals but lacks a trustworthy, structured way to define, compare, and advance the project.
- Goal: Understand a property-specific system, express constraints and intent, compare valid offers, select a provider, complete the demo transaction, and track verified progress.
- Current friction: Lead forms, sales pressure, opaque estimates, incomparable proposals, repeated discovery, and fragmented post-sale visibility.
- Required trust: No lead blast, no identity release before authorization, visible assumptions and uncertainty, explicit decision boundaries, and evidence-backed progress.

### Secondary Users
- Contractor: Receives a structured, confirmed project baseline and responds through approved commercial rules.
- Platform operator: Resolves authority-bound exceptions, verification failures, disputes, refunds, and provider governance.

## Jobs to Be Done
- When exploring solar, the homeowner needs property-specific value before creating an account so they can decide whether continuing is worthwhile.
- When expressing goals or concerns, the homeowner needs the system to convert them into editable project structure so contractors price the same understood project.
- When comparing providers, the homeowner needs normalized differences against one baseline so selection is informed and auditable.
- After selection, the homeowner needs one project record with verified milestones so reported progress cannot silently become accepted truth.

## Core Journey
1. `S1 Address Entry`: begin anonymously.
2. `S2 Property Analysis`: confirm the property and watch the preliminary model assemble.
3. `S3 Preliminary System Design`: adjust bounded system choices and preview consequences.
4. `S4 Preliminary Range + Account Gate`: receive a modeled range, then claim the session project through OTP.
5. `S5 Project Understanding`: convert intent and concerns into editable signals and requirements.
6. `S6 Contractor-Ready Packet`: confirm the procurement baseline.
7. `S7 Offer Comparison`: compare three contractor-backed conditional offers against the packet.
8. `S8 Selection + Transaction Review`: freeze provider, offer, scope, conditions, and disclosure permission.
9. `S9 Terms + Test Transaction`: accept terms, complete required demo document states, and pay the Project Management Fee in Stripe test mode.
10. `S10 Active Project + Verification`: convert a provider permit claim into verified progress only after the seeded artifact satisfies the rule.

## MVP Scope
### In Scope
- One uninterrupted S1-S10 customer journey for residential solar.
- Browser-session exploration before account creation and OTP claim at S4.
- Real project state, event ledger, current projection, deterministic controls, one live intent interpretation, packet assembly, offer normalization, selection snapshot, Stripe test checkout/webhook, and artifact-gated milestone transition.
- Seeded property/solar response, three provider profiles and rule sets, offer values, contract text, permit claim, permit artifact, and schedule.
- Simulated assembly timing, offer arrival, provider-document completion, CRM source, and optional notifications.

### Out of Scope
- Generic contractor marketplace, contractor portal, live bidding engine, graph database, production CRM integration, production financing, e-sign integration, construction management suite, autonomous legal/payment/refund decisions, or homeowner graph editor.

### Deferred
- Real provider integrations, real underwriting, generalized workflow engine, full reputation system, multi-category support, and production operational surfaces.

Deferred items provide no permission to build ahead.

## Product Requirements
- The same project identity survives from property resolution through verified execution.
- The UI remains a curated projection; the project graph and event ledger own authority.
- The system advances automatically when the next valid state needs no additional homeowner meaning, correction, consent, or authority.
- The system pauses when explicit homeowner input or authority is required.
- Direct controls preview locally and commit through one explicit action.
- Agents return typed proposals and never own canonical state, geometry, production, price, selection, terms, payment, financing, or milestone verification.
- Every material value exposes source, certainty, version, and verification requirement when applicable.
- Account creation claims the session project without reset or duplication.
- Pre-account output contains no contractor identities or real bids.
- Offers use provider-approved rules and compare against one confirmed packet.
- Provider selection creates an immutable snapshot and explicit disclosure event.
- Provider updates remain claims until evidence or an authoritative event satisfies the rule.
- The platform remains useful after selection.

## Product Invariants
- No information sale, lead blast, unauthorized contractor contact, or unrelated advertising reuse.
- Manual choices are never silently overwritten.
- User-provided facts may advance the project while visibly unverified.
- A concern can propagate into a requirement, offer evaluation, obligation, and evidence requirement.
- Prices identify authority level and unresolved variance.
- Consequential decisions require explicit authorized confirmation.
- Every consequential state can explain reporter, support, authority, and effect.
- UI, model, vendor, and integration replacements cannot invalidate project history or obligations.

## Domain Language
| Term | Canonical meaning | Avoided alternatives |
|---|---|---|
| State | A visible projection of the evolving project | screen, page step |
| Project | The durable governed record and its relationships | lead |
| Session project | Browser-scoped pre-account project | anonymous customer record |
| Project Lens | Local overview and optional scoped Ask for one entity | chatbot |
| Homeowner signal | Typed goal, concern, criterion, constraint, or need | note |
| Contractor requirement | Structured requirement derived or confirmed for provider response | preference text |
| Packet | Confirmed procurement baseline | lead form, hidden PDF |
| Modeled range | Educational pre-account range without contractor authority | bid, quote |
| Conditional offer | Provider-backed offer produced from approved rules | final price |
| Claim | Reported provider or external state awaiting required support | verified status |
| Artifact | Evidence attached to a claim or milestone | attachment only |
| Verified milestone | Consequential progress supported by a satisfied rule | CRM status |

## Trust, Privacy, and Safety
- Data collected: address, project configuration, homeowner intent, account identity after OTP, permissions, transaction records, claims, and artifacts required by the project.
- Data not collected pre-account: durable homeowner identity, contractor disclosure, or unrelated marketing profile.
- Sensitive-data handling: validate at trust boundaries, minimize collection, restrict access by project purpose, and exclude secrets or sensitive content from logs and fixtures.
- User consent: required for account claim, provider selection, project disclosure, terms, payment, financing choice, and other high-consequence actions.
- Data sharing: no provider access before explicit authorization; every disclosure records recipient, scope, purpose, time, and revocation behavior.
- Retention: unsaved session state ends with the browser session; saved non-transactional drafts delete after 30 inactive days; transactional records follow state-aware retention.
- Prohibited behavior: invented facts, unsupported verification, autonomous financing/legal decisions, lead resale, unrelated reuse, and audit-history deletion.

## Success Criteria
### User Success
- A homeowner completes the demo without a phone-number lead form, understands the preliminary system and its uncertainty, compares offers, selects a provider, completes the test transaction, and sees evidence change project status.

### Product Success
- The demo visibly proves a better homeowner experience, a materially better contractor opportunity, and post-selection value from the governed record.

### MVP Proof
- Every acceptance criterion in `docs/source/MVP_DEMO_SYSTEM_SPEC.md` passes in one uninterrupted run.

## Constraints
- Business: investor-grade demo, one seeded canonical scenario, mock-first where production integration does not strengthen proof.
- Legal or regulatory: modeled information is preliminary; licensed, governmental, financing, and legal authority remain external.
- Cost: control vendor calls, cache permitted data, and retain seeded fallback.
- Timeline: prioritize the continuous core journey over production operational breadth.
- Platform: responsive web application; desktop investor demo is primary, mobile remains usable.
- Accessibility: keyboard operation, visible focus, semantic controls, sufficient contrast, and reduced-motion support.

## Open Questions
- none within approval scope

## Maintenance Rules
- Update only when approved product truth changes.
- Specs may narrow this document and cannot silently contradict it.
- Architecture and design must preserve these invariants.
- Git owns prior versions and change history.
