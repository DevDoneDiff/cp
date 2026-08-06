# Tasks

## Purpose

Canonical queue for approved active work.

Specs define collective implementation outcomes. Tasks are small, independently verifiable implementation bricks derived through `$task-authoring`.

## Control

- `RUN_MODE`: autonomous
- `MERGE_MODE`: autonomous
- `NEXT_TASK_TAG`: 0040
- `NEXT_REFACTOR_TAG`: 0001

Only explicit user instruction may change `RUN_MODE` or `MERGE_MODE`.

## Task Stores

- `.harness/tasks.md` contains active `queued`, `working`, or `blocked` tasks only.
- `.harness/completed.md` contains immutable completed task entries.
- `.harness/work/<TAG>.md` contains ephemeral task-local rehydration state.

Normal task selection and implementation must not load archived task blocks from `.harness/completed.md` into context. The canonical claim procedure may return only the narrow archive identity and terminal-boundary evidence required to detect duplicate representation or provisional closeout.

## Queue Invariants

MUST:

- use `[T-####]` for feature, bug, migration, or maintenance work;
- use `[R-####]` only for behavior-preserving structural work;
- assign tags monotonically, keep each tag unique across both task stores, and never reuse one;
- keep `NEXT_TASK_TAG` and `NEXT_REFACTOR_TAG` greater than every assigned tag in their category and never decrease either counter;
- treat physical active-queue order as authoritative;
- allow exactly one `Status: working` task;
- keep every active task at `Pass: false`;
- give every forward-schema task both its approved spec's stable `Source_spec_id` and exact current repository-relative `Source_spec` path;
- give every forward-schema task a stable `Brick_id` formed as `<Source_spec_id>/<kebab-case-brick>` and unique across both task stores;
- record in `Traceability` the source specification finding or acceptance-area identifiers implemented by the task;
- record `Indivisibility_rationale` in the committed task block: explain any crossing of independently provable seams, or use `none; <reason>` for a single-seam task;
- copy exact required reference-artifact paths from the approved spec;
- create `.harness/work/<TAG>.md` when a task becomes working.

The immutable T-0001 through T-0007 archive seed predates the forward identity fields and is the only schema exception.

MUST NOT:

- implement a task with `Ready: false`;
- infer artifact authority from a folder;
- create research-only tasks in the coding queue;
- retain a completed task in the active queue after successful closeout;
- edit an archived completed task;
- use `Bootstrap: true` for a future task. Historical `[T-0001]` consumed that authority.

## Readiness and Eligibility

`Ready: true` means:

- the source spec is approved;
- material questions are resolved;
- the task is one bounded implementation brick;
- dependencies, scope, and task-local acceptance are clear;
- every required artifact exists and is assigned exactly;
- required validation and delivery configuration exists;
- no material blocker exists.

Dependencies need not be complete for readiness.

A task is eligible when:

- `Status: queued`;
- `Ready: true`;
- `Pass: false`;
- `Blocker: none`;
- all dependencies are satisfied.

`Status: blocked` is never eligible. A changed external condition does not resume a task; the same-task resumption procedure in `.harness/validation.md` must prove and explicitly transition its claim state.

A dependency is satisfied when its tag exists in configured base-branch history.

Check base-branch history rather than an unmerged task branch or the completed archive alone.

## Active States

- `queued`: approved, unblocked, and waiting for deterministic claim publication;
- `working`: the only task allowed to mutate its authorized source surfaces after its claim is published;
- `blocked`: stopped for recorded unresolved context, access, outage, claim conflict, or missing proof and unable to self-resume.

`Status: passed` and `Pass: true` exist only in the final task block transferred verbatim to `.harness/completed.md` through the closeout procedure in `.harness/validation.md`.

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

Update after material discoveries, failures, changed hypotheses, review findings, push failures, and CI failures.

Read prior failed approaches before debugging. Do not repeat one without new evidence.

Delete only after the task tag exists in configured base-branch history.

## Task Template

