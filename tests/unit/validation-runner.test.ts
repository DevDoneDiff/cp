import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  BASELINE_STAGES,
  runValidation,
} from "../../scripts/run-validation.mjs";
import { validateHarnessSnapshot } from "../../scripts/validation/harness-integrity.mjs";
import { canonicalSeedText } from "../../scripts/validation/harness-task-stores.mjs";
import {
  activeStore,
  copySnapshot,
  positiveHarnessScenarios,
  taskBlock,
  type HarnessFixtureContext,
} from "../fixtures/harness-integrity/scenarios";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "..", "..");

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

describe("complete validation runner", () => {
  it("stops at an actionable isolated harness-integrity failure", async () => {
    const valid = positiveHarnessScenarios(await fixtureContext()).queued;
    const negative = copySnapshot(valid, {
      activeText: activeStore([
        taskBlock(),
        taskBlock({ brick: "harness/H1/duplicate-task" }),
      ]),
    });
    const diagnostic = validateHarnessSnapshot(negative).find((message) =>
      message.includes("duplicate task tag"),
    );
    expect(diagnostic).toBe(".harness/tasks.md: duplicate task tag [T-0040]");

    const stages: string[] = [];
    const output: string[] = [];
    const status = runValidation({
      packageManagerEntrypoint: "fixture-pnpm.cjs",
      log: (message: string) => output.push(message),
      spawn: (_executable: string, args: string[]) => {
        const stage = args[2];
        stages.push(stage);
        if (stage === "validate:harness") {
          output.push(diagnostic ?? "missing harness diagnostic");
          return { status: 1 };
        }
        return { status: 0 };
      },
    });

    expect(status).toBe(1);
    expect(stages).toEqual([
      "validate:toolchain",
      "format:check",
      "lint",
      "typecheck",
      "validate:annotations",
      "validate:harness",
    ]);
    expect(output.join("\n")).toContain(diagnostic);
    expect(stages).not.toContain("validate:security");
    expect(stages).not.toContain("test:coverage");
    expect(stages).not.toContain("build");
    expect(BASELINE_STAGES).toHaveLength(9);
  });
});
