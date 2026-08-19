import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { layerMinZoom, sentinelHubAvailable, type SatelliteLayerId } from "../../utils/satellite-layers";
import { useSeasonalTrend, seasonCutoffMonthDay } from "../../hooks/useSeasonalTrend";
import { useSstHistory, SST_HISTORY_FIRST_YEAR, SST_HISTORY_LAST_YEAR } from "../../hooks/useSstHistory";
import { nearestSeaZone } from "../../data/sea-zones";
import { SST_MIN_YEAR, SST_SCALE_C, SST_SCALE_STOPS } from "../../utils/marine-layers";
import { GLACIER_EPOCHS, hasGlaciersNearby, type GlacierEpoch } from "../../utils/glacier-layers";
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
  mapCenter: { lat: number; lng: number };
  glacierEpoch: GlacierEpoch | null;
  onGlacierEpochChange: (epoch: GlacierEpoch | null) => void;
}

// Chiave i18n (layerControls.options.*) per ciascun id — le label vere si
// costruiscono dentro il componente via t(), qui serve solo l'ordine fisso.
const SENTINEL_OPTION_IDS: { id: SatelliteLayerId; key: string }[] = [
  { id: "s2-true-color", key: "s2TrueColor" },
  { id: "s2-ndvi", key: "s2Ndvi" },
  { id: "s2-ndwi", key: "s2Ndwi" },
  { id: "s2-swir", key: "s2Swir" },
  { id: "s2-nbr", key: "s2Nbr" },
  { id: "s3-lst", key: "s3Lst" },
  { id: "landsat-thermal", key: "landsatThermal" },
  { id: "s5p-so2", key: "s5pSo2" },
  { id: "s5p-aer-ai", key: "s5pAer" },
  { id: "s1-backscatter", key: "s1Backscatter" },
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
      <TrendSparkline
        data={data.map((d) => ({ x: d.year, y: d.avgTemp }))}
        highlightX={displayYear}
        ariaLabel={`Andamento della temperatura media stagionale dal ${HEAT_MIN_YEAR} al ${CURRENT_YEAR}`}
      />
    </>
  );
}

/**
 * Barra della scala colore del layer SST. Senza questa il layer è solo "mare
 * colorato": i colori provengono dalla colormap ufficiale del dataset, quindi
 * la scala va mostrata con gli stessi estremi, non reinventata.
 */
function SstLegend() {
  return (
    <div className="layer-controls__legend">
      <div
        className="layer-controls__legend-bar"
        style={{ background: `linear-gradient(to right, ${SST_SCALE_STOPS.join(", ")})` }}
      />
      <div className="layer-controls__legend-scale">
        <span>{SST_SCALE_C.min}°C</span>
        <span>temperatura superficie mare</span>
        <span>{SST_SCALE_C.max}°C</span>
      </div>
    </div>
  );
}

interface SeaCompareProps extends YearCompareProps {
  mapCenter: { lat: number; lng: number };
  /** Inizio dello slider: 1982 col layer SST (la mappa arriva fin lì), 2023 con gli altri. */
  minYear: number;
}

