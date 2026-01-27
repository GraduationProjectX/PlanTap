# Codex Review (Principal Engineer)

Reviewed:
- `Claude-plan.md`
- `IMPLEMENTATION-PLAN.md`
- `IMPLEMENTATION-TASKS.md`

## Executive Take

The docs are directionally solid (clear stack decisions, MVP flow, data model), but they currently mix “spec”, “wishlist”, and “implementation” in ways that will create rework. The biggest risks are (1) **Convex/Clerk integration details are under-specified**, (2) **geospatial + map performance assumptions are unrealistic without an indexing strategy**, (3) **the “$0 budget” constraint is violated in multiple places**, and (4) **several features depend on fields/tables that are not defined (favorites counts, feedback/reports, plan start time)**.

## High-Risk Flaws / Gaps
 

### 2) Convex in monorepo is underspecified and may be wrong
- Paths like `packages/backend/convex/schema.ts` and a standalone “packages/backend” Convex package are not the typical Convex layout; monorepo support exists but needs explicit wiring (`convex.json`, `convex/` folder placement, codegen output paths, shared types consumption).
- The plan mixes “Convex functions in packages/backend” with “Convex scheduled functions / http endpoints” without calling out deployment ownership and folder conventions.

Recommendation: add a concrete “Convex workspace layout” section (exact folder, exact commands to run from repo root, codegen outputs, and how mobile/admin import the generated `api`).

### 3) Security for HTTP endpoints is missing (webhooks + ingest)
- `POST /clerk-webhook` must validate Clerk signatures and reject replay.
- `POST /ingest-event` must be authenticated (secret header / signed payload) or it becomes an open write endpoint.

Recommendation: specify signature verification + shared secret design and where secrets live (Convex env vars). Add explicit threat model: “no unauthenticated writes”.

### 4) Geospatial querying is a major technical risk
- Features depend on “within radiusKm”, “near you”, “search this area”, clustering, distance scoring.
- Convex does not provide native geospatial indexing; naïve scans won’t scale and will be slow/expensive even at modest data sizes.

Recommendation: pick an indexing approach now:
- Store `geohash`/S2 cell or fixed grid buckets (e.g., ~1–5km cells) and index by `(city, cell)`.
- For map viewport, query by a set of cells intersecting the bounding box.
- Compute final distance client-side or in query for ranking after prefilter.

### 5) Plan notifications require plan timing fields that don’t exist
- The plan schedules “Your plan starts in 2 hours”, but `plans` lacks a canonical `startAt` (it only has `constraintsSnapshot.timeStart/timeEnd` as optional).

Recommendation: decide what “plan starts” means:
- Add `plans.startAt` (user-selected) for MVP, or
- Remove “2 hours” notifications and limit to “saved plan reminder” until schedule exists.

## Medium-Risk Inconsistencies / Cleanup Items

### Data model is incomplete relative to tasks
- `Claude-plan.md` defines `users`, `events`, `plans`, `cities`, `adminActions` but tasks also assume `favorites`, `feedback`, `reports` tables.
- Scoring mentions “favorites count” but neither a `favoritesCount` field nor an aggregation job is specified.

Recommendation: either (a) add the missing tables + indexes to the “Final Specification”, or (b) remove those tasks from MVP scope.

### Function naming drift / likely typos
- `IMPLEMENTATION-PLAN.md` lists `events.getByShareId()` which does not fit the spec (shareId belongs to plans).

Recommendation: normalize API names and keep them consistent across all docs.

### Admin UI library contradiction
- `Claude-plan.md` says “Component Library: None — Unistyles only”.
- `IMPLEMENTATION-PLAN.md` says “Tailwind CS+ShadCN” for admin.

Recommendation: clarify the decision as “No component library on mobile; admin may use shadcn/ui (optional).”

### Git repo already exists
- `IMPLEMENTATION-TASKS.md` includes “Initialize git repository”, which is already done.

Recommendation: replace with “verify clean branching strategy + CI hooks” or remove.

## Missing Decisions That Will Cause Rework

### Admin authorization model
- “email whitelist or Clerk metadata” is a big branching choice affecting all admin route guards and auditing.

Recommendation: pick one:
- Clerk Organizations/roles (preferred if multi-admin), or
- hardcoded email allowlist (fastest for MVP).

### Localization source-of-truth
- Locale is stored on `users.locale`, but the app is “auto-detection (device)”. This can conflict (device says `en`, server says `ar`).

Recommendation: define precedence rules (e.g., “user override in Settings wins; otherwise device locale”).

### Cities and taxonomy governance
- Cities are “dynamic from DB” but the source and admin editing flow aren’t specified beyond a CRUD page.
- Tags/categories require bilingual lists; the ingestion pipeline must map scraped tags to canonical tags.

Recommendation: define canonical taxonomy + mapping layer (normalizer) and enforce it at ingestion.


## Concrete Fixes to Apply to the Docs

1) Add a “Non-negotiables” section to `Claude-plan.md`:
- Security requirements for HTTP endpoints
- Geospatial indexing approach

2) Update `Claude-plan.md` data model to include (or explicitly defer):
- `favorites` table (+ any counter strategy)
- `feedback`/`reports` tables (or remove from tasks)
- `plans.startAt` if notifications depend on it

3) Normalize Convex layout + commands:
- Exact location of `convex/` code
- Codegen output and how clients import it

4) Fix naming drift:
- Remove/rename `events.getByShareId()`
- Decide whether `plans.createPlan()` generates `shareId` implicitly

