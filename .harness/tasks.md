# Tasks

## Purpose

Canonical queue for approved active work.

Specs define collective implementation outcomes. Tasks are small, independently verifiable implementation bricks derived through `$task-authoring`.

## Control

- `RUN_MODE`: autonomous
- `MERGE_MODE`: autonomous
- `NEXT_TASK_TAG`: 0040
- `NEXT_REFACTOR_TAG`: 0001

Only explicit user instruction may change `RUN_MODE` or `MERGE_MODE`.

## Task Stores

- `.harness/tasks.md` contains active `queued`, `working`, or `blocked` tasks only.
- `.harness/completed.md` contains immutable completed task entries.
- `.harness/work/<TAG>.md` contains ephemeral task-local rehydration state.

Normal task selection and implementation must not load `.harness/completed.md`.

## Queue Invariants

MUST:

- use `[T-####]` for feature, bug, migration, or maintenance work;
- use `[R-####]` only for behavior-preserving structural work;
- assign tags monotonically and never reuse them;
- treat physical active-queue order as authoritative;
- allow exactly one `Status: working` task;
- keep every active task at `Pass: false`;
- link every task to one approved spec;
- copy exact required reference-artifact paths from the approved spec;
- create `.harness/work/<TAG>.md` when a task becomes working.

MUST NOT:

- implement a task with `Ready: false`;
- infer artifact authority from a folder;
- create research-only tasks in the coding queue;
- retain a completed task in the active queue after successful closeout;
- edit an archived completed task;
- use `Bootstrap: true` for a future task. Historical `[T-0001]` consumed that authority.

## Readiness and Eligibility

`Ready: true` means:

- the source spec is approved;
- material questions are resolved;
- the task is one bounded implementation brick;
- dependencies, scope, and task-local acceptance are clear;
- every required artifact exists and is assigned exactly;
- required validation and delivery configuration exists;
- no material blocker exists.

Dependencies need not be complete for readiness.

A task is eligible when:

- `Ready: true`;
- `Pass: false`;
- all dependencies are satisfied.

A dependency is satisfied when its tag exists in configured base-branch history.

Check base-branch history rather than an unmerged task branch or the completed archive alone.

## Active States

- `queued`: approved and waiting;
- `working`: the only task allowed to mutate runtime behavior;
- `blocked`: stopped for unresolved context, access, outage, or missing proof.

`Status: passed` and `Pass: true` exist only in the final task block transferred verbatim to `.harness/completed.md` through the closeout procedure in `.harness/validation.md`.

## Scratchpad

Path: `.harness/work/<TAG>.md`

Scratchpads are ephemeral rehydration state and must be ignored by Git.

Required sections:

```text
Task:
Current plan:
Files inspected:
Files changed:
Decisions established:
Validation attempted:
Failed approaches and why:
Current blocker:
Next exact action:
```

Update after material discoveries, failures, changed hypotheses, review findings, push failures, and CI failures.

Read prior failed approaches before debugging. Do not repeat one without new evidence.

Delete only after the task tag exists in configured base-branch history.

## Task Template

```text
### [T-0001] <title>
Type: feature | bug | migration | maintenance | refactor
Bootstrap: false
Source_spec: <exact-approved-spec-path>
Priority: P0 | P1 | P2
Depends_on: none | [T-####], [R-####]
Status: queued | working | blocked
Ready: false | true
Pass: false
Objective:
- <one primary observable result>
Scope:
- <task-local included behavior and surfaces>
Non_goals:
- <explicit local exclusions>
Acceptance_criteria:
- <task-local observable pass condition>
Expected_surfaces:
- <modules, data, APIs, UI areas, docs, or configuration>
Reference_artifacts:
- none | <exact repository-relative path>
Validation_sets:
- baseline
- agent-review
- <applicable registered set>
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0001.md
```

For refactors, use `[R-0001]`, `Type: refactor`, `Bootstrap: false`, and state the preserved behavioral contract in `Acceptance_criteria`.

## Active Queue

### [T-0009] Define forward contract identity and routing
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/forward-contract-routing
Traceability: F14, F15, F17, F25b, F25c
Priority: P0
Depends_on: none
Status: working
Ready: true
Pass: false
Objective:
- Establish one deterministic forward schema for spec identity, ownership, lineage, filenames, artifacts, and terminal-state routing.
Scope:
- Define owner-scoped stable spec IDs, `Owning authority`, state/harness/repository inclusion tests, bounded lineage, exact repository-relative paths, owner-local filenames, canonical terminal-state routing, and the active `visual | technical | none` vocabulary.
Non_goals:
- Record legacy path mappings, change authoring workflow, migrate physical artifacts, or edit historical approved specs.
Acceptance_criteria:
- State outcomes route to the exact `sNN-state.md`, harness outcomes to `AGENTS.md`, and repository outcomes to `docs/REPOSITORY_POLICY.md` through the H1 inclusion test.
- The spec template exposes stable spec ID, `Owning authority`, `Amends`, `Supersedes`, and exact affected-state and dependency paths.
- Contract and state templates use exact repository-relative artifact paths and only `visual`, `technical`, or `none`.
- One owner-local filename rule maps deterministically to stable identity without making physical path the identity.
- `docs/contracts/README.md` is the sole full owner of terminal-state routing; other contract documents point to it without restating an independent rule.
- A concrete `sNN-state.md` is either an approved state contract or absent; unresolved template placeholders at an authority path are forbidden and block dependent work.
- Templates retain structure only and do not acquire authoring, approval, decomposition, or queue workflow.
Indivisibility_rationale:
- The routing index and its templates form one published schema; landing only one side would make valid authoring output contradict its canonical structure.
Expected_surfaces:
- `docs/contracts/README.md`.
- `docs/contracts/SPEC_TEMPLATE.md`.
- `docs/contracts/states/README.md`.
- `docs/contracts/states/STATE_TEMPLATE.md`.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0009.md

