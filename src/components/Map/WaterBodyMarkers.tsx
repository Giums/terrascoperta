import DotMarker from "./DotMarker";
import type { WaterBody } from "../../data/water-bodies";

interface WaterBodyMarkersProps {
  waterBodies: WaterBody[];
  onSelect: (waterBody: WaterBody) => void;
}

export default function WaterBodyMarkers({ waterBodies, onSelect }: WaterBodyMarkersProps) {
  return (
    <>
      {waterBodies.map((wb) => (
        <DotMarker
          key={wb.name}
          lat={wb.lat}
          lng={wb.lng}
          size={wb.type === "lago" ? 18 : 14}
          color="#38bdf8"
          fillOpacity={0.6}
          onClick={() => onSelect(wb)}
          tooltip={
            <>
              <strong>{wb.name}</strong>
              <br />
              {wb.type === "lago" ? "Lago" : "Fiume"}
            </>
          }
        />
      ))}
    </>
  );
}
