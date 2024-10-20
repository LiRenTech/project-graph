import { Shape } from "../../dataStruct/shape/Shape";
// import { Vector } from "../../dataStruct/Vector";

/**
 * 碰撞箱类
 */
export class CollisionBox {
  shapeList: Shape[] = [];

  constructor(shapeList: Shape[]) {
    this.shapeList = shapeList;
  }

  updateShapeList(shapeList: Shape[]): void {
    this.shapeList = shapeList;
  }

  // isMouseLocationInCollisionBox(location: Vector): boolean {
  //   return false;
  // }


}