```text
### [T-0001] <title>
Type: feature | bug | migration | maintenance | refactor
Bootstrap: false
Source_spec_id: <stable-owner-scoped-spec-id>
Source_spec: <exact-approved-spec-path>
Brick_id: <Source_spec_id>/<kebab-case-brick>
Traceability: <comma-separated-finding-or-acceptance-area-identifiers>
Priority: P0 | P1 | P2
Depends_on: none | [T-####], [R-####]
Status: queued | working | blocked
Ready: false | true
Pass: false
Objective:
- <one primary observable result>
Scope:
- <task-local included behavior and surfaces>
Non_goals:
- <explicit local exclusions>
Acceptance_criteria:
- <task-local observable pass condition>
Indivisibility_rationale:
- none; <why this is one independently provable seam> | <why crossing independently provable seams is required>
Expected_surfaces:
- <modules, data, APIs, UI areas, docs, or configuration>
Reference_artifacts:
- none | <exact repository-relative path>
Validation_sets:
- baseline
- agent-review
- <applicable registered set>
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0001.md
```

For refactors, use `[R-0001]`, `Type: refactor`, `Bootstrap: false`, and state the preserved behavioral contract in `Acceptance_criteria`.

## Active Queue

### [T-0024] Make task authoring identity-aware and idempotent
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/task-authoring-identity
Traceability: F13, F14, F15, F17
Priority: P0
Depends_on: [T-0023]
Status: queued
Ready: true
Pass: false
Objective:
- Make `$task-authoring` emit the stable active-task schema and refuse to recreate represented implementation bricks.
Scope:
- Consume canonical owning-authority routing, dual spec references, stable brick IDs, the legacy registry, active artifact vocabulary, and targeted active/archive identity evidence without loading the full archive into ordinary context.
Non_goals:
- Change task-size judgment, execute tasks, mutate completed blocks, or define lifecycle delivery procedures.
Acceptance_criteria:
- Every new task records `Source_spec_id`, canonical `Source_spec`, and a unique source-scoped `Brick_id`.
- Owner and path routing comes from the canonical contract schema and primary-outcome inclusion test.
- Git-only legacy specs are matched by stable ID and cannot impose superseded workflow or decomposition mechanics.
- A narrow validator or lookup returns only relevant active and historical identity evidence without loading deprecated spec bodies as examples.
- A rerun or partial prior decomposition refuses a duplicate brick ID and preserves unrelated queue entries and counters.
- Task authoring accepts only exact `visual`, `technical`, or `none` artifact routes; `content` is absent from its active vocabulary.
- Exact repository-relative global paths and only registered validation-set names are used.
Indivisibility_rationale:
- none; the task-authoring skill is the single producer being corrected after its schema and validator already exist.
Expected_surfaces:
- `.agents/skills/task-authoring/SKILL.md` authority, preconditions, identity lookup, writing, and output rules.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0024.md

### [T-0025] Make task sizing deterministic
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/task-sizing-determinism
Traceability: F21
Priority: P1
Depends_on: [T-0015], [T-0024]
Status: queued
Ready: true
Pass: false
Objective:
- Close the remaining task-size loophole so independently provable work cannot be called nonfunctional merely because it lacks complete customer value.
Scope:
- Refine split and combine rules around invalid or misleading intermediate states, proof, failure, rollback, recovery, migration, compatibility, and committed indivisibility rationale.
Non_goals:
- Add time, file-count, line-count, or estimated-effort limits or predesign implementation mechanics.
Acceptance_criteria:
- Lack of standalone customer value is explicitly insufficient to justify combining tasks.
- Separation fails only when it leaves the repository invalid, misleading, knowingly false, independently unprovable, or dependent on disposable architecture.
- Independent proof, failure, rollback, recovery, migration, and compatibility seams require splitting by default.
- A cross-seam exception records a concise rationale in the committed task block against the combine-only test.
- Shared specs, screens, files, eventual outcomes, or delivery convenience never justify combination by themselves.
- Task-local acceptance remains concise and does not reproduce most of the source spec.
Indivisibility_rationale:
- none; task sizing is one specialized judgment boundary in `$task-authoring` and can be reviewed independently of identity lookup.
Expected_surfaces:
- `.agents/skills/task-authoring/SKILL.md` task-size, split, combine, and content-discipline sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0025.md

