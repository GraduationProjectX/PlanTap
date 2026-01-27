# PlanTap — Implementation Plan

> **Timeline**: 5 months  
> **Team**: 2-3 developers (full-stack, no split)  
> **Budget**: $0 (free tiers only)

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
- Configure Google Sign-In
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
  - Family Picks
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

### 4.1 Suggest Tab UI
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
npx convex dev --once  # Type check
```
- Test suggestion algorithm with mock data
- Test auth middleware
- Test plan creation constraints

### Mobile (apps/mobile)
```bash
cd apps/mobile
npx expo run:ios --simulator
npx expo run:android --emulator
```
- Manual testing on devices
- RTL layout verification

### Admin (apps/admin)
```bash
cd apps/admin
npm run build  # Type check + build
npm run dev    # Visual testing
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
