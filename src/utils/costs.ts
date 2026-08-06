import type { City } from "../data/cities";

/** Bolletta AC annua media per famiglia italiana, ordine di grandezza (ARERA/ENEA). */
export const AC_ANNUAL_BILL_EUR = 168;

/**
 * Payback di un singolo intervento diretto sulla propria abitazione (es. vernice
 * bianca sul tetto), usando i range di costo/risparmio già mostrati in tabella
 * "Cosa puoi fare a casa tua". A differenza di `estimateCosts`, non passa dal
 * modello UHI a scala urbana: l'effetto è diretto sul proprio tetto, quindi
 * risparmi molto più alti (−20/40%) e payback molto più corti (anni, non secoli).
 */
export function estimateQuickWinPayback(costPerM2: number, acSavingPct: number, roofM2 = 80): number {
  const cost = costPerM2 * roofM2;
  const saving = AC_ANNUAL_BILL_EUR * (acSavingPct / 100);
  return cost / saving;
}

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
  const acSavePerHH = AC_ANNUAL_BILL_EUR * (acPctReduction / 100);
  const acSaveTotal = acSavePerHH * households;

  const co2Tonnes = (600 * (acPctReduction / 100) * households * 0.26) / 1000;

  const paybackYears = Math.round((greenCost + albedoCost) / Math.max(acSaveTotal, 1));

  return { greenCost, albedoCost, acSaveTotal, acSavePerHH, co2Tonnes, paybackYears };
}
