/**
 * MODULE: scripts/validation/harness-task-stores.mjs
 * PURPOSE: Parse exact active/completed store regions and validate counters and historical seed provenance.
 * PUBLIC API / ENTRYPOINTS:
 *   - parseTaskStore: returns deterministic task-block identities and fields from one store.
 *   - validateTaskCounters: proves monotonic unused task and refactor counters.
 *   - validateSeedArchive: reproduces the canonical historical seed boundary and hash.
 * CONTROL_FLOW:
 *   1. Parse only the canonical Active Queue or Completed region, excluding templates and provenance prose.
 *   2. Reject malformed headings, unconsumed region text, and noncanonical block separators.
 *   3. Slice the exact canonical seed boundary and validate task and refactor counters.
 * INVARIANTS:
 *   - [INV-HARNESS-SEED] The immutable T-0001 through T-0007 seed has one exact order and SHA-256.
 * BOUNDARIES:
 *   - This module proves local structure only; remote claims, completion, dependencies, and merge evidence remain procedural.
 * RELATED:
 *   - .harness/tasks.md: owns active task schema and counters.
 *   - .harness/completed.md: owns archive immutability and seed provenance.
 *   - scripts/validation/harness-task-transitions.mjs: owns cross-store and base-to-candidate transitions.
 * SECURITY:
 *   - Inputs are treated as untrusted text and produce deterministic diagnostics without evaluation or mutation.
 */
import { createHash } from "node:crypto";

export const CANONICAL_SEED_HASH =
  "2B07112D32C5401991C2224A83E7C53BB36415842C599BAB900F17135F460C1F";
export const CANONICAL_SEED_PROVENANCE = `## Historical Seed Provenance

- During the H1 transition, the seven historical blocks \`T-0001, T-0002, T-0003, T-0004, T-0006, T-0005, T-0007\` were seeded here verbatim in that order.
- Those tasks did not originally execute the current active-to-archive transfer procedure. Their compatibility proof is the existing tagged base-branch history plus the exact seeded blocks and this provenance; it does not imply post-H1 completion mechanics.
- The canonical seed-hash input is UTF-8 text from the first \`### [T-0001]\` heading through the terminal newline immediately after the \`T-0007\` block and before any later archive entry. Normalize CRLF to LF, with no trimming or other transformation.
- The canonical combined seed-block SHA-256 is \`${CANONICAL_SEED_HASH}\`.
- Tasks completed after this seed require the canonical post-H1 completion proof; seed compatibility is not reusable for later tasks.

`;
export const SEED_TAGS = [
  "T-0001",
  "T-0002",
  "T-0003",
  "T-0004",
  "T-0006",
  "T-0005",
  "T-0007",
];

const STORE_BOUNDARIES = {
  active: "## Active Queue",
  completed: "## Completed",
};

