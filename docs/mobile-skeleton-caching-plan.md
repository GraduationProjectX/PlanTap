# Mobile Skeleton + Cache Plan

## Goal

- Keep UI responsive while data loads.
- Add category-chip skeletons only where useful.
- Use cache (memory + MMKV) to reduce cold/warm load delays.

## Cache Policy

- Events TTL: `10 minutes`
- Categories TTL: `7 days`
- Cache strategy: `stale-while-revalidate` (serve cache first, refresh from Convex)

## Scope

- Home: show category-chip skeleton while categories are unresolved.
- Event/Bookmarks/Filters: keep existing loading UX, avoid full-control skeletonization.
- Hooks: add shared cache behavior in `useEvents` and `useCategories`.
- Docs: add caching guideline for future implementations.

## Implementation Steps

1. Add cache utilities
   - Create `apps/mobile/lib/data-cache.ts`.
   - Add typed envelope (`version`, `updatedAt`, `data`).
   - Implement memory mirror + MMKV read/write helpers + TTL check.

2. Add storage keys
   - Update `apps/mobile/storage/keys.ts` with cache keys:
     - events cache key
     - categories cache key

3. Update hooks
   - `apps/mobile/hooks/use-events.ts`
     - Read cache synchronously first.
     - Return cached events while Convex query is `undefined`.
     - Persist fresh query result to memory + MMKV.
     - Expose `isLoading` and `isRefreshing` semantics.
   - `apps/mobile/hooks/use-categories.ts`
     - Same flow as events.
     - Use `7 days` TTL.

4. Add category-chip skeleton
   - Create `apps/mobile/components/home/CategoryChipsSkeleton.tsx` using HeroUI Native `SkeletonGroup`.
   - Update `apps/mobile/components/home/HomeHeader.tsx`:
     - Add `isCategoriesLoading` prop.
     - Show skeleton row only for chip area when needed.

5. Wire home screen
   - Update `apps/mobile/app/(main)/(tabs)/index.tsx`:
     - Pass `isCategoriesLoading` to `HomeHeaderSticky`.
     - Keep current content loading behavior intact.

6. Document best practices
   - Update `docs/agents/mobile.md` with a “Data Caching” section:
     - memory + MMKV first
     - TTL by data volatility
     - stale-while-revalidate default
     - avoid blocking controls on refresh

## Validation

- Run:
  - `pnpm --filter mobile lint`
  - `pnpm --filter mobile typecheck`
- Manual checks:
  - First launch online: skeleton appears only where needed.
  - Reopen app: cached categories/events render immediately.
  - Slow network: cached content visible, then background refresh.
  - Offline reopen: stale cached data still visible.

## Risks / Notes

- Cache schema changes require cache `version` bump.
- Keep cached payload size bounded (store normalized fields only if needed later).
- Avoid stale UX regressions by preserving `isRefreshing` for subtle indicators only.

## Unresolved Questions

- None.
