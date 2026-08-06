/**
 * MODULE: scripts/validation/harness-task-authoring-transition.mjs
 * PURPOSE: Prove the one legal local active-queue append produced by non-task task authoring.
 * PUBLIC API / ENTRYPOINTS:
 *   - validateTaskAuthoringAppend: recognizes active-store growth and validates its exact append-only shape.
 * CONTROL_FLOW: preserve prior tasks, validate appended states and tag allocation, then prove exact counter-only prefix change.
 * INVARIANTS:
 *   - [INV-TASK-AUTHORING-APPEND] Authoring may append only queued Pass-false tasks with exact monotonic tag allocation.
 * BOUNDARIES:
 *   - Remote authoring exclusion, review, CI, and delivery remain procedural in .harness/validation.md.
 * RELATED:
 *   - scripts/validation/harness-task-transitions.mjs: dispatches unchanged-archive transitions.
 *   - scripts/validation/harness-task-stores.mjs: owns parsed store boundaries and counters.
 */

const COUNTERS = [
  ["T-", "NEXT_TASK_TAG"],
  ["R-", "NEXT_REFACTOR_TAG"],
];

function counter(prefix, name) {
  const matches = [
    ...prefix.matchAll(new RegExp("^- `" + name + "`: (\\d{4})$", "gm")),
  ];
  return matches.length === 1 ? Number(matches[0][1]) : undefined;
}

function replaceCounter(prefix, name, value) {
  return prefix.replace(
    new RegExp("^- `" + name + "`: \\d{4}$", "m"),
    `- \`${name}\`: ${String(value).padStart(4, "0")}`,
  );
}

export function validateTaskAuthoringAppend(current, base) {
  if (!base || current.active.blocks.length <= base.active.blocks.length) {
    return { recognized: false, errors: [] };
  }

  const errors = [];
  // @ah INV-TASK-AUTHORING-APPEND
  base.active.blocks.forEach((prior, index) => {
    if (current.active.blocks[index]?.raw !== prior.raw) {
      errors.push(
        ".harness/tasks.md: task-authoring append must preserve every existing active task byte-for-byte and in order",
      );
    }
  });
  if (base.active.blocks.some(({ fields }) => fields.Status === "working")) {
    errors.push(
      ".harness/tasks.md: task-authoring append cannot occur while an active task is working",
    );
  }

  const appended = current.active.blocks.slice(base.active.blocks.length);
  for (const block of appended) {
    if (block.fields.Status !== "queued" || block.fields.Pass !== "false") {
      errors.push(
        `.harness/tasks.md: [${block.tag}] task-authoring append requires Status: queued and Pass: false`,
      );
    }
  }

  let expectedPrefix = base.active.prefix;
  for (const [tagPrefix, counterName] of COUNTERS) {
    const priorCounter = counter(base.active.prefix, counterName);
    const currentCounter = counter(current.active.prefix, counterName);
    if (priorCounter === undefined || currentCounter === undefined) {
      errors.push(
        `.harness/tasks.md: task-authoring append requires one exact ${counterName} declaration`,
      );
      continue;
    }
    const category = appended.filter(({ tag }) => tag.startsWith(tagPrefix));
    category.forEach((block, index) => {
      const expectedTag = `${tagPrefix}${String(priorCounter + index).padStart(4, "0")}`;
      if (block.tag !== expectedTag) {
        errors.push(
          `.harness/tasks.md: task-authoring append expected [${expectedTag}] but found [${block.tag}]`,
        );
      }
    });
    const expectedCounter = priorCounter + category.length;
    if (currentCounter !== expectedCounter) {
      errors.push(
        `.harness/tasks.md: task-authoring append must advance ${counterName} exactly to ${String(expectedCounter).padStart(4, "0")}`,
      );
    }
    expectedPrefix = replaceCounter(
      expectedPrefix,
      counterName,
      currentCounter,
    );
  }

  if (current.active.prefix !== expectedPrefix) {
    errors.push(
      ".harness/tasks.md: task-authoring append may change only the exact applicable counters outside appended task blocks",
    );
  }
  return { recognized: true, errors: [...new Set(errors)].sort() };
}
