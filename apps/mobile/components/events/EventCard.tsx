import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image } from "expo-image";
import { Button, Card, Chip } from "heroui-native";
import { useTranslation } from "react-i18next";
import {
  Pressable as RNPressable,
  Text,
  type GestureResponderEvent,
  View,
} from "react-native";
import Transition from "react-native-screen-transitions";
import { StyleSheet } from "react-native-unistyles";

import { DateBadge } from "@/components/home/DateBadge";
import { LiveBadge } from "@/components/home/LiveBadge";
import { formatEventDateRange } from "@/features/events/data";
import type { EventDoc } from "@/hooks/use-events";
import { getEventCardMeta, getEventSharedBoundTag } from "@/features/events/ui";
import { useDirection } from "@/rtl";

export type EventCardVariant =
  | "hero"
  | "medium"
  | "preview-list"
  | "preview-grid"
  | "bookmark-hero"
  | "bookmark-grid";

type EventId = EventDoc["_id"];

type EventCardProps = {
  event: EventDoc;
  variant: EventCardVariant;
  width?: number;
  height?: number;
  marginBottom?: number;
  mapActionLabel?: string;
  showDateRangeChip?: boolean;
  showMapTypeChip?: boolean;
  onPress: (id: EventId) => void;
  onBookmark?: (id: EventId) => void;
  isBookmarked?: boolean;
  showCountdown?: boolean;
};


