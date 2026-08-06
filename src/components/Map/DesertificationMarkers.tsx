import { CircleMarker, Tooltip } from "react-leaflet";
import type { DesertificationZone } from "../../data/desertification-zones";

interface DesertificationMarkersProps {
  zones: DesertificationZone[];
  onSelect: (zone: DesertificationZone) => void;
}

export default function DesertificationMarkers({ zones, onSelect }: DesertificationMarkersProps) {
  return (
    <>
      {zones.map((z) => (
        <CircleMarker
          key={z.name}
          center={[z.lat, z.lng]}
          radius={10}
          pathOptions={{ color: "#d97706", fillColor: "#d97706", fillOpacity: 0.5, weight: 1.5 }}
          eventHandlers={{ click: () => onSelect(z) }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <strong>{z.name}</strong>
            <br />
            {z.region}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
