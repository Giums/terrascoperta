/**
 * Logica pura delle correlazioni climatiche (Fase 7b).
 *
 * Regola che vale per tutto il file: qui non si calcola **causalità**.
 * L'attribuzione causale vera di un singolo evento estremo si fa con un
 * ensemble di simulazioni controfattuali (il metodo di World Weather
 * Attribution), che è fuori portata per un sito client-side. Quello che c'è
 * qui sono tendenze, anomalie rispetto a una baseline, e una relazione fisica
 * nota (Clausius-Clapeyron). L'interfaccia deve dirlo, non lasciarlo intendere.
 */

/** Soglia di "giorno molto caldo" — allineata agli indici ETCCDI/heat-warning usati in Italia. */
export const HOT_DAY_C = 35;
/** "Notte tropicale": la minima non scende sotto i 20 °C. È l'indice che pesa di più sulla salute. */
export const TROPICAL_NIGHT_C = 20;
/** Soglia WMO di "giorno piovoso". Sotto 1 mm è rugiada o pioggia non misurabile. */
export const WET_DAY_MM = 1;
/**
 * Frazione minima di giorni presenti perché un anno sia confrontabile.
 * Stessa scelta di `scripts/generate-sst-history.ts` (Fase 6): un anno
 * parziale ha una media che sembra un segnale climatico e invece è un buco.
 */
export const MIN_YEAR_COVERAGE = 0.8;

/** Baseline di riferimento: trentennio 1961-1990, lo standard WMO per le anomalie. */
export const BASELINE_FROM = 1961;
export const BASELINE_TO = 1990;

/** Serie giornaliera nel formato che restituisce Open-Meteo archive (ERA5). */
export interface DailySeries {
  /** Date `YYYY-MM-DD`, una per giorno, in ordine. */
  time: string[];
  tmax: (number | null)[];
  tmin: (number | null)[];
  precipMm: (number | null)[];
}

export interface YearIndices {
  year: number;
  /** Giorni con massima ≥ `HOT_DAY_C`. */
  hotDays: number;
  /** Notti con minima ≥ `TROPICAL_NIGHT_C`. */
  tropicalNights: number;
  /** Pioggia massima caduta in un singolo giorno (mm) — il proxy di "nubifragio". */
  maxDailyRainMm: number;
  /** Totale annuo di pioggia (mm). */
  totalRainMm: number;
  /** Giorni consecutivi più lunghi sotto `WET_DAY_MM` — proxy di siccità. */
  longestDrySpell: number;
  /** Giorni effettivamente disponibili nell'anno. */
  days: number;
}

function isNum(v: number | null | undefined): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Aggrega una serie giornaliera in indici annuali.
 *
 * Gli anni con meno di `MIN_YEAR_COVERAGE` di giorni vengono scartati, non
 * restituiti a zero: uno zero in un grafico si legge come "non è mai successo",
 * che è l'opposto di "non lo sappiamo". Riguarda in particolare l'anno in corso,
 * che è sempre parziale.
 */
export function yearlyIndices(series: DailySeries): YearIndices[] {
  const byYear = new Map<number, YearIndices>();
  // Lo spell secco viene contato per anno solare: uno a cavallo di capodanno
  // risulta spezzato. È una semplificazione accettabile perché la siccità che
  // interessa qui è quella estiva, mai a cavallo dell'anno.
  const runningDry = new Map<number, number>();

  for (let i = 0; i < series.time.length; i++) {
    const year = Number(series.time[i].slice(0, 4));
    if (!Number.isFinite(year)) continue;

    let acc = byYear.get(year);
    if (!acc) {
      acc = {
        year,
        hotDays: 0,
        tropicalNights: 0,
        maxDailyRainMm: 0,
        totalRainMm: 0,
        longestDrySpell: 0,
        days: 0,
      };
      byYear.set(year, acc);
      runningDry.set(year, 0);
    }
    acc.days++;

    const tmax = series.tmax[i];
    const tmin = series.tmin[i];
    const rain = series.precipMm[i];

    if (isNum(tmax) && tmax >= HOT_DAY_C) acc.hotDays++;
    if (isNum(tmin) && tmin >= TROPICAL_NIGHT_C) acc.tropicalNights++;
    if (isNum(rain)) {
      acc.totalRainMm += rain;
      if (rain > acc.maxDailyRainMm) acc.maxDailyRainMm = rain;
      // Un giorno senza misura NON interrompe lo spell e non lo allunga:
      // interromperlo inventerebbe una pioggia che non sappiamo se c'è stata.
      const run = rain < WET_DAY_MM ? (runningDry.get(year) ?? 0) + 1 : 0;
      runningDry.set(year, run);
      if (run > acc.longestDrySpell) acc.longestDrySpell = run;
    }
  }

  return [...byYear.values()]
    .filter((y) => y.days >= 365 * MIN_YEAR_COVERAGE)
    .sort((a, b) => a.year - b.year);
}

