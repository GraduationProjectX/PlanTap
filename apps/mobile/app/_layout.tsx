// Theme configuration - must be imported before any styled components
import "@/theme/unistyles";

// i18n configuration
import "@/i18n";

// RTL initialization (must be called early)
import { initializeRTL } from "@/rtl";
initializeRTL();

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "react-native";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { convex } from "@/lib/convex";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(main)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    // TODO: Download Baloo Bhaijaan 2  or any other font from Google Fonts and uncomment:
    // "BalooBhaijaan2-Regular": require("../assets/fonts/BalooBhaijaan2-Regular.ttf"),
    // "BalooBhaijaan2-Medium": require("../assets/fonts/BalooBhaijaan2-Medium.ttf"),
    // "BalooBhaijaan2-Bold": require("../assets/fonts/BalooBhaijaan2-Bold.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <RootNavigator />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Screen name="+not-found" options={{ headerShown: true }} />
    </Stack>
  );
}
