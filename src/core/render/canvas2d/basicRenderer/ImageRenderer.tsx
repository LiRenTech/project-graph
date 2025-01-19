import { Vector } from "../../../dataStruct/Vector";
import { Camera } from "../../../stage/Camera";
import { Canvas } from "../../../stage/Canvas";

/**
 * 图片渲染器
 * 基于View坐标系
 */
export namespace ImageRenderer {
  /**
   * 根据图片HTML元素来渲染图片到canvas指定位置
   * @param imageElement
   * @param location 图片左上角位置
   * @param scale 1 表示正常，0.5 表示缩小一半，2 表示放大两倍
   */
  export function renderImageElement(
    imageElement: HTMLImageElement,
    location: Vector,
    scale: number = 1 / (window.devicePixelRatio || 1),
  ) {
    Canvas.ctx.drawImage(
      imageElement,
      location.x,
      location.y,
      imageElement.width * scale * Camera.currentScale,
      imageElement.height * scale * Camera.currentScale,
    );
  }
}
