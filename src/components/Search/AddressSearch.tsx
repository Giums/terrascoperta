import { useState } from "react";
import { searchAddress, type AddressResult } from "../../utils/geocode";
import "./AddressSearch.css";

interface AddressSearchProps {
  onSelect: (result: AddressResult) => void;
}

export default function AddressSearch({ onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 3) return;
    setLoading(true);
    setError(null);
    try {
      const found = await searchAddress(query);
      setResults(found);
      setOpen(true);
      if (found.length === 0) setError("Nessun indirizzo trovato.");
    } catch {
      setError("Ricerca indirizzo non disponibile al momento.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(result: AddressResult) {
    setQuery(result.label);
    setOpen(false);
    onSelect(result);
  }

  return (
    <form className="address-search" onSubmit={handleSubmit}>
      <input
        type="text"
        aria-label="Cerca il tuo indirizzo"
        placeholder="Cerca il tuo indirizzo…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "…" : "Vai"}
      </button>
      {open && (results.length > 0 || error) && (
        <ul className="address-search__results" role="listbox">
          {results.map((r) => (
            <li key={`${r.lat}-${r.lng}`} role="option" aria-selected={false}>
              <button type="button" onMouseDown={() => handleSelect(r)}>
                {r.label}
              </button>
            </li>
          ))}
          {error && <li className="address-search__error">{error}</li>}
        </ul>
      )}
    </form>
  );
}
