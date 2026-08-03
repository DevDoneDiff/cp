# MVP Customer State Flow Specification
**Status:** Canonical approved source  
**Approved:** true  
**Audience:** Design, Codex, and implementation agents only  
**Scope:** Customer-visible investor-demo flow derived from `MVP_DEMO_SYSTEM_SPEC.md` and `PRODUCT_SYSTEM_SPEC.md`
## 1. Authority
This document controls the purpose, sequence, state boundary, data dependency, mutation, and transition of each MVP customer-visible state. Use it as the base for state prototypes, state behavior specs, technical references, implementation tasks, and visual validation.
## 2. State Inventory
Produce approved reference bundles for **10 primary customer-visible states**, `S1-S10`. A state bundle may contain multiple visual references when open, closed, transitional, evidence, or responsive variants require separate authority.

The flow also uses four reusable contextual surfaces:
- `O1 Project Lens`
- `O2 Project Signal Detail`
- `O3 Exception Stack`
- `O4 Evidence + Provenance`

These surfaces are components inside the primary states. They do not create separate routes or expand the primary state count. Show their canonical appearance within the designated state reference bundles.
## 3. Global Experience Contract
- The experience is one continuous project environment.
- Each visible composition is a project state, not an isolated application page.
- The same project identity survives from resolved property through verified execution.
- The property is the initial central object; the structured project gradually becomes the central object.
- The right-side instrument holds the current decision, editable summary, or next action.
- Drawers expose estimates, transaction consequences, and evidence without removing project context.
- Contextual surfaces remain anchored to the specific entity being explained or edited.
- Completed interactions compress into durable project state instead of remaining as chat or form history.
- Every material value can expose source and certainty: `MODELED`, `USER_PROVIDED`, `PROVIDER_PROVIDED`, `SYSTEM_INFERRED`, `VERIFIED`, or `UNKNOWN`.
- Direct controls preview immediately and commit through one explicit update action.
- Agent work is bounded, asynchronous where appropriate, and never blocks deterministic controls.
- No permanent sidebar, generic dashboard, persistent chatbot, or disconnected page sequence may replace this flow.
## 4. Journey and Graph Growth
```text
S1 Address Entry
  → S2 Property Analysis
  → S3 Preliminary System Design
  → S4 Preliminary Range + Account Gate
  → S5 Project Understanding
  → S6 Contractor-Ready Packet
  → S7 Offer Comparison
  → S8 Selection + Transaction Review
  → S9 Terms + Test Transaction
  → S10 Active Project + Verification
```

