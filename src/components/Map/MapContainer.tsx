import Map, { type MapEvent } from "react-map-gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
// Il worker di MapLibre viene risolto di default come file fratello di
// maplibre-gl.mjs: dopo il bundling quel file non esiste più e il worker muore
// in silenzio (i tile vettoriali restano "loading" per sempre). `?worker&url`
// fa costruire il worker a Vite e ci restituisce l'URL giusto.
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { ExpressionSpecification } from "maplibre-gl";
import type { ReactNode } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(maplibreWorkerUrl);

const ITALY_CENTER = { longitude: 12.5, latitude: 42.5 };
const ITALY_ZOOM = 6;

// OpenFreeMap: stile vettoriale dark, senza API key e senza limiti d'uso
// dichiarati. Sostituisce i raster CARTO, che da qualche tempo restituiscono
// tile con la filigrana "API KEY REQUIRED" per le richieste senza chiave.
const BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/dark";

// Lo stile di OpenFreeMap etichetta in `name:latin` (Florence, Tuscany). I
// tile OpenMapTiles portano anche i `name:<lingua>` dell'originale OSM, quindi
// si può ripescare l'italiano e ricadere sul nome locale dove manca.
const ITALIAN_LABEL: ExpressionSpecification = [
  "coalesce",
  ["get", "name:it"],
  ["get", "name:latin"],
  ["get", "name"],
];

function applyItalianLabels({ target: map }: MapEvent) {
  for (const layer of map.getStyle().layers) {
    if (layer.type !== "symbol") continue;
    // I cartelli autostradali (highway_name_motorway) scrivono `ref`, non un
    // nome: riscriverli trasformerebbe "A1" nel nome della strada.
    const field = JSON.stringify(layer.layout?.["text-field"] ?? "");
    if (!field.includes("name")) continue;
    map.setLayoutProperty(layer.id, "text-field", ITALIAN_LABEL);
  }
}

interface MapViewProps {
  children?: ReactNode;
}

export default function MapView({ children }: MapViewProps) {
  return (
    <Map
      initialViewState={{ ...ITALY_CENTER, zoom: ITALY_ZOOM }}
      minZoom={5}
      maxZoom={12}
      mapStyle={BASEMAP_STYLE}
      style={{ width: "100%", height: "100%", background: "#0a0e14" }}
      // Spento: con marker piccoli (aerei, elicotteri) un doppio-click per
      // selezionarne uno zoomava anche la mappa sotto, oltre a rischiare di
      // selezionare/deselezionare in rapida successione.
      doubleClickZoom={false}
      onLoad={applyItalianLabels}
    >
      {children}
    </Map>
  );
}
