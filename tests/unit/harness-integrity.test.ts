import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  validateHarnessRepository,
  validateHarnessSnapshot,
  validateRepositoryPath,
} from "../../scripts/validation/harness-integrity.mjs";
import { validateHarnessStores } from "../../scripts/validation/harness-task-transitions.mjs";
import { parseValidationRegistry } from "../../scripts/validation/harness-validation-registry.mjs";

const validationText = `# Validation

BASE_BRANCH: main

## Registry

| Set | Command or procedure | Proves |
| --- | --- | --- |
| \`baseline\` | pnpm validate | complete local candidate |
| \`agent-review\` | read-only review | configured nondeterministic properties |

## Candidate Validation
`;

const statePath = "docs/contracts/states/s01-example/s01-state.md";
const specPath =
  "docs/contracts/states/s01-example/specs/P1-example-outcome.md";
const artifactPath = "docs/contracts/states/s01-example/visual-example.png";
const statesReadme = `# States

## State Index

- \`s01-example\`: example state
`;
const stateContract = `# S01 Example

- **State:** approved
- **Approved:** true
`;
const spec = `# P1 Example

- **Spec ID:** \`state/s01/P1\`
- **Owning authority:** \`${statePath}\`
- **Affected states:** \`${statePath}\`
- **State:** approved
- **Approved:** true

- ${artifactPath}
`;

function task({
  tag = "T-0001",
  status = "queued",
  pass = "false",
  title = "Example outcome",
  objective = "Deliver the example outcome.",
}: {
  tag?: string;
  status?: "queued" | "working" | "blocked" | "passed";
  pass?: "false" | "true";
  title?: string;
  objective?: string;
} = {}) {
  return `### [${tag}] ${title}
Priority: P1
Type: feature
Source_spec: ${specPath}
Depends_on: none
Status: ${status}
Ready: true
Pass: ${pass}
Objective:
- ${objective}
Scope:
- Implement one bounded result.
Non_goals:
- Unrelated behavior.
Acceptance_criteria:
- The result is observable.
Expected_surfaces:
- src/example.ts
Reference_artifacts:
- ${artifactPath}
Validation_sets:
- baseline
Open_questions:
- none
Blocker: none
Scratchpad: .harness/work/${tag}.md`;
}

function active(blocks: string[] = [], next = 1) {
  return `# Implementation Tasks

## Control

- \`NEXT_TASK_TAG\`: ${String(next).padStart(4, "0")}
- \`NEXT_REFACTOR_TAG\`: 0001

## Active Queue
${blocks.length ? `\n${blocks.join("\n\n")}\n` : ""}`;
}

function completed(blocks: string[] = []) {
  return `# Completed Tasks

## Completed
${blocks.length ? `\n${blocks.join("\n\n")}\n` : ""}`;
}

function files() {
  return new Map<string, string | Buffer>([
    ["docs/contracts/states/STATE_TEMPLATE.md", "# [STATE NAME]"],
    [statePath, stateContract],
    [specPath, spec],
    [artifactPath, Buffer.from("image")],
  ]);
}

function snapshot(activeText: string, completedText: string) {
  return {
    activeText,
    completedText,
    validationText,
    statesReadme,
    files: files(),
    adapterErrors: [],
  };
}

describe("implementation harness integrity", () => {
  it("accepts the materialized local repository", async () => {
    const root = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
    );
    expect(await validateHarnessRepository(root)).toEqual([]);
  });

  it("accepts semantically complete task fields without enforcing field order", () => {
    expect(
      validateHarnessSnapshot(snapshot(active([task()], 2), completed())),
    ).toEqual([]);
  });

  it("rejects multiple working claims and missing assigned artifacts", () => {
    const second = task({
      tag: "T-0002",
      status: "working",
      title: "Second outcome",
    });
    const first = task({ status: "working" });
    const broken = snapshot(active([first, second], 3), completed());
    broken.files.delete(artifactPath);
    const errors = validateHarnessSnapshot(broken);

    expect(errors).toEqual(
      expect.arrayContaining([
        ".harness/tasks.md: at most one task may be working",
        `.harness/tasks.md: [T-0001] artifact is missing: ${artifactPath}`,
      ]),
    );
  });

  it("accepts one semantic provisional closeout", () => {
    const working = task({ status: "working" });
    const passed = task({ status: "passed", pass: "true" });
    expect(
      validateHarnessStores({
        activeText: active([], 2),
        completedText: completed([passed]),
        baseActiveText: active([working], 2),
        baseCompletedText: completed(),
        validationText,
      }).errors,
    ).toEqual([]);
  });

  it("rejects mutation of completed task meaning", () => {
    const passed = task({ status: "passed", pass: "true" });
    const changed = task({
      status: "passed",
      pass: "true",
      objective: "Change historical meaning.",
    });
    expect(
      validateHarnessStores({
        activeText: active([], 2),
        completedText: completed([changed]),
        baseActiveText: active([], 2),
        baseCompletedText: completed([passed]),
        validationText,
      }).errors,
    ).toContain(
      ".harness/completed.md: transition is not one generic closeout or reversal",
    );
  });

  it("parses registry meaning without exact separator formatting", () => {
    expect(parseValidationRegistry(validationText).errors).toEqual([]);
    expect(
      parseValidationRegistry(
        validationText.replace("agent-review", "baseline"),
      ).errors,
    ).toContain(".harness/validation.md: registry set names must be unique");
  });

  it("rejects unsafe repository paths", () => {
    expect(validateRepositoryPath("scripts/validation/check.mjs")).toBe(true);
    expect(validateRepositoryPath("../outside.mjs")).toBe(false);
    expect(validateRepositoryPath("scripts\\validation\\check.mjs")).toBe(
      false,
    );
  });
});
