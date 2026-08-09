export type SatelliteLayerId =
  | "none"
  | "s2-true-color"
  | "s2-ndvi"
  | "s2-ndwi"
  | "s2-swir"
  | "s2-nbr"
  | "s3-lst"
  | "landsat-thermal"
  | "s5p-so2"
  | "s5p-aer-ai"
  | "s1-backscatter";

const SENTINEL_INSTANCE_S2 = import.meta.env.VITE_SENTINEL_INSTANCE_ID_S2 as string | undefined;
const SENTINEL_INSTANCE_S3 = import.meta.env.VITE_SENTINEL_INSTANCE_ID_S3 as string | undefined;
const SENTINEL_INSTANCE_S3_LST = import.meta.env.VITE_SENTINEL_INSTANCE_ID_S3_LST as string | undefined;
const SENTINEL_INSTANCE_LANDSAT = import.meta.env.VITE_SENTINEL_INSTANCE_ID_LANDSAT as string | undefined;
const SENTINEL_INSTANCE_S5P_SO2 = import.meta.env.VITE_SENTINEL_INSTANCE_ID_S5P_SO2 as string | undefined;
const SENTINEL_INSTANCE_S5P_AER = import.meta.env.VITE_SENTINEL_INSTANCE_ID_S5P_AER as string | undefined;
const SENTINEL_INSTANCE_S1 = import.meta.env.VITE_SENTINEL_INSTANCE_ID_S1 as string | undefined;

/** true se almeno una Configuration Sentinel Hub è disponibile in questo deployment. */
export const sentinelHubAvailable = Boolean(
  SENTINEL_INSTANCE_S2 ||
    SENTINEL_INSTANCE_S3 ||
    SENTINEL_INSTANCE_S3_LST ||
    SENTINEL_INSTANCE_LANDSAT ||
    SENTINEL_INSTANCE_S5P_SO2 ||
    SENTINEL_INSTANCE_S5P_AER ||
    SENTINEL_INSTANCE_S1,
);

export const SENTINEL_LAYERS: Record<
  | "s2-true-color"
  | "s2-ndvi"
  | "s2-ndwi"
  | "s2-swir"
  | "s2-nbr"
  | "s3-lst"
  | "landsat-thermal"
  | "s5p-so2"
  | "s5p-aer-ai"
  | "s1-backscatter",
  { instance?: string; name: string; minZoom?: number; lookbackDays: number }
