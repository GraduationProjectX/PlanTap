# PlanTap — Implementation Tasks

> **Granular checklist for development**  
> **Legend**: `[ ]` = todo, `[/]` = in progress, `[x]` = done

---
## To Generate .APK Application after finishing everything without Deployment to App store or Google Store. 
# https://x.com/betomoedano/status/2044896666856088013
# https://codewithbeto.dev/blog/building-expo-apps-locally

Before anything else: if you're on Expo, your Debug builds include expo-dev-client. That's the screen with the "Development Servers" list and the "Enter URL manually" button. Great for development, useless for e2e or distributing a build to someone.

For anything where you want the app to launch straight into your actual UI, you need a Release build. This applies to both platforms.
Android: the easy one

From the android/ folder, Gradle does all the work:

cd android
./gradlew assembleRelease

The output lands at:

android/app/build/outputs/apk/release/app-release.apk

Install it on a connected device or emulator with:

adb install -r android/app/build/outputs/apk/release/app-release.apk

That's it. No signing config needed for local testing, Gradle will use the debug keystore by default if you haven't set up release signing.

# 📱 MOBILE APP TASKS

## Phase 1: Foundation

### 1.1 Monorepo Setup

- [x] Verify clean branching strategy + CI hooks
- [x] Create root `package.json` with workspaces
- [x] Install Turborepo
- [x] Create `turbo.json` configuration
- [x] Create folder structure:
  - [x] `apps/mobile/`
  - [x] `apps/website/`
  - [x] `apps/scraper/`
  - [x] `packages/backend/`
  - [x] `packages/shared/`
- [x] Configure shared TypeScript base config
- [x] Setup Oxlint (fast linting)
- [x] Setup Oxfmt (formatting)
- [x] Configure tsc --noEmit scripts (type checking)
- [x] Create `.gitignore` files
- [x] Verify `turbo run build` works

### 1.2 Mobile Project Init

- [x] `pnpm dlx create-expo-app@latest apps/mobile --template tabs`
- [x] Upgrade to the latest stable Expo SDK if needed
- [x] Configure TypeScript strict mode
- [x] Remove default template content
- [X] Setup path aliases (`@/components`, etc.)
- [x] Install and configure Unistyles
- [x] Create theme tokens file (colors, spacing, typography)
- [x] Create dark/light theme variants
- [x] Verify Unistyles working
- [x] Disable support for iPad and Android Tablets
- [ ] add react-native-fast-squircle and https://github.com/enzomanuelmangano/pressto

### 1.3 Font Setup

- [ ] Install expo-font
- [ ] Download Baloo Bhaijaan 2 (Regular, Medium, Bold)
- [ ] Add fonts to assets folder
- [ ] Configure font loading in app entry
- [ ] Create typography styles using font

### 1.4 i18n Setup

- [x] Install react-i18next + i18next
- [x] Install expo-localization
- [x] Create `locales/ar.json`
- [x] Create `locales/en.json`
- [x] Configure i18n initialization
- [x] Create useTranslation hook wrapper
- [x] Add language detection (device locale)
- [ ] Add language toggle hook
- [ ] Verify translations working

### 1.5 RTL Support

- [x] Configure RTL in app.json/app.config.js
- [x] Prefer built-in `I18nManager` + RTL-safe components (avoid extra deps unless required)
- [ ] Create RTL-aware layout components
- [x] Create `useDirection()` hook (returns "rtl" | "ltr") - **Now reactive via `useTranslation()`**
- [ ] Test RTL layout on simulator

### 1.6 Convex Setup

- [x] Create Convex project (convex.dev)
- [x] Install convex + @convex-dev/react-native
- [x] Copy Convex URL to environment
- [x] Configure ConvexProvider in app entry (with Clerk integration)
- [x] Create basic schema (packages/backend/convex/schema.ts) - users table with Clerk sync
- [x] Run `pnpm -C packages/backend dev` and verify connection
- [x] Test basic query from mobile

### 1.7 Clerk Setup

