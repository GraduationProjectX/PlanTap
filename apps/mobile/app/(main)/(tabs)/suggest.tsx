import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { BottomSheet, Button, Select } from "heroui-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useDirection } from "@/rtl";
import { useAiStore } from "@/stores";
import { useEventRecommendations } from "@/hooks/useEventRecommendations";
import { useAiContext } from "@/hooks/useAiContext";
import { AiModelSelector } from "@/components/ui/AiModelSelector";
import { SUPPORTED_CITIES } from "@/features/filters/utils";
import { SectionHeader } from "@/components/home/SectionHeader";
import { UpcomingEventsList } from "@/components/home/UpcomingEventsList";
import { useEvents, type EventDoc } from "@/hooks/use-events";
import type { RecommendationResult } from "@/services/ai/types";

function eventMatchesCity(location: string | undefined, city: string | undefined): boolean {
  if (!city) return true;
  const normalizedCity = city.trim().toLowerCase();
  if (!normalizedCity) return true;

  const normalizedLocation = (location ?? "").toLowerCase();
  if (!normalizedLocation) return false;

  return normalizedLocation === normalizedCity || normalizedLocation.includes(normalizedCity);
}

export default function SuggestScreen() {
  const { t } = useTranslation();
  const { textAlign, flexDirection } = useDirection();
  const { isLoaded, isSignedIn } = useAuth();
  const isAuthenticated = isLoaded && isSignedIn;
  const provider = useAiStore((s) => s.provider);
  const localModelDownloaded = useAiStore((s) => s.localModelDownloaded);
  const localModelPath = useAiStore((s) => s.localModelPath);
  const { eventIds, isLoading, error, response, recommend } =
    useEventRecommendations();
  const [userNote, setUserNote] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetInput, setSheetInput] = useState("");
  const [sheetResponse, setSheetResponse] = useState<RecommendationResult | null>(null);

  const convexData = useAiContext(selectedCity, isAuthenticated);

  const cityOptions = SUPPORTED_CITIES;
  const defaultCity = convexData.userContext?.city;
  const fallbackCity = cityOptions[0];
  const resolvedCity = selectedCity ?? defaultCity ?? fallbackCity;
  const router = useRouter();
  const { events: fullEvents, isLoading: isFullEventsLoading } = useEvents(resolvedCity, true);

  useEffect(() => {
    if (!selectedCity && resolvedCity) {
      setSelectedCity(resolvedCity);
    }
  }, [resolvedCity, selectedCity]);

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === "recommendations") {
      setSheetOpen(false);
      setSheetResponse(null);
      return;
    }

    setSheetResponse(response);
    setSheetInput("");
    setSheetOpen(true);
  }, [response]);

  const runRecommendation = (message?: string) => {
    if (provider === "local" && (!localModelDownloaded || !localModelPath)) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    if (!convexData.isLoading && convexData.userContext && convexData.events) {
      const context = { ...convexData.userContext, city: resolvedCity };
      const contextEvents = resolvedCity
        ? convexData.events.filter((event) => eventMatchesCity(event.location, resolvedCity))
        : convexData.events;
      recommend(context, contextEvents, message);
    }
  };

  const handleRun = () => {
    runRecommendation(userNote || undefined);
  };

  const handleFollowUpSubmit = () => {
    if (!sheetResponse || sheetResponse.type !== "follow_up") {
      setSheetOpen(false);
      return;
    }

    const trimmed = sheetInput.trim();
    if (!trimmed) {
      return;
    }

    const nextMessage = userNote.trim().length > 0
      ? `${userNote.trim()}\nFollow-up: ${trimmed}`
      : trimmed;
    setSheetOpen(false);
    runRecommendation(nextMessage);
  };

  const handleEventPress = (id: string) => {
    router.push({ pathname: "/event/[id]", params: { id } });
  };

  const recommendedEvents = fullEvents && eventIds.length > 0
    ? eventIds
        .map((id) => fullEvents.find((event) => event._id === id))
        .filter(isEventDoc)
    : [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { textAlign }]}>{t("tabs.suggest")}</Text>
      <Text style={[styles.subtitle, { textAlign }]}>
        {t("ai.testProvider", { provider })}
      </Text>

      {/* AI Model Selector (collapsible) */}
      <AiModelSelector />

      {provider === "local" && (!localModelDownloaded || !localModelPath) && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {t("ai.localModelMissing")}
          </Text>
        </View>
      )}

      {isLoaded && !isSignedIn && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{t("ai.signInPrompt")}</Text>
        </View>
      )}

      {isAuthenticated && convexData.isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>{t("ai.loadingConvex")}</Text>
        </View>
      )}

      {convexData.unavailable && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {t("ai.convexUnavailable")}
          </Text>
        </View>
      )}


      {/* ---------- Benchmark Link ---------- */}
      <Pressable
        onPress={() => router.push("/dev-ai-bench")}
        style={styles.benchLink}
      >
        <Text style={styles.benchLinkText}>{t("ai.openBenchmark")}</Text>
      </Pressable>

      {/* ---------- City selection ---------- */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>{t("ai.cityLabel")}</Text>
        <Select
          presentation="bottom-sheet"
          value={resolvedCity ? { value: resolvedCity, label: resolvedCity } : undefined}
          onValueChange={(option) => setSelectedCity(option?.value)}
        >
          <Select.Trigger style={styles.selectTrigger}>
            <View style={[styles.selectInner, { flexDirection }]}>
              <Select.Value placeholder={t("ai.cityPlaceholder")} />
            </View>
            <Select.TriggerIndicator>
              <Text style={styles.selectIndicator}>▼</Text>
            </Select.TriggerIndicator>
          </Select.Trigger>

          <Select.Portal>
            <Select.Overlay style={styles.selectOverlay} />
            <Select.Content presentation="bottom-sheet" snapPoints={["65%"]}>
              <Select.ListLabel>{t("ai.cityListLabel")}</Select.ListLabel>
              {cityOptions.map((city) => (
                <Select.Item key={city} value={city} label={city}>
                  <View style={styles.selectItemInner}>
                    <Select.ItemLabel />
                  </View>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Portal>
        </Select>
      </View>

      {/* ---------- User note ---------- */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>{t("ai.userNoteLabel")}</Text>
        <TextInput
          style={styles.textInput}
          value={userNote}
          onChangeText={setUserNote}
          placeholder={t("ai.userNotePlaceholder")}
          placeholderTextColor="#999"
          multiline
          maxLength={300}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{userNote.length}/300</Text>
      </View>

      {/* ---------- Run ---------- */}
      <Pressable
        style={[styles.btn, (isLoading || !isAuthenticated || convexData.isLoading) && styles.btnDisabled]}
        onPress={handleRun}
        disabled={
          isLoading ||
          !isAuthenticated ||
          convexData.isLoading ||
          (provider === "local" && (!localModelDownloaded || !localModelPath))
        }
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnText}>
            {t("ai.getSuggestions")}
          </Text>
        )}
      </Pressable>

      {/* ---------- Error ---------- */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ---------- Recommendations ---------- */}
      {recommendedEvents.length > 0 && (
        <View style={styles.recommendationsSection}>
          <SectionHeader title={t("ai.recommendationsTitle")} />
          <UpcomingEventsList events={recommendedEvents} onEventPress={handleEventPress} />
        </View>
      )}

      {!isFullEventsLoading && eventIds.length > 0 && recommendedEvents.length === 0 && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{t("ai.recommendationsMissing")}</Text>
        </View>
      )}

      <BottomSheet isOpen={sheetOpen} onOpenChange={setSheetOpen} animation="disable-all">
        <BottomSheet.Portal>
          <BottomSheet.Overlay animation="disabled" />
          <BottomSheet.Content snapPoints={["45%", "65%"]} animation="disabled">
            <BottomSheet.Close />
            <BottomSheet.Title style={styles.sheetTitle}>
              {sheetResponse?.type === "follow_up"
                ? t("ai.followUpTitle")
                : sheetResponse?.type === "invalid_prompt"
                  ? t("ai.invalidPromptTitle")
                  : t("ai.noMatchesTitle")}
            </BottomSheet.Title>
            <BottomSheet.Description style={styles.sheetDescription}>
              {sheetResponse && "message" in sheetResponse ? sheetResponse.message : ""}
            </BottomSheet.Description>

            {sheetResponse?.type === "invalid_prompt" && sheetResponse.examples && (
              <View style={styles.sheetList}>
                {sheetResponse.examples.map((example) => (
                  <Text key={example} style={styles.sheetListItem}>
                    • {example}
                  </Text>
                ))}
              </View>
            )}

            {sheetResponse?.type === "no_matches" && sheetResponse.suggestions && (
              <View style={styles.sheetList}>
                {sheetResponse.suggestions.map((suggestion) => (
                  <Text key={suggestion} style={styles.sheetListItem}>
                    • {suggestion}
                  </Text>
                ))}
              </View>
            )}

            {sheetResponse?.type === "follow_up" && (
              <View style={styles.sheetFollowUp}>
                <TextInput
                  style={styles.sheetInput}
                  value={sheetInput}
                  onChangeText={setSheetInput}
                  placeholder={sheetResponse.inputPlaceholder ?? t("ai.followUpPlaceholder")}
                  placeholderTextColor="#999"
                  maxLength={240}
                />
                <Button
                  variant="primary"
                  size="lg"
                  feedbackVariant="scale"
                  onPress={handleFollowUpSubmit}
                  isDisabled={sheetInput.trim().length === 0}
                >
                  {sheetResponse.submitLabel ?? t("ai.followUpSubmit")}
                </Button>
              </View>
            )}
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </ScrollView>
  );
}

