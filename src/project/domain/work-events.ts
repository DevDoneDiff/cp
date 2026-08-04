/**
 * MODULE: src/project/domain/work-events.ts
 * PURPOSE: Parse untrusted project-event envelopes into the closed S1-S2 event vocabulary.
 * PUBLIC API / ENTRYPOINTS:
 *   - parseProjectEvent: validates and canonicalizes one unknown event envelope.
 *   - projectEventsEqual: distinguishes exact idempotent replay from event-ID collision.
 * INVARIANTS:
 *   - [SEC-WORK-EVENT-VALIDATION] Only the versioned allowlisted event vocabulary and exact payload shapes cross the domain boundary.
 * BOUNDARIES:
 *   - Parsing does not advance state; binding, cursor, version, prerequisite, and fixture checks belong to the reducer.
 * RELATED:
 *   - src/project/domain/model.ts: defines event and payload types.
 *   - src/project/domain/reducer.ts: applies canonical events under domain preconditions.
 */
import {
  PROJECT_EVENT_SCHEMA_VERSION,
  type ProjectEvent,
  type ProjectEventType,
} from "./model";
import {
  DomainValidationError,
  exactKeys,
  expectRecord,
  parseCertaintyKind,
  parseEnergyModel,
  parseEnum,
  parseId,
  parseIsoTimestamp,
  parseNormalizedAddress,
  parsePanelObject,
  parsePropertyCandidate,
  parseRoofFacts,
  parseRoofSurface,
  parseSafeInteger,
  parseSceneContext,
  parseSourceKind,
  parseString,
  sameValue,
} from "./validation";

export type EventParseResult =
  { ok: true; event: ProjectEvent } | { ok: false; reason: "INVALID_EVENT" };

const EVENT_TYPES = [
  "ADDRESS_RESOLVED",
  "PROJECT_MUTATED",
  "PROPERTY_CONFIRMED",
  "ROOF_GEOMETRY_READY",
  "PANEL_OBJECT_ADDED",
  "ENERGY_MODEL_READY",
  "MINIMUM_USABLE_READY",
] as const satisfies readonly ProjectEventType[];

const ENVELOPE_KEYS = [
  "schema_version",
  "fixture_version",
  "event_id",
  "session_project_id",
  "property_id",
  "cursor",
  "expected_project_version",
  "occurred_at",
  "type",
  "payload",
] as const;

function parsePayload(
  type: ProjectEventType,
  value: unknown,
): ProjectEvent["payload"] {
  const payload = expectRecord(value);
  switch (type) {
    case "ADDRESS_RESOLVED":
      exactKeys(payload, [
        "address_draft",
        "normalized_address",
        "source_kind",
        "certainty_kind",
        "property",
        "scene",
      ]);
      return {
        address_draft: parseString(payload.address_draft),
        normalized_address: parseNormalizedAddress(payload.normalized_address),
        source_kind: parseSourceKind(payload.source_kind),
        certainty_kind: parseCertaintyKind(payload.certainty_kind),
        property: parsePropertyCandidate(payload.property),
        scene: parseSceneContext(payload.scene),
      };
    case "PROJECT_MUTATED":
      exactKeys(payload, ["mutation", "preserved_address_draft"]);
      return {
        mutation: parseEnum(payload.mutation, ["PROPERTY_CORRECTION"] as const),
        preserved_address_draft: parseString(payload.preserved_address_draft),
      };
    case "PROPERTY_CONFIRMED":
      exactKeys(payload, ["authority"]);
      return {
        authority: parseEnum(payload.authority, [
          "EXPLICIT_USER_CONFIRMATION",
        ] as const),
      };
    case "ROOF_GEOMETRY_READY": {
      exactKeys(payload, ["surfaces", "roof_facts"]);
      if (!Array.isArray(payload.surfaces) || payload.surfaces.length > 12) {
        throw new DomainValidationError();
      }
      return {
        surfaces: payload.surfaces.map(parseRoofSurface),
        roof_facts: parseRoofFacts(payload.roof_facts),
      };
    }
    case "PANEL_OBJECT_ADDED":
      exactKeys(payload, ["panel"]);
      return { panel: parsePanelObject(payload.panel) };
    case "ENERGY_MODEL_READY":
      exactKeys(payload, ["energy_model"]);
      return { energy_model: parseEnergyModel(payload.energy_model) };
    case "MINIMUM_USABLE_READY":
      exactKeys(payload, ["readiness"]);
      return {
        readiness: parseEnum(payload.readiness, [
          "MINIMUM_USABLE_READY",
        ] as const),
      };
  }
}

// @ah SEC-WORK-EVENT-VALIDATION
export function parseProjectEvent(
  value: unknown,
  expectedFixtureVersion: string,
): EventParseResult {
  try {
    const record = expectRecord(value);
    exactKeys(record, ENVELOPE_KEYS);
    if (record.schema_version !== PROJECT_EVENT_SCHEMA_VERSION) {
      throw new DomainValidationError();
    }
    const fixtureVersion = parseId(record.fixture_version);
    if (fixtureVersion !== expectedFixtureVersion) {
      throw new DomainValidationError();
    }
    const type = parseEnum(record.type, EVENT_TYPES);
    const common = {
      schema_version: PROJECT_EVENT_SCHEMA_VERSION,
      fixture_version: fixtureVersion,
      event_id: parseId(record.event_id),
      session_project_id: parseId(record.session_project_id),
      property_id: parseId(record.property_id),
      cursor: parseSafeInteger(record.cursor, { min: 1, max: 100 }),
      expected_project_version: parseSafeInteger(
        record.expected_project_version,
        {
          min: 0,
          max: 100,
        },
      ),
      occurred_at: parseIsoTimestamp(record.occurred_at),
    };
    const payload = parsePayload(type, record.payload);
    return {
      ok: true,
      event: { ...common, type, payload } as ProjectEvent,
    };
  } catch (error) {
    if (error instanceof DomainValidationError) {
      return { ok: false, reason: "INVALID_EVENT" };
    }
    return { ok: false, reason: "INVALID_EVENT" };
  }
}

export function projectEventsEqual(
  left: ProjectEvent,
  right: ProjectEvent,
): boolean {
  return sameValue(left, right);
}
