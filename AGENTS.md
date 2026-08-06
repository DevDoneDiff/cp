# AGENTS

## Purpose

Operating contract for Codex work in this repository.

## Authority and Source Ownership

Use each source only for the domain it owns. Normative target authority is distinct from descriptive implementation evidence:

- explicit user instruction owns the current requested decision;
- `docs/PRODUCT.md` owns durable product truth;
- `docs/ARCHITECTURE.md` owns durable technical and system truth;
- `docs/DESIGN.md` owns durable experience and interaction truth;
- `docs/MVP.md` owns current demo scope and proof boundaries;
- `docs/REPOSITORY_POLICY.md` owns repository-specific policy;
- `docs/contracts/states/<state>/sNN-state.md` owns durable state-specific behavior;
- exact linked `visual-*.png` files own approved state-specific appearance;
- exact linked `technical-*.png` files own only the process depiction explicitly adopted by governing prose and otherwise remain guidance;
- an approved spec owns one collective implementation outcome;
- `docs/contracts/README.md` owns spec classification, identity, and terminal-state routing;
- `.harness/tasks.md` owns active task state and execution order;
- `.harness/completed.md` owns immutable completed-task entries;
- `.harness/validation.md` owns registered proof sets and delivery procedures;
- `.harness/work/<TAG>.md` owns ephemeral task rehydration;
- current code is current implementation reality;
- tests are executable expectations and evidence that may be stale or failing;
- annotation headers summarize inspected code for local architectural context and never overrule it;
- Git owns history and durable delivery evidence.

A narrower source may constrain a broader source within its domain. It may not contradict it.

When normative sources materially conflict, stop mutation, identify the exact conflict, and request resolution. A normative target that differs from current code is an implementation gap unless it exposes an unresolved durable decision. A code/test mismatch is reported and resolved as an implementation or proof defect; neither silently becomes durable target authority.

## Modes

- `RUN_MODE`: `manual` or `autonomous`;
- `MERGE_MODE`: `manual` or `autonomous`;
- only explicit user instruction may change either mode;
- manual run mode works only the task explicitly selected by the user;
- autonomous run mode selects the first eligible task in active queue order;
- manual merge mode stops at a review-clean, CI-green pull request;
- autonomous merge mode merges only after every configured gate passes.

Current values live in `.harness/tasks.md`.

## Non-Task Authoring Identity

Non-task authoring is limited to specs, status-only approval metadata, contracts and other durable authority, task decomposition, and directly related authority or queue changes. It uses a descriptive `codex/authoring-<slug>` branch and descriptive commit and pull-request titles without a task or refactor tag.

Authoring identity never uses task `RUN_MODE` or `MERGE_MODE`, `Pass`, an implementation scratchpad, task closeout, archive transfer, dependency proof, or task-completion history. Explicit user instruction independently authorizes an authoring delivery and whether its guarded merge may be autonomous. Adding a task to the queue does not complete it, satisfy one of its dependencies, or authorize any change to an existing completed block.

Authoring that changes the active queue, counters, `.harness/validation.md`, or task-execution authority in this file is mutually exclusive with every live implementation claim, provisional closeout, local or remote task branch, and live task pull request. The inverse exclusion applies during task claim and delivery. Preserve inactive unrelated local authoring branches without interpreting them as claims.

The non-task authoring lane is currently unavailable. Do not publish, open, merge, or route an authoring skill through that lane until the canonical delivery procedure and producer routing are activated by T-0036.

## Context Routing

For the selected task, read in this order:

1. the full active task entry in `.harness/tasks.md`;
2. the linked approved spec;
3. the owning authority and every affected state contract named by the spec, using the classification and terminal-state routing in `docs/contracts/README.md`;
4. every exact reference artifact assigned by the spec or task;
5. only relevant sections of global authority documents;
6. `.harness/work/<TAG>.md` and relevant lessons;
7. applicable annotation headers, code, tests, and direct relationships.

Do not load every spec, state package, reference folder, global document, or repository file by default.

Do not load archived task blocks from `.harness/completed.md` into ordinary selection or implementation context. The canonical claim procedure may make a narrow read-only lookup of archive identity and its terminal boundary solely to detect duplicate representation or provisional closeout. Full archived content is reserved for explicit historical investigation.

