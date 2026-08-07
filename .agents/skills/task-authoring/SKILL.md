---
name: task-authoring
description: Explicitly invoke to decompose one approved product spec into small, independently verifiable implementation tasks. Preserve active/completed state and never create harness or repository-governance maintenance tasks.
---

# Product Task Authoring

## Boundary

Convert one approved product spec into ordered implementation tasks. Do not write code, claim work, change `Pass`, edit completed tasks, or create tasks for harness construction, repair, simplification, validation tuning, or repository-governance maintenance.

Harness and repository-governance machinery maintenance run only through `$harness-maintenance` and consume no task identity.

## Preconditions

Require an approved product spec with `Open Questions: none`, a canonical state-spec path, existing owning/affected contracts, present exact reference artifacts, readable counters, registered validation sets, and no task-authoring conflict with a working claim.

Use the approved spec, affected state authority, exact artifacts, relevant global authority, current code/tests/annotations, `.harness/tasks.md`, and `.harness/validation.md`. Do not load completed task bodies unless a specific historical question requires it.

## Decomposition

Prefer one independently provable result per task. Split when outcomes, failure boundaries, dependencies, or acceptance can be exercised independently. Combine only when separation would leave an invalid, misleading, or unprovable intermediate repository state.

Each task contains:

- one observable objective;
- concise scope and explicit non-goals;
- normally three to seven task-local acceptance conditions;
- expected implementation surfaces;
- exact required references or `none`;
- only applicable registered validation sets;
- dependency, readiness, blocker, and scratchpad state.

Expected surfaces guide context and scope; they are not a closed file allowlist.

## Tags, Queue, and Validation

- Allocate `[T-####]` for product/code behavior and maintenance; use `[R-####]` only for behavior-preserving structural implementation.
- Preserve unique monotonic counters and physical queue order.
- Append new tasks without altering existing blocks.
- Copy the exact approved product-spec path into `Source_spec`.
- Set `Status: queued`, `Pass: false`, and `Ready: true` only when all readiness conditions hold.
- Every implementation task assigns `baseline` plus applicable focused sets.
- Assign `agent-review` or `security-review` only when explicitly configured or genuinely required by risk; they are not universal defaults.

Do not create stable brick IDs, traceability tokens, indivisibility essays, migration aliases, historical hashes, or other metadata that does not guide selection, dependencies, scope, validation, or delivery.

## Delivery

Task authoring is separate from implementation. Unless the user requests local-only work, inspect the intended diff, run a useful focused check when one applies, commit directly on `main`, push `main` normally, and stop. Do not create an implementation task or branch, pull request, independent review, task claim, `Pass`, implementation scratchpad, closeout, archive transfer, delivery proof, or pre-push CI gate. Queue authoring must not race a live implementation claim.

## Output

Report the source spec, decomposition basis, tasks and tags created, dependency order, reference and validation assignments, unresolved conflicts or `none`, and `Readiness: ready | blocked`.
