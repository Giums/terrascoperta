# 🌍 TerraScoperta

**[🇮🇹 Leggi in italiano](README.it.md)**

An interactive, educational website mapping climate and environmental hazards across Italy, using real public satellite and sensor data. Started as an urban heat island (UHI) tracker; grew into seven modules covering heat, water, volcanoes, fires, desertification, hydrogeological risk, and earthquakes — all built by one person on free, public data. The goal is not just to show the problem, but to make it actionable: what a city can do, and — just as importantly — what a single household can do about it.

## Modules

- 🌡️ **Heat** — estimated UHI intensity per Italian city, live weather, a mitigation simulator (green cover / albedo sliders), a cost & savings estimator, historical summer comparison, and a "what you can do at home" section (cool roofs, reflective membranes, green roofs, evaporative AC pre-cooling, solar panel yield gain from cooler roofs, and more).
- 💧 **Water** — major rivers and lakes, drought/shrinkage case studies, live hydrometric water level for Lombardia (ARPA sensors), regional sea-surface temperature (6 coastal zones, nearest to wherever you're looking on the map) with a **warm-season (May–September) average trend going back to 1982**, NDWI satellite overlay to see surface water directly, a Sentinel-1 SAR overlay that sees through cloud cover (optical NDWI can't) — useful for flood extent during a storm — a **Mediterranean sea-surface temperature overlay going back to 1982** (Copernicus Marine reprocessed L4 — drag the year slider and watch the basin warm), and 14 Mediterranean-wide markers with live sea temperature/level (Open-Meteo Marine) plus a sourced narrative on what's happening to marine fauna in that sub-basin (marine heatwaves, tropicalization, jellyfish blooms — real documented phenomena, not live data).
- 🌋 **Volcanoes** — Etna, Vesuvius, Stromboli, Campi Flegrei; live seismicity near each one (INGV), links to official webcams (embedded photo gallery for Etna/Stromboli, direct link for the others), SWIR satellite overlay for heat/lava flows, **SO₂ + Aerosol Index overlays (Sentinel-5P/TROPOMI)** showing where a volcanic plume is heading, a **day-by-day thermal-signal path** reconstructed from the last 5 days of VIIRS hotspots (see below) — plus a link to Copernicus CAMS for hourly ash-dispersion forecasts, and (Etna only) real-world context on Catania airport ash closures.
- 🔥 **Fires** — historical case studies, NBR satellite overlay for burn scars, **live wildfire hotspots** (VIIRS/NASA FIRMS, last 24h, each one clickable), and **live positions of Italy's Canadair/Erickson firefighting fleet** with click-to-see flight track (see below).
- 🧊 **Glacier outlines** — GLIMS/NSIDC perimeters as an overlay you can put *on top of* a recent Sentinel-2 image (it's a separate source from the satellite layer precisely so the two can be combined), in two campaigns: 2000–2003 and 2013–2016, plus a **compare mode** that draws both at once with the older one hue-shifted — two epochs in the same pink were indistinguishable, and toggling between them looked like nothing changed; the coloured fringe showing from underneath is ice that is gone. Deliberately no area figures: GLIMS aggregates delineations from different research groups, and for the same glacier in the same year they can disagree by an order of magnitude (Adamello 2011 appears as 0.25 / 9.09 / 15.76 km²; comparing two author-consistent campaigns, 2003→2016, it would "grow" from 10.10 to 14.36 km²). A chart built on that would show glaciers expanding. The outlines themselves are real geometry, so the retreat is shown rather than computed — for numbers the sources are WGMS (ground measurements, 448 Italian glaciers) and the Italian Glacier Inventory.
- 🏜️ **Desertification** — ISPRA risk-classified areas, NDVI overlay to see vegetation stress directly, and (search an address or click a city) a **live NDVI reading for that exact point** — see below.
- 🌊 **Hydrogeological risk** — how fire and desertification lead to bare soil and flash floods/landslides, ISPRA risk data, a pointer to EGMS (Copernicus ground-motion service) for real subsidence measurements, and (search an address or click a city) a **live landslide/flood hazard check for that exact point** — see below.
- 🌍 **Earthquakes** — live seismicity across Italy (INGV, last 7 days, magnitude ≥ 2.0), an explainer on why magnitude scales differ (ML/Mw/Md) and how magnitude differs from the Mercalli intensity scale.

All estimates are clearly labeled as models, not measurements — see [Methodology](#methodology--sources) below. Every hazard-related module also shows official safety guidance (sourced from Protezione Civile / iononrischio.gov.it, not written from memory) and, where relevant, a live Copernicus EMS alert (see below).

### Live Copernicus EMS activation alerts

Volcanoes, Fires, Hydrogeological risk, and Earthquakes each check, on open, whether there's a genuinely **active** Copernicus EMS Rapid Mapping activation nearby (within 150km) — not just any EMS product ever filed, which would mostly show stale, months-old risk-planning projects. Two filters make this meaningful instead of misleading:

- **Category-matched**: a wildfire activation only surfaces in the Fires module, a flood/landslide one only in Hydrogeological risk, and so on (`categorySlug` from the EMS API: `fire`, `flood`, `mass`, `volcan`, `earthquake`).
- **Phase-matched**: only `drmPhase: "response"` (an acute emergency, just declared) counts — `"preparedness"` and `"recovery"` activations are legitimate EMS products but can stay open for months and don't mean "something is happening right now here," so they're excluded.

If nothing matches, nothing renders — no empty section, no placeholder. The backend proxies `mapping.emergency.copernicus.eu` (no CORS from the browser), cached 15 minutes.

### Live per-point hydrogeological & desertification checks

Search any address, or click a city marker, and its detail panel checks that **exact point** against two live sources — not the fixed case-study markers those two modules otherwise show:

- **Hydrogeological risk**: queries ISPRA IdroGEO's public WMS (`idrogeo.isprambiente.it`, the national PAI mosaic) via `GetFeatureInfo` for both landslide hazard (`idrogeo:pericolosita`, IFFI/PAI classification P1–P4) and flood hazard (`idrogeo:pericolosita_alluvioni`, P1–P3) at that point.
- **Vegetation health / desertification**: queries the Copernicus Data Space **Statistical API** for a live Sentinel-2 NDVI mean over a small area (~500m) around the point, last 45 days — reuses the same short-lived OAuth token already issued for satellite overlays (`useSentinelToken`), so the client secret never touches the browser.

Both are plain client-side `fetch` calls against CORS-open public endpoints (verified live, not assumed); the panel gets a highlighted border when a real hazard/stress is found, and hides itself entirely if Sentinel Hub isn't configured for that deployment.

The address/city search bar is reachable from every module's header now, not just Heat. City markers are clickable from Heat, Desertification, and Hydrogeological risk (the other modules keep their own dedicated markers instead). The city detail panel adapts to which module you opened it from: Heat shows the full UHI/simulator/cost/savings view; Desertification and Hydrogeological risk show just live weather plus their one relevant live check — the rest of the Heat-focused content is dropped as not relevant there.

### Volcano thermal-signal path (last 5 days)

Inspired by the manual reconstructions analysts make by hand-tracing a lava flow's front across several days of Sentinel-2 SWIR imagery (labeled with dates and elevations) — that level of detail needs human interpretation of the imagery and isn't something an API can produce. What's automatable with data this app already has: selecting a volcano queries NASA FIRMS/VIIRS for the last 5 days (the max `VIIRS_SNPP_NRT` allows per request — confirmed live, the API rejects anything past 5 with "Invalid day range") within a small box around it, and shows every thermal detection grouped by day (count + max FRP) plus the same points on the map, colored pale-yellow (oldest) to red (most recent) — a genuine, live, coarse proxy (~375m VIIRS pixels) for where the heat has been moving, not a traced flow front. New backend route `/api/volcano-thermal-history` (`server/index.ts`), reusing the same NASA FIRMS proxy pattern as the national wildfire-hotspot feed, cached 10 minutes per point/day-range.

### Live Canadair tracking

The Fires module shows real-time positions of the Protezione Civile's water-bomber fleet. This needed several things verified by hand, not assumed:

- **Fleet identification**: 13 of the 19 Canadair CL-415 (registrations `I-DPCx`), plus 2 Erickson/Sikorsky S-64F helicopters (`I-CFAG`, `I-CFAM`), have a confirmed ICAO24/Mode-S code, looked up via [adsbdb.com](https://www.adsbdb.com/) — see `src/data/canadair-fleet.ts`. Aircraft not in that public database are omitted rather than guessing a code that would identify the wrong aircraft.
- **Live positions**: [OpenSky Network](https://opensky-network.org/) has free ADS-B data but blocks CORS for browser requests — the backend (`server/index.ts`) proxies it, filtered to just this fleet. Authenticated (OAuth2 client_credentials) when credentials are configured, for a 4000-credit/day quota instead of 400; falls back to the anonymous endpoint gracefully if not.
- **Flight track on click**: clicking an aircraft fetches and draws its recent track (`/api/canadair-track/:icao24`, proxying OpenSky's `/tracks/all`) — rendered as DOM markers rather than a MapLibre GL line (a GL `Layer` was tried and never rendered correctly across three browsers despite matching the documented API; the dot-based fallback works reliably).

## Tech stack

- **Frontend:** React 19 + TypeScript + Vite
- **Map:** [MapLibre GL JS](https://maplibre.org/) (WebGL) via `react-map-gl` — not Leaflet. Leaflet's raster-tile + CSS-scale zoom felt stepped on trackpads; MapLibre does real GPU-interpolated continuous zoom. (For reference: this is inherent to Leaflet, not this app — try zooming on openstreetmap.org, which uses vanilla Leaflet, for comparison.)
- **Satellite data:** Copernicus Data Space Ecosystem (Sentinel Hub WMS) —
  - Sentinel-2 (10m): true-color, NDVI, NDWI, SWIR, NBR
  - Sentinel-3 SLSTR (~1km): real Land Surface Temperature
  - Landsat 8-9 (30-100m thermal band): optional finer detail, sparser revisit
  - Sentinel-5P/TROPOMI (~7x3.5km): SO₂ and UV Aerosol Index, for volcanic plume tracking
  - Sentinel-1 GRD (10-20m): SAR VV backscatter, cloud-penetrating flood mapping
- **Atmospheric forecast:** Copernicus CAMS (linked out for hourly ash/SO₂ dispersion forecasts — the raw data is GRIB/NetCDF via a Python-oriented API with no ready WMS found, so this stays a link rather than an embedded layer; see [Roadmap](#roadmap))
- **Ground motion:** EGMS, Copernicus Land Monitoring Service (linked out — distributed as downloadable vector/CSV, no public anonymous WMS found with stable layer names, so likewise a link rather than an embedded layer)
- **Point/area statistics:** Copernicus Data Space Statistical API (`sh.dataspace.copernicus.eu/api/v1/statistics`) — live Sentinel-2 NDVI mean over a small area around a searched address/city, for the Desertification module's per-point check (see [above](#live-per-point-hydrogeological--desertification-checks))
- **Hydrogeological hazard mosaic:** ISPRA IdroGEO WMS (`idrogeo.isprambiente.it`, national PAI landslide/flood layers) — live per-point check for the Hydrogeological risk module (see [above](#live-per-point-hydrogeological--desertification-checks))
- **Emergency mapping:** Copernicus EMS Rapid Mapping activations API (`mapping.emergency.copernicus.eu`) — see [above](#live-copernicus-ems-activation-alerts)
- **Weather data:** Open-Meteo (no API key, CORS-enabled), including the Marine API for current sea-surface temperature at the Mediterranean markers
- **Sea temperature history:** precalculated into `src/data/sst-history.json` by `npm run sst:refresh` (`scripts/generate-sst-history.ts`), which samples one day every ~10 from May to September of every year since 1982 (the sea's warm season, not the calendar summer: May shows when warming starts, September is when the stored heat goes back into the atmosphere and feeds early-autumn storms — measured, the June–August trend runs at ~+0.5°C/decade against ~+0.27 for September–October, so widening to the full year would dilute rather than clarify). Seasons sampled below 80% coverage are dropped rather than published: the year in progress is missing precisely its hottest months, and its average would look like a sudden cooling that never happened, for each of the 6 sea zones, via Copernicus Marine `GetFeatureInfo`. Precalculated rather than fetched live because an honest seasonal average needs dozens of days per year and the service answers one point per request — thousands of requests no visitor should wait for. A GitHub Action (`refresh-sst-history.yml`) reruns it every October, when the reprocessed product has published the summer just gone, and deploys only if the file actually changed
- **Sea-surface temperature map layer:** Copernicus Marine (CMEMS) public WMTS, dataset `SST_MED_SST_L4_REP_OBSERVATIONS_010_021` — daily since 1982-01-01, called straight from the browser (verified: no credentials needed, tiles returned for 1985 and 2000 too). It's the *reprocessed* product, so it lags roughly a month behind today; requests for more recent dates are clamped back rather than returning blank tiles. Colour scale and its 17.8→28.5°C range come from the layer's own `GetLegend`, not invented locally. The same layer answers `GetFeatureInfo` with the pixel's numeric value, which is where the historical chart comes from — see below
- **Hydrometric data:** ARPA Lombardia live sensor network (Socrata dataset `647i-nhxk`) for river/lake water level — Lombardia only; a 9-region sweep in an earlier session found no equivalent live API elsewhere, would need scraping
- **Seismic data:** INGV FDSN Event API (no API key, CORS-enabled) — used for both the Volcanoes module (local seismicity) and the Earthquakes module (national feed)
- **Fire/burn reference data:** EFFIS (JRC/Copernicus) — used for static case-study sourcing only. A live "active fires" WMS/WFS layer was investigated and dropped: the public endpoint's hotspot data turned out to be frozen since ~October 2021 (verified by querying for the maximum timestamp across all its layers), not actually real-time despite being documented as such. Live hotspots instead come from NASA FIRMS (VIIRS), which is genuinely real-time.
- **Aircraft tracking:** OpenSky Network (ADS-B), fleet identification cross-checked against adsbdb.com
- **Backend:** plain Node/Express (`server/index.ts`) — meant to run behind your own Nginx reverse proxy (`/api/*` forwarded to it), not tied to Vercel, Netlify, or any specific host
- **Linting:** oxlint
- **Testing:** Vitest, unit tests on pure logic (`src/utils/*.test.ts`) — runs in CI on every push to `main` before deploying
- **Secret scanning:** gitleaks + pre-commit hooks, GitHub Actions CI
- **Rate limiting:** `express-rate-limit` on every backend proxy route that touches a shared external quota (Sentinel Hub, NASA FIRMS, OpenSky) — 120 req/min/IP on satellite tiles (legitimate pan/zoom bursts, mostly cache hits anyway), 30 req/min/IP on everything else; `/api/health` is exempt (used by the deploy pipeline's health check)

## Getting started

```bash
git clone <this-repo>
cd uhi-italia
npm install
cp .env.example .env.local   # then fill in real values, see below
npm run dev                  # frontend, http://localhost:5173
npm run server                # backend, http://localhost:3001 — needed for
                              # Sentinel Hub token exchange and live-data proxies
```

Vite proxies `/api/*` to `localhost:3001` in dev, so both can run side by side without CORS issues. Without the backend running, the app still works — city markers, weather, the simulator, and the cost estimator don't need it — but the Sentinel Hub token exchange, Canadair tracking, wildfire hotspots, volcano webcams, and EMS activation alerts won't do anything.

### Environment variables

Set these in `.env.local` (never committed — see [Security](#security)). The backend loads this same file automatically in dev (`process.loadEnvFile`); in production, set real environment variables instead (see [Security](#security)).

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SENTINEL_CLIENT_ID` | optional | Copernicus OAuth client ID, public-safe |
| `SENTINEL_CLIENT_SECRET` | optional | Copernicus OAuth client secret — server-side only, never `VITE_`-prefixed |
| `VITE_SENTINEL_INSTANCE_ID_S2` | optional | Sentinel Hub Configuration Instance ID for the Sentinel-2 L2A layers (true-color, NDVI, NDWI, SWIR, NBR) |
| `VITE_SENTINEL_INSTANCE_ID_S3` | currently unused | Declared for a future Sentinel-3 brightness-temperature layer; not wired to anything yet — the real LST layer below is what's actually used |
| `VITE_SENTINEL_INSTANCE_ID_S3_LST` | optional | Sentinel Hub Configuration Instance ID for a Sentinel-3 SLSTR L2 layer (real Land Surface Temperature, `SL_2_LST` product) |
| `VITE_SENTINEL_INSTANCE_ID_LANDSAT` | optional | Sentinel Hub Configuration Instance ID for a Landsat 8-9 layer (30-100m thermal band) |
| `VITE_SENTINEL_INSTANCE_ID_S5P_SO2` | optional | Sentinel Hub Configuration Instance ID for a Sentinel-5P L2 SO₂ layer (volcanic plume tracking) |
| `VITE_SENTINEL_INSTANCE_ID_S5P_AER` | optional | Sentinel Hub Configuration Instance ID for a Sentinel-5P L2 UV Aerosol Index layer — can be the same Instance ID as above if both layers live in one Configuration |
| `VITE_SENTINEL_INSTANCE_ID_S1` | optional | Sentinel Hub Configuration Instance ID for a Sentinel-1 GRD SAR backscatter layer |
| `NASA_FIRMS_MAP_KEY` | optional | NASA FIRMS API key for live wildfire hotspots — server-side only |
| `OPENSKY_CLIENT_ID` / `OPENSKY_CLIENT_SECRET` | optional | OpenSky Network OAuth2 credentials for a higher Canadair-tracking quota — falls back to the anonymous endpoint if unset |
| `PORT` | optional | Port for the backend process (default `3001`) |

If none of the Sentinel Hub ones are set, the app still works — satellite overlays simply won't render. Same for the other optional keys: each feature degrades gracefully (no live hotspots, lower-quota Canadair tracking, etc.) rather than breaking.

### Setting up Sentinel Hub (optional, for satellite imagery)

1. Register for free at [dataspace.copernicus.eu](https://dataspace.copernicus.eu).
2. Dashboard → **Sentinel Hub** → **OAuth Clients** → create a client → copy the client ID and secret into `.env.local`.
3. Dashboard → **Sentinel Hub** → **Configuration Utility** → **New configuration** from the **Sentinel-2 L2A** template. Copy its **Instance ID** into `VITE_SENTINEL_INSTANCE_ID_S2`.
4. In that configuration's **Layers** tab, confirm (or add as custom evalscript layers) the following layer IDs — this project expects these exact names, defined in `src/utils/satellite-layers.ts`:
   - `TRUE_COLOR`, `VEGETATION_INDEX` — usually present in the default template
   - `WATER_INDEX` (NDWI, McFeeters 1996 — bands B03/B08), `SWIR`, `BURN_INDEX` (NBR — bands B8A/B12) — custom evalscript layers; ask if you need the exact scripts used, they mask out water/cloud pixels via the SCL band to avoid nonsense values over the sea
5. Optionally, for real land-surface temperature: create another configuration from the **Sentinel-3 SLSTR L2** template (layer `LST` — a real Land Surface Temperature product, `SL_2_LST`, not just brightness temperature), and copy its Instance ID into `VITE_SENTINEL_INSTANCE_ID_S3_LST`.
6. Optionally, for finer thermal detail (at the cost of a sparser ~8-16 day revisit): a **Landsat 8-9** configuration, layer `9_THERMAL`, into `VITE_SENTINEL_INSTANCE_ID_LANDSAT`.

   **Known limitation (Landsat only, unresolved):** even with `leastCC` mosaicking and a 45-day lookback window, the Landsat thermal layer can come back empty (no valid pixel, not an error) if every recent pass over an area was cloudy. Confirmed this isn't a caching artifact. Treat it as best-effort; the UI shows a caveat when this layer is selected.

7. Optionally, for volcanic plume tracking: a **Sentinel-5P L2** configuration with two custom evalscript layers — `SO2` and `AER_AI_340_380` (the underscore ID, not the hyphenated variant some editors auto-generate for the same template — verify by previewing which one actually renders the color ramp). Both need the default raw evalscript replaced with a visualization (Sentinel Hub's default templates output the uncalibrated physical value, which renders essentially black/unreadable):

   ```javascript
   //VERSION=3
   const band = "SO2"; // or "AER_AI_340_380"
   var minVal = 0.0;  // SO2: 0.0 to 0.01 mol/m². AER_AI_340_380: -1.0 to 5.0
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

   Set each layer's **Mosaic order** to **"Most recent"**, not the S2 default of "Least cloud coverage" — a plume moves in hours, a multi-day composite would average it into nothing. Copy the Instance ID into both `VITE_SENTINEL_INSTANCE_ID_S5P_SO2` and `VITE_SENTINEL_INSTANCE_ID_S5P_AER` (same value if both layers live in one Configuration, which they can).

8. Optionally, for SAR flood mapping under cloud cover: a **Sentinel-1 GRD** configuration, custom evalscript layer `VV_BACKSCATTER` (can live in the same Configuration as the S5P layers above):

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

   Copy its Instance ID into `VITE_SENTINEL_INSTANCE_ID_S1`.

Note: WMS requests against a public Configuration don't require the OAuth token — but the Instance ID itself still consumes your account's processing-unit quota if shared or scraped, so treat it like a low-sensitivity secret (never commit it).

**Known limit:** the Sentinel-2 L2A collection rejects WMS requests coarser than 1500 m/pixel — at Italy-wide zoom levels the request would exceed that, so the Sentinel-2 layers only render from zoom 6 upward (`minZoom` in `satellite-layers.ts`, with 512px tiles rather than the 256px default — verified with a real request that 256px pushes the limit to zoom 7); the UI shows a hint to zoom in.

## Available scripts

```bash
npm run dev          # start the Vite dev server (frontend only)
npm run server       # start the backend with auto-restart on change (dev)
npm run server:prod  # start the backend once, no watcher (production)
npm run build        # type-check (tsc -b, includes the backend) and build the frontend
npm run lint         # run oxlint
npm run test          # run Vitest (unit tests, src/utils/*.test.ts)
npm run preview      # preview the production frontend build locally
```

## Project structure

```
src/
├── components/
│   ├── Map/        MapContainer, {City,WaterBody,Volcano,Fire,Desertification,HydroRisk,Earthquake}Markers,
│   │                CanadairMarkers, WildfireHotspotMarkers, VolcanoThermalPathMarkers,
│   │                DotMarker (shared marker),
│   │                SatelliteOverlay, LayerControls, MapCenterTracker, FlyTo
│   ├── Detail/      CityDetail, AddressDetail, WaterBodyDetail, VolcanoDetail, FireDetail,
│   │                HotspotDetail, DesertificationDetail, HydroRiskDetail, EarthquakeDetail,
│   │                {Fire,Earthquake,HydroRisk}SafetyInfo, EmsActivationNote, AddressAlerts,
│   │                HydrogeologicalRisk, DesertificationRisk (live per-point checks, see above),
│   │                VolcanoThermalPath (day-by-day thermal history, see above),
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
server/index.ts       Express backend — Sentinel Hub OAuth2 token exchange, OpenSky
                       Network proxy (Canadair positions + flight tracks), NASA FIRMS
                       proxy (wildfire hotspots + per-volcano thermal history), INGV
                       webcam gallery proxy, Copernicus EMS activations proxy
```

The backend is a plain Node/Express process, meant to sit behind an Nginx reverse
proxy that forwards `/api/*` to it. In dev, Vite proxies `/api` to `localhost:3001`
if the backend is also running (`npm run server`).

## Methodology & sources

The UHI intensity shown per city is a **statistical estimate**, not a satellite measurement, based on population, latitude, coastal proximity, and Po Valley thermal-inversion effects (see `src/utils/uhi-model.ts`). The mitigation simulator and cost/savings estimator are similarly order-of-magnitude models (`src/utils/simulator.ts`, `src/utils/costs.ts`). Water, fire, desertification, and hydrogeological-risk case studies are sourced narratives (ISPRA, EFFIS, ARPA regional bulletins, Copernicus EMS), not live computed statistics — each detail panel cites its source. Two exceptions: searching an address or clicking a city also runs a genuinely live, point-specific check for desertification (Sentinel-2 NDVI) and hydrogeological risk (ISPRA IdroGEO PAI hazard mosaic) — see [above](#live-per-point-hydrogeological--desertification-checks). Safety guidance is sourced from protezionecivile.gov.it and iononrischio.gov.it, not written from memory.

- Oke, T.R. (1982). *The energetic basis of the urban heat island.* Quarterly Journal of the Royal Meteorological Society, 108(455), 1-24.
- Bowler, D.E. et al. (2010). *Urban greening to cool towns and cities: A systematic review of the empirical evidence.* Landscape and Urban Planning, 97(3), 147-155.
- Akbari, H. et al. (2001). *Cool surfaces and shade trees to reduce energy use and improve air quality in urban areas.* Solar Energy, 70(3), 295-310.
- Stewart, I.D. & Oke, T.R. (2012). *Local Climate Zones for Urban Temperature Studies.* Bulletin of the American Meteorological Society, 93(12), 1879-1900.
- Santamouris, M. (2014). *Cooling the cities — A review of reflective and green roof mitigation technologies.* Solar Energy, 103, 682-703.
- McFeeters, S.K. (1996). *The use of the Normalized Difference Water Index (NDWI) in the delineation of open water features.* International Journal of Remote Sensing, 17(7), 1425-1432.

For precise figures, consult ISPRA, ENEA, and regional public-works price lists.

## Security

This is (or will be) a public repository. Secret hygiene is treated as a precondition, not a phase:

- `.env`, `.env.local`, and any `.env.*` other than `.env.example` are gitignored.
- `gitleaks` runs as a pre-commit hook (`.pre-commit-config.yaml`, `.gitleaks.toml`) and in CI (`.github/workflows/security.yml`), scanning every commit/push for secret-shaped strings.
- `SENTINEL_CLIENT_SECRET` and `OPENSKY_CLIENT_SECRET` never carry the `VITE_` prefix, so Vite never bundles them into client code — they're only read by `server/index.ts`, server-side.
- If a secret is ever committed by mistake: **revoke it immediately** on dataspace.copernicus.eu (or opensky-network.org), then scrub git history with `git-filter-repo` before pushing anything else.

In production, set the same variables as real environment variables on the server (a systemd unit's `Environment=` directives, a pm2 ecosystem file, or similar) — never in a committed file, and don't rely on `.env.local` being present (it shouldn't be, on a server you don't fully trust with a copy of your secrets sitting around).

## Privacy

A bilingual (IT/EN) Privacy notice is available from the "Privacy" button in the header (`src/components/Info/PrivacyPolicy.tsx`), based on an actual audit of the codebase: no cookies, no accounts or forms that persist data, and a single localStorage entry (`i18nextLng`) holding your chosen interface language — verified by inspecting the browser, not assumed from the code. Analytics is Umami, self-hosted on our own server in Milan (`stats.icarom.net`): cookieless, no localStorage, IP hashed with a daily-rotating salt, no third-party analytics provider and no traffic data leaving the EU — see the Analytics section of the notice. The address search sends the typed query directly from the browser to Nominatim/OpenStreetMap; the two live per-point checks above send the searched coordinates directly to ISPRA IdroGEO and Copernicus, same pattern (browser-to-provider, not through our backend). Contact: `info@icarom.net`. This is a good-faith technical description for a small personal project, not legal advice.

## Roadmap

- Historical Open-Meteo data: compare 1990s vs. today summer temperatures (partially done — see the historical-comparison feature in the Heat module; extend to more cities/periods).
- Real UHI values computed from urban-vs-rural LST difference (needs raster processing).
- Neighborhood-level granularity using Sentinel-2 at 10m.
- English/Italian language toggle in the UI itself — **Phase 1 done** (react-i18next, `src/locales/{it,en}/translation.json`): module titles/subtitles, the UHI/albedo explainers, methodology notes, safety info, and the satellite-layer selector are translated, with a toggle in the header. Longer per-item narrative text (fire/hydro-risk/volcano case studies, detail-panel technical notes) is still Italian-only — a phase 2.
- Cross-city comparison view.
- Embedded CAMS ash/SO₂ dispersion **forecast** layer, not just a link — blocked on CAMS ADS exposing only raw GRIB/NetCDF via a Python-oriented API; would need a small backend service to fetch and rasterize it, or a not-yet-found ready WMS.
- Embedded EGMS ground-motion layer, not just a link — blocked on no public anonymous WMS found with stable layer names; EGMS data is distributed as downloadable vector/CSV.
- An air-quality module (NO₂/CO/CH₄ via Sentinel-5P) — a full new module, not a small addition, so treated as a separate future initiative rather than bundled into existing ones.
- Copernicus EMS activation check for other, less time-critical categories (`storm`, `industrial`, `environment`) if a module for them ever exists.
- Hydrometric coverage beyond Lombardia — no live API found in a 9-region sweep; would need scraping regional ARPA sites individually.

### SEO and social preview

`public/robots.txt`, `public/sitemap.xml` and `public/og-image.jpg` (generated from the sea-temperature layer itself, 2400×1260). Before this, `robots.txt` and `sitemap.xml` *appeared* to exist because Nginx's SPA fallback served `index.html` with a 200 for any unknown path — worth knowing, because a quick check would have called them done. The sitemap lists a single URL and says why in a comment: the app keeps its state (module, layer, year) in React rather than in the address, so there is no `/mare` or `/ghiacciai` to declare — and no way to share "the Mediterranean in 1985" as a link. That's the change that would make indexing actually pay off.

## License

[GNU AGPLv3](LICENSE). The copyleft extends over the network: if you run a modified version of this site as a public service, you must make your modified source available to its users too — not just to people you distribute the code to directly, which is what a plain GPL would require. Chosen deliberately for a public-interest educational project: derivatives should stay open, including when only offered as a hosted service rather than distributed software.
