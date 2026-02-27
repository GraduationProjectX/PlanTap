import Ionicons from "@expo/vector-icons/Ionicons";
import { useOAuth } from "@clerk/clerk-expo";
import { Button, Spinner } from "heroui-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { FadeIn, LinearTransition } from "react-native-reanimated";

export default function AppleAuthButton() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_apple" });
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        router.replace("/");
      }
    } catch (error) {
      console.error("Apple sign-in failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      variant="outline"
      feedbackVariant="scale"
      isDisabled={isLoading}
      onPress={handlePress}
      layout={LinearTransition.springify()}
      style={styles.button}
    >
      {isLoading ? (
        <Spinner entering={FadeIn.delay(50)} color={theme.colors.text} size="sm" />
      ) : (
        <Ionicons name="logo-apple" size={20} color={theme.colors.text} />
      )}
      <Button.Label style={styles.label}>
        {isLoading ? "Signing in..." : "Sign in with Apple"}
      </Button.Label>
    </Button>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    minHeight: theme.button.xl,
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.semiBold,
  },
}));
