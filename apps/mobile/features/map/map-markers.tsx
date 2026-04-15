import {
  CircleLayer,
  Image as MapboxImage,
  Images,
  ShapeSource,
  SymbolLayer,
} from "@rnmapbox/maps";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image as ExpoImage } from "expo-image";
import { type ElementRef, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  getMarkerFeatures,
  getMarkerThumbnailName,
} from "@/features/map/data";
import type { EventDoc } from "@/hooks/use-events";

const MARKER_LABELS_ZOOM_LEVEL = 11;
const CLUSTER_MAX_ZOOM_LEVEL = 10;
const MARKER_SIZE = 50;
const MARKER_RADIUS = MARKER_SIZE / 2;
const MARKER_BORDER_WIDTH = 1;
const MARKER_SELECTED_RING_RADIUS = 25;

type MapMarkersProps = {
  activityTypeLabel: string;
  backgroundColor: string;
  eventTypeLabel: string;
  focusCoordinate: (coordinates: [number, number], zoomLevel: number) => void;
  isArabic: boolean;
  onMarkerPress: (eventId: string) => void;
  primaryColor: string;
  selectedAccentColor: string;
  selectedEventId?: string;
  textColor: string;
  visibleEvents: EventDoc[];
};

function getPointCoordinates(feature: GeoJSON.Feature): [number, number] | null {
  if (feature.geometry.type !== "Point") {
    return null;
  }

  const [longitude, latitude] = feature.geometry.coordinates;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }

  return [longitude, latitude];
}

export function MapMarkers({
  activityTypeLabel,
  backgroundColor,
  eventTypeLabel,
  focusCoordinate,
  isArabic,
  onMarkerPress,
  primaryColor,
  selectedAccentColor,
  selectedEventId,
  textColor,
  visibleEvents,
}: MapMarkersProps) {
  const markerImageRefs = useRef<Record<string, ElementRef<typeof MapboxImage> | null>>({});
  const shapeSourceRef = useRef<ShapeSource>(null);
  const [failedMarkerImages, setFailedMarkerImages] = useState<Record<string, true>>({});
  const markerThumbnailEvents = useMemo(() => {
    return visibleEvents.filter((event) => {
      return event.images[0] && !failedMarkerImages[event._id];
    });
  }, [visibleEvents, failedMarkerImages]);

  const markerFeatures = useMemo(() => {
    return getMarkerFeatures(
      visibleEvents,
      isArabic,
      eventTypeLabel,
      activityTypeLabel,
      failedMarkerImages,
    );
  }, [visibleEvents, isArabic, eventTypeLabel, activityTypeLabel, failedMarkerImages]);

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

      const coordinates = getPointCoordinates(pressedFeature);
      if (!coordinates) {
        return;
      }

      focusCoordinate(coordinates, zoomLevel);
      return;
    }

    const nextEventId = pressedFeature.properties?.eventId;
    if (!nextEventId) {
      return;
    }

    onMarkerPress(String(nextEventId));
  };

  return (
    <>
      <Images>
        <MapboxImage name="event-fallback-thumbnail">
          <View collapsable={false} style={styles.markerFallbackSprite}>
            <FontAwesome name="calendar" size={12} color={textColor} />
          </View>
        </MapboxImage>
        <MapboxImage name="activity-fallback-thumbnail">
          <View collapsable={false} style={styles.markerFallbackSprite}>
            <FontAwesome name="compass" size={12} color={textColor} />
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
            <View
              collapsable={false}
              style={[styles.markerThumbnailSprite, { backgroundColor }]}
            >
              <ExpoImage
                source={{ uri: event.images[0] }}
                style={styles.markerThumbnailImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                onLoadEnd={() => {
                  markerImageRefs.current[event._id]?.refresh();
                }}
                onError={() => {
                  setFailedMarkerImages((current) => {
                    if (current[event._id]) {
                      return current;
                    }

                    return { ...current, [event._id]: true };
                  });
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
            circleColor: primaryColor,
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
            circleRadius: MARKER_SELECTED_RING_RADIUS,
            circleStrokeColor: selectedAccentColor,
            circleStrokeWidth: 5,
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
            textColor,
            textHaloColor: backgroundColor,
            textHaloWidth: 1.5,
            textSize: 11,
            textFont: ["Open Sans Semibold"],
            textMaxWidth: 10,
            textLineHeight: 1.1,
            textOffset: [0, 2.35],
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
            textColor,
            textHaloColor: backgroundColor,
            textHaloWidth: 1.5,
            textSize: 12,
            textFont: ["Open Sans Bold"],
            textMaxWidth: 10,
            textLineHeight: 1.1,
            textOffset: [0, 2.6],
            textAnchor: "top",
            textAllowOverlap: true,
          }}
        />
      </ShapeSource>
    </>
  );
}

const styles = StyleSheet.create({
  markerThumbnailSprite: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_RADIUS,
    borderWidth: MARKER_BORDER_WIDTH,
    borderColor: "rgba(255, 255, 255, 0.95)",
    overflow: "hidden",
  },
  markerThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  markerFallbackSprite: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_RADIUS,
    borderWidth: MARKER_BORDER_WIDTH,
    borderColor: "rgba(255, 255, 255, 0.95)",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
});
