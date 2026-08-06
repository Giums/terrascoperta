# 🌡️ Isole di Calore Urbane — Italia

**[🇬🇧 Read in English](README.md)**

Un sito web interattivo ed educativo che mostra le isole di calore urbane (Urban Heat Islands, UHI) nelle città italiane, combinando dati satellitari reali (Copernicus Sentinel) con dati meteo live (Open-Meteo). L'obiettivo non è solo mostrare il problema, ma renderlo azionabile: cosa può fare una città, e — altrettanto importante — cosa può fare un singolo cittadino a casa propria.

## Funzionalità

- **Mappa interattiva** dei capoluoghi di provincia italiani e delle città con più di 50k abitanti, con un'intensità UHI stimata per città (marker colorati).
- **Overlay satellitari**: immagini vero-colore, NDVI, NDWI, SWIR e NBR da Sentinel-2 (risoluzione 10m) e temperatura superficiale da Sentinel-3 (via Copernicus Data Space Ecosystem / Sentinel Hub). Richiede credenziali Sentinel Hub — vedi sotto.
- **Meteo live** per città (temperatura, umidità, vento, radiazione solare) da Open-Meteo.
- **Simulatore di mitigazione**: slider per aumento del verde e superfici ad alto albedo, con stima della riduzione di temperatura basata su ricerca pubblicata (Bowler et al. 2010, Akbari et al. 2001).
- **Stimatore di costi e risparmi**: ordine di grandezza dei costi degli interventi, risparmio energetico sul condizionamento, riduzione di CO₂ e tempo di ritorno dell'investimento.
- **Sezione "Cosa puoi fare a casa tua"**: interventi concreti (tetti freddi, membrane riflettenti, tetti verdi, rampicanti, alberi a foglia caduca, pellicole per vetri) con costo, effetto e difficoltà.
- **Pannello educativo**: cos'è l'UHI, perché succede, l'effetto notturno dell'albedo, e il circolo vizioso del condizionamento (ogni condizionatore raffredda l'interno scaricando calore all'esterno, scaldando la strada, che spinge a usare ancora più condizionamento).

