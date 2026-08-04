# Repository Foundation

## Status

- State: approved
- Approved: true

## Identity

- Sequence: A
- Outcome: The existing public repository provides a pinned, cross-platform Next.js foundation that is locally provable, independently reviewed, CI-gated, and safely delivered without product behavior.
- Depends_on: none
- Approval_scope: Defines and authorizes one `[T-0001]` repository-foundation task with `Bootstrap: true`. Only `$task-authoring` may instantiate and assign it; this approved spec with `Open Questions: none` requires no separate task-set approval.

## Authority and Source Bundle

- Upstream: `docs/source/PRODUCT_SYSTEM_SPEC.md` sections 1-4, 20, 22-23; `docs/source/MVP_DEMO_SYSTEM_SPEC.md` sections 1-5, 14-17; `docs/source/MVP_STATE_FLOW_SPEC.md` sections 1-4, 7-9.
- Operational truth: `docs/PRODUCT.md` product statement, scope, requirements, invariants, trust, and constraints; `docs/ARCHITECTURE.md` system, stack, boundaries, auth, services, reliability, validation, invariants, and change control; `docs/DESIGN.md` authority, references, accessibility, and browser validation.
- Additional source: `.harness/INIT.md`; `AGENTS.md`; `.harness/tasks.md`; `.harness/validation.md`; `.agents/skills/annotation-headers/SKILL.md`; `docs/specs/SPEC_TEMPLATE.md`; explicit user resolutions through 2026-08-03.
- A narrower operational rule may constrain this spec; a contradiction blocks implementation pending resolution.

## Reference Artifacts

| Path | Type | Status | Authority | Applies to |
|---|---|---|---|---|
| none | none | not_required | none | none |

S1-S10 artifacts are later product-state authority. No reference folder or approved image governs this non-product smoke shell.

## End State

- `DevDoneDiff/cp` keeps HTTPS `origin`, base branch `main`, approved pre-implementation history, and GitHub API visibility `visibility: public` / `private: false`; foundation creates no repository or replacement baseline.
- A modular-monolith Next.js App Router shell exists under `src/app`; `GET /` is an accessible, credential-free, non-product smoke surface.
- Exact runtime and direct-dependency pins, a committed frozen `pnpm-lock.yaml`, cross-platform commands, meaningful tests, annotation checks, security-policy checks, and documentation support later tasks.
- GitHub Actions exposes required checks `CI / baseline` and `CI / browser-smoke`; the validation registry, read-only reviews, PR procedures, strongest available protection, closeout, merge, and post-merge proof are executable.
- Clerk email OTP is documented only as the later replaceable auth adapter choice.
- No S1-S10 behavior, product visual authority, persistence, schema, provider integration, product SDK, or empty architecture layer exists.

## Entry and Exit Contract

### Entry

- Local `main` tracks `origin/main` at `https://github.com/DevDoneDiff/cp.git` and contains the approved harness baseline; it is not initialized, replaced, amended, or rewritten.
- This spec is explicitly approved first; `$task-authoring` then creates the sole bootstrap task without a separate task-set approval.
- Before branch creation, the worktree may contain only the approved spec and later task-entry changes. They move onto `codex/T-0001-repository-foundation` without a `main` commit; any unrelated, overlapping, staged, or unexpected change blocks.
- Successful GitHub CLI authentication and sufficient repository/protection permissions are mandatory before task-branch or implementation mutation.
- `RUN_MODE: autonomous` and `MERGE_MODE: autonomous`; only explicit user instruction may change either.

### Exit

- Content candidate: `Pass: false`, assigned local sets pass, annotations are candidate-clean, content and security reviews are clean, and both checks pass for recorded `REVIEWED_CONTENT_SHA`.
- Closeout: one commit changes only `.harness/tasks.md` to its passed state; both checks rerun and pass for recorded `EXPECTED_HEAD_SHA`. This closeout preserves review evidence but invalidates earlier head-bound CI.
- Autonomous merge proceeds only after every configured local validation, independent review, security review, CI, protected-head, repository-protection, and closeout gate passes.
- Completion requires guarded squash merge, assigned tag preservation in `main`, post-merge ancestry and subject proof, remote branch deletion proof, and no queue advance before those facts exist.

## Scope

### In Scope

- Read-only Git/GitHub preflight; one approved task branch; remote branch push, PR create/update, status checks, available protection configuration, guarded merge, and readback.
- Pinned Next.js shell, native CSS or CSS Modules, version declarations, package scripts, lockfile, tests, coverage, CI, `.env.example`, local setup docs, and project-scoped Codex setup.
- Dependency-free annotation-header and repository-security validators with meaningful positive and negative tests.
- Truthful reconciliation of `.harness/validation.md` and architecture documentation for the future Clerk adapter choice.

