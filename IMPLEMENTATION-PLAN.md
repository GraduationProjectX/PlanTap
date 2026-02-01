# PlanTap — Implementation Plan

> **Graduation Project** — React Native + Expo + Convex + Clerk  
> **Target**: Saudi Arabia locals   

---
## ✅ Finalized Decisions
| Decision | Choice |
|----------|--------|
| Monorepo Tool | **Turborepo** |
| Selection UI | **Buttons** (Add to Plan / Skip) — no swipe gestures |
| Primary Language | **Arabic-first** with **auto-detection** (ar/en based on device) |
| RTL Support | **Full RTL** when Arabic (tabs reversed, layouts mirrored) |
| Font | **Baloo Bhaijaan 2** (mobile) / **DM Sans** (UI design) |
| Offline Mode | **No** |
| Max Plan Stops | **5** |
| Manual Plan Creation | **Post-MVP** |
| Component Library (Mobile) | **None** — Unistyles only |
| Admin UI Kit | **shadcn/ui (optional)** + Tailwind (admin only) |
| Clerk → Convex Sync | **Webhooks** |
| HTTP Endpoint Auth | **Clerk signature verify** (webhook) + **shared secret** (ingest) |
| Image Storage | **Convex File Storage** |
| Cities | **Dynamic** — from database (scraped/API) |
| Map Provider | **Mapbox** (<300 users expected) |
| Geo Query Strategy | **City-first + grid cell index** (radius/viewport queries via `cellId`) | (For faster queries instead of reading the whole database)
| Analytics | **PostHog** |
| Scraper | **MVP: manual/local runs** → **Post-MVP: hosted automation** | 
---
## ⚠️ Non-Negotiables (Implementation Guardrails)
> [!CAUTION]
> These rules must be followed strictly to avoid security issues and performance problems.
1. **No unauthenticated writes**: All Convex HTTP endpoints must verify signatures/secrets.
2. **Geo features must not rely on full-table scans**: Use indexed prefiltering (`city` + `cellId`).
3. **$0 budget**: MVP must not incur charges; any feature requiring a paid plan is Post-MVP.
4. **Webhook security**: `/clerk-webhook` must verify Clerk signature headers + reject old timestamps (replay protection).
5. **Ingest security**: `/ingest-event` requires a shared secret (header or HMAC) stored in Convex env.
---
## 🏗️ Architecture Overview
```
plantap/
├── apps/
│   ├── mobile/          # Expo React Native app
│   ├── admin/           # React admin dashboard
│   └── scraper/         # Playwright scraper
├── packages/
│   ├── backend/         # Convex functions + schema
│   │   └── convex/      # Convex source files
│   │       ├── schema.ts
│   │       ├── _generated/
│   │       └── ...
│   └── shared/          # Shared types, utils, constants
├── turbo.json
└── package.json
```
### Convex Workspace Layout
- Convex project root: `packages/backend`
- Convex source: `packages/backend/convex/`
- Generated API/types: `packages/backend/convex/_generated/`
- Run Convex commands from `packages/backend` (or via turbo scripts)
- Mobile/admin import generated `api` from `@plantap/backend`
---
## 📱 Tech Stack
### Mobile App
- Expo (latest stable SDK) + Expo Router
- TypeScript (strict mode)
- Clerk (Google/Apple auth)
- Convex (backend)
- Zustand (UI state)
- MMKV (local cache)
- Mapbox Maps
- Unistyles (styling)
- FlashList (lists)
- Moti + Reanimated (animations)
- Expo Image
- Expo Notifications
- react-i18next (Arabic/English)
### Admin Dashboard
- React + Vite
- TanStack Router + Query
- Convex client
- Clerk web auth
- Tailwind CSS + shadcn/ui (optional)
### Scraper
- Node.js + TypeScript
- Playwright
- Convex HTTP client
- MVP: manual/local runs
- Post-MVP: hosted automation (GitHub Actions cron)
---
## 📊 Data Model
### `users`
```typescript
{
  clerkUserId: string
  displayName: string
  avatarUrl?: string
  locale: "ar" | "en"
  city?: string
  preferences: { likedTags: string[]; dislikedTags: string[] }
  defaults: {
    budgetMin?: number
    budgetMax?: number
    radiusKm?: number
    groupType?: "solo" | "group" | "kids"
    indoorOutdoor?: "indoor" | "outdoor" | "mixed" | "any"
  }
  pushToken?: string
  onboardingCompletedAt?: number
  lastActiveAt?: number
  createdAt: number
}
```
### `events`
```typescript
{
  title: string
  titleAr?: string
  descriptionShort?: string
  descriptionShortAr?: string
  type: "event" | "activity"
  categories: string[]
  tags: string[]
  startAt?: number
  endAt?: number
  city: string
  location: { lat: number; lng: number; address?: string; addressAr?: string }
  cellId: string                    // Derived grid cell for geo queries
  priceMin?: number
  priceMax?: number
  indoorOutdoor: "indoor" | "outdoor" | "mixed" | "unknown"
  familyFriendly?: boolean
  bookingRequired?: boolean
  bookingUrl?: string
  phone?: string
  operatingHours?: { day: number; open: string; close: string }[]
  duration?: number                 // Estimated minutes
  provider: "visitsaudi" | "ticketmaster" | "eventbrite" | "places" | "scraped" | "manual"
  providerUrl?: string
  images: Id<"_storage">[]          // Convex storage IDs
  favoritesCount: number            // Maintained by toggle (default 0)
  status: "pending" | "approved" | "rejected"
  audit: {
    createdBy?: string
    reviewedBy?: string
    reviewedAt?: number
    sourceUrl?: string
    confidence?: number
  }
  updatedAt: number
}
```
> [!NOTE]
> **Geo indexing**: Compute `cellId` at ingestion from `location.lat/lng` using ~2.5km grid cells.
> Formula: `cellId = "${floor(lat/0.02)}:${floor(lng/0.02)}"`
> Index events by `(city, cellId)` for radius/viewport queries.
### `plans`
```typescript
{
  userId: Id<"users">
  title: string
  status: "draft" | "saved" | "completed"
  stops: { eventId: Id<"events">; note?: string; order: number }[]
  startAt?: number                  // User-selected, for reminders
  constraintsSnapshot: {
    budgetMin?: number
    budgetMax?: number
    radiusKm?: number
    city?: string
    groupType?: string
    indoorOutdoor?: string
    timeStart?: number
    timeEnd?: number
    tags?: string[]
  }
  startLocation?: { lat: number; lng: number }
  shareId: string
  createdAt: number
}
```
### `favorites`
```typescript
{
  userId: Id<"users">
  eventId: Id<"events">
  createdAt: number
}
// Index: (userId, eventId) for unique lookup
```
### `feedback`
```typescript
{
  userId?: Id<"users">              // Allow anonymous
  message: string
  status: "open" | "closed"
  createdAt: number
}
```
### `reports`
```typescript
{
  reporterUserId: Id<"users">
  targetType: "event" | "user" | "plan"
  targetId: string
  reason: string
  details?: object
  status: "open" | "resolved" | "dismissed"
  createdAt: number
}
```
### `cities`
```typescript
{
  name: string                      // English
  nameAr: string                    // Arabic
  region?: string                   // Saudi region
  lat: number
  lng: number
  active: boolean
}
```
### `adminActions`
```typescript
{
  adminUserId: Id<"users">
  action: "approve" | "reject" | "edit" | "ban" | "merge" | "import"
  targetType: "event" | "user" | "report"
  targetId: string
  details?: object
  createdAt: number
}
```
---
## 🔐 Auth Flow (Clerk Webhooks)
```
1. User signs in via Clerk (mobile)
2. Clerk triggers webhook → Convex HTTP endpoint
3. Convex creates/updates user record
4. Mobile app syncs user data via Convex query
5. Session management handled by Clerk SDK
```
**Convex auth integration:**
- Use Clerk JWTs to authenticate Convex requests (JWT template + JWKS)
- In Convex functions, `identity.subject` = `clerkUserId`
- Webhook handles profile/locale updates
- Client-side backstop: `users.ensureMe()` in case webhook is delayed
**Localization precedence:**
- User override in Settings wins
- Otherwise, device locale is used
**Admin authorization (MVP):**
- Hardcoded email allowlist (fastest for MVP)
- Post-MVP: Clerk Organizations/roles
---
## 🎯 Suggestion Engine Algorithm
### Inputs
- Location (required)
- Time range (optional)
- Budget range (optional)
- Radius (optional)
- Group type: solo | group | kids
- Indoor/Outdoor preference
- Required tags / Excluded tags
### Algorithm [WIP]
```
1. FILTER (hard requirements):
   - city matches OR within radiusKm of user location
   - status = "approved"
   - if event: startAt within time range
   - if activity: always included
   - budget within range OR priceMax = null
2. SCORE (soft ranking):
   - +20 points: tag matches user preferences
   - +15 points: category matches
   - +10 points: family friendly (if groupType = "kids")
   - +10 points: indoor/outdoor match
   - +5 points: per 10 favorites count
   - -5 points: same category as previous stop (diversity)
   - +distance penalty: closer = higher score
3. RETURN top 10 (we are showing 3 only, but in case the users skips most of them. we should return 20) scored events (excluding already selected)
```
### "Add Next Stop"
- Same algorithm but:
  - Exclude already-selected eventIds
  - Prefer events near last stop's location
  - Enforce max 5 stops
