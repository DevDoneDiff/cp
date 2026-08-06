# S01: Address Entry

**State:** draft

**Approved:** false

## Purpose and Scope

**User objective:** Enter or select the supported home address to begin a solar project without creating an account.

**Product outcome:** Resolve the supported address into one accepted browser-session project and hand the same project into S02 property confirmation.

```text
anonymous or corrected address entry
  -> bounded address resolution and project-root acceptance
  -> browser-session project in PROPERTY_CONFIRMATION
```

**Included**
- Present the public address-entry experience before account creation.
- Accept and validate bounded homeowner address input.
- Present the currently supported demo address as a selectable suggestion.
- Explain the immediate project journey through the optional "How it works" surface.
- Resolve supported input through the governed address-resolution boundary.
- Create or reuse exactly one accepted active browser-session project root after successful address resolution.
- Validate and accept the resulting project projection before leaving S01.
- Recover safely from empty or successfully cleared invalid browser-session state.
- Fail closed when browser-session state cannot be read, verified, or accepted.
- Re-enter from S02 correction without replacing the existing project root.
- Hand the accepted project into the persistent S02 runtime.

**Excluded**
- Property confirmation.
- Roof or solar model assembly.
- Durable account creation or homeowner identity.
- Contractor disclosure or provider contact.
- Pricing, offers, financing, payments, or later project lifecycle behavior.

## State Boundary

**Entry conditions**
- The homeowner enters on a fresh public-root visit with no accepted browser-session project.
- The homeowner may re-enter after S02 correction returns the same session-project root with no accepted property candidate.
- Empty state or invalid state whose removal has been verified may return the homeowner to a fresh S01 entry.
- Browser-session state has been checked before authoritative address submission can be accepted.
- A validated projection that already contains an accepted property resumes S02 and is not an S01 entry.

**Exit conditions**
- The submitted address resolves to the supported property candidate.
- A session project has been created or reused as the single accepted active project root.
- The resulting projection has been validated and successfully accepted by the browser-session store.
- The resulting visible project state is `PROPERTY_CONFIRMATION`.
- The existing session project continues into S02 without replacement or restart.

**Advancement blockers**
- Browser-session restoration has not completed or remains unavailable.
- Address input is empty, malformed for the bounded demo, or unsupported.
- Address lookup returns a recoverable failure.
- A valid project root cannot be created or reused.
- The proposed project transition is rejected.
- Browser-session acceptance or persistence fails.

**Substates**

| ID | Name | Purpose | Completion condition |
|---|---|---|---|
| `S01.1` | `ADDRESS_ENTRY` | Present the public project entry and collect a supported address. | A supported address is selected or submitted for lookup. |
| `S01.2` | `HOW_IT_WORKS_OPEN` | Explain the immediate pre-account journey without changing project state. | Homeowner dismisses the surface, presses Escape, or advances into address lookup. |
| `S01.3` | `ADDRESS_LOOKUP_PENDING` | Resolve the selected address while preventing duplicate accepted project state. | Lookup resolves, fails recoverably, or is rejected as unsupported. |

## Experience Contract

**Homeowner sees**
- A full-frame public solar-project entry experience.
- The primary statement: "Build your solar project with confidence."
- A labeled home-address input.
- A supported address suggestion when the typed value matches the current demo candidate.
- One dominant submit action for finding the property.
- An optional "How it works" control.
- When opened, a four-part explanation covering address entry, property confirmation, starting-model assembly, and preservation of one project context.
- Plain-language feedback for address failures, unsuccessful project acceptance, successfully cleared invalid session state, and missing direct-entry state.

**Homeowner does**
- Enter or select the supported home address.
- Submit the selected address to begin the project.
- Optionally open and close "How it works."
- Correct unsupported input or retry recoverable address resolution.

