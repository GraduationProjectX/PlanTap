import { Avatar } from "heroui-native";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { StarRating } from "@/components/events/star-rating";
import { useDirection } from "@/rtl";

export type ReviewItem = {
  id: string;
  authorName: string;
  authorImageUrl: string | null;
  rating: number;
  body: string;
  createdAt: string;
};

export function ReviewCard({ review }: { review: ReviewItem }) {
  const { flexDirection, textAlign } = useDirection();
  const initials = review.authorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={cardStyles.root}>
      <View style={[cardStyles.header, { flexDirection }]}>
        <View style={[cardStyles.authorRow, { flexDirection }]}>
          <Avatar size="md" animation="disable-all" alt={review.authorName}>
            {review.authorImageUrl ? (
              <Avatar.Image source={{ uri: review.authorImageUrl }} />
            ) : null}
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar>
          <View style={cardStyles.authorInfo}>
            <Text style={[cardStyles.authorName, { textAlign }]}>{review.authorName}</Text>
            <StarRating rating={review.rating} size={12} />
          </View>
        </View>
        <Text style={cardStyles.timestamp}>{review.createdAt}</Text>
      </View>
      {review.body.length > 0 ? (
        <Text style={[cardStyles.body, { textAlign }]}>{review.body}</Text>
      ) : null}
    </View>
  );
}

const cardStyles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  header: {
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  authorRow: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  authorInfo: {
    gap: 2,
  },
  authorName: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: theme.font.letterSpacing.wide,
  },
  body: {
    fontSize: theme.font.size.base,
    lineHeight: theme.font.size.base * theme.font.lineHeight.relaxed,
    fontFamily: theme.font.family.regular,
    color: theme.colors.text,
  },
}));
