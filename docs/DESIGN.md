# Design

## Status
- State: approved
- Approved: true
- Approval scope: shared visual, interaction, content, motion, responsive, and accessibility system
- Change frequency: slow; update only when approved shared design truth changes

State-specific semantics remain unresolved until the exact `sNN-state.md` contract is approved. State-specific appearance remains unresolved until an exact visual artifact is approved and assigned by an implementation spec.

## Authority
Apply each source only within its domain:

- explicit user instruction owns the current design decision;
- this document owns shared experience, interaction, content, motion, responsive, and accessibility rules;
- the exact `sNN-state.md` contract owns durable state-specific behavior, semantic content meaning, accessibility, and authority;
- an exact approved visual artifact owns state-specific appearance;
- an exact technical artifact owns only a process depiction explicitly adopted by governing authority or an approved implementation spec and otherwise remains guidance;
- an approved implementation spec owns one collective outcome and any explicit appearance departure compatible with governing authority;
- established tokens and components, approved design skills, and agent judgment provide implementation guidance.

Resolve cross-domain conflicts before implementation. Incidental spec wording cannot silently override an exact visual artifact's appearance domain.

## Experience Character
- Direction: premium cinematic contractor-project experience.
- Character: calm, intelligent, precise, trustworthy, and visibly alive through real state change.
- Goal: confidence and control without sales pressure or technical intimidation.
- Model: continuous object-centered project environment.
- Central object: property first, governed project over time.
- Default interaction: simple enough for a low-effort homeowner.
- Progressive disclosure: deeper concerns, exceptions, explanations, and consequences.
- AI presence: useful structure and clarity rather than AI branding or a mandatory chatbot.

## Shared Principles
- Familiar controls carry a continuous journey.
- Pause only for homeowner meaning, correction, consent, or authority.
- Show real work and trustworthy readiness.
- Preserve project identity and context through transitions.
- Keep uncertainty visible in plain language.
- Compress completed interactions into durable project state.
- Preview direct controls immediately and commit through one explicit action.
- Keep explanations attached to the entity they describe.
- Expose consequences, transactions, and evidence without removing project context.
- Remain usable without high-end 3D, gesture-only input, or model latency.
- Let the exact approved visual artifact own state-specific appearance within these shared rules.

## Spatial Grammar
- **Central project object:** property, system, packet, offer, or active project remains visually primary.
- **Contextual instrument:** current decision, editable summary, or next action sits adjacent to the central object.
- **Anchored expansion:** local explanation or editing stays attached to the selected entity.
- **Vertical drawer:** estimates, obligations, transactions, or evidence open without replacing context.
- **Horizontal progression:** major phase movement may use restrained lateral motion.
- **Compression:** completed work condenses into durable project state.
- **Persistent shell:** adjacent states preserve scene, camera, and object continuity when durable state semantics or an approved implementation outcome requires it.

Traditional navigation remains secondary.

## Style Profile
- Typography: editorial serif for major human statements; neutral modern sans for UI, facts, controls, and labels.
- Color: near-black navy foundation, cool white text, restrained blue accent, and semantic green, orange, and red.
- Layout: full-frame composition, image-led hierarchy, minimal navigation, persistent context, and one dominant action.
- Shape: large soft containers, thin cool borders, restrained radii, and controlled depth.
- Motion: causality, continuity, and state change.
- Signature elements: cinematic property imagery, precise boundaries, durable visual objects, contextual instruments, and visible source or certainty.

## Typography
- UI family: Inter.
- Display family: Cormorant Garamond.
- Scale: 12 label, 14 supporting, 16 body/control, 20 section, 28 title, 48 to 64 display.
- Weights: 400 body, 500 labels, 600 controls and facts, 700 key emphasis, 500 to 600 display.
- Line height: 1.15 display, 1.3 headings, 1.5 body.
- Prose measure: 45 to 70 characters.
- Fallbacks: system sans and Georgia-compatible serif.

## Color
| Token | Value | Use |
|---|---|---|
| Canvas | `#06111C` | Primary background |
| Surface | `#0B1A29` | Main containers |
| Elevated | `#102235` | Drawers and overlays |
| Primary text | `#F7F9FC` | Main content |
| Secondary text | `#A8B5C3` | Supporting content |
| Accent | `#2F80FF` | Primary interaction |
| Verified | `#78D65B` | Satisfied evidence |
| Attention | `#F2B84B` | Unknown or pending |
| Blocked | `#E36A5D` | Error or blocked |
| Border | `#1D3A52` | Structural separation |
| Focus | `#70ADFF` | Keyboard focus |

Use semantic tokens. New one-off colors require an approved product-purpose reason. Meet WCAG AA contrast, and never rely on color alone.

