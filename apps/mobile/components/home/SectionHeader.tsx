import { View, Text, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useDirection } from "@/rtl";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { flexDirection, textAlign } = useDirection();

  return (
    <View style={[styles.container, { flexDirection }]}>
      <Text style={[styles.title, { textAlign }]}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  title: {
    fontSize: theme.font.size.xxl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  action: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
    color: theme.colors.textSecondary,
  },
}));
