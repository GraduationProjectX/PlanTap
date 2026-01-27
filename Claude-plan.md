# PlanTap — Final Specification (Claude Review)

> **Graduation Project** — React Native + Expo + Convex + Clerk  
> **Target**: Saudi Arabia locals  
> **MVP Focus**: Discover → Suggest → Save Plans → Share → Navigate  
> **Review Date**: January 27, 2026

---

## ✅ Finalized Decisions

| Decision | Choice |
|----------|--------|
| Monorepo Tool | **Turborepo** |
| Selection UI | **Buttons** (Add to Plan / Skip) — no swipe gestures |
| Primary Language | **Arabic-first** with **auto-detection** (ar/en based on device) |
| RTL Support | **Full RTL** when Arabic (tabs reversed, layouts mirrored) |
| Font | **Baloo Bhaijaan 2** |
| Offline Mode | **No** |
| Max Plan Stops | **5** |
| Manual Plan Creation | **Post-MVP** |
| Component Library (Mobile) | **None** — Unistyles only |
| Admin UI Kit | **shadcn/ui (optional)** + Tailwind (admin only) |
| Clerk → Convex Sync | **Webhooks** |
| HTTP Endpoint Auth | **Clerk signature verify** (webhook) + **shared secret** (ingest) |
| Image Storage | **Convex File Storage** |
| Cities | **Dynamic** — from database (scraped/API) |
| Map Provider | **Mapbox** (< 300 users expected) |
| Geo Query Strategy | **City-first + grid cell index** (radius/viewport queries via `cellId`) |
| Analytics | **PostHog** |
| Scraper | **MVP: manual/local runs** → **Post-MVP: hosted automation** |
| Team Size | **2-3** (no work split, full-stack) |
| Timeline | **5 months** |
| Budget | **$0** (free tiers only) |

---

## Non-Negotiables (Implementation Guardrails)

