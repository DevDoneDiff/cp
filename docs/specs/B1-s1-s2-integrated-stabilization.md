# S1-S2 Integrated Stabilization

## Status

- State: approved
- Approved: true
- Readiness: ready_for_review

## Identity

- Sequence: B1
- Outcome: The completed S1-S2 slice is established as a stable integrated release candidate through one durable cross-task browser contract, evidence-driven defect correction, and complete validation of the already-approved behavior through `MINIMUM_USABLE_READY`.
- Depends_on: `docs/specs/B-s1-s2-continuous-entry-and-property-analysis.md`
- Approval_scope: Authorizes exactly one maintenance outcome, S1-S2 integrated stabilization. It authorizes durable integrated regression proof and correction of confirmed defects within the already-approved S1-S2 behavior; it authorizes no implementation during this authoring run, no new product behavior, and no S3 or later product surface.

## Authority and Source Bundle

- Upstream sources: none. The approved S1-S2 specification below already resolves the applicable upstream product decisions.
- Product: `docs/PRODUCT.md` sections Core Journey through S2, MVP Scope, Product Requirements, Product Invariants, Trust, Privacy, and Safety, Success Criteria, and Constraints.
- Architecture: `docs/ARCHITECTURE.md` sections Persistent Project Runtime, pre-account Data Architecture, S1-S2 Interfaces and Events, Trust Boundaries, Validation and Delivery, and Architectural Invariants.
- Design: `docs/DESIGN.md` sections Approved Reference Registry, Reference Consumption Rules, Style Profile, Spacing and Layout, Shape, Components, and Feedback, Icons and Imagery, Motion, Accessibility, and Browser Validation.
- Decisions: none.
- Prior specs: `docs/specs/B-s1-s2-continuous-entry-and-property-analysis.md` in full.
- Additional source: `AGENTS.md`; `.harness/tasks.md`; `.harness/validation.md`; relevant entries in `.harness/LESSONS.md`; current S1-S2 runtime, domain, adapters, routes, UI, tests, validation scripts, annotation headers, and package configuration.

This specification does not reopen or extend the approved S1-S2 product slice. The prior specification continues to own behavior, data, transport, timing, restoration, continuity, security, visual intent, accessibility, and the `MINIMUM_USABLE_READY` boundary. This maintenance specification owns only the integrated proof and evidence-driven stabilization of that completed slice.

## Reference Artifacts

| Path | Type | Status | Authority | Applies to |
|---|---|---|---|---|
| `references/states/s01-address-entry/visual-default.png` | visual | approved | Owns the S1 default composition and hierarchy within the prior approved prose | Integrated S1 entry and direct visual comparison |
| `references/states/s01-address-entry/visual-how-it-works-open.png` | visual | approved | Owns the S1 open-help composition within the prior approved prose | Integrated help, focus, and responsive review |
| `references/states/s02-property-analysis/visual-property-confirmation.png` | visual | approved | Owns the S2 confirmation composition and decision hierarchy within the prior approved prose | Integrated property confirmation and correction review |
| `references/states/s02-property-analysis/visual-live-roof-assembly.png` | visual | approved | Owns the S2 assembly composition, status hierarchy, object progress, and ready visual intent within the prior approved prose | Integrated early, partial, fallback, retry, restored, and ready review |
| `references/states/s02-property-analysis/technical-persistent-project-assembly.png` | technical | approved guidance | Explains persistent-shell, event-progress, stable-object, transport, and future continuity concepts only where approved prose independently requires them | Cross-task runtime, transport, restoration, and continuity audit |

Rules:

- These are the only reference artifacts authorized by this specification. No other file in either reference folder supplies authority.
- The four visual artifacts remain state-specific visual authority within the prior approved prose.
- The technical artifact remains guidance only and cannot introduce architecture, behavior, S3 controls, automatic navigation, or another transport.
- Generated-image defects, fabricated values, malformed copy, annotation labels, and baked dynamic UI remain excluded.
- The implementation must remain semantic UI over approved local imagery; screenshots cannot substitute for application structure or behavior.

## End State

