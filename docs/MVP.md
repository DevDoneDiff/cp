# MVP

## Status
- State: approved
- Approved: true
- Approval scope: smallest complete residential-solar investor demo
- Endpoint: contractor selected, required demo transaction completed, active project opened, and one provider claim converted into a verified milestone
- Change frequency: slow; update only when the approved demo proof changes

No implementation task may expand the MVP beyond this document without explicit approval.

## Authority
This document owns the investor-demo objective, canonical scenario, start and endpoint, proof requirements, real/seeded/simulated/deferred boundaries, non-goals, and constraints.

Individual `sNN-state.md` specifications own state-level journey flow, composition, behavior, mutations, transitions, exact references, and state-specific acceptance criteria.

## Demo Objective
Prove one uninterrupted customer journey:

```text
address
  -> preliminary property and system
  -> homeowner intent
  -> contractor-ready packet
  -> normalized contractor-backed offers
  -> provider selection
  -> terms and test payment
  -> active project
  -> verified milestone
```

Required investor beliefs:
1. Homeowners would prefer this experience to a conventional solar lead funnel.
2. Contractors receive a materially better opportunity than a generic lead.
3. The platform remains useful after provider selection because it preserves a governed project record.

## Canonical Demo Scenario
- Property: seeded single-family home with a usable solar model.
- Goals: meaningful monthly savings, predictable cost, and possible EV use within two years.
- Concern: roof integrity and leak risk.
- Financial boundary: solar must materially improve monthly cost.
- Offer path: three seeded contractor-backed conditional offers compare against one confirmed packet.
- Transaction path: one provider and offer version are selected; marketplace terms are accepted; required document states complete or simulate; a configurable $500 Project Management Fee is paid through Stripe test mode.
- Financing posture: financing is not selected.
- Execution proof: a reported permit approval remains unverified until a seeded permit artifact satisfies the rule, then the milestone and installation window update.

## Scope Boundary
The demo begins with anonymous address entry and ends after one evidence-gated milestone transition inside the active project.

The MVP must prove:
- useful property and system value before registration
- one continuous project identity
- homeowner intent converted into typed project structure
- one contractor-ready procurement baseline
- comparable contractor-backed offers
- explicit provider selection and disclosure permission
- a completed test transaction
- post-selection project continuity
- evidence-backed progress

Production breadth outside this proof remains deferred.

## In Scope
- One uninterrupted residential-solar customer journey.
- Browser-session exploration before account creation.
- OTP account claim without reset or duplication.
- Real graph-shaped project state, event ledger, and current projection.
- Deterministic direct controls and one live homeowner-intent interpretation.
- Typed proposal validation and contractor-requirement derivation.
- Contractor-ready packet assembly and offer normalization.
- Immutable provider-selection snapshot.
- Stripe Checkout test mode and authoritative webhook handling.
- Artifact-gated milestone verification.
- Seeded fallbacks that pass through real project state.
- Responsive desktop-first web experience with usable mobile behavior.
- Real-browser behavioral and visual proof.

## Real, Seeded, Simulated, and Deferred
| Class | Included |
|---|---|
| Real | Continuous state, session project, account claim, project graph, event ledger, current projection, deterministic controls, intent interpretation, typed validation, packet assembly, offer normalization, selection snapshot, Stripe test checkout/webhook, and artifact-gated verification |
| Seeded | Property and solar response, provider profiles, commercial rules, offer values, contract text, permit claim, permit artifact, and schedule |
| Simulated | Assembly timing, offer arrival, provider-document completion, CRM source, and optional notifications |
| Deferred | Live bidding, production provider portal, production CRM adapters, real financing underwriting, e-sign integration, permit and utility integrations, generalized workflow engine, autonomous refunds, full reputation system, multi-category support, and graph-database projection |

Seeded and simulated inputs must flow through canonical project state. Hard-coded screen indexes cannot substitute for project mutations and transitions.

