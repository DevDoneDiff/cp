import { describe, expect, it } from "vitest";

import {
  parseSessionProjectProjection,
  serializeSessionProjectProjection,
} from "../../src/project/domain/projection";
import {
  seededCandidateEventId,
  seededPanelId,
} from "../../src/project/domain/identity";
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
    const partial = createRuntimeHarness();
    startProject(partial.runtime);
    confirmProject(partial.runtime);
    partial.runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
    const roofReady = partial.runtime.getSnapshot().projection;
    if (roofReady?.property === null || roofReady === null) {
      throw new Error("ROOF_READY_PROJECT_MISSING");
    }
    const roofIndex = roofReady.events.findIndex(
      (event) => event.type === "ROOF_GEOMETRY_READY",
    );
    const candidateOrdinal = roofReady.events.filter(
      (event) => event.type === "ADDRESS_RESOLVED",
    ).length;
    const futurePanelEventId = seededCandidateEventId(
      partial.identity,
      roofReady.session_project_id,
      candidateOrdinal,
      "panel-added:1",
    );
    const futurePanelObjectId = seededPanelId(
      partial.identity,
      roofReady.session_project_id,
      roofReady.property.property_id,
      adapters.fixture.panels[0]!.fixture_panel_key,
    );
    if (roofIndex < 0) {
      throw new Error("ROOF_EVENT_MISSING");
    }

    const futureEventPoison = clone(roofReady);
    futureEventPoison.events[roofIndex]!.event_id = futurePanelEventId;
    futureEventPoison.accepted_event_ids[roofIndex] = futurePanelEventId;
    cases.push(futureEventPoison);

    const futureSurfacePoison = clone(roofReady);
    const surfaceEvent = futureSurfacePoison.events[roofIndex];
    if (surfaceEvent?.type !== "ROOF_GEOMETRY_READY") {
      throw new Error("ROOF_EVENT_MISSING");
    }
    surfaceEvent.payload.surfaces[0]!.surface_id = futurePanelObjectId;
    futureSurfacePoison.roof_surfaces[0]!.surface_id = futurePanelObjectId;
    cases.push(futureSurfacePoison);

    partial.runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
    const onePanel = partial.runtime.getSnapshot().projection;
    if (onePanel?.property === null || onePanel === null) {
      throw new Error("PANEL_PROJECT_MISSING");
    }
    const panelIndex = onePanel.events.findIndex(
      (event) => event.type === "PANEL_OBJECT_ADDED",
    );
    const futureSecondPanelId = seededPanelId(
      partial.identity,
      onePanel.session_project_id,
      onePanel.property.property_id,
      adapters.fixture.panels[1]!.fixture_panel_key,
    );
    const futurePanelPoison = clone(onePanel);
    const poisonedPanelEvent = futurePanelPoison.events[panelIndex];
    if (poisonedPanelEvent?.type !== "PANEL_OBJECT_ADDED") {
      throw new Error("PANEL_EVENT_MISSING");
    }
    poisonedPanelEvent.payload.panel.panel_id = futureSecondPanelId;
    futurePanelPoison.panel_objects[0]!.panel_id = futureSecondPanelId;
    cases.push(futurePanelPoison);
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