- [x] Create Clerk application (clerk.com)
- [x] Enable Google OAuth provider
- [x] Enable Apple OAuth provider
- [x] Install @clerk/clerk-expo
- [x] Add Clerk publishable key to env
- [x] Configure `ClerkProvider` + `tokenCache` in app entry
- [x] Configure `ConvexProviderWithClerk` integration
- [x] Setup `Stack.Protected` guards for `(auth)` and `(main)` routes
- [x] Create sign-in screen with OAuth buttons (Apple + Google)
- [x] Implement webhook handler for user sync (`http.ts`)
- [x] Create `users.ts` Convex functions (current, addOrUpdateUser, deleteUser)
- [x] Configure Clerk auth in Convex (`auth.config.ts`)
- [x] Test sign-in flow (basic) - **Ready for testing**

### 1.7.5 Sentry Setup

- [x] Create Sentry project (sentry.io)
- [x] Install @sentry/react-native
- [x] Configure Sentry in app entry
- [x] Test error reporting

### 1.8 Navigation Shell

- [x] Setup Expo Router file structure
- [x] Create `app/_layout.tsx` (root layout) - **Uses `Stack.Protected` for auth guards**
- [x] Create `app/(auth)/_layout.tsx` (auth route guard)
- [x] Create `app/(main)/_layout.tsx` (signed-in route shell)
- [x] Create `app/(main)/(tabs)/_layout.tsx` (tab navigator)
- [x] Create tab screens (temporary placeholders):
  - [x] `app/(main)/(tabs)/index.tsx` (home)
  - [x] `app/(main)/(tabs)/map.tsx`
  - [x] `app/(main)/(tabs)/suggest.tsx`
  - [x] `app/(main)/(tabs)/community.tsx` (disabled)
  - [x] `app/(main)/(tabs)/profile.tsx`
- [x] Configure tab bar icons (FontAwesome)
- [x] Implement RTL tab order switching
- [x] Create stack screens (temporary placeholders):
  - [x] `app/(main)/event/[id].tsx`
  - [x] `app/(main)/plan/[id].tsx`
  - [x] `app/(main)/settings/index.tsx`
  - [x] `app/(auth)/sign-in.tsx`
  - [ ] `app/onboarding/index.tsx`
- [x] Configure navigation options (headers, etc.)
- [x] Test navigation flow - **Ready for testing**

### 1.9 Local Storage

- [x] Install react-native-mmkv
- [x] Create storage helper utilities
- [x] Create keys constants
- [x] Test storage save/load

### 1.10 State Management

- [x] Install zustand
- [x] Create UI state store 
- [x] Create auth state store (user info cache)
- [x] Test store updates

---

## Phase 3: Core Screens

- [] Theming need to be fixed and changes only via Settings(Light,Dark, System options).
- [] Add app Icon in Login and app Logo.
### 3.2 Onboarding Flow

- [ ] Check react-native-onboarding
- [ ] Create onboarding navigator/flow
- [ ] Welcome screen (app intro, continue button)
- [ ] Interests screen (tag multi-select)
- [ ] Dislikes screen (tag multi-select)
- [ ] City screen (dropdown or search)
- [ ] Location permission screen (request)
- [ ] Progress indicator component
- [ ] Back navigation between steps
- [ ] Skip option (goes to home)
- [ ] Save preferences to Convex
- [ ] Cache completion flag in MMKV
- [ ] Redirect logic (show if not completed)

### 3.3 Home Tab

- [x] Create home screen layout
- [x] Implement search bar
- [x] Create horizontal section component
- [x] Create event poster card component
- [x] Integrate FlashList for horizontal scrolling
- [x] Add loading skeletons
- [x] Add empty states per section
- [x] Implement filter modal
- [x] Connect to Convex queries

### 3.4 Event Detail Screen

