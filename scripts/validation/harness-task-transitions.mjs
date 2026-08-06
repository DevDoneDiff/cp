/**
 * MODULE: scripts/validation/harness-task-transitions.mjs
 * PURPOSE: Prove cross-store identity and the only legal local active/archive transitions.
 * PUBLIC API / ENTRYPOINTS: validateHarnessStores.
 * CONTROL_FLOW: parse generations, reject identity drift, then prove one legal transition.
 * INVARIANTS:
 *   - [INV-HARNESS-TRANSFER] Archive changes are limited to one full-store provisional transfer or exact reversal.
 *   - One exact H1 checkpoint may use the separately bounded batch-merge compatibility proof.
 * BOUNDARIES:
 *   - Remote completion and dependency proof are deliberately excluded from this local structural validator.
 * RELATED: task stores, task schema, the H1 batch-transition compatibility owner, and .harness/validation.md lifecycle procedures.
 * SECURITY:
 *   - A changed archive fails closed unless the complete local transition shape is proven exactly.
 */
import {
  validateStableTaskIdentities,
  validateTaskStoreShape,
} from "./harness-task-schema.mjs";
import {
  isAuthorizedH1BatchBaseRevision,
  isAuthorizedH1AuthorityUpdate,
  validateAuthorizedH1BatchMerge,
} from "./harness-h1-batch-transition.mjs";
import {
  duplicateValues,
  parseTaskStore,
  renderTaskStore,
  validateArchiveProvenance,
  validateSeedArchive,
  validateTaskCounters,
} from "./harness-task-stores.mjs";
import {
  expectedProvisional,
  matchesExpectedSurfaceExpansion,
  passedTaskBlock,
  replaceTaskField,
} from "./harness-task-transforms.mjs";

function provisionalSource(prior) {
  const working = prior.active.blocks.filter(
    ({ fields }) => fields.Status === "working" && fields.Pass === "false",
  );
  return working.length === 1 ? working[0] : undefined;
}

function matchesExactProvisional(current, prior) {
  const source = provisionalSource(prior);
  if (!source) {
    return false;
  }
  const expected = expectedProvisional(prior, source);
  return (
    current.active.normalized === expected.activeText &&
    current.completed.normalized === expected.completedText
  );
}