## Artifact Gate

For UI-bearing work, the implementation source bundle is:

```text
approved spec
+ owning and affected contracts
+ exact approved visual references
+ exact approved technical references when required
```

Rules:

- active reference artifacts are `visual` or `technical`; `none` means no artifact is assigned;
- visual artifacts own approved appearance within prose constraints;
- technical infographics own their approved process depiction but cannot introduce unstated behavior or architecture;
- generated-image defects, fabricated values, and annotation labels are excluded unless explicitly adopted;
- exact repository-relative paths are required;
- authority cannot be inferred from neighboring files;
- a task cannot become ready while a required artifact is missing.

## Decision Boundary and Implementation Latitude

Codex must resolve routine implementation choices with best judgment using current repository conventions, the approved architecture, framework-native capabilities, and the smallest maintainable approach.

A resolved durable product, architecture, design, state, security, schema, or compatibility decision must be recorded through an explicitly authorized update to its owning authority before dependent spec drafting resumes.

Do not ask the user to choose ordinary algorithms, module shapes, internal abstractions, rendering techniques, or infrastructure mechanics unless the choice changes a durable authority or approved outcome.

User resolution is required for:

- product meaning or customer-visible behavior;
- durable architecture or public contracts;
- schema migration, data ownership, retention, or compatibility;
- authentication, authorization, privacy, or trust boundaries;
- new external cost, credentials, provider commitment, or hosted infrastructure;
- destructive, irreversible, or inaccessible operations;
- material reference or acceptance conflicts;
- proof that cannot be established.

If material ambiguity appears during work, set the task to `blocked`, keep `Pass: false`, record the blocker, and stop mutation.

## Readiness and Task Selection

Do not begin a new task claim until:

- the source spec is approved;
- the task has `Status: queued`;
- the task has `Ready: true`;
- the task has `Pass: false` and `Blocker: none`;
- `Open_questions: none`;
- dependencies are satisfied;
- required artifacts exist;
- required validation and delivery procedures are configured.

Do not mutate runtime code, configuration, schemas, dependencies, generated application artifacts, or other authorized source surfaces until the canonical claim has been published and the task has `Status: working`. Same-task resumption must re-establish that state through the canonical procedure.

Selection rules:

- autonomous primary invocations must be externally serialized before repository claim checks begin;
- repository and GitHub claim checks detect stale or competing work; they are not a distributed lock and cannot make improperly concurrent invocations safe;
- exactly one task may have `Status: working`;
- a task is eligible only when `Status: queued`, `Ready: true`, `Pass: false`, `Blocker: none`, and canonical dependencies are satisfied;
- a blocked task is never eligible and may resume only through the same-task procedure in `.harness/validation.md`;
- before source edits, use the canonical claim procedure to inspect base state, live task branches and pull requests, provisional closeout, and conflicting queue-authoring work, then publish the deterministic task claim;
- a failed, unavailable, or competing claim blocks mutation;
- one working task may use bounded read-only exploration or review subagents;
- only the primary task agent may write;
- do not advance the queue until the canonical post-H1 completion proof, or the exact historical seed exception, satisfies the current task and every dependency;
- `[T-0001]` consumed the one-time bootstrap authority; no future task may use `Bootstrap: true`.

## Required Skills

- invoke `$spec-authoring` explicitly to discover and draft one collective implementation outcome;
- invoke `$task-authoring` explicitly to decompose one approved spec into small tasks;
- use `$annotation-headers` when covered source files are created or changed;
- use `$frontend-design` for new UI, visual restyling, or visual review;
- use `$code-change-verification` for every code, configuration, schema, migration, test, build-system, or runtime behavior change.

Do not create generic planning, coding, debugging, or refactor skills without repeated evidence that a specialized reusable workflow is needed.

## Working Loop

1. confirm task readiness, dependencies, artifacts, and branch state;
2. inspect only relevant context and implementation;
3. record a bounded plan in the scratchpad;
4. implement the smallest coherent result authorized by the task;
5. run the narrowest assigned validation after each material increment;
6. record failures, evidence, and changed hypotheses;
7. do not repeat a failed method without new evidence;
8. reconcile tests, annotations, and applicable project documents;
9. run the complete verification, review, Git, pull-request, CI, closeout, and merge procedure.

