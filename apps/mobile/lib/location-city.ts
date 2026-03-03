import * as Location from "expo-location";

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchKnownCity(rawValues: string[], cityOptions: string[]): string | undefined {
  const normalizedOptions = cityOptions.map((city) => ({
    city,
    normalized: normalize(city),
  }));

  for (const raw of rawValues) {
    const normalizedRaw = normalize(raw);

    const exact = normalizedOptions.find((option) => option.normalized === normalizedRaw);
    if (exact) {
      return exact.city;
    }

    const contains = normalizedOptions.find(
      (option) =>
        option.normalized.includes(normalizedRaw) || normalizedRaw.includes(option.normalized),
    );
    if (contains) {
      return contains.city;
    }
  }

  return undefined;
}

export async function detectCityFromUserLocation(cityOptions: string[]): Promise<string | undefined> {
  try {
    if (cityOptions.length === 0) {
      return undefined;
    }

    const currentPermission = await Location.getForegroundPermissionsAsync();
    const permission =
      currentPermission.status === "granted" || !currentPermission.canAskAgain
        ? currentPermission
        : await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      return undefined;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const places = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    const rawValues = places.flatMap((place) => [
      place.city,
      place.district,
      place.region,
      place.subregion,
    ]);

    const candidates = rawValues.filter((value): value is string => Boolean(value && value.trim()));
    return matchKnownCity(candidates, cityOptions);
  } catch {
    return undefined;
  }
}
