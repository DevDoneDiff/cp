/**
 * ROLE: Recognize a semantic append of queued implementation tasks and the matching monotonic counters.
 * BOUNDARY: Product-spec approval and authoring delivery remain owned by authoring procedures.
 * RELATIONS: harness-task-transitions.mjs dispatches unchanged-archive queue changes.
 * VALIDATION: tests/unit/harness-integrity.test.ts covers append-only authoring and counter failures.
 */
import { taskRecord } from "./harness-task-schema.mjs";

function counter(prefix, name) {
  return Number(
    prefix.match(new RegExp("^- `" + name + "`: (\\d{4})$", "m"))?.[1],
  );
}

function equal(left, right) {
  return JSON.stringify(taskRecord(left)) === JSON.stringify(taskRecord(right));
}

export function validateTaskAuthoringAppend(current, base) {
  if (!base || current.active.blocks.length <= base.active.blocks.length) {
    return { recognized: false, errors: [] };
  }
  const errors = [];
  base.active.blocks.forEach((prior, index) => {
    if (
      !current.active.blocks[index] ||
      !equal(prior, current.active.blocks[index])
    ) {
      errors.push(
        ".harness/tasks.md: task authoring must preserve existing active tasks semantically and in order",
      );
    }
  });
  if (base.active.blocks.some(({ fields }) => fields.Status === "working")) {
    errors.push(
      ".harness/tasks.md: task authoring cannot append while a task is working",
    );
  }
  const appended = current.active.blocks.slice(base.active.blocks.length);
  for (const block of appended) {
    if (block.fields.Status !== "queued" || block.fields.Pass !== "false") {
      errors.push(
        `.harness/tasks.md: [${block.tag}] authored task must be queued with Pass: false`,
      );
    }
  }
  for (const [tagPrefix, name] of [
    ["T-", "NEXT_TASK_TAG"],
    ["R-", "NEXT_REFACTOR_TAG"],
  ]) {
    const prior = counter(base.active.prefix, name);
    const next = counter(current.active.prefix, name);
    const allocated = appended.filter(({ tag }) => tag.startsWith(tagPrefix));
    if (
      !Number.isInteger(prior) ||
      !Number.isInteger(next) ||
      next !== prior + allocated.length
    ) {
      errors.push(
        `.harness/tasks.md: task authoring must advance ${name} by its appended task count`,
      );
      continue;
    }
    allocated.forEach((block, index) => {
      const expected = `${tagPrefix}${String(prior + index).padStart(4, "0")}`;
      if (block.tag !== expected) {
        errors.push(
          `.harness/tasks.md: task authoring expected [${expected}] but found [${block.tag}]`,
        );
      }
    });
  }
  return { recognized: true, errors: [...new Set(errors)].sort() };
}
