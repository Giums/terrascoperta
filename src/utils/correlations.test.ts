import { describe, expect, it } from "vitest";
import {
  baselineMean,
  coOccurrence,
  extrapolate,
  linearTrend,
  perDecade,
  vaporCapacityFactor,
  yearlyIndices,
  type DailySeries,
} from "./correlations";

/** Un anno intero di giorni sintetici, così da superare la soglia di copertura. */
function syntheticYear(
  year: number,
  fill: (dayIndex: number, iso: string) => { tmax: number | null; tmin: number | null; precipMm: number | null },
): DailySeries {
  const time: string[] = [];
  const tmax: (number | null)[] = [];
  const tmin: (number | null)[] = [];
  const precipMm: (number | null)[] = [];
  const cursor = new Date(Date.UTC(year, 0, 1));
  let i = 0;
  while (cursor.getUTCFullYear() === year) {
    const iso = cursor.toISOString().slice(0, 10);
    const v = fill(i, iso);
    time.push(iso);
    tmax.push(v.tmax);
    tmin.push(v.tmin);
    precipMm.push(v.precipMm);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    i++;
  }
  return { time, tmax, tmin, precipMm };
}

describe("yearlyIndices", () => {
  it("conta giorni caldi, notti tropicali, pioggia massima e siccità più lunga", () => {
    // 10 giorni a 36 °C / minima 21 °C, il resto mite. Piove 5 mm il primo
    // giorno e 40 mm il decimo; tutto il resto dell'anno è secco.
    const series = syntheticYear(2024, (i) => ({
      tmax: i < 10 ? 36 : 20,
      tmin: i < 10 ? 21 : 10,
      precipMm: i === 0 ? 5 : i === 9 ? 40 : 0,
    }));
    const [y] = yearlyIndices(series);

    expect(y.year).toBe(2024);
    expect(y.days).toBe(366); // 2024 è bisestile
    expect(y.hotDays).toBe(10);
    expect(y.tropicalNights).toBe(10);
    expect(y.maxDailyRainMm).toBe(40);
    expect(y.totalRainMm).toBe(45);
    // Secco dal giorno 1 (indice 1) al giorno 8 = 8 giorni, poi piove;
    // poi dal giorno 10 alla fine dell'anno = 366 - 10 = 356 giorni.
    expect(y.longestDrySpell).toBe(356);
  });

  it("le soglie sono inclusive (≥ 35 °C, ≥ 20 °C)", () => {
    const series = syntheticYear(2023, () => ({ tmax: 35, tmin: 20, precipMm: 0 }));
    const [y] = yearlyIndices(series);
    expect(y.hotDays).toBe(365);
    expect(y.tropicalNights).toBe(365);
  });

  it("scarta un anno parziale invece di restituirlo a zero", () => {
    const full = syntheticYear(2023, () => ({ tmax: 36, tmin: 21, precipMm: 0 }));
    // Solo i primi 100 giorni del 2024 in coda: sotto la soglia dell'80%.
    const partial = syntheticYear(2024, () => ({ tmax: 36, tmin: 21, precipMm: 0 }));
    const merged: DailySeries = {
      time: [...full.time, ...partial.time.slice(0, 100)],
      tmax: [...full.tmax, ...partial.tmax.slice(0, 100)],
      tmin: [...full.tmin, ...partial.tmin.slice(0, 100)],
      precipMm: [...full.precipMm, ...partial.precipMm.slice(0, 100)],
    };
    expect(yearlyIndices(merged).map((y) => y.year)).toEqual([2023]);
  });

  it("un buco nella pioggia non spezza né allunga lo spell secco", () => {
    // Secco per 50 giorni, un giorno senza misura, poi ancora secco.
    const series = syntheticYear(2023, (i) => ({
      tmax: 20,
      tmin: 10,
      precipMm: i === 50 ? null : i < 100 ? 0 : 5,
    }));
    const [y] = yearlyIndices(series);
    // 99 giorni secchi misurati (0-99 meno il buco), lo spell li conta tutti di fila.
    expect(y.longestDrySpell).toBe(99);
  });
});

