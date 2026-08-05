/**
 * MODULE: src/project/adapters/seeded-demo.ts
 * PURPOSE: Supply isolated deterministic address, property, roof, panel, energy, and manual-schedule adapters for the pre-account demo.
 * PUBLIC API / ENTRYPOINTS:
 *   - SEEDED_DEMO_FIXTURE: replaceable versioned canonical fixture contract.
 *   - createSeededDemoAdapters: builds the five fixture adapter boundaries.
 *   - SeededManualSchedule: returns the next typed work event only when explicitly requested.
 * INVARIANTS:
 *   - [DATA-SEEDED-DEMO-ONLY] Adapter results are local fixture data with stable semantic identities and no live-provider claim or request.
 *   - [INV-INERT-SCHEDULE] The schedule never starts a timer or transport and advances only under an explicit application command.
 * BOUNDARIES:
 *   - This module owns demo facts and event construction, not persistence, rendering, or domain acceptance.
 * RELATED:
 *   - src/project/domain/model.ts: defines the fixture and event contracts.
 *   - src/project/domain/identity.ts: supplies the shared semantic identity slots.
 *   - src/project/application/session-project-runtime.ts: coordinates adapters with persistence.
 */
import {
  PROJECT_EVENT_SCHEMA_VERSION,
  type AddressResolvedEvent,
  type Clock,
  type EnergyModel,
  type EnergyModelReadyEvent,
  type IdentitySource,
  type MinimumUsableReadyEvent,
  type NormalizedAddress,
  type PanelObject,
  type PanelObjectAddedEvent,
  type ProjectEvent,
  type ProjectMutatedEvent,
  type PropertyCandidate,
  type PropertyConfirmedEvent,
  type RoofGeometryReadyEvent,
  type RoofSurface,
  type SceneContext,
  type SeededFixtureContract,
  type SessionProjectProjection,
} from "../domain/model";
import { assemblyEventOccurredAt } from "../domain/assembly-event-timing";
import {
  seededAddressResolvedEventId,
  seededCameraId,
  seededCandidateEventId,
  seededPanelId,
  seededPropertyId,
  seededSceneId,
  seededSurfaceId,
} from "../domain/identity";

export const SEEDED_DEMO_FIXTURE: SeededFixtureContract = {
  fixture_version: "seeded-maple-austin-v1",
  accepted_inputs: ["123 Maple St", "123 Maple St, Austin, TX 78704"],
  normalized_address: {
    fixture_address_key: "maple-austin",
    formatted_address: "123 Maple St, Austin, TX 78704",
    street_line: "123 Maple St",
    locality: "Austin",
    region: "TX",
    postal_code: "78704",
  },
  source_kind: "SEEDED_DEMO_IMAGERY",
  certainty_kind: "DEMO_PROPERTY_MATCH",
  property: {
    fixture_property_key: "maple-austin-property",
    display_address: "123 Maple St, Austin, TX 78704",
    outline_polygon: [
      { x: 0.28, y: 0.3 },
      { x: 0.69, y: 0.25 },
      { x: 0.84, y: 0.52 },
      { x: 0.72, y: 0.87 },
      { x: 0.35, y: 0.79 },
      { x: 0.2, y: 0.54 },
    ],
  },
  scene: {
    fixture_scene_key: "maple-austin-scene",
    fixture_camera_key: "maple-austin-camera",
  },
  roof: {
    surfaces: [
      {
        fixture_surface_key: "south-main",
        polygon: [
          { x: 0.16, y: 0.2 },
          { x: 0.68, y: 0.2 },
          { x: 0.78, y: 0.58 },
          { x: 0.22, y: 0.58 },
        ],
        pitch_degrees: 22,
        azimuth_degrees: 182,
      },
      {
        fixture_surface_key: "west-wing",
        polygon: [
          { x: 0.22, y: 0.58 },
          { x: 0.78, y: 0.58 },
          { x: 0.66, y: 0.82 },
          { x: 0.28, y: 0.82 },
        ],
        pitch_degrees: 18,
        azimuth_degrees: 268,
      },
    ],
    facts: {
      fact_source: "MODELED",
      modeled_roof_area_sq_ft: 1840,
    },
  },
  panels: [
    {
      fixture_panel_key: "panel-south-01",
      fixture_surface_key: "south-main",
      placement_rank: 1,
      geometry: {
        x: 0.28,
        y: 0.3,
        width: 0.08,
        height: 0.16,
        rotation_degrees: 2,
      },
    },
    {
      fixture_panel_key: "panel-south-02",
      fixture_surface_key: "south-main",
      placement_rank: 2,
      geometry: {
        x: 0.38,
        y: 0.3,
        width: 0.08,
        height: 0.16,
        rotation_degrees: 2,
      },
    },
    {
      fixture_panel_key: "panel-south-03",
      fixture_surface_key: "south-main",
      placement_rank: 3,
      geometry: {
        x: 0.48,
        y: 0.3,
        width: 0.08,
        height: 0.16,
        rotation_degrees: 2,
      },
    },
    {
      fixture_panel_key: "panel-west-01",
      fixture_surface_key: "west-wing",
      placement_rank: 4,
      geometry: {
        x: 0.42,
        y: 0.64,
        width: 0.08,
        height: 0.14,
        rotation_degrees: -1,
      },
    },
  ],
  energy: {
    fact_source: "MODELED",
    modeled_annual_kwh: 9800,
  },
};

