# PlanTap Backend (Convex)

This package contains PlanTap's Convex backend (functions, schema, and generated API types).

## Setup

From the repo root:

```bash
corepack pnpm install
```

## Dev

From this directory:

```bash
corepack pnpm dev
```

Or from the repo root (runs backend + mobile together via Turborepo):

```bash
corepack pnpm run dev
```

## Notes

- `convex/` contains Convex code and `_generated/` types.
- Local Convex env/config lives in `.env.local` (ignored).