```text
Address
  → session Project + Property
  → SystemConfiguration
  → durable account-owned Project
  → HomeownerSignals + ContractorRequirements
  → confirmed Packet projection
  → Offers + OfferDeltas
  → SelectionSnapshot + sharing authorization
  → AgreementState + PaymentState
  → Milestones + Claims + Artifacts + verified project state
```
## 5. Primary State Specifications
### S1. Address Entry
**Journey role:** Establish trust and begin exploration before account creation or lead capture.  
**Primary object:** Generic lightweight roof or home model.  
**Entry state:** No project exists. Only transient browser interaction is present.  
**Displayed data:** Brand, concise value proposition, address input, pre-account privacy promise, sign-in access.  
**Primary action:** Select a normalized address.  
**Data effect:** Resolve address identity and coordinates. A successful resolution creates the session-scoped project root and `Property` candidate.  
**Transition:** Create the session project and enter the persistent post-address project runtime in `S2`. The submitted address becomes the identity anchor; the distinct landing composition does not become the canonical property scene.  
**Prototype must communicate:** Minimal effort, no phone-number trap, and immediate movement toward the homeowner's actual property.
### S2. Property Analysis
**Journey role:** Make the platform's hidden work legible while resolving the correct property and solar model.  
**Primary object:** The detected property emerging from the submitted address and becoming the persistent project scene.  
**Entry data:** Normalized address, property candidate, vendor request state.  
#### S2.1 Property Confirmation
**Displayed data:** Detected property identity, source or imagery status, clear confirmation action, and a clear `Not your property?` correction path.  
**Primary action:** Confirm or correct the detected property.  
**Authority rule:** Pause because homeowner correction or confirmation is required. No deeper assembly state is accepted before confirmation.  
#### S2.2 Live Roof Assembly
**Displayed data:** The confirmed property scene, truthful readiness stages, progressive roof geometry, stable panel objects as they become available, source quality, known facts, and unresolved items.  
**Primary action:** No action when the platform can safely continue. The system advances automatically as work completes.  
**Data effect:** Populate modeled `Property`, `ProjectFact`, source references, roof geometry, candidate panel positions, valid system configurations, and preliminary production inputs.  
**Continuity rule:** The same renderer, property scene, camera context, property identity, and panel object identities persist into S3. S3 unlocks in place with no replacement render or visual reset.  
**Transition:** Enter `S3` when the minimum usable property and solar model exists.  
**Prototype must communicate:** The homeowner watches the actual preliminary project assemble instead of waiting behind a generic loading screen.
### S3. Preliminary System Design
**Journey role:** Deliver the first personalized result and let the homeowner explore bounded system choices.  
**Primary object:** Actual or clearly labeled representative roof with an automatically placed starter system.  
**Entry data:** Property model, valid panel configurations, initial system recommendation, modeled production inputs.  
**Displayed data:** Panel count or system goal, battery preference, EV readiness, production estimate, source quality, and current assumptions.  
**Primary actions:** Adjust direct controls, inspect contextual Project Lenses, switch between auto and manual preference where supported, then select `Update system` or confirm the starting layout.  
**Data effect:** Slider and checkbox changes remain local preview state. `Update system` commits one `SystemConfiguration` mutation and recalculates production, modeled range inputs, and completeness. Explicit manual overrides remain authoritative until auto mode is restored.  
**Transition:** Confirmed starting configuration advances to `S4`.  
**Prototype must communicate:** Infrastructure performs initial placement; the homeowner controls goals and exceptions without designing panel geometry manually.
### S4. Preliminary Range + Account Gate
**Journey role:** Provide useful value before registration, then convert the temporary exploration into a saved project.  
**Primary object:** Confirmed preliminary system with a result drawer rising from the same environment.  
**Entry data:** Confirmed `SystemConfiguration`, modeled pricing inputs, completeness state, unresolved variance drivers.  
**Displayed data:** One non-contractor-specific project range, why the range exists, known assumptions, unknowns, and explicit preliminary status. No contractor names, cards, or real bids appear.  
**Primary action:** Create or access an OTP account to save and continue.  
**Data effect:** Account creation claims the existing session graph, attaches homeowner identity and permissions, persists the project, and appends the phase transition without resetting the configuration. Closing the unsaved session removes the exploration state.  
**Transition:** Successful account claim enters `S5`.  
**Prototype must communicate:** The homeowner received value first and understands exactly what account creation unlocks.
### S5. Project Understanding
**Journey role:** Convert homeowner intent, preferences, and concerns into transparent structured project state.  
**Primary object:** The same property and system, now surrounded by editable project understanding.  
**Entry data:** Saved project, property facts, configuration, modeled assumptions, current projection.  
**Displayed data:** Project Preferences instrument, auto-populated facts, certainty indicators, concern and preference pills, advanced manual input, and contextual hotspots. Show `O1 Project Lens` with `Overview` and optional `Ask`.  
**Primary actions:** Inspect a hotspot, ask a scoped question, enter unusual context, edit candidate signals, adjust relevant controls, and select `Update system`.  
**Data effect:** Preserve raw homeowner text; the scoped harness proposes typed `HomeownerSignal` and `ContractorRequirement` candidates. Validated candidates appear as editable pills. Update commits accepted signals and requirements, then deterministic logic may revise auto-mode configuration and range inputs.  
**Canonical demo transformation:** Roof-leak concern plus monthly-cost and EV intent become structured, source-aware project signals and at least one contractor requirement.  
**Transition:** Required material understanding advances to `S6`.  
**Prototype must communicate:** Natural intent becomes usable project structure while chat remains optional and localized.
### S6. Contractor-Ready Packet
**Journey role:** Show the homeowner the exact project baseline that contractor-backed offers will price.  
**Primary object:** A live packet projection assembled from the same evolving project.  
**Entry data:** Property, confirmed configuration, homeowner signals, derived requirements, financing posture, timeline, unknowns, and source map.  
**Displayed data:** Property summary, system, goals, concerns, decision criteria, financial boundary, future needs, contractor requirements, verification needs, and source or certainty for each material item. Show `O2 Project Signal Detail` and `O3 Exception Stack` within this state.  
**Primary actions:** Inspect or edit material interpretations, resolve only high-impact exceptions, then confirm the packet.  
**Data effect:** Corrections supersede prior values through versioned events. Packet confirmation freezes the procurement baseline version used to generate offers and changes phase to `READY_FOR_OFFERS`.  
**Transition:** Confirmed packet produces or loads offers in `S7`.  
**Prototype must communicate:** Contractors receive a prepared project rather than a name, phone number, and vague solar interest.
### S7. Offer Comparison
**Journey role:** Turn contractor-backed conditional offers into one intelligible decision against the confirmed packet.  
**Primary object:** The packet remains the comparison baseline while contractor offers become candidate executions of it.  
**Entry data:** Confirmed packet version, three seeded contractor profiles and commercial rule sets, three offers, normalized `OfferDelta` records.  
**Displayed data:** Narrow conditional ranges, included scope, equipment, battery, dealer fees, warranties, exclusions, assumptions, requirement coverage, risks, and price authority. Offers use the same comparison structure. Show one `O1 Project Lens` explaining a selected delta objectively.  
**Primary actions:** Move between offers, inspect meaningful differences, compare against homeowner priorities, and choose a candidate provider.  
**Data effect:** Inspection creates no authoritative change. A final selection action passes the chosen offer and current packet version to `S8`. Homeowner identity and exact project data remain undisclosed to providers until explicit authorization.  
**Transition:** Selected candidate opens transaction review.  
**Prototype must communicate:** The platform explains why proposals differ instead of presenting ordinary marketplace cards.
### S8. Selection + Transaction Review
**Journey role:** Convert an informed preference into an auditable provider decision and explicit sharing authorization.  
**Primary object:** Selected offer attached to the confirmed project baseline.  
**Entry data:** Candidate provider, offer version, packet version, conditions, unresolved verification items, Project Management Fee policy.  
**Displayed data:** Accepted scope, conditional price, material inclusions and exclusions, remaining conditions, provider identity, data to be shared, marketplace fee, and next transaction steps.  
**Primary actions:** Review, return to comparison, or explicitly select the provider and authorize project disclosure.  
**Data effect:** Create immutable `SelectionSnapshot`; record provider, offer version, project version, scope, conditions, requirements, timestamp, and sharing permission; advance phase to `SELECTED`.  
**Transition:** Confirmed selection enters `S9`.  
**Prototype must communicate:** Selection is a consequential project event with visible scope and permission, not a casual card click.
### S9. Terms + Test Transaction
**Journey role:** Complete the minimum pre-close steps needed to turn the selected offer into an active transaction.  
**Primary object:** The selected project and obligation checklist remain visible while transaction layers appear.  
**Entry data:** `SelectionSnapshot`, marketplace terms, required provider-document states, signer roles, Project Management Fee, payment state.  
**Displayed data:** Terms, required acknowledgments, document completion state, fee amount and refund boundary, payment status, and clear remaining actions. Contract clauses may invoke `O1 Project Lens`.  
**Primary actions:** Accept terms, complete or simulate required document states, and pay through Stripe test Checkout.  
**Data effect:** Persist versioned `AgreementState`; process Stripe webhook into authoritative `PaymentState`; append transaction events; mark demo closed won when all required conditions are satisfied.  
**Transition:** `TRANSACTION_COMPLETE` opens `S10` without sending the homeowner to a separate portal.  
**Prototype must communicate:** The platform preserves clarity through commitment and makes obligations understandable before payment.
### S10. Active Project + Verification
**Journey role:** Prove that the platform remains useful after provider selection and governs the customer-visible project record.  
**Primary object:** The same project transformed into a minimal execution view.  
**Entry data:** Selected provider, transaction state, milestone definitions and instances, timeline estimate, provider claims, artifacts, verification rules.  
**Displayed data:** Current milestone, next milestone, responsible party, blocker, installation window, reason for timeline change, latest verified event, and a minimal surrounding project path. Show `O4 Evidence + Provenance`.  
**Canonical demo event:** Provider reports permit approval; status remains reported and unverified; a seeded permit artifact arrives; the verification rule passes; the milestone becomes verified; next action and installation window update.  
**Primary actions:** Inspect milestone explanation, evidence, reporter, and resulting project change.  
**Data effect:** Create `Claim`, attach `Artifact`, satisfy `VerificationRule`, update `Milestone`, recalculate `TimelineEstimate`, append events, increment project version, and rebuild the customer projection.  
**Prototype must communicate:** A contractor-system update is treated as a claim until evidence supports the consequential state change.
## 6. Reusable Contextual Surface Placement
| Surface | Canonical state placement | Purpose |
|---|---|---|
| `O1 Project Lens` | `S5`, reused in `S7`, `S9`, and `S10` | Explain one selected entity using `Overview`; open optional scoped `Ask`; propose bounded project changes where permitted. |
| `O2 Project Signal Detail` | `S6`, invoked from pills created in `S5` | Expose original statement, interpretation, source, importance, project effect, edit/remove, and confirmation state. |
| `O3 Exception Stack` | `S6`, reused when needed in `S8` | Collect only missing or contradictory information that materially changes pricing, offer validity, or transaction readiness. |
| `O4 Evidence + Provenance` | `S10` | Show claim source, artifact, verification rule, status transition, and resulting timeline or milestone effect. |
## 7. Reference Bundle and Task Contract
Each state implementation is governed by one approved source bundle:

