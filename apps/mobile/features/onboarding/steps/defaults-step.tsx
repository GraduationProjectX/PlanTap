import type { ComponentProps } from "react";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { OnboardingGroupType, OnboardingIndoorOutdoor } from "../types";

type DefaultsStepProps = {
  title: string;
  description: string;
  groupTypeLabel: string;
  indoorOutdoorLabel: string;
  groupTypeOptions: Array<{
    value: OnboardingGroupType;
    label: string;
    description: string;
  }>;
  indoorOutdoorOptions: Array<{
    value: OnboardingIndoorOutdoor;
    label: string;
    description: string;
  }>;
  groupType: OnboardingGroupType;
  indoorOutdoor: OnboardingIndoorOutdoor;
  onGroupTypeChange: (value: OnboardingGroupType) => void;
  onIndoorOutdoorChange: (value: OnboardingIndoorOutdoor) => void;
};

type IconName = ComponentProps<typeof FontAwesome>["name"];

const GROUP_TYPE_ICONS: Record<OnboardingGroupType, IconName> = {
  solo: "user",
  group: "users",
  kids: "child",
  any: "globe",
};

const INDOOR_OUTDOOR_ICONS: Record<OnboardingIndoorOutdoor, IconName> = {
  indoor: "home",
  outdoor: "tree",
  any: "globe",
};

export function DefaultsStep({
  title,
  description,
  groupTypeLabel,
  indoorOutdoorLabel,
  groupTypeOptions,
  indoorOutdoorOptions,
  groupType,
  indoorOutdoor,
  onGroupTypeChange,
  onIndoorOutdoorChange,
}: DefaultsStepProps) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.sectionsWrapper}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{groupTypeLabel}</Text>
          <View style={styles.optionsRow}>
            {groupTypeOptions.map((option) => {
              const isSelected = groupType === option.value;
              const iconName = GROUP_TYPE_ICONS[option.value];

              return (
                <Pressable
                  key={option.value}
                  onPress={() => onGroupTypeChange(option.value)}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                >
                  <View style={[styles.optionIconWrapper, isSelected && styles.optionIconWrapperSelected]}>
                    <FontAwesome
                      name={iconName}
                      size={20}
                      color={isSelected ? theme.colors.primaryForeground : theme.colors.text}
                    />
                  </View>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{indoorOutdoorLabel}</Text>
          <View style={styles.optionsRow}>
            {indoorOutdoorOptions.map((option) => {
              const isSelected = indoorOutdoor === option.value;
              const iconName = INDOOR_OUTDOOR_ICONS[option.value];

              return (
                <Pressable
                  key={option.value}
                  onPress={() => onIndoorOutdoorChange(option.value)}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                >
                  <View style={[styles.optionIconWrapper, isSelected && styles.optionIconWrapperSelected]}>
                    <FontAwesome
                      name={iconName}
                      size={20}
                      color={isSelected ? theme.colors.primaryForeground : theme.colors.text}
                    />
                  </View>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.lg,
  },
  illustrationWrapper: {
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  illustration: {
    height: 160,
    width: "100%",
  },
  textBlock: {
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.size.xxxl,
    fontFamily: theme.font.family.bold,
    letterSpacing: theme.font.letterSpacing.tight,
    textAlign: "center",
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: theme.spacing.md,
  },
  sectionsWrapper: {
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
  },
  optionsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  optionCard: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  optionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconWrapperSelected: {
    backgroundColor: theme.colors.primary,
  },
  optionLabel: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
    textAlign: "center",
  },
  optionLabelSelected: {
    fontFamily: theme.font.family.semiBold,
  },
}));
