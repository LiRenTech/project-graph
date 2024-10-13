import { Vector } from "./Vector";


export class CubicBezierCurve {
  constructor(
    public start: Vector,
    public ctrlPt1: Vector,
    public ctrlPt2: Vector,
    public end: Vector
  ) { }

  toString(): string {
    return `SymmetryCurve(start:${this.start}, ctrlPt1:${this.ctrlPt1}, ctrlPt2:${this.ctrlPt2}, end:${this.end})`;
  }
};

export class SymmetryCurve {

  constructor(
    public start: Vector,
    public startDirection: Vector,
    public end: Vector,
    public endDirection: Vector,
    public bending: number,
  ) { }

  get bezier(): CubicBezierCurve {
    return new CubicBezierCurve(
      this.start,
      this.startDirection.normalize().multiply(this.bending).add(this.start),
      this.endDirection.normalize().multiply(this.bending).add(this.end),
      this.end);
  }

  toString(): string {
    return `SymmetryCurve(start:${this.start}, startDirection:${this.startDirection}, end:${this.end}, endDirection:${this.endDirection}, bending:${this.bending})`;
  }

}