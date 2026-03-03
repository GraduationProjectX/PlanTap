import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, freezeOnBlur: true }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="event/index" options={{ headerShown: false }} />
      <Stack.Screen name="filters/index" options={{ headerShown: false, animation: "none" }} />
      <Stack.Screen name="bookmarks/index" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ headerShown: true, title: "Event" }} />
      <Stack.Screen name="plan/[id]" options={{ headerShown: true, title: "Plan" }} />
      <Stack.Screen name="settings/index" options={{ headerShown: true, title: "Settings" }} />
    </Stack>
  );
}
