# S1-S2 Continuous Entry and Property Analysis

## Status

- State: approved
- Approved: true

## Identity

- Sequence: B
- Outcome: The foundation smoke route is replaced by the first complete customer-visible slice: a seeded S1 address-entry experience creates one browser-session project, enters one persistent project runtime, obtains explicit S2 property confirmation, assembles a preliminary roof and panel model from typed work events, and stops inside S2 with the same scene and stable panel objects present at `MINIMUM_USABLE_READY`.
- Depends_on: `docs/specs/A-repository-foundation.md`
- Approval_scope: Authorizes only the S1 address-entry state, the pre-account session-project runtime needed by S1-S2, the S2 `PROPERTY_CONFIRMATION` and `LIVE_ROOF_ASSEMBLY` substates, and the internal `MINIMUM_USABLE_READY` continuity handoff. It authorizes exactly the four proposed implementation tasks below when instantiated through `$task-authoring`; it authorizes no additional task, no implementation during this approval and task-authoring run, and no S3 or later product surface.

## Authority and Source Bundle

- Upstream sources: `docs/source/PRODUCT_SYSTEM_SPEC.md` sections 1-7, 9-11, 18, 20-23; `docs/source/MVP_DEMO_SYSTEM_SPEC.md` sections 1-7, 13-17; `docs/source/MVP_STATE_FLOW_SPEC.md` sections 1-5 and 7-9.
- Product: `docs/PRODUCT.md` status, source basis, product statement, users, jobs to be done, core journey through S2, MVP scope, product requirements and invariants, domain language, trust/privacy/safety, success criteria, constraints, and open questions.
- Architecture: `docs/ARCHITECTURE.md` status and source basis; system summary; technology stack; system components; dependency direction; persistent project runtime; pre-account data architecture; S1-S2 interfaces and events; pre-account authentication boundary; trust boundaries; seeded address/property services; reliability; validation; architectural invariants; and open questions.
- Design: `docs/DESIGN.md` status and source basis; authority; approved reference registry; reference consumption; shared style, layout, component, imagery, motion, content, accessibility, and browser-validation rules; and open questions.
- Decisions: none.
- Prior specs: `docs/specs/A-repository-foundation.md` status, identity, end state, non-goals, visual boundary, acceptance, and validation expectations.
- Additional source: `.harness/validation.md`; `package.json`; `src/app/layout.tsx`; `src/app/page.tsx`; `src/app/globals.css`; `tests/component/page.test.tsx`; `tests/e2e/smoke.spec.ts`; `scripts/production-smoke.mjs`; `playwright.config.ts`; `vitest.config.ts`.

The explicit decisions in this specification narrow the complete MVP to a pre-account S1-S2 slice. Postgres, Drizzle, durable event-ledger storage, Clerk, Stripe, live providers, S3, and later states remain approved future architecture but are outside this slice. The current foundation route and its tests deliberately own no product behavior or visual authority and must be replaced or reconciled by later implementation tasks.

## Reference Artifacts

| Path | Type | Status | Authority | Applies to |
|---|---|---|---|---|
| `references/states/s01-address-entry/visual-default.png` | visual | approved | Owns S1 default composition, hierarchy, spatial grammar, and visual intent within this prose | S1 address-entry default, suggestion, loading, validation, error, privacy, and deferred-sign-in presentation |
| `references/states/s01-address-entry/visual-how-it-works-open.png` | visual | approved | Owns the open surface's relationship to the unchanged S1 landing composition within this prose | S1 `How it works` open state, close behavior, responsive adaptation, and focus treatment |
| `references/states/s02-property-analysis/visual-property-confirmation.png` | visual | approved | Owns the S2 confirmation composition and decision hierarchy within this prose | Persistent project shell in `PROPERTY_CONFIRMATION`, candidate facts, property scene, confirmation, and correction |
| `references/states/s02-property-analysis/visual-live-roof-assembly.png` | visual | approved | Owns the S2 assembly composition, status hierarchy, object-progress presentation, and fact-readiness visual intent within this prose | `LIVE_ROOF_ASSEMBLY`, partial panel reveal, modeled facts, transport/fallback status, and ready presentation |
| `references/states/s02-property-analysis/technical-persistent-project-assembly.png` | technical | approved guidance | Explains persistent-shell, shared-projection, event-progress, stable-object, transport, and future continuity concepts only where authoritative prose independently requires them | Pre-account runtime, confirmation-to-assembly continuity, SSE/polling delivery, and the `MINIMUM_USABLE_READY` handoff |

Rules:

- These are the only reference artifacts authorized by this specification. No other file in either reference folder supplies authority.
- The four visual artifacts own state-specific appearance within the behavioral, privacy, accessibility, and truthful-copy requirements below.
- The visual artifacts do not depict every required loading, invalid, error, fallback, restored, or ready variant. For those derived states, this prose owns state-specific content and behavior while the nearest task-assigned visual owns shared composition, hierarchy, and visual language. Validation does not require pixel identity to an absent reference variant.
- The technical artifact is implementation guidance only. Its `S2.6` and `S2.4` labels, WebSocket option, outbox/job depiction, S3 controls, S4 claim behavior, and automatic S3 entry do not become requirements from the image.
- Generated-image defects, malformed or clipped copy, unsupported social proof, false provider names, imagery dates, fabricated precision, baked dynamic overlays, annotation labels, and physically implausible panel placement are excluded.
- The S2 visual references show inconsistent scene/camera treatments. The explicit requirement for one local property-scene asset and one stable camera context controls.
- The product must use real semantic text, controls, status indicators, property/roof outlines, panel objects, source labels, progress information, and correction actions. A full-page screenshot or flattened screenshot implementation fails.

