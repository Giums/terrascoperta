import { useMemo, useState, type FormEvent } from "react";
import type { City } from "../../data/cities";
import { searchAddress, type AddressResult } from "../../utils/geocode";
import "./UnifiedSearch.css";

interface UnifiedSearchProps {
  cities: City[];
  onSelectCity: (city: City) => void;
  onSelectAddress: (result: AddressResult) => void;
}

export default function UnifiedSearch({ cities, onSelectCity, onSelectAddress }: UnifiedSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [addressResults, setAddressResults] = useState<AddressResult[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const cityMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    return cities.filter((c) => c.name.toLowerCase().startsWith(q)).slice(0, 6);
  }, [cities, query]);

  // Nominatim vieta la ricerca indirizzi ad ogni tasto premuto (live
  // autocomplete): scatta solo alla conferma (invio/bottone). Le città
  // restano invece istantanee, sono dati locali, non una chiamata esterna.
  async function searchAddresses(e: FormEvent) {
    e.preventDefault();
    if (query.trim().length < 3) return;
    setAddressLoading(true);
    setAddressError(null);
    try {
      const found = await searchAddress(query);
      setAddressResults(found);
      setOpen(true);
      if (found.length === 0) setAddressError("Nessun indirizzo trovato.");
    } catch {
      setAddressError("Ricerca indirizzo non disponibile al momento.");
    } finally {
      setAddressLoading(false);
    }
  }

  function selectCity(city: City) {
    setQuery(city.name);
    setOpen(false);
    onSelectCity(city);
  }

  function selectAddress(result: AddressResult) {
    setQuery(result.label);
    setOpen(false);
    onSelectAddress(result);
  }

  const hasDropdown = cityMatches.length > 0 || addressResults.length > 0 || addressError !== null;

  return (
    <form className="unified-search" onSubmit={searchAddresses}>
      <input
        type="text"
        role="combobox"
        aria-expanded={open && hasDropdown}
        aria-label="Cerca città o indirizzo"
        placeholder="Cerca città o indirizzo…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setAddressResults([]);
          setAddressError(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      <button type="submit" disabled={addressLoading} aria-label="Cerca indirizzo">
        {addressLoading ? "…" : "🔍"}
      </button>
      {open && hasDropdown && (
        <ul className="unified-search__results" role="listbox">
          {cityMatches.map((city) => (
            <li key={`city-${city.province}-${city.name}`} role="option" aria-selected={false}>
              <button type="button" onMouseDown={() => selectCity(city)}>
                <span>{city.name}</span>
                <span className="unified-search__tag">città</span>
              </button>
            </li>
          ))}
          {addressResults.map((r) => (
            <li key={`addr-${r.lat}-${r.lng}`} role="option" aria-selected={false}>
              <button type="button" onMouseDown={() => selectAddress(r)}>
                <span>{r.label}</span>
                <span className="unified-search__tag">indirizzo</span>
              </button>
            </li>
          ))}
          {addressError && <li className="unified-search__error">{addressError}</li>}
        </ul>
      )}
    </form>
  );
}