- [ ] Create detail screen layout
- [ ] Image gallery/carousel (Expo Image)
- [ ] Title + description (locale-aware)
- [ ] Tags/categories display
- [ ] Price range badge
- [ ] Indoor/outdoor badge
- [ ] Family friendly badge
- [ ] Operating hours (if activity)
- [ ] "Book/Tickets" button → Linking to URL
- [ ] "Directions" button → Google Maps intent
- [ ] Favorite toggle (heart icon)
- [ ] Share button
- [ ] Back navigation
- [ ] Connect to Convex query

### 3.5 Map Tab

- [x] Install @rnmapbox/maps
- [x] Configure Mapbox token
- [x] Create map screen layout
- [x] Initialize map with user location
- [x] Create custom marker component
- [x] Fetch events for visible area
- [x] Render markers on map
- [x] Implement marker clustering
- [x] Create filter chip bar
- [x] Create bottom sheet preview on marker tap
- [x] My location button
- [x] Navigation to event detail on tap
- [x] Test performance with many markers

### 3.6 Profile Tab

- [ ] Create profile screen layout
- [ ] User info section (avatar, name)
- [ ] Saved plans section (FlashList)
- [ ] Favorites section (collapsible)
- [ ] Settings button
- [ ] Sign out button
- [ ] Connect to Convex queries

### 3.7 Settings Screen

- [ ] Create settings screen layout
- [ ] Language toggle (Arabic/English)
- [ ] Edit default preferences
- [ ] Notification preferences toggle
- [ ] About section (version, etc.)
- [ ] Feedback form (submit to Convex)
- [ ] Sign out confirmation
- [ ] Back navigation

---

## Phase 4: Suggestion Engine

### 4.1 Suggest Tab UI

- [ ] Create suggest screen layout
- [ ] Create constraint controls panel:
  - [ ] Group type selector (solo/group/kids)
  - [ ] Time range picker
  - [ ] Budget slider (min/max)
  - [ ] Radius slider
  - [ ] Category/tag pills (multi-select)
- [ ] "Generate Suggestions" button
- [ ] Loading state for generation

### 4.2 Suggestion Cards

- [ ] Create suggestion card component
- [ ] Event thumbnail image
- [ ] Event title + brief details
- [ ] "Add to Plan" button (green)
- [ ] "Skip" button (gray)
- [ ] "Favorite" button (heart)
- [ ] Animation for card removal

### 4.3 Plan Building UI

- [ ] Create plan preview component (shows current stops)
- [ ] Show stop count (X/5)
- [ ] "Add Next Stop" button
- [ ] Disable when 5 stops reached
- [ ] "Confirm Plan" button
- [ ] "Cancel" / reset button
- [ ] Plan name input (optional)

### 4.4 Integration

- [ ] Connect to `suggest.getSuggestionDeck()` query
- [ ] Handle empty results
- [ ] Handle card selection (add to local state)
- [ ] Handle skip (remove from deck)
- [ ] Connect to `suggest.getNextStop()` for add next
- [ ] Connect to `plans.createPlan()` mutation
- [ ] Navigate to plan detail on confirm

### 4.5 Plan Detail Screen

- [ ] Create plan detail layout
- [ ] Timeline view of stops (vertical list)
- [ ] Stop item component:
  - [ ] Event thumbnail
  - [ ] Title + time
  - [ ] Note field (editable)
  - [ ] Navigate button
  - [ ] Remove button (if owner)
- [ ] Map preview with all stop markers
- [ ] Share button
- [ ] "Start Navigation" button
- [ ] Edit mode toggle (reorder stops)
- [ ] Delete plan button
- [ ] Connect to Convex queries/mutations

### 4.6 Sharing

- [ ] Generate shareId on save
- [ ] Create share modal
- [ ] Copy link to clipboard
- [ ] Native share sheet
- [ ] Deep link configuration (app.json)
- [ ] Handle incoming deep links
- [ ] Read-only view for shared plans

### 4.7 Notifications

- [ ] Install expo-notifications
- [ ] Configure notification permissions
- [ ] Add optional plan start time (`startAt`) UI
- [ ] If `startAt` set: schedule reminder at `startAt - 2h`
- [ ] Handle notification tap → open plan
- [ ] Cancel notification on plan delete

