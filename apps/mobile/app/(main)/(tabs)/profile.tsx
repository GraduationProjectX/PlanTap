import { Text, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { useDirection } from "@/rtl";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { textAlign } = useDirection();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { textAlign }]}>{t("tabs.profile")}</Text>
      <Text style={[styles.subtitle, { textAlign }]}>{t("common.comingSoon")}</Text>
      <Pressable
        onPress={() => router.push("/settings")}
        style={{ marginTop: 16, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "#6366F1", borderRadius: 8 }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Open Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
}));
