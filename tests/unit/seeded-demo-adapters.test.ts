import { describe, expect, it, vi } from "vitest";

import { createRuntimeHarness, startProject } from "../helpers/project-runtime";

describe("seeded demo adapter boundaries", () => {
  it("normalizes only the canonical fixture without a provider call", () => {
    const { adapters } = createRuntimeHarness();
    expect(adapters.address.resolve(" 123 maple st ")).toEqual({
      address_draft: "123 maple st",
      normalized_address: {
        fixture_address_key: "maple-austin",
        formatted_address: "123 Maple St, Austin, TX 78704",
        street_line: "123 Maple St",
        locality: "Austin",
        region: "TX",
        postal_code: "78704",
      },
    });
    expect(adapters.address.resolve("125 Maple St")).toBeNull();
    expect(adapters.fixture.source_kind).toBe("SEEDED_DEMO_IMAGERY");
    expect(adapters.fixture.certainty_kind).toBe("DEMO_PROPERTY_MATCH");
  });

  it("uses injected identity and clock boundaries and keeps the schedule inert", () => {
    const timeout = vi.spyOn(globalThis, "setTimeout");
    const { runtime, identity, schedule } = createRuntimeHarness();
    const confirmation = startProject(runtime);

    expect(identity.projectCount).toBe(1);
    expect(confirmation.session_project_id).toBe("project-test-1");
    expect(confirmation.events[0]?.occurred_at).toBe(
      "2026-01-01T00:00:00.000Z",
    );
    expect(schedule.nextEvent(confirmation)).toBeNull();
    expect(timeout).not.toHaveBeenCalled();
    timeout.mockRestore();
  });
});
