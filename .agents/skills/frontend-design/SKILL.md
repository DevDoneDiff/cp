---
name: frontend-design
description: Use for new UI, visual frontend changes, restyling, or visual review. Apply approved product specs and exact assigned references, and verify required states and viewports in a real browser.
---

# Frontend Design

## Authority

Use explicit user decisions, `docs/PRODUCT.md`, `docs/DESIGN.md`, applicable state contracts, the approved product spec, and only the exact assigned `visual-*.png` or `technical-*.png` artifacts. Current components and tokens are implementation context, not authority over those sources.

Visual artifacts own appearance within governing prose. Technical artifacts own only an explicitly adopted process depiction. Never infer authority from neighboring files or implement generated-image defects, annotation labels, fabricated values, or malformed copy.

## Build and Restyle

Before editing, establish the state purpose, primary action, required states/viewports, exact reference roles, reusable components/tokens, and known excluded defects in the implementation scratchpad.

Preserve semantic HTML, keyboard operation, accessibility, approved interaction behavior, and framework-native boundaries. Cover applicable loading, empty, error, disabled, focus, hover, success, and reduced-motion states. Keep visual work inside the active task and avoid introducing a new design language or dependency without authority.

Avoid generic gradients, glass effects, decorative card grids, random iconography, excessive rounding/shadows, interchangeable SaaS composition, or animation used as a substitute for deliberate hierarchy and spacing unless required by authority.

## Browser Verification

When `frontend-visual` is assigned, inspect the running application at every required state and viewport. Check composition, hierarchy, alignment, spacing, readable line length, overflow, wrapping, breakpoints, keyboard focus, state transitions, reduced motion, content truth, accessibility, and fidelity to each exact reference.

The primary implementation agent may perform configured deterministic visual verification. Use an independent read-only reviewer only when the task or risk rules require one. Any repair reruns the focused browser evidence it could invalidate; it does not automatically require unrelated proof.

If the runnable environment or required browser tooling is unavailable, `frontend-visual` cannot pass.

## Validation and Output

Use only registered sets assigned by the task, commonly `frontend-component`, `frontend-e2e`, `frontend-visual`, `smoke`, and `baseline`. Add security or independent review only when applicable.

Record routes/components, exact references, viewports, states, tests, observed defects, corrections, and unresolved blockers. Do not create a separate review artifact unless the product spec requires one.
