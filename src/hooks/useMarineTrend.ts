import { useEffect, useState } from "react";
import { seasonCutoffMonthDay } from "./useSeasonalTrend";
import type { YearTemp, GeoPoint } from "./useSeasonalTrend";

export type { YearTemp, GeoPoint } from "./useSeasonalTrend";

interface MarineTrendState {
  data: YearTemp[];
  loading: boolean;
}

// L'archivio storico di Open-Meteo Marine parte da fine 2022 (verificato
// interrogandolo con date diverse: null fino a ottobre 2022, dati reali da
// dicembre 2022) — molto più corto dell'archivio meteo standard (dal 1940).
// 2023 è il primo anno con un'estate intera disponibile.
export const MARINE_MIN_YEAR = 2023;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPointYearAvg(point: GeoPoint, year: number, cutoff: string): Promise<number | null> {
  const res = await fetch(
    `https://marine-api.open-meteo.com/v1/marine?latitude=${point.lat}&longitude=${point.lng}` +
      `&start_date=${year}-06-01&end_date=${year}-${cutoff}&daily=sea_surface_temperature_max`,
  );
  if (!res.ok) return null;
  const json = await res.json();
  const values: (number | null)[] = json?.daily?.sea_surface_temperature_max ?? [];
  const nums = values.filter((v): v is number => typeof v === "number");
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

/**
 * Media della temperatura massima del mare (giu → taglio comune) su una
 * manciata di punti nei mari italiani (Tirreno/Ionio/Ligure/Sardegna),
 * stesso pattern di useSeasonalTrend per l'aria — vedi lì per il perché
 * delle richieste in parallelo-per-anno invece che tutte insieme.
 */
export function useMarineTrend(points: GeoPoint[], minYear: number, maxYear: number): MarineTrendState {
  const [state, setState] = useState<MarineTrendState>({ data: [], loading: true });
  const pointsKey = points.map((p) => `${p.lat},${p.lng}`).join("|");

  useEffect(() => {
    let cancelled = false;
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    setState({ data: years.map((year) => ({ year, avgTemp: null })), loading: true });

    const cutoff = seasonCutoffMonthDay();

    (async () => {
      for (const year of years) {
        if (cancelled) return;
        const avgs = await Promise.all(points.map((p) => fetchPointYearAvg(p, year, cutoff).catch(() => null)));
        const valid = avgs.filter((v): v is number => v != null);
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
