export interface DissipationPoint {
  hour: number;
  baseline: number;
  mitigated: number;
}

// Valori di riferimento per la temperatura di *superficie* (non dell'aria) di
// un tetto scuro vs uno chiaro, dalla sezione "Effetto notturno dell'albedo"
// del progetto (Santamouris 2014, Akbari et al. 2001): un tetto scuro
// (albedo ~0.1) arriva a 70-80°C a mezzogiorno e rilascia calore per ore
// dopo il tramonto; un tetto chiaro (albedo ~0.75) arriva a 35-45°C e si
// raffredda molto più in fretta.
const DARK_PEAK = 78;
const DARK_FLOOR = 25;
const MITIGATED_PEAK_MIN = 35;
const MITIGATED_FLOOR_MIN = 19;
const TAU_DARK = 7; // costante di tempo del rilascio notturno (ore)
const TAU_MITIGATED_MIN = 3;
const PEAK_HOUR = 14;
const FLOOR_HOUR = 6;

function surfaceTempAt(hour: number, peak: number, floor: number, tau: number): number {
  // Fase di salita: dal minimo dell'alba al picco del primo pomeriggio.
  if (hour >= FLOOR_HOUR && hour <= PEAK_HOUR) {
    const t = (hour - FLOOR_HOUR) / (PEAK_HOUR - FLOOR_HOUR);
    return floor + (peak - floor) * (1 - Math.cos(Math.PI * t)) / 2;
  }
  // Fase di discesa: decadimento esponenziale verso il minimo, con costante
  // di tempo diversa a seconda della superficie (più lenta = resta calda più a lungo).
  const hoursSincePeak = hour >= PEAK_HOUR ? hour - PEAK_HOUR : hour + 24 - PEAK_HOUR;
  return floor + (peak - floor) * Math.exp(-hoursSincePeak / tau);
}

/**
 * Curva illustrativa (non una simulazione fisica) della temperatura di
 * superficie nell'arco di 24 ore, con e senza gli interventi scelti nel
 * simulatore. Mostra perché un tetto scuro resta "un termosifone acceso"
 * per ore dopo il tramonto, mentre uno chiaro/verde si raffredda in fretta.
 */
function mixFactors(green: number, albedo: number): { albedoFactor: number; greenFactor: number } {
  return { albedoFactor: albedo / 50, greenFactor: green / 40 };
}

/** Picco di temperatura di superficie (ore 14) senza e con gli interventi scelti. */
export function peakSurfaceTemps(green: number, albedo: number): { baseline: number; mitigated: number } {
  const { albedoFactor, greenFactor } = mixFactors(green, albedo);
  const mitigated =
    DARK_PEAK - albedoFactor * (DARK_PEAK - MITIGATED_PEAK_MIN) * 0.8 - greenFactor * (DARK_PEAK - MITIGATED_PEAK_MIN) * 0.2;
  return { baseline: DARK_PEAK, mitigated };
}

export function dissipationCurve(green: number, albedo: number): DissipationPoint[] {
  const { albedoFactor, greenFactor } = mixFactors(green, albedo);

  const peak = DARK_PEAK - albedoFactor * (DARK_PEAK - MITIGATED_PEAK_MIN) * 0.8 - greenFactor * (DARK_PEAK - MITIGATED_PEAK_MIN) * 0.2;
  const floor = DARK_FLOOR - albedoFactor * (DARK_FLOOR - MITIGATED_FLOOR_MIN) * 0.8 - greenFactor * (DARK_FLOOR - MITIGATED_FLOOR_MIN) * 0.2;
  const tau = TAU_DARK - albedoFactor * (TAU_DARK - TAU_MITIGATED_MIN) * 0.8 - greenFactor * (TAU_DARK - TAU_MITIGATED_MIN) * 0.2;

  const points: DissipationPoint[] = [];
  for (let hour = 0; hour <= 24; hour++) {
    const h = hour % 24;
    points.push({
      hour,
      baseline: surfaceTempAt(h, DARK_PEAK, DARK_FLOOR, TAU_DARK),
      mitigated: surfaceTempAt(h, peak, floor, tau),
    });
  }
  return points;
}

// Coefficiente di temperatura tipico dei moduli fotovoltaici in silicio
// cristallino, da qualsiasi datasheet di pannello standard: la potenza
// prodotta cala di circa lo 0.4% per ogni grado sopra la temperatura di
// riferimento (25°C). I pannelli sono quasi sempre montati con un'intercapedine
// d'aria (standoff), che smorza — non elimina — l'influenza della temperatura
// del tetto sottostante: qui si stima che il pannello "senta" circa il 25% del
// delta di temperatura di superficie del tetto.
const PV_TEMP_COEFFICIENT_PCT_PER_C = 0.4;
const PANEL_STANDOFF_DAMPING = 0.25;

/**
 * Stima (non una misura) di quanto un tetto più chiaro/verde possa aumentare
 * la resa di pannelli fotovoltaici montati sopra, rispetto a un tetto scuro,
 * per effetto della minore temperatura operativa delle celle. Ordine di
 * grandezza, non un valore di progetto.
 */
export function estimatePVYieldGainPct(green: number, albedo: number): number {
  const { baseline, mitigated } = peakSurfaceTemps(green, albedo);
  const roofDeltaT = baseline - mitigated;
  const panelDeltaT = roofDeltaT * PANEL_STANDOFF_DAMPING;
  return panelDeltaT * PV_TEMP_COEFFICIENT_PCT_PER_C;
}
