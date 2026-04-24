import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { getCategoryIconName } from "@/features/categories/meta";

import type { OnboardingTagOption } from "../types";

type DislikesStepProps = {
  title: string;
  description: string;
  selectedTags: string[];
  options: OnboardingTagOption[];
  onSelectionChange: (tags: string[]) => void;
  sectionLabel?: string;
  counterLabel?: string;
  footerNote?: string;
};

export function DislikesStep({
  title,
  description,
  selectedTags,
  options,
  onSelectionChange,
  sectionLabel = "Select what to avoid",
  counterLabel = "selected",
  footerNote = "You can update these anytime",
}: DislikesStepProps) {
  const { theme } = useUnistyles();

  const handleTagPress = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onSelectionChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onSelectionChange([...selectedTags, tagId]);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.illustrationWrapper}>
        <Image
          source={require("@/assets/images/onboarding-dislikes.png")}
          style={styles.illustration}
          contentFit="contain"
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.selectionSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>{sectionLabel}</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {selectedTags.length} {counterLabel}
            </Text>
          </View>
        </View>

        <View style={styles.tagsGrid}>
          {options.map((option, index) => {
            const isSelected = selectedTags.includes(option.id);
            const iconName = getCategoryIconName(option.id, option.icon);

            return (
              <Animated.View
                key={option.id}
                entering={FadeInUp.duration(300).delay(250 + index * 30)}
              >
                <Pressable
                  onPress={() => handleTagPress(option.id)}
                  style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                >
                  <FontAwesome
                    name={iconName}
                    size={16}
                    color={isSelected ? theme.colors.primaryForeground : theme.colors.text}
                  />
                  <Text style={[styles.tagLabel, isSelected && styles.tagLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(400)}>
        <Text style={styles.footerNote}>{footerNote}</Text>
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
    paddingVertical: theme.spacing.md,
  },
  illustration: {
    height: 180,
    width: "100%",
    left: -10,
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
  selectionSection: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLabel: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
  },
  counterBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
  },
  counterText: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tagChipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  tagLabel: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
  },
  tagLabelSelected: {
    color: theme.colors.primaryForeground,
  },
  footerNote: {
    color: theme.colors.textMuted,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    textAlign: "center",
  },
}));
