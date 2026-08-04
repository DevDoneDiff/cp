import { describe, expect, it } from "vitest";

import {
  parseSessionProjectProjection,
  serializeSessionProjectProjection,
} from "../../src/project/domain/projection";
import {
  advanceProjectToReady,
  confirmProject,
  createRuntimeHarness,
  startProject,
} from "../helpers/project-runtime";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe("session project projection validation", () => {
  it("round-trips the complete canonical event-derived projection", () => {
    const { runtime, adapters, identity } = createRuntimeHarness();
    startProject(runtime);
    confirmProject(runtime);
    const ready = advanceProjectToReady(runtime);

    const parsed = parseSessionProjectProjection(
      ready,
      adapters.fixture,
      identity,
    );
    expect(parsed).toEqual({ ok: true, projection: ready });
    const serialized = serializeSessionProjectProjection(
      ready,
      adapters.fixture,
      identity,
    );
    expect(serialized.ok).toBe(true);
    if (serialized.ok) {
      expect(JSON.parse(serialized.serialized)).toEqual(ready);
    }
  });

  it.each([
    ["primitive", "malicious"],
    ["array", []],
    ["null", null],
  ])("rejects a %s instead of a projection", (_label, value) => {
    const { adapters, identity } = createRuntimeHarness();
    expect(
      parseSessionProjectProjection(value, adapters.fixture, identity),
    ).toEqual({
      ok: false,
      reason: "INVALID_PROJECTION",
    });
  });

  it("rejects incompatible, extra, false-source, and event-incoherent stored state", () => {
    const { runtime, adapters, identity } = createRuntimeHarness();
    startProject(runtime);
    confirmProject(runtime);
    const ready = advanceProjectToReady(runtime);

    const cases: unknown[] = [];
    cases.push({ ...clone(ready), schema_version: 99 });
    cases.push({ ...clone(ready), fixture_version: "seeded-future-v2" });
    cases.push({ ...clone(ready), unexpected: "field" });
    cases.push({ ...clone(ready), source_kind: "GOOGLE_VERIFIED" });
    cases.push({ ...clone(ready), latest_cursor: ready.latest_cursor + 1 });
    cases.push({ ...clone(ready), project_version: ready.project_version + 1 });
    cases.push({
      ...clone(ready),
      accepted_event_ids: [...ready.accepted_event_ids, "event-injected"],
    });
    const selectedPanel = clone(ready);
    selectedPanel.panel_objects[0]!.selection_state = "selected";
    cases.push(selectedPanel);
    const foreignEvent = clone(ready);
    foreignEvent.events[2]!.session_project_id = "project-foreign";
    cases.push(foreignEvent);
    const cursorGap = clone(ready);
    cursorGap.events[3]!.cursor += 1;
    cases.push(cursorGap);
    const futureIdentityPoison = clone(ready);
    const roofIndex = futureIdentityPoison.events.findIndex(
      (event) => event.type === "ROOF_GEOMETRY_READY",
    );
    const panelIndex = futureIdentityPoison.events.findIndex(
      (event) => event.type === "PANEL_OBJECT_ADDED",
    );
    if (roofIndex < 0 || panelIndex < 0) {
      throw new Error("IDENTITY_EVENTS_MISSING");
    }
    const futurePanelEventId =
      futureIdentityPoison.events[panelIndex]!.event_id;
    futureIdentityPoison.events[roofIndex]!.event_id = futurePanelEventId;
    futureIdentityPoison.accepted_event_ids[roofIndex] = futurePanelEventId;
    cases.push(futureIdentityPoison);
    const rawPrototypeKey = JSON.parse(
      `${JSON.stringify(ready).slice(0, -1)},"__proto__":{"polluted":true}}`,
    ) as unknown;
    cases.push(rawPrototypeKey);

    for (const candidate of cases) {
      expect(
        parseSessionProjectProjection(candidate, adapters.fixture, identity),
      ).toEqual({ ok: false, reason: "INVALID_PROJECTION" });
    }
  });
});
