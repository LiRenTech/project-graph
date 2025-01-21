import { Line } from "../../../dataStruct/shape/Line";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Shape } from "../../../dataStruct/shape/Shape";
import { Vector } from "../../../dataStruct/Vector";

/**
 * 碰撞箱类
 */
export class CollisionBox {
  private _shapeList: Shape[] = [];

  constructor(shapeList: Shape[]) {
    this._shapeList = shapeList;
  }

  get shapeList(): Shape[] {
    return this._shapeList;
  }

  set shapeList(shapeList: Shape[]) {
    this._shapeList = shapeList;
  }

  /**
   *
   * @param shapeList 更新碰撞箱的形状列表
   */
  updateShapeList(shapeList: Shape[]): void {
    this.shapeList = shapeList;
  }

  public isContainsPoint(location: Vector): boolean {
    for (const shape of this.shapeList) {
      if (shape.isPointIn(location)) {
        return true;
      }
    }
    return false;
  }

  public isIntersectsWithRectangle(rectangle: Rectangle): boolean {
    for (const shape of this.shapeList) {
      if (shape.isCollideWithRectangle(rectangle)) {
        return true;
      }
    }
    return false;
  }

  public isIntersectsWithLine(line: Line): boolean {
    for (const shape of this.shapeList) {
      if (shape.isCollideWithLine(line)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取碰撞箱们的最小外接矩形
   * 如果形状数组为空，则返回00点的无大小矩形
   */
  getRectangle(): Rectangle {
    if (this.shapeList.length === 0) {
      return new Rectangle(Vector.getZero(), Vector.getZero());
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
