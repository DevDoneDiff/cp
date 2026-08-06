import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { parseArtifactRoutes } from "../../scripts/validation/harness-artifact-routes.mjs";
import { parseLegacySpecRoutes } from "../../scripts/validation/harness-contract-routes.mjs";
import { matchesAuthorizedH1AuthorityUpdate } from "../../scripts/validation/harness-h1-batch-transition.mjs";
import {
  configuredBaseBranch,
  selectTaskStoreBase,
  validateHarnessSnapshot,
  validateRepositoryPath,
} from "../../scripts/validation/harness-integrity.mjs";
import {
  CANONICAL_SEED_HASH,
  canonicalSeedText,
  parseTaskStore,
  renderTaskStore,
} from "../../scripts/validation/harness-task-stores.mjs";
import { replaceTaskList } from "../../scripts/validation/harness-task-transforms.mjs";
import {
  H1_PATH,
  activeStore,
  completedStore,
  copySnapshot,
  positiveHarnessScenarios,
  setFixtureSpec,
  taskBlock,
  type HarnessFixtureContext,
  type HarnessSnapshotFixture,
} from "../fixtures/harness-integrity/scenarios";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

async function fixtureContext(): Promise<HarnessFixtureContext> {
  const completed = await readFile(
    path.join(repositoryRoot, ".harness", "completed.md"),
    "utf8",
  );
  const seedText = canonicalSeedText(completed);
  if (!seedText) {
    throw new Error("Canonical seed fixture is unavailable");
  }
  return {
    seedText,
    contractsReadme: await readFile(
      path.join(repositoryRoot, "docs", "contracts", "README.md"),
      "utf8",
    ),
    validationText: await readFile(
      path.join(repositoryRoot, ".harness", "validation.md"),
      "utf8",
    ),
    statesReadme: await readFile(
      path.join(repositoryRoot, "docs", "contracts", "states", "README.md"),
      "utf8",
    ),
    stateTemplate: await readFile(
      path.join(
        repositoryRoot,
        "docs",
        "contracts",
        "states",
        "STATE_TEMPLATE.md",
      ),
      "utf8",
    ),
  };
}

function errors(snapshot: HarnessSnapshotFixture) {
  return validateHarnessSnapshot(snapshot);
}

