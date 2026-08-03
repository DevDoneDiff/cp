# Design

## Status
- State: approved
- Approved: true
- Approval_scope: shared MVP visual system plus confirmed S1 and S2 states
- Deferred_scope: state-specific S3-S10 composition until each visual reference is approved

UI work cannot become ready when required visual authority for its state is unresolved.

## Source Basis
- `docs/source/PRODUCT_SYSTEM_SPEC.md`
- `docs/source/MVP_DEMO_SYSTEM_SPEC.md`
- `docs/source/MVP_STATE_FLOW_SPEC.md`

## Authority
Apply design direction in this order:
1. explicit user instruction
2. active approved spec
3. approved visual reference linked by the spec
4. this document for shared rules
5. established tokens and components
6. `$frontend-design`
7. agent judgment

A technical infographic is implementation guidance only. Any required decision must also exist in the approved spec or architecture. When a reference and authoritative text conflict, stop and resolve the conflict before implementation.

## Approved Reference Registry
| Artifact | Status | Type | Role |
|---|---|---|---|
| `references/states/s01-address-entry/visual-default.png` | approved | visual | S1 default landing state with `How it works` closed |
| `references/states/s01-address-entry/visual-how-it-works-open.png` | approved | visual | S1 landing state with the `How it works` surface open |
| `references/states/s02-property-analysis/visual-property-confirmation.png` | approved | visual | S2 property-confirmation target |
| `references/states/s02-property-analysis/visual-live-roof-assembly.png` | approved | visual | S2 live-assembly target and S3 continuity source |
| `references/states/s02-property-analysis/technical-persistent-project-assembly.png` | approved guidance | technical | S1-S3 continuity and implementation explanation; no standalone authority |
| S3-S10 reference bundles | pending | visual and technical as required | required before corresponding UI tasks become ready |

Pending later-state references do not block repository foundation or approved S1/S2 work. Each later UI task becomes ready only after its own reference bundle is approved and linked by exact path.

The combined S1 comparison image is working material, not implementation authority. Keep it outside approved state folders or under ignored `references/_working/`.

## Reference Consumption Rules
- The approved active spec selects the exact artifacts required for an implementation outcome.
- `.harness/tasks.md` repeats those exact paths under `Reference_artifacts`.
- Codex must not infer authority from other files in the same folder.
- Visual artifacts own state-specific appearance within prose constraints.
- Technical artifacts are guidance only; required decisions must also exist in approved prose.
- Image-generation defects, fabricated values, malformed copy, and annotation marks are excluded unless an approved spec explicitly includes them.

## Style Profile
- Visual direction: Premium cinematic solar experience with a familiar landing entry and a future-feeling continuous project journey after address submission.
- Product character: Calm, intelligent, precise, trustworthy, and visibly alive through real state change.
- Emotional tone: Confidence and control without sales pressure or technical intimidation.
- Preferred references: The approved registry above.
- Typography character: Editorial serif for major human-facing statements; neutral modern sans for UI, facts, controls, and labels.
- Color character: Near-black navy foundation, cool white text, restrained blue interaction accent, semantic green/orange status colors.
- Layout character: Full-frame compositions, strong image-led hierarchy, minimal navigation, persistent project context, and one dominant action.
- Shape character: Large soft containers with thin cool borders; restrained radii and depth.
- Motion character: State, causality, and continuity driven. No decorative perpetual animation.
- Signature elements: Cinematic property scene, blue property boundary, panels appearing as durable objects, contextual right-side instrument, visible source/certainty.
- Explicitly avoid: generic SaaS dashboard, permanent sidebar, card grid, eco-green branding default, glassmorphism, sci-fi HUD, chatbot-first layout, wizard stepper, fake loading percentage, and disconnected page transitions.

## Design Principles
- Familiar controls carry a new continuous journey.
- Pause only when homeowner meaning, correction, consent, or authority is required.
- Show real assembly work as it becomes trustworthy.
- Preserve the property scene, camera context, and project object through state transitions.
- Keep uncertainty visible and plain-language.
- Use progressive disclosure; default interaction remains simple.
- One explicit commit action applies previewed project changes.
- The approved image owns composition; shared tokens and rules create consistency across states.

## Typography
- Primary UI family: Inter.
- Display family: Cormorant Garamond.
- Scale: 12 label, 14 supporting, 16 body/control, 20 section, 28 title, 48-64 display depending on viewport.
- Weight policy: 400 body, 500 labels, 600 controls and facts, 700 key UI emphasis; display uses 500-600.
- Line height: 1.15 display, 1.3 headings, 1.5 body.
- Readable measure: 45-70 characters for prose; transactional labels remain shorter.
- Fallbacks: system sans and Georgia-compatible serif.

