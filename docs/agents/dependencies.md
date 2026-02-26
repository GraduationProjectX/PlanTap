# Dependencies & Package Manager

This repo uses pnpm workspaces.

## Commands

- Install: `pnpm install`
- Run a root script: `pnpm run <script>`
- Run a workspace script: `pnpm --filter <pkgName> <script>`
  - Example: `pnpm --filter mobile android`

## Build Script Approval (pnpm v10)

pnpm may block dependency install scripts and print an **Ignored build scripts** warning.

- Approve: `pnpm approve-builds`
- Build anything pending: `pnpm rebuild --pending`

## Hygiene

- Do not mix package managers (no `package-lock.json`, `bun.lock`, `yarn.lock`).
- Keep React/React Native on a single version across the workspace.
