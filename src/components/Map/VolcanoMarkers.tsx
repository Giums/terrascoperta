import DotMarker from "./DotMarker";
import type { Volcano } from "../../data/volcanoes";
import { activityLabel } from "../../utils/volcano-activity";

interface VolcanoMarkersProps {
  volcanoes: Volcano[];
  /** Nome vulcano -> FRP massima (MW) rilevata nel raggio, assente = nessuna attività rilevata. */
  activity: Map<string, number>;
  onSelect: (volcano: Volcano) => void;
}

export default function VolcanoMarkers({ volcanoes, activity, onSelect }: VolcanoMarkersProps) {
  return (
    <>
      {volcanoes.map((v) => {
        const frp = activity.get(v.name);
        const active = frp != null;
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
                    🔴 {activityLabel(frp)}
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
