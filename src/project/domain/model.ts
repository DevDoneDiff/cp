/**
 * MODULE: src/project/domain/model.ts
 * PURPOSE: Define the versioned pre-account project, fixture, event, and visible-state contracts shared across S1 and S2.
 * PUBLIC API / ENTRYPOINTS:
 *   - SessionProjectProjection: canonical browser-session project projection.
 *   - ProjectEvent: accepted address, mutation, confirmation, and modeled-work event union.
 *   - SeededFixtureContract: replaceable deterministic demo-data contract.
 * INVARIANTS:
 *   - [INV-S1-S2-STATE-BOUNDARY] Visible product state is limited to ADDRESS_ENTRY, PROPERTY_CONFIRMATION, and LIVE_ROOF_ASSEMBLY.
 *   - [INV-STABLE-PROJECT-IDENTITY] Persisted project, property, scene, camera, surface, panel, and event identities are explicit data.
 *   - [INV-FIXTURE-SCENE-COORDINATES] Candidate outlines use normalized fixture coordinates and remain separate from event-gated roof geometry.
 * BOUNDARIES:
 *   - This module defines data contracts only; transition legality, persistence, browser APIs, and rendering belong elsewhere.
 * RELATED:
 *   - src/project/domain/reducer.ts: owns legal transitions and event application.
 *   - src/project/domain/projection.ts: validates untrusted stored projections.
 *   - src/project/adapters/seeded-demo.ts: implements the canonical fixture contract.
 */

export const SESSION_PROJECT_SCHEMA_VERSION = 1 as const;
export const PROJECT_EVENT_SCHEMA_VERSION = 1 as const;

export type VisibleProjectState =
  "ADDRESS_ENTRY" | "PROPERTY_CONFIRMATION" | "LIVE_ROOF_ASSEMBLY";

// @ah INV-S1-S2-STATE-BOUNDARY
export const VISIBLE_PROJECT_STATES = [
  "ADDRESS_ENTRY",
  "PROPERTY_CONFIRMATION",
  "LIVE_ROOF_ASSEMBLY",
] as const satisfies readonly VisibleProjectState[];

export type SourceKind = "SEEDED_DEMO_IMAGERY";
export type CertaintyKind = "DEMO_PROPERTY_MATCH";
export type FactSourceKind = "MODELED";

export interface NormalizedAddress {
  fixture_address_key: string;
  formatted_address: string;
  street_line: string;
  locality: string;
  region: string;
  postal_code: string;
}

export interface PropertyCandidate {
  property_id: string;
  fixture_property_key: string;
  display_address: string;
}

export interface SceneContext {
  scene_id: string;
  camera_id: string;
  fixture_scene_key: string;
  fixture_camera_key: string;
}

export interface PointGeometry {
  x: number;
  y: number;
}

export interface RoofSurface {
  surface_id: string;
  fixture_surface_key: string;
  polygon: PointGeometry[];
  pitch_degrees: number;
  azimuth_degrees: number;
}

export interface RoofFacts {
  fact_source: FactSourceKind;
  modeled_roof_area_sq_ft: number;
}

export interface PanelGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation_degrees: number;
}

export type PanelRenderStatus = "rendered";
export type PanelSelectionState = "unselected" | "selected";

export interface PanelObject {
  panel_id: string;
  surface_id: string;
  fixture_panel_key: string;
  placement_rank: number;
  geometry: PanelGeometry;
  render_status: PanelRenderStatus;
  selection_state: PanelSelectionState;
}

export interface EnergyModel {
  fact_source: FactSourceKind;
  modeled_annual_kwh: number;
}

export type ProjectEventType =
  | "ADDRESS_RESOLVED"
  | "PROJECT_MUTATED"
  | "PROPERTY_CONFIRMED"
  | "ROOF_GEOMETRY_READY"
  | "PANEL_OBJECT_ADDED"
  | "ENERGY_MODEL_READY"
  | "MINIMUM_USABLE_READY";

export interface ProjectEventEnvelope<
  TType extends ProjectEventType,
  TPayload,