---

# 🖥️ ADMIN DASHBOARD TASKS

## Phase 2: Admin Foundation

### 2.1 Project Setup

- [ ] Create `apps/admin` with Vite + React
- [ ] Configure TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Setup path aliases
- [ ] Install TanStack Router
- [ ] Install TanStack Query
- [ ] Configure Convex client
- [ ] Create basic layout structure

### 2.2 Clerk Admin Auth

- [ ] Install @clerk/clerk-react
- [ ] Configure Clerk provider
- [ ] Create login page
- [ ] Implement admin check (MVP: email allowlist; later: Clerk role/metadata)
- [ ] Protected route wrapper
- [ ] Redirect non-admins

### 2.3 Layout Components

- [ ] Sidebar navigation component
- [ ] Header with user info
- [ ] Main content wrapper
- [ ] Breadcrumb component
- [ ] Mobile responsive sidebar

---

## Phase 5: Admin Features

### 5.1 Events - Pending Queue

- [ ] Create `/events/pending` page
- [ ] Events table with pagination
- [ ] Search input
- [ ] Filter dropdowns (provider, city)
- [ ] Row expand for preview
- [ ] Quick approve/reject buttons
- [ ] Bulk selection
- [ ] Bulk approve/reject
- [ ] Connect to Convex queries

### 5.2 Events - Single Event

- [ ] Create `/events/[id]` page
- [ ] Full event edit form:
  - [ ] Title (en/ar)
  - [ ] Description (en/ar)
  - [ ] Type (event/activity)
  - [ ] Categories multi-select
  - [ ] Tags multi-select
  - [ ] Date/time pickers
  - [ ] City dropdown
  - [ ] Location (lat/lng/address)
  - [ ] Price range inputs
  - [ ] Indoor/outdoor select
  - [ ] Family friendly toggle
  - [ ] Booking URL input
  - [ ] Phone input
  - [ ] Operating hours inputs
- [ ] Image upload to Convex storage
- [ ] Image gallery management
- [ ] Approve button
- [ ] Reject button
- [ ] Save changes button
- [ ] Delete button (with confirm)
- [ ] Audit history panel
- [ ] Duplicate detection panel
- [ ] Connect to Convex mutations

### 5.3 Events - All Events

- [ ] Create `/events` page
- [ ] Events table (approved only by default)
- [ ] Filter by status
- [ ] Search
- [ ] Edit button → goes to /events/[id]
- [ ] Quick status toggle

### 5.4 Import

- [ ] Create `/import` page
- [ ] CSV file upload
- [ ] Column mapping UI
- [ ] Preview table
- [ ] Import button
- [ ] Progress indicator
- [ ] Error reporting
- [ ] Success confirmation

### 5.5 Users

- [ ] Create `/users` page
- [ ] Users table with pagination
- [ ] Search by name/email
- [ ] View user details (expand or modal)
- [ ] Ban button
- [ ] Unban button
- [ ] View user's plans/favorites

### 5.6 Reports (Optional MVP)

- [ ] Create `/reports` page
- [ ] Reports table
- [ ] Filter by status
- [ ] Filter by type
- [ ] Report detail view
- [ ] Link to reported content
- [ ] Resolve button
- [ ] Dismiss button
- [ ] Notes field

### 5.7 Feedback

- [ ] Create `/feedback` page
- [ ] Feedback inbox list
- [ ] Status filter
- [ ] Mark as read
- [ ] Mark as closed
- [ ] Reply option (optional)

### 5.8 Cities

- [ ] Create `/cities` page
- [ ] Cities table
- [ ] Add city form
- [ ] Edit city
- [ ] Toggle active status
- [ ] Event count per city

### 5.9 Dashboard Home

- [ ] Create `/` (dashboard) page
- [ ] Stats cards:
  - [ ] Pending events count
  - [ ] Total approved events
  - [ ] Total users
  - [ ] Open reports
- [ ] Recent activity feed
- [ ] Quick action buttons

