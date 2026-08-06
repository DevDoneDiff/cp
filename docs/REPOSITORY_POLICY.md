# Repository Security and Implementation Delivery Policy

## Repository Identity

- Canonical repository: `DevDoneDiff/cp`
- GitHub API identity: `visibility: public`, `private: false`
- Base branch: `main`
- Origin transport: HTTPS

## Protected Implementation Delivery

- Product/code implementation reaches `main` through a task branch and pull request.
- Required checks are `CI / baseline` and `CI / browser-smoke`.
- Human GitHub approvals required: zero human approvals.
- Linear history, an up-to-date task branch, squash merge (`--squash`), task-branch deletion (`--delete-branch`), resolved review conversations, no force push, and no administrator bypass are required where supported.
- Merge binds the exact pull-request head with `--match-head-commit` and a subject beginning with the task tag.
- The repository consumes no workflow secrets; Actions use least privilege, frozen dependency installation, and immutable action SHAs.

If hosting cannot enforce a required merge-safety property, delivery stops unless the configured procedure provides an equivalent atomic guarantee. Unsupported protection is never reported as active.

## Evidence

Deterministic validation is authoritative for its owned invariants. A stable candidate receives one complete configured validation run, plus only assigned proof outside that baseline. Later changes rerun evidence they could invalidate.

Ordinary implementation requires focused diff review and passing deterministic validation. Independent read-only review is required only when assigned, for high-risk security or authorization work, for destructive or difficult-to-reverse data migration, or when deterministic evidence cannot establish a material property. File length or formatting does not trigger review.

Required CI must belong to the exact pull-request head. Immediately before merge, delivery confirms the current base, pull-request head, required checks, and no-bypass condition. One post-merge readback confirms the reported merge, tagged history, completed-task transfer, and branch cleanup.

## External-Service Failure

A plausibly transient remote failure may be retried once. An ambiguous mutation receives one operation-specific readback. If GitHub, CI, or another required service remains unavailable, preserve current implementation state, report the blocker, and stop.

An outage never authorizes a validator, recovery transition, compatibility bridge, task-specific exception, permanent lesson, alternate lifecycle, or weaker repository semantics.

## Control-Plane Boundary

Harness construction, repair, simplification, and repository-governance maintenance run only through an explicitly invoked `$harness-maintenance` procedure. They create no product spec or implementation task and have no branch, commit, push, pull-request, CI, review, merge, closeout, or archive lifecycle of their own.

Tracked harness changes remain local and uncommitted. Normal implementation automation preserves them. If a later implementation task naturally includes them, they travel through that task's ordinary delivery without separate maintenance identity.

`.harness/validation.md` owns the exact implementation procedure.
