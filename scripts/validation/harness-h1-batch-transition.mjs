/**
 * MODULE: scripts/validation/harness-h1-batch-transition.mjs
 * PURPOSE: Recognize and prove the one authorized H1 T-0008 through T-0039 batch squash onto its exact checkpoint.
 * PUBLIC API / ENTRYPOINTS:
 *   - isAuthorizedH1BatchBaseRevision: identifies the single historical parent whose pre-H1 provenance is compatible.
 *   - isAuthorizedH1AuthorityUpdate: recognizes the exact T-0030 store-header authority transition without permitting block drift.
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
  matchesExpectedSurfaceExpansion,
  passedTaskBlock,
  replaceTaskList,
} from "./harness-task-transforms.mjs";

const H1_BATCH_BASE_REVISION = "5d515d9f8224ed607219fd5f29d0f20305fdcc16";
const H1_SOURCE_PATH =
  "docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md";
const H1_FINAL_ACTIVE_PREFIX_HASH =
  "74723a431d65cdd1808e0f0a22d9b333bd0d6944a8bf614c8e39ce961cb40ba4";
const H1_FINAL_COMPLETED_PREFIX_HASH =
  "e6d402261604c005b94b7ec0c7dc1388606f523399b95edbdbc159c7885283ef";
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

export function isAuthorizedH1AuthorityUpdate(current, base) {
  const currentWorking = current.active.blocks.filter(
    ({ fields }) => fields.Status === "working" && fields.Pass === "false",
  );
  const sameActiveTags = exactTags(
    current.active.blocks,
    base.active.blocks.map(({ tag }) => tag),
  );
  const exactActiveBlocks = base.active.blocks.every((prior, index) => {
    const next = current.active.blocks[index];
    return (
      next?.raw === prior.raw ||
      (prior.tag === "T-0030" &&
        next?.tag === prior.tag &&
        matchesExpectedSurfaceExpansion(prior, next))
    );
  });
  const exactCompletedBlocks = base.completed.blocks.every(
    (prior, index) => current.completed.blocks[index]?.raw === prior.raw,
  );
  return (
    hash(current.active.prefix) === H1_FINAL_ACTIVE_PREFIX_HASH &&
    hash(current.completed.prefix) === H1_FINAL_COMPLETED_PREFIX_HASH &&
    sameActiveTags &&
    current.completed.blocks.length === base.completed.blocks.length &&
    exactActiveBlocks &&
    exactCompletedBlocks &&
    currentWorking.length === 1 &&
    currentWorking[0].tag === "T-0030" &&
    currentWorking[0].fields.Brick_id ===
      "harness/H1/provisional-closeout-completion"
  );
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
