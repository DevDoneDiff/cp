# Documentation

This directory contains the repository's durable product, architecture, design, MVP, policy, and contract authorities.

## Global Authorities

- `PRODUCT.md` owns product identity, actors, lifecycle, commercial behavior, and durable product rules.
- `ARCHITECTURE.md` owns system authority, state, data, agents, integrations, persistence, and technical boundaries.
- `DESIGN.md` owns global experience behavior, interaction grammar, continuity, accessibility, and visual-system rules.
- `MVP.md` owns the current demo scope, proof requirements, seeded boundaries, exclusions, and endpoint.
- `REPOSITORY_POLICY.md` owns repository-specific security and delivery policy.

## Contract System

`contracts/` contains narrower authorities for:

- customer-visible product states;
- state-owned implementation specs;
- harness implementation specs;
- repository implementation specs;
- supporting visual references;
- supporting technical infographics.

See `contracts/README.md` for folder ownership and routing.

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
global product truth       -> PRODUCT.md
global technical truth     -> ARCHITECTURE.md
global experience truth    -> DESIGN.md
current demo boundary      -> MVP.md
repository policy          -> REPOSITORY_POLICY.md
state-specific truth       -> contracts/states/<state>/sNN-state.md
state implementation       -> contracts/states/<owning-state>/specs/
harness implementation     -> contracts/harness/specs/
repository implementation  -> contracts/repository/specs/
active execution           -> .harness/tasks.md
completed execution        -> .harness/completed.md
local code truth           -> annotation headers
behavioral reality         -> code and tests
```

A cross-state implementation spec belongs to the terminal state whose completion makes the collective outcome whole and lists every affected state contract.

Reference an upstream authority instead of duplicating it.
