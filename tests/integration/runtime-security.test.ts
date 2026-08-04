import { afterEach, describe, expect, it, vi } from "vitest";

import { SESSION_PROJECT_STORAGE_KEY } from "../../src/project/adapters/browser-runtime";
import {
  createPropertyConfirmedEvent,
  createPropertyCorrectionEvent,
} from "../../src/project/adapters/seeded-demo";
import {
  seededCandidateEventId,
  seededPanelId,
} from "../../src/project/domain/identity";
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

  it("rejects stored flags that attempt to bypass explicit property confirmation", () => {
    const source = createRuntimeHarness();
    const confirmation = startProject(source.runtime);
    const forgedCases = [
      { ...structuredClone(confirmation), visible_state: "LIVE_ROOF_ASSEMBLY" },
      { ...structuredClone(confirmation), minimum_usable_ready: true },
    ];

    for (const forged of forgedCases) {
      const storage = new MemoryStorage();
      storage.values.set(SESSION_PROJECT_STORAGE_KEY, JSON.stringify(forged));
      const target = createRuntimeHarness({ storage });

      expect(target.runtime.dispatch({ type: "RESTORE_SESSION" })).toEqual({
        ok: true,
        outcome: "empty",
      });
      expect(target.runtime.getSnapshot()).toMatchObject({
        projection: null,
        visible_state: "ADDRESS_ENTRY",
        restore_status: "recovered_invalid",
      });
      expect(storage.storedProject()).toBeNull();
      expect(storage.writes).toBe(0);
      expect(storage.removals).toBe(1);
    }
  });

  it("rejects malformed, unsafe, foreign, replay-collision, and impossible event input atomically", () => {
    const { runtime, schedule, adapters, storage } = createRuntimeHarness();
    startProject(runtime);
    const confirmed = confirmProject(runtime);
    const validRoof = schedule.nextEvent(confirmed);
    if (validRoof === null) throw new Error("ROOF_EVENT_MISSING");
    const initial = structuredClone(runtime.getSnapshot().projection);
    const initialWrites = storage.writes;

    const invalidEvents: unknown[] = [
      null,
      [],
      { type: "ROOF_GEOMETRY_READY" },
      { ...validRoof, cursor: -1 },
      { ...validRoof, cursor: 2.5 },
      { ...validRoof, expected_project_version: -1 },
      {
        ...validRoof,
        expected_project_version: validRoof.expected_project_version + 1,
      },
      { ...validRoof, cursor: validRoof.cursor - 1 },
      { ...validRoof, schema_version: 99 },
      { ...validRoof, fixture_version: "seeded-future-v2" },
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
      expect(storage.writes).toBe(initialWrites);
    }

    runtime.dispatch({ type: "APPLY_WORK_EVENT", event: validRoof });
    const accepted = structuredClone(runtime.getSnapshot().projection);
    const acceptedWrites = storage.writes;
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
    expect(storage.writes).toBe(acceptedWrites);
  });

  it("keeps address, correction, and confirmation authority behind dedicated commands", () => {
    const source = createRuntimeHarness();
    const sourceConfirmation = startProject(source.runtime);
    const addressEvent = sourceConfirmation.events[0];
    if (addressEvent?.type !== "ADDRESS_RESOLVED") {
      throw new Error("ADDRESS_EVENT_MISSING");
    }

    const fresh = createRuntimeHarness();
    expect(
      fresh.runtime.dispatch({
        type: "APPLY_WORK_EVENT",
        event: addressEvent,
      }),
    ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });
    expect(fresh.runtime.getSnapshot().projection).toBeNull();
    expect(fresh.storage.writes).toBe(0);

    const target = createRuntimeHarness();
    const targetConfirmation = startProject(target.runtime);
    const confirmationEvent = createPropertyConfirmedEvent(
      targetConfirmation,
      target.identity,
      target.clock,
    );
    const correctionEvent = createPropertyCorrectionEvent(
      targetConfirmation,
      target.identity,
      target.clock,
    );
    if (confirmationEvent === null || correctionEvent === null) {
      throw new Error("AUTHORITY_EVENT_MISSING");
    }
    const before = structuredClone(target.runtime.getSnapshot().projection);
    const writes = target.storage.writes;

    for (const event of [confirmationEvent, correctionEvent]) {
      expect(
        target.runtime.dispatch({ type: "APPLY_WORK_EVENT", event }),
      ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });
      expect(target.runtime.getSnapshot().projection).toEqual(before);
      expect(target.storage.writes).toBe(writes);
    }
  });

  it("rejects future event and object identity collisions without poisoning legitimate progress", () => {
    const { runtime, schedule, adapters, identity, storage } =
      createRuntimeHarness();
    startProject(runtime);
    const confirmed = confirmProject(runtime);
    const property = confirmed.property;
    const validRoof = schedule.nextEvent(confirmed);
    if (property === null || validRoof?.type !== "ROOF_GEOMETRY_READY") {
      throw new Error("ROOF_EVENT_MISSING");
    }
    const candidateOrdinal = confirmed.events.filter(
      (event) => event.type === "ADDRESS_RESOLVED",
    ).length;
    const futurePanelEventId = seededCandidateEventId(
      identity,
      confirmed.session_project_id,
      candidateOrdinal,
      "panel-added:1",
    );
    const futurePanelObjectId = seededPanelId(
      identity,
      confirmed.session_project_id,
      property.property_id,
      adapters.fixture.panels[0]!.fixture_panel_key,
    );
    const beforeRoof = structuredClone(confirmed);
    const writesBeforeRoof = storage.writes;

    for (const forgedRoof of [
      { ...validRoof, event_id: futurePanelEventId },
      {
        ...validRoof,
        payload: {
          ...validRoof.payload,
          surfaces: validRoof.payload.surfaces.map((surface, index) =>
            index === 0
              ? { ...surface, surface_id: futurePanelObjectId }
              : surface,
          ),
        },
      },
    ]) {
      expect(
        runtime.dispatch({ type: "APPLY_WORK_EVENT", event: forgedRoof }),
      ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });
      expect(runtime.getSnapshot().projection).toEqual(beforeRoof);
      expect(storage.writes).toBe(writesBeforeRoof);
    }

    expect(
      runtime.dispatch({ type: "APPLY_WORK_EVENT", event: validRoof }),
    ).toEqual({ ok: true, outcome: "accepted" });
    const roofAccepted = runtime.getSnapshot().projection;
    if (roofAccepted === null) throw new Error("ROOF_NOT_ACCEPTED");
    const validPanel = schedule.nextEvent(roofAccepted);
    if (validPanel?.type !== "PANEL_OBJECT_ADDED") {
      throw new Error("PANEL_EVENT_MISSING");
    }
    const futureSecondPanelId = seededPanelId(
      identity,
      roofAccepted.session_project_id,
      property.property_id,
      adapters.fixture.panels[1]!.fixture_panel_key,
    );
    const beforePanel = structuredClone(roofAccepted);
    const writesBeforePanel = storage.writes;
    expect(
      runtime.dispatch({
        type: "APPLY_WORK_EVENT",
        event: {
          ...validPanel,
          payload: {
            panel: {
              ...validPanel.payload.panel,
              panel_id: futureSecondPanelId,
            },
          },
        },
      }),
    ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });
    expect(runtime.getSnapshot().projection).toEqual(beforePanel);
    expect(storage.writes).toBe(writesBeforePanel);

    expect(
      runtime.dispatch({ type: "APPLY_WORK_EVENT", event: validPanel }),
    ).toEqual({ ok: true, outcome: "accepted" });
    expect(runtime.getSnapshot().projection?.panel_objects).toEqual([
      validPanel.payload.panel,
    ]);
  });

  it("bounds malformed address input before normalization, identity, or persistence", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { runtime, identity, storage } = createRuntimeHarness();
    runtime.dispatch({ type: "RESTORE_SESSION" });

    for (const input of [
      null,
      { address: "123 Maple St" },
      "x".repeat(241),
      "123\u0000Maple St",
    ]) {
      expect(
        runtime.dispatch({
          type: "RESOLVE_SEEDED_ADDRESS",
          input,
        } as never),
      ).toEqual({ ok: false, error_code: "ADDRESS_NOT_SUPPORTED" });
    }

    expect(runtime.getSnapshot().projection).toBeNull();
    expect(identity.projectCount).toBe(0);
    expect(storage.writes).toBe(0);
    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("does not expose mutable aliases of canonical runtime state", () => {
    const { runtime, storage } = createRuntimeHarness();
    startProject(runtime);
    const expected = structuredClone(runtime.getSnapshot());
    const writes = storage.writes;
    const exposed = runtime.getSnapshot() as unknown as {
      visible_state: string;
      projection: {
        property: { display_address: string };
        events: unknown[];
      };
    };

    expect(Reflect.set(exposed, "visible_state", "LIVE_ROOF_ASSEMBLY")).toBe(
      false,
    );
    expect(
      Reflect.set(exposed.projection.property, "display_address", "Injected"),
    ).toBe(false);
    expect(() => exposed.projection.events.push({ injected: true })).toThrow();

    expect(runtime.getSnapshot()).toEqual(expected);
    expect(storage.writes).toBe(writes);
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
