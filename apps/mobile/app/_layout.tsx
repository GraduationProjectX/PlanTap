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

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    // TODO: Download Baloo Bhaijaan 2 from Google Fonts and uncomment:
    // "BalooBhaijaan2-Regular": require("../assets/fonts/BalooBhaijaan2-Regular.ttf"),
    // "BalooBhaijaan2-Medium": require("../assets/fonts/BalooBhaijaan2-Medium.ttf"),
    // "BalooBhaijaan2-Bold": require("../assets/fonts/BalooBhaijaan2-Bold.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
