// Casi studio di grandi incendi recenti in Italia. Coordinate: punto
// rappresentativo dell'area colpita, non perimetro esatto del rogo.
export interface FireEvent {
  name: string;
  lat: number;
  lng: number;
  region: string;
  year: number;
  description: string;
  source: string;
}

export const fires: FireEvent[] = [
  {
    name: "Incendi Montiferru",
    lat: 40.06,
    lng: 8.73,
    region: "Sardegna (Oristano)",
    year: 2021,
    description:
      "Uno dei roghi più estesi mai registrati in Sardegna, decine di migliaia di ettari di bosco e " +
      "macchia mediterranea bruciati in pochi giorni con vento di scirocco, migliaia di persone evacuate.",
    source: "EFFIS (European Forest Fire Information System), Copernicus EMS",
  },
  {
    name: "Incendi Aspromonte",
    lat: 38.18,
    lng: 15.9,
    region: "Calabria (Reggio Calabria)",
    year: 2021,
    description:
      "Incendi ricorrenti quasi ogni estate nel Parco Nazionale dell'Aspromonte, spesso di origine " +
      "dolosa: la vegetazione bruciata ripetutamente fatica a rigenerarsi tra un episodio e l'altro.",
    source: "EFFIS, Corpo Forestale",
  },
  {
    name: "Incendi Sicilia orientale",
    lat: 37.6,
    lng: 14.9,
    region: "Sicilia (Catania/Enna)",
    year: 2023,
    description:
      "Estati di caldo record e siccità hanno favorito incendi su versanti collinari e aree agricole " +
      "abbandonate, con superfici bruciate anno su anno tra le più alte in Italia.",
    source: "EFFIS, ISPRA",
  },
  {
    name: "Incendi Vesuvio",
    lat: 40.79,
    lng: 14.43,
    region: "Campania (Napoli)",
    year: 2017,
    description:
      "Il Parco Nazionale del Vesuvio ha perso una quota rilevante della propria copertura boschiva in " +
      "un'unica stagione, con danni all'ecosistema visibili per anni nelle immagini satellitari NBR.",
    source: "EFFIS, Parco Nazionale del Vesuvio",
  },
];
