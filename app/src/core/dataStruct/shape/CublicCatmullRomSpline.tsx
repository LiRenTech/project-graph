import { NumericalIntegration } from "../../algorithm/numericalIntegration";
import { Vector } from "../Vector";
import { Line } from "./Line";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

/**
 * CR曲线形状
 */
export class CublicCatmullRomSpline extends Shape {
  public controlPoints: Vector[];
  public alpha: number;
  public tension: number;

  constructor(controlPoints: Vector[], alpha: number = 0.5, tension: number = 0) {
    super();
    if (controlPoints.length < 4) {
      throw new Error("There must be at least 4 control points");
    }
    this.controlPoints = controlPoints;
    this.alpha = alpha;
    this.tension = tension;
  }

  computePath(): Vector[] {
    const result = [this.controlPoints[1]];
    for (const funcs of this.computeFunction()) {
      const s = NumericalIntegration.romberg((t) => funcs.derivative(t).magnitude(), 0.5);
      const maxLength = 5; //每一小段的最大长度
      let num = 1;
      for (; s / num > maxLength; num++);
      for (let i = 0, t0 = 0; i < num - 1; i++) {
        for (let left = t0, right = 1; ; ) {
          const t = left + (right - left) / 2;
          const point = funcs.equation(t);
          const requiredError = 0.5;
          const dist = point.distance(result[result.length - 1]);
          const diff = dist - s / num;
          if (Math.abs(diff) < requiredError) {
            result.push(point);
            t0 = t;
            break;
          } else if (diff < 0) {
            left = t;
          } else {
            right = t;
          }
        }
      }
      result.push(funcs.equation(1));
    }
    return result;
  }

  private computeLines(): Line[] {
    const points = this.computePath();
    const result = [];
    for (let i = 1; i < points.length; i++) {
      result.push(new Line(points[i - 1], points[i]));
    }
    return result;
  }

  isPointIn(point: Vector): boolean {
    for (const line of this.computeLines()) {
      if (line.isPointIn(point)) {
        return true;
      }
    }
    return false;
  }
  isCollideWithRectangle(rectangle: Rectangle): boolean {
    for (const line of this.computeLines()) {
      if (line.isCollideWithRectangle(rectangle)) {
        return true;
      }
    }
    return false;
  }
  isCollideWithLine(line: Line): boolean {
    for (const l of this.computeLines()) {
      if (l.isCollideWithLine(line)) {
        return true;
      }
    }
    return false;
  }
  getRectangle(): Rectangle {
    const min = this.controlPoints[1].clone();
    const max = min.clone();
    for (const p of this.computePath()) {
      min.x = Math.min(min.x, p.x);
      min.y = Math.min(min.y, p.y);
      max.x = Math.max(max.x, p.x);
      max.y = Math.max(max.y, p.y);
    }
    return new Rectangle(min, max.subtract(min));
  }

  /**
   * 计算控制点所构成的曲线的参数方程和导数
   */
  private computeFunction(): Array<{
    equation: (t: number) => Vector;
    derivative: (t: number) => Vector;
  }> {
    const result = [];
    for (let i = 0; i + 4 <= this.controlPoints.length; i++) {
      const p0 = this.controlPoints[i];
      const p1 = this.controlPoints[i + 1];
      const p2 = this.controlPoints[i + 2];
      const p3 = this.controlPoints[i + 3];

      const t01 = Math.pow(p0.distance(p1), this.alpha);
      const t12 = Math.pow(p1.distance(p2), this.alpha);
      const t23 = Math.pow(p2.distance(p3), this.alpha);

      const m1 = p2
        .subtract(p1)
        .add(
          p1
            .subtract(p0)
            .divide(t01)
            .subtract(p2.subtract(p0).divide(t01 + t12))
            .multiply(t12),
        )
        .multiply(1 - this.tension);
      const m2 = p2
        .subtract(p1)
        .add(
          p3
            .subtract(p2)
            .divide(t23)
            .subtract(p3.subtract(p1).divide(t12 + t23))
            .multiply(t12),
        )
        .multiply(1 - this.tension);

      const a = p1.subtract(p2).multiply(2).add(m1).add(m2);
      const b = p1.subtract(p2).multiply(-3).subtract(m1).subtract(m1).subtract(m2);
      const c = m1;
      const d = p1;
      result.push({
        equation: (t: number) =>
          a
            .multiply(t * t * t)
            .add(b.multiply(t * t))
            .add(c.multiply(t))
            .add(d),
        derivative: (t: number) =>
          a
            .multiply(3 * t * t)
            .add(b.multiply(2 * t))
            .add(c),
      });
    }
    return result;
  }
}