export interface AddressFixtureAdapter {
  resolve(
    input: unknown,
  ): { address_draft: string; normalized_address: NormalizedAddress } | null;
}

export interface PropertyFixtureAdapter {
  createCandidate(
    sessionProjectId: string,
    candidateOrdinal: number,
    identity: IdentitySource,
  ): { property: PropertyCandidate; scene: SceneContext };
}

export interface RoofFixtureAdapter {
  createSurfaces(
    projection: SessionProjectProjection,
    identity: IdentitySource,
  ): {
    surfaces: RoofSurface[];
    roofFacts: typeof SEEDED_DEMO_FIXTURE.roof.facts;
  };
}

export interface PanelFixtureAdapter {
  createPanel(
    projection: SessionProjectProjection,
    placementRank: number,
    identity: IdentitySource,
  ): PanelObject | null;
}

export interface EnergyFixtureAdapter {
  createEnergyModel(): EnergyModel;
}

export interface SeededDemoAdapters {
  fixture: SeededFixtureContract;
  address: AddressFixtureAdapter;
  property: PropertyFixtureAdapter;
  roof: RoofFixtureAdapter;
  panels: PanelFixtureAdapter;
  energy: EnergyFixtureAdapter;
}

function cloneNormalizedAddress(): NormalizedAddress {
  return { ...SEEDED_DEMO_FIXTURE.normalized_address };
}

class SeededAddressAdapter implements AddressFixtureAdapter {
  resolve(input: unknown) {
    if (
      typeof input !== "string" ||
      input.length === 0 ||
      input.length > 240 ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(input)
    ) {
      return null;
    }
    const addressDraft = input.trim();
    const comparison = addressDraft.toLocaleLowerCase("en-US");
    const accepted = SEEDED_DEMO_FIXTURE.accepted_inputs.some(
      (candidate) => candidate.toLocaleLowerCase("en-US") === comparison,
    );
    return accepted
      ? {
          address_draft: addressDraft,
          normalized_address: cloneNormalizedAddress(),
        }
      : null;
  }
}

class SeededPropertyAdapter implements PropertyFixtureAdapter {
  createCandidate(
    sessionProjectId: string,
    candidateOrdinal: number,
    identity: IdentitySource,
  ) {
    return {
      property: {
        property_id: seededPropertyId(
          identity,
          sessionProjectId,
          SEEDED_DEMO_FIXTURE.property.fixture_property_key,
          candidateOrdinal,
        ),
        fixture_property_key: SEEDED_DEMO_FIXTURE.property.fixture_property_key,
        display_address: SEEDED_DEMO_FIXTURE.property.display_address,
      },
      scene: {
        scene_id: seededSceneId(
          identity,
          sessionProjectId,
          SEEDED_DEMO_FIXTURE.scene.fixture_scene_key,
          candidateOrdinal,
        ),
        camera_id: seededCameraId(
          identity,
          sessionProjectId,
          SEEDED_DEMO_FIXTURE.scene.fixture_camera_key,
          candidateOrdinal,
        ),
        fixture_scene_key: SEEDED_DEMO_FIXTURE.scene.fixture_scene_key,
        fixture_camera_key: SEEDED_DEMO_FIXTURE.scene.fixture_camera_key,
      },
    };
  }
}

