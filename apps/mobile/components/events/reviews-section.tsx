import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Button, Separator } from "heroui-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { ReviewCard } from "@/components/events/review-card";
import type { ReviewItem } from "@/components/events/review-card";
import { StarRating } from "@/components/events/star-rating";
import { useDirection } from "@/rtl";

const INITIAL_VISIBLE = 3;
const PAGE_SIZE = 3;

type ReviewsSectionProps = {
  averageRating: number;
  reviewCount: number;
  reviews: ReviewItem[];
  isLoading: boolean;
  onWriteReview: () => void;
};

export function ReviewsSection({
  averageRating,
  reviewCount,
  reviews,
  isLoading,
  onWriteReview,
}: ReviewsSectionProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { flexDirection, textAlign } = useDirection();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, reviews.length));
  };

  return (
    <View style={sectionStyles.root}>
      <Separator />

      <Text style={[sectionStyles.sectionLabel, { textAlign }]}>
        {t("eventDetail.reviews")}
      </Text>

      <View style={[sectionStyles.summaryRow, { flexDirection }]}>
        {reviewCount > 0 ? (
          <View style={[sectionStyles.ratingGroup, { flexDirection }]}>
            <Text style={sectionStyles.ratingNumber}>{averageRating.toFixed(1)}</Text>
            <View style={sectionStyles.ratingMeta}>
              <StarRating rating={averageRating} size={16} />
              <Text style={sectionStyles.reviewCount}>
                {t("eventDetail.reviewsCount", { count: reviewCount })}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[sectionStyles.emptySummaryLabel, { textAlign }]}>
            {t("eventDetail.noReviewsTitle")}
          </Text>
        )}
        <Button
          feedbackVariant="scale"
          onPress={onWriteReview}
          style={sectionStyles.writeButton}
        >
          <FontAwesome
            name="pencil"
            size={14}
            color={theme.colors.primaryForeground}
          />
          <Button.Label style={sectionStyles.writeButtonLabel}>
            {t("eventDetail.writeReview")}
          </Button.Label>
        </Button>
      </View>

      {reviewCount > 0 ? (
        <View style={sectionStyles.reviewsList}>
          {visibleReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </View>
      ) : null}

      {!isLoading && reviewCount === 0 ? (
        <Text style={[sectionStyles.emptyText, { textAlign }]}>{t("eventDetail.noReviews")}</Text>
      ) : null}

      {hasMore ? (
        <Button
          variant="outline"
          feedbackVariant="scale"
          onPress={handleLoadMore}
          style={sectionStyles.loadMoreButton}
        >
          <Button.Label style={sectionStyles.loadMoreLabel}>
            {t("eventDetail.loadMoreReviews")}
          </Button.Label>
        </Button>
      ) : null}
    </View>
  );
}

const sectionStyles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.bold,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: theme.font.letterSpacing.widest,
  },
  summaryRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingGroup: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  ratingNumber: {
    fontSize: theme.font.size.xxxl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
    fontVariant: ["tabular-nums"],
  },
  ratingMeta: {
    gap: 2,
  },
  reviewCount: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: theme.font.letterSpacing.wide,
  },
  emptySummaryLabel: {
    flex: 1,
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  writeButton: {
    minHeight: 40,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderCurve: "continuous",
    backgroundColor: theme.colors.primary,
    gap: theme.spacing.sm,
  },
  writeButtonLabel: {
    color: theme.colors.primaryForeground,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.bold,
  },
  reviewsList: {
    gap: 0,
  },
  emptyText: {
    fontSize: theme.font.size.base,
    lineHeight: theme.font.size.base * theme.font.lineHeight.relaxed,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textMuted,
  },
  loadMoreButton: {
    minHeight: 52,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderColor: theme.colors.border,
  },
  loadMoreLabel: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
    textTransform: "uppercase",
    letterSpacing: theme.font.letterSpacing.wider,
  },
}));
