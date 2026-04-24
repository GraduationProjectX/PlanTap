import { Button, RadioGroup, Slider } from "heroui-native";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import {
  ONBOARDING_BUDGET_DEFAULT_RANGE,
  ONBOARDING_BUDGET_MAX,
  ONBOARDING_BUDGET_MIN,
  ONBOARDING_BUDGET_STEP,
} from "../defaults";
import type { OnboardingGroupType, OnboardingIndoorOutdoor } from "../types";

type DefaultsStepProps = {
  title: string;
  description: string;
  groupTypeLabel: string;
  indoorOutdoorLabel: string;
  budgetLabel: string;
  clearBudgetLabel: string;
  budgetRangePrefix: string;
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
  budgetMin: number | null;
  budgetMax: number | null;
  onGroupTypeChange: (value: OnboardingGroupType) => void;
  onIndoorOutdoorChange: (value: OnboardingIndoorOutdoor) => void;
  onBudgetRangeChange: (budgetMin: number | null, budgetMax: number | null) => void;
};

function formatBudgetRange(prefix: string, budgetMin: number, budgetMax: number) {
  return `${prefix} ${budgetMin} - ${budgetMax}`;
}

export function DefaultsStep({
  title,
  description,
  groupTypeLabel,
  indoorOutdoorLabel,
  budgetLabel,
  clearBudgetLabel,
  budgetRangePrefix,
  groupTypeOptions,
  indoorOutdoorOptions,
  groupType,
  indoorOutdoor,
  budgetMin,
  budgetMax,
  onGroupTypeChange,
  onIndoorOutdoorChange,
  onBudgetRangeChange,
}: DefaultsStepProps) {
  const sliderValue =
    budgetMin != null && budgetMax != null
      ? [budgetMin, budgetMax]
      : [ONBOARDING_BUDGET_DEFAULT_RANGE[0], ONBOARDING_BUDGET_DEFAULT_RANGE[1]];

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{groupTypeLabel}</Text>
          <RadioGroup
            value={groupType}
            onValueChange={(value) => {
              if (value === "solo" || value === "group" || value === "kids") {
                onGroupTypeChange(value);
              }
            }}
          >
            {groupTypeOptions.map((option) => (
              <RadioGroup.Item key={option.value} value={option.value}>
                <View style={styles.radioTextBlock}>
                  <Text style={styles.radioTitle}>{option.label}</Text>
                  <Text style={styles.radioDescription}>{option.description}</Text>
                </View>
              </RadioGroup.Item>
            ))}
          </RadioGroup>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{indoorOutdoorLabel}</Text>
          <RadioGroup
            value={indoorOutdoor}
            onValueChange={(value) => {
              if (value === "indoor" || value === "outdoor" || value === "any") {
                onIndoorOutdoorChange(value);
              }
            }}
          >
            {indoorOutdoorOptions.map((option) => (
              <RadioGroup.Item key={option.value} value={option.value}>
                <View style={styles.radioTextBlock}>
                  <Text style={styles.radioTitle}>{option.label}</Text>
                  <Text style={styles.radioDescription}>{option.description}</Text>
                </View>
              </RadioGroup.Item>
            ))}
          </RadioGroup>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{budgetLabel}</Text>
          <Slider
            value={sliderValue}
            minValue={ONBOARDING_BUDGET_MIN}
            maxValue={ONBOARDING_BUDGET_MAX}
            step={ONBOARDING_BUDGET_STEP}
            onChange={(value) => {
              if (!Array.isArray(value) || value.length !== 2) {
                return;
              }

              const first = value[0];
              const second = value[1];
              onBudgetRangeChange(Math.min(first, second), Math.max(first, second));
            }}
          >
            <Slider.Output>
              {({ state }) => (
                <Text style={styles.sliderOutput}>
                  {formatBudgetRange(budgetRangePrefix, state.values[0], state.values[1])}
                </Text>
              )}
            </Slider.Output>
            <Slider.Track>
              {({ state }) => (
                <>
                  <Slider.Fill />
                  {state.values.map((value, index) => (
                    <Slider.Thumb key={`${value}-${index}`} index={index} />
                  ))}
                </>
              )}
            </Slider.Track>
          </Slider>
          {(budgetMin != null || budgetMax != null) && (
            <Button
              variant="outline"
              feedbackVariant="scale"
              style={styles.clearBudgetButton}
              onPress={() => {
                onBudgetRangeChange(null, null);
              }}
            >
              <Button.Label style={styles.clearBudgetButtonLabel}>{clearBudgetLabel}</Button.Label>
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.lg,
  },
  textBlock: {
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.size.xxl,
    fontFamily: theme.font.family.bold,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    lineHeight: 20,
  },
  card: {
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
    letterSpacing: theme.font.letterSpacing.wide,
    textTransform: "uppercase",
  },
  radioTextBlock: {
    flex: 1,
    gap: 2,
  },
  radioTitle: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
  },
  radioDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
  },
  sliderOutput: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
  },
  clearBudgetButton: {
    minHeight: theme.button.xl,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
  },
  clearBudgetButtonLabel: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.semiBold,
  },
}));
