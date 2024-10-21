import { Shape } from "./Shape";
import { Vector } from "../Vector";
import { Rectangle } from "./Rectangle";
import { Line } from "./Line";

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

  isPointIn(point: Vector): boolean {
    console.log(point);
    return false;
  }
  isCollideWithRectangle(rectangle: Rectangle): boolean {
    console.log(rectangle);
    return false;
  }
  isCollideWithLine(line: Line): boolean {
    console.log(line);
    return false;
  }
  getRectangle(): Rectangle {
    let minX = Math.min(
      this.start.x,
      this.ctrlPt1.x,
      this.ctrlPt2.x,
      this.end.x,
    );
    let maxX = Math.max(
      this.start.x,
      this.ctrlPt1.x,
      this.ctrlPt2.x,
      this.end.x,
    );
    let minY = Math.min(
      this.start.y,
      this.ctrlPt1.y,
      this.ctrlPt2.y,
      this.end.y,
    );
    let maxY = Math.max(
      this.start.y,
      this.ctrlPt1.y,
      this.ctrlPt2.y,
      this.end.y,
    );
    const leftTop = new Vector(minX, minY);
    const size = new Vector(maxX - minX, maxY - minY);
    return new Rectangle(leftTop, size);
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

  isPointIn(point: Vector): boolean {
    console.log(point);
    return false;
  }
  isCollideWithRectangle(rectangle: Rectangle): boolean {
    console.log(rectangle);
    return false;
  }
  isCollideWithLine(line: Line): boolean {
    console.log(line);
    return false;
  }

  toString(): string {
    return `SymmetryCurve(start:${this.start}, startDirection:${this.startDirection}, end:${this.end}, endDirection:${this.endDirection}, bending:${this.bending})`;
  }
  getRectangle(): Rectangle {
    let minX = Math.min(this.start.x, this.end.x);
    let maxX = Math.max(this.start.x, this.end.x);
    let minY = Math.min(this.start.y, this.end.y);
    let maxY = Math.max(this.start.y, this.end.y);
    const leftTop = new Vector(minX, minY);
    const size = new Vector(maxX - minX, maxY - minY);
    return new Rectangle(leftTop, size);
  }
}
