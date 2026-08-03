# Tasks

## Purpose

Canonical queue for approved active work. Specs define outcomes. Tasks are coherent, independently verifiable implementation units.

## Control

- `RUN_MODE`: manual
- `MERGE_MODE`: manual
- `NEXT_TASK_TAG`: 0001
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

- the task set was explicitly approved
- the source spec is approved
- material questions are resolved
- scope and acceptance are explicit
- every required reference artifact exists and is approved
- required validation and delivery configuration exists

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
Ready: false
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

No tasks yet.
