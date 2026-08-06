import type { FireEvent } from "../../data/fires";
import "../Info/InfoPanel.css";

interface FireDetailProps {
  fire: FireEvent;
  onClose: () => void;
}

export default function FireDetail({ fire, onClose }: FireDetailProps) {
  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <div>
          <h2>{fire.name}</h2>
          <p>
            {fire.region} · {fire.year}
          </p>
        </div>
        <button type="button" className="info-panel__close" onClick={onClose} aria-label="Chiudi dettaglio">
          ×
        </button>
      </div>

      <section className="info-panel__section">
        <h3>Cosa è successo</h3>
        <p>{fire.description}</p>
        <p>
          <em>Fonte: {fire.source}</em>
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Come il satellite vede la cicatrice</h3>
        <p>
          Il suolo bruciato riflette la luce in modo molto diverso dalla vegetazione sana: assorbe di
          più nell'infrarosso a onda corta e riflette meno nel vicino infrarosso. L'indice NBR
          (Normalized Burn Ratio) sfrutta questa differenza per mostrare con precisione l'area
          realmente danneggiata, anche mesi dopo l'incendio quando a occhio il nero della cenere è già
          sparito. Attiva il layer "Cicatrici da incendio — NBR" dal selettore mappa.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Il trend, non la previsione</h3>
        <p>
          Qui non si prevede dove brucerà: si mostra dove ha già bruciato, e sempre più spesso. I dati
          storici EFFIS mostrano un aumento delle aree bruciate in Italia nelle estati più calde e
          secche, con stagione degli incendi che si allunga sia in primavera che in autunno.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Fonti</h3>
        <p>
          Dati forniti da: Copernicus Sentinel Hub (ESA/UE), EFFIS (European Forest Fire Information
          System), ISPRA. Le stime citate sopra sono ordini di grandezza da fonti pubbliche, non
          calcoli in tempo reale di questo sito.
        </p>
      </section>
    </div>
  );
}
