---
name: spec-authoring
description: Explicitly invoke to convert one phase brief or source bundle into bounded draft specs under docs/specs/. Read applicable upstream source specifications, ask questions before drafting when material context is unresolved, and never write code, create tasks, or approve output.
---

# Spec Authoring

## Purpose

Convert phase-level intent into bounded, testable build specs that can later be decomposed into coherent tasks.

This skill authors specs only. It does not implement code, modify `.harness/tasks.md`, or approve its own output.

## Use

- invoke explicitly with `$spec-authoring`
- handle one phase, outcome, or source bundle per run
- use `docs/specs/SPEC_TEMPLATE.md` as the canonical structure
- read only context relevant to the requested phase
- do not load the full A-Z spec set or every reference folder by default

## Source Authority

Apply:

1. explicit user instruction
2. applicable upstream source specifications under `docs/source/`
3. `docs/PRODUCT.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DESIGN.md` when UI is affected
6. applicable approved decisions
7. relevant approved prior specs
8. current code and tests when existing behavior constrains the spec

Operational documents may narrow upstream scope. They cannot contradict upstream product, demo, or state truth. When authorities conflict, stop and request resolution.

Applicable upstream sources are the exact files listed by the phase brief, explicit user instruction, or the `Source Basis` sections of the operational project documents. Do not assume filenames or load every file under `docs/source/`.

## Required Inputs

- phase, outcome, or source brief
- known decisions and constraints
- intended sequence position when known

Optional inputs include approved visual, technical, and content references; master documents; notes; decisions; prior specs; and risk posture.

Do not infer missing product, architecture, security, data, provider, cost, or design decisions.

## Ambiguity Gate

Read-only analysis and boundary proposals are allowed.

Do not write a draft spec until all material questions are resolved.

Material ambiguity includes:

- desired user or system outcome
- scope and non-goals
- dependency or architecture direction
- data ownership, schema, migration, or retention
- authentication, authorization, privacy, or trust boundaries
- public contracts and compatibility
- external providers, credentials, cost, or failure behavior
- visual direction or required UI states
- artifact status, path, or authority
- acceptance criteria or required validation

Ask grouped, targeted questions. Offer options when tradeoffs are known. Do not turn assumptions into decisions.

## Reference Artifact Gate

When UI or artifact-driven behavior is affected:

- identify every required artifact by exact repository-relative path
- classify each as `visual`, `technical`, or `content`
- state its authority and the state or behavior it applies to
- verify the file exists
- reject folder-level or ambiguous references
- treat technical diagrams as guidance only
- explicitly exclude generated-image defects and fabricated values

A draft remains blocked when a required visual artifact is pending or its role is unresolved.

## Spec Boundaries

One phase may produce one or more specs. Each spec defines one coherent end state that can be accepted and validated independently.

Split when there is a material difference in:

- dependency order
- user or system outcome
- architecture boundary
- security or data risk
- validation method
- independent completion
- expected working-context size

Do not split by file, function, database row, endpoint field, or frontend/backend layer when those pieces are tightly coupled to one result. Do not combine unrelated outcomes merely because they share a phase.

## Workflow

1. ingest the phase brief and source material
2. map applicable upstream, product, architecture, design, decision, prior-spec, artifact, and code context
3. identify conflicts, missing decisions, and ambiguous acceptance boundaries
4. ask material questions and stop until answered
5. propose spec boundaries, dependency order, and filenames
6. ask for a boundary decision when multiple materially different structures are valid
7. draft each confirmed boundary using `SPEC_TEMPLATE.md`
8. run the readiness gate
9. save with `State: draft` and `Approved: false`
10. report files, dependencies, conflicts, artifacts, and readiness

## Drafting Rules

MUST:

- define an observable end state
- bound scope, non-goals, dependencies, and completion
- preserve approved product, architecture, and design truth
- define success, failure, and relevant edge behavior
- make acceptance criteria observable or executable
- state security, privacy, data, and compatibility requirements when applicable
- link exact required reference artifacts
- identify validation categories without inventing unset commands
- include proposed task outcomes sized for one working task at a time
- keep the spec usable without unrelated source documents

MUST NOT:

- write code or runtime configuration
- create task tags or edit `.harness/tasks.md`
- silently change product, architecture, design, or artifact authority
- prescribe speculative abstractions or dependencies
- mark a spec approved
- build ahead into later phases
- use vague acceptance language without proof conditions

## Proposed Tasks

The spec may propose task outcomes but must not instantiate tasks.

A proposed task completes one coherent, independently verifiable result, including tightly coupled schema, migration, implementation, tests, docs, and artifacts when required.

Split proposed tasks only for dependency, risk, validation, independent acceptance, or working-context boundaries. Do not assign task tags before approval.

## Readiness Gate

A draft is ready for user review only when:

- outcome is explicit
- scope and non-goals are bounded
- dependencies are identified
- required behavior is observable
- architecture authority is clear
- data behavior is defined when applicable
- security and privacy boundaries are addressed
- UI states and visual authority are defined when applicable
- every required reference artifact exists and has an exact role
- edge cases and failure behavior are covered
- acceptance criteria are testable
- validation expectations are stated
- proposed task boundaries are coherent and context-safe
- `Open Questions` is `none`

Otherwise report `Readiness: blocked` with unresolved items.

## Status

New specs use `State: draft` and `Approved: false`.

Only explicit user approval may change them to `State: approved` and `Approved: true`. Do not amend an approved spec without explicit instruction to reopen it.

## Naming

Use `docs/specs/<sequence>-<descriptive-slug>.md`.

Examples:

- `A-repository-foundation.md`
- `B1-project-runtime-shell.md`
- `B2-domain-runtime-contract.md`

Preserve established sequencing.

## Output

Return:

- material questions, or `none`
- proposed or confirmed boundaries
- files created or updated
- exact reference artifacts
- dependency order
- authority conflicts, or `none`
- `Readiness: ready_for_review | blocked`

## Final Rule

The user provides intent and decisions. Upstream and operational project documents provide authority. This skill converts them into bounded specs without guessing. Approved specs define desired results. Tasks later define executable building blocks.
