# Tasks

## Purpose

Canonical queue for approved active work. Specs define outcomes. Tasks are coherent, independently verifiable implementation units.

## Control

- `RUN_MODE`: autonomous
- `MERGE_MODE`: autonomous
- `NEXT_TASK_TAG`: 0006
- `NEXT_REFACTOR_TAG`: 0001

Only explicit user instruction may change `RUN_MODE` or `MERGE_MODE`.

## Rules

MUST:

- use `[T-####]` for feature, bug, migration, or maintenance work
- use `[R-####]` only for behavior-preserving structural work
- assign tags monotonically and never reuse them
- treat physical queue order as authoritative
- allow exactly one `Status: working` task
- keep `Pass: false` until the closeout gate
- link every task to one approved spec
- copy exact required reference-artifact paths from the approved spec
- create `.harness/work/<TAG>.md` when a task becomes working

MUST NOT:

- implement a task with `Ready: false`
- infer artifact authority from a folder
- create research-only tasks in the coding queue
- split tightly coupled work by file, function, endpoint field, or database row
- combine unrelated outcomes with different acceptance or validation boundaries
- mark missing required proof as passed
- retain a separate completed-task log

## Queue Order

Order tasks by:

1. dependencies
2. security and data-integrity blockers
3. foundational contracts required downstream
4. core user-path behavior
5. integrations and operational support
6. visual polish and optimization

Priority:

- `P0`: safety, data integrity, or downstream blocker
- `P1`: foundation or core user value
- `P2`: polish, optimization, or non-blocking support

Within a level, prefer the task that removes the most downstream uncertainty.

## Task Scope

A task completes one coherent result, including tightly coupled code, schema, migration, tests, docs, references, and integration changes required to prove it.

Split only for:

- independent acceptance
- dependency order
- materially different validation
- security or data-risk isolation
- major system-boundary separation
- working-context limits

## Readiness and Eligibility

For a normal task, `Ready: true` means:

- the source spec is approved
- material questions are resolved
- task boundaries, order, dependencies, scope, and acceptance are correctly derived
- every required reference artifact exists and is approved
- required validation and delivery configuration exists
- no material blocker exists

Dependencies need not be complete for readiness.

A task is eligible when `Ready: true`, `Pass: false`, and all dependencies are satisfied.

A dependency is satisfied when:

- its queue entry has `Pass: true`, or
- configured base-branch history contains the exact task tag

Check base-branch history, not an unmerged task branch.

### Bootstrap Readiness Exception

Exactly one task may set `Bootstrap: true`:

- tag `[T-0001]`
- source spec `docs/specs/A-repository-foundation.md`
- no dependencies
- objective includes replacing every required `<unset>` field in `.harness/validation.md`

This task may become ready before validation commands are configured. Before candidate delivery, it must configure and pass every assigned normal validation and delivery gate. No later task may use `Bootstrap: true`.

## State Rules

- `queued`: approved and waiting
- `working`: the only task allowed to mutate runtime behavior
- `blocked`: stopped for unresolved context, access, outage, or missing proof
- `passed`: closeout state committed and pushed with `Pass: true`
- `Pass: false`: required during implementation and any failing gate
- `Pass: true`: valid only after closeout push and latest CI passes when enabled

Queue advancement requires the passed task to be merged into the configured base branch.

A merged passed entry may be removed when the next task becomes working. Git retains history.

## Scratchpad

Path: `.harness/work/<TAG>.md`

Scratchpads are ephemeral rehydration state and must be ignored by Git.

Required sections:

```text
Task:
Current plan:
Files inspected:
Files changed:
Decisions established:
Validation attempted:
Failed approaches and why:
Current blocker:
Next exact action:
```

Update after material discoveries, failures, changed hypotheses, review findings, push failures, and CI failures. Read prior failed approaches before debugging. Do not repeat one without new evidence. Keep under 80 lines when practical.

Delete only after the task tag exists in configured base-branch history.

## Task Template

