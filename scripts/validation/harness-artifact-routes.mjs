/**
 * MODULE: scripts/validation/harness-artifact-routes.mjs
 * PURPOSE: Validate the exact artifact migration map and every current artifact consumer.
 * PUBLIC API / ENTRYPOINTS: parseArtifactRoutes; validateArtifactRoutes.
 * CONTROL_FLOW: validate the exact registry, physical pairs, task references, and stale consumers.
 * INVARIANTS:
 *   - [INV-ARTIFACT-MIGRATION] Pending pairs are byte-identical; canonical pairs have no live legacy duplicate.
 * BOUNDARIES:
 *   - Visual fidelity and semantic contract quality remain independent review responsibilities.
 * RELATED: docs/contracts/README.md artifact migration registry.
 * SECURITY:
 *   - Artifact comparisons use exact bytes and never parse or execute binary content.
 */
import { taskListItems } from "./harness-task-schema.mjs";
import { isSeedTaskTag } from "./harness-task-stores.mjs";

const ARTIFACT_SECTION = "## Artifact Migration Registry";
const NEXT_ARTIFACT_SECTION = "## Templates";
const LEGACY_ROOT = `references/${"states"}`;
const CANONICAL_ROOT = `docs/contracts/${"states"}`;
const EXPECTED_ARTIFACT_PAIRS = [
  ["s01-address-entry", "visual-default.png"],
  ["s01-address-entry", "visual-how-it-works-open.png"],
  ["s02-property-analysis", "visual-property-confirmation.png"],
  ["s02-property-analysis", "visual-live-roof-assembly.png"],
  ["s02-property-analysis", "technical-persistent-project-assembly.png"],
].map(([directory, file]) => ({
  legacyPath: `${LEGACY_ROOT}/${directory}/${file}`,
  canonicalPath: `${CANONICAL_ROOT}/${directory}/${file}`,
}));
const ALLOWED_LEGACY_ARTIFACT_REFERENCES = new Set([
  ".harness/completed.md",
  ".harness/tasks.md",
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

export function parseArtifactRoutes(contractsReadme) {
  const source = section(
    contractsReadme,
    ARTIFACT_SECTION,
    NEXT_ARTIFACT_SECTION,
  );
  return [
    ...source.matchAll(
      /^\| `([^`]+)` \| `([^`]+)` \| `([^`]+)` \| ([^|]+) \|$/gm,
    ),
  ].map(([, legacyPath, canonicalPath, state, equality]) => ({
    legacyPath,
    canonicalPath,
    state,
    equality: equality.trim(),
  }));
}

function asBuffer(value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8");
}

function validateArtifactRegistry(routes, contractsReadme, files, errors) {
  const tableLines = section(
    contractsReadme,
    ARTIFACT_SECTION,
    NEXT_ARTIFACT_SECTION,
  )
    .split("\n")
    .filter((line) => line.trimStart().startsWith("|"));
  if (
    tableLines[0] !==
      "| Legacy path | Canonical path | State | Equality requirement |" ||
    tableLines[1] !== "|---|---|---|---|" ||
    tableLines.slice(2).length !== routes.length ||
    tableLines
      .slice(2)
      .some(
        (line) => !/^\| `[^`]+` \| `[^`]+` \| `[^`]+` \| [^|]+ \|$/.test(line),
      )
  ) {
    errors.push(
      "docs/contracts/README.md: artifact migration table contains malformed or unconsumed rows",
    );
  }
  const actualPairs = routes.map(({ legacyPath, canonicalPath }) => ({
    legacyPath,
    canonicalPath,
  }));
  if (JSON.stringify(actualPairs) !== JSON.stringify(EXPECTED_ARTIFACT_PAIRS)) {
    errors.push(
      "docs/contracts/README.md: artifact migration registry must contain exactly the approved five path pairs",
    );
  }
  const legacyPaths = new Set();
  for (const route of routes) {
    legacyPaths.add(route.legacyPath);
    if (route.equality !== "exact bytes") {
      errors.push(
        `docs/contracts/README.md: ${route.legacyPath} must require exact bytes`,
      );
    }
    const legacy = files.get(route.legacyPath);
    const canonical = files.get(route.canonicalPath);
    if (canonical === undefined) {
      errors.push(`${route.canonicalPath}: canonical artifact is missing`);
      continue;
    }
    // @ah INV-ARTIFACT-MIGRATION
    if (route.state === "migration-pending") {
      if (legacy === undefined) {
        errors.push(
          `${route.legacyPath}: migration-pending legacy artifact is missing`,
        );
      } else if (!asBuffer(legacy).equals(asBuffer(canonical))) {
        errors.push(
          `${route.legacyPath}: migration-pending bytes differ from ${route.canonicalPath}`,
        );
      }
    } else if (route.state === "canonical") {
      if (legacy !== undefined) {
        errors.push(
          `${route.legacyPath}: canonical artifact still has a live legacy duplicate`,
        );
      }
    } else {
      errors.push(
        `docs/contracts/README.md: ${route.legacyPath} has invalid migration state ${route.state}`,
      );
    }
  }

  for (const filePath of files.keys()) {
    if (filePath.startsWith(`${LEGACY_ROOT}/`) && !legacyPaths.has(filePath)) {
      errors.push(`${filePath}: unregistered legacy state artifact`);
    }
  }
}

function validateTaskArtifactReferences(blocks, routes, files, errors) {
  const legacyPaths = new Set(routes.map(({ legacyPath }) => legacyPath));
  for (const block of blocks) {
    if (isSeedTaskTag(block.tag)) {
      continue;
    }
    const { items } = taskListItems(block, "Reference_artifacts");
    for (const filePath of items) {
      if (filePath === "none") {
        continue;
      }
      if (legacyPaths.has(filePath)) {
        errors.push(
          `task artifact: [${block.tag}] uses legacy path ${filePath}`,
        );
      } else if (
        !/^docs\/contracts\/states\/s\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\/(?:visual|technical)-[a-z0-9]+(?:-[a-z0-9]+)*\.png$/.test(
          filePath,
        )
      ) {
        errors.push(
          `task artifact: [${block.tag}] path is not canonical: ${filePath}`,
        );
      } else if (!files.has(filePath)) {
        errors.push(
          `task artifact: [${block.tag}] file is missing: ${filePath}`,
        );
      }
    }
  }
}

function validateLegacyArtifactReferences(routes, liveTextFiles, errors) {
  for (const { legacyPath } of routes) {
    for (const [filePath, source] of liveTextFiles) {
      if (
        ALLOWED_LEGACY_ARTIFACT_REFERENCES.has(filePath) ||
        !source.includes(legacyPath)
      ) {
        continue;
      }
      errors.push(
        `${filePath}: forbidden live reference to legacy artifact ${legacyPath}`,
      );
    }
  }
}

export function validateArtifactRoutes({
  active,
  completed,
  contractsReadme,
  files,
  liveTextFiles,
}) {
  const errors = [];
  const routes = parseArtifactRoutes(contractsReadme);
  validateArtifactRegistry(routes, contractsReadme, files, errors);
  const blocks = [...active.blocks, ...completed.blocks];
  validateTaskArtifactReferences(blocks, routes, files, errors);
  validateLegacyArtifactReferences(routes, liveTextFiles, errors);
  return [...new Set(errors)].sort();
}
