import { describe, expect, it } from "vitest";
import { estimateCosts, estimateQuickWinPayback } from "./costs";
import type { City } from "../data/cities";

function city(overrides: Partial<City> = {}): City {
  return {
    name: "Test",
    lat: 41,
    lng: 12,
    population: 300000,
    coastal: false,
    region: "test",
    province: "TT",
    ...overrides,
  };
}

describe("estimateQuickWinPayback", () => {
  it("valore esatto noto", () => {
    expect(estimateQuickWinPayback(50, 30)).toBeCloseTo(79.365, 2);
  });

  it("roofM2 di default è 80", () => {
    expect(estimateQuickWinPayback(50, 30)).toBe(estimateQuickWinPayback(50, 30, 80));
  });

  it("un risparmio % maggiore accorcia il payback", () => {
    expect(estimateQuickWinPayback(50, 60)).toBeLessThan(estimateQuickWinPayback(50, 30));
  });
});

describe("estimateCosts", () => {
  it("valori esatti noti su una città di riferimento", () => {
    const result = estimateCosts(city(), 10, 10, 2);
    expect(result.greenCost).toBe(25000000);
    expect(result.albedoCost).toBe(200000000);
    expect(result.acSavePerHH).toBeCloseTo(20.16, 2);
    expect(result.paybackYears).toBe(86);
  });

  it("con riduzione UHI zero non divide per zero: risparmio zero, payback enorme ma finito", () => {
    const result = estimateCosts(city(), 10, 10, 0);
    expect(result.acSaveTotal).toBe(0);
    expect(Number.isFinite(result.paybackYears)).toBe(true);
    expect(result.paybackYears).toBeGreaterThan(0);
  });

  it("più verde/albedo costano di più, a parità di città", () => {
    const low = estimateCosts(city(), 5, 5, 2);
    const high = estimateCosts(city(), 20, 20, 2);
    expect(high.greenCost).toBeGreaterThan(low.greenCost);
    expect(high.albedoCost).toBeGreaterThan(low.albedoCost);
  });
});
