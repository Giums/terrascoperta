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
  {
    name: "Dora Baltea",
    type: "fiume",
    lat: 45.68,
    lng: 7.35,
    region: "Valle d'Aosta",
    description:
      "Alimentato dai ghiacciai del Monte Bianco e del Monte Rosa: il ritiro glaciale ne sta " +
      "cambiando il regime, con portate estive sempre più anticipate rispetto al passato invece " +
      "che distribuite lungo tutta la stagione calda.",
    source: "ARPA Valle d'Aosta, bollettino nivo-glaciologico",
  },
  {
    name: "Adda",
    type: "fiume",
    lat: 45.31,
    lng: 9.5,
    region: "Lombardia",
    description:
      "Esce regolato dal Lago di Como e attraversa una delle zone a irrigazione più intensiva " +
      "d'Europa: nelle estati siccitose la competizione tra rilascio a valle e mantenimento del " +
      "livello del lago diventa un tema politico, non solo tecnico.",
    source: "Consorzio dell'Adda, bollettino idrologico",
  },
  {
    name: "Piave",
    type: "fiume",
    lat: 45.68,
    lng: 12.35,
    region: "Veneto",
    description:
      "Il \"fiume sacro alla patria\" è oggi anche uno dei più regolati d'Italia, con decine di " +
      "derivazioni per centrali idroelettriche: nei mesi estivi il tratto medio-basso può restare " +
      "quasi in secca per lunghi tratti quando la portata derivata supera quella naturale.",
    source: "ARPA Veneto, bollettino idrologico",
  },
  {
    name: "Tagliamento",
    type: "fiume",
    lat: 45.9,
    lng: 13.0,
    region: "Friuli-Venezia Giulia",
    description:
      "Uno degli ultimi grandi fiumi europei a canali intrecciati (letto ghiaioso ampio e non " +
      "canalizzato) ancora in condizioni vicine al naturale — ma i prelievi irrigui a monte stanno " +
      "crescendo, e con loro il rischio di perdere proprio la caratteristica che lo rende unico.",
    source: "ARPA Friuli Venezia Giulia, bollettino idrologico",
  },
  {
    name: "Secchia",
    type: "fiume",
    lat: 44.8,
    lng: 10.9,
    region: "Emilia-Romagna",
    description:
      "Affluente del Po nella bassa pianura emiliana, a regime torrentizio: portate estive minime " +
      "spesso vicine allo zero nel tratto di pianura, dove l'acqua viene quasi interamente " +
      "captata a monte per l'irrigazione.",
    source: "ARPA Emilia-Romagna, bollettino idrologico",
  },
  {
    name: "Volturno",
    type: "fiume",
    lat: 41.18,
    lng: 14.05,
    region: "Campania",
    description:
      "Il fiume più lungo dell'Italia meridionale. Riceve gli scarichi di una delle aree più " +
      "densamente popolate e industrializzate del Sud: il tema qui non è solo la quantità d'acqua " +
      "ma anche la qualità, con criticità ricorrenti segnalate nei tratti a valle di Caserta.",
    source: "ARPA Campania, bollettino qualità acque",
  },
  {
    name: "Sele",
    type: "fiume",
    lat: 40.55,
    lng: 15.15,
    region: "Campania",
    description:
      "Attraversa la Piana del Sele, area a orticoltura intensiva ad alto valore agricolo: la " +
      "pressione sui prelievi per l'irrigazione è tra le più alte del Mezzogiorno, con episodi di " +
      "magra estiva sempre più marcati negli ultimi anni.",
    source: "Autorità di Bacino Distrettuale dell'Appennino Meridionale",
  },
  {
    name: "Crati",
    type: "fiume",
    lat: 39.5,
    lng: 16.35,
    region: "Calabria",
    description:
      "Il fiume più lungo della Calabria, attraversa la piana di Sibari. Le estati più siccitose " +
      "degli ultimi anni hanno portato la portata a valori tra i più bassi mai registrati, con " +
      "ripercussioni dirette sull'agricoltura della piana.",
    source: "ARPA Calabria, bollettino idrologico",
  },
  {
    name: "Simeto",
    type: "fiume",
    lat: 37.4,
    lng: 14.9,
    region: "Sicilia",
    description:
      "Il fiume più lungo della Sicilia, attraversa la piana di Catania. Gli invasi che lo " +
      "regolano a monte (Pozzillo, Ancipa) hanno registrato negli ultimi anni livelli critici, " +
      "mettendo in difficoltà l'approvvigionamento irriguo di una delle aree agricole più " +
      "produttive dell'isola.",
    source: "ARPA Sicilia, bollettino siccità",
  },
  {
    name: "Tirso",
    type: "fiume",
    lat: 39.9,
    lng: 8.85,
    region: "Sardegna",
    description:
      "Il fiume più lungo della Sardegna, alimenta il più grande lago artificiale d'Italia (Lago " +
      "Omodeo). La Sardegna è la regione italiana più esposta a siccità pluriennale: qui la " +
      "differenza tra un'annata piovosa e una secca si vede prima che altrove.",
    source: "ADIS (Agenzia Distretto Idrografico della Sardegna)",
  },
  {
    name: "Lago di Bracciano",
    type: "lago",
    lat: 42.12,
    lng: 12.19,
    region: "Lazio",
    description:
      "Nell'estate 2017 il livello scese così tanto, dopo mesi di prelievi per l'acquedotto di " +
      "Roma sommati alla siccità, che un'ordinanza regionale sospese temporaneamente i prelievi per " +
      "proteggere l'ecosistema del lago — un caso che portò per la prima volta il tema della " +
      "sicurezza idrica della capitale al centro del dibattito pubblico.",
    source: "Regione Lazio, ordinanza n. 71/2017; ARPA Lazio",
  },
  {
    name: "Lago d'Iseo",
    type: "lago",
    lat: 45.72,
    lng: 10.07,
    region: "Lombardia",
    description:
      "Il quarto lago italiano per superficie, meno regolato dei vicini Garda e Como: proprio per " +
      "questo il suo livello riflette più direttamente l'andamento delle precipitazioni stagionali, " +
      "senza la compensazione artificiale che attutisce le magre altrove.",
    source: "ARPA Lombardia, bollettino idrologico",
  },
  {
    name: "Lago di Bilancino",
    type: "lago",
    lat: 44.02,
    lng: 11.25,
    region: "Toscana",
    description:
      "Invaso artificiale che fornisce l'acqua potabile all'area metropolitana di Firenze e " +
      "regola la portata dell'Arno a valle: nelle estati più siccitose il suo livello viene " +
      "monitorato quasi quotidianamente, perché da lì dipende sia l'acqua da bere che il fiume.",
    source: "Autorità Idrica Toscana, bollettino invasi",
  },
  {
    name: "Lago di Campotosto",
    type: "lago",
    lat: 42.56,
    lng: 13.38,
    region: "Abruzzo",
    description:
      "Il più grande lago artificiale dell'Appennino, a quasi 1400m di quota. Alimenta centrali " +
      "idroelettriche e regola le portate del Vomano a valle: le annate con scarso innevamento " +
      "invernale sull'Appennino si ripercuotono direttamente sul suo livello estivo.",
    source: "ARPA Abruzzo, bollettino idrologico",
  },
  {
    name: "Lago di Occhito",
    type: "lago",
    lat: 41.63,
    lng: 14.98,
    region: "Puglia/Molise",
    description:
      "Uno dei più grandi invasi artificiali d'Italia per capacità, sul confine tra Puglia e " +
      "Molise. La Puglia non ha fiumi perenni significativi propri: dipende quasi interamente da " +
      "invasi come questo e dall'Acquedotto Pugliese, il che la rende strutturalmente più " +
      "vulnerabile alla siccità pluriennale rispetto a regioni con bacini naturali.",
    source: "Autorità di Bacino Distrettuale dell'Appennino Meridionale",
  },
  {
    name: "Lago del Pertusillo",
    type: "lago",
    lat: 40.33,
    lng: 15.85,
    region: "Basilicata",
    description:
      "Invaso artificiale che fornisce acqua potabile e irrigua a gran parte della Basilicata e " +
      "della Puglia. Si trova anche al centro dell'area di estrazione petrolifera della Val " +
      "d'Agri: qui il tema della risorsa idrica si intreccia con quello del controllo ambientale " +
      "delle attività estrattive circostanti.",
    source: "ARPA Basilicata, bollettino invasi",
  },
  {
    name: "Lago Omodeo",
    type: "lago",
    lat: 40.13,
    lng: 8.9,
    region: "Sardegna",
    description:
      "Il lago artificiale più esteso d'Italia, sul fiume Tirso. Nelle annate più siccitose il suo " +
      "livello scende di decine di metri rispetto al massimo di invaso, riportando alla luce " +
      "strutture e terreni normalmente sommersi — un indicatore visivo diretto dello stato della " +
      "siccità pluriennale in Sardegna.",
    source: "ADIS (Agenzia Distretto Idrografico della Sardegna)",
  },
  {
    name: "Lago Pergusa",
    type: "lago",
    lat: 37.52,
    lng: 14.29,
    region: "Sicilia",
    description:
      "L'unico lago naturale della Sicilia, al centro dell'isola. Il suo restringimento è un " +
      "fenomeno cronico documentato da decenni, aggravato da prelievi, dalla presenza di un " +
      "autodromo costruito sulle sue rive e da estati sempre più calde e secche.",
    source: "ARPA Sicilia, Regione Siciliana",
  },
  {
    name: "Esino",
    type: "fiume",
    lat: 43.55,
    lng: 13.2,
    region: "Marche",
    description:
      "Il principale fiume delle Marche centrali, attraversa Jesi prima di sfociare nell'Adriatico. " +
      "Come molti fiumi appenninici a regime torrentizio, nei mesi estivi la sua portata naturale " +
      "può ridursi drasticamente, aggravata dai prelievi per l'irrigazione della vallata.",
    source: "ARPA Marche, bollettino idrologico",
  },
];
