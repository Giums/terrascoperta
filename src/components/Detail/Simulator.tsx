import { useState } from "react";
import { simulateMitigation } from "../../utils/simulator";

interface SimulatorProps {
  uhi: number;
  onChange: (green: number, albedo: number, reduction: number) => void;
}

export default function Simulator({ uhi, onChange }: SimulatorProps) {
  const [green, setGreen] = useState(10);
  const [albedo, setAlbedo] = useState(10);

  const reduction = simulateMitigation(uhi, green, albedo);
  const projected = Math.max(uhi - reduction, uhi * 0.05);

  function handleGreen(value: number) {
    setGreen(value);
    onChange(value, albedo, simulateMitigation(uhi, value, albedo));
  }

  function handleAlbedo(value: number) {
    setAlbedo(value);
    onChange(green, value, simulateMitigation(uhi, green, value));
  }

  return (
    <div className="simulator">
      <div className="simulator__field">
        <label htmlFor="green-slider">
          Aumento copertura verde: <strong>+{green}%</strong>
        </label>
        <input
          id="green-slider"
          type="range"
          min={0}
          max={40}
          step={5}
          value={green}
          onChange={(e) => handleGreen(Number(e.target.value))}
        />
      </div>
      <div className="simulator__field">
        <label htmlFor="albedo-slider">
          Superfici ad alto albedo: <strong>+{albedo}%</strong>
        </label>
        <input
          id="albedo-slider"
          type="range"
          min={0}
          max={50}
          step={5}
          value={albedo}
          onChange={(e) => handleAlbedo(Number(e.target.value))}
        />
      </div>
      <div className="simulator__result">
        <div>
          <span className="simulator__label">UHI attuale (stima)</span>
          <span className="simulator__value">+{uhi.toFixed(1)}°C</span>
        </div>
        <div className="simulator__arrow">→</div>
        <div>
          <span className="simulator__label">UHI stimata con intervento</span>
          <span className="simulator__value simulator__value--good">+{projected.toFixed(1)}°C</span>
        </div>
      </div>
      <p className="simulator__note">
        Riduzione stimata: −{reduction.toFixed(1)}°C. Modello basato su Bowler et al. 2010
        (verde) e Akbari et al. 2001 (albedo) — non una previsione per la città specifica.
      </p>
    </div>
  );
}
