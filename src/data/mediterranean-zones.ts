// Punti al largo (verificati live contro Open-Meteo Marine — nessuno cade su
// una cella di terra, vedi la sessione in cui è stato scoperto il problema
// per due zone italiane) usati per condizioni attuali (temperatura, livello)
// e un profilo di cosa succede alla fauna marina in quel bacino. Il profilo è
// narrativa con fonte, non un dato calcolato — stesso pattern dei case study
// di Incendi/Idrogeologico/Desertificazione.
export interface MediterraneanZone {
  name: string;
  country: string;
  lat: number;
  lng: number;
  fauna: string;
  source: string;
  sourceUrl: string;
}

// Cinque "profili" reali e documentati, applicati alla zona che li rappresenta
// meglio — non tutte le 14 zone hanno una storia scientifica distinta propria,
// ma il fenomeno regionale sì.
const NW_MED_HEATWAVE =
  "Il Mediterraneo nord-occidentale è il bacino con più episodi documentati di moria di massa di " +
  "gorgonie e coralli (Paramuricea clavata, Corallium rubrum) per ondate di calore marine — eventi " +
  "ricorrenti dal 1999, non un caso isolato. Le specie coloniali a crescita lenta non si riprendono " +
  "nell'arco di pochi anni: un episodio di mortalità può azzerare decenni di crescita.";

const ADRIATIC_SHALLOW =
  "Bacino poco profondo, si scalda e si raffredda più in fretta del resto del Mediterraneo. Storicamente " +
  "soggetto a fioriture di meduse e, nell'alto Adriatico, a episodi di ipossia/anossia sul fondale nelle " +
  "estati più calde — l'acqua stratificata in superficie impedisce all'ossigeno di raggiungere il fondo.";

const CENTRAL_MED_GATEWAY =
  "Punto di passaggio per specie che risalgono dal Mediterraneo orientale verso ovest, e area di " +
  "riproduzione storica del tonno rosso (Thunnus thynnus). Le acque più calde negli ultimi decenni hanno " +
  "reso più semplice a specie non native stabilirsi anche qui, non solo nel Levantino.";

const LEVANTINE_TROPICALIZATION =
  "Il sotto-bacino che si scalda più in fretta e il primo punto d'ingresso per specie del Mar Rosso/Indo-" +
  "Pacifico attraverso il Canale di Suez ('migrazione lessepsiana') — pesce scorpione (Pterois miles), " +
  "pesci coniglio (Siganus spp.), il pesce palla velenoso Lagocephalus sceleratus. Non fenomeni rari o " +
  "isolati: popolazioni ormai stabili che stanno spostando l'equilibrio verso specie tropicali.";

const ALBORAN_ATLANTIC_INFLOW =
  "Regime oceanografico diverso dal resto del Mediterraneo: l'ingresso di acqua atlantica dallo Stretto di " +
  "Gibilterra porta upwelling e acque più fredde e ricche di nutrienti, rendendo questo bacino finora più " +
  "resiliente alle ondate di calore marine che colpiscono duramente il resto del Mediterraneo.";

