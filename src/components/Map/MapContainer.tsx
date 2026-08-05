import { MapContainer as LeafletMap, TileLayer } from "react-leaflet";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";

const ITALY_CENTER: [number, number] = [42.5, 12.5];
const ITALY_ZOOM = 6;

const CARTO_DARK_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface MapViewProps {
  children?: ReactNode;
}

export default function MapView({ children }: MapViewProps) {
  return (
    <LeafletMap
      center={ITALY_CENTER}
      zoom={ITALY_ZOOM}
      minZoom={5}
      maxZoom={12}
      style={{ height: "100%", width: "100%", background: "#0a0e14" }}
      worldCopyJump
    >
      <TileLayer url={CARTO_DARK_URL} attribution={CARTO_ATTRIBUTION} />
      {children}
    </LeafletMap>
  );
}
