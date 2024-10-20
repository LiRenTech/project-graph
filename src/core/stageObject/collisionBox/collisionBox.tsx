import { Line } from "../../dataStruct/shape/Line";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Shape } from "../../dataStruct/shape/Shape";
import { Vector } from "../../dataStruct/Vector";

/**
 * 碰撞箱类
 */
export class CollisionBox {
  shapeList: Shape[] = [];

  constructor(shapeList: Shape[]) {
    this.shapeList = shapeList;
  }

  /**
   *
   * @param shapeList 更新碰撞箱的形状列表
   */
  updateShapeList(shapeList: Shape[]): void {
    this.shapeList = shapeList;
  }

  isPointInCollisionBox(location: Vector): boolean {
    for (const shape of this.shapeList) {
      if (shape.isPointIn(location)) {
        return true;
      }
    }
    return false;
  }

  isRectangleInCollisionBox(rectangle: Rectangle): boolean {
    for (const shape of this.shapeList) {
      if (shape.isCollideWithRectangle(rectangle)) {
        return true;
      }
    }
    return false;
  }

  isLineInCollisionBox(line: Line): boolean {
    for (const shape of this.shapeList) {
      if (shape.isCollideWithLine(line)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取碰撞箱们的最小外接矩形
   */
  getRectangle(): Rectangle {
    if (this.shapeList.length === 0) {
      // 报错
      throw new Error("CollisionBox is empty!");
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const shape of this.shapeList) {
      const rectangle = shape.getRectangle();
      const x = rectangle.location.x,
        y = rectangle.location.y;
      const width = rectangle.size.x,
        height = rectangle.size.y;
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (x + width > maxX) {
        maxX = x + width;
      }
      if (y + height > maxY) {
        maxY = y + height;
      }
    }
    const leftTopLocation = new Vector(minX, minY);
    const sizeVector = new Vector(maxX - minX, maxY - minY);
    return new Rectangle(leftTopLocation, sizeVector);
  }
}
