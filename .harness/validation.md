# Validation

## Purpose

Canonical registry for executable proof, independent review, Git delivery, and CI. Tasks reference sets by exact name.

## Repository Delivery Configuration

The repository-foundation task replaces every required `<unset>` value.

```text
BASE_BRANCH: main
BRANCH_PATTERN: codex/<TAG>-<slug>
PUSH_COMMAND: git push -u origin HEAD
PR_CREATE_OR_UPDATE_COMMAND: Run gh pr view <HEAD_BRANCH> --repo DevDoneDiff/cp, then an all-state exact-head gh pr list; edit the sole matching open PR with gh pr edit, or create with gh pr create only after authenticated zero-result proof
PR_STATUS_COMMAND: gh pr checks <PR> --repo DevDoneDiff/cp --watch --required
CI_ENABLED: true
CI_STATUS_COMMAND: gh pr checks <PR> --repo DevDoneDiff/cp --json name,bucket,state,link,workflow; require exact CI / baseline and CI / browser-smoke entries with bucket pass, then reread the matching headRefOid with gh pr view
MERGE_COMMAND: gh pr merge <PR> --repo DevDoneDiff/cp --squash --delete-branch --match-head-commit <EXPECTED_HEAD_SHA> --subject "<TASK_TAG> <TITLE>"
POST_MERGE_CLEANUP_PROCEDURE: After successful guarded merge, fetch and prune; check out and fast-forward BASE_BRANCH; require exact local and remote base SHA equality, clean state, task-tag history proof, merged pull-request proof, and remote task-branch absence; attempt ordinary local branch deletion; permit exact-target force deletion only when squash ancestry alone blocks ordinary deletion
AGENT_REVIEW_PROCEDURE: dedicated read-only Codex review against BASE_BRANCH
SECURITY_REVIEW_PROCEDURE: dedicated read-only security review of the task diff
```

A normal task cannot have `Ready: true` when a required command or procedure is unset.

## One-Time Bootstrap Exception

`[T-0001]` may be ready with `Bootstrap: true` while the registry is unset only when its approved source spec requires it to configure this file completely.

Bootstrap sequence when Git is absent:

1. run `bootstrap-preflight`
2. initialize the approved base branch
3. create one baseline commit containing only preexisting harness, approved documents, approved source specifications, approved references, the approved foundation spec, and approved task queue
4. create or connect the approved empty remote and push the base branch once
5. create `codex/T-0001-repository-foundation`
6. perform foundation implementation only on that task branch

Before candidate delivery, the bootstrap task must:

- replace every required `<unset>` value
- set `CI_ENABLED: true` when the approved foundation spec includes GitHub Actions
- execute all assigned normal validation sets using the newly configured commands
- open or update the pull request
- pass read-only review and remote CI

No later task receives this exception.

## Proof Model

Every repository behavior change requires:

- task-assigned focused validation
- `baseline`
- `agent-review`
- final diff inspection
- task branch push and pull request
- remote CI when enabled

Security-sensitive work also requires `security` and `security-review`.

Visible product UI or exact-reference work also requires browser comparison through `frontend-visual`. The approved non-product foundation smoke shell is explicitly excluded.

Missing required proof blocks the task. It never produces `Pass: true`.

## Execution Rules

MUST:

- run the narrowest assigned check after each material increment
- record command, result, evidence, hypothesis, and attempted fix in the scratchpad
- read prior failed approaches before selecting another fix
- rerun the failed focused set after a fix
- rerun every assigned set and `baseline` before candidate delivery
- use exact configured commands and procedures
- preserve test strength, security boundaries, approved reference fidelity, and production behavior
- when `.gitattributes` changes, run one controlled `git add --renormalize .`, inspect the complete staged diff, and reject any semantic change outside the active task

MUST NOT:

- skip a set because another passed
- change tests only to match incorrect behavior
- suppress errors, disable rules, or reduce coverage to force success
- retry the same method without new evidence
- treat commit, push, review, or CI success alone as complete proof

## Set Selection

Assign `baseline` and `agent-review` to every code task.

Add:

- `bootstrap-preflight`: one-time local and remote prerequisite inspection for `[T-0001]`
- `frontend-component`: rendered behavior, interaction, and accessibility
- `frontend-e2e`: user workflows across boundaries
- `frontend-visual`: visual or responsive UI behavior in a real browser
- `security`: auth, permissions, secrets, trust boundaries, or sensitive data
- `security-review`: security-sensitive change review
- `smoke`: startup and critical route or service availability

