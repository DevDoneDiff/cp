/**
 * MODULE: scripts/validation/harness-integrity.mjs
 * PURPOSE: Orchestrate deterministic network-free harness integrity validation for the local repository.
 * PUBLIC API / ENTRYPOINTS:
 *   - readHarnessRepository: safely reads current files and the exact local Git transition base.
 *   - selectTaskStoreBase: selects HEAD or its parent based on committed versus dirty task-store state.
 *   - validateHarnessSnapshot: validates an injected repository snapshot for focused fixtures.
 *   - validateHarnessRepository: validates one materialized local repository.
 * CONTROL_FLOW:
 *   1. Read canonical non-symlink repository paths and revision-bound local Git task-store generations.
 *   2. Validate task/archive structure and exact local transition shape.
 *   3. Validate exact spec, artifact, and state-contract routes.
 * INVARIANTS:
 *   - [INV-HARNESS-NETWORK-FREE] Discovery uses only local filesystem reads and read-only Git commands.
 *   - [INV-HARNESS-DIAGNOSTICS] Identical snapshots produce identical sorted diagnostics.
 * BOUNDARIES:
 *   - Live GitHub claims, completion, CI, and merge proof remain procedures in .harness/validation.md.
 * RELATED:
 *   - scripts/validation/harness-task-transitions.mjs: owns task/archive structural comparison.
 *   - scripts/validation/harness-contract-routes.mjs: owns current and legacy spec routing.
 *   - scripts/validation/harness-artifact-routes.mjs: owns artifact and concrete state-contract routes.
 * SECURITY:
 *   - The validator rejects noncanonical and symlink paths and performs no network request or external mutation.
 */
import { spawnSync } from "node:child_process";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { validateArtifactRoutes } from "./harness-artifact-routes.mjs";
import { validateSpecRoutes } from "./harness-contract-routes.mjs";
import { validateStateContractRoutes } from "./harness-state-contracts.mjs";
import { SEED_TAGS } from "./harness-task-stores.mjs";
import { validateHarnessStores } from "./harness-task-transitions.mjs";

const EXPECTED_BASE_BRANCH = "main";

function normalizeText(source) {
  return source.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

export function configuredBaseBranch(validationText) {
  const declarations = [
    ...normalizeText(validationText).matchAll(/^BASE_BRANCH: (.+)$/gm),
  ];
  if (
    declarations.length !== 1 ||
    declarations[0]?.[1] !== EXPECTED_BASE_BRANCH
  ) {
    return {
      errors: [
        `.harness/validation.md: BASE_BRANCH must be declared exactly once as ${EXPECTED_BASE_BRANCH}`,
      ],
    };
  }
  return { baseBranch: EXPECTED_BASE_BRANCH, errors: [] };
}

export function validateRepositoryPath(filePath) {
  return (
    filePath.length > 0 &&
    !filePath.includes("\\") &&
    !/^[A-Za-z]:/.test(filePath) &&
    !path.posix.isAbsolute(filePath) &&
    !filePath
      .split("/")
      .some((part) => part === "" || part === "." || part === "..") &&
    path.posix.normalize(filePath) === filePath
  );
}

function runGitResult(root, args) {
  // @ah INV-HARNESS-NETWORK-FREE
  return spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    shell: false,
  });
}

