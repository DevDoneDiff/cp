---
name: spec-authoring
description: Explicitly invoke to discover and define one collective implementation outcome from repository contracts, exact references, and current code reality. Route the draft to its single owning contract package, resolve material ambiguity, preserve implementation latitude, and never create tasks, write code, or approve output.
---

# Spec Authoring

## Purpose

Discover and define one complete implementation outcome that can later be decomposed into small implementation tasks.

A spec is the brickhouse. It describes everything that must collectively be true for the approved outcome to be whole.

This skill authors specs only. It does not create tasks, assign task tags, edit `.harness/tasks.md`, write runtime code, or approve its own output.

## Use

- invoke explicitly with `$spec-authoring`
- handle one collective implementation outcome or source brief per run
- use `docs/contracts/SPEC_TEMPLATE.md`
- inspect the repository deeply enough to align the outcome with current reality
- read only context relevant to the requested outcome rather than loading the entire repository by default

## Authority Map

Apply the narrowest applicable authority without allowing it to contradict a broader durable owner:

- `docs/contracts/README.md` owns spec classification, owning-authority routing, stable identity and filenames, legacy compatibility, bounded lineage, terminal-state routing, and artifact paths
- `docs/PRODUCT.md` owns durable product truth
- `docs/ARCHITECTURE.md` owns durable technical and system truth
- `docs/DESIGN.md` owns durable experience and interaction truth
- `docs/MVP.md` owns current demo scope and proof boundaries
- `docs/REPOSITORY_POLICY.md` owns repository-specific policy
- `docs/contracts/states/<state>/sNN-state.md` owns durable state-specific behavior
- exact `visual-*.png` files own approved state-specific appearance
- exact `technical-*.png` files own the approved process depiction they represent within governing prose
- approved prior specs own their completed implementation outcomes
- current code and tests own behavioral reality
- annotation headers own current local architectural context

A narrower source may constrain a broader source within its domain. It may not silently contradict it.

When authoritative sources materially conflict, report the exact conflict and stop drafting until it is resolved.

## Ownership and Routing

Every spec has exactly one owner, one `Owning authority`, one stable owner-scoped `Spec ID`, and one current repository path. Classify it by the primary outcome whose acceptance makes the work complete:

```text
customer-visible state outcome
  -> Owning authority: docs/contracts/states/sNN-kebab-case-state-name/sNN-state.md
  -> docs/contracts/states/<owning-state>/specs/

harness authoring, queue, validation, review, delivery, or lifecycle outcome
  -> Owning authority: AGENTS.md
  -> docs/contracts/harness/specs/

repository or hosting outcome meaningful independently of the harness
  -> Owning authority: docs/REPOSITORY_POLICY.md
  -> docs/contracts/repository/specs/
```

A supporting change follows the outcome it enables. If two outcomes remain independently acceptable, they require separate specs. Do not classify by old placement, implementation surface, or delivery convenience, and do not create loose specs or a new organizational category.

## Identity, Lineage, and Legacy Boundary

Copy the stable ID from the owner namespace defined by `docs/contracts/README.md`: `state/sNN/<SEQUENCE>`, `harness/<SEQUENCE>`, or `repository/<SEQUENCE>`. `Sequence` is unique and never reused within that namespace. Save the spec in its canonical owner directory as `<SEQUENCE>-<kebab-case-outcome>.md`; the path may change, but the stable ID does not.

Use `Amends` only for a bounded change to the named prior stable ID. Use `Supersedes` only when the named prior stable ID's forward authority is replaced. `none` means no such relationship. Lineage cannot replace unrelated durable authority, erase evidence, or change either spec's identity.

Resolve prior paths through the exact Legacy Spec Compatibility table in `docs/contracts/README.md`. A legacy row with `Current path: none` is Git-only historical evidence. Discover it by stable ID and inspect its exact historical blob only for one named outcome, acceptance, or compatibility question. Never use a Git-only body as a template or forward authoring example, and ignore its historical placement, task count, proposed tasks, fixed decomposition, `do not split` language, deleted paths, and superseded authoring, approval, delivery, validation, closeout, lifecycle, routing, or artifact-governance mechanics.

### Cross-State Outcomes

A spec may affect multiple customer-visible states when one collective outcome is only complete across their seam.

Route it to the terminal state whose completion makes the collective outcome whole.

The spec must:

- name that state as the single owning contract;
- list every affected state contract;
- keep durable cross-state system truth in `docs/ARCHITECTURE.md` rather than redefining it locally;
- remain one spec only when the cross-state result cannot be accepted truthfully as separate outcomes.

If multiple states each have an independently complete outcome, author separate specs under their respective owners.

## Discovery Process

Spec authoring is the primary repository-discovery step for the requested outcome.

Before drafting:

1. read the applicable global authority sections;
2. read the owning contract and every affected state contract;
3. inspect each exact `visual` or `technical` artifact required by the outcome, or record `none`;
4. read relevant approved prior specs and repository policy;
5. inspect applicable annotation headers, source files, tests, routes, schemas, adapters, and validation surfaces;
6. map the current implementation, existing seams, reusable boundaries, constraints, proven debt, and compatibility obligations;
7. separate established truth, user decisions, unresolved material questions, and implementation choices that should remain discretionary.

The discovery must be broad enough to keep the proposed build path synchronized with what already exists. It must not become an unbounded repository audit.

## Ambiguity Gate

Read-only discovery and boundary proposals are allowed before every decision is resolved.

Do not draft a review-ready spec while a material question remains unresolved.

Material ambiguity includes:

- product meaning or customer-visible behavior;
- state ownership or completion boundary;
- durable architecture or public compatibility;
- data ownership, migration, retention, or authority;
- authentication, authorization, privacy, or trust boundaries;
- external provider, credential, cost, or irreversible infrastructure choices;
- required visual states or artifact authority;
- acceptance boundaries or proof that cannot be determined from existing authority.

Routine implementation choices are not material ambiguity. Leave them to implementation unless an existing authority already constrains them.

Do not convert assumptions into approved decisions.

When discovery or the user resolves a durable product, architecture, design, state, security, schema, or compatibility decision, record it first through an explicitly authorized update to its owning authority. Resume dependent drafting only after that owner contains the decision. If authority-update permission is missing, the owner is unavailable, or the durable decision remains unresolved, report the exact blocker and stop drafting instead of copying or inferring the decision into the spec.

## Reference Artifact Gate

For every required artifact:

- use its exact repository-relative path;
- classify it as `visual`, `technical`, or `none` using `docs/contracts/README.md`;
- state what it owns and where it applies;
- verify that it exists;
- reject folder-level or inferred authority.

A visual reference owns approved user-facing composition within governing behavioral, accessibility, and truthful-copy constraints.

A technical infographic owns its approved process depiction, such as sequencing, concurrency, rendering stages, data movement, persistence, or animation flow. It cannot independently introduce product behavior, architecture, services, or state absent from governing prose.

Generated-image defects, fabricated values, annotation labels, and unsupported claims are not requirements unless the spec explicitly adopts them.

## Spec Boundary

One spec defines one collective implementation outcome with one completion state.

The spec may be long when the outcome requires substantial discovery, constraints, or acceptance detail.

Split specs only when outcomes have different owners or can be completed, approved, and accepted independently.

Do not split or combine specs based on:

- anticipated task count;
- working-context size;
- frontend versus backend layering;
- file boundaries;
- implementation sequence;
- validation convenience alone.

Task decomposition belongs exclusively to `$task-authoring` after spec approval.

## Implementation Latitude

A spec must be opinionated about the required outcome and restrained about implementation mechanics.

Lock an implementation choice only when required by:

- an existing durable authority;
- safety, security, privacy, data integrity, or compatibility;
- an external provider, credential, cost, or irreversible decision;
- a public contract or migration boundary;
- exact approved user-facing behavior or another unavoidable observable result.

Acceptance text authored in the same spec cannot bootstrap its preferred mechanism into authority. Every locked mechanism must cite an independent basis from the list above; if only the spec's own proposed acceptance wording requires it, express the observable outcome and leave the mechanism discretionary.

Otherwise define the required result, constraints, exclusions, and proof while leaving algorithms, data structures, internal module boundaries, rendering and framework techniques, recovery implementation, sequencing, orchestration details, and other routine engineering choices to Codex's best judgment.

Use the spec's `Implementation Latitude` section to distinguish:

- locked decisions;
- choices Codex may make;
- prohibited approaches.

Do not turn recommendations into requirements without explicit authority.

## Workflow

1. ingest the requested outcome or source brief;
2. apply the primary-outcome test and determine its single owner, exact `Owning authority`, stable `Spec ID`, `Sequence`, bounded lineage, affected contracts, and canonical path;
3. perform the repository discovery required above;
4. identify conflicts, missing material decisions, and artifact gaps;
5. request resolution only for material ambiguity;
6. define the collective outcome, entry state, completion state, scope, and authority boundaries;
7. draft with `docs/contracts/SPEC_TEMPLATE.md`;
8. run the readiness gate;
9. save with `State: draft` and `Approved: false`;
10. report the path, ownership, affected contracts, discovery basis, conflicts, and readiness.

## Drafting Rules

MUST:

- define one observable collective completion state;
- identify the single owner, exact `Owning authority`, stable `Spec ID`, `Sequence`, bounded `Amends` and `Supersedes` lineage, and every affected state;
- describe the relevant current implementation state discovered in the repository;
- bound included and excluded outcomes;
- preserve durable product, architecture, design, MVP, repository, and state truth;
- define state, data, authority, trust, failure, recovery, and compatibility requirements when applicable;
- link exact required artifacts and describe their authority;
- state acceptance criteria and validation expectations;
- explicitly preserve implementation latitude;
- include `Open Questions: none` before approval readiness.

MUST NOT:

- include proposed tasks, task counts, task tags, task order, or task dependencies;
- edit `.harness/tasks.md` or `.harness/completed.md`;
- prescribe coding steps Codex can determine from the repository;
- lock speculative abstractions, dependencies, providers, or design techniques;
- duplicate durable truth better owned by a global or state contract;
- mark the spec approved;
- implement code or configuration.

## Readiness Gate

A draft is ready for user review only when:

- ownership and routing are deterministic;
- the collective outcome and completion state are explicit;
- applicable contracts and repository reality have been inspected;
- scope and non-goals are bounded;
- material dependencies and compatibility obligations are known;
- required behavior is observable;
- data, authority, security, and privacy are addressed when applicable;
- required visual states and exact artifact authority are defined;
- failure and recovery behavior are covered;
- implementation latitude is explicit;
- acceptance criteria are testable;
- validation expectations are stated;
- `Open Questions` is `none`.

Otherwise report `Readiness: blocked` with the exact unresolved items.

## Status

New specs use:

```text
State: draft
Approved: false
```

Only explicit user approval may change them to:

```text
State: approved
Approved: true
```

Do not amend an approved spec without explicit instruction to reopen it.

## Output

Return:

- owning contract and exact spec path;
- affected contracts;
- discovery basis;
- material questions, or `none`;
- authority conflicts, or `none`;
- files created or updated;
- exact reference artifacts;
- `Readiness: ready_for_review | blocked`.

## Final Rule

Contracts define durable truth. The spec defines the complete approved brickhouse. Task authoring later decides the bricks.
