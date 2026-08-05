/**
 * MODULE: src/project/domain/reducer.ts
 * PURPOSE: Apply canonical project events through the legal S1-S2 transition and readiness rules.
 * PUBLIC API / ENTRYPOINTS:
 *   - applyProjectEvent: pure reducer for one parsed event.
 *   - replayProjectEvents: reconstructs a projection from its accepted append-only event record.
 * INVARIANTS:
 *   - [INV-MONOTONIC-PROJECT-VERSION] Each accepted consequential event advances cursor and project version exactly once.
 *   - [EVENT-IDEMPOTENT-REPLAY] An exact accepted-event replay is a no-op; an ID collision or object replay is rejected.
 *   - [INV-READINESS-PRECONDITIONS] Minimum usability requires confirmation, fixture roof geometry, every stable panel object, and modeled energy.
 * BOUNDARIES:
 *   - Inputs must first pass event parsing; cursor and project version own ordering while canonical modeled timestamps match the active confirmation schedule and delivered legacy timestamps remain explicitly unverified.
 *   - Persistence and publication order belong to the application runtime.
 * RELATED:
 *   - src/project/domain/identity.ts: derives the only valid stable slot for each seeded ID.
 *   - src/project/domain/work-events.ts: owns untrusted envelope parsing.
 *   - src/project/domain/projection.ts: uses replay to prove restored projection coherence.
 */
import {
  SESSION_PROJECT_SCHEMA_VERSION,
  type AssemblyProvenanceContract,
  type AddressResolvedEvent,
  type IdentitySource,
  type PanelObject,
  type ProjectEvent,
  type RoofSurface,
  type SeededFixtureContract,
  type SessionProjectProjection,
} from "./model";
import { assemblyEventTimestampMatches } from "./assembly-event-timing";
import {
  expectedSeededEventId,
  seededCameraId,
  seededPanelId,
  seededPropertyId,
  seededSceneId,
  seededSurfaceId,
} from "./identity";
import { projectEventsEqual } from "./work-events";
import { sameValue } from "./validation";

export type TransitionRejectReason =
  | "EVENT_ID_COLLISION"
  | "FOREIGN_EVENT"
  | "CURSOR_MISMATCH"
  | "VERSION_MISMATCH"
  | "INVALID_EVENT_ORDER"
  | "FIXTURE_MISMATCH"
  | "TIMESTAMP_MISMATCH"
  | "OBJECT_ID_COLLISION";

export type TransitionResult =
  | {
      kind: "accepted";
      projection: SessionProjectProjection;
    }
  | {
      kind: "idempotent";
      projection: SessionProjectProjection;
    }
  | {
      kind: "rejected";
      reason: TransitionRejectReason;
    };

function accepted(projection: SessionProjectProjection): TransitionResult {
  return { kind: "accepted", projection };
}

function rejected(reason: TransitionRejectReason): TransitionResult {
  return { kind: "rejected", reason };
}

function inputMatchesFixture(
  input: string,
  fixture: SeededFixtureContract,
): boolean {
  const normalized = input.trim().toLocaleLowerCase("en-US");
  return fixture.accepted_inputs.some(
    (candidate) => candidate.toLocaleLowerCase("en-US") === normalized,
  );
}