### [T-0010] Register legacy compatibility routes
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/legacy-compatibility-registry
Traceability: F13, F14, F18, F25g
Priority: P0
Depends_on: [T-0009]
Status: queued
Ready: true
Pass: false
Objective:
- Make every supported legacy spec and artifact path resolve unambiguously without reviving superseded workflow authority.
Scope:
- Add the four H1 Git-only path-to-spec-ID-to-historical-locator entries, all five artifact migration pairs with explicit `migration-pending` state, and the complete legacy non-authority rule to the canonical contract routing owner.
Non_goals:
- Rewrite Git-preserved historical content, edit completed-task blocks, delete legacy artifacts, or implement the structural validator.
Acceptance_criteria:
- All four retired implementation-spec paths referenced by T-0001 through T-0007 resolve to exact stable IDs, `current path: none`, and exact transition-base Git locators.
- Each of the five legacy artifact paths resolves to its exact canonical `docs/contracts/states/...` path and starts in a bounded `migration-pending` state that requires byte equality.
- Legacy task counts, decomposition, placement, deleted paths, and superseded authoring, delivery, validation, closeout, lifecycle, routing, and artifact mechanics are explicitly historical only.
- Completed outcomes, acceptance evidence, and still-valid compatibility obligations remain available without becoming current workflow authority.
- Git-preserved historical source blobs and all completed-task blocks remain byte-for-byte unchanged.
- A current author can distinguish a Git-only identity from a forward authoring route without scanning unrelated specs or loading deprecated bodies as examples.
Indivisibility_rationale:
- none; the canonical compatibility registry is one independently reviewable routing result in `docs/contracts/README.md`.
Expected_surfaces:
- `docs/contracts/README.md` legacy compatibility and migration sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0010.md

### [T-0011] Record completed-archive seed provenance
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/archive-seed-provenance
Traceability: F5, F25d
Priority: P0
Depends_on: none
Status: queued
Ready: true
Pass: false
Objective:
- Record truthful one-time provenance for the seven seeded historical task blocks without changing any block.
Scope:
- Add archive-header provenance for T-0001 through T-0007, the exact canonical hash boundary, and the distinction between historical seed compatibility and post-H1 completion proof.
Non_goals:
- Modify, reorder, condense, delete, or modernize any completed-task block or implement the archive validator.
Acceptance_criteria:
- The archive header states that T-0001 through T-0007 were seeded verbatim during the transition and did not originally execute the new archive-transfer procedure.
- The canonical hash algorithm is UTF-8 from the first T-0001 heading through the terminal newline with CRLF normalized to LF and no trimming.
- The block order remains `T-0001, T-0002, T-0003, T-0004, T-0006, T-0005, T-0007`.
- The canonical combined block SHA-256 remains `2B07112D32C5401991C2224A83E7C53BB36415842C599BAB900F17135F460C1F`.
- No byte inside any completed-task block changes.
Indivisibility_rationale:
- none; the archive header is the single owner of seed provenance outside the immutable blocks.
Expected_surfaces:
- `.harness/completed.md` header only.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0011.md

### [T-0012] Clarify top-level authority and evidence routing
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/top-level-authority-routing
Traceability: F16, F17, F19, F25c
Priority: P1
Depends_on: [T-0009]
Status: queued
Ready: true
Pass: false
Objective:
- Give fresh Codex sessions one coherent top-level distinction between normative targets, current implementation evidence, and routed contract authority.
Scope:
- Align `AGENTS.md` and `docs/README.md` on normative sources, code reality, test expectations, annotation summaries, durable-authority updates, canonical contract routing, and removal of the unsupported content-artifact route.
Non_goals:
- Rewrite global product, architecture, design, or MVP semantics; change implementation behavior; or duplicate the full contract-routing rules.
Acceptance_criteria:
- Normative user, durable authority, adopted artifact, approved spec, task-store, validation, and Git domains are explicit and non-overlapping.
- Code is current implementation reality; tests are executable expectations that may be stale or failing; annotation headers summarize inspected code and never overrule it.
- A code/test mismatch is reported as an implementation or proof defect rather than silently treated as durable truth.
- A resolved durable decision must be recorded in its owning authority before dependent spec drafting resumes.
- The active top-level artifact bundle uses only visual and technical references; `content` is absent as an artifact type.
- Both top-level entrypoints route terminal-state and spec classification to `docs/contracts/README.md` while retaining progressive context loading.
Indivisibility_rationale:
- `AGENTS.md` and `docs/README.md` are alternate entrypoints for a fresh session; changing only one would preserve two competing authority maps.
Expected_surfaces:
- `AGENTS.md` authority, context, Artifact Gate, and decision-boundary sections.
- `docs/README.md` ownership and routing sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0012.md

### [T-0013] Align global state and artifact ownership
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/global-state-artifact-ownership
Traceability: F12, F18
Priority: P1
Depends_on: [T-0012]
Status: queued
Ready: true
Pass: false
Objective:
- Remove the old all-in-one state-specification model from global product, architecture, and design authority.
Scope:
- Align the three global documents on durable state semantics, approved appearance, adopted technical depiction, collective implementation outcomes, shared accessibility, and explicit visual departures.
Non_goals:
- Define S01 or S02 state-contract content, change product behavior, alter visual files, or rewrite historical implementation specs.
Acceptance_criteria:
- No global document says `sNN-state.md` owns implementation, renderer choice, exact artifact assignment, task decomposition, or harness proof procedure.
- `docs/PRODUCT.md` retains shared product meaning, `docs/ARCHITECTURE.md` retains durable technical truth, and `docs/DESIGN.md` retains shared experience and accessibility rules.
- State contracts own durable state-specific semantics and authority without becoming implementation specifications.
- Exact visuals own appearance; technical artifacts own only a depiction explicitly adopted by governing authority or an approved spec.
- An approved implementation spec owns one collective outcome and any explicit compatible appearance departure.
- No durable product, architecture, or design invariant is removed or semantically changed.
Indivisibility_rationale:
- The live contradiction is created jointly by all three global authority sections; partial alignment would leave a material cross-document conflict that blocks authoring.
Expected_surfaces:
- `docs/PRODUCT.md` authority language.
- `docs/ARCHITECTURE.md` state, renderer, reference, and proof language.
- `docs/DESIGN.md` state, visual, technical, accessibility, and proof language.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0013.md

### [T-0014] Deduplicate the MVP proof boundary
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/mvp-proof-deduplication
Traceability: F12, F20
Priority: P1
Depends_on: [T-0013]
Status: queued
Ready: true
Pass: false
Objective:
- Make `docs/MVP.md` own only the current demonstration and proof boundary without duplicating durable product, architecture, or shared-design truth.
Scope:
- Replace duplicated durable rules and technical baseline text with exact upstream references while preserving every demo-specific narrowing and observable proof requirement.
Non_goals:
- Change the canonical scenario, product scope, architecture, user experience, runtime behavior, or state-contract content.
Acceptance_criteria:
- The canonical scenario, start, endpoint, and real, seeded, simulated, and deferred classifications are semantically unchanged.
- Every MVP non-goal and observable proof condition remains present and testable.
- Durable product authority, lifecycle, and trust rules are referenced from `docs/PRODUCT.md` rather than copied.
- Durable technical baseline and system invariants are referenced from `docs/ARCHITECTURE.md` rather than copied.
- Shared experience rules are referenced from `docs/DESIGN.md`; MVP retains only demo-specific narrowing.
- MVP makes no independent claim that a state contract owns composition, renderer choice, exact artifact assignment, implementation mutations, or harness proof.
- Cross-document review finds no contradictory duplicated durable rule introduced by the change.
Indivisibility_rationale:
- none; `docs/MVP.md` is the single owner and proof surface for this result.
Expected_surfaces:
- `docs/MVP.md` authority, scenario, boundary, constraint, and maintenance sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0014.md

