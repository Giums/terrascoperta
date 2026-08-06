import { CircleMarker, Tooltip } from "react-leaflet";
import type { FireEvent } from "../../data/fires";

interface FireMarkersProps {
  fires: FireEvent[];
  onSelect: (fire: FireEvent) => void;
}

export default function FireMarkers({ fires, onSelect }: FireMarkersProps) {
  return (
    <>
      {fires.map((f) => (
        <CircleMarker
          key={f.name}
          center={[f.lat, f.lng]}
          radius={8}
          pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.65, weight: 1.5 }}
          eventHandlers={{ click: () => onSelect(f) }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <strong>{f.name}</strong>
            <br />
            {f.year}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
