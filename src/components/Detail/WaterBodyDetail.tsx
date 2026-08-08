import type { WaterBody } from "../../data/water-bodies";
import { useWaterLevel } from "../../hooks/useWaterLevel";
import TrendSparkline from "../Map/TrendSparkline";
import "../Info/InfoPanel.css";

interface WaterBodyDetailProps {
  waterBody: WaterBody;
  onClose: () => void;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WaterBodyDetail({ waterBody, onClose }: WaterBodyDetailProps) {
  const level = useWaterLevel(waterBody.sensorId ?? null);

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

      {waterBody.sensorId && (
        <section className="info-panel__section">
          <h3>Livello idrometrico in tempo reale</h3>
          {level.loading ? (
            <p>Caricamento…</p>
          ) : level.current ? (
            <>
              <p>
                <strong>{level.current.value} cm</strong> allo zero idrometrico della stazione —
                stazione {waterBody.sensorLabel}, aggiornato alle {formatTimestamp(level.current.timestamp)}.
              </p>
              {level.series.length > 1 && (
                <TrendSparkline
                  data={level.series.map((d, i) => ({ x: i, y: d.avgLevel }))}
                  highlightX={level.series.length - 1}
                  ariaLabel={`Andamento del livello idrometrico dal ${level.series[0].day} a oggi`}
                />
              )}
              <p>
                <em>
                  Rete sensori ARPA Lombardia rinumerata a inizio 2026: storico disponibile solo dal{" "}
                  {level.series[0]?.day.slice(0, 10)}, non un trend pluriennale.
                </em>
              </p>
            </>
          ) : (
            <p>Dato non disponibile al momento.</p>
          )}
        </section>
      )}

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
