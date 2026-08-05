import type { City } from "../../data/cities";
import { estimateCosts } from "../../utils/costs";

interface PersonalSavingsProps {
  referenceCity: City;
  green: number;
  albedo: number;
  uhiReduction: number;
}

export default function PersonalSavings({ referenceCity, green, albedo, uhiReduction }: PersonalSavingsProps) {
  const costs = estimateCosts(referenceCity, green, albedo, uhiReduction);

  return (
    <div className="personal-savings">
      <dl className="cost-estimator__grid">
        <div>
          <dt>Risparmio AC stimato/anno</dt>
          <dd>€ {costs.acSavePerHH.toFixed(0)}</dd>
        </div>
        <div>
          <dt>Tempo di ritorno (payback)</dt>
          <dd>{Number.isFinite(costs.paybackYears) ? `${costs.paybackYears} anni` : "—"}</dd>
        </div>
      </dl>
      <p className="cost-estimator__note">
        Il risparmio per famiglia e il payback non dipendono dalla dimensione della città, quindi
        restano validi per una singola abitazione. Per il costo dell'intervento in euro, vedi la
        tabella "Cosa puoi fare a casa tua" qui sotto — dipende dai m² reali del tuo tetto, non
        stimabili da un indirizzo.
      </p>
    </div>
  );
}
