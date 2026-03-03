# PlanTap Agent Guide

PlanTap is a monorepo for an Expo (React Native) mobile app and a Convex backend.

## Essentials

- Package manager: pnpm (Corepack optional). Prefer `pnpm ...`.
- Install deps: `pnpm install`
- Run all dev tasks (turbo): `pnpm run dev`
- Mobile: `pnpm --filter mobile dev -- -c`, `pnpm --filter mobile android`
- Backend: `pnpm --filter backend dev`
- If install warns about ignored build scripts: `pnpm approve-builds` then `pnpm rebuild --pending`

## More docs

- docs/agents/planning.md
- docs/agents/dependencies.md
- docs/agents/mobile.md
- docs/agents/backend.md
