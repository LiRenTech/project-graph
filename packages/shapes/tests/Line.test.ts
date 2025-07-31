import { describe, it, expect } from "vitest";
import { Line } from "../src/Line";
import { Vector } from "@graphif/data-structures";
import { Circle } from "../src/Circle";

describe("Line 线段", () => {
  it("创建线段", () => {
    const line = new Line(new Vector(10, 20), new Vector(30, 40));
    expect(line.start.x).toBe(10);
    expect(line.start.y).toBe(20);
    expect(line.end.x).toBe(30);
    expect(line.end.y).toBe(40);
  });

  it("计算线段长度", () => {
    const line = new Line(new Vector(0, 0), new Vector(3, 4));
    expect(line.length()).toBe(5);
  });

  it("计算线段中点", () => {
    const line = new Line(new Vector(10, 20), new Vector(30, 40));
    const midPoint = line.midPoint();
    expect(midPoint.x).toBe(20);
    expect(midPoint.y).toBe(30);
  });

  it("判断点是否在线段附近", () => {
    const line = new Line(new Vector(0, 0), new Vector(10, 10));
    expect(line.isPointNearLine(new Vector(5, 5))).toBe(true);
    expect(line.isPointNearLine(new Vector(11, 11), 2)).toBe(true);
    expect(line.isPointNearLine(new Vector(12, 12), 1)).toBe(false);
  });

  it("检测与另一条线段是否相交", () => {
    const line1 = new Line(new Vector(0, 0), new Vector(10, 10));
    const line2 = new Line(new Vector(0, 10), new Vector(10, 0));
    const line3 = new Line(new Vector(11, 11), new Vector(20, 20));
    expect(line1.isIntersecting(line2)).toBe(true);
    expect(line1.isIntersecting(line3)).toBe(false);
  });

  it("获取与另一条线段的交点", () => {
    const line1 = new Line(new Vector(0, 0), new Vector(10, 10));
    const line2 = new Line(new Vector(0, 10), new Vector(10, 0));
    const intersection = line1.getIntersection(line2);
    expect(intersection).not.toBeNull();
    if (intersection) {
      expect(intersection.x).toBe(5);
      expect(intersection.y).toBe(5);
    }
  });

  it("检测与圆形的碰撞", () => {
    const line1 = new Line(new Vector(-10, 0), new Vector(10, 0));
    const line2 = new Line(new Vector(6, 0), new Vector(10, 0));
    const circle = new Circle(new Vector(0, 0), 5);
    expect(line1.isIntersectingWithCircle(circle)).toBe(true);
    expect(line2.isIntersectingWithCircle(circle)).toBe(false);
  });
});
