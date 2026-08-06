# SNN: [State Name]

**State:** [draft | approved]

**Approved:** [false | true]

## Purpose and Scope

**User objective:** [WHAT_THE_HOMEOWNER_MUST_ACCOMPLISH]

**Product outcome:** [WHAT_THE_PRODUCT_MUST_PRODUCE_OR_RESOLVE]

```text
[ENTRY_CONDITION_OR_PERCEPTION]
  -> [STATE_ACTIVITY]
  -> [EXIT_CONDITION_OR_PERCEPTION]
```

**Included**
- [REQUIRED_BEHAVIOR]
- [REQUIRED_BEHAVIOR]

**Excluded**
- [BEHAVIOR_OWNED_BY_ANOTHER_STATE_OR_ARTIFACT]
- [BEHAVIOR_THAT_MUST_NOT_OCCUR]

## State Boundary

**Entry conditions**
- [ENTRY_CONDITION]
- [ENTRY_CONDITION]

**Exit conditions**
- [EXIT_CONDITION]
- [EXIT_CONDITION]

**Advancement blockers**
- [BLOCKING_CONDITION]
- [BLOCKING_CONDITION]

**Substates**

| ID | Name | Purpose | Completion condition |
|---|---|---|---|
| `SNN.N` | [SUBSTATE_NAME] | [PURPOSE] | [CONDITION] |

## Experience Contract

**Homeowner sees**
- [VISIBLE_INFORMATION_OR_OBJECT]
- [VISIBLE_INFORMATION_OR_OBJECT]

**Homeowner does**
- [REQUIRED_OR_OPTIONAL_ACTION]
- [REQUIRED_OR_OPTIONAL_ACTION]

**Platform does automatically**
- [AUTOMATIC_BEHAVIOR]
- [AUTOMATIC_BEHAVIOR]

**Required pause points**
- [INPUT_CORRECTION_OR_CONSENT_REQUIRED]

**Visible state changes**
- [VISIBLE_CHANGE]
- [VISIBLE_CHANGE]

## Inputs and Resulting State

| Input | Source | Required | Authority | Result |
|---|---|---:|---|---|
| [INPUT] | [USER_OR_SYSTEM_SOURCE] | [YES_OR_NO] | [AUTHORITY_STATE] | [STATE_EFFECT] |

- **Temporary:** [VALUE_OR_OBJECT_THAT_REMAINS_TRANSIENT]
- **Committed:** [VALUE_OR_OBJECT_THAT_BECOMES_PROJECT_STATE]
- **Carried forward:** [VALUE_OR_OBJECT_INHERITED_BY_NEXT_STATE]
- **Events or transitions:** `[EVENT_OR_TRANSITION]`, `[EVENT_OR_TRANSITION]`

## Behavioral Rules and Invariants

- [NON_NEGOTIABLE_STATE_RULE]
- [IDENTITY_OR_CONTINUITY_RULE]
- [AUTHORITY_OR_MUTATION_RULE]
- [PROHIBITED_BEHAVIOR]

## Failure and Recovery

| Condition | Homeowner experience | Preserved state | Recovery |
|---|---|---|---|
| [FAILURE_OR_UNAVAILABLE_INPUT] | [VISIBLE_RESPONSE] | [PRESERVED_INFORMATION] | [RECOVERY_PATH] |

- **Blocking:** [FAILURE_THAT_PREVENTS_ADVANCEMENT]
- **Nonblocking:** [FAILURE_WITH_FALLBACK_OR_DEFERRED_RESOLUTION]

## State-Specific Quality Expectations

- **Timing:** [STATE_SPECIFIC_TIMING_TARGET]
- **Responsiveness:** [INTERACTION_RESPONSE_EXPECTATION]
- **Persistence:** [SESSION_OR_DURABLE_BEHAVIOR]
- **Continuity:** [OBJECT_OR_STATE_CONTINUITY_REQUIREMENT]
- **Accessibility:** [STATE_SPECIFIC_ACCESSIBILITY_REQUIREMENT]
- **Privacy and authority:** [STATE_SPECIFIC_DATA_OR_PERMISSION_BOUNDARY]

## Validation Contract

The state is valid only when:

1. [OBSERVABLE_ACCEPTANCE_CRITERION]
2. [OBSERVABLE_ACCEPTANCE_CRITERION]
3. [STATE_MUTATION_OR_TRANSITION_CRITERION]
4. [FAILURE_OR_RECOVERY_CRITERION]
5. [CONTINUITY_OR_AUTHORITY_CRITERION]

Reject the implementation if:

- [MATERIAL_VIOLATION]
- [MATERIAL_VIOLATION]

## References

**Governing documents**
- `[EXACT_REPOSITORY_RELATIVE_PATH]`
- `[EXACT_REPOSITORY_RELATIVE_PATH]`

**State reference images**

| Asset | State or substate represented |
|---|---|
| `docs/contracts/states/sNN-kebab-case-state-name/visual-<descriptor>.png` | [STATE_OR_SUBSTATE] |

**Technical infographics**

| Asset | Processes represented |
|---|---|
| `docs/contracts/states/sNN-kebab-case-state-name/technical-<descriptor>.png` | [PROCESS_SCOPE] |
