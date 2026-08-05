import { describe, expect, it, vi } from "vitest";

import type {
  SessionProjectRuntime,
  SessionProjectStore,
} from "../../src/project/application/session-project-runtime";
import { assemblyFeedCursorFromProjection } from "../../src/project/application/live-roof-assembly";
import {
  BrowserSessionProjectStore,
  LEGACY_SESSION_PROJECT_STORAGE_KEY,
  SESSION_PROJECT_STORAGE_KEY,
} from "../../src/project/adapters/browser-runtime";
import {
  assemblyEventIndexAfter,
  createSeededAssemblyEvent,
} from "../../src/project/adapters/seeded-assembly-feed";
import type { SessionProjectProjection } from "../../src/project/domain/model";
import {
  advanceProjectToReady,
  confirmProject,
  createRuntimeHarness,
  MemoryStorage,
  startProject,
} from "../helpers/project-runtime";

const restoreCases: Array<{
  label: string;
  prepare: (runtime: SessionProjectRuntime) => SessionProjectProjection;
  provesNextPanel: boolean;
}> = [
  {
    label: "property confirmation",
    prepare: (runtime) => startProject(runtime),
    provesNextPanel: false,
  },
  {
    label: "partial assembly",
    prepare: (runtime) => {
      startProject(runtime);
      confirmProject(runtime);
      runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
      runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
      const projection = runtime.getSnapshot().projection;
      if (projection === null) throw new Error("PARTIAL_PROJECT_MISSING");
      return projection;
    },
    provesNextPanel: true,
  },
  {
    label: "minimum usable ready",
    prepare: (runtime) => {
      startProject(runtime);
      confirmProject(runtime);
      return advanceProjectToReady(runtime);
    },
    provesNextPanel: false,
  },
];

const FROZEN_V1_ROOF_POLYGONS = {
  "south-main": [
    { x: 0.16, y: 0.2 },
    { x: 0.68, y: 0.2 },
    { x: 0.78, y: 0.58 },
    { x: 0.22, y: 0.58 },
  ],
  "west-wing": [
    { x: 0.22, y: 0.58 },
    { x: 0.78, y: 0.58 },
    { x: 0.66, y: 0.82 },
    { x: 0.28, y: 0.82 },
  ],
} as const;

const FROZEN_V1_PANEL_GEOMETRY = [
  { x: 0.28, y: 0.3, width: 0.08, height: 0.16, rotation_degrees: 2 },
  { x: 0.38, y: 0.3, width: 0.08, height: 0.16, rotation_degrees: 2 },
] as const;

function deliveredV1Projection(
  projection: SessionProjectProjection,
): Partial<SessionProjectProjection> {
  const legacy = structuredClone(projection);
  delete (legacy as Partial<SessionProjectProjection>)
    .assembly_provenance_contract;
  return legacy;
}