> {
  schema_version: typeof PROJECT_EVENT_SCHEMA_VERSION;
  fixture_version: string;
  event_id: string;
  session_project_id: string;
  property_id: string;
  cursor: number;
  expected_project_version: number;
  occurred_at: string;
  type: TType;
  payload: TPayload;
}

export type AddressResolvedEvent = ProjectEventEnvelope<
  "ADDRESS_RESOLVED",
  {
    address_draft: string;
    normalized_address: NormalizedAddress;
    source_kind: SourceKind;
    certainty_kind: CertaintyKind;
    property: PropertyCandidate;
    scene: SceneContext;
  }
>;

export type ProjectMutatedEvent = ProjectEventEnvelope<
  "PROJECT_MUTATED",
  {
    mutation: "PROPERTY_CORRECTION";
    preserved_address_draft: string;
  }
>;

export type PropertyConfirmedEvent = ProjectEventEnvelope<
  "PROPERTY_CONFIRMED",
  {
    authority: "EXPLICIT_USER_CONFIRMATION";
  }
>;

export type RoofGeometryReadyEvent = ProjectEventEnvelope<
  "ROOF_GEOMETRY_READY",
  {
    surfaces: RoofSurface[];
    roof_facts: RoofFacts;
  }
>;

export type PanelObjectAddedEvent = ProjectEventEnvelope<
  "PANEL_OBJECT_ADDED",
  {
    panel: PanelObject;
  }
>;

export type EnergyModelReadyEvent = ProjectEventEnvelope<
  "ENERGY_MODEL_READY",
  {
    energy_model: EnergyModel;
  }
>;

export type MinimumUsableReadyEvent = ProjectEventEnvelope<
  "MINIMUM_USABLE_READY",
  {
    readiness: "MINIMUM_USABLE_READY";
  }
>;

export type ProjectEvent =
  | AddressResolvedEvent
  | ProjectMutatedEvent
  | PropertyConfirmedEvent
  | RoofGeometryReadyEvent
  | PanelObjectAddedEvent
  | EnergyModelReadyEvent
  | MinimumUsableReadyEvent;

export interface SessionProjectProjection {
  schema_version: typeof SESSION_PROJECT_SCHEMA_VERSION;
  fixture_version: string;
  session_project_id: string;
  project_version: number;
  visible_state: VisibleProjectState;
  created_at: string;
  updated_at: string;
  address_draft: string;
  normalized_address: NormalizedAddress | null;
  source_kind: SourceKind | null;
  certainty_kind: CertaintyKind | null;
  property: PropertyCandidate | null;
  scene: SceneContext | null;
  roof_surfaces: RoofSurface[];
  roof_facts: RoofFacts | null;
  panel_objects: PanelObject[];
  energy_model: EnergyModel | null;
  minimum_usable_ready: boolean;
  accepted_event_ids: string[];
  latest_cursor: number;
  events: ProjectEvent[];
}

export interface FixtureSurfaceContract {
  fixture_surface_key: string;
  polygon: readonly PointGeometry[];
  pitch_degrees: number;
  azimuth_degrees: number;
}

export interface FixturePanelContract {
  fixture_panel_key: string;
  fixture_surface_key: string;
  placement_rank: number;
  geometry: PanelGeometry;
}

export interface SeededFixtureContract {
  fixture_version: string;
  accepted_inputs: readonly string[];
  normalized_address: NormalizedAddress;
  source_kind: SourceKind;
  certainty_kind: CertaintyKind;
  property: {
    fixture_property_key: string;
    display_address: string;
    // @ah INV-FIXTURE-SCENE-COORDINATES
    outline_polygon: readonly PointGeometry[];
  };
  scene: {
    fixture_scene_key: string;
    fixture_camera_key: string;
  };
  roof: {
    surfaces: readonly FixtureSurfaceContract[];
    facts: RoofFacts;
  };
  panels: readonly FixturePanelContract[];
  energy: EnergyModel;
}

export interface IdentitySource {
  createProjectId(): string;
  stableId(sessionProjectId: string, semanticKey: string): string;
}

export interface Clock {
  nowIso(): string;
}

// @ah INV-STABLE-PROJECT-IDENTITY
export interface SeededIdentitySet {
  property_id: string;
  scene_id: string;
  camera_id: string;
}
