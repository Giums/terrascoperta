import { useEffect, useState } from "react";
import { haversineKm } from "../utils/geo";

export interface EmsActivation {
  code: string;
  name: string;
  category: string;
  categorySlug: string;
  countries: string[];
  lat: number;
  lng: number;
  activationTime: string;
}

const POLL_INTERVAL_MS = 15 * 60_000;

/**
 * Attivazioni Copernicus EMS Rapid Mapping ancora aperte (poche decine nel
 * mondo in un dato momento) — non un layer continuo, un evento dichiarato.
 * Backend (server/index.ts, /api/ems-activations) perché l'API CEMS non ha CORS.
 */
export function useEmsActivations(): { activations: EmsActivation[]; loading: boolean } {
  const [state, setState] = useState<{ activations: EmsActivation[]; loading: boolean }>({
    activations: [],
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    function fetchActivations() {
      fetch("/api/ems-activations")
        .then((res) => (res.ok ? res.json() : { activations: [] }))
        .then((data) => {
          if (cancelled) return;
          setState({ activations: data.activations ?? [], loading: false });
        })
        .catch(() => {
          if (cancelled) return;
          setState({ activations: [], loading: false });
        });
    }

    fetchActivations();
    const interval = setInterval(fetchActivations, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
}

/**
 * Attivazione aperta più vicina a un punto, entro un raggio — null se nessuna.
 * `categories` filtra per slug (es. "fire", "flood", "volcan", "earthquake",
 * "mass"): la vicinanza da sola non basta, un'attivazione incendio a 10km da
 * un terremoto non c'entra nulla col terremoto.
 */
export function nearestActivation(
  activations: EmsActivation[],
  lat: number,
  lng: number,
  maxKm: number,
  categories: string[],
): EmsActivation | null {
  let best: EmsActivation | null = null;
  let bestDist = Infinity;
  for (const a of activations) {
    if (!categories.includes(a.categorySlug)) continue;
    const dist = haversineKm(lat, lng, a.lat, a.lng);
    if (dist < bestDist) {
      best = a;
      bestDist = dist;
    }
  }
  return best && bestDist <= maxKm ? best : null;
}