## End State

- `GET /` is a real seeded S1 address-entry experience rather than the repository-foundation smoke surface.
- Selecting the canonical normalized demo address creates exactly one valid browser-session project projection and one property candidate, preserves stable identifiers and seeded source metadata, then enters the persistent project runtime through client navigation without a full document reload or unrelated page reset.
- The runtime first presents `PROPERTY_CONFIRMATION`, requires explicit homeowner confirmation, supports clean correction back to address selection, and then presents `LIVE_ROOF_ASSEMBLY` in the same mounted runtime and property-scene component.
- Assembly advances from typed domain work events delivered through SSE with a bounded polling fallback. Visible progress derives from completed readiness stages and stable panel-object counts.
- The exit projection records `MINIMUM_USABLE_READY`, retains the same scene, camera context, property, roof surfaces, and panel objects, and may show a truthful ready status while remaining inside S2.
- No S3 controls, S3 composition, project lens, customization, pricing, account creation, contractor disclosure, or later product state is rendered or simulated.

## Entry and Exit Contract

### Entry

- The approved repository foundation is present: Next.js App Router, React, strict TypeScript, native styling support, Vitest, Testing Library, Playwright, the validation registry, CI, and the non-product smoke route.
- No project exists on a fresh S1 entry. Address text, suggestion visibility, `How it works` visibility, loading status, validation status, and deferred-sign-in feedback are transient view state and are not project history.
- A direct persistent-runtime entry may restore only a schema-valid projection from the current browser tab's `sessionStorage`. Missing, incompatible, or invalid state cannot enter S2.

### Exit

- The same session project remains browser-scoped and has a schema version, stable `session_project_id`, stable confirmed `property_id`, monotonically increasing project version, source-aware preliminary facts, stable roof-surface and panel objects, accepted work-event cursor, and `minimum_usable_ready: true`.
- The visible state remains S2 with a truthful minimum-usable ready status. The existing scene and panel layer remain mounted and are ready for a later approved S3 implementation to unlock in place.
- No S3 transition executes, no new renderer or panel set is created, and no durable or authenticated state exists.

## Scope

### In Scope

- Replacement of the foundation-only metadata, root-route content, smoke readiness marker, component tests, and browser smoke assertions needed to make the customer-visible slice truthful.
- A minimal typed S1-S2 state machine with `ADDRESS_ENTRY`, `PROPERTY_CONFIRMATION`, and `LIVE_ROOF_ASSEMBLY` visible states plus explicit readiness, loading, failure, and restoration status.
- A versioned, validated session-project projection and one browser `sessionStorage` adapter.
- Isolated seeded adapters and fixture data for address normalization, one property candidate, one local property scene, property outline, roof surfaces, candidate panel objects, and energy-model facts.
- Stable project, property, roof-surface, panel, event, source, scene, and camera identifiers.
- S1 default and `How it works` open compositions, seeded suggestion behavior, project creation, privacy/no-pressure content, a truthful deferred sign-in interaction, responsive behavior, keyboard operation, and reduced motion.
- S2 property confirmation, correction, continuous property scene, source/certainty labeling, and transition into live assembly.
- Typed work events, event-derived progress, panel-object reveal, fact-readiness gating, SSE, bounded polling fallback, deterministic injected scheduling, restoration/replay, and the `MINIMUM_USABLE_READY` boundary.
- Local raster assets may be derived from a task's exact assigned visual references when necessary, without modifying those references. Derived S1 imagery owns atmosphere only; the one derived S2 base property-scene asset owns scene context only. Neither owns UI, facts, geometry, outlines, or panel state.
- A framework-native 2D or 2.5D scene and overlay implementation that preserves the renderer/component contract without introducing a production UI, animation, map, or 3D dependency.

### Non-Goals

- S3 composition, controls, system customization, project lenses, `Update system`, or automatic entry into a rendered S3 state.
- Preliminary pricing, price estimates, modeled price ranges, S4, account creation, OTP, Clerk SDK or runtime behavior, or project claim. Preliminary physical and energy-model facts explicitly gated by S2 work events remain in scope.
- Postgres, Neon, Drizzle, migrations, durable server persistence, a durable homeowner/project/property/lead row, or a second canonical store.
- Stripe, contractors, offers, provider identities, lead distribution, contractor disclosure, or external sharing.
- Project-intelligence/model calls, agent-generated facts, chatbot behavior, or homeowner intent capture.
- Real address, Google, Nearmap, imagery, maps, property, roof, solar, utility, or other provider calls, credentials, API keys, paid requests, or external cost.
- Local-storage persistence, cross-browser restoration, post-session recovery, durable analytics identity, or unrelated marketing data.
- Permanent sidebar, dashboard architecture, generic wizard stepper, high-end 3D requirement, or disconnected page sequence.
- A new UI framework, animation library, mapping library, renderer dependency, workflow engine, background job system, outbox, WebSocket path, or deployment configuration.
- Full-page screenshot implementation, baked-in controls/status/panel overlays, unsupported social proof, false provider claims, or fabricated precision.

