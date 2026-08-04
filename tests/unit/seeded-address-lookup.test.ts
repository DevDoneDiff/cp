import { describe, expect, it } from "vitest";

import type { AddressFixtureAdapter } from "../../src/project/adapters/seeded-demo";
import {
  LocalSeededAddressLookup,
  suggestSeededAddress,
} from "../../src/project/adapters/seeded-address-lookup";

describe("seeded S1 lookup boundary", () => {
  it("offers only the canonical bounded fixture suggestion", () => {
    expect(suggestSeededAddress("123 Map")).toEqual({
      command_input: "123 Maple St, Austin, TX 78704",
      street_line: "123 Maple St",
      locality_line: "Austin, TX 78704",
      formatted_address: "123 Maple St, Austin, TX 78704",
    });
    expect(suggestSeededAddress("123 Maple St, Austin")).not.toBeNull();
    expect(suggestSeededAddress("12")).toBeNull();
    expect(suggestSeededAddress("456 Oak Ave")).toBeNull();
    expect(suggestSeededAddress(`123 Maple St\u0000`)).toBeNull();
    expect(suggestSeededAddress("x".repeat(241))).toBeNull();
  });

  it("normalizes resolved, unsupported, and thrown adapter outcomes", async () => {
    const resolved = new LocalSeededAddressLookup(undefined, 0);
    await expect(resolved.resolve("123 Maple St")).resolves.toEqual({
      kind: "resolved",
      command_input: "123 Maple St",
    });
    await expect(resolved.resolve("456 Oak Ave")).resolves.toEqual({
      kind: "unsupported",
    });

    const throwingAddress: AddressFixtureAdapter = {
      resolve() {
        throw new Error("SEEDED_LOOKUP_FAILED");
      },
    };
    const failure = new LocalSeededAddressLookup(throwingAddress, 0);
    await expect(failure.resolve("123 Maple St")).resolves.toEqual({
      kind: "recoverable_failure",
    });
  });
});
