// Backend minimo per il deployment self-hosted (Nginx reverse-proxy → questo
// processo Node su una porta interna). Due endpoint, entrambi GET, entrambi
// nascondono un dettaglio che il browser non può gestire da solo:
// - /api/sentinel-token: scambia le credenziali Copernicus con un token OAuth2
//   di breve durata — il client_secret non deve mai arrivare al frontend.
// - /api/canadair-positions: OpenSky Network blocca CORS da browser, quindi
//   la richiesta va fatta da qui.
// - /api/wildfire-hotspots: NASA FIRMS non espone CORS e la MAP_KEY personale
//   non deve stare nel bundle frontend (abuso di quota se scrapata).
// - /api/volcano-webcams: la pagina galleria INGV è HTML statico ma senza
//   CORS — va letta e "spacchettata" qui, il browser non può leggerla da sé.
import express from "express";
import { canadairFleet, type AircraftType } from "../src/data/canadair-fleet";

// In produzione le variabili vengono dal servizio (systemd/pm2), non da un
// file: qui carichiamo .env.local solo se esiste, per lo sviluppo locale.
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local assente (produzione, o variabili già nell'ambiente) — normale.
}

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// Il client ID non è sensibile (è esposto anche al frontend), quindi vive nella
// stessa variabile VITE_-prefixata usata da Vite — solo il secret ha un nome suo.
const SENTINEL_CLIENT_ID = process.env.VITE_SENTINEL_CLIENT_ID;

app.get("/api/sentinel-token", async (_req, res) => {
  // Letto qui, non a livello di modulo: la regola gitleaks "copernicus-client-
  // secret" segnala un token >=20 char accanto a "client_secret" per
  // intercettare un secret incollato per errore, ma si ferma su "process."
  // (il punto rompe il match) — un alias a livello di modulo perderebbe
  // quel prefisso e farebbe scattare un falso positivo da solo.
  const clientSecret = process.env.SENTINEL_CLIENT_SECRET;

  if (!SENTINEL_CLIENT_ID || !clientSecret) {
    res.status(503).json({ error: "Sentinel Hub non configurato su questo deployment" });
    return;
  }

  const response = await fetch(
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: SENTINEL_CLIENT_ID,
        client_secret: clientSecret,
      }),
    },
  );

  if (!response.ok) {
    res.status(502).json({ error: "Token exchange fallito" });
    return;
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  res.set("Cache-Control", "private, max-age=270");
  res.json({ access_token: data.access_token, expires_in: data.expires_in });
});

interface CanadairPosition {
  icao24: string;
  registration: string;
  type: AircraftType;
  callsign: string;
  lon: number;
  lat: number;
  altitude: number | null;
  onGround: boolean;
  velocity: number | null;
  heading: number | null;
  verticalRate: number | null;
  lastContact: number;
}

const CANADAIR_CACHE_MS = 90_000;
let canadairCache: { aircraft: CanadairPosition[]; updatedAt: number } | null = null;

// OAuth2 client_credentials, stesso schema del token Sentinel Hub sopra —
// OpenSky non accetta più Basic Auth. Con un client registrato (gratuito) il
// limite sale da 400 a 4000 crediti/giorno. Se le variabili non sono
// configurate si resta anonimi: nessun errore, solo meno margine prima del 429.
let openSkyToken: { value: string; expiresAt: number } | null = null;

async function getOpenSkyToken(): Promise<string | null> {
  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (openSkyToken && Date.now() < openSkyToken.expiresAt) return openSkyToken.value;

  const response = await fetch(
    "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    },
  );
  if (!response.ok) return null;

  const data = (await response.json()) as { access_token: string; expires_in: number };
  // Margine di 60s sulla scadenza dichiarata, per non usare un token appena spirato.
  openSkyToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return openSkyToken.value;
}