### [T-0026] Align spec-authoring identity and routing
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/spec-authoring-identity-routing
Traceability: F13, F14, F15, F17
Priority: P1
Depends_on: [T-0010], [T-0014]
Status: queued
Ready: true
Pass: false
Objective:
- Make `$spec-authoring` consume the forward ownership, identity, lineage, legacy, and artifact-routing schema.
Scope:
- Align primary-outcome routing, stable identity, bounded lineage, current forward-spec routing versus Git-only legacy lookup, active artifact vocabulary, and exact paths while preserving discovery-first drafting.
Non_goals:
- Change durable-decision or mechanism-lock boundaries, add approval recording, decompose tasks, or define delivery mechanics.
Acceptance_criteria:
- The skill uses `Owning authority`, stable spec ID, bounded lineage, and the canonical primary-outcome routing test.
- Deprecated Git-only identities remain discoverable for exact historical lookup but are never loaded as templates or forward authoring examples.
- Git-preserved legacy outcome and acceptance evidence cannot impose superseded workflow or decomposition mechanics.
- `content` is absent from artifact discovery and schema, leaving only visual, technical, or none with exact repository-relative paths.
- Discovery remains bounded and task decomposition remains prohibited.
Indivisibility_rationale:
- none; the spec-authoring skill is the single consumer of the published forward identity and routing schema.
Expected_surfaces:
- `.agents/skills/spec-authoring/SKILL.md` authority, routing, identity, lineage, discovery, and artifact sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0026.md

### [T-0027] Guard durable authority and implementation latitude
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/spec-authoring-authority-boundary
Traceability: F16, F22
Priority: P1
Depends_on: [T-0012], [T-0014], [T-0026]
Status: queued
Ready: true
Pass: false
Objective:
- Prevent `$spec-authoring` from duplicating durable truth or manufacturing implementation authority from its own acceptance text.
Scope:
- Add the durable-authority update stop, independent mechanism-lock basis, circular-authority rejection, and routine implementation-latitude rules.
Non_goals:
- Change owner routing, add approval recording, decompose tasks, or define delivery mechanics.
Acceptance_criteria:
- A resolved durable product, architecture, design, state, security, schema, or compatibility decision is recorded in its owner before dependent drafting resumes.
- Missing authority-update permission or an unresolved durable decision blocks drafting rather than being inferred into the spec.
- A mechanism is locked only by independent durable, safety, security, data, compatibility, public-contract, or unavoidable observable authority.
- Acceptance text authored in the same spec cannot bootstrap its preferred mechanism into authority.
- Routine algorithms, data structures, rendering, module boundaries, framework techniques, recovery, and sequencing remain with Codex unless independently constrained.
- Task decomposition and approval recording remain outside this brick.
Indivisibility_rationale:
- none; durable-authority updates and mechanism self-authorization form one independently reviewable trust boundary in spec drafting.
Expected_surfaces:
- `.agents/skills/spec-authoring/SKILL.md` decision-boundary, authority-update, acceptance, and implementation-latitude sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0027.md

### [T-0028] Make large-file review responsibility-based
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/responsibility-based-file-review
Traceability: F23
Priority: P1
Depends_on: [T-0012]
Status: queued
Ready: true
Pass: false
Objective:
- Make file-size thresholds trigger responsibility analysis and review escalation without forcing harmful fragmentation.
Scope:
- Correct the 250- and 350-nonblank-line rules in the owning engineering guidance and reconcile validation wording only if required.
Non_goals:
- Split existing runtime files, set arbitrary hard size limits, or weaken responsibility and cohesion review.
Acceptance_criteria:
- More than 250 nonblank lines triggers documented primary-responsibility and reason-to-change evaluation.
- More than 350 nonblank lines triggers explicit independent review escalation.
- A cohesive hand-authored imperative file may remain large when an accepted analysis shows splitting would reduce cohesion or proof quality.
- Declarative or generated content is supporting evidence rather than a prerequisite for an exception.
- Review checks mixed layers, independent change reasons, dependency direction, and proof boundaries rather than line count alone.
- No rule encourages meaningless fragmentation or unrelated responsibility accumulation.
Indivisibility_rationale:
- none; the current validation wording already accepts a cohesion rationale, so the owning `AGENTS.md` rule can be corrected independently unless live inspection proves reconciliation is necessary.
Expected_surfaces:
- `AGENTS.md` engineering and file-responsibility rules.
- `.harness/validation.md` independent-review wording only if needed for exact agreement.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0028.md

