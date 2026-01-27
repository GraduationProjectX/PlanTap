# PlanTap — Plan [Draft #1] يبيله تعديل مع درافت 2, شيك النوتباد بلس لاس
> Graduation Project — React Native + Expo + Convex + Clerk  
> Target: Saudi locals (all major cities)  
> MVP Focus: **Discover → Suggest → Save Plans → Share → Navigate**  
> Community is **NOT MVP** (schema only, empty UI)[later phase]  
> Map Provider: **Mapbox**  
> Ticketing: Forward to ticketing page+ show map location

---

## 0) Product Summary (MVP)

**PlanTap** is a cross-platform mobile app + admin web dashboard that helps people in Saudi Arabia discover **ongoing/upcoming events** and **always-available activities** (e.g., padel courts, archery, horse riding). Users can generate plan suggestions via a constraint-based planner (not AI), swipe through suggestions, and save/share plans. view a map and discover nearby events/activities and map will show custom markers for events/activities showing details of the event/activity and a button to navigate to the event details UI.

البرودكت ساماري ناقصه تفاصيل, عدلها قبل لا ترسله لكلاولد4.5

---

## 1) Core Experience (User Flow)

### Onboarding
1. User signs in (Clerk)
2. Answers a survey:
   - interests/tastes + dislikes
   - budget range
   - group type defaults (solo / group / kids)
   - indoor/outdoor preference
   - time preference (morning/evening/night)
   - choose city + request location permission

### Discover
- Home feed with sections:
  - Tonight / This Weekend
  - Near You
  - Trending in City
  - Family Picks
- Map view with custom markers + filters

### Suggest (Signature Feature)
- User inputs constraints:
  - categories/tags
  - budget range
  - time range
  - group type (solo/kids/group)
  - indoor/outdoor
  - radius
- App returns **3 suggestion** at first (swipeable card)
- User can tap **“Add next stop”** to generate another suggestion card
- When user “keeps” a suggestion(s), app saves it as a **Plan**
- Plan detail shows a timeline + map + share option

---

## 2) Data Strategy (Hybrid Ingestion)

### Primary Sources (Stable)
1) Visit Saudi APIs / Open Data (official backbone)
2) Ticketmaster Discovery API (optional fill)
3) Eventbrite API (optional fill; depends on availability)
4) Google Places API (always-available venues/activities)  
   - Use **lightly** and cache results in Convex

### Backup Source (Scraping)
- Only as a gap-filler
- Always “Pending” until Admin approves
- Daily schedule + weekend boost

### User Submitted Events (Optional MVP+)
- User submits event → admin approves

---

## 3) System Architecture

### Mobile App (Expo 54)
- Expo Router + Tabs
- TypeScript
- Clerk authentication (Google/Apple)
- Convex for backend sync (source of truth)
- Zustand for UI-only state (filters, local toggles)
- MMKV for local caching (preferences, last filters)
- Mapbox maps
- Expo Notifications for plan reminders
- FlashList for high-performance lists
- Moti for animations
- Expo Image for images
- expo-glass-effect 
- react-native-deck-swiper https://github.com/rgazeredo/react-native-deck-swiper
### Admin Website Dashboard
- Next.js (recommended)
- Convex client to manage events, review queue, users, reports
- Simple admin auth (Clerk web)

---

## 4) Repo Structure

### Mobile (Expo)
```

/apps/mobile
/app
/(tabs)
home.tsx
map.tsx
suggest.tsx
profile.tsx
/auth
sign-in.tsx
/event
[id].tsx
/plan
[id].tsx
/settings
index.tsx
/components
/features
/lib
/store
/styles

```

### Admin Web
```

/apps/admin
/app
/login
/(admin)
events
events/pending
events/[id]
users
reports
feedback
import
/components
/lib

```

### Backend (Convex)
```

/packages/backend
convex/
schema.ts
users.ts
events.ts
plans.ts
favorites.ts
ingest.ts
moderation.ts

```

