import Map from "react-map-gl/maplibre";
import type { StyleSpecification } from "maplibre-gl";
import type { ReactNode } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

const ITALY_CENTER = { longitude: 12.5, latitude: 42.5 };
const ITALY_ZOOM = 6;

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const CARTO_DARK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: CARTO_ATTRIBUTION,
    },
  },
  layers: [{ id: "carto-dark", type: "raster", source: "carto" }],
};

interface MapViewProps {
  children?: ReactNode;
}

export default function MapView({ children }: MapViewProps) {
  return (
    <Map
      initialViewState={{ ...ITALY_CENTER, zoom: ITALY_ZOOM }}
      minZoom={5}
      maxZoom={12}
      mapStyle={CARTO_DARK_STYLE}
      style={{ width: "100%", height: "100%", background: "#0a0e14" }}
      // Spento: con marker piccoli (aerei, elicotteri) un doppio-click per
      // selezionarne uno zoomava anche la mappa sotto, oltre a rischiare di
      // selezionare/deselezionare in rapida successione.
      doubleClickZoom={false}
    >
      {children}
    </Map>
  );
}
