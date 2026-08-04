# AGENTS
## Purpose
Operating contract for Codex work in this repository.
## Authority and Source Ownership
Apply authority in this order within the domain being changed:

1. explicit user instruction
2. approved active spec under `docs/specs/`
3. `docs/PRODUCT.md` for approved product truth
4. `docs/ARCHITECTURE.md` for approved technical truth
5. `docs/DESIGN.md` for approved shared visual truth when UI is affected
6. applicable approved decisions under `docs/decisions/`
7. current code and tests as behavioral reality

Project-specific upstream source material lives under `docs/source/`. The operational project documents and active source brief identify the exact applicable files.

`$spec-authoring` must read the applicable upstream sources. Ordinary implementation must not load all upstream files by default unless the approved active spec links them or a conflict requires resolution.

A narrower approved operational document or spec is allowed. A contradiction is not. When authoritative sources conflict, stop mutation, identify the exact conflict, and request resolution.

Additional ownership:

- active work and execution state: `.harness/tasks.md`
- proof and delivery commands: `.harness/validation.md`
- ephemeral task rehydration: `.harness/work/<TAG>.md`
- local architectural context: annotation headers in meaningful source files
- approved state-specific appearance: exact reference artifacts linked by the active spec and task
- history: Git
## Modes
- `RUN_MODE`: `manual` or `autonomous`
- `MERGE_MODE`: `manual` or `autonomous`
- only explicit user instruction may change either mode
- manual run mode works only the task explicitly selected by the user
- autonomous run mode selects the first eligible task in queue order
- manual merge mode stops at a review-clean, CI-green pull request
- autonomous merge mode merges only after every configured gate passes

The current values live in `.harness/tasks.md`.
An approved source spec with `Open Questions: none` authorizes its correctly derived tasks; no separate task-set approval is required. In autonomous modes, Codex owns task readiness, selection, implementation, proof, review fixes, delivery, guarded merge, cleanup, and queue advancement within approved authority. User authority remains required for unresolved product or material architecture decisions, new external cost, credential-dependent setup requiring user action, destructive or irreversible operations, inaccessible infrastructure, unsafe overlap with user work, or proof that cannot be established. Autonomy never weakens validation, review, security, CI, protected-head, no-force-push, no-bypass, or tagged-history gates.
## Context Routing
For the selected task:

1. read its full entry in `.harness/tasks.md`
2. read the linked approved spec
3. read every exact reference artifact linked by the spec or task
4. read only relevant sections of product, architecture, design, and decisions
5. read or create `.harness/work/<TAG>.md`
6. inspect relevant annotation headers, code, tests, and direct relationships

Do not load every spec, upstream source document, reference folder, or repository file by default.
## Artifact Gate
For UI-bearing work, the implementation source bundle is:

```text
approved written spec
+ exact approved visual references
+ exact approved technical or content references when required
```

Rules:

- visual artifacts own approved state-specific appearance within prose constraints
- technical infographics are guidance only and cannot introduce unstated architecture or behavior
- generated-image defects, fabricated values, and annotation labels are not requirements unless the spec says they are
- the active spec and task must list exact repository-relative artifact paths
- Codex must not infer authority from other files in the same folder
- a task cannot become ready while a required artifact is missing or unapproved
## Ambiguity and Readiness Gate
Read-only investigation and spec authoring are allowed to discover missing context.

Do not mutate runtime code, configuration, schemas, dependencies, generated application artifacts, or external systems until:

- the source spec is approved
- the task has `Ready: true`
- `Open_questions: none`
- dependencies are satisfied
- required reference artifacts exist
- required validation and delivery procedures are configured, except for the one bootstrap task below

Ask targeted questions for material ambiguity involving behavior, scope, acceptance, architecture, data, migrations, security, permissions, dependencies, external cost, destructive actions, public contracts, visual authority, or proof.

Routine implementation choices may follow approved architecture, current conventions, framework-native patterns, and tests.

If material ambiguity appears during work, set the task to `blocked`, keep `Pass: false`, record the blocker, and stop mutation.
## One-Time Repository Bootstrap
Exactly one task may use `Bootstrap: true`:

```text
[T-0001] Repository foundation
Source_spec: docs/specs/A-repository-foundation.md
```

The bootstrap task may become ready while validation commands are still unset only when its approved spec explicitly requires it to establish every missing validation and delivery command.

When Git is not initialized, the bootstrap task may:

1. initialize the configured base branch
2. create one baseline commit containing only the preexisting harness, approved project documents, approved source specifications, approved reference artifacts, the approved foundation spec, and the approved task queue
3. create or connect the empty remote when the approved spec contains repository name, owner, and visibility authority
4. push that baseline branch once so a pull request base exists
5. create `codex/T-0001-repository-foundation` before adding application code or foundation implementation

