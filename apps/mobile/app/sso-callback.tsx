import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const FALLBACK_REDIRECT_DELAY_MS = 8000;

export default function SSOCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const [shouldFallbackToSignIn, setShouldFallbackToSignIn] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShouldFallbackToSignIn(true);
    }, FALLBACK_REDIRECT_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  if (!isLoaded || (!isSignedIn && !shouldFallbackToSignIn)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={isSignedIn ? "/" : "/sign-in"} />;
}
