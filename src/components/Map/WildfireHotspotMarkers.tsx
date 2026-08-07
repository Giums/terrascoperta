import DotMarker from "./DotMarker";
import type { WildfireHotspot } from "../../hooks/useWildfireHotspots";

interface WildfireHotspotMarkersProps {
  hotspots: WildfireHotspot[];
}

const CONFIDENCE_LABEL: Record<string, string> = { l: "bassa", n: "nominale", h: "alta" };

export default function WildfireHotspotMarkers({ hotspots }: WildfireHotspotMarkersProps) {
  return (
    <>
      {hotspots.map((h, i) => (
        <DotMarker
          key={`${h.lat}-${h.lon}-${h.acqDate}-${h.acqTime}-${i}`}
          lat={h.lat}
          lng={h.lon}
          size={10}
          color="#f59e0b"
          fillOpacity={0.7}
          tooltip={
            <>
              <strong>Focolaio rilevato</strong>
              <br />
              {h.acqDate} · {h.acqTime.padStart(4, "0").replace(/(\d{2})(\d{2})/, "$1:$2")} UTC
              <br />
              Confidenza: {CONFIDENCE_LABEL[h.confidence] ?? h.confidence} · FRP {h.frp} MW
            </>
          }
        />
      ))}
    </>
  );
}
