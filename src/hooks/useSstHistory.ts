import history from "../data/sst-history.json";
import type { YearTemp } from "./useSeasonalTrend";

/**
 * Serie storica della temperatura estiva del mare, dal file precalcolato.
 *
 * Non è un hook che scarica niente: il JSON è già nel bundle (poche decine di
 * kB) perché ricostruirlo a runtime costerebbe migliaia di richieste a
 * Copernicus per ogni visitatore — vedi scripts/generate-sst-history.ts.
 * Resta una funzione con prefisso `use*` per coerenza con gli altri trend del
 * pannello, che invece scaricano davvero.
 */
export const SST_HISTORY_FIRST_YEAR = history.firstYear;
/** Ultimo anno con una stagione completa — non l'anno solare in corso. */
export const SST_HISTORY_LAST_YEAR = history.lastYear;
export const SST_HISTORY_GENERATED_AT = history.generatedAt;

const zones = history.zones as Record<string, Record<string, number>>;

export function useSstHistory(zoneId: string): YearTemp[] {
  const byYear = zones[zoneId] ?? {};
  const years: YearTemp[] = [];
  for (let year = history.firstYear; year <= history.lastYear; year++) {
    years.push({ year, avgTemp: byYear[String(year)] ?? null });
  }
  return years;
}
