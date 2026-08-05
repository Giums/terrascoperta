import type { City } from "../data/cities";

/**
 * Stima l'intensità dell'isola di calore urbana (°C) di una città.
 * Modello semplificato basato su popolazione, latitudine, costa e Pianura
 * Padana (inversioni termiche). Non è una misurazione — è un ordine di
 * grandezza plausibile in assenza di dati satellitari.
 * Fonti: Oke 1982, Stewart & Oke 2012.
 */
export function estimateUHI(city: City): number {
  let uhi = Math.log10(Math.max(city.population / 1000, 5)) * 1.4 - 1.5;

  if (city.lat < 42) uhi += 0.4;
  if (city.lat < 39) uhi += 0.2;

  if (city.coastal) uhi -= 0.35;

  if (city.lat > 44 && city.lat < 46 && city.lng > 7 && city.lng < 13) uhi += 0.3;

  return Math.max(0.3, Math.round(uhi * 10) / 10);
}

export function uhiColor(uhi: number): string {
  if (uhi < 1.5) return "#4ade80";
  if (uhi < 2.5) return "#facc15";
  if (uhi < 3.5) return "#fb923c";
  if (uhi < 4.5) return "#f87171";
  return "#b91c1c";
}
