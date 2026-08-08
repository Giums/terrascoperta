import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-map-gl/maplibre";
import type { CanadairPosition } from "../../hooks/useCanadairPositions";
import { useCanadairTrack } from "../../hooks/useCanadairTrack";

interface CanadairMarkersProps {
  aircraft: CanadairPosition[];
}

// Sopra/sotto questa soglia (m/s) consideriamo l'aereo in quota costante — il
// vertical_rate di OpenSky oscilla leggermente anche in crociera livellata.
const LEVEL_THRESHOLD_MS = 0.5;

function verticalRateLabel(rate: number | null): string {
  if (rate == null) return "";
  if (rate > LEVEL_THRESHOLD_MS) return "in salita";
  if (rate < -LEVEL_THRESHOLD_MS) return "in discesa";
  return "quota costante";
}

const TYPE_ICON: Record<CanadairPosition["type"], string> = {
  canadair: "✈️",
  elicottero: "🚁",
};

const TYPE_LABEL: Record<CanadairPosition["type"], string> = {
  canadair: "Canadair CL-415",
  elicottero: "Erickson S-64F Skycrane",
};

interface SingleAircraftProps {
  a: CanadairPosition;
  selected: boolean;
  onToggleSelect: () => void;
}

function SingleAircraft({ a, selected, onToggleSelect }: SingleAircraftProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <Marker longitude={a.lon} latitude={a.lat} onClick={onToggleSelect}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ padding: 8, cursor: "pointer" }}
        >
          <div
            style={{
              fontSize: selected ? 26 : 20,
              lineHeight: 1,
              transform: `rotate(${(a.heading ?? 0) - 45}deg)`,
              filter: selected
                ? "drop-shadow(0 0 5px #38bdf8) drop-shadow(0 0 3px rgba(0,0,0,0.7))"
                : "drop-shadow(0 0 3px rgba(0,0,0,0.7))",
            }}
          >
            {TYPE_ICON[a.type]}
          </div>
        </div>
      </Marker>
      {hovered && (
        <Popup longitude={a.lon} latitude={a.lat} closeButton={false} closeOnClick={false} anchor="bottom" offset={16}>
          <strong>{a.registration}</strong> · {TYPE_LABEL[a.type]}
          <br />
          {a.altitude != null ? `${Math.round(a.altitude)}m` : "—"} ·{" "}
          {a.velocity != null ? `${Math.round(a.velocity * 3.6)}km/h` : "—"}
          {a.verticalRate != null && ` · ${verticalRateLabel(a.verticalRate)}`}
          <br />
          <em>{selected ? "Clicca di nuovo per nascondere la traccia" : "Clicca per vedere la traccia di volo"}</em>
        </Popup>
      )}
    </>
  );
}

/** Solo i velivoli in volo — a terra (in base) non c'è nulla da mostrare sulla mappa. */
export default function CanadairMarkers({ aircraft }: CanadairMarkersProps) {
  const [selectedIcao24, setSelectedIcao24] = useState<string | null>(null);
  const { path } = useCanadairTrack(selectedIcao24);
  const { current: map } = useMap();

  // Il percorso di un intervento è spesso solo qualche km: alla vista di
  // default (tutta Italia) sarebbe invisibile.
  useEffect(() => {
    if (!map || path.length < 2) return;
    const lngs = path.map((p) => p.lng);
    const lats = path.map((p) => p.lat);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 80, maxZoom: 10, duration: 800 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selectedIcao24, path.length]);

  return (
    <>
      {aircraft
        .filter((a) => !a.onGround)
        .map((a) => (
          <SingleAircraft
            key={a.icao24}
            a={a}
            selected={a.icao24 === selectedIcao24}
            onToggleSelect={() => setSelectedIcao24((cur) => (cur === a.icao24 ? null : a.icao24))}
          />
        ))}
      {/* Traccia come tanti puntini DOM (stesso meccanismo dei marker aereo,
          affidabile) invece di un Source/Layer GL — quello non si è mai visto
          in tre browser diversi nonostante dati e codice corretti, causa non
          diagnosticabile senza accesso diretto al browser. Tutti i punti
          reali (non campionati) per non lasciare buchi sulle virate strette. */}
      {path.map((p, i) => (
        <Marker key={`${selectedIcao24}-${i}`} longitude={p.lng} latitude={p.lat}>
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#facc15",
              border: "2px solid #0a0e14",
              boxShadow: "0 0 4px 1px rgba(250, 204, 21, 0.8)",
            }}
          />
        </Marker>
      ))}
    </>
  );
}
