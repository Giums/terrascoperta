import DotMarker from "./DotMarker";
import type { EarthquakeEvent } from "../../hooks/useItalyEarthquakes";

interface EarthquakeMarkersProps {
  events: EarthquakeEvent[];
  onSelect: (event: EarthquakeEvent) => void;
}

function magnitudeColor(mag: number): string {
  if (mag < 3) return "#eab308";
  if (mag < 4) return "#f97316";
  if (mag < 5) return "#ef4444";
  return "#b91c1c";
}

const RECENT_MS = 3 * 60 * 60 * 1000;

/** Scossa avvenuta da poco: stesso anello pulsante usato per l'attività vulcanica. */
function isRecent(isoTime: string): boolean {
  const t = new Date(`${isoTime}Z`).getTime();
  return Number.isFinite(t) && Date.now() - t < RECENT_MS;
}

export default function EarthquakeMarkers({ events, onSelect }: EarthquakeMarkersProps) {
  return (
    <>
      {events.map((e) => (
        <DotMarker
          key={e.id}
          lat={e.lat}
          lng={e.lng}
          size={8 + e.magnitude * 3}
          color={magnitudeColor(e.magnitude)}
          fillOpacity={0.6}
          pulse={isRecent(e.time)}
          onClick={() => onSelect(e)}
          tooltip={
            <>
              <strong>
                {e.magType}
                {e.magnitude.toFixed(1)}
              </strong>{" "}
              · {e.depthKm.toFixed(1)}km
              <br />
              {e.place}
            </>
          }
        />
      ))}
    </>
  );
}
