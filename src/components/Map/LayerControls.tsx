import { useEffect, useRef, useState } from "react";
import { layerMinZoom, sentinelHubAvailable, type SatelliteLayerId } from "../../utils/satellite-layers";
import { useSeasonalTrend, seasonCutoffMonthDay } from "../../hooks/useSeasonalTrend";
import { useMarineTrend, MARINE_MIN_YEAR } from "../../hooks/useMarineTrend";
import TrendSparkline from "./TrendSparkline";
import "./LayerControls.css";

/** "heat" = tab Calore (aria, dal 2016), "sea" = tab Acqua (mare, dal 2023), "none" = altri tab. */
export type CompareMode = "none" | "heat" | "sea";

interface LayerControlsProps {
  layer: SatelliteLayerId;
  onLayerChange: (layer: SatelliteLayerId) => void;
  date: string;
  onDateChange: (date: string) => void;
  compareMode: CompareMode;
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
const LAND_POINTS = [
  { lat: 45.4642, lng: 9.19 }, // Milano
  { lat: 44.4949, lng: 11.3426 }, // Bologna
  { lat: 41.9028, lng: 12.4964 }, // Roma
  { lat: 40.8518, lng: 14.2681 }, // Napoli
  { lat: 37.5079, lng: 15.083 }, // Catania
];

// Quattro punti in mare aperto (verificati con l'API: servono coordinate
// abbastanza al largo, altrimenti il modello marino restituisce null perché
// il punto cade su una cella "terra").
const SEA_POINTS = [
  { lat: 40.0, lng: 13.5 }, // Tirreno
  { lat: 38.5, lng: 17.5 }, // Ionio
  { lat: 43.8, lng: 9.2 }, // Ligure
  { lat: 40.0, lng: 8.0 }, // Sardegna ovest
];

function todayMinus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Sentinel-2 (10m) e Sentinel-3 (LST) coprono davvero dal 2016 in poi — prima
// i satelliti non c'erano ancora o non avevano copertura globale operativa.
const HEAT_MIN_YEAR = 2016;
const CURRENT_YEAR = new Date().getFullYear();
const SLIDER_COMMIT_DELAY_MS = 300;

/**
 * Il numero/grafico derivano da dati già scaricati (lookup locale, gratis),
 * ma cambiare `date` ricarica il layer satellitare dalla rete (rimonta il
 * Source in SatelliteOverlay) — quello resta debounced, solo dopo una pausa
 * nel trascinamento.
 *
 * Lo slider stesso è `step` frazionario (non 1): con soli 10-11 valori
 * interi su una barra stretta, ogni "tick" intero corrisponde a diversi
 * pixel di trascinamento — un piccolo movimento del mouse/trackpad non
 * sposta nulla finché non si supera quella soglia, e sembra "duro". Con uno
 * step fine il pallino segue il dito pixel per pixel; l'anno mostrato è
 * comunque l'intero più vicino (arrotondato), i dati restano annuali.
 */
const SLIDER_STEP = 0.02;

function useDebouncedYear(externalYear: number, onCommit: (year: number) => void) {
  const [rawValue, setRawValue] = useState(externalYear);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setRawValue(externalYear);
  }, [externalYear]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const displayYear = Math.round(rawValue);

  function onSlide(value: number) {
    setRawValue(value);
    const rounded = Math.round(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onCommit(rounded), SLIDER_COMMIT_DELAY_MS);
  }

  return { rawValue, displayYear, onSlide };
}

interface YearCompareProps {
  year: number;
  onYearChange: (year: number) => void;
}