```text
### [T-0001] <title>
Type: feature | bug | migration | maintenance
Bootstrap: false
Source_spec: docs/specs/<approved-spec>.md
Priority: P0 | P1 | P2
Depends_on: none | [T-####], [R-####]
Status: queued | working | blocked | passed
Ready: false | true
Pass: false
Objective:
- <single coherent result>
Scope:
- <included behavior and surfaces>
Non_goals:
- <explicit exclusions>
Acceptance_criteria:
- <observable pass condition>
Expected_surfaces:
- <modules, data, APIs, UI areas, docs, or configuration>
Reference_artifacts:
- none | <exact repository-relative path>
Validation_sets:
- baseline
- agent-review
- <surface-specific set>
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0001.md
```

For refactors, use `[R-0001]`, `Type: refactor`, `Bootstrap: false`, and state the preserved behavioral contract in `Acceptance_criteria`.

## Active Queue

### [T-0001] Repository foundation
Type: feature
Bootstrap: true
Source_spec: docs/specs/A-repository-foundation.md
Priority: P1
Depends_on: none
Status: passed
Ready: true
Pass: true
Objective:
- Establish the approved repository foundation from the existing `main` baseline, including replacing every required `<unset>` field in `.harness/validation.md`, proving the non-product application shell, and configuring its guarded delivery path.
Scope:
- Preflight the approved repository identity, preserved baseline and bounded authoring handoff, local tools, GitHub authentication and permissions, and available protection capabilities before implementation mutation.
- Create and prove the exact pinned cross-platform Next.js foundation, minimal `src/app` smoke shell, truthful validation contracts, CI checks, documentation, annotation enforcement, and repository security policy required by the source spec.
- Complete the source spec's independent reviews, tasks-only closeout, latest-head CI, protection or procedural fallback, guarded autonomous merge, and post-merge proof as one bootstrap outcome.
Non_goals:
- S1-S10 product behavior or visual authority, persistence, schemas, migrations, provider integration or SDKs, empty architecture layers, deployment, speculative validation families, or unrelated infrastructure.
- Repository creation, Git initialization, replacement baseline, history rewrite, force push, administrator bypass, or direct implementation commits on `main`.
Acceptance_criteria:
- Bootstrap preflight freshly verifies `DevDoneDiff/cp` with `visibility: public` / `private: false`, HTTPS `origin`, tracked `main`, preserved history, bounded approved authoring changes, supported tools, and sufficient GitHub authentication and permissions before mutation.
- Exact approved versions, a frozen `pnpm-lock.yaml`, machine-readable runtime settings, cross-platform commands, and the accessible non-product `GET /` shell satisfy the source spec without product dependencies or runtime environment values.
- Meaningful unit, integration, component, self-contained production-smoke, and Chromium proofs pass; browser CI reuses the smoke contract's production build without a second build.
- Annotation-header candidate-clean validation, repository security-policy validation, truthful `.harness/validation.md` reconciliation, and exact checks `CI / baseline` and `CI / browser-smoke` pass with immutable action SHAs, least privilege, no secrets, and deterministic concurrency.
- Read-only content and security reviews pass for the reviewed-content SHA, then the tasks-only closeout and latest-head CI pass for its separate closeout SHA before autonomous merge.
- Any authorized squash merge is guarded by the expected latest head SHA without administrator bypass, preserves `[T-0001]` in `main`, and proves ancestry, subject, and task-branch deletion; unsupported protections have their strongest available configuration and documented procedural fallback.
- Clerk email OTP is recorded only as a future replaceable project-owned adapter decision, with no Clerk SDK, credentials, environment values, hosted resources, UI, calls, or runtime behavior.
Expected_surfaces:
- Repository package-manager, runtime, dependency, lockfile, lint, formatting, type-check, and documentation surfaces.
- `src/app` non-product smoke shell and native styling.
- Foundation unit, integration, component, smoke, Chromium, annotation, and repository-security proof surfaces.
- GitHub Actions and repository delivery and protection procedures.
- `.harness/validation.md` and applicable architecture and local-context documentation.
Reference_artifacts:
- none
Validation_sets:
- bootstrap-preflight
- baseline
- agent-review
- frontend-component
- frontend-e2e
- security
- security-review
- smoke
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0001.md

