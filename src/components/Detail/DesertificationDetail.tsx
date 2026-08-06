import type { DesertificationZone } from "../../data/desertification-zones";
import "../Info/InfoPanel.css";

interface DesertificationDetailProps {
  zone: DesertificationZone;
  onClose: () => void;
}

export default function DesertificationDetail({ zone, onClose }: DesertificationDetailProps) {
  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <div>
          <h2>{zone.name}</h2>
          <p>{zone.region}</p>
        </div>
        <button type="button" className="info-panel__close" onClick={onClose} aria-label="Chiudi dettaglio">
          ×
        </button>
      </div>

      <section className="info-panel__section">
        <h3>Cosa sta succedendo</h3>
        <p>{zone.description}</p>
        <p>
          <em>Fonte: {zone.source}</em>
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Come il satellite misura la salute della vegetazione</h3>
        <p>
          Le piante sane riflettono molta luce infrarossa vicina e assorbono la luce rossa per la
          fotosintesi. L'indice NDVI confronta le due bande: valori alti indicano vegetazione rigogliosa,
          valori bassi terreno stressato o nudo. Attiva il layer "Vegetazione — NDVI" dal selettore mappa
          e confronta questa zona con una zona verde: la differenza si vede subito.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Non è teoria</h3>
        <p>
          Circa il 21% del territorio italiano è già classificato da ISPRA a rischio desertificazione.
          Non è una proiezione futura: è la sovrapposizione tra la classificazione di rischio e ciò che
          l'NDVI misura oggi su queste aree, anno dopo anno.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Il circolo vizioso</h3>
        <p>
          Meno vegetazione significa più calore locale (isola di calore), meno acqua trattenuta nel
          suolo, più rischio di incendio nella vegetazione residua secca — e dopo l'incendio, ancora
          meno vegetazione. Ogni modulo di questo sito guarda un pezzo dello stesso circolo.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Fonti</h3>
        <p>
          Dati forniti da: Copernicus Sentinel Hub (ESA/UE), ISPRA (Carta della sensibilità alla
          desertificazione). Stime a scala regionale, non misurazioni puntuali in tempo reale.
        </p>
      </section>
    </div>
  );
}
