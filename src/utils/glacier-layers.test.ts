import { describe, expect, it } from "vitest";
import { hasGlaciersNearby, glacierTileUrl, GLACIER_EPOCHS } from "./glacier-layers";

describe("hasGlaciersNearby", () => {
  it("riconosce le zone glaciali alpine", () => {
    expect(hasGlaciersNearby(46.165, 10.53)).toBe(true); // Adamello
    expect(hasGlaciersNearby(45.83, 6.86)).toBe(true); // Monte Bianco
    expect(hasGlaciersNearby(46.44, 11.85)).toBe(true); // Marmolada
  });

  // L'unico ghiacciaio appenninico: se questo bbox sparisse, il Gran Sasso
  // resterebbe senza controllo pur avendo un ghiacciaio.
  it("include il Calderone sul Gran Sasso", () => {
    expect(hasGlaciersNearby(42.47, 13.56)).toBe(true);
  });

  it("esclude dove ghiacciai non ce ne sono", () => {
    expect(hasGlaciersNearby(41.9, 12.5)).toBe(false); // Roma
    expect(hasGlaciersNearby(37.5, 15.08)).toBe(false); // Catania
    expect(hasGlaciersNearby(40.0, 13.5)).toBe(false); // Tirreno, al largo
  });
});

describe("glacierTileUrl", () => {
  it("filtra per l'epoca richiesta", () => {
    expect(glacierTileUrl("historic")).toContain(GLACIER_EPOCHS.historic.from);
    expect(glacierTileUrl("recent")).toContain(GLACIER_EPOCHS.recent.from);
  });

  it("lascia il segnaposto bbox che MapLibre sostituisce", () => {
    expect(glacierTileUrl("recent")).toContain("{bbox-epsg-3857}");
  });
});