function sha256(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

function withContractsReadme(
  snapshot: HarnessSnapshotFixture,
  contractsReadme: string,
) {
  const files = new Map(snapshot.files);
  files.set("docs/contracts/README.md", Buffer.from(contractsReadme));
  return copySnapshot(snapshot, { contractsReadme, files });
}

function withValidationText(
  snapshot: HarnessSnapshotFixture,
  validationText: string,
) {
  const files = new Map(snapshot.files);
  files.set(".harness/validation.md", Buffer.from(validationText));
  return copySnapshot(snapshot, { files, validationText });
}

function artifactState(
  snapshot: HarnessSnapshotFixture,
  route: ReturnType<typeof parseArtifactRoutes>[number],
  state: "canonical" | "migration-pending",
) {
  const row = `| \`${route.legacyPath}\` | \`${route.canonicalPath}\` | \`${route.state}\` | exact bytes |`;
  const replacement = `| \`${route.legacyPath}\` | \`${route.canonicalPath}\` | \`${state}\` | exact bytes |`;
  return withContractsReadme(
    snapshot,
    snapshot.contractsReadme.replace(row, replacement),
  );
}

describe("harness integrity validation", () => {
  it("accepts queued, blocked, candidate, seeded, provisional, and reversal fixtures", async () => {
    const scenarios = positiveHarnessScenarios(await fixtureContext());
    for (const [name, scenario] of Object.entries(scenarios)) {
      expect(errors(scenario), name).toEqual([]);
    }
  });

  it("reproduces the exact canonical historical seed hash", async () => {
    const context = await fixtureContext();
    expect(
      createHash("sha256")
        .update(context.seedText, "utf8")
        .digest("hex")
        .toUpperCase(),
    ).toBe(CANONICAL_SEED_HASH);
  });

  it("rejects duplicate tags, brick IDs, and cross-store representation", async () => {
    const context = await fixtureContext();
    const queued = positiveHarnessScenarios(context).queued;
    const duplicateTags = activeStore([
      taskBlock(),
      taskBlock({ brick: "harness/H1/second-brick" }),
    ]);
    expect(
      errors(copySnapshot(queued, { activeText: duplicateTags })),
    ).toContain(".harness/tasks.md: duplicate task tag [T-0040]");

    const duplicateBricks = activeStore(
      [taskBlock(), taskBlock({ tag: "T-0041" })],
      42,
    );
    expect(
      errors(copySnapshot(queued, { activeText: duplicateBricks })),
    ).toContain("task identity: duplicate Brick_id harness/H1/fixture-task");

    const passed = taskBlock({ status: "passed", pass: true });
    const bothStores = copySnapshot(queued, {
      completedText: completedStore(context.seedText, [passed]),
    });
    expect(errors(bothStores)).toContain(
      "task identity: [T-0040] appears in both task stores or more than once",
    );
  });

  it("rejects invalid active state, Pass, blocker, and multiple working combinations", async () => {
    const queued = positiveHarnessScenarios(await fixtureContext()).queued;
    const invalidPass = activeStore([taskBlock({ pass: true })]);
    expect(errors(copySnapshot(queued, { activeText: invalidPass }))).toContain(
      ".harness/tasks.md: [T-0040] active Pass must be false",
    );

    const invalidBlocked = activeStore([
      taskBlock({ status: "blocked", blocker: "none" }),
    ]);
    expect(
      errors(copySnapshot(queued, { activeText: invalidBlocked })),
    ).toContain(
      ".harness/tasks.md: [T-0040] blocked task must record a blocker",
    );

    const twoWorking = activeStore(
      [
        taskBlock({ status: "working" }),
        taskBlock({
          tag: "T-0041",
          brick: "harness/H1/second-brick",
          status: "working",
        }),
      ],
      42,
    );
    expect(errors(copySnapshot(queued, { activeText: twoWorking }))).toContain(
      ".harness/tasks.md: at most one active task may have Status: working",
    );
  });

  it("rejects counter regression and tag or brick identity reuse", async () => {
    const queued = positiveHarnessScenarios(await fixtureContext()).queued;
    const regressed = copySnapshot(queued, {
      activeText: activeStore([taskBlock()], 41),
      baseActiveText: activeStore([taskBlock()], 42),
    });
    expect(errors(regressed)).toContain(
      ".harness/tasks.md: NEXT_TASK_TAG must never decrease from HEAD value 0042",
    );

    const reusedTag = copySnapshot(queued, {
      activeText: activeStore([
        taskBlock({ brick: "harness/H1/reused-tag", title: "Different task" }),
      ]),
    });
    expect(errors(reusedTag)).toContain(
      "task identity: [T-0040] reuses an existing tag for different content",
    );

    const reusedBrick = copySnapshot(queued, {
      activeText: activeStore(
        [taskBlock({ tag: "T-0041", title: "Different task" })],
        42,
      ),
    });
    expect(errors(reusedBrick)).toContain(
      "task identity: Brick_id harness/H1/fixture-task was already represented by [T-0040]",
    );
  });

  it("accepts only an exact append-only task-authoring transition", async () => {
    const context = await fixtureContext();
    const seeded = positiveHarnessScenarios(context).seededArchive;
    const baseActive = activeStore([], 40, 1);
    const first = taskBlock();
    const refactor = taskBlock({
      tag: "R-0001",
      brick: "harness/H1/refactor-fixture",
    });
    const second = taskBlock({
      tag: "T-0041",
      brick: "harness/H1/second-fixture",
    });
    const authored = activeStore([first, refactor, second], 42, 2);
    expect(
      errors(
        copySnapshot(seeded, {
          activeText: authored,
          baseActiveText: baseActive,
        }),
      ),
    ).toEqual([]);

    const counterDrift = activeStore([first], 42, 1);
    expect(
      errors(
        copySnapshot(seeded, {
          activeText: counterDrift,
          baseActiveText: baseActive,
        }),
      ),
    ).toContain(
      ".harness/tasks.md: task-authoring append must advance NEXT_TASK_TAG exactly to 0041",
    );

    const wrongTag = activeStore(
      [taskBlock({ tag: "T-0041", brick: "harness/H1/wrong-tag" })],
      42,
      1,
    );
    expect(
      errors(
        copySnapshot(seeded, {
          activeText: wrongTag,
          baseActiveText: baseActive,
        }),
      ),
    ).toContain(
      ".harness/tasks.md: task-authoring append expected [T-0040] but found [T-0041]",
    );

    const workingAppend = activeStore(
      [taskBlock({ status: "working" })],
      41,
      1,
    );
    expect(
      errors(
        copySnapshot(seeded, {
          activeText: workingAppend,
          baseActiveText: baseActive,
        }),
      ),
    ).toContain(
      ".harness/tasks.md: [T-0040] task-authoring append requires Status: queued and Pass: false",
    );

    for (const invalidTask of [
      taskBlock({ status: "blocked" }),
      taskBlock({ pass: true }),
    ]) {
      expect(
        errors(
          copySnapshot(seeded, {
            activeText: activeStore([invalidTask], 41, 1),
            baseActiveText: baseActive,
          }),
        ),
      ).toContain(
        ".harness/tasks.md: [T-0040] task-authoring append requires Status: queued and Pass: false",
      );
    }

    const baseWorking = activeStore([taskBlock({ status: "working" })], 41);
    expect(
      errors(
        copySnapshot(seeded, {
          activeText: activeStore(
            [
              taskBlock({ status: "working" }),
              taskBlock({
                tag: "T-0041",
                brick: "harness/H1/blocked-authoring-fixture",
              }),
            ],
            42,
          ),
          baseActiveText: baseWorking,
        }),
      ),
    ).toContain(
      ".harness/tasks.md: task-authoring append cannot occur while an active task is working",
    );

    const modeDrift = authored.replace(
      "- `RUN_MODE`: autonomous",
      "- `RUN_MODE`: manual",
    );
    expect(
      errors(
        copySnapshot(seeded, {
          activeText: modeDrift,
          baseActiveText: baseActive,
        }),
      ),
    ).toContain(
      ".harness/tasks.md: task-authoring append may change only the exact applicable counters outside appended task blocks",
    );

    const changedFirst = first.replace(
      "Prove one fixture task.",
      "Change one represented task.",
    );
    expect(
      errors(
        copySnapshot(seeded, {
          activeText: activeStore([changedFirst, second], 42),
          baseActiveText: activeStore([first], 41),
        }),
      ),
    ).toContain(
      ".harness/tasks.md: task-authoring append must preserve every existing active task byte-for-byte and in order",
    );

    const interleaved = activeStore(
      [
        first,
        taskBlock({ tag: "T-0042", brick: "harness/H1/third-fixture" }),
        second,
      ],
      43,
    );
    expect(
      errors(
        copySnapshot(seeded, {
          activeText: interleaved,
          baseActiveText: activeStore([first, second], 42),
        }),
      ),
    ).toContain(
      ".harness/tasks.md: task-authoring append must preserve every existing active task byte-for-byte and in order",
    );

    const changedArchive = seeded.completedText.replace(
      "Repository foundation",
      "Repository foundation changed during authoring",
    );
    expect(
      errors(
        copySnapshot(seeded, {
          activeText: activeStore([first], 41),
          baseActiveText: baseActive,
          completedText: changedArchive,
        }),
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("historical seed SHA-256"),
      ]),
    );
  });

  it("validates dependency existence, uniqueness, order, and acyclicity", async () => {
    const context = await fixtureContext();
    const queued = positiveHarnessScenarios(context).queued;
    const first = taskBlock();
    const dependent = taskBlock({
      tag: "T-0041",
      brick: "harness/H1/dependent-fixture",
      dependsOn: "[T-0007], [T-0040]",
    });
    const valid = activeStore([first, dependent], 42);
    expect(
      errors(
        copySnapshot(queued, {
          activeText: valid,
          baseActiveText: valid,
        }),
      ),
    ).toEqual([]);

    const missing = activeStore([taskBlock({ dependsOn: "[T-9999]" })], 41);
    expect(
      errors(
        copySnapshot(queued, {
          activeText: missing,
          baseActiveText: missing,
        }),
      ),
    ).toContain("task dependency graph: [T-0040] depends on missing [T-9999]");

    const duplicate = activeStore(
      [taskBlock({ dependsOn: "[T-0007], [T-0007]" })],
      41,
    );
    expect(
      errors(
        copySnapshot(queued, {
          activeText: duplicate,
          baseActiveText: duplicate,
        }),
      ),
    ).toContain("task dependency graph: [T-0040] repeats dependency [T-0007]");

    const cycle = activeStore(
      [
        taskBlock({ dependsOn: "[T-0041]" }),
        taskBlock({
          tag: "T-0041",
          brick: "harness/H1/cycle-fixture",
          dependsOn: "[T-0040]",
        }),
      ],
      42,
    );
    const cycleErrors = errors(
      copySnapshot(queued, {
        activeText: cycle,
        baseActiveText: cycle,
      }),
    );
    expect(cycleErrors).toContain(
      "task dependency graph: [T-0040] dependency [T-0041] must precede it in completed-then-active order",
    );
    expect(cycleErrors).toContain(
      "task dependency graph: cycle detected at [T-0040]",
    );
  });

  it("derives forward validation sets from the canonical registry", async () => {
    const queued = positiveHarnessScenarios(await fixtureContext()).queued;
    const customRegistry = queued.validationText.replace(
      "\n## Independent Review Gate",
      "\n| `custom-proof` | configured fixture proof | fixture behavior |\n\n## Independent Review Gate",
    );
    const customTask = taskBlock({
      validationSets: ["baseline", "agent-review", "custom-proof"],
    });
    const customActive = activeStore([customTask]);
    expect(
      errors(
        withValidationText(
          copySnapshot(queued, {
            activeText: customActive,
            baseActiveText: customActive,
          }),
          customRegistry,
        ),
      ),
    ).toEqual([]);

    const bootstrapTask = taskBlock({
      validationSets: ["baseline", "agent-review", "bootstrap-preflight"],
    });
    const bootstrapActive = activeStore([bootstrapTask]);
    expect(
      errors(
        copySnapshot(queued, {
          activeText: bootstrapActive,
          baseActiveText: bootstrapActive,
        }),
      ),
    ).toContain(
      ".harness/tasks.md: [T-0040] Validation_sets has invalid or incomplete set names",
    );

    const baselineRow = queued.validationText
      .split("\n")
      .find((line) => line.startsWith("| `baseline` |"));
    expect(baselineRow).toBeDefined();
    const duplicated = queued.validationText.replace(
      baselineRow!,
      `${baselineRow!}\n${baselineRow!}`,
    );
    expect(errors(withValidationText(queued, duplicated))).toContain(
      ".harness/validation.md: validation registry set names must be unique",
    );

    const malformed = queued.validationText.replace(
      "\n## Independent Review Gate",
      "\n  | malformed registry row |\n\n## Independent Review Gate",
    );
    expect(errors(withValidationText(queued, malformed))).toContain(
      ".harness/validation.md: validation registry contains a malformed or unconsumed row",
    );

    const extraColumn = queued.validationText.replace(
      baselineRow!,
      baselineRow!.replace(/ \|$/, " | extra-column |"),
    );
    expect(errors(withValidationText(queued, extraColumn))).toContain(
      ".harness/validation.md: validation registry contains a malformed or unconsumed row",
    );

    const unconsumed = queued.validationText.replace(
      "\n## Independent Review Gate",
      "\nattacker-controlled registry content\n\n## Independent Review Gate",
    );
    expect(errors(withValidationText(queued, unconsumed))).toContain(
      ".harness/validation.md: validation registry contains malformed or unconsumed content",
    );
  });

  it("rejects archive mutation, reordering, multi-transfer, and non-verbatim transfer", async () => {
    const context = await fixtureContext();
    const seed = completedStore(context.seedText);
    const first = taskBlock({ status: "passed", pass: true });
    const second = taskBlock({
      tag: "T-0041",
      brick: "harness/H1/second-brick",
      status: "passed",
      pass: true,
    });
    const baseCompleted = completedStore(context.seedText, [first, second]);
    const stable = positiveHarnessScenarios(context).seededArchive;

    const mutated = copySnapshot(stable, {
      activeText: activeStore([], 42),
      baseActiveText: activeStore([], 42),
      completedText: baseCompleted.replace(
        "The fixture has one observable result.",
        "The fixture was changed after archive.",
      ),
      baseCompletedText: baseCompleted,
    });
    expect(errors(mutated)).toContain(
      ".harness/completed.md: archived block [T-0040] was mutated",
    );

    const reordered = copySnapshot(stable, {
      activeText: activeStore([], 42),
      baseActiveText: activeStore([], 42),
      completedText: completedStore(context.seedText, [second, first]),
      baseCompletedText: baseCompleted,
    });
    expect(errors(reordered)).toContain(
      ".harness/completed.md: archive order changed at T-0040 -> T-0041",
    );

    const multi = copySnapshot(stable, {
      activeText: activeStore([], 42),
      baseActiveText: activeStore([], 42),
      completedText: baseCompleted,
      baseCompletedText: seed,
    });
    expect(errors(multi)).toContain(
      ".harness/completed.md: archive changed by more than one provisional transfer or reversal",
    );

    const working = taskBlock({ status: "working" });
    const nonVerbatim = copySnapshot(stable, {
      activeText: activeStore([]),
      baseActiveText: activeStore([working]),
      completedText: completedStore(context.seedText, [
        first.replace("Validate the fixture.", "Changed during closeout."),
      ]),
      baseCompletedText: seed,
    });
    expect(errors(nonVerbatim)).toContain(
      ".harness/completed.md: [T-0040] provisional transfer is not an exact full-store append",
    );
  });

  it("rejects seed mutation with a path-specific deterministic diagnostic", async () => {
    const context = await fixtureContext();
    const seeded = positiveHarnessScenarios(context).seededArchive;
    const changed = seeded.completedText.replace(
      "Repository foundation",
      "Repository foundation changed",
    );
    expect(
      errors(
        copySnapshot(seeded, {
          completedText: changed,
          baseCompletedText: changed,
        }),
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^\.harness\/completed\.md: historical seed SHA-256 [A-F0-9]{64} does not equal 2B07112D/,
        ),
      ]),
    );
  });

  it("hashes exact seed bytes and rejects malformed or unconsumed task regions", async () => {
    const context = await fixtureContext();
    const seeded = positiveHarnessScenarios(context).seededArchive;
    const whitespaceMutation = seeded.completedText.replace(
      "\n\n### [T-0002]",
      "\n\n\n### [T-0002]",
    );
    expect(
      errors(
        copySnapshot(seeded, {
          completedText: whitespaceMutation,
          baseCompletedText: whitespaceMutation,
        }),
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("historical seed SHA-256"),
      ]),
    );

    const malformed = positiveHarnessScenarios(context).queued;
    const malformedActive = malformed.activeText.replace(
      "### [T-0040]",
      "### [T-00040]",
    );
    expect(
      errors(copySnapshot(malformed, { activeText: malformedActive })),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("malformed task heading"),
        expect.stringContaining("unconsumed or noncanonical text"),
      ]),
    );

    const changedInstructions = seeded.completedText.replace(
      "with no trimming or other transformation.",
      "with arbitrary trimming.",
    );
    expect(
      errors(
        copySnapshot(seeded, {
          completedText: changedInstructions,
          baseCompletedText: changedInstructions,
        }),
      ),
    ).toContain(
      ".harness/completed.md: historical seed provenance does not equal the canonical instructions",
    );
  });

  it("rejects malformed forward schema values and structured list bodies", async () => {
    const queued = positiveHarnessScenarios(await fixtureContext()).queued;
    for (const [mutation, diagnostic] of [
      ["Type: maintenance", "Type: release"],
      ["Priority: P0", "Priority: urgent"],
      ["Open_questions:\n- none", "Open_questions:\n- unresolved"],
      ["Reference_artifacts:\n- none", "Reference_artifacts:\n- `none`"],
    ]) {
      const invalid = queued.activeText.replace(mutation, diagnostic);
      expect(errors(copySnapshot(queued, { activeText: invalid }))).not.toEqual(
        [],
      );
    }

    const inventedSet = queued.activeText.replace(
      "Validation_sets:\n- baseline",
      "Validation_sets:\n- baseline\n- invented-set",
    );
    expect(errors(copySnapshot(queued, { activeText: inventedSet }))).toContain(
      ".harness/tasks.md: [T-0040] Validation_sets has invalid or incomplete set names",
    );

    const unconsumed = queued.activeText.replace(
      "Blocker: none\nScratchpad:",
      "Blocker: none\nATTACKER-CONTROLLED\nScratchpad:",
    );
    expect(errors(copySnapshot(queued, { activeText: unconsumed }))).toContain(
      ".harness/tasks.md: [T-0040] contains unconsumed or noncanonical schema content",
    );
  });

  it("allows only exact active-state field deltas including blocked-to-queued", async () => {
    const context = await fixtureContext();
    const queued = positiveHarnessScenarios(context).queued;
    const mutatedClaim = copySnapshot(queued, {
      activeText: activeStore([
        taskBlock({
          status: "working",
          objective: "Attacker-controlled objective.",
        }),
      ]),
    });
    expect(errors(mutatedClaim)).toContain(
      ".harness/tasks.md: [T-0040] changed fields outside the exact queued->working state transition",
    );

    const blocked = taskBlock({ status: "blocked" });
    const resumed = copySnapshot(queued, {
      activeText: activeStore([taskBlock()]),
      baseActiveText: activeStore([blocked]),
    });
    expect(errors(resumed)).toEqual([]);
  });

  it("requires full-store atomic provisional closeout and exact reversal", async () => {
    const context = await fixtureContext();
    const seed = completedStore(context.seedText);
    const working = taskBlock({ status: "working" });
    const queued = taskBlock({
      tag: "T-0041",
      brick: "harness/H1/second-brick",
    });
    const passed = taskBlock({ status: "passed", pass: true });
    const baseActive = activeStore([working, queued], 42);
    const changedRemainder = queued.replace(
      "Prove one fixture task.",
      "Mutate an unrelated task.",
    );
    const nonAtomic = copySnapshot(positiveHarnessScenarios(context).queued, {
      activeText: activeStore([changedRemainder], 42),
      completedText: completedStore(context.seedText, [passed]),
      baseActiveText: baseActive,
      baseCompletedText: seed,
    });
    expect(errors(nonAtomic)).toContain(
      ".harness/tasks.md: [T-0040] provisional closeout did not preserve the complete remaining active store",
    );

    const queuedCloseout = copySnapshot(nonAtomic, {
      activeText: activeStore([], 42),
      baseActiveText: activeStore([taskBlock(), queued], 42),
    });
    expect(errors(queuedCloseout)).toContain(
      ".harness/completed.md: provisional closeout requires exactly one working Pass-false source task",
    );

    const provisional = positiveHarnessScenarios(context).provisional;
    const oneNewlineEmptyActive = copySnapshot(provisional, {
      activeText: provisional.activeText.replace(/\n\n$/, "\n"),
    });
    expect(errors(oneNewlineEmptyActive)).toEqual([]);

    const invalidReversal = copySnapshot(provisional, {
      activeText: activeStore([working], 42),
      completedText: seed,
      baseActiveText: provisional.activeText,
      baseCompletedText: provisional.completedText,
      baseParentActiveText: activeStore([working]),
      baseParentCompletedText: seed,
    });
    expect(errors(invalidReversal)).toContain(
      ".harness/completed.md: reversal must restore both task stores byte-for-byte from the pre-closeout parent",
    );
  });

  it("accepts one exact squash-merged closeout on the configured base", async () => {
    const context = await fixtureContext();
    const queued = taskBlock();
    const passed = taskBlock({ status: "passed", pass: true });
    const merged = copySnapshot(positiveHarnessScenarios(context).queued, {
      activeText: activeStore([]),
      completedText: completedStore(context.seedText, [passed]),
      baseActiveText: activeStore([queued]),
      baseCompletedText: completedStore(context.seedText),
      allowMergedCloseout: true,
    });
    expect(errors(merged)).toEqual([]);

    const mutatedArchive = copySnapshot(merged, {
      completedText: merged.completedText.replace(
        "Prove one fixture task.",
        "Attacker-controlled archived objective.",
      ),
    });
    expect(errors(mutatedArchive)).toContain(
      ".harness/completed.md: [T-0040] squash-merged closeout did not preserve both complete stores",
    );
  });

  it("accepts only the exact authorized H1 batch merge at its checkpoint", async () => {
    const context = await fixtureContext();
    const seed = completedStore(context.seedText);
    const liveActive = parseTaskStore(
      await readFile(path.join(repositoryRoot, ".harness", "tasks.md"), "utf8"),
      "active",
    );
    const liveCompleted = parseTaskStore(
      await readFile(
        path.join(repositoryRoot, ".harness", "completed.md"),
        "utf8",
      ),
      "completed",
    );
    const h1FinalActive = renderTaskStore(liveActive, [])
      .replace(/^- `NEXT_TASK_TAG`: \d{4}$/m, "- `NEXT_TASK_TAG`: 0040")
      .replace(
        /^- `NEXT_REFACTOR_TAG`: \d{4}$/m,
        "- `NEXT_REFACTOR_TAG`: 0001",
      );
    const tags = Array.from(
      { length: 32 },
      (_, index) => `T-${String(index + 8).padStart(4, "0")}`,
    );
    const queued = tags.map((tag) =>
      taskBlock({ tag, brick: `harness/H1/batch-${tag.toLowerCase()}` }),
    );
    const passed = tags.map((tag) =>
      taskBlock({
        tag,
        brick: `harness/H1/batch-${tag.toLowerCase()}`,
        status: "passed",
        pass: true,
      }),
    );
    const seedBlocks = parseTaskStore(seed, "completed").blocks;
    const passedBlocks = parseTaskStore(
      completedStore(context.seedText, passed),
      "completed",
    ).blocks.slice(seedBlocks.length);
    const merged = copySnapshot(
      positiveHarnessScenarios(context).seededArchive,
      {
        activeText: h1FinalActive.replace(/\n\n$/, "\n"),
        completedText: renderTaskStore(liveCompleted, [
          ...seedBlocks,
          ...passedBlocks,
        ]),
        baseActiveText: activeStore(queued, 40),
        baseCompletedText: seed,
        allowMergedCloseout: true,
        mergedBaseRevision: "5d515d9f8224ed607219fd5f29d0f20305fdcc16",
      },
    );
    expect(errors(merged)).toEqual([]);

    const wrongEmptySuffix = copySnapshot(merged, {
      activeText: merged.activeText.replace(/\n$/, "\n\n"),
    });
    expect(errors(wrongEmptySuffix)).toContain(
      ".harness/completed.md: authorized H1 batch merge must be the exact T-0008 through T-0039 passed and append-only Expected_surfaces transform of checkpoint 5d515d9f8224ed607219fd5f29d0f20305fdcc16",
    );

    const wrongRevision = copySnapshot(merged, {
      mergedBaseRevision: "0".repeat(40),
    });
    expect(errors(wrongRevision)).toContain(
      ".harness/completed.md: archive changed by more than one provisional transfer or reversal",
    );

    const mutated = copySnapshot(merged, {
      completedText: merged.completedText.replace(
        "Prove one fixture task.",
        "Mutate one archived H1 task.",
      ),
    });
    expect(errors(mutated)).toContain(
      ".harness/completed.md: authorized H1 batch merge must be the exact T-0008 through T-0039 passed and append-only Expected_surfaces transform of checkpoint 5d515d9f8224ed607219fd5f29d0f20305fdcc16",
    );

    const expandedBlock = {
      ...passedBlocks[15],
      raw: replaceTaskList(
        passedBlocks[15].raw,
        "Expected_surfaces",
        "Reference_artifacts",
        [
          "tests/fixtures/harness-integrity/scenarios.ts",
          "scripts/validation/harness-integrity.mjs",
        ],
      ),
    };
    const expanded = copySnapshot(merged, {
      completedText: renderTaskStore(liveCompleted, [
        ...seedBlocks,
        ...passedBlocks.slice(0, 15),
        expandedBlock,
        ...passedBlocks.slice(16),
      ]),
    });
    expect(errors(expanded)).toEqual([]);

    const futureQueued = [
      taskBlock({ tag: "T-0040", brick: "harness/H2/future-40" }),
      taskBlock({ tag: "T-0041", brick: "harness/H2/future-41" }),
    ];
    const futurePassed = futureQueued.map((block) =>
      block
        .replace("Status: queued", "Status: passed")
        .replace("Pass: false", "Pass: true"),
    );
    const futureMulti = copySnapshot(merged, {
      activeText: activeStore([], 42),
      completedText: completedStore(context.seedText, futurePassed),
      baseActiveText: activeStore(futureQueued, 42),
      baseCompletedText: seed,
    });
    expect(errors(futureMulti)).toContain(
      ".harness/completed.md: archive changed by more than one provisional transfer or reversal",
    );
  });

  it("binds the T-0030 authority bridge to both complete stores and exact identities", async () => {
    const context = await fixtureContext();
    const completed = completedStore(context.seedText);
    const baseActiveText = activeStore([
      taskBlock({
        tag: "T-0030",
        brick: "harness/H1/provisional-closeout-completion",
        status: "working",
      }),
      taskBlock({ tag: "T-0031", brick: "harness/H1/future-31" }),
    ]);
    const currentActiveText = baseActiveText.replace(
      "# Tasks\n",
      "# Tasks\n\nCanonical candidate authority.\n",
    );
    const currentCompletedText = completed.replace(
      "# Completed Tasks\n",
      "# Completed Tasks\n\nCanonical archive authority.\n",
    );
    const parse = (activeText: string, completedText: string) => ({
      active: parseTaskStore(activeText, "active"),
      completed: parseTaskStore(completedText, "completed"),
    });
    const base = parse(baseActiveText, completed);
    const current = parse(currentActiveText, currentCompletedText);
    const authority = {
      baseActiveHash: sha256(base.active.normalized),
      baseCompletedHash: sha256(base.completed.normalized),
      currentActiveHash: sha256(current.active.normalized),
      currentCompletedHash: sha256(current.completed.normalized),
      currentActivePrefixHash: sha256(current.active.prefix),
      currentCompletedPrefixHash: sha256(current.completed.prefix),
      activeTags: ["T-0030", "T-0031"],
      completedTags: base.completed.blocks.map(({ tag }) => tag),
    };
    const accepted = (next = current, prior = base) =>
      matchesAuthorizedH1AuthorityUpdate(next, prior, authority);

    expect(accepted()).toBe(true);
    expect(
      accepted(
        current,
        parse(baseActiveText.replace("# Tasks\n", "# Laundered\n"), completed),
      ),
    ).toBe(false);
    expect(
      accepted(
        current,
        parse(
          baseActiveText.replace(
            "Prove one fixture task.",
            "Drift one predecessor block.",
          ),
          completed,
        ),
      ),
    ).toBe(false);
    expect(
      accepted(
        parse(
          currentActiveText.replace(
            "### [T-0031]",
            `${taskBlock({ tag: "T-0032", brick: "harness/H1/extra-32" })}\n\n### [T-0031]`,
          ),
          currentCompletedText,
        ),
      ),
    ).toBe(false);
    expect(
      accepted(
        parse(
          currentActiveText.replace("T-0031", "T-0030"),
          currentCompletedText,
        ),
      ),
    ).toBe(false);
    expect(
      accepted(
        parse(
          currentActiveText.replace(
            "Prove one fixture task.",
            "Drift one block.",
          ),
          currentCompletedText,
        ),
      ),
    ).toBe(false);
    expect(
      accepted(
        parse(
          currentActiveText.replace(
            "harness/H1/provisional-closeout-completion",
            "harness/H1/wrong-identity",
          ),
          currentCompletedText,
        ),
      ),
    ).toBe(false);
  });

  it("resolves the four seeded legacy specs only through the ID-bearing map", async () => {
    const context = await fixtureContext();
    const queued = positiveHarnessScenarios(context).queued;
    const routes = parseLegacySpecRoutes(context.contractsReadme);
    expect(routes).toHaveLength(4);
    const files = new Map(queued.files);
    files.set(routes[0].legacyPath, Buffer.from("retired body"));
    expect(errors(copySnapshot(queued, { files }))).toContain(
      `${routes[0].legacyPath}: retired legacy spec body must not exist in the current tree`,
    );

    const staleFiles = new Map(queued.files);
    staleFiles.set(
      "docs/PRODUCT.md",
      Buffer.from(`Current consumer: ${routes[0].legacyPath}`),
    );
    expect(errors(copySnapshot(queued, { files: staleFiles }))).toContain(
      `docs/PRODUCT.md: forbidden live reference to retired spec ${routes[0].legacyPath}`,
    );
  });

  it("rejects a spoofed legacy map and stale references even under fixture paths", async () => {
    const context = await fixtureContext();
    const queued = positiveHarnessScenarios(context).queued;
    const route = parseLegacySpecRoutes(context.contractsReadme)[0];
    const spoofed = withContractsReadme(
      queued,
      context.contractsReadme.replace(
        route.historicalLocator,
        route.historicalLocator.replace(/^[0-9a-f]{40}/, "0".repeat(40)),
      ),
    );
    expect(errors(spoofed)).toContain(
      "docs/contracts/README.md: legacy spec compatibility must contain exactly the approved four mappings",
    );

    const files = new Map(queued.files);
    files.set(
      "tests/fixtures/other/stale.md",
      Buffer.from(`stale ${route.legacyPath}`),
    );
    expect(errors(copySnapshot(queued, { files }))).toContain(
      `tests/fixtures/other/stale.md: forbidden live reference to retired spec ${route.legacyPath}`,
    );

    const malformedRow = withContractsReadme(
      queued,
      context.contractsReadme.replace(
        "## Bounded Lineage",
        "| attacker | unauthorized | current | locator |\n\n## Bounded Lineage",
      ),
    );
    expect(errors(malformedRow)).toContain(
      "docs/contracts/README.md: legacy spec compatibility table contains malformed or unconsumed rows",
    );
    const indentedRow = withContractsReadme(
      queued,
      context.contractsReadme.replace(
        "## Bounded Lineage",
        "  | attacker | unauthorized | current | locator |\n\n## Bounded Lineage",
      ),
    );
    expect(errors(indentedRow)).toContain(
      "docs/contracts/README.md: legacy spec compatibility table contains malformed or unconsumed rows",
    );
  });

  it("rejects retired, missing, mismatched, and noncanonical forward spec routes", async () => {
    const context = await fixtureContext();
    const queued = positiveHarnessScenarios(context).queued;
    const legacy = parseLegacySpecRoutes(context.contractsReadme)[0].legacyPath;
    expect(
      errors(
        copySnapshot(queued, {
          activeText: activeStore([taskBlock({ sourceSpec: legacy })]),
        }),
      ),
    ).toContain(
      `.harness/tasks.md: [T-0040] forward task uses retired Source_spec ${legacy}`,
    );

    const missing = "docs/contracts/harness/specs/H2-missing.md";
    expect(
      errors(
        copySnapshot(queued, {
          activeText: activeStore([
            taskBlock({ sourceSpec: missing, sourceSpecId: "harness/H2" }),
          ]),
        }),
      ),
    ).toContain(
      `.harness/tasks.md: [T-0040] Source_spec does not exist: ${missing}`,
    );

    const mismatchFiles = new Map(queued.files);
    mismatchFiles.set(
      H1_PATH,
      Buffer.from(
        "**State:** approved\n\n**Approved:** true\n\n- **Spec ID:** `harness/H2`\n",
      ),
    );
    expect(errors(copySnapshot(queued, { files: mismatchFiles }))).toContain(
      `${H1_PATH}: Spec ID harness/H2 does not match [T-0040] Source_spec_id harness/H1`,
    );

    const wrongPath = "docs/contracts/harness/specs/X1-wrong.md";
    const wrongPathFiles = new Map(queued.files);
    wrongPathFiles.set(wrongPath, queued.files.get(H1_PATH)!);
    expect(
      errors(
        copySnapshot(queued, {
          activeText: activeStore([taskBlock({ sourceSpec: wrongPath })]),
          files: wrongPathFiles,
        }),
      ),
    ).toContain(
      `${wrongPath}: canonical path does not match stable spec ID harness/H1`,
    );

    const emptySlug = "docs/contracts/harness/specs/H1-.md";
    const emptySlugFiles = new Map(queued.files);
    emptySlugFiles.set(emptySlug, queued.files.get(H1_PATH)!);
    expect(
      errors(
        copySnapshot(queued, {
          activeText: activeStore([taskBlock({ sourceSpec: emptySlug })]),
          files: emptySlugFiles,
        }),
      ),
    ).toContain(
      `${emptySlug}: canonical path does not match stable spec ID harness/H1`,
    );

    const duplicateMetadataFiles = new Map(queued.files);
    duplicateMetadataFiles.set(
      H1_PATH,
      Buffer.from(
        duplicateMetadataFiles
          .get(H1_PATH)!
          .toString("utf8")
          .replace(
            "- **Spec ID:** `harness/H1`",
            "- **Spec ID:** `harness/H1`\n- **Spec ID:** `harness/H1`",
          )
          .replace(
            "**Approved:** true",
            "**Approved:** true\n**Approved:** false",
          ),
      ),
    );
    expect(
      errors(copySnapshot(queued, { files: duplicateMetadataFiles })),
    ).toContain(
      `${H1_PATH}: [T-0040] source spec must declare exactly one Spec ID`,
    );
  });

  it("keeps an archived task source-spec path live until migration is executable", async () => {
    const context = await fixtureContext();
    const seeded = positiveHarnessScenarios(context).seededArchive;
    const passed = taskBlock({ status: "passed", pass: true });
    const completed = completedStore(context.seedText, [passed]);
    const stable = copySnapshot(seeded, {
      activeText: activeStore([]),
      baseActiveText: activeStore([]),
      completedText: completed,
      baseCompletedText: completed,
    });
    const files = new Map(stable.files);
    files.delete(H1_PATH);
    expect(errors(copySnapshot(stable, { files }))).toContain(
      `.harness/completed.md: [T-0040] Source_spec does not exist: ${H1_PATH}`,
    );
  });

  it("accepts only exact pending artifact pairs and canonical routes without a duplicate", async () => {
    const queued = positiveHarnessScenarios(await fixtureContext()).queued;
    const route = parseArtifactRoutes(queued.contractsReadme)[0];

    const pending = artifactState(queued, route, "migration-pending");
    let files = new Map(pending.files);
    files.set(route.legacyPath, Buffer.from("different"));
    expect(errors(copySnapshot(pending, { files }))).toContain(
      `${route.legacyPath}: migration-pending bytes differ from ${route.canonicalPath}`,
    );

    files = new Map(pending.files);
    files.delete(route.legacyPath);
    expect(errors(copySnapshot(pending, { files }))).toContain(
      `${route.legacyPath}: migration-pending legacy artifact is missing`,
    );

    const canonical = artifactState(queued, route, "canonical");
    files = new Map(canonical.files);
    files.set(route.legacyPath, files.get(route.canonicalPath)!);
    expect(errors(copySnapshot(canonical, { files }))).toContain(
      `${route.legacyPath}: canonical artifact still has a live legacy duplicate`,
    );

    files = new Map(queued.files);
    const unregistered = "references/states/s99-fixture/visual-unknown.png";
    files.set(unregistered, Buffer.from("unknown"));
    expect(errors(copySnapshot(queued, { files }))).toContain(
      `${unregistered}: unregistered legacy state artifact`,
    );
  });

  it("rejects incomplete artifact maps and stale artifact consumers", async () => {
    const queued = positiveHarnessScenarios(await fixtureContext()).queued;
    const route = parseArtifactRoutes(queued.contractsReadme)[0];
    const row = `| \`${route.legacyPath}\` | \`${route.canonicalPath}\` | \`${route.state}\` | exact bytes |`;
    const incomplete = withContractsReadme(
      queued,
      queued.contractsReadme.replace(`${row}\n`, ""),
    );
    expect(errors(incomplete)).toContain(
      "docs/contracts/README.md: artifact migration registry must contain exactly the approved five path pairs",
    );

    let files = new Map(queued.files);
    files.set("docs/PRODUCT.md", Buffer.from(`consumer ${route.legacyPath}`));
    expect(errors(copySnapshot(queued, { files }))).toContain(
      `docs/PRODUCT.md: forbidden live reference to legacy artifact ${route.legacyPath}`,
    );

    files = new Map(queued.files);
    files.set("public/stale.html", Buffer.from(`consumer ${route.legacyPath}`));
    expect(errors(copySnapshot(queued, { files }))).toContain(
      `public/stale.html: forbidden live reference to legacy artifact ${route.legacyPath}`,
    );

    const malformedRow = withContractsReadme(
      queued,
      queued.contractsReadme.replace(
        "## Templates",
        "| attacker | unauthorized | canonical | exact bytes |\n\n## Templates",
      ),
    );
    expect(errors(malformedRow)).toContain(
      "docs/contracts/README.md: artifact migration table contains malformed or unconsumed rows",
    );
    const indentedRow = withContractsReadme(
      queued,
      queued.contractsReadme.replace(
        "## Templates",
        "  | attacker | unauthorized | canonical | exact bytes |\n\n## Templates",
      ),
    );
    expect(errors(indentedRow)).toContain(
      "docs/contracts/README.md: artifact migration table contains malformed or unconsumed rows",
    );
  });

  it("allows an undeclared absent state contract and rejects required absence or placeholders", async () => {
    const queued = positiveHarnessScenarios(await fixtureContext()).queued;
    expect(errors(queued)).toEqual([]);

    const statePath = "docs/contracts/states/s01-address-entry/s01-state.md";
    const required = setFixtureSpec(queued, `\`${statePath}\``);
    expect(errors(required)).toContain(
      `${statePath}: required state contract is absent`,
    );

    const files = new Map(required.files);
    files.set(
      statePath,
      Buffer.from(
        "# S01: [State Name]\n\n**State:** approved\n\n**Approved:** true\n",
      ),
    );
    expect(errors(copySnapshot(required, { files }))).toContain(
      `${statePath}: unresolved state-template placeholder [State Name]`,
    );

    files.set(
      statePath,
      Buffer.from(
        "# S01\n\n**State:** approved\n**State:** draft\n\n**Approved:** true\n**Approved:** false\n",
      ),
    );
    expect(errors(copySnapshot(required, { files }))).toContain(
      `${statePath}: concrete state contract must be explicitly approved`,
    );
  });

  it("requires the state template and exact indexed state-contract paths", async () => {
    const queued = positiveHarnessScenarios(await fixtureContext()).queued;
    const missingTemplateFiles = new Map(queued.files);
    missingTemplateFiles.delete("docs/contracts/states/STATE_TEMPLATE.md");
    expect(
      errors(copySnapshot(queued, { files: missingTemplateFiles })),
    ).toContain(
      "docs/contracts/states/STATE_TEMPLATE.md: state contract template is missing",
    );

    const wrongPath = "docs/contracts/states/s01-wrong-directory/s01-state.md";
    const required = setFixtureSpec(queued, `\`${wrongPath}\``);
    expect(errors(required)).toContain(
      `${H1_PATH}: Affected states path is not canonical: ${wrongPath}`,
    );

    const statePath = "docs/contracts/states/s01-address-entry/s01-state.md";
    const files = new Map(queued.files);
    files.set(
      statePath,
      Buffer.from("# SNN state\n\n**State:** approved\n\n**Approved:** true\n"),
    );
    expect(errors(copySnapshot(queued, { files }))).toContain(
      `${statePath}: unresolved state-template placeholder SNN`,
    );

    const garbage = setFixtureSpec(queued, "`attacker-controlled`");
    expect(errors(garbage)).toContain(
      `${H1_PATH}: Affected states path is not canonical: attacker-controlled`,
    );

    const missingDependencyFiles = new Map(queued.files);
    missingDependencyFiles.set(
      H1_PATH,
      Buffer.from(
        missingDependencyFiles
          .get(H1_PATH)!
          .toString("utf8")
          .replace(
            "**Approved dependencies:** none",
            "**Approved dependencies:** `docs/missing-authority.md`",
          ),
      ),
    );
    expect(
      errors(copySnapshot(queued, { files: missingDependencyFiles })),
    ).toContain(
      `${H1_PATH}: Approved dependencies path does not exist: docs/missing-authority.md`,
    );

    const duplicateStateFiles = new Map(queued.files);
    duplicateStateFiles.set(
      H1_PATH,
      Buffer.from(
        duplicateStateFiles
          .get(H1_PATH)!
          .toString("utf8")
          .replace(
            "- **Affected states:** none",
            "- **Affected states:** none\n- **Affected states:** none",
          ),
      ),
    );
    expect(
      errors(copySnapshot(queued, { files: duplicateStateFiles })),
    ).toContain(
      `${H1_PATH}: expected exactly one structured Affected states declaration`,
    );
  });

  it("selects committed transition parents and rejects unsafe repository paths", async () => {
    const context = await fixtureContext();
    const queued = activeStore([taskBlock()]);
    const working = activeStore([taskBlock({ status: "working" })]);
    const seed = completedStore(context.seedText);
    const dirty = selectTaskStoreBase({
      currentActiveText: working,
      currentCompletedText: seed,
      headActiveText: queued,
      headCompletedText: seed,
      parentActiveText: activeStore([]),
      parentCompletedText: seed,
      headRevision: "1".repeat(40),
      parentRevision: "5d515d9f8224ed607219fd5f29d0f20305fdcc16",
    });
    expect(dirty.baseActiveText).toBe(queued);
    expect(dirty.baseRevision).toBe("1".repeat(40));

    const committed = selectTaskStoreBase({
      currentActiveText: working,
      currentCompletedText: seed,
      headActiveText: working,
      headCompletedText: seed,
      parentActiveText: queued,
      parentCompletedText: seed,
      headRevision: "2".repeat(40),
      parentRevision: "1".repeat(40),
    });
    expect(committed.baseActiveText).toBe(queued);
    expect(committed.baseRevision).toBe("1".repeat(40));

    const passed = taskBlock({ status: "passed", pass: true });
    const shallow = selectTaskStoreBase({
      currentActiveText: activeStore([]),
      currentCompletedText: completedStore(context.seedText, [passed]),
      headActiveText: activeStore([]),
      headCompletedText: completedStore(context.seedText, [passed]),
    });
    expect(shallow.adapterErrors).toContain(
      "local Git history lacks the parent task stores required to prove the committed transition",
    );
    expect(validateRepositoryPath("scripts/validation/check.mjs")).toBe(true);
    expect(validateRepositoryPath("../escape.mjs")).toBe(false);
    expect(validateRepositoryPath("C:/absolute.mjs")).toBe(false);
    expect(validateRepositoryPath("scripts\\validation\\check.mjs")).toBe(
      false,
    );
    expect(configuredBaseBranch("BASE_BRANCH: main\n").errors).toEqual([]);
    expect(
      configuredBaseBranch("BASE_BRANCH: main\nBASE_BRANCH: task-branch\n")
        .errors,
    ).toContain(
      ".harness/validation.md: BASE_BRANCH must be declared exactly once as main",
    );
  });

  it("returns stable sorted diagnostics and the implementation has no network or write primitive", async () => {
    const queued = positiveHarnessScenarios(await fixtureContext()).queued;
    const invalid = copySnapshot(queued, {
      activeText: activeStore([taskBlock({ pass: true, blocker: "conflict" })]),
    });
    const first = errors(invalid);
    expect(first).toEqual([...first].sort());
    expect(errors(invalid)).toEqual(first);

    const source = await readFile(
      path.join(
        repositoryRoot,
        "scripts",
        "validation",
        "harness-integrity.mjs",
      ),
      "utf8",
    );
    expect(source).not.toMatch(
      /node:https?|\bfetch\s*\(|writeFile|appendFile|rmSync|unlink|rename\s*\(/,
    );
  });
});
