import { SkeletonGroup } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

type EventListSkeletonProps = {
  topInset?: number;
  withFilterSummary?: boolean;
};

const ROW_COUNT = 3;

export function EventListSkeleton({
  topInset = 96,
  withFilterSummary = false,
}: EventListSkeletonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <SkeletonGroup isLoading isSkeletonOnly>
        <View style={{ paddingTop: topInset + insets.top }}>
          {withFilterSummary && (
          <View style={styles.summaryContainer}>
            <SkeletonGroup.Item style={styles.summaryCount} className="rounded-md" />
            <View style={styles.summaryTagsRow}>
              <SkeletonGroup.Item style={styles.summaryTagWide} className="rounded-full" />
              <SkeletonGroup.Item style={styles.summaryTag} className="rounded-full" />
              <SkeletonGroup.Item style={styles.summaryTag} className="rounded-full" />
            </View>
          </View>
          )}

          <View style={styles.gridContent}>
            {Array.from({ length: ROW_COUNT }).map((_, rowIndex) => (
              <View key={`event-row-${rowIndex}`} style={styles.gridRow}>
                <SkeletonGroup.Item style={styles.card} className="rounded-xl" />
                <SkeletonGroup.Item style={styles.card} className="rounded-xl" />
              </View>
            ))}
          </View>
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
  summaryContainer: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  summaryCount: {
    width: 120,
    height: 14,
  },
  summaryTagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  summaryTagWide: {
    width: 92,
    height: 28,
  },
  summaryTag: {
    width: 72,
    height: 28,
  },
  gridContent: {
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    height: 254,
  },
}));
