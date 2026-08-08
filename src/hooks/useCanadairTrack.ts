import { useEffect, useState } from "react";

export interface TrackPoint {
  time: number;
  lat: number;
  lng: number;
}

interface TrackState {
  path: TrackPoint[];
  loading: boolean;
  error: string | null;
}

/**
 * Traccia volo dell'aereo/elicottero selezionato (backend, route
 * /api/canadair-track/:icao24 — proxy OpenSky /tracks/all, richiede sempre
 * credenziali OpenSky configurate, anche l'accesso anonimo non basta).
 * `icao24 === null` = nessuna selezione, non fa nessuna richiesta.
 */
export function useCanadairTrack(icao24: string | null): TrackState {
  const [state, setState] = useState<TrackState>({ path: [], loading: icao24 != null, error: null });

  useEffect(() => {
    if (icao24 == null) {
      setState({ path: [], loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ path: [], loading: true, error: null });

    fetch(`/api/canadair-track/${icao24}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Traccia non disponibile"))))
      .then((data) => {
        if (cancelled) return;
        setState({ path: data.path ?? [], loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ path: [], loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [icao24]);

  return state;
}