### [T-0029] Bind independent review to exact content
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/exact-sha-review-evidence
Traceability: F7, F8, F9, F24
Priority: P0
Depends_on: [T-0008], [T-0017], [T-0028]
Status: queued
Ready: true
Pass: false
Objective:
- Make independent review durable, read-only, exact-SHA bound, and consistent with conditional dedicated security review.
Scope:
- Align review set selection, reviewer independence, durable PR evidence, candidate-content SHA binding, content-change invalidation, and metadata-only closeout inheritance across policy and procedure.
Non_goals:
- Implement the closeout transfer, merge freshness, frontend-specific review workflow, or human approval requirements.
Acceptance_criteria:
- `agent-review` is universal and includes correctness, acceptance, architecture, data, file responsibility, regression, and security implications.
- Dedicated `security-review` is required only for security-sensitive scope and uses the canonical registered name.
- Durable PR evidence records reviewer identity or run ID, independent role, review type, exact candidate-content SHA, result, and findings or `none`.
- Any applicable content change invalidates prior review and requires fresh review of the new candidate SHA.
- Closeout inherits content review only when executable proof shows the authorized two-store metadata-only delta; latest-head CI binds separately to closeout SHA.
- Every independent reviewer is read-only and only the primary agent repairs findings and reruns proof.
Indivisibility_rationale:
- Repository policy and the canonical validation procedure must define the same review trust contract; changing only one would recreate the existing contradiction.
Expected_surfaces:
- `.harness/validation.md` proof model, set selection, registry, and independent-review gate.
- `docs/REPOSITORY_POLICY.md` high-level review and evidence policy.
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
Scratchpad: .harness/work/T-0029.md

### [T-0030] Canonicalize provisional closeout and completion
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/provisional-closeout-completion
Traceability: F3, F5, F9, F25d
Priority: P0
Depends_on: [T-0011], [T-0016], [T-0017], [T-0029]
Status: queued
Ready: true
Pass: false
Objective:
- Establish one atomic active-to-archive closeout and one canonical durable completion and dependency proof.
Scope:
- Align candidate state, two-store provisional transfer, manual waiting and withdrawal, reversal, post-migration completion, dependency satisfaction, and historical seed compatibility across their exact owners.
Non_goals:
- Implement stale-base refresh, ambiguous remote recovery, post-merge cleanup, or the non-task authoring lane.
Acceptance_criteria:
- Candidate delivery keeps the active task `Status: working` and `Pass: false`.
- Closeout changes only `.harness/tasks.md` and `.harness/completed.md`, appends the final passed block verbatim, and removes the same active block atomically.
- Unmerged `Status: passed` and `Pass: true` are explicitly provisional and never advance the queue.
- Manual mode preserves the claim while awaiting guarded merge; durable PR evidence records read-only cases for explicit pre-merge withdrawal, exact reversal, and failed closeout.
- Post-H1 completion and dependency satisfaction require the same tagged merged PR, exact merge SHA, archive introduction, active absence, and remote-branch proof.
- T-0001 through T-0007 use only the documented seed exception and are not represented as having executed the new procedure.
- Reversal restores only the affected task with `Pass: false`, removes only its provisional archive entry, and preserves every other block byte-for-byte.
Indivisibility_rationale:
- Active removal, archive addition, provisional semantics, reversal, and completion/dependency meaning are one atomic state model; splitting them would make the two stores or dependency predicate disagree.
Expected_surfaces:
- `AGENTS.md` high-level completion semantics.
- `.harness/tasks.md` candidate, completion, and dependency rules.
- `.harness/completed.md` header only.
- `.harness/validation.md` closeout, manual-mode, proof, and reversal procedure.
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
Scratchpad: .harness/work/T-0030.md

### [T-0031] Harden exact-base and exact-head delivery
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/exact-base-head-delivery
Traceability: F5, F6, F8, F9
Priority: P0
Depends_on: [T-0029], [T-0030]
Status: queued
Ready: true
Pass: false
Objective:
- Prevent manual or autonomous merge from using a stale base, wrong pull-request head, wrong checks, or bypassed identity.
Scope:
- Define exact-head check acceptance, immediate pre-merge base refresh, non-force redelivery on base advance, guarded manual and autonomous merge, and exact merged-identity readback.
Non_goals:
- Resolve ambiguous remote command outcomes or perform post-merge local cleanup.
Acceptance_criteria:
- Required checks are accepted only for the exact current PR head and exact configured check names.
- The configured base is fetched immediately before merge and the PR is proven current with that exact base.
- A base advance requires a non-force branch update and complete validation, review, closeout, push, and exact-head CI redelivery.
- Manual and autonomous merge use the exact closeout head, exact base, task-tagged subject, squash mode, and no administrator bypass.
- Merge readback proves the merged PR, exact merge SHA, tagged subject, archive introduction, and synchronized base history.
- Durable PR evidence records read-only base-advance and completed-merge procedure cases; stale head, stale base, missing checks, wrong identity, or bypass attempts block merge and queue advancement.
Indivisibility_rationale:
- High-level repository guardrails and their canonical procedure must land together so policy cannot claim freshness or exact-head safety that execution does not enforce.
Expected_surfaces:
- `.harness/validation.md` CI, base-refresh, merge, and completion-readback procedure.
- `docs/REPOSITORY_POLICY.md` high-level exact-base and exact-head policy.
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
Scratchpad: .harness/work/T-0031.md

