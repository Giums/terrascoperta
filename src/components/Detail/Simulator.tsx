import { useState } from "react";
import { simulateMitigation } from "../../utils/simulator";
import { peakSurfaceTemps } from "../../utils/dissipation-model";

interface SimulatorProps {
  uhi: number;
  onChange: (green: number, albedo: number, reduction: number) => void;
}

export default function Simulator({ uhi, onChange }: SimulatorProps) {
  const [green, setGreen] = useState(10);
  const [albedo, setAlbedo] = useState(10);

  const reduction = simulateMitigation(uhi, green, albedo);
  const projected = Math.max(uhi - reduction, uhi * 0.05);
  const surface = peakSurfaceTemps(green, albedo);

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
        (verde) e Akbari et al. 2001 (albedo) — non una previsione per la città specifica. Il
        segnale è piccolo perché è la temperatura media dell'aria su tutta la città: non è
        l'effetto che senti tu, è quello che sente il termometro dell'aeroporto.
      </p>
      <div className="simulator__gratification">
        <p className="simulator__gratification-label">Quello che senti davvero, sul tuo tetto:</p>
        <div className="simulator__result">
          <div>
            <span className="simulator__label">Tetto scuro, ore 14</span>
            <span className="simulator__value simulator__value--hot">{surface.baseline.toFixed(0)}°C</span>
          </div>
          <div className="simulator__arrow">→</div>
          <div>
            <span className="simulator__label">Con questi interventi</span>
            <span className="simulator__value simulator__value--good">{surface.mitigated.toFixed(0)}°C</span>
          </div>
        </div>
        <p className="simulator__note">
          Un tetto/terrazzo scuro d'estate scotta letteralmente al tatto — questo è il calore che
          entra in casa tua e che il condizionatore deve combattere. Vernice bianca o verde lo
          abbattono di decine di gradi, da subito, sul tuo edificio.
        </p>
      </div>
    </div>
  );
}
