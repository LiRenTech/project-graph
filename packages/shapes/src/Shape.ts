import { Vector } from "@graphif/data-structures";
import { Line } from "./Line";
import { Rectangle } from "./Rectangle";

/**
 * 可交互的 图形抽象类
 */
export abstract class Shape {
  abstract isPointIn(point: Vector): boolean;

  abstract isCollideWithRectangle(rectangle: Rectangle): boolean;

  abstract isCollideWithLine(line: Line): boolean;

  /**
   * 获取图形的最小外接矩形，用于对齐操作
   */
  abstract getRectangle(): Rectangle;
}
