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

## One-Owner Rule

Every spec has exactly one owner.

A state spec may affect multiple states when one collective outcome is only complete across their seam. In that case:

- the terminal state whose completion makes the outcome whole is the single owner;
- the spec is stored under that state's `specs/` directory;
- every affected state contract is listed in the spec;
- durable cross-state technical truth remains in `ARCHITECTURE.md`;
- independently complete state outcomes require separate specs.

Do not create a generic shared-state or cross-state spec category.

## Artifact Ownership

- `sNN-state.md` owns durable state-specific behavior.
- `visual-*.png` owns approved user-facing composition and visible substates.
- `technical-*.png` owns its approved process depiction within governing prose.
- `specs/*.md` owns one approved collective implementation outcome.

A technical infographic cannot independently introduce product behavior, architecture, services, or state absent from governing prose.

## Templates

- `SPEC_TEMPLATE.md` is the shared structure for state, harness, and repository specs.
- `states/STATE_TEMPLATE.md` is the shared structure for customer-visible state contracts.

Templates define stable structure and ownership fields. Authoring workflow, approval handling, and task decomposition are owned by the explicit authoring skills.

## Authority Boundary

Contracts and specs may narrow upstream behavior within their ownership boundary.

They may not silently contradict:

- `PRODUCT.md`;
- `ARCHITECTURE.md`;
- `DESIGN.md`;
- `MVP.md`;
- `REPOSITORY_POLICY.md`;
- an affected state contract.

State package conventions are defined in `states/README.md`.
