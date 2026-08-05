/**
 * MODULE: scripts/run-e2e.mjs
 * PURPOSE: Start the existing production build with injected accelerated assembly timing, run Playwright once, and guarantee cleanup.
 * PUBLIC API / ENTRYPOINTS:
 *   - CLI: owns the frontend-e2e production server and Playwright process lifecycle.
 * CONTROL_FLOW:
 *   1. Start the existing .next output on the configured loopback address without rebuilding.
 *   2. Wait for the root runtime marker, then execute the Playwright suite.
 *   3. Preserve the Playwright status and always terminate the exact spawned server process tree.
 * INVARIANTS:
 *   - [INV-E2E-REUSES-BUILD] The runner never invokes a build and consumes only production output created by the preceding smoke set.
 *   - [INV-E2E-CLEAN-SHUTDOWN] Success, assertion failure, and startup failure clean up the exact spawned server.
 *   - [INV-E2E-ACCELERATED-ASSEMBLY] Browser proof exercises the production event order through an injected short schedule rather than real waits.
 * BOUNDARIES:
 *   - Production smoke owns compilation; Playwright owns browser assertions; this script owns only deterministic process orchestration.
 * RELATED:
 *   - scripts/production-smoke.mjs: creates and first verifies the reusable production build.
 *   - playwright.config.ts: configures browser proof without a second server or build.
 *   - tests/e2e/smoke.spec.ts: owns the user-workflow assertions.
 */
import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const nextCli = path.join(
  repositoryRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const playwrightCli = path.join(
  repositoryRoot,
  "node_modules",
  "@playwright",
  "test",
  "cli.js",
);
const host = "127.0.0.1";
const port = "3100";
const rootUrl = `http://${host}:${port}/`;
const startupTimeoutMs = 30_000;

function spawnNode(argumentsList, stdio = "inherit", environment = {}) {
  return spawn(process.execPath, argumentsList, {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      ...environment,
    },
    stdio,
  });
}

async function waitForServer(server) {
  const deadline = Date.now() + startupTimeoutMs;
  let lastError = "server did not respond";
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(
        `E2E production server exited before readiness with code ${server.exitCode}.`,
      );
    }
    try {
      const response = await fetch(rootUrl, {
        signal: AbortSignal.timeout(1_000),
      });
      const body = await response.text();
      if (
        response.status === 200 &&
        body.includes('data-product-surface="s1-s2-pre-account-runtime"')
      ) {
        return;
      }
      lastError = `received HTTP ${response.status} without the runtime marker`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await delay(200);
  }
  throw new Error(
    `E2E production server did not become ready within ${startupTimeoutMs}ms: ${lastError}`,
  );
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) return;
  const exitPromise = once(server, "exit");
  // @ah INV-E2E-CLEAN-SHUTDOWN
  server.kill("SIGTERM");
  const exited = await Promise.race([
    exitPromise.then(() => true),
    delay(5_000).then(() => false),
  ]);
  if (exited) return;

  if (process.platform === "win32") {
    const terminator = spawn(
      "taskkill",
      ["/PID", String(server.pid), "/T", "/F"],
      { stdio: "ignore" },
    );
    const [code] = await once(terminator, "exit");
    if (code !== 0) {
      throw new Error(
        `Unable to terminate E2E server process ${String(server.pid)}.`,
      );
    }
  } else {
    server.kill("SIGKILL");
  }

  if (server.exitCode === null && server.signalCode === null) {
    await once(server, "exit");
  }
}

// @ah INV-E2E-REUSES-BUILD
const server = spawnNode(
  [nextCli, "start", "--hostname", host, "--port", port],
  "inherit",
  {
    // @ah INV-E2E-ACCELERATED-ASSEMBLY
    CP_ASSEMBLY_TIMING_MODE: "accelerated",
  },
);
let testStatus = 1;

try {
  await waitForServer(server);
  const tests = spawnNode([playwrightCli, "test"]);
  const [code] = await once(tests, "exit");
  testStatus = typeof code === "number" ? code : 1;
} finally {
  await stopServer(server);
}

process.exitCode = testStatus;
