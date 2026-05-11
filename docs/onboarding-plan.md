# PlanTap Onboarding Plan

## Locked Decisions

- We use the linked template as visual inspiration only, not as code.
- Flow has 6 steps:
  1. Intro
  2. City + location permission
  3. Interests
  4. Dislikes
  5. Defaults
  6. Notifications
- Users can skip any step.
- `Skip` appears top-right on steps 2-6.
- Final-submit only (no per-step backend writes).
- No hard constraints in onboarding.
- No `radiusKm` field.
- Default `groupType` is `"group"`.
- Illustration direction is object-based (no characters/people).

## Mixed vs Any

- `any`: user has no indoor/outdoor preference (do not filter by this field).
- `mixed`: event metadata value meaning the venue/experience spans both indoor and outdoor.
- In onboarding UI, preference choices are only `indoor`, `outdoor`, `any`.

## Technical Direction

### Libraries

- Use current app stack:
  - `react-native-reanimated` for step animations
  - `react-native-screen-transitions` for shared/object movement between key screens
  - `heroui-native` for survey controls
  - `expo-router` for route orchestration
  - `react-native-unistyles` for styling
- Do not add old onboarding libraries.
- Do not add Skia for V1.

### Mobile Structure

- New route: `apps/mobile/app/onboarding/index.tsx`
- New feature folder:
  - `apps/mobile/features/onboarding/types.ts`
  - `apps/mobile/features/onboarding/defaults.ts`
  - `apps/mobile/features/onboarding/components/*`
  - `apps/mobile/features/onboarding/steps/*`
- Survey draft state lives locally in onboarding screen/feature, not in global store.

### Backend (Convex)

Extend `users` with optional fields:

- `city?: string | null`
- `preferences?: { likedTags: string[]; dislikedTags: string[] }`
- `defaults?: {`
  - `groupType?: "solo" | "group" | "kids"`
  - `indoorOutdoor?: "indoor" | "outdoor" | "any"`
  - `budgetMin?: number | null`
  - `budgetMax?: number | null`
  `}`
- `notificationsEnabled?: boolean`
- `onboardingCompletedAt?: number | null`

Add mutation `users.completeOnboarding`:

- Accept partial payload from onboarding draft
- Normalize and dedupe tags
- Apply defaults for omitted fields
- Set `onboardingCompletedAt = Date.now()` when user finishes or skip-finishes

### Routing and Source of Truth

- Onboarding completion source of truth: backend `users.onboardingCompletedAt`.
- Do not drive routing from persisted local onboarding flags.
- Local store can hold temporary UI hints only, not auth/onboarding truth.

## Step-by-Step UX

1. Intro
   - Animated object hero + value proposition + CTA
2. City + location
   - City select first
   - Location permission request in this step
3. Interests
   - Multi-select tags (`TagGroup`)
4. Dislikes
   - Multi-select tags (`TagGroup`)
5. Defaults
   - Group type (`RadioGroup`)
   - Indoor/outdoor preference (`RadioGroup`)
   - Budget range (`Slider`)
6. Notifications
   - On/off only (`Switch`)
   - Submit and enter app

## Skip and Defaults

When skipped or omitted, submit these defaults:

- `city = null`
- `preferences.likedTags = []`
- `preferences.dislikedTags = []`
- `defaults.groupType = "group"`
- `defaults.indoorOutdoor = "any"`
- `defaults.budgetMin = null`
- `defaults.budgetMax = null`
- `notificationsEnabled = false` unless enabled explicitly

## Animation Plan (Option 1)

- Reanimated for:
  - Screen enter/exit transitions
  - Progress indicator transitions
  - Button and card micro-interactions
- Screen transitions for:
  - Shared object continuity between Intro and survey
  - Key decorative object movement between selected steps
- Performance rules:
  - Animate transform and opacity first
  - Keep blur/shadow animation minimal
  - Avoid layout thrash in loops

## Image Prompt Pack (GPT-Image-v2, Object-Based)

Use these prompts to generate onboarding art assets.

### Global style anchor (prepend to every prompt)

"Object-based mobile onboarding illustration, premium editorial vector + soft-paint hybrid, warm sand and terracotta with teal accents, subtle gradients, soft paper grain, cinematic depth, modern minimal look, no text, no logos, no watermark, portrait 9:16, safe-area aware composition with clear top and bottom UI space."

### Image 01 - Intro hero

"Abstract city discovery composition with floating map pins, rounded event cards, ticket shapes, calendar glyph forms, path lines connecting points, layered depth, optimistic glow, central focal object cluster, no people."

### Image 02 - City selection

"Stylized city map tile with highlighted district blocks, one active destination pin, subtle road geometry and landmarks as abstract forms, clear center focus, clean edges, no people."

### Image 03 - Location permission

"GPS signal concept: central locator icon over a map grid with concentric pulse rings, soft trust-building lighting, calm palette balance, minimal clutter, no people."

### Image 04 - Interests

"Floating stack of category objects and icons: food bowl, music note plaque, sport ball badge, art frame tile, adventure compass token, wellness leaf chip, arranged as rounded cards with depth, no people."

### Image 05 - Dislikes

"Same object language as interests but muted/neutral tones, selective exclusion markers on a few chips, balanced composition that feels informative not negative, no people."

### Image 06 - Defaults

"Planning toolkit still life: group token, indoor/outdoor toggle symbols, budget slider motif, layered control cards, clean product-style arrangement, premium app aesthetic, no people."

### Image 07 - Notifications

"Bell/notification object scene with soft glow rings, gentle evening gradient background, small floating badges and subtle particles, clear CTA-safe negative space, no people."

### Image 08 - Completion

"Completion concept with connected route line, check token, stacked curated cards, spark accents, polished celebratory look without confetti overload, no people."

### Optional decorative assets

- Gradient blob set (3-6 shapes) matching palette
- Floating card fragments for parallax
- Soft ring/pulse elements for transition overlays

## Implementation Order

1. Convex schema updates and mutation
2. Onboarding route and step orchestrator
3. Step components and form state wiring
4. Final submit and completion routing
5. Animation polish with shared object transitions
6. i18n strings (en/ar)
7. QA for skip flows and auth edge cases
