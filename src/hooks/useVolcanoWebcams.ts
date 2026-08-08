import { useEffect, useState } from "react";

export interface WebcamShot {
  code: string;
  imageUrl: string;
}

interface WebcamState {
  shots: WebcamShot[];
  loading: boolean;
  available: boolean;
}

const POLL_INTERVAL_MS = 5 * 60_000;

/**
 * Foto reali (non incorporabili come stream, ma immagini statiche vere,
 * aggiornate periodicamente) dalle webcam ufficiali INGV — solo Etna e
 * Stromboli le hanno pubbliche in questo formato. Backend (server/index.ts,
 * route /api/volcano-webcams/:volcano) perché la pagina INGV non ha CORS.
 */
export function useVolcanoWebcams(volcanoName: string): WebcamState {
  const [state, setState] = useState<WebcamState>({ shots: [], loading: true, available: true });

  useEffect(() => {
    let cancelled = false;

    function fetchShots() {
      fetch(`/api/volcano-webcams/${encodeURIComponent(volcanoName)}`)
        .then((res) => {
          if (res.status === 404) return { shots: [], notFound: true };
          if (!res.ok) throw new Error("Backend non disponibile");
          return res.json();
        })
        .then((data) => {
          if (cancelled) return;
          setState({ shots: data.shots ?? [], loading: false, available: !data.notFound });
        })
        .catch(() => {
          if (cancelled) return;
          setState({ shots: [], loading: false, available: true });
        });
    }

    fetchShots();
    const interval = setInterval(fetchShots, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [volcanoName]);

  return state;
}