---
 
## Phase Overview

| Phase | Focus |
|-------|-------|
| **Phase 1** | Foundation (Monorepo, Auth, Schema) |
| **Phase 2** | Backend Core (Convex functions, Admin shell) |
| **Phase 3** | Mobile Core (Navigation, Home, Map) |
| **Phase 4** | Suggestion Engine + Plan Flow |
| **Phase 5** | Admin Dashboard Complete |
| **Phase 6** | Scraper + Ingestion |
| **Phase 7** | Polish, Testing, Launch Prep |

---

# 📱 MOBILE APP

## Phase 1: Mobile Foundation

### 1.1 Project Setup
- Initialize Turborepo monorepo structure
- Create `apps/mobile` with Expo (use latest stable SDK at project start)
- Configure TypeScript with strict mode
- Setup Unistyles with theme tokens
- Configure RTL support infrastructure
- Setup i18n with react-i18next (ar/en)
- Add Baloo Bhaijaan 2 font via expo-font

### 1.2 Convex Integration
- Install @convex-dev/react-native
- Configure Convex client
- Wire Convex auth to Clerk session (fetch Clerk JWT for Convex)
- Setup environment variables
- Create shared types in `packages/shared`

### 1.3 Clerk Authentication
- Install @clerk/clerk-expo
- Configure Google Sign-rIn
- Configure Apple Sign-In
- Configure Clerk JWT template for Convex (token used by Convex clients)
- Create auth context
- Build sign-in screen
- Handle auth state persistence

