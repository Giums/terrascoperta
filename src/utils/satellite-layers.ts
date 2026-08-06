import type { WMSParams } from "leaflet";

export type SatelliteLayerId =
  | "none"
  | "s2-true-color"
  | "s2-ndvi"
  | "s2-ndwi"
  | "s2-swir"
  | "s2-nbr"
  | "s3-lst"
  | "landsat-thermal";

const SENTINEL_INSTANCE_S2 = import.meta.env.VITE_SENTINEL_INSTANCE_ID_S2 as string | undefined;
const SENTINEL_INSTANCE_S3 = import.meta.env.VITE_SENTINEL_INSTANCE_ID_S3 as string | undefined;
const SENTINEL_INSTANCE_S3_LST = import.meta.env.VITE_SENTINEL_INSTANCE_ID_S3_LST as string | undefined;
const SENTINEL_INSTANCE_LANDSAT = import.meta.env.VITE_SENTINEL_INSTANCE_ID_LANDSAT as string | undefined;

/** true se almeno una Configuration Sentinel Hub è disponibile in questo deployment. */
export const sentinelHubAvailable = Boolean(
  SENTINEL_INSTANCE_S2 || SENTINEL_INSTANCE_S3 || SENTINEL_INSTANCE_S3_LST || SENTINEL_INSTANCE_LANDSAT,
);

export const SENTINEL_LAYERS: Record<
  "s2-true-color" | "s2-ndvi" | "s2-ndwi" | "s2-swir" | "s2-nbr" | "s3-lst" | "landsat-thermal",
  { instance?: string; name: string; minZoom?: number; lookbackDays: number }
> = {
  // La collection S2L2A rifiuta richieste WMS oltre 1500 m/pixel: sotto zoom 7
  // (vista Italia intera, ~1700-1900 m/pixel) il tile torna un'immagine di errore.
  "s2-true-color": { instance: SENTINEL_INSTANCE_S2, name: "TRUE_COLOR", minZoom: 7, lookbackDays: 13 },
  "s2-ndvi": { instance: SENTINEL_INSTANCE_S2, name: "VEGETATION_INDEX", minZoom: 7, lookbackDays: 13 },
  // NDWI (Normalized Difference Water Index, McFeeters 1996) — richiede un layer
  // "WATER_INDEX" nella stessa Configuration S2L2A (Configuration Utility →
  // Custom → evalscript NDWI, o template "NDWI" se disponibile).
  "s2-ndwi": { instance: SENTINEL_INSTANCE_S2, name: "WATER_INDEX", minZoom: 7, lookbackDays: 13 },
  // Falso colore SWIR — evidenzia calore/colate laviche attive, satura in
  // bianco dove la temperatura di superficie è molto alta.
  "s2-swir": { instance: SENTINEL_INSTANCE_S2, name: "SWIR", minZoom: 7, lookbackDays: 13 },
  // NBR (Normalized Burn Ratio) — evidenzia cicatrici da incendio (suolo bruciato
  // assorbe più SWIR, riflette meno NIR). Richiede layer "BURN_INDEX" nella
  // stessa Configuration S2L2A.
  "s2-nbr": { instance: SENTINEL_INSTANCE_S2, name: "BURN_INDEX", minZoom: 7, lookbackDays: 13 },
  // Land Surface Temperature vera (Sentinel-3 SLSTR L2, prodotto SL_2_LST) — non
  // una brightness temperature grezza. Limite di risoluzione 5000 m/pixel: già
  // rispettato dallo zoom minimo globale della mappa (5), nessun minZoom dedicato.
  "s3-lst": { instance: SENTINEL_INSTANCE_S3_LST, name: "LST", lookbackDays: 13 },
  // Landsat 8/9 banda termica B10, ~30-100m — molto più fine di Sentinel-3, utile
  // per vedere il dettaglio quartiere/isolato. Stesso limite di risoluzione di
  // S2L2A (1500 m/pixel): sotto zoom 7 il tile torna un'immagine di errore.
  // LIMITE NOTO (best-effort, non risolto): anche con mosaicking "leastCC" e una
  // finestra di 45 giorni, il layer può restare vuoto (nessun pixel valido, non un
  // errore) se ogni passaggio Landsat recente sull'area era nuvoloso — il revisit
  // combinato Landsat 8+9 è ~8-16 giorni contro il quasi-giornaliero di Sentinel-2/3,
  // quindi la probabilità di trovare un passaggio sereno è più bassa. Verificato che
  // NON è un problema di cache/URL: bbox mai richieste prima danno lo stesso esito.
  "landsat-thermal": { instance: SENTINEL_INSTANCE_LANDSAT, name: "9_THERMAL", minZoom: 7, lookbackDays: 45 },
};

/** Zoom minimo richiesto perché il layer selezionato mostri dati (undefined = nessun limite). */
export function layerMinZoom(layer: SatelliteLayerId): number | undefined {
  return layer === "none" ? undefined : SENTINEL_LAYERS[layer].minZoom;
}

export function sentinelTimeRange(date: string, lookbackDays: number): string {
  // Sentinel Hub compone un mosaico cloud-free sulla finestra: più giorni prima
  // della data scelta aumentano la probabilità di trovare pixel senza nuvole
  // (o, per satelliti a revisit basso come Landsat, di trovare un passaggio).
  const end = new Date(date);
  const start = new Date(date);
  start.setDate(start.getDate() - lookbackDays);
  return `${start.toISOString().slice(0, 10)}/${end.toISOString().slice(0, 10)}`;
}

export type SentinelWMSParams = WMSParams & { time: string };
