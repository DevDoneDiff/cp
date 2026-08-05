/**
 * MODULE: src/project/domain/assembly-event-timing.ts
 * PURPOSE: Define and validate versioned deterministic provenance timestamps for seeded S2 modeled-work events.
 * PUBLIC API / ENTRYPOINTS:
 *   - assemblyEventOccurredAt: derives one canonical modeled-event timestamp from confirmation and cursor.
 *   - assemblyEventTimestampMatches: binds a modeled event cursor to the exact permitted offset from property confirmation.
 * INVARIANTS:
 *   - [SEC-ASSEMBLY-EVENT-TIMESTAMP] Modeled-work provenance accepts only an exact known schedule slot relative to its active confirmation.
 * BOUNDARIES:
 *   - Delivery acceleration never changes canonical event provenance; legacy-v1 remains restore-compatible for projections created by the delivered inert schedule.
 * RELATED:
 *   - src/project/adapters/seeded-assembly-feed.ts: selects one live schedule and constructs canonical timestamps.
 *   - src/project/adapters/browser-assembly-transport.ts: rejects live payloads outside the live schedule contracts.
 *   - src/project/domain/reducer.ts: applies the same timestamp rule during event acceptance and stored-event replay.
 * SECURITY:
 *   - Exact schedule matching prevents otherwise valid wire or stored events from poisoning projection provenance with arbitrary timestamps.
 */

const SEEDED_ASSEMBLY_PROVENANCE_OFFSETS = {
  canonical: [2_500, 5_500, 8_500, 11_500, 14_500, 18_000, 24_000],
  "legacy-v1": [1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_000],
} as const;

export type SeededAssemblyProvenanceContract =
  keyof typeof SEEDED_ASSEMBLY_PROVENANCE_OFFSETS;

export const LIVE_ASSEMBLY_PROVENANCE_CONTRACTS = [
  "canonical",
] as const satisfies readonly SeededAssemblyProvenanceContract[];

export const RESTORABLE_ASSEMBLY_PROVENANCE_CONTRACTS = [
  ...LIVE_ASSEMBLY_PROVENANCE_CONTRACTS,
  "legacy-v1",
] as const satisfies readonly SeededAssemblyProvenanceContract[];

function seededAssemblyProvenanceOffsetsFor(
  contract: SeededAssemblyProvenanceContract,
): readonly number[] {
  return SEEDED_ASSEMBLY_PROVENANCE_OFFSETS[contract];
}

export function assemblyEventOccurredAt(
  confirmationOccurredAt: string,
  confirmationCursor: number,
  eventCursor: number,
): string {
  const eventIndex = eventCursor - confirmationCursor - 1;
  const confirmationTime = new Date(confirmationOccurredAt).getTime();
  const offset = seededAssemblyProvenanceOffsetsFor("canonical")[eventIndex];
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
  acceptedContracts: readonly SeededAssemblyProvenanceContract[];
}

// @ah SEC-ASSEMBLY-EVENT-TIMESTAMP
export function assemblyEventTimestampMatches({
  eventOccurredAt,
  eventCursor,
  confirmationOccurredAt,
  confirmationCursor,
  acceptedContracts,
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
  return acceptedContracts.some((contract) => {
    const offset = seededAssemblyProvenanceOffsetsFor(contract)[eventIndex];
    return offset !== undefined && eventTime === confirmationTime + offset;
  });
}