describe("browser-session project persistence", () => {
  it.each(restoreCases)(
    "restores $label with every accepted identity and cursor intact",
    ({ prepare, provesNextPanel }) => {
      const storage = new MemoryStorage();
      const first = createRuntimeHarness({ storage });
      const expected = structuredClone(prepare(first.runtime));
      const writesBeforeRestore = storage.writes;

      const second = createRuntimeHarness({ storage });
      expect(second.runtime.dispatch({ type: "RESTORE_SESSION" })).toEqual({
        ok: true,
        outcome: "restored",
      });
      expect(second.runtime.getSnapshot().projection).toEqual(expected);
      expect(storage.writes).toBe(writesBeforeRestore);
      expect(second.runtime.getSnapshot()).toMatchObject({
        visible_state: expected.visible_state,
        restore_status: "restored",
      });

      if (provesNextPanel) {
        const existingPanelIds = expected.panel_objects.map(
          (panel) => panel.panel_id,
        );
        const existingEventCount = expected.events.length;
        expect(
          second.runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" }),
        ).toEqual({ ok: true, outcome: "accepted" });
        const advanced = second.runtime.getSnapshot().projection;
        expect(advanced?.events).toHaveLength(existingEventCount + 1);
        expect(advanced?.panel_objects).toHaveLength(
          existingPanelIds.length + 1,
        );
        expect(
          new Set(advanced?.panel_objects.map((panel) => panel.panel_id)).size,
        ).toBe(existingPanelIds.length + 1);
        expect(
          advanced?.panel_objects
            .slice(0, existingPanelIds.length)
            .map((panel) => panel.panel_id),
        ).toEqual(existingPanelIds);
      }
    },
  );

  it("restores and continues a historical v1 partial projection with frozen geometry", () => {
    const source = createRuntimeHarness();
    startProject(source.runtime);
    confirmProject(source.runtime);
    source.runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
    source.runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
    const current = source.runtime.getSnapshot().projection;
    if (current === null) throw new Error("PARTIAL_PROJECT_MISSING");
    const historical = structuredClone(current);
    const confirmation = historical.events.findLast(
      (event) => event.type === "PROPERTY_CONFIRMED",
    );
    const roofEvent = historical.events.find(
      (event) => event.type === "ROOF_GEOMETRY_READY",
    );
    const panelEvent = historical.events.find(
      (event) => event.type === "PANEL_OBJECT_ADDED",
    );
    if (
      confirmation?.type !== "PROPERTY_CONFIRMED" ||
      roofEvent?.type !== "ROOF_GEOMETRY_READY" ||
      panelEvent?.type !== "PANEL_OBJECT_ADDED"
    ) {
      throw new Error("HISTORICAL_EVENTS_MISSING");
    }

    for (const [index, surface] of historical.roof_surfaces.entries()) {
      const frozen =
        FROZEN_V1_ROOF_POLYGONS[
          surface.fixture_surface_key as keyof typeof FROZEN_V1_ROOF_POLYGONS
        ];
      if (frozen === undefined) throw new Error("FROZEN_SURFACE_MISSING");
      surface.polygon = frozen.map((point) => ({ ...point }));
      const eventSurface = roofEvent.payload.surfaces[index];
      if (eventSurface === undefined) throw new Error("EVENT_SURFACE_MISSING");
      eventSurface.polygon = frozen.map((point) => ({ ...point }));
    }
    historical.panel_objects[0]!.geometry = structuredClone(
      FROZEN_V1_PANEL_GEOMETRY[0],
    );
    panelEvent.payload.panel.geometry = structuredClone(
      FROZEN_V1_PANEL_GEOMETRY[0],
    );
    const confirmationTime = new Date(confirmation.occurred_at).getTime();
    roofEvent.occurred_at = new Date(confirmationTime + 4_321).toISOString();
    panelEvent.occurred_at = new Date(confirmationTime + 83_777).toISOString();
    historical.updated_at = panelEvent.occurred_at;
    const legacyHistorical: Partial<SessionProjectProjection> =
      structuredClone(historical);
    delete legacyHistorical.assembly_provenance_contract;

    const backwardHistorical = structuredClone(legacyHistorical);
    const backwardPanel = backwardHistorical.events?.find(
      (event) => event.type === "PANEL_OBJECT_ADDED",
    );
    if (backwardPanel?.type !== "PANEL_OBJECT_ADDED") {
      throw new Error("BACKWARD_PANEL_EVENT_MISSING");
    }
    backwardPanel.occurred_at = new Date(
      confirmationTime + 3_000,
    ).toISOString();
    backwardHistorical.updated_at = backwardPanel.occurred_at;
    const backwardStorage = new MemoryStorage();
    backwardStorage.values.set(
      LEGACY_SESSION_PROJECT_STORAGE_KEY,
      JSON.stringify(backwardHistorical),
    );
    const backwardTarget = createRuntimeHarness({ storage: backwardStorage });
    expect(
      backwardTarget.runtime.dispatch({ type: "RESTORE_SESSION" }),
    ).toEqual({ ok: true, outcome: "empty" });
    expect(backwardTarget.runtime.getSnapshot()).toMatchObject({
      projection: null,
      restore_status: "recovered_invalid",
    });
    expect(backwardStorage.values.has(LEGACY_SESSION_PROJECT_STORAGE_KEY)).toBe(
      false,
    );

    const storage = new MemoryStorage();
    storage.values.set(
      LEGACY_SESSION_PROJECT_STORAGE_KEY,
      JSON.stringify(legacyHistorical),
    );
    const target = createRuntimeHarness({ storage });
    expect(target.runtime.dispatch({ type: "RESTORE_SESSION" })).toEqual({
      ok: true,
      outcome: "restored",
    });
    const restored = target.runtime.getSnapshot().projection;
    expect(target.runtime.getSnapshot().restore_status).toBe("restored");
    expect(restored?.assembly_provenance_contract).toBe("LEGACY_UNVERIFIED_V1");
    expect(restored?.roof_surfaces.map((surface) => surface.polygon)).toEqual(
      Object.values(FROZEN_V1_ROOF_POLYGONS),
    );
    expect(restored?.panel_objects[0]?.geometry).toEqual(
      FROZEN_V1_PANEL_GEOMETRY[0],
    );

    const surfaceIds = restored?.roof_surfaces.map(
      (surface) => surface.surface_id,
    );
    const firstPanelId = restored?.panel_objects[0]?.panel_id;
    const eventCount = restored?.events.length;
    const cursor = restored?.latest_cursor;
    if (restored === null) throw new Error("RESTORED_PROJECT_MISSING");
    const restoredPanelEvent = restored.events.find(
      (event) => event.type === "PANEL_OBJECT_ADDED",
    );
    if (restoredPanelEvent === undefined) {
      throw new Error("RESTORED_PANEL_EVENT_MISSING");
    }
    expect(
      target.runtime.dispatch({
        type: "APPLY_WORK_EVENT",
        event: restoredPanelEvent,
      }),
    ).toEqual({ ok: true, outcome: "idempotent" });
    const feedCursor = assemblyFeedCursorFromProjection(restored);
    if (feedCursor === null) throw new Error("ASSEMBLY_CURSOR_MISSING");
    const nextEvent = createSeededAssemblyEvent(
      feedCursor,
      assemblyEventIndexAfter(feedCursor),
    );
    expect(
      target.runtime.dispatch({ type: "APPLY_WORK_EVENT", event: nextEvent }),
    ).toEqual({
      ok: true,
      outcome: "accepted",
    });
    const writesAfterContinuation = storage.writes;
    expect(
      target.runtime.dispatch({ type: "APPLY_WORK_EVENT", event: nextEvent }),
    ).toEqual({ ok: true, outcome: "idempotent" });
    expect(storage.writes).toBe(writesAfterContinuation);
    const timestampCollision = {
      ...nextEvent,
      occurred_at: new Date(
        new Date(historical.updated_at).getTime() + 1,
      ).toISOString(),
    };
    expect(
      target.runtime.dispatch({
        type: "APPLY_WORK_EVENT",
        event: timestampCollision,
      }),
    ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });
    expect(storage.writes).toBe(writesAfterContinuation);
    const continued = target.runtime.getSnapshot().projection;
    expect(
      continued?.roof_surfaces.map((surface) => surface.surface_id),
    ).toEqual(surfaceIds);
    expect(continued?.panel_objects[0]?.panel_id).toBe(firstPanelId);
    expect(continued?.panel_objects[0]?.geometry).toEqual(
      FROZEN_V1_PANEL_GEOMETRY[0],
    );
    expect(continued?.panel_objects[1]?.geometry).toEqual(
      FROZEN_V1_PANEL_GEOMETRY[1],
    );
    expect(continued?.events).toHaveLength((eventCount ?? 0) + 1);
    expect(continued?.latest_cursor).toBe((cursor ?? 0) + 1);
    expect(
      new Date(continued?.updated_at ?? 0).getTime(),
    ).toBeGreaterThanOrEqual(new Date(historical.updated_at).getTime());
    expect(
      new Set(continued?.panel_objects.map((panel) => panel.panel_id)).size,
    ).toBe(2);
    expect(storage.values.has(SESSION_PROJECT_STORAGE_KEY)).toBe(false);
    expect(storage.values.has(LEGACY_SESSION_PROJECT_STORAGE_KEY)).toBe(true);

    const reloaded = createRuntimeHarness({ storage });
    expect(reloaded.runtime.dispatch({ type: "RESTORE_SESSION" })).toEqual({
      ok: true,
      outcome: "restored",
    });
    expect(reloaded.runtime.getSnapshot().projection).toMatchObject({
      assembly_provenance_contract: "LEGACY_UNVERIFIED_V1",
      latest_cursor: continued?.latest_cursor,
      panel_objects: continued?.panel_objects,
    });
  });

  it("rejects simultaneous valid canonical-v2 and delivered-v1 storage", () => {
    const source = createRuntimeHarness();
    const canonical = startProject(source.runtime);
    const storage = new MemoryStorage();
    storage.values.set(SESSION_PROJECT_STORAGE_KEY, JSON.stringify(canonical));
    storage.values.set(
      LEGACY_SESSION_PROJECT_STORAGE_KEY,
      JSON.stringify(deliveredV1Projection(canonical)),
    );

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
    expect(storage.values.has(SESSION_PROJECT_STORAGE_KEY)).toBe(false);
    expect(storage.values.has(LEGACY_SESSION_PROJECT_STORAGE_KEY)).toBe(false);
    expect(storage.removals).toBe(2);
    expect(storage.writes).toBe(0);
  });

  it("rejects opposite-key publication after either provenance contract is active", () => {
    const canonicalStorage = new MemoryStorage();
    const canonical = createRuntimeHarness({ storage: canonicalStorage });
    const canonicalConfirmation = startProject(canonical.runtime);
    const canonicalSerialized = canonicalStorage.values.get(
      SESSION_PROJECT_STORAGE_KEY,
    );
    canonicalStorage.values.set(
      LEGACY_SESSION_PROJECT_STORAGE_KEY,
      JSON.stringify(deliveredV1Projection(canonicalConfirmation)),
    );
    const canonicalWrites = canonicalStorage.writes;

    expect(canonical.runtime.dispatch({ type: "CONFIRM_PROPERTY" })).toEqual({
      ok: false,
      error_code: "STORAGE_UNAVAILABLE",
    });
    expect(canonical.runtime.getSnapshot().projection).toEqual(
      canonicalConfirmation,
    );
    expect(canonicalStorage.writes).toBe(canonicalWrites);
    expect(canonicalStorage.values.get(SESSION_PROJECT_STORAGE_KEY)).toBe(
      canonicalSerialized,
    );

    const legacySource = createRuntimeHarness();
    const legacyConfirmation = startProject(legacySource.runtime);
    const legacyStorage = new MemoryStorage();
    const legacySerialized = JSON.stringify(
      deliveredV1Projection(legacyConfirmation),
    );
    legacyStorage.values.set(
      LEGACY_SESSION_PROJECT_STORAGE_KEY,
      legacySerialized,
    );
    const legacy = createRuntimeHarness({ storage: legacyStorage });
    expect(legacy.runtime.dispatch({ type: "RESTORE_SESSION" })).toEqual({
      ok: true,
      outcome: "restored",
    });
    legacyStorage.values.set(
      SESSION_PROJECT_STORAGE_KEY,
      JSON.stringify(legacyConfirmation),
    );
    const legacyWrites = legacyStorage.writes;

    expect(legacy.runtime.dispatch({ type: "CONFIRM_PROPERTY" })).toEqual({
      ok: false,
      error_code: "STORAGE_UNAVAILABLE",
    });
    expect(legacy.runtime.getSnapshot().projection).toMatchObject({
      visible_state: "PROPERTY_CONFIRMATION",
      assembly_provenance_contract: "LEGACY_UNVERIFIED_V1",
    });
    expect(legacyStorage.writes).toBe(legacyWrites);
    expect(legacyStorage.values.get(LEGACY_SESSION_PROJECT_STORAGE_KEY)).toBe(
      legacySerialized,
    );
  });

  it("rejects a self-coherent stored projection with an altered work timestamp", () => {
    const source = createRuntimeHarness();
    startProject(source.runtime);
    confirmProject(source.runtime);
    source.runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
    const current = source.runtime.getSnapshot().projection;
    if (current === null) throw new Error("PARTIAL_PROJECT_MISSING");
    const forged = structuredClone(current);
    const roofEvent = forged.events.find(
      (event) => event.type === "ROOF_GEOMETRY_READY",
    );
    if (roofEvent?.type !== "ROOF_GEOMETRY_READY") {
      throw new Error("ROOF_EVENT_MISSING");
    }
    roofEvent.occurred_at = new Date(
      new Date(roofEvent.occurred_at).getTime() + 1,
    ).toISOString();
    forged.updated_at = roofEvent.occurred_at;

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
    expect(storage.removals).toBe(1);
    expect(storage.writes).toBe(0);
  });

  it("rejects canonical-to-legacy substitution, mixed timing, and current-key downgrade", () => {
    const source = createRuntimeHarness();
    startProject(source.runtime);
    const confirmed = confirmProject(source.runtime);
    source.runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
    source.runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
    const current = source.runtime.getSnapshot().projection;
    if (current === null) throw new Error("PARTIAL_PROJECT_MISSING");

    const substituted = structuredClone(current);
    const substitutedRoof = substituted.events.find(
      (event) => event.type === "ROOF_GEOMETRY_READY",
    );
    if (substitutedRoof?.type !== "ROOF_GEOMETRY_READY") {
      throw new Error("ROOF_EVENT_MISSING");
    }
    substitutedRoof.occurred_at = new Date(
      new Date(confirmed.updated_at).getTime() + 1_000,
    ).toISOString();

    const mixed = structuredClone(current);
    const mixedPanel = mixed.events.find(
      (event) => event.type === "PANEL_OBJECT_ADDED",
    );
    if (mixedPanel?.type !== "PANEL_OBJECT_ADDED") {
      throw new Error("PANEL_EVENT_MISSING");
    }
    mixedPanel.occurred_at = new Date(
      new Date(confirmed.updated_at).getTime() + 83_777,
    ).toISOString();
    mixed.updated_at = mixedPanel.occurred_at;

    const downgraded: Partial<SessionProjectProjection> =
      structuredClone(current);
    delete downgraded.assembly_provenance_contract;
    const retagged = structuredClone(current);
    retagged.assembly_provenance_contract = "LEGACY_UNVERIFIED_V1";

    const invalidCandidates = [
      { key: SESSION_PROJECT_STORAGE_KEY, candidate: substituted },
      { key: SESSION_PROJECT_STORAGE_KEY, candidate: mixed },
      { key: SESSION_PROJECT_STORAGE_KEY, candidate: downgraded },
      { key: SESSION_PROJECT_STORAGE_KEY, candidate: retagged },
      { key: LEGACY_SESSION_PROJECT_STORAGE_KEY, candidate: retagged },
      { key: LEGACY_SESSION_PROJECT_STORAGE_KEY, candidate: current },
    ];
    for (const { key, candidate } of invalidCandidates) {
      const storage = new MemoryStorage();
      storage.values.set(key, JSON.stringify(candidate));
      const target = createRuntimeHarness({ storage });
      expect(target.runtime.dispatch({ type: "RESTORE_SESSION" })).toEqual({
        ok: true,
        outcome: "empty",
      });
      expect(target.runtime.getSnapshot()).toMatchObject({
        projection: null,
        restore_status: "recovered_invalid",
      });
      expect(storage.values.has(key)).toBe(false);
      expect(storage.removals).toBe(1);
    }

    const directStore = new BrowserSessionProjectStore(
      source.adapters,
      source.identity,
      () => new MemoryStorage(),
    );
    expect(directStore.save(retagged)).toEqual({
      ok: false,
      reason: "INVALID",
    });
  });

  it("starts a fresh S1 state for a new browser-session store", () => {
    const first = createRuntimeHarness();
    startProject(first.runtime);

    const fresh = createRuntimeHarness({ storage: new MemoryStorage() });
    expect(fresh.runtime.dispatch({ type: "RESTORE_SESSION" })).toEqual({
      ok: true,
      outcome: "empty",
    });
    expect(fresh.runtime.getSnapshot()).toMatchObject({
      projection: null,
      visible_state: "ADDRESS_ENTRY",
      restore_status: "empty",
    });
  });

  it.each([
    ["invalid JSON", "{"],
    ["null", "null"],
    ["primitive", '"payload"'],
    ["array", "[]"],
    ["oversized", "x".repeat(128_001)],
    ["oversized multibyte", "😀".repeat(40_000)],
    ["prototype key", '{"__proto__":{"polluted":true}}'],
  ])("recovers safely from %s storage", (_label, serialized) => {
    const storage = new MemoryStorage();
    storage.values.set(SESSION_PROJECT_STORAGE_KEY, serialized);
    const { runtime } = createRuntimeHarness({ storage });

    expect(runtime.dispatch({ type: "RESTORE_SESSION" })).toEqual({
      ok: true,
      outcome: "empty",
    });
    expect(runtime.getSnapshot()).toMatchObject({
      projection: null,
      visible_state: "ADDRESS_ENTRY",
      restore_status: "recovered_invalid",
    });
    expect(storage.storedProject()).toBeNull();
    expect(storage.removals).toBe(1);
  });

  it("returns bounded unavailable results when browser storage access throws", () => {
    const storage = new MemoryStorage();
    storage.getError = true;
    const { runtime } = createRuntimeHarness({ storage });
    expect(runtime.dispatch({ type: "RESTORE_SESSION" })).toEqual({
      ok: false,
      error_code: "STORAGE_UNAVAILABLE",
    });
    expect(runtime.getSnapshot()).toMatchObject({
      projection: null,
      visible_state: "ADDRESS_ENTRY",
      restore_status: "unavailable",
    });

    const corrupt = new MemoryStorage();
    corrupt.values.set(SESSION_PROJECT_STORAGE_KEY, "{");
    corrupt.removeError = true;
    const recovery = createRuntimeHarness({ storage: corrupt });
    expect(
      recovery.runtime.dispatch({ type: "RESTORE_SESSION" }),
    ).toMatchObject({ ok: true, outcome: "empty" });
  });

  it("keeps S1 on a failed first write and preserves the last valid projection on later failure", () => {
    const storage = new MemoryStorage();
    storage.setError = true;
    const { runtime } = createRuntimeHarness({ storage });
    runtime.dispatch({ type: "RESTORE_SESSION" });
    expect(
      runtime.dispatch({
        type: "RESOLVE_SEEDED_ADDRESS",
        input: "123 Maple St",
      }),
    ).toEqual({ ok: false, error_code: "STORAGE_UNAVAILABLE" });
    expect(runtime.getSnapshot()).toMatchObject({
      projection: null,
      visible_state: "ADDRESS_ENTRY",
    });
    expect(storage.storedProject()).toBeNull();

    storage.setError = false;
    const confirmation = startProject(runtime);
    const storedConfirmation = storage.storedProject();
    storage.setError = true;
    expect(runtime.dispatch({ type: "CONFIRM_PROPERTY" })).toEqual({
      ok: false,
      error_code: "STORAGE_UNAVAILABLE",
    });
    expect(runtime.getSnapshot().projection).toEqual(confirmation);
    expect(storage.storedProject()).toBe(storedConfirmation);
  });

  it("persists before publishing the proposed project", () => {
    const runtimeReference: { current: SessionProjectRuntime | null } = {
      current: null,
    };
    let observedDuringSave: unknown = "not-called";
    const store: SessionProjectStore = {
      load: () => ({ kind: "empty" }),
      save: (projection) => {
        observedDuringSave = runtimeReference.current?.getSnapshot().projection;
        return { ok: true, projection };
      },
    };
    const harness = createRuntimeHarness({ store });
    const runtime = harness.runtime;
    runtimeReference.current = runtime;
    const listener = vi.fn();
    runtime.subscribe(listener);
    runtime.dispatch({ type: "RESTORE_SESSION" });
    runtime.dispatch({
      type: "RESOLVE_SEEDED_ADDRESS",
      input: "123 Maple St",
    });

    expect(observedDuringSave).toBeNull();
    expect(runtime.getSnapshot().projection).not.toBeNull();
    expect(listener).toHaveBeenCalled();
  });

  it("rejects a noncanonical projection before writing it", () => {
    const storage = new MemoryStorage();
    const { runtime, adapters, identity } = createRuntimeHarness({ storage });
    const valid = startProject(runtime);
    const writes = storage.writes;
    const store = new BrowserSessionProjectStore(
      adapters,
      identity,
      () => storage,
    );
    expect(store.save({ ...valid, source_kind: "GOOGLE" } as never)).toEqual({
      ok: false,
      reason: "INVALID",
    });
    expect(storage.writes).toBe(writes);
  });
});
