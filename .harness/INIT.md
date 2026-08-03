# Repository Foundation Source Brief

## Purpose

Input for an explicit `$spec-authoring` run that creates the first bounded build spec.

This file is a source brief, not an approved implementation spec and not a task list.

## Required Output

Create:

```text
docs/specs/A-repository-foundation.md
```

The draft must use `docs/specs/SPEC_TEMPLATE.md`, remain `Approved: false`, and contain no task tags or implementation code.

## End State to Specify

A new repository can support disciplined Codex implementation through:

- initialized Git history and a configured base branch
- one task branch per approved task
- pinned runtime, package-manager, framework, and test-tool versions
- dependency installation and development commands
- format, lint, strict typecheck, unit, integration, component, browser, build, and smoke foundations
- GitHub Actions for required validation
- pull-request creation and status commands
- Codex read-only review procedure
- manual and autonomous merge command behavior
- a merge strategy that preserves the task tag in base-branch Git history
- branch protection or GitHub ruleset
- environment-variable examples and local Codex setup
- replacement of every required `<unset>` value in `.harness/validation.md`
- a runnable minimal application shell suitable for later product specs

## Required Decisions

The spec-authoring run must identify and ask for any unresolved material choice, including:

- repository owner, name, visibility, and remote-creation authority
- base branch
- package manager and pinned runtime versions
- exact framework and testing versions
- CI provider and required checks
- pull-request and merge commands
- branch-protection or ruleset policy
- local environment assumptions on Windows and CI

Do not infer these decisions when multiple valid choices remain.

## Bootstrap Contract

The approved foundation spec must authorize exactly one task with:

```text
Tag: [T-0001]
Bootstrap: true
```

When Git does not yet exist, that task may create one initial base-branch commit containing only preexisting harness, approved documents, approved references, the approved foundation spec, and the approved task queue. Application implementation begins only after the task branch is created.

Before candidate delivery, the task must replace every required validation and delivery placeholder, run the resulting normal gates, open a pull request, and pass configured review and CI.

## Non-Goals

- no product feature behavior
- no provider integration
- no production database schema beyond foundation needs explicitly approved by the spec
- no product-specific UI beyond a minimal smoke surface
- no speculative infrastructure or generalized platform abstractions
