/**
 * MODULE: scripts/validation/repository-security.mjs
 * PURPOSE: Prove exact dependencies, secure resolutions, machine pins, workflow hardening, secret hygiene, and documented delivery safeguards.
 * PUBLIC API / ENTRYPOINTS:
 *   - readSecuritySnapshot: reads the repository surfaces governed by the foundation security contract.
 *   - validateSecuritySnapshot: applies deterministic positive and negative policy checks.
 *   - CLI: validates repository policy and audits the production graph at moderate severity or above.
 * CONTROL_FLOW:
 *   1. Read the manifest, machine pins, lockfile, workflow, environment example, policy, and non-ignored file list.
 *   2. Compare direct dependencies and tooling with the exact approved allowlist.
 *   3. Enforce workflow immutability, least privilege, deterministic CI, and repository hygiene.
 *   4. Query the package advisory registry and fail on any moderate, high, or critical production finding.
 * INVARIANTS:
 *   - Every direct package and machine runtime uses one exact approved version.
 *   - Next.js resolves patched PostCSS and Sharp versions without changing its approved direct pin.
 *   - CI uses immutable actions, frozen installs, no secrets, and only contents read permission.
 * RELATED:
 *   - package.json: owns exact direct dependencies and cross-platform scripts.
 *   - .github/workflows/ci.yml: owns remote foundation proof.
 *   - docs/REPOSITORY_POLICY.md: records remote protection and guarded-delivery requirements.
 * SECURITY:
 *   - Product/provider SDKs, vulnerable production packages, untrusted actions, local environment files, and likely secret-bearing files fail closed.
 */
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const EXPECTED_DEPENDENCIES = {
  next: "16.2.12",
  react: "19.2.8",
  "react-dom": "19.2.8",
};

export const EXPECTED_DEV_DEPENDENCIES = {
  "@playwright/test": "1.62.1",
  "@testing-library/dom": "10.4.1",
  "@testing-library/jest-dom": "6.9.1",
  "@testing-library/react": "16.3.2",
  "@testing-library/user-event": "14.6.1",
  "@types/node": "24.13.3",
  "@types/react": "19.2.18",
  "@types/react-dom": "19.2.4",
  "@vitest/coverage-v8": "4.1.10",
  eslint: "10.8.0",
  "eslint-config-next": "16.2.12",
  jsdom: "29.1.1",
  prettier: "3.9.6",
  typescript: "6.0.3",
  vitest: "4.1.10",
};

const REQUIRED_SCRIPTS = [
  "build",
  "format:check",
  "lint",
  "typecheck",
  "test:unit",
  "test:integration",
  "test:component",
  "test:coverage",
  "test:smoke",
  "test:e2e",
  "validate:annotations",
  "validate:security",
  "validate",
];
const POLICY_PHRASES = [
  "visibility: public",
  "private: false",
  "CI / baseline",
  "CI / browser-smoke",
  "zero human approvals",
  "resolved review conversations",
  "linear history",
  "no force push",
  "no administrator bypass",
  "--match-head-commit",
  "--squash",
  "--delete-branch",
  "task tag",
];
const EXPECTED_ACTION_LINES = new Map([
  [
    "uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1",
    2,
  ],
  [
    "uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0",
    2,
  ],
]);

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

function listRepositoryFiles(root) {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    throw new Error(
      `Unable to inspect repository files: ${result.stderr.trim()}`,
    );
  }
  return result.stdout.split(/\r?\n/).map(normalizePath).filter(Boolean);
}

