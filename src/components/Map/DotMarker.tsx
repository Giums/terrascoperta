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
}

export default function DotMarker({ lat, lng, size, color, fillOpacity = 0.65, onClick, tooltip }: DotMarkerProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <Marker longitude={lng} latitude={lat} onClick={() => onClick?.()}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            opacity: fillOpacity,
            border: `1.5px solid ${color}`,
            cursor: onClick ? "pointer" : "default",
          }}
        />
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
