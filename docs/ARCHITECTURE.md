# Architecture

## Status
- State: approved
- Approved: true
- Approval_scope: repository foundation and complete investor-demo MVP architecture
- Deferred_scope: production-scale provider operations, multi-region resilience, real financing, and post-MVP category expansion

No implementation task may become ready while required architecture within its scope is unresolved.

## Source Basis
- `docs/source/PRODUCT_SYSTEM_SPEC.md`
- `docs/source/MVP_DEMO_SYSTEM_SPEC.md`
- `docs/source/MVP_STATE_FLOW_SPEC.md`

## System Summary
- System type: Full-stack TypeScript web application.
- Runtime model: Public landing state followed by one persistent project runtime whose visible state advances without page-level resets.
- Deployment target: Vercel-hosted Next.js application with Neon Postgres for the MVP.
- Repository shape: One application repository. No microservices or monorepo split for the MVP.
- Primary architectural style: Modular monolith with domain/application boundaries, typed ports, provider adapters, explicit events, and versioned projections.

## Technology Stack
| Layer | Choice | Version policy | Reason or constraint |
|---|---|---|---|
| Runtime | Node.js | Pin active LTS during foundation | Canonical Node/TypeScript baseline |
| Language | TypeScript strict | Pin exact compiler | Shared types and discriminated state contracts |
| Frontend | Next.js App Router + React | Pin stable compatible versions | One full-stack application and persistent client shell |
| Backend | Next.js server modules, route handlers, and job interfaces | Same release train | Avoid a separate service before scale requires it |
| Database | Postgres on Neon | Managed stable service | Transactional authority after account claim |
| ORM | Drizzle | Pin exact version | Typed schema and migrations |
| Auth | Clerk email OTP behind a project-owned port and adapter | SDK and exact integration deferred to the approved authentication spec | Custom product UI and replaceable provider boundary |
| Payments | Stripe Checkout test mode + webhook | Current stable API version pinned in config | Canonical demo transaction |
| Property | Address, imagery, and solar adapters with seeded fallback | Provider APIs versioned per adapter | Replaceable vendor boundary and demo reliability |
| State | TypeScript state machine using discriminated unions and reducers | No workflow dependency | Explicit transitions without a generalized engine |
| Testing | Vitest, Testing Library, Playwright | Pin exact versions | Unit, component, workflow, and browser proof |

Production dependencies require an approved spec and task.

## System Components
| Component | Responsibility | Owns | Must not own |
|---|---|---|---|
| Landing | S1 trust and normalized address entry | transient address input | project lifecycle or durable identity |
| Project runtime shell | Persistent post-address scene, renderer, and state projection | current client projection and transition presentation | canonical durable data |
| Project application service | Validates commands and coordinates mutations | use cases, versions, event append, projection rebuild | provider-specific payloads |
| Domain model | Project entities, relationships, certainty, authority, and invariants | canonical business rules | UI layout or vendor SDKs |
| Session project store | Pre-account browser-session project through S4 claim | session projection and stable object IDs | durable homeowner record |
| Projection builder | Produces current customer and agent views | versioned read models | canonical writes |
| Event ledger/outbox | Consequential history and reliable side effects | immutable events and publication state | current UI composition |
| Provider adapters | Address, property, solar, auth, payment, and later provider integration | normalization and failure mapping | domain authority |
| Project intelligence harness | Scoped interpretation and typed patch proposals | bounded context and validated proposals | arbitrary mutation or deterministic calculations |
| Verification service | Claims, artifacts, rules, and milestone transitions | evidence-gated verification | unsupported provider status acceptance |

## Dependency Direction
```text
UI and route entrypoints -> application services -> domain contracts -> ports -> adapters and infrastructure
```

Rules:
- Domain modules import no framework, vendor SDK, UI, or persistence implementation.
- UI reads the current projection and submits typed commands.
- Adapters normalize external data before it reaches application or domain code.
- Only application services authorize canonical mutations and append consequential events.
- Technical reference artifacts cannot create dependencies absent from this document or an approved spec.

## Persistent Project Runtime
- S1 is the only distinct landing composition.
- Address submission creates a browser-session project root and enters the persistent project shell.
- S2 contains semantic substates `PROPERTY_CONFIRMATION` and `LIVE_ROOF_ASSEMBLY`; historical decimal image labels are asset labels, not execution order.
- Property confirmation requires explicit homeowner authority.
- Live assembly advances from completed work events and stable object counts. It never advances from a generic timer percentage.
- The same renderer instance, camera context, property identity, and panel object IDs persist from assembly into S3.
- Panel objects include stable `panel_id`, `surface_id`, `placement_rank`, geometry, render status, and selection state.
- S3 controls unlock at `MINIMUM_USABLE_READY`; the state appears in place with no remount or replacement render.
- The system advances automatically when the next valid state requires no additional user meaning or authority. Otherwise it stops and requests one explicit action.
- Direct controls update local preview state. `Update system` sends one coherent command and creates one project version.

## Data Architecture
- Primary durable store: Postgres after account claim.
- Pre-account ownership: browser `sessionStorage` holds the session project projection; server requests may use transient correlation and provider responses without creating a durable homeowner row.
- Schema authority: Drizzle schema and migrations, constrained by approved domain contracts.
- Four layers: transactional graph, immutable event ledger, current projection, and task-scoped agent context projection.
- Transaction boundaries: one database transaction per authorized project mutation, event append, version increment, and projection update.
- Versioning: every patch references the version it read; stale writes reject or rebuild.
- Idempotency: account claim, Stripe webhooks, external events, artifact intake, and job publication require idempotency keys.
- Retention: session state ends with the browser session; saved non-transactional drafts delete after 30 inactive days; transactional data follows state-aware retention.
- Backup and recovery: managed Postgres recovery plus migration reproducibility; exact service settings are configured during foundation/deployment tasks.