function addressEventMatchesFixture(
  event: AddressResolvedEvent,
  fixture: SeededFixtureContract,
  identity: IdentitySource,
  candidateOrdinal: number,
): boolean {
  const { payload } = event;
  return (
    inputMatchesFixture(payload.address_draft, fixture) &&
    sameValue(payload.normalized_address, fixture.normalized_address) &&
    payload.source_kind === fixture.source_kind &&
    payload.certainty_kind === fixture.certainty_kind &&
    payload.property.property_id === event.property_id &&
    event.event_id ===
      expectedSeededEventId(identity, event, candidateOrdinal) &&
    payload.property.property_id ===
      seededPropertyId(
        identity,
        event.session_project_id,
        fixture.property.fixture_property_key,
        candidateOrdinal,
      ) &&
    payload.property.fixture_property_key ===
      fixture.property.fixture_property_key &&
    payload.property.display_address === fixture.property.display_address &&
    payload.scene.fixture_scene_key === fixture.scene.fixture_scene_key &&
    payload.scene.fixture_camera_key === fixture.scene.fixture_camera_key &&
    payload.scene.scene_id ===
      seededSceneId(
        identity,
        event.session_project_id,
        fixture.scene.fixture_scene_key,
        candidateOrdinal,
      ) &&
    payload.scene.camera_id ===
      seededCameraId(
        identity,
        event.session_project_id,
        fixture.scene.fixture_camera_key,
        candidateOrdinal,
      ) &&
    new Set([
      event.event_id,
      event.session_project_id,
      payload.property.property_id,
      payload.scene.scene_id,
      payload.scene.camera_id,
    ]).size === 5
  );
}

function historicalObjectIds(
  projection: SessionProjectProjection,
): Set<string> {
  const ids = new Set<string>([projection.session_project_id]);
  for (const acceptedEvent of projection.events) {
    ids.add(acceptedEvent.event_id);
    if (acceptedEvent.type === "ADDRESS_RESOLVED") {
      ids.add(acceptedEvent.payload.property.property_id);
      ids.add(acceptedEvent.payload.scene.scene_id);
      ids.add(acceptedEvent.payload.scene.camera_id);
    } else if (acceptedEvent.type === "ROOF_GEOMETRY_READY") {
      for (const surface of acceptedEvent.payload.surfaces) {
        ids.add(surface.surface_id);
      }
    } else if (acceptedEvent.type === "PANEL_OBJECT_ADDED") {
      ids.add(acceptedEvent.payload.panel.panel_id);
    }
  }
  return ids;
}

function roofMatchesFixture(
  surfaces: RoofSurface[],
  projection: SessionProjectProjection,
  fixture: SeededFixtureContract,
  identity: IdentitySource,
): boolean {
  const property = projection.property;
  if (property === null) return false;
  return (
    surfaces.length === fixture.roof.surfaces.length &&
    new Set(surfaces.map((surface) => surface.surface_id)).size ===
      surfaces.length &&
    surfaces.every((surface, index) => {
      const expected = fixture.roof.surfaces[index];
      return (
        expected !== undefined &&
        surface.surface_id ===
          seededSurfaceId(
            identity,
            projection.session_project_id,
            property.property_id,
            expected.fixture_surface_key,
          ) &&
        surface.fixture_surface_key === expected.fixture_surface_key &&
        sameValue(surface.polygon, expected.polygon) &&
        surface.pitch_degrees === expected.pitch_degrees &&
        surface.azimuth_degrees === expected.azimuth_degrees
      );
    })
  );
}

function panelMatchesFixture(
  panel: PanelObject,
  projection: SessionProjectProjection,
  fixture: SeededFixtureContract,
  identity: IdentitySource,
): boolean {
  const expected = fixture.panels.find(
    (candidate) => candidate.fixture_panel_key === panel.fixture_panel_key,
  );
  const surface = projection.roof_surfaces.find(
    (candidate) => candidate.surface_id === panel.surface_id,
  );
  return (
    expected !== undefined &&
    surface !== undefined &&
    projection.property !== null &&
    panel.panel_id ===
      seededPanelId(
        identity,
        projection.session_project_id,
        projection.property.property_id,
        expected.fixture_panel_key,
      ) &&
    surface.fixture_surface_key === expected.fixture_surface_key &&
    panel.placement_rank === expected.placement_rank &&
    sameValue(panel.geometry, expected.geometry) &&
    panel.render_status === "rendered" &&
    panel.selection_state === "unselected"
  );
}