### [T-0015] Add stable active-task identity fields
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/active-task-identity-schema
Traceability: F14, F21, F25h
Priority: P0
Depends_on: [T-0010]
Status: queued
Ready: true
Pass: false
Objective:
- Define a durable active-task schema that supports relocation-safe source identity, idempotent bricks, traceability, and committed cross-seam rationale.
Scope:
- Add `Source_spec_id`, canonical `Source_spec`, stable source-scoped `Brick_id`, traceability, and indivisibility-rationale fields and invariants to the active queue template.
Non_goals:
- Change task selection, implement the validator, rewrite completed blocks, or alter task-authoring workflow.
Acceptance_criteria:
- Every new task requires both a stable source spec ID and the current canonical spec path.
- Every new task requires a unique stable `Brick_id` scoped to its source spec.
- Every new task records the specification findings or acceptance areas it implements.
- Any task crossing independently provable seams stores a concise rationale in its committed block; single-seam tasks record `none` with a reason.
- Queue invariants prohibit duplicate task tags or brick IDs and keep existing tag counters monotonic.
- The active task template remains concise and contains no implementation tutorial.
Indivisibility_rationale:
- none; `.harness/tasks.md` is the single active-schema owner and this task does not yet change its producers or validators.
Expected_surfaces:
- `.harness/tasks.md` queue invariants and task template.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0015.md

### [T-0016] Harden task claim and blocked resumption
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/task-claim-resumption
Traceability: F2, F10, F11
Priority: P0
Depends_on: [T-0015]
Status: queued
Ready: true
Pass: false
Objective:
- Make serialized task selection, claim publication, blocking, and same-task resumption deterministic before source mutation.
Scope:
- Align queue eligibility, the externally serialized executor precondition, live branch and pull-request inspection, claim publication, conflicting authoring detection, and same-task resumption across their authority and procedure owners.
Non_goals:
- Add a distributed lock, implement closeout or merge proof, or create multi-executor support.
Acceptance_criteria:
- Eligibility requires `Status: queued`, `Ready: true`, `Pass: false`, `Blocker: none`, and satisfied canonical dependencies.
- A blocked task is never eligible and cannot resume merely because an external condition changed.
- The harness states honestly that autonomous primary invocations are externally serialized and that repository checks are stale-conflict detection rather than a lock.
- Selection inspects live task branches, pull requests, base working state, provisional closeout, and conflicting queue-authoring work before mutation.
- Deterministic claim publication precedes source edits; a failed or competing claim blocks work.
- Same-task resumption proves its existing branch and PR identity, clears the blocker, and reruns readiness, dependency, and claim checks without treating its own claim as a competitor; a read-only procedure case is recorded in durable PR evidence.
Indivisibility_rationale:
- State eligibility and the operational claim/resumption procedure must land together; changing only one would leave an unsafe or unusable working-state transition.
Expected_surfaces:
- `AGENTS.md` readiness and task-selection rules.
- `.harness/tasks.md` active states, eligibility, and blocker semantics.
- `.harness/validation.md` claim and resumption procedure.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0016.md

### [T-0017] Implement network-free harness integrity validation
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/harness-integrity-validator
Traceability: F4, F5, F14, F25d, F25g, F25h
Priority: P0
Depends_on: [T-0010], [T-0011], [T-0015], [T-0016]
Status: queued
Ready: true
Pass: false
Objective:
- Provide a deterministic network-free validator for active tasks, completed blocks, legacy identity, and legal provisional transfer shape.
Scope:
- Add a dedicated harness-integrity validation module, callable package entrypoint, focused positive and negative fixtures, and focused tests without adding the check to the complete baseline yet.
Non_goals:
- Query GitHub, prove a remote merge, change CI job names, or absorb repository-security or annotation-header responsibilities.
Acceptance_criteria:
- The validator accepts valid queued, blocked, candidate, seeded archive, reversal, and exactly one legal provisional-closeout fixture.
- It rejects duplicate or reused tags and brick IDs, a task in both stores, invalid state or Pass combinations, counter regression, archive mutation or reordering, and non-verbatim transfer.
- It reproduces the canonical T-0001 through T-0007 block hash and seed boundary exactly.
- Historical stale paths resolve only through the canonical ID-bearing migration map; deprecated Git-only spec bodies and forbidden live stale paths fail when present in the current tree. A named `migration-pending` artifact duplicate is accepted only while its bytes match the canonical file exactly.
- A concrete state-contract path containing unresolved template placeholders fails with an exact diagnostic; absence remains valid when no task or spec declares that state contract as a readiness dependency.
- Diagnostics identify the exact file, identity, and violated invariant deterministically.
- The validator and fixtures perform no network access or external mutation.
- Focused tests cover every positive and negative structural invariant assigned to this brick, without absorbing remote or operational procedure cases owned by later tasks.
Indivisibility_rationale:
- The callable parser, invariants, fixtures, and focused tests are one executable integrity result; omitting any part would leave either an unproven checker or proof with no usable checker.
Expected_surfaces:
- New dedicated module under `scripts/validation/`.
- Focused harness fixtures under `tests/fixtures/`.
- Focused unit or integration tests.
- A callable `package.json` validation script.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0017.md

### [T-0018] Canonicalize the S01 default visual
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/artifact-s01-visual-default
Traceability: F18, F25g
Priority: P1
Depends_on: [T-0010], [T-0017]
Status: queued
Ready: true
Pass: false
Objective:
- Retire the legacy S01 default visual copy after proving its canonical contract artifact and consumers are intact.
Scope:
- Hash-compare the one legacy/canonical pair, remove only the legacy copy, update that registry entry to `canonical`, and check current consumers of that path.
Non_goals:
- Modify image bytes, migrate another artifact, change product UI, or edit historical task blocks.
Acceptance_criteria:
- The legacy and canonical files are byte-identical immediately before removal and the exact hash is recorded.
- `references/states/s01-address-entry/visual-default.png` is absent while `docs/contracts/states/s01-address-entry/visual-default.png` retains the proven bytes.
- Current consumers use only the canonical path; the historical path resolves through the migration registry and Git.
- The registry entry changes from `migration-pending` to `canonical`, and the targeted validator check for this pair passes.
- No other legacy/canonical artifact pair, runtime asset, visual behavior, or completed block changes.
Indivisibility_rationale:
- none; one artifact pair, its registry state, and its direct consumers form one independently reversible migration seam.
Expected_surfaces:
- `references/states/s01-address-entry/visual-default.png`.
- `docs/contracts/states/s01-address-entry/visual-default.png`, whose bytes must remain unchanged.
- Its exact entry in `docs/contracts/README.md` and narrow current consumers only if needed.
Reference_artifacts:
- docs/contracts/states/s01-address-entry/visual-default.png
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0018.md

