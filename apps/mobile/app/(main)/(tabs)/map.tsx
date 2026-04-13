import Mapbox, {
  Camera,
  CircleLayer,
  Image as MapboxImage,
  Images,
  LocationPuck,
  MapView,
  ShapeSource,
  SymbolLayer,
} from "@rnmapbox/maps";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Button } from "heroui-native";
import { type ElementRef, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image as RNImage, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { CategoryChips } from "@/components/home/CategoryChips";
import { SearchBar } from "@/components/ui/SearchBar";
import { useCategories } from "@/hooks/use-categories";
import { useEvents, type EventDoc } from "@/hooks/use-events";
import { useDirection } from "@/rtl";
import { getDistanceKm, getUserCoordinates, type UserCoordinates } from "@/services/location";

const mapboxAccessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

if (mapboxAccessToken) {
  Mapbox.setAccessToken(mapboxAccessToken);
}

const DEFAULT_CENTER: [number, number] = [45.0792, 23.8859];
const DEFAULT_ZOOM_LEVEL = 4.2;
const FOCUSED_ZOOM_LEVEL = 11.8;
const MARKER_LABELS_ZOOM_LEVEL = 11;
const CLUSTER_MAX_ZOOM_LEVEL = 10;
const HORIZONTAL_PADDING = 16;

function hasCoordinates(event: EventDoc) {
  return Number.isFinite(event.locationLat) && Number.isFinite(event.locationLng);
}

function getSortedEvents(events: EventDoc[], userCoordinates?: UserCoordinates): EventDoc[] {
  return [...events].sort((left, right) => {
    if (userCoordinates) {
      const leftDistance = getDistanceKm(userCoordinates, {
        latitude: left.locationLat,
        longitude: left.locationLng,
      });
      const rightDistance = getDistanceKm(userCoordinates, {
        latitude: right.locationLat,
        longitude: right.locationLng,
      });

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
    }

    const leftStart = left.startAt ?? Number.MAX_SAFE_INTEGER;
    const rightStart = right.startAt ?? Number.MAX_SAFE_INTEGER;
    if (leftStart !== rightStart) {
      return leftStart - rightStart;
    }

    return left.title.localeCompare(right.title);
  });
}

function getBottomCameraPadding(insetsBottom: number): number {
  return insetsBottom + 272;
}

function getEventTitle(event: EventDoc, isArabic: boolean): string {
  const title = isArabic ? (event.titleAr ?? event.title) : event.title;
  return title.trim();
}

function getMarkerThumbnailName(eventId: EventDoc["_id"]): string {
  return `event-image-${eventId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function getShortMarkerTitle(title: string): string {
  if (title.length <= 24) {
    return title;
  }

  return `${title.slice(0, 21).trimEnd()}...`;
}

function getMarkerFeatures(
  events: EventDoc[],
  isArabic: boolean,
  eventTypeLabel: string,
  activityTypeLabel: string,
  readyMarkerImages: Record<string, true>,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];

  for (const event of events) {
    const title = getEventTitle(event, isArabic);
    const typeLabel = event.type === "activity" ? activityTypeLabel : eventTypeLabel;

    features.push({
      type: "Feature",
      id: event._id,
      properties: {
        eventId: event._id,
        markerThumbnail: event.images[0]
          ? readyMarkerImages[event._id]
            ? getMarkerThumbnailName(event._id)
            : event.type === "activity"
              ? "activity-fallback-thumbnail"
              : "event-fallback-thumbnail"
          : event.type === "activity"
            ? "activity-fallback-thumbnail"
            : "event-fallback-thumbnail",
        markerLabel: `${getShortMarkerTitle(title)}\n${typeLabel}`,
      },
      geometry: {
        type: "Point",
        coordinates: [event.locationLng, event.locationLat],
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

export default function MapScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { textAlign } = useDirection();
  const cameraRef = useRef<Camera>(null);
  const markerImageRefs = useRef<Record<string, ElementRef<typeof MapboxImage> | null>>({});
  const shapeSourceRef = useRef<ShapeSource>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [readyMarkerImages, setReadyMarkerImages] = useState<Record<string, true>>({});
  const [userCoordinates, setUserCoordinates] = useState<UserCoordinates | undefined>();
  const [isLocating, setIsLocating] = useState(true);
  const { events, isLoading } = useEvents();
  const { categories } = useCategories();
  const isArabic = i18n.language === "ar";
  const query = searchValue.trim().toLowerCase();

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

  const categoryOptions = categories.map((category) => ({
    id: category.key,
    label: isArabic ? category.labelAr : category.label,
  }));
  const eventTypeLabel = t("map.markerEvent");
  const activityTypeLabel = t("map.markerActivity");

  const matchesSearch = (event: EventDoc) => {
    if (query.length === 0) {
      return true;
    }

    const fields = [
      event.title,
      event.titleAr,
      event.descriptionShort,
      event.descriptionShortAr,
      event.city,
      ...event.categories,
      ...event.tags,
    ].filter((field): field is string => field != null && field.length > 0);

    return fields.some((field) => field.toLowerCase().includes(query));
  };

  const visibleEvents = getSortedEvents(
    (events ?? []).filter((event) => {
      if (!hasCoordinates(event)) {
        return false;
      }

      if (selectedCategory === "all") {
        return matchesSearch(event);
      }

      return event.categories.includes(selectedCategory) && matchesSearch(event);
    }),
    userCoordinates,
  );
  const markerThumbnailEvents = visibleEvents.filter((event) => event.images[0] && readyMarkerImages[event._id]);
  const markerFeatures = getMarkerFeatures(
    visibleEvents,
    isArabic,
    eventTypeLabel,
    activityTypeLabel,
    readyMarkerImages,
  );

  const selectedEvent = visibleEvents.find((event) => event._id === selectedEventId);

  const focusCoordinate = (coordinates: [number, number], zoomLevel: number) => {
    cameraRef.current?.setCamera({
      centerCoordinate: coordinates,
      zoomLevel,
      padding: {
        paddingTop: insets.top + 24,
        paddingRight: 24,
        paddingBottom: getBottomCameraPadding(insets.bottom),
        paddingLeft: 24,
      },
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

  useEffect(() => {
    let isMounted = true;

    const nextEntries = visibleEvents
      .map((event) => ({ eventId: event._id, imageUrl: event.images[0] }))
      .filter((entry): entry is { eventId: EventDoc["_id"]; imageUrl: string } => entry.imageUrl != null);

    void Promise.all(
      nextEntries.map(async ({ eventId, imageUrl }) => {
        if (readyMarkerImages[eventId]) {
          return eventId;
        }

        const didPrefetch = await RNImage.prefetch(imageUrl);
        return didPrefetch ? eventId : undefined;
      }),
    ).then((loadedIds) => {
      if (!isMounted) {
        return;
      }

      setReadyMarkerImages((current) => {
        let changed = false;
        const nextState = { ...current };

        for (const loadedId of loadedIds) {
          if (!loadedId || nextState[loadedId]) {
            continue;
          }

          nextState[loadedId] = true;
          changed = true;
        }

        if (!changed) {
          return current;
        }

        return nextState;
      });
    });

    return () => {
      isMounted = false;
    };
  }, [readyMarkerImages, visibleEvents]);

  const handleMarkerPress = (eventId: string) => {
    const nextEvent = visibleEvents.find((event) => event._id === eventId);
    setSelectedEventId(eventId);

    if (nextEvent) {
      focusCoordinate([nextEvent.locationLng, nextEvent.locationLat], FOCUSED_ZOOM_LEVEL);
    }
  };

  const handleMarkersPress = async (event: { features: Array<GeoJSON.Feature> }) => {
    const pressedFeature = event.features[0];
    if (!pressedFeature) {
      return;
    }

    if (pressedFeature.properties?.cluster) {
      const zoomLevel = await shapeSourceRef.current?.getClusterExpansionZoom(pressedFeature);
      if (zoomLevel == null) {
        return;
      }

      if (pressedFeature.geometry.type !== "Point") {
        return;
      }

      focusCoordinate(
        [pressedFeature.geometry.coordinates[0], pressedFeature.geometry.coordinates[1]],
        zoomLevel,
      );
      return;
    }

    const nextEventId = pressedFeature.properties?.eventId;
    if (!nextEventId) {
      return;
    }

    handleMarkerPress(String(nextEventId));
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

        <Images>
          <MapboxImage name="event-fallback-thumbnail">
            <View collapsable={false} style={styles.markerFallbackSprite}>
              <FontAwesome name="calendar" size={12} color={theme.colors.text} />
            </View>
          </MapboxImage>
          <MapboxImage name="activity-fallback-thumbnail">
            <View collapsable={false} style={styles.markerFallbackSprite}>
              <FontAwesome name="compass" size={12} color={theme.colors.text} />
            </View>
          </MapboxImage>
          {markerThumbnailEvents.map((event) => (
            <MapboxImage
              key={event._id}
              ref={(instance) => {
                markerImageRefs.current[event._id] = instance;
              }}
              name={getMarkerThumbnailName(event._id)}
            >
              <View collapsable={false} style={styles.markerThumbnailSprite}>
                <RNImage
                  source={{ uri: event.images[0] }}
                  style={styles.markerThumbnailImage}
                  onLoadEnd={() => {
                    markerImageRefs.current[event._id]?.refresh();
                  }}
                />
              </View>
            </MapboxImage>
          ))}
        </Images>

        <ShapeSource
          ref={shapeSourceRef}
          id="event-markers"
          shape={markerFeatures}
          cluster
          clusterRadius={40}
          clusterMaxZoomLevel={CLUSTER_MAX_ZOOM_LEVEL}
          hitbox={{ width: 44, height: 44 }}
          onPress={handleMarkersPress}
        >
          <CircleLayer
            id="event-marker-clusters"
            filter={["has", "point_count"]}
            style={{
              circleColor: theme.colors.primary,
              circleRadius: ["step", ["get", "point_count"], 18, 8, 22, 24, 28],
              circleStrokeColor: "rgba(255, 255, 255, 0.92)",
              circleStrokeWidth: 3,
              circlePitchAlignment: "map",
              circleEmissiveStrength: 1,
            }}
          />
          <SymbolLayer
            id="event-marker-cluster-count"
            filter={["has", "point_count"]}
            style={{
              textField: ["get", "point_count_abbreviated"],
              textColor: "#FFFFFF",
              textSize: 12,
              textFont: ["Open Sans Bold"],
              textIgnorePlacement: true,
              textAllowOverlap: true,
            }}
          />
          <CircleLayer
            id="event-marker-selected-ring"
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["==", ["get", "eventId"], selectedEventId ?? ""],
            ]}
            style={{
              circleColor: "rgba(0, 0, 0, 0)",
              circleRadius: 11,
              circleStrokeColor: theme.colors.text,
              circleStrokeWidth: 2,
              circlePitchAlignment: "map",
              circleEmissiveStrength: 1,
            }}
          />
          <SymbolLayer
            id="event-marker-thumbnails"
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["!=", ["get", "eventId"], selectedEventId ?? ""],
            ]}
            style={{
              iconImage: ["get", "markerThumbnail"],
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              iconSize: 1,
            }}
          />
          <SymbolLayer
            id="event-marker-thumbnails-selected"
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["==", ["get", "eventId"], selectedEventId ?? ""],
            ]}
            style={{
              iconImage: ["get", "markerThumbnail"],
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              iconSize: 1.05,
            }}
          />
          <SymbolLayer
            id="event-marker-labels"
            minZoomLevel={MARKER_LABELS_ZOOM_LEVEL}
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["!=", ["get", "eventId"], selectedEventId ?? ""],
            ]}
            style={{
              textField: ["get", "markerLabel"],
              textColor: theme.colors.text,
              textHaloColor: theme.colors.background,
              textHaloWidth: 1.5,
              textSize: 11,
              textFont: ["Open Sans Semibold"],
              textMaxWidth: 10,
              textLineHeight: 1.1,
              textOffset: [0, 2.1],
              textAnchor: "top",
            }}
          />
          <SymbolLayer
            id="event-marker-labels-selected"
            minZoomLevel={MARKER_LABELS_ZOOM_LEVEL}
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["==", ["get", "eventId"], selectedEventId ?? ""],
            ]}
            style={{
              textField: ["get", "markerLabel"],
              textColor: theme.colors.text,
              textHaloColor: theme.colors.background,
              textHaloWidth: 1.5,
              textSize: 12,
              textFont: ["Open Sans Bold"],
              textMaxWidth: 10,
              textLineHeight: 1.1,
              textOffset: [0, 2.35],
              textAnchor: "top",
              textAllowOverlap: true,
            }}
          />
        </ShapeSource>
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
  markerThumbnailSprite: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
    overflow: "hidden",
    backgroundColor: theme.colors.background,
  },
  markerThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  markerFallbackSprite: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    alignItems: "center",
    justifyContent: "center",
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
