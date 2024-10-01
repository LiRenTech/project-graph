import { Color } from "../../Color";
import { CircleFlameEffect } from "../../effect/concrete/circleFlameEffect";
import { Vector } from "../../Vector";
import { Stage } from "../../stage/Stage";
import { RenderUtils } from "./RenderUtils";
import { EffectRenderer } from "./EffectRenderer";
import { Canvas } from "../../Canvas";
import { TextRiseEffect } from "../../effect/concrete/textRiseEffect";
import { NodeManager } from "../../NodeManager";
import { appScale } from "../../../utils/platform";
import { Rectangle } from "../../Rectangle";
import { Camera } from "../../stage/Camera";

/**
 * 渲染器
 */
export namespace Renderer {
  export const FONT_SIZE = 32;
  export const NODE_PADDING = 14;
  export let w = 0;
  export let h = 0;

  export function resizeWindow(newW: number, newH: number) {
    // HACK: 这里写的什么东西，我不知道，但是它能让画布的大小和屏幕的大小保持一致
    const scale = window.devicePixelRatio * (1 / appScale);
    w = newW;
    h = newH;
    Canvas.element.width = newW * scale;
    Canvas.element.height = newH * scale;
    Canvas.element.style.width = `${newW * (1 / appScale)}px`;
    Canvas.element.style.height = `${newH * (1 / appScale)}px`;
    Canvas.ctx.scale(scale, scale);
  }

  /**
   * 渲染总入口
   * @returns
   */
  export function frameTick() {
    Camera.frameTick();

    Canvas.ctx.clearRect(0, 0, w, h);

    // 画一个2b2b2b的背景
    Canvas.ctx.fillStyle = "#2b2b2b";
    Canvas.ctx.fillRect(0, 0, w, h);
    // 画网格
    renderGrid();

    renderEntities();

    // 画详细信息
    renderDetails();

    // 渲染所有特效
    renderEffects();
  }

  export function renderEntities() {
    const canvasRect = new Rectangle(
      Camera.location.subtract(
        new Vector(w, h).divide(2).multiply(1 / Camera.currentScale),
      ),
      new Vector(w, h).multiply(1 / Camera.currentScale),
    );

    for (const node of NodeManager.nodes) {
      if (!canvasRect.intersects(node.rectangle)) {
        continue;
      }

      RenderUtils.renderRect(
        Canvas.ctx,
        new Rectangle(
          transformWorld2View(node.rectangle.location),
          node.rectangle.size
            .add(Vector.same(NODE_PADDING).multiply(2))
            .multiply(Camera.currentScale),
        ),
        new Color(0, 0, 0, 0.5),
        new Color(255, 255, 255, 0.5),
        2 * Camera.currentScale,
        8 * Camera.currentScale,
      );

      RenderUtils.renderText(
        Canvas.ctx,
        node.text,
        transformWorld2View(
          node.rectangle.location.add(Vector.same(NODE_PADDING)),
        ),
        FONT_SIZE * Camera.currentScale,
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
  //   const metrics = Canvas.ctx.measureText(text);
  //   const textWidth = metrics.width;
  //   const textHeight =
  //     metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  //   return new Vector(textWidth, textHeight);
  // }

  export function renderEffects() {
    for (const effect of Stage.effects) {
      if (effect instanceof CircleFlameEffect) {
        EffectRenderer.renderCircleFlameEffect(effect);
      } else if (effect instanceof TextRiseEffect) {
        EffectRenderer.renderTextRiseEffect(effect);
      }
    }
  }
  export function renderGrid() {
    const gridSize = 100;
    for (let y = 0; y < 100; y++) {
      RenderUtils.rendSolidLine(
        Canvas.ctx,
        transformWorld2View(new Vector(0, y * gridSize)),
        transformWorld2View(new Vector(1000, y * gridSize)),
        new Color(255, 255, 255, 0.1),
        1,
      );
    }
    for (let x = 0; x < 100; x++) {
      RenderUtils.rendSolidLine(
        Canvas.ctx,
        transformWorld2View(new Vector(x * gridSize, 0)),
        transformWorld2View(new Vector(x * gridSize, 1000)),
        new Color(255, 255, 255, 0.1),
        1,
      );
    }
  }

  export function renderDetails() {
    const detailsData = [
      `scale: ${Camera.currentScale.toFixed(2)}`,
      `target: ${Camera.targetScale.toFixed(2)}`,
      `shake: ${Camera.shakeLocation.toString()}`,
      `location: ${Camera.location.x.toFixed(2)}, ${Camera.location.y.toFixed(2)}`,
      `window: ${w}x${h}`,
      `node count: ${NodeManager.nodes.length}`,
      `accelerate: ${Camera.accelerateCommander}`,
      `speed: ${Camera.speed}`,
    ];
    for (const line of detailsData) {
      RenderUtils.renderText(
        Canvas.ctx,
        line,
        new Vector(10, 80 + detailsData.indexOf(line) * 12),
        10,
        new Color(255, 255, 255, 0.5),
      );
    }
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
  export function transformWorld2View(worldLocation: Vector): Vector {
    return worldLocation
      .subtract(Camera.location)
      .multiply(Camera.currentScale)
      .add(new Vector(w / 2, h / 2))
      .add(Camera.shakeLocation);
  }

  /**
   * 将视野坐标转换为世界坐标 (处理鼠标点击事件用)
   * 上一个函数的相反，就把上一个顺序倒着来就行了
   * worldLocation = viewLocation + renderLocation
   * @param viewLocation
   * @returns
   */
  export function transformView2World(viewLocation: Vector): Vector {
    return viewLocation
      .subtract(Camera.shakeLocation)
      .subtract(new Vector(w / 2, h / 2))
      .multiply(1 / Camera.currentScale)
      .add(Camera.location);
  }
}
