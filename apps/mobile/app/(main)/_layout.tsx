import { withLayoutContext } from "expo-router";
import Transition from "react-native-screen-transitions";
import { createNativeStackNavigator } from "react-native-screen-transitions/native-stack";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";
import { getEventSharedBoundTag } from "@/lib/event-transition";

const { Navigator } = createNativeStackNavigator();
const Stack = withLayoutContext(Navigator);

export default function MainLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
      <Stack.Screen
        name="event/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="filters/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="bookmarks/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="event/[id]"
        options={({ route }) => {
          const params = route.params as Record<string, unknown> | undefined;
          const routeId = typeof params?.id === "string" ? params.id : undefined;
          const sharedBoundTag = routeId ? getEventSharedBoundTag(routeId) : undefined;

          if (sharedBoundTag) {
            return {
              headerShown: true,
              title: "Event",
              enableTransitions: true,
              ...Transition.Presets.SharedXImage({ sharedBoundTag }),
              gestureEnabled: false,
            };
          }

          return {
            headerShown: true,
            title: "Event",
          };
        }}
      />
      <Stack.Screen
        name="plan/[id]"
        options={{
          headerShown: true,
          title: "Plan",
        }}
      />
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

