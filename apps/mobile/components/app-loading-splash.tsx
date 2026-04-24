import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Animated, Image, View } from "react-native";

/** Matches `expo.splash.backgroundColor` in app.json */
const SPLASH_BACKGROUND = "#0A0A0A";

const TRACK_WIDTH = 200;
const BAR_WIDTH = 72;

export function AppLoadingSplash() {
  const nativeHandoffDoneRef = useRef(false);
  const barLoopStartedRef = useRef(false);
  const barLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const barPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      barLoopRef.current?.stop();
    };
  }, []);

  const handleRootLayout = () => {
    if (!nativeHandoffDoneRef.current) {
      nativeHandoffDoneRef.current = true;
      void SplashScreen.hideAsync();
    }

    if (!barLoopStartedRef.current) {
      barLoopStartedRef.current = true;
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(barPosition, {
            toValue: 1,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(barPosition, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
      barLoopRef.current = loop;
      loop.start();
    }
  };

  const barTranslateX = barPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [-BAR_WIDTH, TRACK_WIDTH],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: SPLASH_BACKGROUND,
        alignItems: "center",
        justifyContent: "center",
      }}
      onLayout={handleRootLayout}
    >
      <Image
        accessibilityIgnoresInvertColors
        source={require("../assets/images/planTap-icon.png")}
        style={{ width: 128, height: 128 }}
        resizeMode="contain"
      />
      <View
        style={{
          marginTop: 28,
          width: TRACK_WIDTH,
          height: 4,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={{
            width: BAR_WIDTH,
            height: "100%",
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            transform: [{ translateX: barTranslateX }],
          }}
        />
      </View>
    </View>
  );
}
