import { describe, it, expect } from "vitest";
import { Circle } from "../src/Circle";
import { Vector } from "@graphif/data-structures";
import { Rectangle } from "../src/Rectangle";
import { Line } from "../src/Line";

describe("Circle 圆形", () => {
  it("创建圆形", () => {
    const circle = new Circle(new Vector(10, 20), 5);
    expect(circle.location.x).toBe(10);
    expect(circle.location.y).toBe(20);
    expect(circle.radius).toBe(5);
  });

  it("判断点是否在圆形内", () => {
    const circle = new Circle(new Vector(0, 0), 10);
    expect(circle.isPointIn(new Vector(5, 5))).toBe(true);
    expect(circle.isPointIn(new Vector(10, 0))).toBe(true);
    expect(circle.isPointIn(new Vector(11, 0))).toBe(false);
  });

  it("检测与矩形的碰撞", () => {
    const circle = new Circle(new Vector(5, 5), 3);
    const rectangle1 = new Rectangle(new Vector(0, 0), new Vector(10, 10));
    const rectangle2 = new Rectangle(new Vector(10, 10), new Vector(5, 5));
    expect(circle.isCollideWithRectangle(rectangle1)).toBe(true);
    expect(circle.isCollideWithRectangle(rectangle2)).toBe(false);
  });

  it("检测与线段的碰撞", () => {
    const circle = new Circle(new Vector(0, 0), 5);
    const line1 = new Line(new Vector(-10, 0), new Vector(10, 0));
    const line2 = new Line(new Vector(6, 0), new Vector(10, 0));
    expect(circle.isCollideWithLine(line1)).toBe(true);
    expect(circle.isCollideWithLine(line2)).toBe(false);
  });

  it("获取外接矩形", () => {
    const circle = new Circle(new Vector(10, 10), 5);
    const rectangle = circle.getRectangle();
    expect(rectangle.location.x).toBe(5);
    expect(rectangle.location.y).toBe(5);
    expect(rectangle.size.x).toBe(10);
    expect(rectangle.size.y).toBe(10);
  });
});
