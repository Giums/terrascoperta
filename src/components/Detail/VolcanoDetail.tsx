import type { Volcano } from "../../data/volcanoes";
import { useSeismicity } from "../../hooks/useSeismicity";
import "../Info/InfoPanel.css";

interface VolcanoDetailProps {
  volcano: Volcano;
  onClose: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("it-IT");
}

export default function VolcanoDetail({ volcano, onClose }: VolcanoDetailProps) {
  const { events, loading, error } = useSeismicity(volcano.lat, volcano.lng);

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

      <section className="info-panel__section">
        <h3>Webcam live</h3>
        <p>
          <a href={volcano.webcamUrl} target="_blank" rel="noreferrer">
            Video-sorveglianza INGV in tempo reale ↗
          </a>
        </p>
        <p>
          Le webcam ufficiali INGV caricano lo stream tramite script proprio, non un feed
          incorporabile: il link apre la pagina originale in una nuova scheda.
        </p>
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
