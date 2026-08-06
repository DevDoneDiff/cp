# Contracts

This directory contains durable state contracts, implementation specs, and their supporting visual or technical authorities.

## Folder Ownership

```text
docs/
  REPOSITORY_POLICY.md

  contracts/
    README.md
    SPEC_TEMPLATE.md

    harness/
      specs/

    repository/
      specs/

    states/
      README.md
      STATE_TEMPLATE.md

      sNN-kebab-case-state-name/
        sNN-state.md
        visual-<descriptor>.png
        technical-<descriptor>.png
        specs/
```

Use these locations:

- customer-visible state material belongs in `states/sNN-kebab-case-state-name/`;
- state implementation specs belong in the owning state's `specs/` directory;
- harness implementation specs belong in `harness/specs/`;
- repository implementation specs belong in `repository/specs/`;
- repository policy belongs at `docs/REPOSITORY_POLICY.md`.

Do not create loose specs outside the owning directory.

## Spec Classification and Owning Authority

Every spec has exactly one owner.

Classify a spec by its primary accepted outcome:

- `state`: accepted through customer-visible state behavior or completion; `Owning authority` is the exact repository-relative `docs/contracts/states/sNN-kebab-case-state-name/sNN-state.md` path;
- `harness`: accepted through Codex authoring, queue, validation, review, delivery, or lifecycle behavior; `Owning authority` is `AGENTS.md`;
- `repository`: accepted through repository or hosting configuration that remains meaningful independently of the Codex harness; `Owning authority` is `docs/REPOSITORY_POLICY.md`.

A supporting change follows the outcome it enables. If two outcomes remain independently acceptable, they require separate specs.

## Stable Spec Identity and Filenames

Every spec declares a stable owner-scoped `Spec ID` that does not change when its file moves. `Sequence` is unique within its owner namespace, is never reused, and determines the identity:

| Owner type | Stable spec ID | Canonical directory |
|---|---|---|
| `state` | `state/sNN/<SEQUENCE>` | `docs/contracts/states/sNN-kebab-case-state-name/specs/` |
| `harness` | `harness/<SEQUENCE>` | `docs/contracts/harness/specs/` |
| `repository` | `repository/<SEQUENCE>` | `docs/contracts/repository/specs/` |

Within the canonical owner directory, the filename is `<SEQUENCE>-<kebab-case-outcome>.md`. The sequence segment must exactly match the final segment of `Spec ID`; the descriptive slug does not participate in identity. Physical path is current routing, never identity.

Forward task entries retain both `Source_spec_id` and the exact current repository-relative `Source_spec` path. Templates define structure only; authoring, approval, decomposition, and queue mutation remain with their explicit workflow owners.

## Bounded Lineage

- `Amends` identifies the stable spec ID whose stated outcome is changed in a bounded way.
- `Supersedes` identifies the stable spec ID whose forward authority is replaced.
- `none` means the spec has no relationship of that kind.

Lineage applies only to the named prior spec. It cannot replace unrelated durable authority, erase historical evidence, or change identity.

## Terminal-State Routing

A state spec may affect multiple states only when one collective outcome becomes complete across their seam. In that case:

- the terminal state whose completion makes the outcome whole is the single owner;
- the spec is stored under that state's `specs/` directory;
- every affected state contract is listed in the spec;
- durable cross-state technical truth remains in `docs/ARCHITECTURE.md`;
- independently complete state outcomes require separate specs.

Do not create a generic shared-state or cross-state spec category.

This section is the sole full owner of terminal-state routing. Other contract documents point here and state only their local consequence.

## Artifact Ownership

- `sNN-state.md` owns durable state-specific behavior.
- `visual-*.png` owns approved user-facing composition and visible substates.
- `technical-*.png` owns its approved process depiction within governing prose.
- `specs/*.md` owns one approved collective implementation outcome.

A technical infographic cannot independently introduce product behavior, architecture, services, or state absent from governing prose.

## Artifact References

The active artifact type vocabulary is exactly `visual`, `technical`, or `none`. `content` has no active route.

- Every artifact reference is an exact repository-relative path or `none`.
- State artifacts use `docs/contracts/states/sNN-kebab-case-state-name/visual-<descriptor>.png` or `docs/contracts/states/sNN-kebab-case-state-name/technical-<descriptor>.png`.
- A folder, neighboring file, bare filename, or inferred convention never grants authority.

## Templates

- `SPEC_TEMPLATE.md` is the shared structure for state, harness, and repository specs.
- `states/STATE_TEMPLATE.md` is the shared structure for customer-visible state contracts.

Templates define stable structure and ownership fields. Authoring workflow, approval handling, and task decomposition are owned by the explicit authoring skills.

## Authority Boundary

Contracts and specs may narrow upstream behavior within their ownership boundary.

They may not silently contradict:

- `docs/PRODUCT.md`;
- `docs/ARCHITECTURE.md`;
- `docs/DESIGN.md`;
- `docs/MVP.md`;
- `docs/REPOSITORY_POLICY.md`;
- an affected state contract.

State package conventions are defined in `docs/contracts/states/README.md`.
