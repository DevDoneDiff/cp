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
- Review: inspect a running interface, identify visual or interaction defects, correct them, and re-verify.

Visual review is part of completion for frontend visual work, not a prose-only critique.

## Design Intent

Before editing, establish in `.harness/work/<TAG>.md`:

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

Use available browser tooling against the running application.

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

For each defect:

1. identify the visible cause
2. make the smallest coherent correction
3. run the narrowest applicable frontend test
4. refresh and inspect again

If browser tooling or the runnable environment is unavailable, `frontend-visual` cannot pass.

## Validation

The active task and `.harness/validation.md` own required proof. Frontend work commonly requires:

- `frontend-unit`
- `frontend-component`
- `frontend-e2e`
- `frontend-visual`
- `baseline`
- `agent-review`

Use `$code-change-verification` for final proof, Git delivery, review, and CI.

## Completion Output

Record in the scratchpad and final task result:

- routes or components reviewed
- exact references inspected
- viewports inspected
- states exercised
- tests run
- visual defects corrected
- unresolved visual or accessibility blockers

Do not create a separate design-review report unless the active spec requires one.