function isEventDoc(value: EventDoc | undefined): value is EventDoc {
  return value != null;
}

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  title: {
    fontSize: theme.font.size.xxl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
  benchLink: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  benchLinkText: {
    color: theme.colors.primary,
    fontFamily: theme.font.family.semiBold,
  },

  // Button
  btn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: theme.colors.primaryForeground,
    fontFamily: theme.font.family.semiBold,
    fontSize: theme.font.size.base,
  },

  // Error
  errorBox: {
    backgroundColor: theme.colors.error + "18",
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
  },

  recommendationsSection: {
    gap: theme.spacing.sm,
  },

  // Data source toggle
  // (Removed test-data toggle; Convex-only)

  // Loading
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.base,
    color: theme.colors.textSecondary,
  },


  // User note input
  inputSection: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    fontFamily: theme.font.family.semiBold,
    fontSize: theme.font.size.base,
    color: theme.colors.text,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.md,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.text,
    minHeight: 80,
  },
  charCount: {
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.sm,
    color: theme.colors.textMuted,
    textAlign: "right" as const,
  },

  // City select
  selectTrigger: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  selectInner: {
    alignItems: "center",
    gap: theme.spacing.sm,
    flex: 1,
  },
  selectIndicator: {
    fontFamily: theme.font.family.medium,
    color: theme.colors.textMuted,
  },
  selectOverlay: {
    backgroundColor: theme.colors.overlayDark,
  },
  selectItemInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flex: 1,
  },

  sheetTitle: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  sheetDescription: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  sheetList: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  sheetListItem: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
  },
  sheetFollowUp: {
    gap: theme.spacing.sm,
  },
  sheetInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.md,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.text,
    minHeight: 48,
  },
}));
