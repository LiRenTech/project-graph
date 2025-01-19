import { Color } from "../../../dataStruct/Color";
import { Circle } from "../../../dataStruct/shape/Circle";
import { SymmetryCurve } from "../../../dataStruct/shape/Curve";
import { Line } from "../../../dataStruct/shape/Line";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { CollisionBox } from "../../../stageObject/collisionBox/collisionBox";
import { CurveRenderer } from "../curveRenderer";
import { Renderer } from "../renderer";
import { ShapeRenderer } from "../shapeRenderer";
import { WorldRenderUtils } from "../WorldRenderUtils";

/**
 * 碰撞箱渲染器
 */
export namespace CollisionBoxRenderer {
  export function render(collideBox: CollisionBox, color: Color) {
    for (const shape of collideBox.shapeList) {
      if (shape instanceof Rectangle) {
        ShapeRenderer.renderRect(
          new Rectangle(
            Renderer.transformWorld2View(
              shape.location.subtract(Vector.same(7.5)),
            ),
            shape.size.add(Vector.same(15)).multiply(Camera.currentScale),
          ),
          Color.Transparent,
          color,
          2 * Camera.currentScale,
          16 * Camera.currentScale,
        );
      } else if (shape instanceof Circle) {
        ShapeRenderer.renderCircle(
          Renderer.transformWorld2View(shape.location),
          (shape.radius + 7.5) * Camera.currentScale,
          Color.Transparent,
          color,
          2 * Camera.currentScale,
        );
      } else if (shape instanceof Line) {
        CurveRenderer.renderSolidLine(
          Renderer.transformWorld2View(shape.start),
          Renderer.transformWorld2View(shape.end),
          color,
          5 * 2 * Camera.currentScale,
        );
      } else if (shape instanceof SymmetryCurve) {
        // shape.endDirection = shape.endDirection.normalize();
        // const size = 15; // 箭头大小
        // shape.end = shape.end.subtract(shape.endDirection.multiply(size / -2));
        WorldRenderUtils.renderSymmetryCurve(shape, color, 10);
      }
    }
  }
}
