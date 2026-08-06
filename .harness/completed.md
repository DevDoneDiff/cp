# Completed Tasks

## Purpose

Append-only archive of completed implementation tasks.

Each archived task is the verbatim full task block that completed execution, including `Status: passed` and `Pass: true`.

## Immutability Contract

- A task enters this file only through the closeout procedure in `.harness/validation.md`.
- The complete task block is copied verbatim from its final closeout state.
- After the archive entry exists in configured base-branch history, it must never be edited, reordered, condensed, or deleted.
- A later correction uses a new task that references the archived tag; it does not rewrite history here.
- Normal task selection, authoring, and implementation do not load this file.
- An archive entry on an unmerged task branch is provisional and may be reversed only when closeout, latest-head CI, or merge fails before the entry reaches base-branch history.

Git remains the detailed implementation and delivery history. This file preserves the exact task authority under which completed work ran.

## Historical Seed Provenance

- During the H1 transition, the seven historical blocks `T-0001, T-0002, T-0003, T-0004, T-0006, T-0005, T-0007` were seeded here verbatim in that order.
- Those tasks did not originally execute the current active-to-archive transfer procedure. Their compatibility proof is the existing tagged base-branch history plus the exact seeded blocks and this provenance; it does not imply post-H1 completion mechanics.
- The canonical seed-hash input is UTF-8 text from the first `### [T-0001]` heading through the terminal newline immediately after the `T-0007` block and before any later archive entry. Normalize CRLF to LF, with no trimming or other transformation.
- The canonical combined seed-block SHA-256 is `2B07112D32C5401991C2224A83E7C53BB36415842C599BAB900F17135F460C1F`.
- Tasks completed after this seed require the canonical post-H1 completion proof; seed compatibility is not reusable for later tasks.

## Completed

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
Status: passed
Ready: true
Pass: true
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

### [T-0006] Harness execution hardening
Type: maintenance
Bootstrap: false
Source_spec: docs/specs/A1-harness-execution-hardening.md
Priority: P1
Depends_on: [T-0004]
Status: passed
Ready: true
Pass: true
Objective:
- Remove the proven Windows line-ending and post-squash local branch-cleanup ambiguities without changing product behavior.
Scope:
- Add a root `.gitattributes` policy that normalizes repository text to LF and preserves CRLF for Windows command files.
- Align `AGENTS.md` and `.harness/validation.md` on one exact post-merge local task-branch cleanup exception.
- Clarify that a passed task's scratchpad path is historical after merged cleanup.
- Route post-merge completion in `$code-change-verification` to the exact cleanup procedure owned by `.harness/validation.md`.
Non_goals:
- Product runtime or UI changes.
- `[T-0005]` implementation.
- Node or pnpm configuration.
- `.harness/LESSONS.md` changes.
- Validator, fixture, test, annotation-header, dependency, CI-cycle, or task-state redesign.
Acceptance_criteria:
- `.gitattributes` contains the approved three-line text policy and controlled renormalization produces no semantic source change.
- Exact-target local force deletion is permitted only after successful squash merge, synchronized clean base branch, task-tag history proof, merged pull-request proof, remote task-branch absence, and failure of ordinary deletion solely because of squash ancestry.
- The exception cannot authorize force-push, shared-history rewrite, remote force deletion, base-branch deletion, or deletion of any unrelated branch.
- Passed-task scratchpad paths are explicitly historical and their files are expected to be absent after merged cleanup.
- Baseline and independent review pass with no product behavior change.
Expected_surfaces:
- Root `.gitattributes`.
- `AGENTS.md`.
- `.harness/validation.md`.
- `.harness/tasks.md`.
- `.agents/skills/code-change-verification/SKILL.md`.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0006.md

### [T-0005] S2 live roof assembly
Type: feature
Bootstrap: false
Source_spec: docs/specs/B-s1-s2-continuous-entry-and-property-analysis.md
Priority: P1
Depends_on: [T-0004]
Status: passed
Ready: true
Pass: true
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

