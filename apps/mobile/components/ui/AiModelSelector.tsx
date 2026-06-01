import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { isRunningInExpoGo } from "expo";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";

import { useAiStore } from "@/stores";
import { setApiKey, getApiKey } from "@/services/ai/secureKeys";
import { releaseLocalModel } from "@/services/ai/providers/local";
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
  const [isExpanded, setIsExpanded] = useState(true);
  const apiProviders: Array<"gemini" | "openai" | "claude"> = ["gemini", "openai", "claude"];

  const setProvider = useAiStore((s) => s.setProvider);
  const provider = useAiStore((s) => s.provider);
  const setLocalModelPath = useAiStore((s) => s.setLocalModelPath);
  const setLocalModelDownloaded = useAiStore((s) => s.setLocalModelDownloaded);
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

  useEffect(() => {
    if (provider !== "local") {
      setSelectedApi(provider);
    }
  }, [provider]);
  // Load the correct API key whenever the selected provider changes
  useEffect(() => {
    let isMounted = true;

    async function loadProviderKey() {
      try {
        const storedKey = await getApiKey(selectedApi);
        if (isMounted) {
          // If the key is your default fallback "KY", keep the input clear for the user
          setApiKeyInput(storedKey === "KY" ? "" : storedKey || "");
        }
      } catch (error) {
        console.error("Failed to fetch secure key for:", selectedApi, error);
      }
    }

    void loadProviderKey();
    return () => {
      isMounted = false;
    };
  }, [selectedApi]);

  const handleApiKeyChange = (value: string) => {
    setApiKeyInput(value);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert(t("common.error"), t("ai.apiKeyRequired"));
      return;
    }

    try {
      await setApiKey(selectedApi, apiKey);
      setProvider(selectedApi);
      // Since selectedApi is a cloud provider, release local model.
      releaseLocalModel().catch(console.error);
      Alert.alert(t("common.success"), t("ai.apiKeySaved", { provider: selectedApi }));
      //setApiKeyInput("");
    } catch {
      Alert.alert(t("common.error"), t("ai.apiKeySaveError"));
    }
  };

  const handleDownloadModel = async (modelId: string) => {
    if (inExpoGo) {
      Alert.alert(t("common.error"), t("ai.localRequiresDevBuild"));
      return;
    }

    try {
      setDownloadingModelId(modelId);

      const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
      if (!model) return;

      await downloadModel(model);
      setProvider("local");

      Alert.alert(t("common.success"), t("ai.modelDownloaded", { model: model.label }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Model download failed:", message);
      Alert.alert(t("common.error"), t("ai.modelDownloadFailed", { message }));
    } finally {
      setDownloadingModelId(null);
    }
  };

  const handleUseLocalModel = (filename: string) => {
    setLocalModelPath(modelFilePath(filename));
    setLocalModelDownloaded(true);
    setProvider("local");
  };

  useEffect(() => {
    if (!isExpanded) return;

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

    void refreshDownloaded();
  }, [isExpanded, aiStoreIsDownloading, downloadStatus, localModelPath, rnfs]);

  return (
    <View style={styles.container}>
      {/* Header with toggle */}
      <Pressable onPress={() => setIsExpanded(!isExpanded)} style={styles.header}>
        <Text style={styles.title}>{t("ai.modelSelector")}</Text>
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
              <Text style={[styles.tabText, tab === "api" && styles.tabTextActive]}>
                {t("ai.apiProviders")}
              </Text>
            </Pressable>
            {!inExpoGo && (
              <Pressable
                onPress={() => setTab("local")}
                style={[styles.tab, tab === "local" && styles.tabActive]}
              >
                <Text style={[styles.tabText, tab === "local" && styles.tabTextActive]}>
                  {t("ai.localModels")}
                </Text>
              </Pressable>
            )}
          </View>

          {/* API Providers Tab */}
          {tab === "api" && (
            <View style={styles.tabContent}>
              <Text style={styles.subtitle}>{t("ai.chooseProvider")}</Text>

              <View style={styles.providerList}>
                {apiProviders.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setSelectedApi(p)}
                    style={[styles.provider, selectedApi === p && styles.providerActive]}
                  >
                    <Text
                      style={[styles.providerText, selectedApi === p && styles.providerTextActive]}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder={t("ai.apiKeyPlaceholder", { provider: selectedApi })}
                value={apiKey}
                onChangeText={handleApiKeyChange}
                secureTextEntry
                placeholderTextColor="#999"
              />

              <Pressable onPress={handleSaveApiKey} style={styles.button}>
                <Text style={styles.buttonText}>{t("ai.saveAndUseApi")}</Text>
              </Pressable>
            </View>
          )}

          {/* Local Models Tab */}
          {!inExpoGo && tab === "local" && (
            <View style={styles.tabContent}>
              <Text style={styles.subtitle}>{t("ai.downloadModel")}</Text>

              <View style={styles.modelList}>
                {!rnfs && (
                  <View style={styles.inlineErrorBox}>
                    <Text style={styles.inlineErrorText}>{t("ai.filesystemUnavailable")}</Text>
                  </View>
                )}
                {AVAILABLE_MODELS.map((model) => {
                  const isDownloadingThisModel =
                    downloadStatus === "downloading" && downloadModelId === model.id;
                  const isPausedThisModel =
                    downloadStatus === "paused" && downloadModelId === model.id;
                  const isActive = localModelPath === modelFilePath(model.filename);
                  const isLocalProvider = provider === "local";
                  const isDownloaded = isActive || downloadedById[model.id] === true;
                  const isBusy = downloadStatus === "downloading" || downloadStatus === "paused";

                  return (
                    <View key={model.id} style={styles.modelItem}>
                      <View style={styles.modelInfo}>
                        <Text style={styles.modelName}>{model.label}</Text>
                        <Text style={styles.modelDesc}>
                          {model.sizeLabel}{" "}
                          {model.recommendedForMobile ? t("ai.mobileFriendly") : ""}
                        </Text>
                      </View>

                      {isDownloadingThisModel && (
                        <View style={styles.progressColumn}>
                          <View style={styles.progress}>
                            <Text style={styles.progressText}>{aiStoreProgress}%</Text>
                          </View>
                          <View style={styles.actionRow}>
                            <Pressable onPress={pauseDownload} style={styles.smallBtn}>
                              <Text style={styles.smallBtnText}>{t("ai.pause")}</Text>
                            </Pressable>
                            <Pressable
                              onPress={cancelDownload}
                              style={[styles.smallBtn, styles.cancelBtn]}
                            >
                              <Text style={styles.smallBtnText}>{t("common.cancel")}</Text>
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
                            <Text style={styles.smallBtnText}>{t("ai.resume")}</Text>
                          </Pressable>
                          <Pressable
                            onPress={cancelDownload}
                            style={[styles.smallBtn, styles.cancelBtn]}
                          >
                            <Text style={styles.smallBtnText}>{t("common.cancel")}</Text>
                          </Pressable>
                        </View>
                      )}

                      {!isDownloadingThisModel && !isPausedThisModel && isActive && (
                        <View style={styles.actionRow}>
                          {isLocalProvider ? (
                            <Text style={styles.activeText}>{t("ai.active")}</Text>
                          ) : (
                            <Pressable
                              onPress={() => handleUseLocalModel(model.filename)}
                              style={styles.smallBtn}
                            >
                              <Text style={styles.smallBtnText}>{t("ai.use")}</Text>
                            </Pressable>
                          )}
                          <Pressable
                            onPress={() => deleteModel(model.filename)}
                            style={[styles.smallBtn, styles.deleteBtn]}
                          >
                            <Text style={styles.smallBtnText}>{t("ai.delete")}</Text>
                          </Pressable>
                        </View>
                      )}

                      {!isDownloadingThisModel &&
                        !isPausedThisModel &&
                        !isActive &&
                        isDownloaded && (
                          <View style={styles.actionRow}>
                            <Pressable
                              onPress={() => handleUseLocalModel(model.filename)}
                              style={styles.smallBtn}
                            >
                              <Text style={styles.smallBtnText}>{t("ai.use")}</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => deleteModel(model.filename)}
                              style={[styles.smallBtn, styles.deleteBtn]}
                            >
                              <Text style={styles.smallBtnText}>{t("ai.delete")}</Text>
                            </Pressable>
                          </View>
                        )}

                      {!isDownloadingThisModel && !isPausedThisModel && !isDownloaded && (
                        <Pressable
                          onPress={() => handleDownloadModel(model.id)}
                          style={[
                            styles.downloadBtn,
                            (!rnfs || isBusy) && styles.downloadBtnDisabled,
                          ]}
                          disabled={!rnfs || isBusy}
                        >
                          <Text style={styles.downloadText}>
                            {!rnfs
                              ? t("ai.needDevBuild")
                              : downloadingModelId === model.id
                                ? t("ai.starting")
                                : t("ai.download")}
                          </Text>
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

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
  },
  toggle: {
    fontSize: theme.font.size.base,
    color: theme.colors.textMuted,
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  tabs: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  tab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
  },
  tabTextActive: {
    color: theme.colors.primaryForeground,
  },
  tabContent: {
    gap: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  inlineErrorBox: {
    backgroundColor: theme.colors.error + "18",
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
  },
  inlineErrorText: {
    fontSize: theme.font.size.sm,
    color: theme.colors.error,
    fontFamily: theme.font.family.medium,
    lineHeight: 16,
  },
  providerList: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    flexWrap: "wrap",
  },
  provider: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  providerActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    color: "white"
  },
  providerText: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
  },
  providerTextActive: {
    color: theme.colors.primaryForeground,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  button: {
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.primaryForeground,
    fontFamily: theme.font.family.semiBold,
  },
  modelList: {
    gap: theme.spacing.sm,
  },
  modelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
  },
  modelDesc: {
    fontSize: theme.font.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  progress: {
    width: 60,
    alignItems: "center",
  },
  progressColumn: {
    alignItems: "flex-end",
    gap: theme.spacing.xs,
  },
  progressText: {
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    alignItems: "center",
  },
  smallBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  smallBtnDisabled: {
    opacity: 0.5,
  },
  smallBtnText: {
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
  },
  cancelBtn: {
    borderColor: theme.colors.error,
  },
  deleteBtn: {
    borderColor: theme.colors.error,
  },
  downloadBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
  },
  downloadBtnDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  downloadText: {
    color: theme.colors.primaryForeground,
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.medium,
  },
  activeText: {
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.medium,
    color: theme.colors.success,
  },
}));
