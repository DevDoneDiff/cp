import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  EXPECTED_DEPENDENCIES,
  EXPECTED_DEV_DEPENDENCIES,
  validateRepositorySecurity,
  validateSecuritySnapshot,
} from "../../scripts/validation/repository-security.mjs";

interface SecurityFixture {
  nodeVersion: string;
  nvmVersion: string;
  pnpmWorkspace: string;
  lockfile: string;
  workflow: string;
  envExample: string;
  repositoryPolicy: string;
  repositoryFiles: string[];
}

const requiredScripts = {
  build: "next build",
  "format:check": "prettier --check .",
  lint: "eslint . --max-warnings 0",
  typecheck: "node scripts/typecheck.mjs",
  "test:unit": "vitest run --project unit",
  "test:integration": "vitest run --project integration",
  "test:component": "vitest run --project component",
  "test:coverage": "vitest run --coverage",
  "test:smoke": "node scripts/production-smoke.mjs",
  "test:e2e": "playwright test",
  "validate:annotations":
    "node scripts/validation/annotation-headers.mjs --candidate",
  "validate:security": "node scripts/validation/repository-security.mjs",
  validate: "node scripts/run-validation.mjs",
};

async function readFixture(name: "negative" | "positive") {
  const file = new URL(`../fixtures/security/${name}.json`, import.meta.url);
  return JSON.parse(await readFile(file, "utf8")) as SecurityFixture;
}

function manifest(overrides: Record<string, unknown> = {}) {
  return {
    private: true,
    packageManager: "pnpm@11.18.0",
    engines: { node: "24.19.0", pnpm: "11.18.0" },
    dependencies: EXPECTED_DEPENDENCIES,
    devDependencies: EXPECTED_DEV_DEPENDENCIES,
    scripts: requiredScripts,
    ...overrides,
  };
}

describe("repository security validation", () => {
  it("accepts the exact approved security fixture", async () => {
    const fixture = await readFixture("positive");
    expect(
      validateSecuritySnapshot({ ...fixture, manifest: manifest() }),
    ).toEqual([]);
  });

  it("rejects dependency, toolchain, workflow, lockfile, environment, and policy drift", async () => {
    const fixture = await readFixture("negative");
    const errors = validateSecuritySnapshot({
      ...fixture,
      manifest: manifest({
        private: false,
        packageManager: "pnpm@11.9.0",
        dependencies: { ...EXPECTED_DEPENDENCIES, "@clerk/nextjs": "1.0.0" },
      }),
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "package.json private must be true",
        "packageManager must be pnpm@11.18.0",
        "dependencies must equal the exact approved allowlist",
        "TypeScript 7 must not enter pnpm-lock.yaml",
        "pnpm-lock.yaml must resolve patched PostCSS 8.5.23 and Sharp 0.35.3 without vulnerable predecessors",
        expect.stringContaining("alternative lockfiles are forbidden"),
        "foundation workflow must not reference secrets",
        "both CI jobs must enable the pnpm shim and install exact pnpm 11.18.0",
        expect.stringContaining(
          "workflow actions must equal the exact approved",
        ),
        "both checkout steps must disable persisted credentials",
        expect.stringContaining("remote action is not pinned"),
        expect.stringContaining("local environment files are forbidden"),
      ]),
    );
  });

  it("rejects an immutable-looking action from an unapproved publisher", async () => {
    const fixture = await readFixture("positive");
    const workflow = fixture.workflow.replaceAll(
      "actions/checkout",
      "attacker/malicious-action",
    );

    expect(
      validateSecuritySnapshot({
        ...fixture,
        workflow,
        manifest: manifest(),
      }),
    ).toContain(
      "workflow actions must equal the exact approved identities, commit SHAs, releases, and occurrence counts",
    );
  });

  it("accepts the materialized repository contract", async () => {
    const testDirectory = path.dirname(fileURLToPath(import.meta.url));
    const repositoryRoot = path.resolve(testDirectory, "..", "..");
    expect(await validateRepositorySecurity(repositoryRoot)).toEqual([]);
  });
});
