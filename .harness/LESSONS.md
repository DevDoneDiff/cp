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

No lessons yet.