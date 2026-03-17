import AppleAuthButton from "@/components/auth/AppleAuthButton";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { Separator } from "heroui-native";
import { Image, ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function SignInScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.branding}>
          <View style={styles.logoContainer}>
            <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
          </View>
          <Text style={styles.title}>PlanTap</Text>
          <Text style={styles.subtitle}>Discover nearby events and activities.</Text>
        </Animated.View>

        <View style={styles.buttons}>
          {process.env.EXPO_OS === "ios" ? (
            <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
              <AppleAuthButton />
            </Animated.View>
          ) : null}
          <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
            <GoogleAuthButton />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.dividerRow}>
          <Separator style={styles.separator} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <Text style={styles.terms}>
            By continuing, you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {" "}and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  branding: {
    alignItems: "center",
    marginBottom: theme.spacing.xxxl,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 22,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  logo: {
    width: 88,
    height: 88,
  },
  title: {
    marginTop: theme.spacing.lg,
    color: theme.colors.text,
    fontSize: theme.font.size.xxxl,
    fontFamily: theme.font.family.bold,
    letterSpacing: theme.font.letterSpacing.tight,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.regular,
    textAlign: "center",
  },
  buttons: {
    width: "100%",
    gap: theme.spacing.sm,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.xl,
  },
  separator: {
    flex: 1,
    backgroundColor: theme.colors.divider,
    minHeight: 1,
  },
  terms: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    lineHeight: 20,
    textAlign: "center",
  },
  termsLink: {
    fontFamily: theme.font.family.medium,
    color: theme.colors.text
  },
}));
