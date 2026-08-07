import { useEffect, useState } from "react";

export interface CanadairPosition {
  icao24: string;
  registration: string;
  callsign: string;
  lon: number;
  lat: number;
  altitude: number | null;
  onGround: boolean;
  velocity: number | null;
  heading: number | null;
  lastContact: number;
}

interface CanadairState {
  aircraft: CanadairPosition[];
  loading: boolean;
  error: string | null;
}

const POLL_INTERVAL_MS = 60_000;

/**
 * Posizioni live della flotta Canadair via backend (server/index.ts, route
 * /api/canadair-positions — proxy OpenSky Network, CORS non permette la
 * chiamata diretta dal browser). Se il backend non risponde, `error` si
 * popola e la lista resta vuota — nessun aereo mostrato, non un errore visivo.
 */
export function useCanadairPositions(): CanadairState {
  const [state, setState] = useState<CanadairState>({ aircraft: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    function fetchPositions() {
      fetch("/api/canadair-positions")
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Backend non disponibile"))))
        .then((data) => {
          if (cancelled) return;
          setState({ aircraft: data.aircraft ?? [], loading: false, error: null });
        })
        .catch((err) => {
          if (cancelled) return;
          setState((s) => ({ ...s, loading: false, error: err.message }));
        });
    }

    fetchPositions();
    const interval = setInterval(fetchPositions, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
}
