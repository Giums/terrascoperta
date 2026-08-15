import { useEffect, useState } from "react";
import type { WildfireHotspot } from "./useWildfireHotspots";

interface VolcanoThermalHistoryState {
  hotspots: WildfireHotspot[];
  loading: boolean;
  error: string | null;
}

/**
 * Storico termico VIIRS (NASA FIRMS) sugli ultimi giorni intorno a un
 * vulcano — via backend (server/index.ts, /api/volcano-thermal-history,
 * stesso motivo del proxy per gli hotspot nazionali: niente CORS, MAP_KEY
 * non nel bundle). Attivo solo quando lat/lng sono forniti (vulcano
 * selezionato), non in polling continuo come il feed nazionale.
 */
export function useVolcanoThermalHistory(
  lat: number | null,
  lng: number | null,
  days = 5,
): VolcanoThermalHistoryState {
  const [state, setState] = useState<VolcanoThermalHistoryState>({
    hotspots: [],
    loading: lat != null,
    error: null,
  });

  useEffect(() => {
    if (lat == null || lng == null) {
      setState({ hotspots: [], loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetch(`/api/volcano-thermal-history?lat=${lat}&lng=${lng}&days=${days}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Backend non disponibile"))))
      .then((data) => {
        if (cancelled) return;
        setState({ hotspots: data.hotspots ?? [], loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ hotspots: [], loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng, days]);

  return state;
}
