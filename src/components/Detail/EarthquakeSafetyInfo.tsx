/** Contenuto verificato su due fonti ufficiali (Dipartimento Protezione Civile e Io Non Rischio), non riscritto a memoria — vedi i link in fondo. */
export default function EarthquakeSafetyInfo() {
  return (
    <section className="info-panel__section info-panel__section--alert">
      <h3>Cosa fare in caso di terremoto</h3>
      <p>
        <strong>Durante la scossa, al chiuso</strong>: ripara nel vano di una porta su un muro portante,
        sotto un tavolo o un letto robusto, oppure vicino a una parete portante. Non usare scale o
        ascensore.
      </p>
      <p>
        <strong>Durante la scossa, all'aperto</strong>: allontanati da edifici, alberi, lampioni e linee
        elettriche. In auto, non sostare vicino a ponti, terreni franosi o spiagge.
      </p>
      <p>
        <strong>Dopo la scossa</strong>: verifica lo stato di chi ti è vicino, senza spostare persone
        ferite gravemente. Chiudi gas, acqua e corrente. Esci con prudenza indossando le scarpe,
        raggiungi uno spazio aperto lontano dagli edifici, evita ascensori e scale danneggiate. Se sei
        vicino alla costa e la scossa è forte: allontanati dalla spiaggia e raggiungi un punto elevato
        (rischio maremoto).
      </p>
      <p>
        <strong>Numero da chiamare</strong>: 112 (numero unico di emergenza), che smista a 115 (Vigili
        del Fuoco, soccorso tecnico/estrazione) o 118 (emergenza sanitaria) a seconda del bisogno.
      </p>
      <p>
        <em>
          La Croce Rossa Italiana fa parte del sistema nazionale di Protezione Civile e interviene con
          assistenza socio-sanitaria, moduli di accoglienza e ospedali da campo dopo l'evento — ma non è
          il numero da chiamare per primo: la segnalazione iniziale va sempre a 112.
        </em>
      </p>
      <p>
        <em>
          Fonte:{" "}
          <a href="https://www.protezionecivile.gov.it/it/approfondimento/in-caso-di-terremoto/" target="_blank" rel="noreferrer">
            Dipartimento della Protezione Civile
          </a>{" "}
          e{" "}
          <a href="https://www.iononrischio.gov.it/it/preparati/terremoto/cosa-fare/" target="_blank" rel="noreferrer">
            Io Non Rischio
          </a>
          .
        </em>
      </p>
    </section>
  );
}
