import { useState, useCallback, useEffect } from "react";
import { useClerk } from "@clerk/clerk-expo";
import {
  ActivityIndicator,
  Alert,
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
  downloadModel,
  cancelDownload,
  deleteModel,
  isModelDownloaded,
  modelFilePath,
} from "@/services/ai/modelDownloader";

const THEME_OPTIONS: AppThemeMode[] = ["system", "light", "dark"];

const PROVIDERS: { key: AiProvider; label: string }[] = [
  { key: "gemini", label: "Gemini" },
  { key: "openai", label: "OpenAI" },
  { key: "claude", label: "Claude" },
  { key: "local", label: "Local (on-device)" },
];

const CLOUD_PROVIDERS: { key: AiProviderKey; label: string }[] = [
  { key: "gemini", label: "Gemini" },
  { key: "openai", label: "OpenAI" },
  { key: "claude", label: "Claude" },
];

function ProviderSelector() {
  const provider = useAiStore((s) => s.provider);
  const setProvider = useAiStore((s) => s.setProvider);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>AI Provider</Text>
      <View style={styles.providerRow}>
        {PROVIDERS.map((p) => (
          <Pressable
            key={p.key}
            style={[
              styles.providerChip,
              provider === p.key && styles.providerChipActive,
            ]}
            onPress={() => setProvider(p.key)}
          >
            <Text
              style={[
                styles.providerChipText,
                provider === p.key && styles.providerChipTextActive,
              ]}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ApiKeySection() {
  const [keys, setKeys] = useState<Record<AiProviderKey, string>>({
    gemini: "",
    openai: "",
    claude: "",
  });
  const [saving, setSaving] = useState<AiProviderKey | null>(null);

  useEffect(() => {
    (async () => {
      const loaded: Record<AiProviderKey, string> = {
        gemini: "",
        openai: "",
        claude: "",
      };
      for (const p of CLOUD_PROVIDERS) {
        const k = await getApiKey(p.key);
        if (k) {
          loaded[p.key] = k;
        }
      }
      setKeys(loaded);
    })();
  }, []);

  const handleSave = useCallback(
    async (provider: AiProviderKey) => {
      const value = keys[provider].trim();
      if (!value) {
        return;
      }

      setSaving(provider);
      try {
        await setApiKey(provider, value);
        Alert.alert("Saved", `${provider} API key saved securely.`);
      } catch {
        Alert.alert("Error", "Failed to save key.");
      } finally {
        setSaving(null);
      }
    },
    [keys],
  );

  const handleClear = useCallback(async (provider: AiProviderKey) => {
    await clearApiKey(provider);
    setKeys((prev) => ({ ...prev, [provider]: "" }));
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>API Keys</Text>
      {CLOUD_PROVIDERS.map((p) => (
        <View key={p.key} style={styles.keyRow}>
          <Text style={styles.keyLabel}>{p.label}</Text>
          <TextInput
            style={styles.keyInput}
            value={keys[p.key]}
            onChangeText={(text) =>
              setKeys((prev) => ({ ...prev, [p.key]: text }))
            }
            placeholder={`Enter ${p.label} API key`}
            placeholderTextColor="#999"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.keyActions}>
            <Pressable
              style={styles.smallBtn}
              onPress={() => handleSave(p.key)}
              disabled={saving === p.key}
            >
              {saving === p.key ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.smallBtnText}>Save</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.smallBtn, styles.dangerBtn]}
              onPress={() => handleClear(p.key)}
            >
              <Text style={styles.smallBtnText}>Clear</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

function LocalModelSection() {
  const {
    localModelDownloaded,
    localModelPath,
    isDownloading,
    downloadProgress,
  } = useAiStore();
  const setDownloadComplete = useAiStore((s) => s.setDownloadComplete);

  const [selectedModelId, setSelectedModelId] = useState(AVAILABLE_MODELS[0].id);
  const [installed, setInstalled] = useState<Record<string, boolean>>({});

  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === selectedModelId) ?? AVAILABLE_MODELS[0];

  const refreshInstalled = useCallback(async () => {
    const entries = await Promise.all(
      AVAILABLE_MODELS.map(async (m) => [m.id, await isModelDownloaded(m.filename)] as const),
    );
    setInstalled(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    refreshInstalled();
  }, [refreshInstalled]);

  const handleDownload = useCallback(async () => {
    try {
      await downloadModel(selectedModel);
      await refreshInstalled();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed";
      Alert.alert("Download Error", msg);
    }
  }, [refreshInstalled, selectedModel]);

  const handleUseModel = useCallback(() => {
    const path = modelFilePath(selectedModel.filename);
    setDownloadComplete(path);
    Alert.alert("Local Model", `${selectedModel.label} is now active.`);
  }, [selectedModel, setDownloadComplete]);

  const handleDelete = useCallback(async () => {
    Alert.alert("Delete Model", "Remove the downloaded model?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteModel(selectedModel.filename);
            await refreshInstalled();
          } catch {
            Alert.alert("Error", "Failed to delete model.");
          }
        },
      },
    ]);
  }, [refreshInstalled, selectedModel]);

  const selectedModelPath = modelFilePath(selectedModel.filename);
  const selectedModelInstalled = Boolean(installed[selectedModel.id]);
  const selectedIsActive = localModelPath === selectedModelPath;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Local Model</Text>

      <View style={styles.modelList}>
        {AVAILABLE_MODELS.map((model) => {
          const isSelected = model.id === selectedModelId;
          const isInstalled = Boolean(installed[model.id]);
          const isActive = localModelPath === modelFilePath(model.filename);

          return (
            <Pressable
              key={model.id}
              style={[styles.modelRow, isSelected && styles.modelRowSelected]}
              onPress={() => setSelectedModelId(model.id)}
            >
              <View style={styles.modelRowBody}>
                <Text style={styles.modelRowTitle}>{model.label}</Text>
                <Text style={styles.modelInfo}>{model.sizeLabel}</Text>
              </View>
              <Text style={styles.modelBadge}>
                {isActive ? "Active" : isInstalled ? "Downloaded" : "Not installed"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isDownloading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${downloadProgress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{downloadProgress}%</Text>
          <Pressable
            style={[styles.smallBtn, styles.dangerBtn]}
            onPress={cancelDownload}
          >
            <Text style={styles.smallBtnText}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {!isDownloading && !selectedModelInstalled && (
        <Pressable style={styles.actionBtn} onPress={handleDownload}>
          <Text style={styles.actionBtnText}>Download Selected Model</Text>
        </Pressable>
      )}

      {!isDownloading && selectedModelInstalled && !selectedIsActive && (
        <Pressable style={styles.actionBtn} onPress={handleUseModel}>
          <Text style={styles.actionBtnText}>Use Selected Model</Text>
        </Pressable>
      )}

      {localModelDownloaded && localModelPath && (
        <View style={styles.modelReady}>
          <Text style={styles.modelReadyText}>
            Active model path{"\n"}
            {localModelPath}
          </Text>
          <Pressable
            style={[styles.smallBtn, styles.dangerBtn]}
            onPress={handleDelete}
          >
            <Text style={styles.smallBtnText}>Delete</Text>
          </Pressable>
        </View>
      )}

      {!localModelDownloaded && selectedModelInstalled && (
        <Text style={styles.modelInfo}>Selected model is downloaded. Tap "Use Selected Model" to activate it.</Text>
      )}
    </View>
  );
}

function TestSection() {
  const { eventIds, isLoading, error, recommendTest } = useEventRecommendations();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Test Recommendations</Text>
      <Pressable
        style={styles.actionBtn}
        onPress={() => {
          recommendTest();
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.actionBtnText}>Run Test Prompt</Text>
        )}
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {eventIds.length > 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Recommended IDs:</Text>
          {eventIds.map((id) => (
            <Text key={id} style={styles.resultItem}>
              {id}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

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

      <ProviderSelector />
      <ApiKeySection />
      <LocalModelSection />
      <TestSection />
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
    fontSize: theme.font.size["2xl"],
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
