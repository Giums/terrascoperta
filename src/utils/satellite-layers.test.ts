import { describe, expect, it } from "vitest";
import { layerMinZoom, sentinelTimeRange } from "./satellite-layers";

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