---

## 5) Expo Router Routes (Mobile)

### Tabs
- `/home`
- `/map`
- `/suggest`
- `/profile`

### Stack Screens
- `/event/[id]` — event/activity details
- `/plan/[id]` — plan details
- `/settings` — app settings
- `/auth/sign-in` — Clerk sign-in

---

## 6) Data Model (Convex Schema)

> Community schema exists but unused (future phase).

### `users`
- `clerkUserId: string`
- `displayName: string`
- `avatarUrl?: string`
- `city?: string`
- `preferences: { likedTags: string[]; dislikedTags: string[] }`
- `defaults: { budgetMin?: number; budgetMax?: number; radiusKm?: number; groupType?: "solo"|"group"|"kids"; indoorOutdoor?: "indoor"|"outdoor"|"mixed"|"any" }`
- `createdAt: number`

### `events`
- `title: string`
- `descriptionShort?: string`
- `type: "event" | "activity"`
- `categories: string[]`
- `tags: string[]`
- `startAt?: number` (nullable for always-available activities)
- `endAt?: number`
- `city: string`
- `location: { lat: number; lng: number; address?: string }`
- `priceMin?: number`
- `priceMax?: number`
- `indoorOutdoor: "indoor"|"outdoor"|"mixed"|"unknown"`
- `familyFriendly?: boolean`
- `bookingRequired?: boolean`
- `provider: "visitsaudi"|"ticketmaster"|"eventbrite"|"places"|"scraped"|"manual"`
- `providerUrl?: string`
- `images: string[]`
- `status: "pending"|"approved"|"rejected"`
- `audit: { createdBy?: string; reviewedBy?: string; reviewedAt?: number; sourceUrl?: string; confidence?: number }`
- `updatedAt: number`

### `plans`
- `userId: Id<"users">`
- `title: string`
- `stops: { eventId: Id<"events">; note?: string }[]`
- `constraintsSnapshot: { budgetMin?: number; budgetMax?: number; radiusKm?: number; city?: string; groupType?: string; indoorOutdoor?: string; timeStart?: number; timeEnd?: number; tags?: string[] }`
- `shareId: string` (short code)
- `createdAt: number`

### `favorites`
- `userId: Id<"users">`
- `eventId: Id<"events">`
- `createdAt: number`

### `feedback`
- `userId?: Id<"users">`
- `message: string`
- `createdAt: number`
- `status: "open"|"closed"`

### `reports`
- `reporterUserId?: Id<"users">`
- `targetType: "event"|"plan"|"user"|"post"`
- `targetId: string`
- `reason: string`
- `createdAt: number`
- `status: "open"|"resolved"|"dismissed"`

---

## 7) Future Social Schema (Phase later, empty now)

### `posts`
- `userId`
- `planId?`
- `caption`
- `media[]`
- `createdAt`

### `comments`
- `postId`
- `userId`
- `text`
- `createdAt`

### `likes`
- `postId`
- `userId`

### `follows`
- `followerId`
- `followingId`
- `status: "requested"|"accepted"`

---

## 8) Convex Functions (Queries & Mutations)

### Users
- `users.upsertFromClerk()`
- `users.updatePreferences()`
- `users.updateDefaults()`

### Events
- `events.getById(id)`
- `events.listHomeFeed({ city, now })`
- `events.search({ query, categories, tags, city, priceRange, timeRange, indoorOutdoor, familyFriendly })`
- `events.listNearby({ lat, lng, radiusKm, categories })`

### Plans
- `plans.createPlan({ stops, constraintsSnapshot })`
- `plans.getPlan(id)`
- `plans.listMyPlans()`
- `plans.generateShareId(planId)`

### Favorites
- `favorites.toggle({ eventId })`
- `favorites.listMyFavorites()`

