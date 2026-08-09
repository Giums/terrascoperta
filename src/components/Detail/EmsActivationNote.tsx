import { useEmsActivations, nearestActivation } from "../../hooks/useEmsActivations";

interface EmsActivationNoteProps {
  lat: number;
  lng: number;
  /** Slug categoria EMS accettati per questo modulo (es. ["fire"], ["flood", "mass"]). */
  categories: string[];
  /** Raggio di ricerca in km — un'attivazione EMS copre un'area, non un punto. */
  maxKm?: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("it-IT");
}

/**
 * Copernicus EMS Rapid Mapping si attiva solo per emergenze dichiarate — non
 * un layer sempre presente. Mostra qualcosa solo se c'è davvero un'attivazione
 * aperta vicina, altrimenti non renderizza nulla (niente sezione vuota).
 */
export default function EmsActivationNote({ lat, lng, categories, maxKm = 150 }: EmsActivationNoteProps) {
  const { activations } = useEmsActivations();
  const nearby = nearestActivation(activations, lat, lng, maxKm, categories);

  if (!nearby) return null;

  return (
    <section className="info-panel__section info-panel__section--alert">
      <h3>🛰️ Attivazione Copernicus EMS in corso qui vicino</h3>
      <p>
        <strong>{nearby.name}</strong> ({nearby.code}) — {nearby.category}, dal {formatDate(nearby.activationTime)}.
        Mappatura satellitare rapida attivata dalla Commissione Europea per questa emergenza.
      </p>
      <p>
        <a href={`https://mapping.emergency.copernicus.eu/activations/${nearby.code}/`} target="_blank" rel="noreferrer">
          Mappe e prodotti ufficiali ↗
        </a>
      </p>
    </section>
  );
}
