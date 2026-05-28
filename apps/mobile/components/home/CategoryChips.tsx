import { Text, View } from "react-native";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native-unistyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { getCategoryIconName } from "@/features/categories/meta";

type Category = {
  id: string;
  label: string;
  icon?: string;
};

type CategoryChipsProps = {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
};

export function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
    >
      {categories.map((cat) => {
        const isActive = cat.id === selected;
        const iconName = getCategoryIconName(cat.id, cat.icon);
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            hitSlop={6}
            style={({ pressed }) => [
              styles.chip,
              isActive ? styles.chipActive : styles.chipInactive,
              pressed && styles.chipPressed,
            ]}
          >
            <View style={styles.chipContent}>
              <FontAwesome name={iconName} size={14} color={isActive ? "#000000" : "#FFFFFF"} />
              <Text style={[styles.chipText, isActive ? styles.textActive : styles.textInactive]}>
                {cat.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
  },
  chipActive: {
    backgroundColor: "#FFFFFF",
  },
  chipInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  chipPressed: {
    opacity: 0.78,
  },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipText: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
  },
  textActive: {
    color: "#000000",
  },
  textInactive: {
    color: "#FFFFFF",
  },
}));