### [T-0019] Canonicalize the S01 how-it-works visual
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/artifact-s01-visual-how-it-works-open
Traceability: F18, F25g
Priority: P1
Depends_on: [T-0010], [T-0017]
Status: queued
Ready: true
Pass: false
Objective:
- Retire the legacy S01 how-it-works visual copy after proving its canonical contract artifact and consumers are intact.
Scope:
- Hash-compare the one legacy/canonical pair, remove only the legacy copy, update that registry entry to `canonical`, and check current consumers of that path.
Non_goals:
- Modify image bytes, migrate another artifact, change product UI, or edit historical task blocks.
Acceptance_criteria:
- The legacy and canonical files are byte-identical immediately before removal and the exact hash is recorded.
- `references/states/s01-address-entry/visual-how-it-works-open.png` is absent while its canonical S01 contract artifact retains the proven bytes.
- Current consumers use only the canonical path; the historical path resolves through the migration registry and Git.
- The registry entry changes from `migration-pending` to `canonical`, and the targeted validator check for this pair passes.
- No other legacy/canonical artifact pair, runtime asset, visual behavior, or completed block changes.
Indivisibility_rationale:
- none; one artifact pair, its registry state, and its direct consumers form one independently reversible migration seam.
Expected_surfaces:
- `references/states/s01-address-entry/visual-how-it-works-open.png`.
- `docs/contracts/states/s01-address-entry/visual-how-it-works-open.png`, whose bytes must remain unchanged.
- Its exact entry in `docs/contracts/README.md` and narrow current consumers only if needed.
Reference_artifacts:
- docs/contracts/states/s01-address-entry/visual-how-it-works-open.png
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0019.md

### [T-0020] Canonicalize the S02 confirmation visual
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/artifact-s02-visual-property-confirmation
Traceability: F18, F25g
Priority: P1
Depends_on: [T-0010], [T-0017]
Status: queued
Ready: true
Pass: false
Objective:
- Retire the legacy S02 property-confirmation visual copy after proving its canonical contract artifact and consumers are intact.
Scope:
- Hash-compare the one legacy/canonical pair, remove only the legacy copy, update that registry entry to `canonical`, and check current consumers of that path.
Non_goals:
- Modify image bytes, migrate another artifact, change product UI, or edit historical task blocks.
Acceptance_criteria:
- The legacy and canonical files are byte-identical immediately before removal and the exact hash is recorded.
- `references/states/s02-property-analysis/visual-property-confirmation.png` is absent while its canonical S02 contract artifact retains the proven bytes.
- Current consumers use only the canonical path; the historical path resolves through the migration registry and Git.
- The registry entry changes from `migration-pending` to `canonical`, and the targeted validator check for this pair passes.
- No other legacy/canonical artifact pair, runtime asset, visual behavior, or completed block changes.
Indivisibility_rationale:
- none; one artifact pair, its registry state, and its direct consumers form one independently reversible migration seam.
Expected_surfaces:
- `references/states/s02-property-analysis/visual-property-confirmation.png`.
- `docs/contracts/states/s02-property-analysis/visual-property-confirmation.png`, whose bytes must remain unchanged.
- Its exact entry in `docs/contracts/README.md` and narrow current consumers only if needed.
Reference_artifacts:
- docs/contracts/states/s02-property-analysis/visual-property-confirmation.png
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0020.md

### [T-0021] Canonicalize the S02 live-roof visual
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/artifact-s02-visual-live-roof-assembly
Traceability: F18, F25g
Priority: P1
Depends_on: [T-0010], [T-0017]
Status: queued
Ready: true
Pass: false
Objective:
- Retire the legacy S02 live-roof visual copy after proving its canonical contract artifact and consumers are intact.
Scope:
- Hash-compare the one legacy/canonical pair, remove only the legacy copy, update that registry entry to `canonical`, and check current consumers of that path.
Non_goals:
- Modify image bytes, migrate another artifact, change product UI, or edit historical task blocks.
Acceptance_criteria:
- The legacy and canonical files are byte-identical immediately before removal and the exact hash is recorded.
- `references/states/s02-property-analysis/visual-live-roof-assembly.png` is absent while its canonical S02 contract artifact retains the proven bytes.
- Current consumers use only the canonical path; the historical path resolves through the migration registry and Git.
- The registry entry changes from `migration-pending` to `canonical`, and the targeted validator check for this pair passes.
- No other legacy/canonical artifact pair, runtime asset, visual behavior, or completed block changes.
Indivisibility_rationale:
- none; one artifact pair, its registry state, and its direct consumers form one independently reversible migration seam.
Expected_surfaces:
- `references/states/s02-property-analysis/visual-live-roof-assembly.png`.
- `docs/contracts/states/s02-property-analysis/visual-live-roof-assembly.png`, whose bytes must remain unchanged.
- Its exact entry in `docs/contracts/README.md` and narrow current consumers only if needed.
Reference_artifacts:
- docs/contracts/states/s02-property-analysis/visual-live-roof-assembly.png
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0021.md

### [T-0022] Canonicalize the S02 technical depiction
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/artifact-s02-technical-persistent-project-assembly
Traceability: F18, F25g
Priority: P1
Depends_on: [T-0010], [T-0017]
Status: queued
Ready: true
Pass: false
Objective:
- Retire the legacy S02 technical-artifact copy after proving its canonical contract depiction and consumers are intact.
Scope:
- Hash-compare the one legacy/canonical pair, remove only the legacy copy, update that registry entry to `canonical`, and check current consumers of that path.
Non_goals:
- Modify image bytes, adopt new process authority, migrate another artifact, change runtime architecture, or edit historical task blocks.
Acceptance_criteria:
- The legacy and canonical files are byte-identical immediately before removal and the exact hash is recorded.
- `references/states/s02-property-analysis/technical-persistent-project-assembly.png` is absent while its canonical S02 contract artifact retains the proven bytes.
- Current consumers use only the canonical path; the historical path resolves through the migration registry and Git.
- The registry entry changes from `migration-pending` to `canonical`, and the targeted validator check for this pair passes.
- No other legacy/canonical artifact pair, depicted process, runtime behavior, or completed block changes.
Indivisibility_rationale:
- none; one artifact pair, its registry state, and its direct consumers form one independently reversible migration seam.
Expected_surfaces:
- `references/states/s02-property-analysis/technical-persistent-project-assembly.png`.
- `docs/contracts/states/s02-property-analysis/technical-persistent-project-assembly.png`, whose bytes must remain unchanged.
- Its exact entry in `docs/contracts/README.md` and narrow current consumers only if needed.
Reference_artifacts:
- docs/contracts/states/s02-property-analysis/technical-persistent-project-assembly.png
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0022.md

