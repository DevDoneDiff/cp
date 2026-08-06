---
name: spec-authoring
description: Explicitly invoke to define one product implementation outcome from durable product/state authority, exact references, and current code reality. Never create tasks, write implementation code, or author harness/repository-governance maintenance specs.
---

# Product Spec Authoring

## Boundary

This skill authors one product implementation spec. It does not create tasks, assign tags, write runtime code, approve its own output, or construct/repair the harness.

Harness and repository-governance maintenance run only through explicitly invoked `$harness-maintenance` and have no spec route.

## Authority and Routing

Use the narrowest durable owners relevant to the outcome: `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/MVP.md`, `docs/REPOSITORY_POLICY.md`, the owning and affected state contracts, exact assigned artifacts, current code/tests, and useful annotations.

Store the spec under the terminal owning state:

`docs/contracts/states/<owning-state>/specs/<SEQUENCE>-<kebab-case-outcome>.md`

Use stable ID `state/sNN/<SEQUENCE>` and `docs/contracts/SPEC_TEMPLATE.md`. A cross-state outcome names all affected states but has one terminal owner. Independently acceptable outcomes require separate specs.

Historical spec paths in completed tasks are Git history, not current routes or templates.

## Procedure

1. Read only authority and implementation surfaces required to understand the outcome.
2. Inspect every exact visual or technical artifact the outcome assigns.
3. Separate durable requirements, current implementation reality, unresolved user-owned decisions, and routine implementation choices.
4. Stop drafting when product meaning, durable architecture/public contracts, data ownership, security/privacy, external cost, irreversible behavior, or reference authority is unresolved.
5. Write the collective observable outcome, bounded scope/non-goals, behavior/state, data/security/privacy, exact references, acceptance, validation expectations, and implementation latitude.

Do not prescribe task decomposition, internal module shapes, dependencies, task counts, tags, branch mechanics, or implementation steps.

## Status and Delivery

New specs end as `State: draft`, `Approved: false`, with `Open Questions: none` only when review-ready. A later explicit user approval of that exact draft may change only those two status fields.

Product authoring remains separate from implementation. Leave authoring local unless explicit user instruction requests repository delivery. If delivery is requested, use a descriptive `codex/authoring-<slug>` branch and pull request without implementation task status, `Pass`, scratchpad, closeout, archive, dependency, or completion claims. Do not race a live implementation claim.

## Output

Report the owning state and spec path, affected authorities, discovery basis, exact references, files changed, material questions or `none`, conflicts or `none`, and `Readiness: ready_for_review | blocked`.
