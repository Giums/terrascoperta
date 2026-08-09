import { useEffect, useState } from "react";

interface MarineConditions {
  temperature: number | null;
  seaLevel: number | null;
  loading: boolean;
}

/**
 * Condizioni marine attuali (non uno storico) per un punto — Open-Meteo
 * Marine, stessa fonte già usata per il trend stagionale del mare, qui però
 * l'endpoint "current" invece di "daily" su un intervallo di anni.
 * sea_level_height_msl è riferito al livello medio del mare globale, non a
 * uno zero locale — utile per confrontare punti diversi tra loro, non per
 * leggerlo come "quota sul molo del porto".
 */
export function useMarineConditions(lat: number, lng: number): MarineConditions {
  const [state, setState] = useState<MarineConditions>({ temperature: null, seaLevel: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ temperature: null, seaLevel: null, loading: true });

    fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}` +
        `&current=sea_surface_temperature,sea_level_height_msl`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        const current = json?.current ?? {};
        setState({
          temperature: current.sea_surface_temperature ?? null,
          seaLevel: current.sea_level_height_msl ?? null,
          loading: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ temperature: null, seaLevel: null, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return state;
}
