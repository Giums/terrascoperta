/** Contenuto verificato su fonti ufficiali (Dipartimento Protezione Civile), non riscritto a memoria — vedi i link in fondo. */
export default function HydroRiskSafetyInfo() {
  return (
    <section className="info-panel__section info-panel__section--alert">
      <h3>Cosa fare in caso di alluvione</h3>
      <p>
        <strong>Al chiuso</strong>: non scendere in cantine, seminterrati o garage per mettere in salvo
        beni — sono le zone più pericolose. Sali ai piani superiori, evita l'ascensore, disattiva gas e
        impianti elettrici. Non bere acqua dal rubinetto: potrebbe essere contaminata.
      </p>
      <p>
        <strong>All'aperto</strong>: allontanati dalla zona allagata — l'acqua scorre più velocemente di
        quanto sembri. Evita l'auto: bastano pochi centimetri d'acqua per perdere il controllo. Evita
        sottopassi e argini.
      </p>
      <p>
        <strong>Dopo</strong>: aspetta l'autorizzazione delle autorità prima di rientrare, non percorrere
        strade allagate (possibili buche o tombini aperti), verifica gas ed elettricità prima di
        riattivarli, non mangiare cibo entrato in contatto con l'acqua dell'alluvione.
      </p>

      <h3>Cosa fare in caso di frana</h3>
      <p>
        Segnali precursori: piccole crepe o fratture nei muri, muri che ruotano o si spostano. Se la
        frana si muove verso di te, allontanati subito verso un punto più elevato e stabile — se non
        puoi scappare, rannicchiati proteggendo la testa. Tieni d'occhio la frana per pietre o detriti
        che rimbalzano, non sostare sotto pali o tralicci, allontanati da corsi d'acqua e torrenti (rischio
        colate di fango). Dopo l'evento, segnala eventuali persone intrappolate ai soccorritori senza
        entrare tu stesso nell'area in frana.
      </p>

      <p>
        <strong>Numero da chiamare</strong>: 112 (numero unico di emergenza).
      </p>
      <p>
        <em>
          La Croce Rossa Italiana fa parte del sistema nazionale di Protezione Civile e interviene con
          assistenza socio-sanitaria e accoglienza dopo l'evento — ma non è il numero da chiamare per
          primo.
        </em>
      </p>
      <p>
        <em>
          Fonte:{" "}
          <a href="https://www.protezionecivile.gov.it/it/approfondimento/in-caso-di-alluvione/" target="_blank" rel="noreferrer">
            Dipartimento della Protezione Civile — alluvioni
          </a>{" "}
          e{" "}
          <a href="https://www.protezionecivile.gov.it/jcms/it/view_cosa_fare_idrogeologico.wp?contentId=APP278" target="_blank" rel="noreferrer">
            frane
          </a>
          .
        </em>
      </p>
    </section>
  );
}
