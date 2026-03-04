# Mobile (Expo)

## Common commands

- Dev client bundler: `pnpm --filter mobile dev -- -c`
- Run Android: `pnpm --filter mobile android`
- When you design make sure to account for lightmode and Darkmode users.

## Invalid hook call / duplicate React

If you see "Invalid hook call" on mobile, it is usually Metro resolving multiple React copies.

- The repo pins React to a single version and uses `apps/mobile/metro.config.js` to resolve `react` from the workspace root.
- After dependency changes, restart Metro with cache cleared: `pnpm --filter mobile dev -- -c`

## Theme preference flow

- Persisted UI preference lives in `apps/mobile/stores/ui-store.ts` as `themeMode: system | light | dark`.
- Root theme wiring happens in `apps/mobile/app/_layout.tsx`; this applies both React Navigation theme and Unistyles runtime mode.
- Settings UI for changing theme mode lives in `apps/mobile/app/(main)/settings/index.tsx`.
- To add new appearance modes later, update the `AppThemeMode` type, persisted migration, and settings options in one pass.

## Screen transitions

- Transition library: `react-native-screen-transitions`.
- Main stack integration lives in `apps/mobile/app/(main)/_layout.tsx` using `createNativeStackNavigator` + `withLayoutContext`.
- Enable transition presets only for `event/[id]` when opened from an event card shared tag.
- Do not apply this library to tab switching or other stack routes by default.
- Event cards use shared tags from `apps/mobile/lib/event-transition.ts` and pass tags through navigation params.
- Event details consumes the shared tag in `apps/mobile/app/(main)/event/[id].tsx`.
- Keep gesture dismissal disabled on `event/[id]` shared transitions unless explicitly requested.

## Data caching

- Default to stale-while-revalidate for list-like data in mobile hooks.
- Use two layers for UX: in-memory cache first, MMKV persisted cache second.
- Keep TTL based on data volatility:
  - Events: short TTL (minutes)
  - Categories/lookups: long TTL (days)
- Hook loading semantics should distinguish:
  - `isLoading`: no live data and no cached data
  - `isRefreshing`: no live data yet, but cached data is shown
- Avoid blocking controls during refresh; prefer partial skeletons only for unresolved content regions.
