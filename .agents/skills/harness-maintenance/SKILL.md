---
name: harness-maintenance
description: Explicitly invoke to construct, repair, simplify, or modify this repository's harness. Use only for harness and repository-governance maintenance. Operate as a local control-plane procedure that is separate from the product code implementation lifecycle.
---

# Harness Maintenance

## Purpose

Construct, repair, simplify, or modify repository harness files under explicit user authority.

Use this skill only when the user explicitly invokes it for harness or repository-governance maintenance.

Treat the invoking prompt's `## USER OBJECTIVES` and stated boundaries as the governing authority for the requested work.

Harness maintenance is control-plane work. Product implementation is implementation-plane work. Do not mix the two.

## Maintenance Boundary

MUST NOT:

- create or manage product tasks, implementation specs, implementation scratchpads, task status, `Pass` state, or product task identities;
- invoke the product code implementation or delivery lifecycle;
- create or switch branches, commit, push, create or update pull requests, invoke CI, merge, close out, or perform delivery cleanup as part of ordinary harness maintenance;
- mutate remote Git or GitHub state;
- perform independent review or delivery procedures;
- create durable task-specific, migration-specific, recovery-specific, authorization-specific, or compatibility machinery whose purpose is to authorize or complete the maintenance session;
- modify runtime product code.

MAY:

- edit, remove, or create durable harness components, including harness documentation, skills, validators, tests, scripts, repository-governance rules, and directly related configuration;
- create disposable local diagnostic or one-off scripts only inside the designated gitignored temporary harness workspace;
- update or add a focused harness test when directly required to prove changed harness behavior;
- perform local Git history rewriting only when the `## USER OBJECTIVES` explicitly authorize it.

Explicit authorization for local Git history rewriting does not authorize remote Git or GitHub mutation.

## Persistence

Harness-maintenance changes remain local working-tree state.

Do not independently commit, push, deliver, or open a pull request for harness-maintenance changes.

Preserve unrelated local work.

A later normal product code implementation may include existing harness-maintenance changes in its ordinary commit and delivery. That does not create or require a separate harness task, spec, review, validation lifecycle, or delivery procedure.

## Procedure

Execute sequentially:

1. Identify the exact harness surfaces required by the `## USER OBJECTIVES`.
   - Inspect repository status only as needed to preserve unrelated work.

2. Grep the files of interest and only the direct inbound and outbound references needed to understand or safely modify them.
   - Do not recursively broaden discovery.

3. Reason from the user's objective, current harness conventions, and directly inspected evidence.
   - Determine the smallest coherent change that fully satisfies the requested outcome.
   - Use best engineering judgment rather than mechanically reproducing the user's wording.

4. Edit only the required harness surfaces.
   - Fix in-scope discrepancies when necessary for a coherent result.
   - Preserve unrelated content and changes.
   - Report out-of-scope discrepancies without fixing them.

5. Run only focused checks that directly exercise the changed harness behavior.
   - Prefer existing focused checks.
   - Update or add one focused harness test only when the changed behavior otherwise lacks meaningful proof.
   - If a focused check fails, correct only the directly implicated harness surfaces and rerun that check.
   - Do not escalate a focused failure into a broad audit, full product validation run, independent review, or new validation subsystem.
   - If the failure cannot be resolved within the requested scope, report it and stop.

6. Report the exact files changed, focused checks run, and unresolved out-of-scope discrepancies, then stop.

## Guardrails

- Keep discovery proportional to the requested harness change.
- Follow a direct reference only when necessary to understand or safely modify an in-scope surface.
- A discovered reference does not automatically become editable scope.
- Do not turn maintenance into a broader harness redesign unless the `## USER OBJECTIVES` request that redesign.
- Temporary external service failure never authorizes a harness change, recovery validator, compatibility bridge, or permanent exception.
- Stop only when completing the requested work would require runtime product-code modification or a user decision that cannot be resolved from the stated objective and directly inspected evidence.

## Final Rule

Explicit invocation grants bounded authority to reason about and maintain the requested harness surfaces.

Use that intelligence inside the requested scope.

Do not use it to create adjacent process.

Make the coherent change, verify it narrowly, report it, and stop.