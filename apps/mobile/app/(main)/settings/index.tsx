import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Configuration screen placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.font.size.xxl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
}));
