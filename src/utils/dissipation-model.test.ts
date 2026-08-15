import { describe, expect, it } from "vitest";
import { dissipationCurve, estimatePVYieldGainPct, peakSurfaceTemps } from "./dissipation-model";

describe("peakSurfaceTemps", () => {
  it("senza interventi, il picco mitigato coincide col baseline", () => {
    const { baseline, mitigated } = peakSurfaceTemps(0, 0);
    expect(mitigated).toBe(baseline);
  });

  it("valore esatto noto con interventi al 50%", () => {
    const { baseline, mitigated } = peakSurfaceTemps(50, 50);
    expect(baseline).toBe(78);
    expect(mitigated).toBeCloseTo(32.85, 5);
  });

  it("più mitigazione abbassa sempre il picco, mai lo alza", () => {
    const low = peakSurfaceTemps(10, 10).mitigated;
    const high = peakSurfaceTemps(40, 40).mitigated;
    expect(high).toBeLessThan(low);
  });
});

describe("dissipationCurve", () => {
  it("copre 25 punti, ore 0-24 incluse", () => {
    const points = dissipationCurve(20, 20);
    expect(points).toHaveLength(25);
    expect(points[0].hour).toBe(0);
    expect(points[24].hour).toBe(24);
  });

  it("il picco (ore 14) è sempre il punto più caldo della curva baseline", () => {
    const points = dissipationCurve(20, 20);
    const peakPoint = points.find((p) => p.hour === 14)!;
    for (const p of points) {
      expect(p.baseline).toBeLessThanOrEqual(peakPoint.baseline + 1e-9);
    }
  });

  it("la curva mitigata resta sempre sotto o uguale alla baseline", () => {
    const points = dissipationCurve(30, 30);
    for (const p of points) {
      expect(p.mitigated).toBeLessThanOrEqual(p.baseline + 1e-9);
    }
  });
});

describe("estimatePVYieldGainPct", () => {
  it("senza interventi non c'è guadagno di resa", () => {
    expect(estimatePVYieldGainPct(0, 0)).toBe(0);
  });

  it("valore esatto noto con interventi al 50%", () => {
    expect(estimatePVYieldGainPct(50, 50)).toBeCloseTo(4.515, 3);
  });

  it("più mitigazione non riduce mai il guadagno di resa", () => {
    const low = estimatePVYieldGainPct(10, 10);
    const high = estimatePVYieldGainPct(40, 40);
    expect(high).toBeGreaterThan(low);
  });
});
