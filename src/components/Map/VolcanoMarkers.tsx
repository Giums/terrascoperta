import DotMarker from "./DotMarker";
import type { Volcano } from "../../data/volcanoes";

interface VolcanoMarkersProps {
  volcanoes: Volcano[];
  activeNames: Set<string>;
  onSelect: (volcano: Volcano) => void;
}

export default function VolcanoMarkers({ volcanoes, activeNames, onSelect }: VolcanoMarkersProps) {
  return (
    <>
      {volcanoes.map((v) => {
        const active = activeNames.has(v.name);
        return (
          <DotMarker
            key={v.name}
            lat={v.lat}
            lng={v.lng}
            size={18}
            color={active ? "#ef4444" : "#f97316"}
            fillOpacity={active ? 0.85 : 0.65}
            pulse={active}
            onClick={() => onSelect(v)}
            tooltip={
              <>
                <strong>{v.name}</strong>
                <br />
                {v.type}
                {active && (
                  <>
                    <br />
                    🔴 attività termica rilevata ora
                  </>
                )}
              </>
            }
          />
        );
      })}
    </>
  );
}
