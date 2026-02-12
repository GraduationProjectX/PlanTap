import Ionicons from "@expo/vector-icons/Ionicons";
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

const AppleAuthButton = () => {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_apple" });
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading) {
      return;
    }

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
    <Pressable disabled={isLoading} onPress={handlePress} style={styles.appleButton}>
      <Ionicons name="logo-apple" size={18} color="#fff" />
      <Text style={styles.appleButtonText}>{isLoading ? "Signing in..." : "Sign in with Apple"}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  appleButton: {
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 12,
    gap: 4,
  },
  appleButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AppleAuthButton;
