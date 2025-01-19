import { Canvas } from "../../stage/Canvas";
import { Color } from "../../dataStruct/Color";
import { Vector } from "../../dataStruct/Vector";
import { CubicBezierCurve, SymmetryCurve } from "../../dataStruct/shape/Curve";
import { Camera } from "../../stage/Camera";

/**
 * 一些基础的渲染图形
 * 注意：这些渲染的参数都是View坐标系下的。
 */
export namespace RenderUtils {
  /**
   * 绘制一条实现
   * @param ctx
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
   * 绘制一条虚线
   *
   * 2024年11月10日 发现虚线渲染不生效，也很难排查到原因
   * 2024年12月5日 突然发现又没有问题了，也不知道为什么。
   * @param start
   * @param end
   * @param color
   * @param width
   * @param dashLength
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
   * 绘制一条从颜色渐变到另一种颜色的线
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

  /**
   * 绘制中心过渡的圆形不加边框
   */
  export function renderCircleTransition(
    viewLocation: Vector,
    radius: number,
    centerColor: Color,
  ) {
    const gradient = Canvas.ctx.createRadialGradient(
      viewLocation.x,
      viewLocation.y,
      0,
      viewLocation.x,
      viewLocation.y,
      radius,
    );
    // 添加颜色
    gradient.addColorStop(0, centerColor.toString()); // 中心
    const transparentColor = centerColor.clone();
    transparentColor.a = 0;
    gradient.addColorStop(1, transparentColor.toString()); // 边缘透明
    Canvas.ctx.fillStyle = gradient;
    Canvas.ctx.strokeStyle = "transparent";
    // 绘制圆形
    Canvas.ctx.beginPath();
    Canvas.ctx.arc(
      viewLocation.x,
      viewLocation.y,
      radius,
      0,
      2 * Math.PI,
      false,
    );
    Canvas.ctx.fill();
  }

  /**
   * 绘制一个像素点
   * @param location
   * @param color
   */
  export function renderPixel(location: Vector, color: Color) {
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fillRect(
      location.x,
      location.y,
      1 * Camera.currentScale,
      1 * Camera.currentScale,
    );
  }

  /**
   * 画箭头（只画头，不画线）
   */
  export function renderArrow(
    direction: Vector,
    location: Vector,
    color: Color,
    size: number,
  ) {
    /*
    Python 代码：
    self.path = QPainterPath(point_at.to_qt())
        nor = direction.normalize()
        self.path.lineTo((point_at - nor.rotate(20) * arrow_size).to_qt())
        self.path.lineTo((point_at - nor * (arrow_size / 2)).to_qt())
        self.path.lineTo((point_at - nor.rotate(-20) * arrow_size).to_qt())
        self.path.closeSubpath()
    */
    const nor = direction.normalize();
    const arrow_size = size / 2;
    Canvas.ctx.beginPath();
    Canvas.ctx.moveTo(location.x, location.y);
    Canvas.ctx.lineTo(
      location.x - nor.rotate(20).x * arrow_size,
      location.y - nor.rotate(20).y * arrow_size,
    );
    Canvas.ctx.lineTo(
      location.x - nor.x * (arrow_size / 2),
      location.y - nor.y * (arrow_size / 2),
    );
    Canvas.ctx.lineTo(
      location.x - nor.rotate(-20).x * arrow_size,
      location.y - nor.rotate(-20).y * arrow_size,
    );
    Canvas.ctx.closePath();
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fill();
  }
}
