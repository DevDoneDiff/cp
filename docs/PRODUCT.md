# Product

## Status
- State: approved
- Approved: true
- Approval scope: durable product identity, behavior, authority, trust, and long-term direction
- Change frequency: slow; update only when approved product truth changes

No downstream specification may contradict this document within its scope.

## Authority
This document owns product identity, user and platform value, actor authority, durable rules, lifecycle concepts, trust promises, domain language, and category boundaries.

`MVP.md` narrows the current proof. `ARCHITECTURE.md` owns technical structure. `DESIGN.md` owns the shared experience system. Individual `sNN-state.md` specifications own state-level flow, composition, behavior, transitions, references, and acceptance criteria.

## Product Identity
The product is an AI-first homeowner-to-contractor project platform, beginning with residential solar.

Its purpose is to turn homeowner intent into a governed project that can be understood, priced, selected, transacted, executed, and verified without a conventional lead funnel.

```text
homeowner intent
  -> curated project model
  -> contractor-ready packet
  -> normalized contractor-backed offers
  -> governed transaction
  -> verified execution record
```

AI operates beneath the experience. Homeowners should perceive clarity, speed, trust, and useful project progress rather than an AI-branded sales interaction.

Residential solar is the first vertical. The durable platform pattern may later support HVAC, roofing, and other high-ticket contractor categories through category-specific schemas, commercial rules, milestones, and evidence.

## Value
| Actor | Durable value |
|---|---|
| Homeowner | Useful value before registration, disclosure control, understandable tradeoffs, comparable offers, and continuity after selection |
| Contractor | Structured opportunities, explicit requirements, consistent pricing inputs, fewer discovery calls, and auditable handoff |
| Platform | Custody of a governed project record, normalized transactions, enforceable permissions, and evidence-backed transitions |
| Operator | Clear authority for exceptions, disputes, verification, refunds, and provider governance |

## Actors and Authority
| Actor | Authority |
|---|---|
| Homeowner | Intent, corrections, sharing permission, provider selection, terms, financing choice, and commitment decisions |
| Platform | Project-state custody, deterministic calculations, permissions, policy enforcement, versioning, and canonical transitions |
| Project Intelligence Harness | Scoped interpretation, explanation, comparison, conflict detection, and typed proposals |
| Contractor | Commercial rules, offers, documents, claims, artifacts, and physical execution |
| External Authority | Permit, inspection, financing, utility, licensing, and other authoritative events |
| Platform Operator | Exception resolution, verification review, provider governance, disputes, refunds, and audit |

## Non-Negotiable Product Rules
1. One evolving project survives from resolved property through completion and support.
2. The project graph owns canonical state and relationships; the customer interface is a curated projection.
3. The homeowner supplies meaning, corrections, permissions, and consequential decisions.
4. The system performs assembly, normalization, calculation, coordination, and projection work.
5. Direct controls remain deterministic and responsive without model execution.
6. Agents return scoped, typed, versioned proposals and never own authoritative state.
7. Every material value retains source, certainty, project version, timestamp, and applicable verification requirement.
8. User-provided information may advance the project while remaining visibly unverified.
9. Contractor access and homeowner disclosure require explicit homeowner authorization.
10. Contractor-backed offers use provider-approved commercial rules before homeowner data is released.
11. Provider updates remain claims until required evidence or authority supports the state change.
12. Humans retain authority over sensitive exceptions, financing, legal determinations, refunds, disputes, and unsupported verification.
13. Manual homeowner choices are never silently overwritten.
14. UI, model, vendor, framework, and integration changes cannot invalidate project history or accepted obligations.

## Durable Project Lifecycle
```text
SESSION_EXPLORATION
  -> SAVED_PROJECT
  -> PROJECT_DEFINITION
  -> READY_FOR_OFFERS
  -> OFFER_EVALUATION
  -> PROVIDER_SELECTED
  -> TRANSACTION_IN_PROGRESS
  -> CLOSED_WON
  -> EXECUTION
  -> COMPLETED
  -> WARRANTY_AND_SUPPORT
```

Account creation claims the existing session project without restart or duplication. Saved non-transactional drafts delete after 30 days of inactivity. Selected, transacted, active, completed, disputed, and legally relevant projects follow state-aware retention rules.

