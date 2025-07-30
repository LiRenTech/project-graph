import { Vector } from "@graphif/data-structures";
import { Project, service } from "@/core/Project";

/**
 * 图片渲染器
 * 基于View坐标系
 */
@service("imageRenderer")
export class ImageRenderer {
  constructor(private readonly project: Project) {}

  /**
   * 根据图片HTML元素来渲染图片到canvas指定位置
   * @param imageElement
   * @param location 图片左上角位置
   * @param scale 1 表示正常，0.5 表示缩小一半，2 表示放大两倍
   */
  renderImageElement(
    imageElement: HTMLImageElement,
    location: Vector,
    scale: number = 1 / (window.devicePixelRatio || 1),
  ) {
    this.project.canvas.ctx.drawImage(
      imageElement,
      location.x,
      location.y,
      imageElement.width * scale * this.project.camera.currentScale,
      imageElement.height * scale * this.project.camera.currentScale,
    );
  }
}
