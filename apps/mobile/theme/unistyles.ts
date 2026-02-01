import { StyleSheet } from "react-native-unistyles";

// PlanTap Design Tokens placeholders
const tokens = {
  // Spacing scale (used for padding, margin, gap)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Typography
  font: {
    // Will use Baloo Bhaijaan 2 once fonts are installed
    family: {
      regular: "System",
      medium: "System",
      bold: "System",
    },
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 28,
      display: 36,
    },
  },
} as const;

// Light theme colors 
const lightTheme = {
  ...tokens,
  colors: {
    // Brand
    primary: "#6366F1", 
    primaryLight: "#818CF8",
    primaryDark: "#4F46E5",

    // Background
    background: "#FFFFFF",
    surface: "#F8FAFC",
    surfaceElevated: "#FFFFFF",

    // Text
    text: "#0F172A",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",

    // Semantic
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    // UI
    border: "#E2E8F0",
    divider: "#F1F5F9",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
} as const;

// Dark theme colors
const darkTheme = {
  ...tokens,
  colors: {
    // Brand
    primary: "#818CF8",
    primaryLight: "#A5B4FC",
    primaryDark: "#6366F1",

    // Background
    background: "#0F172A",
    surface: "#1E293B",
    surfaceElevated: "#334155",

    // Text
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",

    // Semantic
    success: "#4ADE80",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",

    // UI
    border: "#334155",
    divider: "#1E293B",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
} as const;

// Breakpoints for responsive design
const breakpoints = {
  xs: 0,
  sm: 390,
  md: 428,
  lg: 768, // Tablet
} as const;

// Define theme types
type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

type AppBreakpoints = typeof breakpoints;

// Configure Unistyles
StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  breakpoints,
  settings: {
    adaptiveThemes: true, // Follows system theme
  },
});

// Type augmentation for TypeScript support
declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

export { lightTheme, darkTheme, tokens };