### [T-0002] Pre-account session project runtime
Type: feature
Bootstrap: false
Source_spec: docs/specs/B-s1-s2-continuous-entry-and-property-analysis.md
Priority: P1
Depends_on: [T-0001]
Status: passed
Ready: true
Pass: true
Objective:
- Establish the tested browser-scoped S1-S2 state, projection, persistence, fixture, event, and persistent-runtime contracts that the three visual tasks can consume without claiming final S1 or S2 appearance.
Scope:
- Implement the typed S1-S2 visible-state machine, application commands, versioned session-project projection, source/certainty fields, stable identifiers, accepted-event cursor, and idempotent work-event schemas.
- Implement the validated client-side `sessionStorage` adapter, same-session restore, fresh-session behavior, safe invalid-state recovery, and injected ID, clock, and schedule boundaries.
- Define isolated seeded address, property, roof, panel, and energy adapter/fixture contracts with stable project, property, scene, camera, surface, panel, and event identities.
- Establish one persistent runtime and semantic scene-shell boundary, reconcile the obsolete foundation readiness/coverage assertions, and add focused unit, integration, component, E2E, smoke, and security proof.
Non_goals:
- Final S1 or S2 visual compositions, reference-fidelity claims, derived visual assets, live assembly SSE or polling behavior, or S3 and later product UI.
- Postgres, Neon, Drizzle, migrations, durable records, authentication, pricing, contractors, model calls, live providers, external credentials, or new production dependencies.
- Full-page screenshot UI, a second canonical store, generalized workflow infrastructure, or renderer/panel replacement behavior.
Acceptance_criteria:
- Typed commands and transitions create exactly one session project and candidate from the canonical seeded resolution, require explicit property confirmation before assembly, and stop inside S2 at the minimum-usable readiness contract.
- The projection stores schema/fixture versions, monotonic project version, stable identifiers, source-aware facts, panel-object fields, accepted event IDs, and the latest cursor; duplicate, foreign, malformed, or impossible events cannot advance state.
- Valid same-session projections restore with identical accepted identities and state, a fresh browser context begins at S1, and missing, incompatible, corrupt, or malicious storage fails safely without a durable or external write.
- ID, clock, schedule, adapter, storage, and event boundaries are deterministic under test and preserve the renderer/component continuity contract without implementing final visual states or live transport.
- A truthful semantic non-product shell and stable product readiness marker replace the obsolete foundation-only assertion for component, E2E, production-smoke, coverage, annotation, and independent-review proof.
Expected_surfaces:
- Typed runtime, domain, and application modules for visible states, commands, projections, identifiers, events, and fixture schemas.
- Browser-session storage adapter and local seeded address/property/roof/panel/energy adapters.
- Persistent runtime and semantic scene/renderer component boundary.
- Root/layout metadata, readiness marker, coverage, and foundation-shell reconciliation surfaces.
- Unit, integration, component, E2E, smoke, security, annotation, and review proof surfaces.
Reference_artifacts:
- references/states/s02-property-analysis/technical-persistent-project-assembly.png
Validation_sets:
- baseline
- agent-review
- frontend-component
- frontend-e2e
- security
- security-review
- smoke
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0002.md

