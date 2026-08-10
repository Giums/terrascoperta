import { useHydrogeologicalRisk } from "../../hooks/useHydrogeologicalRisk";

interface HydrogeologicalRiskProps {
  lat: number;
  lng: number;
}

const LANDSLIDE_LABELS: Record<number, string> = {
  1: "P1 – moderata",
  2: "P2 – media",
  3: "P3 – elevata",
  4: "P4 – molto elevata",
};

const FLOOD_LABELS: Record<number, string> = {
  1: "P1 – bassa",
  2: "P2 – media",
  3: "P3 – elevata",
};

/**
 * Rischio storico/strutturale (Piano di Assetto Idrogeologico), non un
 * evento in corso — complementare ad AddressAlerts, che copre solo eventi
 * live. Stesso taglio "fotografia al click" delle altre sezioni indirizzo.
 */
export default function HydrogeologicalRisk({ lat, lng }: HydrogeologicalRiskProps) {
  const { landslideLevel, floodLevel, loading, error } = useHydrogeologicalRisk(lat, lng);

  if (loading) return <p className="weather-live__status">Controllo pericolosità idrogeologica…</p>;
  if (error) return <p className="weather-live__status">Dati PAI non disponibili al momento.</p>;

  const hasRisk = landslideLevel != null || floodLevel != null;

  return (
    <section className={`city-detail__section${hasRisk ? " city-detail__urgency" : ""}`}>
      <h3>Rischio idrogeologico qui</h3>
      {!hasRisk ? (
        <p>
          Nessuna area a pericolosità da frana o alluvione mappata dal Piano di Assetto Idrogeologico su
          questo punto.
        </p>
      ) : (
        <>
          {landslideLevel != null && (
            <p>
              ⛰️ Area a pericolosità da <strong>frana {LANDSLIDE_LABELS[landslideLevel]}</strong>{" "}
              (classificazione IFFI/PAI).
            </p>
          )}
          {floodLevel != null && (
            <p>
              🌊 Area a pericolosità <strong>idraulica {FLOOD_LABELS[floodLevel]}</strong> (Piano di Assetto
              Idrogeologico).
            </p>
          )}
        </>
      )}
      <p className="weather-live__source">
        Fonte:{" "}
        <a href="https://idrogeo.isprambiente.it" target="_blank" rel="noreferrer">
          ISPRA – Piattaforma IdroGEO
        </a>
        , mosaico nazionale PAI. Non sostituisce una verifica tecnica: i confini delle zone sono
        approssimati, verifica sempre col tuo Comune o con l'Autorità di Bacino prima di decisioni
        importanti.
      </p>
    </section>
  );
}
