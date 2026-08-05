import { describe, expect, it } from "vitest";

import type {
  ProjectEvent,
  SessionProjectProjection,
} from "../../src/project/domain/model";
import { assemblyEventOccurredAt } from "../../src/project/domain/assembly-event-timing";
import {
  advanceProjectToReady,
  confirmProject,
  createRuntimeHarness,
  startProject,
} from "../helpers/project-runtime";

function retargetEvent(
  event: ProjectEvent,
  projection: SessionProjectProjection,
): ProjectEvent {
  if (projection.property === null) throw new Error("PROPERTY_MISSING");
  const confirmation = projection.events.findLast(
    (candidate) => candidate.type === "PROPERTY_CONFIRMED",
  );
  return {
    ...event,
    session_project_id: projection.session_project_id,
    property_id: projection.property.property_id,
    cursor: projection.latest_cursor + 1,
    expected_project_version: projection.project_version,
    occurred_at:
      confirmation?.type === "PROPERTY_CONFIRMED"
        ? assemblyEventOccurredAt(
            confirmation.occurred_at,
            confirmation.cursor,
            projection.latest_cursor + 1,
          )
        : event.occurred_at,
  } as ProjectEvent;
}

describe("pre-account session project runtime", () => {
  it("rejects unsupported input without creating or persisting a project", () => {
    const { runtime, storage, identity } = createRuntimeHarness();
    runtime.dispatch({ type: "RESTORE_SESSION" });

    expect(
      runtime.dispatch({
        type: "RESOLVE_SEEDED_ADDRESS",
        input: "125 Maple St",
      }),
    ).toEqual({ ok: false, error_code: "ADDRESS_NOT_SUPPORTED" });
    expect(runtime.getSnapshot()).toMatchObject({
      projection: null,
      visible_state: "ADDRESS_ENTRY",
    });
    expect(identity.projectCount).toBe(0);
    expect(storage.writes).toBe(0);
  });

  it("creates one stable project, requires confirmation, and stops ready inside S2", () => {
    const { runtime, storage, identity } = createRuntimeHarness();

    expect(runtime.getSnapshot()).toMatchObject({
      projection: null,
      visible_state: "ADDRESS_ENTRY",
    });
    const confirmation = startProject(runtime);

    expect(confirmation.visible_state).toBe("PROPERTY_CONFIRMATION");
    expect(confirmation).toMatchObject({
      schema_version: 1,
      fixture_version: "seeded-maple-austin-v1",
      assembly_provenance_contract: "CANONICAL_SCHEDULE_V1",
      source_kind: "SEEDED_DEMO_IMAGERY",
      certainty_kind: "DEMO_PROPERTY_MATCH",
    });
    expect(confirmation.events.map((event) => event.type)).toEqual([
      "ADDRESS_RESOLVED",
    ]);
    expect(identity.projectCount).toBe(1);
    expect(storage.writes).toBe(1);

    expect(
      runtime.dispatch({
        type: "RESOLVE_SEEDED_ADDRESS",
        input: "123 Maple St",
      }),
    ).toEqual({ ok: true, outcome: "idempotent" });
    expect(identity.projectCount).toBe(1);
    expect(storage.writes).toBe(1);
    expect(runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" })).toEqual({
      ok: false,
      error_code: "NO_NEXT_EVENT",
    });

    const assembly = confirmProject(runtime);
    const sceneId = assembly.scene?.scene_id;
    const cameraId = assembly.scene?.camera_id;
    const propertyId = assembly.property?.property_id;
    expect(assembly.visible_state).toBe("LIVE_ROOF_ASSEMBLY");

    const ready = advanceProjectToReady(runtime);
    expect(ready.visible_state).toBe("LIVE_ROOF_ASSEMBLY");
    expect(ready.minimum_usable_ready).toBe(true);
    expect(ready.scene?.scene_id).toBe(sceneId);
    expect(ready.scene?.camera_id).toBe(cameraId);
    expect(ready.property?.property_id).toBe(propertyId);
    expect(ready.panel_objects).toHaveLength(4);
    expect(ready.panel_objects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          panel_id: expect.any(String),
          surface_id: expect.any(String),
          placement_rank: 1,
          geometry: expect.any(Object),
          render_status: "rendered",
          selection_state: "unselected",
        }),
      ]),
    );
    expect(ready.events.map((event) => event.type)).toEqual([
      "ADDRESS_RESOLVED",
      "PROPERTY_CONFIRMED",
      "ROOF_GEOMETRY_READY",
      "PANEL_OBJECT_ADDED",
      "PANEL_OBJECT_ADDED",
      "PANEL_OBJECT_ADDED",
      "PANEL_OBJECT_ADDED",
      "ENERGY_MODEL_READY",
      "MINIMUM_USABLE_READY",
    ]);
    expect(ready.project_version).toBe(ready.events.length);
    expect(ready.latest_cursor).toBe(ready.events.length);
    expect(ready.accepted_event_ids).toEqual(
      ready.events.map((event) => event.event_id),
    );
    expect(runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" })).toEqual({
      ok: false,
      error_code: "NO_NEXT_EVENT",
    });
  });

  it("preserves the project root and draft while discarding a corrected candidate", () => {
    const { runtime } = createRuntimeHarness();
    const first = startProject(runtime);

    expect(runtime.dispatch({ type: "CORRECT_PROPERTY" })).toEqual({
      ok: true,
      outcome: "accepted",
    });
    const corrected = runtime.getSnapshot().projection;
    expect(corrected).toMatchObject({
      session_project_id: first.session_project_id,
      visible_state: "ADDRESS_ENTRY",
      address_draft: "123 Maple St",
      normalized_address: null,
      source_kind: null,
      certainty_kind: null,
      property: null,
      scene: null,
      roof_surfaces: [],
      panel_objects: [],
      energy_model: null,
      minimum_usable_ready: false,
    });
    expect(corrected?.events.at(-1)?.type).toBe("PROJECT_MUTATED");

    runtime.dispatch({
      type: "RESOLVE_SEEDED_ADDRESS",
      input: "123 Maple St",
    });
    const second = runtime.getSnapshot().projection;
    expect(second?.session_project_id).toBe(first.session_project_id);
    expect(second?.property?.property_id).not.toBe(first.property?.property_id);

    const confirmed = confirmProject(runtime);
    runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
    expect(runtime.dispatch({ type: "CORRECT_PROPERTY" })).toEqual({
      ok: false,
      error_code: "EVENT_REJECTED",
    });
    expect(runtime.getSnapshot().projection).toMatchObject({
      visible_state: "LIVE_ROOF_ASSEMBLY",
      property: confirmed.property,
      scene: confirmed.scene,
    });
  });

  it("rejects foreign, gapped, conflicting, malformed, and impossible events without advancement", () => {
    const { runtime, schedule, adapters, storage } = createRuntimeHarness();
    startProject(runtime);
    const confirmed = confirmProject(runtime);
    const roofEvent = schedule.nextEvent(confirmed);
    if (roofEvent === null) throw new Error("ROOF_EVENT_MISSING");

    const unchanged = structuredClone(confirmed);
    const unchangedWrites = storage.writes;
    const rejectAndAssertUnchanged = (event: unknown) => {
      expect(
        runtime.dispatch({ type: "APPLY_WORK_EVENT", event }),
      ).toMatchObject({ ok: false });
      expect(runtime.getSnapshot().projection).toEqual(unchanged);
      expect(storage.writes).toBe(unchangedWrites);
    };

    rejectAndAssertUnchanged({
      ...roofEvent,
      session_project_id: "project-foreign",
    });
    rejectAndAssertUnchanged({ ...roofEvent, cursor: roofEvent.cursor + 1 });
    rejectAndAssertUnchanged({ ...roofEvent, type: "S3_CONTROLS_READY" });
    rejectAndAssertUnchanged({
      ...roofEvent,
      type: "ENERGY_MODEL_READY",
      payload: { energy_model: adapters.fixture.energy },
    });

    expect(
      runtime.dispatch({ type: "APPLY_WORK_EVENT", event: roofEvent }),
    ).toEqual({ ok: true, outcome: "accepted" });
    const writesAfterRoof = storage.writes;
    expect(
      runtime.dispatch({ type: "APPLY_WORK_EVENT", event: roofEvent }),
    ).toEqual({ ok: true, outcome: "idempotent" });
    expect(storage.writes).toBe(writesAfterRoof);

    const collision = {
      ...roofEvent,
      occurred_at: "2026-01-01T00:00:59.000Z",
    } satisfies ProjectEvent;
    expect(
      runtime.dispatch({ type: "APPLY_WORK_EVENT", event: collision }),
    ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });

    const firstPanel = schedule.nextEvent(
      runtime.getSnapshot().projection ?? confirmed,
    );
    if (firstPanel?.type !== "PANEL_OBJECT_ADDED") {
      throw new Error("PANEL_EVENT_MISSING");
    }
    runtime.dispatch({ type: "APPLY_WORK_EVENT", event: firstPanel });
    const afterPanel = runtime.getSnapshot().projection;
    if (afterPanel === null) throw new Error("PANEL_NOT_ACCEPTED");
    const nextPanel = schedule.nextEvent(afterPanel);
    if (nextPanel?.type !== "PANEL_OBJECT_ADDED") {
      throw new Error("NEXT_PANEL_EVENT_MISSING");
    }
    const duplicatePanel = {
      ...nextPanel,
      payload: {
        panel: {
          ...nextPanel.payload.panel,
          panel_id: firstPanel.payload.panel.panel_id,
        },
      },
    };
    const beforeDuplicate = structuredClone(afterPanel);
    const writesBeforeDuplicate = storage.writes;
    expect(
      runtime.dispatch({ type: "APPLY_WORK_EVENT", event: duplicatePanel }),
    ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });
    expect(runtime.getSnapshot().projection).toEqual(beforeDuplicate);
    expect(storage.writes).toBe(writesBeforeDuplicate);
  });

  it("rejects modeled work before confirmation and readiness before every prerequisite", () => {
    const template = createRuntimeHarness();
    startProject(template.runtime);
    confirmProject(template.runtime);
    const readyTemplate = advanceProjectToReady(template.runtime);
    const roofEvent = readyTemplate.events.find(
      (event) => event.type === "ROOF_GEOMETRY_READY",
    );
    const readinessEvent = readyTemplate.events.find(
      (event) => event.type === "MINIMUM_USABLE_READY",
    );
    const energyEvent = readyTemplate.events.find(
      (event) => event.type === "ENERGY_MODEL_READY",
    );
    if (
      roofEvent === undefined ||
      readinessEvent === undefined ||
      energyEvent === undefined
    ) {
      throw new Error("WORK_EVENT_TEMPLATE_MISSING");
    }

    const preConfirmation = createRuntimeHarness();
    const candidate = startProject(preConfirmation.runtime);
    const candidateBefore = structuredClone(candidate);
    const candidateWrites = preConfirmation.storage.writes;
    expect(
      preConfirmation.runtime.dispatch({
        type: "APPLY_WORK_EVENT",
        event: retargetEvent(roofEvent, candidate),
      }),
    ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });
    expect(preConfirmation.runtime.getSnapshot().projection).toEqual(
      candidateBefore,
    );
    expect(preConfirmation.storage.writes).toBe(candidateWrites);

    const beforePanels = createRuntimeHarness();
    startProject(beforePanels.runtime);
    confirmProject(beforePanels.runtime);
    beforePanels.runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
    const roofOnly = beforePanels.runtime.getSnapshot().projection;
    if (roofOnly === null) throw new Error("ROOF_ONLY_PROJECT_MISSING");
    const roofOnlyBefore = structuredClone(roofOnly);
    const roofOnlyWrites = beforePanels.storage.writes;
    expect(
      beforePanels.runtime.dispatch({
        type: "APPLY_WORK_EVENT",
        event: retargetEvent(energyEvent, roofOnly),
      }),
    ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });
    expect(beforePanels.runtime.getSnapshot().projection).toEqual(
      roofOnlyBefore,
    );
    expect(beforePanels.storage.writes).toBe(roofOnlyWrites);

    for (const acceptedWorkSteps of [0, 2, 5]) {
      const harness = createRuntimeHarness();
      startProject(harness.runtime);
      confirmProject(harness.runtime);
      for (let step = 0; step < acceptedWorkSteps; step += 1) {
        harness.runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
      }
      const incomplete = harness.runtime.getSnapshot().projection;
      if (incomplete === null) throw new Error("INCOMPLETE_PROJECT_MISSING");
      const before = structuredClone(incomplete);
      const writes = harness.storage.writes;
      expect(
        harness.runtime.dispatch({
          type: "APPLY_WORK_EVENT",
          event: retargetEvent(readinessEvent, incomplete),
        }),
      ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });
      expect(harness.runtime.getSnapshot().projection).toEqual(before);
      expect(harness.storage.writes).toBe(writes);
    }
  });

  it("rejects altered modeled timestamps while preserving cursor and version progress", () => {
    const { runtime, schedule, storage } = createRuntimeHarness();
    startProject(runtime);
    const confirmed = confirmProject(runtime);
    const roofEvent = schedule.nextEvent(confirmed);
    if (roofEvent === null) throw new Error("ROOF_EVENT_MISSING");
    const writesBeforeAlteredEvent = storage.writes;

    expect(
      runtime.dispatch({
        type: "APPLY_WORK_EVENT",
        event: { ...roofEvent, occurred_at: "2099-01-01T00:00:00.000Z" },
      }),
    ).toEqual({ ok: false, error_code: "EVENT_REJECTED" });
    expect(runtime.getSnapshot().projection).toEqual(confirmed);
    expect(storage.writes).toBe(writesBeforeAlteredEvent);

    expect(
      runtime.dispatch({ type: "APPLY_WORK_EVENT", event: roofEvent }),
    ).toEqual({ ok: true, outcome: "accepted" });
    const afterRoof = runtime.getSnapshot().projection;
    if (afterRoof === null) throw new Error("ROOF_NOT_ACCEPTED");
    const nextEvent = schedule.nextEvent(afterRoof);
    if (nextEvent === null) throw new Error("NEXT_EVENT_MISSING");

    expect(
      runtime.dispatch({ type: "APPLY_WORK_EVENT", event: nextEvent }),
    ).toEqual({ ok: true, outcome: "accepted" });
    expect(runtime.getSnapshot().projection).toMatchObject({
      project_version: afterRoof.project_version + 1,
      latest_cursor: afterRoof.latest_cursor + 1,
      panel_objects: [expect.objectContaining({ placement_rank: 1 })],
    });
  });
});
