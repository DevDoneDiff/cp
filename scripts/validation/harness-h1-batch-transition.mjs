/**
 * MODULE: scripts/validation/harness-h1-batch-transition.mjs
 * PURPOSE: Recognize and prove the one authorized H1 T-0008 through T-0039 batch squash onto its exact checkpoint.
 * PUBLIC API / ENTRYPOINTS:
 *   - isAuthorizedH1BatchBaseRevision: identifies the single historical parent whose pre-H1 provenance is compatible.
 *   - validateAuthorizedH1BatchMerge: returns whether the exact checkpoint applies and any exact-transform errors.
 * CONTROL_FLOW:
 *   1. Bind the candidate base to the authorized Git revision and exact H1 queue identity.
 *   2. Render the only accepted all-task active/archive transform.
 *   3. Compare both complete stores byte-for-byte after newline normalization.
 * INVARIANTS:
 *   - [INV-H1-BATCH-ONLY] No revision, tag range, source identity, state, or archive other than the authorized H1 lane is recognized.
 * BOUNDARIES:
 *   - Ordinary future closeout, reversal, and single-task squash rules remain owned by harness-task-transitions.mjs.
 * RELATED:
 *   - .harness/validation.md: records why the one-time compatibility lane exists.
 *   - scripts/validation/harness-task-stores.mjs: owns parsed stores and exact rendering.
 * SECURITY:
 *   - Recognition requires the cryptographic parent revision and exact complete base-store identities before any multi-transfer is considered.
 */
import { createHash } from "node:crypto";

import { taskListItems } from "./harness-task-schema.mjs";
import { SEED_TAGS, renderTaskStore } from "./harness-task-stores.mjs";
import {
  passedTaskBlock,
  replaceTaskList,
} from "./harness-task-transforms.mjs";

const H1_BATCH_BASE_REVISION = "5d515d9f8224ed607219fd5f29d0f20305fdcc16";
const H1_SOURCE_PATH =
  "docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md";
const H1_FINAL_ACTIVE_PREFIX_HASH =
  "2d97952cb2db78b0e68505ad1e87def7b422436d93450142bf4b32fc24956beb";
const H1_FINAL_COMPLETED_PREFIX_HASH =
  "a704dea32af29cfc72078fb8cb2fe2e65ad5584fafef4fcb860e2df7e08409c9";
const H1_BATCH_TAGS = Array.from(
  { length: 32 },
  (_, index) => `T-${String(index + 8).padStart(4, "0")}`,
);

function exactTags(blocks, expected) {
  return blocks.map(({ tag }) => tag).join("\n") === expected.join("\n");
}

function hash(text) {
  return createHash("sha256").update(text).digest("hex");
}

export function isAuthorizedH1BatchBaseRevision(baseRevision) {
  return baseRevision === H1_BATCH_BASE_REVISION;
}

function isAuthorizedBase(base, baseRevision) {
  // @ah INV-H1-BATCH-ONLY
  return (
    isAuthorizedH1BatchBaseRevision(baseRevision) &&
    exactTags(base.completed.blocks, SEED_TAGS) &&
    exactTags(base.active.blocks, H1_BATCH_TAGS) &&
    base.active.blocks.every(
      ({ fields }) =>
        fields.Source_spec_id === "harness/H1" &&
        fields.Source_spec === H1_SOURCE_PATH &&
        fields.Status === "queued" &&
        fields.Pass === "false",
    )
  );
}

function matchesPassedSurfaceExpansion(source, archived) {
  const before = taskListItems(source, "Expected_surfaces").items;
  const after = taskListItems(archived, "Expected_surfaces").items;
  if (
    after.length < before.length ||
    !before.every((item, index) => after[index] === item)
  ) {
    return false;
  }
  const expanded = replaceTaskList(
    source.raw,
    "Expected_surfaces",
    "Reference_artifacts",
    after,
  );
  return archived.raw === passedTaskBlock(expanded);
}

export function validateAuthorizedH1BatchMerge({
  current,
  base,
  baseRevision,
}) {
  if (!isAuthorizedBase(base, baseRevision)) {
    return { recognized: false, errors: [] };
  }

  const expectedActive = renderTaskStore(current.active, []);
  const currentSeed = current.completed.blocks.slice(0, SEED_TAGS.length);
  const currentH1 = current.completed.blocks.slice(SEED_TAGS.length);
  const exactSeed = base.completed.blocks.every(
    (source, index) => currentSeed[index]?.raw === source.raw,
  );
  const exactH1 = base.active.blocks.every((source, index) =>
    matchesPassedSurfaceExpansion(source, currentH1[index]),
  );
  const errors = [];
  if (
    hash(current.active.prefix) !== H1_FINAL_ACTIVE_PREFIX_HASH ||
    hash(current.completed.prefix) !== H1_FINAL_COMPLETED_PREFIX_HASH ||
    current.active.normalized !== expectedActive ||
    !exactTags(current.completed.blocks, [...SEED_TAGS, ...H1_BATCH_TAGS]) ||
    !exactSeed ||
    !exactH1
  ) {
    errors.push(
      ".harness/completed.md: authorized H1 batch merge must be the exact T-0008 through T-0039 passed and append-only Expected_surfaces transform of checkpoint 5d515d9f8224ed607219fd5f29d0f20305fdcc16",
    );
  }
  return { recognized: true, errors };
}
