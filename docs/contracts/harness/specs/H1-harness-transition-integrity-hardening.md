# H1: Harness Transition-Integrity Hardening

**State:** approved

**Approved:** true

**Approval source:** Explicit user instructions in this authoring run. The user separately authorized later content revision, including retirement of the four pre-current-system implementation-spec bodies referenced by T-0001 through T-0007; the final approved content was validated and independently reviewed before delivery.

## Identity and Ownership

- **Spec ID:** `harness/H1`
- **Sequence:** H1
- **Outcome:** The revised contract, spec, task, active-queue, completed-archive, review, closeout, merge, cleanup, and authority model is internally consistent, executable, resistant to stale legacy authority, and safe for the next autonomous implementation lifecycle.
- **Owner type:** harness
- **Owning authority:** `AGENTS.md`
- **Legacy schema bridge:** For this one pre-migration decomposition, the live `Owning contract` check treats `AGENTS.md` as H1's owning-contract alias. `Owning authority` is the approved forward field.
- **Affected states:** none
- **Approved dependencies:** none
- **Amends:** none
- **Supersedes:** none

## Discovery Basis

**Governing documents**

- `AGENTS.md`, especially Authority and Source Ownership, Context Routing, Decision Boundary and Implementation Latitude, Readiness and Task Selection, Engineering Rules, Review Guidelines, Git and Completion, and Project Learning.
- `docs/README.md`, especially Global Authorities, Contract System, Execution System, and Ownership Rule.
- `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, and `docs/MVP.md`, especially their authority, state-ownership, reference, and proof language.
- `docs/REPOSITORY_POLICY.md`, especially Guarded autonomous delivery and Evidence.
- `docs/contracts/README.md`, especially Folder Ownership, One-Owner Rule, Artifact Ownership, Templates, and Authority Boundary.
- `docs/contracts/states/README.md` and `docs/contracts/states/STATE_TEMPLATE.md` for state-package routing and artifact relationships.

**Owning and affected authorities**

- Owning authority: `AGENTS.md`.
- Procedure owner: `.harness/validation.md`.
- Active execution owner: `.harness/tasks.md`.
- Immutable completed-entry owner: `.harness/completed.md`.
- Repository delivery-policy owner: `docs/REPOSITORY_POLICY.md`.
- Contract routing and spec-identity owner: `docs/contracts/README.md` and `docs/contracts/SPEC_TEMPLATE.md`.
- Authoring workflow owners: `.agents/skills/spec-authoring/SKILL.md` and `.agents/skills/task-authoring/SKILL.md`.
- Implementation verification workflow owner: `.agents/skills/code-change-verification/SKILL.md`.
- Frontend build and review behavior owner: `.agents/skills/frontend-design/SKILL.md`.

**Relevant prior specs**

- `4b7a12978510808ee8620fff2893180c65006160:docs/specs/A-repository-foundation.md`, as Git-only historical repository-foundation outcome and acceptance evidence.
- `4b7a12978510808ee8620fff2893180c65006160:docs/specs/A1-harness-execution-hardening.md`, as Git-only historical harness-hardening outcome and acceptance evidence.
- `4b7a12978510808ee8620fff2893180c65006160:docs/specs/B-s1-s2-continuous-entry-and-property-analysis.md`, as Git-only evidence of the prior fixed-decomposition model.
- `4b7a12978510808ee8620fff2893180c65006160:docs/specs/B1-s1-s2-integrated-stabilization.md`, as Git-only outcome and acceptance evidence for T-0007 and evidence of a prior spec-sized task boundary.

Legacy task counts, proposed task outcomes, fixed decomposition, `do not split` language, deleted paths, and old placement in those specs are historical only. They do not constrain new decomposition.

**Current implementation inspected**

- `.agents/skills/spec-authoring/SKILL.md`
- `.agents/skills/task-authoring/SKILL.md`
- `.agents/skills/code-change-verification/SKILL.md`
- `.agents/skills/frontend-design/SKILL.md`
- `.agents/skills/annotation-headers/SKILL.md`
- `.harness/tasks.md`
- `.harness/completed.md`
- `.harness/validation.md`
- `.harness/LESSONS.md`
- `package.json`
- `scripts/run-validation.mjs`
- `scripts/validation/annotation-headers.mjs`
- `scripts/validation/repository-security.mjs`
- `.github/workflows/ci.yml`
- current Git branch, local HEAD, status, staged and unstaged paths, complete local diff, task stores, counters, and relocated artifact hashes

**Reference artifacts**

| Path | Type | Authority | Applies to |
|---|---|---|---|
| none | none | none | This is a non-visual harness outcome. Existing image pairs are migration evidence only. |

## Current State

- The starting local authority is the modified worktree based on local HEAD `4b7a12978510808ee8620fff2893180c65006160`, preserved unchanged on `codex/harness-transition-integrity-authoring` before remote hydration.
- The tracked starting diff has Git hash `6486f430e14c26f22a615bacd6f100880791bfad`. No changes were staged at preservation time, and no runtime source, test, dependency, schema, workflow, fixture, or build-tooling path was dirty.
- `.harness/tasks.md` has no active task, `RUN_MODE: autonomous`, `MERGE_MODE: autonomous`, `NEXT_TASK_TAG: 0008`, and `NEXT_REFACTOR_TAG: 0001`.
- `.harness/completed.md` contains seven historical blocks in order `T-0001, T-0002, T-0003, T-0004, T-0006, T-0005, T-0007`. Their canonical block SHA-256 is `2B07112D32C5401991C2224A83E7C53BB36415842C599BAB900F17135F460C1F`, computed from the UTF-8 text beginning at the first `### [T-0001]` heading through the terminal newline, with CRLF normalized to LF and no trimming or other transformation.
- The new two-store shape is present, but implementation verification still describes the prior tasks-only closeout, completion and dependency proof have competing definitions, and no executable harness validator protects the active/archive transformation.
- The new spec and task skills separate the brickhouse from its bricks, but approval recording, authoring delivery, legacy identity, idempotent decomposition, task-size exceptions, and circular mechanism authority remain incomplete.
- Global documents still assign composition, renderer detail, exact references, and proof to `sNN-state.md`, which conflicts with the revised state-contract, artifact, and implementation-spec split.
- The starting restructuring copied the state template into `docs/contracts/states/s01-address-entry/s01-state.md` with unresolved bracket placeholders. It is not approved S01 authority and must not ship at a concrete authority path.
- Five visual or technical artifacts exist at both legacy `references/states/...` paths and new `docs/contracts/states/...` paths as byte-identical but independently writable files.
- `docs/MVP.md` repeats durable product and architecture truth, code and annotation sources are not clearly distinguished from normative target authority, and several minor path and lifecycle residues remain.

