# CP repository foundation

This repository currently contains a credential-free, non-product Next.js smoke shell. Product states, provider integrations, persistence, and product visual authority begin only in later approved specifications.

## Prerequisites

- Windows 10/11 with PowerShell 7, or a compatible Linux environment
- Node.js `24.19.0`
- pnpm `11.18.0` through Corepack

WSL is not required. The exact versions are recorded in `.node-version`, `.nvmrc`, and `package.json`.

## Setup and development

```powershell
corepack enable pnpm
corepack install --global pnpm@11.18.0
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000/` to view the non-product foundation status route. Foundation runtime behavior consumes no environment variables; `.env.example` is intentionally comment-only.

## Validation

```powershell
pnpm validate
pnpm test:smoke
pnpm test:e2e
```

`pnpm validate` checks the exact toolchain, formatting, lint, strict types, candidate-clean annotation headers, repository security policy, the production dependency advisory graph, meaningful unit/integration/component coverage, and a production build.

`pnpm test:smoke` is self-contained: it builds once, starts the production server, waits for `/` with a finite timeout, requires HTTP 200, and shuts the server down on success or failure. It leaves the successful `.next` output in place. Run `pnpm test:e2e` afterward to reuse that build for Chromium proof without rebuilding.
