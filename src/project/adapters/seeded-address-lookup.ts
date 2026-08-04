/**
 * MODULE: src/project/adapters/seeded-address-lookup.ts
 * PURPOSE: Provide the bounded asynchronous lookup seam used by the seeded S1 address experience.
 * PUBLIC API / ENTRYPOINTS:
 *   - suggestSeededAddress: derives the one canonical local suggestion without creating project state.
 *   - LocalSeededAddressLookup: delays and resolves through the existing fixture adapter with normalized failures.
 * INVARIANTS:
 *   - Suggestion and lookup results remain local fixture data and cannot create events, identities, or storage writes.
 * BOUNDARIES:
 *   - SessionProjectRuntime remains the only authority that can accept an address and create a project candidate.
 * RELATED:
 *   - src/project/adapters/seeded-demo.ts: owns the versioned fixture and canonical resolver.
 *   - src/project/ui/address-entry-experience.tsx: owns transient input and lookup presentation.
 * SECURITY:
 *   - Unknown input is length- and control-character-bounded before matching and is never logged or sent over a network.
 * DATA:
 *   - The only suggestion is the fixture-owned normalized Maple Street address.
 */
import {
  createSeededDemoAdapters,
  SEEDED_DEMO_FIXTURE,
  type AddressFixtureAdapter,
} from "./seeded-demo";

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const MINIMUM_SUGGESTION_LENGTH = 3;
const DEFAULT_LOOKUP_DELAY_MS = 420;

export interface SeededAddressSuggestion {
  command_input: string;
  street_line: string;
  locality_line: string;
  formatted_address: string;
}

export type SeededAddressLookupResult =
  | { kind: "resolved"; command_input: string }
  | { kind: "unsupported" }
  | { kind: "recoverable_failure" };

export interface SeededAddressLookup {
  resolve(input: string): Promise<SeededAddressLookupResult>;
}

export function suggestSeededAddress(
  input: unknown,
): SeededAddressSuggestion | null {
  if (
    typeof input !== "string" ||
    input.length > 240 ||
    CONTROL_CHARACTERS.test(input)
  ) {
    return null;
  }

  const compact = input.trim().replace(/\s+/g, " ");
  if (compact.length < MINIMUM_SUGGESTION_LENGTH) return null;

  const comparison = compact.toLocaleLowerCase("en-US");
  const matches = SEEDED_DEMO_FIXTURE.accepted_inputs.some((candidate) =>
    candidate.toLocaleLowerCase("en-US").startsWith(comparison),
  );
  if (!matches) return null;

  const normalized = SEEDED_DEMO_FIXTURE.normalized_address;
  return {
    command_input: normalized.formatted_address,
    street_line: normalized.street_line,
    locality_line: `${normalized.locality}, ${normalized.region} ${normalized.postal_code}`,
    formatted_address: normalized.formatted_address,
  };
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, delayMs);
  });
}

export class LocalSeededAddressLookup implements SeededAddressLookup {
  constructor(
    private readonly address: AddressFixtureAdapter = createSeededDemoAdapters()
      .address,
    private readonly delayMs = DEFAULT_LOOKUP_DELAY_MS,
  ) {}

  async resolve(input: string): Promise<SeededAddressLookupResult> {
    try {
      await wait(this.delayMs);
      const resolution = this.address.resolve(input);
      return resolution === null
        ? { kind: "unsupported" }
        : { kind: "resolved", command_input: resolution.address_draft };
    } catch {
      return { kind: "recoverable_failure" };
    }
  }
}
