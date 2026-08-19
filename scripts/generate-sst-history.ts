/**
 * Rigenera src/data/sst-history.json: media estiva della temperatura del mare
 * per ogni zona italiana, dal 1982 a oggi, da Copernicus Marine.
 *
 * Perché precalcolato e non chiesto dal browser: una media stagionale onesta
 * richiede decine di giorni per anno e il servizio risponde un punto per
 * richiesta — moltiplicato per 6 zone e 40+ anni fa qualche migliaio di
 * richieste, che nessun visitatore deve aspettare (né Copernicus subire a ogni
 * caricamento di pagina). Girando una volta l'anno in CI il costo è pagato una
 * volta sola e il grafico è istantaneo.
 *
 *   npm run sst:refresh
 *
 * Il JSON prodotto va committato: è un dato derivato ma stabile, e averlo nel
 * repo rende il grafico verificabile (chiunque può rilanciare lo script e
 * confrontare) invece che frutto di una chiamata opaca a runtime.
 */
import { writeFileSync } from "node:fs";
import { SEA_ZONES } from "../src/data/sea-zones";

const WMTS = "https://wmts.marine.copernicus.eu/teroWmts";
const LAYER =
  "SST_MED_SST_L4_REP_OBSERVATIONS_010_021/cmems_SST_MED_SST_L4_REP_OBSERVATIONS_010_021_202411/analysed_sst";

const FIRST_YEAR = 1982;

/**
 * Giorni campionati per ogni estate. Uno ogni ~10 giorni da maggio a settembre:
 * la stagione calda del mare non coincide con l'estate del calendario — maggio
 * mostra quando il riscaldamento parte, settembre è il mese in cui il calore
 * accumulato viene restituito all'atmosfera (è l'energia che alimenta i
 * nubifragi di inizio autunno). Verificato che il segnale è lì: il trend
 * giugno-agosto corre a ~+0,5 °C/decennio, quello settembre-ottobre a ~+0,27,
 * quindi allargare all'anno intero diluirebbe invece di chiarire.
 * Uno ogni ~10 giorni e non tutti:
 * abbastanza per smorzare il caso di una singola giornata di ondata di calore
 * (un solo giorno non è un clima — il 15 luglio 2015 risulta più caldo del 15
 * luglio 2025, che invertirebbe il trend), abbastanza pochi da tenere il giro
 * completo in pochi minuti.
 */
const SAMPLE_DAYS = [
  "05-01", "05-11", "05-21",
  "06-01", "06-11", "06-21",
  "07-01", "07-11", "07-21",
  "08-01", "08-11", "08-21", "08-31",
  "09-10", "09-20", "09-30",
];

/** Zoom del tile interrogato: più alto = pixel più piccolo, punto più preciso. */
const ZOOM = 6;

/** Il prodotto è riprocessato, non real-time: le date troppo recenti non esistono ancora. */
const LAG_DAYS = 40;

/** Frazione minima di giorni campionati perché la media dell'anno sia pubblicabile. */
const MIN_COVERAGE = 0.8;

interface TilePixel {
  x: number;
  y: number;
  i: number;
  j: number;
}

function tilePixel(lat: number, lng: number, zoom: number): TilePixel {
  const n = 2 ** zoom;
  const latRad = (lat * Math.PI) / 180;
  const xf = ((lng + 180) / 360) * n;
  const yf = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return {
    x: Math.floor(xf),
    y: Math.floor(yf),
    i: Math.floor((xf % 1) * 256),
    j: Math.floor((yf % 1) * 256),
  };
}

/**
 * Un giro completo sono migliaia di richieste di fila: su una qualsiasi di
 * queste la connessione può cadere o restare appesa, e senza rete di sicurezza
 * l'intero giro va perso a due terzi (successo verificato: è capitato dopo
 * ~2500 richieste, con la scrittura del file che avviene solo alla fine).
 * Tre tentativi con attesa crescente, e un timeout esplicito per non restare
 * bloccati sul default di Node, che è di 5 minuti.
 */
