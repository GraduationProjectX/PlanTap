import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type StarRatingProps = {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
};

export function StarRating({
  rating,
  maxStars = 5,
  size = 14,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const { theme } = useUnistyles();

  const stars = Array.from({ length: maxStars }, (_, i) => {
    const starValue = i + 1;
    const filled = rating >= starValue;
    const halfFilled = !filled && rating >= starValue - 0.5;
    const name = filled ? "star" : halfFilled ? "star-half-o" : "star-o";
    const color = filled || halfFilled ? "#F59E0B" : theme.colors.border;

    if (interactive) {
      return (
        <Pressable key={starValue} onPress={() => onRatingChange?.(starValue)} hitSlop={4}>
          <FontAwesome name={name} size={size} color={color} />
        </Pressable>
      );
    }

    return <FontAwesome key={starValue} name={name} size={size} color={color} />;
  });

  return <View style={ratingStyles.container}>{stars}</View>;
}

const ratingStyles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
}));
