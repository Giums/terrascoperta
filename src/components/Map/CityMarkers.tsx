import { CircleMarker, Tooltip } from "react-leaflet";
import type { City } from "../../data/cities";
import { estimateUHI, uhiColor } from "../../utils/uhi-model";

interface CityMarkersProps {
  cities: City[];
  onSelect: (city: City) => void;
}

export default function CityMarkers({ cities, onSelect }: CityMarkersProps) {
  return (
    <>
      {cities.map((city) => {
        const uhi = estimateUHI(city);
        const radius = 5 + Math.log10(Math.max(city.population, 1000)) * 1.5;
        return (
          <CircleMarker
            key={`${city.province}-${city.name}`}
            center={[city.lat, city.lng]}
            radius={radius}
            pathOptions={{
              color: uhiColor(uhi),
              fillColor: uhiColor(uhi),
              fillOpacity: 0.65,
              weight: 1.5,
            }}
            eventHandlers={{ click: () => onSelect(city) }}
          >
            <Tooltip direction="top" offset={[0, -radius]}>
              <strong>{city.name}</strong>
              <br />
              UHI stimata: +{uhi.toFixed(1)}°C
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