### Non-Goals

- Repository creation, Git initialization, another baseline, amend, history rewrite, force push, administrator bypass, or direct implementation commit on `main`.
- Product landing page or S1-S10 behavior, copy, state, appearance, exact-reference fidelity, auth flow, project runtime, API, persistence, schema, migration, deployment, or live provider.
- Empty `domain`, `application`, `ports`, `adapters`, or provider directories; speculative abstractions, validation families, or future placeholders.
- Drizzle, Neon, Clerk, Stripe, property-provider, visualization, UI/CSS framework, telemetry-vendor, or other product dependency.
- Clerk SDK, prebuilt UI, credentials, environment variables, hosted resource, calls, or runtime behavior.

## Required Behavior

1. Preflight verifies exact repository identity, `main` relationship/history, bounded authoring changes, local tools, GitHub auth, permissions, visibility, and protection capability. Any mismatch blocks before branch or implementation mutation; record the starting `main` SHA in the task scratchpad.
2. All implementation and approved authoring changes live on `codex/T-0001-repository-foundation`. Task commits, PR title, and squash subject begin with the assigned tag; no later task advances before tagged merged history exists.
3. `src/` is the application source root and `src/app` the App Router root. `/` returns 200 with one `main`, one H1, readable foundation-status text, no required hydration, and no product CTA, address, project, provider, auth, estimate, imagery, environment value, database, or network call.
4. Native CSS or CSS Modules may make the route readable; no product design precedent or framework is created. Do not create an architecture directory until approved work creates real files requiring it.
5. Exact foundation pins are:

| Group | Exact versions |
|---|---|
| Runtime and app | Node.js `24.19.0`; pnpm `11.18.0`; Next.js `16.2.12`; React and React DOM `19.2.8`; TypeScript `6.0.3` |
| Quality | ESLint `10.8.0`; eslint-config-next `16.2.12`; Prettier `3.9.6` |
| Tests | Vitest and @vitest/coverage-v8 `4.1.10`; @testing-library/react `16.3.2`; @testing-library/dom `10.4.1`; @testing-library/user-event `14.6.1`; @testing-library/jest-dom `6.9.1`; jsdom `29.1.1`; @playwright/test `1.62.1` |

