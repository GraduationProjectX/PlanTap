# PlanTap Agent Guide

PlanTap is a monorepo for an Expo (React Native) mobile app and a Convex backend.

## Essentials

- Package manager: pnpm (via Corepack). Prefer `corepack pnpm ...`.
- Install deps: `corepack pnpm install`
- Run all dev tasks (turbo): `corepack pnpm run dev`
- Mobile: `corepack pnpm --filter mobile dev -- -c`, `corepack pnpm --filter mobile android`
- Backend: `corepack pnpm --filter backend dev`
- If install warns about ignored build scripts: `corepack pnpm approve-builds` then `corepack pnpm rebuild --pending`

## More docs

- docs/agents/planning.md
- docs/agents/dependencies.md
- docs/agents/mobile.md
- docs/agents/backend.md