- No unauthenticated writes: all Convex HTTP endpoints must verify signatures/secrets.
- Geo features must not rely on full-table scans in hot paths; use indexed prefiltering (`city` + `cellId`).
- “$0” means: MVP must not incur charges; any feature that needs a paid plan must be explicitly marked Post-MVP.

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
│   └── shared/          # Shared types, utils, constants
├── turbo.json
└── package.json
```

---

## 📱 Tech Stack (Final)

### Mobile App
- Expo (latest stable SDK) + Expo Router
- TypeScript
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
- i18n (react-i18next) for Arabic/English

### Admin Dashboard
- React + Vite
- TanStack Router + Query
- Convex client
- Clerk web auth
- Tailwind CSS (admin only)

### Scraper
- Node.js + TypeScript
- Playwright
- Convex HTTP client
- Cron scheduling
- MVP: manual/local runs; Post-MVP: hosted automation on a proven free tier

### Backend (Convex)
- Schema with indexes
- Functions (queries, mutations, actions)
- HTTP endpoints for webhooks
- File storage for images
- Scheduled functions for ingestion

---

## 📊 Data Model (Updated)

### `users`
```typescript
{
  clerkUserId: string
  displayName: string
  avatarUrl?: string
  locale: "ar" | "en"  // NEW
  city?: string
  preferences: { likedTags: string[]; dislikedTags: string[] }
  defaults: {
    budgetMin?: number
    budgetMax?: number
    radiusKm?: number
    groupType?: "solo" | "group" | "kids"
    indoorOutdoor?: "indoor" | "outdoor" | "mixed" | "any"
  }
  pushToken?: string  // NEW
  onboardingCompletedAt?: number  // NEW
  lastActiveAt?: number  // NEW
  createdAt: number
}
```

### `events`
```typescript
{
  title: string
  titleAr?: string  // NEW - Arabic title
  descriptionShort?: string
  descriptionShortAr?: string  // NEW
  type: "event" | "activity"
  categories: string[]
  tags: string[]
  startAt?: number
  endAt?: number
  city: string
  location: { lat: number; lng: number; address?: string; addressAr?: string }
  cellId: string  // NEW - derived grid cell for geo queries
  priceMin?: number
  priceMax?: number
  indoorOutdoor: "indoor" | "outdoor" | "mixed" | "unknown"
  familyFriendly?: boolean
  bookingRequired?: boolean
  bookingUrl?: string  // NEW
  phone?: string  // NEW
  operatingHours?: { day: number; open: string; close: string }[]  // NEW
  duration?: number  // NEW - estimated minutes
  provider: "visitsaudi" | "ticketmaster" | "eventbrite" | "places" | "scraped" | "manual"  // "places" = scraped place listings (not Google Places API)
  providerUrl?: string
  images: Id<"_storage">[]  // CHANGED - Convex storage IDs
  favoritesCount: number  // NEW - maintained by favorites toggle (default 0)
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

**Geo indexing note (MVP):** compute `cellId` at ingestion time from `location.lat/lng` using a fixed-size grid (recommend ~2.5km). Example: `cellId = "${floor(lat/0.02)}:${floor(lng/0.02)}"`. Index events by `(city, cellId)` to support radius/viewport queries by fetching neighboring cells.

### `plans`
```typescript
{
  userId: Id<"users">
  title: string
  status: "draft" | "saved" | "completed"  // NEW
  stops: { eventId: Id<"events">; note?: string; order: number }[]
  startAt?: number  // NEW - used for reminders (optional for MVP)
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
  startLocation?: { lat: number; lng: number }  // NEW
  shareId: string
  createdAt: number
}
```

### `favorites` (NEW)
```typescript
{
  userId: Id<"users">
  eventId: Id<"events">
  createdAt: number
}
```

### `feedback` (NEW - MVP minimal)
```typescript
{
  userId?: Id<"users">  // allow anonymous feedback
  message: string
  status: "open" | "closed"
  createdAt: number
}
```

### `reports` (NEW - optional MVP)
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

### `cities` (NEW)
```typescript
{
  name: string       // English name
  nameAr: string     // Arabic name
  region?: string    // Saudi region
  lat: number
  lng: number
  active: boolean
}
```

### `adminActions` (NEW - Audit Log)
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

## 🎨 UI Decisions

### Selection Flow (Suggest Tab)
Instead of swipe gestures, use explicit buttons:
- **✓ Add to Plan** (green button) — adds event to current plan
- **✗ Skip** (gray/red button) — removes from deck
- **♥ Favorite** (heart icon) — adds to favorites (optional)

### RTL Layout (Arabic)
When locale = "ar":
- Tab bar order reversed (Profile on LEFT, Home on RIGHT)
- All horizontal lists/layouts flip direction
- Text alignment right-to-left
- Back buttons on right side
- Navigation animations reversed

### Tab Order
**LTR (English)**: Home | Map | Suggest | Community | Profile  
**RTL (Arabic)**: Profile | Community | Suggest | Map | Home

---

## 🔐 Auth Flow (Clerk Webhooks)

```
1. User signs in via Clerk (mobile)
2. Clerk triggers webhook → Convex HTTP endpoint
3. Convex creates/updates user record
4. Mobile app syncs user data via Convex query
5. Session management handled by Clerk SDK
```

**Convex auth integration (must specify up front):**
- Use Clerk JWTs to authenticate Convex requests (configure a Clerk JWT template for Convex + set Convex auth/JWKS).
- In Convex functions, treat `identity.subject` as `clerkUserId`.
- Webhook sync handles profile/locale updates; add a client-side backstop (`users.ensureMe()`) in case the webhook is delayed.

---

## 🎯 Suggestion Engine (Final Spec)

### Inputs
- City (required)
- Time range (optional)
- Budget range (optional)
- Radius (optional)
- Group type: solo | group | kids
- Indoor/Outdoor preference
- Required tags
- Excluded tags

### Algorithm
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

3. RETURN top 3 scored events (excluding already selected)
```

### "Add Next Stop"
- Same algorithm but:
  - Exclude already-selected eventIds
  - Prefer events near last stop's location
  - Check total plan doesn't exceed 5 stops

---

## 📋 What Changed from Codex Plan

| Area | Before | After |
|------|--------|-------|
| Selection UI | Swipe gestures | Buttons |
| Images | External URLs | Convex Storage |
| Cities | Hardcoded or free text | Database table |
| Auth sync | Not specified | Webhook-based |
| Language | Not specified | Arabic-first, bilingual |
| RTL | Not mentioned | Full RTL support |
| Plan status | Not tracked | draft/saved/completed |
| Audit log | Not included | adminActions table |
| Font | Not specified | Baloo Bhaijaan 2 |

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Mapbox exceeds free tier | Monitor usage, < 300 users keeps us safe |
| Arabic font rendering issues | Test on real devices early |
| Scraper breaks | Manual import fallback always available |
| Convex limits hit | Free tier is 1M function calls/month — should be fine |
| Clerk limits hit | Free tier is 10k MAU — should be fine |

---

## 📁 See Also

- [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) — Step-by-step implementation guide
- [IMPLEMENTATION-TASKS.md](./IMPLEMENTATION-TASKS.md) — Granular task checklist
- [Codex-Plan-2.md](./Codex-Plan-2.md) — Original specification

---

*Final specification approved. Ready for implementation.*
