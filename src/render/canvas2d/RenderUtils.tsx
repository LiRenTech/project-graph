import Color from "../../core/Color";
import { Vector } from "../../core/Vector";

export namespace RenderUtils {
  /**
   * 画一个圆
   * @param ctx
   * @param centerLocation
   * @param radius
   * @param color
   * @param strokeColor
   * @param strokeWidth
   */
  export function rendCircle(
    ctx: CanvasRenderingContext2D,
    centerLocation: Vector,
    radius: number,
    color: Color,
    strokeColor: Color,
    strokeWidth: number,
  ): void {
    ctx.beginPath();
    ctx.arc(centerLocation.x, centerLocation.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color.toString();
    ctx.fill();
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor.toString();
    ctx.stroke();
  }

  /**
   * 画一个圆弧线但不填充
   */
  export function rendArc(
    ctx: CanvasRenderingContext2D,
    centerLocation: Vector,
    radius: number,
    angle1: number,
    angle2: number,
    strokeColor: Color,
    strokeWidth: number,
  ): void {
    ctx.beginPath();
    ctx.arc(centerLocation.x, centerLocation.y, radius, angle1, angle2);
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor.toString();
    ctx.stroke();
  }

  export function rendRectFromCenter(
    ctx: CanvasRenderingContext2D,
    centerLocation: Vector,
    width: number,
    height: number,
    color: Color,
    strokeColor: Color,
    strokeWidth: number,
  ): void {
    ctx.beginPath();
    ctx.rect(
      centerLocation.x - width / 2,
      centerLocation.y - height / 2,
      width,
      height,
    );
    ctx.fillStyle = color.toString();
    ctx.fill();
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor.toString();
    ctx.stroke();
  }

  export function rendRectFromLeftTop(
    ctx: CanvasRenderingContext2D,
    leftTopLocation: Vector,
    width: number,
    height: number,
    color: Color,
    strokeColor: Color,
    strokeWidth: number,
  ) {
    ctx.beginPath();
    ctx.rect(leftTopLocation.x, leftTopLocation.y, width, height);
    ctx.fillStyle = color.toString();
    ctx.fill();
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor.toString();
    ctx.stroke();
  }

  export function rendTextFromLeftTop(
    ctx: CanvasRenderingContext2D,
    text: string,
    leftTopLocation: Vector,
    size: number,
    color: Color = Color.White,
  ): void {
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.font = `${size}px Arial`;
    ctx.fillStyle = color.toString();
    ctx.fillText(text, leftTopLocation.x, leftTopLocation.y);
  }

  export function rendTextFromCenter(
    ctx: CanvasRenderingContext2D,
    text: string,
    centerLocation: Vector,
    size: number,
    color: Color = Color.White,
  ): void {
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `${size}px Arial`;
    ctx.fillStyle = color.toString();
    ctx.fillText(text, centerLocation.x, centerLocation.y);
  }

  /**
   * 绘制一条实现
   * @param ctx
   * @param start
   * @param end
   * @param color
   * @param width
   */
  export function rendSolidLine(
    ctx: CanvasRenderingContext2D,
    start: Vector,
    end: Vector,
    color: Color,
    width: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineWidth = width;
    ctx.strokeStyle = color.toString();
    ctx.stroke();
  }

  /**
   * 绘制一个多边形并填充
   */
  export function rendPolygonAndFill(
    ctx: CanvasRenderingContext2D,
    points: Vector[],
    fillColor: Color,
    strokeColor: Color,
    strokeWidth: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor.toString();
    ctx.fill();
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor.toString();
    ctx.stroke();
  }

  /**
   * 绘制一条从颜色渐变到另一种颜色的线
   */
  export function rendGradientLine(
    ctx: CanvasRenderingContext2D,
    start: Vector,
    end: Vector,
    startColor: Color,
    endColor: Color,
    width: number,
  ): void {
    let gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    // 添加颜色
    gradient.addColorStop(0, startColor.toString()); // 起始颜色
    gradient.addColorStop(1, endColor.toString()); // 结束颜色
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineWidth = width;
    ctx.strokeStyle = gradient;
    ctx.stroke();
  }

  /**
   * 绘制中心过渡的圆形不加边框
   */
  export function rendCircleTransition(
    ctx: CanvasRenderingContext2D,
    viewLocation: Vector,
    radius: number,
    centerColor: Color,
  ) {
    let gradient = ctx.createRadialGradient(
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
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "transparent";
    // 绘制圆形
    ctx.beginPath();
    ctx.arc(viewLocation.x, viewLocation.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  }

  export function rendSvgFromLeftTop(
    ctx: CanvasRenderingContext2D,
    svg: string,
    location: Vector,
    width: number,
    height: number,
  ): void {
    let data = svg;
    let img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(data);
    ctx.drawImage(img, location.x, location.y, width, height);
  }

  export function rendSvgFromCenter(
    ctx: CanvasRenderingContext2D,
    svg: string,
    centerLocation: Vector,
    width: number,

    height: number,
  ): void {
    let data = svg;
    let img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(data);
    ctx.drawImage(
      img,
      centerLocation.x - width / 2,
      centerLocation.y - height / 2,
      width,
      height,
    );
  }
}
