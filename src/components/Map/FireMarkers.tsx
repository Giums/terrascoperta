import DotMarker from "./DotMarker";
import type { FireEvent } from "../../data/fires";

interface FireMarkersProps {
  fires: FireEvent[];
  onSelect: (fire: FireEvent) => void;
}

export default function FireMarkers({ fires, onSelect }: FireMarkersProps) {
  return (
    <>
      {fires.map((f) => (
        <DotMarker
          key={f.name}
          lat={f.lat}
          lng={f.lng}
          size={16}
          color="#dc2626"
          fillOpacity={0.65}
          onClick={() => onSelect(f)}
          tooltip={
            <>
              <strong>{f.name}</strong>
              <br />
              {f.year}
            </>
          }
        />
      ))}
    </>
  );
}
