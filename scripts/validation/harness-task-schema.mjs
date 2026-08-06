/**
 * ROLE: Validate semantic implementation-task fields, list content, and active/completed state combinations.
 * BOUNDARY: Field order and Markdown byte layout are presentation; store membership and transitions are validated separately.
 * RELATIONS: .harness/tasks.md defines the readable template; harness-validation-registry.mjs supplies allowed proof sets.
 * VALIDATION: tests/unit/harness-integrity.test.ts covers flexible ordering and fail-closed task meaning.
 */
import { duplicateValues } from "./harness-task-stores.mjs";

export const FORWARD_FIELDS = [
  "Type",
  "Source_spec",
  "Priority",
  "Depends_on",
  "Status",
  "Ready",
  "Pass",
  "Objective",
  "Scope",
  "Non_goals",
  "Acceptance_criteria",
  "Expected_surfaces",
  "Reference_artifacts",
  "Validation_sets",
  "Open_questions",
  "Blocker",
  "Scratchpad",
];
export const LIST_FIELDS = new Set([
  "Objective",
  "Scope",
  "Non_goals",
  "Acceptance_criteria",
  "Expected_surfaces",
  "Reference_artifacts",
  "Validation_sets",
  "Open_questions",
]);
const ACTIVE_STATUSES = new Set(["queued", "working", "blocked"]);
const TYPES = new Set([
  "feature",
  "bug",
  "migration",
  "maintenance",
  "refactor",
]);

export function taskListItems(block, field) {
  const entryIndex = block.entries.findIndex(({ name }) => name === field);
  const entry = block.entries[entryIndex];
  if (!entry) return { items: [], errors: [`missing ${field}`] };
  const next = block.entries
    .filter(({ index }) => index > entry.index)
    .sort((left, right) => left.index - right.index)[0];
  const body = block.raw
    .slice(entry.end, next?.index ?? block.raw.length)
    .trim();
  const lines = body ? body.split("\n").map((line) => line.trimEnd()) : [];
  const malformed = lines.filter((line) => !/^- \S.*$/.test(line));
  return {
    items: lines
      .filter((line) => /^- \S.*$/.test(line))
      .map((line) => line.slice(2)),
    errors: [
      ...(entry.value
        ? [`${field} must use list items rather than an inline value`]
        : []),
      ...malformed.map(
        (line) => `${field} has malformed line ${JSON.stringify(line)}`,
      ),
    ],
  };
}

export function taskRecord(block) {
  const fields = {};
  for (const name of FORWARD_FIELDS) {
    fields[name] = LIST_FIELDS.has(name)
      ? taskListItems(block, name).items
      : block.fields[name];
  }
  return { tag: block.tag, title: block.title, fields };
}

export function validateStableTaskIdentities(
  baseBlocks,
  currentBlocks,
  errors,
) {
  const prior = new Map(baseBlocks.map((block) => [block.tag, block]));
  for (const block of currentBlocks) {
    const existing = prior.get(block.tag);
    if (
      existing &&
      (existing.title !== block.title ||
        existing.fields.Source_spec !== block.fields.Source_spec)
    ) {
      errors.push(
        `task identity: [${block.tag}] was reused for different work`,
      );
    }
  }
}

function legacyCompleted(block) {
  return (
    block.fields.Bootstrap !== undefined &&
    block.fields.Source_spec !== undefined
  );
}