### 1.4 Navigation Shell
- Setup Expo Router with tabs
- Create 5 tab screens (empty shells):
  - `/home`
  - `/map`
  - `/suggest`
  - `/community` (placeholder, greyed out)
  - `/profile`
- Implement RTL tab order switching
- Add stack screens:
  - `/event/[id]`
  - `/plan/[id]`
  - `/settings`
  - `/auth/sign-in`
  - `/onboarding`

---

## Phase 3: Mobile Core Screens

### 3.1 Onboarding Flow
- Welcome screen with app intro
- Interest/taste selection (tags)
- Dislike selection (tags)
- City selection (dynamic from Convex)
- Location permission request
- Progress indicator
- Skip option
- Save to Convex user preferences
- Cache in MMKV

### 3.2 Home Tab
- Search bar with filter button
- Horizontal section components:
  - Tonight / This Weekend
  - Near You (location-based)
  - Trending in City
  - Upcoming Events
- Event card component (poster + badges)
- FlashList for performance
- Pull-to-refresh
- Loading skeletons
- Empty states

### 3.3 Map Tab
- Mapbox map integration
- Custom markers (event/activity icons)
- Marker clustering when zoomed out
- Filter chips (category, price, etc.)
- Bottom sheet preview on marker tap
- "Search this area" button
- My location button
- Event navigation (open in Google Maps)

