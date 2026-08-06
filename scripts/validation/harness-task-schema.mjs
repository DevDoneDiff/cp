/**
 * MODULE: scripts/validation/harness-task-schema.mjs
 * PURPOSE: Validate the exact forward task-entry schema and legal active or completed state combinations.
 * PUBLIC API / ENTRYPOINTS:
 *   - validateStableTaskIdentities: rejects tag or brick reuse across parsed generations.
 *   - validateTaskStoreShape: validates parsed task fields, list grammar, allowed values, and state semantics.
 * CONTROL_FLOW:
 *   1. Validate exact field order and singleton field representation.
 *   2. Validate scalar enums, stable IDs, dependency grammar, and task-tag/type agreement.
 *   3. Validate every structured list body and readiness-sensitive state combination.
 * INVARIANTS:
 *   - [INV-TASK-SCHEMA] Every forward task consumes the complete canonical schema without ignored fields or list lines.
 * BOUNDARIES:
 *   - Cross-store membership, counters, and transition shape remain owned by sibling harness modules.
 * RELATED:
 *   - .harness/tasks.md: owns the canonical task template and active-state meanings.
 *   - scripts/validation/harness-task-stores.mjs: owns source-region parsing.
 * SECURITY:
 *   - Malformed or unconsumed schema content fails closed with the exact task identity.
 */
import { duplicateValues, isSeedTaskTag } from "./harness-task-stores.mjs";

function stableIdentity(block) {
  return `${block.title}\n${block.fields.Source_spec_id ?? "seed"}\n${block.fields.Brick_id ?? "seed"}`;
}

export function validateStableTaskIdentities(
  baseBlocks,
  currentBlocks,
  errors,
) {
  const baseByTag = new Map(baseBlocks.map((block) => [block.tag, block]));
  const baseByBrick = new Map(
    baseBlocks
      .filter(({ fields }) => fields.Brick_id)
      .map((block) => [block.fields.Brick_id, block]),
  );
  for (const block of currentBlocks) {
    const priorTag = baseByTag.get(block.tag);
    if (priorTag && stableIdentity(priorTag) !== stableIdentity(block)) {
      errors.push(
        `task identity: [${block.tag}] reuses an existing tag for different content`,
      );
    }
    const priorBrick = baseByBrick.get(block.fields.Brick_id);
    if (priorBrick && priorBrick.tag !== block.tag) {
      errors.push(
        `task identity: Brick_id ${block.fields.Brick_id} was already represented by [${priorBrick.tag}]`,
      );
    }
  }
}

const FORWARD_FIELDS = [
  "Type",
  "Bootstrap",
  "Source_spec_id",
  "Source_spec",
  "Brick_id",
  "Traceability",
  "Priority",
  "Depends_on",
  "Status",
  "Ready",
  "Pass",
  "Objective",
  "Scope",
  "Non_goals",
  "Acceptance_criteria",
  "Indivisibility_rationale",
  "Expected_surfaces",
  "Reference_artifacts",
  "Validation_sets",
  "Open_questions",
  "Blocker",
  "Scratchpad",
];
const LIST_FIELDS = FORWARD_FIELDS.slice(
  FORWARD_FIELDS.indexOf("Objective"),
  FORWARD_FIELDS.indexOf("Blocker"),
);
const ACTIVE_STATUSES = new Set(["queued", "working", "blocked"]);
const TASK_TYPES = new Set([
  "feature",
  "bug",
  "migration",
  "maintenance",
  "refactor",
]);
const REGISTERED_VALIDATION_SETS = new Set([
  "agent-review",
  "baseline",
  "frontend-component",
  "frontend-e2e",
  "frontend-visual",
  "security",
  "security-review",
  "smoke",
]);

