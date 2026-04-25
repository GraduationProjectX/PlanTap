import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const safeTotal = totalSteps > 0 ? totalSteps : 1;
  const clampedStep = Math.min(Math.max(currentStep, 0), safeTotal - 1);
  const progress = (clampedStep + 1) / safeTotal;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          layout={LinearTransition.duration(260)}
          style={[styles.fill, { width: `${progress * 100}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.sm,
  },
  track: {
    height: 6,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: theme.colors.border,
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    backgroundColor: theme.colors.primary,
  },
}));
