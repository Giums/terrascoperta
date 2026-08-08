# 🌍 TerraScoperta

*(Provisional name)*

**[🇮🇹 Leggi in italiano](README.it.md)**

An interactive, educational website mapping climate-related phenomena across Italy, using real public satellite and sensor data. Started as an urban heat island (UHI) tracker; grew into six modules covering heat, water, volcanoes, fires, desertification, and hydrogeological risk — all built by one person on free, public data. The goal is not just to show the problem, but to make it actionable: what a city can do, and — just as importantly — what a single household can do about it.

## Modules

- 🌡️ **Heat** — estimated UHI intensity per Italian city, live weather, a mitigation simulator (green cover / albedo sliders), a cost & savings estimator, and a "what you can do at home" section (cool roofs, reflective membranes, green roofs, evaporative AC pre-cooling, and more).
- 💧 **Water** — major rivers and lakes, drought/shrinkage case studies, NDWI satellite overlay to see surface water directly.
- 🌋 **Volcanoes** — Etna, Vesuvius, Stromboli, Campi Flegrei; live seismicity near each one (INGV), links to official webcams, SWIR satellite overlay for heat/lava flows.
- 🔥 **Fires** — historical case studies, NBR satellite overlay for burn scars, and **live positions of Italy's Canadair CL-415 firefighting fleet** (see below).
- 🏜️ **Desertification** — ISPRA risk-classified areas, NDVI overlay to see vegetation stress directly.
- 🌊 **Hydrogeological risk** — how fire and desertification lead to bare soil and flash floods/landslides, ISPRA risk data.

