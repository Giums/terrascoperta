import { describe, expect, it } from "vitest";
import { sstTileUrl, SST_MIN_YEAR, SST_SCALE_C } from "./marine-layers";

function timeParam(url: string): string {
  return decodeURIComponent(new URL(url).searchParams.get("time") ?? "");
}

describe("sstTileUrl", () => {
  it("mantiene i placeholder che MapLibre sostituisce col tile richiesto", () => {
    const url = sstTileUrl("2000-07-15");
    expect(url).toContain("TileMatrix={z}");
    expect(url).toContain("TileRow={y}");
    expect(url).toContain("TileCol={x}");
  });

  it("lascia intatta una data storica", () => {
    expect(timeParam(sstTileUrl("1985-07-15"))).toBe("1985-07-15T00:00:00.000Z");
  });

  // Il prodotto è riprocessato, non in tempo reale: chiedere oggi darebbe tile
  // vuoti, che sembrerebbero un layer rotto invece che un dato non ancora
  // pubblicato.
  it("arretra una data troppo recente entro la latenza del dataset", () => {
    const today = new Date().toISOString().slice(0, 10);
    const asked = new Date(`${today}T00:00:00Z`).getTime();
    const got = new Date(timeParam(sstTileUrl(today))).getTime();
    const daysBack = (asked - got) / 86_400_000;
    expect(daysBack).toBeGreaterThanOrEqual(35);
    expect(daysBack).toBeLessThanOrEqual(45);
  });

  it("espone la scala coerente con la legenda ufficiale del layer", () => {
    expect(SST_MIN_YEAR).toBe(1982);
    expect(SST_SCALE_C.min).toBeLessThan(SST_SCALE_C.max);
  });
});
