# Merge Plan

> Branch: `Home-Screen`
> Base: `origin/main`
> Strategy: merge `origin/main` into branch, stabilize, then merge into `main` with a merge commit

## 1. Sync Branch

- Fetch latest remote state.
- Merge `origin/main` into `Home-Screen`.
- Resolve conflicts on branch, not during final merge.
- Focus conflict review on:
  - `apps/mobile/app/_layout.tsx`
  - `apps/mobile/app/(main)/_layout.tsx`
  - `apps/mobile/app/(main)/(tabs)/_layout.tsx`
  - `apps/mobile/package.json`
  - `package.json`
  - `pnpm-lock.yaml`

Exit:

- branch includes latest `origin/main`
- no unresolved conflicts

## 2. Stabilize

- Keep diff minimal; no refactors unless required.
- Fix `git diff --check` issues.
- Remove merge-noise-only whitespace/EOF issues.
- Verify highest-risk files:
  - `apps/mobile/app/(main)/(tabs)/index.tsx`
  - `apps/mobile/app/(main)/event/[id].tsx`
  - `apps/mobile/components/events/EventCard.tsx`
  - `packages/backend/convex/schema.ts`
  - `packages/backend/convex/http.ts`
  - `packages/backend/convex/webhooks.ts`
- Explicitly re-check known weak spots:
  - event card/detail transition and back animation
  - event detail completeness
  - filters flow
  - city selector behavior
  - Clerk + Convex auth/webhook flow

Exit:

- no known blocker remains
- no obvious unfinished UX in core flows

## 3. Validate

Required:

- `pnpm lint`
- `pnpm typecheck`

Manual smoke pass:

- auth: sign-in, callback, post-auth routing, sign-out
- home: feed load, categories, city selection, search/filter entry points
- event: open detail, shared transition, back behavior, maps/share/bookmark
- bookmarks: add, remove, refresh state
- filters: open, apply, reset, results update
- backend/data: events, categories, bookmarks, reviews, webhook/auth integration

Exit:

- lint passes
- typecheck passes
- smoke pass passes on core flows

## 4. PR Prep

- Keep one PR; do not split.
- State that latest `origin/main` was merged first.
- List manual validation performed.
- Ask reviewers to focus on:
  - routing/auth
  - home + event UI
  - backend schema/webhooks
  - Expo 55 alignment

## 5. Merge

- Merge `Home-Screen` into `main` with a merge commit.
- Do not squash.
- Reconfirm branch is up to date before merge.
- After merge, do a quick smoke check on `main`.

## 6. Rollback

- If severe regression: revert the merge commit.
- Fix on a new branch from updated `main`.
- Re-merge only after revalidation.

## Definition Of Ready

- latest `origin/main` merged into branch
- conflicts resolved
- `pnpm lint` passes
- `pnpm typecheck` passes
- core smoke pass passes
- no blocker in auth, webhooks, transitions, bookmarks, event detail

## Unresolved Questions

- None.