- One durable integrated browser release contract exercises the customer path from a fresh S1 browser session through explicit S2 confirmation, event-driven live assembly, `MINIMUM_USABLE_READY`, and same-session reload.
- The contract proves the cross-task seams that focused task tests can miss: client navigation, single-project authority, scene and object continuity, transport recovery, event-derived progress, browser-session restoration, and the absence of S3.
- Existing focused tests and validation remain intact or become stronger. Confirmed defects discovered by executable or real-browser evidence are corrected within the prior approved behavior.
- The merged S1-S2 slice is left clean, reproducible, review-clean, CI-green, and stable for later screen prototyping without implementing those screens.

## Entry and Exit Contract

### Entry

- `[T-0001]` through `[T-0006]` are passed and present in synchronized `main` history.
- The complete approved S1-S2 implementation, fixtures, tests, validation configuration, references, and annotations are present and form the behavioral baseline.
- The browser starts the integrated contract in a fresh context with no inherited project storage.

### Exit

- A production-equivalent browser can complete the existing S1-S2 journey in one coherent run and restore its accepted ready projection after reload.
- Durable automated proof guards the journey and its cross-task identities, state transitions, transport boundary, and minimum-usable stop.
- Every assigned validation set, independent review, exact-head CI gate, guarded merge, and cleanup requirement passes with no unresolved blocking finding.

## Scope

### In Scope

- Audit the merged S1-S2 runtime, domain, projection, session storage, seeded fixtures, routes, transport adapter, UI, tests, annotations, build, smoke, and validation surfaces as one release candidate.
- Prove a fresh isolated checkout with the repository-pinned toolchain, frozen dependency installation, production build, startup, and assigned validation commands so cached local state cannot substitute for reproducibility.
- Add one named, durable integrated browser release contract in the existing test infrastructure. It must start from fresh S1, use the real seeded UI path, enter the persistent project runtime through client navigation, explicitly confirm the property, exercise event-driven assembly and at least one deterministic transport-recovery seam, reach `MINIMUM_USABLE_READY`, and reload the accepted ready projection.
- Prove the project, candidate/property, scene, camera, surface, panel, event, cursor, and version contracts at the seams where they are applicable, without creating a second state authority.
- Prove the isolated delivered-v1 restoration path and canonical-v2 persistence path: current sessions write only `cp.pre-account-project.v2` under `CANONICAL_SCHEDULE_V1`; delivered-v1 sessions restore and continue only through `cp.pre-account-project.v1` under `LEGACY_UNVERIFIED_V1`; neither contract can be downgraded, retagged, or mixed with the other.
- Reconcile existing focused unit, integration, component, E2E, smoke, security, and visual proof when the integrated contract exposes an actual coverage gap.
- Correct only defects demonstrated by a failing automated check, reproducible browser observation, inconsistent annotation, or direct contradiction of the approved S1-S2 specification.
- Simplify or remove stale task-local implementation only when evidence proves it conflicts with the release contract and the change preserves all approved behavior.
- Review all assigned visual states at the four required viewports, including accessibility, reduced-motion, failure, fallback, retry, restoration, and continuity behavior.

### Non-Goals

- S3 or later composition, controls, routes, project lenses, customization, pricing, accounts, authentication, contractors, offers, payments, or prototype-dependent work.
- New product behavior, changed visual direction, speculative polish, broad refactoring, generalized workflow infrastructure, or an architecture rewrite.
- New production dependencies, replacement dependencies, package-manager changes, provider SDKs, live providers, model calls, analytics, durable storage, external systems, credentials, hosted configuration, or external cost.
- Coverage-percentage chasing, performance-budget invention, pixel changes unsupported by the approved visual references, or replacement of existing focused tests with only one broad test.
- A research-only report, closeout log, new validation-set name, or documentation that substitutes for executable proof.

## Required Behavior

