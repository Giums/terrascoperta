# 🌡️ Urban Heat Islands — Italy

**[🇮🇹 Leggi in italiano](README.it.md)**

An interactive, educational website mapping urban heat islands (UHI) across Italian cities, combining real satellite data (Copernicus Sentinel, NASA GIBS) with live weather (Open-Meteo). The goal is not just to show the problem, but to make it actionable: what a city can do, and — just as importantly — what a single household can do about it.

## Features

- **Interactive map** of Italian provincial capitals and cities >50k inhabitants, with an estimated UHI intensity per city (color-coded markers).
- **Satellite overlays**: true-color and NDVI imagery from Sentinel-2 (10m resolution) and land-surface temperature from Sentinel-3 (via Copernicus Data Space Ecosystem / Sentinel Hub), with automatic fallback to NASA GIBS/MODIS (no auth required, ~1km resolution) when Sentinel Hub isn't configured.
- **Live weather** per city (temperature, humidity, wind, solar radiation) from Open-Meteo.
- **Mitigation simulator**: sliders for green-cover increase and high-albedo surfaces, estimating the temperature reduction based on published research (Bowler et al. 2010, Akbari et al. 2001).
- **Cost & savings estimator**: rough order-of-magnitude cost of interventions, AC energy savings, CO₂ reduction, and payback period.
- **"What you can do at home"** section: concrete interventions (cool roofs, reflective membranes, green roofs, climbing plants, deciduous trees, window films) with cost, effect, and difficulty.
- **Educational panel**: what UHI is, why it happens, the night-time effect of albedo, and the AC feedback loop (every AC unit cools inside air by dumping heat outside, warming the street, forcing more AC use).

