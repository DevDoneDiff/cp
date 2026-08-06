/**
 * ROLE: Validate dependency identity, uniqueness, existence, order, and acyclicity across implementation-task stores.
 * BOUNDARY: Remote completion satisfaction remains owned by .harness/validation.md.
 * RELATIONS: harness-task-schema.mjs validates dependency syntax; harness-task-transitions.mjs supplies parsed stores.
 * VALIDATION: tests/unit/harness-integrity.test.ts exercises dependency failures through store validation.
 */
import { duplicateValues } from "./harness-task-stores.mjs";

function dependencies(block) {
  if (block.fields.Depends_on === "none") return [];
  return [...(block.fields.Depends_on ?? "").matchAll(/\[([TR]-\d{4})\]/g)].map(
    (match) => match[1],
  );
}

export function validateTaskDependencyGraph(completed, active, errors) {
  const blocks = [...completed.blocks, ...active.blocks];
  const indexByTag = new Map(blocks.map((block, index) => [block.tag, index]));
  const edges = new Map();
  for (const [index, block] of blocks.entries()) {
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
          `task dependency graph: [${block.tag}] dependency [${dependency}] must precede it`,
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
    if (state.get(tag) === "visited") return;
    state.set(tag, "visiting");
    for (const dependency of edges.get(tag) ?? []) {
      if (edges.has(dependency)) visit(dependency);
    }
    state.set(tag, "visited");
  }
  for (const tag of edges.keys()) visit(tag);
}
