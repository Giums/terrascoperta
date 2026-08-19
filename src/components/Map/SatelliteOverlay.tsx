import { Source, Layer } from "react-map-gl/maplibre";
import {
  SENTINEL_LAYERS,
  sentinelTimeRange,
  type SatelliteLayerId,
} from "../../utils/satellite-layers";
import { sstTileUrl, CMEMS_ATTRIBUTION } from "../../utils/marine-layers";

export type { SatelliteLayerId } from "../../utils/satellite-layers";

interface SatelliteOverlayProps {
  layer: SatelliteLayerId;
  date: string; // YYYY-MM-DD
}

// Testo ufficiale richiesto dalla Copernicus Sentinel Data Licence quando i
// dati sono elaborati/modificati (evalscript, mosaicking) — non va confuso
// col logo "Show logo" di Sentinel Hub, che è un watermark diverso e va
// disattivato nella Configuration Utility (si ripete su ogni tile altrimenti).
const SENTINEL_ATTRIBUTION = `Contains modified Copernicus Sentinel data ${new Date().getFullYear()}`;

/**
 * Overlay satellitare da Sentinel Hub (Copernicus Data Space Ecosystem, 10m per
 * Sentinel-2 / ~1km per Sentinel-3). Le richieste WMS verso una Configuration
 * pubblica non richiedono token; l'Instance ID stesso non va però mai
 * committato (consuma la quota dell'account). Se la Configuration non è
 * presente in `.env.local`, il layer non renderizza nulla.
 * `{bbox-epsg-3857}` è sostituito da MapLibre con il bbox del tile richiesto —
 * è così che si collega un servizio WMS (pensato per bbox arbitrari) a un
 * source raster XYZ (pensato per tile fissi).
 * Tile a 512px (non 256): la collection S2L2A rifiuta richieste WMS oltre
 * 1500 m/pixel — a 256px questo limite scatta già a zoom 7, obbligando a
 * zoomare parecchio prima di vedere qualcosa. Raddoppiando i pixel per tile
 * si dimezzano i metri/pixel a parità di zoom, e il limite si sposta a
 * zoom 6 — la vista di default del sito (verificato con una richiesta reale:
 * a 256px l'area torna l'immagine di errore di Sentinel Hub, a 512px la
 * stessa area torna dati veri).
 * URL relativo (`/api/satellite-tile/...`, non il dominio Sentinel Hub
 * diretto): passa dal backend, che tiene una cache in-memory per bbox+layer+
 * data — Sentinel Hub ricalcola ogni tile al volo (1-3.5s misurati, verificato
 * con richieste dirette) e la stessa vista viene richiesta di continuo da
 * visitatori diversi, quindi una cache condivisa lato server abbatte la
 * stragrande maggioranza delle richieste ripetute a un fetch quasi istantaneo.
 */
export default function SatelliteOverlay({ layer, date }: SatelliteOverlayProps) {
  if (layer === "none") return null;

  // Copernicus Marine, non Sentinel Hub: WMTS pubblico chiamato direttamente
  // dal browser, nessun proxy e nessuna chiave (vedi marine-layers.ts).
  if (layer === "sst-med") {
    return (
      <Source
        key={`sst-med-${date}`}
        id="satellite"
        type="raster"
        tiles={[sstTileUrl(date)]}
        tileSize={256}
        attribution={CMEMS_ATTRIBUTION}
      >
        <Layer id="satellite-layer" type="raster" source="satellite" paint={{ "raster-opacity": 0.8 }} />
      </Source>
    );
  }

  const { instance, name, minZoom, lookbackDays } = SENTINEL_LAYERS[layer];
  if (!instance) return null;

  const time = sentinelTimeRange(date, lookbackDays);
  const tileUrl =
    `/api/satellite-tile/${instance}` +
    `?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=${encodeURIComponent(name)}` +
    `&STYLES=&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857` +
    `&WIDTH=512&HEIGHT=512&BBOX={bbox-epsg-3857}&time=${encodeURIComponent(time)}`;

  return (
    <Source
      key={`${layer}-${date}`}
      id="satellite"
      type="raster"
      tiles={[tileUrl]}
      tileSize={512}
      attribution={SENTINEL_ATTRIBUTION}
    >
      <Layer
        id="satellite-layer"
        type="raster"
        source="satellite"
        {...(minZoom != null ? { minzoom: minZoom } : {})}
        paint={{ "raster-opacity": 0.7 }}
      />
    </Source>
  );
}