## Required Behavior

### 1. State model and transition rules

1. The visible-state union is limited to `ADDRESS_ENTRY`, `PROPERTY_CONFIRMATION`, and `LIVE_ROOF_ASSEMBLY`. `MINIMUM_USABLE_READY` is an event and readiness boundary inside S2, not a rendered S3 state.
2. A fresh visit enters `ADDRESS_ENTRY`. Transient input/help/error state exists outside the session project until a normalized suggestion is selected.
3. Address selection resolves one seeded candidate, creates or idempotently reuses one session project root for that selection, records `ADDRESS_RESOLVED`, writes the valid projection to `sessionStorage`, and performs a client transition into `PROPERTY_CONFIRMATION`.
4. Only explicit activation of `Yes, this is my property` may record `PROPERTY_CONFIRMED` and enter `LIVE_ROOF_ASSEMBLY`.
5. Assembly applies `ROOF_GEOMETRY_READY`, repeated `PANEL_OBJECT_ADDED`, `ENERGY_MODEL_READY`, and `MINIMUM_USABLE_READY` only when their domain preconditions pass.
6. State and projection changes are reducer/application-contract decisions. SSE, polling, scheduling, rendering, and browser routing never own or redefine domain state.
7. Consequential accepted events increment the project version and are retained in the browser-session event record with stable event IDs. Keystrokes, focus changes, suggestion highlighting, help visibility, decorative motion, and deferred-sign-in feedback are not recorded.

### 2. Seeded address entry

1. The canonical fixture displays `123 Maple St` and `Austin, TX 78704`, with normalized single-line form `123 Maple St, Austin, TX 78704`.
2. A versioned fixture-owned alias table may accept obvious canonical variants. Matching input yields exactly one suggestion labeled as seeded demo data. Unsupported input yields no invented property.
3. The address control has a persistent accessible label. A listbox exposes the suggestion, and its option supports pointer selection plus `ArrowUp`, `ArrowDown`, `Enter`, `Escape`, and normal `Tab` behavior.
4. Selecting or submitting an unambiguous highlighted suggestion begins the asynchronous seeded normalization operation. The pending state is visibly and semantically loading, prevents duplicate submission, and cannot create multiple project roots.
5. Empty or unsupported input retains the user's text and shows an inline invalid state with the canonical demo address as the recovery instruction.
6. A recoverable adapter failure preserves the input, explains that the demo lookup failed, provides one retry action, and creates no project or false candidate.
7. The landing state communicates that no phone number is required, no contractor receives the project, no information is sold or lead-blasted, and the unsaved demo projection remains in the browser session.

### 3. S1 help and deferred sign-in

1. `How it works` is a real button with closed and open states. Opening the surface preserves the landing composition and presents four compact, slice-truthful rows: enter the demo address, confirm the likely property, watch the roof and panel model assemble, and keep the same project context when the starting model is ready. It never claims that pricing, contractors, or later states are present.
2. The open surface has an accessible name, a close control, `Escape` handling, controlled focus, and focus return to the trigger. Its mobile layout remains readable without clipping or horizontal overflow.
3. An existing-user sign-in affordance is permitted for state-contract and reference fidelity but is not required by this slice. When present, it is a deferred interaction whose pointer or keyboard activation reveals and announces: `Sign-in is not available in this pre-account demo. Enter an address to begin.`
4. A rendered deferred-sign-in affordance performs no navigation, network request, credential prompt, Clerk call, cookie write, authenticated-state mutation, project creation, or fake success transition.

### 4. Session project creation and storage

1. The session project is created only after selection of the normalized seeded address. The write is atomic from the user's perspective: a failed storage write leaves S1 active and exposes a recoverable error.
2. The projection contains at minimum:
   - projection schema version and fixture version;
   - stable session project ID and monotonically increasing project version;
   - current S1-S2 visible state and readiness;
   - preserved address draft and normalized address;
   - seeded source metadata and certainty;
   - current property candidate or confirmed property;
   - stable scene asset and camera-context IDs;
   - roof-surface objects, panel objects, and source-aware facts as they become ready;
   - accepted consequential event IDs and the latest assembly cursor.
3. The session project ID is generated once through an injectable ID source and stored. Property, surface, and panel IDs are created once from the versioned fixture contract and are never derived from render index, array position, animation time, or transport retry.
4. `sessionStorage` is the only persistence adapter. It is accessed only in a client-capable boundary, and its contents are validated before a restored projection is applied to runtime state or rendering. It is never mirrored to `localStorage`, cookies, Postgres, logs, analytics identity, or a durable server record.
5. Reload in the same browser session restores a valid confirmation, partial-assembly, or ready projection without changing stable IDs. Partial assembly resumes after the accepted event cursor and cannot duplicate panels.
6. Missing, corrupted, malicious, or unsupported projection data is rejected. The app returns safely to S1 with a bounded recovery notice and does not interpolate untrusted stored values into markup, routes, logs, or transport authority.
7. Closing the browser session removes the unsaved projection according to browser `sessionStorage` behavior. Product copy must not promise recovery beyond that browser behavior.