function SeaCompare({ year, onYearChange, mapCenter, minYear }: SeaCompareProps) {
  const { rawValue, displayYear, onSlide } = useDebouncedYear(Math.max(year, minYear), onYearChange);
  const zone = useMemo(() => nearestSeaZone(mapCenter.lat, mapCenter.lng), [mapCenter.lat, mapCenter.lng]);
  // Serie precalcolata, nessuna richiesta: il grafico è pieno da subito.
  const data = useSstHistory(zone.id);
  // Serve solo per legenda e testo: lo slider ora parte dal 1982 comunque.
  const sstActive = minYear === SST_MIN_YEAR;
  const loading = false;
  const current = data.find((d) => d.year === displayYear)?.avgTemp ?? null;
  const baseline = data.find((d) => d.year === SST_HISTORY_FIRST_YEAR)?.avgTemp ?? null;
  const delta = current != null && baseline != null ? current - baseline : null;

  return (
    <>
      <label className="layer-controls__label" htmlFor="layer-year">
        Stagione calda {displayYear} — mare {zone.name} (mag → set)
      </label>
      <input
        id="layer-year"
        type="range"
        min={minYear}
        max={CURRENT_YEAR}
        step={SLIDER_STEP}
        value={rawValue}
        onChange={(e) => onSlide(Number(e.target.value))}
      />
      <div className="layer-controls__temp">
        {loading ? (
          `Calcolo mare ${zone.name}…`
        ) : current != null ? (
          <>
            <strong>{current.toFixed(1)}°C</strong>
            {delta != null && displayYear !== SST_HISTORY_FIRST_YEAR && (
              <span className={delta >= 0 ? "layer-controls__delta--up" : "layer-controls__delta--down"}>
                {" "}
                ({delta >= 0 ? "+" : ""}
                {delta.toFixed(1)}°C vs {SST_HISTORY_FIRST_YEAR})
              </span>
            )}
          </>
        ) : displayYear > SST_HISTORY_LAST_YEAR ? (
          `Stagione ${displayYear} non ancora completa`
        ) : (
          "Dato non disponibile"
        )}
      </div>
      <TrendSparkline
        data={data.map((d) => ({ x: d.year, y: d.avgTemp }))}
        highlightX={displayYear}
        ariaLabel={`Andamento della temperatura media stagionale del mare ${zone.name} dal ${SST_HISTORY_FIRST_YEAR} al ${SST_HISTORY_LAST_YEAR}`}
      />
      {sstActive && <SstLegend />}
      <p className="layer-controls__hint">
        Zona scelta in base a dove stai guardando sulla mappa — spostati per vedere un'altra costa.
        Numero e grafico sono medie da maggio a settembre, calcolate su{" "}
        {SST_HISTORY_FIRST_YEAR}–{SST_HISTORY_LAST_YEAR} dai dati Copernicus Marine. La mappa mostra
        il 20 settembre, il giorno che meglio rappresenta quella media.
        {sstActive
          ? " La mappa colorata segue lo stesso anno: trascina lo slider e guarda il bacino cambiare."
          : " Scegli il layer temperatura del mare per vedere lo stesso dato sulla mappa."}
      </p>
    </>
  );
}

/**
 * Contorni dei ghiacciai, con la loro epoca. Separato dal menu dei layer
 * satellitari perché non è un'alternativa a quelli: serve *insieme* a
 * un'immagine recente, ed è lì che si vede il ritiro.
 */
function GlacierControls({
  epoch,
  onChange,
}: {
  epoch: GlacierEpoch | null;
  onChange: (epoch: GlacierEpoch | null) => void;
}) {
  return (
    <>
      <label className="layer-controls__label" htmlFor="glacier-select">
        Contorni ghiacciai (GLIMS)
      </label>
      <select
        id="glacier-select"
        value={epoch ?? "none"}
        onChange={(e) => onChange(e.target.value === "none" ? null : (e.target.value as GlacierEpoch))}
      >
        <option value="none">Nessuno</option>
        {/* Il confronto per primo: è la modalità che mostra il ritiro. Le
            singole epoche restano per chi vuole guardarne una sola. */}
        <option value="compare">
          Confronto {GLACIER_EPOCHS.historic.label} vs {GLACIER_EPOCHS.recent.label}
        </option>
        {(["historic", "recent"] as const).map((id) => (
          <option key={id} value={id}>
            Solo rilievi {GLACIER_EPOCHS[id].label}
          </option>
        ))}
      </select>
      {epoch === "compare" && (
        <div className="layer-controls__legend">
          <div className="layer-controls__legend-scale">
            <span style={{ color: "#4ade80" }}>■ {GLACIER_EPOCHS.historic.label}</span>
            <span style={{ color: "#ec4899" }}>■ {GLACIER_EPOCHS.recent.label}</span>
          </div>
        </div>
      )}
      {epoch && (
        <p className="layer-controls__hint">
          {epoch === "compare"
            ? "Il bordo colorato che spunta da sotto è ghiaccio che c'era e non c'è più. "
            : ""}
          Perimetro dei ghiacciai al momento del rilievo. Attiva sotto un layer satellitare recente
          (es. colori reali) e zooma sulle Alpi: il ghiaccio di oggi sta dentro il contorno di allora,
          ed è quello lo scioglimento. Niente aree in km² qui: GLIMS raccoglie rilievi di gruppi
          diversi, a volte discordi tra loro per lo stesso ghiacciaio e lo stesso anno — per i numeri
          la fonte sono WGMS e il Catasto dei Ghiacciai Italiani.
        </p>
      )}
    </>
  );
}