6. Foundation uses TypeScript 6. TypeScript 7 must not enter the graph because its current programmatic API and ecosystem-tooling compatibility are unsuitable here. Resolve exact compatible `@types/node` from Node 24 and React type packages from React 19; do not equate type and runtime patch numbers.
7. Pin every direct dependency without ranges or floating tags; mark the package private; record Node/pnpm in machine-readable files; commit `pnpm-lock.yaml`; use pnpm only and `pnpm install --frozen-lockfile` in CI.
8. Cross-platform package scripts support Windows 10/11 PowerShell 7 and `ubuntu-24.04` without WSL or shell-only syntax. `pnpm validate` runs format check, zero-warning lint, strict typecheck, candidate annotation check, security policy, meaningful unit/integration/component tests, and production build.
9. Unit/integration tests exercise annotation and security validators with real positive/negative contracts; component tests prove route semantics/accessibility; empty, placeholder, skipped, or `passWithNoTests` suites fail the contract.
10. `pnpm test:smoke` is self-contained locally: it performs one production build, starts the production app, waits with a finite timeout, requests `/`, requires success, shuts down cleanly on success or failure, and leaves successful build output reusable.
11. `CI / browser-smoke` invokes that smoke contract first, then starts the app from the same build output for Chromium Playwright. It performs no second production build; smoke proves production startup/route availability, while Playwright separately proves browser content, behavior, no uncaught page errors, and clean shutdown.
12. Context ownership is: approved docs for the global map; spec for desired outcome; `.harness/tasks.md` for queue state; ignored scratchpad for rehydration; headers for file-local truth; tests/validation for proof; Git for history.
13. Annotate only meaningful entrypoints, routes, architecture, compatibility, trust, data, event, or validation-control files. Skip generated/vendor/style/fixture/mock/barrel/constant/trivial files; keep code authoritative and `RELATED` to at most three direct routers.
14. The dependency-free checker enforces one language-native header, recognized canonical field order, nonempty `MODULE`/`PURPOSE`/`INVARIANTS`, exact module path, conditional-field shape, ASCII IDs, valid anchors/markers, forbidden historical fields, and paired temporary fields referencing the single `Status: working` task. Candidate mode rejects every temporary task field; read-only review owns semantic accuracy.
15. `.env.example` states that foundation consumes no environment variables and declares no future provider placeholder/value; no configuration dependency is added. Ignore secrets, dependencies, generated/test/browser output, working references, and scratchpads.
16. Retain and assign `bootstrap-preflight`, `baseline`, `agent-review`, `frontend-component`, `frontend-e2e`, `security`, `security-review`, and `smoke`; retain unassigned `frontend-visual` as a later exact-artifact real-browser agent procedure. Remove `backend-unit`, `backend-integration`, `api-contract`, `database`, and `frontend-unit`; baseline still proves foundation unit/integration tests. Populate every retained `<unset>`.
17. GitHub Actions runs on PRs to and pushes on `main`, uses a deterministic workflow-plus-PR-number-or-ref concurrency group with cancel-in-progress, uses `ubuntu-24.04`, frozen installs, full immutable action SHAs with release comments, `permissions: contents: read`, no workflow secrets, and no weakened required step.
18. PR handling first uses `gh pr view` plus all-state exact-head listing; only one open PR with expected head/base may update. Proven zero results after successful auth/repository checks may create; closed, merged, duplicate, draft-unreadied, wrong-head/base, network, API, permission, or auth states block.
19. Watch all checks before protection exists; JSON must show `CI / baseline` and `CI / browser-smoke` with `bucket == pass`, then reread matching head SHA. Configure those contexts when supported, run required-check watch, and repeat JSON/SHA proof; exact-name all-check proof is the fallback.
20. Dedicated read-only content and security reviews cover acceptance, architecture, dependencies, tests, annotations, permissions, secrets, action pins, protections, bypass, SHA binding, PR/merge behavior, and documentation. Blocking findings restore `Pass: false` and require fixes plus affected validation and fresh reviews.
21. After first content-head CI passes, the tasks-only closeout records `EXPECTED_HEAD_SHA` and reruns both checks. Any other post-review change restores `Pass: false` and repeats affected validation, both reviews, push, and latest-head CI.
22. Apply the strongest available ruleset or classic protection: PR required, zero human approvals, resolved conversations where supported, linear/current-base history, the two checks, squash only, branch deletion, and no force push, base deletion, bypass actor/admin, merge queue, signed-commit requirement, or non-squash path. Record unsupported controls and enforce procedural equivalents.
23. Before merge fetch `origin/main`; if it advanced, merge it into the task branch with a tagged commit and no force push, then repeat validation, reviews, closeout, and CI. Merge only with `gh pr merge <PR> --repo DevDoneDiff/cp --squash --delete-branch --match-head-commit <EXPECTED_HEAD_SHA> --subject "<TASK_TAG> <TITLE>"`; never use `--admin`.
24. After merge, read PR state/merge SHA, fetch `origin/main`, prove ancestry, prove the subject starts with the tag, and prove the remote task branch is absent. Failed readback blocks completion and queue advancement.
25. Record Clerk email OTP as the later provider behind a project-owned auth port/adapter and custom product UI. Project domain/account-claim authority remains provider-independent; foundation adds no Clerk artifact or runtime behavior.

## State and Authority Rules

- Draft status grants no implementation authority; only explicit user approval can set `State: approved` and `Approved: true`.
- `$task-authoring` alone creates `[T-0001]`, assigns validation, and may set it `Ready: true` when the approved source, resolved questions, represented dependencies and artifacts, and absence of a material blocker establish readiness; no separate task approval is required.
- Autonomous run mode selects the first eligible task. Autonomous merge runs only after every configured gate passes.
- GitHub mutation is limited to the approved task branch, its PR/checks, available protections, and an authorized guarded merge. Routine implementation choices cannot add product behavior, dependencies, data/public contracts, visual authority, or cost.
- Passed task state and a green PR do not complete foundation; tagged `main` history and post-merge proof do.

## Data and Persistence

- Owned product data, persistence, schema, transaction, event, projection, provider payload, and homeowner state: none.
- Exact manifests/lockfile, recorded source and head SHAs, PR state, checks, and Git history are delivery evidence; reruns create no product/provider mutation.
- Generated, test, coverage, browser, cache, log, local environment, and scratchpad output remains ignored; scratchpad deletion waits for tagged `main` history.

## Interfaces and Dependencies

- Public runtime interface: `GET /` only.
- Internal proof interfaces: `pnpm validate`, `pnpm test:smoke`, `pnpm test:e2e`, annotation/security validators, and configured delivery procedures.
- External services: GitHub/package distribution for delivery/install only; no runtime product service. Clerk is future architecture only.
- Later dependency direction remains UI/routes -> application -> domain -> ports -> adapters; foundation creates no empty layers.

## Security, Privacy, and Trust

