/**
 * MODULE: scripts/enforce-toolchain.mjs
 * PURPOSE: Fail installation and validation when the active Node or pnpm runtime differs from the approved exact pins.
 * PUBLIC API / ENTRYPOINTS:
 *   - CLI: validates process runtime and package-manager user agent.
 * INVARIANTS:
 *   - Foundation commands execute only with Node 24.19.0 and pnpm 11.18.0.
 * RELATED:
 *   - package.json: declares the same machine-readable versions.
 * SECURITY:
 *   - Exact tool selection prevents lockfile and install behavior from drifting across environments.
 */
const EXPECTED_NODE = "24.19.0";
const EXPECTED_PNPM = "11.18.0";

const failures = [];

if (process.versions.node !== EXPECTED_NODE) {
  failures.push(
    `Node ${EXPECTED_NODE} is required; found ${process.versions.node}.`,
  );
}

const packageManagerUserAgent = process.env.npm_config_user_agent ?? "";
const pnpmVersion = packageManagerUserAgent.match(
  /(?:^|\s)pnpm\/([^\s]+)/,
)?.[1];

if (pnpmVersion !== EXPECTED_PNPM) {
  failures.push(
    `pnpm ${EXPECTED_PNPM} is required; found ${pnpmVersion ?? "unknown"}.`,
  );
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Toolchain verified: Node ${EXPECTED_NODE}, pnpm ${EXPECTED_PNPM}.`,
  );
}