function withAcceptedEvent(
  projection: SessionProjectProjection,
  event: ProjectEvent,
  changes: Partial<SessionProjectProjection>,
): SessionProjectProjection {
  // @ah INV-MONOTONIC-PROJECT-VERSION
  return {
    ...projection,
    ...changes,
    project_version: projection.project_version + 1,
    updated_at: event.occurred_at,
    accepted_event_ids: [...projection.accepted_event_ids, event.event_id],
    latest_cursor: event.cursor,
    events: [...projection.events, event],
  };
}

function createProjection(
  event: AddressResolvedEvent,
  assemblyProvenanceContract: AssemblyProvenanceContract,
): SessionProjectProjection {
  return {
    schema_version: SESSION_PROJECT_SCHEMA_VERSION,
    fixture_version: event.fixture_version,
    assembly_provenance_contract: assemblyProvenanceContract,
    session_project_id: event.session_project_id,
    project_version: 1,
    visible_state: "PROPERTY_CONFIRMATION",
    created_at: event.occurred_at,
    updated_at: event.occurred_at,
    address_draft: event.payload.address_draft,
    normalized_address: event.payload.normalized_address,
    source_kind: event.payload.source_kind,
    certainty_kind: event.payload.certainty_kind,
    property: event.payload.property,
    scene: event.payload.scene,
    roof_surfaces: [],
    roof_facts: null,
    panel_objects: [],
    energy_model: null,
    minimum_usable_ready: false,
    accepted_event_ids: [event.event_id],
    latest_cursor: event.cursor,
    events: [event],
  };
}

function allFixturePanelsExist(
  projection: SessionProjectProjection,
  fixture: SeededFixtureContract,
): boolean {
  return (
    projection.panel_objects.length === fixture.panels.length &&
    fixture.panels.every((expected) =>
      projection.panel_objects.some(
        (panel) => panel.fixture_panel_key === expected.fixture_panel_key,
      ),
    )
  );
}

function modeledEventTimestampMatches(
  projection: SessionProjectProjection,
  event: ProjectEvent,
): boolean {
  if (
    event.type === "ADDRESS_RESOLVED" ||
    event.type === "PROJECT_MUTATED" ||
    event.type === "PROPERTY_CONFIRMED"
  ) {
    return true;
  }
  const confirmation = projection.events.findLast(
    (candidate) =>
      candidate.type === "PROPERTY_CONFIRMED" &&
      candidate.property_id === event.property_id,
  );
  if (confirmation === undefined) return false;
  if (projection.assembly_provenance_contract === "LEGACY_UNVERIFIED_V1") {
    const eventTime = new Date(event.occurred_at).getTime();
    const confirmationTime = new Date(confirmation.occurred_at).getTime();
    const previousAcceptedTime = new Date(projection.updated_at).getTime();
    return eventTime >= confirmationTime && eventTime >= previousAcceptedTime;
  }
  return assemblyEventTimestampMatches({
    eventOccurredAt: event.occurred_at,
    eventCursor: event.cursor,
    confirmationOccurredAt: confirmation.occurred_at,
    confirmationCursor: confirmation.cursor,
  });
}

