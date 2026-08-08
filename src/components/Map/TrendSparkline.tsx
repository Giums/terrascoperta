import "./TrendSparkline.css";

export interface TrendPoint {
  x: number;
  y: number | null;
}

interface TrendSparklineProps {
  data: TrendPoint[];
  highlightX?: number;
  ariaLabel: string;
}

const WIDTH = 200;
const HEIGHT = 44;
const PAD = 5;

export default function TrendSparkline({ data, highlightX, ariaLabel }: TrendSparklineProps) {
  const valid = data.filter((d): d is { x: number; y: number } => d.y != null);
  if (valid.length < 2) return null;

  const minX = data[0].x;
  const maxX = data[data.length - 1].x;
  const minY = Math.min(...valid.map((d) => d.y));
  const maxY = Math.max(...valid.map((d) => d.y));
  const range = maxY - minY || 1;

  function px(xVal: number): number {
    return PAD + ((xVal - minX) / (maxX - minX || 1)) * (WIDTH - PAD * 2);
  }
  function py(yVal: number): number {
    return HEIGHT - PAD - ((yVal - minY) / range) * (HEIGHT - PAD * 2);
  }

  const path = valid.map((d, i) => `${i === 0 ? "M" : "L"}${px(d.x).toFixed(1)},${py(d.y).toFixed(1)}`).join(" ");
  const selected = valid.find((d) => d.x === highlightX);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="trend-sparkline" role="img" aria-label={ariaLabel}>
      <path d={path} className="trend-sparkline__line" />
      {selected && <circle cx={px(selected.x)} cy={py(selected.y)} r={3.5} className="trend-sparkline__dot" />}
    </svg>
  );
}