---

# 🕷️ SCRAPER TASKS

## Phase 6: Scraper

### 6.1 Project Setup

- [ ] Create `apps/scraper` folder
- [ ] Initialize Node.js project
- [ ] Configure TypeScript
- [ ] Install Playwright
- [ ] Install node-cron (or similar)
- [ ] Setup Convex HTTP client
- [ ] Create environment config
- [ ] Setup logging (pino or winston)

### 6.2 Architecture

- [ ] Create `src/index.ts` entry point
- [ ] Create base scraper class
- [ ] Create normalizer module
- [ ] Create Convex client wrapper
- [ ] Create error handler
- [ ] Create rate limiter utility

### 6.3 Scraper Implementation

- [ ] Research Saudi event websites to scrape
- [ ] Document target site structures
- [ ] Implement scraper for site 1
- [ ] Implement scraper for site 2
- [ ] Implement scraper for site 3 (optional)
- [ ] Image downloading
- [ ] Image upload to Convex storage
- [ ] Data normalization to event schema
- [ ] Compute `cellId` from lat/lng during normalization
- [ ] Confidence scoring
- [ ] Duplicate detection (by URL)
- [ ] Push to Convex as pending

### 6.4 API Ingestion (Optional)

- [ ] Research Visit Saudi API availability
- [ ] Implement Visit Saudi ingestion (if available)
- [ ] Research Ticketmaster Saudi coverage
- [ ] Implement Ticketmaster ingestion (if available)
- [ ] Research Eventbrite Saudi coverage
- [ ] Implement Eventbrite ingestion (if available)
- [ ] Avoid paid APIs for MVP (e.g., Google Places)

### 6.5 Scheduling

- [ ] Configure cron schedule (daily)
- [ ] Create run script
- [ ] Error handling and retries
- [ ] Logging to file

### 6.6 Deployment

- [ ] Research no-cost scheduling/hosting options that run Playwright (e.g., GitHub Actions cron)
- [ ] Create deployment config
- [ ] Setup environment variables
- [ ] Deploy and test
- [ ] Setup monitoring/alerts

---

# 📦 BACKEND TASKS (packages/backend)

## Phase 2: Convex Schema & Functions

### Schema

- [ ] Create `schema.ts` with all tables:
  - [ ] `users` table with indexes
  - [ ] `events` table with indexes (including `cellId`, `favoritesCount`)
  - [ ] `plans` table with indexes (including optional `startAt` for reminders)
  - [ ] `favorites` table with indexes
  - [ ] `feedback` table
  - [ ] `reports` table
  - [ ] `cities` table
  - [ ] `adminActions` table
- [ ] Geo indexing:
  - [ ] Compute `cellId` at ingestion: `"${floor(lat/0.02)}:${floor(lng/0.02)}"`
  - [ ] Index events by `(city, cellId)` for radius/viewport queries
- [ ] Favorites counter:
  - [ ] `events.favoritesCount` (default 0, maintained by toggle mutation)
  - [ ] Index favorites by `(userId, eventId)` for unique lookup
- [ ] Export types

### User Functions

- [ ] `users.ts`:
  - [ ] `getMe()` query
  - [ ] `updatePreferences()` mutation
  - [ ] `updateDefaults()` mutation
  - [ ] `updateLocale()` mutation

### Event Functions

- [ ] `events.ts`:
  - [ ] `getById()` query
  - [ ] `listHomeFeed()` query
  - [ ] `search()` query
  - [ ] `listNearby()` query
  - [ ] Ensure radius/nearby queries prefilter via `(city, cellId)`

### Plan Functions

- [ ] `plans.ts`:
  - [ ] `createPlan()` mutation
  - [ ] `getPlan()` query
  - [ ] `listMyPlans()` query
  - [ ] `updatePlan()` mutation
  - [ ] `deletePlan()` mutation
  - [ ] `generateShareId()` mutation
  - [ ] `getByShareId()` query

### Favorite Functions

