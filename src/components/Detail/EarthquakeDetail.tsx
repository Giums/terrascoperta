import type { EarthquakeEvent } from "../../hooks/useItalyEarthquakes";
import { DAYS_BACK } from "../../hooks/useItalyEarthquakes";
import { nearestCity } from "../../utils/geo";
import { cities } from "../../data/cities";
import "../Info/InfoPanel.css";

interface EarthquakeDetailProps {
  event: EarthquakeEvent;
  onClose: () => void;
}

function formatTime(isoTime: string): string {
  const d = new Date(`${isoTime}Z`);
  return Number.isNaN(d.getTime())
    ? isoTime
    : d.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" });
}

const MAG_TYPE_NAMES: Record<string, string> = {
  ML: "magnitudo locale (Richter)",
  Mw: "magnitudo momento",
  Md: "magnitudo di durata",
  Ms: "magnitudo delle onde di superficie",
  mb: "magnitudo delle onde di volume",
};

function magTypeName(code: string): string {
  return MAG_TYPE_NAMES[code] ?? code;
}

export default function EarthquakeDetail({ event, onClose }: EarthquakeDetailProps) {
  const { city, distanceKm } = nearestCity(event.lat, event.lng, cities);

  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <div>
          <h2>
            {event.magType}
            {event.magnitude.toFixed(1)}
          </h2>
          <p>{event.place}</p>
        </div>
        <button type="button" className="info-panel__close" onClick={onClose} aria-label="Chiudi dettaglio">
          ×
        </button>
      </div>

      <section className="info-panel__section">
        <h3>Dati evento</h3>
        <p>
          <strong>Magnitudo:</strong> {event.magnitude.toFixed(1)} — {magTypeName(event.magType)} (
          {event.magType})
          <br />
          <strong>Profondità:</strong> {event.depthKm.toFixed(1)} km
          <br />
          <strong>Quando:</strong> {formatTime(event.time)}
          <br />
          <strong>Città più vicina:</strong> {city.name} ({distanceKm < 1 ? "<1" : distanceKm.toFixed(0)} km)
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Cosa significa la magnitudo</h3>
        <p>
          La scala è logaritmica: ogni punto in più corrisponde a un'energia rilasciata circa 32 volte
          maggiore. Sotto magnitudo 3 raramente si avverte; tra 3 e 4.5 si sente ma di solito non causa
          danni; sopra 5 può causare danni a seconda di profondità e distanza dall'epicentro. La
          profondità conta quanto la magnitudo: lo stesso evento fa meno danni in superficie se il
          fuoco è profondo, perché l'energia si disperde su un percorso più lungo prima di arrivare.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Non esiste una sola scala</h3>
        <p>
          "Magnitudo Richter" è il nome che usa tutti, ma non è l'unica scala e nemmeno la più usata
          oggi — INGV sceglie quella più affidabile caso per caso, di solito in base a quanto è grande
          l'evento:
        </p>
        <ul className="info-panel__sources">
          <li>
            <strong>ML — locale (Richter)</strong>
            <br />
            La scala storica, ideata nel 1935. Affidabile per eventi piccoli e medi vicini alla
            stazione di misura — la maggior parte dei terremoti italiani in questa lista.
          </li>
          <li>
            <strong>Mw — momento</strong>
            <br />
            Calcolata dall'energia fisica effettivamente rilasciata sulla faglia, non da un'ampiezza
            misurata. Non "satura" (non sottostima) sui terremoti grandi come fa ML — è quella usata
            per i big event, tipo un M6+.
          </li>
          <li>
            <strong>Md — durata</strong>
            <br />
            Stimata da quanto dura la scossa registrata, non dalla sua ampiezza. Usata soprattutto per
            eventi molto piccoli o quando il segnale è debole.
          </li>
        </ul>
        <p>
          Per lo stesso terremoto, scale diverse possono dare numeri leggermente diversi — non è un
          errore, sono metodi di calcolo diversi che convergono bene ma non identicamente.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Magnitudo o scala Mercalli?</h3>
        <p>
          Sono due cose diverse, non due nomi per la stessa scala. La <strong>magnitudo</strong> (ML,
          Mw, Md sopra) misura l'energia rilasciata alla sorgente: un solo numero per l'intero
          terremoto, calcolato dagli strumenti. La <strong>scala Mercalli</strong> (oggi si usa la
          versione europea EMS-98) misura invece gli effetti percepiti in un punto preciso quanto si
          è sentito, che danni ha fatto quindi lo stesso terremoto ha un Mercalli diverso a seconda
          di dove ti trovi: alto vicino all'epicentro, basso lontano.
        </p>
        <p>
          Il Mercalli non viene calcolato in automatico dalle stazioni sismiche come la magnitudo:
          richiede rilevazioni sul campo e questionari alla popolazione (rilievo macrosismico), che
          INGV pubblica con giorni di ritardo ok  per questo qui non è mostrato in tempo reale.
        </p>
      </section>

      <section className="info-panel__section">
        <h3>Fonti</h3>
        <p>
          Dati forniti da: INGV, servizio FDSN Event (CC BY 4.0). Elenco aggiornato ogni 5 minuti,
          eventi con magnitudo ≥ 2.0 degli ultimi {DAYS_BACK} giorni.
        </p>
      </section>
    </div>
  );
}