function validateUnchangedArchive(current, base, errors) {
  if (current.active.prefix !== base.active.prefix) {
    errors.push(
      ".harness/tasks.md: non-task queue content changed during a task transition",
    );
  }
  const currentTags = current.active.blocks.map(({ tag }) => tag);
  const baseTags = base.active.blocks.map(({ tag }) => tag);
  if (currentTags.join("\n") !== baseTags.join("\n")) {
    errors.push(
      ".harness/tasks.md: active task membership or order changed without an exact provisional closeout",
    );
    return;
  }

  const changes = current.active.blocks
    .map((block, index) => ({ block, prior: base.active.blocks[index] }))
    .filter(({ block, prior }) => block.raw !== prior.raw);
  if (changes.length > 1) {
    errors.push(
      ".harness/tasks.md: more than one active task changed in one transition",
    );
    return;
  }
  if (changes.length === 0) {
    return;
  }
  const [{ block, prior }] = changes;
  const transition = `${prior.fields.Status}->${block.fields.Status}`;
  if (transition === "working->working") {
    if (!matchesExpectedSurfaceExpansion(prior, block)) {
      errors.push(
        `.harness/tasks.md: [${block.tag}] working task may change only by append-only Expected_surfaces expansion`,
      );
    }
    return;
  }
  const allowed = new Set([
    "queued->working",
    "queued->blocked",
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
  let expected = replaceTaskField(prior.raw, "Status", block.fields.Status);
  if (block.fields.Status === "blocked") {
    expected = replaceTaskField(expected, "Blocker", block.fields.Blocker);
  } else if (prior.fields.Status === "blocked") {
    expected = replaceTaskField(expected, "Blocker", "none");
  }
  if (block.raw !== expected) {
    errors.push(
      `.harness/tasks.md: [${block.tag}] changed fields outside the exact ${transition} state transition`,
    );
  }
}

function validateProvisional(current, base, errors) {
  const source = provisionalSource(base);
  if (!source) {
    errors.push(
      ".harness/completed.md: provisional closeout requires exactly one working Pass-false source task",
    );
    return;
  }
  const expected = expectedProvisional(base, source);
  if (current.active.normalized !== expected.activeText) {
    errors.push(
      `.harness/tasks.md: [${source.tag}] provisional closeout did not preserve the complete remaining active store`,
    );
  }
  if (current.completed.normalized !== expected.completedText) {
    errors.push(
      `.harness/completed.md: [${source.tag}] provisional transfer is not an exact full-store append`,
    );
  }
}

function validateMergedCloseout(current, base, errors) {
  const appended = current.completed.blocks.at(-1);
  const source = base.active.blocks.find(({ tag }) => tag === appended?.tag);
  if (
    !source ||
    source.fields.Status !== "queued" ||
    source.fields.Pass !== "false"
  ) {
    errors.push(
      ".harness/completed.md: squash-merged closeout must represent exactly one queued source task",
    );
    return;
  }
  const expectedActive = renderTaskStore(
    base.active,
    base.active.blocks.filter(({ tag }) => tag !== source.tag),
  );
  const archived = { ...source, raw: passedTaskBlock(source.raw) };
  const expectedCompleted = renderTaskStore(base.completed, [
    ...base.completed.blocks,
    archived,
  ]);
  if (
    current.active.normalized !== expectedActive ||
    current.completed.normalized !== expectedCompleted
  ) {
    errors.push(
      `.harness/completed.md: [${source.tag}] squash-merged closeout did not preserve both complete stores`,
    );
  }
}

function validateReversal(current, base, baseParent, errors) {
  if (!baseParent) {
    errors.push(
      ".harness/completed.md: reversal requires the exact pre-closeout parent snapshot",
    );
    return;
  }
  if (!matchesExactProvisional(base, baseParent)) {
    errors.push(
      ".harness/completed.md: reversal base is not the exact provisional transform of its parent",
    );
    return;
  }
  if (
    current.active.normalized !== baseParent.active.normalized ||
    current.completed.normalized !== baseParent.completed.normalized
  ) {
    errors.push(
      ".harness/completed.md: reversal must restore both task stores byte-for-byte from the pre-closeout parent",
    );
  }
}

function reportArchiveDrift(currentArchive, baseArchive, errors) {
  const shared = Math.min(currentArchive.length, baseArchive.length);
  const changedIndex = Array.from({ length: shared }).findIndex(
    (_, index) => currentArchive[index].raw !== baseArchive[index].raw,
  );
  if (changedIndex < 0) {
    errors.push(
      ".harness/completed.md: archive changed by more than one provisional transfer or reversal",
    );
    return;
  }
  const currentTag = currentArchive[changedIndex].tag;
  const baseTag = baseArchive[changedIndex].tag;
  errors.push(
    currentTag === baseTag
      ? `.harness/completed.md: archived block [${currentTag}] was mutated`
      : `.harness/completed.md: archive order changed at ${baseTag} -> ${currentTag}`,
  );
}

function validateArchiveTransition(
  current,
  base,
  baseParent,
  allowMergedCloseout,
  mergedBaseRevision,
  errors,
) {
  if (!base) {
    return;
  }
  if (isAuthorizedH1AuthorityUpdate(current, base)) {
    return;
  }
  // @ah INV-HARNESS-TRANSFER
  if (current.completed.normalized === base.completed.normalized) {
    validateUnchangedArchive(current, base, errors);
    return;
  }
  if (allowMergedCloseout) {
    const h1Batch = validateAuthorizedH1BatchMerge({
      current,
      base,
      baseRevision: mergedBaseRevision,
    });
    if (h1Batch.recognized) {
      errors.push(...h1Batch.errors);
      return;
    }
  }
  if (current.completed.blocks.length === base.completed.blocks.length + 1) {
    if (allowMergedCloseout) {
      validateMergedCloseout(current, base, errors);
    } else {
      validateProvisional(current, base, errors);
    }
    return;
  }
  if (base.completed.blocks.length === current.completed.blocks.length + 1) {
    validateReversal(current, base, baseParent, errors);
    return;
  }
  reportArchiveDrift(current.completed.blocks, base.completed.blocks, errors);
}

function parseAndValidate(
  activeText,
  completedText,
  label,
  errors,
  { allowHistoricalSeedProvenance = false } = {},
) {
  const active = parseTaskStore(activeText, "active");
  const completed = parseTaskStore(completedText, "completed");
  validateTaskStoreShape(active, "active", `${label}.harness/tasks.md`, errors);
  validateTaskStoreShape(
    completed,
    "completed",
    `${label}.harness/completed.md`,
    errors,
  );
  if (!allowHistoricalSeedProvenance) {
    validateArchiveProvenance(
      completedText,
      errors,
      `${label}.harness/completed.md`,
    );
  }
  validateSeedArchive(completedText, errors, `${label}.harness/completed.md`);
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
  mergedBaseRevision,
}) {
  const errors = [];
  const current = parseAndValidate(activeText, completedText, "", errors);
  const all = [...current.active.blocks, ...current.completed.blocks];
  for (const duplicate of duplicateValues(all.map(({ tag }) => tag))) {
    errors.push(
      `task identity: [${duplicate}] appears in both task stores or more than once`,
    );
  }
  for (const duplicate of duplicateValues(
    all.map(({ fields }) => fields.Brick_id).filter(Boolean),
  )) {
    errors.push(`task identity: duplicate Brick_id ${duplicate}`);
  }

  let base;
  if (baseActiveText !== undefined && baseCompletedText !== undefined) {
    base = parseAndValidate(
      baseActiveText,
      baseCompletedText,
      "base:",
      errors,
      {
        allowHistoricalSeedProvenance:
          allowMergedCloseout &&
          isAuthorizedH1BatchBaseRevision(mergedBaseRevision),
      },
    );
    validateStableTaskIdentities(
      [...base.active.blocks, ...base.completed.blocks],
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
      errors,
    );
  }

  validateTaskCounters(
    activeText,
    all,
    baseActiveText,
    base ? [...base.active.blocks, ...base.completed.blocks] : [],
    errors,
  );
  validateArchiveTransition(
    current,
    base,
    baseParent,
    allowMergedCloseout,
    mergedBaseRevision,
    errors,
  );

  return {
    errors: [...new Set(errors)].sort(),
    active: current.active,
    completed: current.completed,
    base,
    baseParent,
  };
}