function runGit(root, args) {
  const result = runGitResult(root, args);
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

function tryGit(root, args) {
  const result = runGitResult(root, args);
  return result.status === 0 ? result.stdout : undefined;
}

async function readCurrentFiles(root) {
  const listed = runGit(root, [
    "ls-files",
    "-z",
    "--cached",
    "--others",
    "--exclude-standard",
  ])
    .split("\0")
    .filter(Boolean)
    .sort();
  const files = new Map();
  const adapterErrors = [];
  const resolvedRoot = await realpath(root);
  const checkedDirectories = new Set([resolvedRoot]);
  for (const filePath of listed) {
    if (!validateRepositoryPath(filePath)) {
      adapterErrors.push(
        `repository path is not canonical: ${JSON.stringify(filePath)}`,
      );
      continue;
    }
    const absolute = path.resolve(resolvedRoot, ...filePath.split("/"));
    if (!absolute.startsWith(`${resolvedRoot}${path.sep}`)) {
      adapterErrors.push(`repository path escapes the root: ${filePath}`);
      continue;
    }
    try {
      let parent = resolvedRoot;
      for (const component of filePath.split("/").slice(0, -1)) {
        parent = path.join(parent, component);
        if (checkedDirectories.has(parent)) {
          continue;
        }
        const parentStatus = await lstat(parent);
        if (parentStatus.isSymbolicLink()) {
          adapterErrors.push(
            `${filePath}: symbolic-link directory components are not accepted by harness validation`,
          );
          parent = "";
          break;
        }
        checkedDirectories.add(parent);
      }
      if (!parent) {
        continue;
      }
      const status = await lstat(absolute);
      if (status.isSymbolicLink()) {
        adapterErrors.push(
          `${filePath}: symbolic links are not accepted by harness validation`,
        );
        continue;
      }
      if (!status.isFile()) {
        adapterErrors.push(
          `${filePath}: repository entry is not a regular file`,
        );
        continue;
      }
      files.set(filePath, await readFile(absolute));
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }
  return { files, adapterErrors };
}

function toText(value, filePath) {
  if (value === undefined) {
    throw new Error(`Required harness file is missing: ${filePath}`);
  }
  return Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
}

function containsPostSeed(completedText) {
  const tags = [
    ...normalizeText(completedText).matchAll(/^### \[([TR]-\d{4})\]/gm),
  ].map((match) => match[1]);
  return tags.some((tag) => !SEED_TAGS.includes(tag));
}

/**
 * @param {{
 *   currentActiveText: string,
 *   currentCompletedText: string,
 *   headActiveText: string,
 *   headCompletedText: string,
 *   parentActiveText?: string,
 *   parentCompletedText?: string,
 *   grandparentActiveText?: string,
 *   grandparentCompletedText?: string,
 *   headRevision?: string,
 *   parentRevision?: string,
 *   grandparentRevision?: string,
 * }} generations
 */
export function selectTaskStoreBase({
  currentActiveText,
  currentCompletedText,
  headActiveText,
  headCompletedText,
  parentActiveText,
  parentCompletedText,
  grandparentActiveText,
  grandparentCompletedText,
  headRevision,
  parentRevision,
  grandparentRevision,
}) {
  const committed =
    normalizeText(currentActiveText) === normalizeText(headActiveText) &&
    normalizeText(currentCompletedText) === normalizeText(headCompletedText);
  if (!committed) {
    return {
      baseActiveText: headActiveText,
      baseCompletedText: headCompletedText,
      baseRevision: headRevision,
      baseParentActiveText: parentActiveText,
      baseParentCompletedText: parentCompletedText,
      baseParentRevision: parentRevision,
      adapterErrors: [],
    };
  }
  if (parentActiveText === undefined || parentCompletedText === undefined) {
    return {
      adapterErrors: containsPostSeed(currentCompletedText)
        ? [
            "local Git history lacks the parent task stores required to prove the committed transition",
          ]
        : [],
    };
  }
  return {
    baseActiveText: parentActiveText,
    baseCompletedText: parentCompletedText,
    baseRevision: parentRevision,
    baseParentActiveText: grandparentActiveText,
    baseParentCompletedText: grandparentCompletedText,
    baseParentRevision: grandparentRevision,
    adapterErrors: [],
  };
}

export async function readHarnessRepository(root) {
  const { files, adapterErrors } = await readCurrentFiles(root);
  const activeText = toText(
    files.get(".harness/tasks.md"),
    ".harness/tasks.md",
  );
  const completedText = toText(
    files.get(".harness/completed.md"),
    ".harness/completed.md",
  );
  const validationText = toText(
    files.get(".harness/validation.md"),
    ".harness/validation.md",
  );
  const baseConfiguration = configuredBaseBranch(validationText);
  adapterErrors.push(...baseConfiguration.errors);
  const currentBranch = runGit(root, ["branch", "--show-current"]).trim();
  const allowMergedCloseout =
    currentBranch === baseConfiguration.baseBranch &&
    baseConfiguration.errors.length === 0;
  const headActiveText = runGit(root, ["show", "HEAD:.harness/tasks.md"]);
  const headRevision = runGit(root, ["rev-parse", "HEAD"]).trim();
  const parentRevision = tryGit(root, ["rev-parse", "HEAD^"])?.trim();
  const grandparentRevision = tryGit(root, ["rev-parse", "HEAD^^"])?.trim();
  const headCompletedText = runGit(root, [
    "show",
    "HEAD:.harness/completed.md",
  ]);
  const selected = selectTaskStoreBase({
    currentActiveText: activeText,
    currentCompletedText: completedText,
    headActiveText,
    headCompletedText,
    parentActiveText: tryGit(root, ["show", "HEAD^:.harness/tasks.md"]),
    parentCompletedText: tryGit(root, ["show", "HEAD^:.harness/completed.md"]),
    grandparentActiveText: tryGit(root, ["show", "HEAD^^:.harness/tasks.md"]),
    grandparentCompletedText: tryGit(root, [
      "show",
      "HEAD^^:.harness/completed.md",
    ]),
    headRevision,
    parentRevision,
    grandparentRevision,
  });
  return {
    activeText,
    completedText,
    ...selected,
    allowMergedCloseout,
    mergedBaseRevision: allowMergedCloseout ? selected.baseRevision : undefined,
    adapterErrors: [...adapterErrors, ...selected.adapterErrors],
    contractsReadme: toText(
      files.get("docs/contracts/README.md"),
      "docs/contracts/README.md",
    ),
    statesReadme: toText(
      files.get("docs/contracts/states/README.md"),
      "docs/contracts/states/README.md",
    ),
    files,
  };
}

function liveTextFiles(files) {
  return new Map(
    [...files].map(([filePath, value]) => [
      filePath,
      Buffer.isBuffer(value) ? value.toString("utf8") : String(value),
    ]),
  );
}

export function validateHarnessSnapshot(snapshot) {
  const storeResult = validateHarnessStores(snapshot);
  const textFiles = liveTextFiles(snapshot.files);
  const errors = [...(snapshot.adapterErrors ?? []), ...storeResult.errors];
  errors.push(
    ...validateSpecRoutes({
      active: storeResult.active,
      completed: storeResult.completed,
      contractsReadme: snapshot.contractsReadme,
      statesReadme: snapshot.statesReadme,
      files: snapshot.files,
      liveTextFiles: textFiles,
    }),
  );
  errors.push(
    ...validateArtifactRoutes({
      active: storeResult.active,
      completed: storeResult.completed,
      contractsReadme: snapshot.contractsReadme,
      files: snapshot.files,
      liveTextFiles: textFiles,
    }),
  );
  errors.push(
    ...validateStateContractRoutes({
      blocks: [...storeResult.active.blocks, ...storeResult.completed.blocks],
      statesReadme: snapshot.statesReadme,
      files: snapshot.files,
    }),
  );
  // @ah INV-HARNESS-DIAGNOSTICS
  return [...new Set(errors)].sort();
}

export async function validateHarnessRepository(root) {
  return validateHarnessSnapshot(await readHarnessRepository(root));
}

async function runCli() {
  const errors = await validateHarnessRepository(process.cwd());
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log("Harness integrity validation passed.");
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  await runCli();
}
