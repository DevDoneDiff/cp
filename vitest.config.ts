/**
 * MODULE: vitest.config.ts
 * PURPOSE: Define unit, integration, and component test projects plus meaningful runtime coverage output.
 * PUBLIC API / ENTRYPOINTS:
 *   - Vitest default configuration: routes each proof family to its required environment.
 * INVARIANTS:
 *   - Every test family has an explicit include and empty suites remain failures.
 *   - Executable pre-account domain, application, adapter, UI, and root-route modules remain inside coverage reporting.
 * BOUNDARIES:
 *   - Browser workflow proof remains owned by Playwright rather than jsdom.
 * RELATED:
 *   - playwright.config.ts: owns Chromium production behavior proof.
 *   - scripts/run-validation.mjs: invokes the complete local gate.
 */
import { defineConfig, defineProject } from "vitest/config";

export default defineConfig({
  test: {
    passWithNoTests: false,
    projects: [
      defineProject({
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.ts"],
        },
      }),
      defineProject({
        test: {
          name: "integration",
          environment: "node",
          include: ["tests/integration/**/*.test.ts"],
        },
      }),
      defineProject({
        test: {
          name: "component",
          environment: "jsdom",
          include: ["tests/component/**/*.test.tsx"],
          setupFiles: ["tests/setup/component.ts"],
        },
      }),
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: "coverage",
      include: [
        "scripts/validation/**/*.mjs",
        "src/app/page.tsx",
        "src/project/**/*.{ts,tsx}",
      ],
    },
  },
});
