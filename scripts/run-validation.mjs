/**
 * ROLE: Run the one complete local implementation-candidate baseline in deterministic stage order.
 * BOUNDARY: Browser smoke, Playwright, remote CI, and merge truth remain separate assigned or delivery proof.
 * RELATIONS: package.json exposes the stages; vitest.config.ts owns test-family and coverage configuration.
 * VALIDATION: tests/unit/validation-runner.test.ts proves ordering and failure propagation.
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
