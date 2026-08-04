/**
 * MODULE: scripts/production-smoke.mjs
 * PURPOSE: Build once and prove the production root route starts, succeeds, and leaves no server process behind.
 * PUBLIC API / ENTRYPOINTS:
 *   - CLI: performs the self-contained production smoke contract.
 * CONTROL_FLOW:
 *   1. Build once with the local Next.js CLI.
 *   2. Start the production server on an available loopback port.
 *   3. Poll GET / until success or a finite deadline, then always stop the server.
 * INVARIANTS:
 *   - [INV-SINGLE-BUILD] One invocation performs exactly one production build and preserves its .next output.
 *   - [INV-CLEAN-SHUTDOWN] Success and failure both wait until the spawned server exits.
 * BOUNDARIES:
 *   - Playwright owns separate browser behavior proof and reuses this build output.
 * RELATED:
 *   - playwright.config.ts: starts the existing build without rebuilding.
 *   - tests/e2e/smoke.spec.ts: checks browser-visible behavior.
 */
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
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
const startupTimeoutMs = 30_000;

function spawnNext(argumentsList, stdio) {
  return spawn(process.execPath, [nextCli, ...argumentsList], {
    cwd: repositoryRoot,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio,
  });
}

async function requireSuccessfulExit(child, label) {
  const [code, signal] = await once(child, "exit");
  if (code !== 0) {
    throw new Error(
      `${label} failed with exit code ${String(code)} and signal ${String(signal)}.`,
    );
  }
}

async function findAvailablePort() {
  const server = createServer();
  server.unref();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port =
    typeof address === "object" && address ? address.port : undefined;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  if (!port) {
    throw new Error("Unable to reserve a loopback port for production smoke.");
  }
  return port;
}

async function waitForRoot(url, child) {
  const deadline = Date.now() + startupTimeoutMs;
  let lastError = "server did not respond";

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Production server exited before readiness with code ${child.exitCode}.`,
      );
    }

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
      const body = await response.text();
      if (
        response.status === 200 &&
        body.includes("Repository foundation ready")
      ) {
        return;
      }
      lastError = `received HTTP ${response.status} without the expected foundation content`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await delay(250);
  }

  throw new Error(
    `Production route did not become ready within ${startupTimeoutMs}ms: ${lastError}`,
  );
}

async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  const exitPromise = once(child, "exit");
  child.kill("SIGTERM");
  const exited = await Promise.race([
    exitPromise.then(() => true),
    delay(5_000).then(() => false),
  ]);

  if (exited) {
    return;
  }

  if (process.platform === "win32") {
    const terminator = spawn(
      "taskkill",
      ["/PID", String(child.pid), "/T", "/F"],
      {
        stdio: "ignore",
      },
    );
    await requireSuccessfulExit(
      terminator,
      "Production server fallback shutdown",
    );
  } else {
    child.kill("SIGKILL");
  }

  if (child.exitCode === null && child.signalCode === null) {
    await once(child, "exit");
  }
}

async function main() {
  // @ah INV-SINGLE-BUILD
  const build = spawnNext(["build"], "inherit");
  await requireSuccessfulExit(build, "Production build");

  const port = await findAvailablePort();
  const url = `http://127.0.0.1:${port}/`;
  const server = spawnNext(
    ["start", "--hostname", "127.0.0.1", "--port", String(port)],
    "inherit",
  );

  try {
    await waitForRoot(url, server);
    console.log(`Production smoke passed at ${url}`);
  } finally {
    // @ah INV-CLEAN-SHUTDOWN
    await stopChild(server);
  }
}

await main();
