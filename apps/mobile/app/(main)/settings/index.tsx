import { useState } from "react";
import { useClerk } from "@clerk/clerk-expo";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { useUIStore, type AppThemeMode } from "@/stores/ui-store";

const THEME_OPTIONS: AppThemeMode[] = ["system", "light", "dark"];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const themeMode = useUIStore((state) => state.themeMode);
  const setThemeMode = useUIStore((state) => state.setThemeMode);

  const handleTemporaryLogout = async () => {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error("Temporary sign out failed", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>{t("settings.title")}</Text>
        <Text style={styles.subtitle}>{t("settings.appearanceDescription")}</Text>

        <View style={styles.optionList}>
          {THEME_OPTIONS.map((option) => {
            const isSelected = themeMode === option;

            return (
              <Pressable
                key={option}
                style={styles.optionRow}
                onPress={() => setThemeMode(option)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{t(`settings.themeMode.${option}.label`)}</Text>
                  <Text style={styles.optionHint}>{t(`settings.themeMode.${option}.hint`)}</Text>
                </View>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>{t("settings.temporaryLogout.label")}</Text>
        <Text style={styles.subtitle}>{t("settings.temporaryLogout.hint")}</Text>

        <Pressable
          style={[styles.logoutButton, isSigningOut && styles.logoutButtonDisabled]}
          onPress={handleTemporaryLogout}
          disabled={isSigningOut}
          accessibilityRole="button"
        >
          <Text style={styles.logoutButtonLabel}>
            {isSigningOut ? t("settings.temporaryLogout.loading") : t("settings.temporaryLogout.action")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
  optionList: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  optionRow: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  optionCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  optionTitle: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
  },
  optionHint: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  logoutButton: {
    marginTop: theme.spacing.xs,
    minHeight: theme.button.md,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  logoutButtonDisabled: {
    opacity: 0.65,
  },
  logoutButtonLabel: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.error,
  },
}));
