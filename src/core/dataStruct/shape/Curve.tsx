import { Shape } from "./Shape";
import { Vector } from "../Vector";

/**
 * 贝塞尔曲线
 */
export class CubicBezierCurve extends Shape {
  constructor(
    public start: Vector,
    public ctrlPt1: Vector,
    public ctrlPt2: Vector,
    public end: Vector,
  ) {
    super();
  }

  toString(): string {
    return `SymmetryCurve(start:${this.start}, ctrlPt1:${this.ctrlPt1}, ctrlPt2:${this.ctrlPt2}, end:${this.end})`;
  }
}

/**
 * 对称曲线
 */
export class SymmetryCurve extends Shape {
  constructor(
    public start: Vector,
    public startDirection: Vector,
    public end: Vector,
    public endDirection: Vector,
    public bending: number,
  ) {
    super();
  }

  get bezier(): CubicBezierCurve {
    return new CubicBezierCurve(
      this.start,
      this.startDirection.normalize().multiply(this.bending).add(this.start),
      this.endDirection.normalize().multiply(this.bending).add(this.end),
      this.end,
    );
  }

  toString(): string {
    return `SymmetryCurve(start:${this.start}, startDirection:${this.startDirection}, end:${this.end}, endDirection:${this.endDirection}, bending:${this.bending})`;
  }
}