## Durable Project Model
The project is a governed record containing typed entities, relationships, source references, versions, permissions, events, obligations, claims, artifacts, and verified milestones.

It maintains four conceptual layers:
1. transactional project graph
2. immutable consequential event ledger
3. current customer and integration projections
4. bounded agent-context projections

Storage and implementation details belong to `ARCHITECTURE.md`.

## Homeowner Intent and Project Understanding
Intent may enter through direct controls, editable facts, focused questions, Project Lenses, uploads, exception prompts, or later corrections.

Intent becomes typed goals, concerns, decision criteria, financial posture, timeline, property constraints, future needs, contractor preferences, unresolved questions, and contractor requirements.

Original input remains preserved. Material interpretations remain inspectable and correctable. A concern may propagate into a contractor requirement, offer evaluation, accepted obligation, and later evidence requirement.

## Project Intelligence
The Project Intelligence Harness receives a task-specific project subgraph, applicable rules, sources, contradictions, allowed actions, and a response schema.

It may interpret, explain, compare, derive requirements, review completeness, and classify exceptions. It cannot invent property, pricing, legal, financing, or verification facts; select providers; accept terms; move money; approve financing; or verify milestones without a satisfied rule.

## Pricing, Transaction, and Execution
Canonical pricing authority states are `MODELED_RANGE`, `CONTRACTOR_BACKED_CONDITIONAL_OFFER`, `MANUALLY_CONFIRMED_OFFER`, and `FINAL_SCOPE_PRICE`.

Every price communicates authority level, assumptions, unresolved variance, and what could change it. Offers compare against one homeowner-confirmed packet.

Provider selection freezes provider, offer version, project version, accepted scope, conditions, requirements, timestamp, and disclosure permission.

The Project Management Fee is a separate configurable marketplace fee with a disclosed purpose and refund boundary. Financing remains partner supplied, and AI cannot approve or decline it.

Provider execution may occur in external systems. Consequential progress enters the platform as claims, artifacts, authoritative events, and verification results. A reported state becomes verified only when its rule is satisfied or an authorized human exception is recorded.

## Trust, Privacy, and Data Custody
Product promises:
- no information sale
- no lead blast
- no contractor contact before authorization
- no unrelated advertising reuse
- explicit disclosure scope and purpose
- visible storage, retention, deletion, and sharing behavior
- purpose-limited provider access
- preserved audit history

Every disclosure records recipient, project scope, purpose, homeowner authorization, timestamp, and expiration or revocation behavior.

The platform separates durable homeowner project state, transient vendor content, operational metadata, legally required transaction records, and privacy-controlled aggregate analytics.

## Domain Language
| Term | Canonical meaning |
|---|---|
| State | A visible projection of the evolving project |
| Project | The durable governed record and its relationships |
| Session project | Browser-scoped pre-account project |
| Project Lens | Local overview and optional scoped Ask for one project entity |
| Homeowner signal | Typed goal, concern, criterion, constraint, posture, or need |
| Contractor requirement | Structured requirement derived or confirmed for provider response |
| Packet | Homeowner-confirmed procurement baseline |
| Modeled range | Educational estimate without contractor authority |
| Conditional offer | Provider-backed offer produced from approved rules |
| Selection snapshot | Immutable provider, offer, project, scope, condition, and permission record |
| Claim | Reported state awaiting required support |
| Artifact | Evidence associated with a claim, obligation, or milestone |
| Verified milestone | Consequential progress supported by a satisfied verification rule |

Avoid `lead` as the canonical term for a homeowner project.

## Category Expansion
The core project, event, permission, offer, transaction, and verification contracts remain category-agnostic. Each category supplies its own asset schema, configuration schema, signal taxonomy, requirement templates, commercial rules, offer schema, milestones, verification rules, artifacts, and provider mappings.

Shared primitives should be extracted after one vertical proves them. The MVP must not become a generalized workflow engine.

## Product Success
The product succeeds when homeowners receive value before surrendering identity, intent becomes contractor-ready structure, offers become objectively comparable, contractors receive cleaner opportunities, disclosure remains explicit, and consequential progress remains evidence backed.

## Change Control
- Update only when approved product truth changes.
- `MVP.md` may narrow the active proof and cannot weaken these invariants.
- Architecture, design, and state specifications must preserve this authority.
- Git owns prior versions and change history.