export interface Trend {
  /** Pendenza in unità della grandezza per anno. */
  slope: number;
  intercept: number;
  /** Quota di varianza spiegata, 0-1. Basso = i punti sono rumorosi, non che il trend è sbagliato. */
  r2: number;
  /** Deviazione standard dei residui, nelle unità della grandezza. Serve per la banda d'incertezza. */
  residualSigma: number;
  /** Numero di punti usati. */
  n: number;
}

/** Regressione lineare ai minimi quadrati. `null` sotto i 3 punti o se le x sono tutte uguali. */
export function linearTrend(points: { x: number; y: number }[]): Trend | null {
  const pts = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (pts.length < 3) return null;

  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p.x, 0) / n;
  const my = pts.reduce((a, p) => a + p.y, 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (const p of pts) {
    sxx += (p.x - mx) ** 2;
    sxy += (p.x - mx) * (p.y - my);
  }
  if (sxx === 0) return null;

  const slope = sxy / sxx;
  const intercept = my - slope * mx;

  let ssRes = 0;
  let ssTot = 0;
  for (const p of pts) {
    ssRes += (p.y - (slope * p.x + intercept)) ** 2;
    ssTot += (p.y - my) ** 2;
  }

  return {
    slope,
    intercept,
    r2: ssTot === 0 ? 1 : 1 - ssRes / ssTot,
    // n-2 gradi di libertà: la retta ne consuma due (pendenza e intercetta).
    residualSigma: Math.sqrt(ssRes / Math.max(1, n - 2)),
    n,
  };
}

/** La pendenza espressa per decennio — l'unità in cui si leggono i trend climatici. */
export function perDecade(trend: Trend): number {
  return trend.slope * 10;
}

/**
 * Estrapolazione della retta a un anno futuro, con banda a ±2σ dei residui.
 *
 * **Non è una proiezione climatica.** Prolunga una retta oltre i dati e basta:
 * non sa nulla di scenari di emissione, né di non linearità. Serve solo a dare
 * un ordine di grandezza, e va etichettata come estrapolazione ovunque venga
 * mostrata. Per una proiezione vera si usa la Climate API (CMIP6), vedi Fase 7c.
 */
export function extrapolate(trend: Trend, x: number): { value: number; lo: number; hi: number } {
  const value = trend.slope * x + trend.intercept;
  const band = 2 * trend.residualSigma;
  return { value, lo: value - band, hi: value + band };
}

/** Media della grandezza sul periodo di baseline. `null` se la baseline non è coperta dai dati. */
export function baselineMean(
  series: { year: number; value: number }[],
  from = BASELINE_FROM,
  to = BASELINE_TO,
): number | null {
  const inRange = series.filter((s) => s.year >= from && s.year <= to).map((s) => s.value);
  // Metà del periodo è il minimo per chiamarla "normale climatica": con pochi
  // anni si sta confrontando con il rumore, non con una baseline.
  if (inRange.length < (to - from + 1) / 2) return null;
  return mean(inRange);
}

/**
 * Fattore di Clausius-Clapeyron: quanto vapore acqueo in più può contenere
 * l'aria per un riscaldamento di `deltaC` gradi.
 *
 * ~+7% per °C è l'approssimazione standard della relazione alle temperature
 * tipiche della bassa troposfera. È **capacità**, non pioggia: dice quanta
 * energia e umidità sono disponibili, non che pioverà quella quantità in più.
 * Sul Mediterraneo l'intensificazione oraria osservata dei nubifragi è spesso
 * super-Clausius-Clapeyron, quindi questo numero è semmai un limite inferiore.
 */
export function vaporCapacityFactor(deltaC: number): number {
  return 1.07 ** deltaC;
}

/**
 * Co-occorrenza temporale fra due elenchi di eventi datati: quanti eventi di
 * `b` cadono entro `windowDays` da un evento di `a`.
 *
 * Serve a dire "questi due fenomeni si presentano insieme", che è un'osservazione
 * onesta. Non serve, e non va usato, per dire che uno causa l'altro: senza un
 * tasso di base non distingue una relazione da una coincidenza stagionale (in
 * agosto ci sono sia le ondate di calore sia gli incendi, per ragioni in parte
 * indipendenti).
 */
export function coOccurrence(a: string[], b: string[], windowDays: number): { matched: number; total: number } {
  const aTimes = a.map((d) => Date.parse(d)).filter(Number.isFinite);
  const bTimes = b.map((d) => Date.parse(d)).filter(Number.isFinite);
  const windowMs = windowDays * 86_400_000;
  const matched = bTimes.filter((t) => aTimes.some((s) => Math.abs(t - s) <= windowMs)).length;
  return { matched, total: bTimes.length };
}
