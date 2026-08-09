import type { Volcano } from "../../data/volcanoes";
import { useSeismicity } from "../../hooks/useSeismicity";
import { useVolcanoWebcams } from "../../hooks/useVolcanoWebcams";
import { staticSnapshotUrl } from "../../utils/satellite-layers";
import { activityLabel } from "../../utils/volcano-activity";
import EmsActivationNote from "./EmsActivationNote";
import "../Info/InfoPanel.css";

interface VolcanoDetailProps {
  volcano: Volcano;
  /** FRP massima (MW) rilevata nel raggio del vulcano, null = nessuna attività rilevata ora. */
  frp: number | null;
  onClose: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("it-IT");
}

function todayMinus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Margine intorno al vulcano per l'anteprima satellitare: ~15-17km, copre
// l'edificio vulcanico e i fianchi senza inquadrare troppo territorio intorno.
const SNAPSHOT_MARGIN_DEG = 0.15;

export default function VolcanoDetail({ volcano, frp, onClose }: VolcanoDetailProps) {
  const { events, loading, error } = useSeismicity(volcano.lat, volcano.lng);
  const { shots: webcamShots } = useVolcanoWebcams(volcano.name);
  const hasActivity = frp != null;

  const bbox = {
    minLat: volcano.lat - SNAPSHOT_MARGIN_DEG,
    maxLat: volcano.lat + SNAPSHOT_MARGIN_DEG,
    minLng: volcano.lng - SNAPSHOT_MARGIN_DEG,
    maxLng: volcano.lng + SNAPSHOT_MARGIN_DEG,
  };
  const snapshotDate = todayMinus(2);
  const trueColorUrl = staticSnapshotUrl("s2-true-color", bbox, snapshotDate);
  const swirUrl = staticSnapshotUrl("s2-swir", bbox, snapshotDate);
  // Bbox più ampio per SO2/aerosol: pixel S5P ~7x3.5km, un margine di 15-17km
  // come per l'ottico mostrerebbe solo 2-3 pixel — qui serve vedere il pennacchio
  // anche se si allontana dal cratere.
  const plumeBbox = {
    minLat: volcano.lat - SNAPSHOT_MARGIN_DEG * 4,
    maxLat: volcano.lat + SNAPSHOT_MARGIN_DEG * 4,
    minLng: volcano.lng - SNAPSHOT_MARGIN_DEG * 4,
    maxLng: volcano.lng + SNAPSHOT_MARGIN_DEG * 4,
  };
  const so2Url = staticSnapshotUrl("s5p-so2", plumeBbox, snapshotDate);
  const aerUrl = staticSnapshotUrl("s5p-aer-ai", plumeBbox, snapshotDate);

  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <div>
          <h2>{volcano.name}</h2>
          <p>
            {volcano.type} · {volcano.region}
          </p>
        </div>
        <button type="button" className="info-panel__close" onClick={onClose} aria-label="Chiudi dettaglio">
          ×
        </button>
      </div>

      {hasActivity && (
        <section className="info-panel__section info-panel__section--alert">
          <h3>🔴 {activityLabel(frp)}</h3>
          <p>
            Il satellite VIIRS (NASA FIRMS) ha rilevato una fonte di calore intenso su questo vulcano
            nelle ultime 24 ore (potenza radiativa {frp.toFixed(1)} MW) — può indicare colate laviche,
            un cratere attivo, o altra attività eruttiva in corso. Non è una conferma ufficiale: per lo
            stato reale consulta il bollettino INGV qui sotto.
          </p>
        </section>
      )}

      <EmsActivationNote lat={volcano.lat} lng={volcano.lng} categories={["volcan"]} />

      <section className="info-panel__section">
        <h3>Stato</h3>
        <p>{volcano.description}</p>
        <p>
          Per il bollettino aggiornato consulta{" "}
          <a href={volcano.ingvUrl} target="_blank" rel="noreferrer">
            l'Osservatorio INGV
          </a>
          .
        </p>
      </section>

      {volcano.name === "Etna" && (
        <section className="info-panel__section">
          <h3>Aeroporto di Catania e cenere vulcanica</h3>
          <p>
            L'aeroporto di Catania-Fontanarossa (a ~15km dal cratere) chiude spesso gli arrivi, a volte
            del tutto, quando l'attività eruttiva emette cenere sopra lo scalo  è successo più volte
            nel 2025 e nel 2026. Non ho trovato un'API pubblica per lo stato in tempo reale. Controlla lo stato attuale direttamente:
          </p>
          <p>
            <a href="https://www.aeroporto.catania.it/tracking-voli/arrivi" target="_blank" rel="noreferrer">
              Stato voli aeroporto Catania ↗
            </a>
            <br />
            <a href="https://www.ct.ingv.it/" target="_blank" rel="noreferrer">
              Bollettini INGV Osservatorio Etneo ↗
            </a>
            <br />
            <a href="https://atmosphere.copernicus.eu/eruptive-emissions" target="_blank" rel="noreferrer">
              Previsioni dispersione SO₂/cenere — CAMS (Copernicus) ↗
            </a>
          </p>
        </section>
      )}

      {(trueColorUrl || swirUrl) && (
        <section className="info-panel__section">
          <h3>Immagini satellitari recenti</h3>
          <div className="volcano-detail__snapshots">
            {trueColorUrl && (
              <figure>
                <img src={trueColorUrl} alt={`${volcano.name}, vero colore, immagine satellitare recente`} loading="lazy" />
                <figcaption>Vero colore</figcaption>
              </figure>
            )}
            {swirUrl && (
              <figure>
                <img src={swirUrl} alt={`${volcano.name}, falso colore SWIR, calore/colate laviche`} loading="lazy" />
                <figcaption>SWIR — calore/colate</figcaption>
              </figure>
            )}
          </div>
          <p>
            Composito cloud-free sugli ultimi 13 giorni (Sentinel-2, ~10m). Se il vulcano è stato
            nuvoloso in tutto questo periodo, l'immagine può risultare in gran parte bianca/coperta —
            limite reale dell'ottico, non un errore. Le stesse immagini, navigabili, sono nel layer
            satellitare del selettore mappa.
          </p>
        </section>
      )}

      {(so2Url || aerUrl) && (
        <section className="info-panel__section">
          <h3>Dove va il pennacchio — SO₂ e aerosol</h3>
          <div className="volcano-detail__snapshots">
            {so2Url && (
              <figure>
                <img src={so2Url} alt={`${volcano.name}, colonna totale di SO2, ultimo passaggio Sentinel-5P`} loading="lazy" />
                <figcaption>SO₂ (anidride solforosa)</figcaption>
              </figure>
            )}
            {aerUrl && (
              <figure>
                <img src={aerUrl} alt={`${volcano.name}, indice aerosol, ultimo passaggio Sentinel-5P`} loading="lazy" />
                <figcaption>Indice aerosol (cenere/fumo in quota)</figcaption>
              </figure>
            )}
          </div>
          <p>
            Sentinel-5P/TROPOMI, ultimo passaggio disponibile (non un composito multi-giorno: un
            pennacchio si sposta in ore). Pixel molto grosso (~7x3.5km) — indica "c'è un pennacchio
            da queste parti e va in questa direzione", non un confine preciso. Se non c'è attività
            eruttiva l'immagine può risultare vuota o piatta: è normale, non un errore. Per una
            previsione oraria di dove andrà nelle prossime ore, vedi il link CAMS qui sopra.
          </p>
        </section>
      )}

      <section className="info-panel__section">
        <h3>Webcam</h3>
        {webcamShots.length > 0 ? (
          <>
            <div className="volcano-detail__snapshots">
              {webcamShots.map((shot) => (
                <figure key={shot.code}>
                  <img src={shot.imageUrl} alt={`Webcam INGV ${shot.code}, ${volcano.name}`} loading="lazy" />
                  <figcaption>{shot.code}</figcaption>
                </figure>
              ))}
            </div>
            <p>
              Foto reali dalle telecamere INGV-OE, non uno stream — si aggiornano da sole ogni pochi
              minuti (il sito le ricarica ogni 5 minuti). Notte, nebbia o pioggia possono renderle
              scure o poco leggibili: limite reale della telecamera, non un errore.{" "}
              <a href={volcano.webcamUrl} target="_blank" rel="noreferrer">
                Pagina ufficiale INGV ↗
              </a>
            </p>
          </>
        ) : (
          <>
            <p>
              <a href={volcano.webcamUrl} target="_blank" rel="noreferrer">
                Video-sorveglianza INGV in tempo reale ↗
              </a>
            </p>
            <p>
              Per questo vulcano non ho trovato una galleria di immagini incorporabile (verificato,
              non solo non cercato) — il link apre la pagina ufficiale in una nuova scheda.
            </p>
          </>
        )}
      </section>

      <section className="info-panel__section">
        <h3>Sismicità recente (~30km)</h3>
        {loading && <p>Caricamento eventi INGV…</p>}
        {error && <p>Dati sismici non disponibili al momento.</p>}
        {!loading && !error && events.length === 0 && (
          <p>Nessun evento con magnitudo ≥ 0.5 registrato di recente in quest'area.</p>
        )}
        {events.length > 0 && (
          <ul className="info-panel__sources">
            {events.map((e, i) => (
              <li key={i}>
                <strong>M{e.magnitude.toFixed(1)}</strong> · {formatTime(e.time)} · profondità {e.depthKm.toFixed(1)}km
                <br />
                {e.place}
              </li>
            ))}
          </ul>
        )}
        <p>
          <em>Fonte: INGV, servizio FDSN Event (CC BY 4.0)</em>
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Come il satellite vede il calore</h3>
        <p>
          Le bande infrarosse a onda corta di Sentinel-2 rilevano l'energia termica emessa da lava e
          superfici molto calde, anche di notte. Attiva il layer "Calore/colate laviche — SWIR" dal
          selettore mappa: le aree attive appaiono nettamente più chiare del terreno circostante.
        </p>
      </section>
    </div>
  );
}
