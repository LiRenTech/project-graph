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

  /**
   * 根据参数t（范围[0, 1]）获取贝塞尔曲线上的点
   * @param t 
   * @returns 
   */
  private getPointByT(t: number): Vector {
    return this.start.multiply(Math.pow(1 - t, 3)).add(
      this.ctrlPt1.multiply(3 * t * Math.pow(1 - t, 2))).add(
        this.ctrlPt2.multiply(3 * Math.pow(t, 2) * (1 - t)).add(
          this.end.multiply(Math.pow(t, 3))
        )
      );
  }

  toString(): string {
    return `CubicBezierCurve(start:${this.start}, ctrlPt1:${this.ctrlPt1}, ctrlPt2:${this.ctrlPt2}, end:${this.end})`;
  }

  // TODO 更改成真正的贝塞尔曲线形式
  isPointIn(point: Vector): boolean {
    console.log("executed");
    const segment = 5;
    let lastPoint = this.start;
    for (let i = 1; i < segment; i++) {
      const line = new Line(lastPoint, this.getPointByT(i / segment));
      if (line.isPointIn(point)) {
        return true;
      }
      lastPoint = line.end;
    }
    return false;
  }
  isCollideWithRectangle(rectangle: Rectangle): boolean {
    return new Line(this.start, this.end).isCollideWithRectangle(rectangle);
  }
  isCollideWithLine(line: Line): boolean {
    return new Line(this.start, this.end).isCollideWithLine(line);
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
    return this.bezier.isPointIn(point);
  }
  isCollideWithRectangle(rectangle: Rectangle): boolean {
    return this.bezier.isCollideWithRectangle(rectangle);
  }
  isCollideWithLine(line: Line): boolean {
    return this.bezier.isCollideWithLine(line);
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