- Preflight validates repository, branch, auth, and permission before mutation; failure preserves the baseline and bounded authoring changes.
- Credentials remain machine-local; no product data, secret, private artifact, workflow secret, or sensitive fixture/log enters the repository.
- Security validation enforces exact approved dependencies, machine pins, frozen lockfile, immutable action SHAs, least workflow permission, no secret references, and no tracked secret-bearing or local environment file other than the approved sanitized `.env.example`.
- Stale review or CI cannot authorize another head; unsupported protection cannot be reported as configured; failures never justify weakened gates or bypass.

## Visual, Interaction, and Accessibility

- Required state: root non-product smoke route only; reference fidelity and product viewport matrix: none.
- Route has semantic landmark/heading order, readable status without CSS/hydration, no pointer dependency or motion, and no horizontal overflow at the Chromium default viewport.
- The smoke shell does not implement or establish product visual authority; later UI tasks use exact approved artifacts and `frontend-visual`.

## Failure and Edge Behavior

- Repository/remote/history mismatch, unexpected worktree state, failed GitHub auth/permission, or unavailable repository blocks before task branch or implementation.
- Runtime/package mismatch, nonexact dependency, missing/drifting lockfile, mutable action, excess permission, workflow secret, or required environment/provider access fails validation.
- Invalid annotation structure/current-task lifecycle, empty or placeholder tests, failed/absent/pending/skipped/cancelled/stale required check, wrong PR state, or SHA mismatch blocks candidate delivery.
- The authorized tasks-only closeout preserves reviews but requires latest-head CI; any other post-review change repeats affected proof and both reviews.
- Unavailable host protection requires recorded evidence and the procedural fallback; base advance requires non-force branch update and full redelivery.
- Missing task tag in squash subject, changed expected head, use of admin bypass, failed merge readback, or surviving remote branch blocks completion.

## Acceptance Criteria

1. Preflight proves `DevDoneDiff/cp` with `visibility: public` / `private: false`, HTTPS `origin`, tracked `main`, preserved baseline, bounded authoring handoff, successful GitHub auth/permission, autonomous modes, and no prohibited Git/history operation.
2. Exactly one approved bootstrap branch owns all foundation work; `$task-authoring` instantiates `[T-0001]` from this approved spec without separate task-set approval.
3. Machine files and lockfile prove every exact pin above, including TypeScript `6.0.3`, compatible exact Node 24/React 19 type packages, no TypeScript 7, no other product dependency, and frozen install success.
4. `pnpm validate` passes locally and in `CI / baseline`, proving format, lint, strict typecheck, candidate-clean annotations, security policy, meaningful unit/integration/component tests, and production build.
5. `pnpm test:smoke` performs exactly one build/start/wait/`GET /`/shutdown cycle and succeeds independently; `CI / browser-smoke` reuses its build for passing Chromium proof without a second build.
6. The accessible `/` route succeeds without product behavior/appearance, persistence, provider, credentials, environment values, network calls, empty layers, or unapproved dependencies.
7. Annotation and security validators, fixtures, candidate cleanup, source headers, `.env.example`, ignore rules, local docs, and Codex setup satisfy the stated contracts.
8. `.harness/validation.md` has no required `<unset>`, retains/removes the stated sets truthfully, enables CI, and contains executable PR/status/review/merge procedures.
9. Both exact CI checks pass for `REVIEWED_CONTENT_SHA`; content/security reviews are clean; the tasks-only closeout then makes both pass for `EXPECTED_HEAD_SHA`.
10. Available protections implement the approved policy or have documented capability evidence plus mandatory fallback; no force push, deletion, bypass, queue, signing requirement, incompatible approval, or non-squash path exists.
11. Autonomous merge runs only after every configured gate passes; guarded squash matches `EXPECTED_HEAD_SHA`, preserves the assigned tag in `main`, and post-merge ancestry, subject, and branch-deletion proof passes.
12. Architecture records replaceable Clerk email OTP through a project-owned port/adapter while foundation contains no Clerk SDK, UI, resource, credential, environment variable, call, or runtime behavior.

## Validation Expectations

- Assigned sets: `bootstrap-preflight`, `baseline`, `agent-review`, `frontend-component`, `frontend-e2e`, `security`, `security-review`, `smoke`; retained unassigned: `frontend-visual`.
- Required fixtures: positive/negative annotation and security-policy fixtures only; required browser state: `/` in Chromium with semantic content and no uncaught page error.
- Remote evidence: reviewed-content and closeout-head SHAs, both reviews, exact-name checks at both stages, protection/fallback evidence, and post-merge ancestry/subject/branch-deletion proof.

## Proposed Task Outcomes

1. One coherent repository-foundation bootstrap outcome establishes the pinned smoke shell, tooling, tests, annotation/security validation, documentation, CI, truthful validation registry, protections, review/closeout delivery, and tagged merge proof from the existing `main` baseline. The approved task is `[T-0001] Repository foundation`.

## Open Questions

- none
