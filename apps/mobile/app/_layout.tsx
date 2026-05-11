// Theme configuration - must be imported before any styled components
import "@/theme/unistyles";

// Uniwind / HeroUI Native styles
import "../global.css";

// i18n configuration
import "@/i18n";

// RTL initialization (must be called early)
import { initializeRTL } from "@/rtl";
initializeRTL();

import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme as NavigationTheme,
} from "@react-navigation/native";
import { isRunningInExpoGo } from "expo";
import { useFonts } from "expo-font";
import { Stack, useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HeroUINativeProvider } from "heroui-native";
import { UnistylesRuntime } from "react-native-unistyles";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useQuery } from "convex/react";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { AppLoadingSplash } from "@/components/app-loading-splash";
import { convex } from "@/services/convex";
import { useUIStore } from "@/stores/ui-store";
import { darkTheme, lightTheme } from "@/theme/unistyles";
import { api } from "backend/convex/_generated/api";
import * as Sentry from "@sentry/react-native";

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(main)",
};

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  replaysSessionSampleRate: __DEV__ ? 1.0 : 0.1,
  replaysOnErrorSampleRate: __DEV__ ? 0.1 : 1.0,
  integrations: [navigationIntegration, Sentry.mobileReplayIntegration()],
  enableNativeFramesTracking: !isRunningInExpoGo(),
  enableLogs: true,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const navigationLightTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTheme.colors.primary,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.text,
    border: lightTheme.colors.border,
    notification: lightTheme.colors.error,
  },
};

const navigationDarkTheme: NavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkTheme.colors.primary,
    background: darkTheme.colors.background,
    card: darkTheme.colors.surface,
    text: darkTheme.colors.text,
    border: darkTheme.colors.border,
    notification: darkTheme.colors.error,
  },
};

function RootLayout() {
  const systemColorScheme = useColorScheme();
  const themeMode = useUIStore((state) => state.themeMode);

  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const resolvedThemeName =
    themeMode === "system" ? (systemColorScheme === "dark" ? "dark" : "light") : themeMode;

  useEffect(() => {
    if (themeMode === "system") {
      UnistylesRuntime.setAdaptiveThemes(true);
      return;
    }

    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(themeMode);
  }, [themeMode]);

  useEffect(() => {
    UnistylesRuntime.setRootViewBackgroundColor(
      resolvedThemeName === "dark" ? darkTheme.colors.background : lightTheme.colors.background,
    );
  }, [resolvedThemeName]);

  if (!loaded) {
    return <AppLoadingSplash />;
  }

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider
        value={resolvedThemeName === "dark" ? navigationDarkTheme : navigationLightTheme}
      >
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <HeroUINativeProvider>
              <RootNavigator />
            </HeroUINativeProvider>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const isAuthenticated = isSignedIn === true;
  const navigationRef = useNavigationContainerRef();
  const currentUser = useQuery(api.users.current, isAuthenticated ? {} : "skip");

  const isUserLoading = isAuthenticated && currentUser === undefined;
  const onboardingCompletedAt = currentUser?.onboardingCompletedAt ?? null;
  const hasCompletedOnboarding = onboardingCompletedAt !== null;
  const shouldShowOnboarding = isAuthenticated && !hasCompletedOnboarding;
  const shouldShowAuth = !isAuthenticated;

  useEffect(() => {
    if (navigationRef) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  if (!isLoaded || isUserLoading) {
    return <AppLoadingSplash />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated && hasCompletedOnboarding}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>

      <Stack.Protected guard={shouldShowOnboarding}>
        <Stack.Screen name="onboarding/index" />
      </Stack.Protected>

      <Stack.Protected guard={shouldShowAuth}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Screen name="sso-callback" />

      <Stack.Screen name="+not-found" options={{ headerShown: true }} />
    </Stack>
  );
}

export default Sentry.wrap(RootLayout);
