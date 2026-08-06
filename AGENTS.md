# AGENTS

## Purpose

Operating contract for autonomous product and code implementation in this repository.

This file governs repository-specific authority, context routing, product authoring, implementation tasks, validation gates, Git delivery, CI, merge, cleanup, and project learning.

Global Codex instructions govern reasoning style, evidence handling, self-management, and judgment.

## Control Plane and Implementation Plane

The repository has two separate operating domains:

- control plane: harness files, harness validation machinery, harness skills, and repository-governance maintenance;
- implementation plane: product specs, implementation tasks, runtime code, tests, validation, Git delivery, pull requests, CI, merge, and implementation history.

Harness construction, repair, simplification, and repository-governance maintenance are governed only by an explicitly invoked `$harness-maintenance` skill.

Harness maintenance must not:

- create product specs;
- create product tasks;
- consume implementation task identities;
- enter the implementation task graph;
- create implementation scratchpads;
- use implementation task status or `Pass`;
- enter implementation closeout or archive procedures;
- create independent harness delivery.

Product implementation must not route harness maintenance through its task lifecycle.

`$harness-maintenance` leaves harness changes local and uncommitted. Existing local harness changes may later be included naturally in a normal product implementation commit without requiring separate harness delivery.

Existing uncommitted harness-maintenance changes are not an implementation claim and must be preserved.

External service failure may pause implementation delivery. It must never cause creation of harness recovery machinery, task-specific recovery logic, or repository exceptions.

## Authority and Source Ownership

Use each source only for the domain it owns:

- explicit user instruction owns the current requested decision;
- `docs/PRODUCT.md` owns durable product truth;
- `docs/ARCHITECTURE.md` owns durable technical and system truth;
- `docs/DESIGN.md` owns durable experience and interaction truth;
- `docs/MVP.md` owns current demo scope and proof boundaries;
- `docs/REPOSITORY_POLICY.md` owns repository-specific implementation policy;
- `docs/contracts/states/<state>/sNN-state.md` owns durable state-specific behavior;
- exact linked `visual-*.png` files own approved state-specific appearance;
- exact linked `technical-*.png` files own only the process depiction explicitly adopted by governing prose;
- an approved product spec owns one collective implementation outcome;
- `docs/contracts/README.md` owns product spec classification and routing;
- `.harness/tasks.md` owns active implementation-task state, counters, modes, and execution order;
- `.harness/completed.md` owns completed implementation-task entries;
- `.harness/validation.md` owns implementation validation sets and delivery procedures;
- `.harness/work/<TAG>.md` owns ephemeral implementation-task rehydration;
- current code is current implementation reality;
- tests are executable expectations and evidence;
- annotation headers provide compact local architectural context and never overrule code or durable authority;
- Git owns implementation history and durable delivery evidence.

A narrower source may constrain a broader source within its domain. It may not contradict it.

When durable authorities materially conflict, stop the affected implementation mutation, identify the exact conflict, and request resolution.

## Modes

- `RUN_MODE`: `manual` or `autonomous`;
- `MERGE_MODE`: `manual` or `autonomous`;
- only explicit user instruction may change either mode;
- manual run mode works only the implementation task explicitly selected by the user;
- autonomous run mode selects the first eligible implementation task in active queue order;
- manual merge mode stops at a review-ready, CI-green pull request;
- autonomous merge mode merges after configured implementation gates pass.

Current values live in `.harness/tasks.md`.

## Product Authoring

Product spec and task authoring exist only to define and queue product or code implementation work.

Invoke `$spec-authoring` for product implementation specs.

Invoke `$task-authoring` for implementation-task decomposition.

Product authoring must not be used for:

- harness construction or repair;
- harness validators or skills;
- repository-governance maintenance;
- harness migrations;
- harness cleanup.

Product authoring may use a descriptive `codex/authoring-<slug>` branch and descriptive commit and pull-request titles without consuming an implementation task identity.

Authoring that mutates the active implementation queue must not race a live implementation claim.

## Context Routing

For a selected implementation task, read in this order:

1. the full active task entry;
2. the linked approved product spec;
3. the owning product, architecture, design, MVP, and affected state authority required by that spec;
4. exact assigned reference artifacts;
5. only relevant sections of broader repository authority;
6. the task scratchpad and relevant reusable lessons;
7. applicable annotation headers, code, tests, and direct relationships.

Do not load every spec, completed task, state package, reference folder, global document, or repository file by default.

Completed task content is historical evidence and is not ordinary implementation context.

## Decision Boundary

Repository authority determines which decisions are already resolved and which remain user-owned.

Resolve routine implementation choices from the approved outcome, current repository conventions, framework-native capabilities, and existing architecture.

User resolution is required when implementation would change:

- product meaning or customer-visible behavior;
- durable architecture or public contracts;
- schema ownership, migration semantics, retention, or compatibility;
- authentication, authorization, privacy, or trust boundaries;
- external cost, credentials, provider commitment, or hosted infrastructure;
- destructive or irreversible behavior;
- approved acceptance meaning or reference authority.

If one of these decisions is unresolved, mark the implementation task blocked, record the blocker, and stop the affected mutation.

## Task Readiness and Selection

An implementation task is eligible only when:

- `Status: queued`;
- `Ready: true`;
- `Pass: false`;
- `Blocker: none`;
- `Open_questions: none`;
- required dependencies are complete;
- required references exist;
- required validation sets are configured.

Exactly one implementation task may be `working`.

Autonomous execution selects the first eligible task in queue order.

Perform the configured claim check once before implementation mutation.

A failed or competing claim blocks implementation mutation.

Do not treat unrelated local authoring branches or uncommitted harness-maintenance changes as implementation claims.

## Required Skills

- invoke `$spec-authoring` explicitly for product implementation specs;
- invoke `$task-authoring` explicitly for product implementation-task decomposition;
- use `$annotation-headers` when covered source files are created or materially changed;
- use `$frontend-design` for new UI, visual restyling, or required visual review;
- use `$code-change-verification` for code, configuration, schema, migration, test, build-system, or runtime behavior changes;
- use `$harness-maintenance` only when explicitly invoked for control-plane maintenance and never as part of the implementation lifecycle.

Do not invent new generic process skills without repeated evidence that a reusable specialized workflow is necessary.

## Implementation Loop

1. Claim the selected implementation task.
2. Inspect only the context required for that task.
3. Record a bounded implementation plan when useful for rehydration.
4. Implement the smallest coherent result authorized by the task.
5. Run focused checks against changed behavior during implementation.
6. Reconcile affected tests, annotations, and durable product documentation.
7. When the candidate is stable, run the configured complete implementation validation once.
8. If validation passes, perform the configured Git, pull-request, CI, closeout, and merge procedure.
9. If a concrete check fails, fix the directly implicated defect and rerun the affected check.
10. Rerun complete validation only when subsequent changes could invalidate the prior complete result.
11. Complete merge and cleanup, then advance to the next eligible implementation task.

## Scope Control

- implementation may expand to additional files when required for the active task;
- outcome-level expansion requires user resolution;
- do not add adjacent features, unrelated cleanup, speculative abstractions, or future infrastructure;
- preserve unrelated local work;
- a task may cross layers only when required to make its authorized result usable and verifiable.

## Engineering Rules

MUST:

- give hand-authored source files a clear primary responsibility;
- preserve cohesive code when splitting would make behavior harder to understand or verify;
- prefer framework-native and repository-native patterns before new abstractions or dependencies;
- validate untrusted input and preserve secure failure behavior;
- preserve authentication, authorization, least privilege, and data integrity;
- keep secrets and sensitive data out of code, logs, fixtures, references, and commits;
- add or update focused tests for changed behavior and regressions;
- keep changes scoped to the active implementation task.

File size is an architectural signal, not a completion gate.

Split files when responsibilities or change boundaries justify it, not because a line threshold was crossed.

MUST NOT:

- weaken tests, types, lint, security, validation, or error handling to force a pass;
- add or replace production dependencies without resolved authority;
- change approved architecture, public contracts, or schemas outside task scope;
- create abstractions without a concrete stable responsibility;
- push directly to the configured base branch;
- force-push or rewrite shared history during normal product implementation;
- create harness exceptions, recovery validators, compatibility bridges, or new lifecycle machinery to overcome implementation or delivery failures.

## Annotation Headers

Annotation headers are context compression, not duplicate documentation.

Use the repository annotation skill and contract when covered source files are created or materially changed.

Headers should communicate only non-obvious information that materially reduces future repository reading, such as:

- primary responsibility;
- important ownership or boundary information;
- non-obvious architectural relationships;
- non-obvious validation requirements.

Do not treat annotation headers as authority over code or durable project documents.

## Review Guidelines

Routine implementation completion requires:

- focused review of the actual diff;
- configured deterministic validation;
- resolution of concrete correctness, security, data-integrity, architecture, acceptance, and test failures.

Independent read-only review is required only when:

- an assigned validation set explicitly requires it;
- the change affects a high-risk security or authorization boundary;
- the change performs a destructive or difficult-to-reverse data migration;
- deterministic evidence cannot establish a material correctness property.

File length alone never requires independent review.

## Git and Completion

- one working implementation task uses one branch: `codex/<TAG>-<slug>`;
- commit and pull-request titles begin with the implementation task tag;
- use `.harness/validation.md` for the implementation delivery sequence;
- keep `Pass: false` through implementation and candidate validation;
- a candidate closeout stored on an unmerged task branch is provisional and cannot satisfy dependencies;
- completion becomes authoritative only when the configured base branch contains the merged implementation and its completed task entry;
- after confirmed merge, perform branch and scratchpad cleanup once;
- use one confirmation readback when a remote mutation result is ambiguous;
- when a remote failure is plausibly transient, retry that operation at most once;
- if GitHub, CI, or another required external service remains unavailable, preserve the implementation state, report the blocker, and stop;
- never change the harness merely to work around an external service outage.

Do not create task-specific remote recovery logic or permanent repository exceptions for temporary delivery failures.

## Project Learning

- `.harness/work/<TAG>.md` stores task-local implementation attempts, failures, hypotheses, and debugging state;
- `.harness/LESSONS.md` stores only reusable, evidence-backed lessons likely to affect future implementation tasks;
- read only lessons relevant to the active implementation task;
- do not preserve debugging noise, completed-task summaries, one-time external outages, or harness-maintenance history as permanent lessons;
- encode recurring implementation rules in the nearest durable authority, test, or deterministic validator.
