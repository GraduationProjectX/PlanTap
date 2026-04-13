# Convex Source

This directory contains the Convex backend source for PlanTap.

## What lives here

- `schema.ts`: database schema
- `*.ts` function files: queries, mutations, actions, HTTP handlers
- `_generated/`: Convex generated types and API bindings (tracked in git)

## Local development

Run from the repo root:

```bash
pnpm --filter backend dev
```

Or run once for validation/type generation:

```bash
pnpm -C packages/backend exec convex dev --once
```
