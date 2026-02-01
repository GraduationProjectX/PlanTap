import { View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/rtl";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { textAlign } = useDirection();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { textAlign }]}>{t("home.title")}</Text>
      <Text style={[styles.subtitle, { textAlign }]}>{t("common.appName")}</Text>
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
  },
  title: {
    fontSize: theme.font.size.display,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
}));
