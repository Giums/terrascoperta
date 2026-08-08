/**
 * Contenuto verificato su due fonti ufficiali (Dipartimento Protezione Civile
 * e campagna nazionale Io Non Rischio), non riscritto a memoria — vedi i link
 * in fondo. Condiviso tra FireDetail (casi studio) e HotspotDetail (focolai
 * live), stessa informazione indipendentemente da cosa hai cliccato.
 */
export default function FireSafetyInfo() {
  return (
    <section className="info-panel__section info-panel__section--alert">
      <h3>Cosa fare in caso di incendio</h3>
      <p>
        <strong>Se avvisti fiamme o anche solo fumo</strong>, telefona subito al <strong>115</strong> (Vigili
        del Fuoco) o al <strong>112</strong> (numero unico di emergenza). Indica con precisione dove sei —
        comune, località, punti di riferimento — e non riagganciare finché non te lo dice l'operatore. Non
        dare per scontato che l'abbia già segnalato qualcun altro.
      </p>
      <p>
        <strong>Se sei coinvolto nell'incendio</strong>: cerca una via di fuga verso una strada o un corso
        d'acqua, non spostarti mai sottovento (nella direzione in cui il fuoco viene spinto dal vento) — rischi
        di restare intrappolato. Se sei circondato, sdraiati in una zona senza vegetazione: il fumo tende a
        salire. Se possibile, attraversa il fronte del fuoco nel punto più debole per raggiungere l'area già
        bruciata, più sicura. Non fermarti lungo le strade per guardare: ostacoli i soccorsi.
      </p>
      <p>
        <strong>Prevenzione</strong>: non gettare mai mozziconi o fiammiferi accesi — bastano per incendiare
        l'erba secca. Non accendere fuochi fuori dalle aree attrezzate, e mai se c'è vento. Se parcheggi
        l'auto su erba secca, controlla che la marmitta non la tocchi. Non bruciare residui agricoli senza le
        dovute precauzioni.
      </p>
      <p>
        <em>
          La Croce Rossa Italiana fa parte del sistema nazionale di Protezione Civile e interviene con
          assistenza socio-sanitaria, accoglienza e supporto anche nella lotta antincendio boschivo (AIB)
          — ma non è il numero da chiamare per primo: la segnalazione iniziale va sempre a 115/112.
        </em>
      </p>
      <p>
        <em>
          Fonte: <a href="https://www.protezionecivile.gov.it/it/approfondimento/in-caso-di-incendio-boschivo/" target="_blank" rel="noreferrer">
            Dipartimento della Protezione Civile
          </a>{" "}
          e{" "}
          <a href="https://www.iononrischio.gov.it/it/preparati/incendi-boschivi/cosa-fare/" target="_blank" rel="noreferrer">
            Io Non Rischio
          </a>
          .
        </em>
      </p>
    </section>
  );
}