async function readText(root, relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

export async function readSecuritySnapshot(root) {
  return {
    manifest: JSON.parse(await readText(root, "package.json")),
    nodeVersion: (await readText(root, ".node-version")).trim(),
    nvmVersion: (await readText(root, ".nvmrc")).trim(),
    pnpmWorkspace: await readText(root, "pnpm-workspace.yaml"),
    lockfile: await readText(root, "pnpm-lock.yaml"),
    workflow: await readText(root, ".github/workflows/ci.yml"),
    envExample: await readText(root, ".env.example"),
    repositoryPolicy: await readText(root, "docs/REPOSITORY_POLICY.md"),
    repositoryFiles: listRepositoryFiles(root),
  };
}

function compareExactMap(actual, expected, label, errors) {
  const actualEntries = Object.entries(actual ?? {}).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  const expectedEntries = Object.entries(expected).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  if (JSON.stringify(actualEntries) !== JSON.stringify(expectedEntries)) {
    errors.push(`${label} must equal the exact approved allowlist`);
  }
}

function validateManifest(snapshot, errors) {
  const { manifest } = snapshot;
  if (manifest.private !== true) {
    errors.push("package.json private must be true");
  }
  if (manifest.packageManager !== "pnpm@11.18.0") {
    errors.push("packageManager must be pnpm@11.18.0");
  }
  if (
    manifest.engines?.node !== "24.19.0" ||
    manifest.engines?.pnpm !== "11.18.0"
  ) {
    errors.push("engines must pin Node 24.19.0 and pnpm 11.18.0 exactly");
  }
  compareExactMap(
    manifest.dependencies,
    EXPECTED_DEPENDENCIES,
    "dependencies",
    errors,
  );
  compareExactMap(
    manifest.devDependencies,
    EXPECTED_DEV_DEPENDENCIES,
    "devDependencies",
    errors,
  );

  for (const script of REQUIRED_SCRIPTS) {
    if (
      typeof manifest.scripts?.[script] !== "string" ||
      manifest.scripts[script].trim() === ""
    ) {
      errors.push(`required package script ${script} is missing`);
    }
  }

  const shellSpecificPattern =
    /(?:&&|\|\||[|;]|\b(?:bash|pwsh|powershell|cmd(?:\.exe)?)\b)/i;
  for (const [name, command] of Object.entries(manifest.scripts ?? {})) {
    if (shellSpecificPattern.test(command)) {
      errors.push(`package script ${name} contains shell-specific composition`);
    }
    if (
      /passWithNoTests|--passWithNoTests|--pass-with-no-tests/i.test(command)
    ) {
      errors.push(`package script ${name} weakens missing-test behavior`);
    }
  }
}

function validateMachinePins(snapshot, errors) {
  if (snapshot.nodeVersion !== "24.19.0" || snapshot.nvmVersion !== "24.19.0") {
    errors.push(".node-version and .nvmrc must both equal 24.19.0");
  }
  const expectedBuildPolicy = [
    "overrides:",
    '  "next@16.2.12>postcss": 8.5.23',
    '  "next@16.2.12>sharp": 0.35.3',
    "allowBuilds:",
    "  sharp@0.35.3: true",
    "  unrs-resolver@1.12.2: true",
  ].join("\n");
  if (
    snapshot.pnpmWorkspace.replaceAll("\r\n", "\n").trim() !==
    expectedBuildPolicy
  ) {
    errors.push(
      "pnpm workspace must apply the exact security overrides and build-script allowlist",
    );
  }
  if (!/lockfileVersion:\s*['"]?9\.0['"]?/.test(snapshot.lockfile)) {
    errors.push("pnpm-lock.yaml must use lockfile version 9.0");
  }
  if (/(?:^|[/\s])typescript@7(?:[.\s:/]|$)/m.test(snapshot.lockfile)) {
    errors.push("TypeScript 7 must not enter pnpm-lock.yaml");
  }
  if (
    !/(?:^|\s)postcss@8\.5\.23:/.test(snapshot.lockfile) ||
    !/(?:^|\s)sharp@0\.35\.3:/.test(snapshot.lockfile) ||
    /(?:^|\s)(?:postcss@8\.4\.31|sharp@0\.34\.5):/.test(snapshot.lockfile)
  ) {
    errors.push(
      "pnpm-lock.yaml must resolve patched PostCSS 8.5.23 and Sharp 0.35.3 without vulnerable predecessors",
    );
  }
  const alternativeLocks = snapshot.repositoryFiles.filter((file) =>
    /(?:^|\/)(?:package-lock\.json|yarn\.lock|bun\.lockb?|npm-shrinkwrap\.json)$/.test(
      file,
    ),
  );
  if (alternativeLocks.length > 0) {
    errors.push(
      `alternative lockfiles are forbidden: ${alternativeLocks.join(", ")}`,
    );
  }
}

function validateWorkflow(snapshot, errors) {
  const workflow = snapshot.workflow;
  const permissionsMatches = workflow.match(/^permissions:/gm) ?? [];
  const permissionsDeclarations = workflow.match(/^\s*permissions\s*:/gm) ?? [];
  const permissionsBlock = workflow
    .match(/^permissions:\r?\n((?: {2}.+(?:\r?\n|$))+)/m)?.[1]
    ?.trim();
  if (
    permissionsMatches.length !== 1 ||
    permissionsDeclarations.length !== 1 ||
    permissionsBlock !== "contents: read"
  ) {
    errors.push(
      "workflow permissions must contain only contents: read at top level with no job-level override",
    );
  }
  if (/\$\{\{\s*secrets\./.test(workflow)) {
    errors.push("foundation workflow must not reference secrets");
  }
  if (
    !/^\s*pull_request:\s*$/m.test(workflow) ||
    !/^\s*push:\s*$/m.test(workflow)
  ) {
    errors.push("workflow must run on pull requests and pushes");
  }
  const mainBranchEntries = workflow.match(/^\s+- main\s*$/gm) ?? [];
  if (mainBranchEntries.length < 2) {
    errors.push(
      "workflow pull-request and push triggers must both target main",
    );
  }
  if (
    !workflow.includes(
      "group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}",
    ) ||
    !workflow.includes("cancel-in-progress: true")
  ) {
    errors.push(
      "workflow concurrency must be deterministic and cancel superseded commits",
    );
  }
  if ((workflow.match(/runs-on:\s*ubuntu-24\.04/g) ?? []).length !== 2) {
    errors.push("both CI jobs must use ubuntu-24.04");
  }
  for (const checkName of ["CI / baseline", "CI / browser-smoke"]) {
    if (!workflow.includes(`name: ${checkName}`)) {
      errors.push(`workflow is missing exact check name ${checkName}`);
    }
  }
  if (
    (workflow.match(/run:\s*pnpm install --frozen-lockfile/g) ?? []).length !==
    2
  ) {
    errors.push("both CI jobs must install with pnpm --frozen-lockfile");
  }
  if (
    (workflow.match(/^\s+corepack enable pnpm\s*$/gm) ?? []).length !== 2 ||
    (workflow.match(/^\s+corepack install --global pnpm@11\.18\.0\s*$/gm) ?? [])
      .length !== 2
  ) {
    errors.push(
      "both CI jobs must enable the pnpm shim and install exact pnpm 11.18.0",
    );
  }

  const usesLines = workflow
    .split(/\r?\n/)
    .filter((line) => /^(?:-\s*)?uses:/.test(line.trimStart()));
  for (const line of usesLines) {
    if (
      !/(?:-\s*)?uses:\s*[^@\s]+@[0-9a-f]{40}\s+#\s+v\d+(?:\.\d+){1,2}\s*$/.test(
        line,
      )
    ) {
      errors.push(
        `remote action is not pinned by full SHA with release comment: ${line.trim()}`,
      );
    }
  }
  if (usesLines.length === 0) {
    errors.push("workflow must use pinned checkout and setup actions");
  }
  const normalizedUsesLines = usesLines.map((line) =>
    line.trim().replace(/^-\s*/, ""),
  );
  const actionMappingIsExact =
    normalizedUsesLines.length === 4 &&
    [...EXPECTED_ACTION_LINES].every(
      ([expectedLine, expectedCount]) =>
        normalizedUsesLines.filter((line) => line === expectedLine).length ===
        expectedCount,
    );
  if (!actionMappingIsExact) {
    errors.push(
      "workflow actions must equal the exact approved identities, commit SHAs, releases, and occurrence counts",
    );
  }
  if (
    (workflow.match(/^\s+persist-credentials:\s*false\s*$/gm) ?? []).length !==
    2
  ) {
    errors.push("both checkout steps must disable persisted credentials");
  }

  const browserJob = workflow.split(/^  browser-smoke:\s*$/m)[1] ?? "";
  const smokeIndex = browserJob.indexOf("run: pnpm test:smoke");
  const e2eIndex = browserJob.indexOf("run: pnpm test:e2e");
  if (smokeIndex < 0 || e2eIndex < 0 || smokeIndex >= e2eIndex) {
    errors.push("browser-smoke must invoke production smoke before Playwright");
  }
  if (/run:\s*pnpm build/.test(browserJob)) {
    errors.push("browser-smoke must not perform a second production build");
  }
}

function validateRepositoryHygiene(snapshot, errors) {
  const environmentFiles = snapshot.repositoryFiles.filter(
    (file) =>
      /(?:^|\/)\.env(?:\.|$)/.test(file) &&
      !/(?:^|\/)\.env(?:\..+)?\.example$/.test(file) &&
      !file.endsWith(".env.example"),
  );
  if (environmentFiles.length > 0) {
    errors.push(
      `local environment files are forbidden: ${environmentFiles.join(", ")}`,
    );
  }

  const secretBearingFiles = snapshot.repositoryFiles.filter((file) =>
    /(?:^|\/)(?:secrets?|credentials?)(?:\.|\/|$)|\.(?:pem|key|p12|pfx)$/i.test(
      file,
    ),
  );
  if (secretBearingFiles.length > 0) {
    errors.push(
      `likely secret-bearing files are forbidden: ${secretBearingFiles.join(", ")}`,
    );
  }

  const envLines = snapshot.envExample
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");
  if (
    envLines.length === 0 ||
    envLines.some((line) => !line.trimStart().startsWith("#"))
  ) {
    errors.push(
      ".env.example must remain nonempty and comment-only during foundation",
    );
  }

  const normalizedPolicy = snapshot.repositoryPolicy.toLowerCase();
  for (const phrase of POLICY_PHRASES) {
    if (!normalizedPolicy.includes(phrase.toLowerCase())) {
      errors.push(`repository policy is missing required contract: ${phrase}`);
    }
  }
}

export function validateSecuritySnapshot(snapshot) {
  const errors = [];
  validateManifest(snapshot, errors);
  validateMachinePins(snapshot, errors);
  validateWorkflow(snapshot, errors);
  validateRepositoryHygiene(snapshot, errors);
  return errors;
}

export async function validateRepositorySecurity(root) {
  return validateSecuritySnapshot(await readSecuritySnapshot(root));
}

async function runCli() {
  const errors = await validateRepositorySecurity(process.cwd());
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
    return;
  }
  const packageManagerEntrypoint = process.env.npm_execpath;
  if (!packageManagerEntrypoint) {
    console.error("Security validation must be started through pnpm.");
    process.exitCode = 1;
    return;
  }

  const audit = spawnSync(
    process.execPath,
    [packageManagerEntrypoint, "audit", "--prod", "--audit-level=moderate"],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    },
  );
  if (audit.error) {
    throw audit.error;
  }
  if (audit.status !== 0) {
    process.exitCode = audit.status ?? 1;
    return;
  }

  console.log("Repository security policy and production audit passed.");
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  await runCli();
}