describe("linearTrend", () => {
  it("su punti esattamente allineati ritrova la retta senza residui", () => {
    const t = linearTrend([1, 2, 3, 4, 5].map((x) => ({ x, y: 2 * x + 1 })));
    expect(t).not.toBeNull();
    expect(t!.slope).toBeCloseTo(2, 12);
    expect(t!.intercept).toBeCloseTo(1, 12);
    expect(t!.r2).toBeCloseTo(1, 12);
    expect(t!.residualSigma).toBeCloseTo(0, 12);
    expect(t!.n).toBe(5);
  });

  it("restituisce null sotto i tre punti", () => {
    expect(linearTrend([{ x: 1, y: 1 }, { x: 2, y: 2 }])).toBeNull();
  });

  it("restituisce null se le x sono tutte uguali (pendenza indefinita)", () => {
    expect(linearTrend([1, 2, 3].map((y) => ({ x: 5, y })))).toBeNull();
  });

  it("perDecade converte la pendenza annua in gradi per decennio", () => {
    // +0,03 °C/anno = +0,3 °C/decennio, l'ordine di grandezza dei trend reali.
    const t = linearTrend([2000, 2001, 2002, 2003].map((x) => ({ x, y: 0.03 * x })));
    expect(perDecade(t!)).toBeCloseTo(0.3, 10);
  });

  it("ignora i punti non finiti invece di propagare NaN", () => {
    const t = linearTrend([
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 3, y: 7 },
      { x: 4, y: Number.NaN },
    ]);
    expect(t!.n).toBe(3);
    expect(t!.slope).toBeCloseTo(2, 12);
  });
});

describe("extrapolate", () => {
  it("su una retta perfetta la banda è nulla e il valore è quello della retta", () => {
    const t = linearTrend([1, 2, 3, 4].map((x) => ({ x, y: 2 * x + 1 })))!;
    const p = extrapolate(t, 10);
    expect(p.value).toBeCloseTo(21, 10);
    expect(p.lo).toBeCloseTo(21, 10);
    expect(p.hi).toBeCloseTo(21, 10);
  });

  it("la banda è simmetrica e larga 4σ dei residui", () => {
    const t = linearTrend([
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
      { x: 4, y: 4 },
    ])!;
    const p = extrapolate(t, 5);
    expect(p.hi - p.lo).toBeCloseTo(4 * t.residualSigma, 10);
    expect(p.value - p.lo).toBeCloseTo(p.hi - p.value, 10);
  });
});

describe("baselineMean", () => {
  const series = Array.from({ length: 60 }, (_, i) => ({ year: 1961 + i, value: i }));

  it("media solo gli anni dentro il trentennio di riferimento", () => {
    // 1961-1990 sono i valori 0..29, media 14,5.
    expect(baselineMean(series)).toBeCloseTo(14.5, 10);
  });

  it("null se la baseline è coperta per meno di metà", () => {
    const scarce = series.filter((s) => s.year >= 1985);
    expect(baselineMean(scarce)).toBeNull();
  });
});

describe("vaporCapacityFactor", () => {
  it("+1 °C vale circa +7% di vapore acqueo", () => {
    expect(vaporCapacityFactor(1)).toBeCloseTo(1.07, 10);
  });

  it("è composto, non lineare: +2 °C vale +14,49%, non +14%", () => {
    expect(vaporCapacityFactor(2)).toBeCloseTo(1.1449, 10);
  });

  it("un'anomalia nulla lascia il fattore a 1", () => {
    expect(vaporCapacityFactor(0)).toBe(1);
  });
});

describe("coOccurrence", () => {
  it("conta gli eventi di b che cadono nella finestra attorno a uno di a", () => {
    const heat = ["2024-07-20", "2024-08-10"];
    const fires = ["2024-07-22", "2024-08-09", "2024-11-01"];
    expect(coOccurrence(heat, fires, 3)).toEqual({ matched: 2, total: 3 });
  });

  it("la finestra è inclusiva agli estremi", () => {
    expect(coOccurrence(["2024-07-20"], ["2024-07-23"], 3).matched).toBe(1);
    expect(coOccurrence(["2024-07-20"], ["2024-07-24"], 3).matched).toBe(0);
  });

  it("senza eventi in a non trova nulla, e non divide per zero", () => {
    expect(coOccurrence([], ["2024-07-22"], 3)).toEqual({ matched: 0, total: 1 });
  });
});
