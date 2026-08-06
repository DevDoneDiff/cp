# Validation

## Purpose

Canonical registry for executable proof, independent review, Git delivery, task closeout, and CI.

Tasks reference validation sets by exact name.

## Repository Delivery Configuration

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

A task cannot have `Ready: true` when a required command or procedure is unset.

Historical `[T-0001]` consumed the one-time bootstrap exception. No future task may use `Bootstrap: true`.

## Task Claim and Same-Task Resumption

The invocation environment must serialize autonomous primary executors before this procedure begins. The checks below detect stale or competing repository state. They are not a distributed lock and do not protect against improperly simultaneous invocations.

### New task claim

Before any authorized source edit:

1. Inventory the complete current branch, HEAD, index, worktree, active queue, counters, and task scratchpads. Use a narrow read-only lookup that returns only archive identities and the terminal boundary needed to detect duplicate representation or provisional closeout; do not load archived task blocks into ordinary context. Preserve every pre-existing change. An unexplained staged change or overlap with the selected task blocks the claim.
2. Fetch and prune the configured remote, require authenticated GitHub readback, and prove the local configured base is the exact fetched base. An unavailable or ambiguous remote read blocks autonomous claiming.
3. Select the first task in active queue order satisfying `Status: queued`, `Ready: true`, `Pass: false`, `Blocker: none`, and the canonical dependency procedure. Prove no other active task is `working` and no provisional closeout is awaiting delivery.
4. Enumerate and classify every local and remote branch matching `BRANCH_PATTERN` and every open pull request. Separately inspect the current non-task branch and every open non-task pull request for changes to `.harness/tasks.md`, its counters, `.harness/validation.md`, or task-execution authority in `AGENTS.md`. Any different live task claim, same-tag reference, provisional closeout, or active conflicting queue-authoring work blocks selection; an inactive unrelated local non-task branch is preserved but is not a claim.
5. Derive the one branch named by `BRANCH_PATTERN`. A pre-existing local branch, remote branch, or pull request with that identity is a conflict unless the same-task resumption procedure has just proved its exact identity and explicitly authorized local-branch reuse for a fresh claim. Never overwrite, force-update, or reinterpret a reference.
6. Create the task branch from the proven base or reuse only the exact local branch authorized by the immediately preceding same-task resumption proof, while preserving inventoried non-overlapping local changes. Change only the selected task from `Status: queued` to `Status: working`, create its ignored scratchpad, and commit a claim whose subject begins with the exact task tag. Do not edit an authorized source surface in the claim commit.
7. Publish the branch with the configured non-force push, then read back the exact remote branch SHA and require it to equal the local claim SHA. Only that successful readback establishes the repository claim and permits source mutation.

A failed push, conflicting reference, changed base, or unavailable readback leaves `Pass: false`, creates or retains the scratchpad, records the exact evidence there and in `Blocker`, sets `Status: blocked`, and stops before source mutation. Preserve the branch, worktree, and remote state for resolution; do not retry without new evidence.

### Same-task resumption

A blocked task resumes only through an explicit primary-agent transition:

1. Rehydrate its scratchpad and recorded blocker, fetch and prune the remote, and repeat the base, active-store, narrow archive-boundary, all-local-branch, all-remote-branch, pull-request, and conflicting-authoring reads from the claim procedure.
2. Prove any retained local branch uses the exact configured branch identity and contains the exact task tag, `Source_spec_id`, and `Brick_id`. Authenticated remote readback must establish exactly one of two states: the exact remote branch exists and contains the published claim, or that exact remote branch is absent. Ambiguous or contradictory readback remains blocking.
3. When a pull request exists, require exactly one open pull request in the configured repository whose head repository is that same configured repository, whose head ref and head SHA equal the proven exact remote branch and its tip, and whose base ref equals `BASE_BRANCH`. A fork, wrong base, duplicate pull request, mismatched tip, or pull request with no exact remote branch remains blocking.
4. A proven-remote-absence path is valid only when no open pull request exists and the retained exact local task branch differs from the proven base solely by task claim or blocker-state commits, with no authorized source change. That path authorizes reuse of only that local branch for a queued fresh claim. Any source change without a provable published claim remains blocked.
5. Only after the applicable identity proof, exclude those exact same-task references from competing-claim results. Every other local or remote task branch, task claim, same-tag reference, provisional closeout, or conflicting authoring change remains a conflict.
6. Record evidence that the original blocker is resolved, clear `Blocker`, and explicitly return the task to `working` when its published remote claim remains valid, or to `queued` only under the proven-remote-absence fresh-claim path. Rerun readiness, artifacts, validation configuration, canonical dependencies, and all claim checks.
7. Publish and read back any blocked-to-working task-state transition before source mutation. A queued transition must complete the new-task claim procedure using only the explicitly authorized local branch instead.

