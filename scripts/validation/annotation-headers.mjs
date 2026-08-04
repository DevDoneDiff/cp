/**
 * MODULE: scripts/validation/annotation-headers.mjs
 * PURPOSE: Enforce the structural annotation-header contract for meaningful repository files.
 * PUBLIC API / ENTRYPOINTS:
 *   - validateAnnotatedSource: validates one language-native header and its anchors.
 *   - validateAnnotationRepository: discovers covered files and validates task-context lifecycle.
 *   - CLI: runs working or candidate validation from the repository root.
 * CONTROL_FLOW:
 *   1. Discover tracked and non-ignored untracked files with Git.
 *   2. Parse the language-native header for each covered or annotated file.
 *   3. Reconcile fields, task context, and semantic anchor declarations with markers.
 * INVARIANTS:
 *   - [INV-CANDIDATE-CLEAN] Candidate mode rejects every ACTIVE_TASK and LOCAL_INTENT field.
 *   - [INV-ANCHOR-SYMMETRY] Every declared anchor has one marker and every marker has one declaration.
 * BOUNDARIES:
 *   - Structural validation cannot prove semantic header accuracy; independent review owns that judgment.
 * RELATED:
 *   - .agents/skills/annotation-headers/SKILL.md: owns the canonical field meanings and lifecycle.
 *   - .harness/tasks.md: owns the single working task reference.
 *   - tests/unit/annotation-headers.test.ts: exercises positive and negative rule behavior.
 */
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const FIELD_ORDER = [
  "MODULE",
  "PURPOSE",
  "PUBLIC API / ENTRYPOINTS",
  "CONTROL_FLOW",
  "INVARIANTS",
  "BOUNDARIES",
  "RELATED",
  "SECURITY",
  "DATA",
  "EVENTS",
  "ACTIVE_TASK",
  "LOCAL_INTENT",
];
const REQUIRED_FIELDS = ["MODULE", "PURPOSE", "INVARIANTS"];
const FORBIDDEN_FIELDS = new Set([
  "AUTHOR",
  "DATE",
  "EDIT HISTORY",
  "HISTORY",
  "COMPLETED TASK",
  "COMPLETED_TASK",
  "CLOSEOUT",
]);
const EXCLUDED_SEGMENTS = new Set([
  ".git",
  ".next",
  "coverage",
  "node_modules",
  "playwright-report",
  "references",
  "test-results",
  "tests",
]);
const SUPPORTED_CODE_EXTENSIONS = new Set([
  ".cjs",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
]);

function normalizeModulePath(filePath) {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

function hasExcludedSegment(modulePath) {
  return normalizeModulePath(modulePath)
    .split("/")
    .some((segment) => EXCLUDED_SEGMENTS.has(segment));
}

function shouldRequireHeader(modulePath) {
  const normalized = normalizeModulePath(modulePath);
  return (
    /^src\/app\/.*(?:layout|page|route)\.[cm]?[jt]sx?$/.test(normalized) ||
    /^scripts\/.*\.mjs$/.test(normalized) ||
    /^(?:playwright|vitest)\.config\.ts$/.test(normalized) ||
    /^\.github\/workflows\/.*\.ya?ml$/.test(normalized)
  );
}

function stripJavaScriptHeader(match) {
  return match
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*\s?/, ""))
    .join("\n")
    .trim();
}

