import { useEffect, useState } from "react";
import { BASELINE_FROM, yearlyIndices, type DailySeries, type YearIndices } from "../utils/correlations";
import type { GeoPoint } from "./useSeasonalTrend";

interface ClimateIndicesState {
  indices: YearIndices[];
  loading: boolean;
  error: string | null;
}

/**
 * Cache in memoria per punto, per tutta la vita della pagina.
 *
 * Una serie giornaliera dal 1961 è ~136 kB gzip: si scarica una volta sola per
 * città e riaprire il pannello, o tornare su una città già vista, non ripete la
 * richiesta. Sta qui e non in un context perché è dato immutabile (archivio
 * storico), non stato dell'applicazione.
 */
const cache = new Map<string, YearIndices[]>();
const inFlight = new Map<string, Promise<YearIndices[]>>();

/** Ultimo anno solare **completo**: gli anni parziali li scarta già `yearlyIndices`, ma non ha senso scaricarli. */
function lastCompleteYear(): number {
  return new Date().getFullYear() - 1;
}

async function fetchIndices(point: GeoPoint, fromYear: number): Promise<YearIndices[]> {
  // Una sola richiesta per tutto il periodo, non una per anno: l'archivio
  // accetta un intervallo pluridecennale in un colpo solo (verificato: 65 anni,
  // ~1,7 s, zero buchi). Il loop per anno di `useSeasonalTrend` esiste perché lì
  // serve una finestra stagionale diversa in ogni anno, qui no.
  const res = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${point.lat}&longitude=${point.lng}` +
      `&start_date=${fromYear}-01-01&end_date=${lastCompleteYear()}-12-31` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FRome`,
  );
  if (!res.ok) throw new Error(`archive-api ${res.status}`);
  const json = await res.json();
  const series: DailySeries = {
    time: json?.daily?.time ?? [],
    tmax: json?.daily?.temperature_2m_max ?? [],
    tmin: json?.daily?.temperature_2m_min ?? [],
    precipMm: json?.daily?.precipitation_sum ?? [],
  };
  if (!series.time.length) throw new Error("archive-api: serie vuota");
  return yearlyIndices(series);
}

/**
 * Indici climatici annuali per un punto, da Open-Meteo archive (rianalisi ERA5).
 *
 * Gratis e senza chiave, come il resto delle fonti del progetto. Parte dal 1961
 * per coprire il trentennio di baseline WMO: senza quello le anomalie non hanno
 * un riferimento e si può solo mostrare una pendenza.
 */
export function useClimateIndices(point: GeoPoint | null, fromYear = BASELINE_FROM): ClimateIndicesState {
  const [state, setState] = useState<ClimateIndicesState>({ indices: [], loading: false, error: null });
  const key = point ? `${point.lat},${point.lng}@${fromYear}` : null;

  useEffect(() => {
    if (!point || !key) {
      setState({ indices: [], loading: false, error: null });
      return;
    }

    const cached = cache.get(key);
    if (cached) {
      setState({ indices: cached, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState({ indices: [], loading: true, error: null });

    // Deduplica le richieste in volo: due componenti montati sullo stesso punto
    // (o uno smontato e rimontato subito) non devono scaricare due volte 136 kB.
    let promise = inFlight.get(key);
    if (!promise) {
      promise = fetchIndices(point, fromYear).finally(() => inFlight.delete(key));
      inFlight.set(key, promise);
    }

    promise
      .then((indices) => {
        cache.set(key, indices);
        if (!cancelled) setState({ indices, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ indices: [], loading: false, error: err instanceof Error ? err.message : "errore" });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
