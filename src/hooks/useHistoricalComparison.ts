import { useEffect, useState } from "react";

export interface DecadeStats {
  avgSummerMax: number;
  hotDaysPerYear: number; // giorni/anno con massima > 32°C
}

interface HistoricalComparisonState {
  past: DecadeStats | null;
  recent: DecadeStats | null;
  pastLabel: string;
  recentLabel: string;
  loading: boolean;
  error: string | null;
}

const PAST_START = 1990;
const PAST_END = 1999;

function recentDecadeRange(): { start: number; end: number } {
  const end = new Date().getUTCFullYear() - 1; // ultimo anno completo
  return { start: end - 9, end };
}

async function fetchSummerStats(lat: number, lng: number, startYear: number, endYear: number): Promise<DecadeStats> {
  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}` +
    `&start_date=${startYear}-01-01&end_date=${endYear}-12-31` +
    `&daily=temperature_2m_max&timezone=Europe%2FRome`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Errore nel recupero dei dati storici");
  const json = await res.json();

  const dates: string[] = json.daily.time;
  const maxes: number[] = json.daily.temperature_2m_max;

  const summerMaxes = dates
    .map((date, i) => ({ month: Number(date.slice(5, 7)), value: maxes[i] }))
    .filter((d) => d.month >= 6 && d.month <= 8 && d.value != null);

  const avgSummerMax = summerMaxes.reduce((s, d) => s + d.value, 0) / summerMaxes.length;
  const hotDaysTotal = summerMaxes.filter((d) => d.value > 32).length;
  const years = endYear - startYear + 1;

  return { avgSummerMax, hotDaysPerYear: hotDaysTotal / years };
}

/**
 * Confronta la temperatura massima estiva (giu-ago) media tra il decennio
 * 1990-1999 e l'ultimo decennio completo, usando la reanalisi ERA5/ERA5-Land
 * servita da Open-Meteo. Sono dati modellistici a griglia, non osservazioni
 * dirette da stazione — coerenti nel confronto tra periodi, non un valore
 * "misurato" puntuale.
 */
export function useHistoricalComparison(lat: number, lng: number): HistoricalComparisonState {
  const [state, setState] = useState<HistoricalComparisonState>(() => {
    const { start, end } = recentDecadeRange();
    return {
      past: null,
      recent: null,
      pastLabel: `${PAST_START}–${PAST_END}`,
      recentLabel: `${start}–${end}`,
      loading: true,
      error: null,
    };
  });

  useEffect(() => {
    let cancelled = false;
    const { start: recentStart, end: recentEnd } = recentDecadeRange();

    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.all([
      fetchSummerStats(lat, lng, PAST_START, PAST_END),
      fetchSummerStats(lat, lng, recentStart, recentEnd),
    ])
      .then(([past, recent]) => {
        if (cancelled) return;
        setState({
          past,
          recent,
          pastLabel: `${PAST_START}–${PAST_END}`,
          recentLabel: `${recentStart}–${recentEnd}`,
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: err.message }));
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return state;
}
