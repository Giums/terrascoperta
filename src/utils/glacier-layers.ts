/**
 * Contorni dei ghiacciai da GLIMS (Global Land Ice Measurements from Space,
 * ospitato da NSIDC), via WMS pubblico senza credenziali.
 *
 * PERCHÉ SOLO CONTORNI E NESSUN NUMERO — deciso dopo aver guardato i dati.
 * GLIMS raccoglie delineazioni depositate da gruppi di ricerca diversi, con
 * criteri diversi: per lo stesso ghiacciaio e lo stesso anno convivono rilievi
 * che differiscono di un ordine di grandezza (l'Adamello nel 2011 risulta
 * 0,25 / 9,09 / 15,76 km²; confrontando due campagne coerenti per autore,
 * 2003→2016, "crescerebbe" da 10,10 a 14,36 km²). Una serie storica dell'area
 * costruita su questo mostrerebbe ghiacciai che si espandono, cioè un dato
 * falso. I contorni invece sono geometrie reali: sovrapposti all'immagine
 * satellitare di oggi mostrano il ritiro senza che noi si calcoli nulla.
 * Per i numeri veri servono WGMS (misure a terra, 448 ghiacciai italiani) o il
 * Catasto dei Ghiacciai Italiani — citati nel pannello, non ricalcolati qui.
 */

const WMS = "https://www.glims.org/geoserver/GLIMS/wms";
const LAYER = "GLIMS_Glacier_Outlines";

/** "compare" disegna le due epoche insieme, ed è il motivo per cui esiste il layer. */
export type GlacierEpoch = "historic" | "recent" | "compare";

/**
 * Due finestre e non anni singoli: i rilievi non seguono una cadenza fissa,
 * un anno preciso spesso non ha nulla mentre quelli intorno sì. Raggruppare
 * per campagna dà due immagini confrontabili invece di buchi.
 */
export const GLACIER_EPOCHS: Record<"historic" | "recent", { from: string; to: string; label: string }> = {
  historic: { from: "2000-01-01", to: "2003-12-31", label: "2000–2003" },
  recent: { from: "2013-01-01", to: "2016-12-31", label: "2013–2016" },
};

/**
 * Ruotare la tonalità del solo strato storico è ciò che rende leggibile il
 * confronto: i tile arrivano già colorati dal server, tutti dello stesso rosa,
 * e due epoche sovrapposte nello stesso colore sono indistinguibili —
 * alternandole l'occhio non ha un riferimento fisso e "sembra sempre uguale".
 * Con lo storico virato e il recente al colore originale, il ritiro è la
 * frangia colorata che resta scoperta. 150° sul rosa di GLIMS (~330°) cade sul
 * verde: se cambi questo valore, aggiorna anche il colore della legenda in
 * LayerControls, altrimenti la legenda mente.
 */
export const HISTORIC_HUE_ROTATE = 150;

export const GLIMS_ATTRIBUTION = "GLIMS / NSIDC";

/**
 * Aree italiane dove i ghiacciai esistono davvero. Fuori di qui il controllo
 * non ha senso: offrirlo su Roma o sul mare significa proporre un layer che
 * non disegnerà mai nulla, e chi lo attiva pensa che sia rotto.
 * Bbox generosi (non i perimetri esatti): servono a decidere se mostrare un
 * comando, non a filtrare i dati — quelli li filtra già il WMS.
 */
const GLACIER_AREAS: { minLat: number; maxLat: number; minLng: number; maxLng: number }[] = [
  // Arco alpino italiano, dalle Marittime alle Giulie
  { minLat: 44.0, maxLat: 47.2, minLng: 6.5, maxLng: 13.7 },
  // Gran Sasso: il Calderone, l'unico ghiacciaio appenninico
  { minLat: 42.3, maxLat: 42.6, minLng: 13.4, maxLng: 13.7 },
];

/** true se il punto guardato è in una zona che ha ghiacciai. */
export function hasGlaciersNearby(lat: number, lng: number): boolean {
  return GLACIER_AREAS.some(
    (a) => lat >= a.minLat && lat <= a.maxLat && lng >= a.minLng && lng <= a.maxLng,
  );
}

/** URL template per un raster source MapLibre (placeholder bbox di MapLibre). */
export function glacierTileUrl(epoch: "historic" | "recent"): string {
  const { from, to } = GLACIER_EPOCHS[epoch];
  const cql = `src_date DURING ${from}T00:00:00Z/${to}T23:59:59Z`;
  const params = new URLSearchParams({
    service: "WMS",
    version: "1.1.1",
    request: "GetMap",
    layers: LAYER,
    styles: "",
    format: "image/png",
    transparent: "true",
    srs: "EPSG:3857",
    width: "256",
    height: "256",
    CQL_FILTER: cql,
  });
  // bbox va aggiunto fuori da URLSearchParams: MapLibre sostituisce il
  // segnaposto testualmente e l'encoding delle graffe lo romperebbe.
  return `${WMS}?${params}&bbox={bbox-epsg-3857}`;
}
