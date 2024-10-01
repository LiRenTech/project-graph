import Color from "../../Color";
import CircleFlameEffect from "../../effect/concrete/circleFlameEffect";
import { Vector } from "../../Vector";
import { Stage } from "../../stage/Stage";
import { RenderUtils } from "./RenderUtils";
import { RenderEffect } from "./RenderEffect";
import { Canvas } from "../../Canvas";
import TextRiseEffect from "../../effect/concrete/textRiseEffect";
import { NodeManager } from "../../NodeManager";

/**
 * 渲染器
 */
export class Renderer {
  constructor(
    public canvas: Canvas,
    public w: number,
    public h: number,
    public stage: Stage,
  ) {
    // 初始化操作
    this.resizeWindow(w, h);
  }

  resizeWindow(w: number, h: number) {
    const pixelRatio = window.devicePixelRatio;
    this.w = w;
    this.h = h;
    this.canvas.element.width = w * window.devicePixelRatio;
    this.canvas.element.height = h * window.devicePixelRatio;
    this.canvas.element.style.width = `${w}px`;
    this.canvas.element.style.height = `${h}px`;
    this.canvas.ctx.scale(pixelRatio, pixelRatio);
  }

  /**
   * 渲染总入口
   * @returns
   */
  frameTick() {
    this.stage.camera.frameTick();

    this.canvas.ctx.clearRect(0, 0, this.w, this.h);

    // 画一个2b2b2b的背景
    this.canvas.ctx.fillStyle = "#2b2b2b";
    this.canvas.ctx.fillRect(0, 0, this.w, this.h);
    // 画网格
    this.renderGrid();

    this.renderEntities();

    // 画详细信息
    this.renderDetails();

    // 渲染所有特效
    this.renderEffects();
  }

  renderEntities() {
    for (const node of NodeManager.nodes) {
      RenderUtils.rendRectFromLeftTop(
        this.canvas.ctx,
        this.transformWorld2View(node.location),
        node.size.x * this.stage.camera.currentScale,
        node.size.y * this.stage.camera.currentScale,
        new Color(0, 0, 0, 0.5),
        new Color(255, 255, 255, 0.5),
        2 * this.stage.camera.currentScale,
      );

      RenderUtils.rendTextFromLeftTop(
        this.canvas.ctx,
        node.text,
        this.transformWorld2View(node.location),
        100 * this.stage.camera.currentScale,
        new Color(255, 255, 255),
      );
    }
  }

  // /**
  //  * 获取最终要渲染的文字的大小，返回的是视野坐标系下的大小
  //  * @param text
  //  * @returns
  //  */
  // private getTextRectSize(text: string): Vector {
  //   const metrics = this.canvas.ctx.measureText(text);
  //   const textWidth = metrics.width;
  //   const textHeight =
  //     metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  //   return new Vector(textWidth, textHeight);
  // }

  renderEffects() {
    for (const effect of this.stage.effects) {
      if (effect instanceof CircleFlameEffect) {
        RenderEffect.rendCircleFlameEffect(this, effect);
      } else if (effect instanceof TextRiseEffect) {
        RenderEffect.rendTextRiseEffect(this, effect);
      }
    }
  }
  renderGrid() {
    const gridSize = 100;
    for (let y = 0; y < 100; y++) {
      RenderUtils.rendSolidLine(
        this.canvas.ctx,
        this.transformWorld2View(new Vector(0, y * gridSize)),
        this.transformWorld2View(new Vector(1000, y * gridSize)),
        new Color(255, 255, 255, 0.1),
        1,
      );
    }
    for (let x = 0; x < 100; x++) {
      RenderUtils.rendSolidLine(
        this.canvas.ctx,
        this.transformWorld2View(new Vector(x * gridSize, 0)),
        this.transformWorld2View(new Vector(x * gridSize, 1000)),
        new Color(255, 255, 255, 0.1),
        1,
      );
    }
  }

  renderDetails() {
    const detailsData = [
      `scale: ${this.cameraCurrentScale.toFixed(2)}`,
      `target: ${this.cameraTargetScale.toFixed(2)}`,
      `shake: ${this.stage.camera.shakeLocation.toString()}`,
      `location: ${this.stage.camera.location.x.toFixed(2)}, ${this.stage.camera.location.y.toFixed(2)}`,
      `window: ${this.w}x${this.h}`,
      `node count: ${NodeManager.nodes.length}`,
    ];
    for (const line of detailsData) {
      RenderUtils.rendTextFromLeftTop(
        this.canvas.ctx,
        line,
        new Vector(10, 80 + detailsData.indexOf(line) * 12),
        10,
        new Color(255, 255, 255, 0.5),
      );
    }
  }

  get cameraCurrentScale(): number {
    return this.stage.camera.currentScale;
  }

  get cameraTargetScale(): number {
    return this.stage.camera.targetScale;
  }

  /**
   * 将世界坐标转换为视野坐标 (渲染经常用)
   * 可以画图推理出
   * renderLocation + viewLocation = worldLocation
   * 所以
   * viewLocation = worldLocation - renderLocation
   * 但viewLocation是左上角，还要再平移一下
   * @param worldLocation
   * @returns
   */
  transformWorld2View(worldLocation: Vector): Vector {
    return worldLocation
      .subtract(this.stage.camera.location)
      .multiply(this.stage.camera.currentScale)
      .add(new Vector(this.w / 2, this.h / 2))
      .add(this.stage.camera.shakeLocation);
  }

  /**
   * 将视野坐标转换为世界坐标 (处理鼠标点击事件用)
   * 上一个函数的相反，就把上一个顺序倒着来就行了
   * worldLocation = viewLocation + renderLocation
   * @param viewLocation
   * @returns
   */
  public transformView2World(viewLocation: Vector): Vector {
    return viewLocation
      .subtract(this.stage.camera.shakeLocation)
      .subtract(new Vector(this.w / 2, this.h / 2))
      .multiply(1 / this.stage.camera.currentScale)
      .add(this.stage.camera.location);
  }
}
