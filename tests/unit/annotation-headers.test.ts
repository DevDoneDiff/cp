import { describe, expect, it } from "vitest";

import { validateAnnotatedSource } from "../../scripts/validation/annotation-headers.mjs";

describe("annotation header validation", () => {
  it("accepts the minimal context-compression contract without field-order rigidity", () => {
    const source = `/**
 * VALIDATION: Focused unit proof exercises failure propagation.
 * ROLE: Coordinate the locally assigned validation stages.
 * RELATIONS: package.json exposes the stage commands.
 * BOUNDARY: Remote CI and merge state are not owned here.
 */
export const stages = [];
`;

    expect(
      validateAnnotatedSource({ source, modulePath: "src/example.ts" }),
    ).toEqual([]);
  });

  it("accepts accurate legacy headers until their files are materially changed", () => {
    const source = `/**
 * MODULE: src/example.ts
 * PURPOSE: Preserve existing architectural context without a mass rewrite.
 * INVARIANTS:
 *   - [INV-STABLE] The value remains stable.
 */
export const example = true; // @ah INV-STABLE
`;

    expect(
      validateAnnotatedSource({ source, modulePath: "src/example.ts" }),
    ).toEqual([]);
  });

  it("rejects missing role, task metadata, mixed legacy fields, and empty content", () => {
    const source = `/**
 * ROLE:
 * PURPOSE: Duplicated legacy purpose.
 * ACTIVE_TASK: [T-0001]
 */
export const example = true;
`;
    const errors = validateAnnotatedSource({
      source,
      modulePath: "src/example.ts",
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "src/example.ts: forbidden field ACTIVE_TASK",
        "src/example.ts: ROLE must be nonempty",
        "src/example.ts: current ROLE header must not mix legacy field PURPOSE",
      ]),
    );
  });

  it("keeps sparse semantic anchors symmetric", () => {
    const source = `/**
 * ROLE: Own a distributed trust boundary.
 * BOUNDARY: [SEC-LOCAL-ONLY] Validation never performs network access.
 */
export const local = true;
`;

    expect(
      validateAnnotatedSource({ source, modulePath: "src/example.ts" }),
    ).toContain("src/example.ts: anchor SEC-LOCAL-ONLY has no source marker");
  });
});