This is the only direct base-branch bootstrap exception. It cannot contain application implementation. Before candidate delivery, every required `<unset>` field in `.harness/validation.md` must be replaced and all normal assigned validation, review, PR, and CI gates must pass.
## Task Selection
- exactly one task may have `Status: working`
- a task is eligible when `Ready: true`, `Pass: false`, and dependencies are satisfied
- one working task may use bounded read-only exploration or review subagents
- only the primary task agent may write
- do not advance the queue until the current task tag exists in configured base-branch history
## Required Skills
- invoke `$spec-authoring` explicitly to convert a phase brief or source bundle into draft specs
- invoke `$task-authoring` explicitly to convert one approved spec into tasks
- use `$annotation-headers` when covered source files are created or changed
- use `$frontend-design` for new UI, visual restyling, or visual review
- use `$code-change-verification` for every code, configuration, schema, migration, test, build-system, or runtime behavior change

Do not create generic planning, coding, debugging, or refactor skills without repeated evidence that a specialized reusable workflow is needed.
## Working Loop
1. confirm task readiness, dependency state, artifact availability, and branch state
2. inspect only relevant context and implementation
3. record a bounded plan in the scratchpad
4. implement the smallest coherent result
5. run the narrowest assigned validation after each material increment
6. record failures, evidence, and changed hypotheses
7. do not repeat a failed method without new evidence
8. reconcile tests, annotations, and current project documents
9. run the complete verification, review, Git, pull-request, and CI procedure
## Scope Control
- file-level expansion may proceed when required for the approved outcome; update `Expected_surfaces`
- outcome-level expansion requires user resolution before implementation
- do not add unrelated cleanup, speculative abstractions, or future features
## Engineering Rules
MUST:

- prefer KISS and framework-native patterns
- apply SOLID where it clarifies responsibilities and dependency direction
- keep domain logic DRY without premature abstraction
- validate untrusted input and apply relevant OWASP-aligned controls
- preserve authentication, authorization, least privilege, and secure failure behavior
- keep secrets and sensitive data out of code, logs, fixtures, references, and commits
- add or update tests for changed behavior and regressions
- keep changes scoped to the active task

MUST NOT:

- weaken tests, types, lint, security, validation, or error handling to force a pass
- add or replace production dependencies without resolved authority
- change approved architecture, public contracts, or schemas outside task scope
- force-push or rewrite shared history
- perform destructive Git operations except the exact post-merge local task-branch cleanup procedure owned by `.harness/validation.md`
- push directly to the configured base branch outside the one-time bootstrap exception
## Review Guidelines
A dedicated read-only Codex review is required before closeout.

Review for:

- acceptance and behavioral correctness
- security, privacy, authorization, and trust-boundary regressions
- data integrity, migrations, rollback, and compatibility
- architectural boundary violations and unnecessary complexity
- error handling, recovery, observability, and concurrency risk
- missing or weakened tests
- reference fidelity for visible UI work

Correctness, security, data-loss, architecture, acceptance, and required visual-fidelity findings block completion.
## Git and Completion
- one working task uses one branch: `codex/<TAG>-<slug>`
- commit and pull-request titles begin with `[T-####]` or `[R-####]`
- use exact commands and procedures from `.harness/validation.md`
- keep `Pass: false` through candidate delivery, review, and the first green CI result
- set `Pass: true` only through the closeout procedure in `$code-change-verification`
- if push, review, CI, or merge fails, restore or keep `Pass: false` and troubleshoot
- merge must preserve the task tag in base-branch history
- delete the scratchpad only after the task is merged or base-branch history proves the tag is present
- do not create a closeout log
- after merged-history proof, follow the exact post-merge local task-branch cleanup procedure in `.harness/validation.md`; no other destructive Git exception exists

## Project Learning

- `.harness/work/<TAG>.md` stores complete task-local attempts, failures, hypotheses, and debugging state.
- `.harness/LESSONS.md` stores only reusable, evidence-backed lessons likely to affect future tasks.
- Before planning a task, read only lessons relevant to its expected surfaces, tools, providers, or validation.
- Before task closeout, evaluate whether any scratchpad finding satisfies the lesson-promotion rules.
- Promote qualifying lessons before deleting the scratchpad.
- When a lesson represents a recurring enforceable rule, prefer encoding it in tests, validation, annotations, or the nearest applicable `AGENTS.md`.
- Do not preserve debugging noise merely because an approach failed once.