### [T-0032] Reconcile ambiguous remote outcomes safely
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/ambiguous-remote-recovery
Traceability: F6
Priority: P0
Depends_on: [T-0031]
Status: queued
Ready: true
Pass: false
Objective:
- Make every interrupted or uncertain remote operation reconcile actual remote state before retry, reversal, or cleanup.
Scope:
- Cover PR create or update, review-evidence write, push and branch mutation, CI or status query, and merge outcomes with readback-driven continuation, retry, reversal, or stop behavior.
Non_goals:
- Change credentials, add hosted coordination, weaken guarded merge, or reinterpret an unresolved result optimistically.
Acceptance_criteria:
- A failed, timed-out, or interrupted remote operation always triggers operation-specific readback before another mutation.
- Proven application continues from the actual remote state without duplicating the operation.
- Proven non-application permits a safe bounded retry or provisional reversal as appropriate.
- Unresolved or contradictory readback stops mutation with the local branch, provisional state, and evidence intact.
- A merge that succeeded despite a client error is never reversed after remote proof.
- Durable PR evidence records read-only cases for proven application, proven non-application, and unavailable or contradictory readback; any reversal preserves unrelated blocks byte-for-byte.
Indivisibility_rationale:
- none; ambiguous-result interpretation is one independent remote failure boundary in `.harness/validation.md`.
Expected_surfaces:
- `.harness/validation.md` remote failure and readback procedures.
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
Scratchpad: .harness/work/T-0032.md

### [T-0033] Move lesson disposition before closeout
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/precloseout-lesson-disposition
Traceability: F25f
Priority: P1
Depends_on: [T-0030]
Status: queued
Ready: true
Pass: false
Objective:
- Ensure reusable implementation evidence is promoted or explicitly dismissed before closeout forbids ordinary source changes.
Scope:
- Add the exact pre-closeout lesson-disposition checkpoint and scratchpad evidence location to the canonical validation procedure.
Non_goals:
- Change lesson qualification rules, create completed-task summaries, or retain scratchpads after cleanup.
Acceptance_criteria:
- Before provisional closeout, the primary task agent evaluates `.harness/LESSONS.md` promotion criteria.
- Qualifying evidence is promoted while ordinary task changes are still permitted.
- When nothing qualifies, the task scratchpad records `none` for lesson disposition.
- Closeout cannot begin until one of those two outcomes is recorded.
- Post-merge scratchpad deletion cannot be the first or only lesson-disposition step.
Indivisibility_rationale:
- none; the canonical timing checkpoint and scratchpad evidence location are one narrow procedure change.
Expected_surfaces:
- `.harness/validation.md` pre-closeout sequence.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0033.md

### [T-0034] Make post-merge cleanup retry-safe
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/retry-safe-cleanup
Traceability: F6, F25e
Priority: P0
Depends_on: [T-0031], [T-0032], [T-0033]
Status: queued
Ready: true
Pass: false
Objective:
- Make cleanup idempotent and prevent a local cleanup failure from undoing durable task completion.
Scope:
- Define already-absent branch success, exact merged-identity gates, ordinary and exceptional local deletion, post-merge failure evidence, scratchpad preservation, queue blocking, and cleanup-only retry.
Non_goals:
- Reverse a durably merged task, edit the archive after merge, force-push, or add a distributed cleanup service.
Acceptance_criteria:
- Already-absent remote or local task branches are accepted only after exact merged task and branch identity proof.
- Ordinary local branch deletion is attempted before the narrow squash-ancestry force-deletion exception.
- After durable merge, cleanup failure never reverses `Pass`, reactivates the task, or edits any completed block.
- A failed cleanup preserves the exact local task branch and scratchpad, records durable PR and local evidence, and stops queue advancement.
- Retry executes only the incomplete cleanup proof and does not rerun or reopen implementation closeout.
- Durable PR evidence records a read-only cleanup-failure and retry case; scratchpad deletion occurs only after base synchronization, branch absence, archive proof, and complete cleanup success.
Indivisibility_rationale:
- none; post-merge cleanup has its own failure and retry boundary after durable completion.
Expected_surfaces:
- `.harness/validation.md` post-merge cleanup and failure behavior.
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
Scratchpad: .harness/work/T-0034.md

