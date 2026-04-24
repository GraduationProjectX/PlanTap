import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Button } from "heroui-native";
import { Image, Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

type IntroStepProps = {
  titleLine1: string;
  titleLine2: string;
  description: string;
  ctaLabel: string;
  onContinue: () => void;
};

export function IntroStep({
  titleLine1,
  titleLine2,
  description,
  ctaLabel,
  onContinue,
}: IntroStepProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const heroHeight = height * 0.58;

  return (
    <View style={styles.container}>
      <View style={styles.middleSection}>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[styles.heroWrapper, { height: heroHeight }]}
        >
          <Image
            source={require("@/assets/images/onboarding-intro.png")}
            style={styles.heroImage}
            resizeMode="stretch"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400)} style={styles.contentCard}>
          <View style={styles.textBlock}>
            <View style={styles.titleGroup}>
              <Text style={styles.titleLine}>{titleLine1}</Text>
              <Text style={styles.titleLine}>{titleLine2}</Text>
            </View>
            <Text style={styles.description}>{description}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 16 }]}>
        <Button feedbackVariant="scale" onPress={onContinue} style={styles.ctaButton}>
          <Button.Label style={styles.ctaLabel}>{ctaLabel}</Button.Label>
          <FontAwesome name="arrow-right" size={18} color="white" />
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  middleSection: {
    flex: 1,
  },
  heroWrapper: {
    width: "100%",
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  contentCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    borderCurve: "continuous",
    marginTop: -theme.radius.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
    ...theme.shadow.lg,
  },
  textBlock: {
    gap: theme.spacing.md,
  },
  titleGroup: {
    gap: theme.spacing.xs,
  },
  titleLine: {
    color: theme.colors.text,
    fontSize: theme.font.size.xxxl,
    fontFamily: theme.font.family.bold,
    letterSpacing: theme.font.letterSpacing.tight,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.regular,
    lineHeight: 24,
  },
  bottomCta: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  ctaButton: {
    minHeight: theme.button.xl,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.colors.overlayDark,
  },
  ctaLabel: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.semiBold,
  },
}));
