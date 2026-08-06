# Repository Security and Delivery Policy

## Repository identity

- Canonical repository: `DevDoneDiff/cp`
- GitHub API visibility: `visibility: public`, `private: false`
- Base branch: `main`
- Origin transport: HTTPS

## Required repository configuration

- Pull requests are required for implementation changes to `main`.
- Human GitHub approvals required: zero human approvals.
- Required checks are exactly `CI / baseline` and `CI / browser-smoke`.
- Require resolved review conversations where GitHub supports the control.
- Require linear history and an up-to-date task branch.
- Allow squash merge only and delete the task branch after merge.
- Permit no force push or base-branch deletion.
- Permit no administrator bypass or other bypass actor.
- Signed commits are not required and the merge queue is disabled.

If the hosting plan cannot enforce a required control, the pull-request procedure must record the unavailable control and apply its procedural equivalent. Unsupported protection must never be reported as active.

## Guarded autonomous delivery

- Independent read-only correctness review, including security implications, is mandatory for every implementation task and is bound to the exact recorded candidate-content SHA. Security-sensitive work must assign and run a dedicated security review against that same SHA under the canonical validation registry; a missing assignment is a blocking task-authoring defect. Any applicable content change invalidates prior review.
- Durable pull-request evidence records reviewer identity or run ID, independent role, review type, exact candidate-content SHA, result, and findings or `none`. Reviewers never modify the worktree or external state; only the primary task agent repairs findings and reruns proof.
- Task closeout atomically transfers the final task block from the active queue to the completed archive. Candidate review carries forward only when executable proof binds the candidate as the closeout commit's direct parent, rejects every changed path outside the two task stores, and validates their exact authorized transform; the pull request records both SHAs, the exact path set, and the result. The closeout commit has a separate latest-head SHA and must rerun both required checks.
- Before merge, fetch `origin/main`; a base advance requires a non-force branch update and complete redelivery.
- Merge uses `--squash`, `--delete-branch`, and `--match-head-commit <EXPECTED_HEAD_SHA>` with no `--admin` option.
- The squash subject starts with the task tag so base-branch history preserves execution authority.
- Completion requires readback of the merged PR, merge ancestry, tagged subject, and absent remote task branch.

## Evidence

The pull request's exact-SHA review records, GitHub check runs, protection API readback, guarded merge result, and `origin/main` history are the durable evidence. Local credentials and task scratchpads remain uncommitted.

`.harness/validation.md` owns the exact review, closeout, reversal, merge, recovery, and cleanup procedures.
