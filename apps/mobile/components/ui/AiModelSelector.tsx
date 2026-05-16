/**
 * Compact AI model/provider selector component.
 *
 * Allows users to choose between cloud API providers (Gemini, OpenAI, Claude)
 * and local models with download/API key management.
 *
 * Mobile-optimized: compact, collapsible design.
 */

import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { isRunningInExpoGo } from "expo";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

import { useAiStore } from "@/stores";
import { setApiKey } from "@/services/ai/secureKeys";
import {
  AVAILABLE_MODELS,
  cancelDownload,
  deleteModel,
  downloadModel,
  isModelDownloaded,
  modelFilePath,
  pauseDownload,
  resumeDownload,
} from "@/services/ai/modelDownloader";
import { getRNFS } from "@/services/nativeFileSystem";

type TabMode = "api" | "local";

export function AiModelSelector() {
  const { t } = useTranslation();
  const inExpoGo = isRunningInExpoGo();
  const rnfs = getRNFS();
  const [tab, setTab] = useState<TabMode>("api");
  const [isExpanded, setIsExpanded] = useState(false);
  const apiProviders: Array<"gemini" | "openai" | "claude"> = ["gemini", "openai", "claude"];

  const setProvider = useAiStore((s) => s.setProvider);
  const localModelPath = useAiStore((s) => s.localModelPath);
  const aiStoreIsDownloading = useAiStore((s) => s.isDownloading);
  const aiStoreProgress = useAiStore((s) => s.downloadProgress);
  const downloadStatus = useAiStore((s) => s.downloadStatus);
  const downloadModelId = useAiStore((s) => s.downloadModelId);
  const downloadCanResume = useAiStore((s) => s.downloadCanResume);

  const [apiKey, setApiKeyInput] = useState<string>("");
  const [selectedApi, setSelectedApi] = useState<"gemini" | "openai" | "claude">("gemini");
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const [downloadedById, setDownloadedById] = useState<Record<string, boolean>>({});

  const handleApiKeyChange = (value: string) => {
    setApiKeyInput(value);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert(t("common.error"), "API key required");
      return;
    }

    try {
      await setApiKey(selectedApi, apiKey);
      setProvider(selectedApi);
      Alert.alert(t("common.success"), `${selectedApi} API key saved`);
      setApiKeyInput("");
    } catch {
      Alert.alert(t("common.error"), "Failed to save API key");
    }
  };

  const handleDownloadModel = async (modelId: string) => {
    if (inExpoGo) {
      Alert.alert(
        t("common.error"),
        "Local model downloads require a native development build. Use a development client or build an APK."
      );
      return;
    }

    try {
      setDownloadingModelId(modelId);

      const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
      if (!model) return;

      await downloadModel(model);
      setProvider("local");

      Alert.alert(t("common.success"), `${model.label} downloaded`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Model download failed:", message);
      Alert.alert(t("common.error"), `Failed to download model: ${message}`);
    } finally {
      setDownloadingModelId(null);
    }
  };

  const refreshDownloaded = async () => {
    if (!rnfs) {
      setDownloadedById({});
      return;
    }

    const entries: Record<string, boolean> = {};
    for (const model of AVAILABLE_MODELS) {
      entries[model.id] = await isModelDownloaded(model.filename);
    }
    setDownloadedById(entries);
  };

  useEffect(() => {
    if (!isExpanded) return;
    void refreshDownloaded();
  }, [isExpanded, aiStoreIsDownloading, downloadStatus, localModelPath, rnfs]);

  return (
    <View style={styles.container}>
      {/* Header with toggle */}
      <Pressable onPress={() => setIsExpanded(!isExpanded)} style={styles.header}>
        <Text style={styles.title}>{t("ai.modelSelector") || "AI Model"}</Text>
        <Text style={styles.toggle}>{isExpanded ? "▼" : "▶"}</Text>
      </Pressable>

      {/* Collapsible content */}
      {isExpanded && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Tab selector */}
          <View style={styles.tabs}>
            <Pressable
              onPress={() => setTab("api")}
              style={[styles.tab, tab === "api" && styles.tabActive]}
            >
              <Text style={styles.tabText}>API Providers</Text>
            </Pressable>
            {!inExpoGo && (
              <Pressable
                onPress={() => setTab("local")}
                style={[styles.tab, tab === "local" && styles.tabActive]}
              >
                <Text style={styles.tabText}>Local Models</Text>
              </Pressable>
            )}
          </View>

          {/* API Providers Tab */}
          {tab === "api" && (
            <View style={styles.tabContent}>
              <Text style={styles.subtitle}>Choose Provider</Text>

              <View style={styles.providerList}>
                {apiProviders.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setSelectedApi(p)}
                    style={[
                      styles.provider,
                      selectedApi === p && styles.providerActive,
                    ]}
                  >
                    <Text style={styles.providerText}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder={`${selectedApi} API Key`}
                value={apiKey}
                onChangeText={handleApiKeyChange}
                secureTextEntry
                placeholderTextColor="#999"
              />

              <Pressable onPress={handleSaveApiKey} style={styles.button}>
                <Text style={styles.buttonText}>Save & Use API</Text>
              </Pressable>
            </View>
          )}

          {/* Local Models Tab */}
          {!inExpoGo && tab === "local" && (
            <View style={styles.tabContent}>
              <Text style={styles.subtitle}>Download Model</Text>

              <View style={styles.modelList}>
                {!rnfs && (
                  <View style={styles.inlineErrorBox}>
                    <Text style={styles.inlineErrorText}>
                      Filesystem unavailable. Run a dev build: pnpm --filter mobile android
                    </Text>
                  </View>
                )}
                {AVAILABLE_MODELS.map((model) => {
                  const isDownloadingThisModel = downloadStatus === "downloading" && downloadModelId === model.id;
                  const isPausedThisModel = downloadStatus === "paused" && downloadModelId === model.id;
                  const isActive = localModelPath === modelFilePath(model.filename);
                  const isDownloaded = isActive || downloadedById[model.id] === true;
                  const isBusy = downloadStatus === "downloading" || downloadStatus === "paused";

                  return (
                    <View key={model.id} style={styles.modelItem}>
                      <View style={styles.modelInfo}>
                        <Text style={styles.modelName}>{model.label}</Text>
                        <Text style={styles.modelDesc}>
                          {model.sizeLabel} {model.recommendedForMobile ? "• Mobile-friendly" : ""}
                        </Text>
                      </View>

                      {isDownloadingThisModel && (
                        <View style={styles.progressColumn}>
                          <View style={styles.progress}>
                            <Text style={styles.progressText}>{aiStoreProgress}%</Text>
                          </View>
                          <View style={styles.actionRow}>
                            <Pressable onPress={pauseDownload} style={styles.smallBtn}>
                              <Text style={styles.smallBtnText}>Pause</Text>
                            </Pressable>
                            <Pressable onPress={cancelDownload} style={[styles.smallBtn, styles.cancelBtn]}>
                              <Text style={styles.smallBtnText}>Cancel</Text>
                            </Pressable>
                          </View>
                        </View>
                      )}

                      {isPausedThisModel && (
                        <View style={styles.actionRow}>
                          <Pressable
                            onPress={resumeDownload}
                            style={[styles.smallBtn, !downloadCanResume && styles.smallBtnDisabled]}
                            disabled={!downloadCanResume}
                          >
                            <Text style={styles.smallBtnText}>Resume</Text>
                          </Pressable>
                          <Pressable onPress={cancelDownload} style={[styles.smallBtn, styles.cancelBtn]}>
                            <Text style={styles.smallBtnText}>Cancel</Text>
                          </Pressable>
                        </View>
                      )}

                      {!isDownloadingThisModel && !isPausedThisModel && isActive && (
                        <View style={styles.actionRow}>
                          <Text style={styles.activeText}>✓ Active</Text>
                          <Pressable onPress={() => deleteModel(model.filename)} style={[styles.smallBtn, styles.deleteBtn]}>
                            <Text style={styles.smallBtnText}>Delete</Text>
                          </Pressable>
                        </View>
                      )}

                      {!isDownloadingThisModel && !isPausedThisModel && !isActive && isDownloaded && (
                        <View style={styles.actionRow}>
                          <Pressable
                            onPress={() => setProvider("local")}
                            style={styles.smallBtn}
                          >
                            <Text style={styles.smallBtnText}>Use</Text>
                          </Pressable>
                          <Pressable onPress={() => deleteModel(model.filename)} style={[styles.smallBtn, styles.deleteBtn]}>
                            <Text style={styles.smallBtnText}>Delete</Text>
                          </Pressable>
                        </View>
                      )}

                      {!isDownloadingThisModel && !isPausedThisModel && !isDownloaded && (
                        <Pressable
                          onPress={() => handleDownloadModel(model.id)}
                          style={[styles.downloadBtn, (!rnfs || isBusy) && styles.downloadBtnDisabled]}
                          disabled={!rnfs || isBusy}
                        >
                          <Text style={styles.downloadText}>{!rnfs ? "Need Dev Build" : (downloadingModelId === model.id ? "Starting..." : "Download")}</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  toggle: {
    fontSize: 16,
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EEE",
  },
  tabActive: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000",
  },
  tabContent: {
    gap: 12,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  inlineErrorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#DC2626",
  },
  inlineErrorText: {
    fontSize: 12,
    color: "#991B1B",
    fontWeight: "500",
    lineHeight: 16,
  },
  providerList: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  provider: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EEE",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  providerActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  providerText: {
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  modelList: {
    gap: 8,
  },
  modelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 13,
    fontWeight: "500",
  },
  modelDesc: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  progress: {
    width: 60,
    alignItems: "center",
  },
  progressColumn: {
    alignItems: "flex-end",
    gap: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  smallBtnDisabled: {
    opacity: 0.5,
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  cancelBtn: {
    backgroundColor: "#FEE2E2",
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
  },
  downloadBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007AFF",
    borderRadius: 6,
  },
  downloadBtnDisabled: {
    backgroundColor: "#C7C7CC",
    opacity: 0.6,
  },
  downloadText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  activeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#34C759",
  },
});
