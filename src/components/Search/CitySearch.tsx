import { useMemo, useState } from "react";
import type { City } from "../../data/cities";
import "./CitySearch.css";

interface CitySearchProps {
  cities: City[];
  onSelect: (city: City) => void;
}

export default function CitySearch({ cities, onSelect }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    if (query.trim().length < 1) return [];
    const q = query.trim().toLowerCase();
    return cities
      .filter((c) => c.name.toLowerCase().startsWith(q))
      .slice(0, 8);
  }, [cities, query]);

  function handleSelect(city: City) {
    setQuery(city.name);
    setOpen(false);
    onSelect(city);
  }

  return (
    <div className="city-search">
      <input
        type="text"
        role="combobox"
        aria-expanded={open && matches.length > 0}
        aria-label="Cerca una città italiana"
        placeholder="Cerca una città…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && matches.length > 0 && (
        <ul className="city-search__results" role="listbox">
          {matches.map((city) => (
            <li key={`${city.province}-${city.name}`} role="option" aria-selected={false}>
              <button type="button" onMouseDown={() => handleSelect(city)}>
                <span>{city.name}</span>
                <span className="city-search__region">{city.region}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
