import { Color } from "../../dataStruct/Color";
import { CubicBezierCurve, SymmetryCurve } from "../../dataStruct/shape/Curve";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { Camera } from "../../stage/Camera";
import { Canvas } from "../../stage/Canvas";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
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

  export function renderLaser(
    start: Vector,
    end: Vector,
    width: number,
    color: Color,
  ): void {
    Canvas.ctx.shadowColor = color.toString();
    Canvas.ctx.shadowBlur = 15;

    if (start.distance(end) === 0) {
      WorldRenderUtils.renderPrismaticBlock(
        start,
        4,
        Color.Transparent,
        StageStyleManager.currentStyle.effects.flash,
        2,
      );
    } else {
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(start),
        Renderer.transformWorld2View(end),
        StageStyleManager.currentStyle.effects.flash,
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

  export function renderPrismaticBlock(
    centerLocation: Vector,
    radius: number,
    color: Color,
    strokeColor: Color,
    strokeWidth: number,
  ): void {
    const c = Renderer.transformWorld2View(centerLocation);
    radius *= Camera.currentScale;
    strokeWidth *= Camera.currentScale;
    const originLineJoin = Canvas.ctx.lineJoin;
    Canvas.ctx.lineJoin = "miter";
    Canvas.ctx.beginPath();
    Canvas.ctx.moveTo(c.x + radius, c.y);
    Canvas.ctx.lineTo(c.x, c.y - radius);
    Canvas.ctx.lineTo(c.x - radius, c.y);
    Canvas.ctx.lineTo(c.x, c.y + radius);
    Canvas.ctx.closePath();
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fill();
    Canvas.ctx.lineWidth = strokeWidth;
    Canvas.ctx.strokeStyle = strokeColor.toString();
    Canvas.ctx.stroke();
    Canvas.ctx.lineJoin = originLineJoin;
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
      StageStyleManager.currentStyle.effects.flash,
      Color.Transparent,
      0,
    );
    // 恢复
    Canvas.ctx.shadowBlur = 0;
  }
}