function EventCardComponent({
  event,
  variant,
  width,
  height,
  marginBottom,
  mapActionLabel,
  showDateRangeChip,
  showMapTypeChip,
  onPress,
  onBookmark,
  isBookmarked,
  showCountdown = true,
}: EventCardProps) {
  const { t, i18n } = useTranslation();
  const { isRTL, flexDirection, textAlign } = useDirection();

  const isPreviewVariant = variant === "preview-list" || variant === "preview-grid";
  const meta = getEventCardMeta(event, {
    maxTags: variant === "hero" ? 8 : 5,
    includeDate: variant === "bookmark-hero" || variant === "bookmark-grid",
    includeCountdown: isPreviewVariant && showCountdown,
    includeRemaining: variant === "bookmark-hero",
    whenAllLabel: t("filters.whenAll"),
  });

  const liveBadgeLabel = meta.isLive ? t("home.liveNow") : null;
  const countdownLabel = meta.countdownLabel
    ? t("bookmarks.startsIn", { time: meta.countdownLabel })
    : null;
  const remainingLabel = meta.remainingLabel
    ? t("bookmarks.remaining", { time: meta.remainingLabel })
    : null;
  const sharedBoundTag = getEventSharedBoundTag(event._id);
  const dateRangeLabel = showDateRangeChip
    ? formatEventDateRange(event.startAt, event.endAt, i18n.language === "ar" ? "ar-SA" : "en-US")
    : null;
  const mapTypeLabel = showMapTypeChip
    ? event.type === "activity"
      ? t("map.markerActivity")
      : t("map.markerEvent")
    : null;
  const shouldShowMapTypeChip = mapTypeLabel != null && !liveBadgeLabel;

  const handleCardPress = () => {
    onPress(event._id);
  };

  const handleBookmarkPress = (pressEvent: GestureResponderEvent) => {
    pressEvent.stopPropagation();
    onBookmark?.(event._id);
  };

  if (variant === "preview-list" || variant === "preview-grid") {
    const isGrid = variant === "preview-grid";

    return (
      <Transition.Pressable
        onPress={handleCardPress}
        style={[styles.previewCard, isGrid && styles.previewCardGrid]}
      >
        <View style={[styles.previewRow, { flexDirection: isGrid ? "column" : flexDirection }]}>
          <View style={[styles.previewImageContainer, isGrid && styles.previewImageContainerGrid]}>
            <Transition.View
              sharedBoundTag={sharedBoundTag}
              collapsable={false}
              style={styles.previewImageShared}
            >
              <Image
                source={{ uri: event.images[0] }}
                style={styles.previewImage}
                contentFit="cover"
                transition={120}
              />
            </Transition.View>
            <View style={styles.previewDateBadge}>
              <DateBadge day={meta.dateBadge.day} month={meta.dateBadge.month} />
            </View>
          </View>

          <View style={[styles.previewInfo, isGrid && styles.previewInfoGrid]}>
            <View style={[styles.previewTopRow, { flexDirection }]}>
              {countdownLabel && (
                <Chip size="sm" variant="secondary" color="accent" animation="disable-all">
                  <Chip.Label style={styles.previewCountdownText}>{countdownLabel}</Chip.Label>
                </Chip>
              )}
            </View>

            <Text style={[styles.previewTitle, isGrid && styles.previewTitleGrid, { textAlign }]} numberOfLines={2}>
              {event.title}
            </Text>

            <Text style={[styles.previewCategory, { textAlign }]}>{meta.categoryLabel}</Text>

            <View style={[styles.previewLocationRow, { flexDirection }]}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={[styles.previewLocationText, { textAlign }]} numberOfLines={2}>
                {meta.locationLabel}
              </Text>
            </View>
          </View>
        </View>
      </Transition.Pressable>
    );
  }

  if (variant === "bookmark-grid") {
    return (
      <Transition.Pressable
        collapsable={false}
        onPress={handleCardPress}
        style={styles.bookmarkGridCard}
      >
        <View style={styles.bookmarkGridImageContainer}>
          <Transition.View
            sharedBoundTag={sharedBoundTag}
            collapsable={false}
            style={styles.bookmarkGridImageShared}
          >
            <Image
              source={{ uri: event.images[0] }}
              style={styles.bookmarkGridImage}
              contentFit="cover"
              transition={120}
            />
          </Transition.View>
          <View style={styles.bookmarkGridOverlay} />

          {onBookmark && (
            <RNPressable
              onPress={handleBookmarkPress}
              style={styles.bookmarkGridHeartButton}
              hitSlop={8}
            >
              <FontAwesome
                name={isBookmarked ? "heart" : "heart-o"}
                size={14}
                color="#FFFFFF"
              />
            </RNPressable>
          )}

          {!!meta.dateLabel && (
            <View style={styles.bookmarkGridDateBadge}>
              <FontAwesome name="calendar-o" size={11} color="#FFFFFF" />
              <Text style={styles.bookmarkGridDateText} numberOfLines={1}>
                {meta.dateLabel}
              </Text>
            </View>
          )}

          <View style={styles.bookmarkGridTitleContainer}>
            <Text style={styles.bookmarkGridTitle} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={styles.bookmarkGridLocationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.bookmarkGridLocationText} numberOfLines={1}>
                {meta.locationLabel}
              </Text>
            </View>
          </View>
        </View>
      </Transition.Pressable>
    );
  }

  if (variant === "bookmark-hero") {
    return (
      <Transition.Pressable
        collapsable={false}
        onPress={handleCardPress}
        style={styles.bookmarkHeroCard}
      >
        <Transition.View
          sharedBoundTag={sharedBoundTag}
          collapsable={false}
          style={styles.bookmarkHeroImageShared}
        >
          <Image
            source={{ uri: event.images[0] }}
            style={styles.bookmarkHeroImage}
            contentFit="cover"
            transition={160}
          />
        </Transition.View>
        <View style={styles.bookmarkHeroOverlay} />

        <View style={[styles.bookmarkHeroTopRow, { flexDirection }]}>
          {onBookmark && (
            <RNPressable
              onPress={handleBookmarkPress}
              style={styles.bookmarkHeroHeartButton}
              hitSlop={8}
            >
              <FontAwesome
                name={isBookmarked ? "heart" : "heart-o"}
                size={16}
                color="#FFFFFF"
              />
            </RNPressable>
          )}
          <View style={styles.bookmarkHeroTopSpacer} />
          <View
            style={[styles.bookmarkHeroTopBadges, { alignItems: isRTL ? "flex-start" : "flex-end" }]}
          >
            {meta.dateLabel && (
              <View style={styles.bookmarkHeroDateBadge}>
                <FontAwesome name="calendar-o" size={11} color="#FFFFFF" />
                <Text style={styles.bookmarkHeroDateText}>{meta.dateLabel}</Text>
              </View>
            )}
            {remainingLabel && (
              <View style={styles.bookmarkHeroRemainingBadge}>
                <FontAwesome name="clock-o" size={11} color="#FFFFFF" />
                <Text style={styles.bookmarkHeroRemainingText}>{remainingLabel}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.heroContent}>
          {liveBadgeLabel && (
            <View style={styles.heroBadge}>
              <LiveBadge label={liveBadgeLabel} />
            </View>
          )}
          <Text style={[styles.heroTitle, { textAlign }]} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={[styles.heroLocationRow, { flexDirection }]}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={[styles.heroLocationText, { textAlign }]} numberOfLines={1}>
              {meta.locationLabel}
            </Text>
          </View>
        </View>
      </Transition.Pressable>
    );
  }

  if (variant === "medium") {
    return (
      <Transition.Pressable
        onPress={handleCardPress}
        style={[
          styles.mediumContainer,
          width != null ? { width } : null,
          height != null ? { height } : null,
          marginBottom != null ? { marginBottom } : null,
        ]}
      >
        <Card style={styles.mediumCard} animation="disable-all" variant="transparent">
          <Transition.View
            sharedBoundTag={sharedBoundTag}
            collapsable={false}
            style={styles.mediumMedia}
          >
            <Image
              source={{ uri: event.images[0] }}
              style={styles.mediumImageFill}
              contentFit="cover"
              transition={120}
            />
          </Transition.View>
          <View style={styles.mediumOverlay} />

          {liveBadgeLabel && (
            <View style={styles.mediumBadge}>
              <LiveBadge label={liveBadgeLabel} />
            </View>
          )}

          {shouldShowMapTypeChip && (
            <View style={styles.mapEventCardTypeChipTopLeft}>
              <Text style={styles.mapEventCardTypeText} numberOfLines={1}>
                {mapTypeLabel}
              </Text>
            </View>
          )}

          {dateRangeLabel && (
            <View style={styles.mapEventCardDateChip}>
              <FontAwesome name="calendar-o" size={10} color="#FFFFFF" />
              <Text style={styles.mapEventCardDateText} numberOfLines={2}>
                {dateRangeLabel}
              </Text>
            </View>
          )}

          <Card.Body style={styles.mediumContent}>
            <View style={[styles.mediumLocationRow, { flexDirection }]}> 
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={[styles.mediumLocationText, { textAlign }]} numberOfLines={1}>
                {meta.locationLabel}
              </Text>
            </View>

            <View style={[styles.mediumTitleRow, { flexDirection }]}>
              <Text style={[styles.mediumTitle, { textAlign }]} numberOfLines={3}>
                {event.title}
              </Text>

              <Button
                isIconOnly={mapActionLabel == null}
                onPress={handleCardPress}
                feedbackVariant="scale"
                style={
                  mapActionLabel
                    ? styles.mapEventCardActionButton
                    : styles.mediumArrowButton
                }
              >
                {mapActionLabel ? (
                  <>
                    <Text style={styles.mapEventCardActionText} numberOfLines={1}>
                      {mapActionLabel}
                    </Text>
                    <FontAwesome name={isRTL ? "arrow-left" : "arrow-right"} size={13} color="#000000" />
                  </>
                ) : (
                  <FontAwesome name={isRTL ? "arrow-left" : "arrow-right"} size={12} color="#000000" />
                )}
              </Button>
            </View>

            {meta.tagLabels.length > 0 && (
              <View style={[styles.mediumTagsContainer, { flexDirection }]}>
                {meta.tagLabels.map((tag) => (
                  <Chip
                    key={`${event._id}-${tag}`}
                    size="sm"
                    variant="soft"
                    color="default"
                    animation="disable-all"
                    style={styles.mediumTagChip}
                  >
                    <Chip.Label style={styles.mediumTagText}>{tag}</Chip.Label>
                  </Chip>
                ))}
              </View>
            )}
          </Card.Body>
        </Card>
      </Transition.Pressable>
    );
  }

  return (
    <Transition.Pressable
      collapsable={false}
      onPress={handleCardPress}
      style={[styles.heroCard, width != null ? { width } : null]}
    >
      <Transition.View
        sharedBoundTag={sharedBoundTag}
        collapsable={false}
        style={styles.heroImageShared}
      >
        <Image
          source={{ uri: event.images[0] }}
          style={styles.heroImage}
          contentFit="cover"
          transition={160}
        />
      </Transition.View>
      <View style={styles.heroOverlay} />

      {liveBadgeLabel && (
        <View style={styles.heroBadgePositioned}>
          <LiveBadge label={liveBadgeLabel} />
        </View>
      )}

      <View style={styles.heroContent}>
        <View style={[styles.heroLocationRow, { flexDirection }]}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={[styles.heroLocationText, { textAlign }]} numberOfLines={1}>
            {meta.locationLabel}
          </Text>
        </View>
        <View style={[styles.heroTitleRow, { flexDirection }]}>
          <Text style={[styles.heroTitle, { textAlign }]} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={styles.heroArrowButton}>
            <Text style={styles.heroArrowText}>{isRTL ? "←" : "→"}</Text>
          </View>
        </View>

        {meta.tagLabels.length > 0 && (
          <View style={[styles.heroTagsContainer, { flexDirection }]}>
            {meta.tagLabels.map((tag) => (
              <View key={`${event._id}-${tag}`} style={styles.heroTagChip}>
                <Text style={styles.heroTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Transition.Pressable>
  );
}

export const EventCard = EventCardComponent;

const styles = StyleSheet.create((theme) => ({
  locationIcon: {
    fontSize: 12,
  },

  heroCard: {
    height: 240,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroImageShared: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  heroBadgePositioned: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    gap: 6,
  },
  heroBadge: {
    alignSelf: "flex-start",
  },
  heroLocationRow: {
    alignItems: "center",
    gap: 4,
  },
  heroLocationText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    flex: 1,
  },
  heroTitleRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  heroTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
  },
  heroArrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroArrowText: {
    fontSize: 16,
    color: "#000000",
  },
  heroTagsContainer: {
    flexWrap: "wrap",
    gap: 6,
  },
  heroTagChip: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
  },
  heroTagText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
  },

  mediumContainer: {
    height: 254,
    marginBottom: theme.spacing.sm,
  },
  mediumCard: {
    flex: 1,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  mediumMedia: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  mediumImageFill: {
    width: "100%",
    height: "100%",
  },
  mediumOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.36)",
  },
  mediumBadge: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  mediumContent: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 6,
  },
  mediumLocationRow: {
    alignItems: "center",
    gap: 4,
  },
  mediumLocationText: {
    flex: 1,
    color: "rgba(255, 255, 255, 0.82)",
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
  },
  mediumTitleRow: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  mediumTitle: {
    flex: 1,
    flexWrap: "wrap",
    color: "#FFFFFF",
    fontSize: theme.font.size.lg,
    lineHeight: 20,
    fontFamily: theme.font.family.bold,
  },
  mediumArrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  mapEventCardActionButton: {
    minWidth: 118,
    height: 34,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    paddingHorizontal: 10,
    gap: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "#FFFFFF",
  },
  mapEventCardActionText: {
    color: "#000000",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.semiBold,
  },
  mapEventCardDateChip: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    backgroundColor: "rgba(0, 0, 0, 0.56)",
    maxWidth: "82%",
  },
  mapEventCardDateText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.semiBold,
    letterSpacing: theme.font.letterSpacing.wide,
    lineHeight: theme.font.size.xs * 1.2,
    flexShrink: 1,
  },
  mapEventCardTypeChipTopLeft: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  mapEventCardTypeText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.semiBold,
    letterSpacing: theme.font.letterSpacing.wider,
  },
  mediumTagsContainer: {
    flexWrap: "wrap",
    gap: 6,
  },
  mediumTagChip: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 0,
    paddingHorizontal: 6,
  },
  mediumTagText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
  },

  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    padding: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  previewCardGrid: {
    marginHorizontal: 0,
    padding: theme.spacing.xs,
  },
  previewRow: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  previewImageContainer: {
    width: 104,
    height: 104,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    overflow: "hidden",
    position: "relative",
  },
  previewImageContainerGrid: {
    width: "100%",
    height: undefined,
    aspectRatio: 1.25,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewImageShared: {
    width: "100%",
    height: "100%",
  },
  previewDateBadge: {
    position: "absolute",
    top: 4,
    left: 4,
  },
  previewInfo: {
    flex: 1,
    gap: 6,
  },
  previewInfoGrid: {
    width: "100%",
  },
  previewTopRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  previewCountdownText: {
    color: "#000000",
  },
  previewCategory: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.textSecondary,
    letterSpacing: theme.font.letterSpacing.wider,
  },
  previewTitle: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  previewTitleGrid: {
    lineHeight: theme.font.size.lg * theme.font.lineHeight.normal,
    minHeight: theme.font.size.lg * theme.font.lineHeight.normal * 2,
  },
  previewLocationRow: {
    alignItems: "center",
    gap: 4,
  },
  previewLocationText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    flex: 1,
  },

  bookmarkHeroCard: {
    height: 220,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  bookmarkHeroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bookmarkHeroImageShared: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bookmarkHeroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  bookmarkHeroTopRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    alignItems: "flex-start",
  },
  bookmarkHeroTopSpacer: {
    flex: 1,
  },
  bookmarkHeroTopBadges: {
    gap: 6,
  },
  bookmarkHeroDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
  },
  bookmarkHeroDateText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.semiBold,
    letterSpacing: theme.font.letterSpacing.wide,
  },
  bookmarkHeroHeartButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkHeroRemainingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
  },
  bookmarkHeroRemainingText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.semiBold,
  },

  bookmarkGridCard: {
    flex: 1,
  },
  bookmarkGridImageContainer: {
    aspectRatio: 0.9,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    overflow: "hidden",
    position: "relative",
  },
  bookmarkGridImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bookmarkGridImageShared: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bookmarkGridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  bookmarkGridHeartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkGridDateBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  bookmarkGridDateText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.semiBold,
    letterSpacing: theme.font.letterSpacing.wide,
  },
  bookmarkGridTitleContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    gap: 4,
  },
  bookmarkGridTitle: {
    color: "#FFFFFF",
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.bold,
  },
  bookmarkGridLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bookmarkGridLocationText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.regular,
    flex: 1,
  },
}));
