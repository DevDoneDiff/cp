/**
 * MODULE: scripts/validation/harness-t0040-recovery-transition.mjs
 * PURPOSE: Prove the one exact T-0040 recovery squash that bootstraps the repaired authoring lane.
 * PUBLIC API / ENTRYPOINTS:
 *   - matchesAuthorizedT0040RecoveryIdentity: evaluates immutable checkpoint identities.
 *   - validateAuthorizedT0040RecoveryMerge: applies the one-time proof to parsed stores.
 * CONTROL_FLOW:
 *   1. Recognize only T-0040 appended onto its exact pre-repair base revision.
 *   2. Bind both base stores, the terminal active store, and the passed task block to exact hashes.
 *   3. Reject any archive, queue, counter, or task-content drift.
 * INVARIANTS:
 *   - [INV-T0040-RECOVERY-ONLY] Only the exact T-0040 repair squash onto its recorded base is recognized.
 *   - The compatibility path cannot authorize a future task or a second archive append.
 * BOUNDARIES:
 *   - Ordinary authoring appends and future closeouts remain owned by their generic transition validators.
 * RELATED: harness-task-transitions.mjs and .harness/work/T-0040.md.
 * SECURITY:
 *   - Cryptographic identities bind every complete store involved in this one-time exception.
 */
import { createHash } from "node:crypto";

const T0040_RECOVERY_BASE_REVISION = "24fe977b83b6fe18a3bc599e5d2b901ea797bf87";
const BASE_ACTIVE_HASH =
  "bb9463a69699ba3865d87d7fca919b9cdc4543188e5992c285d47c6529d27ef7";
const BASE_COMPLETED_HASH =
  "7a6f3d7cc01e1bcc57dcab778e34488944618e64b4925717c152a5b8ad291547";
const FINAL_ACTIVE_HASH =
  "d5174ccc13ac4ff81c5232483a9d7e104ed113ee27d4800201fe1c36092cf49e";
const FINAL_COMPLETED_HASH =
  "c8e4ce1652da14fb1a5c0e8a49255569ec5a20e5c0c94ff60bd08f9ba37d2010";
const PASSED_TASK_HASH =
  "5bb27e3d743082c82a1ed2704274e2f6d325dd6c81a003f3d0d2965d7162658d";

function hash(text) {
  return createHash("sha256").update(text).digest("hex");
}

export function matchesAuthorizedT0040RecoveryIdentity(identity) {
  return (
    identity.baseRevision === T0040_RECOVERY_BASE_REVISION &&
    identity.appendedTag === "T-0040" &&
    identity.baseActiveHash === BASE_ACTIVE_HASH &&
    identity.baseCompletedHash === BASE_COMPLETED_HASH &&
    identity.finalActiveHash === FINAL_ACTIVE_HASH &&
    identity.finalCompletedHash === FINAL_COMPLETED_HASH &&
    identity.passedTaskHash === PASSED_TASK_HASH &&
    identity.currentActiveBlockCount === 0 &&
    identity.currentCompletedBlockCount ===
      identity.baseCompletedBlockCount + 1 &&
    identity.exactArchivePrefix
  );
}

export function validateAuthorizedT0040RecoveryMerge({
  current,
  base,
  baseRevision,
}) {
  const appended = current.completed.blocks.at(-1);
  if (
    baseRevision !== T0040_RECOVERY_BASE_REVISION ||
    appended?.tag !== "T-0040"
  ) {
    return { recognized: false, errors: [] };
  }

  // @ah INV-T0040-RECOVERY-ONLY
  const exactArchivePrefix =
    current.completed.blocks.length === base.completed.blocks.length + 1 &&
    base.completed.blocks.every(
      (prior, index) => current.completed.blocks[index]?.raw === prior.raw,
    );
  const exactRecovery = matchesAuthorizedT0040RecoveryIdentity({
    baseRevision,
    appendedTag: appended.tag,
    baseActiveHash: hash(base.active.normalized),
    baseCompletedHash: hash(base.completed.normalized),
    finalActiveHash: hash(current.active.normalized),
    finalCompletedHash: hash(current.completed.normalized),
    passedTaskHash: hash(appended.raw),
    currentActiveBlockCount: current.active.blocks.length,
    baseCompletedBlockCount: base.completed.blocks.length,
    currentCompletedBlockCount: current.completed.blocks.length,
    exactArchivePrefix,
  });

  return {
    recognized: true,
    errors: exactRecovery
      ? []
      : [
          ".harness/completed.md: authorized T-0040 recovery merge must exactly archive the repair task onto checkpoint 24fe977b83b6fe18a3bc599e5d2b901ea797bf87",
        ],
  };
}
