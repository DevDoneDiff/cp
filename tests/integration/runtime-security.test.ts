import { afterEach, describe, expect, it, vi } from "vitest";

import { SESSION_PROJECT_STORAGE_KEY } from "../../src/project/adapters/browser-runtime";
import type { ProjectEvent } from "../../src/project/domain/model";
import {
  confirmProject,
  createRuntimeHarness,
  MemoryStorage,
  startProject,
} from "../helpers/project-runtime";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("session runtime trust boundaries", () => {
  it("rejects malicious stored claims without leaking or rendering the payload", () => {
    const storage = new MemoryStorage();
    storage.values.set(
      SESSION_PROJECT_STORAGE_KEY,
      JSON.stringify({
        schema_version: 1,
        fixture_version: "seeded-maple-austin-v1",
        address_draft: '<img src="https://evil.example" onerror="steal()">',
        source_kind: "GOOGLE_VERIFIED",
      }),
    );
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { runtime } = createRuntimeHarness({ storage });

    runtime.dispatch({ type: "RESTORE_SESSION" });
    expect(runtime.getSnapshot()).toMatchObject({
      projection: null,
      visible_state: "ADDRESS_ENTRY",
      restore_status: "recovered_invalid",
    });
    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("rejects malformed, unsafe, foreign, replay-collision, and impossible event input atomically", () => {
    const { runtime, schedule, adapters } = createRuntimeHarness();
    startProject(runtime);
    const confirmed = confirmProject(runtime);
    const validRoof = schedule.nextEvent(confirmed);
    if (validRoof === null) throw new Error("ROOF_EVENT_MISSING");
    const initial = runtime.getSnapshot().projection;

    const invalidEvents: unknown[] = [
      null,
      [],
      { type: "ROOF_GEOMETRY_READY" },
      { ...validRoof, cursor: -1 },
      { ...validRoof, cursor: 2.5 },
      { ...validRoof, expected_project_version: -1 },
      { ...validRoof, session_project_id: "project-foreign" },
      { ...validRoof, property_id: "property-foreign" },
      { ...validRoof, event_id: "x".repeat(161) },
      { ...validRoof, event_id: confirmed.property?.property_id },
      {
        ...validRoof,
        type: "ENERGY_MODEL_READY",
        payload: { energy_model: adapters.fixture.energy },
      },
      {
        ...validRoof,
        payload: {
          ...validRoof.payload,
          surfaces:
            validRoof.type === "ROOF_GEOMETRY_READY"
              ? [
                  {
                    ...validRoof.payload.surfaces[0],
                    polygon: [{ x: Number.NaN, y: 0 }],
                  },
                ]
              : [],
        },
      },
    ];

    for (const event of invalidEvents) {
      expect(
        runtime.dispatch({ type: "APPLY_WORK_EVENT", event }),
      ).toMatchObject({ ok: false });
      expect(runtime.getSnapshot().projection).toEqual(initial);
    }

    runtime.dispatch({ type: "APPLY_WORK_EVENT", event: validRoof });
    const accepted = runtime.getSnapshot().projection;
    expect(
      runtime.dispatch({ type: "APPLY_WORK_EVENT", event: validRoof }),
    ).toEqual({ ok: true, outcome: "idempotent" });
    const collision = {
      ...validRoof,
      occurred_at: "2026-01-01T00:05:00.000Z",
    } satisfies ProjectEvent;
    expect(
      runtime.dispatch({ type: "APPLY_WORK_EVENT", event: collision }),
    ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });
    expect(runtime.getSnapshot().projection).toEqual(accepted);
  });

  it("uses only the injected session store and performs no provider, durable, or browser-global write", () => {
    const fetch = vi.fn(() => {
      throw new Error("FETCH_MUST_NOT_RUN");
    });
    const beacon = vi.fn(() => {
      throw new Error("BEACON_MUST_NOT_RUN");
    });
    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal(
      "EventSource",
      class {
        constructor() {
          throw new Error("EVENT_SOURCE_MUST_NOT_RUN");
        }
      },
    );
    vi.stubGlobal("navigator", { sendBeacon: beacon });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new Error("LOCAL_STORAGE_MUST_NOT_RUN");
      },
    });

    const storage = new MemoryStorage();
    const { runtime } = createRuntimeHarness({ storage });
    startProject(runtime);
    confirmProject(runtime);
    runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });

    expect(fetch).not.toHaveBeenCalled();
    expect(beacon).not.toHaveBeenCalled();
    expect([...storage.values.keys()]).toEqual([SESSION_PROJECT_STORAGE_KEY]);
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });
});
