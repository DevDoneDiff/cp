/**
 * MODULE: src/project/adapters/seeded-assembly-feed.ts
 * PURPOSE: Construct the deterministic same-origin seeded assembly feed from bounded correlation values.
 * PUBLIC API / ENTRYPOINTS:
 *   - parseAssemblyFeedRequest: validates the exact route query contract.
 *   - createSeededAssemblyEvent: creates one fixture-bound candidate event for a semantic schedule slot.
 *   - seededAssemblyScheduleOffsets: selects the production or explicitly injected test schedule.
 * INVARIANTS:
 *   - [SEC-BOUNDED-FEED-CONTEXT] Route correlation is exact, bounded, fixture-consistent, and contains no address or stored projection.
 *   - [INV-DETERMINISTIC-FEED] One confirmation context and schedule slot always produce the same event IDs, object IDs, payload, cursor, version, and canonical provenance timestamp; test acceleration changes delivery only.
 * BOUNDARIES:
 *   - Feed output is untrusted candidate input; only the client runtime reducer may accept it as project state.
 * RELATED:
 *   - src/project/application/live-roof-assembly.ts: defines the transport cursor contract.
 *   - src/project/adapters/seeded-demo.ts: owns deliberate fixture geometry and modeled facts.
 *   - src/project/domain/reducer.ts: validates every candidate event against current accepted state.
 * SECURITY:
 *   - Supplied identifiers are correlation only and confer no authentication, persistence, provider access, or domain authority.
 * DATA:
 *   - The feed contains only local versioned fixture events; no homeowner input, cookie, credential, or durable record is read.
 */
import type { AssemblyFeedCursor } from "../application/live-roof-assembly";
import {
  PROJECT_EVENT_SCHEMA_VERSION,
  type IdentitySource,
  type PanelObject,
  type ProjectEvent,
  type RoofSurface,
} from "../domain/model";
import {
  seededCandidateEventId,
  seededPanelId,
  seededPropertyId,
  seededSurfaceId,
  semanticStableId,
} from "../domain/identity";
import {
  DomainValidationError,
  parseId,
  parseIsoTimestamp,
  parseSafeInteger,
} from "../domain/validation";
import { assemblyEventOccurredAt } from "../domain/assembly-event-timing";
import { SEEDED_DEMO_FIXTURE } from "./seeded-demo";

export const SEEDED_ASSEMBLY_EVENT_COUNT =
  SEEDED_DEMO_FIXTURE.panels.length + 3;
export const SEEDED_ASSEMBLY_VISIBLE_DURATION_MS = 24_000;

const PRODUCTION_DELIVERY_OFFSETS_MS = [
  2_500, 5_500, 8_500, 11_500, 14_500, 18_000, 24_000,
] as const;
const ACCELERATED_DELIVERY_OFFSETS_MS = [
  100, 200, 300, 400, 500, 600, 700,
] as const;
const MAX_CONFIRMATION_CLOCK_SKEW_MS = 5_000;
const QUERY_KEYS = [
  "fixture_version",
  "session_project_id",
  "property_id",
  "candidate_ordinal",
  "confirmation_cursor",
  "confirmation_occurred_at",
  "after_cursor",
  "project_version",
] as const;

const stableIdentity: IdentitySource = {
  createProjectId() {
    throw new Error("FEED_CANNOT_CREATE_PROJECT");
  },
  stableId: semanticStableId,
};

export type AssemblyFeedRequestResult =
  | { ok: true; cursor: AssemblyFeedCursor }
  | { ok: false; reason: "INVALID_ASSEMBLY_REQUEST" };

function oneQueryValue(params: URLSearchParams, key: string): string {
  const values = params.getAll(key);
  if (values.length !== 1) throw new DomainValidationError();
  return values[0] ?? "";
}

// @ah SEC-BOUNDED-FEED-CONTEXT
export function parseAssemblyFeedRequest(url: URL): AssemblyFeedRequestResult {
  try {
    const actualKeys = [...url.searchParams.keys()];
    if (
      actualKeys.length !== QUERY_KEYS.length ||
      QUERY_KEYS.some((key) => !actualKeys.includes(key)) ||
      actualKeys.some((key) => !QUERY_KEYS.includes(key as never))
    ) {
      throw new DomainValidationError();
    }
    const fixtureVersion = parseId(
      oneQueryValue(url.searchParams, "fixture_version"),
    );
    if (fixtureVersion !== SEEDED_DEMO_FIXTURE.fixture_version) {
      throw new DomainValidationError();
    }
    const sessionProjectId = parseId(
      oneQueryValue(url.searchParams, "session_project_id"),
    );
    const propertyId = parseId(oneQueryValue(url.searchParams, "property_id"));
    const candidateOrdinal = parseSafeInteger(
      Number(oneQueryValue(url.searchParams, "candidate_ordinal")),
      { min: 1, max: 50 },
    );
    const confirmationCursor = parseSafeInteger(
      Number(oneQueryValue(url.searchParams, "confirmation_cursor")),
      { min: 2, max: 100 },
    );
    const confirmationOccurredAt = parseIsoTimestamp(
      oneQueryValue(url.searchParams, "confirmation_occurred_at"),
    );
    if (
      new Date(confirmationOccurredAt).getTime() >
      Date.now() + MAX_CONFIRMATION_CLOCK_SKEW_MS
    ) {
      throw new DomainValidationError();
    }
    const afterCursor = parseSafeInteger(
      Number(oneQueryValue(url.searchParams, "after_cursor")),
      { min: 2, max: 100 },
    );
    const projectVersion = parseSafeInteger(
      Number(oneQueryValue(url.searchParams, "project_version")),
      { min: 2, max: 100 },
    );
    const expectedPropertyId = seededPropertyId(
      stableIdentity,
      sessionProjectId,
      SEEDED_DEMO_FIXTURE.property.fixture_property_key,
      candidateOrdinal,
    );
    if (
      propertyId !== expectedPropertyId ||
      confirmationCursor !== candidateOrdinal * 2 ||
      projectVersion !== afterCursor ||
      afterCursor < confirmationCursor ||
      afterCursor > confirmationCursor + SEEDED_ASSEMBLY_EVENT_COUNT
    ) {
      throw new DomainValidationError();
    }
    return {
      ok: true,
      cursor: {
        fixtureVersion,
        sessionProjectId,
        propertyId,
        candidateOrdinal,
        confirmationCursor,
        confirmationOccurredAt,
        afterCursor,
        projectVersion,
      },
    };
  } catch {
    return { ok: false, reason: "INVALID_ASSEMBLY_REQUEST" };
  }
}

