import { useSSO } from "@clerk/clerk-expo";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { Button, Spinner } from "heroui-native";
import { useState } from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { FadeIn, LinearTransition } from "react-native-reanimated";

export default function GoogleAuthButton() {
  const { theme } = useUnistyles();
  const { startSSOFlow } = useSSO();
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: "oauth_google" });

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
      }
    } catch (error) {
      console.error("Google sign-in failed", error);
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
        <GoogleIcon/>
      )}
      <Button.Label style={styles.label}>
        {isLoading ? "Signing in..." : "Continue with Google"}
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
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
  },
}));
