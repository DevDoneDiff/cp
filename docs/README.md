# Documentation

This directory contains durable product, architecture, design, MVP, repository policy, and customer-state authority.

## Global Authorities

- `PRODUCT.md`: product identity, actors, lifecycle, and durable rules.
- `ARCHITECTURE.md`: system, data, integrations, persistence, and technical boundaries.
- `DESIGN.md`: shared experience, interaction, accessibility, and visual-system rules.
- `MVP.md`: current demo scope and proof boundary.
- `REPOSITORY_POLICY.md`: repository security and implementation delivery policy.

## Product Contracts

`contracts/states/` contains customer-visible state contracts, state-owned product implementation specs, and exact visual or technical references. See `contracts/README.md` for routing.

Harness and repository-governance maintenance are not product contracts and have no spec directory. They run locally through the explicitly invoked `$harness-maintenance` procedure.

## Execution State

```text
.harness/tasks.md       active implementation queue
.harness/completed.md   completed implementation tasks
.harness/validation.md  implementation proof and delivery
.harness/LESSONS.md     reusable implementation lessons
.harness/work/          ignored task rehydration state
```

Current implementation reality lives in code, executable expectations live in tests, local architectural context lives in annotation headers, and detailed delivery history lives in Git.