### [T-0003] S1 address-entry experience
Type: feature
Bootstrap: false
Source_spec: docs/specs/B-s1-s2-continuous-entry-and-property-analysis.md
Priority: P1
Depends_on: [T-0002]
Status: passed
Ready: true
Pass: true
Objective:
- Deliver and prove the approved seeded S1 address-entry experience through creation of one session project and client transition into the persistent runtime.
Scope:
- Implement the assigned S1 default and `How it works` open compositions with real semantic UI, native responsive styling, and one clean local atmospheric asset derived or recreated from only the assigned references when needed.
- Implement deterministic seeded suggestion and normalization, listbox keyboard/pointer behavior, duplicate prevention, loading, invalid, recoverable-error, retry, and preserved-input states.
- Implement truthful privacy/no-pressure content and the approved non-authenticating deferred-sign-in behavior if that affordance is retained.
- Wire successful selection to atomic session-project/candidate creation and client navigation into the Task 1 persistent runtime without a full document reload.
Non_goals:
- Final S2 confirmation or assembly visuals, roof/panel assembly transport, S3 or later product surfaces, pricing, account creation, or contractor behavior.
- Clerk or simulated authentication, live address/property providers, durable writes, provider claims, external credentials/cost, or new production dependencies.
- Modifying approved references, baking text/controls/ratings/claims into the hero asset, or implementing the page as a flattened screenshot.
Acceptance_criteria:
- The canonical seeded address is offered and normalized through accessible listbox semantics; keyboard and pointer selection each create exactly one valid session project/candidate with stable IDs and source metadata.
- Loading, empty/unsupported input, recoverable failure, retry, preserved input, focus, and duplicate-submission behavior are deterministic, accessible, and create no false candidate or duplicate project.
- The closed/open help surface has controlled focus, close and `Escape` behavior, truthful four-row slice copy, responsive adaptation, and focus return; privacy/no-pressure claims remain truthful.
- Any rendered deferred-sign-in affordance announces its unavailability and creates no navigation, request, credential, cookie, authenticated state, project, or fake success path.
- Successful selection enters the persistent runtime through client navigation, and real-browser proof at `1536x1024`, `1440x900`, `1024x768`, and `390x844` verifies assigned-reference fidelity, responsive hierarchy, overflow, focus, error states, and reduced motion without implementing final S2 visuals.
Expected_surfaces:
- Root S1 landing composition, product metadata/readiness marker, native styles, and responsive behavior.
- Address input, suggestion/listbox, help, privacy, optional deferred-sign-in, loading, error, and retry components.
- Clean local S1 hero/background asset derived or recreated only from assigned visual authority when necessary.
- Seeded address-resolution and session-project creation/runtime-entry wiring.
- Component, E2E, smoke, visual, accessibility, reduced-motion, security, and independent-review proof surfaces.
Reference_artifacts:
- references/states/s01-address-entry/visual-default.png
- references/states/s01-address-entry/visual-how-it-works-open.png
Validation_sets:
- baseline
- agent-review
- frontend-component
- frontend-e2e
- frontend-visual
- security
- security-review
- smoke
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0003.md

### [T-0004] S2 property confirmation
Type: feature
Bootstrap: false
Source_spec: docs/specs/B-s1-s2-continuous-entry-and-property-analysis.md
Priority: P1
Depends_on: [T-0003]
Status: queued
Ready: true
Pass: false
Objective:
- Deliver and prove the approved S2 property-confirmation state inside the persistent runtime, including explicit homeowner authority, clean correction, and continuity into the existing semantic assembly state.
Scope:
- Implement the assigned confirmation composition, persistent project header/context, submitted address, candidate details, source/certainty labels, decision hierarchy, and responsive/accessibility behavior.
- Create one clean local S2 base property-scene asset and stable scene/camera component boundary with separately rendered property outline and no baked UI, facts, outlines, or dynamic panels.
- Implement explicit `PROPERTY_CONFIRMED` authority, the block on deeper work before confirmation, and transition into the semantic live-assembly state without remounting the in-session scene component.
- Implement correction back to the preserved/focused address input while retaining the project root and discarding the rejected candidate and all candidate-derived active state.
Non_goals:
- Final live-roof-assembly composition, SSE/polling transport, progressive panel reveal, energy readiness, or assembly timing owned by `[T-0005]`.
- S3 controls/content/routes, pricing, accounts/authentication, contractors, live providers, durable persistence, model calls, external services, or new production dependencies.
- A replacement property scene between confirmation and assembly, baked dynamic panels, false provider/source claims, fabricated precision, or full-page screenshot implementation.
Acceptance_criteria:
- `PROPERTY_CONFIRMATION` matches the assigned visual composition at all four required viewports and presents one candidate with the submitted address, unchanged project/property identities, and truthful `Seeded demo imagery`, `Demo property match`, and `Modeled` labeling.
- One local scene asset, scene ID, camera ID, and mounted scene/renderer component are established; the accessible property outline is a separate data-bound layer and no dynamic panel is baked into the base image.
- Roof, panel, and energy assembly cannot begin until `Yes, this is my property` explicitly records `PROPERTY_CONFIRMED`; confirmation preserves identity and enters the existing semantic assembly state without an unrelated page reset or scene remount.
- `Not your property?` preserves and focuses the prior address input and project root while removing the rejected candidate plus derived scene, geometry, panels, facts, readiness, and cursor from active state before a new candidate can be selected.
- Component, E2E, smoke, real-browser visual, accessibility, reduced-motion, continuity, security, and independent-review proof pass without implementing final assembly visuals or S3.
Expected_surfaces:
- Persistent project runtime confirmation composition, header/context, decision instrument, facts/status strip, and native responsive styling.
- Stable property-scene renderer/component, local base scene asset, camera context, and property-outline layer.
- Confirmation, correction, projection mutation, focus, client navigation, and restoration behavior.
- Component, E2E, smoke, visual, accessibility, continuity, security, and review proof surfaces.
Reference_artifacts:
- references/states/s02-property-analysis/visual-property-confirmation.png
- references/states/s02-property-analysis/technical-persistent-project-assembly.png
Validation_sets:
- baseline
- agent-review
- frontend-component
- frontend-e2e
- frontend-visual
- security
- security-review
- smoke
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0004.md

