import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Switch } from "heroui-native";
import { Image, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type NotificationsStepProps = {
  title: string;
  description: string;
  switchLabel: string;
  switchDescription: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
};

export function NotificationsStep({
  title,
  description,
  switchLabel,
  switchDescription,
  enabled,
  onToggle,
}: NotificationsStepProps) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.illustrationWrapper}>
        <Image
          source={require("@/assets/images/onboarding-notification.png")}
          style={styles.illustration}
          resizeMode="cover"
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.toggleSection}>
        <Pressable
          onPress={() => onToggle(!enabled)}
          style={[styles.toggleCard, enabled && styles.toggleCardActive]}
        >
          <View style={[styles.iconWrapper, enabled && styles.iconWrapperActive]}>
            <FontAwesome
              name="bell"
              size={20}
              color={enabled ? theme.colors.primaryForeground : theme.colors.text}
            />
          </View>

          <View style={styles.toggleContent}>
            <Text style={styles.toggleLabel}>{switchLabel}</Text>
            <Text style={styles.toggleDescription}>{switchDescription}</Text>
          </View>

          <Switch isSelected={enabled} onSelectedChange={onToggle} />
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.benefitsSection}>
        <View style={styles.benefitRow}>
          <View style={styles.benefitIcon}>
            <FontAwesome name="calendar" size={14} color={theme.colors.primary} />
          </View>
          <Text style={styles.benefitText}>Event reminders before they start</Text>
        </View>

        <View style={styles.benefitRow}>
          <View style={styles.benefitIcon}>
            <FontAwesome name="star" size={14} color={theme.colors.primary} />
          </View>
          <Text style={styles.benefitText}>New events matching your interests</Text>
        </View>

        <View style={styles.benefitRow}>
          <View style={styles.benefitIcon}>
            <FontAwesome name="map-marker" size={14} color={theme.colors.primary} />
          </View>
          <Text style={styles.benefitText}>Activities happening near you</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.lg,
  },
  illustrationWrapper: {
    alignItems: "center",
    // paddingVertical: theme.spacing.md,
  },
  illustration: {
    height: 250,
    width: "85%",
  },
  textBlock: {
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.size.xxxl,
    fontFamily: theme.font.family.bold,
    letterSpacing: theme.font.letterSpacing.tight,
    textAlign: "center",
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: theme.spacing.md,
  },
  toggleSection: {
    gap: theme.spacing.md,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  toggleCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  toggleLabel: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
  },
  toggleDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    lineHeight: 18,
  },
  benefitsSection: {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
  },
}));