- [ ] `favorites.ts`:
  - [ ] `toggle()` mutation
  - [ ] Maintain `events.favoritesCount` (increment/decrement, never negative)
  - [ ] `listMyFavorites()` query
  - [ ] `isFavorite()` query

### Suggestion Engine

- [ ] `suggest.ts`:
  - [ ] `getSuggestionDeck()` query
  - [ ] `getNextStop()` query
  - [ ] Scoring algorithm implementation

### Admin Functions

- [ ] `admin.ts`:
  - [ ] `listPendingEvents()` query
  - [ ] `approveEvent()` mutation
  - [ ] `rejectEvent()` mutation
  - [ ] `updateEvent()` mutation
  - [ ] `createEvent()` mutation
  - [ ] Ensure admin mutations compute `events.cellId` from lat/lng
  - [ ] `deleteEvent()` mutation
  - [ ] `mergeEvents()` mutation
  - [ ] `bulkImportCSV()` action
  - [ ] `listUsers()` query
  - [ ] `banUser()` mutation
  - [ ] `unbanUser()` mutation
  - [ ] `listReports()` query
  - [ ] `resolveReport()` mutation
  - [ ] `listCities()` query
  - [ ] `upsertCity()` mutation
  - [ ] `listFeedback()` query
  - [ ] `closeFeedback()` mutation

### HTTP Endpoints

- [ ] `http.ts`:
  - [ ] POST `/ingest-event` (for scraper)
- [ ] Enforce endpoint auth:
  - [ ] Require shared secret/HMAC on `/ingest-event`

### File Storage

- [ ] Configure Convex file storage
- [ ] Create `storage.ts`:
  - [ ] `generateUploadUrl()` mutation
  - [ ] `getImageUrl()` query

---

# 📦 SHARED PACKAGE TASKS (packages/shared)

### Types

- [x] Create `types/user.ts`
- [x] Create `types/event.ts`
- [x] Create `types/plan.ts`
- [ ] Create `types/city.ts`
- [x] Create `types/index.ts` (re-exports)

### Constants

- [ ] Create `constants/categories.ts` (with ar/en)
- [ ] Create `constants/tags.ts` (with ar/en)
- [ ] Create `constants/defaults.ts`
- [ ] Create `constants/index.ts`

### Utilities

- [ ] Create `utils/distance.ts` (haversine)
- [ ] Create `utils/format.ts` (date, price, locale-aware)
- [ ] Create `utils/validation.ts`
- [ ] Create `utils/index.ts`

---

# ✅ TESTING & POLISH

### Mobile Testing

- [ ] Improve the transition performance between tabs.

- [ ] Check Maestro and https://github.com/bamlab/flashlight
- [ ] Test auth flow end-to-end
- [ ] Test onboarding flow
- [ ] Test home tab loading
- [ ] Test event detail screen
- [ ] Test map with markers
- [ ] Test suggestion flow
- [ ] Test plan creation
- [ ] Test plan sharing
- [ ] Test notifications
- [ ] Test RTL layout (Arabic)
- [ ] Test on iOS device
- [ ] Test on Android device

### Admin Testing

- [ ] Test admin login
- [ ] Test event approval flow
- [ ] Test CSV import
- [ ] Test user management
- [ ] Test reports/feedback

### Scraper Testing

- [ ] Test manual run
- [ ] Test scheduled run
- [ ] Verify events appear in admin queue

### Securty

- [ ] Security Scanner https://www.rnsec.dev and deep research on how to make API/Website/App secure and safe.

### Performance

- [ ] Expo Atlas
- [ ] Profile mobile app (Flipper)
- [ ] Optimize slow queries
- [ ] Verify map clustering
- [ ] Verify FlashList performance

### Final Polish

- [x] Check react-native-screen-transitions
- [ ] Fix any UI inconsistencies
- [ ] Add loading states everywhere
- [ ] Add error handling everywhere
- [ ] Review accessibility
- [ ] Final RTL review
- [ ] App icon + splash screen
- [ ] Build release candidates

---

_Total : ~350 tasks across all apps_


