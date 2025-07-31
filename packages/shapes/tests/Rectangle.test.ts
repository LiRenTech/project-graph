import { Vector } from "@graphif/data-structures";
import { describe, expect, it } from "vitest";
import { Rectangle } from "../src/Rectangle";

describe("Rectangle 矩形", () => {
  it("创建矩形", () => {
    const rect = new Rectangle(new Vector(10, 20), new Vector(30, 40));
    expect(rect.location.x).toBe(10);
    expect(rect.location.y).toBe(20);
    expect(rect.size.x).toBe(30);
    expect(rect.size.y).toBe(40);
  });

  it("获取矩形的各种属性", () => {
    const rect = new Rectangle(new Vector(10, 20), new Vector(30, 40));
    expect(rect.left).toBe(10);
    expect(rect.top).toBe(20);
    expect(rect.right).toBe(40);
    expect(rect.bottom).toBe(60);
    expect(rect.width).toBe(30);
    expect(rect.height).toBe(40);
    expect(rect.center.x).toBe(25);
    expect(rect.center.y).toBe(40);
  });

  it("判断点是否在矩形内", () => {
    const rect = new Rectangle(new Vector(0, 0), new Vector(10, 10));
    expect(rect.isPointIn(new Vector(5, 5))).toBe(true);
    expect(rect.isPointIn(new Vector(10, 10))).toBe(true);
    expect(rect.isPointIn(new Vector(11, 5))).toBe(false);
  });

  it("检测与另一个矩形的碰撞", () => {
    const rect1 = new Rectangle(new Vector(0, 0), new Vector(10, 10));
    const rect2 = new Rectangle(new Vector(5, 5), new Vector(10, 10));
    const rect3 = new Rectangle(new Vector(11, 11), new Vector(10, 10));
    expect(rect1.isCollideWith(rect2)).toBe(true);
    expect(rect1.isCollideWith(rect3)).toBe(false);
  });

  it("从两条边创建矩形", () => {
    const rect = Rectangle.fromEdges(10, 20, 40, 60);
    expect(rect.location.x).toBe(10);
    expect(rect.location.y).toBe(20);
    expect(rect.size.x).toBe(30);
    expect(rect.size.y).toBe(40);
  });

  it("从两个点创建矩形", () => {
    const rect = Rectangle.fromTwoPoints(new Vector(10, 20), new Vector(40, 60));
    expect(rect.location.x).toBe(10);
    expect(rect.location.y).toBe(20);
    expect(rect.size.x).toBe(30);
    expect(rect.size.y).toBe(40);
  });

  it("获取多个矩形的最小外接矩形", () => {
    const rects = [
      new Rectangle(new Vector(0, 0), new Vector(10, 10)),
      new Rectangle(new Vector(20, 20), new Vector(10, 10)),
    ];
    const boundingRect = Rectangle.getBoundingRectangle(rects);
    expect(boundingRect.location.x).toBe(0);
    expect(boundingRect.location.y).toBe(0);
    expect(boundingRect.size.x).toBe(30);
    expect(boundingRect.size.y).toBe(30);
  });

  it("获取矩形的四条边", () => {
    const rect = new Rectangle(new Vector(10, 20), new Vector(30, 40));
    const lines = rect.getBoundingLines();
    expect(lines.length).toBe(4);
    // top
    expect(lines[0].start.x).toBe(10);
    expect(lines[0].start.y).toBe(20);
    expect(lines[0].end.x).toBe(40);
    expect(lines[0].end.y).toBe(20);
    // right
    expect(lines[1].start.x).toBe(40);
    expect(lines[1].start.y).toBe(20);
    expect(lines[1].end.x).toBe(40);
    expect(lines[1].end.y).toBe(60);
    // bottom
    expect(lines[2].start.x).toBe(40);
    expect(lines[2].start.y).toBe(60);
    expect(lines[2].end.x).toBe(10);
    expect(lines[2].end.y).toBe(60);
    // left
    expect(lines[3].start.x).toBe(10);
    expect(lines[3].start.y).toBe(60);
    expect(lines[3].end.x).toBe(10);
    expect(lines[3].end.y).toBe(20);
  });
});
