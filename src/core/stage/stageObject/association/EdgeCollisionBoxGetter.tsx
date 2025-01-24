import { Circle } from "../../../dataStruct/shape/Circle";
import { SymmetryCurve } from "../../../dataStruct/shape/Curve";
import { Line } from "../../../dataStruct/shape/Line";
import { Settings } from "../../../service/Settings";
import { CollisionBox } from "../collisionBox/collisionBox";
import { LineEdge } from "./LineEdge";

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
  export function getCollisionBox(edge: LineEdge): CollisionBox {
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
        return getStraightCollisionBox(edge);
      } else if (currentStyle === "vertical") {
        return new CollisionBox([edge.bodyLine]);
      } else {
        return new CollisionBox([edge.bodyLine]);
      }
    }
  }

  function getBezierCollisionBox(edge: LineEdge): CollisionBox {
    if (edge.isShifting) {
      const shiftingMidPoint = edge.shiftingMidPoint;
      // 从source.Center到shiftingMidPoint的线
      const startLine = new Line(
        edge.source.collisionBox.getRectangle().center,
        shiftingMidPoint,
      );
      const endLine = new Line(
        shiftingMidPoint,
        edge.target.collisionBox.getRectangle().center,
      );
      let startPoint = edge.source.collisionBox
        .getRectangle()
        .getLineIntersectionPoint(startLine);
      if (startPoint.equals(edge.source.collisionBox.getRectangle().center)) {
        startPoint = edge.source.collisionBox
          .getRectangle()
          .getLineIntersectionPoint(endLine);
      }
      let endPoint = edge.target.collisionBox
        .getRectangle()
        .getLineIntersectionPoint(endLine);
      if (endPoint.equals(edge.target.collisionBox.getRectangle().center)) {
        endPoint = edge.target.collisionBox
          .getRectangle()
          .getLineIntersectionPoint(startLine);
      }
      const curve = new SymmetryCurve(
        startPoint,
        startLine.direction(),
        endPoint,
        endLine.direction().multiply(-1),
        Math.abs(endPoint.subtract(startPoint).magnitude()) / 2,
      );
      const size = 15; // 箭头大小
      curve.end = curve.end.subtract(
        curve.endDirection.normalize().multiply(size / -2),
      );
      return new CollisionBox([curve]);
    } else {
      const start = edge.bodyLine.start;
      const end = edge.bodyLine.end;
      const endNormal = edge.target.collisionBox
        .getRectangle()
        .getNormalVectorAt(end);
      return new CollisionBox([
        new SymmetryCurve(
          start,
          edge.source.collisionBox.getRectangle().getNormalVectorAt(start),
          end.add(endNormal.multiply(15 / 2)),
          endNormal,
          Math.abs(end.subtract(start).magnitude()) / 2,
        ),
      ]);
    }
  }

  function getStraightCollisionBox(edge: LineEdge): CollisionBox {
    if (edge.isShifting) {
      const shiftingMidPoint = edge.shiftingMidPoint;
      // 从source.Center到shiftingMidPoint的线
      const startLine = new Line(
        edge.source.collisionBox.getRectangle().center,
        shiftingMidPoint,
      );
      const endLine = new Line(
        shiftingMidPoint,
        edge.target.collisionBox.getRectangle().center,
      );
      return new CollisionBox([startLine, endLine]);
    } else {
      return new CollisionBox([edge.bodyLine]);
    }
  }
}
