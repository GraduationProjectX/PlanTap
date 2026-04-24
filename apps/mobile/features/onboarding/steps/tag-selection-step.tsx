import { TagGroup } from "heroui-native";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { OnboardingTagOption } from "../types";

type TagSelectionStepProps = {
  title: string;
  description: string;
  selectedTags: string[];
  options: OnboardingTagOption[];
  onSelectionChange: (tags: string[]) => void;
};

export function TagSelectionStep({
  title,
  description,
  selectedTags,
  options,
  onSelectionChange,
}: TagSelectionStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.card}>
        <TagGroup
          selectionMode="multiple"
          selectedKeys={selectedTags}
          onSelectionChange={(keys) => {
            onSelectionChange(Array.from(keys, (key) => `${key}`));
          }}
        >
          <TagGroup.List>
            {options.map((option) => (
              <TagGroup.Item key={option.id} id={option.id}>
                {option.label}
              </TagGroup.Item>
            ))}
          </TagGroup.List>
        </TagGroup>
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
    gap: theme.spacing.md,
  },
}));