### 5. Property confirmation and correction

1. `PROPERTY_CONFIRMATION` preserves the submitted address and session project ID, presents one likely property candidate in the persistent runtime, and uses the same local scene/component that assembly will retain.
2. The candidate displays truthful fixture provenance and certainty. Required customer-facing labels include `Seeded demo imagery`, `Demo property match`, and `Modeled` where applicable. It cannot display `Nearmap`, `Google`, a real imagery date, `verified`, or unsupported `high` confidence.
3. The property outline is a separately rendered object tied to candidate geometry, with an accessible text equivalent. It is not baked into a full-page image.
4. Deeper roof, panel, or energy assembly cannot begin before explicit confirmation. Pre-confirmation UI cannot show panel objects or imply completed roof analysis.
5. `Not your property?` returns to address selection through client navigation, preserves and focuses the prior address input, retains the session project root, and removes the rejected property candidate plus all candidate-derived scene, roof, panel, fact, readiness, and assembly-cursor state from the active projection.
6. Correction records one session-scoped consequential project mutation for provenance and increments the version. It does not preserve the rejected candidate as active data, create a contractor disclosure, create durable identity, or record address-edit keystrokes.
7. A subsequent valid selection reuses the existing session project root and creates one new stable property candidate identity. The confirmed path keeps the selected property ID unchanged through assembly and readiness.

### 6. One persistent property scene

1. S2 uses one local seeded base property-scene asset, one scene component/renderer instance, one scene asset ID, and one camera-context ID across confirmation, live assembly, and the minimum-usable ready presentation.
2. The base asset contains no product text, controls, statuses, property/roof outlines, or dynamic panel layer. Any source image panel marks cannot serve as panel objects. The implementation must use a clean base roof or prevent baked imagery from being mistaken for generated panels.
3. Property outline, roof-surface geometry, panels, focus/selection representation, source/status labels, and progress are separate data-bound UI or render layers.
4. A 2D, SVG, canvas, CSS, or restrained 2.5D implementation is acceptable when it preserves accessibility and object identity. High-end 3D, camera libraries, and a new renderer dependency are not required.
5. If the local scene asset fails to load, the runtime shows a labeled non-fabricated fallback scene and preserves candidate text, confirmation/correction, statuses, and assembly semantics. Asset failure cannot invent imagery or silently swap property identity.

### 7. Live assembly events, progress, and facts

1. The required S2 assembly event vocabulary is:

   ```text
   PROPERTY_CONFIRMED
   ROOF_GEOMETRY_READY
   PANEL_OBJECT_ADDED
   ENERGY_MODEL_READY
   MINIMUM_USABLE_READY
   ```

   `ADDRESS_RESOLVED` precedes S2 and `PROJECT_MUTATED` may describe the correction mutation; neither expands the required live-assembly vocabulary.
2. Every work event carries a schema version, stable event ID, session project ID, property ID, ordered sequence/cursor, event type, stage/readiness data, and the stable object identifiers required by its payload.
3. Duplicate or replayed event IDs are idempotently ignored. Events with the wrong project/property, invalid schema, invalid payload, impossible order, or unsatisfied preconditions cannot advance readiness or replace valid state.
4. `ROOF_GEOMETRY_READY` makes stable roof surfaces and their geometry available. It gates display of roof-surface count, usable-area facts, and other roof-derived content.
5. Each `PANEL_OBJECT_ADDED` creates or idempotently confirms exactly one panel object with:
   - `panel_id`;
   - `surface_id`;
   - `placement_rank`;
   - geometry in the stable scene coordinate system;
   - render status;
   - selection state.
6. Panel selection state remains unselected and non-editable in this slice, but it is retained for future S3 use. Panel objects appear visually only after their corresponding accepted event exists.
7. Panel progress is displayed as completed stable objects against the fixture's known target count. A percentage or progress bar may be shown only when it is mathematically derived from that count; elapsed time alone cannot move it.
8. `ENERGY_MODEL_READY` gates preliminary system-size, production, exposure, or energy facts. These remain pending, unknown, or absent before the event and use `Modeled` certainty after it.
9. `MINIMUM_USABLE_READY` is accepted only after property confirmation, required roof geometry, the fixture's minimum panel-object set, and the energy model are ready. It records readiness but does not claim engineering, imagery, address, or production verification.
10. Facts expose only deliberate fixture values. Generated values shown in the references, including exact imagery dates, `1,842 sq ft`, six surfaces, `12 / 18`, `Good`, or `High`, are not requirements unless a later implementation task deliberately adopts consistent fixture data and labels its modeled status.

### 8. Assembly transport, timing, and recovery