## Completion State

- A fresh Codex instance can deterministically identify each kind of normative truth, current implementation evidence, spec, task, artifact, validation procedure, active state, completed state, and Git evidence without loading unrelated history.
- Spec drafting, explicit approval recording, task decomposition, implementation execution, provisional closeout, durable completion, authoring-only delivery, and historical lookup have distinct owners and non-overlapping identities.
- The active queue and completed archive are structurally validated, dependency completion has one executable definition, and unsafe duplication, mutation, omission, or reordering fails before merge.
- Review evidence is bound durably to the exact reviewed SHA, universal correctness review includes security implications, and dedicated security review is assigned only to security-sensitive work.
- Base advance, ambiguous remote outcomes, provisional archive reversal, manual merge mode, blocked-task resumption, single-executor claims, and cleanup retries have deterministic safe behavior.
- State contracts own durable semantics, visual artifacts own appearance, technical artifacts own only an explicitly adopted process depiction, implementation specs own collective outcomes, and routine engineering choices remain with Codex.
- The four retired implementation-spec bodies referenced by T-0001 through T-0007 remain usable as Git-only historical evidence through stable identity and migration mapping without reviving obsolete decomposition or rewriting immutable completed blocks.

## Scope

### Included

- Normative authority, routing, terminology, precedence, and context-loading corrections across the harness and global documentation system.
- Stable owner-scoped spec identity, legacy migration mapping, retirement of obsolete live spec examples, scoped lineage, and decomposition idempotency.
- Active queue, blocked state, candidate delivery, provisional closeout, completed archive, dependency, merge, reversal, and cleanup semantics.
- A distinct non-task authoring delivery lane and status-only recording of later explicit spec approval.
- Executable validation for task-store structure, archive immutability, atomic transfer, task identity, counters, dependencies, and seeded legacy exceptions.
- Exact-SHA read-only review evidence and aligned correctness, security, and frontend review behavior.
- Task-sizing and file-cohesion rules that preserve independently provable seams and implementation latitude.
- Canonical visual and technical artifact routing and removal of independently writable duplicate authority.
- Removal of duplicated durable product or architecture truth from `docs/MVP.md` while preserving its demo-specific proof boundary.
- Historical path, archive-seeding, branch-cleanup, routing, lesson-disposition, and related transition residue.

### Excluded

- Product behavior, customer-visible state implementation, S01-S10 contract completion, UI changes, runtime refactoring, schemas, providers, dependencies, credentials, deployment, or external services.
- Rewriting historical approved spec content merely to modernize its prose or task sections. The explicitly authorized removal of the four exact Git-preserved implementation-spec bodies referenced by T-0001 through T-0007 from the live tree is migration, not a content rewrite.
- Editing, reordering, condensing, deleting, or path-updating any immutable completed-task block.
- A distributed lock service, multi-executor coordination system, merge queue, new hosted infrastructure, or human-approval requirement.
- Selecting implementation task count, task order, task tags, or task boundaries in this specification.
- Arbitrary task size limits based on time, file count, or line count.
- Introduction of a `content` reference-artifact type.

## Required Outcomes

### 1. Authority and Routing Coherence

1. `AGENTS.md` distinguishes normative target authority from descriptive implementation evidence. User decisions, durable authorities, exact adopted artifacts, approved implementation specs, task stores, validation procedures, and Git retain their stated domains. Code is current implementation reality; tests are executable expectations and evidence that may be stale or failing; annotation headers summarize inspected code and never overrule it.
2. State contracts, visuals, technical artifacts, and implementation specs have non-overlapping ownership:
   - `sNN-state.md` owns durable state semantics;
   - `visual-*.png` owns approved appearance;
   - `docs/PRODUCT.md` owns shared product meaning and truth, `docs/DESIGN.md` owns shared experience and accessibility rules, and the exact `sNN-state.md` owns durable state-specific behavior, semantic content meaning, accessibility, and authority;
   - `technical-*.png` owns only the process depiction explicitly adopted by authoritative prose and otherwise remains guidance;
   - an approved implementation spec owns one collective outcome, including any explicit appearance departure required for that outcome and consistent with its governing authorities.
3. Harness and repository specs are classified by their primary accepted outcome. Their exact owning authorities are `AGENTS.md` and `docs/REPOSITORY_POLICY.md`, respectively. State outcomes use the exact owning `sNN-state.md`. The field name is `Owning authority`. The inclusion test is:
   - a state outcome is accepted through customer-visible state behavior or completion;
   - a harness outcome is accepted through Codex authoring, queue, validation, review, delivery, or lifecycle behavior;
   - a repository outcome is accepted through repository or hosting configuration that remains meaningful independently of the Codex harness;
   - a supporting change follows the outcome it enables; if two independently acceptable outcomes remain, they require separate specs rather than an arbitrary tie-breaker.

   H1 is a harness outcome because its repository-policy changes support the harness lifecycle and are not independently complete repository behavior.