The eventual pull request records a read-only resumption procedure case with the exact task, branch, pull-request, blocker, competing-reference, and self-claim-exclusion results. A changed external condition alone never clears or resumes a blocked task.

## Proof Model

`pnpm validate` is the complete local baseline. Its deterministic order is toolchain, formatting, lint, strict typecheck, annotation structure, network-free harness integrity, security, coverage tests, and production build. Harness integrity proves local active/archive structure and accepts one legal provisional closeout; it does not query GitHub or claim that an unmerged task is complete.

`CI / baseline` checks out the exact pull-request head, or the pushed branch ref, with three task-store generations before running the same command. This preserves local transition semantics instead of validating GitHub's synthetic pull-request merge commit. `CI / browser-smoke` retains its independent checkout and browser behavior.

One compatibility path exists only for this authorized H1 batch delivery: when configured `main` has exact parent `5d515d9f8224ed607219fd5f29d0f20305fdcc16`, structural validation may accept the single exact passed transform of the original queued T-0008 through T-0039 stores, including only truthful append-only `Expected_surfaces` expansions made while a task was working. The parent revision, seed-only archive, exact tag order, H1 source identity, queued state, canonical final store prefixes, every unchanged pre-existing surface entry, every other task byte, complete remaining active store, and complete appended archive must all match. This exception does not apply to a pull-request branch, another revision, a subset or superset, removed or rewritten surfaces, other modified task content, future tasks, reversal, or ordinary closeout.

Live completion proof is separate. Selection, review evidence, exact-head CI, merge readback, dependency satisfaction, and cleanup use the configured Git and GitHub procedures. Remote unavailability therefore blocks delivery operations but never changes the meaning or result of local structural proof.

Every repository behavior change requires:

- task-assigned focused validation;
- `baseline`;
- `agent-review`;
- final diff inspection;
- task branch push and pull request;
- remote CI when enabled.

Security-sensitive work also requires `security` and `security-review`.

Visible product UI or exact-reference work also requires browser comparison through `frontend-visual`.

Missing required proof blocks completion. It never produces an archived `Pass: true` task.

## Execution Rules

MUST:

- run the narrowest assigned check after each material increment;
- record command, result, evidence, hypothesis, and attempted fix in the scratchpad;
- read prior failed approaches before selecting another fix;
- rerun the failed focused set after a fix;
- rerun every assigned set and `baseline` before candidate delivery;
- use exact configured commands and procedures;
- preserve test strength, security boundaries, approved reference fidelity, and production behavior;
- inspect file responsibility and size growth during review;
- when `.gitattributes` changes, run one controlled `git add --renormalize .`, inspect the complete staged diff, and reject semantic changes outside the active task.

MUST NOT:

- skip a set because another passed;
- change tests only to match incorrect behavior;
- suppress errors, disable rules, or reduce coverage to force success;
- retry the same method without new evidence;
- treat commit, push, review, or CI success alone as complete proof.

## Set Selection

Assign `baseline` and `agent-review` to every code task.

Add:

- `frontend-component`: rendered behavior, interaction, and accessibility;
- `frontend-e2e`: user workflows across boundaries;
- `frontend-visual`: visual or responsive UI behavior in a real browser;
- `security`: auth, permissions, secrets, trust boundaries, or sensitive data;
- `security-review`: security-sensitive change review;
- `smoke`: startup and critical route or service availability.

`bootstrap-preflight` remains only as historical proof for `[T-0001]` and must not be assigned again.

Do not invent validation-set names.

## Registry

| Set | Command or procedure | Proves |
|---|---|---|
| `bootstrap-preflight` | Inspect Git status/history/origin; verify Node `24.19.0`, pnpm `11.18.0`, and GitHub CLI; run authenticated repository, permission, visibility, exact-head branch/PR, and protection readbacks without external mutation | Historical bootstrap prerequisites and safe initial state |
| `baseline` | `pnpm validate` | exact ordered toolchain, format, lint, strict typecheck, annotation, network-free harness-integrity, security, coverage-test, and production-build proof |
| `agent-review` | configured dedicated read-only Codex review | correctness, acceptance, architecture, data, regression, file responsibility, and required reference review |
| `frontend-component` | `pnpm test:component` | rendered states, interaction, accessibility, and contracts |
| `frontend-e2e` | For one unchanged working tree, pass `pnpm test:smoke`, then run `pnpm test:e2e`; Playwright starts only the reusable production build | critical user workflows |
| `frontend-visual` | Dedicated real-browser agent review at task-required viewports and states against every exact artifact assigned by the active spec; missing browser access or required artifact fidelity fails the procedure | responsive layout, hierarchy, states, and exact approved-reference fidelity |
| `security` | `pnpm validate:security` | deterministic security checks, trust-boundary tests, and a production dependency audit at moderate severity or above |
| `security-review` | configured read-only security review | change-specific security regressions and attack paths |
| `smoke` | `pnpm test:smoke` | startup and critical route or service availability |