### 3.4 Event Detail Screen
- Image gallery (Convex storage)
- Title + description (locale-aware)
- Tags + categories badges
- Price range display
- Indoor/outdoor indicator
- Family friendly badge
- Operating hours (for activities)
- "Book/Tickets" button → external URL
- "Directions" button → Google Maps
- Favorite toggle (heart)
- Share button

### 3.5 Profile Tab
- User avatar + name
- Saved plans list (FlashList)
- Favorites list (collapsible)
- Settings entry point
- Sign out button

### 3.6 Settings Screen
- Language toggle (Arabic/English)
- Default preferences editing
- Notification preferences
- About/version info
- Feedback form
- Sign out

---

## Phase 4: Suggestion Engine + Plans

### 4.1 Suggest/Plan Tab UI
- Constraint controls panel:
  - Group type selector (solo/group/kids)
  - Time range picker
  - Budget slider
  - Radius slider
  - Category/tag pills
- "Generate Suggestions" button
- Suggestion cards display:
  - Event card with full details
  - "Add to Plan" button (green)
  - "Skip" button (gray)
  - "Favorite" button (heart)
- Current plan preview (sidebar/bottom)
- "Add Next Stop" button (max 5)
- "Confirm Plan" button
- Cancel/reset button

### 4.2 Plan Creation Flow
1. User sets constraints
2. Tap "Generate" → call `suggest.getSuggestionDeck()`
3. Display 3 cards
4. User taps "Add to Plan" or "Skip"
5. If "Add to Plan" → add to local plan state
6. When < 3 cards visible, can tap "Add Next Stop"
7. Max 5 stops enforced
8. Tap "Confirm Plan" → call `plans.createPlan()`
9. Navigate to Plan Detail screen

### 4.3 Plan Detail Screen
- Timeline view of stops (vertical)
- Each stop shows:
  - Event thumbnail
  - Title + time
  - Note field (editable)
  - Navigate button
  - Remove from plan button
- Map preview showing all stops
- Share button (generate shareId)
- Total estimated duration
- "Start Navigation" → opens first stop in Maps

### 4.4 Plan Sharing
- Generate short shareId
- Create shareable link: `plantap.app/plan/{shareId}`
- Deep link handling in app
- Share modal (copy link, social share)
- Handle shared plan view (read-only for non-owner)

### 4.5 Notifications
- Setup expo-notifications
- If `plans.startAt` is set: schedule local reminder at `startAt - 2h`
- Permission request flow
- Notification tap → open plan detail

---

# 🖥️ ADMIN DASHBOARD

## Phase 2: Admin Foundation

### 2.1 Project Setup
- Create `apps/admin` with Vite + React
- Configure TypeScript
- Setup Tailwind CSS + shadcn/ui (admin only, optional)
- Configure Convex client
- Setup TanStack Router
- Setup TanStack Query

### 2.2 Admin Authentication
- Clerk web integration
- Admin access control: email allowlist (MVP) → Clerk roles/metadata (later)
- Use the same Clerk JWT template for Convex client auth
- Protected routes
- Login page
- Redirect if not admin

### 2.3 Layout Shell
- Sidebar navigation
- Header with user info
- Main content area
- Responsive design

---

## Phase 5: Admin Dashboard Complete

