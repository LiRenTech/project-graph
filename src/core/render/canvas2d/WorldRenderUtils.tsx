import { Color } from "../../dataStruct/Color";
import { CubicBezierCurve, SymmetryCurve } from "../../dataStruct/shape/Curve";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { Camera } from "../../stage/Camera";
import { Canvas } from "../../stage/Canvas";
import { Renderer } from "./renderer";
import { RenderUtils } from "./RenderUtils";

/**
 * 一些基础的渲染图形
 * 注意：这些渲染的参数都是World坐标系下的。
 */
export namespace WorldRenderUtils {
  /**
   * 绘制一条贝塞尔曲线
   * @param curve
   */
  export function renderBezierCurve(
    curve: CubicBezierCurve,
    color: Color,
    width: number,
  ): void {
    curve.start = Renderer.transformWorld2View(curve.start);
    curve.end = Renderer.transformWorld2View(curve.end);
    curve.ctrlPt1 = Renderer.transformWorld2View(curve.ctrlPt1);
    curve.ctrlPt2 = Renderer.transformWorld2View(curve.ctrlPt2);
    RenderUtils.renderBezierCurve(curve, color, width * Camera.currentScale);
  }

  /**
   * 绘制一条对称曲线
   * @param curve
   */
  export function renderSymmetryCurve(
    curve: SymmetryCurve,
    color: Color,
    width: number,
  ): void {
    renderBezierCurve(curve.bezier, color, width);
  }

  export function renderLaser(start: Vector, end: Vector, width: number): void {
    Canvas.ctx.shadowColor = "red";
    Canvas.ctx.shadowBlur = 15;

    if (start.distance(end) === 0) {
      RenderUtils.renderCircle(
        Renderer.transformWorld2View(start),
        4 * Camera.currentScale,
        Color.Transparent,
        Color.White,
        2 * Camera.currentScale,
      );
    } else {
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(start),
        Renderer.transformWorld2View(end),
        new Color(255, 255, 255),
        width * Camera.currentScale,
      );
    }

    // debug

    // RenderUtils.renderCircle(
    //   Renderer.transformWorld2View(start),
    //   10 * Camera.currentScale,
    //   Color.Transparent,
    //   new Color(255, 0, 0),
    //   2 * Camera.currentScale
    // )
    // RenderUtils.renderCircle(
    //   Renderer.transformWorld2View(end),
    //   10 * Camera.currentScale,
    //   Color.Transparent,
    //   Color.White,
    //   2 * Camera.currentScale
    // )
    Canvas.ctx.shadowBlur = 0;
  }

  // BUG
  export function renderRectangleFlash(
    rectangle: Rectangle,
    shadowColor: Color,
    shadowBlur: number,
  ) {
    Canvas.ctx.shadowColor = shadowColor.toString();
    Canvas.ctx.shadowBlur = shadowBlur;
    // 绘制矩形
    Canvas.ctx.beginPath();
    Canvas.ctx.roundRect(
      rectangle.location.x,
      rectangle.location.y,
      rectangle.size.x,
      rectangle.size.y,
      0,
    );
    Canvas.ctx.fillStyle = "red";
    Canvas.ctx.fill();
    Canvas.ctx.lineWidth = 1;
    Canvas.ctx.strokeStyle = "white";
    Canvas.ctx.stroke();
    // 恢复
    Canvas.ctx.shadowBlur = 0;
  }

  export function renderCuttingFlash(
    start: Vector,
    end: Vector,
    width: number,
    shadowColor: Color,
  ): void {
    Canvas.ctx.shadowColor = shadowColor.toString();
    Canvas.ctx.shadowBlur = 15;

    const direction = end.subtract(start).normalize();
    const headShiftBack = end.subtract(direction.multiply(20));
    const headLeft = headShiftBack.add(
      direction.rotateDegrees(90).multiply(width / 2),
    );
    const headRight = headShiftBack.add(
      direction.rotateDegrees(-90).multiply(width / 2),
    );

    RenderUtils.renderPolygonAndFill(
      [
        Renderer.transformWorld2View(start),
        Renderer.transformWorld2View(headLeft),
        Renderer.transformWorld2View(end),
        Renderer.transformWorld2View(headRight),
      ],
      Color.White,
      Color.Transparent,
      0,
    );
    // 恢复
    Canvas.ctx.shadowBlur = 0;
  }
}
