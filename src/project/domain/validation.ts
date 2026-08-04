/**
 * MODULE: src/project/domain/validation.ts
 * PURPOSE: Canonicalize bounded untrusted values used by session projections and work events.
 * PUBLIC API / ENTRYPOINTS:
 *   - parse* helpers: rebuild known domain value objects from unknown input.
 *   - expectRecord and exactKeys: enforce closed object shapes without trusting prototypes.
 * INVARIANTS:
 *   - [SEC-CANONICAL-UNTRUSTED-DATA] Unknown keys, unsafe values, unsupported labels, and prototype-shaped input are rejected.
 * BOUNDARIES:
 *   - These helpers validate value shapes; event ordering and full-projection coherence belong to reducer and projection modules.
 * RELATED:
 *   - src/project/domain/work-events.ts: validates untrusted event envelopes.
 *   - src/project/domain/projection.ts: validates untrusted sessionStorage payloads.
 */
import type {
  CertaintyKind,
  EnergyModel,
  NormalizedAddress,
  PanelGeometry,
  PanelObject,
  PropertyCandidate,
  RoofFacts,
  RoofSurface,
  SceneContext,
  SourceKind,
} from "./model";

export class DomainValidationError extends Error {
  constructor() {
    super("INVALID_DOMAIN_VALUE");
    this.name = "DomainValidationError";
  }
}

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:_-]{0,159}$/;

function fail(): never {
  throw new DomainValidationError();
}

export function expectRecord(value: unknown): Record<string, unknown> {
  // @ah SEC-CANONICAL-UNTRUSTED-DATA
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return fail();
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return fail();
  }
  return value as Record<string, unknown>;
}

export function exactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): void {
  const actual = Object.keys(value);
  if (
    actual.some((key) => FORBIDDEN_KEYS.has(key)) ||
    actual.length !== expected.length ||
    expected.some((key) => !Object.prototype.hasOwnProperty.call(value, key))
  ) {
    fail();
  }
}

export function parseString(
  value: unknown,
  options: { min?: number; max?: number } = {},
): string {
  const min = options.min ?? 1;
  const max = options.max ?? 240;
  if (
    typeof value !== "string" ||
    value.length < min ||
    value.length > max ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)
  ) {
    return fail();
  }
  return value;
}

export function parseId(value: unknown): string {
  const parsed = parseString(value, { max: 160 });
  if (!ID_PATTERN.test(parsed)) {
    fail();
  }
  return parsed;
}

export function parseSafeInteger(
  value: unknown,
  options: { min?: number; max?: number } = {},
): number {
  const min = options.min ?? 0;
  const max = options.max ?? Number.MAX_SAFE_INTEGER;
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < min ||
    value > max
  ) {
    return fail();
  }
  return value;
}

export function parseFiniteNumber(
  value: unknown,
  options: { min: number; max: number },
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < options.min ||
    value > options.max
  ) {
    return fail();
  }
  return value;
}

export function parseIsoTimestamp(value: unknown): string {
  const parsed = parseString(value, { max: 40 });
  const date = new Date(parsed);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== parsed) {
    fail();
  }
  return parsed;
}

export function parseEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    return fail();
  }
  return value as T;
}

export function parseNullable<T>(
  value: unknown,
  parser: (candidate: unknown) => T,
): T | null {
  return value === null ? null : parser(value);
}

export function parseArray<T>(
  value: unknown,
  parser: (candidate: unknown) => T,
  max: number,
): T[] {
  if (!Array.isArray(value) || value.length > max) {
    return fail();
  }
  return value.map(parser);
}

export function parseNormalizedAddress(value: unknown): NormalizedAddress {
  const record = expectRecord(value);
  exactKeys(record, [
    "fixture_address_key",
    "formatted_address",
    "street_line",
    "locality",
    "region",
    "postal_code",
  ]);
  return {
    fixture_address_key: parseId(record.fixture_address_key),
    formatted_address: parseString(record.formatted_address),
    street_line: parseString(record.street_line),
    locality: parseString(record.locality, { max: 100 }),
    region: parseString(record.region, { max: 32 }),
    postal_code: parseString(record.postal_code, { max: 20 }),
  };
}

export function parsePropertyCandidate(value: unknown): PropertyCandidate {
  const record = expectRecord(value);
  exactKeys(record, ["property_id", "fixture_property_key", "display_address"]);
  return {
    property_id: parseId(record.property_id),
    fixture_property_key: parseId(record.fixture_property_key),
    display_address: parseString(record.display_address),
  };
}