## Scope Control

- file-level expansion may proceed when required for the active task; update `Expected_surfaces`;
- outcome-level expansion requires user resolution;
- do not add adjacent features, unrelated cleanup, speculative abstractions, or future infrastructure;
- a task may cross layers only where required to make its one result usable and provable.

## Engineering Rules

MUST:

- give every hand-authored source file one primary responsibility and one main reason to change;
- separate domain rules, orchestration, external transport, persistence, presentation, and validation when they evolve independently;
- preserve cohesive cross-layer code when splitting would make a small behavior harder to understand or verify;
- prefer framework-native and repository-native patterns before adding abstractions or dependencies;
- validate untrusted input and preserve secure failure behavior;
- preserve authentication, authorization, least privilege, and data integrity;
- keep secrets and sensitive data out of code, logs, fixtures, references, and commits;
- add or update focused tests for changed behavior and regressions;
- keep changes scoped to the active task.

File responsibility checks:

- when an active task changes a hand-authored runtime source file above 250 nonblank lines, document its primary responsibility, main reason to change, mixed or independently evolving responsibilities, dependency direction, and proof boundaries in the scratchpad;
- a hand-authored runtime source file above 350 nonblank lines requires explicit independent review escalation of that written analysis;
- a cohesive imperative file may remain above 350 when independent review accepts that it has one primary responsibility and splitting would reduce cohesion or proof quality; declarative or generated content may support the analysis but is never required for acceptance;
- line count alone never requires a split and never justifies meaningless fragmentation or unrelated responsibility accumulation; responsibility and change boundaries control.

MUST NOT:

- weaken tests, types, lint, security, validation, or error handling to force a pass;
- add or replace production dependencies without resolved authority;
- change approved architecture, public contracts, or schemas outside task scope;
- place unrelated responsibilities into one file for convenience;
- create generic utility modules without a specific stable owner;
- force-push or rewrite shared history;
- push directly to the configured base branch;
- perform destructive Git operations outside the exact post-merge cleanup procedure in `.harness/validation.md`.

## Review Guidelines

A dedicated read-only Codex review is required before closeout.

Review for:

- acceptance and behavioral correctness;
- security, privacy, authorization, and trust-boundary regressions;
- data integrity, migrations, rollback, and compatibility;
- architectural boundary violations and unnecessary complexity;
- files with mixed layers, multiple or independent reasons to change, reversed dependency direction, obscured proof boundaries, or unjustified size growth;
- error handling, recovery, observability, and concurrency risk;
- missing or weakened tests;
- required visual fidelity.

Correctness, security, data-loss, architecture, acceptance, file-responsibility, and required visual findings block completion.

## Git and Completion

- one working task uses one branch: `codex/<TAG>-<slug>`;
- commit and pull-request titles begin with the task tag;
- use exact commands and procedures from `.harness/validation.md`;
- keep `Pass: false` through implementation and candidate delivery;
- closeout transfers the complete final task entry from `.harness/tasks.md` to `.harness/completed.md` with `Status: passed` and `Pass: true`;
- an unmerged archive entry is provisional and never satisfies completion, dependency, or queue-advancement proof;
- post-H1 completion and dependency satisfaction use the single exact merged-pull-request, merge-SHA, tagged-history, archive-introduction, active-absence, and remote-branch proof in `.harness/validation.md`;
- after the archive entry reaches configured base-branch history, it is immutable;
- if closeout, CI, or merge fails before that point, reverse the provisional transfer and restore `Pass: false`;
- merge must preserve the task tag in base-branch history;
- delete the scratchpad only after merged-history proof;
- follow the exact post-merge task-branch cleanup procedure in `.harness/validation.md`.

## Project Learning

- `.harness/work/<TAG>.md` stores complete task-local attempts, failures, hypotheses, and debugging state;
- `.harness/LESSONS.md` stores only reusable, evidence-backed lessons likely to affect future tasks;
- read only lessons relevant to the active task;
- promote qualifying lessons before deleting the scratchpad;
- encode recurring enforceable rules in tests, validation, annotations, or the nearest authority;
- do not preserve debugging noise or completed-task summaries as lessons.
