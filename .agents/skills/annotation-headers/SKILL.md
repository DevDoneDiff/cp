---
name: annotation-headers
description: Use when creating or changing meaningful source files that own architectural behavior, compatibility, trust boundaries, data flow, events, or active task context. Skip trivial, generated, vendor, fixture, migration-output, and styling-only files.
---

# Annotation Headers

## Purpose

Maintain localized architectural memory in meaningful source files. Code is authoritative. Headers summarize current responsibility, contracts, relationships, and active work; they do not replace code inspection.

This skill is canonical. Do not keep a duplicate annotation-header guide elsewhere in the repository.

## Coverage

Use for entrypoints, routes, services, orchestrators, domain models with compatibility rules, repositories, adapters, providers, auth, state, queues, events, serialization, trust boundaries, and major UI workflow components.

Skip generated files, vendor code, migration output, barrel exports, constants, fixtures, mocks, trivial wrappers, tiny pure helpers, and styling-only files. Add a header only when architectural meaning is not safely recoverable from the path, exports, signatures, and a brief code read.

## Rules

MUST:

- read implementation before relying on the header
- treat code as authoritative when code and header disagree
- use one header per annotated file
- keep field names and order stable
- keep content current, file-specific, and operational
- omit fields that do not apply
- update the header when architectural meaning changes
- remove temporary task fields before candidate delivery
- use ASCII for field names, task IDs, and anchor IDs

MUST NOT:

- store dates, agent names, edit history, completed tasks, or closeout history
- store speculative future work
- duplicate `.harness/tasks.md` or obvious implementation details
- add giant specs, line-by-line walkthroughs, or coverage-only headers
- preserve stale claims after code proves them wrong

## Field Order

1. `MODULE`
2. `PURPOSE`
3. `PUBLIC API / ENTRYPOINTS` optional
4. `CONTROL_FLOW` optional
5. `INVARIANTS`
6. `BOUNDARIES` optional
7. `RELATED` optional, max 3
8. `SECURITY` conditional
9. `DATA` conditional
10. `EVENTS` conditional
11. `ACTIVE_TASK` temporary
12. `LOCAL_INTENT` temporary

## Field Meaning

- `MODULE`: repository-relative path or stable logical module name.
- `PURPOSE`: one to three lines describing owned responsibility.
- `PUBLIC API / ENTRYPOINTS`: meaningful exports, handlers, jobs, routes, classes, or providers; exclude private helpers.
- `CONTROL_FLOW`: brief architectural sequence showing the wider role; do not narrate implementation.
- `INVARIANTS`: non-obvious contracts whose violation could break behavior, compatibility, security, data, integration, or architecture.
- `BOUNDARIES`: ownership or layer restrictions, forbidden imports, persistence limits, or exclusive data access.
- `RELATED`: up to three directly relevant files or modules; state why each matters.
- `SECURITY`: auth, permissions, secrets, trust transitions, user input, privacy, or provider enablement.
- `DATA`: schemas, persistence, serialization, storage keys, payloads, compatibility fields, or normalization.
- `EVENTS`: emitted or consumed events, jobs, queues, or asynchronous side effects.
- `ACTIVE_TASK`: `[T-####]` or `[R-####]` from `.harness/tasks.md`; use only for formal tracked work.
- `LOCAL_INTENT`: only the file-local part of the active task.

## Inline Anchors

Use sparse semantic anchors only for non-obvious, security-sensitive, compatibility-sensitive, architecturally important, or distributed contracts.

Declare:

```text
- [SEC-LIVE-GATE] Live access requires request intent and an enabled environment toggle.
```

Mark enforcing code:

```text
// @ah SEC-LIVE-GATE
```

Anchor IDs:

- use uppercase ASCII letters, numbers, and hyphens
- use semantic names, not decimal numbering
- remain stable when code moves
- are unique within the file
- use prefixes such as `INV`, `SEC`, `DATA`, `COMPAT`, `FLOW`, `BOUNDARY`, or `EVENT`

Every anchored ID needs a marker. Every marker must be declared. Do not anchor every function or treat anchor presence as semantic proof.

## Lifecycle

### Inspect

- read the header, implementation, relevant tests, and applicable anchors
- follow `RELATED` only when needed
- identify stale claims before editing

### Prepare

- confirm the task has `Status: working`
- add `ACTIVE_TASK` and `LOCAL_INTENT` when formal work affects the file
- add or repair durable fields only when needed

### Execute

- use the header as local context
- update durable fields when behavior or architecture changes
- update anchors when enforcement moves or changes
- record file-level scope expansion in the task

### Validate and close

1. reconcile header claims with final code
2. verify declared anchors and markers
3. remove `ACTIVE_TASK` and `LOCAL_INTENT`
4. run affected focused checks and `baseline`
5. keep durable fields and valid anchors
6. use Git for history

If review or CI requires further source edits, restore temporary task fields before editing and repeat closeout.

## Structural Checks

When a checker exists, verify one header per file, field order, `MODULE` path, paired temporary fields, valid task references, matching anchor IDs and markers, unique valid IDs, and no historical fields. Structural checks do not prove semantic accuracy.

## Template

```text
<language-native comment>
MODULE: <repository-relative path>
PURPOSE: <owned responsibility>
PUBLIC API / ENTRYPOINTS:
  - <meaningful entrypoint>
CONTROL_FLOW:
  1. <architectural step>
INVARIANTS:
  - [<SEMANTIC-ID>] <non-obvious contract>
BOUNDARIES:
  - <ownership restriction>
RELATED:
  - <path>: <why it matters>
SECURITY:
  - <security contract>
DATA:
  - <data contract>
EVENTS:
  - <event or async effect>
ACTIVE_TASK: [T-####] | [R-####]
LOCAL_INTENT:
  - <file-local intent>
</language-native comment>
```

Remove optional, conditional, and temporary fields when they do not apply.

## Final Rule

The header stores current local architectural truth. The task stores active work. Validation proves the change. Git stores history.
