import { Color } from "../../../dataStruct/Color";
import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { Canvas } from "../../../stage/Canvas";

/**
 * 一些基础的渲染图形
 * 注意：这些渲染的参数都是View坐标系下的。
 */
export namespace RenderUtils {
  /**
   * 绘制一个像素点
   * @param location
   * @param color
   */
  export function renderPixel(location: Vector, color: Color) {
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fillRect(location.x, location.y, 1 * Camera.currentScale, 1 * Camera.currentScale);
  }

  /**
   * 画箭头（只画头，不画线）
   */
  export function renderArrow(direction: Vector, location: Vector, color: Color, size: number) {
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
    Canvas.ctx.lineTo(location.x - nor.rotate(20).x * arrow_size, location.y - nor.rotate(20).y * arrow_size);
    Canvas.ctx.lineTo(location.x - nor.x * (arrow_size / 2), location.y - nor.y * (arrow_size / 2));
    Canvas.ctx.lineTo(location.x - nor.rotate(-20).x * arrow_size, location.y - nor.rotate(-20).y * arrow_size);
    Canvas.ctx.closePath();
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fill();
  }
}