1. One replaceable assembly-transport port normalizes a same-origin SSE stream and a same-origin polling fallback into the same typed work-event union. Final route paths are internal application details rather than an external compatibility contract.
2. SSE is attempted first. A connection failure, premature close, or injected stall switches to polling from the last accepted event cursor without resetting the project, scene, stage, or object set.
3. Polling is bounded to a default maximum of 35 requests and 35 seconds per attempt, whichever occurs first. The interval, timeout, attempt budget, and schedule are injectable for deterministic tests.
4. Polling returns events or status after the supplied cursor. It cannot synthesize a different state model, mark readiness independently, or create panels without `PANEL_OBJECT_ADDED` payloads.
5. Exhausting SSE and polling preserves the last valid projection and shows a recoverable error that states what failed, what remains safe in the browser session, and how to retry. Retry resumes from the accepted cursor and stable objects.
6. The normal foreground seeded demo runs from accepted `PROPERTY_CONFIRMED` to `MINIMUM_USABLE_READY` in approximately 20 to 30 seconds. Every visible change still maps to an accepted work event or stable object count.
7. Tests use an injected schedule and accelerated deterministic clock. Automated proof cannot wait the full visible demo duration or depend on wall-clock races.

### 9. Minimum-usable ready boundary

1. At `MINIMUM_USABLE_READY`, the property scene stays mounted, the camera context and property identity remain unchanged, and every accepted panel object remains the same object with the same ID and geometry.
2. The projection records minimum usability and the accepted event cursor. Reload restores the ready presentation without replaying object creation or beginning a second assembly.
3. The UI may replace in-progress language with a plain ready status such as `Your starting demo model is ready`, together with truthful modeled/source labels.
4. No control, lens, prompt, automatic route, or content from S3 appears. The later S3 implementation must be able to enable controls around this same renderer/component and panel set without remounting or regenerating them.

## State and Authority Rules

- Homeowner authority is required to select the normalized address, confirm the property, reject/correct the property, retry a blocked lookup or assembly, and activate help or deferred sign-in.
- The system may continue automatically only after property confirmation and only through domain-valid work events that require no additional homeowner meaning, consent, correction, or authority.
- The seeded address/property/roof/energy adapters provide source material. The validated session-project reducer/application boundary owns accepted pre-account project state.
- The UI is a projection and renderer. It cannot infer readiness from visual animation, count a panel absent from the projection, elevate modeled data to verified, or treat transport status as domain status.
- This slice contains no preview/commit system controls. `selection_state` and the no-remount contract exist solely to preserve future compatibility; they authorize no S3 behavior.
- The session project is real browser-scoped project state, not a hard-coded visual step index. All rendered S2 content must derive from the current validated projection.

## Data and Persistence

- Owned data: transient S1 view state; one browser-session project projection; normalized seeded address; one current property candidate; seeded source references; scene/camera identity; property/roof geometry; stable panel objects; modeled facts; readiness; accepted event IDs/cursor; and a browser-session consequential event record.
- Source and certainty: fixture inputs use versioned seeded metadata. Customer copy uses `Seeded demo imagery`, `Demo property match`, `Modeled`, `Pending`, or `Unknown` as appropriate. `MINIMUM_USABLE_READY` is readiness, not verification.
- Transaction boundary: each explicit address resolution, correction, property confirmation, or accepted work event validates the current projection, applies one coherent reducer/application mutation, increments the project version, appends the session-scoped consequential event, and persists the resulting projection as one logical update.
- Versioning and idempotency: the projection schema and fixture are versioned; project versions increase monotonically; event IDs and cursors prevent duplicate application; stable object IDs survive retries and reload; incompatible projections fail safely.
- Retention or deletion: data exists only in browser `sessionStorage`; rejected candidate-derived active state is cleared on correction; the unsaved project ends with the browser session according to browser behavior. No durable homeowner, project, property, or lead row is created.
- Compatibility: a later account-claim implementation may persist and claim this same projection only under a later approved spec. This slice provides stable identities and continuity but performs no claim or durable write.

## Interfaces and Dependencies

- Public interfaces: the customer-visible landing route, client transition to the persistent project route, seeded address resolution/candidate result, explicit confirmation/correction actions, same-origin assembly event stream, and same-origin assembly polling fallback. These are application interfaces, not a third-party public API commitment.
- Internal contracts: typed visible-state union; validated session-project schema; state reducer/application commands; ID, clock, and schedule ports; session-storage adapter; seeded address/property/roof/energy adapters; stable scene/roof/panel schemas; normalized work-event union; assembly transport; projection selectors; and renderer/component identity boundary.
- Events or jobs: `ADDRESS_RESOLVED`, `PROPERTY_CONFIRMED`, `ROOF_GEOMETRY_READY`, repeated `PANEL_OBJECT_ADDED`, `ENERGY_MODEL_READY`, `MINIMUM_USABLE_READY`, and `PROJECT_MUTATED` for correction. No job runner, outbox, WebSocket, or durable event infrastructure is authorized.
- External services: none. All fixture and scene data is local and replaceable. No provider SDK, API, credential, environment value, request, paid call, or durable service is permitted.
- Framework and dependency boundary: use the approved Next.js/React/TypeScript platform, native browser APIs including `sessionStorage` and `EventSource`, existing test tools, native CSS/local components, and local render primitives. Any new production dependency requires separate authority and is outside these proposed outcomes.

