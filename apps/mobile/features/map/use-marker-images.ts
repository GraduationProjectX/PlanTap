import { useEffect, useState } from "react";
import { Image as RNImage } from "react-native";

import type { EventDoc } from "@/hooks/use-events";

type MarkerImageEntry = {
  eventId: EventDoc["_id"];
  imageUrl: string;
};

function getMarkerImageEntries(events: EventDoc[]): MarkerImageEntry[] {
  return events
    .map((event) => ({ eventId: event._id, imageUrl: event.images[0] }))
    .filter((entry): entry is MarkerImageEntry => entry.imageUrl != null);
}

export function useMarkerImages(visibleEvents: EventDoc[]) {
  const [readyMarkerImages, setReadyMarkerImages] = useState<Record<string, true>>({});

  useEffect(() => {
    let isMounted = true;
    const imageEntries = getMarkerImageEntries(visibleEvents);

    void Promise.all(
      imageEntries.map(async ({ eventId, imageUrl }) => {
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

  const markerThumbnailEvents = visibleEvents.filter((event) => {
    return event.images[0] && readyMarkerImages[event._id];
  });

  return { markerThumbnailEvents, readyMarkerImages };
}