### [T-0007] S1-S2 integrated stabilization
Type: maintenance
Bootstrap: false
Source_spec: docs/specs/B1-s1-s2-integrated-stabilization.md
Priority: P1
Depends_on: [T-0005], [T-0006]
Status: passed
Ready: true
Pass: true
Objective:
- Establish the completed S1-S2 slice as a stable integrated release candidate by adding one durable cross-task browser contract, correcting only confirmed defects within approved behavior, and freezing the slice at `MINIMUM_USABLE_READY` for later-screen work.
Scope:
- Audit the merged S1-S2 runtime, domain, projection, browser-session persistence, seeded fixtures, same-origin routes, transport, UI, tests, annotations, build, smoke, and validation surfaces as one release candidate.
- Add one named integrated browser release contract in the existing test infrastructure from a fresh S1 context through seeded address selection, client navigation, explicit property confirmation, event-driven assembly, deterministic transport recovery, `MINIMUM_USABLE_READY`, and ready-state reload.
- Prove cross-task project, candidate/property, scene, camera, surface, panel, event, cursor, version, no-remount, and restoration continuity without introducing a second state authority or production-only observability.
- Preserve and prove SSE-primary delivery, bounded cursor polling, accepted-state retention, exhaustion/retry without duplication, the approximately 20 to 30 second production schedule, and accelerated injected test timing.
- Preserve and prove isolated delivered-v1 restoration and canonical-v2 persistence: current sessions write only `cp.pre-account-project.v2` under `CANONICAL_SCHEDULE_V1`; delivered-v1 sessions continue only through `cp.pre-account-project.v1` under `LEGACY_UNVERIFIED_V1`; downgrade, retagging, provenance mixing, and cross-key publication fail closed.
- Prove a fresh isolated checkout using the repository-pinned toolchain, frozen dependency installation, production build, startup, and assigned validation without relying on active-worktree caches.
- Correct only defects demonstrated by executable evidence, reproducible browser observation, inconsistent annotations, or direct contradiction of the source spec; strengthen focused proof and annotations only where a confirmed gap requires it.
- Review every task-assigned artifact and required canonical/derived browser state at `1536x1024`, `1440x900`, `1024x768`, and `390x844`, including keyboard, focus, responsive, error, fallback, retry, restoration, scene-fallback, and reduced-motion behavior.
Non_goals:
- S3 or later screens, prototypes, composition, controls, routes, project lenses, customization, pricing, accounts, authentication, contractors, offers, payments, or automatic S3 navigation.
- New product behavior, changed visual direction, speculative polish, broad behavior-preserving refactoring, generalized workflow infrastructure, architecture rewrite, performance-budget invention, or coverage-percentage chasing.
- New or replacement production dependencies, package-manager changes, live providers, provider SDKs, model calls, analytics, Neon/Postgres/Drizzle, Sentry, Clerk, Stripe, durable writes, credentials, hosted configuration, external-system access, or external cost.
- Research-only output, a closeout log, a new validation-set name, screenshot substitution, weakened proof, or deletion of useful focused tests in favor of only one broad test.
Acceptance_criteria:
- One named production-equivalent browser release contract starts in a fresh context at S1 and completes the real seeded UI path through client navigation, explicit confirmation, event-derived assembly, `MINIMUM_USABLE_READY`, and ready reload without test-only mutation of canonical state.
- The integrated contract proves exactly one project, correct property binding, stable scene/camera/surface/panel identities, ordered event IDs, monotonic cursor/version, accepted-object continuity, no in-session scene remount, and no duplicate or replacement object.
- After accepted progress, a deterministic SSE recovery boundary resumes bounded polling from the accepted cursor, preserves valid state, and proves exhaustion/retry or equivalent recovery completion without loss, duplication, false progress, or transport-owned readiness.
- Ready reload mounts a new runtime instance and restores the same accepted project, property, scene, camera, surface, panel, event, cursor, and version identities without replay, regeneration, durable write, external access, or S3 transition.
- Focused proof remains green for S1 help/loading/error/correction, confirmation gating, invalid storage/events, normal SSE, polling exhaustion/retry, confirmation/partial/ready restoration, scene fallback, keyboard/focus, responsive behavior, and reduced motion; no useful test, type, security check, validation, or error handling is weakened.
- Production browser observation confirms the existing approximately 20 to 30 second schedule while automated tests use the accelerated injected schedule and stable clock.
- Executable compatibility proof establishes canonical-v2-only new-session writes, isolated delivered-v1 restoration/continuation, and fail-closed rejection of downgrade, retagging, mixed provenance, or cross-key publication.
- A fresh isolated checkout completes exact-toolchain frozen installation, production build, startup, and assigned validation without reusing active-worktree dependencies, build output, browser state, or generated cache.
- Real-browser review at all four viewports covers every assigned visual reference plus canonical and derived states for composition, hierarchy, overflow, focus, keyboard operation, semantic announcements, scene/panel continuity, restoration, reduced motion, and absence of screenshot substitution.
- Normal, fallback, retry, restoration, and scene-fallback paths have no uncaught application or console error, unexpected same-origin HTTP failure, external application request, secret, false provider claim, duplicate project, false readiness, or later-state content.
- Every code, test, annotation, or documentation change is tied to reproducible evidence and stays within the approved S1-S2 contract; no production dependency or external system is added, configured, or accessed.
- Every assigned validation set, independent exact-head review, exact-head CI, tasks-only closeout, latest-head CI, guarded squash merge, hardened cleanup, merged-history proof, synchronized clean `main`, and post-proof scratchpad deletion passes through the live harness procedure.
Expected_surfaces:
- Existing integrated E2E and production-smoke infrastructure, browser helpers, focused unit/integration/component/security tests, and validation configuration.
- Current S1-S2 runtime, domain, projection, storage, seeded adapters, transport routes/adapters, UI, fixtures, and styling only where confirmed evidence requires correction.
- Relevant annotation headers, task scratchpad, task state, and narrowly required project documentation.
Reference_artifacts:
- references/states/s01-address-entry/visual-default.png
- references/states/s01-address-entry/visual-how-it-works-open.png
- references/states/s02-property-analysis/visual-property-confirmation.png
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
Scratchpad: .harness/work/T-0007.md

