import { Marker, Popup } from "react-map-gl/maplibre";

interface AddressMarkerProps {
  lat: number;
  lng: number;
  label: string;
}

export default function AddressMarker({ lat, lng, label }: AddressMarkerProps) {
  return (
    <>
      <Marker longitude={lng} latitude={lat}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#38bdf8",
            opacity: 0.4,
            border: "2px solid #38bdf8",
          }}
        />
      </Marker>
      <Popup longitude={lng} latitude={lat} closeButton={false} closeOnClick={false} anchor="bottom" offset={16}>
        {label.split(",").slice(0, 2).join(",")}
      </Popup>
    </>
  );
}
