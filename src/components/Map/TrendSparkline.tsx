import type { YearTemp } from "../../hooks/useSeasonalTrend";
import "./TrendSparkline.css";

interface TrendSparklineProps {
  data: YearTemp[];
  selectedYear: number;
}

const WIDTH = 200;
const HEIGHT = 44;
const PAD = 5;

export default function TrendSparkline({ data, selectedYear }: TrendSparklineProps) {
  const valid = data.filter((d): d is { year: number; avgTemp: number } => d.avgTemp != null);
  if (valid.length < 2) return null;

  const minYear = data[0].year;
  const maxYear = data[data.length - 1].year;
  const minT = Math.min(...valid.map((d) => d.avgTemp));
  const maxT = Math.max(...valid.map((d) => d.avgTemp));
  const range = maxT - minT || 1;

  function x(year: number): number {
    return PAD + ((year - minYear) / (maxYear - minYear)) * (WIDTH - PAD * 2);
  }
  function y(temp: number): number {
    return HEIGHT - PAD - ((temp - minT) / range) * (HEIGHT - PAD * 2);
  }

  const path = valid.map((d, i) => `${i === 0 ? "M" : "L"}${x(d.year).toFixed(1)},${y(d.avgTemp).toFixed(1)}`).join(" ");
  const selected = valid.find((d) => d.year === selectedYear);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="trend-sparkline"
      role="img"
      aria-label={`Andamento della temperatura media stagionale dal ${minYear} al ${maxYear}`}
    >
      <path d={path} className="trend-sparkline__line" />
      {selected && <circle cx={x(selected.year)} cy={y(selected.avgTemp)} r={3.5} className="trend-sparkline__dot" />}
    </svg>
  );
}