app.get("/api/canadair-positions", async (_req, res) => {
  if (canadairCache && Date.now() - canadairCache.updatedAt < CANADAIR_CACHE_MS) {
    res.json(canadairCache);
    return;
  }

  const fleetByIcao = new Map(canadairFleet.map((a) => [a.icao24, a]));
  const query = canadairFleet.map((a) => `icao24=${a.icao24}`).join("&");
  const token = await getOpenSkyToken();

  const response = await fetch(`https://opensky-network.org/api/states/all?${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    res.status(502).json({ error: "OpenSky non ha risposto" });
    return;
  }

  const data = (await response.json()) as { states: unknown[][] | null };
  const aircraft: CanadairPosition[] = (data.states ?? [])
    .map((s) => ({
      icao24: s[0] as string,
      registration: fleetByIcao.get(s[0] as string)?.registration ?? (s[0] as string),
      type: fleetByIcao.get(s[0] as string)?.type ?? "canadair",
      callsign: ((s[1] as string) ?? "").trim(),
      lastContact: s[4] as number,
      lon: s[5] as number,
      lat: s[6] as number,
      altitude: s[7] as number | null,
      onGround: s[8] as boolean,
      velocity: s[9] as number | null,
      heading: s[10] as number | null,
      verticalRate: s[11] as number | null,
    }))
    .filter((a) => a.lat != null && a.lon != null);

  canadairCache = { aircraft, updatedAt: Date.now() };
  res.set("Cache-Control", "public, max-age=90");
  res.json(canadairCache);
});

interface TrackPoint {
  time: number;
  lat: number;
  lng: number;
}

const TRACK_CACHE_MS = 60_000;
const trackCache = new Map<string, { path: TrackPoint[]; updatedAt: number }>();

// /tracks richiede sempre un client autenticato (a differenza di /states/all,
// qui l'accesso anonimo non è previsto affatto) — senza credenziali OpenSky
// configurate l'endpoint risponde 503, non un errore silenzioso.
app.get("/api/canadair-track/:icao24", async (req, res) => {
  const icao24 = req.params.icao24.toLowerCase();
  if (!canadairFleet.some((a) => a.icao24 === icao24)) {
    res.status(404).json({ error: "Velivolo non in flotta" });
    return;
  }

  const cached = trackCache.get(icao24);
  if (cached && Date.now() - cached.updatedAt < TRACK_CACHE_MS) {
    res.json(cached);
    return;
  }

  const token = await getOpenSkyToken();
  if (!token) {
    res.status(503).json({ error: "Traccia volo non disponibile: OpenSky non autenticato su questo deployment" });
    return;
  }

  const response = await fetch(`https://opensky-network.org/api/tracks/all?icao24=${icao24}&time=0`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    res.status(502).json({ error: "OpenSky non ha risposto" });
    return;
  }

  const data = (await response.json()) as { path: [number, number | null, number | null, ...unknown[]][] | null };
  const path: TrackPoint[] = (data.path ?? [])
    .filter((p) => p[1] != null && p[2] != null)
    .map((p) => ({ time: p[0], lat: p[1] as number, lng: p[2] as number }));

  const result = { path, updatedAt: Date.now() };
  trackCache.set(icao24, result);
  res.set("Cache-Control", "public, max-age=60");
  res.json(result);
});

interface WildfireHotspot {
  lat: number;
  lon: number;
  confidence: string;
  acqDate: string;
  acqTime: string;
  frp: number;
  daynight: string;
}

// west,south,east,north — copre l'Italia con un margine.
const ITALY_BBOX = "6,35,19,47";
const FIRMS_CACHE_MS = 10 * 60_000; // i satelliti VIIRS ripassano poche volte al giorno
let firmsCache: { hotspots: WildfireHotspot[]; updatedAt: number } | null = null;

