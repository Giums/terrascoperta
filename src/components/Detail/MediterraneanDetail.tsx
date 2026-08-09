import type { MediterraneanZone } from "../../data/mediterranean-zones";
import { useMarineConditions } from "../../hooks/useMarineConditions";
import "../Info/InfoPanel.css";

interface MediterraneanDetailProps {
  zone: MediterraneanZone;
  onClose: () => void;
}

export default function MediterraneanDetail({ zone, onClose }: MediterraneanDetailProps) {
  const { temperature, seaLevel, loading } = useMarineConditions(zone.lat, zone.lng);

  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <div>
          <h2>{zone.name}</h2>
          <p>{zone.country}</p>
        </div>
        <button type="button" className="info-panel__close" onClick={onClose} aria-label="Chiudi dettaglio">
          ×
        </button>
      </div>

      <section className="info-panel__section">
        <h3>Condizioni attuali</h3>
        {loading ? (
          <p>Caricamento…</p>
        ) : (
          <p>
            <strong>{temperature != null ? `${temperature.toFixed(1)}°C` : "Dato non disponibile"}</strong>{" "}
            temperatura superficie mare
            {seaLevel != null && (
              <>
                {" · "}
                <strong>{seaLevel.toFixed(2)}m</strong> livello del mare
              </>
            )}
          </p>
        )}
        <p>
          <em>
            Open-Meteo Marine — modello oceanografico che assimila osservazioni reali, non una lettura
            diretta da boa. Il livello è riferito al livello medio del mare globale, utile per confrontare
            punti diversi tra loro, non come quota su uno zero locale/portuale.
          </em>
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Cosa succede alla fauna marina qui</h3>
        <p>{zone.fauna}</p>
        <p>
          <em>
            Fonte:{" "}
            <a href={zone.sourceUrl} target="_blank" rel="noreferrer">
              {zone.source}
            </a>
            . Narrazione su un fenomeno reale e documentato, non un dato calcolato in tempo reale da
            questo sito.
          </em>
        </p>
      </section>
    </div>
  );
}
