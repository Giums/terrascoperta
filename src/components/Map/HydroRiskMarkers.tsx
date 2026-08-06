import { CircleMarker, Tooltip } from "react-leaflet";
import type { HydroRiskCase } from "../../data/hydro-risk";

interface HydroRiskMarkersProps {
  cases: HydroRiskCase[];
  onSelect: (item: HydroRiskCase) => void;
}

export default function HydroRiskMarkers({ cases, onSelect }: HydroRiskMarkersProps) {
  return (
    <>
      {cases.map((c) => (
        <CircleMarker
          key={c.name}
          center={[c.lat, c.lng]}
          radius={9}
          pathOptions={{ color: "#8b5cf6", fillColor: "#8b5cf6", fillOpacity: 0.6, weight: 1.5 }}
          eventHandlers={{ click: () => onSelect(c) }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <strong>{c.name}</strong>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
