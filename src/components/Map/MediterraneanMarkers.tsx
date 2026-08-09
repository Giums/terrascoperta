import DotMarker from "./DotMarker";
import type { MediterraneanZone } from "../../data/mediterranean-zones";

interface MediterraneanMarkersProps {
  zones: MediterraneanZone[];
  onSelect: (zone: MediterraneanZone) => void;
}

export default function MediterraneanMarkers({ zones, onSelect }: MediterraneanMarkersProps) {
  return (
    <>
      {zones.map((zone) => (
        <DotMarker
          key={zone.name}
          lat={zone.lat}
          lng={zone.lng}
          size={16}
          color="#0ea5e9"
          fillOpacity={0.55}
          onClick={() => onSelect(zone)}
          tooltip={
            <>
              <strong>{zone.name}</strong>
              <br />
              {zone.country}
            </>
          }
        />
      ))}
    </>
  );
}
