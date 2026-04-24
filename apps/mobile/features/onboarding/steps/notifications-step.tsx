import { Switch } from "heroui-native";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type NotificationsStepProps = {
  title: string;
  description: string;
  switchLabel: string;
  switchDescription: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
};

export function NotificationsStep({
  title,
  description,
  switchLabel,
  switchDescription,
  enabled,
  onToggle,
}: NotificationsStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.copy}>
          <Text style={styles.switchLabel}>{switchLabel}</Text>
          <Text style={styles.switchDescription}>{switchDescription}</Text>
        </View>

        <Switch isSelected={enabled} onSelectedChange={onToggle} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  switchLabel: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
  },
  switchDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
  },
}));