export const mediterraneanZones: MediterraneanZone[] = [
  {
    name: "Mar Ligure",
    country: "Italia",
    lat: 43.8,
    lng: 9.2,
    fauna: NW_MED_HEATWAVE,
    source: "Copernicus Marine Service — Mediterranean Heat Waves Monitoring",
    sourceUrl: "https://marine.copernicus.eu/services/use-cases/mediterranean-heat-waves-monitoring-service",
  },
  {
    name: "Golfo del Leone",
    country: "Francia",
    lat: 42.7,
    lng: 4.5,
    fauna: NW_MED_HEATWAVE,
    source: "Copernicus Marine Service — Mediterranean Heat Waves Monitoring",
    sourceUrl: "https://marine.copernicus.eu/services/use-cases/mediterranean-heat-waves-monitoring-service",
  },
  {
    name: "Mar Baleare",
    country: "Spagna",
    lat: 40.0,
    lng: 2.5,
    fauna: NW_MED_HEATWAVE,
    source: "Copernicus Marine Service — Mediterranean Heat Waves Monitoring",
    sourceUrl: "https://marine.copernicus.eu/services/use-cases/mediterranean-heat-waves-monitoring-service",
  },
  {
    name: "Mar Tirreno",
    country: "Italia",
    lat: 40.0,
    lng: 13.5,
    fauna: NW_MED_HEATWAVE,
    source: "Copernicus Marine Service — Mediterranean Heat Waves Monitoring",
    sourceUrl: "https://marine.copernicus.eu/services/use-cases/mediterranean-heat-waves-monitoring-service",
  },
  {
    name: "Mar di Sardegna",
    country: "Italia",
    lat: 40.0,
    lng: 8.0,
    fauna: NW_MED_HEATWAVE,
    source: "Copernicus Marine Service — Mediterranean Heat Waves Monitoring",
    sourceUrl: "https://marine.copernicus.eu/services/use-cases/mediterranean-heat-waves-monitoring-service",
  },
  {
    name: "Adriatico settentrionale",
    country: "Italia",
    lat: 44.9,
    lng: 13.6,
    fauna: ADRIATIC_SHALLOW,
    source: "GFCM — General Fisheries Commission for the Mediterranean (FAO)",
    sourceUrl: "https://www.fao.org/gfcm/en/",
  },
  {
    name: "Adriatico meridionale",
    country: "Italia",
    lat: 43.3,
    lng: 14.2,
    fauna: ADRIATIC_SHALLOW,
    source: "GFCM — General Fisheries Commission for the Mediterranean (FAO)",
    sourceUrl: "https://www.fao.org/gfcm/en/",
  },
  {
    name: "Mar Ionio",
    country: "Italia/Grecia",
    lat: 38.5,
    lng: 17.5,
    fauna: CENTRAL_MED_GATEWAY,
    source: "GFCM — General Fisheries Commission for the Mediterranean (FAO)",
    sourceUrl: "https://www.fao.org/gfcm/en/",
  },
  {
    name: "Canale di Sicilia",
    country: "Italia/Tunisia",
    lat: 36.7,
    lng: 13.8,
    fauna: CENTRAL_MED_GATEWAY,
    source: "GFCM — General Fisheries Commission for the Mediterranean (FAO)",
    sourceUrl: "https://www.fao.org/gfcm/en/",
  },
  {
    name: "Golfo della Sirte",
    country: "Libia",
    lat: 32.8,
    lng: 18.0,
    fauna: CENTRAL_MED_GATEWAY,
    source: "GFCM — General Fisheries Commission for the Mediterranean (FAO)",
    sourceUrl: "https://www.fao.org/gfcm/en/",
  },
  {
    name: "Mar Egeo",
    country: "Grecia",
    lat: 37.5,
    lng: 25.0,
    fauna: LEVANTINE_TROPICALIZATION,
    source: "IUCN Mediterranean — specie aliene marine",
    sourceUrl: "https://www.iucn.org/our-union/commissions/group/iucn-ssc-mediterranean-marine-fish-red-list-authority",
  },
  {
    name: "Mar Cretese",
    country: "Grecia",
    lat: 35.6,
    lng: 25.0,
    fauna: LEVANTINE_TROPICALIZATION,
    source: "IUCN Mediterranean — specie aliene marine",
    sourceUrl: "https://www.iucn.org/our-union/commissions/group/iucn-ssc-mediterranean-marine-fish-red-list-authority",
  },
  {
    name: "Levantino",
    country: "Cipro/Israele/Libano",
    lat: 33.7,
    lng: 33.0,
    fauna: LEVANTINE_TROPICALIZATION,
    source: "IUCN Mediterranean — specie aliene marine",
    sourceUrl: "https://www.iucn.org/our-union/commissions/group/iucn-ssc-mediterranean-marine-fish-red-list-authority",
  },
  {
    name: "Mar di Alboran",
    country: "Spagna/Marocco",
    lat: 35.9,
    lng: -3.5,
    fauna: ALBORAN_ATLANTIC_INFLOW,
    source: "Copernicus Marine Service — Mediterranean Heat Waves Monitoring",
    sourceUrl: "https://marine.copernicus.eu/services/use-cases/mediterranean-heat-waves-monitoring-service",
  },
];