// @ah EVENT-IDEMPOTENT-REPLAY
export function applyProjectEvent(
  projection: SessionProjectProjection | null,
  event: ProjectEvent,
  fixture: SeededFixtureContract,
  identity: IdentitySource,
  initialAssemblyProvenanceContract: AssemblyProvenanceContract = "CANONICAL_SCHEDULE_V1",
): TransitionResult {
  if (projection === null) {
    if (
      event.type !== "ADDRESS_RESOLVED" ||
      event.fixture_version !== fixture.fixture_version ||
      event.cursor !== 1 ||
      event.expected_project_version !== 0 ||
      !addressEventMatchesFixture(event, fixture, identity, 1)
    ) {
      return rejected("INVALID_EVENT_ORDER");
    }
    return accepted(createProjection(event, initialAssemblyProvenanceContract));
  }

  const acceptedIndex = projection.accepted_event_ids.indexOf(event.event_id);
  if (acceptedIndex >= 0) {
    const previous = projection.events[acceptedIndex];
    return previous && projectEventsEqual(previous, event)
      ? { kind: "idempotent", projection }
      : rejected("EVENT_ID_COLLISION");
  }

  if (
    event.fixture_version !== projection.fixture_version ||
    event.fixture_version !== fixture.fixture_version ||
    event.session_project_id !== projection.session_project_id
  ) {
    return rejected("FOREIGN_EVENT");
  }
  const acceptedCandidateCount = projection.events.filter(
    (candidate) => candidate.type === "ADDRESS_RESOLVED",
  ).length;
  const eventCandidateOrdinal =
    event.type === "ADDRESS_RESOLVED"
      ? acceptedCandidateCount + 1
      : acceptedCandidateCount;
  if (
    event.event_id !==
    expectedSeededEventId(identity, event, eventCandidateOrdinal)
  ) {
    return rejected("FIXTURE_MISMATCH");
  }
  const reservedObjectIds = historicalObjectIds(projection);
  if (reservedObjectIds.has(event.event_id)) {
    return rejected("OBJECT_ID_COLLISION");
  }
  if (event.cursor !== projection.latest_cursor + 1) {
    return rejected("CURSOR_MISMATCH");
  }
  if (event.expected_project_version !== projection.project_version) {
    return rejected("VERSION_MISMATCH");
  }
  if (!modeledEventTimestampMatches(projection, event)) {
    return rejected("TIMESTAMP_MISMATCH");
  }
  switch (event.type) {
    case "ADDRESS_RESOLVED": {
      const priorPropertyIds = projection.events
        .filter((candidate) => candidate.type === "ADDRESS_RESOLVED")
        .map((candidate) => candidate.property_id);
      if (
        projection.visible_state !== "ADDRESS_ENTRY" ||
        projection.property !== null ||
        priorPropertyIds.includes(event.property_id) ||
        [
          event.property_id,
          event.payload.scene.scene_id,
          event.payload.scene.camera_id,
        ].some((identity) => reservedObjectIds.has(identity)) ||
        !addressEventMatchesFixture(
          event,
          fixture,
          identity,
          eventCandidateOrdinal,
        )
      ) {
        return rejected("INVALID_EVENT_ORDER");
      }
      return accepted(
        withAcceptedEvent(projection, event, {
          visible_state: "PROPERTY_CONFIRMATION",
          address_draft: event.payload.address_draft,
          normalized_address: event.payload.normalized_address,
          source_kind: event.payload.source_kind,
          certainty_kind: event.payload.certainty_kind,
          property: event.payload.property,
          scene: event.payload.scene,
          roof_surfaces: [],
          roof_facts: null,
          panel_objects: [],
          energy_model: null,
          minimum_usable_ready: false,
        }),
      );
    }
    case "PROJECT_MUTATED":
      if (
        projection.visible_state !== "PROPERTY_CONFIRMATION" ||
        projection.property === null ||
        event.property_id !== projection.property.property_id ||
        event.payload.mutation !== "PROPERTY_CORRECTION" ||
        event.payload.preserved_address_draft !== projection.address_draft
      ) {
        return rejected("INVALID_EVENT_ORDER");
      }
      return accepted(
        withAcceptedEvent(projection, event, {
          visible_state: "ADDRESS_ENTRY",
          normalized_address: null,
          source_kind: null,
          certainty_kind: null,
          property: null,
          scene: null,
          roof_surfaces: [],
          roof_facts: null,
          panel_objects: [],
          energy_model: null,
          minimum_usable_ready: false,
        }),
      );
    case "PROPERTY_CONFIRMED":
      if (
        projection.visible_state !== "PROPERTY_CONFIRMATION" ||
        projection.property === null ||
        event.property_id !== projection.property.property_id ||
        event.payload.authority !== "EXPLICIT_USER_CONFIRMATION"
      ) {
        return rejected("INVALID_EVENT_ORDER");
      }
      return accepted(
        withAcceptedEvent(projection, event, {
          visible_state: "LIVE_ROOF_ASSEMBLY",
        }),
      );
    case "ROOF_GEOMETRY_READY":
      if (
        projection.visible_state !== "LIVE_ROOF_ASSEMBLY" ||
        projection.property === null ||
        event.property_id !== projection.property.property_id ||
        projection.roof_surfaces.length > 0 ||
        event.payload.surfaces.some(
          (surface) =>
            reservedObjectIds.has(surface.surface_id) ||
            surface.surface_id === event.event_id,
        ) ||
        !roofMatchesFixture(
          event.payload.surfaces,
          projection,
          fixture,
          identity,
        ) ||
        !sameValue(event.payload.roof_facts, fixture.roof.facts)
      ) {
        return rejected("INVALID_EVENT_ORDER");
      }
      return accepted(
        withAcceptedEvent(projection, event, {
          roof_surfaces: event.payload.surfaces,
          roof_facts: event.payload.roof_facts,
        }),
      );
    case "PANEL_OBJECT_ADDED": {
      const { panel } = event.payload;
      if (
        projection.visible_state !== "LIVE_ROOF_ASSEMBLY" ||
        projection.property === null ||
        event.property_id !== projection.property.property_id ||
        projection.roof_surfaces.length === 0 ||
        projection.energy_model !== null ||
        projection.panel_objects.some(
          (candidate) =>
            candidate.panel_id === panel.panel_id ||
            candidate.fixture_panel_key === panel.fixture_panel_key ||
            candidate.placement_rank === panel.placement_rank,
        ) ||
        reservedObjectIds.has(panel.panel_id) ||
        panel.panel_id === event.event_id ||
        panel.placement_rank !== projection.panel_objects.length + 1 ||
        !panelMatchesFixture(panel, projection, fixture, identity)
      ) {
        return rejected(
          projection.panel_objects.some(
            (candidate) => candidate.panel_id === panel.panel_id,
          )
            ? "OBJECT_ID_COLLISION"
            : "INVALID_EVENT_ORDER",
        );
      }
      return accepted(
        withAcceptedEvent(projection, event, {
          panel_objects: [...projection.panel_objects, panel],
        }),
      );
    }
    case "ENERGY_MODEL_READY":
      if (
        projection.visible_state !== "LIVE_ROOF_ASSEMBLY" ||
        projection.property === null ||
        event.property_id !== projection.property.property_id ||
        projection.energy_model !== null ||
        !allFixturePanelsExist(projection, fixture) ||
        !sameValue(event.payload.energy_model, fixture.energy)
      ) {
        return rejected("INVALID_EVENT_ORDER");
      }
      return accepted(
        withAcceptedEvent(projection, event, {
          energy_model: event.payload.energy_model,
        }),
      );
    case "MINIMUM_USABLE_READY":
      // @ah INV-READINESS-PRECONDITIONS
      if (
        projection.visible_state !== "LIVE_ROOF_ASSEMBLY" ||
        projection.property === null ||
        event.property_id !== projection.property.property_id ||
        projection.roof_surfaces.length !== fixture.roof.surfaces.length ||
        !allFixturePanelsExist(projection, fixture) ||
        projection.energy_model === null ||
        projection.minimum_usable_ready ||
        event.payload.readiness !== "MINIMUM_USABLE_READY"
      ) {
        return rejected("INVALID_EVENT_ORDER");
      }
      return accepted(
        withAcceptedEvent(projection, event, {
          minimum_usable_ready: true,
        }),
      );
  }
}

export function replayProjectEvents(
  events: readonly ProjectEvent[],
  fixture: SeededFixtureContract,
  identity: IdentitySource,
  assemblyProvenanceContract: AssemblyProvenanceContract = "CANONICAL_SCHEDULE_V1",
): SessionProjectProjection | null {
  let projection: SessionProjectProjection | null = null;
  for (const event of events) {
    const result = applyProjectEvent(
      projection,
      event,
      fixture,
      identity,
      assemblyProvenanceContract,
    );
    if (result.kind !== "accepted") {
      return null;
    }
    projection = result.projection;
  }
  return projection;
}
