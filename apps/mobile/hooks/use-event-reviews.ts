import { useMutation, useQuery } from "convex/react";
import { api } from "backend/convex/_generated/api";
import { useTranslation } from "react-i18next";

import type { EventId } from "@/hooks/use-event";

export type EventReviewItem = {
  id: string;
  authorName: string;
  authorImageUrl: string | null;
  rating: number;
  body: string;
  createdAt: string;
};

function formatReviewDate(timestamp: number, language: string) {
  const locale = language === "ar" ? "ar-SA" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

type RawEventReview = {
  id: string;
  authorName: string;
  authorImageUrl: string | null;
  rating: number;
  body: string;
  createdAt: number;
};

function toReviewRating(rating: number) {
  if (rating === 1 || rating === 2 || rating === 3 || rating === 4 || rating === 5) {
    return rating;
  }

  return null;
}

export function useEventReviews(eventId?: EventId) {
  const { i18n } = useTranslation();
  const data = useQuery(api.reviews.getForEvent, eventId ? { eventId } : "skip");
  const upsertReviewMutation = useMutation(api.reviews.upsertForEvent);
  const isLoading = eventId !== undefined && data === undefined;

  const averageRating = data?.averageRating ?? 0;
  const reviewCount = data?.reviewCount ?? 0;
  const viewerReview = data?.viewerReview ?? null;
  const reviews: EventReviewItem[] =
    data?.reviews.map((review: RawEventReview) => ({
      id: review.id,
      authorName: review.authorName,
      authorImageUrl: review.authorImageUrl,
      rating: review.rating,
      body: review.body,
      createdAt: formatReviewDate(review.createdAt, i18n.language),
    })) ?? [];

  const submitReview = async (rating: number, body: string) => {
    if (!eventId) {
      return;
    }

    const nextRating = toReviewRating(rating);
    if (!nextRating) {
      return;
    }

    await upsertReviewMutation({
      eventId,
      rating: nextRating,
      body: body.trim(),
    });
  };

  return {
    averageRating,
    reviewCount,
    reviews,
    viewerReview,
    submitReview,
    isLoading,
  };
}