### 5.1 Events Management
**`/events/pending`**
- Table of pending events
- Quick preview on hover
- Approve/reject buttons
- Bulk actions
- Filters (provider, city, date)

**`/events/[id]`**
- Full event form (edit all fields)
- Image upload to Convex storage
- Approve/reject/delete actions
- View audit history
- Duplicate detection panel

**`/events`**
- Table of approved events
- Search + filters
- Edit/delete actions
- Status toggle

### 5.2 Import Tools
**`/import`**
- CSV upload form
- Field mapping UI
- Preview before import
- Import progress
- Error handling/reporting

### 5.3 User Management
**`/users`**
- User list table
- Search by name/email
- View user details
- Ban/unban actions
- View user's plans/favorites

### 5.4 Reports & Feedback
**`/reports`** (optional MVP)
- Reports list (events, users, posts)
- Report details
- Resolve/dismiss actions
- Link to reported content

**`/feedback`**
- Feedback inbox
- Mark as read/closed
- Reply via email (optional)

### 5.5 Cities Management
**`/cities`**
- City list table
- Add/edit cities
- Toggle active status
- View event count per city

### 5.6 Dashboard Home
**`/`**
- Stats cards (pending events, users, etc.)
- Recent activity
- Quick actions

---

# 🕷️ SCRAPER

## Phase 6: Scraper + Ingestion 

### 6.1 Scraper Project Setup
- Create `apps/scraper` with Node.js + TypeScript
- Install Playwright
- Setup Convex HTTP client
- Environment configuration
- Logging infrastructure

### 6.2 Target Sites (TBD based on research)
- Identify 3-5 Saudi event sites to scrape
- Document each site's structure
- Create scraper module per site

### 6.3 Scraper Architecture (Playwright)
```
apps/scraper/
├── src/
│   ├── index.ts           # Entry point
│   ├── scrapers/
│   │   ├── base.ts        # Base scraper class
│   │   ├── site-a.ts      # Site-specific scrapers
│   │   └── site-b.ts
│   ├── normalizer.ts      # Normalize to event schema
│   ├── convex-client.ts   # Push to Convex
│   └── utils/
├── package.json
└── tsconfig.json
```

### 6.4 Scraper Features
- Run on schedule (cron)
- Rate limiting per site
- Error handling + retries
- Confidence scoring
- Image download + upload to Convex
- Duplicate detection (URL-based)
- Status = "pending" (all scraped events)

### 6.5 API Ingestion
- Visit Saudi API integration
- Ticketmaster API integration (if available)
- Eventbrite API integration (if available)
- Activities source for MVP: scraped provider pages only (no paid APIs)
- Normalize to common format
- Push to Convex as pending

### 6.6 Deployment
- MVP: manual/local run (documented)
- Post-MVP: scheduled runner on a validated free tier that supports Playwright (e.g., GitHub Actions cron if feasible)
- Logging + monitoring
- Error alerting (email)

---

# 📦 SHARED PACKAGES

## packages/backend (Convex)

### Monorepo Layout (Recommended)

- Convex project root: `packages/backend`
- Convex source: `packages/backend/convex/`
- Generate API/types in `packages/backend/convex/_generated/`
- Run Convex commands from `packages/backend` (or via turbo scripts that set `cwd`)

### Schema Implementation
- Define all tables with indexes
- Type exports for mobile/admin

### User Functions
- `users.upsertFromClerk()` — HTTP action for webhook
- `users.getMe()` — get current user
- `users.ensureMe()` — backstop create user if webhook delayed
- `users.updatePreferences()`
- `users.updateDefaults()`
- `users.updateLocale()`

### Event Functions
- `events.getById()`
- `events.listHomeFeed()`
- `events.search()`
- `events.listNearby()`

### Plan Functions
- `plans.createPlan()`
- `plans.getPlan()`
- `plans.listMyPlans()`
- `plans.updatePlan()`
- `plans.deletePlan()`
- `plans.generateShareId()`
- `plans.getByShareId()`