## Security, Privacy, and Trust

- Untrusted inputs: address text, route/query data, stored session projection, SSE messages, polling payloads, event cursors, IDs, and any content used in status or source labels.
- Validation and authorization: validate input length/shape and every adapter/storage/transport payload; accept only the seeded normalized address and expected fixture versions; bind events to the active session project and property; reject invalid transitions; make duplicate creation and event replay idempotent. Anonymous access authorizes exploration only.
- Sensitive data: no durable homeowner identity, phone, email, credential, precise real-world property claim, contractor identity, offer, or payment data. Do not log the full address, storage payload, fixture internals mistaken for secrets, or user-entered values beyond bounded non-sensitive diagnostics.
- Disclosure boundary: no contractor receives or can access the project. No provider identity, real bid, lead event, analytics identity, information sale, advertising reuse, or unrelated sharing occurs.
- Secure failure behavior: preserve the last valid projection, remain in the current safe state, label fallback/error truthfully, and never invent an address match, property fact, panel, readiness event, provider source, authenticated state, or successful persistence.
- Browser storage: stored data is treated as untrusted on every restore. Rendering and routing use parsed validated values, and server transport treats supplied IDs as correlation only rather than proof of canonical state or identity.

## Visual, Interaction, and Accessibility

- Required states: S1 default; suggestion available; address loading; invalid address; recoverable address error; deferred-sign-in feedback when that affordance is rendered; `How it works` closed/open; transition into runtime; S2 property confirmation; correction return; local-scene fallback; early, partial, fallback-transport, exhausted-transport, and complete assembly; minimum-usable ready; restored partial/ready session; and reduced-motion equivalents.
- Reference fidelity: preserve the references' premium dark solar character, image-led hierarchy, editorial serif plus neutral sans hierarchy, dominant action, full-frame S1 composition, bounded persistent S2 shell, property-centered scene, contextual decision/status instruments, source-aware facts, blue active state, and green ready state. Truthful copy and explicit requirements override literal reference text and data.
- Responsive viewports: real-browser proof is required at `1536x1024`, `1440x900`, `1024x768`, and `390x844`. Desktop may use layered scene/instrument composition. Tablet and mobile may stack instruments around the same scene while preserving action hierarchy, scene identity, readable facts, and zero horizontal overflow.
- Keyboard and focus: all inputs, suggestion options, help, close, sign-in, retry, confirmation, and correction controls are operable without a pointer or gesture. Focus is visible and logical. State transitions move focus to the new state heading; correction returns focus to the preserved address input; help closure returns focus to its trigger.
- Semantics and announcements: use landmarks, ordered headings, labels, accessible names, real buttons, listbox/option semantics, and status/alert regions. Announce lookup state, validation/error, runtime entry, property confirmation, assembly stage milestones, panel count progress, transport fallback, ready state, and control focus without narrating decorative motion or flooding the screen reader for every animation frame.
- Reduced motion: honor `prefers-reduced-motion`. Remove camera travel, panel travel/transforms, and nonessential layout morphing; preserve the same scene, event order, object appearances, status updates, and ready boundary through immediate updates or short fades.
- Interaction targets and contrast: meet WCAG 2.2 AA, maintain sufficient target size, and ensure focus does not rely on color alone.
- Intentional departures from the visual references:
  - Replace `project estimate in seconds`, real-local-data claims, review counts/ratings, and contractor/offer promises with slice-truthful value, privacy, and demo-source copy.
  - Replace `Nearmap`, imagery dates, `Address verified`, unsupported confidence, and generated `VERIFIED` facts with seeded and modeled labels.
  - Use one stable S2 scene/camera despite differences between the two S2 images; render property/roof outlines and panels separately from the base asset.
  - Correct clipped copy, overflowing cards, floating panel geometry, and malformed labels.
  - Replace S3/control-unlock language with an S2 ready status and render no S3 controls.

## Failure and Edge Behavior

- Empty, partial, or unsupported addresses remain on S1 with preserved input and deterministic guidance to the canonical fixture.
- Rapid pointer/keyboard submission, double activation, retry, reload, SSE reconnect, and polling replay cannot create duplicate project roots, properties, events, roof surfaces, or panel objects.
- Storage unavailable or write failure prevents runtime entry and exposes a retryable S1 error. Invalid restore data is rejected and returns safely to S1.
- Direct entry to the persistent project route without a valid projection returns to S1 with a bounded recovery notice and no invented session.
- Property correction clears candidate-derived active state, preserves the project root and address draft, and cannot continue the rejected candidate's assembly.
- Confirmation cannot be bypassed through route manipulation, restored flags, event injection, or transport payloads.
- Local scene failure uses the semantic fallback without changing property identity or blocking accessible confirmation and status information.
- Out-of-order, malformed, foreign, duplicate, or unknown work events cannot advance the model. The UI preserves accepted state and exposes a bounded recoverable error when continuation is unsafe.
- SSE failure uses the polling fallback. Fallback exhaustion stops automatic work at the last valid event and allows retry from the same cursor.
- Reload during assembly restores accepted panels and resumes from the cursor. Reload after readiness renders the same ready projection without a second panel reveal or assembly restart.
- Background-tab timer throttling may lengthen wall-clock presentation but cannot change event order, object identity, or readiness preconditions.
- Reduced-motion mode removes motion only. It cannot skip status, object, source, error, correction, or readiness transitions.

