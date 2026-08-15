import DotMarker from "./DotMarker";
import type { WildfireHotspot } from "../../hooks/useWildfireHotspots";

interface VolcanoThermalPathMarkersProps {
  hotspots: WildfireHotspot[];
}

function lerpColor(from: [number, number, number], to: [number, number, number], t: number): string {
  const [r, g, b] = from.map((c, i) => Math.round(c + (to[i] - c) * t));
  return `rgb(${r},${g},${b})`;
}

// Giallo pallido (segnale più vecchio) → rosso acceso (più recente), stesso
// concetto cromatico delle mappe di avanzamento lava fatte a mano.
const OLD: [number, number, number] = [253, 230, 138]; // amber-200
const NEW: [number, number, number] = [220, 38, 38]; // red-600

/**
 * Punti caldi VIIRS (NASA FIRMS) degli ultimi giorni intorno a un vulcano,
 * colorati dal più vecchio al più recente — un percorso approssimato della
 * colata, ricostruito da dati satellitari reali (375m di risoluzione), non
 * un fronte lava tracciato a mano su immagini Sentinel-2.
 */
export default function VolcanoThermalPathMarkers({ hotspots }: VolcanoThermalPathMarkersProps) {
  const dates = Array.from(new Set(hotspots.map((h) => h.acqDate))).sort();

  return (
    <>
      {hotspots.map((h, i) => {
        const dateIndex = dates.indexOf(h.acqDate);
        const t = dates.length > 1 ? dateIndex / (dates.length - 1) : 1;
        return (
          <DotMarker
            key={`${h.lat}-${h.lon}-${h.acqDate}-${h.acqTime}-${i}`}
            lat={h.lat}
            lng={h.lon}
            size={8}
            color={lerpColor(OLD, NEW, t)}
            fillOpacity={0.8}
            tooltip={
              <>
                <strong>Segnale termico</strong>
                <br />
                {h.acqDate} · {h.acqTime.padStart(4, "0").replace(/(\d{2})(\d{2})/, "$1:$2")} UTC
                <br />
                FRP {h.frp} MW
              </>
            }
          />
        );
      })}
    </>
  );
}
