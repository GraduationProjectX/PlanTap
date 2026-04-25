import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";
import { useDirection } from "@/rtl";

type TabName = "index" | "map" | "suggest" | "profile";

type TabItem = {
  name: TabName;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
};

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabsLayout() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { isRTL } = useDirection();

  const tabs: TabItem[] = [
    { name: "index", label: t("tabs.home"), icon: "home" },
    { name: "map", label: t("tabs.map"), icon: "map" },
    { name: "suggest", label: t("tabs.suggest"), icon: "lightbulb-o" },
    { name: "profile", label: t("settings.title"), icon: "cog" },
  ];

  const orderedTabs = isRTL ? [...tabs].reverse() : tabs;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
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
          }}
        />
      ))}
    </Tabs>
  );
}
