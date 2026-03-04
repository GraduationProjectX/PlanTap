import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

export default function MainLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
        contentStyle: { backgroundColor: theme.colors.background },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: theme.font.family.bold,
          fontSize: theme.font.size.lg,
        },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="event/index" options={{ headerShown: false }} />
      <Stack.Screen name="filters/index" options={{ headerShown: false, animation: "none" }} />
      <Stack.Screen name="bookmarks/index" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ headerShown: true, title: "Event" }} />
      <Stack.Screen name="plan/[id]" options={{ headerShown: true, title: "Plan" }} />
      <Stack.Screen
        name="settings/index"
        options={{
          headerShown: true,
          title: t("settings.title"),
        }}
      />
    </Stack>
  );
}