### [T-0008] Quarantine obsolete verification authority
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/obsolete-verification-authority
Traceability: F3, F7, F25a
Priority: P0
Depends_on: none
Status: passed
Ready: true
Pass: true
Objective:
- Remove obsolete verification and repository-policy authority so later hardening tasks execute against one canonical validation owner.
Scope:
- Remove the executable future bootstrap route and stale deleted paths from `$code-change-verification`, route exact review, closeout, merge, and cleanup mechanics to `.harness/validation.md`, and align repository policy on atomic archive closeout and conditional dedicated security review.
Non_goals:
- Implement the final closeout, remote-recovery, cleanup, or authoring-lane procedures owned by later H1 bricks.
Acceptance_criteria:
- `$code-change-verification` contains no executable future bootstrap branch and no unmapped live `docs/specs/...` path.
- `Bootstrap: true` and `bootstrap-preflight` remain only as labeled historical compatibility for T-0001.
- The verification skill delegates exact shared delivery mechanics to `.harness/validation.md` instead of restating a conflicting procedure.
- `docs/REPOSITORY_POLICY.md` no longer mandates a tasks-only closeout or universal dedicated security review.
- No product, runtime, queue, or completed-task block changes occur.
Indivisibility_rationale:
- The mandatory verification skill and repository policy are both live entrypoints to the same delivery trust rule; changing only one would preserve the blocking contradiction.
Expected_surfaces:
- `.agents/skills/code-change-verification/SKILL.md`.
- `docs/REPOSITORY_POLICY.md`.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0008.md

