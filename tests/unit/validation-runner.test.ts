import { describe, expect, it } from "vitest";

import {
  BASELINE_STAGES,
  runValidation,
} from "../../scripts/run-validation.mjs";

describe("complete validation runner", () => {
  it("stops at the first actionable stage failure", () => {
    const stages: string[] = [];
    const output: string[] = [];
    const status = runValidation({
      packageManagerEntrypoint: "fixture-pnpm.cjs",
      log: (message: string) => output.push(message),
      spawn: (_executable: string, args: string[]) => {
        const stage = args[2];
        stages.push(stage);
        if (stage === "validate:harness") {
          output.push("focused harness diagnostic");
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
    expect(output.join("\n")).toContain("focused harness diagnostic");
    expect(stages).not.toContain("validate:security");
    expect(stages).not.toContain("test:coverage");
    expect(stages).not.toContain("build");
    expect(BASELINE_STAGES).toHaveLength(9);
  });
});
