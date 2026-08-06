/**
 * ROLE: Validate current implementation-task stores and one generic semantic lifecycle transition from a local Git base.
 * BOUNDARY: Remote claim, CI, merge, and cleanup truth remain owned by .harness/validation.md.
 * RELATIONS: Task-store parsing, task meaning, dependency graph, and validation registry are delegated to focused modules.
 * VALIDATION: tests/unit/harness-integrity.test.ts covers claim, authoring, closeout, reversal, and archive mutation.
 */
import {
  taskListItems,
  taskRecord,
  validateStableTaskIdentities,
  validateTaskStoreShape,
} from "./harness-task-schema.mjs";
import { validateTaskAuthoringAppend } from "./harness-task-authoring-transition.mjs";
import { validateTaskDependencyGraph } from "./harness-task-graph.mjs";
import {
  duplicateValues,
  parseTaskStore,
  validateTaskCounters,
} from "./harness-task-stores.mjs";
import { parseValidationRegistry } from "./harness-validation-registry.mjs";

function record(block, ignored = []) {
  const result = taskRecord(block);
  for (const field of ignored) delete result.fields[field];
  return result;
}

function equal(left, right, ignored = []) {
  return (
    JSON.stringify(record(left, ignored)) ===
    JSON.stringify(record(right, ignored))
  );
}

function equalBlocks(left, right) {
  return (
    left.length === right.length &&
    left.every((block, index) => equal(block, right[index]))
  );
}

function provisionalSource(base) {
  const working = base.active.blocks.filter(
    ({ fields }) => fields.Status === "working" && fields.Pass === "false",
  );
  return working.length === 1 ? working[0] : undefined;
}

function validateActiveChange(current, base, errors) {
  const authored = validateTaskAuthoringAppend(current, base);
  if (authored.recognized) {
    errors.push(...authored.errors);
    return;
  }
  if (
    current.active.blocks.map(({ tag }) => tag).join(",") !==
    base.active.blocks.map(({ tag }) => tag).join(",")
  ) {
    errors.push(
      ".harness/tasks.md: active task membership or order changed outside closeout or authoring",
    );
    return;
  }
  const changed = current.active.blocks
    .map((block, index) => ({ block, prior: base.active.blocks[index] }))
    .filter(({ block, prior }) => !equal(block, prior));
  if (changed.length > 1) {
    errors.push(
      ".harness/tasks.md: more than one active task changed in one transition",
    );
    return;
  }
  if (!changed.length) return;
  const { block, prior } = changed[0];
  const transition = `${prior.fields.Status}->${block.fields.Status}`;
  const allowed = new Set([
    "queued->working",
    "queued->blocked",
    "working->working",
    "working->blocked",
    "blocked->working",
    "blocked->queued",
  ]);
  if (!allowed.has(transition)) {
    errors.push(
      `.harness/tasks.md: [${block.tag}] illegal active transition ${transition}`,
    );
    return;
  }
  const ignored =
    transition === "working->working"
      ? ["Expected_surfaces"]
      : ["Status", "Blocker"];
  if (!equal(block, prior, ignored)) {
    errors.push(
      `.harness/tasks.md: [${block.tag}] changed meaning outside ${transition}`,
    );
  }
  if (transition === "working->working") {
    const before = taskListItems(prior, "Expected_surfaces").items;
    const after = taskListItems(block, "Expected_surfaces").items;
    if (
      after.length < before.length ||
      before.some((item, index) => after[index] !== item)
    ) {
      errors.push(
        `.harness/tasks.md: [${block.tag}] Expected_surfaces may only expand while working`,
      );
    }
  }
}

function archivePrefixUnchanged(current, base, errors) {
  if (
    current.completed.blocks.length < base.completed.blocks.length ||
    !base.completed.blocks.every((block, index) =>
      equal(block, current.completed.blocks[index]),
    )
  ) {
    errors.push(
      ".harness/completed.md: existing completed task meaning or order changed",
    );
    return false;
  }
  return true;
}

