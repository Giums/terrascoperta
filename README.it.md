# 🌍 TerraScoperta

**[🇬🇧 Read in English](README.md)**

Un sito web interattivo ed educativo che mostra fenomeni climatici e ambientali in Italia, usando dati satellitari e sensori pubblici reali. Nato come tracker delle isole di calore urbane (UHI); cresciuto in sette moduli che coprono calore, acqua, vulcani, incendi, desertificazione, rischio idrogeologico e terremoti — tutto costruito da una persona sola su dati pubblici e gratuiti. L'obiettivo non è solo mostrare il problema, ma renderlo azionabile: cosa può fare una città, e — altrettanto importante — cosa può fare un singolo cittadino a casa propria.

## Moduli

- 🌡️ **Calore** — intensità UHI stimata per città italiana, meteo live, simulatore di mitigazione (slider verde/albedo), stimatore di costi e risparmi, confronto storico con estati passate, sezione "cosa puoi fare a casa tua" (tetti freddi, membrane riflettenti, tetti verdi, pre-raffreddamento evaporativo del condizionatore, guadagno di resa dei pannelli solari con un tetto più fresco, e altro).
- 💧 **Acqua** — fiumi e laghi principali, case study su siccità/restringimento, livello idrometrico live per la Lombardia (sensori ARPA), temperatura del mare regionale (6 zone costiere, la più vicina a dove stai guardando sulla mappa), overlay satellitare NDWI per vedere l'acqua superficiale direttamente, un overlay radar Sentinel-1 SAR che vede sotto le nuvole (l'NDWI ottico no) — utile per la mappatura delle alluvioni durante un temporale — e 14 punti sparsi in tutto il Mediterraneo con temperatura/livello del mare live (Open-Meteo Marine) più una narrazione con fonte su cosa succede alla fauna marina in quel sotto-bacino (ondate di calore marine, tropicalizzazione, fioriture di meduse — fenomeni reali documentati, non dati live).
- 🌋 **Vulcani** — Etna, Vesuvio, Stromboli, Campi Flegrei; sismicità live vicino a ognuno (INGV), link alle webcam ufficiali (galleria foto incorporata per Etna/Stromboli, link diretto per gli altri), overlay satellitare SWIR per calore/colate laviche, **overlay SO₂ + Indice Aerosol (Sentinel-5P/TROPOMI)** che mostrano dove sta andando un pennacchio vulcanico, un **percorso del segnale termico giorno per giorno** ricostruito dagli ultimi 5 giorni di punti caldi VIIRS (vedi sotto) — più un link a Copernicus CAMS per le previsioni orarie di dispersione della cenere, e (solo Etna) un approfondimento reale sulle chiusure dell'aeroporto di Catania per cenere vulcanica.
- 🔥 **Incendi** — case study storici, overlay satellitare NBR per le cicatrici da incendio, **focolai live** (VIIRS/NASA FIRMS, ultime 24h, ognuno cliccabile), e **posizioni live della flotta antincendio Canadair/Erickson** con traccia di volo al click (vedi sotto).
- 🏜️ **Desertificazione** — aree classificate a rischio da ISPRA, overlay NDVI per vedere lo stress della vegetazione direttamente, e (cercando un indirizzo o cliccando una città) una **lettura NDVI live su quel punto esatto** — vedi sotto.
- 🌊 **Rischio idrogeologico** — come incendi e desertificazione portano a suolo nudo e alluvioni lampo/frane, dati di rischio ISPRA, un rimando a EGMS (servizio Copernicus di movimento del suolo) per le vere misurazioni di subsidenza, e (cercando un indirizzo o cliccando una città) un **controllo live del rischio frana/alluvione su quel punto esatto** — vedi sotto.
- 🌍 **Terremoti** — sismicità live su tutta Italia (INGV, ultimi 7 giorni, magnitudo ≥ 2.0), una spiegazione del perché esistono scale di magnitudo diverse (ML/Mw/Md) e di come la magnitudo differisca dalla scala di intensità Mercalli.

