import { afterEach, describe, expect, it, vi } from "vitest";

import { assemblyFeedCursorFromProjection } from "../../src/project/application/live-roof-assembly";
import {
  assemblyEventDueAtMs,
  createSeededAssemblyEvent,
  parseAssemblyFeedRequest,
  seededAssemblyScheduleOffsets,
  SEEDED_ASSEMBLY_EVENT_COUNT,
  SEEDED_ASSEMBLY_VISIBLE_DURATION_MS,
} from "../../src/project/adapters/seeded-assembly-feed";
import type { AssemblyFeedCursor } from "../../src/project/application/live-roof-assembly";
import {
  confirmProject,
  createRuntimeHarness,
  startProject,
} from "../helpers/project-runtime";

function feedUrl(cursor: AssemblyFeedCursor): URL {
  const url = new URL("http://localhost/api/project/assembly/poll");
  url.search = new URLSearchParams({
    fixture_version: cursor.fixtureVersion,
    session_project_id: cursor.sessionProjectId,
    property_id: cursor.propertyId,
    candidate_ordinal: String(cursor.candidateOrdinal),
    confirmation_cursor: String(cursor.confirmationCursor),
    confirmation_occurred_at: cursor.confirmationOccurredAt,
    after_cursor: String(cursor.afterCursor),
    project_version: String(cursor.projectVersion),
  }).toString();
  return url;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("seeded assembly feed", () => {
  it("builds the seven deterministic fixture events across the 24 second production schedule", () => {
    const { runtime } = createRuntimeHarness();
    startProject(runtime);
    const confirmed = confirmProject(runtime);
    const initialCursor = assemblyFeedCursorFromProjection(confirmed);
    if (initialCursor === null) throw new Error("ASSEMBLY_CURSOR_MISSING");

    expect(seededAssemblyScheduleOffsets()).toHaveLength(
      SEEDED_ASSEMBLY_EVENT_COUNT,
    );
    expect(seededAssemblyScheduleOffsets().at(-1)).toBe(
      SEEDED_ASSEMBLY_VISIBLE_DURATION_MS,
    );
    expect(
      assemblyEventDueAtMs(initialCursor, SEEDED_ASSEMBLY_EVENT_COUNT - 1) -
        new Date(initialCursor.confirmationOccurredAt).getTime(),
    ).toBe(24_000);

    const originalEvents = Array.from(
      { length: SEEDED_ASSEMBLY_EVENT_COUNT },
      (_, index) => createSeededAssemblyEvent(initialCursor, index),
    );
    for (const event of originalEvents) {
      expect(runtime.dispatch({ type: "APPLY_WORK_EVENT", event })).toEqual({
        ok: true,
        outcome: "accepted",
      });
    }
    const ready = runtime.getSnapshot().projection;
    expect(ready).toMatchObject({
      visible_state: "LIVE_ROOF_ASSEMBLY",
      minimum_usable_ready: true,
      roof_surfaces: [
        { surface_id: expect.any(String) },
        { surface_id: expect.any(String) },
      ],
      panel_objects: [
        { placement_rank: 1, selection_state: "unselected" },
        { placement_rank: 2, selection_state: "unselected" },
        { placement_rank: 3, selection_state: "unselected" },
        { placement_rank: 4, selection_state: "unselected" },
      ],
      energy_model: { fact_source: "MODELED" },
    });
    expect(originalEvents.map((event) => event.type)).toEqual([
      "ROOF_GEOMETRY_READY",
      "PANEL_OBJECT_ADDED",
      "PANEL_OBJECT_ADDED",
      "PANEL_OBJECT_ADDED",
      "PANEL_OBJECT_ADDED",
      "ENERGY_MODEL_READY",
      "MINIMUM_USABLE_READY",
    ]);

    const partialCursor = assemblyFeedCursorFromProjection({
      ...confirmed,
      project_version: confirmed.project_version + 1,
      latest_cursor: confirmed.latest_cursor + 1,
      events: [...confirmed.events, originalEvents[0]!],
      accepted_event_ids: [
        ...confirmed.accepted_event_ids,
        originalEvents[0]!.event_id,
      ],
      roof_surfaces:
        originalEvents[0]?.type === "ROOF_GEOMETRY_READY"
          ? originalEvents[0].payload.surfaces
          : [],
      roof_facts:
        originalEvents[0]?.type === "ROOF_GEOMETRY_READY"
          ? originalEvents[0].payload.roof_facts
          : null,
      updated_at: originalEvents[0]!.occurred_at,
    });
    expect(partialCursor).not.toBeNull();
    expect(createSeededAssemblyEvent(partialCursor!, 1)).toEqual(
      originalEvents[1],
    );
  });

  it("supports corrected candidate ordinals without assuming cursor two", () => {
    const { runtime } = createRuntimeHarness();
    startProject(runtime);
    runtime.dispatch({ type: "CORRECT_PROPERTY" });
    runtime.dispatch({ type: "RESOLVE_SEEDED_ADDRESS", input: "123 Maple St" });
    const confirmed = confirmProject(runtime);
    const cursor = assemblyFeedCursorFromProjection(confirmed);

    expect(cursor).toMatchObject({
      candidateOrdinal: 2,
      confirmationCursor: 4,
      afterCursor: 4,
      projectVersion: 4,
    });
    const roofEvent = createSeededAssemblyEvent(cursor!, 0);
    expect(roofEvent).toMatchObject({
      cursor: 5,
      expected_project_version: 4,
      property_id: confirmed.property?.property_id,
    });
    expect(
      runtime.dispatch({ type: "APPLY_WORK_EVENT", event: roofEvent }),
    ).toEqual({ ok: true, outcome: "accepted" });
  });

  it("accelerates delivery without changing canonical event provenance", () => {
    vi.stubEnv("CP_ASSEMBLY_TIMING_MODE", "accelerated");
    const { runtime } = createRuntimeHarness();
    startProject(runtime);
    const confirmed = confirmProject(runtime);
    const cursor = assemblyFeedCursorFromProjection(confirmed);
    if (cursor === null) throw new Error("ASSEMBLY_CURSOR_MISSING");

    const confirmationTime = new Date(cursor.confirmationOccurredAt).getTime();
    expect(assemblyEventDueAtMs(cursor, 0) - confirmationTime).toBe(100);
    expect(
      new Date(createSeededAssemblyEvent(cursor, 0).occurred_at).getTime() -
        confirmationTime,
    ).toBe(2_500);
  });

  it("rejects extra, duplicate, foreign, incompatible, and impossible route correlation", () => {
    const { runtime } = createRuntimeHarness();
    startProject(runtime);
    const confirmed = confirmProject(runtime);
    const cursor = assemblyFeedCursorFromProjection(confirmed);
    if (cursor === null) throw new Error("ASSEMBLY_CURSOR_MISSING");
    expect(parseAssemblyFeedRequest(feedUrl(cursor))).toEqual({
      ok: true,
      cursor,
    });

    const cases = [
      (url: URL) => url.searchParams.append("extra", "true"),
      (url: URL) =>
        url.searchParams.append("after_cursor", String(cursor.afterCursor)),
      (url: URL) => url.searchParams.set("property_id", "property-foreign"),
      (url: URL) => url.searchParams.set("fixture_version", "future-fixture"),
      (url: URL) =>
        url.searchParams.set(
          "project_version",
          String(cursor.projectVersion + 1),
        ),
      (url: URL) =>
        url.searchParams.set(
          "after_cursor",
          String(cursor.confirmationCursor + SEEDED_ASSEMBLY_EVENT_COUNT + 1),
        ),
      (url: URL) =>
        url.searchParams.set(
          "confirmation_occurred_at",
          new Date(Date.now() + 60_000).toISOString(),
        ),
    ];
    for (const mutate of cases) {
      const url = feedUrl(cursor);
      mutate(url);
      expect(parseAssemblyFeedRequest(url)).toEqual({
        ok: false,
        reason: "INVALID_ASSEMBLY_REQUEST",
      });
    }
  });
});
