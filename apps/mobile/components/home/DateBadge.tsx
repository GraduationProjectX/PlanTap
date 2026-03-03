import { View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type DateBadgeProps = {
  day: number;
  month?: string;
};

export function DateBadge({ day, month }: DateBadgeProps) {
  return (
    <View style={styles.container}>
      {month && <Text style={styles.month}>{month}</Text>}
      <Text style={styles.day}>{day}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    backgroundColor: theme.colors.headerBackground,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  month: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: theme.font.family.medium,
    textTransform: "uppercase",
    letterSpacing: theme.font.letterSpacing.wide,
  },
  day: {
    color: "#FFFFFF",
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
    lineHeight: 20,
  },
}));
