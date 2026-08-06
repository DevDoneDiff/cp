/**
 * MODULE: scripts/validation/harness-contract-routes.mjs
 * PURPOSE: Validate stable spec identity, canonical current routing, and bounded legacy-spec compatibility.
 * PUBLIC API / ENTRYPOINTS:
 *   - parseLegacySpecRoutes: parses the canonical ID-bearing compatibility table.
 *   - validateSpecRoutes: proves exact legacy mappings and every forward spec route.
 * CONTROL_FLOW:
 *   1. Parse and compare the complete Legacy Spec Compatibility table to the approved four-route map.
 *   2. Resolve seeded historical paths without reading retired bodies.
 *   3. Resolve every forward task to an approved current spec in its exact canonical directory.
 * INVARIANTS:
 *   - [INV-SPEC-ROUTE] Stable Source_spec_id and current Source_spec resolve to one canonical approved spec.
 * BOUNDARIES:
 *   - Artifact migration and concrete state-contract validation are owned by harness-artifact-routes.mjs.
 * RELATED:
 *   - docs/contracts/README.md: owns stable identity, canonical directories, and legacy compatibility.
 *   - docs/contracts/states/README.md: owns the exact state-directory index.
 * SECURITY:
 *   - Retired Git-only bodies and stale live references fail closed without executing content.
 */
import path from "node:path";

import { isSeedTaskTag } from "./harness-task-stores.mjs";

const LEGACY_SPEC_SECTION = "## Legacy Spec Compatibility";
const NEXT_SPEC_SECTION = "## Bounded Lineage";
const HISTORICAL_COMMIT = "4b7a12978510808ee8620fff2893180c65006160";
const LEGACY_ROOT = `docs/${"specs"}`;
const EXPECTED_LEGACY_ROUTES = [
  ["A-repository-foundation.md", "repository/A"],
  ["A1-harness-execution-hardening.md", "harness/A1"],
  ["B-s1-s2-continuous-entry-and-property-analysis.md", "state/s02/B"],
  ["B1-s1-s2-integrated-stabilization.md", "state/s02/B1"],
].map(([name, specId]) => ({
  legacyPath: `${LEGACY_ROOT}/${name}`,
  specId,
  currentPath: "none",
  historicalLocator: `${HISTORICAL_COMMIT}:${LEGACY_ROOT}/${name}`,
}));
const ALLOWED_STALE_REFERENCE_FILES = new Set([
  ".harness/completed.md",
  "docs/contracts/README.md",
  "docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md",
]);

function section(source, startHeading, endHeading) {
  const lines = source
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .split("\n");
  const starts = lines.flatMap((line, index) =>
    line === startHeading ? [index] : [],
  );
  const ends = lines.flatMap((line, index) =>
    line === endHeading ? [index] : [],
  );
  if (starts.length !== 1 || ends.length !== 1 || ends[0] <= starts[0]) {
    return "";
  }
  return lines.slice(starts[0], ends[0]).join("\n");
}

export function parseLegacySpecRoutes(contractsReadme) {
  const source = section(
    contractsReadme,
    LEGACY_SPEC_SECTION,
    NEXT_SPEC_SECTION,
  );
  return [
    ...source.matchAll(
      /^\| `([^`]+)` \| `([^`]+)` \| `([^`]+)` \| `([^`]+)` \|$/gm,
    ),
  ].map(([, legacyPath, specId, currentPath, historicalLocator]) => ({
    legacyPath,
    specId,
    currentPath,
    historicalLocator,
  }));
}

function textFile(files, filePath) {
  const value = files.get(filePath);
  if (value === undefined) {
    return undefined;
  }
  return Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
}

