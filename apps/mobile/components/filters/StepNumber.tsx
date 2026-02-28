import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type StepNumberProps = {
  value: number;
};

export function StepNumber({ value }: StepNumberProps) {
  return (
    <View style={styles.circle}>
      <Text style={styles.text}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontFamily: theme.font.family.bold,
    color: "#FFF",
  },
}));
