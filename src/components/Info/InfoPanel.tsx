import UHIExplainer from "./UHIExplainer";
import AlbedoExplainer from "./AlbedoExplainer";
import "./InfoPanel.css";

interface InfoPanelProps {
  onClose: () => void;
}

const LEGEND = [
  { color: "#4ade80", label: "< 1.5 °C" },
  { color: "#facc15", label: "1.5–2.5 °C" },
  { color: "#fb923c", label: "2.5–3.5 °C" },
  { color: "#f87171", label: "3.5–4.5 °C" },
  { color: "#b91c1c", label: "> 4.5 °C" },
];

export default function InfoPanel({ onClose }: InfoPanelProps) {
  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <h2>Isole di calore urbane in Italia</h2>
        <button type="button" className="info-panel__close" onClick={onClose} aria-label="Chiudi pannello informativo">
          ×
        </button>
      </div>

      <section className="info-panel__section">
        <h3>Legenda — intensità UHI stimata</h3>
        <ul className="info-panel__legend">
          {LEGEND.map((item) => (
            <li key={item.label}>
              <span className="info-panel__swatch" style={{ background: item.color }} />
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="info-panel__section">
        <UHIExplainer />
      </section>

      <section className="info-panel__section">
        <AlbedoExplainer />
      </section>

      <section className="info-panel__section">
        <h3>Note metodologiche</h3>
        <p>
          I valori di UHI mostrati sulla mappa sono <strong>stime modellistiche</strong>, non
          misurazioni dirette, calcolate da popolazione, latitudine, prossimità alla costa e
          posizione in Pianura Padana. I layer satellitari (Copernicus Sentinel Hub) mostrano la
          temperatura di superficie reale, con ~2 giorni di latenza. Costi e risparmi sono ordini
          di grandezza a scala urbana, non preventivi.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Fonti scientifiche</h3>
        <ul className="info-panel__sources">
          <li>Oke, T.R. (1982). "The energetic basis of the urban heat island." <em>QJRMS</em>, 108(455), 1-24.</li>
          <li>Bowler, D.E. et al. (2010). "Urban greening to cool towns and cities." <em>Landscape and Urban Planning</em>, 97(3), 147-155.</li>
          <li>Akbari, H. et al. (2001). "Cool surfaces and shade trees to reduce energy use." <em>Solar Energy</em>, 70(3), 295-310.</li>
          <li>Stewart, I.D. & Oke, T.R. (2012). "Local Climate Zones for Urban Temperature Studies." <em>BAMS</em>, 93(12), 1879-1900.</li>
          <li>Santamouris, M. (2014). "Cooling the cities." <em>Solar Energy</em>, 103, 682-703.</li>
        </ul>
      </section>
    </div>
  );
}
