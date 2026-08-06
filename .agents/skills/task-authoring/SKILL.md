---
name: task-authoring
description: Explicitly invoke to decompose one approved spec into the smallest truthful, independently verifiable implementation tasks in `.harness/tasks.md`. Inspect current implementation seams, assign exact references and validation, preserve the immutable completed archive, and never write code or start implementation.
---

# Task Authoring

## Purpose

Convert one approved spec into an ordered queue of small, focused, independently verifiable implementation tasks.

The approved spec is the brickhouse. Tasks are the individual bricks required to complete it.

This skill owns task decomposition, task sizing, task order, task tags, dependencies, readiness, and active-queue mutation. It does not write runtime code, create branches, mark a task working, or execute validation.

## Use

- invoke explicitly with `$task-authoring`;
- process one approved source spec per run;
- inspect only context relevant to decomposing that spec;
- preserve existing active work, queue order, and monotonic tag counters;
- never edit an existing entry in `.harness/completed.md`.

## Authority

Apply:

1. explicit user instruction;
2. the approved source spec;
3. `docs/contracts/README.md` for primary-outcome classification, canonical owner and path routing, stable identity, legacy compatibility, and artifact vocabulary;
4. its owning contract and every affected state contract;
5. its exact `visual` or `technical` artifacts, or `none`;
6. applicable sections of `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/MVP.md`, and `docs/REPOSITORY_POLICY.md`;
7. approved dependencies and relevant prior spec identities;
8. current annotation headers, code, tests, and repository structure;
9. `.harness/tasks.md` for the forward task schema, active queue, and counters;
10. `.harness/validation.md` for registered proof sets and delivery requirements.

A task may narrow the source spec to one implementation brick. It may not expand or contradict the approved collective outcome.

When authorities conflict, report the exact conflict and stop task creation.

## Preconditions

Before writing tasks:

- the source spec has `State: approved` and `Approved: true`;
- `Open Questions` is `none`;
- its `Spec ID`, owner type, `Owning authority`, canonical path, and affected-state routing agree with `docs/contracts/README.md`;
- the owning contract and affected contracts exist;
- every required reference artifact exists at the exact path;
- required validation set names exist;
- the active queue and tag counters are readable;
- every proposed brick has passed the targeted active/archive identity lookup below;
- no existing working task would be modified or displaced.

Read-only inspection is allowed to determine real implementation seams.

## Routing and Identity Gate

Classify the spec from its primary accepted outcome before decomposition:

- customer-visible state behavior routes to that state contract and its canonical state-spec directory;
- Codex authoring, queue, validation, review, delivery, or lifecycle behavior routes to `AGENTS.md` and `docs/contracts/harness/specs/`;
- repository or hosting behavior that remains independently meaningful routes to `docs/REPOSITORY_POLICY.md` and `docs/contracts/repository/specs/`.

A supporting change follows the outcome it enables. If two outcomes remain independently acceptable, stop and decompose separate specs rather than choosing from old file placement.

For every proposed task:

- copy the approved spec's stable `Spec ID` verbatim into `Source_spec_id`;
- copy its exact current canonical repository-relative path into `Source_spec`;
- form `Brick_id` as `<Source_spec_id>/<kebab-case-brick>` from the brick's durable result, independent of tag, task title, order, or current spec path;
- retain the same candidate `Brick_id` across reruns and partial decomposition.

Before allocating a tag, run an exact fixed-string lookup for each candidate identity across `.harness/tasks.md` and `.harness/completed.md`, returning only matching `Brick_id` lines with their file and line location. Do not load completed task blocks into ordinary authoring context. Any exact match means the brick is already represented: do not recreate it, do not alter that entry, and do not consume a counter. This targeted lookup is the only ordinary archive access needed for idempotency.

Resolve a legacy spec path through the exact migration table in `docs/contracts/README.md`. Match historical work by stable spec ID. A `Current path` of `none` is Git-only evidence, never a forward `Source_spec` route or authoring example. Inspect a historical blob only for one named compatibility or acceptance question; ignore its task count, proposed tasks, fixed decomposition, `do not split` language, and superseded workflow mechanics.

## Decomposition Discovery

Inspect the current codebase only far enough to identify:

- existing modules and responsibility boundaries;
- dependencies that establish implementation order;
- reusable components, adapters, schemas, and test infrastructure;
- risky seams that should fail and recover independently;
- truthful intermediate repository states;
- acceptance clusters that can be implemented and merged separately.

Do not design the full implementation in advance. Use repository reality to produce bounded tasks while preserving Codex's implementation judgment inside each task.

## Task Size Default

Prefer more small tasks over fewer large tasks.

One task must have:

- one primary observable result;
- one clear stopping condition;
- one task-local proof story;
- a bounded implementation surface;
- a truthful, mergeable intermediate repository state;
- failure that can be isolated without rerunning unrelated outcomes.

A task may cross UI, application, domain, persistence, transport, tests, and documentation only when those changes are inseparable for that one result.

### Split When

Create separate tasks when any of the following is true:

- two results can be accepted independently;
- infrastructure can be merged truthfully before behavior that consumes it;
- user-facing composition and transport, persistence, migration, or compatibility work can be proven independently;
- normal behavior and a substantial fallback, recovery, or migration path have separate failure boundaries;
- two acceptance clusters can pass independently;
- one result can fail or be corrected without invalidating the other;
- one task would introduce multiple unrelated primary verbs or stopping conditions;
- one task would require broad stabilization, visual polish, refactoring, and new behavior at the same time;
- task-local acceptance would need to copy most of the source spec.

