# <Spec Title>

## Status
- State: draft
- Approved: false
- Readiness: blocked

## Identity
- Sequence: <A | B1 | P1 | other stable sequence>
- Outcome: <single observable end state>
- Depends_on: none | <approved spec paths>
- Approval_scope: <what this spec authorizes>

## Authority and Source Bundle
- Upstream sources: none | `docs/source/<file>.md` sections <...>
- Product: `docs/PRODUCT.md` sections <...>
- Architecture: `docs/ARCHITECTURE.md` sections <...>
- Design: `docs/DESIGN.md` sections <...> | not applicable
- Decisions: none | `docs/decisions/<file>.md`
- Prior specs: none | <paths>
- Additional source: none | <paths>

A narrower approved operational rule is allowed. Any contradiction between sources must be resolved before drafting continues.

## Reference Artifacts
| Path | Type | Status | Authority | Applies to |
|---|---|---|---|---|
| none | none | not_required | none | none |

Types: `visual`, `technical`, or `content`.

Rules:
- use exact repository-relative paths, never folder-level references
- required files must exist before `Readiness: ready_for_review`
- visual artifacts own approved state-specific appearance within prose constraints
- technical artifacts are explanatory guidance and cannot introduce unstated decisions
- content artifacts own approved copy or structured content only within prose constraints
- image-generation defects, fabricated values, malformed copy, and annotation labels are not requirements unless stated below

## End State
- <what exists and works when this spec is complete>

## Entry and Exit Contract
### Entry
- <required incoming state, data, or dependency>

### Exit
- <observable outgoing state and transition>

## Scope
### In Scope
- <required behavior, surfaces, data, and artifacts>

### Non-Goals
- <explicit exclusions>

## Required Behavior
1. <deterministic behavior>
2. <user or system interaction>
3. <success transition>

## State and Authority Rules
- <when the system advances automatically>
- <when explicit user authority is required>
- <preview versus commit boundary>
- <agent versus deterministic authority>

## Data and Persistence
- Owned data: <entities or state>
- Source and certainty: <requirements>
- Transaction boundary: <boundary>
- Versioning and idempotency: <rules>
- Retention or deletion: <rules>

## Interfaces and Dependencies
- Public interfaces: none | <contracts>
- Internal contracts: <contracts>
- Events or jobs: none | <events>
- External services: none | <adapters and failure behavior>

## Security, Privacy, and Trust
- Untrusted inputs: <inputs>
- Validation and authorization: <rules>
- Sensitive data: none | <handling>
- Disclosure boundary: none | <rules>
- Secure failure behavior: <behavior>

## Visual, Interaction, and Accessibility
- Required states: none | <states>
- Reference fidelity: none | <specific artifact-to-surface requirements>
- Responsive viewports: none | <viewports>
- Keyboard and focus: <requirements>
- Reduced motion: none | <behavior>
- Intentional departures: none | <departure and authority>

## Failure and Edge Behavior
- <failure, fallback, retry, empty, error, or blocked behavior>

## Acceptance Criteria
1. <observable or executable pass condition>
2. <reference-fidelity condition when applicable>
3. <failure-path condition>

## Validation Expectations
- Required sets: <exact names from `.harness/validation.md`>
- Required fixtures or seeded data: none | <fixtures>
- Required browser states: none | <states and viewports>

## Proposed Task Outcomes
1. <one coherent independently verifiable result>
2. <next result only when split is justified>

Do not assign task tags in a spec.

## Open Questions
- none
