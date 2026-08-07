import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

export interface FlyTarget {
  lat: number;
  lng: number;
  zoom?: number;
}

interface FlyToProps {
  target: FlyTarget | null;
  /** Chiamato quando l'animazione di volo è terminata e la mappa si è fermata. */
  onArrive?: () => void;
}

/**
 * Sposta la mappa su un punto quando `target` cambia (es. dopo una ricerca
 * indirizzo). `onArrive` scatta a `moveend`: usarlo per attivare layer WMS
 * pesanti (Sentinel Hub) solo a volo concluso — durante l'animazione la
 * mappa attraversa molti zoom intermedi, e richiedere tile ad ognuno spreca
 * quota e produce tile abbandonate a metà caricamento.
 */
export default function FlyTo({ target, onArrive }: FlyToProps) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!target || !map) return;
    map.flyTo({ center: [target.lng, target.lat], zoom: target.zoom ?? 17, duration: 1200 });

    if (!onArrive) return;
    map.once("moveend", onArrive);
    return () => {
      map.off("moveend", onArrive);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, map]);

  return null;
}
