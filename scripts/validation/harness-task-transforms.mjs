/**
 * MODULE: scripts/validation/harness-task-transforms.mjs
 * PURPOSE: Render the exact task transforms shared by active-state, provisional, merged, and H1 batch proof.
 * PUBLIC API / ENTRYPOINTS:
 *   - replaceTaskField: changes one canonical scalar field.
 *   - replaceTaskList: changes one canonical structured list body.
 *   - matchesExpectedSurfaceExpansion: proves one append-only Expected_surfaces expansion with no other delta.
 *   - passedTaskBlock: applies only the canonical Status and Pass closeout delta.
 *   - expectedProvisional: renders one exact working-task transfer across both stores.
 * INVARIANTS:
 *   - A passed transform changes no task content outside Status and Pass.
 * BOUNDARIES:
 *   - Transition eligibility, revision compatibility, and diagnostics remain with their dedicated validators.
 * RELATED:
 *   - scripts/validation/harness-task-stores.mjs: owns exact full-store rendering.
 */
import { renderTaskStore } from "./harness-task-stores.mjs";
import { taskListItems } from "./harness-task-schema.mjs";

export function replaceTaskField(block, field, value) {
  return block.replace(
    new RegExp(`^${field}: .*?$`, "m"),
    `${field}: ${value}`,
  );
}

export function replaceTaskList(block, field, nextField, items) {
  const marker = `${field}:\n`;
  const start = block.indexOf(marker);
  const bodyStart = start + marker.length;
  const end = block.indexOf(`\n${nextField}:`, bodyStart);
  if (start < 0 || end < 0) {
    return block;
  }
  return `${block.slice(0, bodyStart)}${items.map((item) => `- ${item}`).join("\n")}${block.slice(end)}`;
}

export function matchesExpectedSurfaceExpansion(prior, current) {
  const before = taskListItems(prior, "Expected_surfaces").items;
  const after = taskListItems(current, "Expected_surfaces").items;
  return (
    after.length > before.length &&
    before.every((item, index) => after[index] === item) &&
    current.raw ===
      replaceTaskList(
        prior.raw,
        "Expected_surfaces",
        "Reference_artifacts",
        after,
      )
  );
}

export function passedTaskBlock(activeBlock) {
  return replaceTaskField(
    replaceTaskField(activeBlock, "Status", "passed"),
    "Pass",
    "true",
  );
}

export function expectedProvisional(prior, source) {
  const remaining = prior.active.blocks.filter(({ tag }) => tag !== source.tag);
  const archived = { ...source, raw: passedTaskBlock(source.raw) };
  return {
    activeText: renderTaskStore(prior.active, remaining),
    completedText: renderTaskStore(prior.completed, [
      ...prior.completed.blocks,
      archived,
    ]),
  };
}
