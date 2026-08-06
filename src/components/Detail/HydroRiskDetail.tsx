import type { HydroRiskCase } from "../../data/hydro-risk";
import "../Info/InfoPanel.css";

interface HydroRiskDetailProps {
  item: HydroRiskCase;
  onClose: () => void;
}

export default function HydroRiskDetail({ item, onClose }: HydroRiskDetailProps) {
  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <div>
          <h2>{item.name}</h2>
          <p>{item.region}</p>
        </div>
        <button type="button" className="info-panel__close" onClick={onClose} aria-label="Chiudi dettaglio">
          ×
        </button>
      </div>

      <section className="info-panel__section">
        <h3>Cosa è successo</h3>
        <p>{item.description}</p>
        <p>
          <em>Fonte: {item.source}</em>
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Perché gli alberi contano</h3>
        <p>
          Le radici e la lettiera del sottobosco funzionano come una spugna: assorbono acqua e rallentano
          il flusso verso valle. Le chiome funzionano come un muro: intercettano parte della pioggia
          prima che tocchi terra. Suolo nudo — dopo un incendio, un'annata di siccità estrema o
          semplicemente abbandono agricolo — perde entrambi gli effetti: la pioggia che cade scorre quasi
          tutta in superficie invece di essere assorbita.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Il dato</h3>
        <p>
          Il 94% dei comuni italiani ricade, almeno in parte, in aree a rischio idrogeologico secondo
          ISPRA. Non è una previsione: è la classificazione attuale del territorio.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Il trend, non la previsione</h3>
        <p>
          Qui non si dice dove cadrà la prossima frana. Si mostra che gli eventi alluvionali registrati
          sono più frequenti e più intensi rispetto al passato, specialmente dove la vegetazione è stata
          persa di recente per incendio o desertificazione.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Fonti</h3>
        <p>
          Dati forniti da: ISPRA (rischio idrogeologico, Inventario dei Fenomeni Franosi IFFI), Copernicus
          EMS (Emergency Management Service). Stime a scala di bacino/regione, non misurazioni puntuali in
          tempo reale.
        </p>
      </section>
    </div>
  );
}