4. `docs/contracts/README.md` is the canonical owner for spec routing, terminal-state routing, spec filename and identity conventions, legacy compatibility, and artifact migration. Other files state only their operational consequence and point to that owner.
5. `docs/MVP.md` retains only current demo scope, seeded proof, exclusions, and observable proof conditions. Durable product, architecture, and shared design truth is referenced at its owning document rather than copied.
   Deduplication preserves the canonical scenario, start and endpoint, real/seeded/simulated/deferred boundaries, non-goals, and observable proof conditions without semantic change.
6. A resolved durable product, architecture, design, state, security, schema, or compatibility decision is first recorded in its owning authority through an explicitly authorized authority-update step. Dependent spec drafting resumes only after that update.

### 2. Spec Authoring, Approval, and Identity

1. New specs expose a stable owner-scoped spec ID independent of physical path. This specification uses `harness/H1`.
2. A canonical migration map resolves every legacy implementation-spec path used by current history to an exact stable spec ID and either a current canonical path or an exact Git historical locator. A deprecated Git-only identity cannot advertise a live canonical path. Legacy placement, deleted dependencies, embedded decomposition, and superseded authoring, delivery, validation, closeout, lifecycle, routing, and artifact-governance mechanics remain historical only. Completed outcome and acceptance evidence plus still-valid compatibility obligations remain available.
3. New specs support bounded `Amends` and `Supersedes` lineage. Lineage applies only to the stated prior authority and cannot silently replace unrelated durable truth or historical evidence.
4. `$spec-authoring` remains unable to approve its own draft. After a later explicit user approval, it may record a status-only transition that changes approval metadata and nothing else unless content revision is separately authorized.
5. A spec-authored acceptance criterion cannot create implementation authority by naming a preferred mechanism. A mechanism is locked only when independently required by durable authority, safety, security, data integrity, compatibility, a public contract, or an unavoidable observable result.
6. The active artifact vocabulary is `visual`, `technical`, or `none`. `content` has no active route and is removed until an explicit approved contract change introduces one.
7. Forward task entries reference both the stable spec ID and its current canonical path. H1's one-time decomposition may use the approved forward fields before the live template is updated because this explicit transition specification and user instruction authorize the schema bridge.

### 3. Independent Task Decomposition

1. `$task-authoring` owns task count, size, order, dependencies, tags, task-local acceptance, readiness, and queue mutation without constraint from legacy task proposals or `do not split` language.
2. Lack of standalone customer value does not make a separated brick nonfunctional. Separation fails only when it leaves the repository invalid, misleading, knowingly false, impossible to prove independently, or dependent on disposable architecture.
3. Independent proof, failure, rollback, recovery, migration, and compatibility seams control splitting. Any task that crosses independently provable seams records a concise indivisibility rationale against the combine-only test in the committed task block.
4. Every authored task persists a stable source-spec-scoped brick ID. Task authoring performs a narrow identity-aware check of active and historical tasks and cannot recreate an already represented brick ID. Ordinary decomposition does not load the completed archive into model context; a targeted lookup or executable check returns only relevant identity evidence.
5. Only validation-set names present in `.harness/validation.md` may be assigned.

### 4. Active Queue and Single-Executor Model

1. The current harness supports one autonomous primary executor at a time and relies on the invocation environment to serialize autonomous primary executors. Repository claim checks detect stale or conflicting work; they are not represented as a distributed lock or as protection against two improperly simultaneous invocations.
2. Before source mutation, selection checks the base queue plus live task pull requests and remote task branches, then publishes the deterministic task claim through the configured task branch. A live task branch, live task pull request, existing base-branch `working` task, provisional closeout, failed claim publication, or competing same-tag reference blocks a second claim. Remote state that cannot be checked blocks autonomous claiming rather than being guessed.
3. Eligibility requires `Status: queued`, `Ready: true`, `Pass: false`, satisfied dependencies, no blocker, and successful claim checks. `Status: blocked` is never eligible.
4. Same-task resumption proves that any existing branch and pull request belong to the exact blocked task, reruns remote claim checks, requires `Blocker: none`, revalidates readiness and dependencies, and explicitly returns the task to `queued` or `working` as appropriate. It does not mistake the task's own valid claim for a second executor. A blocked task does not resume merely because another condition changed.
5. Candidate delivery is a lifecycle phase, not a completed task state. The active task remains `Status: working` and `Pass: false` until provisional closeout begins.

### 5. Completion, Archive, and Dependency Proof

