import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { BottomSheet, Button, Select } from "heroui-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { SectionHeader } from "@/components/home/SectionHeader";
import { UpcomingEventsList } from "@/components/home/UpcomingEventsList";
import { AiModelSelector } from "@/components/ui/AiModelSelector";
import { SUPPORTED_CITIES } from "@/features/filters/utils";
import { useAiContext } from "@/hooks/useAiContext";
import { useEventRecommendations } from "@/hooks/useEventRecommendations";
import { useEvents, type EventDoc } from "@/hooks/use-events";
import { useDirection } from "@/rtl";
import type { RecommendationResult } from "@/services/ai/types";
import { useAiStore } from "@/stores";

const PROVIDER_LABELS = {
  gemini: "Gemini",
  openai: "OpenAI",
  claude: "Claude",
  local: "Local",
};

const CITY_OVERLAY_OPACITY_VALUES: [number, number, number] = [0, 1, 0];

function eventMatchesCity(location: string | undefined, city: string | undefined): boolean {
  if (!city) {
    return true;
  }

  const normalizedCity = city.trim().toLowerCase();
  if (!normalizedCity) {
    return true;
  }

  const normalizedLocation = (location ?? "").toLowerCase();
  if (!normalizedLocation) {
    return false;
  }

  return normalizedLocation === normalizedCity || normalizedLocation.includes(normalizedCity);
}

function isEventDoc(value: EventDoc | undefined): value is EventDoc {
  return value != null;
}

