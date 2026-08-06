/**
 * MODULE: scripts/run-validation.mjs
 * PURPOSE: Execute the complete baseline, including local harness structure, as ordered package scripts without shell-specific composition.
 * PUBLIC API / ENTRYPOINTS:
 *   - BASELINE_STAGES: immutable canonical local-baseline order.
 *   - runValidation: injectable synchronous stage orchestration for focused proof.
 *   - CLI: runs every baseline validation stage and stops at the first failure.
 * CONTROL_FLOW:
 *   1. Reuse the active pnpm entrypoint with the current Node runtime.
 *   2. Run toolchain, static, annotation, harness-integrity, security, test, and production-build proof in order.
 * INVARIANTS:
 *   - A failed stage terminates the baseline and preserves its original exit status.
 *   - Harness integrity is network-free and runs before security, coverage, and build work.
 * BOUNDARIES:
 *   - Live Git/GitHub completion proof, browser smoke, and Playwright remain outside baseline.
 * RELATED:
 *   - package.json: exposes each invoked validation stage.
 *   - vitest.config.ts: owns test-family and coverage configuration.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const BASELINE_STAGES = Object.freeze([
  "validate:toolchain",
  "format:check",
  "lint",
  "typecheck",
  "validate:annotations",
  "validate:harness",
  "validate:security",
  "test:coverage",
  "build",
]);

/**
 * @param {object} [options]
 * @param {string} [options.packageManagerEntrypoint]
 * @param {(executable: string, args: string[], options: {cwd: string, env: NodeJS.ProcessEnv, stdio: "inherit"}) => {status: number | null, error?: Error}} [options.spawn]
 * @param {string} [options.cwd]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {(message: string) => void} [options.log]
 * @param {(message: string) => void} [options.reportError]
 */
export function runValidation({
  packageManagerEntrypoint = process.env.npm_execpath,
  spawn = spawnSync,
  cwd = process.cwd(),
  env = process.env,
  log = console.log,
  reportError = console.error,
} = {}) {
  if (!packageManagerEntrypoint) {
    reportError(
      "pnpm validate must be started through pnpm so its exact entrypoint is available.",
    );
    return 1;
  }

  for (const stage of BASELINE_STAGES) {
    log(`\n==> ${stage}`);
    const result = spawn(
      process.execPath,
      [packageManagerEntrypoint, "run", stage],
      { cwd, env, stdio: "inherit" },
    );

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      return result.status ?? 1;
    }
  }

  return 0;
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  process.exitCode = runValidation();
}
