# Harness Execution Hardening

## Status

- State: approved
- Approved: true

## Identity

- Sequence: A1
- Outcome: Remove the proven Windows line-ending and post-squash local branch-cleanup ambiguities without changing product behavior.
- Depends_on: docs/specs/A-repository-foundation.md
- Approval_scope: Authorizes exactly one maintenance task, `[T-0006] Harness execution hardening`.

## Authority

- `AGENTS.md` owns global Git safety and routes exact delivery procedures to `.harness/validation.md`.
- `.harness/validation.md` owns executable validation, merge, and post-merge cleanup procedures.
- `.harness/tasks.md` owns task state, dependencies, scope, and scratchpad lifecycle.
- `.agents/skills/code-change-verification/SKILL.md` routes completion work to the procedure owned by `.harness/validation.md`.
- Git owns history.

## End State

- Repository text uses deterministic LF checkout behavior across Windows, WSL, and CI.
- Windows `.bat` and `.cmd` files retain CRLF.
- Post-squash local task-branch cleanup has one explicit, narrowly bounded force-deletion exception.
- Passed task entries clearly treat deleted scratchpad paths as historical lifecycle paths.
- Product runtime, UI, architecture, dependencies, and validation strength remain unchanged.

## Scope

### In Scope

- Add root `.gitattributes` containing:

```gitattributes
* text=auto eol=lf
*.bat text eol=crlf
*.cmd text eol=crlf
```

* Perform one controlled repository renormalization.
* Inspect the complete staged diff and reject any unapproved semantic source change.
* Update `AGENTS.md` to route the sole destructive Git exception to `.harness/validation.md`.
* Add the exact post-merge cleanup procedure to `.harness/validation.md`.
* Route `$code-change-verification` completion through that owned cleanup procedure.
* Clarify passed-task scratchpad-path semantics in `.harness/tasks.md`.

### Non-Goals

* Product runtime or UI changes.
* `[T-0005]` implementation.
* Node, pnpm, npm, NVM, PATH, or workstation configuration.
* `.harness/LESSONS.md` changes.
* Validator, fixture, test, annotation-header, dependency, CI-cycle, or task-state redesign.
* WSL migration or ChatGPT desktop worktree configuration.
* Force-push, shared-history rewrite, remote force deletion, or base-branch deletion.

## Required Behavior

1. `.gitattributes` contains only the approved three-line policy.
2. Controlled renormalization must not introduce semantic application changes.
3. Ordinary local task-branch deletion uses `git branch -d`.
4. `git branch -D` is permitted only when:

   * the guarded squash merge succeeded;
   * the pull request is proven merged;
   * the task tag exists in synchronized base-branch history;
   * the remote task branch is absent;
   * the worktree is clean;
   * local base branch equals the remote base branch;
   * ordinary deletion failed solely because squash ancestry excludes the original task commit.
5. Force deletion names only the exact merged local task branch.
6. No other destructive Git exception exists.
7. A passed task's `Scratchpad` field records its former lifecycle path; the file is expected to be absent after merged cleanup.

## Expected Surfaces

* `.gitattributes`
* `AGENTS.md`
* `.harness/validation.md`
* `.harness/tasks.md`
* `.agents/skills/code-change-verification/SKILL.md`

No product source file may change.

## Validation

* `baseline`
* `agent-review`
* complete staged-diff inspection
* controlled renormalization inspection
* normal pull-request, CI, guarded merge, and post-merge cleanup proof

## Acceptance Criteria

* `.gitattributes` enforces LF for ordinary text and CRLF only for `.bat` and `.cmd`.
* Renormalization produces no unapproved semantic change.
* All harness layers agree that `.harness/validation.md` solely owns the exact post-merge cleanup procedure.
* Exact-target local force deletion is available only under the complete proven squash-merge conditions.
* The exception cannot authorize force-push, shared-history rewrite, remote force deletion, base-branch deletion, or unrelated branch deletion.
* Passed scratchpad paths are explicitly historical.
* Baseline and independent review pass.
* No product behavior changes.

## Open Questions

* none

Success: `Test-Path docs/specs/A1-harness-execution-hardening.md` returns `True`.