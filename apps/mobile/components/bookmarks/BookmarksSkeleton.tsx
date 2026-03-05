import { SkeletonGroup } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

const GRID_ROWS = 2;

type BookmarksSkeletonProps = {
  topInset?: number;
  includeSafeAreaInset?: boolean;
};

export function BookmarksSkeleton({
  topInset = 96,
  includeSafeAreaInset = true,
}: BookmarksSkeletonProps) {
  const insets = useSafeAreaInsets();
  const topPadding = topInset + (includeSafeAreaInset ? insets.top : 0);

  return (
    <View style={styles.root}>
      <SkeletonGroup isLoading isSkeletonOnly>
        <View style={[styles.content, { paddingTop: topPadding }]}>
          <View style={styles.sectionHeader}>
            <SkeletonGroup.Item style={styles.sectionTitle} className="rounded-md" />
          </View>
          <SkeletonGroup.Item style={styles.heroCard} className="rounded-xl" />

          <View style={styles.sectionHeaderSpaced}>
            <SkeletonGroup.Item style={styles.sectionTitle} className="rounded-md" />
            <SkeletonGroup.Item style={styles.sectionRange} className="rounded-md" />
          </View>

          {Array.from({ length: GRID_ROWS }).map((_, rowIndex) => (
            <View key={`bookmark-grid-row-${rowIndex}`} style={styles.gridRow}>
              <SkeletonGroup.Item style={styles.gridCard} className="rounded-xl" />
              <SkeletonGroup.Item style={styles.gridCard} className="rounded-xl" />
            </View>
          ))}
        </View>
      </SkeletonGroup>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    paddingBottom: 4,
  },
  sectionHeaderSpaced: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.lg,
    paddingBottom: 4,
  },
  sectionTitle: {
    width: 170,
    height: 24,
  },
  sectionRange: {
    width: 100,
    height: 14,
  },
  heroCard: {
    width: "100%",
    height: 220,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  gridCard: {
    flex: 1,
    aspectRatio: 0.9,
  },
}));