function normalizeText(source) {
  return source.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function fieldLines(block) {
  return [...block.matchAll(/^([A-Za-z][A-Za-z_]*):(?: (.*))?$/gm)].map(
    (match) => ({ name: match[1], value: match[2] ?? "" }),
  );
}

export function parseTaskStore(source, kind) {
  const normalized = normalizeText(source);
  const boundary = STORE_BOUNDARIES[kind];
  if (!boundary) {
    throw new Error(`Unknown task store kind: ${kind}`);
  }
  const boundaryMatches = [
    ...normalized.matchAll(new RegExp(`^${boundary}$`, "gm")),
  ];
  if (boundaryMatches.length !== 1) {
    return {
      normalized,
      prefix: normalized,
      blocks: [],
      errors: [
        `${kind}: expected exactly one ${boundary} boundary, found ${boundaryMatches.length}`,
      ],
    };
  }

  const errors = [];
  const boundaryIndex = boundaryMatches[0].index;
  const regionOffset = boundaryIndex + boundary.length;
  const region = normalized.slice(regionOffset);
  const headings = [...region.matchAll(/^### (.+)$/gm)];
  const firstHeadingStart = headings[0]?.index;
  const preamble = region.slice(0, firstHeadingStart ?? region.length);
  if (headings.length > 0 && preamble !== "\n\n") {
    errors.push(`${kind}: task region must begin with one blank line`);
  }
  if (headings.length === 0 && !/^\n{1,2}$/.test(preamble)) {
    errors.push(`${kind}: empty task region contains unconsumed text`);
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
    const raw = region.slice(start, end).replace(/\n+$/, "");
    const entries = fieldLines(raw);
    const fields = Object.fromEntries(
      entries.map(({ name, value }) => [name, value]),
    );
    blocks.push({
      tag: identity[1],
      title: identity[2],
      raw,
      start: regionOffset + start,
      contentEnd: regionOffset + start + raw.length,
      entries,
      fields,
    });
  }

  const prefix = normalized.slice(
    0,
    headings.length > 0 ? regionOffset + headings[0].index : normalized.length,
  );
  const rendered = renderTaskStore({ prefix }, blocks);
  if (headings.length > 0 && rendered !== normalized) {
    errors.push(
      `${kind}: task region contains unconsumed or noncanonical text`,
    );
  }
  return { normalized, prefix, blocks, errors };
}

export function renderTaskStore(parsed, blocks) {
  return `${parsed.prefix}${blocks.map(({ raw }) => raw).join("\n\n")}${blocks.length > 0 ? "\n" : ""}`;
}

export function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value)
    .sort();
}

export function isSeedTaskTag(tag) {
  return SEED_TAGS.includes(tag);
}

function parseCounter(source, name, file, errors) {
  const match = normalizeText(source).match(
    new RegExp("^- `" + name + "`: (\\d{4})$", "m"),
  );
  if (!match) {
    errors.push(`${file}: missing four-digit ${name}`);
    return undefined;
  }
  return Number(match[1]);
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
  for (const [prefix, counter] of [
    ["T-", "NEXT_TASK_TAG"],
    ["R-", "NEXT_REFACTOR_TAG"],
  ]) {
    const current = parseCounter(
      activeText,
      counter,
      ".harness/tasks.md",
      errors,
    );
    const base = baseActiveText
      ? parseCounter(baseActiveText, counter, "HEAD:.harness/tasks.md", errors)
      : undefined;
    const assigned = [...blocks, ...baseBlocks]
      .filter(({ tag }) => tag.startsWith(prefix))
      .map(({ tag }) => tagNumber(tag));
    const maximum = assigned.length > 0 ? Math.max(...assigned) : 0;
    if (current !== undefined && current <= maximum) {
      errors.push(
        `.harness/tasks.md: ${counter} must be greater than assigned ${prefix} tags`,
      );
    }
    if (current !== undefined && base !== undefined && current < base) {
      errors.push(
        `.harness/tasks.md: ${counter} must never decrease from HEAD value ${String(base).padStart(4, "0")}`,
      );
    }
  }
}

export function canonicalSeedText(completedText) {
  const parsed = parseTaskStore(completedText, "completed");
  const seed = parsed.blocks.slice(0, SEED_TAGS.length);
  if (seed.map(({ tag }) => tag).join("\n") !== SEED_TAGS.join("\n")) {
    return undefined;
  }
  return `${parsed.normalized.slice(seed[0].start, seed.at(-1).contentEnd)}\n`;
}

export function validateArchiveProvenance(
  completedText,
  errors,
  file = ".harness/completed.md",
) {
  const normalized = normalizeText(completedText);
  const provenance = normalized.indexOf("## Historical Seed Provenance");
  const completed = normalized.indexOf("## Completed");
  if (provenance < 0 || completed < provenance) {
    errors.push(
      `${file}: historical seed provenance must precede the completed boundary`,
    );
    return;
  }
  if (normalized.slice(provenance, completed) !== CANONICAL_SEED_PROVENANCE) {
    errors.push(
      `${file}: historical seed provenance does not equal the canonical instructions`,
    );
  }
}

export function validateSeedArchive(
  completedText,
  errors,
  file = ".harness/completed.md",
) {
  const seedText = canonicalSeedText(completedText);
  if (!seedText) {
    errors.push(
      `${file}: historical seed tags or order do not match the canonical boundary`,
    );
    return;
  }
  // @ah INV-HARNESS-SEED
  const hash = createHash("sha256")
    .update(seedText, "utf8")
    .digest("hex")
    .toUpperCase();
  if (hash !== CANONICAL_SEED_HASH) {
    errors.push(
      `${file}: historical seed SHA-256 ${hash} does not equal ${CANONICAL_SEED_HASH}`,
    );
  }
}
