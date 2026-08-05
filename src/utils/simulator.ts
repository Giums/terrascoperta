/**
 * Stima la riduzione di UHI (°C) ottenibile aumentando copertura verde
 * e superfici ad alto albedo. Coefficienti da letteratura (ordini di
 * grandezza, non valori misurati per la città specifica).
 * Fonti: Bowler et al. 2010 (verde), Akbari et al. 2001 (albedo).
 */
export function simulateMitigation(
  uhi: number,
  greenIncreasePct: number, // 0-40
  albedoSurfacePct: number, // 0-50
): number {
  const greenReduction = 0.5 * (greenIncreasePct / 10);
  const albedoReduction = 0.3 * (albedoSurfacePct / 10);

  const combined = greenReduction + albedoReduction;
  const total = combined * (1 - 0.05 * Math.min(combined / uhi, 1));

  // Non si può eliminare il 100% dell'UHI — residuo termico urbano
  return Math.min(total, uhi * 0.95);
}
