import { useState } from "react";
import { useClimateIndices } from "../../hooks/useClimateIndices";
import { useSstHistory } from "../../hooks/useSstHistory";
import { nearestSeaZone } from "../../data/sea-zones";
import TrendSparkline from "../Map/TrendSparkline";
import {
  BASELINE_FROM,
  BASELINE_TO,
  HOT_DAY_C,
  TROPICAL_NIGHT_C,
  baselineMean,
  linearTrend,
  mean,
  perDecade,
  vaporCapacityFactor,
  type YearIndices,
} from "../../utils/correlations";

interface ClimateCorrelationsProps {
  lat: number;
  lng: number;
}

/** Quanti anni finali contano come "oggi" nel confronto con la baseline. */
const RECENT_YEARS = 10;

/**
 * La serie SST precalcolata parte dal 1982 (limite del prodotto Copernicus),
 * quindi il trentennio WMO 1961-1990 non è coperto: per il mare la baseline è
 * il primo trentennio disponibile. Sono due riferimenti diversi e vanno scritti
 * a schermo, non nascosti dietro la parola "normale".
 */
const SST_BASELINE_FROM = 1982;
const SST_BASELINE_TO = 2011;

interface Metric {
  label: string;
  unit: string;
  decimals: number;
  value: (y: YearIndices) => number;
}

const METRICS: Metric[] = [
  { label: `Giorni con massima ≥ ${HOT_DAY_C} °C`, unit: " g/anno", decimals: 1, value: (y) => y.hotDays },
  {
    label: `Notti tropicali (minima ≥ ${TROPICAL_NIGHT_C} °C)`,
    unit: " n/anno",
    decimals: 1,
    value: (y) => y.tropicalNights,
  },
  { label: "Pioggia massima in un giorno", unit: " mm", decimals: 1, value: (y) => y.maxDailyRainMm },
  { label: "Periodo secco più lungo", unit: " g", decimals: 1, value: (y) => y.longestDrySpell },
];

