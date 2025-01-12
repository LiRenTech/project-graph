import { Vector } from "../Vector";
import { Line } from "./Line";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export class CublicCatmullRomSpline extends Shape {
  public controlPoints: Vector[];
  public alpha: number;
  public tension: number;

  constructor(
    controlPoints: Vector[],
    alpha: number = 0.5,
    tension: number = 0,
  ) {
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
      const b = p1
        .subtract(p2)
        .multiply(-3)
        .subtract(m1)
        .subtract(m1)
        .subtract(m2);
      const c = m1;
      const d = p1;

      const num = 20;
      const step = 1 / num;
      // for (let i = 0, t0 = 0; i < num; i++) {
      //   for (let left = t0, right = 1; ; ) {
      //     const t = left + (right - left) / 2;
      //     const point = a
      //       .multiply(t * t * t)
      //       .add(b.multiply(t * t))
      //       .add(c.multiply(t))
      //       .add(d);
      //     const error =
      //   }
      // }
      for (let t = step; t < 1; t += step) {
        const point = a
          .multiply(t * t * t)
          .add(b.multiply(t * t))
          .add(c.multiply(t))
          .add(d);
        result.push(point);
      }
      result.push(a.add(b).add(c).add(d));
    }
    return result;
  }

  isPointIn(point: Vector): boolean {
    throw new Error("Method not implemented." + point);
  }
  isCollideWithRectangle(rectangle: Rectangle): boolean {
    throw new Error("Method not implemented." + rectangle);
  }
  isCollideWithLine(line: Line): boolean {
    throw new Error("Method not implemented." + line);
  }
  getRectangle(): Rectangle {
    throw new Error("Method not implemented.");
  }
}
