import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { validateAnnotatedSource } from "../../scripts/validation/annotation-headers.mjs";

interface AnnotationFixture {
  modulePath: string;
  source: string;
}

async function readFixture(name: "negative" | "positive") {
  const file = new URL(`../fixtures/annotations/${name}.json`, import.meta.url);
  return JSON.parse(await readFile(file, "utf8")) as AnnotationFixture;
}

describe("annotation header validation", () => {
  it("accepts a canonical candidate header with symmetric anchors", async () => {
    const fixture = await readFixture("positive");

    expect(
      validateAnnotatedSource({
        ...fixture,
        mode: "candidate",
        workingTaskTags: ["[T-0001]"],
      }),
    ).toEqual([]);
  });

  it("rejects order, module, paired-task, and anchor violations", async () => {
    const fixture = await readFixture("negative");
    const errors = validateAnnotatedSource({
      ...fixture,
      mode: "working",
      workingTaskTags: ["[T-0001]"],
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("fields are not in canonical order"),
        expect.stringContaining("MODULE must equal src/example.ts"),
        expect.stringContaining(
          "ACTIVE_TASK and LOCAL_INTENT must appear together",
        ),
        expect.stringContaining(
          "anchor INV-MISSING-MARKER has no source marker",
        ),
      ]),
    );
  });

  it("rejects temporary task context in candidate mode", () => {
    const source = `/**
 * MODULE: src/example.ts
 * PURPOSE: Own an active example.
 * INVARIANTS:
 *   - Active intent remains temporary.
 * ACTIVE_TASK: [T-0001]
 * LOCAL_INTENT:
 *   - Change the example.
 */
export const example = true;
`;

    expect(
      validateAnnotatedSource({
        source,
        modulePath: "src/example.ts",
        mode: "candidate",
        workingTaskTags: ["[T-0001]"],
      }),
    ).toContain(
      "src/example.ts: candidate mode forbids ACTIVE_TASK and LOCAL_INTENT",
    );
  });

  it("requires temporary task context to reference the single working task", () => {
    const source = `/**
 * MODULE: src/example.ts
 * PURPOSE: Own an active example.
 * INVARIANTS:
 *   - Active intent references current queue state.
 * ACTIVE_TASK: [T-9999]
 * LOCAL_INTENT:
 *   - Change the example.
 */
export const example = true;
`;

    expect(
      validateAnnotatedSource({
        source,
        modulePath: "src/example.ts",
        mode: "working",
        workingTaskTags: ["[T-0001]"],
      }),
    ).toContain("src/example.ts: ACTIVE_TASK must reference [T-0001]");
  });
});
