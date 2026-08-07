import { useEffect, useState } from "react";

export interface EarthquakeEvent {
  id: string;
  time: string;
  lat: number;
  lng: number;
  depthKm: number;
  magnitude: number;
  magType: string;
  place: string;
}

interface EarthquakeState {
  events: EarthquakeEvent[];
  loading: boolean;
  error: string | null;
}

const POLL_INTERVAL_MS = 5 * 60_000;
export const DAYS_BACK = 7;
const MIN_MAGNITUDE = 2.0;
// minlon,minlat,maxlon,maxlat — Italia con margine.
const BBOX = { minlon: 6, minlat: 35, maxlon: 19, maxlat: 47.5 };

function startTime(): string {
  const d = new Date();
  d.setDate(d.getDate() - DAYS_BACK);
  return d.toISOString().slice(0, 19);
}

/**
 * Terremoti in Italia via INGV (FDSN Event API, no auth, CORS aperto).
 * A differenza di useSeismicity (un punto + raggio, per il dettaglio di un
 * singolo vulcano) qui la query è su tutta l'Italia via bounding box.
 */
export function useItalyEarthquakes(): EarthquakeState {
  const [state, setState] = useState<EarthquakeState>({ events: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    function fetchEvents() {
      const url =
        `https://webservices.ingv.it/fdsnws/event/1/query?starttime=${startTime()}` +
        `&minlatitude=${BBOX.minlat}&maxlatitude=${BBOX.maxlat}` +
        `&minlongitude=${BBOX.minlon}&maxlongitude=${BBOX.maxlon}` +
        `&minmagnitude=${MIN_MAGNITUDE}&format=text&limit=300&orderby=time`;

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
                id: cols[0],
                time: cols[1],
                lat: Number(cols[2]),
                lng: Number(cols[3]),
                depthKm: Number(cols[4]),
                magnitude: Number(cols[10]),
                magType: cols[9] ?? "",
                place: cols[12] ?? "",
              };
            })
            .filter((e) => Number.isFinite(e.magnitude) && Number.isFinite(e.lat) && Number.isFinite(e.lng));
          setState({ events, loading: false, error: null });
        })
        .catch((err) => {
          if (cancelled) return;
          setState((s) => ({ ...s, loading: false, error: err.message }));
        });
    }

    fetchEvents();
    const interval = setInterval(fetchEvents, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return state;
}
