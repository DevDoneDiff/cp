# Product Contracts

This directory contains customer-visible state contracts, approved product implementation specs, and their exact visual or technical references.

Harness construction and repository-governance maintenance are control-plane work. They are not represented here by specs, tasks, identities, compatibility routes, or migration records; they run only through an explicitly invoked `$harness-maintenance` procedure.

## Folder Ownership

```text
docs/contracts/
  README.md
  SPEC_TEMPLATE.md
  states/
    README.md
    STATE_TEMPLATE.md
    sNN-kebab-case-state-name/
      sNN-state.md
      visual-<descriptor>.png
      technical-<descriptor>.png
      specs/
```

- `sNN-state.md` owns durable state-specific behavior.
- `visual-*.png` owns approved appearance for the represented state within governing prose.
- `technical-*.png` owns only a process depiction explicitly adopted by governing prose.
- `specs/*.md` owns one approved product implementation outcome.

Do not create loose implementation specs or harness/repository-maintenance spec folders.

## Product Spec Routing

Every product implementation spec has one owning state: the state whose completion makes the collective outcome whole. Store it at:

`docs/contracts/states/<owning-state>/specs/<SEQUENCE>-<kebab-case-outcome>.md`

The stable `Spec ID` is `state/sNN/<SEQUENCE>`. A cross-state result names every affected state but remains under its terminal owning state. Independently complete state outcomes require separate specs.

Historical source paths recorded by completed tasks are implementation history, not forward routes or templates. Use Git for a bounded historical question; do not maintain live compatibility tables, aliases, placeholders, or migration validators for removed spec locations.

## Approval and Lineage

New specs begin with `State: draft` and `Approved: false`. Only a later explicit user approval of the exact draft may change them to `State: approved` and `Approved: true`.

- `Amends` names one prior stable spec ID changed in a bounded way.
- `Supersedes` names one prior stable spec ID whose forward authority is replaced.
- `none` means no such relationship.

Lineage does not erase implementation history or silently change unrelated authority.

## Artifact References

The artifact vocabulary is `visual`, `technical`, or `none`.

- Assign exact repository-relative paths; never infer authority from a folder or neighboring file.
- State artifacts live under `docs/contracts/states/<state>/` and use `visual-<descriptor>.png` or `technical-<descriptor>.png`.
- Active tasks may reference only existing canonical artifacts assigned by their approved product spec.
- Historical paths inside completed tasks remain history and do not create a current route.

There is no live artifact-migration registry. Completed file moves are represented by the current canonical tree and Git history.

## Authority Boundary

A state contract or product spec may narrow broader product, architecture, design, MVP, or repository policy within its domain. It may not silently contradict those authorities.

See `states/README.md` for state-package conventions and `SPEC_TEMPLATE.md` for product-spec structure.
