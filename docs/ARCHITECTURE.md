# Architecture
## Status
- State: approved
- Approved: true
- Approval scope: durable platform architecture and current residential-solar MVP baseline
- Change frequency: slow; update only when approved technical structure changes

No implementation task may contradict this document within its scope.
## Authority
This document owns system structure, dependency direction, technology baseline, runtime and persistence, data and mutation contracts, component boundaries, versioning, authorization, agent architecture, verification, integrations, reliability, and technical invariants.

Individual `sNN-state.md` contracts own durable state-specific behavior, readiness semantics, transitions, and authority. They do not own renderer choice, exact artifact assignment, task decomposition, or harness proof. Approved implementation specs own collective outcomes; exact technical artifacts own only a process depiction explicitly adopted by governing authority or an approved spec and otherwise remain guidance.
## System Summary
- System type: full-stack TypeScript web application.
- Repository shape: one application repository.
- Architecture: modular monolith with domain and application boundaries, typed ports, replaceable adapters, explicit events, and versioned projections.
- Runtime: public entry followed by one persistent project environment.
- Deployment: Vercel-hosted Next.js application with Neon Postgres for the MVP.
- Scale rule: no microservice or monorepo split until an approved need exceeds the modular monolith.
## Technology Baseline
| Layer | Choice | Constraint |
|---|---|---|
| Runtime | Node.js active LTS | Pin and upgrade deliberately |
| Language | TypeScript strict | Shared discriminated contracts |
| Full stack | Next.js App Router and React | One application release train |
| Backend | Next.js server modules, route handlers, and job interfaces | No separate MVP service |
| Database | Postgres on Neon | Durable transactional authority |
| ORM | Drizzle | Typed schema and migrations |
| Authentication | OTP through a project-owned port | Replaceable provider adapter |
| Payments | Stripe Checkout test mode and webhook | Authoritative demo payment state |
| Property and solar | Replaceable adapters | Seeded fallback required |
| Client state | Typed reducers and state contracts | No generalized workflow engine |
| Testing | Vitest, Testing Library, and Playwright | Unit through real-browser proof |

Production dependencies require an approved specification and task.
## Dependency Direction
```text
UI and route entrypoints
  -> application services
  -> domain contracts
  -> ports
  -> adapters and infrastructure
```

- Domain modules import no framework, vendor SDK, UI, or persistence implementation.
- UI reads versioned projections and submits typed commands.
- Application services validate, authorize, mutate, append events, and rebuild projections.
- Adapters normalize external data and failures.
- Infrastructure cannot redefine business authority.
- Technical references cannot introduce dependencies absent from approved prose.
## System Components
| Component | Responsibility | Must not own |
|---|---|---|
| Public entry | Trust, address entry, and session start | Durable project lifecycle |
| Persistent project runtime | Continuous scene, instruments, projection, and local previews | Canonical durable data |
| Project application service | Command authorization, versions, transactions, events, and projection rebuild | Provider-specific payloads |
| Domain model | Entities, relationships, certainty, authority, and invariants | UI composition and vendor SDKs |
| Session project store | Pre-account projection and stable object identity | Durable homeowner record |
| Durable project store | Account-owned canonical graph and transaction state | UI-only state |
| Projection builder | Customer, integration, and agent read models | Canonical writes |
| Event ledger and outbox | Consequential history and reliable publication | Current UI composition |
| Provider adapters | External normalization and failure mapping | Domain authority |
| Project Intelligence Harness | Scoped interpretation and typed proposals | Arbitrary mutation or deterministic calculation |
| Verification service | Claims, artifacts, rules, and milestone transitions | Unsupported status acceptance |
## Runtime and Persistence
- Address resolution creates a browser-session project root.
- Pre-account project state remains browser-session scoped.
- Server routes may process vendor requests without creating a durable homeowner record.
- Account claim persists the existing project without reset, replacement, or duplication.
- The post-address experience runs inside one persistent project shell.
- Expensive renderers and durable visual objects remain mounted when durable state semantics or an approved implementation outcome requires continuity.
- State transitions update the projection and available controls without replacing the canonical project.
- Automatic advance occurs only when the next valid state requires no additional homeowner meaning or authority.
- Explicit correction, consent, permission, selection, terms, payment, financing choice, or other consequential authority pauses progression.
## Data Architecture
Postgres is the durable transactional authority after account claim. The project remains graph-shaped, with explicit relationships represented relationally.

Required layers:
1. transactional graph
2. immutable event ledger
3. versioned current projection
4. task-scoped agent context projection

No second store may independently own canonical state. A graph read projection may be added only when relationship-heavy cross-project queries justify it.

Material values retain value, source type and reference, certainty, timestamps, project version, and verification requirement when applicable.
## Canonical Mutation Contract
```text
source action or event
  -> preserve source
  -> deterministic calculation or scoped interpretation
  -> typed candidate patch
  -> validate and authorize
  -> canonical mutation
  -> append event
  -> increment version
  -> rebuild projections
  -> update dependents and UI
```

