import { useEffect, useState } from "react";
import { useSentinelToken } from "./useSentinel";

interface DesertificationRiskState {
  ndvi: number | null;
  available: boolean;
  loading: boolean;
  error: string | null;
}

const STATS_URL = "https://sh.dataspace.copernicus.eu/api/v1/statistics";
// ~500m di lato attorno all'indirizzo: abbastanza per una media locale
// robusta senza uscire dalla zona cercata.
const BBOX_DELTA = 0.0025;
const LOOKBACK_DAYS = 45; // margine per trovare almeno un passaggio senza troppe nuvole

const EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: [{ id: "ndvi", bands: 1 }, { id: "dataMask", bands: 1 }]
  };
}
function evaluatePixel(s) {
  let ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  return { ndvi: [ndvi], dataMask: [s.dataMask] };
}`;

/**
 * NDVI medio reale (Sentinel-2, Statistical API di Copernicus Data Space)
 * calcolato dal vivo su un piccolo intorno dell'indirizzo, ultimi ~45
 * giorni — non uno dei 5 casi studio fissi del modulo Desertificazione.
 * Stesso token OAuth a vita breve già usato per gli overlay satellitari
 * (vedi useSentinelToken), client_secret mai esposto al browser.
 * resx/resy volutamente più larghi dell'intero bbox: fa restituire alla
 * Statistical API un solo "pixel" di output, cioè la media spaziale
 * sull'area — verificato dal vivo (Sicilia centro-meridionale, giugno vs
 * luglio: 0.58 → 0.32, coerente con lo stress idrico estivo).
 */
export function useDesertificationRisk(lat: number, lng: number): DesertificationRiskState {
  const { accessToken, available, loading: tokenLoading } = useSentinelToken();
  const [state, setState] = useState<DesertificationRiskState>({
    ndvi: null,
    available: true,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (tokenLoading) return;
    if (!available || !accessToken) {
      setState({ ndvi: null, available: false, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, available: true, loading: true, error: null }));

    const now = new Date();
    const from = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    const iso = (d: Date) => d.toISOString();

    const payload = {
      input: {
        bounds: {
          bbox: [lng - BBOX_DELTA, lat - BBOX_DELTA, lng + BBOX_DELTA, lat + BBOX_DELTA],
          properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: { timeRange: { from: iso(from), to: iso(now) }, maxCloudCoverage: 60 },
          },
        ],
      },
      aggregation: {
        timeRange: { from: iso(from), to: iso(now) },
        aggregationInterval: { of: `P${LOOKBACK_DAYS}D` },
        evalscript: EVALSCRIPT,
        resx: 1,
        resy: 1,
      },
    };

    fetch(STATS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore Statistical API Sentinel Hub");
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const intervals: unknown[] = json?.data ?? [];
        const stats = (intervals[intervals.length - 1] as {
          outputs?: { ndvi?: { bands?: { B0?: { stats?: { mean: number; sampleCount: number; noDataCount: number } } } } };
        })?.outputs?.ndvi?.bands?.B0?.stats;
        const ndvi = stats && stats.sampleCount > stats.noDataCount ? stats.mean : null;
        setState({ ndvi, available: true, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ ndvi: null, available: true, loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng, accessToken, available, tokenLoading]);

  return state;
}