Tutte le stime sono dichiarate esplicitamente come modelli, non misurazioni — vedi [Metodologia](#metodologia-e-fonti) qui sotto. Ogni modulo legato a un rischio mostra anche indicazioni di sicurezza ufficiali (fonte Protezione Civile / iononrischio.gov.it, non scritte a memoria) e, dove rilevante, un avviso live Copernicus EMS (vedi sotto).

### Avvisi live sulle attivazioni Copernicus EMS

Vulcani, Incendi, Rischio idrogeologico e Terremoti controllano, all'apertura, se c'è un'attivazione Copernicus EMS Rapid Mapping **davvero attiva** nelle vicinanze (entro 150km) — non una qualunque tra tutte quelle mai aperte, che per lo più sarebbero vecchi progetti di pianificazione del rischio di mesi fa. Due filtri rendono questo dato utile invece che fuorviante:

- **Corrispondenza di categoria**: un'attivazione per incendio compare solo nel modulo Incendi, una per alluvione/frana solo in Rischio idrogeologico, e così via (`categorySlug` dell'API EMS: `fire`, `flood`, `mass`, `volcan`, `earthquake`).
- **Corrispondenza di fase**: conta solo `drmPhase: "response"` (un'emergenza acuta, appena dichiarata) — le attivazioni `"preparedness"` e `"recovery"` sono prodotti EMS legittimi ma possono restare aperte per mesi e non significano "sta succedendo qualcosa qui adesso", quindi sono escluse.

Se non c'è corrispondenza, non si mostra nulla — niente sezione vuota, niente placeholder. Il backend fa da proxy verso `mapping.emergency.copernicus.eu` (l'API non ha CORS), con cache di 15 minuti.

### Controlli live per punto: rischio idrogeologico e desertificazione

Cerca un indirizzo, o clicca un marker città, e il pannello di dettaglio controlla quel **punto esatto** su due fonti live — non i marker fissi dei casi studio che quei due moduli mostrano di default:

- **Rischio idrogeologico**: interroga il WMS pubblico di ISPRA IdroGEO (`idrogeo.isprambiente.it`, il mosaico nazionale PAI) via `GetFeatureInfo`, sia per la pericolosità da frana (`idrogeo:pericolosita`, classificazione IFFI/PAI P1–P4) che per quella da alluvione (`idrogeo:pericolosita_alluvioni`, P1–P3) su quel punto.
- **Salute della vegetazione / desertificazione**: interroga la **Statistical API** di Copernicus Data Space per una media NDVI live da Sentinel-2 su una piccola area (~500m) intorno al punto, ultimi 45 giorni — riusa lo stesso token OAuth a vita breve già emesso per gli overlay satellitari (`useSentinelToken`), il client secret non tocca mai il browser.

Entrambe sono semplici `fetch` lato client verso endpoint pubblici con CORS aperto (verificato dal vivo, non assunto); il pannello mostra un bordo evidenziato quando trova un rischio/stress reale, e si nasconde del tutto se Sentinel Hub non è configurato in quel deployment.

La barra di ricerca indirizzo/città è ora raggiungibile dall'header di ogni modulo, non solo Calore. I marker delle città sono cliccabili in Calore, Desertificazione e Rischio idrogeologico (gli altri moduli mantengono i propri marker dedicati). Il pannello di dettaglio città si adatta al modulo da cui l'hai aperto: Calore mostra la scheda completa UHI/simulatore/costi/risparmi; Desertificazione e Rischio idrogeologico mostrano solo il meteo live più il loro unico controllo live pertinente — il resto dei contenuti pensati per Calore viene tolto perché non rilevante lì.

### Percorso del segnale termico vulcanico (ultimi 5 giorni)

Ispirato alle ricostruzioni che un analista fa a mano, tracciando il fronte di una colata su più giorni di immagini Sentinel-2 SWIR (con date e quote scritte a lato) — quel livello di dettaglio richiede l'interpretazione umana delle immagini, non è qualcosa che un'API può produrre da sola. Quello che è automatizzabile con dati che l'app ha già: selezionando un vulcano si interroga NASA FIRMS/VIIRS per gli ultimi 5 giorni (il massimo che `VIIRS_SNPP_NRT` accetta per richiesta — confermato dal vivo, l'API rifiuta oltre 5 con "Invalid day range") in una piccola area intorno ad esso, e si mostra ogni rilevamento termico raggruppato per giorno (conteggio + FRP massima) più gli stessi punti sulla mappa, colorati da giallo pallido (più vecchio) a rosso (più recente) — un proxy live reale ma grezzo (pixel VIIRS ~375m) di dove si sta spostando il calore, non un fronte di colata tracciato. Nuova route backend `/api/volcano-thermal-history` (`server/index.ts`), stesso schema di proxy verso NASA FIRMS del feed nazionale dei focolai, cache di 10 minuti per punto/intervallo di giorni.