1. The integrated release contract begins in a new browser context at S1 with no restored project and completes the canonical seeded address-selection path through real semantic controls.
2. Successful selection creates exactly one valid browser-session project and candidate, then uses client navigation to enter `PROPERTY_CONFIRMATION` without a full document reload or disconnected application reset.
3. Explicit confirmation is the only authority that starts live assembly. The same in-session persistent runtime, property scene, camera context, and accepted object identities continue through assembly, transport recovery, retry when exercised, and readiness.
4. Assembly progress and visible facts derive only from accepted typed work events and stable object counts. Event order, cursor, version, idempotency, project/property binding, and readiness prerequisites remain enforced at every ingress and replay boundary.
5. Native same-origin SSE remains primary. The integrated proof deliberately exercises a deterministic fallback or interruption after accepted progress, resumes bounded polling from the accepted cursor, preserves valid state, and proves truthful exhaustion/retry behavior without duplication when that recovery path is selected.
6. Production-visible assembly remains approximately 20 to 30 seconds while automated proof uses the injected accelerated schedule and stable clock.
7. A ready-state reload mounts a new browser runtime instance and rehydrates the same accepted project, property, scene, camera, surface, panel, event, cursor, and version identities without replay, regeneration, or an external or durable write.
8. `MINIMUM_USABLE_READY` remains inside S2 with the same scene and panel objects. No S3 content, automatic S3 navigation, later-state control, or unsupported claim appears.
9. Existing correction, loading, invalid, help, scene-fallback, partial-restoration, exhausted, retry, focus, keyboard, responsive, and reduced-motion contracts remain covered by focused proof and real-browser review.
10. The normal, fallback, retry, and restoration paths produce no uncaught application or console error, unexpected same-origin HTTP failure, external request, secret disclosure, duplicate project, or false success state.
11. A fresh isolated checkout uses the exact repository-pinned runtime and package manager, completes a frozen dependency installation, builds and starts the production application, and passes the assigned validation without relying on an existing worktree cache.
12. New sessions persist only the canonical-v2 projection under `CANONICAL_SCHEDULE_V1`. Delivered-v1 projections restore and continue only through their isolated legacy key under `LEGACY_UNVERIFIED_V1`; canonical state cannot be downgraded or retagged, and canonical and legacy provenance cannot be mixed.

## State and Authority Rules

- This specification introduces no state, event, command, public contract, or product transition.
- The existing reducer and validated projection remain canonical. UI, transport, browser storage, tests, and fixtures cannot independently advance or redefine domain state.
- Homeowner confirmation remains explicit authority. Valid event prerequisites remain deterministic system authority.
- A defect correction may restore approved behavior; any change that would alter product meaning, architecture, security posture, visual authority, external cost, or the S2 boundary requires separate user approval.

## Data and Persistence

- Owned data: none beyond the existing pre-account S1-S2 browser-session projection and deterministic test evidence.
- Source and certainty: preserve the approved seeded and modeled labels, provenance, timestamps, and certainty fields.
- Transaction boundary: preserve atomic in-memory reduction plus validated `sessionStorage` publication; rejected input cannot partially mutate or persist state.
- Versioning and idempotency: preserve schema/fixture versions, monotonic project/event versions and cursors, stable semantic identities, exact-event idempotency, and collision rejection. Canonical-v2 and delivered-v1 storage keys and provenance contracts remain isolated in both directions.
- Retention or deletion: preserve browser-session-only retention. A fresh context starts at S1; no durable homeowner record is created.

## Interfaces and Dependencies

- Public interfaces: preserve the existing same-origin S1 route, persistent project route, SSE endpoint, and polling endpoint without broadening their payload or trust boundary.
- Internal contracts: preserve typed commands/results, event reduction, projection validation, session storage, seeded adapters, transport normalization, persistent scene identity, and test-only injected ID/clock/schedule controls.
- Events or jobs: preserve `PROPERTY_CONFIRMED`, `ROOF_GEOMETRY_READY`, repeated `PANEL_OBJECT_ADDED`, `ENERGY_MODEL_READY`, and `MINIMUM_USABLE_READY`; add no event or background job.
- External services: none. Do not access or configure Neon, Sentry, Clerk, Stripe, a provider, analytics, or another external system.

## Security, Privacy, and Trust

