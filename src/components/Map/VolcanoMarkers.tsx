import DotMarker from "./DotMarker";
import type { Volcano } from "../../data/volcanoes";

interface VolcanoMarkersProps {
  volcanoes: Volcano[];
  onSelect: (volcano: Volcano) => void;
}

export default function VolcanoMarkers({ volcanoes, onSelect }: VolcanoMarkersProps) {
  return (
    <>
      {volcanoes.map((v) => (
        <DotMarker
          key={v.name}
          lat={v.lat}
          lng={v.lng}
          size={18}
          color="#f97316"
          fillOpacity={0.65}
          onClick={() => onSelect(v)}
          tooltip={
            <>
              <strong>{v.name}</strong>
              <br />
              {v.type}
            </>
          }
        />
      ))}
    </>
  );
}
