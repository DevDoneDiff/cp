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
CI_STATUS_COMMAND: Bind the sole exact-identity PR and its headRefOid to EXPECTED_HEAD_SHA; run gh pr checks <PR> --repo DevDoneDiff/cp --json name,bucket,state,link,workflow; require the exact CI / baseline and CI / browser-smoke names with bucket pass and no missing, duplicate, conflicting, or substituted required result; then reread the same PR identity and unchanged headRefOid
EXACT_HEAD_CI_PROCEDURE: Require the configured-repository head and base identities, remote branch SHA, PR headRefOid, EXPECTED_HEAD_SHA, both exact required check results, and the post-query PR headRefOid readback to describe one unchanged closeout head; record the check identities and links
PRE_MERGE_BASE_REFRESH_PROCEDURE: Immediately before either manual or autonomous merge, run git fetch --prune origin without changing the working tree or current branch; record the exact fetched origin/BASE_BRANCH as EXPECTED_BASE_SHA; require it to be an ancestor of EXPECTED_HEAD_SHA, require the exact remote task branch and sole PR headRefOid still equal EXPECTED_HEAD_SHA, require atomic server-side up-to-date and no-bypass enforcement, and repeat complete non-force redelivery if the fetched base advanced
MERGE_COMMAND: gh pr merge <PR> --repo DevDoneDiff/cp --squash --delete-branch --match-head-commit <EXPECTED_HEAD_SHA> --subject "<TASK_TAG> <TITLE>"
MERGE_READBACK_PROCEDURE: Fetch origin/main, reread the same PR as MERGED, bind its base/head identities and reported mergeCommit OID, require that exact OID reachable from fetched origin/main and its first parent equal EXPECTED_BASE_SHA, verify the tagged subject and exact first-parent archive introduction plus active absence, then synchronize local main by fast-forward only
REMOTE_OUTCOME_READBACK_PROCEDURE: Before each remote mutation record its operation type, repository, exact target, expected before identity, intended after identity or payload digest, EXPECTED_HEAD_SHA and EXPECTED_BASE_SHA when applicable, one immutable non-secret ROOT_OPERATION_ID, and ATTEMPT 0 or 1; after any failure, timeout, interruption, or uncertain response perform operation-specific authenticated readback and classify only proven-applied, proven-not-applied, or unresolved before any retry, reversal, cleanup, or other mutation; one logical root intent permits at most one total mutation retry
POST_MERGE_CLEANUP_PROCEDURE: Only after canonical durable completion, run the exact idempotent Post-Merge Cleanup procedure; bind every action to the recorded task, full branch ref, PR, closeout SHA, merge OID, and fetched base, accept already-absent exact branches only after that proof, require atomic expected-old compare-and-delete for every destructive ref operation, use the ordinary merged-ancestry path before the guarded squash-only exception, preserve completed state and recovery evidence on failure, and retry only the first incomplete cleanup step
AGENT_REVIEW_PROCEDURE: dedicated read-only Codex review of the exact candidate-content SHA against BASE_BRANCH
SECURITY_REVIEW_PROCEDURE: dedicated read-only security review of the exact security-sensitive candidate-content SHA against BASE_BRANCH
CLOSEOUT_REVIEW_INHERITANCE_PROCEDURE: Require a clean tree at CLOSEOUT_SHA; require `git rev-parse <CLOSEOUT_SHA>^` to equal CANDIDATE_CONTENT_SHA; require `git diff --name-only --no-renames <CANDIDATE_CONTENT_SHA> <CLOSEOUT_SHA>` as a set to equal only `.harness/tasks.md` and `.harness/completed.md`; run `pnpm validate:harness` at CLOSEOUT_SHA to prove the exact two-store transform; record both SHAs, the exact path set, and the harness result in the pull request
```

A task cannot have `Ready: true` when a required command or procedure is unset.

Historical `[T-0001]` consumed the one-time bootstrap exception. No future task may use `Bootstrap: true`.

## Task Claim and Same-Task Resumption

The invocation environment must serialize autonomous primary executors before this procedure begins. The checks below detect stale or competing repository state. They are not a distributed lock and do not protect against improperly simultaneous invocations.

### New task claim

Before any authorized source edit:

1. Inventory the complete current branch, HEAD, index, worktree, active queue, counters, and task scratchpads. Use a narrow read-only lookup that returns only archive identities and the terminal boundary needed to detect duplicate representation or provisional closeout; do not load archived task blocks into ordinary context. Preserve every pre-existing change. An unexplained staged change or overlap with the selected task blocks the claim.
2. Fetch and prune the configured remote, require authenticated GitHub readback, and prove the local configured base is the exact fetched base. An unavailable or ambiguous remote read blocks autonomous claiming.
3. Select the first task in active queue order satisfying `Status: queued`, `Ready: true`, `Pass: false`, `Blocker: none`, and the canonical dependency procedure. Prove no other active task is `working`, no provisional closeout is awaiting delivery, and no durably completed task has any retained scratchpad. The one-time authorized H1 batch may retain its task scratchpads only before its combined final merge; that exception ends as soon as final H1 post-merge cleanup begins and never permits queue advancement past incomplete cleanup.
4. Enumerate and classify every local and remote branch matching `BRANCH_PATTERN` and every open pull request. Separately inspect the current non-task branch and every open non-task pull request for changes to `.harness/tasks.md`, its counters, `.harness/validation.md`, or task-execution authority in `AGENTS.md`. Any different live task claim, same-tag reference, provisional closeout, or active conflicting queue-authoring work blocks selection; an inactive unrelated local non-task branch is preserved but is not a claim.
5. Derive the one branch named by `BRANCH_PATTERN`. A pre-existing local branch, remote branch, or pull request with that identity is a conflict unless the same-task resumption procedure has just proved its exact identity and explicitly authorized local-branch reuse for a fresh claim. Never overwrite, force-update, or reinterpret a reference.
6. Create the task branch from the proven base or reuse only the exact local branch authorized by the immediately preceding same-task resumption proof, while preserving inventoried non-overlapping local changes. Change only the selected task from `Status: queued` to `Status: working`, create its ignored scratchpad, and commit a claim whose subject begins with the exact task tag. Do not edit an authorized source surface in the claim commit.
7. Publish the branch with the configured non-force push, then read back the exact remote branch SHA and require it to equal the local claim SHA. Only that successful readback establishes the repository claim and permits source mutation.

A proven conflicting reference or changed base stops the claim before source mutation and may transition the active `Pass: false` task to `blocked` only when no remote operation is unresolved. A failed, timed-out, interrupted, or uncertain claim push or readback instead enters `REMOTE_OUTCOME_READBACK_PROCEDURE`. Proven application of the exact claim SHA establishes publication without another push; proven non-application permits only the root intent's bounded continuation; unresolved state preserves the exact `working` claim commit and every tracked surface, records evidence only in the ignored scratchpad, and stops before source mutation. Never write `Blocker` or change task status while claim publication is uncertain.

### Frozen working-claim reconciliation

An invocation may re-enter an unresolved claim only when the active task remains `working`/`Pass: false`, its scratchpad records the immutable claim-publication `ROOT_OPERATION_ID`, and the exact local branch tip is the original claim commit with no authorized source change after it.

1. Rehydrate the recorded intent without changing its identity or attempt count. Require a clean index and tracked worktree, byte-identical task stores at the claim commit, the exact configured branch, task tag, `Source_spec_id`, and `Brick_id`, and no later local commit.
2. Repeat authenticated remote-ref, all-state pull-request, fetched-base, active-store, narrow archive-boundary, and competing-claim readback. Classify the original publication intent only through `REMOTE_OUTCOME_READBACK_PROCEDURE`; any partial, moved, duplicate, conflicting, or unavailable result remains unresolved and preserves the frozen state.
3. On proven application, require the exact remote task branch to equal the recorded claim SHA, rerun every current claim, dependency, artifact, and conflicting-authoring check, record the resolution in the scratchpad and eventual PR evidence, and continue from source-mutation eligibility without changing task status or repeating the push.
4. On proven non-application, require the exact remote task branch and matching pull request to be absent. After current claim preconditions pass, use only the same root intent's unspent `ATTEMPT: 1` publication retry. If that retry is proven not applied, record the resolved blocker in the scratchpad and only then permit a separate validated local transition to `blocked`; no source mutation or further publication retry is authorized.
5. A later blocked-task resumption uses the procedure below. No transition to `blocked`, `queued`, or another branch identity is permitted until the original publication outcome is proven.

### Same-task resumption

A task already in `blocked` state resumes only through an explicit primary-agent transition:

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

Remote CI is accepted only through `EXACT_HEAD_CI_PROCEDURE`. Check-name prefix matching, a successful result from another workflow or SHA, a stale pre-query result, a missing configured check, a conflicting duplicate, or a PR-head change during the query fails the gate. Repository protection readback must separately show that its required-check set is exactly `CI / baseline` and `CI / browser-smoke`; other informational checks do not substitute for either required identity.

One compatibility path exists only for this authorized H1 batch delivery: when configured `main` has exact parent `5d515d9f8224ed607219fd5f29d0f20305fdcc16`, structural validation may accept the single exact passed transform of the original queued T-0008 through T-0039 stores, including only truthful append-only `Expected_surfaces` expansions made while a task was working. The parent revision, seed-only archive, exact tag order, H1 source identity, queued state, canonical final store prefixes, every unchanged pre-existing surface entry, every other task byte, complete remaining active store, and complete appended archive must all match. This exception does not apply to a pull-request branch, another revision, a subset or superset, removed or rewritten surfaces, other modified task content, future tasks, reversal, or ordinary closeout.

Live completion proof is separate. Selection, review evidence, exact-head CI, merge readback, dependency satisfaction, and cleanup use the configured Git and GitHub procedures. Remote unavailability therefore blocks delivery operations but never changes the meaning or result of local structural proof.

The candidate-content SHA is the exact committed task head with the task still active at `Pass: false` after all applicable source, test, configuration, authority, annotation, and validation changes. Independent review evaluates that immutable commit against `BASE_BRANCH`. A worktree description, branch name, moving branch tip, local diff, or later commit is not equivalent evidence.

Every implementation task requires:

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

Assign `baseline` and `agent-review` to every implementation task.

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
| `agent-review` | configured dedicated read-only Codex review | correctness, acceptance, architecture, data, regression, file responsibility, required references, and security implications |
| `frontend-component` | `pnpm test:component` | rendered states, interaction, accessibility, and contracts |
| `frontend-e2e` | For one unchanged working tree, pass `pnpm test:smoke`, then run `pnpm test:e2e`; Playwright starts only the reusable production build | critical user workflows |
| `frontend-visual` | Dedicated real-browser agent review at task-required viewports and states against every exact artifact assigned by the active spec; missing browser access or required artifact fidelity fails the procedure | responsive layout, hierarchy, states, and exact approved-reference fidelity |
| `security` | `pnpm validate:security` | deterministic security checks, trust-boundary tests, and a production dependency audit at moderate severity or above |
| `security-review` | configured read-only security review | change-specific security regressions and attack paths |
| `smoke` | `pnpm test:smoke` | startup and critical route or service availability |

## Independent Review Gate

Every reviewer is independent and read-only. The reviewer must not modify the working tree, candidate branch, pull request, task stores, evidence, or any external state. Only the primary task agent repairs findings and reruns proof.

Before review, resolve and record the exact candidate-content SHA. The reviewer must identify that same SHA and review its complete task diff against `BASE_BRANCH`.

Review the complete task diff against `BASE_BRANCH` for:

- task-local acceptance and behavioral correctness;
- security, privacy, auth, and trust boundaries;
- data integrity, migration, rollback, and compatibility;
- architectural boundaries and unnecessary complexity;
- files with mixed layers, multiple or independently evolving reasons to change, reversed dependency direction, or obscured proof boundaries;
- hand-authored runtime source above 250 nonblank lines without a documented primary-responsibility and reason-to-change evaluation;
- hand-authored runtime source above 350 nonblank lines without explicit independent review escalation and an accepted cohesion or proof-quality rationale when it remains large;
- error handling, recovery, observability, and concurrency;
- missing or weakened tests;
- required visual fidelity.

Correctness, security, data-loss, architecture, acceptance, file-responsibility, and required visual findings block completion.

The primary task agent applies fixes, reruns affected checks and `baseline`, then requests a fresh review.

The pull request records durable evidence for each required review: reviewer identity or run ID, independent role, review type, exact candidate-content SHA, result, and findings or `none`. Any applicable content change after review invalidates that review, creates a new candidate-content SHA, and requires fresh review and evidence.

The provisional closeout commit may inherit the candidate-content review only when `CLOSEOUT_REVIEW_INHERITANCE_PROCEDURE` binds the direct candidate parent and closeout SHA, rejects every changed path outside the two task stores, and executable harness proof establishes their exact authorized transfer. The pull request preserves those results as durable inheritance evidence. Required latest-head CI remains separate and must pass for the exact closeout SHA. Any missing, failed, or ambiguous inheritance proof, or any other post-review change, invalidates inheritance, reverses closeout when applicable, and requires a new candidate-content review.

## Pass, Archive, and Delivery Sequence

1. keep `Pass: false` during implementation;
2. pass all assigned focused sets and `baseline`;
3. remove temporary task annotations and rerun affected checks;
4. create and push a candidate commit with the task still active and `Pass: false`;
5. open or update the pull request;
6. pass `agent-review`, `security-review` when assigned, record their exact-SHA evidence in the pull request, and pass remote CI when enabled;
7. complete the pre-closeout lesson-disposition checkpoint below; any resulting tracked change returns to step 2 and requires a new candidate SHA, review, and CI before closeout;
8. create one closeout commit that changes only `.harness/tasks.md` and `.harness/completed.md`:
   - update the full task block to `Status: passed` and `Pass: true`;
   - append that complete final task block verbatim to `.harness/completed.md`;
   - remove the same task block from `.harness/tasks.md`;
   - preserve all other active and archived entries byte-for-byte;
9. run `CLOSEOUT_REVIEW_INHERITANCE_PROCEDURE`; inherit candidate review only on its exact successful evidence, otherwise obtain fresh review of the closeout SHA;
10. push the closeout commit and require latest-head CI to pass when enabled;
11. merge according to `MERGE_MODE`;
12. pass the complete canonical completion proof for the task;
13. delete the scratchpad and perform post-merge branch cleanup.

### Pre-closeout lesson disposition

While the task remains active at `working`/`Pass: false`, the primary task agent must inspect its scratchpad evidence against the existing qualification criteria in `.harness/LESSONS.md`:

1. Promote every qualifying reusable lesson to `.harness/LESSONS.md` using its existing format and record the exact promoted lesson heading or headings under `Lesson disposition` in the task scratchpad.
2. If no evidence qualifies, record `Lesson disposition: none` with one concise reason in the task scratchpad. Do not create a completed-task summary or copy debugging noise merely to avoid `none`.
3. Re-evaluate disposition after any review finding, CI failure, recovery, or other material evidence discovered after the prior decision.
4. Treat any tracked lesson promotion as ordinary task content: rerun affected proof and `baseline`, create a new candidate-content SHA, and repeat every required exact-SHA review and CI gate. The scratchpad-only `none` record does not change candidate content.
5. Provisional closeout cannot begin until the latest scratchpad disposition covers all task evidence and is either the exact promoted heading list or `none`.

Post-merge scratchpad deletion is cleanup only. It must never be the first or only lesson evaluation and cannot substitute for this checkpoint.

The closeout archive entry is provisional until it reaches configured base-branch history.

In manual merge mode, stop after review-clean exact closeout-head CI with the task claim, pull request, branch, provisional archive entry, and scratchpad intact while awaiting the user's guarded merge decision. Do not advance the queue. A wait is not a failure and does not trigger reversal. Explicit pre-merge withdrawal runs the exact reversal below and records the case in durable pull-request evidence.

If any file other than `.harness/tasks.md` or `.harness/completed.md` must change after closeout begins:

- first restore only the affected complete task block byte-for-byte to its exact pre-closeout active-queue position (`Status: working`, `Pass: false`) and remove only that task's provisional archive block;
- preserve every other active and archived byte, order, prefix, and counter;
- run `pnpm validate:harness` to prove the exact reversal;
- only after that exact reversal is committed and proven, apply any required user-directed or blocker state through separate ordinary validated active-state transitions; never combine another status change with reversal;
- rerun the complete gate.

If closeout push, latest-head CI, or merge returns a failed, timed-out, interrupted, or otherwise uncertain result before base-branch proof, run `REMOTE_OUTCOME_READBACK_PROCEDURE` first. Perform reversal only after readback proves non-application and the canonical continuation requires withdrawal or redelivery. Unresolved readback preserves the provisional state and stops; proven merge application is durable and is never reversed.

The pull request records read-only procedure evidence for any explicit pre-merge withdrawal, exact reversal, or failed closeout: task tag, candidate and closeout SHAs when present, trigger, before/after store identities, exact affected paths, harness result, resulting active status, and confirmation that unrelated blocks were preserved.

After the archived entry reaches configured base-branch history, it is immutable. Never edit, reorder, condense, or delete it.

## Canonical Completion and Dependency Proof

For every post-H1 task, completion and dependency satisfaction are the same predicate. From authenticated GitHub and fetched configured-base readback, prove all of the following refer to one identity:

1. exactly one pull request for the exact configured-repository task branch is merged into `BASE_BRANCH`;
2. its reported merge commit OID identifies the exact fetched commit being evaluated and is reachable from `origin/BASE_BRANCH`;
3. that exact merge commit's first parent equals the `EXPECTED_BASE_SHA` captured by its immediate guarded pre-merge procedure;
4. that exact merge commit subject preserves the task tag;
5. compared with its first parent, that merge introduces the task's exact final archived block with `Status: passed` and `Pass: true`;
6. the same merge tree contains no active block for the task tag;
7. the exact remote task branch is absent.

Tag-only history, archive-only state, active/archive duplication, an unmerged or different pull request, a mismatched or unreachable merge SHA, a branch that still exists, provisional closeout, or local-only evidence fails the predicate. Queue selection evaluates every dependency through this same proof.

T-0001 through T-0007 satisfy dependencies only through the immutable seed provenance and their existing tagged base-branch history. They are never represented as having executed this procedure, and the seed exception cannot apply to any later tag.

## Exact-Head CI, Base Refresh, and Guarded Merge

After provisional closeout and before either manual or autonomous merge:

1. Resolve exactly one pull request in `DevDoneDiff/cp` whose head repository is `DevDoneDiff/cp`, head ref is the exact task branch, base ref is `BASE_BRANCH`, and `headRefOid` equals the remote task-branch SHA and `EXPECTED_HEAD_SHA`. A fork, duplicate, wrong base, mismatched remote branch, or moving PR head fails the identity gate.
2. Run `EXACT_HEAD_CI_PROCEDURE`. Accept only successful results named exactly `CI / baseline` and `CI / browser-smoke` for that unchanged head. Reread the PR after the checks query and fail if its identity or `headRefOid` changed.
3. Immediately before merge, run `git fetch --prune origin` without changing the working tree or current branch and record the exact fetched `origin/BASE_BRANCH` SHA as `EXPECTED_BASE_SHA`. Reread repository protection or ruleset state and require the configured pull-request, linear-history, up-to-date-branch, squash-only, exact-required-check, branch-deletion, force-push, base-deletion, and no-bypass controls. Server-enforced up-to-date and no-bypass protection is non-substitutable unless the merge API provides an atomic expected-base primitive that is bound to `EXPECTED_BASE_SHA`; if neither exists, guarded merge is unavailable and must stop. A timing-only procedural check is never equivalent. Other unavailable hosting controls use only their already documented procedural equivalents.
4. Require the fetched `origin/BASE_BRANCH` SHA to be an ancestor of `EXPECTED_HEAD_SHA`, and reread the exact remote task branch and pull request to require both still equal `EXPECTED_HEAD_SHA`. A stale base, stale head, missing check, wrong identity, or bypass-capable merge path blocks merge.
5. If the fetched base differs from the base used for the current candidate delivery or is not an ancestor of the closeout head, do not merge. First perform and prove the exact provisional reversal. Then merge the fetched base into the retained task branch with ordinary history-preserving Git, reconcile only the task-authorized result, and commit the active `working`/`Pass: false` state. Never rebase a published task branch, force-push, discard either side, or reuse the stale candidate review. Treat the resulting committed head as a new candidate and repeat complete local validation, exact-SHA reviews, provisional closeout, inheritance proof, non-force push/readback, and exact-head CI.
6. Repeat the immediate fetch and all freshness checks after any redelivery. Any further base advance restarts step 5; prior green checks never authorize a later head or base.
7. In manual mode, preserve the proven closeout and stop for the user's merge decision. Once authorized, manual and autonomous delivery both rerun steps 1 through 4 and use only `MERGE_COMMAND`, with the exact closeout SHA, squash mode, tagged subject, branch deletion, and no `--admin` or other bypass.
8. After the merge attempt has an unambiguous successful result, run `MERGE_READBACK_PROCEDURE`. Require the same PR to report `MERGED`, its reported merge commit OID to be reachable from the freshly fetched configured base, and that merge commit's first parent to equal `EXPECTED_BASE_SHA`. Then require the exact commit's subject to begin with the task tag, its first-parent diff to introduce the exact final archived block while omitting the active block, and the remote task branch to be absent. A different first parent proves a base race or bypass and blocks completion and queue advancement. Fast-forward local `BASE_BRANCH` to the exact fetched remote tip and require equal SHAs and a clean tree. Only the canonical completion predicate may then advance the queue.

The pull request records the exact candidate and closeout SHAs, PR and branch identity, required check names/results/links, reviewed base SHA, `EXPECTED_BASE_SHA`, atomic up-to-date/no-bypass enforcement readback, any base-advance reversal and complete redelivery, guarded merge invocation, reported merge OID, exact merge first-parent equality, ancestry and first-parent diff results, synchronized base SHA, and remote branch absence. Include at least one read-only base-advance procedure case and one completed-merge readback case. T-0032 owns failed or ambiguous remote-command classification and retry behavior.

## Remote Operation Outcome Reconciliation

Use `REMOTE_OUTCOME_READBACK_PROCEDURE` for every remote mutation and for every failed, timed-out, interrupted, disconnected, cancelled, or uncertain remote result. Before an operation begins, record a non-secret logical intent containing one immutable `ROOT_OPERATION_ID`, `ATTEMPT: 0`, operation type, configured repository, exact target identity, expected before state, intended after state or canonical payload digest, and applicable PR, branch, head, and base identities. A retry retains that root identity and uses `ATTEMPT: 1`; changing operation IDs never resets its budget. Never record credentials, tokens, request headers, or secret-bearing output.

After an uncertain result, make no further remote or task-store mutation. Use authenticated independent readback and assign exactly one state:

- `proven-applied`: the one exact intended target has the complete intended after identity or payload and all bound repository, branch, PR, head, and base identities agree. Continue from the next lifecycle step without repeating the operation.
- `proven-not-applied`: the one exact target remains at the complete recorded before identity, and the intended reference, payload marker, state change, or merge is absent. Recheck all current preconditions, then permit either the root intent's single `ATTEMPT: 1` retry or the canonical exact provisional reversal when withdrawal or redelivery requires it. Reconcile an uncertain retry under the same root identity. If attempt 1 is proven not applied, stop and record the blocker in the scratchpad; no further mutation retry is authorized. A genuinely new root intent requires a resolved prior outcome plus a materially changed precondition or new explicit authority recorded before execution.
- `unresolved`: readback is unavailable, unauthenticated, partial, multiply matched, contradictory, at neither recorded identity, or disagrees across Git and GitHub. Preserve the task stores, branch, index, tracked worktree, remote references, PR, provisional archive, and recorded intent byte-for-byte; append only the blocker evidence to the ignored scratchpad. Never transition active state or mutate a provisional archive while uncertainty remains. Stop all retry, reversal, cleanup, branch deletion, evidence rewrite, and queue advancement.

Operation-specific readback is mandatory:

| Operation | Proven application | Proven non-application | Safe continuation |
|---|---|---|---|
| non-force push or remote branch create/update | the exact configured remote ref equals the intended local after SHA and its expected ancestry/identity | the exact ref equals the recorded before SHA, or remains exactly absent for a create | applied: continue to PR or CI; not applied: recheck non-force eligibility and use only the root intent's single retry |
| remote branch deletion or other branch mutation | only the exact intended ref has the intended after state or is absent for deletion | the exact intended ref remains at its recorded before identity | applied: continue from the branch-absence gate; not applied: retry only through the owning lifecycle procedure; T-0034 owns post-merge cleanup authorization |
| pull-request create | exactly one configured-repository PR has the intended head repository/ref/SHA, base ref, and canonical title/body identity | authenticated all-state lookup proves zero matching PRs and the head branch remains at the recorded SHA | applied: reuse that PR; not applied: rerun conflict checks and use only the root intent's single create retry |
| pull-request update or review-evidence write | the sole exact PR retains its bound head/base identity and contains the complete intended field value or unique `ROOT_OPERATION_ID` plus canonical evidence digest exactly once | the same PR retains the complete recorded prior fields and contains no intended root marker or digest | applied: do not duplicate the update; the authenticated unique marker/digest readback is terminal durable proof for an evidence write and requires no self-referential follow-up write; not applied: reread head/base and use only the root intent's single retry |
| CI or status query | a fresh authenticated result binds the sole exact PR, unchanged `EXPECTED_HEAD_SHA`, exact configured check names, and complete states | read-only query non-application has no remote mutation; safe retry requires the same unchanged PR/head identity | continue only from a complete exact-head result; unavailable, partial, stale, or changing results are unresolved |
| guarded merge | `MERGE_READBACK_PROCEDURE` proves the same PR merged, exact reported merge OID, `mergeCommit^ == EXPECTED_BASE_SHA`, configured-base reachability, tagged subject, exact archive/active transition, and remote branch state | the same PR is still open with no merge OID, its exact head/base/remote-branch identities are unchanged, and fetched base history contains no intended tagged archive transition | applied: never reverse and continue to canonical completion; not applied: rerun every exact-head/base/protection gate before one retry, or exactly reverse only for authorized withdrawal/redelivery |

A closed-but-unmerged PR, partial evidence body, moved branch, changed PR head or base, unexpected merge OID, multiple matching PRs, or disagreement between API and Git history is unresolved rather than proven non-application.

Record every case first in the task scratchpad. Once the exact PR evidence surface is writable and identity-bound, durably record the `ROOT_OPERATION_ID`, attempt, operation type and target, redacted intent identities/digest, initiating result, readback sources, exact observed identities, classification, and permitted continuation. The pull request must include read-only procedure cases for proven application, proven non-application, and unavailable or contradictory readback. If an evidence write is itself uncertain, reconcile that write before attempting to append, edit, or duplicate evidence. Its unique marker/digest and authenticated readback are the terminal durable proof of its own application; record that reconciliation only in the scratchpad and never create a second evidence mutation merely to describe the first write. An unresolved evidence write stops. Any exact reversal additionally records the two store identities, exact changed path set, harness result, and unrelated-block preservation proof.

## Merge Rules

- never push directly to `BASE_BRANCH`;
- pull-request and commit titles begin with the task tag;
- merge preserves the task tag in base-branch Git history;
- manual merge mode stops at a review-clean, CI-green pull request;
- manual and autonomous merge use `PRE_MERGE_BASE_REFRESH_PROCEDURE` and `MERGE_COMMAND` only after every exact-head and exact-base gate passes;
- merge success uses `MERGE_READBACK_PROCEDURE`, never command exit status alone;
- queue advancement requires the complete canonical completion proof, not tag or archive presence alone.

## Post-Merge Cleanup

Cleanup starts only after the canonical completion predicate is durably proven. Rehydrate and record the exact `TASK_TAG`, `Source_spec_id`, `Brick_id`, configured repository, `TASK_BRANCH`, candidate and closeout SHAs, PR identity, `EXPECTED_BASE_SHA`, merge OID, and archived-block identity. Mark `Cleanup status: in-progress` in the ignored scratchpad before the first cleanup mutation.

1. Run `git fetch --prune origin` through `REMOTE_OUTCOME_READBACK_PROCEDURE`. Reread the same PR as merged and re-prove its exact branch/base identities, reported merge OID, `mergeCommit^ == EXPECTED_BASE_SHA`, configured-base reachability, tagged subject, exact first-parent archive introduction, active absence, and unchanged archived block. Missing or contradictory durable-completion proof stops cleanup; it never reverses or reopens the task.
2. Inspect only the exact full remote ref `refs/heads/<TASK_BRANCH>`. If absent, accept that achieved state only after step 1's complete identity proof. If it remains at the exact recorded closeout SHA, delete only through a provider or Git ref operation that atomically compares that full ref's expected old value to the recorded closeout SHA in the same transaction. A name-only delete, check-then-delete sequence, provider without expected-old/CAS semantics, different SHA, similarly named ref, unavailable readback, or uncertain deletion blocks cleanup. Reconcile the CAS operation through the root-bound remote-outcome procedure. Never delete another remote ref or recreate an already-absent branch.
3. Check out `BASE_BRANCH`, fast-forward only from `origin/BASE_BRANCH`, and require exact local/remote base SHA equality and a clean tracked worktree. A later base tip may be accepted only when the exact task merge OID remains reachable and its immutable task transition still passes step 1.
4. Inspect only the exact local full ref `refs/heads/<TASK_BRANCH>`. If absent, accept that achieved state only after steps 1 through 3. If present, require it to equal the recorded closeout SHA and not be current or checked out by any worktree. Attempt the ordinary deletion path first: when the closeout SHA has normal merged ancestry to local `BASE_BRANCH`, atomically compare-and-delete the full ref with `git update-ref -d refs/heads/<TASK_BRANCH> <CLOSEOUT_SHA>`. A mismatch fails without deleting the moved ref.
5. If normal ancestry is absent, independently prove that the exact full ref still equals the closeout SHA, is not current or worktree-bound, and the exact proven squash merge alone explains the ancestry gap. Only then use the same expected-old `git update-ref -d` transaction as the narrow force-equivalent squash exception. Never use name-only `git branch -D`, a wildcard, a computed target, or any deletion primitive that cannot compare the old ref to the recorded SHA atomically. Any mismatch or other failure stops. The exception never authorizes force-push, history rewrite, remote force deletion, or deletion of another branch.
6. Verify both exact task branches are absent, local `BASE_BRANCH == origin/BASE_BRANCH`, the same merge/archive/active proofs still hold, the tracked worktree and index are clean, and no cleanup mutation is unresolved.
7. While the scratchpad remains available, write one terminal cleanup-success record to the exact PR containing the task/PR/merge identities, synchronized local and remote base SHA, exact local and remote branch absence, immutable archive and active-absence proof, completed cleanup steps, and confirmation that no remote operation is unresolved. Give that evidence write its own root intent and terminal marker/digest under `REMOTE_OUTCOME_READBACK_PROCEDURE`. If the write is uncertain, preserve the scratchpad, mark cleanup incomplete, and stop. Only proven application of that terminal record permits deletion of `.harness/work/<TAG>.md` as the final cleanup action.

An already-applied branch deletion remains success on retry and is never recreated. If any cleanup step fails or remains unresolved after durable completion:

- never change `Pass`, task status, either task store, the archived block, candidate/closeout/merge history, or implementation evidence;
- preserve the exact local task branch when it has not been deleted, preserve achieved exact branch absence when deletion already applied, and always preserve the scratchpad;
- record `Cleanup status: incomplete`, the durable task/PR/merge identities, completed steps, failed root operation and readback classification, observed branch states, and the first incomplete next step in the scratchpad;
- while any cleanup root operation is unresolved, keep all evidence scratchpad-only and perform no PR write; after the original root is conclusively proven applied or not applied, record the same redacted failure in the exact PR through a separate root-bound evidence operation when that surface is available;
- stop queue advancement.

Cleanup retry begins by re-proving the same canonical durable-completion identity and reading the scratchpad checkpoint. It repeats read-only prerequisite proof, accepts already-achieved exact states, and executes only the first incomplete cleanup action. It never reruns implementation, candidate validation, review, closeout, CI, merge, or completion; never restores a deleted branch; and never reactivates or reverses a durably completed task. The pull request records at least one read-only cleanup-failure and cleanup-only-retry procedure case, and every successful cleanup has the terminal success record required by step 7.

## Pre-Completion Failure Loop

Remote-operation failures enter `REMOTE_OUTCOME_READBACK_PROCEDURE` before this local repair loop. No generic failure step may infer non-application, reverse provisional state, or retry a remote mutation.

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

This loop applies only before canonical durable completion. Post-merge failure uses the cleanup procedure above and cannot mutate task completion state.