All estimates are clearly labeled as models, not measurements — see [Methodology](#methodology--sources) below.

### Live Canadair tracking

The Fires module shows real-time positions of the Protezione Civile's Canadair CL-415 water-bomber fleet. This needed two things verified by hand, not assumed:

- **Fleet identification**: 13 of the 19 aircraft (registrations `I-DPCx`) have a confirmed ICAO24/Mode-S code, looked up via [adsbdb.com](https://www.adsbdb.com/) — see `src/data/canadair-fleet.ts`. The other 6 aren't in that public database; better to omit them than guess a code that would identify the wrong aircraft.
- **Live positions**: [OpenSky Network](https://opensky-network.org/) has free, real ADS-B data, but blocks CORS for browser requests — the backend (`server/index.ts`) proxies it, filtered to just this fleet, with a 90-second in-memory cache to stay within OpenSky's low anonymous rate limit.

## Tech stack

- **Frontend:** React 19 + TypeScript + Vite
- **Map:** [MapLibre GL JS](https://maplibre.org/) (WebGL) via `react-map-gl` — not Leaflet. Leaflet's raster-tile + CSS-scale zoom felt stepped on trackpads; MapLibre does real GPU-interpolated continuous zoom. (For reference: this is inherent to Leaflet, not this app — try zooming on openstreetmap.org, which uses vanilla Leaflet, for comparison.)
- **Satellite data:** Copernicus Data Space Ecosystem (Sentinel Hub WMS) — true-color, NDVI, NDWI, SWIR, NBR (Sentinel-2, 10m) and Land Surface Temperature (Sentinel-3, ~1km)
- **Weather data:** Open-Meteo (no API key, CORS-enabled)
- **Seismic data:** INGV FDSN Event API (no API key, CORS-enabled)
- **Fire/burn reference data:** EFFIS (JRC/Copernicus) — used for static case-study sourcing only. A live "active fires" WMS/WFS layer was investigated and dropped: the public endpoint's hotspot data turned out to be frozen since ~October 2021 (verified by querying for the maximum timestamp across all its layers), not actually real-time despite being documented as such.
- **Aircraft tracking:** OpenSky Network (ADS-B), fleet identification cross-checked against adsbdb.com
- **Backend:** plain Node/Express (`server/index.ts`) — meant to run behind your own Nginx reverse proxy (`/api/*` forwarded to it), not tied to Vercel, Netlify, or any specific host
- **Linting:** oxlint
- **Secret scanning:** gitleaks + pre-commit hooks, GitHub Actions CI

## Getting started

```bash
git clone <this-repo>
cd uhi-italia
npm install
cp .env.example .env.local   # then fill in real values, see below
npm run dev                  # frontend, http://localhost:5173
npm run server                # backend, http://localhost:3001 — needed for
                              # Sentinel Hub token exchange and Canadair tracking
```

Vite proxies `/api/*` to `localhost:3001` in dev, so both can run side by side without CORS issues. Without the backend running, the app still works — city markers, weather, the simulator, and the cost estimator don't need it — but the Sentinel Hub token exchange and the Canadair layer won't do anything.

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
| `PORT` | optional | Port for the backend process (default `3001`) |

If none of the Sentinel Hub ones are set, the app still works — satellite overlays simply won't render.

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

Note: WMS requests against a public Configuration don't require the OAuth token — but the Instance ID itself still consumes your account's processing-unit quota if shared or scraped, so treat it like a low-sensitivity secret (never commit it).

**Known limit:** the Sentinel-2 L2A collection rejects WMS requests coarser than 1500 m/pixel — at Italy-wide zoom levels the request would exceed that, so the Sentinel-2 layers only render from zoom 7 upward (`minZoom` in `satellite-layers.ts`); the UI shows a hint to zoom in.

## Available scripts

```bash
npm run dev          # start the Vite dev server (frontend only)
npm run server       # start the backend with auto-restart on change (dev)
npm run server:prod  # start the backend once, no watcher (production)
npm run build        # type-check (tsc -b, includes the backend) and build the frontend
npm run lint         # run oxlint
npm run preview      # preview the production frontend build locally
```

## Project structure

```
src/
├── components/
│   ├── Map/        MapContainer, {City,WaterBody,Volcano,Fire,Desertification,HydroRisk}Markers,
│   │                CanadairMarkers, DotMarker (shared marker), SatelliteOverlay, LayerControls
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
server/index.ts       Express backend — Sentinel Hub OAuth2 token exchange,
                       OpenSky Network proxy (Canadair fleet positions)
```

The backend is a plain Node/Express process, meant to sit behind an Nginx reverse
proxy that forwards `/api/*` to it. In dev, Vite proxies `/api` to `localhost:3001`
if the backend is also running (`npm run server`).

## Methodology & sources

The UHI intensity shown per city is a **statistical estimate**, not a satellite measurement, based on population, latitude, coastal proximity, and Po Valley thermal-inversion effects (see `src/utils/uhi-model.ts`). The mitigation simulator and cost/savings estimator are similarly order-of-magnitude models (`src/utils/simulator.ts`, `src/utils/costs.ts`). Water, fire, desertification, and hydrogeological-risk case studies are sourced narratives (ISPRA, EFFIS, ARPA regional bulletins, Copernicus EMS), not live computed statistics — each detail panel cites its source.

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
- `SENTINEL_CLIENT_SECRET` never carries the `VITE_` prefix, so Vite never bundles it into client code — it's only read by `server/index.ts`, server-side.
- If a secret is ever committed by mistake: **revoke it immediately** on dataspace.copernicus.eu, then scrub git history with `git-filter-repo` before pushing anything else.

In production, set the same variables as real environment variables on the server (a systemd unit's `Environment=` directives, a pm2 ecosystem file, or similar) — never in a committed file, and don't rely on `.env.local` being present (it shouldn't be, on a server you don't fully trust with a copy of your secrets sitting around).

## Roadmap

- Historical Open-Meteo data: compare 1990s vs. today summer temperatures.
- Real UHI values computed from urban-vs-rural LST difference (needs raster processing).
- Neighborhood-level granularity using Sentinel-2 at 10m.
- English/Italian language toggle in the UI itself.
- Cross-city comparison view.
- Volcano webcams: currently link out to the official INGV page (no public embeddable stream found); revisit if INGV ever exposes one.
- Deploy: domain, server Nginx config, `server/index.ts` running as a permanent service (pm2/systemd).
