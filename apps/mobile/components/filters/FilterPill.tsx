import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Chip } from "heroui-native";
import { Text } from "react-native";
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
    <Chip
      size="md"
      animation="disable-all"
      onPress={onPress}
      style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
    >
      {iconName && <FontAwesome name={iconName} size={iconSize} color={active ? "#FFF" : "#000"} />}
      <Text style={active ? styles.labelActive : styles.labelInactive}>{label}</Text>
    </Chip>
  );
}

const styles = StyleSheet.create((theme) => ({
  pill: {
    borderRadius: 999,
    borderCurve: "continuous",
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
  labelActive: {
    color: "#FFF",
    fontFamily: theme.font.family.medium,
  },
  labelInactive: {
    color: "#000",
    fontFamily: theme.font.family.medium,
  },
}));
