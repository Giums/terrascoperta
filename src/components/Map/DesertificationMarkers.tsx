import DotMarker from "./DotMarker";
import type { DesertificationZone } from "../../data/desertification-zones";

interface DesertificationMarkersProps {
  zones: DesertificationZone[];
  onSelect: (zone: DesertificationZone) => void;
}

export default function DesertificationMarkers({ zones, onSelect }: DesertificationMarkersProps) {
  return (
    <>
      {zones.map((z) => (
        <DotMarker
          key={z.name}
          lat={z.lat}
          lng={z.lng}
          size={20}
          color="#d97706"
          fillOpacity={0.5}
          onClick={() => onSelect(z)}
          tooltip={
            <>
              <strong>{z.name}</strong>
              <br />
              {z.region}
            </>
          }
        />
      ))}
    </>
  );
}
