import { StyleSheet } from "react-native-unistyles";

/**
 * PlanTap Design System Tokens
 * Extracted from Figma designs - "Main" frame
 * @see docs/design-system.md for full documentation
 */
const tokens = {
  // Spacing scale (used for padding, margin, gap)
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // Border radius
  radius: {
    none: 0,
    xs: 4, // Small chips, tags
    sm: 6, // Badges
    md: 8, // Buttons
    lg: 12, // Image containers
    xl: 16, // Cards
    xxl: 32, // Header bottom corners
    full: 9999, // Pills, circular buttons, avatars
  },

  // Typography
  font: {
    family: {
      // Keep system fonts until Cairo font files are added and loaded in app/_layout.tsx.
      regular: "System",
      medium: "System",
      semiBold: "System",
      bold: "System",
      black: "System",
    },
    size: {
      xs: 8, // Date labels on badges
      sm: 10, // Category labels, uppercase tags
      md: 12, // Captions, small buttons, location text
      base: 14, // Body text, buttons
      lg: 16, // Body large, H3 headings, input text
      xl: 18, // H2 headings, card titles
      xxl: 20, // H1 headings, section titles
      xxxl: 28, // Display text
      xxxxl: 36, // Large display
    },
    lineHeight: {
      tight: 1.125, // 12px text
      normal: 1.25, // Most text
      relaxed: 1.5, // Paragraphs
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.3,
      wider: 0.4,
      widest: 1, // Uppercase labels
    },
  },

  // Shadows (React Native compatible)
  shadow: {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 5,
    },
    xl: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.25,
      shadowRadius: 50,
      elevation: 8,
    },
  },

  // Icon sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  },

  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },

  // Button heights
  button: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1600,
  },
};

// Light theme colors (extracted from Figma)
const lightTheme = {
  ...tokens,
  colors: {
    // Brand (primary action color)
    primary: "#000000",
    primaryForeground: "#FFFFFF",

    // Background hierarchy
    background: "#F5F5F5", // Main app background
    surface: "#FFFFFF", // Cards, elevated containers
    surfaceElevated: "#FFFFFF", // Modals, sheets

    // Header/Dark sections
    headerBackground: "#1E1E1E",
    headerForeground: "#FFFFFF",
    headerMuted: "rgba(255, 255, 255, 0.6)",
    headerOverlay: "rgba(255, 255, 255, 0.1)",
    headerBorder: "rgba(255, 255, 255, 0.05)",

    // Text hierarchy
    text: "#000000", // Primary text, headings
    textSecondary: "#737373", // Subtitles, descriptions
    textMuted: "#A3A3A3", // Labels, placeholders, disabled

    // Semantic colors
    success: "#22C55E",
    successForeground: "#FFFFFF",
    warning: "#F59E0B",
    warningForeground: "#000000",
    error: "#EF4444",
    errorForeground: "#FFFFFF",
    info: "#3B82F6",
    infoForeground: "#FFFFFF",

    // Live/Active indicator
    live: "#FFFFFF", // White dot for "live" status

    // UI elements
    border: "#DEDEDE", // Card borders
    borderStrong: "#BDBDBD", // Stronger borders
    divider: "#CECECE",

    // Overlays
    overlay: "rgba(0, 0, 0, 0.5)",
    overlayDark: "rgba(0, 0, 0, 0.8)", // Badge backgrounds
    overlayLight: "rgba(255, 255, 255, 0.95)", // Date badges on images

    // Input fields
    inputBackground: "rgba(255, 255, 255, 0.1)",
    inputBorder: "rgba(255, 255, 255, 0.05)",
    inputPlaceholder: "rgba(255, 255, 255, 0.6)",

    // Interactive states
    pressedOverlay: "rgba(0, 0, 0, 0.1)",
    focusRing: "#000000",

    // Tab bar
    tabBar: "#FFFFFF",
    tabBarBorder: "rgba(0, 0, 0, 0.05)",
    tabActive: "#000000",
    tabInactive: "#A3A3A3",

    // Skeleton loading
    skeleton: "#E5E5E5",
    skeletonHighlight: "#F5F5F5",
  },
};

// Breakpoints for responsive design (based on common device widths)
const breakpoints = {
  xs: 0, // Small phones
  sm: 390, // iPhone 14/15
  md: 428, // iPhone 14/15 Plus, Pro Max
  lg: 768, // Tablets (disabled but kept for future)
};

// Define theme types
type AppThemes = {
  light: typeof lightTheme;
};

type AppBreakpoints = typeof breakpoints;

// Configure Unistyles
StyleSheet.configure({
  themes: {
    light: lightTheme,
  },
  breakpoints,
  settings: {
    initialTheme: "light",
  },
});

// Type augmentation for TypeScript support
declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

// Export theme types for external use
export type Theme = typeof lightTheme;
export type ThemeColors = Theme["colors"];
export type ThemeSpacing = Theme["spacing"];
export type ThemeRadius = Theme["radius"];
export type ThemeShadow = Theme["shadow"];

export { lightTheme, tokens, breakpoints };
