import { describe, expect, it, vi } from "vitest";

import type {
  SessionProjectRuntime,
  SessionProjectStore,
} from "../../src/project/application/session-project-runtime";
import {
  BrowserSessionProjectStore,
  SESSION_PROJECT_STORAGE_KEY,
} from "../../src/project/adapters/browser-runtime";
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
