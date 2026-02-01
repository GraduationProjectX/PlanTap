# Mobile (Expo)

## Common commands

- Dev client bundler: `corepack pnpm --filter mobile dev -- -c`
- Run Android: `corepack pnpm --filter mobile android`

## Invalid hook call / duplicate React

If you see "Invalid hook call" on mobile, it is usually Metro resolving multiple React copies.

- The repo pins React to a single version and uses `apps/mobile/metro.config.js` to resolve `react` from the workspace root.
- After dependency changes, restart Metro with cache cleared: `corepack pnpm --filter mobile dev -- -c`
