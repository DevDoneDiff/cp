# Documentation

This directory contains the repository's durable product, architecture, design, MVP, policy, and contract authorities.

## Global Authorities

- `docs/PRODUCT.md` owns product identity, actors, lifecycle, commercial behavior, and durable product rules.
- `docs/ARCHITECTURE.md` owns system authority, state, data, agents, integrations, persistence, and technical boundaries.
- `docs/DESIGN.md` owns global experience behavior, interaction grammar, continuity, accessibility, and visual-system rules.
- `docs/MVP.md` owns the current demo scope, proof requirements, seeded boundaries, exclusions, and endpoint.
- `docs/REPOSITORY_POLICY.md` owns repository-specific security and delivery policy.

## Contract System

`contracts/` contains narrower authorities for:

- customer-visible product states;
- state-owned implementation specs;
- harness implementation specs;
- repository implementation specs;
- supporting visual references;
- supporting technical infographics.

See `docs/contracts/README.md` for canonical folder ownership, spec classification, identity, and terminal-state routing. This index does not restate those rules.

The active artifact vocabulary is `visual`, `technical`, or `none`; every assigned artifact uses an exact repository-relative path.

## Execution System

Harness execution state lives outside `docs/`:

```text
.harness/
  tasks.md
  completed.md
  validation.md
  LESSONS.md
  work/
```

- `tasks.md` owns active work and execution order.
- `completed.md` owns immutable completed-task entries.
- `validation.md` owns proof and delivery procedures.
- `work/` owns ephemeral task rehydration.

## Ownership Rule

Store each requirement at its narrowest durable owner.

```text
global product truth       -> docs/PRODUCT.md
global technical truth     -> docs/ARCHITECTURE.md
global experience truth    -> docs/DESIGN.md
current demo boundary      -> docs/MVP.md
repository policy          -> docs/REPOSITORY_POLICY.md
state-specific truth       -> docs/contracts/states/<state>/sNN-state.md
state implementation       -> docs/contracts/states/<owning-state>/specs/
harness implementation     -> docs/contracts/harness/specs/
repository implementation  -> docs/contracts/repository/specs/
active execution           -> .harness/tasks.md
completed execution        -> .harness/completed.md
proof and delivery          -> .harness/validation.md
implementation reality     -> code
executable expectations    -> tests
local architecture summary -> annotation headers
history and delivery record -> Git
```

Code, tests, and annotation headers are descriptive evidence. Tests may be stale or failing, and annotation headers summarize inspected code without overruling it. Report a code/test mismatch as an implementation or proof defect.

A resolved durable decision is recorded in its owning authority before dependent spec drafting resumes. Use [canonical contract routing](contracts/README.md) for cross-state and owner classification rather than inferring ownership here.

Reference an upstream authority instead of duplicating it.
