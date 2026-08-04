/**
 * MODULE: scripts/typecheck.mjs
 * PURPOSE: Generate App Router types and run strict TypeScript proof from a clean checkout.
 * PUBLIC API / ENTRYPOINTS:
 *   - CLI: runs Next.js type generation followed by TypeScript with no emitted output.
 * CONTROL_FLOW:
 *   1. Generate route and layout definitions without performing a production build.
 *   2. Run the pinned TypeScript compiler only after generated definitions exist.
 * INVARIANTS:
 *   - Type checking is self-contained and remains separate from the production-build gate.
 * BOUNDARIES:
 *   - Production compilation remains owned by `pnpm build` and the smoke contract.
 * RELATED:
 *   - next-env.d.ts: references the generated App Router declarations.
 *   - scripts/run-validation.mjs: invokes this proof before later validation stages.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function runNodeCli(relativeEntrypoint, argumentsList, label) {
  const result = spawnSync(
    process.execPath,
    [path.join(repositoryRoot, relativeEntrypoint), ...argumentsList],
    {
      cwd: repositoryRoot,
      env: process.env,
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${String(result.status)}.`);
  }
}

runNodeCli("node_modules/next/dist/bin/next", ["typegen"], "Next typegen");
runNodeCli("node_modules/typescript/bin/tsc", ["--noEmit"], "TypeScript");
