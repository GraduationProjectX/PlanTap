import { useMutation } from "convex/react";
import { api } from "backend/convex/_generated/api";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, View } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import * as Notifications from "expo-notifications";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import OnboardingProgress from "@/components/onboarding/onboarding-progress";
import {
  ONBOARDING_DEFAULT_DRAFT,
  ONBOARDING_FALLBACK_TAG_OPTIONS,
  ONBOARDING_GROUP_TYPE_OPTIONS,
  ONBOARDING_INDOOR_OUTDOOR_OPTIONS,
  ONBOARDING_STEPS,
} from "@/features/onboarding/defaults";
import CityStep from "@/components/onboarding/steps/city-step";
import DefaultsStep from "@/components/onboarding/steps/defaults-step";
import DislikesStep from "@/components/onboarding/steps/dislikes-step";
import InterestsStep from "@/components/onboarding/steps/likes-step";
import IntroStep from "@/components/onboarding/steps/intro-step";
import NotificationsStep from "@/components/onboarding/steps/notifications-step";
import { getCityOptions } from "@/features/filters/utils";
import { useCategories } from "@/hooks/use-categories";
import { useEvents } from "@/hooks/use-events";
import { useDirection } from "@/rtl";

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { t, i18n } = useTranslation();
  const { flexDirection } = useDirection();
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const { events } = useEvents();
  const { categories } = useCategories();

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState(ONBOARDING_DEFAULT_DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = ONBOARDING_STEPS[stepIndex];
  const isFinalStep = stepIndex === ONBOARDING_STEPS.length - 1;
  const showSkip = stepIndex > 0;
  const canContinueFromStep =
    currentStep === "interests"
      ? draft.preferences.likedTags.length > 0
      : currentStep === "dislikes"
        ? draft.preferences.dislikedTags.length > 0
        : true;

  const cityOptions = getCityOptions(events ?? []);
  const isArabic = i18n.language === "ar";
  const categoryTagOptions = categories
    .filter((category) => category.key !== "all")
    .map((category) => ({
      id: category.key,
      label: isArabic ? category.labelAr : category.label,
      icon: category.icon,
    }));
  const tagOptions =
    categoryTagOptions.length > 0
      ? categoryTagOptions
      : ONBOARDING_FALLBACK_TAG_OPTIONS.map((option) => ({
          ...option,
          label: t(`onboarding.tags.${option.id}`, { defaultValue: option.label }),
        }));
  const likedTagSet = new Set(draft.preferences.likedTags);
  const dislikedTagSet = new Set(draft.preferences.dislikedTags);
  const interestOptions = tagOptions.filter((option) => !dislikedTagSet.has(option.id));
  const dislikeOptions = tagOptions.filter((option) => !likedTagSet.has(option.id));
  const groupTypeOptions = ONBOARDING_GROUP_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
    description: t(option.descriptionKey),
  }));
  const indoorOutdoorOptions = ONBOARDING_INDOOR_OUTDOOR_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
    description: t(option.descriptionKey),
  }));

  const goToNextStep = () => {
    setStepIndex((current) => Math.min(current + 1, ONBOARDING_STEPS.length - 1));
  };

  const goToPreviousStep = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const getNotificationPermission = async () => {
    const currentPermission = await Notifications.getPermissionsAsync();
    if (currentPermission.granted) {
      return true;
    }

    const requestedPermission = await Notifications.requestPermissionsAsync();
    return requestedPermission.granted;
  };

  const submitOnboarding = async (notificationsEnabled: boolean) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const canEnableNotifications = notificationsEnabled
        ? await getNotificationPermission()
        : false;
      if (notificationsEnabled && !canEnableNotifications) {
        Alert.alert(
          t("onboarding.notifications.permissionDeniedTitle"),
          t("onboarding.notifications.permissionDeniedDescription"),
        );
      }

      await completeOnboarding({
        city: draft.city,
        preferences: {
          likedTags: draft.preferences.likedTags,
          dislikedTags: draft.preferences.dislikedTags,
        },
        defaults: {
          groupType: draft.defaults.groupType,
          indoorOutdoor: draft.defaults.indoorOutdoor,
          budgetMin: null,
          budgetMax: null,
        },
        notificationsEnabled: canEnableNotifications,
      });
      router.replace("/");
    } catch (error) {
      console.error("Failed to complete onboarding", error);
      Alert.alert(t("onboarding.errors.submitTitle"), t("onboarding.errors.submitDescription"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (isFinalStep) {
      void submitOnboarding(false);
      return;
    }

    goToNextStep();
  };

  const renderStep = () => {
    if (currentStep === "intro") {
      return (
        <IntroStep
          titleLine1={t("onboarding.intro.titleLine1")}
          titleLine2={t("onboarding.intro.titleLine2")}
          description={t("onboarding.intro.description")}
          ctaLabel={t("onboarding.intro.cta")}
          onContinue={goToNextStep}
        />
      );
    }

    if (currentStep === "city") {
      return (
        <CityStep
          title={t("onboarding.city.title")}
          description={t("onboarding.city.description")}
          selectLabel={t("onboarding.city.selectLabel")}
          searchPlaceholder={t("onboarding.city.searchPlaceholder")}
          selectedCity={draft.city}
          cityOptions={cityOptions}
          onSelectCity={(city) => {
            setDraft((current) => ({
              ...current,
              city,
            }));
          }}
        />
      );
    }

    if (currentStep === "interests") {
      return (
        <InterestsStep
          title={t("onboarding.interests.title")}
          description={t("onboarding.interests.description")}
          sectionLabel={t("onboarding.interests.sectionLabel")}
          counterLabel={t("onboarding.interests.counterLabel")}
          footerNote={t("onboarding.interests.footerNote")}
          selectedTags={draft.preferences.likedTags}
          options={interestOptions}
          onSelectionChange={(likedTags) => {
            setDraft((current) => ({
              ...current,
              preferences: {
                likedTags,
                dislikedTags: current.preferences.dislikedTags.filter(
                  (tag) => !likedTags.includes(tag),
                ),
              },
            }));
          }}
        />
      );
    }

    if (currentStep === "dislikes") {
      return (
        <DislikesStep
          title={t("onboarding.dislikes.title")}
          description={t("onboarding.dislikes.description")}
          sectionLabel={t("onboarding.dislikes.sectionLabel")}
          counterLabel={t("onboarding.dislikes.counterLabel")}
          footerNote={t("onboarding.dislikes.footerNote")}
          selectedTags={draft.preferences.dislikedTags}
          options={dislikeOptions}
          onSelectionChange={(dislikedTags) => {
            setDraft((current) => ({
              ...current,
              preferences: {
                likedTags: current.preferences.likedTags.filter(
                  (tag) => !dislikedTags.includes(tag),
                ),
                dislikedTags,
              },
            }));
          }}
        />
      );
    }

    if (currentStep === "defaults") {
      return (
        <DefaultsStep
          title={t("onboarding.defaults.title")}
          description={t("onboarding.defaults.description")}
          groupTypeLabel={t("onboarding.defaults.groupType.label")}
          indoorOutdoorLabel={t("onboarding.defaults.indoorOutdoor.label")}
          groupTypeOptions={groupTypeOptions}
          indoorOutdoorOptions={indoorOutdoorOptions}
          groupType={draft.defaults.groupType}
          indoorOutdoor={draft.defaults.indoorOutdoor}
          onGroupTypeChange={(groupType) => {
            setDraft((current) => ({
              ...current,
              defaults: {
                ...current.defaults,
                groupType,
              },
            }));
          }}
          onIndoorOutdoorChange={(indoorOutdoor) => {
            setDraft((current) => ({
              ...current,
              defaults: {
                ...current.defaults,
                indoorOutdoor,
              },
            }));
          }}
        />
      );
    }

    return (
      <NotificationsStep
        title={t("onboarding.notifications.title")}
        description={t("onboarding.notifications.description")}
        switchLabel={t("onboarding.notifications.switchLabel")}
        switchDescription={t("onboarding.notifications.switchDescription")}
        benefitReminder={t("onboarding.notifications.benefits.reminder")}
        benefitInterests={t("onboarding.notifications.benefits.interests")}
        benefitNearby={t("onboarding.notifications.benefits.nearby")}
        enabled={draft.notificationsEnabled}
        onToggle={(enabled) => {
          setDraft((current) => ({
            ...current,
            notificationsEnabled: enabled,
          }));
        }}
      />
    );
  };

  if (currentStep === "intro") {
    return renderStep();
  }

  return (
    <View style={styles.screenRoot}>
      <View
        style={[
          styles.topHeader,
          {
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.progressSlot}>
            <OnboardingProgress currentStep={stepIndex} totalSteps={ONBOARDING_STEPS.length} />
          </View>
          {showSkip && (
            <Button
              variant="outline"
              isDisabled={isSubmitting}
              onPress={handleSkip}
              style={styles.skipAction}
            >
              <Button.Label className="text-foreground" style={styles.secondaryActionLabel}>
                {t("common.skip")}
              </Button.Label>
            </Button>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollFill}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.lg,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          key={currentStep}
          entering={FadeInRight.duration(220)}
          exiting={FadeOutLeft.duration(180)}
          style={styles.stepSlot}
        >
          {renderStep()}
        </Animated.View>
      </ScrollView>

      {stepIndex > 0 && (
        <View
          style={[
            styles.bottomActions,
            { flexDirection, paddingBottom: insets.bottom + 16, paddingTop: theme.spacing.md },
          ]}
        >
          <Button
            variant="outline"
            feedbackVariant="scale"
            onPress={goToPreviousStep}
            isDisabled={isSubmitting}
            style={styles.secondaryAction}
          >
            <Button.Label style={styles.secondaryActionLabel}>{t("common.back")}</Button.Label>
          </Button>

          <Button
            feedbackVariant="scale"
            onPress={() => {
              if (!canContinueFromStep) {
                return;
              }

              if (isFinalStep) {
                void submitOnboarding(draft.notificationsEnabled);
                return;
              }

              goToNextStep();
            }}
            isDisabled={isSubmitting || !canContinueFromStep}
            style={styles.primaryAction}
          >
            <Button.Label style={styles.primaryActionLabel}>
              {isFinalStep
                ? isSubmitting
                  ? t("onboarding.actions.submitting")
                  : t("onboarding.actions.finish")
                : t("common.next")}
            </Button.Label>
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screenRoot: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollFill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  topHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  progressSlot: {
    flex: 1,
  },
  stepSlot: {
    gap: theme.spacing.md,
  },
  skipAction: {
    minHeight: theme.button.md,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    paddingHorizontal: theme.spacing.md,
    borderWidth: 0,
    borderColor: "transparent",
  },
  bottomActions: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  secondaryAction: {
    flex: 1,
    minHeight: theme.button.xl,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
  },
  secondaryActionLabel: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
  },
  primaryAction: {
    flex: 1,
    minHeight: theme.button.xl,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.colors.overlayDark,
  },
  primaryActionLabel: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.semiBold,
  },
}));
