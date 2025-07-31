import { describe, it, expect } from "vitest";
import { CubicCatmullRomSpline, romberg } from "../src/CubicCatmullRomSpline";
import { Vector } from "@graphif/data-structures";

describe("CubicCatmullRomSpline CR曲线", () => {
  it("创建CR曲线", () => {
    const points = [new Vector(0, 0), new Vector(10, 20), new Vector(30, 40), new Vector(50, 60)];
    const spline = new CubicCatmullRomSpline(points);
    expect(spline.controlPoints.length).toBe(4);
  });

  it("当控制点少于4个时应抛出错误", () => {
    const points = [new Vector(0, 0), new Vector(10, 20), new Vector(30, 40)];
    expect(() => new CubicCatmullRomSpline(points)).toThrow("There must be at least 4 control points");
  });

  it("计算曲线路径", () => {
    const points = [new Vector(0, 0), new Vector(10, 0), new Vector(20, 0), new Vector(30, 0)];
    const spline = new CubicCatmullRomSpline(points);
    const path = spline.computePath();
    expect(path.length).toBeGreaterThan(1);
  });
});

describe("romberg 龙贝格积分", () => {
  it("计算函数在[0, 1]区间的积分", () => {
    const func = (x: number) => x * x;
    const result = romberg(func, 0.001);
    expect(result).toBeCloseTo(1 / 3, 3);
  });
});
