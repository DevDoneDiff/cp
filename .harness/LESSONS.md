# Project Lessons

## Purpose

Durable, evidence-backed technical lessons learned during implementation.

Task-local exploration and failed attempts remain in `.harness/work/<TAG>.md`.
Promote a lesson here only when it is likely to affect future tasks.

## Promotion Rules

A lesson belongs here only when all are true:

- the finding is supported by executable evidence;
- the failed approach or constraint is likely to recur;
- the lesson changes future implementation, debugging, validation, or integration behavior;
- the lesson is not already sufficiently enforced by code, tests, architecture, or another authoritative document.

Do not record:

- one-off syntax mistakes;
- transient tool failures;
- speculative conclusions;
- secrets or sensitive data;
- full debugging transcripts;
- completed-task summaries.

When possible, convert recurring lessons into tests, validation, annotations, or a narrow `AGENTS.md` rule.

## Entry Template

### [L-0001] <concise title>

Scope:
- <module, provider, tool, workflow, or system boundary>

Trigger:
- <when a future agent should use this lesson>

Failed approach:
- <what appeared reasonable but failed>

Evidence:
- <test, error, runtime behavior, review finding, or reproducible result>

Durable rule:
- <what future work should do>

Source task:
- [T-####]

Status:
- active | superseded by <reference>

## Active Lessons

### [L-0001] Preserve exact delivery state during a GitHub Actions queue incident

Scope:
- GitHub Actions exact-head CI and guarded task delivery.

Trigger:
- A required exact-head run is absent while a superseded run remains queued, or GitHub cancellation endpoints return server errors without applying the requested state change.

Failed approach:
- On 2026-08-06T11:31:41.2975921-07:00, normal cancellation and force-cancellation of superseded run 31125644078 each used their initial attempt and one retry; all four calls returned HTTP 502 while authenticated readback repeatedly proved the run remained queued with both jobs unstarted.

Evidence:
- PR #12 remained open at reviewed head `04bac018d911d4d08c49e755ae1120a80a52fccc`; the only visible workflow run remained bound to superseded head `a8727c6fc82bf880da7b81ff2e7ea9e5c1747045`, and no current-head check could be substituted. Exact close/reopen readback preserved the PR identity but did not produce a visible current-head run before the explicit user override.

Durable rule:
- Preserve the exact task, branch, PR, and review identities; never accept a stale run or repeat an exhausted remote mutation. Continue without required CI only under an explicit user override that is recorded in the task scratchpad and pull-request evidence.

Source task:
- [T-0040]

Status:
- active
