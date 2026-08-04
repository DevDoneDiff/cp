/**
 * MODULE: scripts/run-validation.mjs
 * PURPOSE: Execute the complete baseline as ordered package scripts without shell-specific composition.
 * PUBLIC API / ENTRYPOINTS:
 *   - CLI: runs every baseline validation stage and stops at the first failure.
 * CONTROL_FLOW:
 *   1. Reuse the active pnpm entrypoint with the current Node runtime.
 *   2. Run toolchain, static, structural, test, and production-build proof in order.
 * INVARIANTS:
 *   - A failed stage terminates the baseline and preserves its original exit status.
 * BOUNDARIES:
 *   - Browser smoke and Playwright remain assigned focused sets outside baseline.
 * RELATED:
 *   - package.json: exposes each invoked validation stage.
 *   - vitest.config.ts: owns test-family and coverage configuration.
 */
import { spawnSync } from "node:child_process";

const stages = [
  "validate:toolchain",
  "format:check",
  "lint",
  "typecheck",
  "validate:annotations",
  "validate:security",
  "test:coverage",
  "build",
];

const packageManagerEntrypoint = process.env.npm_execpath;

if (!packageManagerEntrypoint) {
  console.error(
    "pnpm validate must be started through pnpm so its exact entrypoint is available.",
  );
  process.exit(1);
}

for (const stage of stages) {
  console.log(`\n==> ${stage}`);
  const result = spawnSync(
    process.execPath,
    [packageManagerEntrypoint, "run", stage],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
