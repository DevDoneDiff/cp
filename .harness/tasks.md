# Tasks

## Purpose

Canonical queue for approved active work.

Specs define collective implementation outcomes. Tasks are small, independently verifiable implementation bricks derived through `$task-authoring`.

## Control

- `RUN_MODE`: autonomous
- `MERGE_MODE`: autonomous
- `NEXT_TASK_TAG`: 0041
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

A post-H1 dependency is satisfied only by the canonical completion proof in `.harness/validation.md`: the same merged pull request and exact merge SHA must provide tagged configured-base history, introduce the task's archived block, omit it from the active store, and prove the remote task branch absent. A tag alone, archive entry alone, unmerged branch, provisional closeout, mismatched merge, or local history is insufficient.

The immutable T-0001 through T-0007 seed uses only the documented historical exception in `.harness/completed.md`. That exception cannot satisfy or redefine completion for a later task.

## Active States

- `queued`: approved, unblocked, and waiting for deterministic claim publication;
- `working`: the only task allowed to mutate its authorized source surfaces after its claim is published;
- `blocked`: stopped for recorded unresolved context, access, outage, claim conflict, or missing proof and unable to self-resume.

Candidate delivery retains the active task at `Status: working` and `Pass: false`. `Status: passed` and `Pass: true` exist only in the final task block transferred verbatim to `.harness/completed.md` through closeout. Until canonical merged-history proof succeeds, that archived state is provisional, never active eligibility or durable completion.

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

Delete only after canonical completion proof and the post-merge cleanup procedure succeed.

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

### [T-0040] Repair ordinary task-authoring validation
Type: bug
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/ordinary-task-authoring-transition-repair
Traceability: 3.5, 5.7, 7.2, 7.3
Priority: P0
Depends_on: none
Status: working
Ready: true
Pass: false
Objective:
- Make ordinary non-task task-authoring queue additions executable and safely proven by baseline validation.
Scope:
- Accept only exact append-only queued task creation with exact monotonic counter advancement while preserving every existing task and the completed archive.
- Validate dependency references as a unique, existing, ordered, acyclic graph across completed and active task identities.
- Derive assignable validation-set names from the canonical registry while retaining the historical bootstrap exclusion.
- Record the temporary immutability of completed-task source-spec paths until a validated migration mechanism exists.
Non_goals:
- Create or implement S3 tasks, migrate an implemented spec path, enforce spec owner or lineage metadata, or perform unrelated harness cleanup.
Acceptance_criteria:
- An unchanged completed archive may accompany only an active-queue tail append whose new tasks are queued, Pass-false, canonically tagged from the prior counter, and matched by the exact applicable counter advance.
- Existing active tasks, queue order, modes, the unrelated counter, and all non-counter prefix content remain byte-identical; replacement, removal, insertion, reordering, counter drift, or invalid appended state fails closed.
- Every dependency is unique, exists in the completed-plus-active identity set, precedes its dependent in canonical store order, and cannot form a self-reference or cycle.
- Forward task validation-set assignments are checked against exact unique registry rows parsed from .harness/validation.md rather than a duplicated hardcoded list.
- The historical bootstrap-preflight set remains unavailable to forward tasks even though it remains registered for T-0001 history.
- Durable contract wording makes an implemented spec path immutable while an archived task references it, pending an explicit validated migration mechanism.
- Focused harness fixtures cover valid and invalid authoring appends, dependency graphs, registry parsing, and the spec-path restriction, and the complete baseline passes.
Indivisibility_rationale:
- The append transition is the gate through which dependency and validation-set integrity are accepted; splitting would merge or use a newly executable authoring path before its closely related task-integrity inputs are hardened, leaving a knowingly incomplete authoring proof.
Expected_surfaces:
- scripts/validation/harness-task-transitions.mjs
- scripts/validation/harness-task-schema.mjs
- scripts/validation/harness-integrity.mjs
- tests/fixtures/harness-integrity/scenarios.ts
- tests/unit/harness-integrity.test.ts
- docs/contracts/README.md
- scripts/validation/harness-task-authoring-transition.mjs
- scripts/validation/harness-task-graph.mjs
- scripts/validation/harness-validation-registry.mjs
- tests/unit/validation-runner.test.ts
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0040.md
