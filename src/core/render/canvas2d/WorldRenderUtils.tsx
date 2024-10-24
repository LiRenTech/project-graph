import { Color } from "../../dataStruct/Color";
import { CubicBezierCurve, SymmetryCurve } from "../../dataStruct/shape/Curve";
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
    curve.start = Renderer.transformWorld2View(curve.start)
    curve.end = Renderer.transformWorld2View(curve.end)
    curve.ctrlPt1 = Renderer.transformWorld2View(curve.ctrlPt1)
    curve.ctrlPt2 = Renderer.transformWorld2View(curve.ctrlPt2)
    RenderUtils.renderBezierCurve(curve, color, width * Camera.currentScale)
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
    start: Vector, end: Vector, width: number): void {
    Canvas.ctx.shadowColor = "red";
    Canvas.ctx.shadowBlur = 15;
    RenderUtils.renderSolidLine(
      Renderer.transformWorld2View(start),
      Renderer.transformWorld2View(end),
      new Color(255, 255, 255),
      width * Camera.currentScale
    );
    Canvas.ctx.shadowBlur = 0;
  }

}