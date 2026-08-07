import { useState } from "react";
import { Marker, Popup } from "react-map-gl/maplibre";
import type { CanadairPosition } from "../../hooks/useCanadairPositions";

interface CanadairMarkersProps {
  aircraft: CanadairPosition[];
}

function SingleAircraft({ a }: { a: CanadairPosition }) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <Marker longitude={a.lon} latitude={a.lat}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            fontSize: 20,
            lineHeight: 1,
            transform: `rotate(${(a.heading ?? 0) - 45}deg)`,
            filter: "drop-shadow(0 0 3px rgba(0,0,0,0.7))",
          }}
        >
          ✈️
        </div>
      </Marker>
      {hovered && (
        <Popup longitude={a.lon} latitude={a.lat} closeButton={false} closeOnClick={false} anchor="bottom" offset={16}>
          <strong>{a.registration}</strong> · Canadair CL-415
          <br />
          {a.altitude != null ? `${Math.round(a.altitude)}m` : "—"} ·{" "}
          {a.velocity != null ? `${Math.round(a.velocity * 3.6)}km/h` : "—"}
        </Popup>
      )}
    </>
  );
}

/** Solo i velivoli in volo — a terra (in base) non c'è nulla da mostrare sulla mappa. */
export default function CanadairMarkers({ aircraft }: CanadairMarkersProps) {
  return (
    <>
      {aircraft
        .filter((a) => !a.onGround)
        .map((a) => (
          <SingleAircraft key={a.icao24} a={a} />
        ))}
    </>
  );
}
