import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

interface MapCenterTrackerProps {
  onChange: (center: { lat: number; lng: number }) => void;
}

/** Riporta il centro mappa al genitore — usato da LayerControls (compareMode "sea") per mostrare la zona costiera più vicina a dove sta guardando l'utente, invece di una media nazionale fissa. */
export default function MapCenterTracker({ onChange }: MapCenterTrackerProps) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;

    function report() {
      const c = map!.getCenter();
      onChange({ lat: c.lat, lng: c.lng });
    }
    report();
    map.on("moveend", report);
    return () => {
      map.off("moveend", report);
    };
  }, [map, onChange]);

  return null;
}
