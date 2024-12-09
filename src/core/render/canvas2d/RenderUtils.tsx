import { Canvas } from "../../stage/Canvas";
import { Color } from "../../dataStruct/Color";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { CubicBezierCurve, SymmetryCurve } from "../../dataStruct/shape/Curve";
import { Camera } from "../../stage/Camera";

/**
 * 一些基础的渲染图形
 * 注意：这些渲染的参数都是View坐标系下的。
 */
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

  /**
   * 从左上角画文本
   * @param text
   * @param location
   * @param size
   * @param color
   */
  export function renderText(
    text: string,
    location: Vector,
    size: number,
    color: Color = Color.White,
  ): void {
    Canvas.ctx.textBaseline = "middle"; //alphabetic, top, hanging, middle, ideographic, bottom
    Canvas.ctx.textAlign = "left";
    Canvas.ctx.font = `${size}px MiSans`;
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
    Canvas.ctx.font = `${size}px MiSans`;
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fillText(text, centerLocation.x, centerLocation.y);
  }

  /**
   * 渲染多行文本
   * @param text
   * @param location
   * @param size
   * @param color
   * @param lineHeight
   */
  export function renderMultiLineText(
    text: string,
    location: Vector,
    size: number,
    limitWidth: number,
    color: Color = Color.White,
    lineHeight: number = 1.2,
  ): void {
    // 一个一个字符遍历，然后一次渲染一行
    let currentLine = "";
    let currentY = 0; // 顶部偏移量
    // 先空渲染一下
    renderText(currentLine, location.add(new Vector(0, currentY)), size, color);

    for (const char of text) {
      // 新来字符的宽度
      const measureSize = Canvas.ctx.measureText(currentLine + char);
      // 先判断是否溢出
      if (measureSize.width > limitWidth || char === "\n") {
        renderText(
          currentLine,
          location.add(new Vector(0, currentY)),
          size,
          color,
        );
        if (char !== "\n") {
          currentLine = char;
        } else {
          currentLine = "";
        }
        currentY += size * lineHeight;
      } else {
        // 未溢出，继续添加字符
        // 当前行更新
        currentLine += char;
      }
    }
    // 最后一行
    if (currentLine) {
      renderText(
        currentLine,
        location.add(new Vector(0, currentY)),
        size,
        color,
      );
    }
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
   * 绘制一个多边形并填充
   */
  export function renderPolygonAndFill(
    points: Vector[],
    fillColor: Color,
    strokeColor: Color,
    strokeWidth: number,
  ): void {
    Canvas.ctx.lineJoin = "round"; // 圆角
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

  export function renderSvgFromLeftTop(
    svg: string,
    location: Vector,
    width: number,
    height: number,
  ): void {
    const data = svg;
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(data);
    Canvas.ctx.drawImage(img, location.x, location.y, width, height);
  }

  export function renderSvgFromCenter(
    svg: string,
    centerLocation: Vector,
    width: number,
    height: number,
  ): void {
    const data = svg;
    const img = new Image();
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
