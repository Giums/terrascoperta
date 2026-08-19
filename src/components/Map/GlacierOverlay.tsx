import { Source, Layer } from "react-map-gl/maplibre";
import {
  glacierTileUrl,
  GLIMS_ATTRIBUTION,
  HISTORIC_HUE_ROTATE,
  type GlacierEpoch,
} from "../../utils/glacier-layers";

interface GlacierOverlayProps {
  epoch: GlacierEpoch | null;
}

/**
 * Contorni dei ghiacciai, in un Source separato da quello satellitare apposta:
 * il senso di questo layer è stare *sopra* un'immagine recente (Sentinel-2 true
 * color) per confrontare il ghiaccio di oggi col perimetro di vent'anni fa.
 * Se condividesse il Source con l'overlay satellitare, sceglierne uno
 * escluderebbe l'altro e il confronto sarebbe impossibile.
 *
 * In modalità "compare" le due epoche sono disegnate insieme, quella storica
 * virata di tonalità: sovrapposte nello stesso rosa erano indistinguibili, e
 * alternandole sembrava che non cambiasse nulla.
 */
export default function GlacierOverlay({ epoch }: GlacierOverlayProps) {
  if (!epoch) return null;

  if (epoch === "compare") {
    return (
      <>
        <Source
          key="glaciers-historic"
          id="glaciers-historic"
          type="raster"
          tiles={[glacierTileUrl("historic")]}
          tileSize={256}
          attribution={GLIMS_ATTRIBUTION}
        >
          <Layer
            id="glaciers-historic-layer"
            type="raster"
            source="glaciers-historic"
            paint={{ "raster-opacity": 1, "raster-hue-rotate": HISTORIC_HUE_ROTATE }}
          />
        </Source>
        {/* Il recente sopra, al colore originale: quello che resta scoperto
            sotto è il ghiaccio perso tra le due campagne. */}
        <Source
          key="glaciers-recent"
          id="glaciers-recent"
          type="raster"
          tiles={[glacierTileUrl("recent")]}
          tileSize={256}
        >
          <Layer
            id="glaciers-recent-layer"
            type="raster"
            source="glaciers-recent"
            paint={{ "raster-opacity": 1 }}
          />
        </Source>
      </>
    );
  }

  return (
    <Source
      key={`glaciers-${epoch}`}
      id="glaciers"
      type="raster"
      tiles={[glacierTileUrl(epoch)]}
      tileSize={256}
      attribution={GLIMS_ATTRIBUTION}
    >
      {/* Opacità piena: sono linee sottili, sbiadirle le renderebbe invisibili
          sopra il bianco del ghiaccio e il grigio della roccia. */}
      <Layer id="glaciers-layer" type="raster" source="glaciers" paint={{ "raster-opacity": 1 }} />
    </Source>
  );
}
