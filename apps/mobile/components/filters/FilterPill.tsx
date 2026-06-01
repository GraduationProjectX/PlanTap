import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type FilterPillProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  iconName?: React.ComponentProps<typeof FontAwesome>["name"];
  iconSize?: number;
};

export function FilterPill({
  label,
  active,
  onPress,
  iconName,
  iconSize = 13,
}: FilterPillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active ? styles.pillActive : styles.pillInactive,
        pressed && styles.pillPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      {iconName && <FontAwesome name={iconName} size={iconSize} color={active ? "#FFF" : "#000"} />}
      <Text style={active ? styles.labelActive : styles.labelInactive}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  pill: {
    borderRadius: 999,
    borderCurve: "continuous",
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: "#000",
    borderWidth: 1.2,
    borderColor: "#000",
    gap: 6,
  },
  pillInactive: {
    backgroundColor: "#FFF",
    borderWidth: 1.2,
    borderColor: "#E2E2E2",
    gap: 6,
  },
  pillPressed: {
    opacity: 0.72,
  },
  labelActive: {
    color: "#FFF",
    fontFamily: theme.font.family.medium,
  },
  labelInactive: {
    color: "#000",
    fontFamily: theme.font.family.medium,
  },
}));