function validateCloseout(current, base, sourceStatus, errors) {
  if (!archivePrefixUnchanged(current, base, errors)) return;
  if (current.completed.blocks.length !== base.completed.blocks.length + 1) {
    errors.push(".harness/completed.md: closeout must append exactly one task");
    return;
  }
  const archived = current.completed.blocks.at(-1);
  const source = base.active.blocks.find(({ tag }) => tag === archived?.tag);
  if (
    !source ||
    source.fields.Status !== sourceStatus ||
    source.fields.Pass !== "false"
  ) {
    errors.push(
      `.harness/completed.md: closeout requires one ${sourceStatus} Pass-false source task`,
    );
    return;
  }
  if (
    archived.fields.Status !== "passed" ||
    archived.fields.Pass !== "true" ||
    !equal(archived, source, ["Status", "Pass"])
  ) {
    errors.push(
      `.harness/completed.md: [${source.tag}] closeout may change only Status and Pass`,
    );
  }
  const remaining = base.active.blocks.filter(({ tag }) => tag !== source.tag);
  if (!equalBlocks(current.active.blocks, remaining)) {
    errors.push(
      `.harness/tasks.md: [${source.tag}] closeout must preserve every remaining active task`,
    );
  }
}

function validateReversal(current, baseParent, errors) {
  if (!baseParent) {
    errors.push("task-store reversal requires the pre-closeout parent stores");
    return;
  }
  if (
    !equalBlocks(current.active.blocks, baseParent.active.blocks) ||
    !equalBlocks(current.completed.blocks, baseParent.completed.blocks)
  ) {
    errors.push(
      "task-store reversal must restore the pre-closeout semantic state",
    );
  }
}

function validateTransition(
  current,
  base,
  baseParent,
  allowMergedCloseout,
  errors,
) {
  if (!base) return;
  if (equalBlocks(current.completed.blocks, base.completed.blocks)) {
    validateActiveChange(current, base, errors);
    return;
  }
  if (current.completed.blocks.length === base.completed.blocks.length + 1) {
    validateCloseout(
      current,
      base,
      allowMergedCloseout ? "queued" : "working",
      errors,
    );
    return;
  }
  if (base.completed.blocks.length === current.completed.blocks.length + 1) {
    validateReversal(current, baseParent, errors);
    return;
  }
  errors.push(
    ".harness/completed.md: transition is not one generic closeout or reversal",
  );
}

function parseAndValidate(
  activeText,
  completedText,
  label,
  assignable,
  errors,
) {
  const active = parseTaskStore(activeText, "active");
  const completed = parseTaskStore(completedText, "completed");
  validateTaskStoreShape(
    active,
    "active",
    `${label}.harness/tasks.md`,
    assignable,
    errors,
  );
  validateTaskStoreShape(
    completed,
    "completed",
    `${label}.harness/completed.md`,
    assignable,
    errors,
  );
  return { active, completed };
}

export function validateHarnessStores({
  activeText,
  completedText,
  baseActiveText,
  baseCompletedText,
  baseParentActiveText,
  baseParentCompletedText,
  allowMergedCloseout = false,
  validationText = "",
}) {
  const errors = [];
  const registry = parseValidationRegistry(validationText);
  errors.push(...registry.errors);
  const current = parseAndValidate(
    activeText,
    completedText,
    "",
    registry.assignable,
    errors,
  );
  validateTaskDependencyGraph(current.completed, current.active, errors);
  const all = [...current.completed.blocks, ...current.active.blocks];
  for (const duplicate of duplicateValues(all.map(({ tag }) => tag))) {
    errors.push(`task identity: [${duplicate}] appears more than once`);
  }

  let base;
  if (baseActiveText !== undefined && baseCompletedText !== undefined) {
    base = parseAndValidate(
      baseActiveText,
      baseCompletedText,
      "base:",
      registry.assignable,
      errors,
    );
    validateStableTaskIdentities(
      [...base.completed.blocks, ...base.active.blocks],
      all,
      errors,
    );
  }
  let baseParent;
  if (
    baseParentActiveText !== undefined &&
    baseParentCompletedText !== undefined
  ) {
    baseParent = parseAndValidate(
      baseParentActiveText,
      baseParentCompletedText,
      "base-parent:",
      registry.assignable,
      errors,
    );
  }
  validateTaskCounters(
    activeText,
    all,
    baseActiveText,
    base ? [...base.completed.blocks, ...base.active.blocks] : [],
    errors,
  );
  validateTransition(current, base, baseParent, allowMergedCloseout, errors);
  return {
    errors: [...new Set(errors)].sort(),
    active: current.active,
    completed: current.completed,
    base,
    baseParent,
  };
}