function formatDelta(delta: number, decimals: number, unit: string): string {
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(decimals)}${unit}`;
}

function MetricRow({ metric, indices }: { metric: Metric; indices: YearIndices[] }) {
  const points = indices.map((y) => ({ x: y.year, y: metric.value(y) }));
  const trend = linearTrend(points);
  const base = baselineMean(
    indices.map((y) => ({ year: y.year, value: metric.value(y) })),
    BASELINE_FROM,
    BASELINE_TO,
  );
  const recent = mean(points.slice(-RECENT_YEARS).map((p) => p.y));
  if (trend == null || recent == null) return null;

  const delta = base == null ? null : recent - base;
  const slope = perDecade(trend);

  return (
    <div className="correlations__metric">
      <div className="correlations__metric-head">
        <span className="correlations__metric-label">{metric.label}</span>
        <span className={slope >= 0 ? "historical-comparison__delta--up" : "historical-comparison__delta--down"}>
          {formatDelta(slope, metric.decimals, metric.unit)} per decennio
        </span>
      </div>
      <TrendSparkline data={points} ariaLabel={`Andamento annuale: ${metric.label}`} />
      <p className="correlations__metric-note">
        Ultimi {RECENT_YEARS} anni: <strong>{recent.toFixed(metric.decimals)}</strong>
        {metric.unit}
        {delta != null && (
          <>
            {" "}
            contro {(recent - delta).toFixed(metric.decimals)}
            {metric.unit} nel {BASELINE_FROM}-{BASELINE_TO} ({formatDelta(delta, metric.decimals, metric.unit)})
          </>
        )}
        . Variabilità spiegata dalla retta: {(trend.r2 * 100).toFixed(0)}% su {trend.n} anni
        {trend.r2 < 0.2 && " — poca, i singoli anni oscillano molto più della tendenza"}.
      </p>
    </div>
  );
}

function SeaFuel({ lat, lng }: ClimateCorrelationsProps) {
  const zone = nearestSeaZone(lat, lng);
  const history = useSstHistory(zone.id);
  const valid = history.filter((h): h is { year: number; avgTemp: number } => h.avgTemp != null);

  const base = baselineMean(
    valid.map((h) => ({ year: h.year, value: h.avgTemp })),
    SST_BASELINE_FROM,
    SST_BASELINE_TO,
  );
  const recent = mean(valid.slice(-RECENT_YEARS).map((h) => h.avgTemp));
  if (base == null || recent == null) return null;

  const anomaly = recent - base;
  const factor = vaporCapacityFactor(anomaly);

  return (
    <div className="correlations__metric">
      <div className="correlations__metric-head">
        <span className="correlations__metric-label">Mare più caldo — {zone.name}</span>
        <span className={anomaly >= 0 ? "historical-comparison__delta--up" : "historical-comparison__delta--down"}>
          {formatDelta(anomaly, 2, " °C")}
        </span>
      </div>
      <TrendSparkline
        data={history.map((h) => ({ x: h.year, y: h.avgTemp }))}
        ariaLabel={`Temperatura estiva del mare, zona ${zone.name}`}
      />
      <p className="correlations__metric-note">
        La stagione calda (mag-set) del mare è a <strong>{recent.toFixed(2)} °C</strong> negli ultimi{" "}
        {RECENT_YEARS} anni, contro {base.toFixed(2)} °C nel {SST_BASELINE_FROM}-{SST_BASELINE_TO}. Per la
        relazione di Clausius-Clapeyron (~+7% di vapore acqueo per °C), l'aria sopra quel mare può
        trattenere circa <strong>+{((factor - 1) * 100).toFixed(0)}%</strong> di umidità.
      </p>
      <p className="correlations__caveat">
        È <em>capacità</em>, non pioggia: dice quanta umidità e quanta energia sono disponibili per un
        temporale, non quanta ne cadrà. Sul Mediterraneo l'intensificazione oraria osservata dei nubifragi
        è spesso superiore a questo valore, che quindi è semmai un limite inferiore.
      </p>
    </div>
  );
}

/**
 * Tendenze climatiche locali e "carburante" marino disponibile.
 *
 * Volutamente **non** dice che il riscaldamento causa il singolo nubifragio o il
 * singolo incendio: l'attribuzione causale di un evento richiede un ensemble di
 * simulazioni controfattuali, che qui non c'è. Il caveat in fondo non è un
 * disclaimer legale da ignorare, è la descrizione onesta di cosa mostra il
 * pannello.
 *
 * Il contenuto è dietro un `<details>` chiuso: la serie giornaliera dal 1961 è
 * ~136 kB e non ha senso scaricarla per chi apre la scheda di una città e la
 * chiude subito. Il fetch parte solo all'apertura.
 */
export default function ClimateCorrelations({ lat, lng }: ClimateCorrelationsProps) {
  const [open, setOpen] = useState(false);
  const { indices, loading, error } = useClimateIndices(open ? { lat, lng } : null);

  return (
    <details className="correlations" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Tendenze e correlazioni</summary>

      {loading && <p className="weather-live__status">Caricamento della serie storica dal {BASELINE_FROM}…</p>}
      {error && <p className="weather-live__status">Serie storica non disponibile al momento.</p>}

      {!loading && !error && indices.length > 0 && (
        <>
          {METRICS.map((metric) => (
            <MetricRow key={metric.label} metric={metric} indices={indices} />
          ))}
          <SeaFuel lat={lat} lng={lng} />
          <p className="correlations__caveat">
            <strong>Queste sono tendenze e coincidenze temporali, non rapporti di causa-effetto.</strong> Dire
            che il riscaldamento ha causato un singolo nubifragio o un singolo incendio richiede un ensemble di
            simulazioni controfattuali (il metodo usato da World Weather Attribution), che questo sito non fa e
            non può fare. Quello che si vede qui è che alcune grandezze si stanno spostando, e in che direzione.
          </p>
          <p className="weather-live__source">
            Indici calcolati da Open-Meteo archive (rianalisi ERA5): stime a griglia, non osservazioni da
            stazione. Temperatura del mare da Copernicus Marine, serie precalcolata dal 1982.
          </p>
        </>
      )}
    </details>
  );
}
