export interface AddressResult {
  label: string;
  lat: number;
  lng: number;
}

/**
 * Geocoding indirizzi via Nominatim (OpenStreetMap), gratuito e senza API
 * key. La usage policy di Nominatim chiede di non interrogarlo ad ogni
 * tasto premuto e di limitarsi a poche richieste al secondo — questa
 * funzione va chiamata solo alla conferma della ricerca (submit), mai in
 * live-autocomplete. https://operations.osmfoundation.org/policies/nominatim/
 */
export async function searchAddress(query: string): Promise<AddressResult[]> {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=5` +
    `&countrycodes=it&accept-language=it&q=${encodeURIComponent(query)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Ricerca indirizzo non disponibile");
  const json: { display_name: string; lat: string; lon: string }[] = await res.json();

  return json.map((r) => ({
    label: r.display_name,
    lat: Number(r.lat),
    lng: Number(r.lon),
  }));
}
