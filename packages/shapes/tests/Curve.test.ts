import { describe, it, expect } from "vitest";
import { CubicBezierCurve, SymmetryCurve } from "../src/Curve";
import { Vector } from "@graphif/data-structures";

describe("CubicBezierCurve 贝塞尔曲线", () => {
  it("创建贝塞尔曲线", () => {
    const curve = new CubicBezierCurve(new Vector(0, 0), new Vector(10, 20), new Vector(30, 40), new Vector(50, 60));
    expect(curve.start.x).toBe(0);
    expect(curve.ctrlPt1.y).toBe(20);
    expect(curve.ctrlPt2.x).toBe(30);
    expect(curve.end.y).toBe(60);
  });

  it("根据参数t获取曲线上的点", () => {
    const curve = new CubicBezierCurve(new Vector(0, 0), new Vector(0, 100), new Vector(100, 100), new Vector(100, 0));
    const point = curve.getPointByT(0.5);
    expect(point.x).toBe(50);
    expect(point.y).toBe(75);
  });
});

describe("SymmetryCurve 对称曲线", () => {
  it("创建对称曲线", () => {
    const curve = new SymmetryCurve(new Vector(0, 0), new Vector(1, 0), new Vector(100, 0), new Vector(-1, 0), 50);
    expect(curve.start.x).toBe(0);
    expect(curve.end.x).toBe(100);
    expect(curve.bending).toBe(50);
  });

  it("获取其对应的贝塞尔曲线", () => {
    const curve = new SymmetryCurve(new Vector(0, 0), new Vector(1, 0), new Vector(100, 0), new Vector(-1, 0), 50);
    const bezier = curve.bezier;
    expect(bezier.start.x).toBe(0);
    expect(bezier.ctrlPt1.x).toBe(50);
    expect(bezier.ctrlPt2.x).toBe(50);
    expect(bezier.end.x).toBe(100);
  });
});
