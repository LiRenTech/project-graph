import { Color } from "../../../dataStruct/Color";
import {
  CubicBezierCurve,
  SymmetryCurve,
} from "../../../dataStruct/shape/Curve";
import { Vector } from "../../../dataStruct/Vector";
import { Canvas } from "../../../stage/Canvas";

/**
 * 关于各种曲线和直线的渲染
 * 注意：这里全都是View坐标系
 */
export namespace CurveRenderer {
  /**
   * 绘制一条直线实线
   * @param start
   * @param end
   * @param color
   * @param width
   */
  export function renderSolidLine(
    start: Vector,
    end: Vector,
    color: Color,
    width: number,
  ): void {
    Canvas.ctx.beginPath();
    Canvas.ctx.moveTo(start.x, start.y);
    Canvas.ctx.lineTo(end.x, end.y);
    Canvas.ctx.lineWidth = width;
    Canvas.ctx.strokeStyle = color.toString();
    Canvas.ctx.stroke();
  }

  /**
   * 绘制折线实线
   * @param locations 所有点构成的数组
   * @param color
   * @param width
   */
  export function renderSolidLineMultiple(
    locations: Vector[],
    color: Color,
    width: number,
  ): void {
    Canvas.ctx.beginPath();
    Canvas.ctx.moveTo(locations[0].x, locations[0].y);
    for (let i = 1; i < locations.length; i++) {
      Canvas.ctx.lineTo(locations[i].x, locations[i].y);
    }
    Canvas.ctx.lineWidth = width;
    Canvas.ctx.strokeStyle = color.toString();
    Canvas.ctx.stroke();
  }

  /**
   * 绘制折线实线，带有阴影
   * @param locations
   * @param color
   * @param width
   * @param shadowColor
   * @param shadowBlur
   */
  export function renderSolidLineMultipleWithShadow(
    locations: Vector[],
    color: Color,
    width: number,
    shadowColor: Color,
    shadowBlur: number,
  ): void {
    Canvas.ctx.beginPath();
    Canvas.ctx.moveTo(locations[0].x, locations[0].y);
    for (let i = 1; i < locations.length; i++) {
      Canvas.ctx.lineTo(locations[i].x, locations[i].y);
    }
    Canvas.ctx.lineWidth = width;
    Canvas.ctx.strokeStyle = color.toString();
    Canvas.ctx.shadowColor = shadowColor.toString();
    Canvas.ctx.shadowBlur = shadowBlur;
    Canvas.ctx.stroke();
    Canvas.ctx.shadowBlur = 0;
  }

  /**
   * 绘制一条虚线
   *
   * 2024年11月10日 发现虚线渲染不生效，也很难排查到原因
   * 2024年12月5日 突然发现又没有问题了，也不知道为什么。
   * @param start
   * @param end
   * @param color
   * @param width
   * @param dashLength 虚线的长度，效果： =2: "--  --  --  --", =1: "- - - - -"
   */
  export function renderDashedLine(
    start: Vector,
    end: Vector,
    color: Color,
    width: number,
    dashLength: number,
  ): void {
    Canvas.ctx.setLineDash([dashLength, dashLength]);
    Canvas.ctx.beginPath();
    Canvas.ctx.moveTo(start.x, start.y);
    Canvas.ctx.lineTo(end.x, end.y);
    Canvas.ctx.lineWidth = width;
    Canvas.ctx.strokeStyle = color.toString();
    Canvas.ctx.stroke();
    // 重置线型
    Canvas.ctx.setLineDash([]);
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
    Canvas.ctx.beginPath();
    Canvas.ctx.moveTo(curve.start.x, curve.start.y);
    Canvas.ctx.bezierCurveTo(
      curve.ctrlPt1.x,
      curve.ctrlPt1.y,
      curve.ctrlPt2.x,
      curve.ctrlPt2.y,
      curve.end.x,
      curve.end.y,
    );
    Canvas.ctx.lineWidth = width;
    Canvas.ctx.strokeStyle = color.toString();
    Canvas.ctx.stroke();
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

  /**
   * 绘制一条从颜色渐变到另一种颜色的实线
   */
  export function renderGradientLine(
    start: Vector,
    end: Vector,
    startColor: Color,
    endColor: Color,
    width: number,
  ): void {
    const gradient = Canvas.ctx.createLinearGradient(
      start.x,
      start.y,
      end.x,
      end.y,
    );
    // 添加颜色
    gradient.addColorStop(0, startColor.toString()); // 起始颜色
    gradient.addColorStop(1, endColor.toString()); // 结束颜色
    Canvas.ctx.beginPath();
    Canvas.ctx.moveTo(start.x, start.y);
    Canvas.ctx.lineTo(end.x, end.y);
    Canvas.ctx.lineWidth = width;
    Canvas.ctx.strokeStyle = gradient;
    Canvas.ctx.stroke();
  }
}
