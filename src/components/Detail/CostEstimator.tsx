import type { City } from "../../data/cities";
import { estimateCosts } from "../../utils/costs";

interface CostEstimatorProps {
  city: City;
  green: number;
  albedo: number;
  uhiReduction: number;
}

function formatEUR(value: number): string {
  if (value >= 1e6) return `€ ${(value / 1e6).toFixed(1)} mln`;
  if (value >= 1e3) return `€ ${(value / 1e3).toFixed(0)} mila`;
  return `€ ${value.toFixed(0)}`;
}

export default function CostEstimator({ city, green, albedo, uhiReduction }: CostEstimatorProps) {
  const costs = estimateCosts(city, green, albedo, uhiReduction);
  const totalCost = costs.greenCost + costs.albedoCost;

  return (
    <div className="cost-estimator">
      <dl className="cost-estimator__grid">
        <div>
          <dt>Investimento stimato (verde + albedo)</dt>
          <dd>{formatEUR(totalCost)}</dd>
        </div>
        <div>
          <dt>Risparmio AC per famiglia/anno</dt>
          <dd>€ {costs.acSavePerHH.toFixed(0)}</dd>
        </div>
        <div>
          <dt>Risparmio AC totale città/anno</dt>
          <dd>{formatEUR(costs.acSaveTotal)}</dd>
        </div>
        <div>
          <dt>CO₂ evitata/anno</dt>
          <dd>{costs.co2Tonnes.toFixed(0)} t</dd>
        </div>
        <div>
          <dt>Tempo di ritorno (payback)</dt>
          <dd>{Number.isFinite(costs.paybackYears) ? `${costs.paybackYears} anni` : "—"}</dd>
        </div>
      </dl>
      <p className="cost-estimator__note">
        Il payback è quanti anni servono perché il risparmio energetico sull'aria condizionata
        ripaghi il costo dell'intervento — calcolato sull'intera città, non sulla singola famiglia.
        Più si aspetta a intervenire, più a lungo si continua a pagare la bolletta piena: agire
        prima non riduce solo il caldo, riduce anche gli anni in cui l'investimento "costa" prima
        di iniziare a far risparmiare.
      </p>
      <p className="cost-estimator__note">
        Stime a scala urbana, ordini di grandezza. Per dati precisi consultare ISPRA, ENEA e il
        prezziario regionale delle opere pubbliche.
      </p>
    </div>
  );
}
