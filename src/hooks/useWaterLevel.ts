import { useEffect, useState } from "react";

export interface DayLevel {
  day: string;
  avgLevel: number | null;
}

interface WaterLevelState {
  current: { value: number; timestamp: string } | null;
  series: DayLevel[];
  loading: boolean;
}

const SOCRATA_BASE = "https://www.dati.lombardia.it/resource/647i-nhxk.json";

// Il feed live ARPA Lombardia contiene occasionali glitch di trasmissione (valori
// nell'ordine dei milioni di cm su una singola lettura): fuori da qualunque range
// fisico plausibile per un livello idrometrico, li scartiamo alla fonte.
const VALID_RANGE = "valore between -2000 and 2000";

/**
 * Livello idrometrico live (stazioni ARPA Lombardia, rete "Dati sensori meteo").
 * Le stazioni attive sono state rinumerate a inizio 2026: lo storico per gli
 * idsensore correnti parte da lì, non prima — niente trend pluriennale onesto,
 * solo andamento dell'anno in corso + lettura in tempo reale.
 */
export function useWaterLevel(sensorId: number | null): WaterLevelState {
  const [state, setState] = useState<WaterLevelState>({ current: null, series: [], loading: sensorId != null });

  useEffect(() => {
    if (sensorId == null) {
      setState({ current: null, series: [], loading: false });
      return;
    }
    let cancelled = false;
    setState({ current: null, series: [], loading: true });

    const latestUrl = `${SOCRATA_BASE}?${new URLSearchParams({
      idsensore: String(sensorId),
      $where: VALID_RANGE,
      $order: "data DESC",
      $limit: "1",
    })}`;
    const seriesUrl = `${SOCRATA_BASE}?${new URLSearchParams({
      idsensore: String(sensorId),
      $where: VALID_RANGE,
      $select: "date_trunc_ymd(data) as day, avg(valore) as avgv",
      $group: "day",
      $order: "day",
    })}`;

    Promise.all([fetch(latestUrl), fetch(seriesUrl)])
      .then(async ([latestRes, seriesRes]) => {
        const latest = latestRes.ok ? await latestRes.json() : [];
        const series = seriesRes.ok ? await seriesRes.json() : [];
        if (cancelled) return;
        setState({
          current: latest[0] ? { value: Number(latest[0].valore), timestamp: latest[0].data } : null,
          series: (series as { day: string; avgv: string }[]).map((r) => ({
            day: r.day.slice(0, 10),
            avgLevel: Number(r.avgv),
          })),
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ current: null, series: [], loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [sensorId]);

  return state;
}