### [T-0023] Enforce harness integrity in baseline
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/baseline-harness-integrity
Traceability: F4, F25h
Priority: P0
Depends_on: [T-0017], [T-0018], [T-0019], [T-0020], [T-0021], [T-0022]
Status: queued
Ready: true
Pass: false
Objective:
- Make every local baseline and `CI / baseline` run enforce the proven network-free harness-integrity check after all transitional artifact duplicates are gone.
Scope:
- Add the callable validator to the ordered baseline and reconcile the validation registry and focused orchestration proof while preserving the two existing CI jobs.
Non_goals:
- Add a validation-set name, require GitHub during local validation, or change browser-smoke behavior.
Acceptance_criteria:
- All five artifact registry entries are `canonical`, no legacy duplicate remains, and the valid repository passes the complete validator.
- `pnpm validate` runs harness integrity in a deterministic documented order.
- An isolated negative fixture makes the harness stage and complete baseline fail with an actionable diagnostic.
- `CI / baseline` inherits the stage through `pnpm validate` without workflow duplication.
- `CI / browser-smoke`, required check names, and browser behavior remain unchanged.
- `.harness/validation.md` distinguishes local structural proof from live Git and GitHub completion proof.
Indivisibility_rationale:
- The baseline runner and its canonical registry description must change together so the executable gate and documented proof cannot drift.
Expected_surfaces:
- `scripts/run-validation.mjs`.
- `package.json` only if the callable script requires reconciliation.
- `.harness/validation.md` proof model and registry wording.
- Focused validation-orchestration tests if required.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0023.md

### [T-0024] Make task authoring identity-aware and idempotent
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/task-authoring-identity
Traceability: F13, F14, F15, F17
Priority: P0
Depends_on: [T-0023]
Status: queued
Ready: true
Pass: false
Objective:
- Make `$task-authoring` emit the stable active-task schema and refuse to recreate represented implementation bricks.
Scope:
- Consume canonical owning-authority routing, dual spec references, stable brick IDs, the legacy registry, active artifact vocabulary, and targeted active/archive identity evidence without loading the full archive into ordinary context.
Non_goals:
- Change task-size judgment, execute tasks, mutate completed blocks, or define lifecycle delivery procedures.
Acceptance_criteria:
- Every new task records `Source_spec_id`, canonical `Source_spec`, and a unique source-scoped `Brick_id`.
- Owner and path routing comes from the canonical contract schema and primary-outcome inclusion test.
- Git-only legacy specs are matched by stable ID and cannot impose superseded workflow or decomposition mechanics.
- A narrow validator or lookup returns only relevant active and historical identity evidence without loading deprecated spec bodies as examples.
- A rerun or partial prior decomposition refuses a duplicate brick ID and preserves unrelated queue entries and counters.
- Task authoring accepts only exact `visual`, `technical`, or `none` artifact routes; `content` is absent from its active vocabulary.
- Exact repository-relative global paths and only registered validation-set names are used.
Indivisibility_rationale:
- none; the task-authoring skill is the single producer being corrected after its schema and validator already exist.
Expected_surfaces:
- `.agents/skills/task-authoring/SKILL.md` authority, preconditions, identity lookup, writing, and output rules.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0024.md

### [T-0025] Make task sizing deterministic
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/task-sizing-determinism
Traceability: F21
Priority: P1
Depends_on: [T-0015], [T-0024]
Status: queued
Ready: true
Pass: false
Objective:
- Close the remaining task-size loophole so independently provable work cannot be called nonfunctional merely because it lacks complete customer value.
Scope:
- Refine split and combine rules around invalid or misleading intermediate states, proof, failure, rollback, recovery, migration, compatibility, and committed indivisibility rationale.
Non_goals:
- Add time, file-count, line-count, or estimated-effort limits or predesign implementation mechanics.
Acceptance_criteria:
- Lack of standalone customer value is explicitly insufficient to justify combining tasks.
- Separation fails only when it leaves the repository invalid, misleading, knowingly false, independently unprovable, or dependent on disposable architecture.
- Independent proof, failure, rollback, recovery, migration, and compatibility seams require splitting by default.
- A cross-seam exception records a concise rationale in the committed task block against the combine-only test.
- Shared specs, screens, files, eventual outcomes, or delivery convenience never justify combination by themselves.
- Task-local acceptance remains concise and does not reproduce most of the source spec.
Indivisibility_rationale:
- none; task sizing is one specialized judgment boundary in `$task-authoring` and can be reviewed independently of identity lookup.
Expected_surfaces:
- `.agents/skills/task-authoring/SKILL.md` task-size, split, combine, and content-discipline sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0025.md

### [T-0026] Align spec-authoring identity and routing
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/spec-authoring-identity-routing
Traceability: F13, F14, F15, F17
Priority: P1
Depends_on: [T-0010], [T-0014]
Status: queued
Ready: true
Pass: false
Objective:
- Make `$spec-authoring` consume the forward ownership, identity, lineage, legacy, and artifact-routing schema.
Scope:
- Align primary-outcome routing, stable identity, bounded lineage, current forward-spec routing versus Git-only legacy lookup, active artifact vocabulary, and exact paths while preserving discovery-first drafting.
Non_goals:
- Change durable-decision or mechanism-lock boundaries, add approval recording, decompose tasks, or define delivery mechanics.
Acceptance_criteria:
- The skill uses `Owning authority`, stable spec ID, bounded lineage, and the canonical primary-outcome routing test.
- Deprecated Git-only identities remain discoverable for exact historical lookup but are never loaded as templates or forward authoring examples.
- Git-preserved legacy outcome and acceptance evidence cannot impose superseded workflow or decomposition mechanics.
- `content` is absent from artifact discovery and schema, leaving only visual, technical, or none with exact repository-relative paths.
- Discovery remains bounded and task decomposition remains prohibited.
Indivisibility_rationale:
- none; the spec-authoring skill is the single consumer of the published forward identity and routing schema.
Expected_surfaces:
- `.agents/skills/spec-authoring/SKILL.md` authority, routing, identity, lineage, discovery, and artifact sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0026.md

