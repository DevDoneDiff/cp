---
name: annotation-headers
description: Use when creating or materially changing meaningful source files whose non-obvious architectural role, boundary, relations, or focused validation would otherwise require costly repository rediscovery.
---

# Annotation Headers

## Purpose

Annotations are context compression. A useful header lets a future reader modify an unfamiliar file safely with less repository reading than the header costs.

Code and durable project documents remain authoritative. Remove or correct an annotation when implementation contradicts it.

## Coverage

Use a header for meaningful entrypoints, orchestrators, domain/state owners, persistence or trust boundaries, adapters, providers, events, queues, and major UI workflows when their architectural responsibility is not cheaply discoverable from path, exports, signatures, and a brief code read.

Skip generated, vendor, fixture, mock, migration-output, styling-only, barrel, constant-only, tiny wrapper, and obvious helper files.

## Minimal Contract

- `ROLE` — required for a new or materially changed annotated file; one concise statement of primary responsibility.
- `BOUNDARY` — optional; only non-obvious ownership, invariants, or responsibilities the file deliberately does not own.
- `RELATIONS` — optional; only non-obvious architectural relationships that materially affect safe modification.
- `VALIDATION` — optional; only non-obvious focused proof relevant to this file.

Field order and exact wording are not significant. Omit inapplicable fields and keep entries file-specific and terse.

Existing accurate legacy headers may remain until their file is materially changed. This avoids mass rewrites; it does not make legacy metadata the preferred contract.

## Exclusions

Do not record imports/exports visible in code, grep-discoverable callers, ordinary outbound references, Git history, task IDs, task links, dates, agents, timestamps, TODOs, closeout state, line counts, generic surface inventories, or verbose walkthroughs.

Do not use annotation fields as implementation authorization or completion proof.

## Sparse Anchors

Optional `@ah` anchors are for genuinely distributed, security-sensitive, compatibility-sensitive, or non-obvious invariants. Declare and mark each stable semantic ID once. Do not anchor ordinary functions or require anchors merely to make a header look complete.

## Workflow

1. Read the implementation before trusting or changing the header.
2. Add or update only context that is both non-obvious and operationally useful.
3. Reconcile the final annotation with code and focused tests.
4. Run the existing structural annotation check; it proves syntax and anchor pairing, not semantic truth.

## Example

```text
/**
 * ROLE: Select and run the local validation stages assigned to a stable implementation candidate.
 * BOUNDARY: Remote CI and merge state are owned by the delivery procedure.
 * RELATIONS: package.json exposes the stages used here.
 * VALIDATION: tests/unit/validation-runner.test.ts exercises ordering and failure propagation.
 */
```
