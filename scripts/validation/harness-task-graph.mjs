/**
 * MODULE: scripts/validation/harness-task-graph.mjs
 * PURPOSE: Validate dependency identity, uniqueness, canonical order, and acyclicity across both task stores.
 * PUBLIC API / ENTRYPOINTS:
 *   - validateTaskDependencyGraph: validates forward-task dependency edges against completed-then-active order.
 * CONTROL_FLOW: index canonical identities, validate every forward edge, then traverse the graph for cycles.
 * INVARIANTS:
 *   - [INV-TASK-DEPENDENCY-GRAPH] Every forward dependency is unique, exists, and points backward in canonical store order.
 * BOUNDARIES:
 *   - Remote completion satisfaction remains owned by .harness/validation.md; this module proves only local graph structure.
 * RELATED:
 *   - scripts/validation/harness-task-schema.mjs: owns Depends_on field grammar.
 *   - scripts/validation/harness-task-transitions.mjs: supplies parsed active and completed stores.
 */

import { duplicateValues, isSeedTaskTag } from "./harness-task-stores.mjs";

function dependencies(block) {
  if (block.fields.Depends_on === "none") {
    return [];
  }
  return [...(block.fields.Depends_on ?? "").matchAll(/\[([TR]-\d{4})\]/g)].map(
    (match) => match[1],
  );
}

export function validateTaskDependencyGraph(completed, active, errors) {
  // @ah INV-TASK-DEPENDENCY-GRAPH
  const blocks = [...completed.blocks, ...active.blocks];
  const indexByTag = new Map(blocks.map((block, index) => [block.tag, index]));
  const edges = new Map();

  for (const [index, block] of blocks.entries()) {
    if (isSeedTaskTag(block.tag)) {
      continue;
    }
    const declared = dependencies(block);
    edges.set(block.tag, declared);
    for (const duplicate of duplicateValues(declared)) {
      errors.push(
        `task dependency graph: [${block.tag}] repeats dependency [${duplicate}]`,
      );
    }
    for (const dependency of declared) {
      const dependencyIndex = indexByTag.get(dependency);
      if (dependencyIndex === undefined) {
        errors.push(
          `task dependency graph: [${block.tag}] depends on missing [${dependency}]`,
        );
      } else if (dependencyIndex >= index) {
        errors.push(
          `task dependency graph: [${block.tag}] dependency [${dependency}] must precede it in completed-then-active order`,
        );
      }
    }
  }

  const state = new Map();
  function visit(tag) {
    if (state.get(tag) === "visiting") {
      errors.push(`task dependency graph: cycle detected at [${tag}]`);
      return;
    }
    if (state.get(tag) === "visited") {
      return;
    }
    state.set(tag, "visiting");
    for (const dependency of edges.get(tag) ?? []) {
      if (edges.has(dependency)) {
        visit(dependency);
      }
    }
    state.set(tag, "visited");
  }
  for (const tag of edges.keys()) {
    visit(tag);
  }
}