### [T-0027] Guard durable authority and implementation latitude
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/spec-authoring-authority-boundary
Traceability: F16, F22
Priority: P1
Depends_on: [T-0012], [T-0014], [T-0026]
Status: queued
Ready: true
Pass: false
Objective:
- Prevent `$spec-authoring` from duplicating durable truth or manufacturing implementation authority from its own acceptance text.
Scope:
- Add the durable-authority update stop, independent mechanism-lock basis, circular-authority rejection, and routine implementation-latitude rules.
Non_goals:
- Change owner routing, add approval recording, decompose tasks, or define delivery mechanics.
Acceptance_criteria:
- A resolved durable product, architecture, design, state, security, schema, or compatibility decision is recorded in its owner before dependent drafting resumes.
- Missing authority-update permission or an unresolved durable decision blocks drafting rather than being inferred into the spec.
- A mechanism is locked only by independent durable, safety, security, data, compatibility, public-contract, or unavoidable observable authority.
- Acceptance text authored in the same spec cannot bootstrap its preferred mechanism into authority.
- Routine algorithms, data structures, rendering, module boundaries, framework techniques, recovery, and sequencing remain with Codex unless independently constrained.
- Task decomposition and approval recording remain outside this brick.
Indivisibility_rationale:
- none; durable-authority updates and mechanism self-authorization form one independently reviewable trust boundary in spec drafting.
Expected_surfaces:
- `.agents/skills/spec-authoring/SKILL.md` decision-boundary, authority-update, acceptance, and implementation-latitude sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0027.md

### [T-0028] Make large-file review responsibility-based
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/responsibility-based-file-review
Traceability: F23
Priority: P1
Depends_on: [T-0012]
Status: queued
Ready: true
Pass: false
Objective:
- Make file-size thresholds trigger responsibility analysis and review escalation without forcing harmful fragmentation.
Scope:
- Correct the 250- and 350-nonblank-line rules in the owning engineering guidance and reconcile validation wording only if required.
Non_goals:
- Split existing runtime files, set arbitrary hard size limits, or weaken responsibility and cohesion review.
Acceptance_criteria:
- More than 250 nonblank lines triggers documented primary-responsibility and reason-to-change evaluation.
- More than 350 nonblank lines triggers explicit independent review escalation.
- A cohesive hand-authored imperative file may remain large when an accepted analysis shows splitting would reduce cohesion or proof quality.
- Declarative or generated content is supporting evidence rather than a prerequisite for an exception.
- Review checks mixed layers, independent change reasons, dependency direction, and proof boundaries rather than line count alone.
- No rule encourages meaningless fragmentation or unrelated responsibility accumulation.
Indivisibility_rationale:
- none; the current validation wording already accepts a cohesion rationale, so the owning `AGENTS.md` rule can be corrected independently unless live inspection proves reconciliation is necessary.
Expected_surfaces:
- `AGENTS.md` engineering and file-responsibility rules.
- `.harness/validation.md` independent-review wording only if needed for exact agreement.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0028.md

### [T-0029] Bind independent review to exact content
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/exact-sha-review-evidence
Traceability: F7, F8, F9, F24
Priority: P0
Depends_on: [T-0008], [T-0017], [T-0028]
Status: queued
Ready: true
Pass: false
Objective:
- Make independent review durable, read-only, exact-SHA bound, and consistent with conditional dedicated security review.
Scope:
- Align review set selection, reviewer independence, durable PR evidence, candidate-content SHA binding, content-change invalidation, and metadata-only closeout inheritance across policy and procedure.
Non_goals:
- Implement the closeout transfer, merge freshness, frontend-specific review workflow, or human approval requirements.
Acceptance_criteria:
- `agent-review` is universal and includes correctness, acceptance, architecture, data, file responsibility, regression, and security implications.
- Dedicated `security-review` is required only for security-sensitive scope and uses the canonical registered name.
- Durable PR evidence records reviewer identity or run ID, independent role, review type, exact candidate-content SHA, result, and findings or `none`.
- Any applicable content change invalidates prior review and requires fresh review of the new candidate SHA.
- Closeout inherits content review only when executable proof shows the authorized two-store metadata-only delta; latest-head CI binds separately to closeout SHA.
- Every independent reviewer is read-only and only the primary agent repairs findings and reruns proof.
Indivisibility_rationale:
- Repository policy and the canonical validation procedure must define the same review trust contract; changing only one would recreate the existing contradiction.
Expected_surfaces:
- `.harness/validation.md` proof model, set selection, registry, and independent-review gate.
- `docs/REPOSITORY_POLICY.md` high-level review and evidence policy.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0029.md

### [T-0030] Canonicalize provisional closeout and completion
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/provisional-closeout-completion
Traceability: F3, F5, F9, F25d
Priority: P0
Depends_on: [T-0011], [T-0016], [T-0017], [T-0029]
Status: queued
Ready: true
Pass: false
Objective:
- Establish one atomic active-to-archive closeout and one canonical durable completion and dependency proof.
Scope:
- Align candidate state, two-store provisional transfer, manual waiting and withdrawal, reversal, post-migration completion, dependency satisfaction, and historical seed compatibility across their exact owners.
Non_goals:
- Implement stale-base refresh, ambiguous remote recovery, post-merge cleanup, or the non-task authoring lane.
Acceptance_criteria:
- Candidate delivery keeps the active task `Status: working` and `Pass: false`.
- Closeout changes only `.harness/tasks.md` and `.harness/completed.md`, appends the final passed block verbatim, and removes the same active block atomically.
- Unmerged `Status: passed` and `Pass: true` are explicitly provisional and never advance the queue.
- Manual mode preserves the claim while awaiting guarded merge; durable PR evidence records read-only cases for explicit pre-merge withdrawal, exact reversal, and failed closeout.
- Post-H1 completion and dependency satisfaction require the same tagged merged PR, exact merge SHA, archive introduction, active absence, and remote-branch proof.
- T-0001 through T-0007 use only the documented seed exception and are not represented as having executed the new procedure.
- Reversal restores only the affected task with `Pass: false`, removes only its provisional archive entry, and preserves every other block byte-for-byte.
Indivisibility_rationale:
- Active removal, archive addition, provisional semantics, reversal, and completion/dependency meaning are one atomic state model; splitting them would make the two stores or dependency predicate disagree.
Expected_surfaces:
- `AGENTS.md` high-level completion semantics.
- `.harness/tasks.md` candidate, completion, and dependency rules.
- `.harness/completed.md` header only.
- `.harness/validation.md` closeout, manual-mode, proof, and reversal procedure.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0030.md

