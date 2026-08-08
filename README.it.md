# 🌍 TerraScoperta

*(Nome provvisorio)*

**[🇬🇧 Read in English](README.md)**

Un sito web interattivo ed educativo che mostra fenomeni legati al clima in Italia, usando dati satellitari e sensori pubblici reali. Nato come tracker delle isole di calore urbane (UHI); cresciuto in sei moduli che coprono calore, acqua, vulcani, incendi, desertificazione e rischio idrogeologico — tutto costruito da una persona sola su dati pubblici e gratuiti. L'obiettivo non è solo mostrare il problema, ma renderlo azionabile: cosa può fare una città, e — altrettanto importante — cosa può fare un singolo cittadino a casa propria.

## Moduli

- 🌡️ **Calore** — intensità UHI stimata per città italiana, meteo live, simulatore di mitigazione (slider verde/albedo), stimatore di costi e risparmi, sezione "cosa puoi fare a casa tua" (tetti freddi, membrane riflettenti, tetti verdi, pre-raffreddamento evaporativo del condizionatore, e altro).
- 💧 **Acqua** — fiumi e laghi principali, case study su siccità/restringimento, overlay satellitare NDWI per vedere l'acqua superficiale direttamente.
- 🌋 **Vulcani** — Etna, Vesuvio, Stromboli, Campi Flegrei; sismicità live vicino a ognuno (INGV), link alle webcam ufficiali, overlay satellitare SWIR per calore/colate laviche.
- 🔥 **Incendi** — case study storici, overlay satellitare NBR per le cicatrici da incendio, e **posizioni live della flotta Canadair CL-415 antincendio italiana** (vedi sotto).
- 🏜️ **Desertificazione** — aree classificate a rischio da ISPRA, overlay NDVI per vedere lo stress della vegetazione direttamente.
- 🌊 **Rischio idrogeologico** — come incendi e desertificazione portano a suolo nudo e alluvioni lampo/frane, dati di rischio ISPRA.

