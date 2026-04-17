import { View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type LiveBadgeProps = {
  label: string;
};

export function LiveBadge({ label }: LiveBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    backgroundColor: "#EF4444",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  label: {
    color: "#FFFFFF",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.bold,
    letterSpacing: theme.font.letterSpacing.wider,
    textTransform: "uppercase",
  },
}));
