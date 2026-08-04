/**
 * MODULE: playwright.config.ts
 * PURPOSE: Configure Chromium workflow proof against the production server owned by the E2E runner.
 * PUBLIC API / ENTRYPOINTS:
 *   - Playwright default configuration: executes tests/e2e against the fixed runner-owned origin.
 * INVARIANTS:
 *   - Playwright performs no build and starts no second server.
 * BOUNDARIES:
 *   - scripts/run-e2e.mjs owns deterministic production-server startup and cleanup.
 * RELATED:
 *   - scripts/production-smoke.mjs: produces and verifies the reusable build.
 *   - scripts/run-e2e.mjs: starts that build and guarantees cleanup.
 *   - tests/e2e/smoke.spec.ts: proves browser content and error-free rendering.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
