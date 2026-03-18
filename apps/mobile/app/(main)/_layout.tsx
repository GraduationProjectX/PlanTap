import { withLayoutContext } from "expo-router";
import Transition from "react-native-screen-transitions";
import { createNativeStackNavigator } from "react-native-screen-transitions/native-stack";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";
import { getEventSharedBoundTag } from "@/lib/event-ui";

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
          const baseOptions = { headerShown: true, title: "Event" };
          if (!route.params || !("id" in route.params)) {
            return baseOptions;
          }

          const { id } = route.params;
          const routeId = Array.isArray(id) ? id[0] : id;
          if (!routeId) {
            return baseOptions;
          }

          return {
            ...baseOptions,
            enableTransitions: true,
            ...Transition.Presets.SharedXImage({
              sharedBoundTag: getEventSharedBoundTag(`${routeId}`),
            }),
            gestureEnabled: false,
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

