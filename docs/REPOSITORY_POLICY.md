# Repository Security and Delivery Policy

## Repository Identity

- Canonical repository: `DevDoneDiff/cp`
- GitHub API identity: `visibility: public`, `private: false`
- Base branch: `main`
- Origin transport: HTTPS

## Runtime Product and Code Implementation

- Product/code implementation reaches `main` through a task branch and pull request.
- Repository-required implementation checks are `CI / baseline` and `CI / browser-smoke`.
- Human GitHub approvals required: zero human approvals.
- Linear history, an up-to-date task branch, squash merge (`--squash`), task-branch deletion (`--delete-branch`), resolved review conversations, and non-force task-branch pushes are required by the implementation lifecycle.
- Merge binds the exact pull-request head with `--match-head-commit` and a subject beginning with the task tag.
- The repository consumes no workflow secrets; Actions use least privilege, frozen dependency installation, and immutable action SHAs.

GitHub branch protection is not part of implementation correctness. The repository instructions and implementation delivery procedure own these requirements whether or not hosting refuses alternative operations.

## Documentation and Repository Authority

Non-runtime product and repository authority—including state contracts, product, architecture, design, and MVP documentation, implementation specs, task-authoring metadata, and repository policy—uses:

`inspect -> edit -> focused check if useful -> commit main -> push main -> stop`

This work does not require an implementation task or branch, pull request, independent review, closeout, archive transfer, delivery proof, or pre-push CI gate. If CI runs after a direct push, allow it to run normally. A later failure is new downstream evidence.

## Evidence

Deterministic validation is authoritative for its owned invariants. A stable candidate receives one complete configured validation run, plus only assigned proof outside that baseline. Later changes rerun evidence they could invalidate.

Ordinary implementation requires focused diff review and passing deterministic validation. Independent read-only review is required only when assigned, for high-risk security or authorization work, for destructive or difficult-to-reverse data migration, or when deterministic evidence cannot establish a material property. File length or formatting does not trigger review.

Implementation CI must belong to the exact pull-request head. Immediately before merge, delivery confirms the current base, pull-request head, and repository-required checks. One post-merge readback confirms the reported merge, tagged history, completed-task transfer, and branch cleanup.

## Git Safety

When requested work clearly includes repository delivery, ordinary commits and pushes do not require separate user permission. Use normal non-force pushes for ordinary updates.

Use `--force-with-lease` only for an intentional history rewrite after one current remote-ref read confirms that unexpected remote work will not be destroyed. Never use unconditional `--force`.

## External-Service Failure

A plausibly transient remote failure may be retried once. An ambiguous mutation receives one operation-specific readback. If GitHub, CI, or another required service remains unavailable, preserve current implementation state, report the blocker, and stop.

An outage never authorizes a validator, recovery transition, compatibility bridge, task-specific exception, permanent lesson, alternate lifecycle, or weaker repository semantics.

## Harness-Maintenance Boundary

Harness construction, repair, simplification, and maintenance of repository-governance machinery such as harness skills and validators run only through an explicitly invoked `$harness-maintenance` procedure. They create no product spec or implementation task and have no branch, commit, push, pull-request, CI, review, merge, closeout, or archive lifecycle of their own. Editing non-runtime repository policy or documentation alone uses the lightweight authority path above.

Tracked harness changes remain local and uncommitted. Normal implementation automation preserves them. If a later implementation task naturally includes them, they travel through that task's ordinary delivery without separate maintenance identity.

`.harness/validation.md` owns the exact implementation procedure.
