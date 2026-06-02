import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image } from "expo-image";
import { Button, Select } from "heroui-native";
import { Alert, Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { configureRTL } from "@/rtl";
import { useUIStore } from "@/stores/ui-store";

type IntroStepProps = {
  titleLine1: string;
  titleLine2: string;
  description: string;
  ctaLabel: string;
  onContinue: () => void;
};

export default function IntroStep({
  titleLine1,
  titleLine2,
  description,
  ctaLabel,
  onContinue,
}: IntroStepProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const setLanguageOverride = useUIStore((state) => state.setLanguageOverride);
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const languageValue = isArabic ? { value: "ar", label: "العربية" } : { value: "en", label: "EN" };

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

      <Select
        value={languageValue}
        onValueChange={async (language) => {
          const nextLanguage = language?.value === "ar" ? "ar" : "en";
          if (nextLanguage === languageValue.value) {
            return;
          }

          setLanguageOverride(nextLanguage);

          try {
            await i18n.changeLanguage(nextLanguage);
          } catch (error) {
            console.error("Failed to apply onboarding language", error);
          }

          if (configureRTL(nextLanguage)) {
            Alert.alert(t("settings.alerts.restartTitle"), t("settings.alerts.restartDescription"));
          }
        }}
        style={[styles.languageSelect, { top: insets.top + 10 }]}
      >
        <Select.Trigger style={styles.languageTrigger}>
          <FontAwesome name="globe" size={16} color="white" />
          <Text style={styles.languageValue}>{languageValue.label}</Text>
        </Select.Trigger>

        <Select.Portal>
          <Select.Overlay style={styles.languageOverlay} />
          <Select.Content
            presentation="popover"
            placement="bottom"
            align="end"
            offset={8}
            width={120}
          >
            <Select.Item value="en" label="EN" />
            <Select.Item value="ar" label="العربية" />
          </Select.Content>
        </Select.Portal>
      </Select>
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
  languageSelect: {
    position: "absolute",
    right: 14,
    alignItems: "flex-end",
    zIndex: theme.zIndex.popover,
    elevation: 12,
  },
  languageTrigger: {
    alignSelf: "flex-end",
    minHeight: 30,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  languageValue: {
    display: "flex",
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: theme.font.family.semiBold,
  },
  languageOverlay: {
    backgroundColor: "transparent",
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
