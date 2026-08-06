import { CircleMarker, Tooltip } from "react-leaflet";
import type { WaterBody } from "../../data/water-bodies";

interface WaterBodyMarkersProps {
  waterBodies: WaterBody[];
  onSelect: (waterBody: WaterBody) => void;
}

export default function WaterBodyMarkers({ waterBodies, onSelect }: WaterBodyMarkersProps) {
  return (
    <>
      {waterBodies.map((wb) => (
        <CircleMarker
          key={wb.name}
          center={[wb.lat, wb.lng]}
          radius={wb.type === "lago" ? 9 : 7}
          pathOptions={{ color: "#38bdf8", fillColor: "#38bdf8", fillOpacity: 0.6, weight: 1.5 }}
          eventHandlers={{ click: () => onSelect(wb) }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <strong>{wb.name}</strong>
            <br />
            {wb.type === "lago" ? "Lago" : "Fiume"}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
