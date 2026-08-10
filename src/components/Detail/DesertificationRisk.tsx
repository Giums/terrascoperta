import { useDesertificationRisk } from "../../hooks/useDesertificationRisk";

interface DesertificationRiskProps {
  lat: number;
  lng: number;
}

function classify(ndvi: number): { label: string; urgent: boolean } {
  if (ndvi < 0.2) return { label: "suolo nudo o vegetazione assente", urgent: true };
  if (ndvi < 0.4) return { label: "vegetazione rada o stressata", urgent: true };
  return { label: "vegetazione in salute", urgent: false };
}

/**
 * Dato calcolato dal vivo sul punto esatto dell'indirizzo (vedi
 * useDesertificationRisk) — complementare ai 5 casi studio fissi del modulo
 * Desertificazione, che restano narrativi/statici.
 */
export default function DesertificationRisk({ lat, lng }: DesertificationRiskProps) {
  const { ndvi, available, loading, error } = useDesertificationRisk(lat, lng);

  if (!available) return null;
  if (loading) return <p className="weather-live__status">Calcolo NDVI in corso…</p>;
  if (error || ndvi == null)
    return (
      <p className="weather-live__status">
        Nessuna immagine satellitare senza nuvole disponibile negli ultimi giorni su questo punto.
      </p>
    );

  const { label, urgent } = classify(ndvi);

  return (
    <section className={`city-detail__section${urgent ? " city-detail__urgency" : ""}`}>
      <h3>Salute della vegetazione qui</h3>
      <p>
        🌱 NDVI attuale: <strong>{ndvi.toFixed(2)}</strong> — {label}.
      </p>
      <p className="weather-live__source">
        Calcolato dal vivo su Sentinel-2 (Copernicus Data Space), media sull'area intorno
        all'indirizzo negli ultimi ~45 giorni. Scala NDVI: sotto 0.2 suolo nudo, 0.2–0.4 vegetazione
        rada o stressata, sopra 0.4 vegetazione sana.
      </p>
    </section>
  );
}