const RETRIES = 3;
const REQUEST_TIMEOUT_MS = 20_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string): Promise<Response | null> {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      return await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch (err) {
      if (attempt === RETRIES) {
        console.warn(`  richiesta fallita dopo ${RETRIES} tentativi: ${(err as Error).message}`);
        return null;
      }
      await sleep(attempt * 2000);
    }
  }
  return null;
}

async function sstAt(lat: number, lng: number, date: string): Promise<number | null> {
  const { x, y, i, j } = tilePixel(lat, lng, ZOOM);
  const params = new URLSearchParams({
    service: "WMTS",
    request: "GetFeatureInfo",
    version: "1.0.0",
    layer: LAYER,
    style: "cmap:thermal",
    tilematrixset: "EPSG:3857",
    TileMatrix: String(ZOOM),
    TileRow: String(y),
    TileCol: String(x),
    I: String(i),
    J: String(j),
    infoformat: "application/json",
    time: `${date}T00:00:00.000Z`,
  });
  const res = await fetchWithRetry(`${WMTS}?${params}`);
  if (!res || !res.ok) return null;
  const json = (await res.json()) as { features?: { properties?: { value?: number | null } }[] };
  const kelvin = json.features?.[0]?.properties?.value;
  // Il servizio risponde in kelvin; null = pixel senza dato (terra, o giorno mancante).
  return typeof kelvin === "number" ? kelvin - 273.15 : null;
}

function newestAvailable(): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - LAG_DAYS);
  return d;
}

async function main(): Promise<void> {
  const newest = newestAvailable();
  const lastYear = newest.getUTCFullYear();
  const zones: Record<string, Record<number, number>> = {};
  let requests = 0;
  let missing = 0;
  let incomplete = 0;

  for (const zone of SEA_ZONES) {
    zones[zone.id] = {};
    for (let year = FIRST_YEAR; year <= lastYear; year++) {
      const values: number[] = [];
      for (const day of SAMPLE_DAYS) {
        const date = `${year}-${day}`;
        if (new Date(`${date}T00:00:00Z`) > newest) continue;
        const value = await sstAt(zone.point.lat, zone.point.lng, date);
        requests++;
        if (value == null) missing++;
        else values.push(value);
      }
      // Un anno campionato solo a metà (tipicamente quello in corso: il
      // prodotto riprocessato è indietro di ~40 giorni, quindi mancano proprio
      // i mesi più caldi) darebbe una media artificialmente bassa, e sul
      // grafico sembrerebbe un raffreddamento improvviso che non è avvenuto.
      // Meglio nessun punto che un punto sbagliato: rientrerà alla prossima
      // rigenerazione, quando la stagione sarà completa.
      if (values.length >= SAMPLE_DAYS.length * MIN_COVERAGE) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        zones[zone.id][year] = Number(mean.toFixed(2));
      } else if (values.length) {
        incomplete++;
      }
    }
    const done = Object.keys(zones[zone.id]).length;
    console.log(`${zone.id.padEnd(10)} ${done} estati (${FIRST_YEAR}–${lastYear})`);
  }

  // L'anno in corso viene scartato perché incompleto, quindi l'ultimo anno
  // *esaminato* e l'ultimo *con dati* non coincidono: pubblichiamo il secondo,
  // che è quello a cui il grafico può davvero arrivare.
  const lastWithData = Math.max(
    ...Object.values(zones).flatMap((byYear) => Object.keys(byYear).map(Number)),
  );

  const out = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: "Copernicus Marine Service — SST_MED_SST_L4_REP_OBSERVATIONS_010_021",
    note: "Media della temperatura superficiale del mare sui giorni campionati della stagione calda, maggio-settembre (°C).",
    sampledDays: SAMPLE_DAYS,
    firstYear: FIRST_YEAR,
    lastYear: lastWithData,
    lastYearExamined: lastYear,
    zones,
  };
  writeFileSync("src/data/sst-history.json", `${JSON.stringify(out, null, 2)}\n`);
  console.log(
    `\n${requests} richieste, ${missing} senza dato, ${incomplete} stagioni scartate perché incomplete` +
      ` → src/data/sst-history.json`,
  );
}

await main();
