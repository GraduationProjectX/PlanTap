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
