export interface HarnessFixtureContext {
  seedText: string;
  contractsReadme: string;
  statesReadme: string;
  stateTemplate: string;
}

export interface HarnessSnapshotFixture {
  activeText: string;
  completedText: string;
  baseActiveText?: string;
  baseCompletedText?: string;
  baseParentActiveText?: string;
  baseParentCompletedText?: string;
  allowMergedCloseout?: boolean;
  mergedBaseRevision?: string;
  contractsReadme: string;
  statesReadme: string;
  files: Map<string, Buffer>;
}

interface TaskBlockOptions {
  tag?: string;
  title?: string;
  brick?: string;
  status?: "blocked" | "passed" | "queued" | "working";
  pass?: boolean;
  blocker?: string;
  sourceSpecId?: string;
  sourceSpec?: string;
  traceability?: string;
  objective?: string;
  artifact?: string;
}

const H1_PATH =
  "docs/contracts/harness/specs/H1-harness-transition-integrity-hardening.md";

function specSource(affectedStates = "none", approvedDependencies = "none") {
  return `# H1 Fixture

**State:** approved

**Approved:** true

## Identity and Ownership

- **Spec ID:** \`harness/H1\`
- **Affected states:** ${affectedStates}
- **Approved dependencies:** ${approvedDependencies}
`;
}

export function taskBlock({
  tag = "T-0040",
  title = "Fixture task",
  brick = "harness/H1/fixture-task",
  status = "queued",
  pass = false,
  blocker = status === "blocked" ? "fixture outage" : "none",
  sourceSpecId = "harness/H1",
  sourceSpec = H1_PATH,
  traceability = "F4",
  objective = "Prove one fixture task.",
  artifact = "none",
}: TaskBlockOptions = {}) {
  return `### [${tag}] ${title}
Type: maintenance
Bootstrap: false
Source_spec_id: ${sourceSpecId}
Source_spec: ${sourceSpec}
Brick_id: ${brick}
Traceability: ${traceability}
Priority: P0
Depends_on: none
Status: ${status}
Ready: true
Pass: ${String(pass)}
Objective:
- ${objective}
Scope:
- Validate the fixture.
Non_goals:
- Perform remote work.
Acceptance_criteria:
- The fixture has one observable result.
Indivisibility_rationale:
- none; this is one independently provable fixture seam.
Expected_surfaces:
- tests/fixtures/harness-integrity/scenarios.ts
Reference_artifacts:
- ${artifact}
Validation_sets:
- baseline
- agent-review
Open_questions:
- none
Blocker: ${blocker}
Scratchpad: .harness/work/${tag}.md`;
}

export function activeStore(blocks: string[], nextTask = 41) {
  return `# Tasks

## Control

- \`RUN_MODE\`: autonomous
- \`MERGE_MODE\`: autonomous
- \`NEXT_TASK_TAG\`: ${String(nextTask).padStart(4, "0")}
- \`NEXT_REFACTOR_TAG\`: 0001

## Active Queue

${blocks.join("\n\n")}${blocks.length > 0 ? "\n" : ""}`;
}

export function completedStore(seedText: string, blocks: string[] = []) {
  return `# Completed Tasks

## Historical Seed Provenance

- During the H1 transition, the seven historical blocks \`T-0001, T-0002, T-0003, T-0004, T-0006, T-0005, T-0007\` were seeded here verbatim in that order.
- Those tasks did not originally execute the current active-to-archive transfer procedure. Their compatibility proof is the existing tagged base-branch history plus the exact seeded blocks and this provenance; it does not imply post-H1 completion mechanics.
- The canonical seed-hash input is UTF-8 text from the first \`### [T-0001]\` heading through the terminal newline immediately after the \`T-0007\` block and before any later archive entry. Normalize CRLF to LF, with no trimming or other transformation.
- The canonical combined seed-block SHA-256 is \`2B07112D32C5401991C2224A83E7C53BB36415842C599BAB900F17135F460C1F\`.
- Tasks completed after this seed require the canonical post-H1 completion proof; seed compatibility is not reusable for later tasks.

## Completed

${seedText}${blocks.length > 0 ? `\n${blocks.join("\n\n")}\n` : ""}`;
}

