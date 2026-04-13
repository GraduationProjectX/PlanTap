import FontAwesome from "@expo/vector-icons/FontAwesome";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useMutation, useQuery } from "convex/react";
import { api } from "backend/convex/_generated/api";
import type { Id } from "backend/convex/_generated/dataModel";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, Separator, SkeletonGroup } from "heroui-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, Share, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Transition from "react-native-screen-transitions";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { ReviewComposerSheet } from "@/components/events/review-composer-sheet";
import { ReviewsSection } from "@/components/events/reviews-section";
import { LiveBadge } from "@/components/home/LiveBadge";
import { isEventLiveNow } from "@/features/events/data";
import { getEventSharedBoundTag } from "@/features/events/ui";
import { useEvent } from "@/hooks/use-event";
import { useEventReviews } from "@/hooks/use-event-reviews";
import { useDirection } from "@/rtl";

function isSameDay(timestamp: number, now: number) {
  const date = new Date(timestamp);
  const current = new Date(now);

  return (
    date.getFullYear() === current.getFullYear() &&
    date.getMonth() === current.getMonth() &&
    date.getDate() === current.getDate()
  );
}

function formatDateLabel(timestamp: number, locale: string, tonightLabel: string) {
  if (isSameDay(timestamp, Date.now())) {
    return tonightLabel;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

function formatTimeLabel(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export default function EventDetailsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { theme } = useUnistyles();
  const { flexDirection, textAlign, isRTL } = useDirection();
  const [isBookmarkPending, setIsBookmarkPending] = useState(false);
  const [isReviewPending, setIsReviewPending] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewBody, setReviewBody] = useState("");
  const { id } = useLocalSearchParams<{ id?: Id<"events"> | Id<"events">[] }>();
  const normalizedId = Array.isArray(id) ? id[0] : id;
  const { event, isLoading, notFound } = useEvent(normalizedId);
  const {
    averageRating,
    reviewCount,
    reviews,
    viewerReview,
    submitReview,
    isLoading: areReviewsLoading,
  } = useEventReviews(normalizedId);
  const isBookmarked = useQuery(
    api.bookmarks.isBookmarked,
    normalizedId ? { eventId: normalizedId } : "skip",
  );
  const toggleBookmarkMutation = useMutation(api.bookmarks.toggle);
  const sharedBoundTag = normalizedId ? getEventSharedBoundTag(normalizedId) : undefined;
  const heroHeight = Math.min(Math.max(width * 1.18, 420), 560);

  const handleBackPress = () => {
    router.back();
  };

  const handleBookmarkPress = async () => {
    if (!normalizedId || isBookmarkPending) {
      return;
    }

    setIsBookmarkPending(true);

    try {
      await toggleBookmarkMutation({ eventId: normalizedId });
    } finally {
      setIsBookmarkPending(false);
    }
  };

  const handleShare = async () => {
    const shareTitle = event
      ? i18n.language === "ar" && event.titleAr.length > 0
        ? event.titleAr
        : event.title
      : "PlanTap";

    try {
      await Share.share({ message: `${shareTitle}\nPlanTap` });
    } catch {
    }
  };

  const handleOpenMaps = (lat: number, lng: number, label: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(label)}`;
    Linking.openURL(url);
  };

  const handleWriteReview = () => {
    setReviewRating(viewerReview?.rating ?? 0);
    setReviewBody(viewerReview?.body ?? "");
    setIsComposerOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (isReviewPending) {
      return;
    }

    setIsReviewPending(true);

    try {
      await submitReview(reviewRating, reviewBody);
      setIsComposerOpen(false);
      setReviewRating(0);
      setReviewBody("");
    } finally {
      setIsReviewPending(false);
    }
  };

  if (isLoading) {
    return (
      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <SkeletonGroup isLoading isSkeletonOnly>
          <View style={[styles.heroSection, { height: heroHeight }]}>
            <SkeletonGroup.Item style={styles.skeletonHero} className="rounded-none" />
          </View>

          <Card animation="disable-all" style={styles.sheetCard}>
            <Card.Body style={styles.sheetBody}>
              <View style={styles.sheetHeader}>
                <SkeletonGroup.Item style={styles.skeletonTitleLineLg} className="rounded-md" />
                <SkeletonGroup.Item style={styles.skeletonTitleLineSm} className="rounded-md" />
              </View>
              <View style={styles.skeletonMetaRow}>
                <SkeletonGroup.Item style={styles.skeletonMetaPill} className="rounded-full" />
                <SkeletonGroup.Item style={styles.skeletonMetaPill} className="rounded-full" />
                <SkeletonGroup.Item style={styles.skeletonMetaPillWide} className="rounded-full" />
              </View>
              <View style={[styles.actionsRow, { flexDirection }]}>
                <SkeletonGroup.Item style={styles.skeletonPrimaryAction} className="rounded-2xl" />
                <SkeletonGroup.Item style={styles.skeletonIconAction} className="rounded-2xl" />
              </View>
              <View style={styles.aboutSection}>
                <SkeletonGroup.Item style={styles.skeletonSectionLabel} className="rounded-md" />
                <SkeletonGroup.Item style={styles.skeletonBodyLine} className="rounded-md" />
                <SkeletonGroup.Item style={styles.skeletonBodyLine} className="rounded-md" />
                <SkeletonGroup.Item style={styles.skeletonBodyLineShort} className="rounded-md" />
              </View>
              <View style={styles.locationSection}>
                <SkeletonGroup.Item style={styles.skeletonSectionLabel} className="rounded-md" />
                <SkeletonGroup.Item style={styles.skeletonBodyLine} className="rounded-md" />
                <SkeletonGroup.Item style={styles.skeletonMapButton} className="rounded-2xl" />
              </View>
              <View style={styles.skeletonReviewsSection}>
                <SkeletonGroup.Item style={styles.skeletonSectionLabel} className="rounded-md" />
                <View style={styles.skeletonReviewsSummary}>
                  <SkeletonGroup.Item style={styles.skeletonRatingBig} className="rounded-md" />
                  <SkeletonGroup.Item style={styles.skeletonMetaPill} className="rounded-full" />
                </View>
                <SkeletonGroup.Item style={styles.skeletonReviewCard} className="rounded-xl" />
                <SkeletonGroup.Item style={styles.skeletonReviewCard} className="rounded-xl" />
              </View>
            </Card.Body>
          </Card>
        </SkeletonGroup>
      </ScrollView>
    );
  }

  if (notFound || !event) {
    return (
      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.notFoundContent}
        showsVerticalScrollIndicator={false}
      >
        <Card animation="disable-all" style={styles.notFoundCard}>
          <Card.Body style={styles.notFoundBody}>
            <Text style={styles.notFoundTitle}>{t("eventDetail.notFoundTitle")}</Text>
            <Text style={styles.notFoundDescription}>
              {t("eventDetail.notFoundDescription")}
            </Text>
            <Button feedbackVariant="scale" onPress={handleBackPress} style={styles.notFoundButton}>
              <Button.Label style={styles.notFoundButtonLabel}>{t("common.back")}</Button.Label>
            </Button>
          </Card.Body>
        </Card>
      </ScrollView>
    );
  }

  const locale = i18n.language === "ar" ? "ar-SA" : "en-US";
  const imageUri = event.images[0];
  const title = i18n.language === "ar" && event.titleAr.length > 0 ? event.titleAr : event.title;
  const description =
    i18n.language === "ar"
      ? (event.descriptionShortAr ?? event.descriptionShort)
      : (event.descriptionShort ?? event.descriptionShortAr);
  const locationLabel =
    i18n.language === "ar"
      ? (event.locationAddressAr ?? event.locationAddress ?? event.city)
      : (event.locationAddress ?? event.locationAddressAr ?? event.city);
  const dateLabel =
    event.startAt != null ? formatDateLabel(event.startAt, locale, t("home.tonight")) : null;
  const timeLabel = event.startAt != null ? formatTimeLabel(event.startAt, locale) : null;
  const isLive = event.type === "event" && isEventLiveNow(event);
  const bookmarkLabel = isBookmarked
    ? t("eventDetail.savedToBookmarks")
    : t("eventDetail.addToBookmarks");

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.screen}
        contentInsetAdjustmentBehavior="automatic"
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, { height: heroHeight }]}>
          <Transition.View
            collapsable={false}
            sharedBoundTag={sharedBoundTag}
            style={styles.heroMedia}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.heroImage}
                contentFit="cover"
                transition={180}
                priority="high"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={styles.heroFallback} />
            )}
          </Transition.View>

          <View style={styles.heroScrim} pointerEvents="none" />

          {isLive ? (
            <View style={[styles.heroBadgePositioned, { top: insets.top + theme.spacing.sm }]}>
              <LiveBadge label={t("home.liveNow")} />
            </View>
          ) : null}
        </View>

        <Card animation="disable-all" style={styles.sheetCard}>
          <Card.Body
            style={[styles.sheetBody, { paddingBottom: insets.bottom + theme.spacing.xxl }]}
          >
          <View style={[styles.sheetHeader, { flexDirection }]}>
            <Text style={[styles.title, { textAlign, flex: 1 }]}>{title}</Text>
          </View>

          {dateLabel || timeLabel || locationLabel ? (
            <View style={[styles.metaRow, { flexDirection }]}>
              {dateLabel ? (
                <View style={[styles.metaItem, { flexDirection }]}>
                  <FontAwesome
                    name="calendar-o"
                    size={14}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={[styles.metaText, { textAlign }]}>{dateLabel}</Text>
                </View>
              ) : null}

              {dateLabel && timeLabel ? (
                <Text style={styles.metaDot}>|</Text>
              ) : null}

              {timeLabel ? (
                <View style={[styles.metaItem, { flexDirection }]}>
                  <FontAwesome name="clock-o" size={14} color={theme.colors.textSecondary} />
                  <Text style={[styles.metaText, { textAlign }]}>{timeLabel}</Text>
                </View>
              ) : null}

              {(dateLabel || timeLabel) && locationLabel ? (
                <Text style={styles.metaDot}>|</Text>
              ) : null}

              {locationLabel ? (
                <View style={[styles.metaItem, styles.metaItemLocation, { flexDirection }]}>
                  <FontAwesome
                    name="map-marker"
                    size={14}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={[styles.metaText, { textAlign }]} numberOfLines={1}>
                    {locationLabel}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={[styles.actionsRow, { flexDirection }]}>
            <Button
              feedbackVariant="scale"
              onPress={handleBookmarkPress}
              isDisabled={isBookmarkPending}
              style={styles.primaryAction}
            >
              <FontAwesome
                name={isBookmarked ? "bookmark-o" : "bookmark"}
                size={16}
                color={theme.colors.primaryForeground}
              />
              <Button.Label style={styles.primaryActionLabel}>{bookmarkLabel}</Button.Label>
            </Button>

            <Button
              isIconOnly
              feedbackVariant="scale"
              onPress={handleShare}
              style={styles.secondaryAction}
              accessibilityLabel={t("eventDetail.share")}
            >
              <FontAwesome
                name="share"
                size={18}
                color={theme.colors.text}
              />
            </Button>
          </View>

          {description ? (
            <View style={styles.aboutSection}>
              <Text style={[styles.sectionLabel, { textAlign }]}>{t("eventDetail.about")}</Text>
              <Text style={[styles.description, { textAlign }]}>{description}</Text>
            </View>
          ) : null}

          {locationLabel ? (
            <View style={styles.locationSection}>
              <Separator />
              <Text style={[styles.sectionLabel, { textAlign }]}>
                {t("eventDetail.location")}
              </Text>
              <Text style={[styles.locationAddress, { textAlign }]} selectable>
                {locationLabel}
              </Text>
              {event.locationLat != null && event.locationLng != null ? (
                <Button
                  variant="outline"
                  feedbackVariant="scale"
                  onPress={() =>
                    handleOpenMaps(
                      event.locationLat,
                      event.locationLng,
                      locationLabel,
                    )
                  }
                  style={styles.mapButton}
                >
                  <FontAwesome
                    name="map-o"
                    size={16}
                    color={theme.colors.text}
                  />
                  <Button.Label style={styles.mapButtonLabel}>
                    {t("eventDetail.openInMaps")}
                  </Button.Label>
                </Button>
              ) : null}
            </View>
          ) : null}

          <ReviewsSection
            averageRating={averageRating}
            reviewCount={reviewCount}
            reviews={reviews}
            isLoading={areReviewsLoading}
            onWriteReview={handleWriteReview}
          />
        </Card.Body>
      </Card>

      </ScrollView>

      <View
        style={[styles.stickyTopBar, { paddingTop: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <View style={[styles.heroTopRow, { flexDirection }]}>
          <Button
            isIconOnly
            feedbackVariant="scale"
            onPress={handleBackPress}
            style={styles.overlayButton}
          >
            <FontAwesome
              name={isRTL ? "chevron-right" : "chevron-left"}
              size={theme.icon.sm}
              color="#FFFFFF"
            />
          </Button>

          <Button
            isIconOnly
            feedbackVariant="scale"
            onPress={handleBookmarkPress}
            isDisabled={isBookmarkPending}
            style={styles.overlayButton}
            accessibilityLabel={bookmarkLabel}
          >
            <Fontisto
              name={isBookmarked ? "bookmark" : "bookmark-alt"}
              size={20}
              color="#FFFFFF"
            />
          </Button>
        </View>
      </View>

      <ReviewComposerSheet
        isOpen={isComposerOpen}
        onOpenChange={setIsComposerOpen}
        rating={reviewRating}
        onRatingChange={setReviewRating}
        body={reviewBody}
        onBodyChange={setReviewBody}
        onSubmit={handleReviewSubmit}
        isPending={isReviewPending}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  heroSection: {
    width: "100%",
    backgroundColor: theme.colors.headerBackground,
  },
  heroMedia: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.headerBackground,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroFallback: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
  },
  heroScrim: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(10, 10, 10, 0.38)",
  },
  heroBadgePositioned: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  stickyTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.md,
    zIndex: theme.zIndex.sticky,
  },
  heroTopRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  overlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderCurve: "continuous",
    backgroundColor: "rgba(18, 18, 18, 0.38)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  sheetCard: {
    marginTop: -theme.spacing.xl,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderCurve: "continuous",
    boxShadow: "0 -16px 40px rgba(0, 0, 0, 0.14)",
  },
  sheetBody: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  sheetHeader: {
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.font.size.xxxl,
    lineHeight: 34,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  metaRow: {
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  metaItem: {
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  metaItemLocation: {
    flexShrink: 1,
    maxWidth: "100%",
  },
  metaDot: {
    fontSize: theme.font.size.base,
    color: theme.colors.textSecondary,
  },
  metaText: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
  actionsRow: {
    alignItems: "center",
    gap: theme.spacing.md,
  },
  primaryAction: {
    flex: 1,
    minHeight: 56,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.colors.primary,
    gap: theme.spacing.sm,
  },
  primaryActionLabel: {
    color: theme.colors.primaryForeground,
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
  },
  secondaryAction: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  aboutSection: {
    gap: theme.spacing.md,
  },
  locationSection: {
    gap: theme.spacing.md,
  },
  locationAddress: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.text,
    lineHeight: theme.font.size.base * theme.font.lineHeight.relaxed,
  },
  mapButton: {
    minHeight: 48,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  mapButtonLabel: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  sectionLabel: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.bold,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: theme.font.letterSpacing.widest,
  },
  description: {
    fontSize: theme.font.size.base,
    lineHeight: theme.font.size.base * theme.font.lineHeight.relaxed,
    fontFamily: theme.font.family.regular,
    color: theme.colors.text,
  },
  skeletonHero: {
    width: "100%",
    height: "100%",
  },
  skeletonTitleLineLg: {
    width: "88%",
    height: 28,
  },
  skeletonTitleLineSm: {
    width: "64%",
    height: 28,
  },
  skeletonMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  skeletonMetaPill: {
    width: 120,
    height: 22,
  },
  skeletonMetaPillWide: {
    width: 170,
    height: 22,
  },
  skeletonPrimaryAction: {
    flex: 1,
    height: 56,
  },
  skeletonIconAction: {
    width: 56,
    height: 56,
  },
  skeletonSectionLabel: {
    width: 132,
    height: 16,
  },
  skeletonBodyLine: {
    width: "100%",
    height: 18,
  },
  skeletonBodyLineShort: {
    width: "72%",
    height: 18,
  },
  skeletonMapButton: {
    width: "100%",
    height: 48,
  },
  skeletonReviewsSection: {
    gap: theme.spacing.md,
  },
  skeletonReviewsSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  skeletonRatingBig: {
    width: 60,
    height: 40,
  },
  skeletonReviewCard: {
    width: "100%",
    height: 80,
  },
  notFoundContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  notFoundCard: {
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
  },
  notFoundBody: {
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  notFoundTitle: {
    fontSize: theme.font.size.xxxl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  notFoundDescription: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: theme.font.size.lg * theme.font.lineHeight.relaxed,
  },
  notFoundButton: {
    minWidth: 140,
    minHeight: 52,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    backgroundColor: theme.colors.primary,
  },
  notFoundButtonLabel: {
    color: theme.colors.primaryForeground,
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
  },
}));
