import { Canvas } from "../../Canvas";
import { Color } from "../../Color";
import { Rectangle } from "../../Rectangle";
import { Vector } from "../../Vector";

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
   * 画一个圆弧线但不填充
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

  export function renderRectFromCenter(
    centerLocation: Vector,
    width: number,
    height: number,
    color: Color,
    strokeColor: Color,
    strokeWidth: number,
  ): void {
    Canvas.ctx.beginPath();
    Canvas.ctx.rect(
      centerLocation.x - width / 2,
      centerLocation.y - height / 2,
      width,
      height,
    );
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fill();
    Canvas.ctx.lineWidth = strokeWidth;
    Canvas.ctx.strokeStyle = strokeColor.toString();
    Canvas.ctx.stroke();
  }

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

  export function renderText(
    text: string,
    location: Vector,
    size: number,
    color: Color = Color.White,
  ): void {
    Canvas.ctx.textBaseline = "middle"; //alphabetic, top, hanging, middle, ideographic, bottom
    Canvas.ctx.textAlign = "left";
    Canvas.ctx.font = `${size}px system-ui`;
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fillText(text, location.x, location.y + size / 2);
  }

  export function renderTextFromCenter(
    text: string,
    centerLocation: Vector,
    size: number,
    color: Color = Color.White,
  ): void {
    Canvas.ctx.textBaseline = "middle";
    Canvas.ctx.textAlign = "center";
    Canvas.ctx.font = `${size}px system-ui`;
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fillText(text, centerLocation.x, centerLocation.y);
  }

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

  /**
   * 绘制一个多边形并填充
   */
  export function renderPolygonAndFill(
    points: Vector[],
    fillColor: Color,
    strokeColor: Color,
    strokeWidth: number,
  ): void {
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
   * 绘制一条从颜色渐变到另一种颜色的线
   */
  export function renderGradientLine(
    start: Vector,
    end: Vector,
    startColor: Color,
    endColor: Color,
    width: number,
  ): void {
    let gradient = Canvas.ctx.createLinearGradient(
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
    let gradient = Canvas.ctx.createRadialGradient(
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

  export function renderSvgFromLeftTop(
    svg: string,
    location: Vector,
    width: number,
    height: number,
  ): void {
    let data = svg;
    let img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(data);
    Canvas.ctx.drawImage(img, location.x, location.y, width, height);
  }

  export function renderSvgFromCenter(
    svg: string,
    centerLocation: Vector,
    width: number,
    height: number,
  ): void {
    let data = svg;
    let img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(data);
    Canvas.ctx.drawImage(
      img,
      centerLocation.x - width / 2,
      centerLocation.y - height / 2,
      width,
      height,
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
    let nor = direction.normalize();
    let arrow_size = size / 2;
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
