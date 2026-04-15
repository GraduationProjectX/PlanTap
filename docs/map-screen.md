# Map Screen Plan

> Scope: `apps/mobile/app/(main)/(tabs)/map.tsx` and supporting nearby map flow
> Goal: nearby events/activities map with marker selection, horizontal carousel, and `Show Details` CTA into the existing event detail route

---

## Summary

Build the map tab around Mapbox with a tight marker <-> carousel sync:

- user lands on a live map centered on their location or best fallback city
- nearby approved events/activities render as markers
- tapping a marker selects the event, recenters the map, and reveals a horizontal carousel
- swiping the carousel updates the selected marker and camera target
- the selected card shows a `Show Details` button that opens the existing `event/[id]` screen
- map supports clustering, visible-area refresh, category filters, and a `Search this area` flow

Use Google Maps only for external directions from the existing event detail screen, not for the in-app map UI.

---

## Scope

### In scope

- real map implementation in `apps/mobile/app/(main)/(tabs)/map.tsx`
- Mapbox setup and token wiring
- nearby events query contract for viewport or radius search
- custom markers and selected marker state
- horizontal nearby-events carousel using existing event card patterns
- marker tap -> card sync -> `Show Details` navigation
- my location control, search-this-area control, loading and empty states
- RTL, localization, and dark mode verification

### Out of scope

- full event detail redesign
- route-level navigation changes outside the map tab
- manual plan creation from the map
- turn-by-turn navigation inside the app
- paid places or geocoding APIs

---

## Current State

- `apps/mobile/app/(main)/(tabs)/map.tsx` is still a placeholder screen
- the map tab already exists in `apps/mobile/app/(main)/(tabs)/_layout.tsx`
- event detail navigation already exists via `/event/[id]`
- reusable event UI already exists in `apps/mobile/components/events/EventCard.tsx`
- horizontal carousel behavior already exists in `apps/mobile/components/home/OngoingEventsCarousel.tsx`
- user location utilities currently stop at city detection in `apps/mobile/services/location.ts`
- backend event queries currently support only all-events or city-filtered reads in `packages/backend/convex/events.ts`
- schema already includes `locationLat` and `locationLng` in `packages/backend/convex/schema.ts`
- repo planning docs already chose Mapbox and city + `cellId` geo prefiltering

---

## Product UX

### Primary flow

1. Open map tab
2. Request foreground location permission if not resolved yet
3. Center camera on user position when available, otherwise fall back to selected city center
4. Render markers and clusters
5. Tap marker -> select event -> highlight marker -> reveal carousel card
6. Swipe carousel -> update selected event -> animate map to that event
7. Tap `Show Details` -> push `/event/[id]`

### Secondary controls

- `My Location` button recenters on current user coordinates
- Search bar at the top with filter chips below the Search Bar.
- filter chips refine visible markers by category and event type
- tapping the map background clears selection but keeps markers and filters active

### Empty and fallback behavior
- i want to make the user to select show events or activities or show all. but whats the best approach
- no permission: show lightweight prompt plus all events/activies
- no nearby events: show city events/activities. if none, show any or all events/activities
- loading: show map shell immediately, then overlay subtle loading feedback rather than blocking the whole screen

---

## Target UI Structure

From back to front:

1. Full-screen Mapbox map
2. Top overlay with search-this-area and filter chips
3. Floating my-location button
4. Marker layer with selected state and clustering
5. Bottom horizontal carousel for nearby events
6. Selected event card action row with `Show Details`

Notes:

- keep the map visually dominant; carousel should feel like a lightweight overlay, not a full bottom sheet
- selected marker and selected card must always stay in sync
- use existing typography, spacing, and theme tokens so this screen feels native to the app

---

## Frontend Data Contract

Treat the following as the intended UI contract.

### `useMapEvents(...)`

Returns:

- `events`
- `isLoading`
- `isRefreshing`
- `hasSearchedArea`
- `lastFetchedBounds`
- `refreshForBounds(bounds)`

### Suggested arguments

- `city`
- `bounds`
- `selectedCategory`
- `types` (`event`, `activity`, or both)
- optional `limit`

### Event shape used by the map UI

Existing event fields are already enough for v1:

- `_id`
- `title`
- `titleAr`
- `type`
- `categories`
- `startAt`
- `endAt`
- `city`
- `locationLat`
- `locationLng`
- `locationAddress`
- `locationAddressAr`
- `images`
- `rating`

### Local screen state