## Interfaces and Events
### Public APIs
- Address normalization and candidate resolution.
- Property confirmation and correction.
- Assembly status stream.
- Project command endpoints for configuration commit, packet confirmation, selection, agreement, payment, and evidence inspection.
- Stripe webhook and later provider event intake.

### Internal Contracts
- Typed command/result schemas.
- Provider adapter ports and normalized errors.
- Agent capability input and typed patch output schemas.
- Versioned current projection.

### Events and Jobs
- `ADDRESS_RESOLVED`
- `PROPERTY_CONFIRMED`
- `ROOF_GEOMETRY_READY`
- `PANEL_OBJECT_ADDED`
- `ENERGY_MODEL_READY`
- `MINIMUM_USABLE_READY`
- `PROJECT_MUTATED`
- `PROJECT_CLAIMED`
- `OFFER_SET_READY`
- `PROVIDER_SELECTED`
- `PAYMENT_UPDATED`
- `CLAIM_REPORTED`
- `ARTIFACT_ATTACHED`
- `MILESTONE_VERIFIED`

Assembly status uses Server-Sent Events with bounded polling fallback. Events carry project/session ID, version, stage, readiness, and object identifiers. Polling or transport choice cannot change domain state.

## Authentication and Authorization
- Identity source: Clerk email OTP through a project-owned auth port and adapter at S4; Clerk owns no project-domain or account-claim authority.
- UI boundary: the application uses a custom authentication interface; Clerk's prebuilt interface is not product UI.
- Foundation boundary: no Clerk SDK, credential, environment value, hosted resource, call, or runtime behavior exists until the later approved authentication spec.
- Session model: anonymous browser-session project before claim; authenticated session after claim.
- Authorization: project-scoped role and permission checks in application services.
- Permission enforcement: server command boundary and provider disclosure adapter.
- Anonymous behavior: exploration only; no provider identity, real offer, durable homeowner record, or disclosure.
- Service trust: webhook signature verification, adapter credentials, and idempotent event handling.

## Trust Boundaries
- Untrusted inputs: address, free text, uploads, query/path data, provider events, webhooks, and agent output.
- Validation points: client affordance, server schema validation, domain invariants, authorization, and typed patch validation.
- Secret boundary: server-only environment variables and provider adapters.
- Sensitive-data boundary: project-scoped access, redacted logs, no secrets or private artifacts in fixtures.
- External-provider boundary: normalized adapters with timeouts, retries, cost controls, and seeded fallback where required.
- Secure failure: preserve current valid project state, expose a bounded error or fallback, and never invent a successful fact or transition.

## External Services
| Service | Purpose | Data sent | Failure behavior | Cost control |
|---|---|---|---|---|
| Address/Maps adapter | normalize address and property candidate | address and location query | correction path and seeded demo fallback | debounce, cache permitted results |
| Solar/property adapter | roof, imagery, solar model inputs | property location | labeled partial/unknown state and seeded fallback | adapter cache and request budget |
| Clerk email OTP adapter | account claim | contact identifier and challenge | retry or blocked account gate through replaceable normalized errors | rate limit and abuse controls |
| Stripe | test checkout and payment state | fee, project reference, customer session | authoritative failed/pending state | one checkout session per idempotency key |
| Neon | durable project data after claim | canonical project entities | fail closed for durable mutation | managed limits and connection pooling |

## Configuration, Reliability, and Observability
- Environment: validated typed configuration with `.env.example`; no committed secrets.
- Logging: structured logs with request, session/project, event, and task correlation; no sensitive payload dumps.
- Metrics: transition failures, provider latency/error, assembly duration, stale writes, webhook retries, and verification outcomes.
- Error reporting: platform-native logs first; add a vendor only through approved authority.
- Retry: bounded exponential backoff only for idempotent external work.
- Timeout: every external call and job has a configured finite timeout.
- Rate limiting: address, OTP, agent, upload, and webhook boundaries.
- Health: application startup, database connectivity, and critical adapter configuration.

## Validation and Delivery
- Exact commands and procedures are created by the repository-foundation spec and stored in `.harness/validation.md`.
- Required foundation: format, lint, strict typecheck, unit, integration, component, Playwright workflow, browser visual proof, production build, smoke, CI, PR status, and read-only review.
- Branch policy: one `codex/<TAG>-<slug>` branch per task; no direct base-branch push.

## Architectural Invariants
- One project survives from address through verified execution.
- Account claim persists the session project without reset or duplication.
- One costly renderer remains mounted across S2 confirmation, S2 assembly, and S3.
- Stable panel identities persist into later modification.
- Direct controls never depend on model latency.
- Agents cannot own canonical state or deterministic calculations.
- Every material value retains source, certainty, timestamp, version, and required support.
- Provider claims cannot become verified milestones without a satisfied rule or authorized exception.
- No second store independently owns canonical state.
- No generalized workflow engine or microservice split is introduced for the MVP.

## Open Questions
- none within approval scope

## Change Control
- Tasks implement approved architecture and cannot silently redefine it.
- Material changes require user approval and this document updated in the same task.
- Annotation headers localize current file responsibility and do not replace this map.
- Git owns prior architecture history.
