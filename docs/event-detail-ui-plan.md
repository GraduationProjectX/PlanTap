# Event Detail UI Plan

> Scope: `apps/mobile/app/(main)/event/[id].tsx` UI only
> Backend for reviews is deferred

---

## Summary

Build the full event detail screen to match the reference direction:

- immersive hero image with shared transition from event cards
- custom overlay controls instead of the native stack header
- overlapping white detail sheet
- primary CTA changed to `Open in Google Maps`
- reviews section replacing chat
- no custom bottom tab recreation inside this route

This document covers only frontend structure, UI tasks, and expected hook contracts so the screen can be implemented cleanly before backend review data is wired up.

---

## Scope

### In scope

- `event/[id]` screen layout and styling
- shared transition target cleanup
- event content sections
- reviews UI section
- review composer UI
- filter and sort UI for reviews
- loading, empty, and not-found states
- localization, RTL, dark mode checks

### Out of scope

- reviews backend tables, queries, and mutations
- admin moderation backend
- map embed SDK inside the detail screen
- image gallery carousel
- global navigation redesign

---

## Current State

- `apps/mobile/app/(main)/event/[id].tsx` is still a placeholder
- shared transition stack wiring already exists in `apps/mobile/app/(main)/_layout.tsx`
- source event cards already use `react-native-screen-transitions`
- event data can be loaded from `api.events.getById`
- bookmark flow already exists and can be reused
- reviews do not exist yet in the codebase

---

## Target UI Structure

From top to bottom:

1. Hero image with shared transition
2. Overlay controls
3. Overlapping rounded white sheet
4. Event title
5. Meta row: date, time, address or distance
6. Primary actions row: Google Maps, share, bookmark
7. About section
8. Optional quick facts row
9. Reviews summary
10. Reviews list
11. Review composer

---

## Expected Frontend Data Contract

These hooks and shapes should be treated as the UI contract for now.

### Event

`useEvent(id)` returns:

- `event`
- `isLoading`
- `notFound`

### Reviews

`useEventReviews(eventId, filter, sort)` returns:

- `averageRating`
- `reviewsCount`
- `reviews`
- `viewerReview`
- `isLoading`

`useUpsertReview()` returns:

- mutation function for create or edit
- pending state

`useDeleteReview()` returns:

- mutation function for delete
- pending state

### Review item shape

Each review item should support:

- `id`
- `authorName`
- `authorImageUrl`
- `rating`
- `body`
- `createdAt`
- `canDelete`
- `isViewerAuthor`

---

## Files To Add Or Update

### Update

- `apps/mobile/app/(main)/_layout.tsx`
- `apps/mobile/app/(main)/event/[id].tsx`
- `apps/mobile/components/events/EventCard.tsx`
- `apps/mobile/locales/en.json`
- `apps/mobile/locales/ar.json`

### Add

- `apps/mobile/hooks/use-event.ts`
- `apps/mobile/components/events/event-detail-hero.tsx`
- `apps/mobile/components/events/event-detail-header-actions.tsx`
- `apps/mobile/components/events/event-detail-sheet.tsx`
- `apps/mobile/components/events/event-meta-row.tsx`
- `apps/mobile/components/events/event-primary-actions.tsx`
- `apps/mobile/components/events/event-about-section.tsx`
- `apps/mobile/components/events/event-facts-row.tsx`
- `apps/mobile/components/events/event-reviews-section.tsx`
- `apps/mobile/components/events/review-summary.tsx`
- `apps/mobile/components/events/review-card.tsx`
- `apps/mobile/components/events/review-composer.tsx`
- `apps/mobile/components/events/star-rating-input.tsx`
- `apps/mobile/lib/event-detail-meta.ts`
- `apps/mobile/lib/google-maps-url.ts`

---

## Implementation Checklist

### 1. Route shell and transition

- [ ] Keep `event/[id]` inside the current transition-enabled stack
- [ ] Set `event/[id]` to `headerShown: false`
- [ ] Keep `gestureEnabled: false`
- [ ] Keep transition preset scoped to `event/[id]` only
- [ ] Change the shared transition source in `EventCard` so the tag is attached to the lead image region only
- [ ] Reuse the same shared tag on the detail hero media container

### 2. Screen skeleton

- [ ] Replace the placeholder screen with a root scrollable layout
- [ ] Use a root `ScrollView` with `contentInsetAdjustmentBehavior="automatic"`
- [ ] Add a loading skeleton state for hero, sheet, actions, and reviews
- [ ] Add a not-found fallback state for invalid or deleted ids
- [ ] Add bottom safe spacing so the composer is not cramped against the edge

### 3. Hero section

- [ ] Build a dedicated hero component using `expo-image`
- [ ] Apply the shared transition tag to the hero image wrapper
- [ ] Add a dark overlay or scrim for readability
- [ ] Use one primary image only in v1
- [ ] Size the hero to feel immersive while still allowing the sheet to overlap cleanly

