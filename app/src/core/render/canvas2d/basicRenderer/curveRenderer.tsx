import { Color } from "../../../dataStruct/Color";
import { CubicBezierCurve, SymmetryCurve } from "../../../dataStruct/shape/Curve";
import { Vector } from "../../../dataStruct/Vector";
import { Canvas } from "../../../stage/Canvas";
import { PenStrokeSegment } from "../../../stage/stageObject/entity/PenStroke";

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
  export function renderSolidLine(start: Vector, end: Vector, color: Color, width: number): void {
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
  export function renderSolidLineMultiple(locations: Vector[], color: Color, width: number): void {
    Canvas.ctx.beginPath();
    Canvas.ctx.moveTo(locations[0].x, locations[0].y);
    for (let i = 1; i < locations.length; i++) {
      Canvas.ctx.lineTo(locations[i].x, locations[i].y);
    }
    Canvas.ctx.lineWidth = width;
    Canvas.ctx.strokeStyle = color.toString();
    Canvas.ctx.stroke();
  }
  export function renderPenStroke(stroke: PenStrokeSegment[], color: Color): void {
    Canvas.ctx.strokeStyle = color.toString();
    // 在canvas上绘制笔画
    Canvas.ctx.beginPath();
    Canvas.ctx.lineJoin = "round";
    Canvas.ctx.moveTo(stroke[0].startLocation.x, stroke[0].startLocation.y);
    for (let i = 0; i < stroke.length; i++) {
      // console.log(stroke[i].width);

      /*
      // 修改循环开始从0
      if (i > 0) {
        Canvas.ctx.lineTo(stroke[i].endLocation.x, stroke[i].endLocation.y);
      }
        */
      // 上述代码这样，导致开头少了一段。如果是按住shift键画出来的直线就看不到了。

      Canvas.ctx.lineTo(stroke[i].endLocation.x, stroke[i].endLocation.y);

      Canvas.ctx.lineWidth = stroke[i].width; // 更新线宽为当前线段的宽度
      Canvas.ctx.stroke(); // 为了确保每个线段按照不同的宽度绘制，需要在这里调用stroke
      if (i < stroke.length - 1) {
        Canvas.ctx.beginPath(); // 开始新的路径，以便每个线段可以有不同的宽度
        Canvas.ctx.moveTo(stroke[i].endLocation.x, stroke[i].endLocation.y);
      }
    }
    // Canvas.ctx.strokeStyle = color.toString();
    // 更改颜色要在操作之前就更改，否则会出现第一笔画的颜色还是上一次的颜色这种诡异现象。
  }

  /**
   * 绘制经过平滑后的折线
   * 核心思路：将折线的顶点转换为连续贝塞尔曲线的控制点。
   * @param locations
   * @param color
   * @param width
   */
  export function renderSolidLineMultipleSmoothly(locations: Vector[], color: Color, width: number): void {
    Canvas.ctx.beginPath();
    Canvas.ctx.moveTo(locations[0].x, locations[0].y);

    const segments = smoothPoints(locations, 0.25);
    segments.forEach((seg) => {
      Canvas.ctx.bezierCurveTo(seg.cp1.x, seg.cp1.y, seg.cp2.x, seg.cp2.y, seg.end.x, seg.end.y);
    });
    Canvas.ctx.lineWidth = width;
    Canvas.ctx.lineJoin = "round";
    Canvas.ctx.strokeStyle = color.toString();
    Canvas.ctx.stroke();
  }

  function smoothPoints(points: Vector[], tension = 0.5) {
    const smoothed = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      // 计算控制点（基于前后点位置）
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      // 添加三次贝塞尔曲线段
      smoothed.push({
        type: "bezier",
        cp1: { x: cp1x, y: cp1y },
        cp2: { x: cp2x, y: cp2y },
        end: p2,
      });
    }
    return smoothed;
  }

  /**
   * 画一段折线，带有宽度实时变化
   * 实测发现有宽度变化，频繁变更粗细会导致渲染卡顿
   * @param locations
   * @param color
   * @param widthList
   */
  export function renderSolidLineMultipleWithWidth(locations: Vector[], color: Color, widthList: number[]): void {
    Canvas.ctx.beginPath();
    Canvas.ctx.lineJoin = "round";
    Canvas.ctx.lineWidth = widthList[0];
    Canvas.ctx.moveTo(locations[0].x, locations[0].y);
    for (let i = 1; i < locations.length; i++) {
      Canvas.ctx.lineTo(locations[i].x, locations[i].y);
      // Canvas.ctx.stroke();
    }
    Canvas.ctx.strokeStyle = color.toString();
    Canvas.ctx.stroke();
    // Canvas.ctx.strokeStyle = color.toString();
    // Canvas.ctx.beginPath();
    // for (let i = 0; i < locations.length - 1; i++) {
    //   const start = locations[i];
    //   const end = locations[i + 1];
    //   Canvas.ctx.lineWidth = widthList[i + 1];
    //   Canvas.ctx.moveTo(start.x, start.y);
    //   Canvas.ctx.lineTo(end.x, end.y);
    //   Canvas.ctx.stroke();
    // }
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
  export function renderDashedLine(start: Vector, end: Vector, color: Color, width: number, dashLength: number): void {
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
  export function renderBezierCurve(curve: CubicBezierCurve, color: Color, width: number): void {
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
  export function renderSymmetryCurve(curve: SymmetryCurve, color: Color, width: number): void {
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
    const gradient = Canvas.ctx.createLinearGradient(start.x, start.y, end.x, end.y);
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
   * 绘制一条颜色渐变的贝塞尔曲线
   * @param curve
   */
  export function renderGradientBezierCurve(
    curve: CubicBezierCurve,
    startColor: Color,
    endColor: Color,
    width: number,
  ): void {
    const gradient = Canvas.ctx.createLinearGradient(curve.start.x, curve.start.y, curve.end.x, curve.end.y);
    // 添加颜色
    gradient.addColorStop(0, startColor.toString()); // 起始颜色
    gradient.addColorStop(1, endColor.toString()); // 结束颜色
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
    Canvas.ctx.strokeStyle = gradient;
    Canvas.ctx.stroke();
  }
}
