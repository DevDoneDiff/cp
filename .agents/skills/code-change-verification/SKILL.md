---
name: code-change-verification
description: Required for runtime product/code implementation, including implementation-owned configuration, schema, migration, tests, build-system, and behavior changes. Prove the active implementation task, deliver it through its task branch and pull request, and control Pass state.
---

# Code Change Verification

## Purpose

Own focused proof and delivery for the active implementation task. `.harness/validation.md` owns the exact registry, branch, CI, closeout, merge, and cleanup procedure.

This skill does not govern non-runtime product/repository-authority documentation or harness/repository-governance machinery maintenance. Authority work uses the lightweight direct-main workflow; explicit `$harness-maintenance` work remains local, uncommitted control-plane state.

## Preconditions

Before implementation mutation require one task with `Status: working`, `Ready: true`, `Pass: false`, `Open_questions: none`, satisfied dependencies, present assigned references, and registered validation sets.

Create or resume `codex/<TAG>-<slug>` from the configured base. Inventory the working tree first. Preserve unrelated work and uncommitted harness-maintenance changes; they are not a competing claim and must not be stashed, reset, restored, or deleted.

During implementation, never push directly to the base branch, force-push, or mix implementation tasks on one branch.

## Working Loop

Maintain `.harness/work/<TAG>.md` with the current plan, inspected/changed files, established decisions, validation, failed approaches, blocker, and next action.

While behavior is changing:

1. run the narrowest assigned check that exercises the change;
2. use the result as authority for its owned invariant;
3. correct only the directly implicated defect;
4. rerun the affected check;
5. avoid repeating a failed path without new evidence.

Do not add validation layers, compatibility paths, or recovery machinery to work around a one-time implementation or service failure.

## Stable Candidate Gate

After the candidate stabilizes:

1. satisfy task acceptance and inspect assigned references;
2. run all assigned focused sets;
3. run `baseline` once after the final candidate-content change;
4. reconcile tests, durable docs, and annotation headers;
5. inspect the complete diff for scope, unrelated changes, secrets, and disposable artifacts;
6. preserve or intentionally include pre-existing harness-maintenance changes.

Repeat the complete baseline only when a later change could invalidate it. Otherwise rerun targeted affected proof.

Ordinary work uses focused diff review. Run independent read-only review only when the task assigns it, an assigned set requires it, the change affects a high-risk security/authorization boundary, it performs destructive or difficult-to-reverse data migration, or deterministic evidence cannot establish a material property. File length alone never triggers review.

Concrete blocking review findings return to the working loop. Only evidence the repair could affect is invalidated.

## Delivery and Completion

Keep `Pass: false` through candidate validation. Follow `.harness/validation.md` for:

- intentional candidate commit and non-force push;
- the sole matching pull request and required CI;
- provisional active-to-completed closeout;
- guarded manual or autonomous squash merge;
- one minimum readback of an ambiguous or completed remote mutation;
- local synchronization, exact task-branch cleanup, and scratchpad deletion.

A plausibly transient remote failure may be retried once. If a required external service remains unavailable, preserve state, record the blocker, and stop; do not mutate harness semantics to bypass it.