- Untrusted inputs: address text, browser storage, route/query data, SSE messages, polling payloads, cursors, versions, event identities, and fixture selectors remain untrusted.
- Validation and authorization: preserve exact-shape validation, same-origin and active-project/property binding, payload bounds, semantic identity checks, ordering, idempotency, and secure rejection before state publication.
- Sensitive data: none may be added to code, fixtures, logs, references, tests, commits, transport payloads, or screenshots.
- Disclosure boundary: remain pre-account and seeded. No provider identity, contractor identity, real offer, verified claim, or durable homeowner record may be disclosed or implied.
- Secure failure behavior: preserve the last valid project state, fail closed, expose one truthful recoverable path when available, and never invent a successful fact, event, readiness state, or persistence result.

## Visual, Interaction, and Accessibility

- Required states: S1 default and open help; suggestion, loading, invalid, recoverable error, and retry; property confirmation and correction; scene fallback; early, partial, fallback, exhausted, retry, restored, and ready assembly; reduced-motion equivalents.
- Reference fidelity: compare canonical states directly to the four assigned visual artifacts. Derived states retain the nearest assigned composition, hierarchy, and visual language. The technical artifact supplies guidance only.
- Responsive viewports: `1536x1024`, `1440x900`, `1024x768`, and `390x844`.
- Keyboard and focus: preserve full keyboard operation, visible focus, logical focus transfer and return, semantic listbox/dialog/status/alert behavior, and accessible state announcements.
- Reduced motion: preserve every status, fact, object, error, action, and transition without camera travel or unnecessary spatial transforms.
- Intentional departures: only the truthful-copy, accessibility, responsive, and image-defect departures already approved by the prior specification.

## Failure and Edge Behavior

- Missing, corrupt, incompatible, oversized, malicious, foreign-project, or mixed-contract browser storage fails closed to a safe recoverable state without publishing attacker-controlled data.
- A canonical-v2 projection presented through the delivered-v1 key, a delivered-v1 projection presented through the canonical-v2 key, a retagged provenance contract, or mixed canonical/legacy timing is rejected without downgrade or cross-key publication.
- Malformed, duplicate, foreign, replayed, out-of-order, colliding, or impossible events cannot advance state, cursor, version, visible progress, persistence, or readiness.
- SSE failure or stall preserves accepted progress and may resume bounded polling only from the accepted cursor. Poll exhaustion preserves valid state and exposes truthful retry; retry cannot duplicate or replace accepted objects.
- Scene imagery failure preserves a semantic, usable property/roof/panel representation and the same domain state.
- Test or review evidence that cannot be made deterministic, repeatable, and attributable is not completion proof.

## Acceptance Criteria