**Platform does automatically**
- Restore and validate browser-session state before accepting authoritative address submission.
- Resume S02 without rewriting the projection when restored state already contains an accepted property.
- Keep non-consequential input, suggestion, help, loading, validation, recovery, and deferred-sign-in presentation outside canonical project state.
- Bound unsupported input before attempting address resolution.
- Resolve the supported address through the governed address-resolution boundary.
- Prevent concurrent keyboard, pointer, submit, or retry activation from publishing duplicate accepted project state.
- Create one accepted session-project root when none exists or reuse the existing root after correction.
- Convert successful address resolution into the canonical project transition.
- Validate and persist the proposed projection before publishing it as accepted runtime state.
- Enter S02 only after browser-session acceptance succeeds.
- Report invalid session data as cleared only after verified removal; otherwise treat restoration as unavailable.

**Required pause points**
- Homeowner must supply a supported address before project acceptance.
- Unsupported or failed lookup requires homeowner correction or retry.
- Unavailable restoration or unsuccessful persistence prevents advancement.

**Visible state changes**
- Matching input reveals the supported address suggestion.
- Submission changes the address control into a pending/loading condition.
- Recoverable lookup failure preserves the entered address and exposes retry feedback.
- Unsupported input exposes bounded correction guidance.
- Invalid restored session data is reported as cleared only after verified removal.
- Successful resolution leaves S01 and continues the accepted project in S02.

## Inputs and Resulting State

| Input | Source | Required | Authority | Result |
|---|---|---:|---|---|
| Raw home-address text | Homeowner | Yes | Homeowner for supplied input; platform for validation | Remains transient until supported resolution succeeds. |
| Supported address suggestion | Current demo address boundary | Yes for the current demo | Platform fixture | Supplies the normalized supported candidate without accepting project state. |
| Address-resolution result | Governed address-resolution boundary | Yes | Platform adapter boundary | Rejects, fails recoverably, or supplies canonical command input. |
| Existing session projection | Browser-session store | No | Session project store plus projection validator | Restores a validated projection unchanged; empty or verified-cleared invalid state yields fresh S01; inaccessible or unverifiable state remains unavailable. |
| Session-project root identity | Platform | Yes after first accepted resolution | Platform | Establishes the single accepted active pre-account project root. |
| Normalized property candidate | Platform property boundary | Yes | Platform | Becomes accepted project state and changes the visible state to `PROPERTY_CONFIRMATION`. |

- **Temporary:** Non-consequential address-entry, suggestion, help, loading, validation, and recovery presentation.
- **Committed:** Session-project identity, normalized address and property candidate, project event history, versioned projection, and resulting `PROPERTY_CONFIRMATION` visible state after successful browser-session acceptance.
- **Carried forward:** The accepted session-project identity, normalized property candidate, source information, event history, version, and projection.
- **Events or transitions:** `ADDRESS_RESOLVED`, `ADDRESS_ENTRY -> PROPERTY_CONFIRMATION`

## Behavioral Rules and Invariants

- Address resolution creates a browser-session project rather than a durable homeowner record.
- S01 may publish only one accepted active session-project root.
- Repeated activation cannot create a second accepted active project or projection.
- Raw homeowner input must not enter URLs, logs, unrelated storage, analytics, or unrelated or unauthorized external requests.
- Any approved address-resolution service must remain purpose-limited and behind the governed adapter boundary.
- Address suggestion and lookup activity alone cannot accept project state.
- Help and deferred sign-in interactions cannot mutate project state or create an account.
- The runtime must validate and persist a proposed projection before it becomes observable accepted state.
- S02 cannot begin before successful browser-session acceptance.
- S01 transient presentation is not canonical project state.
- Account creation is not required to receive initial project value.
- S01 cannot disclose homeowner information to contractors.
- S02 correction preserves the accepted session-project root, address draft, event history, cursor, and project version while removing the rejected candidate from active state.

## Failure and Recovery

