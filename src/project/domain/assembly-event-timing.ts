/**
 * MODULE: src/project/domain/assembly-event-timing.ts
 * PURPOSE: Define and validate versioned deterministic provenance timestamps for seeded S2 modeled-work events.
 * PUBLIC API / ENTRYPOINTS:
 *   - assemblyEventOccurredAt: derives one canonical modeled-event timestamp from confirmation and cursor.
 *   - assemblyEventTimestampMatches: binds a modeled event cursor to the exact permitted offset from property confirmation.
 * INVARIANTS:
 *   - [SEC-ASSEMBLY-EVENT-TIMESTAMP] Canonical modeled-work provenance accepts only one exact known schedule slot relative to its active confirmation.
 * BOUNDARIES:
 *   - Delivery acceleration never changes canonical event provenance; the reducer isolates delivered legacy projections under an explicit unverified contract.
 * RELATED:
 *   - src/project/adapters/seeded-assembly-feed.ts: selects one live schedule and constructs canonical timestamps.
 *   - src/project/adapters/browser-assembly-transport.ts: rejects live payloads outside the canonical schedule.
 *   - src/project/domain/reducer.ts: applies this timestamp rule to canonical event acceptance and stored replay.
 * SECURITY:
 *   - Exact schedule matching prevents otherwise valid wire or stored events from poisoning projection provenance with arbitrary timestamps.
 */

const CANONICAL_ASSEMBLY_PROVENANCE_OFFSETS = [
  2_500, 5_500, 8_500, 11_500, 14_500, 18_000, 24_000,
] as const;

export function assemblyEventOccurredAt(
  confirmationOccurredAt: string,
  confirmationCursor: number,
  eventCursor: number,
): string {
  const eventIndex = eventCursor - confirmationCursor - 1;
  const confirmationTime = new Date(confirmationOccurredAt).getTime();
  const offset = CANONICAL_ASSEMBLY_PROVENANCE_OFFSETS[eventIndex];
  if (
    !Number.isSafeInteger(eventIndex) ||
    !Number.isFinite(confirmationTime) ||
    offset === undefined
  ) {
    throw new Error("INVALID_ASSEMBLY_EVENT_TIMESTAMP_CONTEXT");
  }
  return new Date(confirmationTime + offset).toISOString();
}

export interface AssemblyEventTimestampContext {
  eventOccurredAt: string;
  eventCursor: number;
  confirmationOccurredAt: string;
  confirmationCursor: number;
}

// @ah SEC-ASSEMBLY-EVENT-TIMESTAMP
export function assemblyEventTimestampMatches({
  eventOccurredAt,
  eventCursor,
  confirmationOccurredAt,
  confirmationCursor,
}: AssemblyEventTimestampContext): boolean {
  const eventIndex = eventCursor - confirmationCursor - 1;
  const confirmationTime = new Date(confirmationOccurredAt).getTime();
  const eventTime = new Date(eventOccurredAt).getTime();
  if (
    !Number.isSafeInteger(eventIndex) ||
    eventIndex < 0 ||
    !Number.isFinite(confirmationTime) ||
    !Number.isFinite(eventTime)
  ) {
    return false;
  }
  const offset = CANONICAL_ASSEMBLY_PROVENANCE_OFFSETS[eventIndex];
  return offset !== undefined && eventTime === confirmationTime + offset;
}