## Acceptance Criteria

1. After all four proposed outcomes merge in dependency order, the production root no longer contains the foundation heading or no-controls contract and instead renders the accessible seeded S1 journey with a stable product readiness marker used by smoke proof.
2. S1 default and open-help states match their exact assigned visual references in composition and hierarchy at all four required viewports, subject only to the documented truthful-copy, accessibility, and responsive departures.
3. The seeded suggestion normalizes the canonical address; keyboard and pointer selection each create exactly one valid session project and one candidate with stable IDs and seeded source metadata.
4. S1 loading, invalid, recoverable error, and privacy/no-pressure states are observable and accessible. If deferred sign-in is rendered, its feedback is also observable and accessible and creates no authentication or false success path.
5. Successful selection writes a schema-valid projection and enters the persistent runtime through client navigation without a full reload, disconnected page reset, duplicate project, or durable server write.
6. Valid same-session reload restores confirmation, partial assembly, and ready projections with identical project, property, surface, panel, scene, and camera identifiers. Invalid stored state fails safely to S1. A fresh browser context with no inherited page session starts at S1 with no restored project, consistent with actual `sessionStorage` behavior.
7. Property confirmation matches its assigned visual reference at all four viewports, displays one candidate with truthful demo source/certainty labels, and blocks deeper assembly until the explicit confirmation control is activated.
8. `Not your property?` preserves and focuses the prior input, keeps the session project root, discards the incorrect active candidate and all derived state, and permits one new candidate without retaining the rejected property as current.
9. Within one mounted persistent runtime, one local property-scene component and camera context survive confirmation, every assembly event, transport fallback, and the ready boundary. A browser reload may mount a new component instance, but it must rehydrate the identical scene, camera, property, surface, and panel identities without replacing accepted state. The base asset is not a full-page screenshot and contains no authoritative dynamic panel layer.
10. The typed event union includes the required five S2 event types. Invalid, duplicate, foreign, and out-of-order events are proven unable to advance state.
11. Roof facts appear only after `ROOF_GEOMETRY_READY`; each visual panel appears only after its stable `PANEL_OBJECT_ADDED`; energy facts appear only after `ENERGY_MODEL_READY`; readiness appears only after `MINIMUM_USABLE_READY` preconditions pass.
12. Every panel object retains `panel_id`, `surface_id`, `placement_rank`, geometry, render status, and selection state across SSE, polling, retry, reload, and readiness. Rendered progress equals accepted object counts and never advances from elapsed time alone.
13. SSE is the primary transport. A deterministic SSE failure switches to bounded polling from the last cursor, produces the same normalized events and object identities, and cannot let transport own domain readiness.
14. Normal visible assembly completes in approximately 20 to 30 seconds. Unit/integration/component/E2E tests prove the same ordering and timing contract with an injected accelerated clock rather than real waits.
15. Exhausted transport preserves the confirmed property and accepted panel objects, communicates a recoverable error, and resumes without duplication on retry.
16. Reduced-motion browser proof shows every status, fact, panel, error, correction, and readiness transition without camera travel or unnecessary transforms.
17. At `MINIMUM_USABLE_READY`, the same mounted scene and panel objects remain, the projection records readiness, and the UI contains no S3 controls, project lenses, customization, price, account, provider, or `Update system` content.
18. Real-browser review at `1536x1024`, `1440x900`, `1024x768`, and `390x844` covers composition/hierarchy, responsive stacking, overflow/clipping, focus/keyboard operation, loading/error/correction states, reduced motion, scene continuity, stable panel placement, exact-reference fidelity, and absence of screenshot substitution.
19. Automated and independent review find no call, credential, dependency, data write, copy, or network evidence for Google, Nearmap, maps, solar/property providers, Clerk, Neon/Postgres/Drizzle, Stripe, contractors, model calls, analytics identity, or another external service.
20. Component and browser proof preserve existing useful foundation invariants: one semantic main journey surface, successful production startup, no uncaught page/console errors, no unexpected same-origin HTTP errors, and no horizontal overflow.

## Validation Expectations