export function taskListItems(block, field) {
  const start = block.raw.indexOf(`${field}:\n`);
  const fieldIndex = FORWARD_FIELDS.indexOf(field);
  const next = FORWARD_FIELDS[fieldIndex + 1];
  if (start < 0 || !next) {
    return { items: [], errors: [`missing ${field} list`] };
  }
  const bodyStart = start + field.length + 2;
  const end = block.raw.indexOf(`\n${next}:`, bodyStart);
  if (end < 0) {
    return { items: [], errors: [`${field} has no ${next} boundary`] };
  }
  const lines = block.raw.slice(bodyStart, end).split("\n");
  const malformed = lines.filter((line) => !/^- \S.*$/.test(line));
  return {
    items: lines
      .filter((line) => /^- \S.*$/.test(line))
      .map((line) => line.slice(2)),
    errors: malformed.map(
      (line) => `${field} has malformed line ${JSON.stringify(line)}`,
    ),
  };
}

function validateScalarFields(block, file, errors) {
  const { fields, tag } = block;
  if (!TASK_TYPES.has(fields.Type)) {
    errors.push(
      `${file}: [${tag}] Type is invalid: ${fields.Type ?? "missing"}`,
    );
  }
  if ((fields.Type === "refactor") !== tag.startsWith("R-")) {
    errors.push(
      `${file}: [${tag}] tag category does not match Type ${fields.Type}`,
    );
  }
  if (fields.Bootstrap !== "false") {
    errors.push(`${file}: [${tag}] Bootstrap must be false`);
  }
  if (
    !/^(?:state\/s\d{2}|harness|repository)\/[A-Za-z0-9][A-Za-z0-9.-]*$/.test(
      fields.Source_spec_id ?? "",
    )
  ) {
    errors.push(`${file}: [${tag}] Source_spec_id is invalid`);
  }
  if (
    !fields.Source_spec ||
    fields.Source_spec.startsWith("/") ||
    fields.Source_spec.includes("\\") ||
    fields.Source_spec.split("/").includes("..") ||
    !fields.Source_spec.endsWith(".md")
  ) {
    errors.push(
      `${file}: [${tag}] Source_spec must be an exact repository-relative Markdown path`,
    );
  }
  if (
    !fields.Brick_id?.startsWith(`${fields.Source_spec_id}/`) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      fields.Brick_id?.slice((fields.Source_spec_id?.length ?? -1) + 1) ?? "",
    )
  ) {
    errors.push(
      `${file}: [${tag}] Brick_id must be a stable source-scoped kebab-case identity`,
    );
  }
  if (
    !/^[A-Za-z0-9.-]+(?:, [A-Za-z0-9.-]+)*$/.test(fields.Traceability ?? "")
  ) {
    errors.push(
      `${file}: [${tag}] Traceability has invalid identifier grammar`,
    );
  }
  if (!/^(?:P0|P1|P2)$/.test(fields.Priority ?? "")) {
    errors.push(`${file}: [${tag}] Priority must be P0, P1, or P2`);
  }
  if (
    !/^(?:none|\[[TR]-\d{4}\](?:, \[[TR]-\d{4}\])*)$/.test(
      fields.Depends_on ?? "",
    )
  ) {
    errors.push(`${file}: [${tag}] Depends_on has invalid task-tag grammar`);
  }
  if (fields.Depends_on?.includes(`[${tag}]`)) {
    errors.push(`${file}: [${tag}] cannot depend on itself`);
  }
  if (!/^(?:true|false)$/.test(fields.Ready ?? "")) {
    errors.push(`${file}: [${tag}] Ready must be true or false`);
  }
  if (fields.Scratchpad !== `.harness/work/${tag}.md`) {
    errors.push(`${file}: [${tag}] Scratchpad must use its exact task tag`);
  }
}

