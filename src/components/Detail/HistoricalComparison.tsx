import { useHistoricalComparison } from "../../hooks/useHistoricalComparison";

interface HistoricalComparisonProps {
  lat: number;
  lng: number;
}

export default function HistoricalComparison({ lat, lng }: HistoricalComparisonProps) {
  const { past, recent, pastLabel, recentLabel, loading, error } = useHistoricalComparison(lat, lng);

  if (loading) return <p className="weather-live__status">Caricamento serie storica…</p>;
  if (error || !past || !recent)
    return <p className="weather-live__status">Dati storici non disponibili al momento.</p>;

  const deltaMax = recent.avgSummerMax - past.avgSummerMax;
  const deltaHotDays = recent.hotDaysPerYear - past.hotDaysPerYear;

  return (
    <div className="historical-comparison">
      <dl className="historical-comparison__grid">
        <div>
          <dt>Massima media estiva {pastLabel}</dt>
          <dd>{past.avgSummerMax.toFixed(1)}°C</dd>
        </div>
        <div>
          <dt>Massima media estiva {recentLabel}</dt>
          <dd>
            {recent.avgSummerMax.toFixed(1)}°C
            <span className={deltaMax >= 0 ? "historical-comparison__delta--up" : "historical-comparison__delta--down"}>
              {" "}
              ({deltaMax >= 0 ? "+" : ""}
              {deltaMax.toFixed(1)}°C)
            </span>
          </dd>
        </div>
        <div>
          <dt>Giorni &gt;32°C/anno, {pastLabel}</dt>
          <dd>{past.hotDaysPerYear.toFixed(0)}</dd>
        </div>
        <div>
          <dt>Giorni &gt;32°C/anno, {recentLabel}</dt>
          <dd>
            {recent.hotDaysPerYear.toFixed(0)}
            <span className={deltaHotDays >= 0 ? "historical-comparison__delta--up" : "historical-comparison__delta--down"}>
              {" "}
              ({deltaHotDays >= 0 ? "+" : ""}
              {deltaHotDays.toFixed(0)})
            </span>
          </dd>
        </div>
      </dl>
      <p className="weather-live__source">
        Dati: Open-Meteo (reanalisi ERA5/ERA5-Land) — stime a griglia, non osservazioni da
        stazione. Il confronto tra i due periodi è la parte affidabile del dato, più del singolo
        valore assoluto.
      </p>
    </div>
  );
}
