import type { City } from "../../data/cities";
import { AC_ANNUAL_BILL_EUR, estimateCosts, estimateQuickWinPayback } from "../../utils/costs";

interface PersonalSavingsProps {
  referenceCity: City;
  green: number;
  albedo: number;
  uhiReduction: number;
}

// Vernice bianca sul tetto: intervento più economico in tabella "Cosa puoi fare
// a casa tua" (€5-15/m², midpoint 10), effetto diretto sul proprio tetto
// (-20/40% AC, midpoint 30%) — non mediato dal modello UHI a scala urbana.
const QUICK_WIN_COST_PER_M2 = 10;
const QUICK_WIN_AC_SAVING_PCT = 30;

export default function PersonalSavings({ referenceCity, green, albedo, uhiReduction }: PersonalSavingsProps) {
  const costs = estimateCosts(referenceCity, green, albedo, uhiReduction);
  const quickWinPayback = estimateQuickWinPayback(QUICK_WIN_COST_PER_M2, QUICK_WIN_AC_SAVING_PCT);
  const quickWinCost = QUICK_WIN_COST_PER_M2 * 80;
  const quickWinSaving = AC_ANNUAL_BILL_EUR * (QUICK_WIN_AC_SAVING_PCT / 100);

  return (
    <div className="personal-savings">
      <dl className="cost-estimator__grid">
        <div>
          <dt>Vernice bianca sul tuo tetto (80m², fai-da-te)</dt>
          <dd>€ {quickWinCost.toFixed(0)}</dd>
        </div>
        <div>
          <dt>Risparmio AC/anno da questo intervento</dt>
          <dd>€ {quickWinSaving.toFixed(0)}</dd>
        </div>
        <div>
          <dt>Ripagato in</dt>
          <dd>~{Math.round(quickWinPayback)} anni</dd>
        </div>
      </dl>
      <p className="cost-estimator__note">
        Questo è l'effetto diretto sul tuo tetto — funziona dalla prima estate, indipendentemente
        da cosa fa il resto della città. Numeri per un tetto medio da 80m²: adatta ai tuoi m² reali.
        Vedi la tabella "Cosa puoi fare a casa tua" qui sotto per le altre opzioni (membrana, tetto
        verde, alberi) con costi ed effetti diversi.
      </p>
      <p className="cost-estimator__note">
        C'è poi un secondo effetto, più lento: se anche i tuoi vicini intervengono, la temperatura
        media del quartiere scende e risparmi ancora di più sull'AC (circa € {costs.acSavePerHH.toFixed(0)}
        /anno in più a regime) — ma quello richiede l'azione collettiva della città, non solo la tua.
      </p>
    </div>
  );
}
