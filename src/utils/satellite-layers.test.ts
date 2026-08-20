import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SENTINEL_LAYERS,
  defaultLayerDate,
  latestLayerDate,
  layerMinZoom,
  sentinelTimeRange,
  todayMinus,
} from "./satellite-layers";

describe("sentinelTimeRange", () => {
  it("sottrae i giorni di lookback dalla data data", () => {
    expect(sentinelTimeRange("2026-08-15", 13)).toBe("2026-08-02/2026-08-15");
  });

  it("gestisce correttamente il cambio mese", () => {
    expect(sentinelTimeRange("2026-03-05", 13)).toBe("2026-02-20/2026-03-05");
  });

  it("con lookback 0 restituisce la stessa data due volte", () => {
    expect(sentinelTimeRange("2026-08-15", 0)).toBe("2026-08-15/2026-08-15");
  });
});

describe("layerMinZoom", () => {
  it("nessun limite di zoom quando il layer è 'none'", () => {
    expect(layerMinZoom("none")).toBeUndefined();
  });

  it("i layer Sentinel-2 hanno un minZoom definito (limite WMS 1500m/pixel)", () => {
    expect(layerMinZoom("s2-true-color")).toBe(6);
  });
});

describe("finestra temporale selezionabile", () => {
  // Orario volutamente pomeridiano: `todayMinus` passa da `toISOString` (UTC) e
  // a mezzanotte locale in ora legale italiana il giorno UTC sarebbe il
  // precedente, rendendo il test dipendente dal fuso della macchina.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-20T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("il massimo selezionabile è oggi, non due giorni fa", () => {
    expect(latestLayerDate()).toBe("2026-08-20");
  });

  it("il default è ieri", () => {
    expect(defaultLayerDate()).toBe("2026-08-19");
  });

  it("todayMinus attraversa il confine di mese", () => {
    vi.setSystemTime(new Date("2026-03-02T12:00:00Z"));
    expect(todayMinus(5)).toBe("2026-02-25");
  });

  // Regressione del bug corretto in Fase 7a: con la fine finestra a `today-2` e
  // `lookbackDays: 2`, la finestra S5P era `today-4 → today-2` e il pennacchio
  // del giorno prima non era raggiungibile per costruzione.
  it("la finestra S5P al massimo dello slider include ieri", () => {
    const range = sentinelTimeRange(latestLayerDate(), SENTINEL_LAYERS["s5p-so2"].lookbackDays);
    expect(range).toBe("2026-08-18/2026-08-20");
  });
});