1. A named integrated browser release contract starts from a fresh context at S1 and completes the seeded UI journey through client navigation, explicit confirmation, event-driven assembly, `MINIMUM_USABLE_READY`, and ready-state reload without test-only mutation of canonical application state.
2. The integrated contract proves exactly one project, correct candidate/property binding, stable scene/camera/surface/panel identities, valid ordered event IDs, monotonic cursor/version, event-derived facts/progress, and no duplicate or replaced accepted object.
3. The contract deliberately crosses one deterministic SSE recovery boundary after accepted progress, resumes from the accepted cursor through bounded polling, and proves exhaustion/retry or equivalent recovery completion without state loss or duplication.
4. Reload creates a new runtime instance while restoring the same accepted ready projection and identities without replay, regeneration, external access, durable write, or S3 transition.
5. Existing focused proof continues to cover S1 help/error/correction, confirmation gating, invalid storage/events, normal SSE, polling exhaustion/retry, partial and ready restoration, scene fallback, accessibility, and reduced motion. No useful test or security assertion is weakened to make the integrated contract pass.
6. Production/demo browser observation confirms the existing approximately 20 to 30 second visible schedule; automated tests use the accelerated injected schedule and stable clock.
7. Real-browser review at all four required viewports inspects every assigned reference and the required canonical and derived states for composition, hierarchy, overflow, focus, keyboard operation, semantic announcements, scene/panel continuity, reduced motion, and absence of screenshot substitution.
8. Normal, fallback, retry, restoration, and scene-fallback review finds no uncaught application or console error, unexpected same-origin HTTP failure, external request, false provider claim, secret, duplicate project, or false readiness state.
9. The implementation remains inside the prior S1-S2 contract and renders no S3 or later content. Any code, test, annotation, or documentation change is tied to reproducible evidence and is the smallest coherent correction.
10. No production dependency, package-manager setting, external system, credential, hosted resource, durable database, provider integration, model call, or analytics surface is added or accessed.
11. A fresh isolated checkout with the exact pinned toolchain completes frozen dependency installation, production build, startup, and assigned validation without relying on the active worktree's installed modules, build output, browser state, or generated cache.
12. Executable storage proof establishes that current sessions write only `cp.pre-account-project.v2` with `CANONICAL_SCHEDULE_V1`, delivered-v1 projections restore and continue only through `cp.pre-account-project.v1` with `LEGACY_UNVERIFIED_V1`, and downgrade, retagging, provenance mixing, or cross-key publication fails closed.
13. Every assigned validation set and independent correctness, security, architecture, data-integrity, and visual review passes on the exact candidate head; every blocking finding is corrected and freshly reviewed before closeout.
14. Exact-head CI, tasks-only closeout, latest-head CI, guarded squash merge, hardened cleanup, merged-history proof, synchronized clean `main`, and scratchpad deletion complete through the live harness procedure.

## Validation Expectations

- Required sets: `baseline`, `agent-review`, `frontend-component`, `frontend-e2e`, `frontend-visual`, `security`, `security-review`, and `smoke`.
- Required fixtures or seeded data: the existing canonical address and aliases, property candidate, scene/camera, roof surfaces, ordered panels, modeled energy facts, event schedule, transport failure/stall/exhaustion controls, valid and hostile storage projections, and deterministic ID/clock/schedule doubles. Add no live provider fixture.
- Required browser states: fresh S1; open/closed help; address suggestion, keyboard and pointer operation, loading/invalid/error/retry; confirmation/correction; early/partial assembly; SSE recovery to polling; exhaustion/retry; scene fallback; confirmation/partial/ready restoration; `MINIMUM_USABLE_READY`; and reduced-motion equivalents.
- Required browser viewports: `1536x1024`, `1440x900`, `1024x768`, and `390x844`.
- Required release-contract proof: one production-equivalent browser journey from fresh S1 through ready reload, with instrumentation sufficient to prove cross-task identity and continuity without introducing production-only observability or a second state store.
- Required compatibility proof: canonical-v2 new-session persistence, delivered-v1 isolated restoration/continuation, and rejection of downgrade, retagging, mixed provenance, and cross-key publication.
- Required clean-environment proof: a fresh isolated checkout using the repository-pinned toolchain and frozen dependency graph completes installation, production build, startup, and assigned validation without reusing active-worktree dependency or build caches.
- Required review: independent correctness, security/privacy, data-integrity, architecture/transport, test-quality, and exact-reference visual review on the same candidate head, followed by fresh review of every blocking correction.

## Proposed Task Outcomes

1. **S1-S2 integrated stabilization**
   - Dependency: the completed S1-S2 implementation and harness hardening.
   - Outcome: Add and prove one durable integrated browser release contract across the merged S1-S2 customer journey, correct only defects demonstrated by executable or real-browser evidence, reconcile focused proof and annotations where gaps are confirmed, validate all assigned references and browser states, and leave the slice release-clean at `MINIMUM_USABLE_READY` without implementing S3.
   - References: all five exact artifacts listed by this specification; the four visual artifacts retain visual authority and the technical artifact remains guidance only.
   - Validation sets: `baseline`, `agent-review`, `frontend-component`, `frontend-e2e`, `frontend-visual`, `security`, `security-review`, and `smoke`.

No split is justified. The release contract, evidenced corrections, focused regression hardening, browser review, and closeout form one integrated maintenance result. Do not assign a task tag in this specification.

## Open Questions

- none
