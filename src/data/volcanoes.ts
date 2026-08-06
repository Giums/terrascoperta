export interface Volcano {
  name: string;
  lat: number;
  lng: number;
  region: string;
  type: string;
  description: string;
  ingvUrl: string;
  webcamUrl: string;
}

export const volcanoes: Volcano[] = [
  {
    name: "Etna",
    lat: 37.75,
    lng: 15.0,
    region: "Sicilia",
    type: "Stratovulcano attivo",
    description:
      "Il vulcano più attivo d'Europa, in eruzione quasi costante da decenni: fontane di lava, colate " +
      "ed emissioni di cenere sono eventi frequenti, monitorati in tempo reale dall'Osservatorio Etneo.",
    ingvUrl: "https://www.ct.ingv.it/",
    webcamUrl: "https://www.ct.ingv.it/index.php/monitoraggio-e-sorveglianza/segnali-in-tempo-reale/video-sorveglianza-vulcanica-etna",
  },
  {
    name: "Vesuvio",
    lat: 40.82,
    lng: 14.43,
    region: "Campania",
    type: "Stratovulcano quiescente",
    description:
      "Quiescente dall'ultima eruzione del 1944, ma resta tra i vulcani più pericolosi al mondo per " +
      "popolazione esposta: oltre 3 milioni di persone vivono nell'area metropolitana circostante.",
    ingvUrl: "https://www.ov.ingv.it/",
    webcamUrl: "https://www.ov.ingv.it/index.php/monitoraggio-e-infrastrutture/segnali-in-tempo-reale/video-sorveglianza",
  },
  {
    name: "Stromboli",
    lat: 38.79,
    lng: 15.21,
    region: "Sicilia (Isole Eolie)",
    type: "Vulcano a condotto aperto",
    description:
      "In attività pressoché ininterrotta da secoli, con piccole esplosioni regolari ogni pochi minuti " +
      "('attività stromboliana'), intervallate da fasi più intense come parossismi e colate laviche.",
    ingvUrl: "https://www.ct.ingv.it/",
    webcamUrl: "https://www.ct.ingv.it/index.php/monitoraggio-e-sorveglianza/segnali-in-tempo-reale/video-sorveglianza-vulcanica-isole-eolie",
  },
  {
    name: "Campi Flegrei",
    lat: 40.83,
    lng: 14.14,
    region: "Campania",
    type: "Caldera vulcanica",
    description:
      "Caldera densamente abitata sotto bradisismo: il suolo si solleva e abbassa da anni per movimento " +
      "di fluidi e gas in profondità, accompagnato da sciami sismici frequenti nell'area di Pozzuoli.",
    ingvUrl: "https://www.ov.ingv.it/",
    webcamUrl: "https://www.ov.ingv.it/index.php/monitoraggio-e-infrastrutture/segnali-in-tempo-reale/video-sorveglianza",
  },
];