export default function SuggestScreen() {
  const { t } = useTranslation();
  const { textAlign, flexDirection, isRTL } = useDirection();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const provider = useAiStore((state) => state.provider);
  const localModelDownloaded = useAiStore((state) => state.localModelDownloaded);
  const localModelPath = useAiStore((state) => state.localModelPath);
  const { eventIds, isLoading, error, response, recommend } = useEventRecommendations();
  const [userNote, setUserNote] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | undefined>();
  const [sheetInput, setSheetInput] = useState("");
  const [dismissedResponse, setDismissedResponse] = useState<RecommendationResult | null>(null);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);

  const isAuthenticated = isLoaded && isSignedIn;
  const convexData = useAiContext(selectedCity, isAuthenticated);
  const defaultCity = convexData.userContext?.city;
  const fallbackCity = SUPPORTED_CITIES[0];
  const resolvedCity = selectedCity ?? defaultCity ?? fallbackCity;
  const selectedCityValue = resolvedCity ? { value: resolvedCity, label: resolvedCity } : undefined;
  const { events: fullEvents, isLoading: isFullEventsLoading } = useEvents(resolvedCity, true);
  const needsLocalModel = provider === "local" && (!localModelDownloaded || !localModelPath);
  const canRequest = isAuthenticated && !convexData.isLoading && !isLoading && !needsLocalModel;
  const providerLabel = PROVIDER_LABELS[provider];
  const actionableResponse =
    response && response.type !== "recommendations" && response !== dismissedResponse
      ? response
      : null;
  const isSheetOpen = actionableResponse != null;
  const recommendationStatus = isLoading
    ? t("common.loading")
    : isAuthenticated
      ? t("ai.testProvider", { provider: providerLabel })
      : t("ai.signInPrompt");

  const recommendedEvents =
    fullEvents && eventIds.length > 0
      ? eventIds.map((id) => fullEvents.find((event) => event._id === id)).filter(isEventDoc)
      : [];

  const runRecommendation = (message?: string) => {
    if (!canRequest || !convexData.userContext || !convexData.events) {
      return;
    }

    const context = { ...convexData.userContext, city: resolvedCity };
    const contextEvents = resolvedCity
      ? convexData.events.filter((event) => eventMatchesCity(event.location, resolvedCity))
      : convexData.events;

    setDismissedResponse(null);
    setSheetInput("");
    recommend(context, contextEvents, message);
  };

  const handleRun = () => {
    const trimmedNote = userNote.trim();
    runRecommendation(trimmedNote.length > 0 ? trimmedNote : undefined);
  };

  const handleFollowUpSubmit = () => {
    if (!actionableResponse || actionableResponse.type !== "follow_up") {
      setDismissedResponse(actionableResponse);
      return;
    }

    const trimmed = sheetInput.trim();
    if (!trimmed) {
      return;
    }

    const baseNote = userNote.trim();
    const nextMessage = baseNote.length > 0 ? `${baseNote}\nFollow-up: ${trimmed}` : trimmed;
    setDismissedResponse(actionableResponse);
    runRecommendation(nextMessage);
  };

  const handleSheetOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDismissedResponse(actionableResponse);
    }
  };

  const handleEventPress = (id: string) => {
    router.push({ pathname: "/event/[id]", params: { id } });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
          <View style={[styles.headerTopRow, { flexDirection }]}>
            <View style={styles.headerTitleGroup}>
              <Text style={[styles.title, { textAlign }]}>{t("tabs.suggest")}</Text>
            </View>

            <View style={[styles.headerActions, { flexDirection }]}>
              {/* <View style={[styles.providerPill, { flexDirection }]}>
                <FontAwesome name="magic" size={13} color={theme.colors.headerForeground} />
                <Text style={styles.providerText}>{providerLabel}</Text>
              </View> */}
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                feedbackVariant="scale"
                onPress={() => setIsAiSettingsOpen(true)}
                style={styles.settingsButton}
              >
                <FontAwesome name="cog" size={18} color={theme.colors.headerForeground} />
              </Button>
            </View>
          </View>

          {/* <Text style={[styles.subtitle, { textAlign }]}>{recommendationStatus}</Text> */}

          <Select
            presentation="bottom-sheet"
            value={selectedCityValue}
            onValueChange={(option) => setSelectedCity(option?.value)}
          >
            <Select.Trigger style={styles.cityTrigger}>
              <Text style={styles.cityLabel}>{t("ai.cityLabel").toUpperCase()}</Text>
              <View style={[styles.cityRow, { flexDirection }]}>
                <View style={[styles.cityValueRow, { flexDirection }]}>
                  <FontAwesome name="map-marker" size={18} color={theme.colors.headerForeground} />
                  <Select.Value style={{color: "white", fontSize: 18}} placeholder={t("ai.cityPlaceholder")} />
                </View>
                <Select.TriggerIndicator />
              </View>
            </Select.Trigger>

            <Select.Portal>
              <Select.Overlay
                animation={{ opacity: { value: CITY_OVERLAY_OPACITY_VALUES } }}
                style={styles.cityOverlay}
              />
              <Select.Content presentation="bottom-sheet" snapPoints={["65%"]}>
                <Select.ListLabel>{t("ai.cityListLabel")}</Select.ListLabel>
                {SUPPORTED_CITIES.map((city) => (
                  <Select.Item key={city} value={city} label={city} />
                ))}
                <View style={styles.sheetBottomSpacer} />
              </Select.Content>
            </Select.Portal>
          </Select>
        </View>

        <View style={styles.promptSection}>
          <View style={styles.promptCard}>
            <View style={[styles.promptTitleRow, { flexDirection }]}>
              <FontAwesome name="sliders" size={16} color={theme.colors.text} />
              <Text style={[styles.promptLabel, { textAlign }]}>{t("ai.userNoteLabel")}</Text>
            </View>
            <TextInput
              style={[styles.textInput, { textAlign }]}
              value={userNote}
              onChangeText={setUserNote}
              placeholder={t("ai.userNotePlaceholder")}
              placeholderTextColor={theme.colors.textMuted}
              multiline
              maxLength={300}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { textAlign: isRTL ? "left" : "right" }]}>
              {userNote.length}/300
            </Text>
          </View>

          <Button
            variant="primary"
            size="lg"
            feedbackVariant="scale"
            onPress={handleRun}
            isDisabled={!canRequest}
            style={styles.actionButton}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.primaryForeground} size="small" />
            ) : (
              <>
                <Button.Label style={styles.actionLabel}>{t("ai.getSuggestions")}</Button.Label>
                <FontAwesome
                  name={isRTL ? "arrow-left" : "arrow-right"}
                  size={16}
                  color={theme.colors.primaryForeground}
                />
              </>
            )}
          </Button>
        </View>

        {needsLocalModel ? <StatusCard tone="error" message={t("ai.localModelMissing")} /> : null}

        {isLoaded && !isSignedIn ? (
          <StatusCard tone="error" message={t("ai.signInPrompt")} />
        ) : null}

        {isAuthenticated && convexData.isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
            <Text style={[styles.loadingText, { textAlign }]}>{t("ai.loadingConvex")}</Text>
          </View>
        ) : null}

        {convexData.unavailable ? (
          <StatusCard tone="error" message={t("ai.convexUnavailable")} />
        ) : null}

        {error ? <StatusCard tone="error" message={error} /> : null}

        {recommendedEvents.length > 0 ? (
          <View style={styles.recommendationsSection}>
            <SectionHeader title={t("ai.recommendationsTitle")} />
            <UpcomingEventsList events={recommendedEvents} onEventPress={handleEventPress} />
          </View>
        ) : null}

        {!isFullEventsLoading && eventIds.length > 0 && recommendedEvents.length === 0 ? (
          <StatusCard tone="error" message={t("ai.recommendationsMissing")} />
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomSheet isOpen={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content snapPoints={["45%", "65%"]}>
            <BottomSheet.Close />
            <BottomSheet.Title style={styles.sheetTitle}>
              {actionableResponse?.type === "follow_up"
                ? t("ai.followUpTitle")
                : actionableResponse?.type === "invalid_prompt"
                  ? t("ai.invalidPromptTitle")
                  : t("ai.noMatchesTitle")}
            </BottomSheet.Title>
            <BottomSheet.Description style={styles.sheetDescription}>
              {actionableResponse && "message" in actionableResponse
                ? actionableResponse.message
                : ""}
            </BottomSheet.Description>

            {actionableResponse?.type === "invalid_prompt" && actionableResponse.examples ? (
              <View style={styles.sheetList}>
                {actionableResponse.examples.map((example) => (
                  <Text key={example} style={styles.sheetListItem}>
                    {example}
                  </Text>
                ))}
              </View>
            ) : null}

            {actionableResponse?.type === "no_matches" && actionableResponse.suggestions ? (
              <View style={styles.sheetList}>
                {actionableResponse.suggestions.map((suggestion) => (
                  <Text key={suggestion} style={styles.sheetListItem}>
                    {suggestion}
                  </Text>
                ))}
              </View>
            ) : null}

            {actionableResponse?.type === "follow_up" ? (
              <View style={styles.sheetFollowUp}>
                <TextInput
                  style={styles.sheetInput}
                  value={sheetInput}
                  onChangeText={setSheetInput}
                  placeholder={actionableResponse.inputPlaceholder ?? t("ai.followUpPlaceholder")}
                  placeholderTextColor={theme.colors.textMuted}
                  maxLength={240}
                />
                <Button
                  variant="primary"
                  size="lg"
                  feedbackVariant="scale"
                  onPress={handleFollowUpSubmit}
                  isDisabled={sheetInput.trim().length === 0}
                >
                  <Button.Label>
                    {actionableResponse.submitLabel ?? t("ai.followUpSubmit")}
                  </Button.Label>
                </Button>
              </View>
            ) : null}
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>

      <BottomSheet isOpen={isAiSettingsOpen} onOpenChange={setIsAiSettingsOpen}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content snapPoints={["70%", "90%"]}>
            <BottomSheet.Close />
            <BottomSheet.Title style={styles.sheetTitle}>{t("ai.modelSelector")}</BottomSheet.Title>
            <View style={styles.aiSettingsContent}>
              <AiModelSelector />
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </View>
  );
}

function StatusCard({ message, tone }: { message: string; tone: "error" }) {
  const { textAlign } = useDirection();

  return (
    <View style={styles.statusCard}>
      <Text style={[styles.statusText, tone === "error" && styles.statusTextError, { textAlign }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: theme.colors.headerBackground,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    borderCurve: "continuous",
  },
  headerTopRow: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  headerTitleGroup: {
    flex: 1,
    gap: 2,
  },
  headerActions: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  headerEyebrow: {
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.medium,
    color: theme.colors.headerMuted,
    letterSpacing: theme.font.letterSpacing.widest,
    textTransform: "uppercase",
  },
  title: {
    fontSize: theme.font.size.xxxl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.headerForeground,
  },
  subtitle: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
    color: theme.colors.headerMuted,
  },
  providerPill: {
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    minHeight: 34,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.headerOverlay,
  },
  providerText: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.bold,
    color: theme.colors.headerForeground,
  },
  settingsButton: {
    width: 34,
    height: 34,
    minWidth: 34,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.headerOverlay,
  },
  cityTrigger: {
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    backgroundColor: theme.colors.headerOverlay,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    alignItems: "flex-start",
    gap: 4,
  },
  cityLabel: {
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.medium,
    color: theme.colors.headerMuted,
    letterSpacing: theme.font.letterSpacing.widest,
  },
  cityRow: {
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    gap: theme.spacing.sm,
  },
  cityValueRow: {
    alignItems: "center",
    gap: theme.spacing.sm,
    flexShrink: 1,
  },
  cityOverlay: {
    backgroundColor: theme.colors.overlayDark,
  },
  promptSection: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  promptCard: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  promptTitleRow: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  promptLabel: {
    flex: 1,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  textInput: {
    minHeight: 104,
    padding: 0,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.text,
  },
  charCount: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
    color: theme.colors.textMuted,
  },
  actionButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: "#000",
    flexDirection: "row",
    gap: 8,
  },
  actionLabel: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.bold,
    color: theme.colors.primaryForeground,
  },
  statusCard: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusText: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
    color: theme.colors.textSecondary,
  },
  statusTextError: {
    color: theme.colors.error,
  },
  loadingRow: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  loadingText: {
    flex: 1,
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
    color: theme.colors.textSecondary,
  },
  recommendationsSection: {
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.xs,
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
  aiSettingsContent: {
    paddingTop: theme.spacing.sm,
  },
  sheetInput: {
    minHeight: 48,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.text,
  },
  sheetBottomSpacer: {
    height: 100,
  },
  bottomSpacer: {
    height: theme.spacing.xxl,
  },
}));