function registryArtifactRows(contractsReadme: string) {
  const start = contractsReadme.indexOf("## Artifact Migration Registry");
  const end = contractsReadme.indexOf("## Templates", start);
  const source = contractsReadme.slice(start, end);
  return [
    ...source.matchAll(
      /^\| `([^`]+)` \| `([^`]+)` \| `([^`]+)` \| exact bytes \|$/gm,
    ),
  ].map(([, legacyPath, canonicalPath, state]) => ({
    legacyPath,
    canonicalPath,
    state,
  }));
}

function fixtureFiles(
  context: HarnessFixtureContext,
  activeText: string,
  completedText: string,
) {
  const files = new Map<string, Buffer>();
  files.set(".harness/tasks.md", Buffer.from(activeText));
  files.set(".harness/completed.md", Buffer.from(completedText));
  files.set("docs/contracts/README.md", Buffer.from(context.contractsReadme));
  files.set(
    "docs/contracts/states/README.md",
    Buffer.from(context.statesReadme),
  );
  files.set(
    "docs/contracts/states/STATE_TEMPLATE.md",
    Buffer.from(context.stateTemplate),
  );
  files.set(H1_PATH, Buffer.from(specSource()));
  registryArtifactRows(context.contractsReadme).forEach((route, index) => {
    const bytes = Buffer.from(`artifact-${index}`);
    files.set(route.canonicalPath, bytes);
    if (route.state === "migration-pending") {
      files.set(route.legacyPath, bytes);
    }
  });
  return files;
}

function snapshot(
  context: HarnessFixtureContext,
  activeText: string,
  completedText: string,
  baseActiveText = activeText,
  baseCompletedText = completedText,
  baseParentActiveText?: string,
  baseParentCompletedText?: string,
): HarnessSnapshotFixture {
  return {
    activeText,
    completedText,
    baseActiveText,
    baseCompletedText,
    baseParentActiveText,
    baseParentCompletedText,
    contractsReadme: context.contractsReadme,
    statesReadme: context.statesReadme,
    files: fixtureFiles(context, activeText, completedText),
  };
}

export function positiveHarnessScenarios(context: HarnessFixtureContext) {
  const seedArchive = completedStore(context.seedText);
  const queued = taskBlock();
  const working = taskBlock({ status: "working" });
  const blocked = taskBlock({ status: "blocked" });
  const passed = taskBlock({ status: "passed", pass: true });
  return {
    queued: snapshot(context, activeStore([queued]), seedArchive),
    blocked: snapshot(
      context,
      activeStore([blocked]),
      seedArchive,
      activeStore([queued]),
      seedArchive,
    ),
    candidate: snapshot(
      context,
      activeStore([working]),
      seedArchive,
      activeStore([queued]),
      seedArchive,
    ),
    seededArchive: snapshot(context, activeStore([]), seedArchive),
    provisional: snapshot(
      context,
      activeStore([]),
      completedStore(context.seedText, [passed]),
      activeStore([working]),
      seedArchive,
    ),
    reversal: snapshot(
      context,
      activeStore([working]),
      seedArchive,
      activeStore([]),
      completedStore(context.seedText, [passed]),
      activeStore([working]),
      seedArchive,
    ),
  };
}

export function copySnapshot(
  source: HarnessSnapshotFixture,
  overrides: Partial<HarnessSnapshotFixture> = {},
) {
  const activeText = overrides.activeText ?? source.activeText;
  const completedText = overrides.completedText ?? source.completedText;
  const files = new Map(overrides.files ?? source.files);
  files.set(".harness/tasks.md", Buffer.from(activeText));
  files.set(".harness/completed.md", Buffer.from(completedText));
  return {
    ...source,
    ...overrides,
    activeText,
    completedText,
    files,
  };
}

export function setFixtureSpec(
  snapshot: HarnessSnapshotFixture,
  affectedStates: string,
) {
  const files = new Map(snapshot.files);
  files.set(H1_PATH, Buffer.from(specSource(affectedStates)));
  return copySnapshot(snapshot, { files });
}

export { H1_PATH };