- one approved written state spec;
- one or more exact approved visual references;
- an approved technical reference when continuity, data flow, renderer behavior, integrations, or mutation boundaries require it.

Separate visible variants when that provides clearer authority. Examples include S1 help closed and open, S2 property confirmation and live assembly, and later evidence drawers or transaction surfaces.

The approved spec must list exact repository-relative artifact paths. `$task-authoring` must copy the applicable exact paths into each generated task. Codex cannot infer authority from folder contents. Technical images are guidance only and cannot introduce unstated behavior or architecture.
## 8. Prototype Sequence
Create and approve prototypes in this order:
```text
S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8 → S9 → S10
```
Preserve the selected landing and design reference as the conceptual baseline for `S1-S4`. Each later prototype must inherit the same project identity, visual system, spatial grammar, certainty language, and continuity. Do not prototype a later state until the preceding state's exit condition and transition are visually understood.
## 9. State-Level Proof Contract
The complete state set must make these transformations visually legible:
1. Address becomes a property-specific solar model.
2. Property model becomes an editable preliminary system.
3. Preliminary system becomes a saved project after value is delivered.
4. Homeowner language becomes structured, inspectable project state.
5. Structured state becomes a contractor-ready procurement baseline.
6. Contractor-backed offers become comparable against that baseline.
7. Provider choice becomes a versioned transaction with explicit permission.
8. Terms and payment become an active project without a context break.
9. Provider claims become verified milestones only through evidence.