function validateForward(block, file, assignable, errors) {
  const names = block.entries.map(({ name }) => name);
  for (const duplicate of duplicateValues(names)) {
    errors.push(`${file}: [${block.tag}] duplicates field ${duplicate}`);
  }
  const unknown = names.filter((name) => !FORWARD_FIELDS.includes(name));
  const missing = FORWARD_FIELDS.filter((name) => !names.includes(name));
  if (unknown.length || missing.length) {
    errors.push(
      `${file}: [${block.tag}] task fields are incomplete or unknown` +
        `${missing.length ? `; missing ${missing.join(", ")}` : ""}` +
        `${unknown.length ? `; unknown ${unknown.join(", ")}` : ""}`,
    );
  }

  const fields = block.fields;
  if (!TYPES.has(fields.Type))
    errors.push(`${file}: [${block.tag}] Type is invalid`);
  if ((fields.Type === "refactor") !== block.tag.startsWith("R-")) {
    errors.push(`${file}: [${block.tag}] tag category does not match Type`);
  }
  if (
    !/^docs\/contracts\/states\/s\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\/specs\/[A-Za-z0-9][A-Za-z0-9.-]*-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(
      fields.Source_spec ?? "",
    )
  ) {
    errors.push(
      `${file}: [${block.tag}] Source_spec must be a canonical product-spec path`,
    );
  }
  if (!/^(?:P0|P1|P2)$/.test(fields.Priority ?? "")) {
    errors.push(`${file}: [${block.tag}] Priority must be P0, P1, or P2`);
  }
  if (
    !/^(?:none|\[[TR]-\d{4}\](?:, \[[TR]-\d{4}\])*)$/.test(
      fields.Depends_on ?? "",
    )
  ) {
    errors.push(
      `${file}: [${block.tag}] Depends_on has invalid task-tag grammar`,
    );
  }
  if (fields.Depends_on?.includes(`[${block.tag}]`)) {
    errors.push(`${file}: [${block.tag}] cannot depend on itself`);
  }
  if (!/^(?:true|false)$/.test(fields.Ready ?? "")) {
    errors.push(`${file}: [${block.tag}] Ready must be true or false`);
  }
  if (fields.Scratchpad !== `.harness/work/${block.tag}.md`) {
    errors.push(`${file}: [${block.tag}] Scratchpad must use its task tag`);
  }

  const lists = new Map();
  for (const field of LIST_FIELDS) {
    const parsed = taskListItems(block, field);
    lists.set(field, parsed.items);
    for (const error of parsed.errors)
      errors.push(`${file}: [${block.tag}] ${error}`);
    if (parsed.items.length === 0) {
      errors.push(
        `${file}: [${block.tag}] ${field} must contain at least one item`,
      );
    }
  }
  const references = lists.get("Reference_artifacts") ?? [];
  if (references.includes("none") && references.length !== 1) {
    errors.push(
      `${file}: [${block.tag}] Reference_artifacts must be only none or exact paths`,
    );
  }
  const sets = lists.get("Validation_sets") ?? [];
  if (
    !sets.includes("baseline") ||
    duplicateValues(sets).length ||
    sets.some((set) => !assignable.has(set))
  ) {
    errors.push(
      `${file}: [${block.tag}] Validation_sets must include baseline and only registered unique sets`,
    );
  }
  const questions = lists.get("Open_questions") ?? [];
  if (
    fields.Ready === "true" &&
    (questions.length !== 1 || questions[0] !== "none")
  ) {
    errors.push(
      `${file}: [${block.tag}] Ready task must have Open_questions: none`,
    );
  }
}

export function validateTaskStoreShape(parsed, kind, file, assignable, errors) {
  errors.push(...parsed.errors.map((error) => `${file}: ${error}`));
  for (const duplicate of duplicateValues(
    parsed.blocks.map(({ tag }) => tag),
  )) {
    errors.push(`${file}: duplicate task tag [${duplicate}]`);
  }
  let working = 0;
  for (const block of parsed.blocks) {
    if (legacyCompleted(block)) {
      if (kind === "active") {
        errors.push(
          `${file}: [${block.tag}] legacy completed schema cannot be active`,
        );
      }
    } else {
      validateForward(block, file, assignable, errors);
    }
    const { fields, tag } = block;
    if (kind === "active") {
      if (!ACTIVE_STATUSES.has(fields.Status)) {
        errors.push(`${file}: [${tag}] active Status is invalid`);
      }
      if (fields.Pass !== "false")
        errors.push(`${file}: [${tag}] active Pass must be false`);
      if (fields.Status === "working") {
        working += 1;
        if (fields.Ready !== "true")
          errors.push(`${file}: [${tag}] working task must be ready`);
      }
      if (
        ["queued", "working"].includes(fields.Status) &&
        fields.Blocker !== "none"
      ) {
        errors.push(
          `${file}: [${tag}] ${fields.Status} task must have Blocker: none`,
        );
      }
      if (
        fields.Status === "blocked" &&
        (!fields.Blocker || fields.Blocker === "none")
      ) {
        errors.push(`${file}: [${tag}] blocked task must record a blocker`);
      }
    } else if (fields.Status !== "passed" || fields.Pass !== "true") {
      errors.push(
        `${file}: [${tag}] completed task must be passed with Pass: true`,
      );
    }
  }
  if (kind === "active" && working > 1) {
    errors.push(`${file}: at most one task may be working`);
  }
}
