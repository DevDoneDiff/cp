/**
 * MODULE: src/project/domain/projection.ts
 * PURPOSE: Validate and canonicalize the versioned session project restored from an untrusted browser-session value.
 * PUBLIC API / ENTRYPOINTS:
 *   - parseSessionProjectProjection: strict object validation plus accepted-event replay.
 *   - serializeSessionProjectProjection: canonical validated serialization for atomic storage writes.
 * INVARIANTS:
 *   - [COMPAT-PROJECTION-SCHEMA] Only the current exact projection and fixture versions may restore.
 *   - [SEC-UNTRUSTED-RESTORE] Derived state must equal a legal replay of the bounded accepted event record.
 * BOUNDARIES:
 *   - Raw JSON size and browser API failures are handled by the storage adapter; this module owns domain shape, semantic identity, and replay coherence.
 * RELATED:
 *   - src/project/domain/reducer.ts: reconstructs legal state from accepted events.
 *   - src/project/adapters/browser-runtime.ts: owns the sessionStorage access boundary.
 */
import {
  SESSION_PROJECT_SCHEMA_VERSION,
  VISIBLE_PROJECT_STATES,
  type IdentitySource,
  type ProjectEvent,
  type SeededFixtureContract,
  type SessionProjectProjection,
} from "./model";
import { replayProjectEvents } from "./reducer";
import {
  DomainValidationError,
  exactKeys,
  expectRecord,
  parseArray,
  parseCertaintyKind,
  parseEnergyModel,
  parseEnum,
  parseId,
  parseIsoTimestamp,
  parseNormalizedAddress,
  parseNullable,
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
import { parseProjectEvent } from "./work-events";

export const MAX_SESSION_PROJECT_BYTES = 128_000;

export function sessionProjectByteLength(serialized: string): number {
  return new TextEncoder().encode(serialized).byteLength;
}

export type ProjectionParseResult =
  | { ok: true; projection: SessionProjectProjection }
  | { ok: false; reason: "INVALID_PROJECTION" };

export type ProjectionSerializeResult =
  | {
      ok: true;
      projection: SessionProjectProjection;
      serialized: string;
    }
  | { ok: false; reason: "INVALID_PROJECTION" | "SERIALIZATION_FAILED" };

const PROJECTION_KEYS = [
  "schema_version",
  "fixture_version",
  "session_project_id",
  "project_version",
  "visible_state",
  "created_at",
  "updated_at",
  "address_draft",
  "normalized_address",
  "source_kind",
  "certainty_kind",
  "property",
  "scene",
  "roof_surfaces",
  "roof_facts",
  "panel_objects",
  "energy_model",
  "minimum_usable_ready",
  "accepted_event_ids",
  "latest_cursor",
  "events",
] as const;

function parseBoolean(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new DomainValidationError();
  }
  return value;
}

function parseAcceptedEvents(
  value: unknown,
  fixtureVersion: string,
): ProjectEvent[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) {
    throw new DomainValidationError();
  }
  return value.map((candidate) => {
    const parsed = parseProjectEvent(candidate, fixtureVersion);
    if (!parsed.ok) {
      throw new DomainValidationError();
    }
    return parsed.event;
  });
}

// @ah SEC-UNTRUSTED-RESTORE
export function parseSessionProjectProjection(
  value: unknown,
  fixture: SeededFixtureContract,
  identity: IdentitySource,
): ProjectionParseResult {
  try {
    const record = expectRecord(value);
    exactKeys(record, PROJECTION_KEYS);
    if (record.schema_version !== SESSION_PROJECT_SCHEMA_VERSION) {
      throw new DomainValidationError();
    }
    const fixtureVersion = parseId(record.fixture_version);
    // @ah COMPAT-PROJECTION-SCHEMA
    if (fixtureVersion !== fixture.fixture_version) {
      throw new DomainValidationError();
    }
    const parsed: SessionProjectProjection = {
      schema_version: SESSION_PROJECT_SCHEMA_VERSION,
      fixture_version: fixtureVersion,
      session_project_id: parseId(record.session_project_id),
      project_version: parseSafeInteger(record.project_version, {
        min: 1,
        max: 100,
      }),
      visible_state: parseEnum(record.visible_state, VISIBLE_PROJECT_STATES),
      created_at: parseIsoTimestamp(record.created_at),
      updated_at: parseIsoTimestamp(record.updated_at),
      address_draft: parseString(record.address_draft),
      normalized_address: parseNullable(
        record.normalized_address,
        parseNormalizedAddress,
      ),
      source_kind: parseNullable(record.source_kind, parseSourceKind),
      certainty_kind: parseNullable(record.certainty_kind, parseCertaintyKind),
      property: parseNullable(record.property, parsePropertyCandidate),
      scene: parseNullable(record.scene, parseSceneContext),
      roof_surfaces: parseArray(record.roof_surfaces, parseRoofSurface, 12),
      roof_facts: parseNullable(record.roof_facts, parseRoofFacts),
      panel_objects: parseArray(record.panel_objects, parsePanelObject, 100),
      energy_model: parseNullable(record.energy_model, parseEnergyModel),
      minimum_usable_ready: parseBoolean(record.minimum_usable_ready),
      accepted_event_ids: parseArray(record.accepted_event_ids, parseId, 100),
      latest_cursor: parseSafeInteger(record.latest_cursor, {
        min: 1,
        max: 100,
      }),
      events: parseAcceptedEvents(record.events, fixtureVersion),
    };
    const replayed = replayProjectEvents(parsed.events, fixture, identity);
    if (replayed === null || !sameValue(parsed, replayed)) {
      throw new DomainValidationError();
    }
    return { ok: true, projection: replayed };
  } catch (error) {
    if (error instanceof DomainValidationError) {
      return { ok: false, reason: "INVALID_PROJECTION" };
    }
    return { ok: false, reason: "INVALID_PROJECTION" };
  }
}

export function serializeSessionProjectProjection(
  value: unknown,
  fixture: SeededFixtureContract,
  identity: IdentitySource,
): ProjectionSerializeResult {
  const parsed = parseSessionProjectProjection(value, fixture, identity);
  if (!parsed.ok) {
    return parsed;
  }
  try {
    const serialized = JSON.stringify(parsed.projection);
    if (sessionProjectByteLength(serialized) > MAX_SESSION_PROJECT_BYTES) {
      return { ok: false, reason: "SERIALIZATION_FAILED" };
    }
    return { ok: true, projection: parsed.projection, serialized };
  } catch {
    return { ok: false, reason: "SERIALIZATION_FAILED" };
  }
}