export default function LayerControls({
  layer,
  onLayerChange,
  date,
  onDateChange,
  compareMode,
  mapCenter,
  glacierEpoch,
  onGlacierEpochChange,
}: LayerControlsProps) {
  const { t } = useTranslation();
  const minZoom = layerMinZoom(layer);
  const minYear =
    compareMode === "sea" || layer === "sst-med" ? SST_MIN_YEAR : HEAT_MIN_YEAR;
  const year = Math.min(Math.max(Number(date.slice(0, 4)) || CURRENT_YEAR, minYear), CURRENT_YEAR);
  const [collapsed, setCollapsed] = useState(false);
  const nearGlaciers = hasGlaciersNearby(mapCenter.lat, mapCenter.lng);

  // Allontanandosi dalle zone glaciali il comando sparisce: se restasse acceso
  // resterebbe un layer invisibile e non più spegnibile.
  useEffect(() => {
    if (!nearGlaciers && glacierEpoch) onGlacierEpochChange(null);
  }, [nearGlaciers, glacierEpoch, onGlacierEpochChange]);
  const sentinelOptions = SENTINEL_OPTION_IDS.map((opt) => ({
    id: opt.id,
    label: t(`layerControls.options.${opt.key}`),
  }));

  return (
    <div className="layer-controls">
      <div className="layer-controls__header">
        <label className="layer-controls__label" htmlFor="layer-select">
          {t("layerControls.label")}
        </label>
        <button
          type="button"
          className="layer-controls__collapse"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Espandi pannello layer" : "Riduci pannello layer"}
        >
          {collapsed ? "▸" : "▾"}
        </button>
      </div>
      <select
        id="layer-select"
        value={layer}
        onChange={(e) => onLayerChange(e.target.value as SatelliteLayerId)}
      >
        <option value="none">{t("layerControls.baseMapOnly")}</option>
        {sentinelHubAvailable &&
          sentinelOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        {/* Fuori dal gate Sentinel Hub: il WMTS Copernicus Marine è pubblico,
            quindi questo layer c'è anche in un deployment senza chiavi. */}
        <option value="sst-med">{t("layerControls.options.sstMed")}</option>
      </select>
      {!collapsed && (
        <>
          {layer !== "none" &&
            (compareMode === "heat" ? (
              <YearCompare year={year} onYearChange={(y) => onDateChange(`${y}-07-15`)} />
            ) : compareMode === "sea" ? (
              <SeaCompare
                year={year}
                // 20 settembre e non metà luglio: la mappa mostra un giorno
                // solo, il numero accanto è la media di maggio-settembre, e
                // devono raccontare la stessa cosa. Misurando lo scarto di
                // ogni giorno campionato dalla media della sua stagione, il
                // 20 settembre è il più vicino (0,8 °C contro i 2-4 °C di
                // metà luglio): la curva sale fino ad agosto e poi scende,
                // quindi incrocia la propria media in discesa proprio lì.
                onYearChange={(y) => onDateChange(`${y}-09-20`)}
                mapCenter={mapCenter}
                minYear={minYear}
              />
            ) : (
              <>
                <label className="layer-controls__label" htmlFor="layer-date">
                  {t("layerControls.dateLabel")}
                </label>
                <input
                  id="layer-date"
                  type="date"
                  value={date}
                  // Il prodotto riprocessato CMEMS è indietro di circa un mese
                  // rispetto a oggi, e in compenso arriva fino al 1982.
                  min={layer === "sst-med" ? `${SST_MIN_YEAR}-01-01` : undefined}
                  max={layer === "sst-med" ? todayMinus(40) : todayMinus(2)}
                  onChange={(e) => onDateChange(e.target.value)}
                />
                {layer === "sst-med" && <SstLegend />}
              </>
            ))}
          {nearGlaciers && <GlacierControls epoch={glacierEpoch} onChange={onGlacierEpochChange} />}
          {minZoom != null && <p className="layer-controls__hint">{t("layerControls.zoomHint")}</p>}
          {layer === "landsat-thermal" && (
            <p className="layer-controls__hint">{t("layerControls.landsatHint")}</p>
          )}
          {(layer === "s5p-so2" || layer === "s5p-aer-ai") && (
            <p className="layer-controls__hint">{t("layerControls.s5pHint")}</p>
          )}
          {layer === "s1-backscatter" && <p className="layer-controls__hint">{t("layerControls.s1Hint")}</p>}
        </>
      )}
    </div>
  );
}