### [T-0009] Define forward contract identity and routing
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/forward-contract-routing
Traceability: F14, F15, F17, F25b, F25c
Priority: P0
Depends_on: none
Status: passed
Ready: true
Pass: true
Objective:
- Establish one deterministic forward schema for spec identity, ownership, lineage, filenames, artifacts, and terminal-state routing.
Scope:
- Define owner-scoped stable spec IDs, `Owning authority`, state/harness/repository inclusion tests, bounded lineage, exact repository-relative paths, owner-local filenames, canonical terminal-state routing, and the active `visual | technical | none` vocabulary.
Non_goals:
- Record legacy path mappings, change authoring workflow, migrate physical artifacts, or edit historical approved specs.
Acceptance_criteria:
- State outcomes route to the exact `sNN-state.md`, harness outcomes to `AGENTS.md`, and repository outcomes to `docs/REPOSITORY_POLICY.md` through the H1 inclusion test.
- The spec template exposes stable spec ID, `Owning authority`, `Amends`, `Supersedes`, and exact affected-state and dependency paths.
- Contract and state templates use exact repository-relative artifact paths and only `visual`, `technical`, or `none`.
- One owner-local filename rule maps deterministically to stable identity without making physical path the identity.
- `docs/contracts/README.md` is the sole full owner of terminal-state routing; other contract documents point to it without restating an independent rule.
- A concrete `sNN-state.md` is either an approved state contract or absent; unresolved template placeholders at an authority path are forbidden and block dependent work.
- Templates retain structure only and do not acquire authoring, approval, decomposition, or queue workflow.
Indivisibility_rationale:
- The routing index and its templates form one published schema; landing only one side would make valid authoring output contradict its canonical structure.
Expected_surfaces:
- `docs/contracts/README.md`.
- `docs/contracts/SPEC_TEMPLATE.md`.
- `docs/contracts/states/README.md`.
- `docs/contracts/states/STATE_TEMPLATE.md`.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0009.md

### [T-0010] Register legacy compatibility routes
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/legacy-compatibility-registry
Traceability: F13, F14, F18, F25g
Priority: P0
Depends_on: [T-0009]
Status: passed
Ready: true
Pass: true
Objective:
- Make every supported legacy spec and artifact path resolve unambiguously without reviving superseded workflow authority.
Scope:
- Add the four H1 Git-only path-to-spec-ID-to-historical-locator entries, all five artifact migration pairs with explicit `migration-pending` state, and the complete legacy non-authority rule to the canonical contract routing owner.
Non_goals:
- Rewrite Git-preserved historical content, edit completed-task blocks, delete legacy artifacts, or implement the structural validator.
Acceptance_criteria:
- All four retired implementation-spec paths referenced by T-0001 through T-0007 resolve to exact stable IDs, `current path: none`, and exact transition-base Git locators.
- Each of the five legacy artifact paths resolves to its exact canonical `docs/contracts/states/...` path and starts in a bounded `migration-pending` state that requires byte equality.
- Legacy task counts, decomposition, placement, deleted paths, and superseded authoring, delivery, validation, closeout, lifecycle, routing, and artifact mechanics are explicitly historical only.
- Completed outcomes, acceptance evidence, and still-valid compatibility obligations remain available without becoming current workflow authority.
- Git-preserved historical source blobs and all completed-task blocks remain byte-for-byte unchanged.
- A current author can distinguish a Git-only identity from a forward authoring route without scanning unrelated specs or loading deprecated bodies as examples.
Indivisibility_rationale:
- none; the canonical compatibility registry is one independently reviewable routing result in `docs/contracts/README.md`.
Expected_surfaces:
- `docs/contracts/README.md` legacy compatibility and migration sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0010.md

