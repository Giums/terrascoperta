import type { WMSParams } from "leaflet";

export type SatelliteLayerId =
  | "none"
  | "s2-true-color"
  | "s2-ndvi"
  | "s3-lst"
  | "gibs-lst-day"
  | "gibs-lst-night"
  | "gibs-ndvi";

export const GIBS_WMS_URL = "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi";

export const GIBS_LAYER_NAMES: Record<"gibs-lst-day" | "gibs-lst-night" | "gibs-ndvi", string> = {
  "gibs-lst-day": "MODIS_Terra_Land_Surface_Temp_Day",
  "gibs-lst-night": "MODIS_Terra_Land_Surface_Temp_Night",
  "gibs-ndvi": "MODIS_Terra_NDVI_8Day",
};

const SENTINEL_INSTANCE_S2 = import.meta.env.VITE_SENTINEL_INSTANCE_ID_S2 as string | undefined;
const SENTINEL_INSTANCE_S3 = import.meta.env.VITE_SENTINEL_INSTANCE_ID_S3 as string | undefined;

/** true se almeno una Configuration Sentinel Hub è disponibile in questo deployment. */
export const sentinelHubAvailable = Boolean(SENTINEL_INSTANCE_S2 || SENTINEL_INSTANCE_S3);

export const SENTINEL_LAYERS: Record<
  "s2-true-color" | "s2-ndvi" | "s3-lst",
  { instance?: string; name: string; minZoom?: number }
> = {
  // La collection S2L2A rifiuta richieste WMS oltre 1500 m/pixel: sotto zoom 7
  // (vista Italia intera, ~1700-1900 m/pixel) il tile torna un'immagine di errore.
  "s2-true-color": { instance: SENTINEL_INSTANCE_S2, name: "TRUE_COLOR", minZoom: 7 },
  "s2-ndvi": { instance: SENTINEL_INSTANCE_S2, name: "VEGETATION_INDEX", minZoom: 7 },
  "s3-lst": { instance: SENTINEL_INSTANCE_S3, name: "F1_VISUALIZED" },
};

/** Zoom minimo richiesto perché il layer selezionato mostri dati (undefined = nessun limite). */
export function layerMinZoom(layer: SatelliteLayerId): number | undefined {
  if (layer in SENTINEL_LAYERS) {
    return SENTINEL_LAYERS[layer as keyof typeof SENTINEL_LAYERS].minZoom;
  }
  return undefined;
}

export function sentinelTimeRange(date: string): string {
  // Sentinel Hub compone un mosaico cloud-free sulla finestra: 13 giorni prima
  // della data scelta aumentano la probabilità di trovare pixel senza nuvole.
  const end = new Date(date);
  const start = new Date(date);
  start.setDate(start.getDate() - 13);
  return `${start.toISOString().slice(0, 10)}/${end.toISOString().slice(0, 10)}`;
}

export type SentinelWMSParams = WMSParams & { time: string };