Tutte le stime sono dichiarate esplicitamente come modelli, non misurazioni — vedi [Metodologia](#metodologia-e-fonti) qui sotto.

### Tracking live dei Canadair

Il modulo Incendi mostra le posizioni in tempo reale della flotta Canadair CL-415 della Protezione Civile. Servivano due cose verificate a mano, non date per scontate:

- **Identificazione della flotta**: 13 dei 19 velivoli (immatricolazioni `I-DPCx`) hanno un codice ICAO24/Mode-S confermato, cercato tramite [adsbdb.com](https://www.adsbdb.com/) — vedi `src/data/canadair-fleet.ts`. Gli altri 6 non sono in quel database pubblico; meglio ometterli che inventare un codice che identificherebbe l'aereo sbagliato.
- **Posizioni live**: [OpenSky Network](https://opensky-network.org/) ha dati ADS-B veri e gratuiti, ma blocca CORS per le richieste da browser — il backend (`server/index.ts`) fa da proxy, filtrato solo su questa flotta, con cache in memoria di 90 secondi per restare dentro il limite basso della quota anonima di OpenSky.

## Stack tecnico

- **Frontend:** React 19 + TypeScript + Vite
- **Mappa:** [MapLibre GL JS](https://maplibre.org/) (WebGL) via `react-map-gl` — non più Leaflet. Lo zoom di Leaflet (tile raster + scale CSS) risultava a scatti col trackpad; MapLibre fa un vero zoom continuo interpolato dalla GPU. (Per riferimento: è un limite di Leaflet in sé, non di questo sito — prova a zoomare su openstreetmap.org, che usa Leaflet puro, per confronto.)
- **Dati satellitari:** Copernicus Data Space Ecosystem (Sentinel Hub WMS) — vero-colore, NDVI, NDWI, SWIR, NBR (Sentinel-2, 10m) e temperatura di superficie (Sentinel-3, ~1km)
- **Dati meteo:** Open-Meteo (nessuna API key, CORS abilitato)
- **Dati sismici:** INGV FDSN Event API (nessuna API key, CORS abilitato)
- **Dati di riferimento incendi:** EFFIS (JRC/Copernicus) — usato solo per citare fonte dei case study statici. Un layer live "incendi attivi" è stato indagato e scartato: i dati hotspot dell'endpoint pubblico si sono rivelati congelati da ottobre 2021 circa (verificato interrogando la data massima disponibile su tutti i suoi layer), non davvero in tempo reale nonostante fosse documentato come tale.
- **Tracking aerei:** OpenSky Network (ADS-B), identificazione flotta verificata incrociando adsbdb.com
- **Backend:** Node/Express puro (`server/index.ts`) — pensato per stare dietro un tuo reverse proxy Nginx (`/api/*` inoltrato lì), non legato a Vercel, Netlify o hosting specifici
- **Linting:** oxlint
- **Scansione secret:** gitleaks + hook pre-commit, CI su GitHub Actions

## Per iniziare

```bash
git clone <questo-repo>
cd uhi-italia
npm install
cp .env.example .env.local   # poi inserisci i valori reali, vedi sotto
npm run dev                  # frontend, http://localhost:5173
npm run server                # backend, http://localhost:3001 — serve per lo
                              # scambio token Sentinel Hub e il tracking Canadair
```

Vite fa da proxy per `/api/*` verso `localhost:3001` in dev, quindi i due possono girare insieme senza problemi di CORS. Senza il backend attivo, l'app funziona comunque — marker città, meteo, simulatore e stimatore costi non ne hanno bisogno — ma lo scambio token Sentinel Hub e il layer Canadair non faranno nulla.

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
| `PORT` | opzionale | Porta del processo backend (default `3001`) |

Se nessuna delle variabili Sentinel Hub è impostata, l'app funziona comunque — gli overlay satellitari semplicemente non si mostrano.

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

Nota: le richieste WMS verso una Configuration pubblica non richiedono il token OAuth — ma l'Instance ID stesso consuma comunque la quota di processing units del tuo account se condiviso o "scrapato", quindi trattalo come un secret a bassa sensibilità (non committarlo mai).

**Limite noto:** la collection Sentinel-2 L2A rifiuta richieste WMS più grossolane di 1500 m/pixel — ai livelli di zoom "Italia intera" la richiesta lo supererebbe, quindi i layer Sentinel-2 si mostrano solo da zoom 7 in su (`minZoom` in `satellite-layers.ts`); l'interfaccia mostra un avviso per invitare a zoomare.

## Script disponibili

```bash
npm run dev          # avvia il dev server di Vite (solo frontend)
npm run server       # avvia il backend con riavvio automatico (sviluppo)
npm run server:prod  # avvia il backend una volta, senza watcher (produzione)
npm run build        # type-check (tsc -b, include il backend) e build del frontend
npm run lint         # esegue oxlint
npm run preview      # anteprima locale della build di produzione del frontend
```

## Struttura del progetto

```
src/
├── components/
│   ├── Map/        MapContainer, {City,WaterBody,Volcano,Fire,Desertification,HydroRisk}Markers,
│   │                CanadairMarkers, DotMarker (marker condiviso), SatelliteOverlay, LayerControls
│   ├── Detail/      CityDetail, WaterBodyDetail, VolcanoDetail, FireDetail,
│   │                DesertificationDetail, HydroRiskDetail, WeatherLive, Simulator,
│   │                CostEstimator, PersonalSavings, HomeActions
│   ├── Info/        InfoPanel, UHIExplainer, AlbedoExplainer
│   ├── Search/      CitySearch, AddressSearch
│   └── Layout/      Shell
├── data/            cities, water-bodies, volcanoes, fires, desertification-zones,
│                    hydro-risk, canadair-fleet
├── hooks/           useWeather, useSeismicity, useSentinel, useCanadairPositions
└── utils/           uhi-model, simulator, costs, satellite-layers
server/index.ts       Backend Express — scambio token OAuth2 Sentinel Hub,
                       proxy OpenSky Network (posizioni flotta Canadair)
```

Il backend è un normale processo Node/Express, pensato per stare dietro a un reverse
proxy Nginx che inoltra `/api/*`. In sviluppo, Vite fa da proxy per `/api` verso
`localhost:3001` se anche il backend è in esecuzione (`npm run server`).

## Metodologia e fonti

L'intensità UHI mostrata per ogni città è una **stima statistica**, non una misurazione satellitare, basata su popolazione, latitudine, prossimità alla costa ed effetti di inversione termica della Pianura Padana (vedi `src/utils/uhi-model.ts`). Il simulatore di mitigazione e lo stimatore di costi/risparmi sono anch'essi modelli di ordine di grandezza (`src/utils/simulator.ts`, `src/utils/costs.ts`). I case study di acqua, incendi, desertificazione e rischio idrogeologico sono narrazioni con fonte citata (ISPRA, EFFIS, bollettini ARPA regionali, Copernicus EMS), non statistiche calcolate in tempo reale — ogni pannello di dettaglio cita la propria fonte.

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
- `SENTINEL_CLIENT_SECRET` non ha mai il prefisso `VITE_`, quindi Vite non lo include mai nel bundle client — viene letto solo da `server/index.ts`, lato server.
- Se un secret viene committato per errore: **revocalo immediatamente** su dataspace.copernicus.eu, poi ripulisci la git history con `git-filter-repo` prima di fare qualsiasi altro push.

In produzione, imposta le stesse variabili come vere variabili d'ambiente sul server (direttive `Environment=` di una unit systemd, un file ecosystem di pm2, o simili) — mai in un file committato, e non fare affidamento sulla presenza di `.env.local` (non dovrebbe esserci, su un server di cui non ti fidi al 100% con una copia dei tuoi secret in giro).

## Roadmap

- Dati storici Open-Meteo: confronto temperature estive anni '90 vs oggi.
- Valori UHI reali calcolati dalla differenza di LST urbana vs rurale (serve elaborazione raster).
- Granularità a livello di quartiere usando Sentinel-2 a 10m.
- Toggle italiano/inglese direttamente nell'interfaccia.
- Vista comparativa tra città.
- Webcam vulcani: al momento solo link alla pagina ufficiale INGV (nessuno stream incorporabile pubblico trovato); da rivalutare se INGV ne espone uno.
- Deploy: dominio, configurazione Nginx sul server, `server/index.ts` in esecuzione come servizio permanente (pm2/systemd).
