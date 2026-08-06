/**
 * MODULE: scripts/validation/harness-validation-registry.mjs
 * PURPOSE: Parse the canonical validation-set registry and expose the exact sets assignable to forward tasks.
 * PUBLIC API / ENTRYPOINTS:
 *   - parseValidationRegistry: validates the registry table and returns registered and assignable set identities.
 * CONTROL_FLOW: isolate the one registry section, consume its exact table, reject ambiguity, then exclude historical-only sets.
 * INVARIANTS:
 *   - [INV-VALIDATION-REGISTRY] Forward task set names come from unique canonical registry rows, never a duplicated code list.
 * BOUNDARIES:
 *   - .harness/validation.md owns set meaning; task-schema validation owns per-task assignment requirements.
 * RELATED:
 *   - .harness/validation.md: owns the canonical registry rows.
 *   - scripts/validation/harness-task-schema.mjs: consumes assignable set identities.
 */

const REGISTRY_HEADING = "## Registry";
const NEXT_HEADING = "## Independent Review Gate";
const HEADER = "| Set | Command or procedure | Proves |";
const SEPARATOR = "|---|---|---|";
const HISTORICAL_ONLY = new Set(["bootstrap-preflight"]);

function registrySection(source) {
  const normalized = source.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  const lines = normalized.split("\n");
  const starts = lines.flatMap((line, index) =>
    line === REGISTRY_HEADING ? [index] : [],
  );
  const ends = lines.flatMap((line, index) =>
    line === NEXT_HEADING ? [index] : [],
  );
  if (starts.length !== 1 || ends.length !== 1 || ends[0] <= starts[0]) {
    return undefined;
  }
  return lines.slice(starts[0] + 1, ends[0]);
}

export function parseValidationRegistry(validationText) {
  // @ah INV-VALIDATION-REGISTRY
  const errors = [];
  const section = registrySection(validationText);
  if (!section) {
    return {
      registered: new Set(),
      assignable: new Set(),
      errors: [
        ".harness/validation.md: validation registry must have one exact Registry section before Independent Review Gate",
      ],
    };
  }

  const tableLines = section.filter((line) => line.trimStart().startsWith("|"));
  if (
    section.some(
      (line) => line.trim().length > 0 && !line.trimStart().startsWith("|"),
    )
  ) {
    errors.push(
      ".harness/validation.md: validation registry contains malformed or unconsumed content",
    );
  }
  if (tableLines[0] !== HEADER || tableLines[1] !== SEPARATOR) {
    errors.push(
      ".harness/validation.md: validation registry must use the exact canonical table header",
    );
  }

  const names = [];
  for (const line of tableLines.slice(2)) {
    const match = line.match(
      /^\| `([a-z][a-z0-9-]*)` \| (\S(?:.*\S)?) \| (\S(?:.*\S)?) \|$/,
    );
    if (!match) {
      errors.push(
        ".harness/validation.md: validation registry contains a malformed or unconsumed row",
      );
      continue;
    }
    names.push(match[1]);
  }

  const registered = new Set(names);
  if (registered.size !== names.length) {
    errors.push(
      ".harness/validation.md: validation registry set names must be unique",
    );
  }
  for (const required of ["baseline", "agent-review"]) {
    if (!registered.has(required)) {
      errors.push(
        `.harness/validation.md: validation registry is missing required set ${required}`,
      );
    }
  }

  return {
    registered,
    assignable: new Set(
      [...registered].filter((name) => !HISTORICAL_ONLY.has(name)),
    ),
    errors: [...new Set(errors)].sort(),
  };
}