class SeededRoofAdapter implements RoofFixtureAdapter {
  createSurfaces(
    projection: SessionProjectProjection,
    identity: IdentitySource,
  ) {
    const property = projection.property;
    if (property === null) {
      return { surfaces: [], roofFacts: { ...SEEDED_DEMO_FIXTURE.roof.facts } };
    }
    return {
      surfaces: SEEDED_DEMO_FIXTURE.roof.surfaces.map((surface) => ({
        surface_id: seededSurfaceId(
          identity,
          projection.session_project_id,
          property.property_id,
          surface.fixture_surface_key,
        ),
        fixture_surface_key: surface.fixture_surface_key,
        polygon: surface.polygon.map((point) => ({ ...point })),
        pitch_degrees: surface.pitch_degrees,
        azimuth_degrees: surface.azimuth_degrees,
      })),
      roofFacts: { ...SEEDED_DEMO_FIXTURE.roof.facts },
    };
  }
}

class SeededPanelAdapter implements PanelFixtureAdapter {
  createPanel(
    projection: SessionProjectProjection,
    placementRank: number,
    identity: IdentitySource,
  ): PanelObject | null {
    const expected = SEEDED_DEMO_FIXTURE.panels.find(
      (panel) => panel.placement_rank === placementRank,
    );
    const property = projection.property;
    if (expected === undefined || property === null) {
      return null;
    }
    const surface = projection.roof_surfaces.find(
      (candidate) =>
        candidate.fixture_surface_key === expected.fixture_surface_key,
    );
    if (surface === undefined) {
      return null;
    }
    return {
      panel_id: seededPanelId(
        identity,
        projection.session_project_id,
        property.property_id,
        expected.fixture_panel_key,
      ),
      surface_id: surface.surface_id,
      fixture_panel_key: expected.fixture_panel_key,
      placement_rank: expected.placement_rank,
      geometry: { ...expected.geometry },
      render_status: "rendered",
      selection_state: "unselected",
    };
  }
}

class SeededEnergyAdapter implements EnergyFixtureAdapter {
  createEnergyModel(): EnergyModel {
    return { ...SEEDED_DEMO_FIXTURE.energy };
  }
}

// @ah DATA-SEEDED-DEMO-ONLY
export function createSeededDemoAdapters(): SeededDemoAdapters {
  return {
    fixture: SEEDED_DEMO_FIXTURE,
    address: new SeededAddressAdapter(),
    property: new SeededPropertyAdapter(),
    roof: new SeededRoofAdapter(),
    panels: new SeededPanelAdapter(),
    energy: new SeededEnergyAdapter(),
  };
}

function commonEventFields(
  projection: SessionProjectProjection,
  identity: IdentitySource,
  occurredAt: string,
  semanticEventKey: string,
) {
  if (projection.property === null) {
    return null;
  }
  const candidateOrdinal = projection.events.filter(
    (event) => event.type === "ADDRESS_RESOLVED",
  ).length;
  return {
    schema_version: PROJECT_EVENT_SCHEMA_VERSION,
    fixture_version: projection.fixture_version,
    event_id: seededCandidateEventId(
      identity,
      projection.session_project_id,
      candidateOrdinal,
      semanticEventKey,
    ),
    session_project_id: projection.session_project_id,
    property_id: projection.property.property_id,
    cursor: projection.latest_cursor + 1,
    expected_project_version: projection.project_version,
    occurred_at: occurredAt,
  } as const;
}

export function createAddressResolvedEvent(input: {
  sessionProjectId: string;
  candidateOrdinal: number;
  currentProjection: SessionProjectProjection | null;
  addressDraft: string;
  normalizedAddress: NormalizedAddress;
  identity: IdentitySource;
  clock: Clock;
  adapters: SeededDemoAdapters;
}): AddressResolvedEvent {
  const match = input.adapters.property.createCandidate(
    input.sessionProjectId,
    input.candidateOrdinal,
    input.identity,
  );
  const cursor = (input.currentProjection?.latest_cursor ?? 0) + 1;
  const expectedProjectVersion = input.currentProjection?.project_version ?? 0;
  return {
    schema_version: PROJECT_EVENT_SCHEMA_VERSION,
    fixture_version: input.adapters.fixture.fixture_version,
    event_id: seededAddressResolvedEventId(
      input.identity,
      input.sessionProjectId,
      input.candidateOrdinal,
    ),
    session_project_id: input.sessionProjectId,
    property_id: match.property.property_id,
    cursor,
    expected_project_version: expectedProjectVersion,
    occurred_at: input.clock.nowIso(),
    type: "ADDRESS_RESOLVED",
    payload: {
      address_draft: input.addressDraft,
      normalized_address: input.normalizedAddress,
      source_kind: input.adapters.fixture.source_kind,
      certainty_kind: input.adapters.fixture.certainty_kind,
      property: match.property,
      scene: match.scene,
    },
  };
}

