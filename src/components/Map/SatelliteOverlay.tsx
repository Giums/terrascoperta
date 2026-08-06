import { WMSTileLayer } from "react-leaflet";
import {
  GIBS_LAYER_NAMES,
  GIBS_WMS_URL,
  SENTINEL_LAYERS,
  sentinelTimeRange,
  type SatelliteLayerId,
  type SentinelWMSParams,
} from "../../utils/satellite-layers";

export type { SatelliteLayerId } from "../../utils/satellite-layers";

interface SatelliteOverlayProps {
  layer: SatelliteLayerId;
  date: string; // YYYY-MM-DD
}

/**
 * Overlay satellitare. Preferisce Sentinel Hub (Copernicus Data Space
 * Ecosystem, 10m per Sentinel-2 / ~1km per Sentinel-3) quando l'Instance ID
 * della Configuration è presente in `.env.local`; le richieste WMS verso una
 * Configuration pubblica non richiedono token, l'Instance ID stesso non va
 * però mai committato (consuma la quota dell'account).
 * Se non configurato, ricade su NASA GIBS/MODIS (nessuna autenticazione,
 * ~1km, ~2 giorni di latenza).
 */
export default function SatelliteOverlay({ layer, date }: SatelliteOverlayProps) {
  if (layer === "none") return null;

  if (layer in SENTINEL_LAYERS) {
    const { instance, name, minZoom, lookbackDays } = SENTINEL_LAYERS[layer as keyof typeof SENTINEL_LAYERS];
    if (!instance) return null;

    return (
      <WMSTileLayer
        key={`${layer}-${date}`}
        url={`https://sh.dataspace.copernicus.eu/ogc/wms/${instance}`}
        layers={name}
        format="image/png"
        transparent
        opacity={0.7}
        minZoom={minZoom}
        params={{ time: sentinelTimeRange(date, lookbackDays) } as SentinelWMSParams}
        attribution="Copernicus Sentinel Hub / CDSE"
      />
    );
  }

  return (
    <WMSTileLayer
      key={`${layer}-${date}`}
      url={`${GIBS_WMS_URL}?TIME=${date}`}
      layers={GIBS_LAYER_NAMES[layer as keyof typeof GIBS_LAYER_NAMES]}
      format="image/png"
      transparent
      opacity={0.65}
      attribution="Imagery courtesy NASA GIBS / MODIS"
    />
  );
}
