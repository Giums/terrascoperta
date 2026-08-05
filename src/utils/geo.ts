import type { City } from "../data/cities";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Città più vicina a un punto, usata come riferimento quando non abbiamo un modello UHI per il singolo indirizzo. */
export function nearestCity(lat: number, lng: number, cities: City[]): { city: City; distanceKm: number } {
  let best = cities[0];
  let bestDist = haversineKm(lat, lng, best.lat, best.lng);

  for (const city of cities) {
    const dist = haversineKm(lat, lng, city.lat, city.lng);
    if (dist < bestDist) {
      best = city;
      bestDist = dist;
    }
  }

  return { city: best, distanceKm: bestDist };
}
