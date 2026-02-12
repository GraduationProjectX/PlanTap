import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/rtl";

type TabName = "index" | "map" | "suggest" | "community" | "profile";

type TabItem = {
  name: TabName;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  disabled?: boolean;
};

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();

  const tabs: TabItem[] = [
    { name: "index", label: t("tabs.home"), icon: "home" },
    { name: "map", label: t("tabs.map"), icon: "map" },
    { name: "suggest", label: t("tabs.suggest"), icon: "lightbulb-o" },
    { name: "community", label: t("tabs.community"), icon: "users", disabled: true },
    { name: "profile", label: t("tabs.profile"), icon: "user" },
  ];

  const orderedTabs = isRTL ? [...tabs].reverse() : tabs;

  const tintColor = colorScheme === "dark" ? "#818CF8" : "#6366F1";
  const inactiveColor = colorScheme === "dark" ? "#64748B" : "#94A3B8";
  const bgColor = colorScheme === "dark" ? "#0F172A" : "#FFFFFF";

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: colorScheme === "dark" ? "#334155" : "#E2E8F0",
        },
      }}
    >
      {orderedTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color }) => <TabBarIcon name={tab.icon} color={color} />,
            tabBarLabelStyle: tab.disabled ? { opacity: 0.55 } : undefined,
            tabBarIconStyle: tab.disabled ? { opacity: 0.55 } : undefined,
          }}
          listeners={
            tab.disabled
              ? {
                  tabPress: (event) => {
                    event.preventDefault();
                  },
                }
              : undefined
          }
        />
      ))}
    </Tabs>
  );
}
