import DotMarker from "./DotMarker";
import type { HydroRiskCase } from "../../data/hydro-risk";

interface HydroRiskMarkersProps {
  cases: HydroRiskCase[];
  onSelect: (item: HydroRiskCase) => void;
}

export default function HydroRiskMarkers({ cases, onSelect }: HydroRiskMarkersProps) {
  return (
    <>
      {cases.map((c) => (
        <DotMarker
          key={c.name}
          lat={c.lat}
          lng={c.lng}
          size={18}
          color="#8b5cf6"
          fillOpacity={0.6}
          onClick={() => onSelect(c)}
          tooltip={<strong>{c.name}</strong>}
        />
      ))}
    </>
  );
}
