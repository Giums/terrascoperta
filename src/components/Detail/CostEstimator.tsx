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
          <dt>Risparmio a famiglia/anno se TUTTA la città fa questo intervento</dt>
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
        Il risparmio a famiglia sembra piccolo perché è il beneficio dell'intervento cittadino
        (verde+albedo scelti sopra) diviso su ogni famiglia della città. Non è quanto risparmi tu
        se agisci da solo sulla tua casa — quel numero, molto più alto, è più sotto in "Quanto
        risparmi tu".
      </p>
      <p className="cost-estimator__note">
        Questo payback riguarda un piano pubblico su scala cittadina (strade, edifici, spazi
        pubblici), non un investimento tuo — è più simile al tempo di ammortamento di una rete
        fognaria o di una linea tramviaria che a un acquisto personale, e conta solo il risparmio
        AC: non include benefici che non si vedono in bolletta, come meno morti da ondate di
        calore, meno assenteismo, meno stress sulla rete elettrica nei picchi estivi. Per un
        intervento che ripaghi in pochi anni e dipenda solo da te, vedi "Quanto risparmi tu" più
        sotto.
      </p>
      <p className="cost-estimator__note">
        Stime a scala urbana, ordini di grandezza. Per dati precisi consultare ISPRA, ENEA e il
        prezziario regionale delle opere pubbliche.
      </p>
    </div>
  );
}
