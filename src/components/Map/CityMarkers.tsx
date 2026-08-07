import DotMarker from "./DotMarker";
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
          <DotMarker
            key={`${city.province}-${city.name}`}
            lat={city.lat}
            lng={city.lng}
            size={radius * 2}
            color={uhiColor(uhi)}
            onClick={() => onSelect(city)}
            tooltip={
              <>
                <strong>{city.name}</strong>
                <br />
                UHI stimata: +{uhi.toFixed(1)}°C
              </>
            }
          />
        );
      })}
    </>
  );
}
