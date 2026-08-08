import { useEffect, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import type { MapSourceDataEvent } from "maplibre-gl";
import "./SatelliteLoadingIndicator.css";

/**
 * Le tile satellitari (soprattutto a 512px, vedi SatelliteOverlay.tsx) ci
 * mettono un secondo o due a caricare — senza nessun segnale la mappa
 * sembra bloccata, non "sta scaricando qualcosa". Ascolta gli eventi del
 * source "satellite" per mostrare un piccolo indicatore mentre carica.
 */
export default function SatelliteLoadingIndicator() {
  const { current: map } = useMap();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!map) return;

    function handleLoading(e: MapSourceDataEvent) {
      if (e.sourceId === "satellite") setLoading(true);
    }
    function handleIdle() {
      setLoading(false);
    }

    map.on("sourcedataloading", handleLoading);
    map.on("idle", handleIdle);
    return () => {
      map.off("sourcedataloading", handleLoading);
      map.off("idle", handleIdle);
    };
  }, [map]);

  if (!loading) return null;
  return <div className="satellite-loading">🛰️ Caricamento immagine satellitare…</div>;
}