### Tracking live dei Canadair

Il modulo Incendi mostra le posizioni in tempo reale della flotta antincendio della Protezione Civile. Servivano diverse cose verificate a mano, non date per scontate:

- **Identificazione della flotta**: 13 dei 19 Canadair CL-415 (immatricolazioni `I-DPCx`), più 2 elicotteri Erickson/Sikorsky S-64F (`I-CFAG`, `I-CFAM`), hanno un codice ICAO24/Mode-S confermato, cercato tramite [adsbdb.com](https://www.adsbdb.com/) — vedi `src/data/canadair-fleet.ts`. I velivoli non presenti in quel database pubblico vengono omessi invece di inventare un codice che identificherebbe l'aereo sbagliato.
- **Posizioni live**: [OpenSky Network](https://opensky-network.org/) ha dati ADS-B gratuiti ma blocca CORS per le richieste da browser — il backend (`server/index.ts`) fa da proxy, filtrato solo su questa flotta. Autenticato (OAuth2 client_credentials) quando le credenziali sono configurate, per una quota di 4000 crediti/giorno invece di 400; torna all'endpoint anonimo se non lo sono.
- **Traccia di volo al click**: cliccando un velivolo si recupera e disegna la sua traccia recente (`/api/canadair-track/:icao24`, proxy verso `/tracks/all` di OpenSky) — renderizzata come marker DOM invece che una linea MapLibre GL (un `Layer` GL è stato provato e non ha mai renderizzato correttamente su tre browser diversi nonostante l'API documentata combaciasse; il fallback a puntini funziona in modo affidabile).

## Stack tecnico

- **Frontend:** React 19 + TypeScript + Vite
- **Mappa:** [MapLibre GL JS](https://maplibre.org/) (WebGL) via `react-map-gl` — non più Leaflet. Lo zoom di Leaflet (tile raster + scale CSS) risultava a scatti col trackpad; MapLibre fa un vero zoom continuo interpolato dalla GPU. (Per riferimento: è un limite di Leaflet in sé, non di questo sito — prova a zoomare su openstreetmap.org, che usa Leaflet puro, per confronto.)
- **Dati satellitari:** Copernicus Data Space Ecosystem (Sentinel Hub WMS) —
  - Sentinel-2 (10m): vero-colore, NDVI, NDWI, SWIR, NBR
  - Sentinel-3 SLSTR (~1km): vera temperatura di superficie
  - Landsat 8-9 (banda termica 30-100m): dettaglio più fine opzionale, rivisita più rada
  - Sentinel-5P/TROPOMI (~7x3.5km): SO₂ e Indice Aerosol UV, per il tracking dei pennacchi vulcanici
  - Sentinel-1 GRD (10-20m): backscatter SAR VV, mappatura alluvioni che penetra le nuvole
- **Previsioni atmosferiche:** Copernicus CAMS (solo link per le previsioni orarie di dispersione cenere/SO₂ — i dati grezzi sono GRIB/NetCDF via un'API orientata a Python senza un WMS pronto trovato, quindi resta un link invece di un layer incorporato; vedi [Roadmap](#roadmap))
- **Movimento del suolo:** EGMS, Copernicus Land Monitoring Service (solo link — distribuito come vettoriale/CSV scaricabile, nessun WMS pubblico anonimo trovato con nomi di layer stabili, quindi anche questo resta un link invece di un layer incorporato)
- **Statistiche puntuali/areali:** Statistical API di Copernicus Data Space (`sh.dataspace.copernicus.eu/api/v1/statistics`) — media NDVI live da Sentinel-2 su una piccola area intorno a un indirizzo/città cercato, per il controllo puntuale del modulo Desertificazione (vedi [sopra](#controlli-live-per-punto-rischio-idrogeologico-e-desertificazione))
- **Mosaico pericolosità idrogeologica:** WMS ISPRA IdroGEO (`idrogeo.isprambiente.it`, layer nazionali PAI frane/alluvioni) — controllo puntuale live per il modulo Rischio idrogeologico (vedi [sopra](#controlli-live-per-punto-rischio-idrogeologico-e-desertificazione))
- **Mappatura di emergenza:** API delle attivazioni Copernicus EMS Rapid Mapping (`mapping.emergency.copernicus.eu`) — vedi [sopra](#avvisi-live-sulle-attivazioni-copernicus-ems)
- **Dati meteo:** Open-Meteo (nessuna API key, CORS abilitato), inclusa la Marine API per la temperatura del mare
- **Dati idrometrici:** rete di sensori live ARPA Lombardia (dataset Socrata `647i-nhxk`) per il livello di fiumi/laghi — solo Lombardia; un giro su 9 regioni in una sessione precedente non ha trovato un'API live equivalente altrove, servirebbe scraping
- **Dati sismici:** INGV FDSN Event API (nessuna API key, CORS abilitato) — usata sia dal modulo Vulcani (sismicità locale) che dal modulo Terremoti (flusso nazionale)
- **Dati di riferimento incendi:** EFFIS (JRC/Copernicus) — usato solo per citare la fonte dei case study statici. Un layer live "incendi attivi" è stato indagato e scartato: i dati hotspot dell'endpoint pubblico si sono rivelati congelati da ottobre 2021 circa (verificato interrogando la data massima disponibile su tutti i suoi layer), non davvero in tempo reale nonostante fosse documentato come tale. I focolai live vengono invece da NASA FIRMS (VIIRS), che è davvero in tempo reale.
- **Tracking aerei:** OpenSky Network (ADS-B), identificazione flotta verificata incrociando adsbdb.com
- **Backend:** Node/Express puro (`server/index.ts`) — pensato per stare dietro un tuo reverse proxy Nginx (`/api/*` inoltrato lì), non legato a Vercel, Netlify o hosting specifici
- **Linting:** oxlint
- **Test:** Vitest, unit test sulla logica pura (`src/utils/*.test.ts`) — girano in CI a ogni push su `main`, prima del deploy
- **Scansione secret:** gitleaks + hook pre-commit, CI su GitHub Actions
- **Rate limiting:** `express-rate-limit` su ogni route backend che tocca una quota esterna condivisa (Sentinel Hub, NASA FIRMS, OpenSky) — 120 richieste/min/IP sulle tile satellitari (burst legittimi da pan/zoom, per lo più già in cache), 30/min/IP su tutto il resto; `/api/health` esente (usato dall'health check della pipeline di deploy)

## Per iniziare

```bash
git clone <questo-repo>
cd uhi-italia
npm install
cp .env.example .env.local   # poi inserisci i valori reali, vedi sotto
npm run dev                  # frontend, http://localhost:5173
npm run server                # backend, http://localhost:3001 — serve per lo
                              # scambio token Sentinel Hub e i proxy dei dati live
```

Vite fa da proxy per `/api/*` verso `localhost:3001` in dev, quindi i due possono girare insieme senza problemi di CORS. Senza il backend attivo, l'app funziona comunque — marker città, meteo, simulatore e stimatore costi non ne hanno bisogno — ma lo scambio token Sentinel Hub, il tracking Canadair, i focolai live, le webcam vulcani e gli avvisi EMS non faranno nulla.

### Variabili d'ambiente

Da impostare in `.env.local` (mai committato — vedi [Sicurezza](#sicurezza)). Il backend carica questo stesso file automaticamente in sviluppo (`process.loadEnvFile`); in produzione, imposta vere variabili d'ambiente invece (vedi [Sicurezza](#sicurezza)).

| Variabile | Obbligatoria | Scopo |
|---|---|---|
| `VITE_SENTINEL_CLIENT_ID` | opzionale | Client ID OAuth Copernicus, sicuro da esporre |
| `SENTINEL_CLIENT_SECRET` | opzionale | Client secret OAuth Copernicus — solo server-side, mai con prefisso `VITE_` |
| `VITE_SENTINEL_INSTANCE_ID_S2` | opzionale | Instance ID della Configuration Sentinel Hub per i layer Sentinel-2 L2A (vero-colore, NDVI, NDWI, SWIR, NBR) |
| `VITE_SENTINEL_INSTANCE_ID_S3` | attualmente inutilizzata | Dichiarata per un futuro layer di brightness temperature Sentinel-3, non ancora collegata a nulla — il vero layer LST sotto è quello effettivamente usato |
| `VITE_SENTINEL_INSTANCE_ID_S3_LST` | opzionale | Instance ID della Configuration Sentinel Hub per un layer Sentinel-3 SLSTR L2 (Land Surface Temperature vera, prodotto `SL_2_LST`) |
| `VITE_SENTINEL_INSTANCE_ID_LANDSAT` | opzionale | Instance ID della Configuration Sentinel Hub per un layer Landsat 8-9 (banda termica 30-100m) |
| `VITE_SENTINEL_INSTANCE_ID_S5P_SO2` | opzionale | Instance ID della Configuration Sentinel Hub per un layer Sentinel-5P L2 SO₂ (tracking pennacchi vulcanici) |
| `VITE_SENTINEL_INSTANCE_ID_S5P_AER` | opzionale | Instance ID della Configuration Sentinel Hub per un layer Sentinel-5P L2 Indice Aerosol UV — può essere lo stesso Instance ID di sopra se entrambi i layer stanno nella stessa Configuration |
| `VITE_SENTINEL_INSTANCE_ID_S1` | opzionale | Instance ID della Configuration Sentinel Hub per un layer Sentinel-1 GRD backscatter SAR |
| `NASA_FIRMS_MAP_KEY` | opzionale | API key NASA FIRMS per i focolai live — solo server-side |
| `OPENSKY_CLIENT_ID` / `OPENSKY_CLIENT_SECRET` | opzionale | Credenziali OAuth2 OpenSky Network per una quota più alta nel tracking Canadair — torna all'endpoint anonimo se assenti |
| `PORT` | opzionale | Porta del processo backend (default `3001`) |

Se nessuna delle variabili Sentinel Hub è impostata, l'app funziona comunque — gli overlay satellitari semplicemente non si mostrano. Lo stesso vale per le altre chiavi opzionali: ogni funzionalità degrada in modo controllato (niente focolai live, tracking Canadair a quota più bassa, ecc.) invece di rompersi.

### Configurare Sentinel Hub (opzionale, per le immagini satellitari)

1. Registrati gratuitamente su [dataspace.copernicus.eu](https://dataspace.copernicus.eu).
2. Dashboard → **Sentinel Hub** → **OAuth Clients** → crea un client → copia client ID e secret in `.env.local`.
3. Dashboard → **Sentinel Hub** → **Configuration Utility** → **New configuration** dal template **Sentinel-2 L2A**. Copia il suo **Instance ID** in `VITE_SENTINEL_INSTANCE_ID_S2`.
4. Nella tab **Layers** di quella configuration, conferma (o aggiungi come layer custom evalscript) questi nomi esatti — richiesti da `src/utils/satellite-layers.ts`:
   - `TRUE_COLOR`, `VEGETATION_INDEX` — di solito già nel template di default
   - `WATER_INDEX` (NDWI, McFeeters 1996 — bande B03/B08), `SWIR`, `BURN_INDEX` (NBR — bande B8A/B12) — layer custom con evalscript; chiedi se ti servono gli script esatti usati, mascherano acqua/nuvole via banda SCL per evitare valori senza senso sul mare
5. Facoltativo, per la vera temperatura di superficie: crea un'altra configuration dal template **Sentinel-3 SLSTR L2** (layer `LST` — un vero prodotto Land Surface Temperature, `SL_2_LST`, non solo brightness temperature), e copia il suo Instance ID in `VITE_SENTINEL_INSTANCE_ID_S3_LST`.
6. Facoltativo, per dettaglio termico più fine (al costo di un rivisita più rada, ~8-16 giorni): una configuration **Landsat 8-9**, layer `9_THERMAL`, in `VITE_SENTINEL_INSTANCE_ID_LANDSAT`.

   **Limite noto (solo Landsat, non risolto):** anche con mosaicking `leastCC` e una finestra di 45 giorni, il layer termico Landsat può tornare vuoto (nessun pixel valido, non un errore) se ogni passaggio recente sull'area era nuvoloso. Confermato che non è un artefatto di cache. Trattalo come best-effort; l'interfaccia mostra un avviso quando questo layer è selezionato.

7. Facoltativo, per il tracking dei pennacchi vulcanici: una configuration **Sentinel-5P L2** con due layer custom evalscript — `SO2` e `AER_AI_340_380` (l'ID con l'underscore, non la variante con i trattini che alcuni editor generano automaticamente per lo stesso template — verifica con l'anteprima quale dei due mostra davvero la scala colore). Entrambi richiedono di sostituire l'evalscript grezzo di default con uno di visualizzazione (i template di default di Sentinel Hub restituiscono il valore fisico non calibrato, che rende un'immagine praticamente nera/illeggibile):

   ```javascript
   //VERSION=3
   const band = "SO2"; // oppure "AER_AI_340_380"
   var minVal = 0.0;  // SO2: 0.0-0.01 mol/m². AER_AI_340_380: -1.0-5.0
   var maxVal = 0.01;

   function setup() {
     return { input: [band, "dataMask"], output: { bands: 4 } };
   }
   var viz = ColorRampVisualizer.createBlueRed(minVal, maxVal);
   function evaluatePixel(samples) {
     let ret = viz.process(samples[band]);
     ret.push(samples.dataMask);
     return ret;
   }
   ```

   Imposta il **Mosaic order** di ciascun layer su **"Most recent"**, non su "Least cloud coverage" come di default per S2 — un pennacchio si sposta in ore, un composito multi-giorno lo mediarebbe fino a farlo sparire. Copia l'Instance ID sia in `VITE_SENTINEL_INSTANCE_ID_S5P_SO2` che in `VITE_SENTINEL_INSTANCE_ID_S5P_AER` (stesso valore se entrambi i layer stanno nella stessa Configuration, cosa possibile).

8. Facoltativo, per la mappatura SAR delle alluvioni sotto le nuvole: una configuration **Sentinel-1 GRD**, layer custom evalscript `VV_BACKSCATTER` (può stare nella stessa Configuration dei layer S5P sopra):

   ```javascript
   //VERSION=3
   function setup() {
     return { input: ["VV", "dataMask"], output: { bands: 2 } };
   }
   const minDB = -20;
   const maxDB = 0;
   function evaluatePixel(sample) {
     let db = 10 * Math.log10(sample.VV);
     let scaled = Math.max(0, Math.min(1, (db - minDB) / (maxDB - minDB)));
     return [scaled, sample.dataMask];
   }
   ```

   Copia il suo Instance ID in `VITE_SENTINEL_INSTANCE_ID_S1`.

Nota: le richieste WMS verso una Configuration pubblica non richiedono il token OAuth — ma l'Instance ID stesso consuma comunque la quota di processing units del tuo account se condiviso o "scrapato", quindi trattalo come un secret a bassa sensibilità (non committarlo mai).

**Limite noto:** la collection Sentinel-2 L2A rifiuta richieste WMS più grossolane di 1500 m/pixel — ai livelli di zoom "Italia intera" la richiesta lo supererebbe, quindi i layer Sentinel-2 si mostrano solo da zoom 6 in su (`minZoom` in `satellite-layers.ts`, con tile a 512px invece dei 256px di default — verificato con una richiesta reale che a 256px il limite scatta già a zoom 7); l'interfaccia mostra un avviso per invitare a zoomare.

## Script disponibili

```bash
npm run dev          # avvia il dev server di Vite (solo frontend)
npm run server       # avvia il backend con riavvio automatico (sviluppo)
npm run server:prod  # avvia il backend una volta, senza watcher (produzione)
npm run build        # type-check (tsc -b, include il backend) e build del frontend
npm run lint         # esegue oxlint
npm run test          # esegue Vitest (unit test, src/utils/*.test.ts)
npm run preview      # anteprima locale della build di produzione del frontend
```

## Struttura del progetto

```
src/
├── components/
│   ├── Map/        MapContainer, {City,WaterBody,Volcano,Fire,Desertification,HydroRisk,Earthquake}Markers,
│   │                CanadairMarkers, WildfireHotspotMarkers, VolcanoThermalPathMarkers,
│   │                DotMarker (marker condiviso),
│   │                SatelliteOverlay, LayerControls, MapCenterTracker, FlyTo
│   ├── Detail/      CityDetail, AddressDetail, WaterBodyDetail, VolcanoDetail, FireDetail,
│   │                HotspotDetail, DesertificationDetail, HydroRiskDetail, EarthquakeDetail,
│   │                {Fire,Earthquake,HydroRisk}SafetyInfo, EmsActivationNote, AddressAlerts,
│   │                HydrogeologicalRisk, DesertificationRisk (controlli live per punto, vedi sopra),
│   │                VolcanoThermalPath (storico termico giorno per giorno, vedi sopra),
│   │                WeatherLive, Simulator, CostEstimator, PersonalSavings, HomeActions,
│   │                HistoricalComparison, SolarPanelNote, DissipationChart
│   ├── Info/        InfoPanel, PrivacyPolicy, UHIExplainer, AlbedoExplainer
│   ├── Search/      UnifiedSearch
│   └── Layout/      Shell
├── data/            cities, water-bodies, mediterranean-zones, volcanoes, fires,
│                    desertification-zones, hydro-risk, canadair-fleet
├── hooks/           useWeather, useSeismicity, useSentinel, useCanadairPositions,
│                    useCanadairTrack, useWildfireHotspots, useItalyEarthquakes,
│                    useVolcanoWebcams, useWaterLevel, useMarineTrend, useSeasonalTrend,
│                    useHistoricalComparison, useEmsActivations, useMarineConditions,
│                    useHydrogeologicalRisk, useDesertificationRisk, useVolcanoThermalHistory
└── utils/           uhi-model, simulator, costs, satellite-layers, dissipation-model,
                     volcano-activity, geo
server/index.ts       Backend Express — scambio token OAuth2 Sentinel Hub, proxy OpenSky
                       Network (posizioni Canadair + tracce di volo), proxy NASA FIRMS
                       (focolai + storico termico per vulcano), proxy galleria webcam
                       INGV, proxy attivazioni Copernicus EMS
```

Il backend è un normale processo Node/Express, pensato per stare dietro a un reverse
proxy Nginx che inoltra `/api/*`. In sviluppo, Vite fa da proxy per `/api` verso
`localhost:3001` se anche il backend è in esecuzione (`npm run server`).

## Metodologia e fonti

L'intensità UHI mostrata per ogni città è una **stima statistica**, non una misurazione satellitare, basata su popolazione, latitudine, prossimità alla costa ed effetti di inversione termica della Pianura Padana (vedi `src/utils/uhi-model.ts`). Il simulatore di mitigazione e lo stimatore di costi/risparmi sono anch'essi modelli di ordine di grandezza (`src/utils/simulator.ts`, `src/utils/costs.ts`). I case study di acqua, incendi, desertificazione e rischio idrogeologico sono narrazioni con fonte citata (ISPRA, EFFIS, bollettini ARPA regionali, Copernicus EMS), non statistiche calcolate in tempo reale — ogni pannello di dettaglio cita la propria fonte. Due eccezioni: cercare un indirizzo o cliccare una città fa scattare anche un controllo davvero live e puntuale per desertificazione (NDVI Sentinel-2) e rischio idrogeologico (mosaico pericolosità PAI di ISPRA IdroGEO) — vedi [sopra](#controlli-live-per-punto-rischio-idrogeologico-e-desertificazione). Le indicazioni di sicurezza vengono da protezionecivile.gov.it e iononrischio.gov.it, non scritte a memoria.

- Oke, T.R. (1982). *The energetic basis of the urban heat island.* Quarterly Journal of the Royal Meteorological Society, 108(455), 1-24.
- Bowler, D.E. et al. (2010). *Urban greening to cool towns and cities: A systematic review of the empirical evidence.* Landscape and Urban Planning, 97(3), 147-155.
- Akbari, H. et al. (2001). *Cool surfaces and shade trees to reduce energy use and improve air quality in urban areas.* Solar Energy, 70(3), 295-310.
- Stewart, I.D. & Oke, T.R. (2012). *Local Climate Zones for Urban Temperature Studies.* Bulletin of the American Meteorological Society, 93(12), 1879-1900.
- Santamouris, M. (2014). *Cooling the cities — A review of reflective and green roof mitigation technologies.* Solar Energy, 103, 682-703.
- McFeeters, S.K. (1996). *The use of the Normalized Difference Water Index (NDWI) in the delineation of open water features.* International Journal of Remote Sensing, 17(7), 1425-1432.

Per dati precisi, consultare ISPRA, ENEA, e il prezziario regionale delle opere pubbliche.

## Sicurezza

Questo è (o sarà) un repository pubblico. L'igiene dei secret è trattata come precondizione, non come una fase:

- `.env`, `.env.local`, e ogni `.env.*` eccetto `.env.example` sono in `.gitignore`.
- `gitleaks` gira come hook pre-commit (`.pre-commit-config.yaml`, `.gitleaks.toml`) e in CI (`.github/workflows/security.yml`), scansionando ogni commit/push alla ricerca di stringhe che assomigliano a secret.
- `SENTINEL_CLIENT_SECRET` e `OPENSKY_CLIENT_SECRET` non hanno mai il prefisso `VITE_`, quindi Vite non li include mai nel bundle client — vengono letti solo da `server/index.ts`, lato server.
- Se un secret viene committato per errore: **revocalo immediatamente** su dataspace.copernicus.eu (o opensky-network.org), poi ripulisci la git history con `git-filter-repo` prima di fare qualsiasi altro push.

In produzione, imposta le stesse variabili come vere variabili d'ambiente sul server (direttive `Environment=` di una unit systemd, un file ecosystem di pm2, o simili) — mai in un file committato, e non fare affidamento sulla presenza di `.env.local` (non dovrebbe esserci, su un server di cui non ti fidi al 100% con una copia dei tuoi secret in giro).

## Privacy

Un'informativa privacy bilingue (IT/EN) è disponibile dal bottone "Privacy" in header (`src/components/Info/PrivacyPolicy.tsx`), basata su un audit reale del codice: nessun cookie, nessun localStorage, nessun account o form che salva dati, nessun analytics attivo oggi. L'informativa contiene già una sezione Umami scritta in anticipo per quando/se verrà attivato — **al momento è aspirazionale, nessuno script Umami è collegato davvero all'app**, vedi [Roadmap](#roadmap). La ricerca indirizzo manda la query digitata direttamente dal browser a Nominatim/OpenStreetMap; i due controlli live per punto sopra mandano le coordinate cercate direttamente a ISPRA IdroGEO e Copernicus, stesso schema (browser-verso-provider, non tramite il nostro backend). Contatto: `info@icarom.net`. È una descrizione tecnica in buona fede per un piccolo progetto personale, non una consulenza legale.

## Roadmap

- Dati storici Open-Meteo: confronto temperature estive anni '90 vs oggi (parzialmente fatto — vedi il confronto storico nel modulo Calore; da estendere a più città/periodi).
- Valori UHI reali calcolati dalla differenza di LST urbana vs rurale (serve elaborazione raster).
- Granularità a livello di quartiere usando Sentinel-2 a 10m.
- Toggle italiano/inglese direttamente nell'interfaccia — **Fase 1 fatta** (react-i18next, `src/locales/{it,en}/translation.json`): titoli/sottotitoli moduli, spiegazioni UHI/albedo, note metodologiche, informazioni di sicurezza e selettore layer satellitare sono tradotti, con un toggle in header. I testi narrativi più lunghi per singolo caso (case study incendi/idrogeologico/vulcani, note tecniche nei pannelli di dettaglio) restano solo in italiano — una fase 2.
- Vista comparativa tra città.
- Layer di **previsione** dispersione cenere/SO₂ da CAMS incorporato, non solo un link — bloccato dal fatto che CAMS ADS espone solo GRIB/NetCDF grezzi via un'API orientata a Python; servirebbe un piccolo servizio backend per scaricarli e rasterizzarli, oppure un WMS pronto non ancora trovato.
- Layer di movimento del suolo EGMS incorporato, non solo un link — bloccato dall'assenza di un WMS pubblico anonimo trovato con nomi di layer stabili; i dati EGMS sono distribuiti come vettoriale/CSV scaricabile.
- Un modulo qualità dell'aria (NO₂/CO/CH₄ via Sentinel-5P) — un modulo intero nuovo, non una piccola aggiunta, quindi trattato come iniziativa futura a sé piuttosto che incluso in quelli esistenti.
- Controllo attivazioni Copernicus EMS anche per altre categorie meno urgenti (`storm`, `industrial`, `environment`), se mai esisterà un modulo per loro.
- Copertura idrometrica oltre la Lombardia — nessuna API live trovata in un giro su 9 regioni; servirebbe scraping dei siti ARPA regionali uno per uno.
- Deploy: dominio, configurazione Nginx sul server, `server/index.ts` in esecuzione come servizio permanente (pm2/systemd).
- Analytics Umami: la Privacy Policy ha già la sezione scritta (cookieless, salt IP che ruota ogni giorno, base legittimo interesse), ma lo script di tracciamento vero e proprio non è ancora aggiunto all'app.

## Licenza

[GNU AGPLv3](LICENSE). Il copyleft si estende alla rete: se fai girare una versione modificata di questo sito come servizio pubblico, devi rendere disponibile il codice sorgente modificato anche a chi lo usa — non solo a chi distribuisci il codice direttamente, cosa che una GPL semplice non richiederebbe. Scelta deliberatamente per un progetto educativo di interesse pubblico: le derivazioni devono restare aperte, anche quando offerte solo come servizio ospitato e non come software distribuito.
