import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { useDirection } from "@/rtl";
import { useAiStore } from "@/stores";
import { useEventRecommendations } from "@/hooks/useEventRecommendations";
import { useAiContext } from "@/hooks/useAiContext";
import { getTestPromptData } from "@/services/ai/prompts";

export default function SuggestScreen() {
  const { t } = useTranslation();
  const { textAlign } = useDirection();
  const provider = useAiStore((s) => s.provider);
  const { eventIds, isLoading, error, recommend, recommendTest } =
    useEventRecommendations();
  const [userNote, setUserNote] = useState("");
  const [useRealData, setUseRealData] = useState(false);

  // Real Convex data (may be null while loading)
  const convexData = useAiContext();
  const testData = getTestPromptData();

  // Choose which data source to display below
  const displayEvents = useRealData && !convexData.isLoading
    ? convexData.events ?? []
    : testData.events;

  const handleRun = () => {
    if (useRealData && !convexData.isLoading && convexData.userContext && convexData.events) {
      recommend(convexData.userContext, convexData.events, userNote || undefined);
    } else {
      recommendTest(userNote || undefined);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { textAlign }]}>{t("tabs.suggest")}</Text>
      <Text style={[styles.subtitle, { textAlign }]}>
        AI test — provider: {provider}
      </Text>

      {/* ---------- Data source toggle ---------- */}
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleBtn, !useRealData && styles.toggleBtnActive]}
          onPress={() => setUseRealData(false)}
        >
          <Text style={[styles.toggleText, !useRealData && styles.toggleTextActive]}>
            Test Data
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, useRealData && styles.toggleBtnActive]}
          onPress={() => setUseRealData(true)}
        >
          <Text style={[styles.toggleText, useRealData && styles.toggleTextActive]}>
            Live (Convex)
          </Text>
        </Pressable>
      </View>

      {useRealData && convexData.isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Loading Convex data…</Text>
        </View>
      )}

      {useRealData && convexData.unavailable && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            Convex backend not linked yet — using test data as fallback.
          </Text>
        </View>
      )}

      {useRealData && !convexData.isLoading && convexData.userContext && (
        <View style={styles.contextBox}>
          <Text style={styles.contextTitle}>Your Profile (from Convex)</Text>
          <Text style={styles.contextItem}>City: {convexData.userContext.city ?? "—"}</Text>
          <Text style={styles.contextItem}>
            Interests: {convexData.userContext.interests?.join(", ") || "none set"}
          </Text>
          <Text style={styles.contextItem}>
            Group: {convexData.userContext.groupType ?? "any"} · Indoor/Outdoor: {convexData.userContext.indoorOutdoor ?? "any"}
          </Text>
        </View>
      )}

      {/* ---------- User note ---------- */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>What are you in the mood for?</Text>
        <TextInput
          style={styles.textInput}
          value={userNote}
          onChangeText={setUserNote}
          placeholder="e.g. something techy and outdoors, or a fun food event..."
          placeholderTextColor="#999"
          multiline
          maxLength={300}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{userNote.length}/300</Text>
      </View>

      {/* ---------- Run ---------- */}
      <Pressable
        style={[styles.btn, isLoading && styles.btnDisabled]}
        onPress={handleRun}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnText}>
            {useRealData ? "Get Suggestions" : "Run Test Prompt"}
          </Text>
        )}
      </Pressable>

      {/* ---------- Error ---------- */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ---------- Results ---------- */}
      {eventIds.length > 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Recommended Event IDs</Text>
          {eventIds.map((id, i) => (
            <Text key={id} style={styles.resultItem}>
              {i + 1}. {id}
            </Text>
          ))}
        </View>
      )}

      {/* ---------- Events fed to the model ---------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {useRealData ? `Events from Convex (${displayEvents.length})` : "Test Events (input)"}
        </Text>
        {displayEvents.length === 0 && (
          <Text style={styles.eventDesc}>No events found. Add some via the admin or scraper.</Text>
        )}
        {displayEvents.map((evt) => (
          <View key={evt.id} style={styles.eventCard}>
            <Text style={styles.eventTitle}>{evt.title}</Text>
            <Text style={styles.eventMeta}>
              {evt.id} · {evt.categories.join(", ")}
            </Text>
            <Text style={styles.eventDesc} numberOfLines={2}>
              {evt.description}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
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
    fontSize: theme.font.size["2xl"],
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
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

  // Results
  resultBox: {
    backgroundColor: theme.colors.success + "18",
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  resultTitle: {
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.base,
    color: theme.colors.text,
    marginBottom: 4,
  },
  resultItem: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
  },

  // Section
  section: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.lg,
    color: theme.colors.text,
  },

  // Data source toggle
  toggleRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  toggleText: {
    fontFamily: theme.font.family.medium,
    fontSize: theme.font.size.base,
    color: theme.colors.textSecondary,
  },
  toggleTextActive: {
    color: theme.colors.primaryForeground,
  },

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

  // Context box
  contextBox: {
    backgroundColor: theme.colors.info + "18",
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 4,
  },
  contextTitle: {
    fontFamily: theme.font.family.bold,
    fontSize: theme.font.size.base,
    color: theme.colors.text,
    marginBottom: 2,
  },
  contextItem: {
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    color: theme.colors.text,
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

  // Event cards
  eventCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    gap: 4,
    ...theme.shadow.sm,
  },
  eventTitle: {
    fontFamily: theme.font.family.semiBold,
    fontSize: theme.font.size.base,
    color: theme.colors.text,
  },
  eventMeta: {
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
  },
  eventDesc: {
    fontFamily: theme.font.family.regular,
    fontSize: theme.font.size.md,
    color: theme.colors.textMuted,
  },
}));
