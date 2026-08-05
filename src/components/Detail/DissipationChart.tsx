import { dissipationCurve } from "../../utils/dissipation-model";

interface DissipationChartProps {
  green: number;
  albedo: number;
}

const WIDTH = 340;
const HEIGHT = 160;
const PAD_LEFT = 28;
const PAD_BOTTOM = 20;
const PAD_TOP = 10;
const CHART_W = WIDTH - PAD_LEFT - 8;
const CHART_H = HEIGHT - PAD_TOP - PAD_BOTTOM;
const T_MIN = 10;
const T_MAX = 85;

function x(hour: number): number {
  return PAD_LEFT + (hour / 24) * CHART_W;
}

function y(temp: number): number {
  const t = (temp - T_MIN) / (T_MAX - T_MIN);
  return PAD_TOP + (1 - t) * CHART_H;
}

function toPath(points: { hour: number; value: number }[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.hour).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
}

export default function DissipationChart({ green, albedo }: DissipationChartProps) {
  const points = dissipationCurve(green, albedo);
  const baselinePath = toPath(points.map((p) => ({ hour: p.hour, value: p.baseline })));
  const mitigatedPath = toPath(points.map((p) => ({ hour: p.hour, value: p.mitigated })));
  const hourTicks = [0, 6, 12, 18, 24];
  const tempTicks = [20, 40, 60, 80];

  return (
    <div className="dissipation-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Temperatura di superficie nell'arco della giornata, con e senza interventi">
        {tempTicks.map((t) => (
          <g key={t}>
            <line x1={PAD_LEFT} x2={WIDTH - 8} y1={y(t)} y2={y(t)} className="dissipation-chart__grid" />
            <text x={PAD_LEFT - 6} y={y(t) + 3} className="dissipation-chart__tick" textAnchor="end">
              {t}°
            </text>
          </g>
        ))}
        {hourTicks.map((h) => (
          <text key={h} x={x(h)} y={HEIGHT - 4} className="dissipation-chart__tick" textAnchor="middle">
            {String(h).padStart(2, "0")}
          </text>
        ))}
        <path d={baselinePath} className="dissipation-chart__line dissipation-chart__line--baseline" />
        <path d={mitigatedPath} className="dissipation-chart__line dissipation-chart__line--mitigated" />
      </svg>
      <div className="dissipation-chart__legend">
        <span className="dissipation-chart__legend-item">
          <span className="dissipation-chart__swatch dissipation-chart__swatch--baseline" /> Senza interventi (tetto scuro)
        </span>
        <span className="dissipation-chart__legend-item">
          <span className="dissipation-chart__swatch dissipation-chart__swatch--mitigated" /> Con gli interventi scelti sopra
        </span>
      </div>
      <p className="simulator__note">
        Temperatura di <em>superficie</em> di un tetto nell'arco delle 24 ore — non la temperatura
        dell'aria. Curva illustrativa basata sui valori tipici di albedo (Santamouris 2014, Akbari
        et al. 2001), non una simulazione fisica del tuo edificio specifico. Nota come il tetto
        scuro resti caldo per ore dopo il tramonto (linea arancione): è il calore che rilascia in
        strada tutta la notte.
      </p>
    </div>
  );
}
