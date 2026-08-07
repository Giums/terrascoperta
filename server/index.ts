// Backend minimo per il deployment self-hosted (Nginx reverse-proxy → questo
// processo Node su una porta interna). Due endpoint, entrambi GET, entrambi
// nascondono un dettaglio che il browser non può gestire da solo:
// - /api/sentinel-token: scambia le credenziali Copernicus con un token OAuth2
//   di breve durata — il client_secret non deve mai arrivare al frontend.
// - /api/canadair-positions: OpenSky Network blocca CORS da browser, quindi
//   la richiesta va fatta da qui.
import express from "express";
import { canadairFleet } from "../src/data/canadair-fleet";

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
  callsign: string;
  lon: number;
  lat: number;
  altitude: number | null;
  onGround: boolean;
  velocity: number | null;
  heading: number | null;
  lastContact: number;
}

const CANADAIR_CACHE_MS = 90_000;
let canadairCache: { aircraft: CanadairPosition[]; updatedAt: number } | null = null;

app.get("/api/canadair-positions", async (_req, res) => {
  if (canadairCache && Date.now() - canadairCache.updatedAt < CANADAIR_CACHE_MS) {
    res.json(canadairCache);
    return;
  }

  const registrationByIcao = new Map(canadairFleet.map((a) => [a.icao24, a.registration]));
  const query = canadairFleet.map((a) => `icao24=${a.icao24}`).join("&");

  const response = await fetch(`https://opensky-network.org/api/states/all?${query}`);
  if (!response.ok) {
    res.status(502).json({ error: "OpenSky non ha risposto" });
    return;
  }

  const data = (await response.json()) as { states: unknown[][] | null };
  const aircraft: CanadairPosition[] = (data.states ?? [])
    .map((s) => ({
      icao24: s[0] as string,
      registration: registrationByIcao.get(s[0] as string) ?? (s[0] as string),
      callsign: ((s[1] as string) ?? "").trim(),
      lastContact: s[4] as number,
      lon: s[5] as number,
      lat: s[6] as number,
      altitude: s[7] as number | null,
      onGround: s[8] as boolean,
      velocity: s[9] as number | null,
      heading: s[10] as number | null,
    }))
    .filter((a) => a.lat != null && a.lon != null);

  canadairCache = { aircraft, updatedAt: Date.now() };
  res.set("Cache-Control", "public, max-age=90");
  res.json(canadairCache);
});

app.listen(PORT, () => {
  console.log(`API server in ascolto su :${PORT}`);
});
