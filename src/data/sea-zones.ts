import { haversineKm } from "../utils/geo";

/**
 * Zone di mare italiane: ognuna ha un punto al largo verificato con l'API
 * (serve stare abbastanza lontani da costa, altrimenti il modello marino
 * restituisce null perché il punto cade su una cella "terra") e un punto di
 * riferimento a terra usato solo per scegliere la zona più vicina a dove sta
 * guardando l'utente sulla mappa.
 *
 * Vivono qui e non dentro un componente perché li usa anche lo script che
 * rigenera la serie storica (scripts/generate-sst-history.ts): due copie delle
 * stesse coordinate finirebbero per divergere, e il grafico mostrerebbe punti
 * diversi da quelli annunciati.
 */
export interface SeaZone {
  /** Chiave stabile usata nel JSON storico — non rinominare senza rigenerarlo. */
  id: string;
  name: string;
  refLat: number;
  refLng: number;
  point: { lat: number; lng: number };
}

export const SEA_ZONES: SeaZone[] = [
  { id: "liguria", name: "Liguria", refLat: 44.41, refLng: 8.93, point: { lat: 43.8, lng: 9.2 } },
  {
    id: "tirreno",
    name: "Tirreno (Toscana/Lazio/Campania)",
    refLat: 41.9,
    refLng: 12.9,
    point: { lat: 40.0, lng: 13.5 },
  },
  {
    id: "ionio",
    name: "Ionio (Puglia/Basilicata/Calabria)",
    refLat: 39.7,
    refLng: 17.0,
    point: { lat: 38.5, lng: 17.5 },
  },
  {
    id: "adriatico",
    name: "Adriatico (Veneto/Emilia-Romagna/Marche/Abruzzo)",
    refLat: 43.6,
    refLng: 13.6,
    point: { lat: 43.3, lng: 14.2 },
  },
  { id: "sicilia", name: "Sicilia", refLat: 37.8, refLng: 13.9, point: { lat: 36.7, lng: 13.8 } },
  { id: "sardegna", name: "Sardegna", refLat: 40.1, refLng: 9.0, point: { lat: 40.0, lng: 8.0 } },
];

export function nearestSeaZone(lat: number, lng: number): SeaZone {
  let best = SEA_ZONES[0];
  let bestDist = haversineKm(lat, lng, best.refLat, best.refLng);
  for (const zone of SEA_ZONES.slice(1)) {
    const dist = haversineKm(lat, lng, zone.refLat, zone.refLng);
    if (dist < bestDist) {
      best = zone;
      bestDist = dist;
    }
  }
  return best;
}