## Color
- Canvas: `#06111C`
- Surface: `#0B1A29`
- Elevated surface: `#102235`
- Primary text: `#F7F9FC`
- Secondary text: `#A8B5C3`
- Brand/accent: `#2F80FF`
- Success/verified: `#78D65B`
- Warning/user attention: `#F2B84B`
- Error/blocked: `#E36A5D`
- Border: `#1D3A52`
- Focus: `#70ADFF`
- Contrast: meet WCAG AA for text and controls; focus indication cannot rely on color alone.

Use semantic tokens. Do not add one-off colors without an approved reason.
The listed families and colors are the initial MVP extraction from the approved references. A visual task may adjust them only when browser comparison proves a closer match, and must update this document in the same task.

## Spacing and Layout
- Base spacing unit: 4 px.
- Desktop frame: fluid to 1536 px with 16-32 px outer margin.
- Grid: 12-column desktop composition; state references may override column distribution.
- Density: visually rich scene with restrained control density and generous primary-action spacing.
- Alignment: strong shared edges; overlays attach to the entity or state they explain.
- Breakpoints: mobile under 640, tablet 640-1023, desktop 1024 and above.
- Required viewports: 1536x1024, 1440x900, 1024x768, and 390x844.
- S1 may use a distinct landing composition. After address submission, use one persistent project shell.

## Shape, Components, and Feedback
- Radius scale: 10 px controls, 16 px instruments, 24-28 px primary frames.
- Borders: 1 px cool-blue structural borders; brighter accent only for focus, selection, and active property boundary.
- Shadows: restrained and used to separate overlays from imagery; no glow as default decoration.
- Component source: framework-native primitives and local components. Add a library only through approved architecture.
- Forms: visible labels, large targets, clear validation, no phone-number requirement at entry.
- Navigation: minimal. No permanent sidebar or state wizard.
- Feedback: deterministic controls preview immediately; authoritative commit, pending, success, failure, and unknown states are distinct.
- Required component states: default, hover, focus, active, disabled, loading, empty, error, and success where applicable.

## Icons and Imagery
- Icons: simple line icons with consistent stroke and semantic use.
- Property imagery: cinematic seeded property imagery for the demo; actual provider imagery remains source-labeled.
- S2 confirmation to S2 assembly to S3 must preserve the same property scene and geometry. Camera motion may pan or zoom and cannot swap the property render.
- Panel objects appear only when their stable objects exist and remain the same objects in S3.
- Placeholders: labeled skeleton or source-unavailable state; never fabricated precision.
- Decorative assets cannot obscure controls, certainty, source, or property correction.

## Motion
- Purpose: clarify morph, state progression, cause and effect, attachment, and compression.
- Control feedback: 120-220 ms.
- Local expansion and layout change: 220-400 ms.
- Camera or state morph: 400-700 ms when motion is allowed.
- S2 live assembly: actual 20-30 second work window driven by readiness events and panel-object creation, never a timer-only animation.
- Panel reveal: short opacity/transform entrance when each stable object arrives; no replacement panel set at S3.
- Prohibited: indefinite shimmer, fake percent completion, looping scans, decorative particles, and animation that blocks deterministic controls.
- Reduced motion: remove camera travel and spatial transforms; use immediate scene preservation plus short fades and status updates.

## Content and Voice
- Voice: plain, calm, specific, and source-aware.
- Reading level: everyday homeowner; define solar or transaction terms in context.
- CTA style: explicit result, such as `Yes, this is my property` or `Update system`.
- Error style: state what failed, what remains safe, and the next available action.
- Terminology source: `docs/PRODUCT.md`.
- Prohibited language: unsupported certainty, sales urgency, AI hype, hidden lead language, and unexplained technical jargon.

## Accessibility
- Target: WCAG 2.2 AA.
- Keyboard: every control, confirmation, lens, drawer, and correction path is operable without pointer or gesture.
- Focus: persistent visible ring with logical order.
- Semantics: landmarks, headings, labels, status announcements, and accessible names.
- Screen reader: announce state changes, assembly milestones, errors, and control unlocks without narrating decorative motion.
- Reduced motion: honor system preference and preserve all information and actions.

## Browser Validation
- Commands and base URL: owned by `.harness/validation.md` after repository foundation.
- Required routes: landing route and persistent project route.
- Required S1/S2 states: address entry, `How it works` open/closed, property confirmation, correction affordance, partial live assembly, minimum-usable transition, error/fallback, and reduced-motion transition.
- Required references: every artifact linked by the active spec.
- Browser tool: Playwright plus real-browser visual inspection.

## Open Questions
- none within approval scope

## Maintenance Rules
- Update when the approved shared design system changes, not for isolated state implementation.
- State-specific composition belongs to the approved visual reference and active spec.
- Reuse tokens and components before adding variants.
- New visual patterns require a product-purpose reason and approval.
- Git owns prior design history.
