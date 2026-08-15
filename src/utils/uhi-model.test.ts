import { describe, expect, it } from "vitest";
import { estimateUHI, uhiColor } from "./uhi-model";
import type { City } from "../data/cities";

function city(overrides: Partial<City>): City {
  return {
    name: "Test",
    lat: 41,
    lng: 12,
    population: 200000,
    coastal: false,
    region: "test",
    province: "TT",
    ...overrides,
  };
}

describe("estimateUHI", () => {
  it("non scende mai sotto lo 0.3 di floor", () => {
    expect(estimateUHI(city({ population: 1000, coastal: false }))).toBe(0.3);
    expect(estimateUHI(city({ population: 1000, coastal: true }))).toBe(0.3);
  });

  it("cresce con la popolazione, a parità di altri fattori", () => {
    const small = estimateUHI(city({ population: 100000 }));
    const big = estimateUHI(city({ population: 1000000 }));
    expect(big).toBeGreaterThan(small);
  });

  it("una città costiera ha UHI più bassa della stessa città non costiera", () => {
    const inland = estimateUHI(city({ population: 500000, coastal: false }));
    const coastal = estimateUHI(city({ population: 500000, coastal: true }));
    expect(coastal).toBeLessThan(inland);
  });

  it("il bonus Pianura Padana si applica solo dentro il riquadro lat/lng definito", () => {
    const inPoValley = estimateUHI(city({ lat: 45.07, lng: 7.69, population: 848196 }));
    const sameCityNoBonus = estimateUHI(city({ lat: 45.07, lng: 20, population: 848196 }));
    expect(inPoValley).toBeGreaterThan(sameCityNoBonus);
  });

  it("valore esatto noto (Torino, calcolato e verificato una volta)", () => {
    expect(estimateUHI(city({ lat: 45.07, lng: 7.69, population: 848196, coastal: false }))).toBe(2.9);
  });
});

describe("uhiColor", () => {
  it("assegna colori diversi a fasce diverse", () => {
    expect(uhiColor(1)).not.toBe(uhiColor(3));
    expect(uhiColor(3)).not.toBe(uhiColor(5));
  });

  it("è monotona: non torna a un colore già usato salendo di intensità", () => {
    const colors = [0.5, 2, 3, 4, 5].map(uhiColor);
    expect(new Set(colors).size).toBe(colors.length);
  });
});