function YearCompare({ year, onYearChange }: YearCompareProps) {
  const { rawValue, displayYear, onSlide } = useDebouncedYear(year, onYearChange);
  const { data, loading } = useSeasonalTrend(LAND_POINTS, HEAT_MIN_YEAR, CURRENT_YEAR);
  const current = data.find((d) => d.year === displayYear)?.avgTemp ?? null;
  const baseline = data.find((d) => d.year === HEAT_MIN_YEAR)?.avgTemp ?? null;
  const delta = current != null && baseline != null ? current - baseline : null;

  return (
    <>
      <label className="layer-controls__label" htmlFor="layer-year">
        Estate {displayYear} — media Milano/Bologna/Roma/Napoli/Catania (1 giu → {seasonCutoffMonthDay()})
      </label>
      <input
        id="layer-year"
        type="range"
        min={HEAT_MIN_YEAR}
        max={CURRENT_YEAR}
        step={SLIDER_STEP}
        value={rawValue}
        onChange={(e) => onSlide(Number(e.target.value))}
      />
      <div className="layer-controls__temp">
        {loading ? (
          "Calcolo su 5 città…"
        ) : current != null ? (
          <>
            <strong>{current.toFixed(1)}°C</strong>
            {delta != null && displayYear !== HEAT_MIN_YEAR && (
              <span className={delta >= 0 ? "layer-controls__delta--up" : "layer-controls__delta--down"}>
                {" "}
                ({delta >= 0 ? "+" : ""}
                {delta.toFixed(1)}°C vs {HEAT_MIN_YEAR})
              </span>
            )}
          </>
        ) : (
          "Dato non disponibile"
        )}
      </div>
      <TrendSparkline data={data} selectedYear={displayYear} />
    </>
  );
}

function SeaCompare({ year, onYearChange }: YearCompareProps) {
  const { rawValue, displayYear, onSlide } = useDebouncedYear(Math.max(year, MARINE_MIN_YEAR), onYearChange);
  const { data, loading } = useMarineTrend(SEA_POINTS, MARINE_MIN_YEAR, CURRENT_YEAR);
  const current = data.find((d) => d.year === displayYear)?.avgTemp ?? null;
  const baseline = data.find((d) => d.year === MARINE_MIN_YEAR)?.avgTemp ?? null;
  const delta = current != null && baseline != null ? current - baseline : null;

  return (
    <>
      <label className="layer-controls__label" htmlFor="layer-year">
        Estate {displayYear} — media Tirreno/Ionio/Ligure/Sardegna (1 giu → {seasonCutoffMonthDay()})
      </label>
      <input
        id="layer-year"
        type="range"
        min={MARINE_MIN_YEAR}
        max={CURRENT_YEAR}
        step={SLIDER_STEP}
        value={rawValue}
        onChange={(e) => onSlide(Number(e.target.value))}
      />
      <div className="layer-controls__temp">
        {loading ? (
          "Calcolo su 4 punti mare…"
        ) : current != null ? (
          <>
            <strong>{current.toFixed(1)}°C</strong>
            {delta != null && displayYear !== MARINE_MIN_YEAR && (
              <span className={delta >= 0 ? "layer-controls__delta--up" : "layer-controls__delta--down"}>
                {" "}
                ({delta >= 0 ? "+" : ""}
                {delta.toFixed(1)}°C vs {MARINE_MIN_YEAR})
              </span>
            )}
          </>
        ) : (
          "Dato non disponibile"
        )}
      </div>
      <TrendSparkline data={data} selectedYear={displayYear} />
      <p className="layer-controls__hint">
        L'archivio storico del mare parte da fine {MARINE_MIN_YEAR - 1} (verificato) — solo poche
        estati, non un trend decennale come per l'aria. Il layer NDWI sulla mappa non cambia aspetto
        tra un anno e l'altro: indica "c'è acqua", non la sua temperatura — il mare è acqua in ogni
        anno. Il numero qui sopra è l'unico indicatore del riscaldamento.
      </p>
    </>
  );
}

export default function LayerControls({ layer, onLayerChange, date, onDateChange, compareMode }: LayerControlsProps) {
  const minZoom = layerMinZoom(layer);
  const minYear = compareMode === "sea" ? MARINE_MIN_YEAR : HEAT_MIN_YEAR;
  const year = Math.min(Math.max(Number(date.slice(0, 4)) || CURRENT_YEAR, minYear), CURRENT_YEAR);

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
        (compareMode === "heat" ? (
          <YearCompare year={year} onYearChange={(y) => onDateChange(`${y}-07-15`)} />
        ) : compareMode === "sea" ? (
          <SeaCompare year={year} onYearChange={(y) => onDateChange(`${y}-07-15`)} />
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