function stateDirectories(statesReadme) {
  return new Map(
    [...statesReadme.matchAll(/^- `(s\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*)`:/gm)].map(
      ([, directory]) => [directory.slice(0, 3), directory],
    ),
  );
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function canonicalSpecPath(specId, sourcePath, statesReadme) {
  const parts = specId.split("/");
  const sequence = parts.at(-1);
  const basename = path.posix.basename(sourcePath);
  if (
    !sequence ||
    !new RegExp(
      `^${escapeRegex(sequence)}-[a-z0-9]+(?:-[a-z0-9]+)*\\.md$`,
    ).test(basename)
  ) {
    return false;
  }
  if (parts[0] === "harness") {
    return path.posix.dirname(sourcePath) === "docs/contracts/harness/specs";
  }
  if (parts[0] === "repository") {
    return path.posix.dirname(sourcePath) === "docs/contracts/repository/specs";
  }
  if (parts[0] === "state" && /^s\d{2}$/.test(parts[1] ?? "")) {
    const directory = stateDirectories(statesReadme).get(parts[1]);
    return (
      directory !== undefined &&
      path.posix.dirname(sourcePath) ===
        `docs/contracts/states/${directory}/specs`
    );
  }
  return false;
}

function validateLegacyRoutes(routes, files, errors) {
  const tableLines = section(
    textFile(files, "docs/contracts/README.md") ?? "",
    LEGACY_SPEC_SECTION,
    NEXT_SPEC_SECTION,
  )
    .split("\n")
    .filter((line) => line.trimStart().startsWith("|"));
  if (
    tableLines[0] !==
      "| Legacy path | Stable spec ID | Current path | Exact historical locator |" ||
    tableLines[1] !== "|---|---|---|---|" ||
    tableLines.slice(2).length !== routes.length ||
    tableLines
      .slice(2)
      .some(
        (line) =>
          !/^\| `[^`]+` \| `[^`]+` \| `[^`]+` \| `[^`]+` \|$/.test(line),
      )
  ) {
    errors.push(
      "docs/contracts/README.md: legacy spec compatibility table contains malformed or unconsumed rows",
    );
  }
  if (JSON.stringify(routes) !== JSON.stringify(EXPECTED_LEGACY_ROUTES)) {
    errors.push(
      "docs/contracts/README.md: legacy spec compatibility must contain exactly the approved four mappings",
    );
  }
  for (const route of routes) {
    if (files.has(route.legacyPath)) {
      errors.push(
        `${route.legacyPath}: retired legacy spec body must not exist in the current tree`,
      );
    }
  }
}

function validateHistoricalTask(block, routesByPath, errors) {
  const route = routesByPath.get(block.fields.Source_spec);
  if (!route) {
    errors.push(
      `.harness/completed.md: [${block.tag}] historical Source_spec ${block.fields.Source_spec} has no ID-bearing legacy route`,
    );
  }
}

function validateForwardTask(
  block,
  file,
  routesByPath,
  files,
  statesReadme,
  errors,
) {
  const sourcePath = block.fields.Source_spec;
  if (routesByPath.has(sourcePath)) {
    errors.push(
      `${file}: [${block.tag}] forward task uses retired Source_spec ${sourcePath}`,
    );
    return;
  }
  const source = textFile(files, sourcePath);
  if (source === undefined) {
    errors.push(
      `${file}: [${block.tag}] Source_spec does not exist: ${sourcePath}`,
    );
    return;
  }
  const idDeclarations = [...source.matchAll(/^- \*\*Spec ID:\*\* (.+)$/gm)];
  const id = idDeclarations[0]?.[1].match(/^`([^`]+)`$/)?.[1];
  if (idDeclarations.length !== 1) {
    errors.push(
      `${sourcePath}: [${block.tag}] source spec must declare exactly one Spec ID`,
    );
  }
  if (id !== block.fields.Source_spec_id) {
    errors.push(
      `${sourcePath}: Spec ID ${id ?? "missing"} does not match [${block.tag}] Source_spec_id ${block.fields.Source_spec_id}`,
    );
  }
  // @ah INV-SPEC-ROUTE
  if (
    !canonicalSpecPath(block.fields.Source_spec_id, sourcePath, statesReadme)
  ) {
    errors.push(
      `${sourcePath}: canonical path does not match stable spec ID ${block.fields.Source_spec_id}`,
    );
  }
  const states = [...source.matchAll(/^\*\*State:\*\* (.+)$/gm)];
  const approvals = [...source.matchAll(/^\*\*Approved:\*\* (.+)$/gm)];
  if (
    states.length !== 1 ||
    states[0]?.[1] !== "approved" ||
    approvals.length !== 1 ||
    approvals[0]?.[1] !== "true"
  ) {
    errors.push(
      `${sourcePath}: [${block.tag}] Ready task requires an approved source spec`,
    );
  }
}

function validateStaleReferences(routes, liveTextFiles, errors) {
  for (const route of routes) {
    for (const [filePath, source] of liveTextFiles) {
      if (
        ALLOWED_STALE_REFERENCE_FILES.has(filePath) ||
        !source.includes(route.legacyPath)
      ) {
        continue;
      }
      errors.push(
        `${filePath}: forbidden live reference to retired spec ${route.legacyPath}`,
      );
    }
  }
}

export function validateSpecRoutes({
  active,
  completed,
  contractsReadme,
  statesReadme,
  files,
  liveTextFiles,
}) {
  const errors = [];
  const routes = parseLegacySpecRoutes(contractsReadme);
  const routesByPath = new Map(
    routes.map((route) => [route.legacyPath, route]),
  );
  validateLegacyRoutes(routes, files, errors);

  for (const block of completed.blocks) {
    if (isSeedTaskTag(block.tag)) {
      validateHistoricalTask(block, routesByPath, errors);
    } else {
      validateForwardTask(
        block,
        ".harness/completed.md",
        routesByPath,
        files,
        statesReadme,
        errors,
      );
    }
  }
  for (const block of active.blocks) {
    validateForwardTask(
      block,
      ".harness/tasks.md",
      routesByPath,
      files,
      statesReadme,
      errors,
    );
  }
  validateStaleReferences(routes, liveTextFiles, errors);
  return [...new Set(errors)].sort();
}