export function parseSceneContext(value: unknown): SceneContext {
  const record = expectRecord(value);
  exactKeys(record, [
    "scene_id",
    "camera_id",
    "fixture_scene_key",
    "fixture_camera_key",
  ]);
  return {
    scene_id: parseId(record.scene_id),
    camera_id: parseId(record.camera_id),
    fixture_scene_key: parseId(record.fixture_scene_key),
    fixture_camera_key: parseId(record.fixture_camera_key),
  };
}

function parsePoint(value: unknown): { x: number; y: number } {
  const record = expectRecord(value);
  exactKeys(record, ["x", "y"]);
  return {
    x: parseFiniteNumber(record.x, { min: 0, max: 1 }),
    y: parseFiniteNumber(record.y, { min: 0, max: 1 }),
  };
}

export function parseRoofSurface(value: unknown): RoofSurface {
  const record = expectRecord(value);
  exactKeys(record, [
    "surface_id",
    "fixture_surface_key",
    "polygon",
    "pitch_degrees",
    "azimuth_degrees",
  ]);
  const polygon = parseArray(record.polygon, parsePoint, 12);
  if (polygon.length < 3) {
    fail();
  }
  return {
    surface_id: parseId(record.surface_id),
    fixture_surface_key: parseId(record.fixture_surface_key),
    polygon,
    pitch_degrees: parseFiniteNumber(record.pitch_degrees, {
      min: 0,
      max: 90,
    }),
    azimuth_degrees: parseFiniteNumber(record.azimuth_degrees, {
      min: 0,
      max: 360,
    }),
  };
}

export function parseRoofFacts(value: unknown): RoofFacts {
  const record = expectRecord(value);
  exactKeys(record, ["fact_source", "modeled_roof_area_sq_ft"]);
  return {
    fact_source: parseEnum(record.fact_source, ["MODELED"] as const),
    modeled_roof_area_sq_ft: parseSafeInteger(record.modeled_roof_area_sq_ft, {
      min: 1,
      max: 100_000,
    }),
  };
}

export function parsePanelGeometry(value: unknown): PanelGeometry {
  const record = expectRecord(value);
  exactKeys(record, ["x", "y", "width", "height", "rotation_degrees"]);
  return {
    x: parseFiniteNumber(record.x, { min: 0, max: 1 }),
    y: parseFiniteNumber(record.y, { min: 0, max: 1 }),
    width: parseFiniteNumber(record.width, { min: 0.001, max: 1 }),
    height: parseFiniteNumber(record.height, { min: 0.001, max: 1 }),
    rotation_degrees: parseFiniteNumber(record.rotation_degrees, {
      min: -360,
      max: 360,
    }),
  };
}

export function parsePanelObject(value: unknown): PanelObject {
  const record = expectRecord(value);
  exactKeys(record, [
    "panel_id",
    "surface_id",
    "fixture_panel_key",
    "placement_rank",
    "geometry",
    "render_status",
    "selection_state",
  ]);
  return {
    panel_id: parseId(record.panel_id),
    surface_id: parseId(record.surface_id),
    fixture_panel_key: parseId(record.fixture_panel_key),
    placement_rank: parseSafeInteger(record.placement_rank, {
      min: 1,
      max: 100,
    }),
    geometry: parsePanelGeometry(record.geometry),
    render_status: parseEnum(record.render_status, ["rendered"] as const),
    selection_state: parseEnum(record.selection_state, [
      "unselected",
      "selected",
    ] as const),
  };
}

export function parseEnergyModel(value: unknown): EnergyModel {
  const record = expectRecord(value);
  exactKeys(record, ["fact_source", "modeled_annual_kwh"]);
  return {
    fact_source: parseEnum(record.fact_source, ["MODELED"] as const),
    modeled_annual_kwh: parseSafeInteger(record.modeled_annual_kwh, {
      min: 1,
      max: 1_000_000,
    }),
  };
}

export function parseSourceKind(value: unknown): SourceKind {
  return parseEnum(value, ["SEEDED_DEMO_IMAGERY"] as const);
}

export function parseCertaintyKind(value: unknown): CertaintyKind {
  return parseEnum(value, ["DEMO_PROPERTY_MATCH"] as const);
}

export function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