The map screen should own:

- `selectedEventId`
- `visibleBounds`
- `pendingBounds`
- `selectedCategory`
- `selectedTypes`
- `userCoordinates`
- `hasLocationPermission`
- `isFollowingUser`

---

## Architecture Decisions

### Map SDK

- use `@rnmapbox/maps`
- do not build the in-app experience with Google Maps
- keep Google Maps URL handoff only in the detail screen

### Data strategy

- do not fetch all events then filter on device
- query by city plus neighboring `cellId`s or viewport-derived cell ranges
- keep backend reads bounded and index-friendly
- keep map fetch logic separate from `useEvents()` so home and list screens remain unchanged

### Selection model

- one selected event at a time
- marker selection drives carousel index
- carousel momentum end drives selected marker and camera target
- background map taps clear the selected event when that feels natural in testing

### Card reuse

- reuse `EventCard` visual language
- add a map-specific presentation only if the current `medium` variant cannot support a compact CTA cleanly
- prefer the smallest diff: start from `medium`, add optional `footerActionLabel` and `onFooterActionPress` only if needed

---

## Files To Update Or Add

### Update

- `apps/mobile/app/(main)/(tabs)/map.tsx`
- `apps/mobile/app/(main)/(tabs)/_layout.tsx` if tab options need map-specific tweaks
- `apps/mobile/components/events/EventCard.tsx`
- `apps/mobile/services/location.ts`
- `apps/mobile/locales/en.json`
- `apps/mobile/locales/ar.json`
- `packages/backend/convex/schema.ts`
- `packages/backend/convex/events.ts`

### Add

- `apps/mobile/hooks/use-map-events.ts`
- `apps/mobile/components/map/map-view-shell.tsx`
- `apps/mobile/components/map/map-marker.tsx`
- `apps/mobile/components/map/map-cluster-marker.tsx`
- `apps/mobile/components/map/map-carousel.tsx`
- `apps/mobile/components/map/map-filter-bar.tsx`
- `apps/mobile/components/map/map-empty-state.tsx`
- `apps/mobile/components/map/map-loading-overlay.tsx`
- `apps/mobile/lib/map-camera.ts`
- `apps/mobile/lib/map-bounds.ts`
- `apps/mobile/lib/map-selection.ts`
- `packages/shared/src/geo/grid.ts` or a nearby shared geo helper file if reused across ingest and backend

The exact split can stay smaller if the screen remains manageable, but the data and marker logic should not all live inline in `map.tsx`.

---

## Backend And Data Work

### 1. Schema support

- add `cellId` to `eventFields`
- add index for `(city, cellId)`
- keep current city and status indexes intact

### 2. Geo helper

- create one shared helper to convert `lat/lng` into grid cells
- match the project plan formula: `floor(lat/0.02):floor(lng/0.02)` unless product testing changes cell size
- reuse the same helper during ingest and query prefiltering

### 3. Query design

- add a dedicated nearby query such as `api.events.listForMap`
- input should accept city, bounds, optional category, optional type filter, and limit
- derive the needed grid cells from bounds
- fetch from indexed cells, then trim in memory to exact viewport match
- always filter to approved events only

### 4. Caching

- keep a short TTL cache for map queries
- key cache by city + bounds bucket + active filters
- allow stale-while-revalidate so map markers appear quickly after revisits

---

## Frontend Implementation Checklist

### 1. Dependency and native setup

- [ ] Install `@rnmapbox/maps` in `apps/mobile`
- [ ] Add Mapbox token env wiring
- [ ] Confirm Android native config and permissions needed by the SDK
- [ ] Rebuild the Expo dev client because Mapbox requires native code
- [ ] Verify the app still boots with the custom dev client

### 2. Route shell

- [ ] Replace the placeholder `map.tsx` content with a full-screen map layout
- [ ] Keep the screen inside the existing tab navigator
- [ ] Preserve app theme colors behind map overlays
- [ ] Account for top and bottom safe areas in overlay placement

### 3. Location bootstrap

- [ ] Add helper to request or read foreground location permission
- [ ] Get user coordinates from last-known position first, then current position if needed
- [ ] Fall back to city center when live coordinates are unavailable
- [ ] Keep map usable even when permission is denied

### 4. Map camera and fetch loop

- [ ] Initialize camera from user coordinates or fallback city center
- [ ] Track visible bounds after initial map load
- [ ] Fetch events for visible bounds
- [ ] Detect when the map has moved far enough to show `Search This Area`
- [ ] Refetch only on explicit search-area action or initial load, not every tiny pan gesture

