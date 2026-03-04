import { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useAiStore, type AiProvider } from "@/stores";
import {
  getApiKey,
  setApiKey,
  clearApiKey,
} from "@/services/ai/secureKeys";
import type { AiProviderKey } from "@/services/ai/secureKeys";
import {
  AVAILABLE_MODELS,
  downloadModel,
  cancelDownload,
  deleteModel,
} from "@/services/ai/modelDownloader";
import { useEventRecommendations } from "@/hooks/useEventRecommendations";

// ---------------------------------------------------------------------------
// Provider Selector
// ---------------------------------------------------------------------------

const PROVIDERS: { key: AiProvider; label: string }[] = [
  { key: "gemini", label: "Gemini" },
  { key: "openai", label: "OpenAI" },
  { key: "claude", label: "Claude" },
  { key: "local", label: "Local (on-device)" },
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

// ---------------------------------------------------------------------------
// API Key Input
// ---------------------------------------------------------------------------

const CLOUD_PROVIDERS: { key: AiProviderKey; label: string }[] = [
  { key: "gemini", label: "Gemini" },
  { key: "openai", label: "OpenAI" },
  { key: "claude", label: "Claude" },
];

function ApiKeySection() {
  const [keys, setKeys] = useState<Record<AiProviderKey, string>>({
    gemini: "",
    openai: "",
    claude: "",
  });
  const [saving, setSaving] = useState<AiProviderKey | null>(null);

  // Load existing keys on mount (show masked)
  useEffect(() => {
    (async () => {
      const loaded: Record<AiProviderKey, string> = { gemini: "", openai: "", claude: "" };
      for (const p of CLOUD_PROVIDERS) {
        const k = await getApiKey(p.key);
        if (k) loaded[p.key] = k;
      }
      setKeys(loaded);
    })();
  }, []);

  const handleSave = useCallback(
    async (provider: AiProviderKey) => {
      const value = keys[provider].trim();
      if (!value) return;
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

// ---------------------------------------------------------------------------
// Local Model Section
// ---------------------------------------------------------------------------

function LocalModelSection() {
  const {
    localModelDownloaded,
    localModelPath,
    isDownloading,
    downloadProgress,
  } = useAiStore();

  const handleDownload = useCallback(async () => {
    try {
      // Default to the smaller model for initial testing
      await downloadModel(AVAILABLE_MODELS[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed";
      Alert.alert("Download Error", msg);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    Alert.alert("Delete Model", "Remove the downloaded model?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteModel(AVAILABLE_MODELS[0].filename);
          } catch {
            Alert.alert("Error", "Failed to delete model.");
          }
        },
      },
    ]);
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Local Model</Text>
      <Text style={styles.modelInfo}>
        {AVAILABLE_MODELS[0].label} ({AVAILABLE_MODELS[0].sizeLabel})
      </Text>

      {isDownloading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${downloadProgress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{downloadProgress}%</Text>
          <Pressable style={[styles.smallBtn, styles.dangerBtn]} onPress={cancelDownload}>
            <Text style={styles.smallBtnText}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {!isDownloading && !localModelDownloaded && (
        <Pressable style={styles.actionBtn} onPress={handleDownload}>
          <Text style={styles.actionBtnText}>Download Model</Text>
        </Pressable>
      )}

      {localModelDownloaded && (
        <View style={styles.modelReady}>
          <Text style={styles.modelReadyText}>
            Model ready at{"\n"}
            {localModelPath}
          </Text>
          <Pressable style={[styles.smallBtn, styles.dangerBtn]} onPress={handleDelete}>
            <Text style={styles.smallBtnText}>Delete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Test Button
// ---------------------------------------------------------------------------

function TestSection() {
  const { eventIds, isLoading, error, recommendTest } =
    useEventRecommendations();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Test Recommendations</Text>
      <Pressable
        style={styles.actionBtn}
        onPress={() => { recommendTest(); }}
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
              • {id}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Settings Screen
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.title}>Settings</Text>
      <ProviderSelector />
      <ApiKeySection />
      <LocalModelSection />
      <TestSection />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: theme.font.size["2xl"],
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },

  // Section
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  sectionTitle: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  // Provider chips
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

  // API key rows
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

  // Small buttons
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

  // Action buttons
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

  // Model info
  modelInfo: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },

  // Progress bar
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

  // Model ready
  modelReady: {
    gap: theme.spacing.sm,
  },
  modelReadyText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.success,
  },

  // Test results
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
}));
