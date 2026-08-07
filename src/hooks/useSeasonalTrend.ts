import { useEffect, useState } from "react";

export interface YearTemp {
  year: number;
  avgTemp: number | null;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

interface SeasonalTrendState {
  data: YearTemp[];
  loading: boolean;
}

/**
 * "MM-DD" del taglio stagionale, uguale per ogni anno: oggi se siamo ancora
 * dentro l'estate, altrimenti 31 agosto. Fondamentale che sia lo STESSO
 * taglio per ogni anno confrontato — altrimenti si confronta un'estate
 * intera con una parziale, un confronto falsato, non un trend vero.
 */
export function seasonCutoffMonthDay(): string {
  const now = new Date();
  const aug31 = new Date(now.getFullYear(), 7, 31);
  const cutoff = now < aug31 ? now : aug31;
  const mm = String(cutoff.getMonth() + 1).padStart(2, "0");
  const dd = String(cutoff.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPointYearAvg(point: GeoPoint, year: number, cutoff: string): Promise<number | null> {
  const res = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${point.lat}&longitude=${point.lng}` +
      `&start_date=${year}-06-01&end_date=${year}-${cutoff}` +
      `&daily=temperature_2m_mean&timezone=Europe%2FRome`,
  );
  if (!res.ok) return null;
  const json = await res.json();
  const values: (number | null)[] = json?.daily?.temperature_2m_mean ?? [];
  const nums = values.filter((v): v is number => typeof v === "number");
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

/**
 * Media di una manciata di città sparse per l'Italia (Nord/Centro/Sud), non
 * di un punto solo — un singolo punto non rappresenta "l'Italia". Le città
 * di uno stesso anno vanno in PARALLELO (verificato: fino a 5 richieste
 * simultanee non fanno scattare il rate limit di Open-Meteo, anche ripetuto
 * per 11 anni di fila — 11 concorrenti invece lo fanno scattare, HTTP 429).
 * Gli anni restano in sequenza tra loro, con una piccola pausa, per lo
 * stesso motivo. ~5s la prima volta invece di ~20s.
 */
export function useSeasonalTrend(points: GeoPoint[], minYear: number, maxYear: number): SeasonalTrendState {
  const [state, setState] = useState<SeasonalTrendState>({ data: [], loading: true });
  const pointsKey = points.map((p) => `${p.lat},${p.lng}`).join("|");

  useEffect(() => {
    let cancelled = false;
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    setState({ data: years.map((year) => ({ year, avgTemp: null })), loading: true });

    const cutoff = seasonCutoffMonthDay();

    (async () => {
      for (const year of years) {
        if (cancelled) return;
        const cityAvgs = await Promise.all(
          points.map((point) => fetchPointYearAvg(point, year, cutoff).catch(() => null)),
        );
        const valid = cityAvgs.filter((v): v is number => v != null);
        if (cancelled) return;
        const avgTemp = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
        setState((s) => ({
          data: s.data.map((d) => (d.year === year ? { year, avgTemp } : d)),
          loading: year !== years[years.length - 1],
        }));
        await sleep(80);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, minYear, maxYear]);

  return state;
}