All estimates are clearly labeled as models, not measurements — see [Methodology](#methodology--sources) below.

## Tech stack

- **Frontend:** React 19 + TypeScript + Vite, no backend framework
- **Map:** Leaflet / react-leaflet, CARTO Dark tiles
- **Satellite data:** Copernicus Data Space Ecosystem (Sentinel Hub WMS) with NASA GIBS WMTS/WMS as a no-auth fallback
- **Weather data:** Open-Meteo (no API key, CORS-enabled)
- **Serverless:** one Vercel Edge Function (`api/sentinel-token.ts`) for OAuth2 token exchange — kept for future features that need the authenticated Sentinel Hub Process API; the current map overlays use public WMS requests and don't need it
- **Linting:** oxlint
- **Secret scanning:** gitleaks + pre-commit hooks, GitHub Actions CI

Everything runs client-side against public, CORS-enabled APIs — there's no backend to host or scale, just a static build.

## Getting started

```bash
git clone <this-repo>
cd uhi-italia
npm install
cp .env.example .env.local   # then fill in real values, see below
npm run dev
```

### Environment variables

Set these in `.env.local` (never committed — see [Security](#security)):

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SENTINEL_CLIENT_ID` | optional | Copernicus OAuth client ID, public-safe |
| `SENTINEL_CLIENT_SECRET` | optional | Copernicus OAuth client secret — server-side only, never `VITE_`-prefixed |
| `VITE_SENTINEL_INSTANCE_ID_S2` | optional | Sentinel Hub Configuration Instance ID for a Sentinel-2 L2A layer |
| `VITE_SENTINEL_INSTANCE_ID_S3` | optional | Sentinel Hub Configuration Instance ID for a Sentinel-3 SLSTR layer |

If none of these are set, the app still works fully — satellite overlays fall back to NASA GIBS.

### Setting up Sentinel Hub (optional, for higher-resolution imagery)

1. Register for free at [dataspace.copernicus.eu](https://dataspace.copernicus.eu).
2. Dashboard → **Sentinel Hub** → **OAuth Clients** → create a client → copy the client ID and secret into `.env.local`.
3. Dashboard → **Sentinel Hub** → **Configuration Utility** → **New configuration**, once from the **Sentinel-2 L2A** template and once from **Sentinel-3 SLSTR**. Copy each **Instance ID** into `.env.local`.
4. Open each configuration's **Layers** tab to confirm the layer IDs — this project expects `TRUE_COLOR` and `VEGETATION_INDEX` (Sentinel-2) and `F1_VISUALIZED` (Sentinel-3, brightness temperature — SLSTR's default template has no dedicated LST product). If your configuration uses different layer names, update `src/utils/satellite-layers.ts`.

Note: WMS requests against a public Configuration don't require the OAuth token — but the Instance ID itself still consumes your account's processing-unit quota if shared or scraped, so treat it like a low-sensitivity secret (never commit it).

**Known limit:** the Sentinel-2 L2A collection rejects WMS requests coarser than 1500 m/pixel — at Italy-wide zoom levels the request would exceed that, so the Sentinel-2 layers only render from zoom 7 upward (`minZoom` in `satellite-layers.ts`); the UI shows a hint to zoom in.

## Available scripts

```bash
npm run dev       # start the Vite dev server
npm run build     # type-check (tsc -b) and build for production
npm run lint      # run oxlint
npm run preview   # preview the production build locally
```

## Project structure

```
src/
├── components/
│   ├── Map/       MapContainer, CityMarkers, SatelliteOverlay, LayerControls
│   ├── Detail/     CityDetail, WeatherLive, Simulator, CostEstimator, HomeActions
│   ├── Info/       InfoPanel, UHIExplainer, AlbedoExplainer
│   ├── Search/     CitySearch
│   └── Layout/     Shell
├── data/cities.ts                 Italian cities dataset
├── hooks/{useWeather,useSentinel}.ts
├── utils/{uhi-model,simulator,costs,satellite-layers}.ts
api/sentinel-token.ts              Edge Function — Sentinel Hub OAuth2 token exchange
```

## Methodology & sources

The UHI intensity shown per city is a **statistical estimate**, not a satellite measurement, based on population, latitude, coastal proximity, and Po Valley thermal-inversion effects (see `src/utils/uhi-model.ts`). The mitigation simulator and cost/savings estimator are similarly order-of-magnitude models (`src/utils/simulator.ts`, `src/utils/costs.ts`). Sources:

- Oke, T.R. (1982). *The energetic basis of the urban heat island.* Quarterly Journal of the Royal Meteorological Society, 108(455), 1-24.
- Bowler, D.E. et al. (2010). *Urban greening to cool towns and cities: A systematic review of the empirical evidence.* Landscape and Urban Planning, 97(3), 147-155.
- Akbari, H. et al. (2001). *Cool surfaces and shade trees to reduce energy use and improve air quality in urban areas.* Solar Energy, 70(3), 295-310.
- Stewart, I.D. & Oke, T.R. (2012). *Local Climate Zones for Urban Temperature Studies.* Bulletin of the American Meteorological Society, 93(12), 1879-1900.
- Santamouris, M. (2014). *Cooling the cities — A review of reflective and green roof mitigation technologies.* Solar Energy, 103, 682-703.

For precise figures, consult ISPRA, ENEA, and regional public-works price lists.

## Security

This is (or will be) a public repository. Secret hygiene is treated as a precondition, not a phase:

- `.env`, `.env.local`, and any `.env.*` other than `.env.example` are gitignored.
- `gitleaks` runs as a pre-commit hook (`.pre-commit-config.yaml`, `.gitleaks.toml`) and in CI (`.github/workflows/security.yml`), scanning every commit/push for secret-shaped strings.
- `SENTINEL_CLIENT_SECRET` never carries the `VITE_` prefix, so Vite never bundles it into client code — it's only read by the `api/sentinel-token.ts` Edge Function, server-side.
- If a secret is ever committed by mistake: **revoke it immediately** on dataspace.copernicus.eu, then scrub git history with `git-filter-repo` before pushing anything else.

In production (Vercel/Netlify), set the same variables in the hosting provider's Environment Variables dashboard — never in a committed file.

## Roadmap

- Historical Open-Meteo data: compare 1990s vs. today summer temperatures.
- Real UHI values computed from urban-vs-rural LST difference (needs raster processing).
- Neighborhood-level granularity using Sentinel-2 at 10m.
- English/Italian language toggle in the UI itself.
- Cross-city comparison view.
