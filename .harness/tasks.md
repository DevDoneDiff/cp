# Implementation Tasks

## Purpose

Canonical queue for approved product and code implementation work.

Harness construction, repair, simplification, repository-governance machinery maintenance, and one-off validation work do not enter this queue. They run only through an explicitly invoked `$harness-maintenance` procedure and consume no task identity. Non-runtime repository policy and documentation authoring also consumes no task identity and follows the lightweight authority path in `.harness/validation.md`.

## Control

- `RUN_MODE`: autonomous
- `MERGE_MODE`: autonomous
- `NEXT_TASK_TAG`: 0008
- `NEXT_REFACTOR_TAG`: 0001

Only explicit user instruction may change `RUN_MODE` or `MERGE_MODE`.

## Stores

- `.harness/tasks.md` contains active `queued`, `working`, or `blocked` implementation tasks in execution order.
- `.harness/completed.md` contains completed implementation tasks.
- `.harness/work/<TAG>.md` is ignored, task-local rehydration state for a working implementation task.

Tags are unique and monotonic across both stores. Exactly one task may be `working`; every active task keeps `Pass: false`.

## Readiness and Eligibility

`Ready: true` means the product spec is approved, material questions are resolved, scope and acceptance are bounded, required references exist, assigned validation sets are registered, and no blocker remains.

A task is eligible when:

- `Status: queued`;
- `Ready: true`;
- `Pass: false`;
- `Blocker: none`;
- `Open_questions: none`;
- every dependency is complete.

`Status: blocked` is never eligible. A working task may resume only after the original claim still resolves uniquely and its blocker has cleared.

## Scratchpad

Create `.harness/work/<TAG>.md` when a task becomes working. Keep only information useful for resumption:

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

Delete it after confirmed merge and cleanup. Scratchpads are never product authority or completion evidence.

## Task Template

Field order is for readability, not identity. Validators enforce field meaning and required content rather than exact Markdown bytes.

```text
### [T-####] <title>
Type: feature | bug | migration | maintenance | refactor
Source_spec: <approved product-spec path>
Priority: P0 | P1 | P2
Depends_on: none | [T-####], [R-####]
Status: queued | working | blocked
Ready: false | true
Pass: false
Objective:
- <one primary observable result>
Scope:
- <included behavior and surfaces>
Non_goals:
- <explicit exclusions>
Acceptance_criteria:
- <observable task-local completion condition>
Expected_surfaces:
- <modules, data, APIs, UI, tests, docs, or configuration>
Reference_artifacts:
- none | <exact assigned repository-relative path>
Validation_sets:
- baseline
- <other applicable registered set>
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-####.md
```

Use `[R-####]` only for behavior-preserving structural implementation. Product/code maintenance may use a task; harness or repository-governance machinery maintenance may not.

## Active Queue