### [T-0031] Harden exact-base and exact-head delivery
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/exact-base-head-delivery
Traceability: F5, F6, F8, F9
Priority: P0
Depends_on: [T-0029], [T-0030]
Status: queued
Ready: true
Pass: false
Objective:
- Prevent manual or autonomous merge from using a stale base, wrong pull-request head, wrong checks, or bypassed identity.
Scope:
- Define exact-head check acceptance, immediate pre-merge base refresh, non-force redelivery on base advance, guarded manual and autonomous merge, and exact merged-identity readback.
Non_goals:
- Resolve ambiguous remote command outcomes or perform post-merge local cleanup.
Acceptance_criteria:
- Required checks are accepted only for the exact current PR head and exact configured check names.
- The configured base is fetched immediately before merge and the PR is proven current with that exact base.
- A base advance requires a non-force branch update and complete validation, review, closeout, push, and exact-head CI redelivery.
- Manual and autonomous merge use the exact closeout head, exact base, task-tagged subject, squash mode, and no administrator bypass.
- Merge readback proves the merged PR, exact merge SHA, tagged subject, archive introduction, and synchronized base history.
- Durable PR evidence records read-only base-advance and completed-merge procedure cases; stale head, stale base, missing checks, wrong identity, or bypass attempts block merge and queue advancement.
Indivisibility_rationale:
- High-level repository guardrails and their canonical procedure must land together so policy cannot claim freshness or exact-head safety that execution does not enforce.
Expected_surfaces:
- `.harness/validation.md` CI, base-refresh, merge, and completion-readback procedure.
- `docs/REPOSITORY_POLICY.md` high-level exact-base and exact-head policy.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0031.md

### [T-0032] Reconcile ambiguous remote outcomes safely
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/ambiguous-remote-recovery
Traceability: F6
Priority: P0
Depends_on: [T-0031]
Status: queued
Ready: true
Pass: false
Objective:
- Make every interrupted or uncertain remote operation reconcile actual remote state before retry, reversal, or cleanup.
Scope:
- Cover PR create or update, review-evidence write, push and branch mutation, CI or status query, and merge outcomes with readback-driven continuation, retry, reversal, or stop behavior.
Non_goals:
- Change credentials, add hosted coordination, weaken guarded merge, or reinterpret an unresolved result optimistically.
Acceptance_criteria:
- A failed, timed-out, or interrupted remote operation always triggers operation-specific readback before another mutation.
- Proven application continues from the actual remote state without duplicating the operation.
- Proven non-application permits a safe bounded retry or provisional reversal as appropriate.
- Unresolved or contradictory readback stops mutation with the local branch, provisional state, and evidence intact.
- A merge that succeeded despite a client error is never reversed after remote proof.
- Durable PR evidence records read-only cases for proven application, proven non-application, and unavailable or contradictory readback; any reversal preserves unrelated blocks byte-for-byte.
Indivisibility_rationale:
- none; ambiguous-result interpretation is one independent remote failure boundary in `.harness/validation.md`.
Expected_surfaces:
- `.harness/validation.md` remote failure and readback procedures.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0032.md

### [T-0033] Move lesson disposition before closeout
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/precloseout-lesson-disposition
Traceability: F25f
Priority: P1
Depends_on: [T-0030]
Status: queued
Ready: true
Pass: false
Objective:
- Ensure reusable implementation evidence is promoted or explicitly dismissed before closeout forbids ordinary source changes.
Scope:
- Add the exact pre-closeout lesson-disposition checkpoint and scratchpad evidence location to the canonical validation procedure.
Non_goals:
- Change lesson qualification rules, create completed-task summaries, or retain scratchpads after cleanup.
Acceptance_criteria:
- Before provisional closeout, the primary task agent evaluates `.harness/LESSONS.md` promotion criteria.
- Qualifying evidence is promoted while ordinary task changes are still permitted.
- When nothing qualifies, the task scratchpad records `none` for lesson disposition.
- Closeout cannot begin until one of those two outcomes is recorded.
- Post-merge scratchpad deletion cannot be the first or only lesson-disposition step.
Indivisibility_rationale:
- none; the canonical timing checkpoint and scratchpad evidence location are one narrow procedure change.
Expected_surfaces:
- `.harness/validation.md` pre-closeout sequence.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0033.md

### [T-0034] Make post-merge cleanup retry-safe
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/retry-safe-cleanup
Traceability: F6, F25e
Priority: P0
Depends_on: [T-0031], [T-0032], [T-0033]
Status: queued
Ready: true
Pass: false
Objective:
- Make cleanup idempotent and prevent a local cleanup failure from undoing durable task completion.
Scope:
- Define already-absent branch success, exact merged-identity gates, ordinary and exceptional local deletion, post-merge failure evidence, scratchpad preservation, queue blocking, and cleanup-only retry.
Non_goals:
- Reverse a durably merged task, edit the archive after merge, force-push, or add a distributed cleanup service.
Acceptance_criteria:
- Already-absent remote or local task branches are accepted only after exact merged task and branch identity proof.
- Ordinary local branch deletion is attempted before the narrow squash-ancestry force-deletion exception.
- After durable merge, cleanup failure never reverses `Pass`, reactivates the task, or edits any completed block.
- A failed cleanup preserves the exact local task branch and scratchpad, records durable PR and local evidence, and stops queue advancement.
- Retry executes only the incomplete cleanup proof and does not rerun or reopen implementation closeout.
- Durable PR evidence records a read-only cleanup-failure and retry case; scratchpad deletion occurs only after base synchronization, branch absence, archive proof, and complete cleanup success.
Indivisibility_rationale:
- none; post-merge cleanup has its own failure and retry boundary after durable completion.
Expected_surfaces:
- `.harness/validation.md` post-merge cleanup and failure behavior.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0034.md

### [T-0035] Define non-task authoring identity and exclusion
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/non-task-authoring-identity
Traceability: F2, F11
Priority: P0
Depends_on: [T-0016], [T-0026]
Status: queued
Ready: true
Pass: false
Objective:
- Define a truthful authoring-only identity and mutual-exclusion state without manufacturing implementation completion.
Scope:
- Establish eligible authoring surfaces, explicit user authority, non-task branch/commit/PR identity, forbidden implementation signals, task-claim exclusion, and an unavailable-until-wired state.
Non_goals:
- Activate the delivery lane, duplicate canonical review or merge procedures, record spec approval, or route authoring skills through an incomplete lane.
Acceptance_criteria:
- The identity covers specs, approval metadata, contract updates, task decomposition, and directly related authority or queue changes only.
- Branch, commit, and PR identities are descriptive and contain no implementation task tag.
- The identity uses no task modes, `Pass`, implementation scratchpad, task closeout, archive transfer, dependency proof, or task-completion history.
- Explicit user instruction controls authoring delivery and autonomous guarded merge authority independently of task modes.
- Queue, counter, validation, or execution-authority authoring is mutually exclusive with a live implementation claim, provisional closeout, task branch, or live task PR.
- Introducing a queued task cannot satisfy that task's dependency or completion proof, and completed-task blocks cannot change.
- The lane remains explicitly unavailable until the canonical delivery wiring task passes.
Indivisibility_rationale:
- Authoring identity, forbidden completion signals, and claim exclusion are one state classification; separating them would create an identity that could collide with implementation work.
Expected_surfaces:
- `AGENTS.md` high-level authoring identity and task-claim exclusion.
- `.harness/validation.md` lane identity, preconditions, and unavailable state.
- `docs/REPOSITORY_POLICY.md` high-level authoring authority boundary.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0035.md

