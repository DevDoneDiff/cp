/**
 * ROLE: Orchestrate deterministic network-free validation of current implementation-task and product-authority harness state.
 * BOUNDARY: The adapter reads local files and Git generations only; remote claims, CI, and merge truth remain procedural.
 * RELATIONS: harness-task-transitions.mjs owns task lifecycle meaning; harness-state-contracts.mjs owns active product routes.
 * VALIDATION: tests/unit/harness-integrity.test.ts exercises injected snapshots and the materialized repository.
 */
import { spawnSync } from "node:child_process";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { validateStateContractRoutes } from "./harness-state-contracts.mjs";
import { validateHarnessStores } from "./harness-task-transitions.mjs";

function normalize(source) {
  return source?.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

export function configuredBaseBranch(validationText) {
  const values = [
    ...normalize(validationText).matchAll(/^BASE_BRANCH:\s*(\S+)$/gm),
  ].map((match) => match[1]);
  return values.length === 1 && values[0] === "main"
    ? { baseBranch: "main", errors: [] }
    : {
        errors: [
          ".harness/validation.md: BASE_BRANCH must resolve uniquely to main",
        ],
      };
}

export function validateRepositoryPath(filePath) {
  return (
    !!filePath &&
    !filePath.includes("\\") &&
    !/^[A-Za-z]:/.test(filePath) &&
    !path.posix.isAbsolute(filePath) &&
    !filePath
      .split("/")
      .some((part) => !part || part === "." || part === "..") &&
    path.posix.normalize(filePath) === filePath
  );
}

function gitResult(root, args) {
  return spawnSync("git", args, { cwd: root, encoding: "utf8", shell: false });
}

function git(root, args) {
  const result = gitResult(root, args);
  if (result.status !== 0)
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  return result.stdout;
}

function tryGit(root, args) {
  const result = gitResult(root, args);
  return result.status === 0 ? result.stdout : undefined;
}

async function currentFiles(root) {
  const listed = git(root, [
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
  for (const filePath of listed) {
    if (!validateRepositoryPath(filePath)) {
      adapterErrors.push(
        `repository path is not canonical: ${JSON.stringify(filePath)}`,
      );
      continue;
    }
    const absolute = path.resolve(resolvedRoot, ...filePath.split("/"));
    try {
      const status = await lstat(absolute);
      if (status.isSymbolicLink() || !status.isFile()) {
        adapterErrors.push(
          `${filePath}: harness validation accepts regular nonsymlink files only`,
        );
        continue;
      }
      files.set(filePath, await readFile(absolute));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return { files, adapterErrors };
}

function requiredText(files, filePath) {
  const value = files.get(filePath);
  if (value === undefined)
    throw new Error(`Required harness file is missing: ${filePath}`);
  return Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
}

export function selectTaskStoreBase({
  currentActiveText,
  currentCompletedText,
  headActiveText,
  headCompletedText,
  parentActiveText,
  parentCompletedText,
  grandparentActiveText,
  grandparentCompletedText,
}) {
  if (headActiveText === undefined || headCompletedText === undefined)
    return {};
  const committed =
    normalize(currentActiveText) === normalize(headActiveText) &&
    normalize(currentCompletedText) === normalize(headCompletedText);
  if (!committed) {
    return {
      baseActiveText: headActiveText,
      baseCompletedText: headCompletedText,
      baseParentActiveText: parentActiveText,
      baseParentCompletedText: parentCompletedText,
    };
  }
  if (parentActiveText === undefined || parentCompletedText === undefined)
    return {};
  return {
    baseActiveText: parentActiveText,
    baseCompletedText: parentCompletedText,
    baseParentActiveText: grandparentActiveText,
    baseParentCompletedText: grandparentCompletedText,
  };
}

export async function readHarnessRepository(root) {
  const { files, adapterErrors } = await currentFiles(root);
  const activeText = requiredText(files, ".harness/tasks.md");
  const completedText = requiredText(files, ".harness/completed.md");
  const validationText = requiredText(files, ".harness/validation.md");
  const configuration = configuredBaseBranch(validationText);
  adapterErrors.push(...configuration.errors);
  const selected = selectTaskStoreBase({
    currentActiveText: activeText,
    currentCompletedText: completedText,
    headActiveText: tryGit(root, ["show", "HEAD:.harness/tasks.md"]),
    headCompletedText: tryGit(root, ["show", "HEAD:.harness/completed.md"]),
    parentActiveText: tryGit(root, ["show", "HEAD^:.harness/tasks.md"]),
    parentCompletedText: tryGit(root, ["show", "HEAD^:.harness/completed.md"]),
    grandparentActiveText: tryGit(root, ["show", "HEAD^^:.harness/tasks.md"]),
    grandparentCompletedText: tryGit(root, [
      "show",
      "HEAD^^:.harness/completed.md",
    ]),
  });
  return {
    activeText,
    completedText,
    validationText,
    ...selected,
    allowMergedCloseout:
      git(root, ["branch", "--show-current"]).trim() ===
      configuration.baseBranch,
    adapterErrors,
    statesReadme: requiredText(files, "docs/contracts/states/README.md"),
    files,
  };
}

export function validateHarnessSnapshot(snapshot) {
  const stores = validateHarnessStores(snapshot);
  const errors = [...(snapshot.adapterErrors ?? []), ...stores.errors];
  errors.push(
    ...validateStateContractRoutes({
      blocks: stores.active.blocks,
      statesReadme: snapshot.statesReadme,
      files: snapshot.files,
    }),
  );
  return [...new Set(errors)].sort();
}

export async function validateHarnessRepository(root) {
  return validateHarnessSnapshot(await readHarnessRepository(root));
}

async function runCli() {
  const errors = await validateHarnessRepository(process.cwd());
  if (errors.length) {
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
