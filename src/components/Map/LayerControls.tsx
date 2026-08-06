import { layerMinZoom, sentinelHubAvailable, type SatelliteLayerId } from "../../utils/satellite-layers";
import "./LayerControls.css";

interface LayerControlsProps {
  layer: SatelliteLayerId;
  onLayerChange: (layer: SatelliteLayerId) => void;
  date: string;
  onDateChange: (date: string) => void;
}

const SENTINEL_OPTIONS: { id: SatelliteLayerId; label: string }[] = [
  { id: "s2-true-color", label: "Vero colore (Sentinel-2, 10m)" },
  { id: "s2-ndvi", label: "Vegetazione — NDVI (Sentinel-2, 10m)" },
  { id: "s2-ndwi", label: "Presenza d'acqua — NDWI (Sentinel-2, 10m)" },
  { id: "s2-swir", label: "Calore/colate laviche — SWIR (Sentinel-2, 10m)" },
  { id: "s2-nbr", label: "Cicatrici da incendio — NBR (Sentinel-2, 10m)" },
  { id: "s3-lst", label: "Temperatura superficie reale — LST (Sentinel-3, ~1km)" },
  { id: "landsat-thermal", label: "Temperatura superficie (Landsat, ~30-100m) — copertura non garantita" },
];

function todayMinus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function LayerControls({ layer, onLayerChange, date, onDateChange }: LayerControlsProps) {
  const minZoom = layerMinZoom(layer);

  return (
    <div className="layer-controls">
      <label className="layer-controls__label" htmlFor="layer-select">
        Layer satellitare
      </label>
      <select
        id="layer-select"
        value={layer}
        onChange={(e) => onLayerChange(e.target.value as SatelliteLayerId)}
      >
        <option value="none">Solo mappa base</option>
        {sentinelHubAvailable &&
          SENTINEL_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
      </select>
      {layer !== "none" && (
        <>
          <label className="layer-controls__label" htmlFor="layer-date">
            Data (i dati satellitari hanno ~2 giorni di latenza)
          </label>
          <input
            id="layer-date"
            type="date"
            value={date}
            max={todayMinus(2)}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </>
      )}
      {minZoom != null && (
        <p className="layer-controls__hint">Zoom su una città per vedere questo layer (10m di risoluzione).</p>
      )}
      {layer === "landsat-thermal" && (
        <p className="layer-controls__hint">
          Landsat passa ogni ~8-16 giorni: se l'area è stata nuvolosa in tutti i passaggi recenti,
          il layer può restare vuoto. Nessun errore — semplicemente non c'è un pixel valido.
        </p>
      )}
    </div>
  );
}