### Favorite Functions
- `favorites.toggle()`
- `favorites.listMyFavorites()`
- `favorites.isFavorite()`

### Suggestion Engine
- `suggest.getSuggestionDeck()`
- `suggest.getNextStop()`
- Internal scoring functions

### Admin Functions
- `admin.listPendingEvents()`
- `admin.approveEvent()`
- `admin.rejectEvent()`
- `admin.updateEvent()`
- `admin.createEvent()`
- `admin.deleteEvent()`
- `admin.mergeEvents()`
- `admin.bulkImportCSV()`
- `admin.listUsers()`
- `admin.banUser()`
- `admin.unbanUser()`
- `admin.listReports()`
- `admin.resolveReport()`
- `admin.listCities()`
- `admin.upsertCity()`

### HTTP Endpoints
- `POST /clerk-webhook` — Clerk user sync
- `POST /ingest-event` — Scraper event push

**Security requirements (must-have):**
- `/clerk-webhook`: verify Clerk signature headers + reject old timestamps (replay protection).
- `/ingest-event`: require a shared secret (header or HMAC) stored in Convex env; rate limit by source.

---

## Geo Query Strategy (MVP)

- Compute `events.cellId` at ingestion (fixed grid cell derived from lat/lng; recommend ~2.5km cells, e.g. `floor(lat/0.02):floor(lng/0.02)`).
- Add composite index on `(city, cellId)` and query neighboring cells for radius/viewport features.
- Keep “city required” as the primary filter to avoid unbounded geo searches.

### Scheduled Functions
- Daily cleanup of expired events
- Weekly stats aggregation

---

## packages/shared

### Types
- User type
- Event type
- Plan type
- City type
- API response types

### Constants
- Category list (with Arabic translations)
- Tag list (with Arabic translations)
- Default values

### Utilities
- Distance calculation (haversine)
- Date formatting (locale-aware)
- Price formatting (SAR)
- Validation helpers

---

# ✅ Verification Plan

## Automated Tests

### Convex Functions (packages/backend)
```bash
corepack pnpm -C packages/backend exec convex dev --once  # Type check
```
- Test suggestion algorithm with mock data
- Test auth middleware
- Test plan creation constraints

### Mobile (apps/mobile)
```bash
cd apps/mobile
corepack pnpm ios -- --simulator
corepack pnpm android -- --emulator
```
- Manual testing on devices
- RTL layout verification

### Admin (apps/admin)
```bash
cd apps/admin
corepack pnpm run build  # Type check + build
corepack pnpm run dev    # Visual testing
```

## Manual Testing Checklist

### Auth Flow
- [ ] Sign in with Google
- [ ] Sign in with Apple
- [ ] User record created in Convex
- [ ] Sign out works
- [ ] Session persists on app restart

### Home Tab
- [ ] Sections load with events
- [ ] Search works
- [ ] Filters work
- [ ] Event tap → detail screen
- [ ] Empty state shows gracefully

### Map Tab
- [ ] Map renders with markers
- [ ] Marker tap shows preview
- [ ] Filters affect markers
- [ ] Clustering works when zoomed out
- [ ] Directions button works

### Suggest Flow
- [ ] Constraints can be set
- [ ] Generate returns cards
- [ ] Add to Plan works
- [ ] Skip removes card
- [ ] Max 5 stops enforced
- [ ] Confirm saves plan
- [ ] Plan appears in profile

### RTL (Arabic)
- [ ] Tab order reversed
- [ ] Text right-aligned
- [ ] Layouts mirrored
- [ ] Navigation feels natural

### Admin
- [ ] Login works (admin only)
- [ ] Events list loads
- [ ] Approve/reject works
- [ ] CSV import works
- [ ] User ban works

---

*Implementation plan complete. See IMPLEMENTATION-TASKS.md for detailed checklist.*
