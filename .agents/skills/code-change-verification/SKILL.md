---
name: code-change-verification
description: Required for every code, configuration, schema, migration, test, build-system, or runtime behavior change. Prove the change, run independent review, deliver through a task branch and pull request, and control Pass state.
---

# Code Change Verification

## Purpose

Own the verification and delivery lifecycle for the active task. `.harness/validation.md` owns exact sets, commands, review procedures, base branch, pull request, CI, and merge configuration.

## Preconditions

Do not mutate repository behavior unless the task has:

- `Status: working`
- `Ready: true`
- `Pass: false`
- `Open_questions: none`
- satisfied dependencies
- required reference artifacts present
- configured required validation and delivery procedures

## Historical Bootstrap Compatibility

`Bootstrap: true` and `bootstrap-preflight` describe the consumed historical `[T-0001]` exception only. They do not authorize an executable bootstrap branch for any current or future task. Use Git history for the original bootstrap procedure and evidence.

## Branch Gate

Before source edits:

1. identify `BASE_BRANCH` from `.harness/validation.md`
2. fetch current remote state when available
3. create or reuse `codex/<TAG>-<slug>`
4. confirm the branch contains only the active task
5. confirm the current branch is not `BASE_BRANCH`

Never push directly to `BASE_BRANCH`, force-push, rewrite shared history, or mix task tags on one branch.

## Scratchpad

Read or create `.harness/work/<TAG>.md`.

Maintain:

- current plan
- files inspected and changed
- decisions established
- validation attempted
- failed approaches and why
- current blocker
- next exact action

Read failed approaches before debugging. Do not repeat one without new evidence or a changed hypothesis.

## Incremental Loop

After each material increment:

1. run the narrowest assigned check
2. record command, result, and evidence
3. continue only when evidence supports the approach

Do not defer all proof until task completion.

## Failure Loop

When a check fails:

1. keep `Pass: false`
2. capture the failing command and relevant output
3. record the current hypothesis
4. compare with prior failed approaches
5. apply one bounded evidence-based correction
6. rerun the focused failure
7. update the scratchpad

Set `Status: blocked` only when progress requires unresolved user context, unavailable credentials, external recovery, or missing proof capability.

## Final Local Gate

Before candidate delivery:

1. satisfy every acceptance criterion
2. confirm every assigned reference artifact was inspected when applicable
3. run every assigned focused validation set
4. run `baseline` after the final source change
5. reconcile tests, project docs, and annotation headers
6. remove temporary annotation task fields
7. rerun checks affected by annotation or doc changes
8. inspect `git status` and the complete diff
9. remove unrelated files, debug artifacts, secrets, and sensitive data

Any failure returns to the failure loop.

## Candidate Delivery

Keep the task at `Pass: false`.

Execute the candidate portion of `.harness/validation.md`'s canonical pass, archive, and delivery sequence. That registry owns the exact staging, commit, push, pull-request, evidence, and remote-check procedures.

If commit or push fails, keep `Pass: false`, record the exact failure, inspect branch, remote, auth, hooks, divergence, and policy, then apply a non-destructive fix.

## Independent Review and CI

Run every assigned review and CI procedure exactly as registered in `.harness/validation.md`. `agent-review` is universal and includes security implications. Security-sensitive work must assign and run `security-review`; a missing assignment is a blocking task-authoring defect, not a waiver.

The primary task agent applies review fixes. Before further source edits, restore `ACTIVE_TASK` and `LOCAL_INTENT` to affected annotated files.

After each fix:

1. rerun the affected focused set
2. rerun all assigned sets and `baseline`
3. reconcile annotations again
4. redeliver and re-prove the correction through the canonical validation sequence

No unresolved correctness, security, data-loss, architecture, acceptance, or required visual-fidelity finding may remain.

## Closeout, Merge, and Completion

Use `.harness/validation.md` as the sole exact owner of:

- the atomic active-queue to completed-archive transfer;
- provisional closeout and reversal;
- manual or autonomous merge gates;
- live completion and dependency proof;
- remote-result recovery; and
- post-merge cleanup.

Keep scratchpad state and temporary annotations consistent with that canonical sequence. Do not restate or improvise an alternate procedure here.
