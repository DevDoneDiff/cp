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
- configured required validation and delivery procedures, except for the one bootstrap task

## Bootstrap Path

Use only when the task has all of:

```text
Tag: [T-0001]
Bootstrap: true
Source_spec: docs/specs/A-repository-foundation.md
```

1. run `bootstrap-preflight`
2. inspect whether Git and a remote already exist
3. when Git is absent, initialize the approved base branch
4. create one initial commit containing only preexisting harness, approved project documents, approved source specifications, approved references, the approved foundation spec, and the approved task queue
5. create or connect an empty remote only when owner, name, visibility, and creation authority are explicit in the approved spec
6. push the initial base branch once so a pull-request base exists
7. create `codex/T-0001-repository-foundation`
8. add all application and foundation implementation only on that task branch

The initial base-branch commit cannot contain application implementation. Before candidate delivery, replace every required `<unset>` value in `.harness/validation.md` and use the normal gates below.

## Normal Branch Gate

Before source edits:

1. identify `BASE_BRANCH` from `.harness/validation.md`
2. fetch current remote state when available
3. create or reuse `codex/<TAG>-<slug>`
4. confirm the branch contains only the active task
5. confirm the current branch is not `BASE_BRANCH`

Never push directly to `BASE_BRANCH`, force-push, rewrite shared history, or mix task tags on one branch outside the explicit initial bootstrap.

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

1. stage only task-scoped files
2. commit with `[T-####] <imperative summary>` or `[R-####] <imperative summary>`
3. push the task branch using the configured command
4. open or update one pull request
5. use the task tag at the start of the pull-request title
6. include source spec, reference artifacts, acceptance results, validation evidence, and remaining risk in the pull-request body

If commit or push fails, keep `Pass: false`, record the exact failure, inspect branch, remote, auth, hooks, divergence, and policy, then apply a non-destructive fix.

## Independent Review and CI

Run `agent-review` through the configured dedicated read-only reviewer.

When assigned, also run:

- `security-review`
- remote CI
- pull-request status checks

The primary task agent applies review fixes. Before further source edits, restore `ACTIVE_TASK` and `LOCAL_INTENT` to affected annotated files.

After each fix:

1. rerun the affected focused set
2. rerun all assigned sets and `baseline`
3. reconcile annotations again
4. commit and push the correction
5. request a fresh review
6. recheck CI

No unresolved correctness, security, data-loss, architecture, acceptance, or required visual-fidelity finding may remain.

## Closeout Commit

Only after the latest candidate commit passes review and CI:

1. set the task to `Status: passed`
2. set `Pass: true`
3. create a closeout commit containing only `.harness/tasks.md`
4. push the closeout commit
5. require latest CI to pass when enabled

If another file must change, restore `Pass: false` and return to the full local gate.

If closeout push or latest CI fails:

1. restore `Pass: false` in the next commit
2. record evidence
3. troubleshoot
4. repeat candidate and closeout gates as applicable

`Pass: true` is valid only while the latest pushed commit satisfies the configured gate.

## Merge Gate

- `MERGE_MODE: manual`: stop at a review-clean, CI-green pull request
- `MERGE_MODE: autonomous`: run the configured merge command after every gate passes
- merge must preserve the task tag in base-branch Git history
- if autonomous merge fails, restore `Pass: false`, diagnose, and retry without destructive Git
- queue advancement requires the tag on `BASE_BRANCH`
- after successful merge and base-branch task-tag proof, execute the exact post-merge cleanup procedure from `.harness/validation.md`

## Completion

After base-branch history contains the task tag:

- delete `.harness/work/<TAG>.md`
- leave no temporary task annotations
- do not create a closeout log
- allow queue advancement

Git and remote CI are the durable completion record.
