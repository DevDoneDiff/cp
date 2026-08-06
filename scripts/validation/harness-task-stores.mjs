/**
 * ROLE: Parse active/completed implementation-task stores and validate monotonic contiguous tag allocation.
 * BOUNDARY: Task meaning and lifecycle transitions are owned by the schema and transition validators.
 * RELATIONS: .harness/tasks.md owns counters; .harness/completed.md owns completed entries.
 * VALIDATION: tests/unit/harness-integrity.test.ts exercises parsing, counters, and transition inputs.
 */
const STORE_BOUNDARIES = {
  active: "## Active Queue",
  completed: "## Completed",
};

function normalizeText(source) {
  return source.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function fieldLines(block) {
  return [...block.matchAll(/^([A-Za-z][A-Za-z_]*):(?:[ \t]*(.*))?$/gm)].map(
    (match) => ({
      name: match[1],
      value: match[2] ?? "",
      index: match.index,
      end: match.index + match[0].length,
    }),
  );
}

export function parseTaskStore(source, kind) {
  const normalized = normalizeText(source);
  const boundary = STORE_BOUNDARIES[kind];
  if (!boundary) throw new Error(`Unknown task store kind: ${kind}`);
  const matches = [...normalized.matchAll(new RegExp(`^${boundary}$`, "gm"))];
  if (matches.length !== 1) {
    return {
      normalized,
      prefix: normalized,
      blocks: [],
      errors: [
        `${kind}: expected exactly one ${boundary} boundary, found ${matches.length}`,
      ],
    };
  }

  const boundaryEnd = matches[0].index + boundary.length;
  const region = normalized.slice(boundaryEnd);
  const headings = [...region.matchAll(/^### (.+)$/gm)];
  const preamble = region.slice(0, headings[0]?.index ?? region.length);
  const errors = [];
  if (preamble.trim().length > 0) {
    errors.push(`${kind}: task region contains text outside a task block`);
  }

  const blocks = [];
  for (const [index, heading] of headings.entries()) {
    const identity = heading[1].match(/^\[([TR]-\d{4})\] (\S.*)$/);
    if (!identity) {
      errors.push(`${kind}: malformed task heading ### ${heading[1]}`);
      continue;
    }
    const start = heading.index;
    const end = headings[index + 1]?.index ?? region.length;
    const raw = region.slice(start, end).trimEnd();
    const entries = fieldLines(raw);
    blocks.push({
      tag: identity[1],
      title: identity[2],
      raw,
      entries,
      fields: Object.fromEntries(
        entries.map(({ name, value }) => [name, value]),
      ),
    });
  }
  return {
    normalized,
    prefix: normalized.slice(
      0,
      headings.length ? boundaryEnd + headings[0].index : normalized.length,
    ),
    blocks,
    errors,
  };
}

export function renderTaskStore(parsed, blocks) {
  const prefix = parsed.prefix.trimEnd();
  return blocks.length
    ? `${prefix}\n\n${blocks.map(({ raw }) => raw.trim()).join("\n\n")}\n`
    : `${prefix}\n`;
}

export function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts]
    .filter(([, count]) => count > 1)
    .map(([value]) => value)
    .sort();
}

function counter(source, name, file, errors) {
  const matches = [
    ...normalizeText(source).matchAll(
      new RegExp("^- `" + name + "`: (\\d{4})$", "gm"),
    ),
  ];
  if (matches.length !== 1) {
    errors.push(`${file}: expected one four-digit ${name}`);
    return undefined;
  }
  return Number(matches[0][1]);
}

function tagNumber(tag) {
  return Number(tag.slice(2));
}

export function validateTaskCounters(
  activeText,
  blocks,
  baseActiveText,
  baseBlocks,
  errors,
) {
  for (const [prefix, name] of [
    ["T-", "NEXT_TASK_TAG"],
    ["R-", "NEXT_REFACTOR_TAG"],
  ]) {
    const current = counter(activeText, name, ".harness/tasks.md", errors);
    const prior = baseActiveText
      ? counter(baseActiveText, name, "base:.harness/tasks.md", errors)
      : undefined;
    if (current === undefined) continue;
    if (prior !== undefined && current < prior) {
      errors.push(`.harness/tasks.md: ${name} must not decrease`);
    }
    const assigned = blocks
      .filter(({ tag }) => tag.startsWith(prefix))
      .map(({ tag }) => tagNumber(tag))
      .sort((left, right) => left - right);
    const expected = Array.from(
      { length: current - 1 },
      (_, index) => index + 1,
    );
    if (assigned.join(",") !== expected.join(",")) {
      errors.push(
        `.harness/tasks.md: assigned ${prefix} tags must be unique and contiguous below ${name} ${String(current).padStart(4, "0")}`,
      );
    }
    if (baseBlocks.length > 0) {
      const priorAssigned = new Set(
        baseBlocks
          .filter(({ tag }) => tag.startsWith(prefix))
          .map(({ tag }) => tag),
      );
      for (const tag of priorAssigned) {
        if (!blocks.some((block) => block.tag === tag)) {
          errors.push(
            `task history: [${tag}] disappeared from both current stores`,
          );
        }
      }
    }
  }
}
