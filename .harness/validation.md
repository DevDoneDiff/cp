# Implementation Validation and Delivery

## Purpose

Canonical validation registry and delivery procedure for product/code implementation tasks.

A deterministic validator is authoritative for the invariants it owns. Use focused checks while a candidate is changing, one complete configured validation run after it stabilizes, and targeted reruns after a concrete failure. Repeat the complete run only when a later change could invalidate it.

Harness maintenance is outside this lifecycle. An explicitly invoked `$harness-maintenance` run edits tracked harness files in the local working tree and leaves them uncommitted and unpushed; it does not create a task, branch, commit, pull request, CI run, review, merge, closeout, or archive entry.

## Configuration

```text
BASE_BRANCH: main
BRANCH_PATTERN: codex/<TAG>-<slug>
PUSH_COMMAND: git push -u origin HEAD
PR_STATUS_COMMAND: gh pr checks <PR> --repo DevDoneDiff/cp --watch
CI_ENABLED: true
REQUIRED_CHECKS: CI / baseline, CI / browser-smoke
MERGE_COMMAND: gh pr merge <PR> --repo DevDoneDiff/cp --squash --delete-branch --match-head-commit <EXPECTED_HEAD_SHA> --subject "<TASK_TAG> <TITLE>"
```

A task cannot be `Ready: true` when an assigned validation set or required delivery command is unavailable.

`REQUIRED_CHECKS` are implementation-lifecycle gates, not GitHub branch-protection settings. The status command observes the pull request's checks; delivery confirms both exact configured contexts pass for the candidate head before merge.

## Local Harness-Maintenance Coexistence

Uncommitted harness-maintenance changes are legitimate local control-plane state. Claim, validation, cleanup, and delivery automation must inventory and preserve them; they are not a competing implementation claim and must not be stashed, reset, restored, deleted, or rejected merely because they are dirty.

Create the implementation branch with those changes in place. If they are naturally included in the implementation task's eventual diff, they travel through that task's ordinary validation and delivery without a separate harness identity or proof lifecycle.

Ephemeral task scratchpads remain ignored. Disposable diagnostic or transition scripts belong only in `scripts/validation/tmp/`, which is covered by the repository's existing `tmp/` ignore rule. Durable validators, package scripts, and CI must never import or invoke that workspace.

## Task Claim and Resumption

Before implementation mutation:

1. Read the active queue and select the explicit task in manual mode or the first eligible task in autonomous mode.
2. Verify one unique identity, satisfied dependencies, required references, registered validation sets, and no other working task.
3. Inventory the working tree and local branches. Preserve unrelated work and local harness changes.
4. Fetch the configured remote once when available and prove the selected task has no competing active branch or pull request.
5. Change only the selected task from `queued` to `working`, create its ignored scratchpad, and create `codex/<TAG>-<slug>` without discarding the inventoried working tree.
6. Publish the claim only when normal task delivery requires it. A failed remote operation follows [External-Service Failure](#external-service-failure).

Resume a working task only when its local task, branch, remote branch, and pull request identities are absent or resolve to the same task. Rehydrate from the scratchpad and current diff; do not rebuild established context without evidence it is stale.

## Proof Model

- Focused checks own the changed behavior while implementation is in motion.
- `baseline` is the single complete local candidate gate.
- Required browser, security, smoke, or visual sets remain separate when they exercise behavior outside baseline.
- Ordinary completion uses focused diff review plus deterministic validation.
- Independent read-only review is required only when the active task assigns `agent-review`, when an assigned set explicitly requires it, for a high-risk security/authorization boundary, for a destructive or difficult-to-reverse data migration, or when deterministic evidence cannot establish a material property.
- File length, line count, formatting preference, or ordinary complexity never triggers review by itself.

## Registry

| Set | Command or procedure | Proves |
|---|---|---|
| `baseline` | `pnpm validate` | toolchain, formatting, lint, types, annotations, harness integrity, security policy, tests, coverage, and build |
| `agent-review` | independent read-only review of the stable candidate | configured correctness properties not fully established by deterministic checks |
| `frontend-component` | `pnpm test:component` | component behavior and accessibility |
| `frontend-e2e` | `pnpm test:e2e` | required browser flows |
| `frontend-visual` | real-browser inspection of assigned states and viewports | assigned visual and responsive acceptance |
| `security` | `pnpm validate:security` | repository and runtime security contracts |
| `security-review` | independent read-only security review | configured high-risk trust-boundary properties |
| `smoke` | `pnpm test:smoke` | production build and startup behavior |

Registry parsing is semantic: unique set names and nonempty meanings matter; exact prose, cell widths, field order, and byte layout do not.

## Candidate Validation

1. Implement the smallest coherent task result and run the narrowest relevant checks as behavior changes.
2. Reconcile affected tests, annotations, and durable product documentation.
3. After the candidate stabilizes, run every assigned set and `baseline` once after the final candidate-content change.
4. Inspect the complete diff for task scope, unrelated files, secrets, generated debris, and preservation of pre-existing harness maintenance.
5. Run any conditionally required independent review against the stable candidate content. Only concrete blocking findings require repair and fresh affected proof; a repair invalidates only evidence it could affect.

Keep `Pass: false` through this gate.

## Commit, Pull Request, and Closeout

1. Commit the validated candidate on `codex/<TAG>-<slug>` with a title beginning with the task tag.
2. Push without force and create or update the sole matching pull request. Record the candidate SHA and concise validation evidence.
3. Apply the provisional closeout as one later commit: remove the task from `.harness/tasks.md`, append its semantically unchanged block to `.harness/completed.md`, and change only `Status: passed` and `Pass: true` within that block.
4. Run the focused harness-integrity check for the store transition. Other candidate evidence carries forward because closeout changes no implementation content.
5. Push the closeout commit without force and bind `EXPECTED_HEAD_SHA` to that exact remote branch and pull-request head.
6. Require the configured CI checks once for `EXPECTED_HEAD_SHA`. Missing, stale, duplicated, or failing required checks block merge.

If implementation content changes after closeout, reverse the closeout, restore `Status: working` and `Pass: false`, repair the candidate, and rerun only invalidated proof before producing a new closeout head.

## Merge and Completion

Immediately before merge, fetch `origin/main` once and record `EXPECTED_BASE_SHA`. Require it to be an ancestor of the unchanged `EXPECTED_HEAD_SHA`, and confirm the remote task branch and pull-request head still equal that SHA. If the base advanced incompatibly, merge the fetched base without rewriting published history, reverse closeout if implementation repair is needed, and rerun proof invalidated by the merge.

In manual merge mode, stop at the review-ready CI-green pull request. In autonomous merge mode, use the configured squash command after the repository-required checks pass.

One readback of the same pull request must establish `MERGED`, its merge commit reachable from fetched `origin/main`, the tagged subject, task presence in the completed store, task absence from the active store, and remote task-branch absence. Then fast-forward local `main`, verify a clean synchronized implementation state apart from preserved local harness-maintenance changes, delete the exact local task branch, and delete the task scratchpad.

Completion and dependency satisfaction come only from that merged base-branch history, not from a local archive entry, an unmerged branch, a tag-like subject alone, or a provisional closeout.

## External-Service Failure

A plausibly transient remote operation may be retried once. If its result is ambiguous, perform one operation-specific readback to classify whether that mutation applied before retrying. Do not poll or re-prove unrelated remote state.

If GitHub, CI, or another required external service remains unavailable, preserve the task, branch, scratchpad, commits, and established evidence; record the blocker and stop delivery. An outage never authorizes a validator, recovery transition, compatibility bridge, task-specific exception, permanent lesson, alternate lifecycle, or weaker validation semantics.

## Documentation and Repository-Authority Authoring

Non-runtime product and repository authority—including state contracts, product documentation, implementation specs, and task-authoring metadata—remains separate from implementation. Unless the user requests local-only work, use the lightweight path: inspect, edit, run a useful focused check when one applies, commit directly on `main`, push `main` normally, and stop.

This path has no implementation task or branch, pull request, independent review, task status, `Pass`, scratchpad, closeout, archive mutation, dependency proof, completion identity, delivery proof, or pre-push CI gate. Authoring that changes the active queue must not race a live implementation claim. If CI runs after a direct push, allow it to run normally; a later failure is new downstream evidence.

Ordinary authoring pushes are non-force. Use `--force-with-lease` only for an explicitly intentional history rewrite after one current remote-ref read; never use unconditional `--force`.

Harness construction, repair, or repository-governance machinery maintenance never uses this authoring path. Editing non-runtime repository policy or documentation alone does.
