import type { WaterBody } from "../../data/water-bodies";
import "../Info/InfoPanel.css";

interface WaterBodyDetailProps {
  waterBody: WaterBody;
  onClose: () => void;
}

export default function WaterBodyDetail({ waterBody, onClose }: WaterBodyDetailProps) {
  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <div>
          <h2>{waterBody.name}</h2>
          <p>
            {waterBody.type === "lago" ? "Lago" : "Fiume"} · {waterBody.region}
          </p>
        </div>
        <button type="button" className="info-panel__close" onClick={onClose} aria-label="Chiudi dettaglio">
          ×
        </button>
      </div>

      <section className="info-panel__section">
        <h3>Cosa sta succedendo</h3>
        <p>{waterBody.description}</p>
        <p>
          <em>Fonte: {waterBody.source}</em>
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Come il satellite vede l'acqua</h3>
        <p>
          Il satellite Sentinel-2 misura quanta luce riflette il terreno in diverse lunghezze d'onda.
          L'acqua assorbe la luce infrarossa quasi tutta, la vegetazione la riflette molto: confrontando
          le due bande (indice NDWI) si distingue con precisione dove c'è acqua superficiale e dove no,
          anche quando l'occhio umano vedrebbe solo fango o terreno umido. Attiva il layer "Presenza
          d'acqua — NDWI" dal selettore mappa per vederlo sulla città o zona che ti interessa.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Fonti</h3>
        <p>
          Dati forniti da: Copernicus Sentinel Hub (ESA/UE), ARPA regionali, ISPRA. Le stime di livello
          e portata citate sopra sono ordini di grandezza da bollettini pubblici, non misurazioni in
          tempo reale di questo sito.
        </p>
      </section>
    </div>
  );
}
