/**
 * MODULE: playwright.config.ts
 * PURPOSE: Run Chromium proof against an existing production build without rebuilding it.
 * PUBLIC API / ENTRYPOINTS:
 *   - Playwright default configuration: starts the built application and executes tests/e2e.
 * INVARIANTS:
 *   - The web server command starts from reusable .next output and never invokes a production build.
 * BOUNDARIES:
 *   - scripts/production-smoke.mjs owns the single build and initial startup proof.
 * RELATED:
 *   - scripts/production-smoke.mjs: produces and verifies the reusable build.
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
  webServer: {
    command:
      "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/",
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
