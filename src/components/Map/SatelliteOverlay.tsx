import { WMSTileLayer } from "react-leaflet";
import {
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
 * Overlay satellitare da Sentinel Hub (Copernicus Data Space Ecosystem, 10m per
 * Sentinel-2 / ~1km per Sentinel-3). Le richieste WMS verso una Configuration
 * pubblica non richiedono token; l'Instance ID stesso non va però mai
 * committato (consuma la quota dell'account). Se la Configuration non è
 * presente in `.env.local`, il layer non renderizza nulla.
 */
export default function SatelliteOverlay({ layer, date }: SatelliteOverlayProps) {
  if (layer === "none") return null;

  const { instance, name, minZoom, lookbackDays } = SENTINEL_LAYERS[layer];
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
