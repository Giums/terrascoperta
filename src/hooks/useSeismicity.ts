import { useEffect, useState } from "react";

export interface SeismicEvent {
  time: string;
  magnitude: number;
  depthKm: number;
  place: string;
}

interface SeismicityState {
  events: SeismicEvent[];
  loading: boolean;
  error: string | null;
}

/**
 * Eventi sismici recenti entro ~30km dal punto dato, da INGV (no auth, CC BY 4.0).
 * Formato "text" del servizio FDSN: righe pipe-delimited, prima colonna EventID,
 * la riga di intestazione inizia con "#".
 */
export function useSeismicity(lat: number, lng: number): SeismicityState {
  const [state, setState] = useState<SeismicityState>({ events: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ events: [], loading: true, error: null });

    const url =
      `https://webservices.ingv.it/fdsnws/event/1/query?lat=${lat}&lon=${lng}` +
      `&maxradius=0.3&minmag=0.5&format=text&limit=15&orderby=time`;

    fetch(url)
      .then((res) => {
        if (res.status === 204) return "";
        if (!res.ok) throw new Error("Errore nel recupero dati sismici INGV");
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const events = text
          .split("\n")
          .filter((line) => line && !line.startsWith("#"))
          .map((line) => {
            const cols = line.split("|");
            return {
              time: cols[1],
              depthKm: Number(cols[4]),
              magnitude: Number(cols[10]),
              place: cols[12] ?? "",
            };
          })
          .filter((e) => Number.isFinite(e.magnitude));
        setState({ events, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ events: [], loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return state;
}
