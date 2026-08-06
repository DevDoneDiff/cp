/**
 * ROLE: Enforce the minimal structural contract for useful architectural context headers.
 * BOUNDARY: Header accuracy remains a code-review judgment; this validator checks presence, allowed fields, and optional anchor pairing only.
 * RELATIONS: .agents/skills/annotation-headers/SKILL.md defines when a header saves enough context to be worthwhile.
 * VALIDATION: tests/unit/annotation-headers.test.ts covers the current contract and legacy-header tolerance.
 */
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CURRENT_FIELDS = new Set(["ROLE", "BOUNDARY", "RELATIONS", "VALIDATION"]);
const LEGACY_FIELDS = new Set([
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
]);
const FORBIDDEN_FIELDS = new Set([
  "ACTIVE_TASK",
  "LOCAL_INTENT",
  "AUTHOR",
  "DATE",
  "EDIT HISTORY",
  "HISTORY",
  "COMPLETED TASK",
  "COMPLETED_TASK",
  "CLOSEOUT",
  "TODO",
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
const CODE_EXTENSIONS = new Set([".cjs", ".js", ".jsx", ".mjs", ".ts", ".tsx"]);

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

function shouldRequireHeader(modulePath) {
  const normalized = normalizePath(modulePath);
  return (
    /^src\/app\/.*(?:layout|page|route)\.[cm]?[jt]sx?$/.test(normalized) ||
    /^scripts\/.*\.mjs$/.test(normalized) ||
    /^(?:playwright|vitest)\.config\.ts$/.test(normalized) ||
    /^\.github\/workflows\/.*\.ya?ml$/.test(normalized)
  );
}

function extractHeaders(source, modulePath) {
  const extension = path.extname(modulePath).toLowerCase();
  if (extension === ".yml" || extension === ".yaml") {
    const lines = [];
    for (const line of source.split(/\r?\n/)) {
      if (!line.startsWith("#")) break;
      lines.push(line.replace(/^#\s?/, ""));
    }
    const header = lines.join("\n").trim();
    return /^(?:ROLE|MODULE):/m.test(header) ? [header] : [];
  }
  if (!CODE_EXTENSIONS.has(extension)) return [];
  return [...source.matchAll(/\/\*\*([\s\S]*?)\*\//g)]
    .map((match) =>
      match[1]
        .split(/\r?\n/)
        .map((line) => line.replace(/^\s*\*\s?/, ""))
        .join("\n")
        .trim(),
    )
    .filter((header) => /^(?:ROLE|MODULE):/m.test(header));
}

function parseFields(header, errors) {
  const fields = new Map();
  let current;
  for (const rawLine of header.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^([A-Z][A-Z /_]*):(?:\s*(.*))?$/);
    if (match) {
      current = match[1];
      if (FORBIDDEN_FIELDS.has(current)) {
        errors.push(`forbidden field ${current}`);
      } else if (!CURRENT_FIELDS.has(current) && !LEGACY_FIELDS.has(current)) {
        errors.push(`unknown field ${current}`);
      }
      if (fields.has(current)) errors.push(`duplicate field ${current}`);
      fields.set(current, match[2] ? [match[2]] : []);
      continue;
    }
    if (!current) {
      errors.push(`content appears before the first field: ${line}`);
      continue;
    }
    fields.get(current)?.push(line);
  }
  return fields;
}

function value(fields, name) {
  return (fields.get(name) ?? []).join("\n").trim();
}

function duplicates(values) {
  const seen = new Set();
  return [
    ...new Set(values.filter((item) => seen.has(item) || !seen.add(item))),
  ];
}

export function validateAnnotatedSource({ source, modulePath }) {
  const normalizedPath = normalizePath(modulePath);
  const errors = [];
  const headers = extractHeaders(source, normalizedPath);
  if (headers.length !== 1) {
    return [
      `${normalizedPath}: expected exactly one annotation header; found ${headers.length}`,
    ];
  }

  const extension = path.extname(normalizedPath).toLowerCase();
  const first = source.trimStart();
  if (
    ((extension === ".yml" || extension === ".yaml") &&
      !/^# (?:ROLE|MODULE):/.test(first)) ||
    (CODE_EXTENSIONS.has(extension) && !first.startsWith("/**"))
  ) {
    errors.push("annotation header must be the first language-native content");
  }

  const fields = parseFields(headers[0], errors);
  const current = fields.has("ROLE");
  if (current) {
    if (!value(fields, "ROLE")) errors.push("ROLE must be nonempty");
    for (const legacy of LEGACY_FIELDS) {
      if (fields.has(legacy)) {
        errors.push(`current ROLE header must not mix legacy field ${legacy}`);
      }
    }
  } else if (!value(fields, "PURPOSE")) {
    errors.push(
      "ROLE is required for current headers; legacy headers need PURPOSE",
    );
  }

  for (const [name, lines] of fields) {
    if (!FORBIDDEN_FIELDS.has(name) && lines.join("\n").trim().length === 0) {
      errors.push(`${name} must not be empty`);
    }
  }

  const declared = [];
  for (const name of ["BOUNDARY", "INVARIANTS", "BOUNDARIES"]) {
    for (const line of fields.get(name) ?? []) {
      for (const match of line.matchAll(/\[([A-Z][A-Z0-9-]*)\]/g)) {
        declared.push(match[1]);
      }
    }
  }
  const marked = [...source.matchAll(/@ah\s+([A-Za-z0-9-]+)/g)].map(
    (match) => match[1],
  );
  for (const anchor of [...declared, ...marked]) {
    if (!/^[A-Z][A-Z0-9-]*$/.test(anchor)) {
      errors.push(`invalid anchor ID ${anchor}`);
    }
  }
  for (const anchor of duplicates(declared)) {
    errors.push(`anchor ${anchor} is declared more than once`);
  }
  for (const anchor of duplicates(marked)) {
    errors.push(`anchor ${anchor} is marked more than once`);
  }
  for (const anchor of new Set(declared)) {
    if (!marked.includes(anchor))
      errors.push(`anchor ${anchor} has no source marker`);
  }
  for (const anchor of new Set(marked)) {
    if (!declared.includes(anchor))
      errors.push(`source marker ${anchor} has no declaration`);
  }

  return errors.map((error) => `${normalizedPath}: ${error}`);
}

function repositoryFiles(root) {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard"],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(
      `Unable to discover repository files: ${result.stderr.trim()}`,
    );
  }
  return result.stdout.split(/\r?\n/).map(normalizePath).filter(Boolean);
}

export async function validateAnnotationRepository(root) {
  const errors = [];
  for (const modulePath of repositoryFiles(root)) {
    if (
      modulePath.split("/").some((segment) => EXCLUDED_SEGMENTS.has(segment))
    ) {
      continue;
    }
    const extension = path.extname(modulePath).toLowerCase();
    if (
      !CODE_EXTENSIONS.has(extension) &&
      extension !== ".yml" &&
      extension !== ".yaml"
    ) {
      continue;
    }
    const source = await readFile(path.join(root, modulePath), "utf8");
    const claimsHeader =
      /^(?:\s*\/\*\*[\s\S]*?|\s*#.*?)\b(?:ROLE|MODULE):/m.test(source);
    if (!shouldRequireHeader(modulePath) && !claimsHeader) continue;
    errors.push(...validateAnnotatedSource({ source, modulePath }));
  }
  return errors;
}

async function runCli() {
  const errors = await validateAnnotationRepository(process.cwd());
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log("Annotation headers passed.");
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  await runCli();
}
