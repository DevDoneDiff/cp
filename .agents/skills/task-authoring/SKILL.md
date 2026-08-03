---
name: task-authoring
description: Explicitly invoke to convert one approved spec into an ordered queue of coherent implementation tasks in .harness/tasks.md. Copy exact reference artifacts, preserve bootstrap rules, and never write code, start implementation, or approve the task set.
---

# Task Authoring

## Purpose

Convert one approved spec into bounded, ordered, independently verifiable tasks.

It does not write runtime code, create branches, mark tasks working, or self-approve readiness.

## Use

- invoke explicitly with `$task-authoring`
- process one approved source spec per run
- read only context relevant to that spec
- preserve existing queue state and monotonic tag counters

## Authority

Apply:

1. explicit user instruction
2. approved source spec, including its exact reference artifacts
3. `docs/PRODUCT.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DESIGN.md` when UI is affected
6. applicable decisions and approved prior specs
7. current code and tests when existing behavior constrains task boundaries
8. `.harness/validation.md`

When authorities conflict, stop and request resolution.

## Preconditions

Before writing tasks:

- source spec has `State: approved` and `Approved: true`
- spec `Open Questions` is `none`
- required product, architecture, and design sections are resolved
- every required reference artifact exists at the exact spec path
- validation set names exist
- active queue and tag counters are readable

Read-only inspection is allowed to determine task boundaries.

## Ambiguity Gate

Ask targeted questions before writing tasks when material ambiguity affects:

- task outcome or acceptance
- dependency order
- architecture, data, security, or compatibility
- artifact ownership or task allocation
- expected validation
- reasonable working-context size
- whether work changes behavior or preserves it

Do not convert assumptions into task authority.

## Task Boundaries

A task completes one coherent result, including tightly coupled code, schema, migration, tests, docs, references, and integration changes needed to prove it.

Split only for:

- independent acceptance
- dependency order
- materially different validation
- security or data-risk isolation
- major architectural boundaries
- working-context limits

Do not split by file, function, database row, endpoint field, or frontend/backend layer when those parts form one result. Do not combine unrelated outcomes merely because they share a spec.

## Tag Selection

- use `[T-####]` for feature, bug, migration, or maintenance work
- use `[R-####]` only when observable behavior remains unchanged
- if a task mixes behavior change and refactoring, use `[T-####]`
- read and increment the matching counter
- never reuse or renumber a tag

Exactly one task may use `Bootstrap: true`: `[T-0001]` sourced from `docs/specs/A-repository-foundation.md`.

## Queue Order

Place new tasks by:

1. dependencies
2. security and data integrity
3. foundational contracts
4. core user path
5. integrations and operations
6. visual polish and optimization

Assign:

- `P0` for safety, data integrity, or downstream blockers
- `P1` for foundation or core user value
- `P2` for non-blocking polish or optimization

Physical order in `Active Queue` is authoritative. Do not add an `Order` field.

## Reference Assignment

For each task:

- copy every exact artifact path the task must consume from the approved spec
- use `Reference_artifacts: - none` when none apply
- do not copy unrelated references from the same state folder
- keep technical artifacts paired with the prose authority that governs them
- block readiness when a required artifact is missing

## Validation Assignment

Every code task receives:

- `baseline`
- `agent-review`
- all applicable surface-specific sets from `.harness/validation.md`

Also assign:

- `bootstrap-preflight` to the one bootstrap task
- `security` and `security-review` for auth, permissions, secrets, trust, or sensitive data
- `frontend-visual` for visible UI changes
- `database` for schema, migration, persistence, or data-integrity work
- `smoke` when startup or critical service availability is affected

Do not invent validation names.

## Writing Tasks

For each task:

1. allocate the tag
2. link the source spec
3. set `Bootstrap`, type, priority, and dependencies
4. define one observable objective
5. define scope and non-goals
6. write testable acceptance criteria
7. list expected surfaces at module or system level
8. copy exact reference artifacts
9. assign validation sets
10. set `Status: queued`
11. set `Ready: false`
12. set `Pass: false`
13. set `Open_questions: none`
14. set the scratchpad path under `.harness/work/`

Expected surfaces are planning context, not a closed file allowlist.

## Approval and Readiness

Initial output remains `Ready: false`.

After explicit user approval of the task set, normal tasks may become `Ready: true` only when:

- task boundaries and order are approved
- material questions remain `none`
- source spec remains approved
- required artifacts exist
- required validation and delivery configuration exists

The one bootstrap task may become ready while commands are unset only when all bootstrap conditions in `.harness/tasks.md` and `.harness/validation.md` are satisfied.

Dependencies may remain incomplete. They affect eligibility, not readiness.

Do not set a task to `working`. Selection is governed by `AGENTS.md`.

## Existing Queue

- preserve unrelated queued or working tasks
- never modify the active working task unless explicitly resolving a discovered task-definition gap
- do not remove passed entries unless their tag exists on the configured base branch
- update counters to the next unused values
- record any dependency-driven reorder in affected task scope

## Output

Return:

- source spec
- tasks created or updated
- tag range used
- dependency order
- exact reference assignments
- validation assignments
- unresolved conflicts, or `none`
- `Readiness: awaiting_approval | ready | blocked`

## Final Rule

The spec defines the result and its artifact bundle. This skill creates executable building blocks without writing code or self-approval.
