# State Contracts

This directory contains the durable contract package for each customer-visible product state.

Each state belongs to one continuous project environment. State folders isolate state-specific truth without duplicating global product, architecture, design, or MVP rules.

## Inclusion Test

A requirement belongs in the state document only when it must remain true if the implementation is replaced with a newer or better solution.

Implementation-specific decisions belong in specs or code rather than the state contract.

## State Package

```text
contracts/states/
  README.md
  STATE_TEMPLATE.md

  sNN-kebab-case-state-name/
    sNN-state.md
    visual-<descriptor>.png
    technical-<descriptor>.png
    specs/
      <state-spec>.md
```

Create the `specs/` directory when the state receives its first spec.

## Artifact Ownership

### `sNN-state.md`

Owns durable state-specific truth:

- purpose and scope;
- entry and exit boundaries;
- homeowner and platform behavior;
- inputs and resulting state;
- invariants;
- failure and recovery expectations;
- state-specific quality and validation truth.

### `visual-*.png`

Owns:

- canonical user-facing composition;
- visible substates;
- important visual changes;
- expected user-facing result.

### `technical-*.png`

Owns its approved depiction of:

- process sequencing;
- concurrent activity;
- rendering stages;
- data movement;
- background processing;
- persistence behavior;
- animation flow.

The infographic cannot independently create product behavior, architecture, services, or state absent from governing prose.

### `specs/*.md`

Each spec owns one approved collective implementation outcome assigned to this state.

Specs do not contain task decomposition.

## Cross-State Specs

A spec may affect multiple states when one collective outcome is only complete across their seam.

Use terminal-state ownership:

- store the spec under the state whose completion makes the outcome whole;
- identify that state as the single owner;
- list every affected state contract;
- keep durable cross-state system truth in `ARCHITECTURE.md`;
- split the spec when each state has an independently complete outcome.

Do not create a shared-state spec folder.

## Artifact Consistency

The state document, visual references, technical infographics, and approved specs must describe compatible truth.

- the state document controls what must remain true;
- visual references control what the homeowner should see;
- technical infographics control their approved process depiction;
- specs control their approved collective implementation outcome.

Reference another artifact instead of restating detail already owned by it.

Resolve material contradictions before implementation continues.

## Naming Conventions

### State Directory

```text
sNN-kebab-case-state-name
```

### State Document

```text
sNN-state.md
```

### Visual Reference

```text
visual-<kebab-case-descriptor>.png
```

### Technical Infographic

```text
technical-<kebab-case-descriptor>.png
```

Use the smallest descriptor that clearly distinguishes the asset.

Do not add version numbers to filenames. Git owns history.

## State Index

- `s01-address-entry`: S01 Address Entry
- `s02-property-analysis`: S02 Property Analysis
- `s03-preliminary-system-design`: S03 Preliminary System Design
- `s04-preliminary-range-account-gate`: S04 Preliminary Range + Account Gate
- `s05-project-understanding`: S05 Project Understanding
- `s06-contractor-ready-packet`: S06 Contractor-Ready Packet
- `s07-offer-comparison`: S07 Offer Comparison
- `s08-selection-transaction-review`: S08 Selection + Transaction Review
- `s09-terms-test-transaction`: S09 Terms + Test Transaction
- `s10-active-project-verification`: S10 Active Project + Verification
