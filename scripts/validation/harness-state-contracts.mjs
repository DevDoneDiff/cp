/**
 * MODULE: scripts/validation/harness-state-contracts.mjs
 * PURPOSE: Validate structured spec dependencies and concrete state-contract readiness.
 * PUBLIC API / ENTRYPOINTS: validateStateContractRoutes.
 * CONTROL_FLOW: parse singleton spec metadata, resolve indexed state paths, then inspect concrete contracts.
 * INVARIANTS:
 *   - [INV-STATE-CONTRACT] A concrete state contract is indexed, approved, and free of template residue.
 * BOUNDARIES:
 *   - Artifact migration and task artifact references remain owned by harness-artifact-routes.mjs.
 * RELATED: docs/contracts/states/README.md and STATE_TEMPLATE.md.
 * SECURITY:
 *   - Every declared dependency is a canonical existing repository path; metadata ambiguity fails closed.
 */
function asText(value) {
  if (value === undefined) {
    return undefined;
  }
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
    match !== null &&
    match[1].startsWith(`${match[2]}-`) &&
    directories.get(match[2]) === match[1]
  );
}

function metadataStatePaths(specPath, specSource, directories, files, errors) {
  const paths = [];
  for (const field of ["Affected states", "Approved dependencies"]) {
    const declarations = [
      ...specSource.matchAll(
        new RegExp(`^- \\*\\*${field}:\\*\\* (.+)$`, "gm"),
      ),
    ];
    const value = declarations[0]?.[1];
    if (declarations.length !== 1 || value === undefined) {
      errors.push(
        `${specPath}: expected exactly one structured ${field} declaration`,
      );
      continue;
    }
    if (value === "none") {
      continue;
    }
    const tokens = [...value.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    if (
      tokens.length === 0 ||
      tokens.map((token) => `\`${token}\``).join(", ") !== value
    ) {
      errors.push(`${specPath}: malformed structured ${field} metadata`);
      continue;
    }
    if (field === "Affected states") {
      for (const token of tokens) {
        if (!canonicalStatePath(token, directories)) {
          errors.push(
            `${specPath}: Affected states path is not canonical: ${token}`,
          );
        } else {
          paths.push(token);
        }
      }
      continue;
    }
    for (const token of tokens) {
      if (
        token.includes("\\") ||
        token.startsWith("/") ||
        token.split("/").includes("..") ||
        !/^(?:\.agents|\.harness|docs|scripts|src|tests)\//.test(token)
      ) {
        errors.push(
          `${specPath}: Approved dependencies entry is not an exact repository path: ${token}`,
        );
      } else if (token.endsWith("-state.md")) {
        if (!canonicalStatePath(token, directories)) {
          errors.push(
            `${token}: required state contract path is not canonical`,
          );
        } else {
          paths.push(token);
        }
      } else if (!files.has(token)) {
        errors.push(
          `${specPath}: Approved dependencies path does not exist: ${token}`,
        );
      }
    }
  }
  return paths;
}

function validateConcreteContracts(files, directories, errors) {
  const templatePath = "docs/contracts/states/STATE_TEMPLATE.md";
  const template = asText(files.get(templatePath));
  if (template === undefined) {
    errors.push(`${templatePath}: state contract template is missing`);
    return;
  }
  const placeholders = new Set(template.match(/\[[^\]\n]+\]/g) ?? []);
  for (const [filePath, value] of files) {
    if (
      !filePath.startsWith("docs/contracts/states/") ||
      !filePath.endsWith("-state.md")
    ) {
      continue;
    }
    if (!canonicalStatePath(filePath, directories)) {
      errors.push(`${filePath}: concrete state contract path is not canonical`);
      continue;
    }
    const source = asText(value);
    const placeholder = [...placeholders].find((token) =>
      source.includes(token),
    );
    const residue = ["SNN.N", "SNN", "sNN-", "<descriptor>"].find((token) =>
      source.includes(token),
    );
    // @ah INV-STATE-CONTRACT
    if (placeholder || residue) {
      errors.push(
        `${filePath}: unresolved state-template placeholder ${placeholder ?? residue}`,
      );
    }
    const states = [...source.matchAll(/^\*\*State:\*\* (.+)$/gm)];
    const approvals = [...source.matchAll(/^\*\*Approved:\*\* (.+)$/gm)];
    if (
      states.length !== 1 ||
      states[0]?.[1] !== "approved" ||
      approvals.length !== 1 ||
      approvals[0]?.[1] !== "true"
    ) {
      errors.push(
        `${filePath}: concrete state contract must be explicitly approved`,
      );
    }
  }
}

export function validateStateContractRoutes({ blocks, files, statesReadme }) {
  const errors = [];
  const directories = stateDirectories(statesReadme);
  if (directories.size === 0) {
    errors.push(
      "docs/contracts/states/README.md: State Index is missing or empty",
    );
  }
  const required = new Set();
  for (const sourcePath of new Set(
    blocks.map(({ fields }) => fields.Source_spec).filter(Boolean),
  )) {
    const source = asText(files.get(sourcePath));
    if (source) {
      for (const filePath of metadataStatePaths(
        sourcePath,
        source,
        directories,
        files,
        errors,
      )) {
        required.add(filePath);
      }
    }
  }
  for (const filePath of required) {
    if (!files.has(filePath)) {
      errors.push(`${filePath}: required state contract is absent`);
    }
  }
  validateConcreteContracts(files, directories, errors);
  return [...new Set(errors)].sort();
}