| Condition | Homeowner experience | Preserved state | Recovery |
|---|---|---|---|
| Empty address submission | Input receives explicit supported-address guidance. | Current transient input state and any previously accepted project root. | Enter the supported address and resubmit. |
| Unsupported address | Homeowner is told the address is unavailable in the demo and given the supported address. | Entered address and any previously accepted project root; no new candidate or transition is accepted. | Correct the address and submit again. |
| Recoverable address-resolution failure | Error states that lookup failed and the address remains. | Entered address and any previously accepted project root; no new candidate is accepted. | Retry the same address. |
| Browser-session persistence failure | Error states that the project change could not be accepted and the address remains. | Last accepted projection and entered address; the failed candidate is not published. | Retry project acceptance. |
| Invalid stored session projection with verified cleanup | Invalid browser-session data is reported as cleared and fresh address entry is presented. | No invalid project authority is preserved. | Begin a fresh S01 entry. |
| Browser-session state unavailable or cleanup unverified | No successful restoration or clean recovery is claimed. | No inaccessible or unverified state becomes project authority. | Remain blocked until browser-session state can be safely checked and accepted. |
| Direct S02 entry without an active session project | Homeowner is returned to address entry with explicit recovery context. | No fabricated project state. | Enter the supported address to begin again. |
| Project-root or domain-transition failure | Advancement is rejected. | Last valid runtime state. | Remain in S01 rather than fabricating S02 readiness. |

- **Blocking:** Unsupported address, unresolved lookup, unavailable restoration, project-root failure, rejected domain transition, or unsuccessful browser-session acceptance.
- **Nonblocking:** Opening or closing "How it works," address suggestion interaction, and other non-consequential S01 presentation state.

## State-Specific Quality Expectations

- **Timing:** Direct interface feedback follows the shared 120 to 220 ms control-feedback expectation.
- **Responsiveness:** Address entry, suggestion selection, help interaction, validation, and submission remain usable at the required desktop and mobile viewports.
- **Persistence:** Only a successfully validated and accepted session-project projection reaches the browser-session store; S01 presentation state remains transient.
- **Continuity:** Successful address resolution establishes the project root that S02 must continue rather than replace or recreate. Correction returns that same root to S01, and valid accepted-property restoration resumes S02.
- **Accessibility:** The address field has a visible label and combobox semantics; suggestions expose listbox and option semantics; submit has an accessible name; validation is programmatically connected; the help surface supports focus management and Escape dismissal; all required interactions remain keyboard operable.
- **Privacy and authority:** S01 remains anonymous and browser-session scoped. It creates no durable homeowner identity, contractor disclosure, credential state, unauthorized address disclosure, or provider access.

## Validation Contract

The state is valid only when:

1. The public root renders the S01 address-entry experience defined by this contract and remains operable without account creation.
2. Only supported bounded address input can produce an accepted property candidate.
3. Successful resolution creates or reuses one accepted active session project, persists it atomically, changes the projection to `PROPERTY_CONFIRMATION`, and continues that same project into S02.
4. Empty, unsupported, lookup-failed, persistence-failed, invalid-session, missing-session, and unavailable-session paths fail closed and either provide bounded correction or retry or remain blocked without fabricating successful project state.
5. Help, suggestion, loading, validation, and other non-consequential S01 interactions cannot independently mutate canonical project state; concurrent or repeated activation cannot publish a second accepted active project root or projection.
6. S02 correction returns the same project root to S01 without its rejected candidate, while a valid accepted-property restoration resumes S02 without rewriting or replacing the project.

Reject the implementation if:

- S01 publishes multiple accepted active project roots, creates a durable homeowner identity, discloses the project to a contractor, or accepts project state before successful address resolution.
- S02 begins before the accepted project projection is successfully validated and persisted.
- Unsupported or failed address resolution fabricates a property or successful transition.
- Correction discards the accepted project root or valid restoration restarts address entry with a replacement project.
- Returning or direct-entry behavior silently replaces a valid existing session project.
- Invalid browser-session data is reported as cleared without verified removal.
- Raw homeowner address input leaks into URLs, logs, unrelated storage, analytics, or unrelated or unauthorized external requests.

## References

**Governing documents**
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/MVP.md`

**State reference images**

| Asset | State or substate represented |
|---|---|
| `docs/contracts/states/s01-address-entry/visual-default.png` | `S01.1 ADDRESS_ENTRY` default appearance |
| `docs/contracts/states/s01-address-entry/visual-how-it-works-open.png` | `S01.2 HOW_IT_WORKS_OPEN` |