## Layout, Shape, and Components
- Base spacing: 4 px.
- Desktop frame: fluid to 1536 px with 16 to 32 px outer margin.
- Grid: 12-column base unless the approved reference defines another distribution.
- Breakpoints: mobile below 640 px, tablet 640 to 1023 px, desktop 1024 px and above.
- Required viewports: 1536x1024, 1440x900, 1024x768, and 390x844.
- Radii: 10 px controls, 16 px instruments, 24 to 28 px primary frames.
- Borders: 1 px cool blue; bright accent only for focus, selection, and active project boundaries.
- Shadows: restrained overlay and imagery separation; no default decorative glow.
- Forms: visible labels, large targets, and clear validation.
- Components: framework-native primitives and local components unless architecture approves a library.
- Required states: default, hover, focus, active, disabled, loading, empty, error, success, pending, unknown, and verified where applicable.
- One primary action dominates each decision point.
- Gestures require click, keyboard, and visible-control alternatives.

## Imagery and Visual Objects
- Use cinematic seeded property imagery for the demo.
- Actual provider imagery remains source labeled.
- Project visual objects remain stable when continuity is required.
- Renderer or scene changes cannot fabricate a new project identity.
- Placeholders use labeled skeletons, unavailable states, or explicit partial data.
- Decoration cannot obscure controls, source, certainty, correction, or permission.
- Icons use a consistent line style and semantic purpose.

## Interaction Grammar
```text
user expresses intent
  -> system assembles or proposes structured state
  -> user corrects exceptions or confirms authority
  -> interface reorganizes around the resulting project
```

Direct control changes remain preview state until explicit commit. Agent work appears as bounded candidate structure, explanation, or exception. Material interpretations remain inspectable and editable. High-consequence actions use explicit language and visible effects. Progress follows real readiness or approved seeded equivalents, never fake certainty or a timer-only percentage.

## Motion
Motion meanings:
- morph: generic becomes project-specific
- in-place reconfiguration: current choice changes
- horizontal movement: phase progression
- vertical movement: consequence, transaction, obligation, or evidence
- anchored expansion: local explanation or editing
- compression: completed work becomes durable state

Timing: 120 to 220 ms for control feedback, 220 to 400 ms for local expansion, and 400 to 700 ms for camera or major-state morph when allowed.

Prohibited: indefinite shimmer, fake percent completion, looping scans, decorative particles, meaningless idle animation, and animation that blocks deterministic controls.

Reduced-motion mode removes camera travel and spatial transforms while preserving information, identity, state change, and action.

## Content and Voice
- Plain, calm, specific, and source aware.
- Everyday homeowner reading level.
- Define technical and transaction terms in context.
- Calls to action describe their result.
- Errors state what failed, what remains safe, and the next available action.
- Use canonical terminology from `PRODUCT.md`.
- Avoid sales urgency, unsupported certainty, AI hype, hidden lead language, and unexplained jargon.

## Accessibility and Responsive Behavior
Target WCAG 2.2 AA.

Every control, Lens, drawer, confirmation, correction path, and transaction action works by keyboard. Focus remains visible and logical. Use semantic landmarks, labels, status announcements, and accessible names. Screen readers receive meaningful state changes without decorative narration. Touch targets remain usable on mobile.

Desktop investor demonstration is primary; mobile remains fully usable. Responsive adaptation preserves project identity, action priority, source, certainty, and consequences. Complex spatial layouts may collapse into ordered vertical sections. State contracts own state-specific accessibility and behavioral requirements; exact visuals own approved appearance at their represented viewport or state.

## Reference Authority
- Approved implementation specs list every exact assigned visual and technical artifact path, and tasks repeat those exact paths.
- Agents cannot infer authority from neighboring files or folders.
- Visual artifacts own state-specific appearance within governing prose constraints.
- Technical artifacts own only a depiction explicitly adopted by governing authority or an approved implementation spec and otherwise remain guidance.
- Any appearance departure must be explicit in the approved implementation spec and compatible with governing authority.
- Image defects, fabricated values, annotations, and malformed copy are excluded unless approved prose includes them.
- Working references remain outside approved state-reference paths.

## Browser Validation
Shared validation covers required viewports, keyboard and focus, reduced motion, semantic controls, status announcements, component states, and visual comparison against every exact artifact assigned by the approved implementation spec.

The repository harness owns commands and evidence procedures. Approved implementation specs own outcome-specific validation expectations; state contracts retain durable state validity semantics.

## Explicitly Avoid
- generic SaaS dashboard
- permanent sidebar
- card-grid marketplace
- eco-green default branding
- glassmorphism
- sci-fi HUD
- chatbot-first composition
- wizard stepper
- fake loading percentage
- disconnected page transitions
- decorative perpetual animation
- unexplained precision
- state-specific rules hidden inside this shared document

## Change Control
- Update when the shared design system changes.
- State-specific durable behavior belongs to state contracts, approved appearance belongs to exact visuals, and collective implementation outcomes belong to approved specs.
- Reuse tokens, components, and interaction grammar before adding variants.
- New shared patterns require a product-purpose reason and approval.
- Git owns prior versions and change history.