### Suggestion Engine
- `suggest.getSuggestionDeck({ constraints, excludeEventIds })`
  - returns ranked list of events for swipe cards
- `suggest.getNextStop({ constraints, previousStops })`
  - used when user taps “Add next stop”

### Admin
- `admin.listPendingEvents()`
- `admin.approveEvent({ id })`
- `admin.rejectEvent({ id })`
- `admin.updateEvent({ id, patch })`
- `admin.mergeEvents({ keepId, removeId })`
- `admin.bulkImportCSV(rows)`
- `admin.listUsers()`
- `admin.banUser({ userId })`
- `admin.unbanUser({ userId })`
- `admin.listReports()`
- `admin.resolveReport({ id, action })`

---

## 9) Suggestion Engine Spec (Key Differentiator)

### Inputs (Constraints)
- `city`
- `timeStart`, `timeEnd`
- `budgetMin`, `budgetMax`
- `radiusKm`
- `groupType`: solo | group | kids
- `indoorOutdoor`: indoor | outdoor | any
- `requiredTags[]`
- `excludedTags[]`
- `allowUnknownPrice: boolean`

### Hard Filters (must pass)
- city match (or within region)
- within time range:
  - events: startAt within `[timeStart, timeEnd]`
  - activities: always allowed
- within radius if location available
- budget fit or allow unknown

### Scoring (soft ranking)
Score components:
- + tag/category match (survey + constraint tags)
- + popularity signal (favorites count)
- + proximity boost (closer = better)
- + time fit boost (starting soon = better)
- + family friendly if kids
- + indoor/outdoor preference
- + diversity penalty if repeating same category too often

### Output Format (Swipe Deck Card)
Each card includes:
- title + cover image
- badges: price / distance / indoor/outdoor / family
- “Why this?” reasons:
  - Near you
  - Matches your vibe
  - Popular this weekend
  - Budget-friendly

### “Add Next Stop” behavior
When generating next stop:
- avoid same event IDs already chosen
- prefer close to last stop location
- ensure plan remains within total time window

---

## 10) UI Screens Spec (MVP)

### Onboarding Survey
- Animated card flow (Moti)
- Big choices + haptics
- Save to user preferences in Convex + cache in MMKV

### Home Tab
- Sections:
  - Tonight / Weekend
  - Near You
  - Trending in City
- Each item: poster card + badges
- Fast list (FlashList)

### Map Tab
- Mapbox map
- Custom markers
- Filter chips
- Bottom sheet preview of selected event
- “Search this area”

### Suggest Tab (Hero)
Top constraint controls:
- group type
- time range
- budget
- radius
- tags/categories pills
Swipe deck:
- left = skip
- right = keep
Buttons:
- Add next stop
- View plan preview
- Reset constraints

### Event Detail Screen
- image gallery
- description + tags
- provider button (open URL)
- directions button (open maps)
- favorite toggle

### Plan Detail Screen
- timeline of stops
- map preview
- share plan (link + card)
- open directions for each stop

### Profile Tab
- saved plans list
- favorites list
- settings entry

---

## 11) Admin Dashboard Spec (MVP)

### Pages
- `/events/pending` — review queue
- `/events/[id]` — edit + approve/reject
- `/events` — approved list
- `/import` — CSV import
- `/users` — ban/unban
- `/reports` — reports moderation
- `/feedback` — user feedback inbox

### Event Approval Workflow
1. Pending event created by ingestion/scraper/manual
2. Admin reviews
3. Admin edits details
4. Approve → becomes visible in app
5. Reject → hidden

### Duplicate Detection (Admin tool)
- show suspected duplicates based on:
  - title similarity
  - same city
  - date overlap
  - same providerUrl
- admin can merge:
  - keep one ID, delete/redirect the other

---

## 12) Ingestion Pipeline (API + Places + Scrape)

### Ingestion Rule
- Always write as `status = "pending"`
- Admin approval required for `"approved"`