- Required sets across the four outcomes: `baseline`, `agent-review`, `frontend-component`, `frontend-e2e`, `frontend-visual`, `security`, `security-review`, and `smoke`, assigned per proposed outcome below. Do not invent `unit` or `integration` set names absent from `.harness/validation.md`; those test families run through `baseline`.
- Required fixtures or seeded data: versioned canonical address aliases and normalization; one property candidate; one clean local S2 property-scene asset; property outline; stable roof surfaces; ordered panel objects; modeled energy facts; explicit source/certainty values; valid, invalid, incompatible, and malicious storage projections; normal, duplicate, foreign, malformed, and out-of-order work events; SSE success/failure/stall; polling success/exhaustion; deterministic ID, clock, and schedule doubles.
- Required browser states: S1 default/open help; suggestion/keyboard/pointer; loading/invalid/error; deferred sign-in when rendered; runtime entry; property confirmation; correction; scene fallback; early/partial/complete assembly; SSE-to-polling fallback; fallback exhaustion/retry; reload at confirmation/partial/ready; `MINIMUM_USABLE_READY`; and reduced-motion equivalents.
- Required visual viewports: `1536x1024`, `1440x900`, `1024x768`, and `390x844` for every visual task and each exact visual artifact assigned to it. Compare depicted canonical states directly to their exact references; review prose-defined derived states for continuity with the assigned reference's composition, hierarchy, and visual language.
- Required real-browser review: composition and hierarchy; responsive behavior; overflow and clipping; focus and keyboard operation; loading and error states; correction behavior; reduced motion; scene continuity; stable panel placement; real semantic UI; no full-page screenshot substitution; exact-reference fidelity; and every documented intentional departure.
- Required timing proof: production/demo browser observation confirms the 20 to 30 second visible window; automated tests use an accelerated injected schedule and stable clock.
- Required continuity proof: instrument the scene/renderer instance and object identities so tests prove no remount or replacement between confirmation, assembly, transport fallback, and readiness. Separate reload proof must show a newly mounted runtime rehydrates the same accepted scene and object identities without regeneration or duplicate events.
- Required security proof: validate session storage and transport payloads, bind events to the active session project/property, prove safe invalid-state recovery, prove no durable or external write, and review address/privacy/logging behavior.
- Required independent review: acceptance and behavior, privacy/trust boundaries, data integrity and session retention, architecture/transport ownership, event/idempotency correctness, missing tests, and visual fidelity against only the task-assigned references.

## Proposed Task Outcomes

1. **Pre-account session project runtime**
   - Dependency: `docs/specs/A-repository-foundation.md` only.
   - Outcome: Implement and prove the minimal typed S1-S2 state machine, versioned session projection, validated `sessionStorage` adapter, seeded address/property/roof/energy contracts, injected ID/clock/schedule boundaries, stable project/property/surface/panel identities, work-event schemas, and one persistent runtime/scene shell. Until visual outcomes replace it, use a semantic non-product shell that exposes state for tests without claiming S1 or S2 visual fidelity. Reconcile the current smoke readiness marker and coverage scope without implementing final S1/S2 compositions.
   - References: `references/states/s02-property-analysis/technical-persistent-project-assembly.png` as technical guidance only.
   - Validation sets: `baseline`, `agent-review`, `frontend-component`, `frontend-e2e`, `security`, `security-review`, `smoke`.

2. **S1 address-entry experience**
   - Dependency: proposed outcome 1.
   - Outcome: Implement and prove the approved S1 default and open-help compositions, including one clean local hero/background asset derived or recreated only from the assigned references without baked text, controls, ratings, provider claims, or dynamic UI. Implement deterministic suggestion/normalization, keyboard and pointer selection, loading/invalid/recoverable error states, privacy/no-pressure behavior, the truthful deferred-sign-in contract if its affordance is retained, atomic session-project creation, and client transition into the persistent runtime. Cover all required responsive, accessibility, and reduced-motion states without modifying the references or implementing final S2 visuals.
   - References: `references/states/s01-address-entry/visual-default.png`; `references/states/s01-address-entry/visual-how-it-works-open.png`.
   - Validation sets: `baseline`, `agent-review`, `frontend-component`, `frontend-e2e`, `frontend-visual`, `security`, `security-review`, `smoke`.

3. **S2 property confirmation**
   - Dependency: proposed outcome 2.
   - Outcome: Implement and prove the approved confirmation composition, one local stable property scene, truthful source/certainty display, separate property outline, explicit confirmation, correction with preserved address/project identity and discarded candidate-derived state, and transition into the existing semantic live-assembly state. Preserve the confirmed property, scene, camera, and component identity for the next outcome.
   - References: `references/states/s02-property-analysis/visual-property-confirmation.png`; `references/states/s02-property-analysis/technical-persistent-project-assembly.png` as technical guidance only.
   - Validation sets: `baseline`, `agent-review`, `frontend-component`, `frontend-e2e`, `frontend-visual`, `security`, `security-review`, `smoke`.

4. **S2 live roof assembly**
   - Dependency: proposed outcome 3.
   - Outcome: Implement and prove the approved assembly composition, typed event-driven progress, stable panel-object reveal, readiness-gated modeled facts, SSE with bounded polling fallback, 20 to 30 second visible seeded schedule, accelerated deterministic tests, reduced-motion parity, retry/reload continuity, and the in-place `MINIMUM_USABLE_READY` boundary. Retain the same scene and object set and render no S3 content.
   - References: `references/states/s02-property-analysis/visual-live-roof-assembly.png`; `references/states/s02-property-analysis/technical-persistent-project-assembly.png` as technical guidance only.
   - Validation sets: `baseline`, `agent-review`, `frontend-component`, `frontend-e2e`, `frontend-visual`, `security`, `security-review`, `smoke`.

Dependency order: proposed outcome 1 -> proposed outcome 2 -> proposed outcome 3 -> proposed outcome 4. Each outcome is independently testable and mergeable, receives only the listed references, and leaves the repository in a truthful intermediate state for its successor.

## Open Questions

- none
