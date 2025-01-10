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
    if (controlPoints.length === 0) {
      throw new Error("Control points can't be empty");
    }
    this.controlPoints = controlPoints;
    this.alpha = alpha;
    this.tension = tension;
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

export class CublicCatmullRomCurve extends Shape {
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