### API Ingestion
- Scheduled daily job:
  - fetch recent/upcoming events
  - normalize fields
  - store pending draftsollp events

### Places Ingestion (Activities)
- Run per city once
- Cache results in Convex
- Refresh weekly

### Scraping Backup (Playwright)
- Daily at minimum
- Weekend boost 2x/day
- Extract normalized data + raw snapshot
- Confidence score
- Store pending

---

## 13) Performance & UX Requirements

- Use FlashList for large feeds
- Cache:
  - user preferences
  - last city
  - last filters
- Preload images with expo-image
- Avoid heavy map renders:
  - cluster markers when zoomed out
  - only render visible markers
- Animations:
  - subtle transitions
  - swipe deck gestures must be smooth

---

## 14) Notifications (MVP)
- Optional plan reminders:
  - “Your plan starts in 2 hours”
- Only schedule local notifications (no paid push infrastructure needed)

---

## 15) Security & Safety (MVP)
- All user content reporting in-app
- Admin can ban users (soft ban)
- Keep provider URLs safe (sanitize)
- No scraping that requires login or bypasses protections

---

## 16) Delivery Timeline (5 Months / 5 Members)

### Month 1 — Foundations
- Expo app structure + Clerk + Convex
- Onboarding survey + user profile
- Admin dashboard skeleton
- Events schema + manual admin entry

### Month 2 — Discover
- Home feed + event detail + favorites
- Mapbox map + markers + filters
- Basic search & filter

### Month 3 — Suggest Engine
- constraints UI
- swipe suggestion deck
- save plan (1 stop) + shareId
- “Add next stop” flow begins

### Month 4 — Admin Power + Ingestion
- pending/approve workflow complete
- duplicate detection/merge tool
- bulk import CSV
- ingest from APIs + places cache
- scraping backup (Playwright)

### Month 5 — Polish + Demo
- Notifications
- MMKV caching strategy
- final animations + performance pass
- edge cases + QA + demo scenario scripts

---

## 17) Acceptance Criteria (MVP Done When…)

✅ User can:
- log in
- complete onboarding survey
- browse approved events
- search/filter
- see events on map
- generate a suggestion card deck
- keep/save a plan (1+ stops)
- share a plan (shareId)
- open provider link + directions

✅ Admin can:
- review pending events
- edit and approve/reject
- merge duplicates
- import CSV
- ban users
- view reports/feedback

---

## 18) Technical Notes & Conventions

### State Management
- Convex holds server state
- Zustand holds UI-only state (filters, local toggles)
- MMKV holds local cache + onboarding completion flag

### Environment
- Prefer `process.env.EXPO_OS` over `Platform.OS`
- `react-native-safe-area-context` required
- `expo-symbols` for icons

### Libraries
- expo-image
- expo-glass-effect ✅
- expo-notifications
- FlashList
- Moti
- Mapbox SDK

---

## 19) Next Tasks for Claude Code (Cursor)

### Generate these files:
1) `apps/mobile/app/_layout.tsx` + tab layout
2) `apps/mobile/app/(tabs)/home.tsx`
3) `apps/mobile/app/(tabs)/map.tsx`
4) `apps/mobile/app/(tabs)/suggest.tsx`
5) `apps/mobile/app/event/[id].tsx`
6) `apps/mobile/app/plan/[id].tsx`
7) `packages/backend/convex/schema.ts`
8) `packages/backend/convex/events.ts`
9) `packages/backend/convex/suggest.ts`
10) `apps/admin/app/(admin)/events/pending/page.tsx`
11) `apps/admin/app/(admin)/events/[id]/page.tsx`

### Implementation Rules
- Keep UI premium (no generic templates)
- Build reusable components:
  - EventCard
  - BadgeRow
  - SwipeDeckCard
  - PlanTimeline
  - MapMarkerPreviewSheet
- Keep functions small and typed
- Always ensure pending approval workflow

---

END OF SPEC
```
