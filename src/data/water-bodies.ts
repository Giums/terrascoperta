// Fiumi e laghi principali italiani, monitorati per stress idrico/siccità.
// Coordinate: punto rappresentativo (non l'intero corso/bacino).
export interface WaterBody {
  name: string;
  type: "fiume" | "lago";
  lat: number;
  lng: number;
  region: string;
  description: string;
  source: string;
}

export const waterBodies: WaterBody[] = [
  {
    name: "Po",
    type: "fiume",
    lat: 45.03,
    lng: 9.7,
    region: "Pianura Padana",
    description:
      "Il fiume più lungo d'Italia. Nelle estati 2022 e 2023 ha toccato portate tra le più basse " +
      "mai registrate, con la risalita del cuneo salino dal mare che ha raggiunto decine di km " +
      "nell'entroterra, compromettendo l'irrigazione nel delta.",
    source: "ARPA Piemonte/Emilia-Romagna, Osservatorio permanente utilizzi idrici del distretto del fiume Po",
  },
  {
    name: "Tevere",
    type: "fiume",
    lat: 41.9,
    lng: 12.48,
    region: "Lazio",
    description:
      "Attraversa Roma. Le portate estive sono in calo strutturale da anni, con livelli minimi " +
      "che espongono banchi di sabbia e detriti normalmente sommersi nel tratto urbano.",
    source: "ISPRA, Annuario dei dati ambientali",
  },
  {
    name: "Arno",
    type: "fiume",
    lat: 43.77,
    lng: 11.25,
    region: "Toscana",
    description:
      "Nei mesi estivi più siccitosi la portata a Firenze è scesa a una frazione del valore medio " +
      "storico, al punto da rendere visibile il letto del fiume per larghi tratti.",
    source: "ARPA Toscana, bollettino idrologico",
  },
  {
    name: "Adige",
    type: "fiume",
    lat: 45.44,
    lng: 10.99,
    region: "Veneto",
    description:
      "Secondo fiume italiano per lunghezza. Alimentato in parte da ghiacciai alpini in ritiro: " +
      "il contributo nivo-glaciale alla portata estiva si sta riducendo di anno in anno.",
    source: "ARPA Veneto, bollettino idrologico",
  },
  {
    name: "Lago di Garda",
    type: "lago",
    lat: 45.6,
    lng: 10.6,
    region: "Lombardia/Veneto/Trentino",
    description:
      "Il lago più grande d'Italia. Nell'estate 2022 il livello è sceso vicino ai minimi storici, " +
      "riportando alla luce isolotti e passaggi normalmente sommersi.",
    source: "AIPo, bollettino livelli laghi regolati",
  },
  {
    name: "Lago di Como",
    type: "lago",
    lat: 45.98,
    lng: 9.26,
    region: "Lombardia",
    description:
      "Livelli soggetti a forte variabilità stagionale; le annate più siccitose mostrano un calo " +
      "marcato del livello medio estivo rispetto alla serie storica del secondo dopoguerra.",
    source: "Consorzio dell'Adda, bollettino idrologico",
  },
  {
    name: "Lago Maggiore",
    type: "lago",
    lat: 45.93,
    lng: 8.52,
    region: "Lombardia/Piemonte",
    description:
      "Regolato per uso irriguo e idroelettrico. Nelle estati siccitose il livello scende sotto lo " +
      "zero idrometrico, riducendo la capacità di compensare la magra del Po a valle.",
    source: "Consorzio del Ticino, bollettino idrologico",
  },
  {
    name: "Lago Trasimeno",
    type: "lago",
    lat: 43.13,
    lng: 12.1,
    region: "Umbria",
    description:
      "Bacino poco profondo senza immissari perenni significativi: il livello dipende quasi solo " +
      "da pioggia ed evaporazione. Il restringimento è un fenomeno cronico, documentato da decenni, " +
      "aggravato dai prelievi irrigui e dalle estati più calde e secche.",
    source: "Regione Umbria, Osservatorio risorse idriche",
  },
];
