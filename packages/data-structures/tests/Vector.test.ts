import { Vector } from "../src/Vector";
import { describe, it, expect } from "vitest";

describe("Vector 向量", () => {
  it("构造和静态创建", () => {
    const v = new Vector(3, 4);
    expect(v.x).toBe(3);
    expect(v.y).toBe(4);

    const zero = Vector.getZero();
    expect(zero.x).toBe(0);
    expect(zero.y).toBe(0);

    const fromAngle = Vector.fromAngle(Math.PI / 2); // 90 degrees
    expect(fromAngle.x).toBeCloseTo(0);
    expect(fromAngle.y).toBeCloseTo(1);

    const fromDeg = Vector.fromDegrees(180);
    expect(fromDeg.x).toBeCloseTo(-1);
    expect(fromDeg.y).toBeCloseTo(0);

    const p1 = new Vector(1, 1);
    const p2 = new Vector(4, 5);
    const fromPoints = Vector.fromTwoPoints(p1, p2);
    expect(fromPoints.x).toBe(3);
    expect(fromPoints.y).toBe(4);
  });

  it("基本运算", () => {
    const v1 = new Vector(1, 2);
    const v2 = new Vector(3, 4);

    const add = v1.add(v2);
    expect(add.x).toBe(4);
    expect(add.y).toBe(6);

    const sub = v1.subtract(v2);
    expect(sub.x).toBe(-2);
    expect(sub.y).toBe(-2);

    const mul = v1.multiply(3);
    expect(mul.x).toBe(3);
    expect(mul.y).toBe(6);

    const div = v2.divide(2);
    expect(div.x).toBe(1.5);
    expect(div.y).toBe(2);

    const divByZero = v2.divide(0);
    expect(divByZero.isZero()).toBe(true);
  });

  it("模长和归一化", () => {
    const v = new Vector(3, 4);
    expect(v.magnitude()).toBe(5);

    const normalized = v.normalize();
    expect(normalized.x).toBe(0.6);
    expect(normalized.y).toBe(0.8);
    expect(normalized.magnitude()).toBeCloseTo(1);

    const zero = Vector.getZero();
    expect(zero.normalize().isZero()).toBe(true);
  });

  it("点积和叉积", () => {
    const v1 = new Vector(1, 2);
    const v2 = new Vector(3, 4);
    expect(v1.dot(v2)).toBe(11); // 1*3 + 2*4
    expect(v1.cross(v2)).toBe(-2); // 1*4 - 2*3
  });

  it("旋转", () => {
    const v = new Vector(1, 0);
    const rotated = v.rotate(Math.PI / 2); // 90 degrees
    expect(rotated.x).toBeCloseTo(0);
    expect(rotated.y).toBeCloseTo(1);

    const rotatedDeg = v.rotateDegrees(-90);
    expect(rotatedDeg.x).toBeCloseTo(0);
    expect(rotatedDeg.y).toBeCloseTo(-1);
  });

  it("角度计算", () => {
    const v1 = new Vector(1, 0);
    const v2 = new Vector(0, 1);
    expect(v1.angle(v2)).toBeCloseTo(Math.PI / 2);
    expect(v1.angleTo(v2)).toBeCloseTo(90);
    expect(v1.angleToSigned(v2)).toBeCloseTo(90);
    expect(v2.angleToSigned(v1)).toBeCloseTo(-90);
    expect(new Vector(1, 1).toDegrees()).toBeCloseTo(45);
  });

  it("距离计算", () => {
    const v1 = new Vector(1, 1);
    const v2 = new Vector(4, 5);
    expect(v1.distance(v2)).toBe(5);
  });

  it("比较", () => {
    const v1 = new Vector(1, 2);
    const v2 = new Vector(1, 2);
    const v3 = new Vector(2, 3);
    expect(v1.equals(v2)).toBe(true);
    expect(v1.equals(v3)).toBe(false);
    expect(v1.nearlyEqual(new Vector(1.01, 1.99), 0.02)).toBe(true);
    expect(Vector.getZero().isZero()).toBe(true);
  });

  it("克隆", () => {
    const v1 = new Vector(1, 2);
    const v2 = v1.clone();
    expect(v1).not.toBe(v2);
    expect(v1.equals(v2)).toBe(true);
  });
});
