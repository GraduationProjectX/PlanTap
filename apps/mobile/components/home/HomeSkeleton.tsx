import { View, useWindowDimensions } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SkeletonGroup } from "heroui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function HomeSkeleton() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.75;

  return (
    <SkeletonGroup isLoading>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTopLeft}>
            <SkeletonGroup.Item className="h-3 w-24 rounded-md" />
            <SkeletonGroup.Item className="h-5 w-32 rounded-md" />
          </View>
          <SkeletonGroup.Item className="h-10 w-10 rounded-full" />
        </View>
        <View style={styles.searchRow}>
          <SkeletonGroup.Item className="h-10 flex-1 rounded-xl" />
          <SkeletonGroup.Item className="h-10 w-10 rounded-xl" />
        </View>
        <View style={styles.chipsRow}>
          <SkeletonGroup.Item className="h-8 w-16 rounded-full" />
          <SkeletonGroup.Item className="h-8 w-24 rounded-full" />
          <SkeletonGroup.Item className="h-8 w-20 rounded-full" />
          <SkeletonGroup.Item className="h-8 w-20 rounded-full" />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <SkeletonGroup.Item className="h-5 w-36 rounded-md" />
          <SkeletonGroup.Item className="h-4 w-16 rounded-md" />
        </View>
        <View style={styles.carouselRow}>
          <SkeletonGroup.Item
            className="rounded-2xl"
            style={{ width: cardWidth, height: 220 }}
          />
          <SkeletonGroup.Item
            className="rounded-2xl"
            style={{ width: cardWidth * 0.4, height: 220 }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <SkeletonGroup.Item className="h-5 w-28 rounded-md" />
        </View>
        {[1, 2].map((i) => (
          <View key={i} style={styles.upcomingRow}>
            <SkeletonGroup.Item className="h-24 w-24 rounded-xl" />
            <View style={styles.upcomingInfo}>
              <SkeletonGroup.Item className="h-3 w-20 rounded-md" />
              <SkeletonGroup.Item className="h-4 w-40 rounded-md" />
              <SkeletonGroup.Item className="h-3 w-28 rounded-md" />
              <SkeletonGroup.Item className="h-8 w-full rounded-lg" />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <SkeletonGroup.Item className="h-5 w-44 rounded-md" />
        </View>
        <View style={styles.recommendedGrid}>
          {[1, 2].map((i) => (
            <View key={i} style={styles.recommendedCard}>
              <SkeletonGroup.Item className="rounded-xl" style={{ aspectRatio: 1, width: "100%" }} />
              <View style={styles.recommendedInfo}>
                <SkeletonGroup.Item className="h-4 w-full rounded-md" />
                <SkeletonGroup.Item className="h-3 w-3/4 rounded-md" />
                <SkeletonGroup.Item className="h-3 w-16 rounded-md" />
              </View>
            </View>
          ))}
        </View>
      </View>
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    backgroundColor: theme.colors.headerBackground,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    borderCurve: "continuous",
    paddingHorizontal: theme.spacing.md,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTopLeft: {
    gap: 6,
  },
  searchRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  chipsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: 4,
  },
  section: {
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
  carouselRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: theme.spacing.md,
    overflow: "hidden",
  },
  upcomingRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    padding: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
  },
  upcomingInfo: {
    flex: 1,
    gap: 6,
  },
  recommendedGrid: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  recommendedCard: {
    flex: 1,
    gap: 6,
  },
  recommendedInfo: {
    gap: 4,
  },
}));
