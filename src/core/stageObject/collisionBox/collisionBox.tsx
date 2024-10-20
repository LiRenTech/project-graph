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
}
