import { withLayoutContext } from "expo-router";
import Transition from "react-native-screen-transitions";
import { createNativeStackNavigator } from "react-native-screen-transitions/native-stack";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";
import { getEventSharedBoundTag } from "@/features/events/ui";

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
          if (!route.params || !("id" in route.params)) {
            return { headerShown: false, title: "Event" };
          }

          const { id } = route.params;
          const routeId = Array.isArray(id) ? id[0] : id;
          if (!routeId) {
            return { headerShown: false, title: "Event" };
          }

          return {
            headerShown: false,
            title: "Event",
            enableTransitions: true,
            contentStyle: {
              backgroundColor: "transparent",
              overflow: "hidden",
            },
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