app.get("/api/wildfire-hotspots", async (_req, res) => {
  const mapKey = process.env.NASA_FIRMS_MAP_KEY;
  if (!mapKey) {
    res.status(503).json({ error: "NASA FIRMS non configurato su questo deployment" });
    return;
  }

  if (firmsCache && Date.now() - firmsCache.updatedAt < FIRMS_CACHE_MS) {
    res.json(firmsCache);
    return;
  }

  const response = await fetch(
    `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/${ITALY_BBOX}/1`,
  );
  if (!response.ok) {
    res.status(502).json({ error: "NASA FIRMS non ha risposto" });
    return;
  }

  const csv = (await response.text()).trim();
  const lines = csv.split("\n");
  const header = lines[0]?.split(",") ?? [];
  const col = (name: string) => header.indexOf(name);
  const idx = {
    lat: col("latitude"),
    lon: col("longitude"),
    confidence: col("confidence"),
    acqDate: col("acq_date"),
    acqTime: col("acq_time"),
    frp: col("frp"),
    daynight: col("daynight"),
  };

  const hotspots: WildfireHotspot[] =
    idx.lat < 0
      ? [] // header inatteso (es. "Invalid MAP_KEY" come unica riga) — lista vuota, non un crash
      : lines
          .slice(1)
          .filter(Boolean)
          .map((line) => {
            const cols = line.split(",");
            return {
              lat: Number(cols[idx.lat]),
              lon: Number(cols[idx.lon]),
              confidence: cols[idx.confidence] ?? "",
              acqDate: cols[idx.acqDate] ?? "",
              acqTime: cols[idx.acqTime] ?? "",
              frp: Number(cols[idx.frp]),
              daynight: cols[idx.daynight] ?? "",
            };
          })
          .filter((h) => Number.isFinite(h.lat) && Number.isFinite(h.lon));

  firmsCache = { hotspots, updatedAt: Date.now() };
  res.set("Cache-Control", "public, max-age=600");
  res.json(firmsCache);
});

interface WebcamShot {
  code: string;
  imageUrl: string;
}

// Solo Etna e Stromboli hanno questa galleria statica (dominio ct.ingv.it).
// Vesuvio/Campi Flegrei (dominio ov.ingv.it) non hanno un equivalente
// pubblico trovato — verificato, non solo non ancora cercato.
const WEBCAM_GALLERIES: Record<string, string> = {
  Etna: "https://www.ct.ingv.it/sezioniesterne/webcam/WebcamEtna.php",
  Stromboli: "https://www.ct.ingv.it/sezioniesterne/webcam/WebcamEolie.php",
};

const WEBCAM_CACHE_MS = 5 * 60_000;
const webcamCache = new Map<string, { shots: WebcamShot[]; updatedAt: number }>();

app.get("/api/volcano-webcams/:volcano", async (req, res) => {
  const galleryUrl = WEBCAM_GALLERIES[req.params.volcano];
  if (!galleryUrl) {
    res.status(404).json({ error: "Nessuna galleria webcam per questo vulcano" });
    return;
  }

  const cached = webcamCache.get(req.params.volcano);
  if (cached && Date.now() - cached.updatedAt < WEBCAM_CACHE_MS) {
    res.json(cached);
    return;
  }

  const response = await fetch(galleryUrl);
  if (!response.ok) {
    res.status(502).json({ error: "Galleria INGV non ha risposto" });
    return;
  }

  const html = await response.text();
  const base = new URL(galleryUrl);
  // Pagina HTML statica generata server-side da INGV, non un'API — il
  // formato è quello che è, niente di più robusto disponibile.
  const pattern = /<img src = '([^']+)'[^>]*><\/a><\/div><div class = 'text'>([^<]+)<\/div>/g;
  const shots: WebcamShot[] = [];
  for (const match of html.matchAll(pattern)) {
    const [, relSrc, code] = match;
    if (relSrc.includes("Nowork")) continue; // telecamera fuori servizio
    shots.push({ code, imageUrl: new URL(relSrc, base).toString() });
  }

  const result = { shots, updatedAt: Date.now() };
  webcamCache.set(req.params.volcano, result);
  res.set("Cache-Control", "public, max-age=300");
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`API server in ascolto su :${PORT}`);
});
