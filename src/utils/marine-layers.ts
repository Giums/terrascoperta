/**
 * Layer temperatura superficiale del mare da Copernicus Marine (CMEMS).
 *
 * Servizio diverso da Sentinel Hub (che sta in satellite-layers.ts): quello
 * serve immagini dai satelliti e passa dal nostro proxy perché consuma la
 * quota del nostro account, questo è un WMTS pubblico che risponde senza
 * credenziali — verificato scaricando tile reali, anche su date del 1985 e
 * del 2000. Quindi niente chiave da custodire e niente proxy: il browser
 * chiama direttamente Copernicus, coerente col resto del sito.
 *
 * Il dataset è la versione REP (riprocessata) del Mediterraneo: è la stessa
 * fonte da cui derivano le stime pubblicate sul riscaldamento del bacino,
 * quindi il layer non è un "colore indicativo" ma il dato su cui si fanno i
 * conti veri.
 */

const WMTS_BASE = "https://wmts.marine.copernicus.eu/teroWmts";

const SST_LAYER_ID =
  "SST_MED_SST_L4_REP_OBSERVATIONS_010_021/cmems_SST_MED_SST_L4_REP_OBSERVATIONS_010_021_202411/analysed_sst";

/** Inizio della serie giornaliera, da GetCapabilities: 1982-01-01/.../P1D. */
export const SST_MIN_YEAR = 1982;

/**
 * Essendo un prodotto *riprocessato*, non è in tempo reale: alla verifica
 * l'ultimo giorno disponibile era circa un mese indietro. Chiedere un tile
 * oltre quella soglia non dà errore, dà un riquadro vuoto — che sembrerebbe
 * un bug del sito. Arretriamo la data richiesta quel tanto che basta.
 * ponytail: soglia fissa invece di leggere il `Default` da GetCapabilities,
 * che costa un download da 65 MB. Se un giorno il layer risultasse vuoto per
 * le date recenti, alzare qui prima di cercare altrove.
 */
const REPROCESSING_LAG_DAYS = 40;

/** Estremi della scala colore, dalla legenda ufficiale (kelvin → °C). */
export const SST_SCALE_C = { min: 17.8, max: 28.5 };

/**
 * Stop della colormap "thermal" campionati dalla legenda ufficiale del layer,
 * per disegnare la barra sotto la mappa con gli stessi colori dei tile — una
 * mappa a colori senza scala non è leggibile, e inventare una palette diversa
 * la renderebbe sbagliata.
 */
export const SST_SCALE_STOPS = [
  "rgb(4,35,51)",
  "rgb(64,52,159)",
  "rgb(139,83,141)",
  "rgb(214,108,108)",
  "rgb(252,166,60)",
  "rgb(232,250,91)",
];

export const CMEMS_ATTRIBUTION = "E.U. Copernicus Marine Service Information";

function clampToAvailable(date: string): string {
  const asked = new Date(`${date}T00:00:00Z`);
  const newest = new Date();
  newest.setUTCDate(newest.getUTCDate() - REPROCESSING_LAG_DAYS);
  return (asked > newest ? newest : asked).toISOString().slice(0, 10);
}

/** URL template per un raster source MapLibre (placeholder {z}/{x}/{y}). */
export function sstTileUrl(date: string): string {
  const time = `${clampToAvailable(date)}T00:00:00.000Z`;
  return (
    `${WMTS_BASE}?service=WMTS&request=GetTile&version=1.0.0` +
    `&layer=${encodeURIComponent(SST_LAYER_ID)}&style=cmap%3Athermal` +
    `&tilematrixset=EPSG%3A3857&TileMatrix={z}&TileRow={y}&TileCol={x}` +
    `&format=image%2Fpng&time=${encodeURIComponent(time)}`
  );
}
