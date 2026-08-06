/**
 * ROLE: Parse unique validation-set names and meanings from the canonical implementation registry.
 * BOUNDARY: Table prose, row order, and Markdown byte layout are not validation policy.
 * RELATIONS: Task schema validation consumes the resulting assignable set names.
 * VALIDATION: tests/unit/harness-integrity.test.ts covers semantic parsing and malformed rows.
 */
function registrySection(source) {
  const lines = source
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .split("\n");
  const start = lines.findIndex((line) => line.trim() === "## Registry");
  if (start < 0) return undefined;
  const relativeEnd = lines
    .slice(start + 1)
    .findIndex((line) => /^## /.test(line));
  const end = relativeEnd < 0 ? lines.length : start + 1 + relativeEnd;
  return lines.slice(start + 1, end);
}

export function parseValidationRegistry(source) {
  const errors = [];
  const section = registrySection(source);
  if (!section) {
    return {
      registered: new Set(),
      assignable: new Set(),
      errors: [".harness/validation.md: missing Registry section"],
    };
  }
  const names = [];
  for (const line of section) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      /^\|?\s*:?-+/.test(trimmed) ||
      /^\|\s*Set\s*\|/i.test(trimmed)
    )
      continue;
    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) continue;
    const cells = trimmed
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());
    const name = cells[0]?.match(/^`([a-z][a-z0-9-]*)`$/)?.[1];
    if (cells.length !== 3 || !name || !cells[1] || !cells[2]) {
      errors.push(".harness/validation.md: registry contains a malformed row");
      continue;
    }
    names.push(name);
  }
  const registered = new Set(names);
  if (registered.size !== names.length) {
    errors.push(".harness/validation.md: registry set names must be unique");
  }
  if (!registered.has("baseline")) {
    errors.push(".harness/validation.md: registry is missing baseline");
  }
  return {
    registered,
    assignable: registered,
    errors: [...new Set(errors)].sort(),
  };
}
