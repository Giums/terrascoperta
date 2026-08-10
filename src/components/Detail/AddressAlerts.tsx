import type { WildfireHotspot } from "../../hooks/useWildfireHotspots";
import type { EarthquakeEvent } from "../../hooks/useItalyEarthquakes";
import { useEmsActivations, nearestActivation } from "../../hooks/useEmsActivations";
import { haversineKm } from "../../utils/geo";

interface AddressAlertsProps {
  lat: number;
  lng: number;
  wildfireHotspots: WildfireHotspot[];
  wildfireHotspotsLoading: boolean;
  earthquakes: EarthquakeEvent[];
  earthquakesLoading: boolean;
}

const HOTSPOT_RADIUS_KM = 20;
const EARTHQUAKE_RADIUS_KM = 50;
const EMS_RADIUS_KM = 150;
// Tutte le categorie EMS rilevanti per una casa, non una sola come nei singoli
// moduli — qui non sappiamo a priori quale rischio riguarda l'indirizzo.
const EMS_CATEGORIES = ["fire", "flood", "mass", "earthquake", "volcan"];

function formatQuakeTime(isoTime: string): string {
  const d = new Date(`${isoTime}Z`);
  return Number.isNaN(d.getTime())
    ? isoTime
    : d.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Fotografia al momento del click, non un abbonamento — nessun dato salvato,
 * nessun account, nessuna notifica nel tempo (vedi memoria di progetto sulla
 * scelta di tenerlo così). I dataset (EMS, focolai, terremoti) sono già
 * scaricati per intero altrove nell'app: qui si fa solo un confronto di
 * distanza in locale, nessuna coordinata dell'indirizzo lascia il browser
 * verso un nostro server.
 */
export default function AddressAlerts({
  lat,
  lng,
  wildfireHotspots,
  wildfireHotspotsLoading,
  earthquakes,
  earthquakesLoading,
}: AddressAlertsProps) {
  const { activations, loading: emsLoading } = useEmsActivations();
  const emsNearby = nearestActivation(activations, lat, lng, EMS_RADIUS_KM, EMS_CATEGORIES);

  const nearbyHotspots = wildfireHotspots.filter((h) => haversineKm(lat, lng, h.lat, h.lon) <= HOTSPOT_RADIUS_KM);
  const nearbyQuakes = earthquakes
    .filter((e) => haversineKm(lat, lng, e.lat, e.lng) <= EARTHQUAKE_RADIUS_KM)
    .sort((a, b) => b.magnitude - a.magnitude);

  const loading = emsLoading || wildfireHotspotsLoading || earthquakesLoading;
  const hasAlerts = emsNearby != null || nearbyHotspots.length > 0 || nearbyQuakes.length > 0;

  return (
    <section className={`city-detail__section${hasAlerts ? " city-detail__urgency" : ""}`}>
      <h3>Allerte attive vicino a te</h3>
      {loading ? (
        <p>Controllo in corso…</p>
      ) : !hasAlerts ? (
        <p>
          Nessuna allerta rilevata nelle vicinanze in questo momento — focolai satellitari, terremoti
          recenti o attivazioni Copernicus EMS dichiarate.
        </p>
      ) : (
        <>
          {emsNearby && (
            <p>
              🛰️ <strong>{emsNearby.name}</strong> ({emsNearby.code}) — attivazione Copernicus EMS in
              corso ({emsNearby.category}).{" "}
              <a
                href={`https://mapping.emergency.copernicus.eu/activations/${emsNearby.code}/`}
                target="_blank"
                rel="noreferrer"
              >
                Mappe ufficiali ↗
              </a>
            </p>
          )}
          {nearbyHotspots.length > 0 && (
            <p>
              🔥 <strong>{nearbyHotspots.length}</strong>{" "}
              {nearbyHotspots.length === 1 ? "focolaio rilevato" : "focolai rilevati"} dal satellite entro{" "}
              {HOTSPOT_RADIUS_KM}km nelle ultime 24 ore — non è una conferma ufficiale di incendio.
            </p>
          )}
          {nearbyQuakes.length > 0 && (
            <p>
              🌍 Terremoto più forte entro {EARTHQUAKE_RADIUS_KM}km: <strong>M{nearbyQuakes[0].magnitude.toFixed(1)}</strong>
              , {formatQuakeTime(nearbyQuakes[0].time)} — {nearbyQuakes[0].place}.
            </p>
          )}
        </>
      )}
      <p>
        <em>
          Controllo fatto al momento dell'apertura di questa pagina, non un abbonamento — riapri per
          un aggiornamento.
        </em>
      </p>
    </section>
  );
}
