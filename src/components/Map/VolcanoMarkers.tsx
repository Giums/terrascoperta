import { CircleMarker, Tooltip } from "react-leaflet";
import type { Volcano } from "../../data/volcanoes";

interface VolcanoMarkersProps {
  volcanoes: Volcano[];
  onSelect: (volcano: Volcano) => void;
}

export default function VolcanoMarkers({ volcanoes, onSelect }: VolcanoMarkersProps) {
  return (
    <>
      {volcanoes.map((v) => (
        <CircleMarker
          key={v.name}
          center={[v.lat, v.lng]}
          radius={9}
          pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.65, weight: 1.5 }}
          eventHandlers={{ click: () => onSelect(v) }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <strong>{v.name}</strong>
            <br />
            {v.type}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
