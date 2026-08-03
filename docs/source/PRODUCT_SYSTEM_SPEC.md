# Contractor Platform Product System Specification
**Status:** Canonical approved source  
**Approved:** true  
**Audience:** Codex and implementation agents only  
**Initial vertical:** Residential solar  
**Long-term scope:** High-ticket contractor categories using category-specific schemas, commercial rules, milestones, and evidence
## 1. Authority
This document defines durable product behavior that must survive UI, model, vendor, framework, and integration changes. The MVP spec may implement a narrower subset; the MVP spec controls demo scope, and this document controls long-term direction. Derive architecture, state specs, project schemas, agent contracts, provider integrations, transaction behavior, and verification rules from it.
## 2. Product Identity
The product is an AI-first consumer-to-contractor interface that turns homeowner intent into contractor-ready project execution.
```text
homeowner intent → curated project model → contractor-ready packet → normalized contractor-backed offers → governed transaction → verified execution record
```
Homeowner value: useful pre-account exploration, objective guidance, comparable offers, direct contractor access without lead blasting, and continuity after selection. Contractor value: structured opportunities, explicit requirements, consistent pricing inputs, fewer discovery calls, lower acquisition friction, and auditable handoff. AI is perceived through product quality, not AI branding or a mandatory chatbot.
## 3. Non-Negotiable Product Rules
1. One evolving project survives from resolved property through completion and support.
2. The UI is a curated projection; the project graph is canonical.
3. The homeowner expresses intent, corrects exceptions, and makes consequential decisions; the system performs assembly work.
4. Direct controls remain deterministic; agents handle bounded interpretation, explanation, comparison, and exception classification.
5. Agents return typed proposals and never own authoritative state.
6. Every material value retains source, certainty, project version, and applicable verification requirement.
7. User-provided information may drive progress while remaining visibly unverified.
8. Provider updates are claims until the required evidence or authoritative event is present.
9. Contractor access and homeowner data sharing require explicit homeowner authorization.
10. The platform does not sell leads, blast projects to providers, or reuse project data for unrelated advertising.
11. Contractor-backed offers use provider-approved commercial rules before homeowner data is released.
12. The platform remains useful after provider selection and preserves the usable transaction record.
13. Humans retain authority over sensitive exceptions, financing decisions, legal determinations, refunds, disputes, and unsupported verification.
14. Interfaces and integrations may change without invalidating project history or obligations.
## 4. Actors and Authority
| Actor | Authority |
|---|---|
| Homeowner | Project intent, corrections, sharing permissions, provider selection, terms, and commitment decisions. |
| Platform | Custody of project state; deterministic calculations; permissions; provenance; state transitions; policy enforcement. |
| Project Intelligence Harness | Scoped interpretation, explanation, comparison, conflict detection, and typed patch proposals. |
| Contractor | Commercial configuration, proposals, documents, claims, artifacts, and physical execution. |
| External Authority | Permit, inspection, financing, utility, licensing, or other authoritative events. |
| Platform Operator | Exception resolution, verification review, provider governance, disputes, refunds, and audit. |
## 5. Project Lifecycle and Retention
```text
SESSION_EXPLORATION → SAVED_PROJECT → PROJECT_DEFINITION → READY_FOR_OFFERS → OFFER_EVALUATION → PROVIDER_SELECTED → TRANSACTION_IN_PROGRESS → CLOSED_WON → EXECUTION → COMPLETED → WARRANTY_AND_SUPPORT
```
- Session exploration starts after a usable property resolves; it remains browser-session scoped and contains no contractor-specific offer or identity.
- Account creation claims the existing session project instead of restarting it.
- Saved projects accumulate identity permissions, homeowner signals, requirements, offers, selections, agreements, payments, financing, claims, artifacts, milestones, and support history.
- Saved, non-transactional drafts are automatically deleted after 30 days of inactivity. Selected, transacted, active, completed, disputed, and legally relevant projects follow state-aware retention rules.
## 6. Durable Project Graph
The product is graph-shaped regardless of storage engine. Use Postgres as transactional authority; represent relationships explicitly; keep an outbox-compatible event path; add a graph read projection only when relationship-heavy cross-project queries justify it; never allow two stores to independently own canonical state.
### 6.1 Four Layers
1. **Transactional graph:** authoritative current entities and typed relationships.
2. **Event ledger:** immutable consequential actions, claims, permissions, decisions, mutations, and verification events.
3. **Current projection:** compact versioned read model for customer UI, provider adapters, and ordinary APIs.
4. **Agent context projection:** task-specific subgraph containing relevant entities, sources, policies, contradictions, and permitted actions.
### 6.2 Core Nodes and Relationships
```text
Nodes: Project, Party, Property, PropertyComponent, ProjectFact, SourceReference, SystemConfiguration,
HomeownerSignal, ContractorRequirement, ContractorProfile, CommercialRuleSet, Offer, OfferItem, OfferDelta,
SelectionSnapshot, Agreement, Obligation, Payment, FinancingCase, MilestoneDefinition, MilestoneInstance,
Claim, Artifact, VerificationRule, Exception, ProjectEvent, TimelineEstimate, SupportCase
Relationships: BELONGS_TO, ABOUT, DERIVED_FROM, SUPPORTED_BY, CONTRADICTS, CONFIRMS, REQUIRES,
SATISFIES, OMITS, CHANGES, AFFECTS, SELECTS, CREATES_OBLIGATION, BLOCKS, ADVANCES, VERIFIES,
INVALIDATES, REPORTED_BY, AUTHORIZED_FOR
```
Certainty states: `MODELED`, `USER_PROVIDED`, `PROVIDER_PROVIDED`, `SYSTEM_INFERRED`, `AUTHORITATIVE_SOURCE`, `VERIFIED`, `DISPUTED`, `SUPERSEDED`, `UNKNOWN`.
A material value stores value, source type/reference, certainty, timestamps, project version, and verification requirement when applicable.
## 7. Mutation, Versioning, and Authority
```text
source action/event → preserve source → deterministic calculation or scoped interpretation → typed candidate patch → validate → authorize → canonical mutation → append event → increment version → rebuild projections → update dependents/UI
```
- Every project has a monotonically increasing version; every agent or external patch references the version it read; stale writes are rejected, rebuilt, or explicitly merged.
- Corrections supersede prior values through new events; history is not silently erased.
- Provider selection, accepted terms, approved final scope, and other consequential decisions create immutable snapshots.
- Direct controls preview locally and commit through one explicit update action.
- Confirmed configuration-relevant signals feed a deterministic recommendation resolver that selects only from valid category configurations and approved calculation inputs. Agents may interpret intent but cannot design geometry, calculate production, or set price. Auto-mode recommendations may change after update; explicit manual overrides remain authoritative until the homeowner returns to auto mode.
- High-consequence fields such as financial boundaries, provider selection, terms, payment, and financing choice require explicit authorized confirmation.
- Verification requires a satisfied rule or an auditable authorized exception.
## 8. Agent Operating Model
```text
persistent project + scoped context builder + ephemeral worker + typed patch + validation
```
No project requires a continuously running agent. The context builder supplies task, selected entity, project version, relevant subgraph, sources, applicable category/provider rules, contradictions, allowed outputs, prohibited actions, and response schema. Do not send full raw history when a bounded subgraph is sufficient.
Capability families: property explanation; homeowner intent interpretation; concern resolution; requirement derivation; completeness review; offer-delta explanation; contract-clause explanation; milestone explanation; exception classification; operator assistance.
Allowed output families: `CREATE_SIGNAL`, `UPDATE_SIGNAL`, `CREATE_REQUIREMENT`, `LINK_EVIDENCE`, `FLAG_CONTRADICTION`, `REQUEST_CONFIRMATION`, `REQUEST_OPERATOR_REVIEW`, `NO_PROJECT_CHANGE`.
Agents cannot invent property/pricing/legal/financing facts, mutate arbitrary canonical fields, select providers, accept terms, move money, approve financing, verify milestones without a satisfied rule, or delete audit history.
Reliability requirements: schema validation, version checks, source retention, deterministic calculations outside model output, capability-specific evals, prompt/tool/policy versioning, and human escalation. Fine-tuning follows sufficient labeled production data; it is not required for initial specialization.
## 9. Experience and Design Contract
The product is a continuous, object-centered project environment. The property is the initial object; the project becomes the durable object. The right-side instrument shows the current decision or summary; drawers expose estimates, transactions, and evidence; anchored Project Lenses explain or edit selected entities; completed work compresses into durable state. Traditional dashboard navigation is secondary. The experience progressively enhances, remains usable without high-end 3D, keeps costly renderers isolated, stops nonessential idle animation, respects reduced-motion and click/keyboard alternatives, and never makes deterministic controls depend on model latency.
```text
user describes intent → system assembles state → user corrects exceptions → interface reorganizes around the result
```
Default behavior serves an auto-clicker; progressive disclosure serves a particular homeowner without imposing chat or long forms. Motion semantics: morph = generic to specific; in-place reconfiguration = current choice change; horizontal movement = phase progression; vertical drawer = consequence/transaction/evidence; anchored expansion = local explanation/edit; compression = completed work becoming state.
## 10. Customer State Architecture
The complete product requires **13 primary customer-visible states** and **6 reusable contextual surfaces**. These are conceptual states inside one continuous environment, not mandatory standalone routes.
### 10.1 Primary States
| ID | State | Purpose |
|---|---|---|
| C1 | Address Entry | Start anonymously without a lead form. |
| C2 | Property Resolution + Analysis | Resolve property, expose source quality, and assemble preliminary physical facts. |
| C3 | Preliminary System Design | Auto-generate a starting configuration with bounded deterministic controls. |
| C4 | Preliminary Range + Save Gate | Deliver educational value before account creation and explain the path to precision. |
| C5 | Project Definition | Capture goals, concerns, preferences, constraints, timeline, financial posture, and future needs. |
| C6 | Contractor-Ready Packet | Present canonical requirements, sources, unknowns, and verification needs for homeowner approval. |
| C7 | Offer Comparison | Normalize eligible contractor-backed offers against one packet. |
| C8 | Offer Detail + Decision | Explain scope, price, equipment, assumptions, warranties, financing implications, and risk. |
| C9 | Selection + Reservation Review | Lock provider and offer version; expose conditions, permissions, and next obligations. |
| C10 | Agreements, Payment + Financing | Complete marketplace terms, provider documents, project fee, financing, and signer requirements. |
| C11 | Active Project Overview | Show current state, next action, responsible party, blocker, and current completion window. |
| C12 | Milestone, Evidence + Exception | Explain reported versus verified state, artifacts, obligations, and required resolution. |
| C13 | Completion, Handover + Support | Preserve final artifacts, warranties, activation, support, and completed history. |
### 10.2 Reusable Surfaces
| ID | Surface | Purpose |
|---|---|---|
| X1 | Project Lens | `Overview` plus optional `Ask` for a selected project entity. |
| X2 | Project Signal Detail | Inspect/edit a concern, goal, preference, constraint, or inferred requirement. |
| X3 | Fact + Source Detail | Show value, source, certainty, last confirmation, and correction path. |
| X4 | Exception Stack | Resolve only high-impact missing, contradictory, or blocking information. |
| X5 | Contract + Obligation Lens | Explain a clause, compare it to the selected offer, and show resulting obligations. |
| X6 | Evidence + Provenance Drawer | Show claims, artifacts, authority, verification rule, and project-history effect. |
## 11. Property Modeling and Direct Controls
Use adapters for address/property identity, roof and solar potential, property/permit data, utility usage, provider commercial configuration, financing/incentive data, and execution events. Vendor content is source material, not permanent authority by default; persist only what product policy and vendor terms allow.
The preliminary model may determine usable roof, orientation, solar exposure, candidate layouts, estimated production, likely system size, regional range, and major unknowns. Do not conflate roof capacity with homeowner energy need; utility usage or an explicit disclosed estimate determines expected need.
Direct controls may include energy goal, system/panel size, battery outcome, EV readiness, aesthetics, and selected equipment. They preview locally and commit as one mutation. Confirmed intent may revise the auto-mode recommendation through the deterministic resolver; manual choices are never silently overwritten.
## 12. Homeowner Intent, Concerns, and Project Lenses
Signal types: `GOAL`, `CONCERN`, `DECISION_CRITERION`, `BUDGET_POSTURE`, `FINANCING_POSTURE`, `TIMELINE`, `PROPERTY_CONSTRAINT`, `FUTURE_ENERGY_NEED`, `CONTRACTOR_PREFERENCE`, `UNRESOLVED_QUESTION`.
Capture paths: direct controls, editable auto-populated facts, Project Lens conversations, optional manual advanced-input lines, focused exception questions, document/bill uploads, and later corrections.
A Project Lens opens anchored to the selected roof, battery, electrical system, estimate, offer term, clause, or milestone. `Overview` states general context, project-specific knowns, unknowns, and why it matters. `Ask` opens optional scoped conversation. Relevant output becomes an editable candidate signal instead of a persistent transcript.
Concern interpretation may use keyword and intensity cues but must evaluate full context. A concern can create a contractor requirement, influence offer comparison, become an accepted obligation, and later require evidence. Configuration-relevant signals may also trigger a revised auto-mode recommendation through deterministic logic after the homeowner applies the update. User-provided facts remain usable while visibly labeled and accompanied by what could change them.
## 13. Contractor-Ready Packet
The packet is a live project projection and canonical procurement baseline, not a generic lead form or hidden PDF.
Required sections: authorization state; property summary; configuration; goals; concerns; decision criteria; budget/financing posture; timeline; future needs; known constraints; contractor requirements; unknowns/verification needs; source/certainty map; requested provider response schema.
The homeowner confirms material interpretations before offers become available.
## 14. Provider Commercial Configuration and Offer Modes
Each provider configures or approves service areas, eligibility, equipment packages, price tiers, battery/add-on pricing, dealer fees, exclusions, allowances, warranties, margin, conditional rules, verification steps, transaction sequence, and integration mapping.
Pricing authority states: `MODELED_RANGE`, `CONTRACTOR_BACKED_CONDITIONAL_OFFER`, `MANUALLY_CONFIRMED_OFFER`, `FINAL_SCOPE_PRICE`.
- **Instant conditional offer:** platform applies provider-approved rules to the packet without distributing the homeowner as a lead.
- **Authorized manual review:** homeowner explicitly authorizes one provider to review identifying project data; provider returns the result through the platform; every change from the instant offer includes a structured reason; off-platform or unexplained divergence is surfaced and governed.
- **Final scope price:** created only after required physical and authoritative verification.
Use narrow ranges where supported; expose remaining variance drivers beside the range; measure estimate versus accepted offer versus final scope; publish percentage accuracy only after empirical calibration. Provider standing includes pricing consistency and unexplained-change frequency.
## 15. Offer Normalization and Decision Support
Delta classes: `MATCHES_BASELINE`, `CHANGES_BASELINE`, `OMITS_REQUIREMENT`, `INTRODUCES_ASSUMPTION`, `ADDS_OPTIONAL_VALUE`, `CREATES_UNRESOLVED_RISK`.
Compare price authority, scope, equipment, expected performance, batteries/add-ons, warranties, dealer fees, financing terms, allowances/exclusions, homeowner requirement coverage, unknowns, conditional items, and provider reputation/evidence. External reputation summaries must retain reviewed sources, dates, and coverage; absence of discovered complaints is not proof that none exist. Objective support may recommend waiting, revising the packet, requesting manual review, or declining all offers.
## 16. Transaction Model
Provider selection freezes provider, offer version, project version, accepted scope, price authority, conditions, homeowner requirements, timestamp, and permissions.
The Project Management Fee is a separate configurable marketplace fee: disclosed before commitment; paid through platform checkout; covers project setup, document coordination, handoff, visibility, and support; refundable until Final Scope Approval unless policy/dispute state requires review.
Support versioned documents and signer roles: `PRIMARY_TITLEHOLDER`, `CO_TITLEHOLDER`, `AUTHORIZED_SIGNER`, `FINANCING_COSIGNER`.
Financing is partner-supplied, not internally underwritten. States: `FINANCING_NOT_SELECTED`, `FINANCING_REQUIRED`, `FINANCING_PENDING`, `FINANCING_APPROVED`, `FINANCING_DECLINED`, `FINANCING_REVIEW_REQUIRED`. AI cannot approve or decline financing.
Closed won for cash/external funding: provider selected + snapshot locked + marketplace terms accepted + PMF paid + required pre-close documents signed. Financed projects also require financing approval. Closed won is distinct from Final Scope Approval.
## 17. Execution, Claims, Evidence, and Timeline
Providers execute in their existing systems; the platform receives events, governs consequential state, and preserves customer visibility.
```text
provider event → mapped claim → source recorded → milestone verification rule → artifact/authoritative event → verified state or exception
```
Milestones may include provider handoff, site verification, Final Scope Approval, design, permit submission/approval, equipment, installation, inspection, permission to operate, completion, and warranty support.
Each consequential milestone defines acceptable evidence, such as permit artifact/event, site survey/photos, signed final scope, inspection result, utility activation, or auditable human exception. A CRM status alone is insufficient when evidence is required.
Customer projection shows current milestone, next milestone, responsible party, blocker, completion/install window, reason the estimate changed, and latest verified event. Timeline estimates derive from verified state, provider commitments, dependencies, and exceptions.
## 18. Provider Integrations and Governance
Use provider-specific adapters around a canonical internal contract. Support inbound webhooks, outbound events, polling fallback, artifact intake, identity/project mapping, idempotency, replay, health, and exceptions. Never expose provider-specific schemas to customer UI.
Provider standing may use offer-to-final-price consistency, response time, completion time, artifact completeness, milestone accuracy, exception/cancellation rates, customer outcomes, disputes, and integration reliability. Standing affects eligibility, ranking, autonomy, and review requirements. Provider participation requires a data-use covenant that prohibits lead resale, unrelated marketing reuse, unauthorized contact, and retention or export beyond the authorized project and applicable legal obligations.
## 19. Non-Customer Operational Surfaces: 5
| ID | Surface | Purpose |
|---|---|---|
| P1 | Provider Onboarding + Commercial Rules | Configure eligibility, pricing, equipment, adders, warranties, documents, sequence, and service area. |
| P2 | Provider Integration Mapping | Configure CRM/PM mapping, credentials, artifact routing, and sync health. |
| P3 | Provider Project + Exception Queue | Show only projects requiring provider action, correction, artifact, or response. |
| A1 | Verification + Exception Console | Resolve unsupported claims, failed rules, disputes, financing review, refunds, and authority-bound actions. |
| A2 | Project Trace Explorer | Inspect graph, ledger, provenance, versions, agent patches, permissions, and evidence chain. |
## 20. Privacy, Sharing, and Data Custody
Product promise: no information sale; no lead blast; no contractor contact before authorization; no unrelated advertising reuse; transparent storage, retention, deletion, and sharing controls.
Every disclosure records recipient, project scope, purpose, homeowner authorization, timestamp, and expiration/revocation behavior. Provider access is purpose-limited to the authorized project and governed by the provider data-use covenant. Before selection, contractor-backed offers use provider-approved rules without distributing the homeowner as a lead.
Separate durable homeowner project state, transient vendor content, platform operational metadata, legally required transaction records, and privacy-controlled aggregate analytics.
## 21. Category Expansion and Boundaries
The core graph and event contracts remain category-agnostic. Each category supplies property/asset schema, configuration schema, signal taxonomy, requirement templates, offer schema, verification rules, milestones, acceptable artifacts, and provider mappings. Do not generalize the MVP into a workflow engine; extract shared primitives after one vertical proves them.
The platform does not replace licensed engineering, inspection, legal, financial, or governmental authority; guarantee modeled facts before verification; permit agents to execute authority-bound decisions; treat unsupported provider claims as truth; operate as a lead marketplace; require a chatbot; expose the graph to homeowners; or duplicate provider PM systems when integration is sufficient.
## 22. Source-of-Truth Contracts and Invariants
```text
Project graph = canonical state/relationships
Event ledger = canonical consequential history
Current projection = fast UI/API read model
Agent context projection = bounded task input, never authority
Provider commercial rules = basis for conditional offers
Selection snapshot = accepted offer/project version
Verification rule + evidence = basis for consequential milestone completion
Customer UI = curated projection, never authority
```
Required invariants:
1. Same project survives from address through support.
2. Account creation claims, never restarts, the session project.
3. Homeowner can inspect and correct material interpretations.
4. A concern can propagate through requirement, offer evaluation, obligation, and evidence.
5. Direct controls remain responsive without model execution.
6. Agent patches are scoped, typed, versioned, validated, and attributable.
7. Prices identify authority level and unresolved variance.
8. Offers compare against one canonical packet.
9. Selection freezes an auditable snapshot and explicit sharing permission.
10. Provider claims cannot silently become verified milestones.
11. Every consequential state can explain reporter, support, authority, and effect.
12. Customer always sees current state, next action, responsibility, blocker, and timeline effect.
13. UI, model, vendor, and integration replacements do not invalidate the durable record.
## 23. Downstream Artifact Contract
For each customer-visible state, produce one approved implementation source bundle: a bounded approved written state spec; one or more approved visual references for every required visible variant; an approved technical reference when continuity, rendering, data flow, integrations, or mutation boundaries require visual explanation; Codex tasks generated from the written spec and exact artifact paths; and executable behavioral plus real-browser visual validation against that same bundle. A state may use multiple images when separate open, closed, transitional, loading, evidence, or responsive references provide clearer authority. Visual references own state-specific appearance within prose constraints. Technical references are guidance only and cannot introduce unstated architecture, behavior, or data authority. Tasks cannot infer authority from a folder. All downstream artifacts use context precision: opinionated decisions, required inputs and outputs, authority and mutation boundaries, acceptance criteria, exact references, and explicit exclusions; omit tutorials and generic implementation exposition.