export function seededAssemblyScheduleOffsets(): readonly number[] {
  return process.env.CP_ASSEMBLY_TIMING_MODE === "accelerated"
    ? ACCELERATED_DELIVERY_OFFSETS_MS
    : PRODUCTION_DELIVERY_OFFSETS_MS;
}

export function assemblyEventIndexAfter(cursor: AssemblyFeedCursor): number {
  return cursor.afterCursor - cursor.confirmationCursor;
}

export function assemblyEventDueAtMs(
  cursor: AssemblyFeedCursor,
  eventIndex: number,
): number {
  const offset = seededAssemblyScheduleOffsets()[eventIndex];
  if (offset === undefined) throw new DomainValidationError();
  return new Date(cursor.confirmationOccurredAt).getTime() + offset;
}

function commonEventFields(
  cursor: AssemblyFeedCursor,
  eventIndex: number,
  semanticEventKey: string,
) {
  return {
    schema_version: PROJECT_EVENT_SCHEMA_VERSION,
    fixture_version: cursor.fixtureVersion,
    event_id: seededCandidateEventId(
      stableIdentity,
      cursor.sessionProjectId,
      cursor.candidateOrdinal,
      semanticEventKey,
    ),
    session_project_id: cursor.sessionProjectId,
    property_id: cursor.propertyId,
    cursor: cursor.confirmationCursor + eventIndex + 1,
    expected_project_version: cursor.confirmationCursor + eventIndex,
    occurred_at: assemblyEventOccurredAt(
      cursor.confirmationOccurredAt,
      cursor.confirmationCursor,
      cursor.confirmationCursor + eventIndex + 1,
    ),
  } as const;
}

function createRoofSurfaces(cursor: AssemblyFeedCursor): RoofSurface[] {
  return SEEDED_DEMO_FIXTURE.roof.surfaces.map((surface) => ({
    surface_id: seededSurfaceId(
      stableIdentity,
      cursor.sessionProjectId,
      cursor.propertyId,
      surface.fixture_surface_key,
    ),
    fixture_surface_key: surface.fixture_surface_key,
    polygon: surface.polygon.map((point) => ({ ...point })),
    pitch_degrees: surface.pitch_degrees,
    azimuth_degrees: surface.azimuth_degrees,
  }));
}

function createPanel(
  cursor: AssemblyFeedCursor,
  panelIndex: number,
): PanelObject {
  const expected = SEEDED_DEMO_FIXTURE.panels[panelIndex];
  if (expected === undefined) throw new DomainValidationError();
  return {
    panel_id: seededPanelId(
      stableIdentity,
      cursor.sessionProjectId,
      cursor.propertyId,
      expected.fixture_panel_key,
    ),
    surface_id: seededSurfaceId(
      stableIdentity,
      cursor.sessionProjectId,
      cursor.propertyId,
      expected.fixture_surface_key,
    ),
    fixture_panel_key: expected.fixture_panel_key,
    placement_rank: expected.placement_rank,
    geometry: { ...expected.geometry },
    render_status: "rendered",
    selection_state: "unselected",
  };
}

// @ah INV-DETERMINISTIC-FEED
export function createSeededAssemblyEvent(
  cursor: AssemblyFeedCursor,
  eventIndex: number,
): ProjectEvent {
  if (eventIndex === 0) {
    return {
      ...commonEventFields(cursor, eventIndex, "roof-geometry-ready"),
      type: "ROOF_GEOMETRY_READY",
      payload: {
        surfaces: createRoofSurfaces(cursor),
        roof_facts: { ...SEEDED_DEMO_FIXTURE.roof.facts },
      },
    };
  }
  const panelIndex = eventIndex - 1;
  if (panelIndex < SEEDED_DEMO_FIXTURE.panels.length) {
    const panel = createPanel(cursor, panelIndex);
    return {
      ...commonEventFields(
        cursor,
        eventIndex,
        `panel-added:${panel.placement_rank}`,
      ),
      type: "PANEL_OBJECT_ADDED",
      payload: { panel },
    };
  }
  if (eventIndex === SEEDED_DEMO_FIXTURE.panels.length + 1) {
    return {
      ...commonEventFields(cursor, eventIndex, "energy-model-ready"),
      type: "ENERGY_MODEL_READY",
      payload: { energy_model: { ...SEEDED_DEMO_FIXTURE.energy } },
    };
  }
  if (eventIndex === SEEDED_DEMO_FIXTURE.panels.length + 2) {
    return {
      ...commonEventFields(cursor, eventIndex, "minimum-usable-ready"),
      type: "MINIMUM_USABLE_READY",
      payload: { readiness: "MINIMUM_USABLE_READY" },
    };
  }
  throw new DomainValidationError();
}
