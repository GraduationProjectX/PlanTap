import Mapbox, {
  Camera,
  LocationPuck,
  MapView,
} from "@rnmapbox/maps";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Button } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { CategoryChips } from "@/components/home/CategoryChips";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  getBottomCameraPadding,
  getCategoryOptions,
  getVisibleEvents,
} from "@/features/map/data";
import { MapMarkers } from "@/features/map/map-markers";
import { useMarkerImages } from "@/features/map/use-marker-images";
import { useCategories } from "@/hooks/use-categories";
import { useEvents } from "@/hooks/use-events";
import { useDirection } from "@/rtl";
import { getUserCoordinates, type UserCoordinates } from "@/services/location";

const mapboxAccessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

if (mapboxAccessToken) {
  Mapbox.setAccessToken(mapboxAccessToken);
}

const DEFAULT_CENTER: [number, number] = [45.0792, 23.8859];
const DEFAULT_ZOOM_LEVEL = 4.2;
const FOCUSED_ZOOM_LEVEL = 11.8;
const SELECTED_MARKER_ZOOM_LEVEL = 12.6;
const HORIZONTAL_PADDING = 16;

export default function MapScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { textAlign } = useDirection();
  const cameraRef = useRef<Camera>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [userCoordinates, setUserCoordinates] = useState<UserCoordinates | undefined>();
  const [isLocating, setIsLocating] = useState(true);
  const { events, isLoading } = useEvents();
  const { categories } = useCategories();
  const isArabic = i18n.language === "ar";

  useEffect(() => {
    let isMounted = true;

    const loadUserCoordinates = async () => {
      const nextCoordinates = await getUserCoordinates();
      if (!isMounted) {
        return;
      }

      setUserCoordinates(nextCoordinates);
      setIsLocating(false);
    };

    void loadUserCoordinates();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = getCategoryOptions(categories, isArabic);
  const eventTypeLabel = t("map.markerEvent");
  const activityTypeLabel = t("map.markerActivity");
  const query = searchValue.trim().toLowerCase();

  const visibleEvents = getVisibleEvents(
    events ?? [],
    selectedCategory,
    query,
    userCoordinates,
  );
  const { readyMarkerImages, markerThumbnailEvents } = useMarkerImages(visibleEvents);

  const selectedEvent = visibleEvents.find((event) => event._id === selectedEventId);

  const focusCoordinate = (
    coordinates: [number, number],
    zoomLevel: number,
    centerOnScreen = false,
  ) => {
    const padding = centerOnScreen
      ? {
          paddingTop: 0,
          paddingRight: 0,
          paddingBottom: 0,
          paddingLeft: 0,
        }
      : {
          paddingTop: insets.top + 24,
          paddingRight: 24,
          paddingBottom: getBottomCameraPadding(insets.bottom),
          paddingLeft: 24,
        };

    cameraRef.current?.setCamera({
      centerCoordinate: coordinates,
      zoomLevel,
      padding,
      animationDuration: 350,
      animationMode: "easeTo",
    });
  };

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }

    if (selectedEvent) {
      return;
    }

    setSelectedEventId(undefined);
  }, [selectedEvent, selectedEventId]);

  const handleMarkerPress = (eventId: string) => {
    const nextEvent = visibleEvents.find((event) => event._id === eventId);
    setSelectedEventId(eventId);

    if (nextEvent) {
      focusCoordinate(
        [nextEvent.locationLng, nextEvent.locationLat],
        SELECTED_MARKER_ZOOM_LEVEL,
        true,
      );
    }
  };

  const handleMyLocationPress = async () => {
    const nextCoordinates = userCoordinates ?? (await getUserCoordinates());

    if (!nextCoordinates) {
      return;
    }

    setUserCoordinates(nextCoordinates);
    focusCoordinate([nextCoordinates.longitude, nextCoordinates.latitude], FOCUSED_ZOOM_LEVEL);
  };

  if (!mapboxAccessToken) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={[styles.setupTitle, { textAlign }]}>{t("map.setupTitle")}</Text>
        <Text style={[styles.setupDescription, { textAlign }]}>{t("map.setupDescription")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        compassEnabled
        rotateEnabled={false}
        localizeLabels={{ locale: isArabic ? "ar" : "en" }}
        onPress={() => {
          setSelectedEventId(undefined);
        }}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: userCoordinates
              ? [userCoordinates.longitude, userCoordinates.latitude]
              : DEFAULT_CENTER,
            zoomLevel: userCoordinates ? FOCUSED_ZOOM_LEVEL : DEFAULT_ZOOM_LEVEL,
          }}
        />
        {userCoordinates && (
          <LocationPuck
            puckBearing="heading"
            puckBearingEnabled
            pulsing={{ isEnabled: true, color: theme.colors.primary, radius: 40 }}
          />
        )}

        <MapMarkers
          activityTypeLabel={activityTypeLabel}
          backgroundColor={theme.colors.background}
          eventTypeLabel={eventTypeLabel}
          focusCoordinate={focusCoordinate}
          markerThumbnailEvents={markerThumbnailEvents}
          onMarkerPress={handleMarkerPress}
          primaryColor={theme.colors.primary}
          readyMarkerImages={readyMarkerImages}
          selectedEventId={selectedEventId}
          textColor={theme.colors.text}
          visibleEvents={visibleEvents}
          isArabic={isArabic}
        />
      </MapView>

      <View style={[styles.topOverlay, { paddingTop: insets.top + 12 }]}>
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder={t("home.search")}
        />
        <CategoryChips
          categories={categoryOptions}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>

      <View style={[styles.bottomOverlay, { paddingBottom: 4 }]}>
        <View style={styles.myLocationButtonWrap}>
          <Button
            onPress={handleMyLocationPress}
            feedbackVariant="scale"
            style={styles.myLocationButton}
          >
            <FontAwesome name="location-arrow" size={14} color={theme.colors.text} />
            <Text style={styles.myLocationText}>{t("map.myLocation")}</Text>
          </Button>
        </View>

        {isLoading || isLocating ? (
          <View style={styles.statusCard}>
            <Text style={[styles.statusText, { textAlign }]}>{t("common.loading")}</Text>
          </View>
        ) : visibleEvents.length === 0 ? (
          <View style={styles.statusCard}>
            <Text style={[styles.statusText, { textAlign }]}>{t("map.empty")}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  setupTitle: {
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  setupDescription: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.headerBackground,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    borderCurve: "continuous",
    zIndex: 20,
  },
  myLocationButtonWrap: {
    alignItems: "flex-end",
    paddingHorizontal: theme.spacing.md,
  },
  myLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    minHeight: 42,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },
  myLocationText: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
  },
  bottomOverlay: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    gap: theme.spacing.sm,
  },
  statusCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },
  statusText: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
    color: theme.colors.text,
  },
}));