1. Closeout atomically constructs the final task block with `Status: passed` and `Pass: true`, appends it verbatim to `.harness/completed.md`, and removes the same block from `.harness/tasks.md` in one metadata-only commit.
2. The unmerged archive entry and `Pass: true` fields are explicitly provisional proposed final state. They do not represent durable completion until the exact closeout head reaches the configured base branch.
3. Manual merge mode stops only after the candidate content SHA has passed its required review, the provisional closeout head differs from that candidate only by the authorized two-store metadata transfer, and exact-head CI is green. It reports the task as awaiting merge, preserves the claim, and does not advance the queue. A later manual merge must use the same exact-head, exact-base, tagged-subject, no-bypass, and remote-readback guards as autonomous merge. Explicit user withdrawal before merge authorizes reversal of the provisional transfer and restoration of the task with `Pass: false` and the user-directed active status.
4. For tasks completed after this migration, one canonical completion proof requires the guarded merged pull request, its exact base-branch merge SHA, a subject beginning with the task tag, introduction of the exact archived block by that merge, absence of the task from the base active queue, and no unresolved remote task branch.
5. Dependency satisfaction uses that same canonical proof. A tag alone or an archive entry alone is insufficient.
6. Historical `T-0001` through `T-0007` use an explicit one-time seed exception: existing tagged base history plus the verbatim seeded blocks and migration provenance establish compatibility without claiming that their original merges performed the new archive transfer.
7. Baseline-integrated structural validation rejects duplicate tags, a tag in both stores, invalid active or completed status fields, counter regression, archive reordering or mutation, non-verbatim transfer, and unauthorized archive edits. It accepts exactly one structurally valid provisional transfer without requiring that unmerged work already have remote completion evidence.
8. Live completion and dependency proof is a separate Git and GitHub procedure used during selection, merge readback, and cleanup. It is not a network prerequisite of the local baseline.

### 6. Review, CI, Merge, Failure, and Recovery

1. `agent-review` is universal, read-only, and includes correctness, acceptance, architecture, data, file responsibility, regression, and security implications.
2. `security-review` is separately required only for security-sensitive scope. `security` executable proof is assigned according to the registered surface criteria.
3. Every independent review result is durably recorded on the pull request with reviewer identity or run identifier, independent reviewer role, review type, exact reviewed candidate-content SHA, result, and blocking findings or `none`. Any applicable content change invalidates review of the prior SHA. The later closeout SHA is accepted without repeating content review only when executable validation proves that it differs from the reviewed candidate solely by the authorized `.harness/tasks.md` and `.harness/completed.md` transfer; latest-head CI binds separately to the closeout SHA.
4. Independent correctness, security, and visual reviewers never modify the worktree. Only the primary task agent repairs findings, reruns proof, and requests fresh review.
5. Before guarded merge, the procedure fetches the configured base, proves the pull request is current with that exact base, and performs a non-force update plus complete redelivery if the base advanced.
6. Remote CI is accepted only for the exact current pull-request head and the exact required check names.
7. A failed, timed-out, or interrupted pull-request create or update, review-evidence write, CI or status query, merge, or branch operation triggers remote readback before retry, reversal, or cleanup. If the intended remote state is proven, the procedure continues from that state; if non-application is proven, it safely retries or reverses as applicable; if state remains ambiguous, mutation stops with the branch and evidence intact.
8. Reversal restores only the affected task to the active queue with `Pass: false` and the correct active status, removes only its provisional archive entry, and preserves every other active and completed block byte-for-byte.
9. Cleanup is idempotent. Already-absent remote or local task branches are accepted only after exact merged-identity proof. Ordinary local deletion is attempted before the narrowly guarded squash-ancestry force-deletion exception.
10. After durable completion, a cleanup failure never reverses `Pass`, edits the archive, or reactivates the task. The exact local branch and scratchpad are preserved, the failure is recorded in durable pull-request evidence and the scratchpad, queue advancement stops, and only the cleanup proof is retried.
11. Before closeout, qualifying reusable lessons are promoted or `none` is recorded in the scratchpad while task-source changes remain allowed. Scratchpad deletion remains post-merge only.

### 7. Non-Task Authoring Delivery

1. A separate non-task authoring lane may deliver specs, status-only approval recording, contract updates, task decomposition, and related authority or queue changes.
2. It uses a descriptive non-task branch, commit, and pull-request identity. It does not use a task tag, `Pass`, an implementation scratchpad, task closeout, completed-archive transfer, or implementation-completion history.
3. It requires scoped local validation, complete diff inspection, exact-SHA read-only review, applicable exact-head CI, guarded merge, remote-result readback, and clean local synchronization.
4. An authoring pull request cannot satisfy an implementation task dependency or completion proof merely because it introduces that task to the queue.
5. Explicit user instruction, not task `RUN_MODE` or `MERGE_MODE`, authorizes an authoring delivery and whether its guarded merge may be autonomous.
6. Authoring that mutates the active queue, counters, validation, or execution authority is mutually exclusive with a live implementation claim. A live conflicting authoring pull request blocks task claim, and a live task claim blocks that authoring merge.

### 8. Artifact and File-Cohesion Integrity

1. Each current visual or technical artifact has one canonical physical path under `docs/contracts/states/<state>/`. Legacy duplicate paths are migration references only and do not remain independently writable current authority.
2. A visual departure from an assigned artifact must be explicit in governing prose. A total precedence list cannot silently let incidental spec wording override the artifact's appearance domain.
3. More than 250 nonblank lines triggers a responsibility and reason-to-change evaluation. More than 350 nonblank lines triggers explicit review escalation. A cohesive file may remain large when an accepted responsibility analysis shows that splitting would reduce cohesion or proof quality.
4. Declarative or generated content is supporting evidence for a large-file rationale, not a prerequisite.
5. File review evaluates primary responsibility, reasons to change, mixed architectural layers, independent evolution, dependency direction, and proof boundaries rather than line count alone.

## Normative Authority Changes

The completed outcome changes normative wording only in the artifact that owns each rule:

- `AGENTS.md`: source-domain model, normative versus descriptive distinction, durable-authority update transition, single-executor contract, high-level task and authoring identities, implementation latitude, and responsibility-based large-file escalation.
- `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, and `docs/MVP.md`: only their own durable domain and references to the revised state/artifact/spec split.
- `docs/REPOSITORY_POLICY.md`: high-level review, exact-SHA evidence, base refresh, guarded delivery, and non-task authoring policy without duplicating command procedures.
- `docs/contracts/README.md`: spec classification, exact owning authorities, stable identity and filename rules, lineage, legacy migration, terminal-state routing, artifact vocabulary, and canonical artifact paths.
- `docs/contracts/SPEC_TEMPLATE.md` and `docs/contracts/states/STATE_TEMPLATE.md`: stable fields and exact path structure only.
- `.harness/tasks.md`: active-state, eligibility, blocked-resumption, dependency, claim, counter, and task-entry structure.
- `.harness/completed.md`: archive contract and one-time seed provenance outside the immutable task blocks.

No README, template, global document, or repository policy independently owns detailed authoring workflow, task decomposition, command sequences, or queue mutation.

## Executable Harness Changes

- `.harness/validation.md` owns the canonical task and non-task delivery procedures, provisional closeout, reversal, exact-SHA review evidence, base refresh, ambiguous remote readback, merge, and idempotent cleanup.
- Executable structural validation integrated with the registered baseline checks active and completed stores, stable task and spec identity, counters, duplicate representation, archive immutability, atomic transfer shape, migration exceptions, and exact path validity. Legacy stale paths are valid only through the canonical migration map.
- Separate live Git and GitHub procedures prove claim state, completion, dependencies, reviewed SHA, exact-head CI, merge readback, and cleanup without making the local baseline depend on remote availability.
- `.agents/skills/spec-authoring/SKILL.md`, `.agents/skills/task-authoring/SKILL.md`, `.agents/skills/code-change-verification/SKILL.md`, and `.agents/skills/frontend-design/SKILL.md` own only their specialized workflow and route shared proof or delivery mechanics to `.harness/validation.md`.
- Remote CI continues to expose exactly `CI / baseline` and `CI / browser-smoke` unless a separately approved repository-policy change authorizes different required checks.

## Safe Migration and Legacy Compatibility

1. The current modified local worktree is preserved as the migration source. Stale remote files never replace or reinterpret it.
2. The unresolved template copy at `docs/contracts/states/s01-address-entry/s01-state.md` is omitted from this checkpoint rather than treated as durable S01 truth. A later separately authorized state-authoring run must create and approve the real contract; until then, any S01-dependent spec or implementation readiness check stops on the absent contract. H1 itself has no affected state and does not author S01 content.
3. By explicit later user instruction, the four exact pre-current-system implementation-spec bodies referenced by T-0001 through T-0007 are deprecated and absent from the live tree so they cannot serve as bad authoring examples. Their unchanged bytes remain in Git at the preserved transition base, and their completed outcome and acceptance evidence remains resolvable without editing immutable task blocks.
4. The three removed `docs/source/*_SPEC.md` files are legacy source-document inputs, not implementation specs and not stable spec identities. Their durable current truth routes to `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, and `docs/MVP.md`; their original bytes remain in Git at the preserved transition base for historical investigation without a forward-authoring route.
5. The canonical legacy spec-path map includes at least:
   - `docs/specs/A-repository-foundation.md` to stable ID `repository/A`, current path `none`, and historical locator `4b7a12978510808ee8620fff2893180c65006160:docs/specs/A-repository-foundation.md`;
   - `docs/specs/A1-harness-execution-hardening.md` to stable ID `harness/A1`, current path `none`, and historical locator `4b7a12978510808ee8620fff2893180c65006160:docs/specs/A1-harness-execution-hardening.md`;
   - `docs/specs/B-s1-s2-continuous-entry-and-property-analysis.md` to stable ID `state/s02/B`, current path `none`, and historical locator `4b7a12978510808ee8620fff2893180c65006160:docs/specs/B-s1-s2-continuous-entry-and-property-analysis.md`;
   - `docs/specs/B1-s1-s2-integrated-stabilization.md` to stable ID `state/s02/B1`, current path `none`, and historical locator `4b7a12978510808ee8620fff2893180c65006160:docs/specs/B1-s1-s2-integrated-stabilization.md`.
6. Old spec placement in the migration map does not establish the owning authority for new work. New specs use the current primary-outcome routing rule, and deprecated Git-only identities are never loaded as authoring templates or forward authority.
7. Legacy artifact paths map to the corresponding canonical files under `docs/contracts/states/`. During the bounded migration, each exact byte-identical pair is declared `migration-pending`; the network-free validator accepts only that named, hash-equal transitional duplicate. Each pair migrates independently by proving equality, removing its legacy copy, updating its registry state to `canonical`, and checking its current consumers. The registered baseline does not enforce the final all-canonical state until all five pairs have migrated. Current consumers use only canonical paths. Git remains the byte-history source for deleted legacy copies. The exact pairs are:
   - `references/states/s01-address-entry/visual-default.png` to `docs/contracts/states/s01-address-entry/visual-default.png`;
   - `references/states/s01-address-entry/visual-how-it-works-open.png` to `docs/contracts/states/s01-address-entry/visual-how-it-works-open.png`;
   - `references/states/s02-property-analysis/visual-property-confirmation.png` to `docs/contracts/states/s02-property-analysis/visual-property-confirmation.png`;
   - `references/states/s02-property-analysis/visual-live-roof-assembly.png` to `docs/contracts/states/s02-property-analysis/visual-live-roof-assembly.png`;
   - `references/states/s02-property-analysis/technical-persistent-project-assembly.png` to `docs/contracts/states/s02-property-analysis/technical-persistent-project-assembly.png`.
8. Historical task blocks keep their original `Source_spec` and `Reference_artifacts` values. Lookup uses migration mapping and Git history rather than editing completed entries.
9. The one-time archive seed records its provenance outside the seven immutable blocks and does not claim that historical tasks passed a procedure that did not yet exist.
10. Any migration failure preserves the current branch and worktree, stops destructive action, and reports the exact path, identity, or evidence conflict.

## Failure and Trust Boundaries

- Missing, duplicated, malformed, reordered, or unexpectedly changed task/archive identity is blocking and fails executable validation.
- An authority conflict, unresolved lineage target, ambiguous migration match, unavailable required artifact, or unsupported approval evidence blocks authoring or readiness rather than being inferred.
- Current code is implementation reality. Tests are executable expectations and evidence that may be stale or failing. Code/test disagreement is reported and resolved as an implementation or proof defect; neither silently creates durable target authority. A stale annotation header is corrected from inspected code and never overrules it.
- A normative target that differs from current code is an implementation gap unless it exposes an unresolved public, durable, compatibility, security, or data decision.
- Missing remote claim evidence, uncertain merge state, or unavailable exact-head proof blocks autonomous mutation and preserves recoverable local state.
- Secrets, credentials, external providers, hosted infrastructure, and product data are outside this outcome.

## Experience and Reference Fidelity

- **Required visible states:** none
- **Visual references:** none
- **Technical references:** none
- **Accessibility and interaction:** none
- **Required departures:** none

## Implementation Latitude

### Locked Decisions

- The approved decisions and required outcomes in this specification.
- Stable owner-scoped spec identity, immutable historical completed blocks, canonical artifact ownership, one autonomous primary executor, exact-SHA read-only review evidence, atomic provisional closeout, guarded merge readback, and canonical task-completion proof.
- No distributed lock service, new external service, or task-tag identity for authoring delivery.

### Agent Discretion

- Validator module boundaries, data structures, parsing strategy, fixtures, test organization, and diagnostic presentation.
- The smallest maintainable distribution of wording across owner files, provided one rule has one canonical owner and other files route to it.
- The exact non-force branch-update technique supported by repository policy and GitHub, provided it preserves local authority and reruns the complete delivery gate.
- Internal representation used for narrow acceptance-brick identity checks, provided reruns are deterministic and cannot recreate represented work.
- Cohesive module boundaries and sequencing inside each later implementation task.

### Prohibited Approaches

- Reverting current local authority to stale GitHub content.
- Editing immutable completed-task blocks or treating historical paths as current forward authority.
- Duplicating detailed delivery workflow across skills, policy, README files, templates, and `AGENTS.md`.
- Using prose-only invariants where deterministic repository validation can enforce the rule.
- Treating a spec's preferred implementation mechanism as self-authorizing.
- Combining independently provable seams solely because they share a spec, screen, file, or eventual customer outcome.
- Letting a read-only reviewer repair its own findings.

## F25 Residue Ownership

| ID | Residue | Canonical owner | Required observable correction |
|---|---|---|---|
| F25a | Stale live skill paths and consumed bootstrap route | `.agents/skills/code-change-verification/SKILL.md` | All active paths are exact and current; no executable future bootstrap branch remains. `bootstrap-preflight` and `Bootstrap: true` survive only as labeled historical compatibility. |
| F25b | Relative artifact references and undefined spec filenames | `docs/contracts/README.md`, encoded by `docs/contracts/SPEC_TEMPLATE.md` and `docs/contracts/states/STATE_TEMPLATE.md` | Templates use exact repository-relative paths, and one owner-local filename convention maps deterministically to stable spec identity. |
| F25c | Terminal-state routing repeated as independent authority | `docs/contracts/README.md` | It contains the complete routing rule; other docs and skills state only the consequence and point to the canonical section. |
| F25d | One-time archive seed lacks reproducible provenance | `.harness/completed.md` header; structural enforcement owned by `.harness/validation.md` | Provenance is recorded outside immutable blocks, canonical block hashing is reproducible, and the seven blocks retain exact normalized content and order. |
| F25e | Cleanup idempotency and post-merge failure state | `.harness/validation.md` | Already-absent branches and incomplete cleanup follow the exact merged-identity, preserve-completion, and retry-only rules. |
| F25f | Lesson disposition occurs too late or in the wrong file | `.harness/validation.md` | Before closeout, the task scratchpad records promoted lessons or `none`; post-merge deletion cannot lose reusable evidence. |
| F25g | Historical spec and artifact paths can be mistaken for live routes | `docs/contracts/README.md` | Every supported legacy path resolves through the ID-bearing migration map; current consumers use canonical paths, while completed blocks remain unchanged. |
| F25h | Path, schema, and migration invariants rely only on prose | Structural validator registered by `.harness/validation.md` | Positive and negative fixtures enforce exact active schemas, canonical routes, seed exceptions, and forbidden stale live paths without requiring GitHub access. |

## F1-F25 Traceability Matrix

| ID | Finding type and risk | Required resolution | Owning authority or system | Observable acceptance and validation |
|---|---|---|---|---|
| F1 | Missing rule: no authorized approval recorder | Permit status-only recording after later explicit user approval; content remains unchanged unless separately authorized | `.agents/skills/spec-authoring/SKILL.md` | Fixture or review proves only approval metadata changed and approval evidence is named |
| F2 | Missing rule: no non-task authoring delivery lane | Define non-task branch, commit, PR, validation, merge, and cleanup identity with no implementation completion semantics | `.harness/validation.md`; policy summary in `docs/REPOSITORY_POLICY.md` | Authoring fixture or delivered example contains no task tag, Pass state, scratchpad, or archive mutation and has exact-head evidence |
| F3 | Direct contradiction: verification skill uses tasks-only closeout | Make validation the sole exact closeout owner and route verification to atomic active/archive transfer and reversal | `.harness/validation.md`; `.agents/skills/code-change-verification/SKILL.md` | Cross-file review and executable fixture prove one canonical two-store transition |
| F4 | Missing executable protection: CI can pass a corrupt archive transformation | Add baseline-integrated structural validation for active/archive shape, transfer, identity, order, counters, immutability, and a valid provisional state; keep live completion proof separate | Validation implementation and tests; registry in `.harness/validation.md` | Positive and negative structural fixtures pass without network access, including one valid provisional transfer, and fail deterministically in local baseline and `CI / baseline` |
| F5 | Direct contradiction: dependency completion has tag-only and tag-plus-archive definitions | Use the single post-migration completion proof for both completion and dependency satisfaction; retain explicit seed exception | `.harness/tasks.md`; `.harness/validation.md` | Targeted dependency proof rejects tag-only, archive-only, active duplicates, and wrong merge evidence |
| F6 | Missing failure behavior: base refresh and ambiguous remote result | Require exact base refresh, non-force redelivery on advance, and remote readback before reversal or cleanup | `.harness/validation.md`; `docs/REPOSITORY_POLICY.md` | Review fixtures cover base advance, timeout with successful merge, proven non-merge, and unavailable readback |
| F7 | Direct contradiction: universal versus conditional dedicated security review | Make `agent-review` universal with security implications; make dedicated `security-review` security-sensitive only | `.harness/validation.md`; `docs/REPOSITORY_POLICY.md` | Set-selection tests or review prove ordinary work omits dedicated review and sensitive work requires it |
| F8 | Missing durable evidence: review is not exact-SHA bound | Record reviewer identity and role, review type, exact candidate-content SHA, result, and findings; prove closeout is metadata-only and bind latest CI to closeout SHA | `.harness/validation.md`; evidence boundary in `docs/REPOSITORY_POLICY.md` | PR evidence proves reviewer independence, exact candidate SHA, metadata-only closeout delta, and exact closeout-head CI |
| F9 | Ambiguous wording: provisional `Pass: true` and manual mode | Define unmerged closeout as provisional proposed final state; manual mode stops awaiting merge and blocks queue advance | `.harness/validation.md`; `.harness/tasks.md`; `AGENTS.md` | Lifecycle fixtures and review distinguish candidate, provisional closeout, durable merge, and reversal |
| F10 | Missing eligibility guard: blocked tasks can be selected | Require `Status: queued`, no blocker, and explicit resumption transition | `.harness/tasks.md`; selection procedure in `AGENTS.md` | Selection fixture rejects blocked tasks even when Ready and dependencies are true |
| F11 | Missing coordination: branch-local `working` state allows a second executor | Codify externally serialized autonomous invocation, publish deterministic claim evidence, and inspect live task PRs, branches, and provisional closeout | `AGENTS.md`; `.harness/validation.md` | Claim checks reject stale or competing evidence and documentation does not claim repository checks are a distributed lock |
| F12 | Direct contradiction: global docs retain all-in-one state specification ownership | Apply the state semantics, visual appearance, adopted technical depiction, and implementation-outcome split | Respective authority sections in `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, and `docs/MVP.md` | Authority review finds no global claim that a state contract owns implementation, renderer detail, artifact selection, or task proof |
| F13 | Stale legacy authority: approved specs retain decomposition, old paths, and old placement | Keep the four implementation-spec bodies referenced by T-0001 through T-0007 as mapped Git-only outcome and acceptance evidence, and make all embedded legacy workflow mechanics non-authoritative | `docs/contracts/README.md`; authoring skills | Legacy lookup resolves exact Git-only identity while new decomposition ignores proposed tasks and cannot load deprecated bodies as forward examples |
| F14 | Missing identity and idempotency: relocation, lineage, and repeated decomposition are undefined | Add stable owner-scoped spec ID, path migration, bounded lineage, dual task spec reference, stable brick ID, and narrow active/archive checks | `docs/contracts/README.md`; `docs/contracts/SPEC_TEMPLATE.md`; `.agents/skills/task-authoring/SKILL.md` | Repeated or partially completed decomposition cannot duplicate a brick ID; relocated or retired specs keep identity and tasks retain exact current routing |
| F15 | Missing ownership rule: harness versus repository spec is indeterminate | Use primary accepted outcome and exact owning authorities; rename field to `Owning authority` | `docs/contracts/README.md`; `docs/contracts/SPEC_TEMPLATE.md`; authoring skills | Routing fixtures or review place harness, repository, and state examples deterministically |
| F16 | Missing transition: resolved durable decisions are not recorded before spec drafting | Require an explicit authority-update step in the durable owner before dependent drafting resumes | `AGENTS.md`; `.agents/skills/spec-authoring/SKILL.md` | Authoring review rejects a spec that attempts to become duplicate permanent authority |
| F17 | Missing route: `content` artifact type has no owner or path | Remove `content` from active vocabulary until a later approved contract change | `docs/contracts/README.md`; templates; authoring skills; `AGENTS.md` | Exact search and structural checks find only `visual`, `technical`, or `none` in active schemas |
| F18 | Duplicated and ambiguous artifact authority | Keep one canonical physical artifact, prove equality before legacy removal, map all five paths, and align adopted technical depiction and explicit visual departure rules | `docs/contracts/README.md`; other authorities state only domain-specific consequences | Hash comparison and authority review prove one current file per artifact and compatible domain ownership |
| F19 | Ambiguous wording: normative target and descriptive code reality are mixed | Separate normative sources, current code reality, executable test expectations, and summarizing annotation headers | `AGENTS.md`; `docs/README.md`; annotation wording where needed | Conflict behavior review reports code/test mismatch, treats ordinary target gaps as work, and treats stale headers as repairable summaries |
| F20 | Duplicated ownership: MVP repeats durable product and architecture truth | Replace durable copies with exact upstream references while semantically preserving demo scenario, boundary, exclusions, and proof | `docs/MVP.md` | Cross-document review finds no duplicated durable stack, authority, or lifecycle rules and no MVP proof loss |
| F21 | Ambiguous task sizing: `nonfunctional` can mean lacking full customer value | Define invalid, misleading, knowingly false, independently unprovable, or disposable-architecture threshold and require cross-seam rationale | `.agents/skills/task-authoring/SKILL.md` | Decomposition review splits independently provable seams and records rationale for every exception |
| F22 | Circular authority: spec acceptance can lock its preferred mechanism | Require independent durable or unavoidable observable basis for mechanism locks | `.agents/skills/spec-authoring/SKILL.md`; template latitude guidance | Spec review rejects a mechanism justified only by acceptance text authored in the same spec |
| F23 | Excessive prescription: 350-line rule requires declarative or generated content | Make 250 an evaluation trigger and 350 a review escalation; accept a supported cohesion rationale | `AGENTS.md`; `.harness/validation.md` | Review accepts or rejects based on responsibility and reason to change, not content category alone |
| F24 | Direct contradiction and stale reference: frontend review mutates and names `frontend-unit` | Separate read-only review from primary-agent repair and use only canonical validation names | `.agents/skills/frontend-design/SKILL.md`; registry remains `.harness/validation.md` | Skill review has no reviewer mutation step and exact search finds no unregistered set name |
| F25 | Transition residue: stale paths/bootstrap, relative artifact routes, repeated routing, seed provenance, cleanup retry, naming, and lesson timing | Apply every exact F25a-F25h correction without giving the catch-all independent authority | Exact owners in the F25 Residue Ownership table | Every F25a-F25h observable correction passes and no residue is accepted through a vague nearest-owner rule |

## Acceptance Criteria

1. Every F1-F25 row is implemented in its named owner or explicitly represented by the one-time legacy migration exception, and no material finding remains as contradictory live authority.
2. A fresh spec run can determine owner type, exact owning authority, stable spec ID, path, lineage, affected states, artifacts, approval state, and historical compatibility without reading unrelated specs or treating implementation reality as target authority. H1's one-time legacy-schema bridge remains explicit and bounded.
3. A later explicit user approval can be recorded through a status-only transition, while drafting remains unable to self-approve or silently revise approved content.
4. A fresh task-authoring run can derive small bricks from one approved spec, ignore every superseded legacy workflow mechanism, persist stable brick IDs and dual spec references, detect represented bricks through narrow identity evidence, use only registered validation sets, and store every cross-seam rationale in its task block.
5. Active-queue validation rejects blocked selection, stale or competing claims, invalid status combinations, unsatisfied canonical dependencies, tag or counter reuse, and a task represented in both stores, while the authority text states the externally serialized executor precondition honestly.
6. Local structural validation proves a verbatim atomic transfer shape and reversible provisional state without remote completion evidence. Separate live proof makes completion durable only at the guarded base-branch merge and proves dependencies during selection.
7. The seven seeded historical blocks retain canonical SHA-256 `2B07112D32C5401991C2224A83E7C53BB36415842C599BAB900F17135F460C1F` using the exact UTF-8, LF-normalized, untrimmed boundary defined in Current State, with original content and order.
8. Review and delivery procedures prove independent reviewer identity, exact candidate-content SHA, metadata-only closeout delta, conditional dedicated security review, exact closeout-head CI, base refresh, safe redelivery, guarded manual or autonomous merge, ambiguous-result readback, and idempotent cleanup.
9. The non-task authoring lane can deliver authority, spec, approval-metadata, and queue changes without producing task completion identity or mutating completed-task blocks.
10. Global documents and contract routing consistently distinguish exact global and state semantic owners, approved appearance, explicitly adopted technical depiction, collective implementation outcomes, current code reality, test expectations, and demo-only proof boundaries. MVP deduplication preserves its scenario and proof semantics.
11. Only canonical `docs/contracts/states/...` visual and technical files remain current writable authority; historical paths resolve through migration evidence without duplicate current files.
12. No concrete `sNN-state.md` may contain unresolved template placeholders or imply approval through its path alone; the absent S01 contract blocks dependent future work until its separately authorized authoring run.
13. File-cohesion review detects multiple reasons to change and mixed independently evolving responsibilities while permitting a large cohesive file with an accepted written rationale.
14. All applicable local baseline, structural fixtures, exact-path checks, independent reviews, exact-head required CI, guarded delivery, and post-merge synchronization pass without product/runtime changes or external-system introduction.

## Validation Expectations

- **Required validation categories:** `baseline`, `agent-review`, `security`, and `security-review` collectively where the changed brick is security-sensitive; exact assignment belongs to task authoring.
- **Required fixtures or seeded data:** positive and negative local structural fixtures for active, blocked, candidate, provisional closeout, reversal, seeded legacy archive, duplicate spec or brick identity, counter regression, stale live path, canonical migration, and archive mutation; read-only procedure cases for base advance, completed merge, same-task resumption, authoring/task exclusion, cleanup failure, manual withdrawal, and ambiguous remote-result interpretation.
- **Required browser states:** none.
- **Required reference comparison:** exact path and hash comparison for canonical versus legacy artifact migration; immutable completed-block hash comparison.
- **Required independent review:** authority consistency, spec/task boundary, lifecycle safety, security implications, implementation latitude, file cohesion, stale legacy authority, task-store immutability, and starting-worktree preservation against the exact reviewed SHA.
- **Required remote proof:** exact pull-request head, exact required check names, reviewed-SHA evidence, guarded merge readback, synchronized clean base, and branch cleanup evidence.

## Open Questions

- none
