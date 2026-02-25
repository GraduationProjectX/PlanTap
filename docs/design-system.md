# PlanTap Design System

> Design tokens and patterns extracted from Figma designs  
> **Source**: Figma "Main" frame (Discovery screens, Community, AI Suggestions)

---

## Table of Contents

1. [Overview](#overview)
2. [Colors](#colors)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Border Radius](#border-radius)
6. [Shadows](#shadows)
7. [Component Patterns](#component-patterns)
8. [HeroUI Native Integration](#heroui-native-integration)
9. [RTL Support](#rtl-support)

---

## Overview

PlanTap uses a minimal, high-contrast design language optimized for:
- **Arabic (RTL)** as the primary language
- **Event discovery** with rich imagery
- **Dark headers** with light content areas
- **Monochromatic primary palette** (black/white for actions)

### Technology Stack
- **Styling**: [React Native Unistyles](https://reactnativeunistyles.vercel.app/)
- **UI Components**: [HeroUI Native](https://heroui.com/) (planned)
- **Font**: Cairo (Arabic-optimized, Google Fonts)
- **Icons**: SVG-based (from Figma exports)

---

## Colors

### Light Theme

#### Background Hierarchy
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#F5F5F5` | Main app background |
| `surface` | `#FFFFFF` | Cards, elevated containers |
| `surfaceElevated` | `#FFFFFF` | Modals, bottom sheets |

#### Header (Dark Section)
| Token | Value | Usage |
|-------|-------|-------|
| `headerBackground` | `#1E1E1E` | Header background |
| `headerForeground` | `#FFFFFF` | Header text |
| `headerMuted` | `rgba(255,255,255,0.6)` | Secondary header text |
| `headerOverlay` | `rgba(255,255,255,0.1)` | Buttons on header |
| `headerBorder` | `rgba(255,255,255,0.05)` | Input borders on header |

#### Text Hierarchy
| Token | Value | Usage |
|-------|-------|-------|
| `text` | `#000000` | Primary text, headings |
| `textSecondary` | `#737373` | Subtitles, descriptions, locations |
| `textMuted` | `#A3A3A3` | Labels, categories, placeholders |

#### Brand/Action
| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#000000` | Primary buttons, CTAs |
| `primaryForeground` | `#FFFFFF` | Text on primary buttons |

#### Semantic
| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#22C55E` | Success states |
| `warning` | `#F59E0B` | Warning states |
| `error` | `#EF4444` | Error states |
| `info` | `#3B82F6` | Info states |

#### Overlays
| Token | Value | Usage |
|-------|-------|-------|
| `overlay` | `rgba(0,0,0,0.5)` | Modal backdrop |
| `overlayDark` | `rgba(0,0,0,0.8)` | Badge backgrounds (e.g., "Live", "Ending Soon") |
| `overlayLight` | `rgba(255,255,255,0.95)` | Date badges on images |

#### UI Elements
| Token | Value | Usage |
|-------|-------|-------|
| `border` | `#F5F5F5` | Card borders |
| `borderStrong` | `#E5E5E5` | Stronger borders, price tags |
| `divider` | `#F5F5F5` | Section dividers |

---

## Typography

### Font Family: Cairo

Cairo is an Arabic-optimized font that works well for both Arabic (RTL) and Latin text.

| Weight | Token | CSS Weight |
|--------|-------|------------|
| Regular | `Cairo-Regular` | 400 |
| Medium | `Cairo-Medium` | 500 |
| Semi Bold | `Cairo-SemiBold` | 600 |
| Bold | `Cairo-Bold` | 700 |
| Black | `Cairo-Black` | 900 |

### Font Sizes

| Token | Size | Usage |
|-------|------|-------|
| `xs` | 8px | Date labels on small badges |
| `sm` | 10px | Category labels (uppercase), tags |
| `md` | 12px | Captions, small buttons, location text, "احجز الآن" buttons |
| `base` | 14px | Body text, navigation items, prices |
| `lg` | 16px | H3 headings, card titles, input text |
| `xl` | 18px | H2 headings, section headers |
| `2xl` | 20px | H1 headings, screen titles |
| `3xl` | 28px | Display text, hero headings |
| `4xl` | 36px | Large display |

### Text Styles (Common Patterns)

```typescript
// Section Heading (e.g., "جارية الآن", "الفعاليات القادمة")
{
  fontFamily: 'Cairo-Bold',
  fontSize: 20,
  lineHeight: 28,
  letterSpacing: -0.5,
  color: colors.text,
  textAlign: 'right',
}

// Card Title (e.g., event names)
{
  fontFamily: 'Cairo-Bold',
  fontSize: 18,
  lineHeight: 22.5,
  color: colors.text,
  textAlign: 'right',
}

// Location/Subtitle
{
  fontFamily: 'Cairo-Medium',
  fontSize: 12,
  lineHeight: 16,
  color: colors.textSecondary,
  textAlign: 'right',
}

// Category Label (uppercase)
{
  fontFamily: 'Cairo-Bold',
  fontSize: 10,
  lineHeight: 15,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: colors.textMuted,
  textAlign: 'right',
}

// Button Text
{
  fontFamily: 'Cairo-Bold',
  fontSize: 12,
  lineHeight: 16,
  color: colors.primaryForeground,
  textAlign: 'center',
}

// Price
{
  fontFamily: 'Cairo-Bold',
  fontSize: 14,
  lineHeight: 20,
  color: colors.text,
  textAlign: 'right',
}
```

---

## Spacing

Consistent 4px base unit system.

| Token | Value | Usage |
|-------|-------|-------|
| `none` | 0px | No spacing |
| `xs` | 4px | Tight gaps, icon margins |
| `sm` | 8px | Button padding, small gaps |
| `md` | 16px | Card padding, section gaps |
| `lg` | 24px | Screen horizontal padding, large gaps |
| `xl` | 32px | Section vertical spacing |
| `xxl` | 48px | Large section breaks |
| `xxxl` | 64px | Hero spacing |

### Common Patterns

```typescript
// Screen horizontal padding
paddingHorizontal: spacing.lg // 24px

// Card internal padding
padding: spacing.md // 16px

// Gap between cards
gap: spacing.md // 16px

// Gap between elements in a card
gap: spacing.xs // 4px
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `none` | 0px | Sharp corners |
| `xs` | 4px | Small chips, price tags |
| `sm` | 6px | Badges, status indicators |
| `md` | 8px | Buttons, inputs |
| `lg` | 12px | Image containers within cards |
| `xl` | 16px | Cards, containers |
| `xxl` | 32px | Header bottom corners |
| `full` | 9999px | Pills, circular buttons, avatars |

---

## Shadows

React Native compatible shadow configurations.

| Token | Usage | Values |
|-------|-------|--------|
| `none` | No shadow | - |
| `sm` | Cards, subtle elevation | `shadowOpacity: 0.05, elevation: 1` |
| `md` | Headers, elevated cards | `shadowOpacity: 0.1, elevation: 3` |
| `lg` | Buttons, active states | `shadowOpacity: 0.1, elevation: 5` |
| `xl` | Modals, dropdowns | `shadowOpacity: 0.25, elevation: 8` |

```typescript
// Card shadow
{
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
}

// Header shadow
{
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 3,
}
```

---

## Component Patterns

### Header with Search

Dark header with rounded bottom corners, containing:
- Back/menu button (glass morphism: `rgba(255,255,255,0.1)` + blur)
- Location selector with dropdown icon
- Search bar with glass morphism
- Horizontal scrolling category pills

```
┌─────────────────────────────────────┐
│  [←]           الرياض، السعودية ▼   │  ← headerBackground
│                                     │
│  🔍  ابحث عن فعاليات، فنانين...  ⚙️  │  ← Search bar
│                                     │
│  [الكل] [حفلات] [رياضة] [تقنية]    │  ← Category pills (scroll)
└─────────────────────────────────────┘
    ↑ radius.xxl (32px) bottom corners
```

### Event Card (Horizontal - "جارية الآن")

Wide card for currently happening events with:
- Full-width image with status badge
- Title, location with icon
- CTA button + attendee avatars or price tag

```
┌─────────────────────────────┐
│  [Image]           [مباشر] │  ← overlayDark badge
│                            │
├────────────────────────────┤
│  📍 الحديقة المركزية • 0.5 كم │
│  مهرجان الجاز الصيفي        │
│                            │
│  [احجز الآن]    👤👤👤+1k  │
└─────────────────────────────┘
```

### Event Card (List - "الفعاليات القادمة")

Compact horizontal card with:
- Small thumbnail with date badge
- Event details (category, title, location, price)
- Full-width CTA button

```
┌─────────────────────────────────────┐
│                              ┌────┐ │
│  حفل موسيقي                 │نوفمبر│ │
│  جولة كولدبلاي العالمية     │ 12 │ │
│  📍 ماديسون سكوير جاردن     └────┘ │
│                                    │
│  [        احجز الآن        ]  $120 │
└─────────────────────────────────────┘
```

### Activity Card (Grid - "أنشطة قريبة")

Vertical card for activities with:
- Image with rating badge
- Title, location
- User count indicator

```
┌───────────────┐
│  [Image]  4.8★│
├───────────────┤
│  صيد بحري     │
│  📍 جدة، ميناء│
│  👤 12 مهتم   │
└───────────────┘
```

### Bottom Tab Bar

Floating tab bar with glass morphism:
- 5 icons: Home, Calendar, Add, Chat, Profile
- Background blur + white background
- Active state: filled icon + black color

### Buttons

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | `primary` (#000) | `primaryForeground` (#FFF) | none |
| Secondary | `surface` (#FFF) | `text` (#000) | `borderStrong` |
| Ghost | transparent | `text` | none |
| Glass | `headerOverlay` | `headerForeground` | `headerBorder` |

---

## HeroUI Native Integration

> **Status**: Planned for future implementation

### Integration Strategy

When integrating [HeroUI Native](https://heroui.com/), map the design tokens as follows:

#### Theme Provider Setup

```typescript
// Example: heroui.config.ts
import { tokens, lightTheme, darkTheme } from './theme/unistyles';

export const heroUITheme = {
  colors: {
    // Map PlanTap tokens to HeroUI
    primary: lightTheme.colors.primary,
    secondary: lightTheme.colors.textSecondary,
    background: lightTheme.colors.background,
    foreground: lightTheme.colors.text,
    // ... etc
  },
  spacing: tokens.spacing,
  radius: {
    small: tokens.radius.sm,
    medium: tokens.radius.md,
    large: tokens.radius.xl,
  },
};
```

#### Component Mapping

| Figma Pattern | HeroUI Component | Customization Needed |
|---------------|------------------|---------------------|
| Primary Button | `Button variant="solid"` | Black bg, white text |
| Secondary Button | `Button variant="bordered"` | White bg, gray border |
| Glass Button | `Button variant="light"` | Custom glass styles |
| Search Input | `Input` | Glass morphism on header |
| Category Pills | `Chip` / `Button` | Custom pill styling |
| Event Card | `Card` | Custom layout |
| Avatar Stack | `AvatarGroup` | Overlap styling |
| Tab Bar | Custom | Glass morphism, floating |

#### Components to Build from Scratch

Even with HeroUI, these components need custom implementation:

1. **GlassButton** - Backdrop blur effect for header buttons
2. **EventCard** - Complex card with image, badges, avatars
3. **CategoryPill** - Horizontal scrolling category filter
4. **DateBadge** - Month/day badge overlay on images
5. **StatusBadge** - "Live", "Ending Soon" badges
6. **FloatingTabBar** - Glass morphism bottom navigation
7. **HeaderWithSearch** - Dark header with curved bottom

---

## RTL Support

PlanTap is designed RTL-first for Arabic users.

### Key Considerations

1. **Text Alignment**: Default to `textAlign: 'right'`
2. **Flex Direction**: Use `flexDirection: 'row-reverse'` for horizontal layouts
3. **Icons**: Location pin icon should be on the right of text
4. **Scroll Direction**: Horizontal lists scroll right-to-left
5. **Chevrons**: Use left-pointing chevrons for "forward" navigation

### Implementation

```typescript
// In RTL context
import { I18nManager } from 'react-native';

// Force RTL for Arabic
I18nManager.forceRTL(true);

// Styles
const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row-reverse', // RTL row
    alignItems: 'center',
  },
  text: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
}));
```

### Cairo Font RTL Benefits

The Cairo font is specifically designed for Arabic text and includes:
- Proper Arabic letterforms
- Correct ligatures
- Balanced Latin character support
- Multiple weights for hierarchy

---

## File Structure

```
apps/mobile/
├── theme/
│   └── unistyles.ts          # Design tokens & theme config
├── components/
│   ├── ui/                   # Base UI components (HeroUI wrappers)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── patterns/             # Complex composed patterns
│   │   ├── EventCard.tsx
│   │   ├── GlassButton.tsx
│   │   ├── CategoryPills.tsx
│   │   ├── HeaderWithSearch.tsx
│   │   └── FloatingTabBar.tsx
│   └── ...
└── assets/
    ├── fonts/
    │   └── Cairo/            # Cairo font files
    └── icons/                # SVG icons exported from Figma
```

---

## Quick Reference

### Common Style Combinations

```typescript
import { StyleSheet } from 'react-native-unistyles';

const stylesheet = StyleSheet.create((theme) => ({
  // Screen container
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadow.sm,
  },
  
  // Section heading
  sectionHeading: {
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size['2xl'],
    color: theme.colors.text,
    textAlign: 'right',
    letterSpacing: theme.font.letterSpacing.tight,
  },
  
  // Primary button
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Glass effect (for header buttons)
  glassButton: {
    backgroundColor: theme.colors.headerOverlay,
    borderRadius: theme.radius.full,
// For blur effect, wrap with <BlurView intensity={8} /> from expo-blur  },
}));
```

---

*Last updated: Feb 2026*  
*Figma source: PlanTap Main Frame*
