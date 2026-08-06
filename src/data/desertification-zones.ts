// Aree italiane classificate a rischio desertificazione da ISPRA.
// Coordinate: punto rappresentativo dell'area, non perimetro esatto.
export interface DesertificationZone {
  name: string;
  lat: number;
  lng: number;
  region: string;
  description: string;
  source: string;
}

export const desertificationZones: DesertificationZone[] = [
  {
    name: "Sicilia centro-meridionale",
    lat: 37.5,
    lng: 14.05,
    region: "Enna, Caltanissetta",
    description:
      "Aree collinari a seminativo estensivo con suoli argillosi soggetti a erosione, tra le zone " +
      "italiane classificate a rischio più elevato: la vegetazione mostra segni crescenti di stress " +
      "idrico nelle annate più siccitose.",
    source: "ISPRA, Carta della sensibilità alla desertificazione",
  },
  {
    name: "Campidano",
    lat: 39.4,
    lng: 8.95,
    region: "Sardegna sud-occidentale",
    description:
      "Pianura agricola tra le più aride d'Italia, con prelievi irrigui intensi e falda in calo: la " +
      "copertura vegetale nelle aree marginali si riduce nelle stagioni più calde.",
    source: "ISPRA, Regione Sardegna",
  },
  {
    name: "Tavoliere e Murge",
    lat: 41.15,
    lng: 16.35,
    region: "Puglia",
    description:
      "Grande pianura cerealicola con scarsissima piovosità estiva: la classificazione ISPRA a rischio " +
      "riguarda gran parte del territorio, aggravata da suoli poco profondi sulle Murge.",
    source: "ISPRA, Regione Puglia",
  },
  {
    name: "Aree interne",
    lat: 40.4,
    lng: 16.05,
    region: "Basilicata",
    description:
      "Spopolamento e abbandono agricolo lasciano suoli scoperti più esposti a erosione e perdita di " +
      "sostanza organica, un fattore che aggrava la sensibilità alla desertificazione oltre alla siccità.",
    source: "ISPRA",
  },
  {
    name: "Fascia ionica",
    lat: 39.35,
    lng: 17.05,
    region: "Calabria",
    description:
      "Versante ionico più arido di quello tirrenico, con incendi ricorrenti che lasciano il suolo nudo " +
      "esposto proprio nei mesi di maggiore rischio di piogge intense autunnali.",
    source: "ISPRA",
  },
];
