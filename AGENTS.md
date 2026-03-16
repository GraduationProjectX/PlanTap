# PlanTap Agent Guide

PlanTap is a monorepo for an Expo (React Native) mobile app and a Convex backend.

## Essentials

- Package manager: pnpm (Corepack optional). Prefer `pnpm ...`.
- Install deps: `pnpm install`
- Run all dev tasks (turbo): `pnpm run dev`
- Mobile: `pnpm --filter mobile dev -- -c`, `pnpm --filter mobile android`
- Backend: `pnpm --filter backend dev`
- If install warns about ignored build scripts: `pnpm approve-builds` then `pnpm rebuild --pending`
- We are using the React Compiler. It will add memoization to components and values within codebase. This eliminates the need for you to add any useMemo, useCallback, and React.memo hooks, so NEVER add any of these
- Never typecast. Never use `as`
- Prefer the smallest safe fix; avoid refactors and unrelated cleanup.
- Use the smallest possible diff to maket this changes. Then think of how to make it smaller and do that again.
- No typeof checks.
- No backwards compat. 

## More docs

- docs/agents/planning.md
- docs/agents/dependencies.md
- docs/agents/mobile.md
- docs/agents/backend.md

<!-- HEROUI-NATIVE-AGENTS-MD-START -->
[HeroUI Native Docs Index]|root: ./.heroui-docs/native|STOP. What you remember about HeroUI Native is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: heroui agents-md --native --output AGENTS.md|.:{components\(buttons)\button.mdx,components\(buttons)\close-button.mdx,components\(collections)\menu.mdx,components\(collections)\tag-group.mdx,components\(controls)\slider.mdx,components\(controls)\switch.mdx,components\(data-display)\chip.mdx,components\(feedback)\alert.mdx,components\(feedback)\skeleton-group.mdx,components\(feedback)\skeleton.mdx,components\(feedback)\spinner.mdx,components\(forms)\checkbox.mdx,components\(forms)\control-field.mdx,components\(forms)\description.mdx,components\(forms)\field-error.mdx,components\(forms)\input-group.mdx,components\(forms)\input-otp.mdx,components\(forms)\input.mdx,components\(forms)\label.mdx,components\(forms)\radio-group.mdx,components\(forms)\search-field.mdx,components\(forms)\select.mdx,components\(forms)\text-area.mdx,components\(forms)\text-field.mdx,components\(layout)\card.mdx,components\(layout)\separator.mdx,components\(layout)\surface.mdx,components\(media)\avatar.mdx,components\(navigation)\accordion.mdx,components\(navigation)\list-group.mdx,components\(navigation)\tabs.mdx,components\(overlays)\bottom-sheet.mdx,components\(overlays)\dialog.mdx,components\(overlays)\popover.mdx,components\(overlays)\toast.mdx,components\(utilities)\pressable-feedback.mdx,components\(utilities)\scroll-shadow.mdx,components\index.mdx,getting-started\(handbook)\animation.mdx,getting-started\(handbook)\colors.mdx,getting-started\(handbook)\composition.mdx,getting-started\(handbook)\portal.mdx,getting-started\(handbook)\provider.mdx,getting-started\(handbook)\styling.mdx,getting-started\(handbook)\theming.mdx,getting-started\(overview)\design-principles.mdx,getting-started\(overview)\quick-start.mdx,getting-started\(ui-for-agents)\agent-skills.mdx,getting-started\(ui-for-agents)\agents-md.mdx,getting-started\(ui-for-agents)\llms-txt.mdx,getting-started\(ui-for-agents)\mcp-server.mdx,getting-started\index.mdx,releases\beta-10.mdx,releases\beta-11.mdx,releases\beta-12.mdx,releases\beta-13.mdx,releases\index.mdx,releases\rc-1.mdx,releases\rc-2.mdx,releases\rc-3.mdx}
<!-- HEROUI-NATIVE-AGENTS-MD-END -->
