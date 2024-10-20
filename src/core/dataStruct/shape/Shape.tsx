import { Vector } from "../Vector";
import { Line } from "./Line";
import { Rectangle } from "./Rectangle";

/**
 * 可交互的 图形抽象类
 */
export abstract class Shape {
  
  abstract isPointIn(point: Vector) : boolean;

  abstract isCollideWithRectangle(rectangle: Rectangle) : boolean;

  abstract isCollideWithLine(line: Line): boolean;
}