### [T-0005] S2 live roof assembly
Type: feature
Bootstrap: false
Source_spec: docs/specs/B-s1-s2-continuous-entry-and-property-analysis.md
Priority: P1
Depends_on: [T-0004]
Status: queued
Ready: true
Pass: false
Objective:
- Deliver and prove the approved event-driven S2 live roof assembly through the in-place `MINIMUM_USABLE_READY` boundary while retaining the same property scene and stable panel objects and rendering no S3 surface.
Scope:
- Implement the assigned assembly composition, work/status hierarchy, source-aware fact presentation, stable roof/panel render layers, object-count progress, error/retry, restored, reduced-motion, and ready states.
- Apply the required typed events through the validated domain/application boundary so roof facts, panel objects, energy facts, and minimum usability appear only after their corresponding accepted events.
- Implement native same-origin SSE as the primary assembly transport and bounded cursor-based polling fallback with payload validation, idempotency, exhaustion, retry, and no transport-owned domain state.
- Implement the approximately 20 to 30 second visible seeded schedule, accelerated injected test timing, reload restoration, and the no-remount/no-replacement continuity contract through readiness.
Non_goals:
- S3 composition, controls, project lenses, customization, `Update system`, automatic S3 navigation, pricing/S4, account creation, authentication, contractors, offers, or later states.
- Live property/solar providers, model calls, external credentials/cost, durable persistence, background-job/outbox/WebSocket infrastructure, or new production dependencies.
- Timer-only progress, invented facts, verified claims, replacement renderer/panel set, high-end 3D, baked panel imagery, or full-page screenshot implementation.
Acceptance_criteria:
- The live assembly accepts only `PROPERTY_CONFIRMED`, `ROOF_GEOMETRY_READY`, repeated `PANEL_OBJECT_ADDED`, `ENERGY_MODEL_READY`, and `MINIMUM_USABLE_READY` in valid order; malformed, duplicate, foreign, replayed, or impossible events cannot advance state.
- Roof facts, each panel, energy facts, and readiness appear only after their accepted event; progress derives from completed stages and stable object counts rather than elapsed time.
- Every panel retains `panel_id`, `surface_id`, `placement_rank`, geometry, render status, and selection state across SSE, polling fallback, retry, reload restoration, and readiness without regeneration or duplicate creation.
- SSE is primary; deterministic failure or stall resumes bounded polling from the accepted cursor, preserves valid state and identities, stops with a truthful recoverable error on exhaustion, and resumes safely on retry.
- The normal foreground demo reaches `MINIMUM_USABLE_READY` in approximately 20 to 30 seconds while automated tests use accelerated injected timing; reduced motion preserves every status, fact, object, error, and transition without unnecessary travel or transforms.
- At readiness the same in-session scene component, camera context, property, surfaces, and accepted panel objects remain mounted, a reload restores equivalent stable identities without replay, the assigned composition passes all four viewport reviews, and no S3 or later content appears.
Expected_surfaces:
- S2 assembly status, progress, fact, error/retry, restored, ready, and panel-render layers with native responsive styling.
- Typed work-event reducer/application handling and browser-session projection updates.
- Same-origin SSE and polling route handlers plus the replaceable client transport adapter.
- Seeded schedule, clock, cursor, retry/replay, reload-restoration, and reduced-motion behavior.
- Component, integration, E2E, smoke, visual, timing, continuity, security, and independent-review proof surfaces.
Reference_artifacts:
- references/states/s02-property-analysis/visual-live-roof-assembly.png
- references/states/s02-property-analysis/technical-persistent-project-assembly.png
Validation_sets:
- baseline
- agent-review
- frontend-component
- frontend-e2e
- frontend-visual
- security
- security-review
- smoke
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0005.md