### [T-0036] Activate non-task authoring delivery
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/non-task-authoring-delivery
Traceability: F2, F8, F11
Priority: P0
Depends_on: [T-0024], [T-0027], [T-0029], [T-0031], [T-0032], [T-0034], [T-0035]
Status: queued
Ready: true
Pass: false
Objective:
- Activate end-to-end authoring delivery by reusing the canonical proof, review, CI, merge, recovery, and cleanup procedures.
Scope:
- Wire scoped validation, exact-SHA read-only review, exact-head CI, guarded merge, ambiguous-result readback, clean synchronization, and spec- and task-authoring routing to the established non-task identity.
Non_goals:
- Create a second delivery algorithm, use implementation completion identity, record approval without evidence, or mutate completed-task blocks.
Acceptance_criteria:
- The lane reuses canonical local proof, exact-SHA review, exact-head CI, base refresh, guarded merge, remote readback, and clean synchronization without restating divergent procedures.
- Authoring delivery uses no `Pass`, implementation scratchpad, task closeout, archive transfer, dependency proof, or task-completion history.
- Spec and task authoring output routes to the lane only after every activation precondition is satisfied.
- The task-authoring route cannot start, pass, or complete any task it introduces.
- Durable PR evidence records a read-only authoring/task exclusion case and proves completed-task blocks are unchanged.
- A failed or ambiguous authoring delivery preserves its branch and evidence and follows the same readback and retry boundaries as canonical delivery.
Indivisibility_rationale:
- T-0035 leaves the lane truthfully unavailable; this brick atomically activates the reusable end-to-end procedure and its producer routing so no skill advertises a partial delivery path.
Expected_surfaces:
- `.harness/validation.md` non-task authoring delivery procedure.
- `AGENTS.md` operational routing consequence.
- `docs/REPOSITORY_POLICY.md` guarded authoring delivery consequence.
- `.agents/skills/spec-authoring/SKILL.md` and `.agents/skills/task-authoring/SKILL.md` output delivery routing.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0036.md

### [T-0037] Add status-only approval recording
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/status-only-approval-recording
Traceability: F1
Priority: P0
Depends_on: [T-0027], [T-0036]
Status: queued
Ready: true
Pass: false
Objective:
- Allow `$spec-authoring` to record a later explicit user approval without self-approving or silently revising reviewed content.
Scope:
- Add the approval-evidence precondition, metadata-only transition, content-diff guard, reporting, and non-task delivery route to the spec-authoring workflow.
Non_goals:
- Let drafting approve itself, infer approval, revise approved content, or use implementation-task completion identity.
Acceptance_criteria:
- Drafting always ends at `State: draft` and `Approved: false` unless a later explicit user approval exists.
- A status-only recording run names the explicit approval evidence and changes approval metadata only.
- Any content change requires separate explicit revision authority and cannot be hidden inside approval recording.
- Executable or reviewed diff evidence rejects a purported status-only transition that changes non-metadata content.
- The transition is delivered through the non-task authoring lane and creates no task Pass, closeout, dependency, or completion evidence.
- Approved specs remain closed to amendment unless explicitly reopened or changed through bounded lineage.
Indivisibility_rationale:
- none; approval recording is one trust-boundary workflow in the spec-authoring skill after its safe delivery lane exists.
Expected_surfaces:
- `.agents/skills/spec-authoring/SKILL.md` status, workflow, and output sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
- security
- security-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0037.md

### [T-0038] Make frontend review read-only and registry-driven
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/frontend-review-semantics
Traceability: F24
Priority: P1
Depends_on: [T-0029]
Status: queued
Ready: true
Pass: false
Objective:
- Align frontend review with read-only reviewer independence, primary-agent repair, and registered validation names.
Scope:
- Separate Build, Restyle, read-only Review, and primary-agent Repair behavior and remove unregistered validation vocabulary.
Non_goals:
- Change product UI, alter artifact authority, run visual implementation, add `frontend-unit`, or modify the canonical validation registry.
Acceptance_criteria:
- Read-only Review reports evidence and blocking findings without modifying the worktree.
- Only the authorized primary task agent enters Repair, applies corrections, reruns focused proof, and requests fresh review.
- `frontend-unit` is absent and the skill names only validation sets registered by `.harness/validation.md`.
- Browser access remains required only for assigned frontend visual proof; documentation-only skill changes require no product browser run.
- Review evidence follows the canonical exact-SHA and independence contract rather than defining a second one.
Indivisibility_rationale:
- none; reviewer mutation and validation vocabulary are one specialized frontend-review workflow correction.
Expected_surfaces:
- `.agents/skills/frontend-design/SKILL.md` modes, review loop, validation, and completion output.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0038.md

### [T-0039] Align frontend artifact authority
Type: maintenance
Bootstrap: false
Source_spec_id: harness/H1
Source_spec: docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md
Brick_id: harness/H1/frontend-artifact-authority
Traceability: F18
Priority: P1
Depends_on: [T-0014]
Status: queued
Ready: true
Pass: false
Objective:
- Make the frontend skill consume the canonical non-overlapping state, visual, technical, and implementation-spec authority model.
Scope:
- Align exact visual authority, state-specific behavior and accessibility, shared product and design truth, adopted technical depictions, and explicit compatible appearance departures.
Non_goals:
- Change product UI, alter any artifact, perform visual review, or define new contract-routing rules.
Acceptance_criteria:
- Exact `visual-*.png` artifacts own approved appearance and do not independently own behavior, accessibility, truthful content, or product authority.
- `docs/PRODUCT.md` owns shared product meaning and truth, and `docs/DESIGN.md` owns shared experience and accessibility rules.
- The exact `sNN-state.md` owns durable state-specific behavior, semantic content meaning, accessibility, and authority.
- A `technical-*.png` owns only a process depiction explicitly adopted by authoritative prose and otherwise remains guidance.
- An approved implementation spec may own an explicit appearance departure only for its collective outcome and only when compatible with governing authorities.
- The skill routes schema questions to `docs/contracts/README.md` without restating an independent artifact taxonomy.
Indivisibility_rationale:
- none; this task changes only the frontend skill's consumption of one already-approved authority model.
Expected_surfaces:
- `.agents/skills/frontend-design/SKILL.md` authority and reference-artifact sections.
Reference_artifacts:
- none
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/T-0039.md
