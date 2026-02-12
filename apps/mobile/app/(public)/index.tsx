import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text selectable style={styles.title}>
        Welcome to PlanTap
      </Text>
      <Text selectable style={styles.subtitle}>
        This is your authenticated public area.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.font.size.display,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
}));