> = {
  // La collection S2L2A rifiuta richieste WMS oltre 1500 m/pixel. Con tile a
  // 512px (vedi SatelliteOverlay.tsx) il limite scatta sotto zoom 6, non 7 —
  // zoom 6 è la vista di default del sito, quindi questi layer si vedono
  // già alla prima apertura del tab, senza dover zoomare.
  "s2-true-color": { instance: SENTINEL_INSTANCE_S2, name: "TRUE_COLOR", minZoom: 6, lookbackDays: 13 },
  "s2-ndvi": { instance: SENTINEL_INSTANCE_S2, name: "VEGETATION_INDEX", minZoom: 6, lookbackDays: 13 },
  // NDWI (Normalized Difference Water Index, McFeeters 1996) — richiede un layer
  // "WATER_INDEX" nella stessa Configuration S2L2A (Configuration Utility →
  // Custom → evalscript NDWI, o template "NDWI" se disponibile).
  "s2-ndwi": { instance: SENTINEL_INSTANCE_S2, name: "WATER_INDEX", minZoom: 6, lookbackDays: 13 },
  // Falso colore SWIR — evidenzia calore/colate laviche attive, satura in
  // bianco dove la temperatura di superficie è molto alta.
  "s2-swir": { instance: SENTINEL_INSTANCE_S2, name: "SWIR", minZoom: 6, lookbackDays: 13 },
  // NBR (Normalized Burn Ratio) — evidenzia cicatrici da incendio (suolo bruciato
  // assorbe più SWIR, riflette meno NIR). Richiede layer "BURN_INDEX" nella
  // stessa Configuration S2L2A.
  "s2-nbr": { instance: SENTINEL_INSTANCE_S2, name: "BURN_INDEX", minZoom: 6, lookbackDays: 13 },
  // Land Surface Temperature vera (Sentinel-3 SLSTR L2, prodotto SL_2_LST) — non
  // una brightness temperature grezza. Limite di risoluzione 5000 m/pixel: già
  // rispettato dallo zoom minimo globale della mappa (5), nessun minZoom dedicato.
  "s3-lst": { instance: SENTINEL_INSTANCE_S3_LST, name: "LST", lookbackDays: 13 },
  // Landsat 8/9 banda termica B10, ~30-100m — molto più fine di Sentinel-3, utile
  // per vedere il dettaglio quartiere/isolato. Stesso limite di risoluzione di
  // S2L2A (1500 m/pixel), stesso fix a 512px (vedi sopra).
  // LIMITE NOTO (best-effort, non risolto): anche con mosaicking "leastCC" e una
  // finestra di 45 giorni, il layer può restare vuoto (nessun pixel valido, non un
  // errore) se ogni passaggio Landsat recente sull'area era nuvoloso — il revisit
  // combinato Landsat 8+9 è ~8-16 giorni contro il quasi-giornaliero di Sentinel-2/3,
  // quindi la probabilità di trovare un passaggio sereno è più bassa. Verificato che
  // NON è un problema di cache/URL: bbox mai richieste prima danno lo stesso esito.
  "landsat-thermal": { instance: SENTINEL_INSTANCE_LANDSAT, name: "9_THERMAL", minZoom: 6, lookbackDays: 45 },
  // Sentinel-5P/TROPOMI, SO2 e Aerosol Index — utili per vedere un pennacchio
  // vulcanico (o di altra origine), non per confini precisi: pixel ~7x3.5km,
  // molto più grosso di S2. La Configuration va creata con mosaicking "most
  // recent" (non "least cloud coverage" come S2): un pennacchio si sposta in
  // ore, un composito multi-giorno lo mediarebbe fino a farlo sparire.
  // lookbackDays corto per lo stesso motivo — non c'entra la copertura nuvolosa.
  "s5p-so2": { instance: SENTINEL_INSTANCE_S5P_SO2, name: "SO2", lookbackDays: 2 },
  // Coppia 340/380nm (non 354/388, variante meno standard) — è quella del
  // prodotto ufficiale Copernicus "UV Aerosol Index".
  // ID col trattino, non underscore — è quello che risulta configurato con
  // l'evalscript corretto (verificato dal vivo, il gemello "AER_AI_340_380"
  // con underscore è un duplicato rimasto sull'evalscript raw non fixato).
  "s5p-aer-ai": { instance: SENTINEL_INSTANCE_S5P_AER, name: "AER-AI-340-AND-380", lookbackDays: 2 },
  // Sentinel-1 SAR, backscatter VV grezzo — non ottico, quindi vede sotto le
  // nuvole: utile per alluvioni quando NDWI (S2) è cieco per copertura
  // nuvolosa. NON è InSAR: un solo passaggio non misura movimento del suolo
  // (serve differenza di fase multi-temporale, fuori scope per una semplice
  // Configuration WMS) — per la subsidenza vera vedi EGMS, non questo layer.
  "s1-backscatter": { instance: SENTINEL_INSTANCE_S1, name: "VV_BACKSCATTER", minZoom: 6, lookbackDays: 6 },
};

/** Zoom minimo richiesto perché il layer selezionato mostri dati (undefined = nessun limite). */
export function layerMinZoom(layer: SatelliteLayerId): number | undefined {
  return layer === "none" ? undefined : SENTINEL_LAYERS[layer].minZoom;
}

/**
 * URL di una singola immagine WMS statica (non un tile layer) per un bbox
 * fisso — usata per anteprime satellitari incorporate nei pannelli di
 * dettaglio (es. foto recente di un vulcano), non per la mappa principale.
 */
export function staticSnapshotUrl(
  layer: "s2-true-color" | "s2-swir" | "s5p-so2" | "s5p-aer-ai",
  bbox: { minLat: number; minLng: number; maxLat: number; maxLng: number },
  date: string,
  width = 400,
  height = 300,
): string | null {
  const { instance, name, lookbackDays } = SENTINEL_LAYERS[layer];
  if (!instance) return null;
  const time = sentinelTimeRange(date, lookbackDays);
  return (
    `https://sh.dataspace.copernicus.eu/ogc/wms/${instance}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0` +
    `&LAYERS=${encodeURIComponent(name)}&STYLES=&FORMAT=image/png&CRS=EPSG:4326` +
    `&WIDTH=${width}&HEIGHT=${height}&BBOX=${bbox.minLat},${bbox.minLng},${bbox.maxLat},${bbox.maxLng}` +
    `&time=${encodeURIComponent(time)}`
  );
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
