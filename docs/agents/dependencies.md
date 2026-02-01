# Dependencies & Package Manager

This repo uses pnpm workspaces (managed via Corepack).

## Commands

- Install: `corepack pnpm install`
- Run a root script: `corepack pnpm run <script>`
- Run a workspace script: `corepack pnpm --filter <pkgName> <script>`
  - Example: `corepack pnpm --filter mobile android`

## Build Script Approval (pnpm v10)

pnpm may block dependency install scripts and print an **Ignored build scripts** warning.

- Approve: `corepack pnpm approve-builds`
- Build anything pending: `corepack pnpm rebuild --pending`

## Hygiene

- Do not mix package managers (no `package-lock.json`, `bun.lock`, `yarn.lock`).
- Keep React/React Native on a single version across the workspace.
