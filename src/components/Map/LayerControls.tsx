import { layerMinZoom, sentinelHubAvailable, type SatelliteLayerId } from "../../utils/satellite-layers";
import { useSeasonalTrend, seasonCutoffMonthDay } from "../../hooks/useSeasonalTrend";
import TrendSparkline from "./TrendSparkline";
import "./LayerControls.css";

interface LayerControlsProps {
  layer: SatelliteLayerId;
  onLayerChange: (layer: SatelliteLayerId) => void;
  date: string;
  onDateChange: (date: string) => void;
  /** Slider anno: ha senso solo nel modulo Calore, dove nasce l'esigenza di confrontare nel tempo. */
  showYearSlider: boolean;
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

// Cinque città sparse per l'Italia (Nord/Centro/Sud/Sicilia) per una media
// più rappresentativa di un punto solo — non legate alla città eventualmente
// selezionata altrove nell'app. Coordinate da data/cities.ts.
const REFERENCE_POINTS = [
  { lat: 45.4642, lng: 9.19 }, // Milano
  { lat: 44.4949, lng: 11.3426 }, // Bologna
  { lat: 41.9028, lng: 12.4964 }, // Roma
  { lat: 40.8518, lng: 14.2681 }, // Napoli
  { lat: 37.5079, lng: 15.083 }, // Catania
];

function todayMinus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Sentinel-2 (10m) e Sentinel-3 (LST) coprono davvero dal 2016 in poi — prima
// i satelliti non c'erano ancora o non avevano copertura globale operativa.
const MIN_YEAR = 2016;
const CURRENT_YEAR = new Date().getFullYear();

interface YearCompareProps {
  year: number;
  onYearChange: (year: number) => void;
}

function YearCompare({ year, onYearChange }: YearCompareProps) {
  const { data, loading } = useSeasonalTrend(REFERENCE_POINTS, MIN_YEAR, CURRENT_YEAR);
  const current = data.find((d) => d.year === year)?.avgTemp ?? null;
  const baseline = data.find((d) => d.year === MIN_YEAR)?.avgTemp ?? null;
  const delta = current != null && baseline != null ? current - baseline : null;

  return (
    <>
      <label className="layer-controls__label" htmlFor="layer-year">
        Estate {year} — media Milano/Bologna/Roma/Napoli/Catania (1 giu → {seasonCutoffMonthDay()})
      </label>
      <input
        id="layer-year"
        type="range"
        min={MIN_YEAR}
        max={CURRENT_YEAR}
        step={1}
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
      />
      <div className="layer-controls__temp">
        {loading ? (
          "Calcolo su 5 città… (~20s la prima volta)"
        ) : current != null ? (
          <>
            <strong>{current.toFixed(1)}°C</strong>
            {delta != null && year !== MIN_YEAR && (
              <span className={delta >= 0 ? "layer-controls__delta--up" : "layer-controls__delta--down"}>
                {" "}
                ({delta >= 0 ? "+" : ""}
                {delta.toFixed(1)}°C vs {MIN_YEAR})
              </span>
            )}
          </>
        ) : (
          "Dato non disponibile"
        )}
      </div>
      {!loading && <TrendSparkline data={data} selectedYear={year} />}
    </>
  );
}

export default function LayerControls({ layer, onLayerChange, date, onDateChange, showYearSlider }: LayerControlsProps) {
  const minZoom = layerMinZoom(layer);
  const year = Math.min(Math.max(Number(date.slice(0, 4)) || CURRENT_YEAR, MIN_YEAR), CURRENT_YEAR);

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
      {layer !== "none" &&
        (showYearSlider ? (
          <YearCompare year={year} onYearChange={(y) => onDateChange(`${y}-07-15`)} />
        ) : (
          <>
            <label className="layer-controls__label" htmlFor="layer-date">
              Data (~2 giorni di latenza)
            </label>
            <input
              id="layer-date"
              type="date"
              value={date}
              max={todayMinus(2)}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </>
        ))}
      {minZoom != null && (
        <p className="layer-controls__hint">Zoom su una città per vedere questo layer.</p>
      )}
      {layer === "landsat-thermal" && (
        <p className="layer-controls__hint">Landsat passa ogni ~8-16 giorni: può restare vuoto se nuvoloso.</p>
      )}
    </div>
  );
}