### Combine Only When

Combine work only when separating it would make either task:

- nonfunctional;
- misleading;
- impossible to validate independently;
- dependent on temporary false behavior or a disposable architecture.

Shared source-spec ownership, a shared screen, or shared files is not enough reason to combine work.

## Task Content Discipline

Each task references the approved spec for the collective outcome and includes only the context required for its brick.

Use:

- one objective sentence;
- concise included scope;
- explicit local non-goals;
- normally three to seven task-local acceptance criteria;
- expected surfaces at module or system level;
- only the exact artifacts consumed by that task;
- only applicable validation sets.

If a task requires more than eight materially distinct acceptance conditions, multiple independent result verbs, or several unrelated failure modes, split it unless separation would violate the combine-only rule.

Do not restate the full spec in every task.

## Ambiguity Gate

Ask for resolution only when task decomposition depends on an unresolved material decision involving:

- spec meaning or ownership;
- dependency order;
- durable architecture, data, security, or compatibility;
- artifact authority;
- external cost, credentials, or irreversible work;
- proof unavailable from the validation registry.

Routine implementation choices remain inside the task for Codex to solve with best judgment.

## Tag Selection

- use `[T-####]` for feature, bug, migration, or maintenance work;
- use `[R-####]` only for behavior-preserving structural work;
- if a task changes observable behavior and also refactors, use `[T-####]`;
- read and increment the matching counter;
- never reuse or renumber a tag;
- `Bootstrap: true` is consumed by historical `[T-0001]`; no future task may use it.

## Queue Order

Order tasks by actual dependency, then by:

1. security and data integrity;
2. foundational contracts required by later bricks;
3. core user-path behavior;
4. integration and recovery behavior;
5. visual polish and optimization.

Assign:

- `P0` for safety, data integrity, or a downstream blocker;
- `P1` for foundation or core user value;
- `P2` for non-blocking polish or optimization.

Physical order in `.harness/tasks.md` is authoritative. Do not add an `Order` field.

## Reference Assignment

For each task:

- copy only exact artifact paths the task must consume;
- use `Reference_artifacts: - none` when none apply;
- accept only the active artifact types `visual`, `technical`, or `none` from `docs/contracts/README.md`;
- do not infer authority from neighboring files;
- pair technical artifacts with the prose authority that constrains them;
- block readiness when a required artifact is missing.

## Validation Assignment

Every code task receives:

- `baseline`;
- `agent-review`;
- every applicable surface-specific set from `.harness/validation.md`.

Add `frontend-component`, `frontend-e2e`, `frontend-visual`, `security`, `security-review`, or `smoke` only when the task's local result requires them. Read exact keys from the current `.harness/validation.md` registry, not from a legacy spec or prior task.

Do not invent validation names and do not assign every set merely because the source spec uses them collectively.

## Writing Tasks

For each task:

1. derive the stable candidate `Brick_id` and complete its targeted identity lookup;
2. skip every represented brick without mutating its task entry or a counter;
3. allocate one monotonic tag only for each missing brick;
4. copy `Source_spec_id`, exact canonical `Source_spec`, and the unique `Brick_id` into the forward task schema;
5. set type, traceability, priority, and dependencies;
6. define one observable objective;
7. define bounded scope and local non-goals;
8. write task-local acceptance criteria;
9. record the required `Indivisibility_rationale`;
10. list expected surfaces;
11. assign exact reference artifacts;
12. assign only registered validation sets;
13. set `Status: queued`;
14. set `Ready: true` only when the readiness gate passes;
15. set `Pass: false`;
16. set `Open_questions: none` or record the blocker;
17. set the scratchpad path under `.harness/work/`.

Build the complete missing-task append before mutation. Preserve every existing active entry byte-for-byte and in order, append only the new task blocks in dependency order, and advance only the matching counter by the exact number of newly allocated tags. If every proposed brick is already represented, leave the queue and counters unchanged.

Expected surfaces are planning context, not a closed file allowlist.

## Readiness

A task may use `Ready: true` only when:

- the source spec remains approved;
- the task is one bounded implementation brick;
- dependency order and task-local acceptance are clear;
- required artifacts exist and are assigned exactly;
- required validation and delivery configuration exists;
- no material blocker remains.

Dependencies may remain incomplete. They affect eligibility, not readiness.

An approved spec with `Open Questions: none` authorizes correctly derived tasks. No second task-set approval is required.

Do not set a task to `working`. Selection is governed by `AGENTS.md`.

## Active Queue and Archive

- add new tasks only to `.harness/tasks.md`;
- preserve unrelated queued, working, or blocked tasks;
- never alter the active working task unless explicitly resolving a task-definition defect;
- never load `.harness/completed.md` for ordinary decomposition unless historical authority is directly relevant;
- never edit, reorder, or delete an archived entry;
- completion transfer is owned by `.harness/validation.md`, not this authoring run.

## Output

Return:

- source spec;
- decomposition basis;
- tasks created or updated;
- tag range used;
- dependency order;
- exact reference assignments;
- validation assignments;
- unresolved conflicts, or `none`;
- `Readiness: ready | blocked`.

## Final Rule

The spec authorizes the whole result. This skill creates the smallest truthful bricks needed to build it.