Tutte le stime sono dichiarate esplicitamente come modelli, non misurazioni — vedi [Metodologia](#metodologia-e-fonti) qui sotto.

## Stack tecnico

- **Frontend:** React 19 + TypeScript + Vite, nessun framework backend
- **Mappa:** Leaflet / react-leaflet, tile CARTO Dark
- **Dati satellitari:** Copernicus Data Space Ecosystem (Sentinel Hub WMS)
- **Dati meteo:** Open-Meteo (nessuna API key, CORS abilitato)
- **Serverless:** una Vercel Edge Function (`api/sentinel-token.ts`) per lo scambio del token OAuth2 — mantenuta per future funzionalità che richiedano la Process API autenticata di Sentinel Hub; gli overlay della mappa attuali usano richieste WMS pubbliche e non ne hanno bisogno
- **Linting:** oxlint
- **Scansione secret:** gitleaks + hook pre-commit, CI su GitHub Actions

Tutto gira lato client contro API pubbliche con CORS abilitato — non c'è un backend da ospitare o scalare, solo una build statica.

## Per iniziare

```bash
git clone <questo-repo>
cd uhi-italia
npm install
cp .env.example .env.local   # poi inserisci i valori reali, vedi sotto
npm run dev
```

### Variabili d'ambiente

Da impostare in `.env.local` (mai committato — vedi [Sicurezza](#sicurezza)):

| Variabile | Obbligatoria | Scopo |
|---|---|---|
| `VITE_SENTINEL_CLIENT_ID` | opzionale | Client ID OAuth Copernicus, sicuro da esporre |
| `SENTINEL_CLIENT_SECRET` | opzionale | Client secret OAuth Copernicus — solo server-side, mai con prefisso `VITE_` |
| `VITE_SENTINEL_INSTANCE_ID_S2` | opzionale | Instance ID della Configuration Sentinel Hub per un layer Sentinel-2 L2A |
| `VITE_SENTINEL_INSTANCE_ID_S3` | opzionale | Instance ID della Configuration Sentinel Hub per un layer Sentinel-3 SLSTR (brightness temperature) |
| `VITE_SENTINEL_INSTANCE_ID_S3_LST` | opzionale | Instance ID della Configuration Sentinel Hub per un layer Sentinel-3 SLSTR L2 (Land Surface Temperature vera, prodotto `SL_2_LST`) |
| `VITE_SENTINEL_INSTANCE_ID_LANDSAT` | opzionale | Instance ID della Configuration Sentinel Hub per un layer Landsat 8-9 (banda termica 30-100m) |

Se nessuna di queste è impostata, l'app funziona comunque — marker città, meteo, simulatore e
stimatore costi non richiedono Sentinel Hub — ma gli overlay satellitari non verranno mostrati.

### Configurare Sentinel Hub (opzionale, per immagini a risoluzione maggiore)

1. Registrati gratuitamente su [dataspace.copernicus.eu](https://dataspace.copernicus.eu).
2. Dashboard → **Sentinel Hub** → **OAuth Clients** → crea un client → copia client ID e secret in `.env.local`.
3. Dashboard → **Sentinel Hub** → **Configuration Utility** → **New configuration**, una volta dal template **Sentinel-2 L2A** e una dal template **Sentinel-3 SLSTR**. Copia ogni **Instance ID** in `.env.local`.
4. Apri la tab **Layers** di ciascuna configuration per confermare gli ID dei layer — questo progetto si aspetta `TRUE_COLOR` e `VEGETATION_INDEX` (Sentinel-2) e `F1_VISUALIZED` (Sentinel-3, brightness temperature — il template di default di SLSTR non ha un prodotto LST dedicato). Se la tua configuration usa nomi diversi, aggiorna `src/utils/satellite-layers.ts`.
5. Facoltativo, per dati termici migliori: crea altre due configuration, una dal template **Sentinel-3 SLSTR L2** (layer `LST` — un vero prodotto Land Surface Temperature, `SL_2_LST`, non solo brightness temperature) e una da un template **Landsat 8-9** (layer `9_THERMAL`, risoluzione ~30-100m — molto più fine dell'~1km di Sentinel-3, al costo di un rivisita di ~8-16 giorni invece che quasi giornaliera). Entrambe verificate con la Process API di Sentinel Hub prima di collegarle; se gli ID dei layer della tua configuration sono diversi, controlla `src/utils/satellite-layers.ts`.

   **Limite noto (solo Landsat, non risolto):** anche con mosaicking `leastCC` e una finestra di 45 giorni, il layer termico Landsat può tornare vuoto (nessun pixel valido, non un errore) se ogni passaggio recente sull'area era nuvoloso — il revisit combinato Landsat 8+9 è molto più rado del quasi-giornaliero di Sentinel-2/3. Confermato che non è un artefatto di cache (bbox nuove, mai richieste prima, danno lo stesso buco). Trattalo come best-effort; l'interfaccia mostra un avviso quando questo layer è selezionato.

Nota: le richieste WMS verso una Configuration pubblica non richiedono il token OAuth — ma l'Instance ID stesso consuma comunque la quota di processing units del tuo account se condiviso o "scrapato", quindi trattalo come un secret a bassa sensibilità (non committarlo mai).

**Limite noto:** la collection Sentinel-2 L2A rifiuta richieste WMS più grossolane di 1500 m/pixel — ai livelli di zoom "Italia intera" la richiesta lo supererebbe, quindi i layer Sentinel-2 si mostrano solo da zoom 7 in su (`minZoom` in `satellite-layers.ts`); l'interfaccia mostra un avviso per invitare a zoomare.

## Script disponibili

```bash
npm run dev       # avvia il dev server di Vite
npm run build     # type-check (tsc -b) e build di produzione
npm run lint      # esegue oxlint
npm run preview   # anteprima locale della build di produzione
```

## Struttura del progetto

```
src/
├── components/
│   ├── Map/       MapContainer, CityMarkers, SatelliteOverlay, LayerControls
│   ├── Detail/     CityDetail, WeatherLive, Simulator, CostEstimator, HomeActions
│   ├── Info/       InfoPanel, UHIExplainer, AlbedoExplainer
│   ├── Search/     CitySearch
│   └── Layout/     Shell
├── data/cities.ts                 Dataset città italiane
├── hooks/{useWeather,useSentinel}.ts
├── utils/{uhi-model,simulator,costs,satellite-layers}.ts
api/sentinel-token.ts              Edge Function — scambio token OAuth2 Sentinel Hub
```

## Metodologia e fonti

L'intensità UHI mostrata per ogni città è una **stima statistica**, non una misurazione satellitare, basata su popolazione, latitudine, prossimità alla costa ed effetti di inversione termica della Pianura Padana (vedi `src/utils/uhi-model.ts`). Il simulatore di mitigazione e lo stimatore di costi/risparmi sono anch'essi modelli di ordine di grandezza (`src/utils/simulator.ts`, `src/utils/costs.ts`). Fonti:

- Oke, T.R. (1982). *The energetic basis of the urban heat island.* Quarterly Journal of the Royal Meteorological Society, 108(455), 1-24.
- Bowler, D.E. et al. (2010). *Urban greening to cool towns and cities: A systematic review of the empirical evidence.* Landscape and Urban Planning, 97(3), 147-155.
- Akbari, H. et al. (2001). *Cool surfaces and shade trees to reduce energy use and improve air quality in urban areas.* Solar Energy, 70(3), 295-310.
- Stewart, I.D. & Oke, T.R. (2012). *Local Climate Zones for Urban Temperature Studies.* Bulletin of the American Meteorological Society, 93(12), 1879-1900.
- Santamouris, M. (2014). *Cooling the cities — A review of reflective and green roof mitigation technologies.* Solar Energy, 103, 682-703.

Per dati precisi, consultare ISPRA, ENEA, e il prezziario regionale delle opere pubbliche.

## Sicurezza

Questo è (o sarà) un repository pubblico. L'igiene dei secret è trattata come precondizione, non come una fase:

- `.env`, `.env.local`, e ogni `.env.*` eccetto `.env.example` sono in `.gitignore`.
- `gitleaks` gira come hook pre-commit (`.pre-commit-config.yaml`, `.gitleaks.toml`) e in CI (`.github/workflows/security.yml`), scansionando ogni commit/push alla ricerca di stringhe che assomigliano a secret.
- `SENTINEL_CLIENT_SECRET` non ha mai il prefisso `VITE_`, quindi Vite non lo include mai nel bundle client — viene letto solo dalla Edge Function `api/sentinel-token.ts`, lato server.
- Se un secret viene committato per errore: **revocalo immediatamente** su dataspace.copernicus.eu, poi ripulisci la git history con `git-filter-repo` prima di fare qualsiasi altro push.

In produzione (Vercel/Netlify), imposta le stesse variabili nella dashboard Environment Variables del provider di hosting — mai in un file committato.

## Roadmap

- Dati storici Open-Meteo: confronto temperature estive anni '90 vs oggi.
- Valori UHI reali calcolati dalla differenza di LST urbana vs rurale (serve elaborazione raster).
- Granularità a livello di quartiere usando Sentinel-2 a 10m.
- Toggle italiano/inglese direttamente nell'interfaccia.
- Vista comparativa tra città.
