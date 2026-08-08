import type { WildfireHotspot } from "../../hooks/useWildfireHotspots";
import FireSafetyInfo from "./FireSafetyInfo";
import "../Info/InfoPanel.css";

interface HotspotDetailProps {
  hotspot: WildfireHotspot;
  onClose: () => void;
}

const CONFIDENCE_LABEL: Record<string, string> = { l: "bassa", n: "nominale", h: "alta" };

export default function HotspotDetail({ hotspot, onClose }: HotspotDetailProps) {
  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <div>
          <h2>Focolaio rilevato</h2>
          <p>
            {hotspot.acqDate} · {hotspot.acqTime.padStart(4, "0").replace(/(\d{2})(\d{2})/, "$1:$2")} UTC
          </p>
        </div>
        <button type="button" className="info-panel__close" onClick={onClose} aria-label="Chiudi dettaglio">
          ×
        </button>
      </div>

      <section className="info-panel__section">
        <h3>Cos'è questo puntino</h3>
        <p>
          Rilevato dal satellite VIIRS (NASA FIRMS) nelle ultime 24 ore — confidenza{" "}
          {CONFIDENCE_LABEL[hotspot.confidence] ?? hotspot.confidence}, potenza radiativa (FRP){" "}
          {hotspot.frp} MW. Non è una conferma ufficiale di incendio: il satellite rileva qualsiasi
          fonte di calore intenso (anche torce industriali o altiforni), è un indicatore di attività
          recente.
        </p>
      </section>

      <FireSafetyInfo />
    </div>
  );
}