## Demo-Wide Requirements
- The experience remains one continuous project environment.
- The same project identity survives from property resolution through verified execution.
- Homeowners receive useful value before account creation.
- Account creation claims the existing session project.
- No contractor identity, real offer, lead distribution, or durable homeowner record exists before the approved boundary.
- The interface pauses only for homeowner meaning, correction, consent, or authority.
- The system advances automatically when the next valid state requires no homeowner decision.
- Direct controls preview immediately and commit through one explicit update.
- Model work never blocks deterministic controls.
- Material values expose source and certainty.
- Completed interactions compress into durable project state.
- Provider updates remain claims until required support exists.
- The flow avoids a conventional dashboard, permanent sidebar, persistent chatbot, wizard stepper, and disconnected page sequence.

## Data and Authority Requirements
- Consequential mutations append events and increment project version.
- Agent and external patches reference the project version they read.
- Stale writes reject, rebuild, or explicitly merge.
- Original homeowner input remains preserved.
- Agent output remains typed, bounded, attributable, and validated.
- Geometry, production, pricing, selection, terms, payments, financing, and verification remain outside agent authority.
- Manual homeowner choices remain authoritative until explicitly changed.
- Selection creates an immutable snapshot and disclosure event.
- Payment state comes from Stripe webhook processing.
- Verification requires a satisfied rule or authorized exception.
- Material values retain source, certainty, timestamp, version, and supporting reference when applicable.

## End-to-End Acceptance Criteria
The MVP is complete only when one uninterrupted run proves:

1. A homeowner begins without a phone-number lead form or required account.
2. Address resolution creates a browser-session project rather than a durable homeowner record.
3. Property-specific preliminary value appears before registration.
4. The same project survives every later interaction without restart or duplication.
5. Direct controls preview immediately and commit as one coherent mutation.
6. One natural-language statement becomes inspectable typed project structure.
7. At least one concern becomes a contractor requirement.
8. The packet exposes material inputs, unknowns, sources, and certainty.
9. Account creation claims the existing project.
10. Three contractor-backed conditional offers compare against one packet.
11. Remaining variance and meaningful offer differences are explained.
12. Provider selection locks an auditable snapshot and explicit sharing permission.
13. Terms and required demo document states complete.
14. Stripe test payment reaches authoritative paid state through the webhook path.
15. The active project opens without a context break.
16. A reported permit state remains unverified before evidence.
17. The seeded artifact satisfies the rule and updates milestone, next action, installation window, event trace, and projection.
18. The run remains understandable without a persistent chatbot or generic dashboard.
19. Accessibility, reduced-motion, keyboard, and real-browser proof pass.
20. No deferred capability is required to complete the canonical run.

State specifications may add narrower criteria and cannot weaken this contract.

## MVP Non-Goals
- generic contractor marketplace
- production contractor portal or live bidding
- graph database
- production CRM, financing, e-sign, permit, or utility integration
- construction-management suite
- generalized workflow engine
- autonomous legal, financing, payment, verification, dispute, or refund decisions
- full reputation system
- homeowner-facing graph editor
- multi-category implementation

## Technical Baseline
- Next.js, TypeScript, and Node.js
- Postgres with Neon acceptable
- Drizzle ORM
- OTP through a project-owned auth port
- Stripe Checkout test mode and webhook
- Replaceable property and solar adapters with seeded fallback
- One scoped Project Intelligence Harness with structured outputs
- Unit, integration, component, workflow, and real-browser validation

`ARCHITECTURE.md` owns the full technical contract.

## Constraints
- Business: investor-grade proof using one canonical scenario.
- Timeline: prioritize continuous proof over operational breadth.
- Cost: bound vendor calls, cache permitted data, and preserve seeded fallbacks.
- Legal and regulatory: modeled information remains preliminary; licensed, governmental, legal, and financing authority remains external.
- Accessibility: keyboard operation, semantic controls, visible focus, sufficient contrast, and reduced motion.
- Platform: desktop investor demonstration is primary; mobile remains usable.
- Reliability: the canonical run remains available when external property or solar services fail.

## State Specification Relationship
The MVP is implemented through approved `sNN-state.md` source bundles in journey order. Each state owns its entry data, visible variants, actions, behavior, mutations, authority boundaries, transition conditions, exact references, and state-specific proof.

The core documents remain state-independent.

## Change Control
- Update only when approved MVP scope or proof changes.
- Product, architecture, and design invariants remain binding.
- State specifications may narrow implementation and cannot expand MVP scope.
- Git owns prior versions and change history.
