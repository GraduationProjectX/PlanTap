import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Button } from "heroui-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { useDirection } from "@/rtl";

type FiltersApplyBarProps = {
  onApply: () => void;
};

export function FiltersApplyBar({ onApply }: FiltersApplyBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isRTL } = useDirection();

  return (
    <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
      <Button
        variant="primary"
        size="lg"
        feedbackVariant="scale"
        onPress={onApply}
        style={styles.applyBtn}
      >
        <Button.Label style={styles.applyLabel}>{t("filters.apply")}</Button.Label>
        <FontAwesome name={isRTL ? "arrow-left" : "arrow-right"} size={16} color="#FFF" />
      </Button>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "#FFFFFF",
  },
  applyBtn: {
    height: 56,
    borderRadius: 999,
    backgroundColor: "#000",
    flexDirection: "row",
    gap: 8,
  },
  applyLabel: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: theme.font.family.bold,
  },
}));
