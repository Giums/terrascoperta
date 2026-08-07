import { useEffect, useState } from "react";

export interface WildfireHotspot {
  lat: number;
  lon: number;
  confidence: string;
  acqDate: string;
  acqTime: string;
  frp: number;
  daynight: string;
}

interface WildfireState {
  hotspots: WildfireHotspot[];
  loading: boolean;
  error: string | null;
}

const POLL_INTERVAL_MS = 10 * 60_000;

/**
 * Focolai rilevati da satellite (VIIRS, NASA FIRMS) via backend
 * (server/index.ts, route /api/wildfire-hotspots — niente CORS e la chiave
 * personale non deve stare nel bundle frontend). Non è una lista di incendi
 * confermati: il satellite rileva qualsiasi fonte di calore intenso.
 */
export function useWildfireHotspots(): WildfireState {
  const [state, setState] = useState<WildfireState>({ hotspots: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    function fetchHotspots() {
      fetch("/api/wildfire-hotspots")
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Backend non disponibile"))))
        .then((data) => {
          if (cancelled) return;
          setState({ hotspots: data.hotspots ?? [], loading: false, error: null });
        })
        .catch((err) => {
          if (cancelled) return;
          setState((s) => ({ ...s, loading: false, error: err.message }));
        });
    }

    fetchHotspots();
    const interval = setInterval(fetchHotspots, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
}