function validateLists(block, file, errors) {
  const lists = new Map();
  for (const field of LIST_FIELDS) {
    const parsed = taskListItems(block, field);
    lists.set(field, parsed.items);
    for (const error of parsed.errors) {
      errors.push(`${file}: [${block.tag}] ${error}`);
    }
    if (parsed.items.length === 0) {
      errors.push(
        `${file}: [${block.tag}] ${field} must contain at least one list item`,
      );
    }
  }

  const artifacts = lists.get("Reference_artifacts") ?? [];
  if (
    artifacts.includes("none")
      ? artifacts.length !== 1
      : artifacts.some((item) => item === "none" || /^`.*`$/.test(item))
  ) {
    errors.push(
      `${file}: [${block.tag}] Reference_artifacts must be one unquoted exact path per item or only none`,
    );
  }
  const sets = lists.get("Validation_sets") ?? [];
  if (
    sets.some((item) => !/^[a-z][a-z0-9-]*$/.test(item)) ||
    sets.some((item) => !REGISTERED_VALIDATION_SETS.has(item)) ||
    duplicateValues(sets).length > 0 ||
    !sets.includes("baseline") ||
    !sets.includes("agent-review")
  ) {
    errors.push(
      `${file}: [${block.tag}] Validation_sets has invalid or incomplete set names`,
    );
  }
  const openQuestions = lists.get("Open_questions") ?? [];
  if (
    block.fields.Ready === "true" &&
    (openQuestions.length !== 1 || openQuestions[0] !== "none")
  ) {
    errors.push(
      `${file}: [${block.tag}] Ready task must have Open_questions: none`,
    );
  }
  return lists;
}

function renderForwardBlock(block, lists) {
  const lines = [`### [${block.tag}] ${block.title}`];
  for (const field of FORWARD_FIELDS) {
    if (LIST_FIELDS.includes(field)) {
      lines.push(
        `${field}:`,
        ...(lists.get(field) ?? []).map((item) => `- ${item}`),
      );
    } else {
      lines.push(`${field}: ${block.fields[field] ?? ""}`);
    }
  }
  return lines.join("\n");
}

function validateForwardBlock(block, file, errors) {
  const names = block.entries.map(({ name }) => name);
  for (const duplicate of duplicateValues(names)) {
    errors.push(`${file}: [${block.tag}] duplicates field ${duplicate}`);
  }
  // @ah INV-TASK-SCHEMA
  if (names.join("\n") !== FORWARD_FIELDS.join("\n")) {
    errors.push(
      `${file}: [${block.tag}] fields must exactly follow the forward task schema`,
    );
  }
  for (const field of LIST_FIELDS) {
    if (block.fields[field] !== "") {
      errors.push(
        `${file}: [${block.tag}] ${field} heading must not have an inline value`,
      );
    }
  }
  validateScalarFields(block, file, errors);
  const lists = validateLists(block, file, errors);
  if (renderForwardBlock(block, lists) !== block.raw) {
    errors.push(
      `${file}: [${block.tag}] contains unconsumed or noncanonical schema content`,
    );
  }
}

export function validateTaskStoreShape(parsed, kind, file, errors) {
  errors.push(...parsed.errors.map((error) => `${file}: ${error}`));
  for (const duplicate of duplicateValues(
    parsed.blocks.map(({ tag }) => tag),
  )) {
    errors.push(`${file}: duplicate task tag [${duplicate}]`);
  }

  let workingCount = 0;
  for (const block of parsed.blocks) {
    const { fields, tag } = block;
    if (isSeedTaskTag(tag)) {
      if (kind === "active") {
        errors.push(`${file}: historical seed task [${tag}] cannot be active`);
      }
    } else {
      validateForwardBlock(block, file, errors);
    }

    if (kind === "active") {
      if (!ACTIVE_STATUSES.has(fields.Status)) {
        errors.push(
          `${file}: [${tag}] active Status must be queued, working, or blocked`,
        );
      }
      if (fields.Pass !== "false") {
        errors.push(`${file}: [${tag}] active Pass must be false`);
      }
      if (fields.Status === "working") {
        workingCount += 1;
        if (fields.Ready !== "true") {
          errors.push(`${file}: [${tag}] working task must have Ready: true`);
        }
      }
      if (
        (fields.Status === "queued" || fields.Status === "working") &&
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
        `${file}: [${tag}] completed task must have Status: passed and Pass: true`,
      );
    }
  }
  if (kind === "active" && workingCount > 1) {
    errors.push(`${file}: at most one active task may have Status: working`);
  }
}
