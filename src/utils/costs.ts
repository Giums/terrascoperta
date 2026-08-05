import type { City } from "../data/cities";

export interface CostEstimate {
  greenCost: number;
  albedoCost: number;
  acSaveTotal: number;
  acSavePerHH: number;
  co2Tonnes: number;
  paybackYears: number;
}

/**
 * Stima costi/benefici a scala urbana di un intervento di mitigazione.
 * Tutti i valori sono ordini di grandezza per finalità divulgative — non
 * sostituiscono un prezziario regionale delle opere pubbliche.
 */
export function estimateCosts(
  city: City,
  greenPct: number,
  albedoPct: number,
  uhiReduction: number,
): CostEstimate {
  const urbanM2 = (city.population / 3000) * 1e6;

  const greenCost = urbanM2 * (greenPct / 100) * 2.5;
  const albedoCost = urbanM2 * (albedoPct / 100) * 20;

  const households = city.population / 2.3;
  const acPctReduction = uhiReduction * 6;
  const acSavePerHH = 168 * (acPctReduction / 100);
  const acSaveTotal = acSavePerHH * households;

  const co2Tonnes = (600 * (acPctReduction / 100) * households * 0.26) / 1000;

  const paybackYears = Math.round((greenCost + albedoCost) / Math.max(acSaveTotal, 1));

  return { greenCost, albedoCost, acSaveTotal, acSavePerHH, co2Tonnes, paybackYears };
}
