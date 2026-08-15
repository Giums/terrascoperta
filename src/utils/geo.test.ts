import { describe, expect, it } from "vitest";
import { haversineKm, nearestCity } from "./geo";
import type { City } from "../data/cities";

function city(name: string, lat: number, lng: number): City {
  return { name, lat, lng, population: 100000, coastal: false, region: "test", province: "TT" };
}

describe("haversineKm", () => {
  it("è zero per lo stesso punto", () => {
    expect(haversineKm(41.9, 12.5, 41.9, 12.5)).toBe(0);
  });

  it("Roma-Milano è circa 480km (valore reale noto)", () => {
    const km = haversineKm(41.9028, 12.4964, 45.4642, 9.19);
    expect(km).toBeGreaterThan(470);
    expect(km).toBeLessThan(490);
  });

  it("è simmetrica", () => {
    const a = haversineKm(41.9, 12.5, 45.5, 9.2);
    const b = haversineKm(45.5, 9.2, 41.9, 12.5);
    expect(a).toBeCloseTo(b, 10);
  });
});

describe("nearestCity", () => {
  it("sceglie la città più vicina, non la prima della lista", () => {
    const cities = [city("Lontana", 10, 10), city("Vicina", 41.91, 12.51), city("Media", 40, 15)];
    const { city: nearest, distanceKm } = nearestCity(41.9, 12.5, cities);
    expect(nearest.name).toBe("Vicina");
    expect(distanceKm).toBeLessThan(5);
  });

  it("con una sola città in lista restituisce quella", () => {
    const cities = [city("Unica", 0, 0)];
    const { city: nearest } = nearestCity(50, 50, cities);
    expect(nearest.name).toBe("Unica");
  });
});
