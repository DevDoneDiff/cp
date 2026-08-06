---
name: frontend-design
description: Use for new UI, visual frontend changes, restyling, or visual review. Apply approved specs and exact reference artifacts, avoid generic AI-default aesthetics, and verify the result in a real browser across required states and viewports.
---

# Frontend Design

## Authority

Apply visual direction in this order:

1. explicit user instruction
2. active approved spec
3. exact approved reference artifacts linked by the spec and task
4. `docs/DESIGN.md` shared rules
5. existing design tokens, components, and established UI behavior
6. this skill
7. agent judgment

A technical infographic is guidance only. It cannot create architecture, behavior, or data authority absent from approved prose.

If visual direction, artifact role, or required UI state is missing, contradictory, or materially underspecified, ask targeted questions before visual implementation.

## Modes

- Build: create a new interface or flow.
- Restyle: change presentation while preserving unrequested behavior and data flow.
- Review: read-only inspection of a running interface and immutable candidate evidence; report observations and blocking findings without modifying the worktree, branch, task state, pull request, or external evidence.
- Repair: the authorized primary task agent applies accepted corrections, reruns focused proof, and requests a fresh independent Review. A reviewer never enters Repair.

Visual review is part of completion for frontend visual work, not a prose-only critique.

## Design Intent

Before Build, Restyle, or Repair editing, establish in `.harness/work/<TAG>.md`:

- state or flow purpose
- primary user action
- approved visual references and their exact roles
- hierarchy and composition approach
- project tokens and components to reuse
- one restrained signature element when appropriate
- required states and viewports
- known generated-image defects that must not be implemented

Do not invent a new design language inside one task when an approved system exists.

## Anti-Default Rules

Unless explicitly required by the spec, reference, or `DESIGN.md`, avoid:

- generic blue-purple gradients
- glassmorphism and decorative blur
- excessive rounded cards or card grids
- oversized marketing headlines without content hierarchy
- default-looking typography with no deliberate type scale
- random icon decoration
- gradients, shadows, or animation used to simulate quality
- interchangeable SaaS layouts unrelated to the product's users and purpose

Prefer deliberate typography, spacing, composition, contrast, copy, and interaction states over decoration.

## Build Rules

MUST:

- inspect every exact reference assigned to the task
- reuse approved tokens and components before creating variants
- preserve semantic HTML and keyboard operation
- design loading, empty, error, disabled, focus, hover, and success states when applicable
- support viewports defined in `docs/DESIGN.md` or the active spec
- keep visual changes scoped to the active task
- use framework-native patterns and existing component architecture
- update `docs/DESIGN.md` only when the approved shared design system changes

MUST NOT:

- infer requirements from unlinked files in a reference folder
- implement annotation labels, malformed generated copy, fabricated values, or image defects as product behavior
- add a UI or animation dependency without resolved approval
- hide functional defects with styling
- change routing, data flow, or business behavior during a pure restyle unless authorized
- claim visual success from source inspection alone

## Browser Review

When `frontend-visual` is assigned, use available browser tooling against the running application.

Inspect:

- required desktop and mobile viewports
- required visible states and transitions
- layout, alignment, spacing, hierarchy, and readable line lengths
- overflow, clipping, wrapping, and breakpoint behavior
- keyboard focus and interactive states
- loading, empty, error, disabled, success, and reduced-motion states
- content density and primary-action clarity
- fidelity to each assigned visual reference
- compliance with shared design rules

For each defect, the read-only reviewer identifies the visible cause, records exact evidence, and reports whether it blocks acceptance. The reviewer does not correct it. The authorized primary task agent then enters Repair, makes the smallest coherent correction, runs the narrowest assigned frontend proof, reruns every affected assigned set, and requests a fresh read-only Review of the new exact candidate SHA. Prior review does not carry forward across a content change.

If browser tooling or the runnable environment is unavailable, `frontend-visual` cannot pass.

Browser access is required only when `frontend-visual` is assigned to the active task. Documentation-only changes to this skill do not require a product browser run.

## Validation

The active task and `.harness/validation.md` own required proof. Frontend work commonly requires:

- `frontend-component`
- `frontend-e2e`
- `frontend-visual`
- `baseline`
- `agent-review`

Use only validation-set names registered in `.harness/validation.md`; add `security`, `security-review`, or `smoke` only when task assignment and the registry require them. The canonical independent-review gate owns reviewer identity, read-only independence, exact candidate SHA, durable evidence, blocking-finding disposition, repair invalidation, and fresh-review requirements. This skill adds frontend-specific observations and does not define a second review contract.

Use `$code-change-verification` for final proof, Git delivery, review, and CI.

## Completion Output

Read-only Review reports the reviewer identity, exact candidate SHA, routes or components inspected, exact references, viewports, states, observed evidence, and blocking findings or `none`. It makes no repair claim.

The authorized primary task agent records in the scratchpad and final task result:

- routes or components reviewed
- exact references inspected
- viewports inspected
- states exercised
- tests run
- visual defects corrected
- fresh review result after each repair
- unresolved visual or accessibility blockers

Do not create a separate design-review report unless the active spec requires one.
