// Casi studio di rischio idrogeologico (alluvioni, frane) collegati a incendi
// e desertificazione. Coordinate: punto rappresentativo dell'area.
export interface HydroRiskCase {
  name: string;
  lat: number;
  lng: number;
  region: string;
  description: string;
  source: string;
}

export const hydroRiskCases: HydroRiskCase[] = [
  {
    name: "Sardegna: dagli incendi 2021 alle piene successive",
    lat: 40.0,
    lng: 8.8,
    region: "Oristano",
    description:
      "Nelle stagioni successive ai grandi incendi del 2021, i versanti rimasti senza copertura " +
      "vegetale hanno mostrato una risposta idrologica più rapida alle piogge intense: meno " +
      "assorbimento, più ruscellamento superficiale nei bacini a valle delle aree bruciate.",
    source: "ISPRA, Autorità di bacino distrettuale della Sardegna",
  },
  {
    name: "Calabria: incendi ricorrenti e dissesto",
    lat: 38.9,
    lng: 16.25,
    region: "Sila e versante ionico",
    description:
      "Zona con alta frequenza di incendi boschivi e allo stesso tempo alta densità di frane censite: " +
      "la vegetazione che normalmente trattiene il versante manca proprio dove il terreno è già fragile.",
    source: "ISPRA, Inventario dei Fenomeni Franosi in Italia (IFFI)",
  },
  {
    name: "Sicilia orientale: siccità e alluvioni lampo",
    lat: 37.5,
    lng: 15.05,
    region: "Catania",
    description:
      "Suoli induriti da mesi di siccità assorbono poco quando arrivano piogge intense e concentrate: " +
      "la combinazione produce alluvioni lampo anche in bacini idrografici di dimensioni modeste.",
    source: "ISPRA, Regione Siciliana",
  },
  {
    name: "Emilia-Romagna: alluvioni 2023",
    lat: 44.4,
    lng: 11.9,
    region: "Romagna",
    description:
      "Eventi alluvionali eccezionali per estensione e numero di frane simultanee, in un territorio con " +
      "suolo già saturo dopo settimane di piogge: un caso di rischio idrogeologico non legato a siccità " +
      "pregressa, a ricordare che le cause sono molteplici e non sempre lo stesso schema si applica.",
    source: "Copernicus EMS, ISPRA",
  },
];
