import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { StyleSheet } from "react-native-unistyles";

type FilterButtonVariant = "search" | "topbar";

type FilterButtonProps = {
  onPress?: () => void;
  variant?: FilterButtonVariant;
  iconSize?: number;
  hitSlop?: number;
  isActive?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function FilterButton({
  onPress,
  variant = "topbar",
  iconSize = 16,
  hitSlop = 8,
  isActive = false,
  style,
}: FilterButtonProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      style={({ pressed }) => [
        styles.buttonBase,
        variant === "search" ? styles.buttonSearch : styles.buttonTopbar,
        pressed && styles.buttonPressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={t("home.filterEvents")}
    >
      <FontAwesome name="sliders" size={iconSize} color="#FFFFFF" />
      {isActive && <View style={styles.activeDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  buttonBase: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSearch: {
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  buttonTopbar: {
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  buttonPressed: {
    opacity: 0.75,
  },
  activeDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#22C55E",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.35)",
  },
}));
