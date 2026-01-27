# PlanTap — UI Design Plan

> **Design System for Pencil Extension**  
> **Theme**: White Background + Black + #facc15 (Yellow) — Soft Neobrutalism  
> **Font**: DM Sans (English)  
> **Inspiration**: Merging neobrutalism aesthetics with smooth, polished UI

---

## 📸 Reference Images

The design merges two distinct styles:

````carousel
![PlanTap Neobrutalism Reference](./uploaded_media_0_1769524147117.png)
<!-- slide -->
![Forest App Smooth Reference](./uploaded_media_1_1769524147117.png)
````

| Image 1 (Neobrutalism) | Image 2 (Smooth/Polished) |
|------------------------|---------------------------|
| Bold black borders | Smooth rounded corners |
| Yellow (#facc15) accent | Clean card shadows |
| Flat yellow buttons | Refined typography |
| Playful icon treatment | Elegant list items |
| High contrast | Subtle depth |

**Design Goal**: Combine the **bold, playful energy** of neobrutalism with the **refined smoothness** of modern mobile UI.

---

## 🎨 Design Tokens

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#FFFFFF` | Main background |
| `--bg-secondary` | `#F9FAFB` | Card backgrounds, sections |
| `--bg-tertiary` | `#F3F4F6` | Pressed states, dividers |
| `--accent` | `#facc15` | Primary action, highlights |
| `--accent-dark` | `#EAB308` | Accent hover/pressed |
| `--text-primary` | `#000000` | Headlines, primary text |
| `--text-secondary` | `#374151` | Body text, descriptions |
| `--text-tertiary` | `#6B7280` | Captions, placeholders |
| `--border` | `#000000` | Neobrutalist borders (2-3px) |
| `--border-soft` | `#E5E7EB` | Subtle dividers |
| `--success` | `#22C55E` | Success states |
| `--error` | `#EF4444` | Error states |
| `--shadow-neo` | `0 4px 0 #000` | Neobrutalist button shadow |
| `--shadow-soft` | `0 4px 12px rgba(0,0,0,0.08)` | Smooth cards |

### Typography (DM Sans)

| Token | Style | Usage |
|-------|-------|-------|
| `--heading-1` | 32px / Bold / -0.5 tracking | Screen titles |
| `--heading-2` | 24px / SemiBold / -0.3 tracking | Section headers |
| `--heading-3` | 20px / SemiBold | Card titles |
| `--body` | 16px / Regular | Body text |
| `--body-sm` | 14px / Regular | Secondary text |
| `--caption` | 12px / Medium | Labels, badges |
| `--button` | 16px / SemiBold / uppercase | Button text |

### Spacing

| Token | Value |
|-------|-------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--space-2xl` | 48px |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0px | Neobrutalist elements |
| `--radius-sm` | 8px | Small chips, tags |
| `--radius-md` | 12px | Cards, inputs |
| `--radius-lg` | 16px | Large cards, modals |
| `--radius-xl` | 24px | Bottom sheets |
| `--radius-full` | 9999px | Pills, avatars |

---

## 🧩 Core Components

### 1. Primary Button (Neo-Accent)

**Style**: Solid yellow with black border + offset shadow

```
┌─────────────────────────────────┐
│          LOGIN                  │ ← Yellow bg, black outline
└─────────────────────────────────┘
  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄   ← Black shadow offset (4px down)
```

- Background: `#facc15`
- Border: 2px solid `#000000`
- Shadow: `0 4px 0 #000000`
- Border Radius: 12px
- Padding: 16px 24px
- Text: Black, uppercase, SemiBold
- Pressed: translateY(2px), shadow reduced

---

### 2. Secondary Button (Outline)

**Style**: White with black border

```
┌─────────────────────────────────┐
│  G  Continue with Google        │
└─────────────────────────────────┘
  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
```

- Background: `#FFFFFF`
- Border: 2px solid `#000000`
- Shadow: `0 4px 0 #000000`
- Border Radius: 12px

---

### 3. Ghost Button

**Style**: No border, text only

- Text: `#000000`
- Hover: `#F3F4F6` background
- Used for: Links, cancel actions

---

### 4. Input Field

**Style**: Smooth with subtle neobrutalism on focus

```
┌──────────────────────────────────┐
│ 📧  you@example.com              │
└──────────────────────────────────┘
```

- Default: 1px border `#E5E7EB`, 12px radius
- Focus: 2px border `#000000`
- Error: 2px border `#EF4444`
- Background: `#FFFFFF`
- Left icon with 16px padding
- Height: 56px

---

### 5. Event Card (Smooth Style)

**Style**: Clean card with soft shadow, yellow accent badge

```
┌─────────────────────────────────────┐
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │       [Event Image]         │   │ ← 16:9 ratio
│  │                              │   │
│  └──────────────────────────────┘   │
│                                     │
│  Event Title                        │ ← 20px SemiBold
│  📍 Riyadh · 💰 Free               │ ← 14px Gray
│                                     │
│  ┌──────┐  ┌────────────┐          │
│  │ 🎭   │  │ Family     │          │ ← Yellow bg tags
│  └──────┘  └────────────┘          │
└─────────────────────────────────────┘
```

- Background: `#FFFFFF`
- Border: none (smooth version) OR 2px black (neo version)
- Shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Border Radius: 16px
- Image border radius: 12px (inset)
- Yellow tags with black text

---

### 6. Category Chip (Neo Style)

```
┌───────────────┐
│ 🎭 Activities │
└───────────────┘
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
```

- Selected: Yellow bg, black border, shadow
- Unselected: White bg, gray border, no shadow
- Border Radius: 8px
- Padding: 8px 16px

---

### 7. Bottom Tab Bar

**Style**: Floating neo-style bar

```
┌─────────────────────────────────────────┐
│                                         │
│  🏠    🗺️    ✨    👥    👤           │
│  Home  Map  Suggest Community Profile   │
│                                         │
└─────────────────────────────────────────┘
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
```

- Background: White with black border
- Shadow: 0 4px 0 black (floating effect)
- Margin: 16px from edges
- Border Radius: 24px
- Active tab: Yellow indicator dot
- 5 tabs with icons

---

### 8. List Item (Smooth Style)

**Style**: Like Forest app action items

```
┌─────────────────────────────────────────┐
│  □  Payment                     1110 >  │
├─────────────────────────────────────────┤
│  📦 Get a bundle                      > │
├─────────────────────────────────────────┤
│  🎟️  Add promo code                   > │
└─────────────────────────────────────────┘
```

- Height: 56px
- Separator: 1px `#E5E7EB`
- Right chevron: Gray
- Padding: 16px

---

### 9. Map Marker

**Style**: Yellow pin with black border

```
    ╭─────╮
    │ 🎭  │  ← Category icon
    ╰──┬──╯
       ▼
```

- Background: `#facc15`
- Border: 2px black
- Size: 40x40px
- Selected: Scale 1.2, add shadow

---

### 10. Bottom Sheet

**Style**: Smooth with grabber

```
        ━━━━━━━  ← Grabber (gray pill)
┌─────────────────────────────────────────┐
│                                         │
│  Content Area                           │
│                                         │
└─────────────────────────────────────────┘
```

- Background: White
- Border Radius: 24px (top only)
- Grabber: 36x4px, centered, gray

---

### 11. Badge/Tag

```
┌────────┐
│ Family │  ← Yellow bg, no border (soft)
└────────┘

┌────────┐
│ Family │  ← White bg, black border (neo)
└────────┘
▄▄▄▄▄▄▄▄
```

- Soft version: Yellow bg, 8px radius
- Neo version: Black border + shadow
- Text: 12px Medium, black

---

### 12. Action Button Pair (Suggest Screen)

```
┌─────────────────┐     ┌─────────────────┐
│    ✕ Skip       │     │ ✓ Add to Plan   │
└─────────────────┘     └─────────────────┘
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    (Gray)                  (Yellow)
```

- Skip: Gray border, white bg
- Add: Yellow bg, black border
- Both: Neo shadow

---

## 📱 Screen Designs

### S1. Splash Screen

**Layout**:
- Centered PlanTap logo (calendar icon + text)
- Yellow icon background
- White screen background
- Subtle loading indicator

---

### S2. Onboarding Flow

**Screen 2a: Welcome**
- Large headline: "Discover Amazing Events"
- Subtext: "Plan your perfect day in Saudi Arabia"
- Yellow Get Started button (neo style)
- Skip text link

**Screen 2b: Interests**
- Headline: "What do you love?"
- Grid of category chips (neo style, multi-select)
- Yellow Continue button
- Categories: Music, Sports, Art, Food, Family, Outdoor, etc.

**Screen 2c: City Selection**
- Headline: "Where are you?"
- List of cities (radio selection)
- Each city: Name + event count badge
- Yellow Continue button

**Screen 2d: Permissions**
- Location permission request
- Notification permission request
- Clear explanations of benefits
- Allow / Maybe Later buttons

---

### S3. Login / Sign In

**Layout (from reference image)**:
- PlanTap logo at top (yellow calendar icon)
- "Discover Amazing Events" tagline
- "Welcome Back!" headline
- Email input with envelope icon
- Password input with lock + visibility toggle
- "Forgot password?" link (yellow text)
- **LOGIN** button (full-width, neo yellow)
- "OR CONTINUE WITH" divider
- **Continue with Google** (neo secondary)
- **Continue with Apple** (neo secondary)
- "Don't have an account? Create account" footer

---

### S4. Home Tab

**Layout**:
- Search bar at top (with filter button)
- Horizontal scrolling sections:
  - "Tonight" / "This Weekend"
  - "Near You"
  - "Trending in [City]"
  - "Family Picks"
- Each section: Title + "See All" + horizontal cards
- Event cards (smooth style)
- Pull to refresh

**Section Header**:
```
Tonight in Riyadh                   See All >
```

---

### S5. Map Tab

**Layout**:
- Full-screen Mapbox map
- Floating filter chips at top
- Yellow markers with category icons
- Bottom sheet preview on marker tap
- My location FAB (yellow)
- "Search this area" button

**Bottom Preview**:
```
        ━━━━━━━
┌─────────────────────────────────────────┐
│  [Image]  Event Title                   │
│           📍 2.3 km · 💰 50 SAR         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │       VIEW DETAILS              │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

### S6. Suggest Tab (Plan Builder)

**Layout**:

**Top Section - Constraints Panel**:
```
┌─────────────────────────────────────────┐
│  Group:   [Solo] [Group] [Kids]         │
│                                         │
│  Time:    [Afternoon ▼]                 │
│                                         │
│  Budget:  ────●──────────  80 SAR       │
│                                         │
│  Radius:  ────────●──────  15 km        │
└─────────────────────────────────────────┘
```

**Generate Button** (Full-width neo yellow):
```
┌─────────────────────────────────────────┐
│           ✨ GENERATE SUGGESTIONS       │
└─────────────────────────────────────────┘
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
```

**Suggestion Cards** (Stack of 3):
- Large event card
- Action buttons: Skip | Add to Plan
- Swipe disabled (buttons only)

**Current Plan Preview** (Bottom):
```
┌─────────────────────────────────────────┐
│  Your Plan (2/5 stops)                  │
│  1. Coffee at Careem   2. Mall Walking  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │        CONFIRM PLAN             │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

### S7. Event Detail Screen

**Layout**:
- Image gallery (horizontal scroll, full width)
- Title + description
- Info row: Location · Price · Duration
- Tags (yellow chips)
- Badges: Indoor/Outdoor, Family Friendly
- Operating hours (if activity)
- Action buttons row:
  - ♡ Favorite (outline)
  - ↗ Share
- Primary action: "Book Tickets" or "Get Directions"

**Image Gallery**:
```
┌─────────────────────────────────────────┐
│                                         │
│           [Hero Image]                  │
│                                         │
│    ●  ○  ○  ○   ← Pagination dots       │
└─────────────────────────────────────────┘
```

---

### S8. Plan Detail Screen

**Layout**:
- Plan title (editable)
- Map preview (all stops marked)
- Timeline view of stops:

```
  ●──── Stop 1: Coffee Shop
  │     📍 2.3 km · Note: "Get latte"
  │     [Navigate] [Remove]
  │
  ●──── Stop 2: Art Gallery
  │     📍 1.5 km
  │
  ●──── Stop 3: Dinner
        📍 3.0 km
```

- Total duration estimate
- Share button (top right)
- "Start Navigation" button (bottom, neo yellow)

---

### S9. Profile Tab

**Layout**:
- User avatar (large, centered)
- Display name
- My Plans section (FlashList)
- Favorites section (collapsible)
- Settings entry point
- Sign out button

**Plan Card**:
```
┌─────────────────────────────────────────┐
│  Weekend Adventure          3 stops     │
│  Created: Jan 15, 2026       📍 Riyadh  │
└─────────────────────────────────────────┘
```

---

### S10. Settings Screen

**Layout** (List items, smooth style):
- Language: Arabic / English toggle
- Edit Preferences
- Notifications toggle
- About PlanTap
- Send Feedback
- Privacy Policy
- Sign Out (red text)

---

### S11. Community Tab (Placeholder)

**Layout**:
- "Coming Soon" message
- Illustration/animation
- Grayed out state
- "Get notified when ready" option

---

## 🎬 Animations

### Micro-interactions

| Element | Animation |
|---------|-----------|
| Button Press | translateY(2px), shadow shrinks |
| Card Tap | scale(0.98) → scale(1) |
| Tab Switch | Fade + slide |
| Favorite Toggle | Heart bounce + fill |
| Like/Skip | Card slides out + next slides in |
| Map Marker | Bounce on appear |
| Bottom Sheet | Spring physics drag |

### Page Transitions

- Stack navigation: iOS-style slide
- Modal: Bottom-up with spring
- Tab: Crossfade

---

## 📐 Layout Guidelines

1. **Safe Area**: Always respect system insets
2. **Content Padding**: 16px horizontal padding for all screens
3. **Card Gap**: 12px between cards in horizontal scroll
4. **Section Gap**: 24px between sections
5. **Scroll Behavior**: `contentInsetAdjustmentBehavior="automatic"`
6. **RTL Support**: Full mirroring for Arabic

---

## ✅ Design Checklist for Each Screen

- [ ] White background as base
- [ ] DM Sans font applied
- [ ] Yellow (#facc15) accent used appropriately  
- [ ] Neo-style borders on interactive elements
- [ ] Smooth shadows on cards
- [ ] Proper spacing tokens
- [ ] RTL-ready layout
- [ ] Micro-interaction defined
- [ ] Empty state designed
- [ ] Loading skeleton designed

---

## 🔗 Pencil Extension Notes

When designing in Pencil, follow this structure:

1. **Create Design Tokens first** — Colors, Typography, Spacing
2. **Build Component Library** — All reusable components
3. **Design Screen by Screen** — Following this plan
4. **Export as React Native styles** — Using Unistyles format

---

*Ready for Pencil Extension implementation.*
