import { useState, useCallback, useEffect } from "react";
import { useClerk } from "@clerk/clerk-expo";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

import { useUIStore, type AppThemeMode } from "@/stores/ui-store";
import { useAiStore, type AiProvider } from "@/stores";
import { useEventRecommendations } from "@/hooks/useEventRecommendations";
import {
  getApiKey,
  setApiKey,
  clearApiKey,
  type AiProviderKey,
} from "@/services/ai/secureKeys";
import {
  AVAILABLE_MODELS,
  assessDeviceSupport,
  buildCustomModelEntry,
  downloadModel,
  cancelDownload,
  deleteModel,
  isModelDownloaded,
  type ModelEntry,
  type ModelSupportAssessment,
  modelFilePath,
} from "@/services/ai/modelDownloader";
import { useRouter } from "expo-router";

const THEME_OPTIONS: AppThemeMode[] = ["system", "light", "dark"];

const CLOUD_PROVIDERS: { key: AiProviderKey; label: string }[] = [
  { key: "gemini", label: "Gemini" },
  { key: "openai", label: "OpenAI" },
  { key: "claude", label: "Claude" },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { signOut } = useClerk();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const themeMode = useUIStore((state) => state.themeMode);
  const setThemeMode = useUIStore((state) => state.setThemeMode);

  const handleTemporaryLogout = useCallback(async () => {
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
  }, [isSigningOut, signOut]);

  // ... (previous functions deleted in cleanup)

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{t("settings.title")}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("settings.title")}</Text>
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
                  <Text style={styles.optionTitle}>
                    {t(`settings.themeMode.${option}.label`)}
                  </Text>
                  <Text style={styles.optionHint}>
                    {t(`settings.themeMode.${option}.hint`)}
                  </Text>
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
        <Text style={styles.sectionTitle}>{t("settings.temporaryLogout.label")}</Text>
        <Text style={styles.subtitle}>{t("settings.temporaryLogout.hint")}</Text>

        <Pressable
          style={[styles.logoutButton, isSigningOut && styles.logoutButtonDisabled]}
          onPress={handleTemporaryLogout}
          disabled={isSigningOut}
          accessibilityRole="button"
        >
          <Text style={styles.logoutButtonLabel}>
            {isSigningOut
              ? t("settings.temporaryLogout.loading")
              : t("settings.temporaryLogout.action")}
          </Text>
        </Pressable>
      </View>

      {/* AI model selector moved to suggest.tsx for better UX */}
      <TestSection />
      <DevBenchLink />
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  title: {
    fontSize: theme.font.size.xxl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
  providerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  providerChip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  providerChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  providerChipText: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
  },
  providerChipTextActive: {
    color: theme.colors.primaryForeground,
  },
  keyRow: {
    gap: theme.spacing.xs,
  },
  keyLabel: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
  },
  keyInput: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  keyActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  smallBtn: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignSelf: "flex-start",
  },
  smallBtnText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
    color: theme.colors.primaryForeground,
  },
  dangerBtn: {
    backgroundColor: theme.colors.error,
  },
  actionBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignSelf: "flex-start",
    minHeight: theme.button.md,
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.primaryForeground,
  },
  modelInfo: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
  modelList: {
    gap: theme.spacing.xs,
  },
  customModelBox: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  modelRow: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  modelRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "14",
  },
  modelRowBody: {
    flex: 1,
    gap: 2,
  },
  modelRowTitle: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
  },
  modelBadge: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
    color: theme.colors.textSecondary,
  },
  modelLink: {
    marginTop: 2,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
    color: theme.colors.info,
  },
  supportBox: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    gap: 4,
  },
  supportGood: {
    backgroundColor: theme.colors.success + "18",
  },
  supportWarning: {
    backgroundColor: theme.colors.warning + "18",
  },
  supportBlocked: {
    backgroundColor: theme.colors.error + "18",
  },
  supportTitle: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
  },
  supportText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.text,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.skeleton,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.success,
  },
  progressText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
    minWidth: 40,
    textAlign: "right",
  },
  modelReady: {
    gap: theme.spacing.sm,
  },
  modelReadyText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.success,
  },
  errorText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.error,
  },
  resultBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  resultTitle: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
  },
  resultItem: {
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
