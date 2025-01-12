import { Color } from "../../dataStruct/Color";
import { CublicCatmullRomSpline } from "../../dataStruct/shape/CublicCatmullRomSpline";
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
   * 绘制一条Catmull-Rom样条线
   * @param curve
   */
  export function renderCublicCatmullRomSpline(
    spline: CublicCatmullRomSpline,
    color: Color,
    width: number,
  ): void {
    const points = spline.computePath().map(Renderer.transformWorld2View);
    width *= Camera.currentScale;
    const start = Renderer.transformWorld2View(spline.controlPoints[1]);
    const end = Renderer.transformWorld2View(
      spline.controlPoints[spline.controlPoints.length - 2],
    );
    // 绘制首位控制点到曲线首尾的虚线
    const dashedColor = color.clone();
    dashedColor.a /= 2;
    RenderUtils.renderDashedLine(
      Renderer.transformWorld2View(spline.controlPoints[0]),
      start,
      dashedColor,
      width,
      width * 2,
    );
    RenderUtils.renderDashedLine(
      end,
      Renderer.transformWorld2View(
        spline.controlPoints[spline.controlPoints.length - 1],
      ),
      dashedColor,
      width,
      width * 2,
    );
    // 绘制曲线
    Canvas.ctx.beginPath();
    Canvas.ctx.lineJoin = "bevel";
    Canvas.ctx.moveTo(points[0].x, points[0].y);
    Canvas.ctx.lineWidth = width;
    for (let i = 1; i < points.length; i++) {
      Canvas.ctx.lineTo(points[i].x, points[i].y);
      RenderUtils.renderCircle(points[i], width, color, color, width);
    }
    Canvas.ctx.strokeStyle = color.toString();
    Canvas.ctx.stroke();
    // 绘制控制点
    // for (const p of spline.controlPoints) {
    //   RenderUtils.renderCircle(
    //     Renderer.transformWorld2View(p),
    //     width * 2,
    //     color,
    //     mixColors(color, Color.Black, 0.5),
    //     Camera.currentScale,
    //   );
    // }
  }

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

  export function renderLaser(
    start: Vector,
    end: Vector,
    width: number,
    color: Color,
  ): void {
    Canvas.ctx.shadowColor = color.toString();
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
    width = Math.min(width, 20);

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
