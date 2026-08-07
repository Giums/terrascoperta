import { useState, type ReactNode } from "react";
import { Marker, Popup } from "react-map-gl/maplibre";

interface DotMarkerProps {
  lat: number;
  lng: number;
  /** Diametro in px. */
  size: number;
  color: string;
  fillOpacity?: number;
  onClick?: () => void;
  tooltip: ReactNode;
  /** Anello pulsante intorno al pallino, per segnalare "attivo ora". */
  pulse?: boolean;
}

export default function DotMarker({
  lat,
  lng,
  size,
  color,
  fillOpacity = 0.65,
  onClick,
  tooltip,
  pulse = false,
}: DotMarkerProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <Marker longitude={lng} latitude={lat} onClick={() => onClick?.()}>
        <div style={{ position: "relative", width: size, height: size }}>
          {pulse && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: color,
                opacity: 0.7,
                animation: "dot-marker-pulse 1.6s ease-out infinite",
              }}
            />
          )}
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              position: "relative",
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: fillOpacity,
              border: `1.5px solid ${color}`,
              cursor: onClick ? "pointer" : "default",
            }}
          />
        </div>
      </Marker>
      {hovered && (
        <Popup
          longitude={lng}
          latitude={lat}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
          offset={size / 2 + 6}
        >
          {tooltip}
        </Popup>
      )}
    </>
  );
}