### [T-0035] Define non-task authoring identity and exclusion
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/non-task-authoring-identity
Traceability: F2, F11
Priority: P0
Depends_on: [T-0016], [T-0026]
Status: queued
Ready: true
Pass: false
Objective:
- Define a truthful authoring-only identity and mutual-exclusion state without manufacturing implementation completion.
Scope:
- Establish eligible authoring surfaces, explicit user authority, non-task branch/commit/PR identity, forbidden implementation signals, task-claim exclusion, and an unavailable-until-wired state.
Non_goals:
- Activate the delivery lane, duplicate canonical review or merge procedures, record spec approval, or route authoring skills through an incomplete lane.
Acceptance_criteria:
- The identity covers specs, approval metadata, contract updates, task decomposition, and directly related authority or queue changes only.
- Branch, commit, and PR identities are descriptive and contain no implementation task tag.
- The identity uses no task modes, `Pass`, implementation scratchpad, task closeout, archive transfer, dependency proof, or task-completion history.
- Explicit user instruction controls authoring delivery and autonomous guarded merge authority independently of task modes.
- Queue, counter, validation, or execution-authority authoring is mutually exclusive with a live implementation claim, provisional closeout, task branch, or live task PR.
- Introducing a queued task cannot satisfy that task's dependency or completion proof, and completed-task blocks cannot change.
- The lane remains explicitly unavailable until the canonical delivery wiring task passes.
Indivisibility_rationale:
- Authoring identity, forbidden completion signals, and claim exclusion are one state classification; separating them would create an identity that could collide with implementation work.
Expected_surfaces:
- `AGENTS.md` high-level authoring identity and task-claim exclusion.
- `.harness/validation.md` lane identity, preconditions, and unavailable state.
- `docs/REPOSITORY_POLICY.md` high-level authoring authority boundary.
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
Scratchpad: .harness/work/T-0035.md

### [T-0036] Activate non-task authoring delivery
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/non-task-authoring-delivery
Traceability: F2, F8, F11
Priority: P0
Depends_on: [T-0024], [T-0027], [T-0029], [T-0031], [T-0032], [T-0034], [T-0035]
Status: queued
Ready: true
Pass: false
Objective:
- Activate end-to-end authoring delivery by reusing the canonical proof, review, CI, merge, recovery, and cleanup procedures.
Scope:
- Wire scoped validation, exact-SHA read-only review, exact-head CI, guarded merge, ambiguous-result readback, clean synchronization, and spec- and task-authoring routing to the established non-task identity.
Non_goals:
- Create a second delivery algorithm, use implementation completion identity, record approval without evidence, or mutate completed-task blocks.
Acceptance_criteria:
- The lane reuses canonical local proof, exact-SHA review, exact-head CI, base refresh, guarded merge, remote readback, and clean synchronization without restating divergent procedures.
- Authoring delivery uses no `Pass`, implementation scratchpad, task closeout, archive transfer, dependency proof, or task-completion history.
- Spec and task authoring output routes to the lane only after every activation precondition is satisfied.
- The task-authoring route cannot start, pass, or complete any task it introduces.
- Durable PR evidence records a read-only authoring/task exclusion case and proves completed-task blocks are unchanged.
- A failed or ambiguous authoring delivery preserves its branch and evidence and follows the same readback and retry boundaries as canonical delivery.
Indivisibility_rationale:
- T-0035 leaves the lane truthfully unavailable; this brick atomically activates the reusable end-to-end procedure and its producer routing so no skill advertises a partial delivery path.
Expected_surfaces:
- `.harness/validation.md` non-task authoring delivery procedure.
- `AGENTS.md` operational routing consequence.
- `docs/REPOSITORY_POLICY.md` guarded authoring delivery consequence.
- `.agents/skills/spec-authoring/SKILL.md` and `.agents/skills/task-authoring/SKILL.md` output delivery routing.
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
Scratchpad: .harness/work/T-0036.md