### [T-0011] Record completed-archive seed provenance
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/archive-seed-provenance
Traceability: F5, F25d
Priority: P0
Depends_on: none
Status: passed
Ready: true
Pass: true
Objective:
- Record truthful one-time provenance for the seven seeded historical task blocks without changing any block.
Scope:
- Add archive-header provenance for T-0001 through T-0007, the exact canonical hash boundary, and the distinction between historical seed compatibility and post-H1 completion proof.
Non_goals:
- Modify, reorder, condense, delete, or modernize any completed-task block or implement the archive validator.
Acceptance_criteria:
- The archive header states that T-0001 through T-0007 were seeded verbatim during the transition and did not originally execute the new archive-transfer procedure.
- The canonical hash algorithm is UTF-8 from the first T-0001 heading through the terminal newline with CRLF normalized to LF and no trimming.
- The block order remains `T-0001, T-0002, T-0003, T-0004, T-0006, T-0005, T-0007`.
- The canonical combined block SHA-256 remains `2B07112D32C5401991C2224A83E7C53BB36415842C599BAB900F17135F460C1F`.
- No byte inside any completed-task block changes.
Indivisibility_rationale:
- none; the archive header is the single owner of seed provenance outside the immutable blocks.
Expected_surfaces:
- `.harness/completed.md` header only.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0011.md

### [T-0012] Clarify top-level authority and evidence routing
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/top-level-authority-routing
Traceability: F16, F17, F19, F25c
Priority: P1
Depends_on: [T-0009]
Status: passed
Ready: true
Pass: true
Objective:
- Give fresh Codex sessions one coherent top-level distinction between normative targets, current implementation evidence, and routed contract authority.
Scope:
- Align `AGENTS.md` and `docs/README.md` on normative sources, code reality, test expectations, annotation summaries, durable-authority updates, canonical contract routing, and removal of the unsupported content-artifact route.
Non_goals:
- Rewrite global product, architecture, design, or MVP semantics; change implementation behavior; or duplicate the full contract-routing rules.
Acceptance_criteria:
- Normative user, durable authority, adopted artifact, approved spec, task-store, validation, and Git domains are explicit and non-overlapping.
- Code is current implementation reality; tests are executable expectations that may be stale or failing; annotation headers summarize inspected code and never overrule it.
- A code/test mismatch is reported as an implementation or proof defect rather than silently treated as durable truth.
- A resolved durable decision must be recorded in its owning authority before dependent spec drafting resumes.
- The active top-level artifact bundle uses only visual and technical references; `content` is absent as an artifact type.
- Both top-level entrypoints route terminal-state and spec classification to `docs/contracts/README.md` while retaining progressive context loading.
Indivisibility_rationale:
- `AGENTS.md` and `docs/README.md` are alternate entrypoints for a fresh session; changing only one would preserve two competing authority maps.
Expected_surfaces:
- `AGENTS.md` authority, context, Artifact Gate, and decision-boundary sections.
- `docs/README.md` ownership and routing sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0012.md

### [T-0013] Align global state and artifact ownership
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/global-state-artifact-ownership
Traceability: F12, F18
Priority: P1
Depends_on: [T-0012]
Status: passed
Ready: true
Pass: true
Objective:
- Remove the old all-in-one state-specification model from global product, architecture, and design authority.
Scope:
- Align the three global documents on durable state semantics, approved appearance, adopted technical depiction, collective implementation outcomes, shared accessibility, and explicit visual departures.
Non_goals:
- Define S01 or S02 state-contract content, change product behavior, alter visual files, or rewrite historical implementation specs.
Acceptance_criteria:
- No global document says `sNN-state.md` owns implementation, renderer choice, exact artifact assignment, task decomposition, or harness proof procedure.
- `docs/PRODUCT.md` retains shared product meaning, `docs/ARCHITECTURE.md` retains durable technical truth, and `docs/DESIGN.md` retains shared experience and accessibility rules.
- State contracts own durable state-specific semantics and authority without becoming implementation specifications.
- Exact visuals own appearance; technical artifacts own only a depiction explicitly adopted by governing authority or an approved spec.
- An approved implementation spec owns one collective outcome and any explicit compatible appearance departure.
- No durable product, architecture, or design invariant is removed or semantically changed.
Indivisibility_rationale:
- The live contradiction is created jointly by all three global authority sections; partial alignment would leave a material cross-document conflict that blocks authoring.
Expected_surfaces:
- `docs/PRODUCT.md` authority language.
- `docs/ARCHITECTURE.md` state, renderer, reference, and proof language.
- `docs/DESIGN.md` state, visual, technical, accessibility, and proof language.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0013.md
