import * as Location from "expo-location";

export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

async function getUserPosition(
  requestPermission: boolean,
): Promise<Location.LocationObject | undefined> {
  try {
    let permission = await Location.getForegroundPermissionsAsync();

    if (permission.status !== "granted" && requestPermission) {
      permission = await Location.requestForegroundPermissionsAsync();
    }

    if (permission.status !== "granted") {
      return undefined;
    }

    return (
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }))
    );
  } catch {
    return undefined;
  }
}

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

export async function detectCityFromUserLocation(
  cityOptions: string[],
): Promise<string | undefined> {
  try {
    if (cityOptions.length === 0) {
      return undefined;
    }

    const position = await getUserPosition(false);
    if (!position) {
      return undefined;
    }

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

export async function getUserCoordinates(): Promise<UserCoordinates | undefined> {
  const position = await getUserPosition(true);
  if (!position) {
    return undefined;
  }

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export function getDistanceKm(from: UserCoordinates, to: UserCoordinates): number {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const startLatitude = toRadians(from.latitude);
  const endLatitude = toRadians(to.latitude);
  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
