import { View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useDirection } from "@/rtl";
import { Separator } from "heroui-native";

type BookmarkSectionHeaderProps = {
  title: string;
  dateRange?: string;
};

export function BookmarkSectionHeader({ title, dateRange }: BookmarkSectionHeaderProps) {
  const { flexDirection } = useDirection();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { flexDirection }]}>
        <Text style={styles.title}>{title}</Text>
        {dateRange && <Text style={styles.dateRange}>{dateRange}</Text>}
      </View>
      <Separator thickness={1} style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    gap: theme.spacing.sm,
    marginBottom: 4,
  },
  container: {
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  separator: {
    backgroundColor: theme.colors.divider,
  },
  title: {
    fontSize: theme.font.size.xxl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  dateRange: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.textSecondary,
  },
}));
