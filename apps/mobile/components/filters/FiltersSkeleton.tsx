import { SkeletonGroup } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

const SECTION_COUNT = 4;

type FiltersSkeletonProps = {
  topInset?: number;
};

export function FiltersSkeleton({ topInset = 92 }: FiltersSkeletonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <SkeletonGroup isLoading isSkeletonOnly>
        <View style={[styles.content, { paddingTop: topInset + insets.top }]}>
          {Array.from({ length: SECTION_COUNT }).map((_, sectionIndex) => (
            <View key={`filters-skeleton-section-${sectionIndex}`} style={styles.section}>
              <View style={styles.sectionHead}>
                <SkeletonGroup.Item style={styles.step} className="rounded-full" />
                <View style={styles.sectionHeadText}>
                  <SkeletonGroup.Item style={styles.sectionTitle} className="rounded-md" />
                  <SkeletonGroup.Item style={styles.sectionCaption} className="rounded-md" />
                </View>
              </View>

              <View style={styles.sectionBody}>
                {sectionIndex === 2 ? (
                  <SkeletonGroup.Item style={styles.selectField} className="rounded-xl" />
                ) : (
                  <View style={styles.chipsRow}>
                    <SkeletonGroup.Item style={styles.chipWide} className="rounded-full" />
                    <SkeletonGroup.Item style={styles.chip} className="rounded-full" />
                    <SkeletonGroup.Item style={styles.chip} className="rounded-full" />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </SkeletonGroup>
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 24,
    gap: 32,
    paddingBottom: 120,
  },
  section: {
    gap: 16,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  step: {
    width: 32,
    height: 32,
  },
  sectionHeadText: {
    flex: 1,
    gap: 6,
  },
  sectionTitle: {
    width: "55%",
    height: 16,
  },
  sectionCaption: {
    width: "42%",
    height: 12,
  },
  sectionBody: {
    marginStart: 44,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chipWide: {
    width: 112,
    height: 44,
  },
  chip: {
    width: 90,
    height: 44,
  },
  selectField: {
    width: "100%",
    height: 52,
  },
}));
