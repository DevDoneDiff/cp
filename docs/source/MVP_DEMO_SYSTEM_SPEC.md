# MVP Investor Demo System Specification
**Status:** Canonical approved source  
**Approved:** true  
**Audience:** Codex and implementation agents only  
**Scope:** Smallest complete investor demo  
**Endpoint:** Contractor selected, required demo transaction completed, active project opened, and one provider claim converted into a verified milestone
## 1. Authority
This document controls MVP behavior, state scope, minimum state, agent boundaries, artifact requirements, and proof criteria. Derive state prototypes, state specs, implementation tasks, and validation from it. Do not add features unless they strengthen one of the three demo beliefs below.
## 2. Demo Objective
Prove this uninterrupted loop:
```text
address → preliminary property/system → homeowner intent → contractor-ready packet → normalized contractor-backed offers → provider selection → terms + test payment → active project → verified milestone
```
Required investor beliefs:
1. Homeowners would prefer this to a conventional solar lead funnel.
2. Contractors receive a materially better opportunity than a generic lead.
3. The platform remains useful after provider selection because it preserves a governed project record.
## 3. Canonical Demo Scenario
- Property: seeded single-family home with a usable solar model.
- Goals: meaningful monthly savings, predictable cost, possible EV within two years.
- Concern: roof integrity and leak risk.
- Financial boundary: solar must materially improve monthly cost rather than merely replace the utility bill.
- Transaction path: provider selected; marketplace terms accepted; configurable $500 Project Management Fee paid through Stripe test mode; required provider-document states completed or simulated; financing not selected.
- Execution moment: provider reports permit approval; UI marks it unverified; seeded permit artifact is attached; milestone becomes verified; installation window updates.
## 4. Experience Contract
The MVP is one continuous project environment. The property/project remains central; the right-side instrument shows the current decision or summary; drawers expose estimates, transactions, and consequences; anchored overlays explain or edit context; completed work compresses into durable state. Routes may exist underneath, but the experience must not become a dashboard plus disconnected pages. The experience must progressively enhance, remain fully usable without high-end 3D, keep only one costly renderer active, stop nonessential animation when idle, respect reduced-motion and non-gesture alternatives, and never make direct controls wait on a model run.
### 4.1 Primary Customer-Visible States: 10
| ID | State | Purpose | Completion Condition |
|---|---|---|---|
| S1 | Address Entry | Start without account creation or lead capture. | Normalized address selected; session project can begin. |
| S2 | Property Analysis | Resolve the correct property and truthfully show analysis progress. | Property candidate, source status, and preliminary solar model available. |
| S3 | Preliminary System Design | Auto-generate a starter system and allow bounded manual changes. | User previews panel/system size, battery, EV readiness, and production; direct controls remain deterministic. |
| S4 | Preliminary Range + Account Gate | Deliver value before registration without showing contractors or claiming an exact bid. | One modeled range, assumptions, and unresolved price drivers shown; account creation offered to save and continue. |
| S5 | Project Understanding | Convert intent, preferences, and concerns into editable structured state. | One natural-language statement creates a typed concern, preference, and contractor requirement. |
| S6 | Contractor-Ready Packet | Show what the platform understands and what providers will price. | Homeowner confirms or edits material fields; source and certainty remain visible. |
| S7 | Offer Comparison | Normalize contractor-backed conditional offers against one packet. | Three seeded offers show matches, omissions, changes, assumptions, and risks. |
| S8 | Selection + Transaction Review | Convert comparison into a locked decision. | Provider and offer version selected; scope, conditions, and fee visible. |
| S9 | Terms + Test Transaction | Complete minimum pre-close steps. | Terms accepted; required demo document states completed; Stripe test payment webhook processed. |
| S10 | Active Project + Verification | Prove post-selection continuity and evidence-gated progress. | Provider claim remains pending until artifact satisfies rule; milestone and installation window then update. |
### 4.2 Reusable Contextual Surfaces: 4
| ID | Surface | Contract |
|---|---|---|
| O1 | Project Lens | Anchored to a roof, battery, price, offer term, contract clause, or milestone; contains `Overview` and optional `Ask`. |
| O2 | Project Signal Detail | Shows original statement, interpretation, source, importance, project effect, edit/remove, and confirmation state. |
| O3 | Exception Stack | Collects only high-impact missing or contradictory information that materially affects estimate, offer, or transaction. |
| O4 | Evidence + Provenance | Shows reporter, supporting artifact, verification rule, status, and resulting project change. |
### 4.3 S2 Visible Substates and S3 Continuity
`S2 Property Analysis` contains two ordered visible substates inside one persistent project runtime:

1. `PROPERTY_CONFIRMATION`: show the detected property and require explicit homeowner confirmation or correction.
2. `LIVE_ROOF_ASSEMBLY`: after confirmation, progressively reveal roof geometry, stable panel objects, model readiness, and source-aware project facts as actual work completes.

The live assembly replaces a traditional loading screen. It must be driven by readiness events or seeded equivalents, not a fake percentage. The same property scene, camera context, renderer, property identity, and panel object identities persist into S3. S3 unlocks in place when the minimum usable property and solar model exists.
## 5. Project Lifecycle and Persistence
```text
EXPLORE → DEFINE → READY_FOR_OFFERS → OFFERS_AVAILABLE → SELECTED → TRANSACTION_COMPLETE → ACTIVE_PROJECT
```
- After address resolution, create a graph-shaped project in browser session state. Server routes may process vendor requests but must not create a durable homeowner record.
- Closing the unsaved session removes it. No contractor identity, contractor offer, or lead distribution occurs pre-account.
- Account creation uses OTP and claims the existing session project without resetting or duplicating it.
- Saved, non-transactional drafts are automatically deleted after 30 days of inactivity. Transactional projects follow legal and operational retention rules.
- Every phase transition is explicit, versioned, and appended to the event ledger.
## 6. Minimum Graph and State Model
Implement a graph-shaped relational model in Postgres. Do not add a graph database for the MVP.
### 6.1 Four Required Layers
1. **Transactional graph:** authoritative current entities and typed relationships.
2. **Event ledger:** immutable consequential events.
3. **Current projection:** compact versioned state used by UI and ordinary APIs.
4. **Agent context projection:** task-specific subgraph assembled per model run.
### 6.2 Minimum Entities
```text
Project, Property, ProjectFact, SystemConfiguration, HomeownerSignal, ContractorRequirement,
ContractorProfile, ContractorCommercialRuleSet, Offer, OfferDelta, SelectionSnapshot,
AgreementState, PaymentState, Milestone, Claim, Artifact, ProjectEvent, CurrentProjectProjection
```
Required certainty states: `MODELED`, `USER_PROVIDED`, `PROVIDER_PROVIDED`, `SYSTEM_INFERRED`, `VERIFIED`, `UNKNOWN`.
Every material value retains source, status, timestamp, project version, and supporting reference when applicable.
## 7. Canonical Mutation Contract
```text
source action/event → preserve source → deterministic update or scoped interpretation → typed candidate patch → validate + authorize → canonical mutation → append event → increment project version → rebuild projection → update UI
```
- **Direct controls:** preview locally; no agent call; `Update system` commits one coherent mutation and recalculates dependent production, pricing, and completeness. Do not record every slider movement.
- **Unstructured input:** preserve original text; interpret only against the relevant subgraph; return typed candidate concerns/preferences/constraints/requirements; show editable pills; commit through `Update system` or packet confirmation.
- Confirmed configuration-relevant signals feed a deterministic recommendation resolver that selects only from precomputed valid layouts and approved calculation inputs. The harness may interpret intent but cannot place panels, calculate production, or set price. Auto-mode recommendations may change after `Update system`; explicit manual overrides remain authoritative until the homeowner returns to auto mode.
- Keyword and intensity cues may inform interpretation, but full statement context controls the result.
- User statements can be operationally useful while remaining `USER_PROVIDED`; show what later verification could change.
- Financial boundaries, provider selection, terms, payments, and other high-consequence actions require explicit user authority.
- **External events:** provider updates create claims; only a satisfied verification rule can create a verified milestone.
- Every agent or external patch references the project version it read; stale writes are rejected or rebuilt.
## 8. MVP Agent Harness
Use one project-intelligence harness with a context builder and scoped capabilities. Do not build a general autonomous multi-agent system.
Required capabilities:
```text
interpret_homeowner_input
explain_project_entity
propose_homeowner_signal
derive_contractor_requirement
explain_offer_delta
explain_contract_clause
```
Allowed outputs: `CREATE_SIGNAL`, `UPDATE_SIGNAL`, `CREATE_REQUIREMENT`, `REQUEST_CONFIRMATION`, `NO_PROJECT_CHANGE`.
The harness cannot invent property/pricing facts, mutate arbitrary canonical state, approve financing, select a provider, accept terms, move money, or verify milestones. Validate every output against a schema; retain raw input and structured result; cover the canonical demo statement with a fixed evaluation fixture.
## 9. Project Lenses and Homeowner Signals
- Project Lenses replace a persistent general chatbot.
- `Overview` immediately states general context, project-specific knowns, unknowns, and why the topic matters.
- `Ask` opens optional scoped conversation using the selected project entity automatically.
- Relevant conversation output appears as a candidate concern/preference pill in Project Preferences.
- A pill exposes original statement, interpretation, importance, source, project effect, edit, and remove.
- Optional advanced/manual input supports unusual concerns without imposing a long form on default users.
- A concern must be able to propagate into a contractor requirement, offer evaluation, accepted obligation, and later evidence requirement.
## 10. Pricing and Offer Contract
### 10.1 Pre-Account Range
Show one educational, non-contractor-specific range with system assumptions, completeness, unresolved price drivers, and explicit non-bid status. Do not show contractor names, logos, cards, or numeric accuracy claims.
### 10.2 Contractor-Backed Conditional Offers
Generate or load post-account offers from provider-approved service area, equipment, price-per-watt tiers, battery pricing, dealer fees, standard adders, exclusions, warranties, margin, and conditional rules.
MVP rules:
- seed three provider profiles and rule sets;
- evaluate all offers against the same packet;
- target a displayed range width no greater than $2,000 per seeded offer;
- explain every remaining variable;
- do not send homeowner identity or exact project to providers during the demo;
- release project information only after provider selection.
Pricing states: `MODELED_RANGE`, `CONTRACTOR_BACKED_CONDITIONAL_OFFER`, `FINAL_SCOPE_PRICE`. The demo ends before a real final site-verified price.
## 11. Contractor-Ready Packet and Offer Normalization
Packet fields:
```text
property summary; preliminary system; energy assumptions; goals; concerns; decision criteria;
financial boundary; financing posture; timeline; future needs; known constraints;
contractor requirements; verification unknowns; source/certainty for each material item
```
The packet is a live project projection, not a hidden PDF. Homeowner confirmation is required before offers become available.
Offer delta classes: `MATCHES_BASELINE`, `CHANGES_BASELINE`, `OMITS_REQUIREMENT`, `INTRODUCES_ASSUMPTION`, `ADDS_OPTIONAL_VALUE`, `CREATES_UNRESOLVED_RISK`.
At least one Project Lens must explain a proposal difference objectively using project-specific facts and sources.
## 12. Transaction and Active Project
- Provider selection creates an immutable snapshot of provider, offer version, project version, scope, price/range, conditions, homeowner requirements, and timestamp.
- Demo closed-won rule: provider selected + snapshot locked + marketplace terms accepted + Project Management Fee paid + required pre-close document states completed.
- Closed won does not equal Final Scope Approval.
- Active Project shows current milestone, next milestone, responsible party, blocker, installation window, reason for change, and latest verified event.
Canonical verification sequence:
```text
Provider reports permit approved → UI marks reported/unverified → permit artifact attached → rule satisfied → milestone verified → installation window recalculated → evidence trace available
```
## 13. Real, Seeded, Simulated, Deferred
| Class | Included |
|---|---|
| Real | Continuous state; session project; account claim; Postgres graph-shaped model; event ledger; current projection; deterministic controls; one live intent interpretation; typed patch validation; signal-to-configuration recommendation resolver; packet assembly; offer normalization; selection snapshot; Stripe test checkout/webhook; artifact-gated milestone transition. |
| Seeded | Property/solar response; provider profiles; commercial rules; offer values; contract text; permit claim; permit artifact; schedule. |
| Simulated | Loading timing; offer arrival; provider-document completion; CRM webhook source; optional notifications. |
| Deferred | Live provider bidding portal; production CRM adapters; financing underwriting; e-sign vendor integration; generalized workflow engine; autonomous refunds; full reputation system; multi-category support; graph database projection. |
Seeded inputs must pass through real project state. Do not advance through hard-coded state indexes disconnected from canonical project state.
## 14. Privacy and Technical Baseline
Privacy invariants: no information sale; no lead blast; no contractor access before explicit selection; pre-account data remains session-scoped; durable storage requires account creation; non-transactional draft deletion after 30 days of inactivity; transaction retention remains state-aware; every disclosure creates an explicit event. Provider use of disclosed data is limited to the authorized project; resale, unrelated marketing reuse, and unauthorized contact are prohibited.
Selected baseline:
```text
Frontend: Next.js + TypeScript
Backend: Node.js + TypeScript
Database: Postgres; Neon acceptable
ORM: Drizzle
Authentication: OTP
Payments: Stripe Checkout test mode + webhook
Property/solar: adapter; Google Solar API preferred; seeded fallback required
Visualization: capability-tiered renderer; exact library decided in approved state technical specs
Agent execution: one scoped project-intelligence harness with structured outputs
```
## 15. Explicit Non-Goals
No generic contractor marketplace, persistent chatbot, contractor portal, live bidding engine, graph database, production CRM integration, production financing, permit/utility integration, autonomous legal/payment/refund decisions, generalized workflow engine, construction-management suite, or homeowner-facing graph editor.
## 16. Acceptance Criteria
The MVP is complete only when one uninterrupted run proves:

1. Address entry works without account creation or a phone-number lead form.
2. Address resolution creates a browser-session project and enters the persistent project runtime without creating a durable homeowner record.
3. The detected property pauses for explicit homeowner confirmation or correction before deeper assembly continues.
4. Live roof assembly advances from actual readiness events or seeded equivalents rather than a fake timer percentage.
5. The same property identity, scene context, renderer, and panel object identities persist from S2 assembly into S3 without a visual reset or replacement panel set.
6. Property and system value appears before registration.
7. Direct controls preview immediately and commit once.
8. A roof Project Lens provides project-specific overview and optional Ask.
9. One statement becomes an editable concern and contractor requirement.
10. Confirmed configuration-relevant signals can revise the auto-mode system recommendation through deterministic logic; a manual override is never silently replaced.
11. Packet fields distinguish modeled, user-provided, inferred, verified, and unknown states.
12. Account creation claims the session project without reset or duplication.
13. Three contractor-backed offers normalize against one packet.
14. One offer delta receives an objective Project Lens explanation.
15. Provider and offer are locked in a versioned selection snapshot with explicit disclosure permission.
16. Terms and Stripe test payment complete.
17. User enters an active project after selection without a context break.
18. Provider claim remains unverified until artifact attachment.
19. Verification updates milestone, next action, installation window, event trace, and UI projection.
20. Core flow never depends on a conventional dashboard, permanent sidebar, persistent chatbot, or disconnected page sequence.
## 17. Downstream Artifact Contract
Create and approve S1-S10 implementation source bundles in journey order. Each state receives:

1. one bounded approved written state spec;
2. one or more approved visual references for every visible variant required by that spec;
3. an approved technical reference when graph inputs, mutations, integrations, renderer continuity, or validation targets require visual explanation;
4. implementation tasks generated from the approved spec and the exact reference paths;
5. behavioral, integration, and real-browser visual validation against the same source bundle.

Preserve the same project object, visual system, interaction grammar, and state continuity across all states. Technical diagrams are guidance only. A task cannot infer requirements from an unlinked file or folder.
