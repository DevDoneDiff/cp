/**
 * MODULE: src/project/domain/identity.ts
 * PURPOSE: Define the shared semantic slots used to derive every stable seeded project identity.
 * PUBLIC API / ENTRYPOINTS:
 *   - seeded*Id helpers: derive candidate, event, surface, and panel IDs through the injected identity source.
 *   - expectedSeededEventId: maps a typed event to its one permitted semantic event slot.
 * INVARIANTS:
 *   - [INV-SEMANTIC-IDENTITY-SLOT] One seeded semantic object or event slot always derives one stable ID and cannot claim another slot's identity.
 * BOUNDARIES:
 *   - This module defines semantic identity derivation only; it does not allocate project roots or accept transitions.
 * RELATED:
 *   - src/project/adapters/seeded-demo.ts: constructs fixture objects through these slots.
 *   - src/project/domain/reducer.ts: validates accepted and restored objects against these slots.
 */
import type { IdentitySource, ProjectEvent } from "./model";

export function seededPropertyId(
  identity: IdentitySource,
  sessionProjectId: string,
  fixturePropertyKey: string,
  candidateOrdinal: number,
): string {
  return identity.stableId(
    sessionProjectId,
    `property:${fixturePropertyKey}:${candidateOrdinal}`,
  );
}

export function seededSceneId(
  identity: IdentitySource,
  sessionProjectId: string,
  fixtureSceneKey: string,
  candidateOrdinal: number,
): string {
  return identity.stableId(
    sessionProjectId,
    `scene:${fixtureSceneKey}:${candidateOrdinal}`,
  );
}

export function seededCameraId(
  identity: IdentitySource,
  sessionProjectId: string,
  fixtureCameraKey: string,
  candidateOrdinal: number,
): string {
  return identity.stableId(
    sessionProjectId,
    `camera:${fixtureCameraKey}:${candidateOrdinal}`,
  );
}

export function seededAddressResolvedEventId(
  identity: IdentitySource,
  sessionProjectId: string,
  candidateOrdinal: number,
): string {
  return identity.stableId(
    sessionProjectId,
    `event:address-resolved:${candidateOrdinal}`,
  );
}

export function seededCandidateEventId(
  identity: IdentitySource,
  sessionProjectId: string,
  candidateOrdinal: number,
  semanticEventKey: string,
): string {
  return identity.stableId(
    sessionProjectId,
    `event:${candidateOrdinal}:${semanticEventKey}`,
  );
}

export function seededSurfaceId(
  identity: IdentitySource,
  sessionProjectId: string,
  propertyId: string,
  fixtureSurfaceKey: string,
): string {
  return identity.stableId(
    sessionProjectId,
    `surface:${propertyId}:${fixtureSurfaceKey}`,
  );
}

export function seededPanelId(
  identity: IdentitySource,
  sessionProjectId: string,
  propertyId: string,
  fixturePanelKey: string,
): string {
  return identity.stableId(
    sessionProjectId,
    `panel:${propertyId}:${fixturePanelKey}`,
  );
}

// @ah INV-SEMANTIC-IDENTITY-SLOT
export function expectedSeededEventId(
  identity: IdentitySource,
  event: ProjectEvent,
  candidateOrdinal: number,
): string {
  if (event.type === "ADDRESS_RESOLVED") {
    return seededAddressResolvedEventId(
      identity,
      event.session_project_id,
      candidateOrdinal,
    );
  }
  const semanticEventKey =
    event.type === "PROJECT_MUTATED"
      ? "property-correction"
      : event.type === "PROPERTY_CONFIRMED"
        ? "property-confirmed"
        : event.type === "ROOF_GEOMETRY_READY"
          ? "roof-geometry-ready"
          : event.type === "PANEL_OBJECT_ADDED"
            ? `panel-added:${event.payload.panel.placement_rank}`
            : event.type === "ENERGY_MODEL_READY"
              ? "energy-model-ready"
              : "minimum-usable-ready";
  return seededCandidateEventId(
    identity,
    event.session_project_id,
    candidateOrdinal,
    semanticEventKey,
  );
}
