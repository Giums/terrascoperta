import type { WildfireHotspot } from "../../hooks/useWildfireHotspots";

interface VolcanoThermalPathProps {
  hotspots: WildfireHotspot[];
  loading: boolean;
  error: string | null;
}

interface DaySummary {
  date: string;
  count: number;
  maxFrp: number;
}

function groupByDay(hotspots: WildfireHotspot[]): DaySummary[] {
  const byDate = new Map<string, WildfireHotspot[]>();
  for (const h of hotspots) {
    const list = byDate.get(h.acqDate) ?? [];
    list.push(h);
    byDate.set(h.acqDate, list);
  }
  return Array.from(byDate.entries())
    .map(([date, list]) => ({ date, count: list.length, maxFrp: Math.max(...list.map((h) => h.frp)) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Ricostruzione giorno-per-giorno di dove si è spostato il segnale termico
 * VIIRS intorno al vulcano — non un fronte lava tracciato a mano su
 * immagini Sentinel-2 come fanno gli analisti (quel livello di dettaglio
 * richiede interpretazione umana, non è automatizzabile da un'API), ma un
 * proxy live reale della stessa idea: dove si sta spostando il calore, nel
 * tempo. Punti anche sulla mappa (colore chiaro = più vecchio, rosso acceso
 * = più recente), vedi VolcanoThermalPathMarkers.
 */
export default function VolcanoThermalPath({ hotspots, loading, error }: VolcanoThermalPathProps) {
  if (loading) return <p className="weather-live__status">Ricostruzione del segnale termico in corso…</p>;
  if (error) return null;
  if (hotspots.length === 0) return null;

  const days = groupByDay(hotspots);

  return (
    <section className="info-panel__section">
      <h3>Dove si è spostato il calore, giorno per giorno</h3>
      <ul className="info-panel__sources">
        {days.map((d) => (
          <li key={d.date}>
            <strong>{d.date}</strong> — {d.count} {d.count === 1 ? "punto" : "punti"} rilevati, FRP massima{" "}
            {d.maxFrp.toFixed(1)} MW
          </li>
        ))}
      </ul>
      <p>
        Punti caldi VIIRS (NASA FIRMS), risoluzione ~375m — un proxy termico reale, non un fronte lava
        tracciato a mano su immagini Sentinel-2 ad alta risoluzione (quello richiede un analista che
        interpreta le immagini, non è automatizzabile). Utile per capire in che direzione si sta
        spostando l'attività, non per una posizione precisa del fronte. Sulla mappa, gli stessi punti
        sono colorati dal più vecchio (giallo) al più recente (rosso).
      </p>
    </section>
  );
}
