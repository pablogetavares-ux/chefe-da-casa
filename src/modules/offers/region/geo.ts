const EARTH_RADIUS_KM = 6371;

export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
}

export function normalizeState(state: string) {
  return state.trim().toUpperCase().slice(0, 2);
}

export function isSameCity(
  storeCity: string,
  storeState: string,
  regionCity: string,
  regionState: string,
) {
  return (
    storeCity.trim().toLowerCase() === regionCity.trim().toLowerCase() &&
    normalizeState(storeState) === normalizeState(regionState)
  );
}
