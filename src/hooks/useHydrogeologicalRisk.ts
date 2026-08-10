import { useEffect, useState } from "react";

export type HazardLevel = 1 | 2 | 3 | 4;

interface HydrogeologicalRiskState {
  landslideLevel: HazardLevel | null;
  floodLevel: HazardLevel | null;
  loading: boolean;
  error: string | null;
}

const WMS_BASE = "https://idrogeo.isprambiente.it/geoserver/wms";
// ~1km di lato, verificato dal vivo (GetFeatureInfo) su punti noti in
// Romagna (alluvione 2023) e Liguria (frane) — abbastanza per intercettare
// il pixel giusto senza prendere zone troppo lontane dall'indirizzo.
const BBOX_DELTA = 0.01;

async function queryLayer(lat: number, lng: number, layer: string): Promise<Record<string, unknown>[]> {
  const bbox = [lat - BBOX_DELTA, lng - BBOX_DELTA, lat + BBOX_DELTA, lng + BBOX_DELTA].join(",");
  const url =
    `${WMS_BASE}?service=WMS&version=1.3.0&request=GetFeatureInfo` +
    `&layers=${layer}&query_layers=${layer}&crs=EPSG:4326&bbox=${bbox}` +
    `&width=11&height=11&i=5&j=5&info_format=application/json&feature_count=10`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Errore WMS IdroGEO (${layer})`);
  const json = await res.json();
  return (json?.features ?? []).map((f: { properties?: Record<string, unknown> }) => f.properties ?? {});
}

// Il layer alluvioni espone solo il campo scenario della propria fascia
// (scenariop1/p2/p3, testo tipo "Aree a pericolosita' idraulica bassa P1")
// — zone sovrapposte (P1 include P2 include P3) restituiscono più feature.
function floodLevel(props: Record<string, unknown>): number | null {
  if (typeof props.scenariop3 === "string") return 3;
  if (typeof props.scenariop2 === "string") return 2;
  if (typeof props.scenariop1 === "string") return 1;
  return null;
}

function maxLevel(levels: (number | null)[]): HazardLevel | null {
  const valid = levels.filter((n): n is number => n != null && n >= 1 && n <= 4);
  return valid.length ? (Math.max(...valid) as HazardLevel) : null;
}

/**
 * Pericolosità da frana e da alluvione sull'indirizzo, dal mosaico
 * nazionale PAI servito da ISPRA IdroGEO (WMS pubblico, CORS aperto,
 * nessuna chiave richiesta — verificato dal vivo con richieste reali, non
 * assunto). Il campo "cod_per_it" delle frane è la classificazione
 * IFFI/PAI standard nazionale P1-P4 (moderata→molto elevata): il layer non
 * porta un'etichetta testuale, va mappata a mano nel componente.
 */
export function useHydrogeologicalRisk(lat: number, lng: number): HydrogeologicalRiskState {
  const [state, setState] = useState<HydrogeologicalRiskState>({
    landslideLevel: null,
    floodLevel: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.all([queryLayer(lat, lng, "idrogeo:pericolosita"), queryLayer(lat, lng, "idrogeo:pericolosita_alluvioni")])
      .then(([landslideProps, floodProps]) => {
        if (cancelled) return;
        setState({
          landslideLevel: maxLevel(landslideProps.map((p) => Number(p.cod_per_it) || null)),
          floodLevel: maxLevel(floodProps.map(floodLevel)),
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: err.message }));
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return state;
}
