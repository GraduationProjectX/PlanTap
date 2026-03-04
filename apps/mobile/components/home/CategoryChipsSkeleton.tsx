import { ScrollView } from "react-native";
import { SkeletonGroup } from "heroui-native";
import { StyleSheet } from "react-native-unistyles";

const CHIP_WIDTHS = [76, 108, 96, 88];

export function CategoryChipsSkeleton() {
  return (
    <SkeletonGroup isLoading isSkeletonOnly>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        pointerEvents="none"
      >
        {CHIP_WIDTHS.map((width, index) => (
          <SkeletonGroup.Item
            key={`category-chip-skeleton-${index}`}
            style={[styles.chip, { width }]}
            className="rounded-full"
          />
        ))}
      </ScrollView>
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    paddingVertical: 4,
  },
  chip: {
    height: 42,
  },
}));
