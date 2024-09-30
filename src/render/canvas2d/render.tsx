import Color from "../../core/Color";
import CircleFlameEffect from "../../core/effect/concrete/circleFlameEffect";
import { Vector } from "../../core/Vector";
import { Stage } from "../../stage/Stage";
import { RenderEffect } from "./renderEffect";
import { RenderUtils } from "./renderUtils";

/**
 * 渲染器
 */
export class Render {
  constructor(
    public canvasElement: HTMLCanvasElement,
    public w: number,
    public h: number,
    public stage: Stage,
    public ctx: CanvasRenderingContext2D,
  ) {
    // 初始化操作
    this.resizeWindow(w, h);
  }

  resizeWindow(w: number, h: number) {
    const pixelRatio = window.devicePixelRatio;
    this.w = w;
    this.h = h;
    this.canvasElement.width = w * window.devicePixelRatio;
    this.canvasElement.height = h * window.devicePixelRatio;
    this.canvasElement.style.width = `${w}px`;
    this.canvasElement.style.height = `${h}px`;
    if (this.ctx) {
      this.ctx.scale(pixelRatio, pixelRatio);
    }
  }

  /**
   * 渲染总入口
   * @returns
   */
  frameTick() {
    if (!this.ctx) {
      return;
    }
    this.ctx.clearRect(0, 0, this.w, this.h);

    // 画一个2b2b2b的背景
    this.ctx.fillStyle = "#2b2b2b";
    this.ctx.fillRect(0, 0, this.w, this.h);
    // 画网格
    this.rendGrid();
    // 画详细信息
    this.rendDetails();

    // 渲染所有特效
    for (const effect of this.stage.effects) {
      if (effect instanceof CircleFlameEffect) {
        RenderEffect.rendCircleFlameEffect(this, effect);
      }
    }
  }

  rendGrid() {
    const gridSize = 32;
    for (let y = 0; y < 100; y++) {
      RenderUtils.rendSolidLine(
        this.ctx,
        new Vector(0, y * gridSize),
        new Vector(this.w, y * gridSize),
        new Color(255, 255, 255, 0.1),
        1,
      );
    }
    for (let x = 0; x < 100; x++) {
      RenderUtils.rendSolidLine(
        this.ctx,
        new Vector(x * gridSize, 0),
        new Vector(x * gridSize, this.h),
        new Color(255, 255, 255, 0.1),
        1,
      );
    }
  }

  rendDetails() {
    RenderUtils.rendTextFromLeftTop(
      this.ctx,
      `w: ${this.w}, h: ${this.h}`,
      new Vector(10, 80),
      12,
    );
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
