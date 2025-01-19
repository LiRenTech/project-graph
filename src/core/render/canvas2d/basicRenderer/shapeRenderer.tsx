import { Color } from "../../../dataStruct/Color";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { Canvas } from "../../../stage/Canvas";

/**
 * 基础图形渲染器
 * 注意：全部都是基于View坐标系
 */
export namespace ShapeRenderer {
  /**
   * 画一个圆
   * @param ctx
   * @param centerLocation
   * @param radius
   * @param color
   * @param strokeColor
   * @param strokeWidth
   */
  export function renderCircle(
    centerLocation: Vector,
    radius: number,
    color: Color,
    strokeColor: Color,
    strokeWidth: number,
  ): void {
    Canvas.ctx.beginPath();
    Canvas.ctx.arc(centerLocation.x, centerLocation.y, radius, 0, 2 * Math.PI);
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fill();
    Canvas.ctx.lineWidth = strokeWidth;
    Canvas.ctx.strokeStyle = strokeColor.toString();
    Canvas.ctx.stroke();
  }

  /**
   * 画一个圆弧但不填充
   * 从开始弧度到结束弧度，逆时针转过去。（因为y轴向下）
   * @param centerLocation 圆弧的中心
   * @param radius 半径
   * @param angle1 开始弧度
   * @param angle2 结束弧度
   * @param strokeColor
   * @param strokeWidth
   */
  export function renderArc(
    centerLocation: Vector,
    radius: number,
    angle1: number,
    angle2: number,
    strokeColor: Color,
    strokeWidth: number,
  ): void {
    Canvas.ctx.beginPath();
    Canvas.ctx.arc(centerLocation.x, centerLocation.y, radius, angle1, angle2);
    Canvas.ctx.lineWidth = strokeWidth;
    Canvas.ctx.strokeStyle = strokeColor.toString();
    Canvas.ctx.stroke();
  }

  /**
   * 画一个矩形，但是坐标点是矩形的中心点
   * @param centerLocation
   * @param width
   * @param height
   * @param color
   * @param strokeColor
   * @param strokeWidth
   * @param radius
   */
  export function renderRectFromCenter(
    centerLocation: Vector,
    width: number,
    height: number,
    color: Color,
    strokeColor: Color,
    strokeWidth: number,
    radius: number = 0,
  ): void {
    Canvas.ctx.beginPath();
    Canvas.ctx.roundRect(
      centerLocation.x - width / 2,
      centerLocation.y - height / 2,
      width,
      height,
      radius,
    );
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fill();
    Canvas.ctx.lineWidth = strokeWidth;
    Canvas.ctx.strokeStyle = strokeColor.toString();
    Canvas.ctx.stroke();
  }

  /**
   * 画矩形
   * @param rect
   * @param color
   * @param strokeColor
   * @param strokeWidth
   * @param radius
   */
  export function renderRect(
    rect: Rectangle,
    color: Color,
    strokeColor: Color,
    strokeWidth: number,
    radius: number = 0,
  ) {
    Canvas.ctx.beginPath();
    Canvas.ctx.roundRect(
      rect.location.x,
      rect.location.y,
      rect.size.x,
      rect.size.y,
      radius,
    );
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fill();
    Canvas.ctx.lineWidth = strokeWidth;
    Canvas.ctx.strokeStyle = strokeColor.toString();
    Canvas.ctx.stroke();
  }

  /**
   * 绘制一个多边形并填充
   * @param points 多边形的顶点数组，三角形就只需三个点，
   * 不用考虑首尾点闭合。
   * @param fillColor
   * @param strokeColor
   * @param strokeWidth
   */
  export function renderPolygonAndFill(
    points: Vector[],
    fillColor: Color,
    strokeColor: Color,
    strokeWidth: number,
    lineJoin: "round" | "bevel" = "round",
  ): void {
    Canvas.ctx.lineJoin = lineJoin; // 圆角
    // bevel，斜角
    Canvas.ctx.beginPath();
    Canvas.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      Canvas.ctx.lineTo(points[i].x, points[i].y);
    }
    Canvas.ctx.closePath();
    Canvas.ctx.fillStyle = fillColor.toString();
    Canvas.ctx.fill();
    Canvas.ctx.lineWidth = strokeWidth;
    Canvas.ctx.strokeStyle = strokeColor.toString();
    Canvas.ctx.stroke();
  }

  /**
   * 绘制中心过渡的圆形不加边框
   * 常用于一些特效
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
}