## Independent Review Gate

The reviewer must not modify the working tree.

Review the complete task diff against `BASE_BRANCH` for:

- task-local acceptance and behavioral correctness;
- security, privacy, auth, and trust boundaries;
- data integrity, migration, rollback, and compatibility;
- architectural boundaries and unnecessary complexity;
- files with multiple primary responsibilities;
- hand-authored runtime source above 250 nonblank lines without a documented split evaluation;
- hand-authored runtime source above 350 nonblank lines without an accepted cohesion rationale;
- error handling, recovery, observability, and concurrency;
- missing or weakened tests;
- required visual fidelity.

Correctness, security, data-loss, architecture, acceptance, file-responsibility, and required visual findings block completion.

The primary task agent applies fixes, reruns affected checks and `baseline`, then requests a fresh review.

## Pass, Archive, and Delivery Sequence

1. keep `Pass: false` during implementation;
2. pass all assigned focused sets and `baseline`;
3. remove temporary task annotations and rerun affected checks;
4. create and push a candidate commit with the task still active and `Pass: false`;
5. open or update the pull request;
6. pass `agent-review`, `security-review` when assigned, and remote CI when enabled;
7. create one closeout commit that changes only `.harness/tasks.md` and `.harness/completed.md`:
   - update the full task block to `Status: passed` and `Pass: true`;
   - append that complete final task block verbatim to `.harness/completed.md`;
   - remove the same task block from `.harness/tasks.md`;
   - preserve all other active and archived entries byte-for-byte;
8. push the closeout commit and require latest-head CI to pass when enabled;
9. merge according to `MERGE_MODE`;
10. prove the task tag and archived entry exist in configured base-branch history;
11. delete the scratchpad and perform post-merge branch cleanup.

The closeout archive entry is provisional until it reaches configured base-branch history.

If any file other than `.harness/tasks.md` or `.harness/completed.md` must change after closeout begins:

- reverse the provisional archive transfer;
- restore the task to `.harness/tasks.md` with `Pass: false` and the appropriate active status;
- remove only its provisional entry from `.harness/completed.md`;
- rerun the complete gate.

If closeout push, latest-head CI, or merge fails before base-branch proof, perform the same reversal before further implementation or redelivery.

After the archived entry reaches configured base-branch history, it is immutable. Never edit, reorder, condense, or delete it.

## Merge Rules

- never push directly to `BASE_BRANCH`;
- pull-request and commit titles begin with the task tag;
- merge preserves the task tag in base-branch Git history;
- manual merge mode stops at a review-clean, CI-green pull request;
- autonomous merge mode uses `MERGE_COMMAND` only after every gate passes;
- queue advancement requires the task tag and completed archive entry in base-branch history.

## Post-Merge Cleanup

After a successful merge:

1. run `git fetch --prune origin`;
2. check out `BASE_BRANCH`;
3. fast-forward only from `origin/BASE_BRANCH`;
4. require local `BASE_BRANCH` and `origin/BASE_BRANCH` to resolve to the same exact SHA;
5. require a clean working tree;
6. prove `BASE_BRANCH` history contains `TASK_TAG`;
7. prove `.harness/completed.md` contains the exact archived task block;
8. prove the pull request is merged and the remote task branch is absent;
9. attempt `git branch -d <TASK_BRANCH>`;
10. if and only if ordinary deletion fails because squash merge left the original task commit outside `BASE_BRANCH` ancestry, run `git branch -D <TASK_BRANCH>`;
11. verify the exact local task branch is absent;
12. delete `.harness/work/<TAG>.md`.

The force-deletion exception applies only to the exact merged local task branch after every proof above. It never authorizes force-push, shared-history rewrite, remote force deletion, or deletion of any other branch.

## Failure Loop

1. keep or restore `Pass: false`;
2. keep or restore the task in `.harness/tasks.md`;
3. remove only a provisional archive entry if one exists;
4. capture the failing command or review finding;
5. record evidence and the current hypothesis;
6. compare against prior failed approaches;
7. apply one bounded evidence-based correction;
8. rerun the focused failure;
9. rerun all assigned sets and `baseline`;
10. redeliver the candidate and recheck review and CI.

Set `Status: blocked` only for unresolved user context, unavailable credentials, external outage, or missing validation capability.