### 5. Marker rendering

- [ ] Create marker component with default and selected states
- [ ] Differentiate event vs activity visually in a subtle way
- [ ] Keep marker touch targets large enough for mobile
- [ ] Animate marker emphasis only with transform or opacity-safe properties

### 6. Clustering

- [ ] Enable clustering for zoomed-out regions
- [ ] Show cluster count badge
- [ ] Tapping cluster should zoom toward its children
- [ ] Disable or reduce clustering once individual events are clear enough

### 7. Carousel

- [ ] Create a horizontal FlashList-backed carousel for nearby events
- [ ] Reuse `EventCard` where possible
- [ ] Add `Show Details` CTA on the selected card
- [ ] Ensure card width and snapping feel good on small and large phones
- [ ] Keep carousel hidden until at least one event is available

### 8. Marker <-> carousel sync

- [ ] Marker tap scrolls carousel to the matching event
- [ ] Marker tap recenters camera with enough bottom padding so the marker is not hidden behind the card
- [ ] Carousel swipe updates selected marker
- [ ] Preserve selection when filters change only if the selected event remains visible
- [ ] Clear selection gracefully when the selected event disappears from the current dataset

### 9. Navigation

- [ ] `Show Details` pushes `{ pathname: "/event/[id]", params: { id } }`
- [ ] Preserve existing event detail route behavior
- [ ] If useful, pass source params like `source: "map"` for analytics or back behavior only if there is a real need

### 10. Filters

- [ ] Add horizontal filter chips for category and type
- [ ] Reuse existing category data where possible
- [ ] Keep the first version small: category + event/activity/all is enough
- [ ] Refetch or locally refine markers based on the chosen filter contract

### 11. Loading, empty, and error states

- [ ] Show subtle loading overlay while first map results load
- [ ] Show a small inline refresh indicator for subsequent area searches
- [ ] Render a nearby empty state when no markers match the current view
- [ ] Keep retry affordance available on transient query failure

### 12. Localization and RTL

- [ ] Add map strings to both locale files
- [ ] Mirror chip ordering if needed in RTL
- [ ] Verify text alignment and icon direction in overlays
- [ ] Ensure the carousel still feels natural in RTL without breaking map gestures

---

## Suggested UI Copy

Add localized strings for:

- `Search this area`
- `My location`
- `Nearby events`
- `Nearby activities`
- `Show Details`
- `No events found in this area`
- `Enable location`
- `Using city results`

---

## Performance Notes

- prefer a bounded query size and clustering over rendering too many raw markers
- keep marker components lightweight
- use FlashList for the carousel, not a plain ScrollView
- avoid recomputing expensive map-to-card matching work inside render
- throttle camera change bookkeeping if the SDK emits frequent updates

---

## Testing Checklist

### Functional

- [ ] map loads on Android dev client
- [ ] location permission granted flow works
- [ ] location denied flow still shows fallback results
- [ ] marker tap selects correct card
- [ ] carousel swipe selects correct marker
- [ ] `Show Details` opens the right event
- [ ] `Search This Area` updates markers correctly
- [ ] clustering expands as expected when zooming in

### UX

- [ ] selected marker is never hidden behind the carousel
- [ ] carousel snap feels smooth
- [ ] no visual conflict with safe areas or bottom tabs
- [ ] overlays remain readable in both light and dark themes
- [ ] RTL layout remains coherent

### Data

- [ ] nearby query does not rely on full-table scans
- [ ] bounds filtering respects city + `cellId` strategy
- [ ] large marker sets remain responsive

---

## Rollout Order

1. Add Mapbox dependency and native setup
2. Add geo helper, schema field, and indexed nearby query
3. Replace placeholder map screen with map shell and user-location bootstrap
4. Render markers from live nearby data
5. Add selection state and horizontal carousel
6. Add `Show Details` CTA and route integration
7. Add clustering and search-this-area behavior
8. Add filters, polish, and full testing

---

## Open Questions

- Should the first version fetch by visible viewport only, or by a fixed radius around the camera center plus viewport padding?
- Do we want the carousel to show mixed events + activities together by default, or split them with a type chip selected on first load?
- Should tapping the map background clear the selected card immediately, or keep the last selection until a different marker is chosen?
- Do we want a lightweight preview card only on marker tap, or should the carousel always stay visible when results exist?
