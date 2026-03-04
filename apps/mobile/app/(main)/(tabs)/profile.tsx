import { Pressable, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { useDirection } from "@/rtl";

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { textAlign } = useDirection();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { textAlign }]}>{t("tabs.profile")}</Text>
      <Text style={[styles.subtitle, { textAlign }]}>{t("common.comingSoon")}</Text>
      <Pressable style={styles.settingsButton} onPress={() => router.push("/settings" as Href)}>
        <Text style={styles.settingsButtonLabel}>{t("settings.title")}</Text>
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
  settingsButton: {
    marginTop: theme.spacing.sm,
    minHeight: theme.button.md,
    minWidth: 140,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  settingsButtonLabel: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.primaryForeground,
  },
}));
