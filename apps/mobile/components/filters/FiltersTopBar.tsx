import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { ICON_COLORS, ICON_SIZES } from "@/lib/icon-tokens";
import { useDirection } from "@/rtl";

type FiltersTopBarProps = {
  onBack: () => void;
  onClearAll: () => void;
};

export function FiltersTopBar({ onBack, onClearAll }: FiltersTopBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isRTL, flexDirection } = useDirection();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={[styles.headerRow, { flexDirection }]}>
        <View
          style={[
            styles.headerActionSlot,
            isRTL ? styles.headerActionSlotAlignEnd : styles.headerActionSlotAlignStart,
          ]}
        >
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <FontAwesome
              name={isRTL ? "chevron-right" : "chevron-left"}
              size={ICON_SIZES.chevronNav}
              color={ICON_COLORS.chevronOnDark}
            />
          </Pressable>
        </View>

        <View style={styles.headerTitleSlot}>
          <Text style={styles.headerTitle}>{t("filters.title")}</Text>
        </View>

        <View
          style={[
            styles.headerActionSlot,
            isRTL ? styles.headerActionSlotAlignStart : styles.headerActionSlotAlignEnd,
          ]}
        >
          <Pressable onPress={onClearAll} hitSlop={12} style={styles.clearAllBtn}>
            <Text style={styles.clearAllLabel}>{t("filters.clearAll")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    backgroundColor: theme.colors.headerBackground,
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  headerActionSlot: {
    width: 96,
    justifyContent: "center",
  },
  headerActionSlotAlignStart: {
    alignItems: "flex-start",
  },
  headerActionSlotAlignEnd: {
    alignItems: "flex-end",
  },
  headerTitleSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: theme.font.family.bold,
    color: "#FFFFFF",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  clearAllBtn: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  clearAllLabel: {
    fontSize: 15,
    fontFamily: theme.font.family.medium,
    color: "rgba(255, 255, 255, 0.92)",
  },
}));
