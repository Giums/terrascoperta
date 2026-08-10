import "./InfoPanel.css";

interface PrivacyPolicyProps {
  onClose: () => void;
}

/**
 * Bilingue nello stesso pannello (IT poi EN), non due pagine separate — il
 * sito non ha ancora un vero sistema di traduzione dell'interfaccia, quindi
 * questa è l'unica pagina già garantita leggibile in inglese indipendentemente
 * dalla lingua del browser, in attesa di un i18n completo (vedi README, Roadmap).
 *
 * Contenuto basato su un audit reale del codice (non assunto): nessun cookie,
 * nessun localStorage/sessionStorage, nessun account o form che salva dati.
 * L'unico punto di dato personale è la ricerca indirizzo, che manda la query
 * e l'IP del visitatore direttamente al browser verso Nominatim/OpenStreetMap
 * (non tramite il nostro backend). Analytics: Umami, cookieless, IP hashato
 * con salt che ruota ogni giorno — vedi sezione dedicata.
 */
export default function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  return (
    <div className="info-panel">
      <div className="info-panel__header">
        <h2>Privacy — Privacy Policy</h2>
        <button type="button" className="info-panel__close" onClick={onClose} aria-label="Chiudi / Close">
          ×
        </button>
      </div>

      <section className="info-panel__section">
        <h3>🇮🇹 Informativa sulla privacy</h3>
        <p>
          Questo è un progetto personale, gratuito ed educativo, non commerciale. Non ha un vero
          sistema di gestione utenti né un ufficio legale dedicato — questa informativa descrive
          onestamente cosa succede tecnicamente quando usi il sito, verificato leggendo il codice,
          non un modello generico.
        </p>
        <p>
          <strong>Titolare del trattamento:</strong> [inserire qui un contatto email di riferimento
          per il progetto].
        </p>
        <p>
          <strong>Cookie:</strong> nessuno. Il sito non imposta cookie, non usa localStorage né
          sessionStorage.
        </p>
        <p>
          <strong>Analytics:</strong> usiamo{" "}
          <a href="https://umami.is" target="_blank" rel="noreferrer">
            Umami
          </a>
          , uno strumento di analisi del traffico privacy-first e open source. Non usa cookie, non
          usa localStorage/sessionStorage, non crea un identificativo persistente che ti segua tra
          visite o siti diversi. Raccoglie in forma aggregata: pagina visitata, referrer, paese ed
          eventualmente città (dedotti dall'IP), tipo di dispositivo e browser. Il tuo indirizzo IP
          viene hashato insieme a uno "salt" che cambia ogni giorno e non viene conservato in
          chiaro né associato in modo permanente a te. Base giuridica: legittimo interesse (art.
          6.1.f GDPR) a capire in forma aggregata come viene usato il sito, dato che non
          identifica singoli visitatori. Non essendoci profilazione né identificatori persistenti,
          non è richiesto un banner di consenso cookie per questo trattamento.
        </p>
        <p>
          <strong>Account e form:</strong> non esistono. Non puoi registrarti, non c'è login, non
          c'è nessun modulo che invia dati a un database nostro.
        </p>
        <p>
          <strong>Ricerca indirizzo:</strong> l'unico punto in cui un dato potenzialmente personale
          lascia il tuo browser. Quando cerchi un indirizzo, il testo che scrivi viene inviato
          direttamente (non tramite un nostro server) a{" "}
          <a href="https://nominatim.openstreetmap.org" target="_blank" rel="noreferrer">
            Nominatim (OpenStreetMap)
          </a>
          , un servizio di geocodifica gratuito e indipendente, insieme al tuo indirizzo IP secondo
          il normale funzionamento del web. Non conserviamo questa ricerca noi: il trattamento è
          regolato dalla{" "}
          <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noreferrer">
            privacy policy di OpenStreetMap Foundation
          </a>
          .
        </p>
        <p>
          <strong>Altre API pubbliche contattate</strong> (dal tuo browser o dal nostro backend, a
          seconda della funzione): Copernicus/Sentinel Hub, Open-Meteo, INGV, NASA FIRMS, OpenSky
          Network, Copernicus EMS, ISPRA IdroGEO. Queste richieste riguardano coordinate
          geografiche di città, fiumi, vulcani o eventi pubblici — non identificano te, salvo l'IP
          inevitabilmente presente in ogni richiesta HTTP, come per qualunque sito web.
        </p>
        <p>
          <strong>Log del server:</strong> se il sito è ospitato dietro un server web proprio
          (Nginx o simili), quel server può registrare l'IP delle richieste nei log tecnici
          standard, per motivi di sicurezza e diagnosi — prassi comune a qualunque hosting, base
          giuridica legittimo interesse (art. 6.1.f GDPR), non usata per profilazione.
        </p>
        <p>
          <strong>I tuoi diritti:</strong> dato che non conserviamo dati personali in un nostro
          database, non c'è nulla da richiedere in cancellazione/accesso rivolto a noi in senso
          stretto. Per qualunque dubbio, scrivi al contatto sopra. Hai comunque diritto di
          presentare reclamo al{" "}
          <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">
            Garante per la protezione dei dati personali
          </a>
          .
        </p>
        <p>
          <em>
            Questa informativa è scritta in buona fede per un progetto personale su piccola scala,
            non sostituisce una consulenza legale.
          </em>
        </p>
      </section>

      <section className="info-panel__section">
        <h3>🇬🇧 Privacy Policy</h3>
        <p>
          This is a personal, free, educational, non-commercial project. There's no real user
          management system or dedicated legal team behind it — this notice honestly describes
          what technically happens when you use the site, verified by reading the code, not a
          generic template.
        </p>
        <p>
          <strong>Data controller:</strong> [insert a reference contact email for the project
          here].
        </p>
        <p>
          <strong>Cookies:</strong> none. The site sets no cookies, uses no localStorage or
          sessionStorage.
        </p>
        <p>
          <strong>Analytics:</strong> we use{" "}
          <a href="https://umami.is" target="_blank" rel="noreferrer">
            Umami
          </a>
          , a privacy-first, open-source traffic analytics tool. It sets no cookies, uses no
          localStorage/sessionStorage, and creates no persistent identifier that follows you
          across visits or sites. It collects, in aggregate form: page visited, referrer, country
          and possibly city (derived from IP), device type and browser. Your IP address is hashed
          together with a salt that changes daily and is never stored in plain text or
          permanently linked to you. Legal basis: legitimate interest (GDPR art. 6.1.f) in
          understanding, in aggregate, how the site is used, since it doesn't identify individual
          visitors. Since there's no profiling or persistent identifiers, no cookie consent banner
          is required for this processing.
        </p>
        <p>
          <strong>Accounts and forms:</strong> none exist. You can't register, there's no login,
          no form submits data to a database of ours.
        </p>
        <p>
          <strong>Address search:</strong> the only point where potentially personal data leaves
          your browser. When you search an address, the text you type is sent directly (not
          through our server) to{" "}
          <a href="https://nominatim.openstreetmap.org" target="_blank" rel="noreferrer">
            Nominatim (OpenStreetMap)
          </a>
          , a free, independent geocoding service, along with your IP address per normal web
          behavior. We don't store this search ourselves — it's governed by{" "}
          <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noreferrer">
            OpenStreetMap Foundation's privacy policy
          </a>
          .
        </p>
        <p>
          <strong>Other public APIs contacted</strong> (from your browser or our backend,
          depending on the feature): Copernicus/Sentinel Hub, Open-Meteo, INGV, NASA FIRMS,
          OpenSky Network, Copernicus EMS, ISPRA IdroGEO. These requests concern geographic
          coordinates of cities, rivers, volcanoes, or public events — they don't identify you,
          aside from the IP address inherent to any HTTP request, as with any website.
        </p>
        <p>
          <strong>Server logs:</strong> if the site is hosted behind its own web server (Nginx or
          similar), that server may record request IPs in standard technical logs for security and
          diagnostic purposes — common practice for any hosting, legal basis legitimate interest
          (GDPR art. 6.1.f), not used for profiling.
        </p>
        <p>
          <strong>Your rights:</strong> since we don't retain personal data in a database of our
          own, there's strictly nothing to request deletion/access of from us. For any question,
          write to the contact above. You still have the right to lodge a complaint with your
          national data protection authority (in Italy, the{" "}
          <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">
            Garante per la protezione dei dati personali
          </a>
          ).
        </p>
        <p>
          <em>
            This notice is written in good faith for a small personal project — it doesn't
            replace legal advice.
          </em>
        </p>
      </section>
    </div>
  );
}
