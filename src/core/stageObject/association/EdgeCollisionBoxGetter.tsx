import { Circle } from "../../dataStruct/shape/Circle";
import { SymmetryCurve } from "../../dataStruct/shape/Curve";
import { Settings } from "../../Settings";
import { CollisionBox } from "../collisionBox/collisionBox";
import { Edge } from "./Edge";

export namespace EdgeCollisionBoxGetter {
  /**
   * 初始化边的渲染器
   */
  export function init() {
    Settings.watch("lineStyle", updateState);
  }

  let currentStyle: Settings.Settings["lineStyle"];

  function updateState(style: Settings.Settings["lineStyle"]) {
    currentStyle = style;
  }

  /**
   * 根据不同的设置状态，以及edge，动态获取edge的碰撞箱
   * @param edge
   */
  export function getCollisionBox(edge: Edge): CollisionBox {
    if (edge.source.uuid === edge.target.uuid) {
      // 是一个自环，碰撞箱是圆形
      return new CollisionBox([
        new Circle(
          edge.source.collisionBox.getRectangle().location,
          edge.source.collisionBox.getRectangle().size.y / 2,
        ),
      ]);
    } else {
      if (currentStyle === "bezier") {
        return getBezierCollisionBox(edge);
      } else if (currentStyle === "straight") {
        return new CollisionBox([edge.bodyLine]);
      } else if (currentStyle === "vertical") {
        return new CollisionBox([edge.bodyLine]);
      } else {
        return new CollisionBox([edge.bodyLine]);
      }
    }
  }

  function getBezierCollisionBox(edge: Edge): CollisionBox {
    const start = edge.bodyLine.start;
    const end = edge.bodyLine.end;
    
    return new CollisionBox([
      new SymmetryCurve(
        start,
        edge.source.collisionBox.getRectangle().getNormalVectorAt(start),
        end,
        edge.target.collisionBox.getRectangle().getNormalVectorAt(end),
        Math.abs(end.subtract(start).magnitude()) / 2,
      ),
    ]);
  }
}