### 4. Overlay controls

- [ ] Add custom back button at top-left
- [ ] Add custom more button at top-right
- [ ] Add centered live badge when the event is live
- [ ] Use translucent or blur-backed circular controls
- [ ] Keep controls above the hero transition layer

### 5. Detail sheet

- [ ] Build the rounded white sheet with a visible grabber
- [ ] Add the main event title block
- [ ] Add a meta row for date, time, and location
- [ ] Add bookmark action
- [ ] Add share action
- [ ] Add primary CTA labeled `Open in Google Maps`
- [ ] Build the Google Maps helper from `locationLat`, `locationLng`, and address or title
- [ ] Hide missing metadata cleanly instead of rendering placeholders

### 6. About section

- [ ] Add `ABOUT EVENT` section label styling
- [ ] Render localized description from existing short description fields
- [ ] Hide the section entirely when no description exists
- [ ] Preserve readable line length and spacing

### 7. Facts section

- [ ] Add a compact facts row or fact cards below the about section
- [ ] Use only existing event fields
- [ ] Support category, price range, family-friendly, indoor or outdoor, and tags
- [ ] Hide unsupported facts instead of inventing values

### 8. Reviews summary

- [ ] Add `REVIEWS` section label
- [ ] Show average rating as large numeric text
- [ ] Show 5-star visual summary beside the number
- [ ] Show review count below the average in muted text
- [ ] Add `Filter` button styled like the reference
- [ ] Add `Sort` button styled like the reference
- [ ] Default filter to `All`
- [ ] Default sort to `Newest`

### 9. Reviews list

- [ ] Render reviews as custom cards, not chat bubbles
- [ ] Each card shows avatar, author name, relative timestamp, stars, and body text
- [ ] Add avatar fallback for missing images
- [ ] Support long review text without breaking the card layout
- [ ] Add empty state when there are no reviews
- [ ] Add delete affordance only when `canDelete` is true
- [ ] Add subtle item entry animation using opacity and transform only

### 10. Review composer

- [ ] Build the composer with HeroUI components, not a chat SDK
- [ ] Add interactive 1-to-5 star input
- [ ] Use HeroUI `Input` or `TextField` for review text
- [ ] Add submit action as a compact button
- [ ] Preload existing viewer review into the composer for edit mode
- [ ] Disable submit when rating is missing
- [ ] Allow rating-only review with optional empty text
- [ ] Add pending or submitting visual state

### 11. Filter and sort UI

- [ ] Reuse the app's existing select or bottom-sheet interaction pattern
- [ ] Add filter options:
- [ ] `All`
- [ ] `5 stars`
- [ ] `4 stars`
- [ ] `3 stars`
- [ ] `2 stars`
- [ ] `1 star`
- [ ] `With text`
- [ ] Add sort options:
- [ ] `Newest`
- [ ] `Highest rating`
- [ ] `Lowest rating`
- [ ] Reflect current selection state in the UI

### 12. Localization and RTL

- [ ] Add English strings for all new labels and states
- [ ] Add Arabic strings for all new labels and states
- [ ] Use `useDirection()` for row direction and text alignment
- [ ] Check that icon ordering and spacing feel correct in RTL

### 13. Theme and visual polish

- [ ] Verify the white-sheet treatment still works in dark mode
- [ ] Check overlay control contrast in light and dark themes
- [ ] Keep spacing, radius, and typography aligned with existing Unistyles tokens
- [ ] Avoid introducing a separate visual language for this screen

### 14. Screen states

- [ ] Loading state
- [ ] Not-found state
- [ ] Event with no description
- [ ] Event with no price
- [ ] Event with no tags
- [ ] Event with no reviews
- [ ] Event with existing viewer review

---

## UI Defaults Chosen

- No review or chat SDK
- No star-rating package
- Use custom review cards and custom star input
- Use HeroUI for the review composer primitives
- No embedded map in v1
- No image carousel in v1
- No bottom tab recreation inside the screen
- Distance is shown only if it can already be derived from existing stored event address text

---

## Acceptance Checklist

- [ ] Event card press opens the detail screen with smooth shared hero transition
- [ ] Back navigation works reliably
- [ ] Swipe-dismiss stays disabled
- [ ] Google Maps CTA opens the external map app or URL correctly
- [ ] Share and bookmark actions remain usable
- [ ] Missing optional fields do not create broken gaps
- [ ] Reviews summary matches the intended hierarchy
- [ ] Reviews list looks correct with populated and empty data
- [ ] Composer works visually in create and edit states
- [ ] Screen looks correct in light mode
- [ ] Screen looks correct in dark mode
- [ ] Screen looks correct in RTL
- [ ] Layout holds on smaller phones

---

## Notes

- Backend implementation for reviews will be handled later.
- This file is intentionally UI-first so the screen can be built end-to-end with mock or placeholder review hooks before Convex review data is added.
