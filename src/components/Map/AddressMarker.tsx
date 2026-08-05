import { CircleMarker, Tooltip } from "react-leaflet";

interface AddressMarkerProps {
  lat: number;
  lng: number;
  label: string;
}

export default function AddressMarker({ lat, lng, label }: AddressMarkerProps) {
  return (
    <CircleMarker
      center={[lat, lng]}
      radius={10}
      pathOptions={{ color: "#38bdf8", fillColor: "#38bdf8", fillOpacity: 0.4, weight: 2 }}
    >
      <Tooltip direction="top" offset={[0, -10]} permanent>
        {label.split(",").slice(0, 2).join(",")}
      </Tooltip>
    </CircleMarker>
  );
}