- One database transaction covers mutation, event append, version increment, and projection update.
- Corrections supersede prior values through new events.
- Agent and external patches reference the version they read.
- Stale writes reject, rebuild, or explicitly merge.
- Consequential decisions create immutable snapshots.
- Direct controls preview locally and commit through one coherent command.
- Deterministic calculations remain outside model output.
- High-consequence fields require explicit authorized confirmation.
- Account claim, payment webhooks, external events, artifact intake, and outbox publication require idempotency keys.
## Events and Side Effects
The ledger records domain events; the outbox publishes reliable side effects.

Event families cover project lifecycle, property and configuration readiness, project mutation, account claim, offer readiness, provider selection and disclosure, agreements and payment, claims and artifacts, verification, retention, and operator exceptions.

Transports may include request-response, Server-Sent Events, webhooks, polling fallback, and jobs. Transport choice cannot change domain authority.
## Project Intelligence Harness
```text
persistent project
  + scoped context builder
  + ephemeral capability worker
  + typed proposal
  + validation and authorization
```

Context includes task, selected entity, project version, relevant subgraph, sources, category and provider rules, contradictions, allowed outputs, prohibited actions, and schema.

The harness may interpret, explain, compare, derive requirements, review completeness, and classify exceptions. It cannot own canonical state, geometry, production, pricing, provider selection, terms, payment, financing decisions, or unsupported verification.

Reliability requires schema validation, version checks, source retention, prompt and policy versioning, capability evaluations, and human escalation.
## Verification Architecture
```text
provider or external event
  -> normalized claim
  -> source recorded
  -> verification rule
  -> artifact, authoritative event, or authorized exception
  -> verified transition or unresolved exception
```

A claim alone cannot complete a consequential milestone. The verification service owns claim creation, artifact association, rule evaluation, exception routing, milestone mutation, timeline recalculation, event append, and projection rebuild.
## Authentication and Authorization
- Authentication uses OTP behind a project-owned port and adapter.
- The provider owns identity challenge mechanics only.
- Application services own project claim and domain authorization.
- Anonymous sessions support exploration without durable identity or provider disclosure.
- Permission checks run at the server command boundary.
- Provider disclosure requires explicit project authorization.
- Webhooks require signature verification, normalized payloads, and idempotent handling.
## External Services
| Boundary | Purpose | Failure contract |
|---|---|---|
| Address and maps | Normalize address and property candidate | Correction path plus seeded fallback |
| Property and solar | Roof, imagery, and modeled inputs | Labeled partial or unknown state plus seeded fallback |
| Authentication | OTP challenge and session identity | Normalized retry or blocked claim state |
| Payments | Checkout and payment events | Authoritative pending, failed, or paid state |
| Database | Durable canonical storage | Durable mutations fail closed |
| Provider systems | Commercial rules, project events, and artifacts | Idempotent mapping, replay, health, and exception path |

Adapters enforce timeouts, bounded retries, cost controls, and normalized errors. Provider-specific schemas never reach customer UI or domain contracts.
## Trust and Reliability
Untrusted inputs include addresses, free text, uploads, routes, agent output, provider events, webhooks, and external content.

Validation occurs through client affordances, server schemas, authorization, domain invariants, typed patch validation, and verification rules.

Secrets remain server-only. Logs and fixtures exclude secrets and sensitive payloads. Secure failure preserves the valid project, exposes a bounded error or fallback, and never invents a successful fact or transition.

Use validated configuration, structured correlation logs, finite timeouts, bounded retry for idempotent work, rate limits, reproducible migrations, managed recovery, and seeded demo fallbacks.
## Validation
The repository harness owns exact commands and evidence procedures. Architecture requires formatting, lint, strict typecheck, unit, integration, component, workflow, production-build, smoke, CI, real-browser behavior, and reference-based visual proof.

Approved implementation specs assign exact references and validation expectations for their collective outcome. Exact visuals own appearance; the repository harness owns proof procedures.
## Architectural Invariants
- One project survives from resolved property through verified execution and support.
- Account claim persists the session project without reset or duplication.
- The persistent runtime preserves required scene and object continuity.
- Direct controls never depend on model latency.
- Agents cannot own canonical state or deterministic calculations.
- Material values retain source, certainty, timestamp, version, and support.
- Offers compare against one confirmed baseline.
- Selection creates an immutable snapshot and disclosure event.
- Claims cannot become verified milestones without a satisfied rule or authorized exception.
- One store owns canonical state.
- No generalized workflow engine or microservice split enters the MVP without approval.
## Change Control
- Tasks cannot silently redefine architecture.
- Material changes require approval and an update to this document.
- State contracts may narrow durable state semantics, and approved implementation specs may narrow their implementation outcome; neither may contradict these architectural contracts.
- Annotation headers localize file responsibility and do not replace this map.
- Git owns prior versions and change history.