export function createPropertyConfirmedEvent(
  projection: SessionProjectProjection,
  identity: IdentitySource,
  clock: Clock,
): PropertyConfirmedEvent | null {
  const common = commonEventFields(
    projection,
    identity,
    clock.nowIso(),
    "property-confirmed",
  );
  return common === null
    ? null
    : {
        ...common,
        type: "PROPERTY_CONFIRMED",
        payload: { authority: "EXPLICIT_USER_CONFIRMATION" },
      };
}

export function createPropertyCorrectionEvent(
  projection: SessionProjectProjection,
  identity: IdentitySource,
  clock: Clock,
): ProjectMutatedEvent | null {
  const common = commonEventFields(
    projection,
    identity,
    clock.nowIso(),
    "property-correction",
  );
  return common === null
    ? null
    : {
        ...common,
        type: "PROJECT_MUTATED",
        payload: {
          mutation: "PROPERTY_CORRECTION",
          preserved_address_draft: projection.address_draft,
        },
      };
}

export interface ManualProjectSchedule {
  nextEvent(projection: SessionProjectProjection): ProjectEvent | null;
}

function nextModeledEventOccurredAt(
  projection: SessionProjectProjection,
  clock: Clock,
): string | null {
  if (projection.assembly_provenance_contract === "LEGACY_UNVERIFIED_V1") {
    return clock.nowIso();
  }
  const confirmation = projection.events.findLast(
    (event) =>
      event.type === "PROPERTY_CONFIRMED" &&
      event.property_id === projection.property?.property_id,
  );
  if (confirmation === undefined) return null;
  try {
    return assemblyEventOccurredAt(
      confirmation.occurred_at,
      confirmation.cursor,
      projection.latest_cursor + 1,
    );
  } catch {
    return null;
  }
}

export class SeededManualSchedule implements ManualProjectSchedule {
  constructor(
    private readonly adapters: SeededDemoAdapters,
    private readonly identity: IdentitySource,
    private readonly clock: Clock,
  ) {}

  // @ah INV-INERT-SCHEDULE
  nextEvent(projection: SessionProjectProjection): ProjectEvent | null {
    if (
      projection.visible_state !== "LIVE_ROOF_ASSEMBLY" ||
      projection.property === null ||
      projection.minimum_usable_ready
    ) {
      return null;
    }
    const occurredAt = nextModeledEventOccurredAt(projection, this.clock);
    if (occurredAt === null) return null;
    if (projection.roof_surfaces.length === 0) {
      const common = commonEventFields(
        projection,
        this.identity,
        occurredAt,
        "roof-geometry-ready",
      );
      if (common === null) return null;
      const roof = this.adapters.roof.createSurfaces(projection, this.identity);
      return {
        ...common,
        type: "ROOF_GEOMETRY_READY",
        payload: {
          surfaces: roof.surfaces,
          roof_facts: roof.roofFacts,
        },
      } satisfies RoofGeometryReadyEvent;
    }

    const nextPanelRank = projection.panel_objects.length + 1;
    if (nextPanelRank <= this.adapters.fixture.panels.length) {
      const panel = this.adapters.panels.createPanel(
        projection,
        nextPanelRank,
        this.identity,
      );
      const common = commonEventFields(
        projection,
        this.identity,
        occurredAt,
        `panel-added:${nextPanelRank}`,
      );
      if (panel === null || common === null) return null;
      return {
        ...common,
        type: "PANEL_OBJECT_ADDED",
        payload: { panel },
      } satisfies PanelObjectAddedEvent;
    }

    if (projection.energy_model === null) {
      const common = commonEventFields(
        projection,
        this.identity,
        occurredAt,
        "energy-model-ready",
      );
      if (common === null) return null;
      return {
        ...common,
        type: "ENERGY_MODEL_READY",
        payload: { energy_model: this.adapters.energy.createEnergyModel() },
      } satisfies EnergyModelReadyEvent;
    }

    const common = commonEventFields(
      projection,
      this.identity,
      occurredAt,
      "minimum-usable-ready",
    );
    if (common === null) return null;
    return {
      ...common,
      type: "MINIMUM_USABLE_READY",
      payload: { readiness: "MINIMUM_USABLE_READY" },
    } satisfies MinimumUsableReadyEvent;
  }
}