Delete unused normal sets after the stack is established. Do not delete `baseline`, `agent-review`, or `bootstrap-preflight` while `[T-0001]` is active.

## Registry

| Set | Command or procedure | Proves |
|---|---|---|
| `bootstrap-preflight` | Inspect Git status/history/origin; verify Node `24.19.0`, pnpm `11.18.0`, and GitHub CLI; run authenticated repository, permission, visibility, exact-head branch/PR, and protection readbacks without external mutation | Bootstrap prerequisites and safe initial state |
| `baseline` | `pnpm validate` | format, lint, strict typecheck, required tests, and production build |
| `agent-review` | configured dedicated read-only Codex review | correctness, acceptance, architecture, data, regression, and required reference review |
| `frontend-component` | `pnpm test:component` | rendered states, interaction, accessibility, and contracts |
| `frontend-e2e` | For one unchanged working tree, pass `pnpm test:smoke`, then run `pnpm test:e2e`; Playwright starts only the reusable production build | critical user workflows |
| `frontend-visual` | Dedicated real-browser agent review at task-required viewports and states against every exact artifact assigned by the active spec; missing browser access or required artifact fidelity fails the procedure | responsive layout, hierarchy, states, and exact approved-reference fidelity |
| `security` | `pnpm validate:security` | deterministic security checks, trust-boundary tests, and a production dependency audit at moderate severity or above |
| `security-review` | configured read-only security review | change-specific security regressions and attack paths |
| `smoke` | `pnpm test:smoke` | startup and critical route or service availability |

## Independent Review Gate

The reviewer must not modify the working tree.

Review the complete task diff against `BASE_BRANCH` for:

- acceptance and behavioral correctness
- security, privacy, auth, and trust boundaries
- data integrity, migration, rollback, and compatibility
- architectural boundaries and unnecessary complexity
- error handling, recovery, observability, and concurrency
- missing or weakened tests
- required visual fidelity when references are assigned

Correctness, security, data-loss, architecture, acceptance, and required visual findings block completion. The primary task agent applies fixes, reruns affected checks and `baseline`, then requests a fresh review.

## Pass and Delivery Sequence

1. keep `Pass: false` during implementation
2. pass all assigned focused sets and `baseline`
3. remove temporary task annotations and rerun affected checks
4. create and push a candidate commit with `Pass: false`
5. open or update the pull request
6. pass `agent-review`, `security-review` when assigned, and remote CI when enabled
7. create a closeout commit changing only `.harness/tasks.md` to `Status: passed` and `Pass: true`
8. push the closeout commit and require latest CI to pass when enabled
9. merge according to `MERGE_MODE`
10. delete the scratchpad only after configured base-branch history contains the task tag

If any file other than `.harness/tasks.md` must change after closeout begins, restore `Pass: false` and rerun the full gate.

If closeout push, latest CI, or autonomous merge fails, restore `Pass: false`, record evidence, and troubleshoot.

## Merge Rules

- never push directly to `BASE_BRANCH` outside the one-time empty-repository bootstrap
- pull-request and commit titles begin with the task tag
- merge preserves the task tag in base-branch Git history
- manual merge mode stops at a review-clean, CI-green pull request
- autonomous merge mode uses `MERGE_COMMAND` only after every gate passes
- queue advancement requires the task tag in base-branch history

## Post-Merge Cleanup

After a successful merge:

1. run `git fetch --prune origin`
2. check out `BASE_BRANCH`
3. fast-forward only from `origin/BASE_BRANCH`
4. require local `BASE_BRANCH` and `origin/BASE_BRANCH` to resolve to the same exact SHA
5. require a clean working tree
6. prove `BASE_BRANCH` history contains `TASK_TAG`
7. prove the pull request is merged and the remote task branch is absent
8. attempt `git branch -d <TASK_BRANCH>`
9. if and only if step 8 fails because squash merge left the original task commit outside `BASE_BRANCH` ancestry, run `git branch -D <TASK_BRANCH>`
10. verify the exact local task branch is absent

This exception applies only to the exact merged local task branch after every proof above. It never authorizes force-push, shared-history rewrite, remote force deletion, or deletion of any other branch.

## Failure Loop

1. keep `Pass: false`
2. capture the failing command or review finding
3. record evidence and the current hypothesis
4. compare against prior failed approaches
5. apply one bounded evidence-based correction
6. rerun the focused failure
7. rerun all assigned sets and `baseline`
8. redeliver the candidate and recheck review and CI

Set `Status: blocked` only for unresolved user context, unavailable credentials, external outage, or missing validation capability.