function extractHeader(source, modulePath) {
  const extension = path.extname(modulePath).toLowerCase();

  if (extension === ".yml" || extension === ".yaml") {
    const lines = source.split(/\r?\n/);
    const headerLines = [];
    for (const line of lines) {
      if (!line.startsWith("#")) {
        break;
      }
      headerLines.push(line.replace(/^#\s?/, ""));
    }
    const header = headerLines.join("\n").trim();
    return header.includes("MODULE:") ? [header] : [];
  }

  if (!SUPPORTED_CODE_EXTENSIONS.has(extension)) {
    return [];
  }

  return [...source.matchAll(/\/\*\*([\s\S]*?)\*\//g)]
    .map((match) => stripJavaScriptHeader(match[1]))
    .filter((header) => header.includes("MODULE:"));
}

function parseFields(header, errors) {
  const fields = new Map();
  let currentField;

  for (const rawLine of header.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const fieldMatch = line.match(/^([A-Z][A-Z /_]*):(?:\s*(.*))?$/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      if (FORBIDDEN_FIELDS.has(fieldName)) {
        errors.push(`forbidden historical field ${fieldName}`);
      }
      if (!FIELD_ORDER.includes(fieldName)) {
        errors.push(`unknown field ${fieldName}`);
      }
      if (fields.has(fieldName)) {
        errors.push(`duplicate field ${fieldName}`);
      }
      currentField = fieldName;
      fields.set(fieldName, fieldMatch[2] ? [fieldMatch[2]] : []);
      continue;
    }

    if (!currentField) {
      errors.push(`content appears before the first field: ${line}`);
      continue;
    }
    fields.get(currentField)?.push(line);
  }

  return fields;
}

function fieldValue(fields, name) {
  return (fields.get(name) ?? []).join("\n").trim();
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return [...duplicates];
}

/**
 * @param {{
 *   source: string;
 *   modulePath: string;
 *   mode?: "candidate" | "working";
 *   workingTaskTags?: string[];
 * }} input
 */
export function validateAnnotatedSource({
  source,
  modulePath,
  mode = "candidate",
  workingTaskTags = [],
}) {
  const normalizedPath = normalizeModulePath(modulePath);
  const errors = [];
  const headers = extractHeader(source, normalizedPath);

  if (headers.length !== 1) {
    return [
      `${normalizedPath}: expected exactly one annotation header; found ${headers.length}`,
    ];
  }

  const extension = path.extname(normalizedPath).toLowerCase();
  const firstContent = source.trimStart();
  if (
    ((extension === ".yml" || extension === ".yaml") &&
      !firstContent.startsWith("# MODULE:")) ||
    (SUPPORTED_CODE_EXTENSIONS.has(extension) &&
      !firstContent.startsWith("/**"))
  ) {
    errors.push("annotation header must be the first language-native content");
  }

  const fields = parseFields(headers[0], errors);
  const presentFields = [...fields.keys()].filter((field) =>
    FIELD_ORDER.includes(field),
  );
  const orderIndexes = presentFields.map((field) => FIELD_ORDER.indexOf(field));
  if (
    orderIndexes.some(
      (value, index) => index > 0 && value <= orderIndexes[index - 1],
    )
  ) {
    errors.push("fields are not in canonical order");
  }

  for (const field of REQUIRED_FIELDS) {
    if (!fieldValue(fields, field)) {
      errors.push(`${field} must be present and nonempty`);
    }
  }

  for (const [field, lines] of fields) {
    if (FIELD_ORDER.includes(field) && lines.join("\n").trim().length === 0) {
      errors.push(`${field} must not be empty`);
    }
  }

  if (fieldValue(fields, "MODULE") !== normalizedPath) {
    errors.push(`MODULE must equal ${normalizedPath}`);
  }

  const relatedCount = (fields.get("RELATED") ?? []).filter((line) =>
    line.startsWith("-"),
  ).length;
  if (relatedCount > 3) {
    errors.push("RELATED may contain at most three entries");
  }

  const hasActiveTask = fields.has("ACTIVE_TASK");
  const hasLocalIntent = fields.has("LOCAL_INTENT");
  if (hasActiveTask !== hasLocalIntent) {
    errors.push("ACTIVE_TASK and LOCAL_INTENT must appear together");
  }

  if (hasActiveTask && hasLocalIntent) {
    // @ah INV-CANDIDATE-CLEAN
    if (mode === "candidate") {
      errors.push("candidate mode forbids ACTIVE_TASK and LOCAL_INTENT");
    }
    if (workingTaskTags.length !== 1) {
      errors.push(
        `temporary task context requires exactly one working task; found ${workingTaskTags.length}`,
      );
    } else if (fieldValue(fields, "ACTIVE_TASK") !== workingTaskTags[0]) {
      errors.push(`ACTIVE_TASK must reference ${workingTaskTags[0]}`);
    }
  }

  const declaredAnchors = [];
  for (const line of fields.get("INVARIANTS") ?? []) {
    for (const match of line.matchAll(/\[([A-Z][A-Z0-9-]*)\]/g)) {
      declaredAnchors.push(match[1]);
    }
  }
  const markedAnchors = [...source.matchAll(/@ah\s+([A-Za-z0-9-]+)/g)].map(
    (match) => match[1],
  );
  const anchorPattern = /^[A-Z][A-Z0-9-]*$/;

  for (const anchor of [...declaredAnchors, ...markedAnchors]) {
    if (!anchorPattern.test(anchor) || !/^[\x00-\x7F]+$/.test(anchor)) {
      errors.push(`invalid anchor ID ${anchor}`);
    }
  }
  for (const duplicate of duplicateValues(declaredAnchors)) {
    errors.push(`anchor ${duplicate} is declared more than once`);
  }
  for (const duplicate of duplicateValues(markedAnchors)) {
    errors.push(`anchor ${duplicate} is marked more than once`);
  }

  // @ah INV-ANCHOR-SYMMETRY
  for (const anchor of new Set(declaredAnchors)) {
    if (!markedAnchors.includes(anchor)) {
      errors.push(`anchor ${anchor} has no source marker`);
    }
  }
  for (const anchor of new Set(markedAnchors)) {
    if (!declaredAnchors.includes(anchor)) {
      errors.push(`source marker ${anchor} has no declaration`);
    }
  }

  return errors.map((error) => `${normalizedPath}: ${error}`);
}

function listRepositoryFiles(root) {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    throw new Error(
      `Unable to discover repository files: ${result.stderr.trim()}`,
    );
  }
  return result.stdout.split(/\r?\n/).map(normalizeModulePath).filter(Boolean);
}

function findWorkingTaskTags(tasksSource) {
  return tasksSource
    .split(/^### /m)
    .slice(1)
    .filter((section) => /^Status: working$/m.test(section))
    .map((section) => section.match(/^(\[[TR]-\d{4}\])/m)?.[1])
    .filter(Boolean);
}

export async function validateAnnotationRepository(root, mode = "candidate") {
  const tasksSource = await readFile(
    path.join(root, ".harness", "tasks.md"),
    "utf8",
  );
  const workingTaskTags = findWorkingTaskTags(tasksSource);
  const errors = [];

  for (const modulePath of listRepositoryFiles(root)) {
    if (hasExcludedSegment(modulePath)) {
      continue;
    }
    const extension = path.extname(modulePath).toLowerCase();
    if (
      !SUPPORTED_CODE_EXTENSIONS.has(extension) &&
      extension !== ".yml" &&
      extension !== ".yaml"
    ) {
      continue;
    }

    const source = await readFile(path.join(root, modulePath), "utf8");
    const mustHaveHeader = shouldRequireHeader(modulePath);
    const hasHeaderClaim = source.includes("MODULE:");
    if (!mustHaveHeader && !hasHeaderClaim) {
      continue;
    }
    errors.push(
      ...validateAnnotatedSource({ source, modulePath, mode, workingTaskTags }),
    );
  }

  return errors;
}

async function runCli() {
  const mode = process.argv.includes("--working") ? "working" : "candidate";
  const errors = await validateAnnotationRepository(process.cwd(), mode);
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Annotation headers passed in ${mode} mode.`);
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  await runCli();
}