### [T-0037] Add status-only approval recording
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/status-only-approval-recording
Traceability: F1
Priority: P0
Depends_on: [T-0027], [T-0036]
Status: queued
Ready: true
Pass: false
Objective:
- Allow `$spec-authoring` to record a later explicit user approval without self-approving or silently revising reviewed content.
Scope:
- Add the approval-evidence precondition, metadata-only transition, content-diff guard, reporting, and non-task delivery route to the spec-authoring workflow.
Non_goals:
- Let drafting approve itself, infer approval, revise approved content, or use implementation-task completion identity.
Acceptance_criteria:
- Drafting always ends at `State: draft` and `Approved: false` unless a later explicit user approval exists.
- A status-only recording run names the explicit approval evidence and changes approval metadata only.
- Any content change requires separate explicit revision authority and cannot be hidden inside approval recording.
- Executable or reviewed diff evidence rejects a purported status-only transition that changes non-metadata content.
- The transition is delivered through the non-task authoring lane and creates no task Pass, closeout, dependency, or completion evidence.
- Approved specs remain closed to amendment unless explicitly reopened or changed through bounded lineage.
Indivisibility_rationale:
- none; approval recording is one trust-boundary workflow in the spec-authoring skill after its safe delivery lane exists.
Expected_surfaces:
- `.agents/skills/spec-authoring/SKILL.md` status, workflow, and output sections.
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
Scratchpad: .harness/work/T-0037.md

### [T-0038] Make frontend review read-only and registry-driven
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/frontend-review-semantics
Traceability: F24
Priority: P1
Depends_on: [T-0029]
Status: queued
Ready: true
Pass: false
Objective:
- Align frontend review with read-only reviewer independence, primary-agent repair, and registered validation names.
Scope:
- Separate Build, Restyle, read-only Review, and primary-agent Repair behavior and remove unregistered validation vocabulary.
Non_goals:
- Change product UI, alter artifact authority, run visual implementation, add `frontend-unit`, or modify the canonical validation registry.
Acceptance_criteria:
- Read-only Review reports evidence and blocking findings without modifying the worktree.
- Only the authorized primary task agent enters Repair, applies corrections, reruns focused proof, and requests fresh review.
- `frontend-unit` is absent and the skill names only validation sets registered by `.harness/validation.md`.
- Browser access remains required only for assigned frontend visual proof; documentation-only skill changes require no product browser run.
- Review evidence follows the canonical exact-SHA and independence contract rather than defining a second one.
Indivisibility_rationale:
- none; reviewer mutation and validation vocabulary are one specialized frontend-review workflow correction.
Expected_surfaces:
- `.agents/skills/frontend-design/SKILL.md` modes, review loop, validation, and completion output.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0038.md

### [T-0039] Align frontend artifact authority
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/frontend-artifact-authority
Traceability: F18
Priority: P1
Depends_on: [T-0014]
Status: queued
Ready: true
Pass: false
Objective:
- Make the frontend skill consume the canonical non-overlapping state, visual, technical, and implementation-spec authority model.
Scope:
- Align exact visual authority, state-specific behavior and accessibility, shared product and design truth, adopted technical depictions, and explicit compatible appearance departures.
Non_goals:
- Change product UI, alter any artifact, perform visual review, or define new contract-routing rules.
Acceptance_criteria:
- Exact `visual-*.png` artifacts own approved appearance and do not independently own behavior, accessibility, truthful content, or product authority.
- `docs/PRODUCT.md` owns shared product meaning and truth, and `docs/DESIGN.md` owns shared experience and accessibility rules.
- The exact `sNN-state.md` owns durable state-specific behavior, semantic content meaning, accessibility, and authority.
- A `technical-*.png` owns only a process depiction explicitly adopted by authoritative prose and otherwise remains guidance.
- An approved implementation spec may own an explicit appearance departure only for its collective outcome and only when compatible with governing authorities.
- The skill routes schema questions to `docs/contracts/README.md` without restating an independent artifact taxonomy.
Indivisibility_rationale:
- none; this task changes only the frontend skill's consumption of one already-approved authority model.
Expected_surfaces:
- `.agents/skills/frontend-design/SKILL.md` authority and reference-artifact sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0039.md
