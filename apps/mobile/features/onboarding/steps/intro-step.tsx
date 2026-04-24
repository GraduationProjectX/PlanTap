import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image } from "expo-image";
import { Button } from "heroui-native";
import { Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
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

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeIn.duration(500)}
        style={[styles.heroWrapper, { flex: 1, minHeight: height * 0.42 }]}
      >
        <Image
          source={require("@/assets/images/onboarding-intro.png")}
          style={styles.heroImage}
          contentFit="fill"
        />
      </Animated.View>

      <View style={[styles.contentCard, { paddingBottom: insets.bottom + 16 }]}>
        <Animated.View entering={FadeIn.duration(400).delay(150)} style={styles.textBlock}>
          <View style={styles.titleGroup}>
            <Text style={styles.titleLine}>{titleLine1}</Text>
            <Text style={styles.titleLine}>{titleLine2}</Text>
          </View>
          <Text style={styles.description}>{description}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(400).delay(300)}>
          <Button feedbackVariant="scale" onPress={onContinue} style={styles.ctaButton}>
            <Button.Label style={styles.ctaLabel}>{ctaLabel}</Button.Label>
            <FontAwesome name="arrow-right" size={18} color="white" />
          </Button>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  heroWrapper: {
    width: "100%",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  contentCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    borderCurve: "continuous",
    marginTop: -theme.radius.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
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
