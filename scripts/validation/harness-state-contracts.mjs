/**
 * ROLE: Validate active product-task routes to approved state specs, state contracts, and exact canonical artifacts.
 * BOUNDARY: Historical completed-task paths remain Git history and are not live compatibility routes.
 * RELATIONS: docs/contracts/README.md owns product routing; task schema owns task-field meaning.
 * VALIDATION: tests/unit/harness-integrity.test.ts covers missing, unapproved, and noncanonical product authority.
 */
import path from "node:path";

import { taskListItems } from "./harness-task-schema.mjs";

function text(value) {
  if (value === undefined) return undefined;
  return Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
}

function stateDirectories(statesReadme) {
  return new Map(
    [...statesReadme.matchAll(/^- `(s\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*)`:/gm)].map(
      ([, directory]) => [directory.slice(0, 3), directory],
    ),
  );
}

function canonicalStatePath(filePath, directories) {
  const match = filePath.match(
    /^docs\/contracts\/states\/(s\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*)\/(s\d{2})-state\.md$/,
  );
  return (
    !!match &&
    match[1].startsWith(`${match[2]}-`) &&
    directories.get(match[2]) === match[1]
  );
}

function metadata(source, name) {
  return [
    ...source.matchAll(new RegExp(`^- \\*\\*${name}:\\*\\* (.+)$`, "gm")),
  ].map((match) => match[1]);
}

function approvedState(filePath, files, directories, errors) {
  if (!canonicalStatePath(filePath, directories)) {
    errors.push(`${filePath}: state contract path is not canonical`);
    return;
  }
  const source = text(files.get(filePath));
  if (!source) {
    errors.push(`${filePath}: required state contract is absent`);
    return;
  }
  if (
    metadata(source, "State")[0] !== "approved" ||
    metadata(source, "Approved")[0] !== "true"
  ) {
    errors.push(`${filePath}: state contract must be approved`);
  }
}

function canonicalSpec(sourcePath, specId, directories) {
  const match = specId?.match(/^state\/(s\d{2})\/([A-Za-z0-9][A-Za-z0-9.-]*)$/);
  if (!match) return false;
  const directory = directories.get(match[1]);
  return (
    !!directory &&
    path.posix.dirname(sourcePath) ===
      `docs/contracts/states/${directory}/specs` &&
    new RegExp(
      `^${match[2].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-[a-z0-9]+(?:-[a-z0-9]+)*\\.md$`,
    ).test(path.posix.basename(sourcePath))
  );
}

function validateActiveSpec(block, files, directories, errors) {
  const sourcePath = block.fields.Source_spec;
  const source = text(files.get(sourcePath));
  if (!source) {
    errors.push(
      `.harness/tasks.md: [${block.tag}] Source_spec does not exist: ${sourcePath}`,
    );
    return;
  }
  const ids = metadata(source, "Spec ID").map(
    (item) => item.match(/^`([^`]+)`$/)?.[1],
  );
  if (ids.length !== 1 || !canonicalSpec(sourcePath, ids[0], directories)) {
    errors.push(
      `${sourcePath}: product Spec ID and canonical path do not agree`,
    );
  }
  if (
    metadata(source, "State")[0] !== "approved" ||
    metadata(source, "Approved")[0] !== "true"
  ) {
    errors.push(
      `${sourcePath}: [${block.tag}] Ready task requires an approved product spec`,
    );
  }
  const owners = metadata(source, "Owning authority").map((item) =>
    item.replace(/^`|`$/g, ""),
  );
  if (owners.length !== 1) {
    errors.push(`${sourcePath}: expected one Owning authority`);
  } else {
    approvedState(owners[0], files, directories, errors);
  }
  const affected = metadata(source, "Affected states");
  if (affected.length !== 1) {
    errors.push(`${sourcePath}: expected one Affected states declaration`);
  } else {
    const paths = [...affected[0].matchAll(/`([^`]+)`/g)].map(
      (match) => match[1],
    );
    if (
      !paths.length ||
      paths.map((item) => `\`${item}\``).join(", ") !== affected[0]
    ) {
      errors.push(`${sourcePath}: malformed Affected states declaration`);
    } else {
      for (const filePath of paths)
        approvedState(filePath, files, directories, errors);
    }
  }
  for (const artifact of taskListItems(block, "Reference_artifacts").items) {
    if (artifact === "none") continue;
    if (
      !/^docs\/contracts\/states\/s\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\/(?:visual|technical)-[a-z0-9]+(?:-[a-z0-9]+)*\.png$/.test(
        artifact,
      )
    ) {
      errors.push(
        `.harness/tasks.md: [${block.tag}] artifact path is not canonical: ${artifact}`,
      );
    } else if (!files.has(artifact)) {
      errors.push(
        `.harness/tasks.md: [${block.tag}] artifact is missing: ${artifact}`,
      );
    } else if (!source.includes(artifact)) {
      errors.push(
        `${sourcePath}: [${block.tag}] artifact is not assigned by the product spec: ${artifact}`,
      );
    }
  }
}

function validateConcreteStates(files, directories, errors) {
  const template = text(files.get("docs/contracts/states/STATE_TEMPLATE.md"));
  if (!template) {
    errors.push("docs/contracts/states/STATE_TEMPLATE.md: template is missing");
    return;
  }
  const placeholders = new Set(template.match(/\[[^\]\n]+\]/g) ?? []);
  for (const [filePath, value] of files) {
    if (
      !filePath.startsWith("docs/contracts/states/") ||
      !filePath.endsWith("-state.md")
    )
      continue;
    if (!canonicalStatePath(filePath, directories)) {
      errors.push(`${filePath}: concrete state contract path is not canonical`);
      continue;
    }
    const source = text(value);
    const residue = [
      ...placeholders,
      "SNN.N",
      "SNN",
      "sNN-",
      "<descriptor>",
    ].find((token) => source.includes(token));
    if (residue)
      errors.push(
        `${filePath}: unresolved state-template placeholder ${residue}`,
      );
  }
}

export function validateStateContractRoutes({ blocks, files, statesReadme }) {
  const errors = [];
  const directories = stateDirectories(statesReadme);
  if (!directories.size)
    errors.push(
      "docs/contracts/states/README.md: State Index is missing or empty",
    );
  for (const block of blocks)
    validateActiveSpec(block, files, directories, errors);
  validateConcreteStates(files, directories, errors);
  return [...new Set(errors)].sort();
}
