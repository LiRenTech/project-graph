import { Color } from "../../Color";
import { Vector } from "../../Vector";
import { Stage } from "../../stage/Stage";
import { RenderUtils } from "./RenderUtils";
import { EffectRenderer } from "./EffectRenderer";
import { Canvas } from "../../Canvas";
import { TextRiseEffect } from "../../effect/concrete/TextRiseEffect";
import { NodeManager } from "../../NodeManager";
import { appScale } from "../../../utils/platform";
import { Rectangle } from "../../Rectangle";
import { Camera } from "../../stage/Camera";
import { Controller } from "../../controller/Controller";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";

/**
 * 渲染器
 */
export namespace Renderer {
  export const FONT_SIZE = 32;
  export const NODE_PADDING = 14;
  export let w = 0;
  export let h = 0;
  let canvasRect: Rectangle;
  export let renderedNodes: number = 0;
  export let renderedEdges: number = 0;

  /**
   * 解决Canvas模糊问题
   */
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

    canvasRect = new Rectangle(
      Camera.location.subtract(
        new Vector(w / 2, h / 2).multiply(1 / Camera.currentScale),
      ), // 计算左上角在世界坐标中的位置
      new Vector(w, h).divide(Camera.currentScale), // 缩放后的大小
    );

    // 画网格
    renderGrid();

    renderEdges();
    renderEntities();
    // 框选框
    if (Stage.isSelecting) {
      if (Stage.selectingRectangle) {
        RenderUtils.renderRect(
          Stage.selectingRectangle.transformWorld2View(),
          new Color(255, 255, 255, 0.1),
          new Color(255, 255, 255, 0.5),
          1,
        );
      }
    }

    // 画详细信息
    renderDetails();

    // 渲染所有特效
    renderEffects();
  }

  export function renderEntities() {
    renderedNodes = 0;
    for (const node of NodeManager.nodes) {
      if (!canvasRect.isCollideWith(node.rectangle)) {
        continue;
      }

      RenderUtils.renderRect(
        new Rectangle(
          transformWorld2View(node.rectangle.location),
          node.rectangle.size.multiply(Camera.currentScale),
        ),
        new Color(0, 0, 0, 0.5),
        new Color(255, 255, 255, 0.5),
        2 * Camera.currentScale,
        8 * Camera.currentScale,
      );

      RenderUtils.renderText(
        node.text,
        transformWorld2View(
          node.rectangle.location.add(Vector.same(NODE_PADDING)),
        ),
        FONT_SIZE * Camera.currentScale,
        new Color(255, 255, 255),
      );

      if (node.isSelected) {
        // 在外面增加一个框
        RenderUtils.renderRect(
          new Rectangle(
            transformWorld2View(
              node.rectangle.location.subtract(Vector.same(5)),
            ),
            node.rectangle.size
              .add(Vector.same(10))
              .multiply(Camera.currentScale),
          ),
          new Color(0, 0, 0, 0),
          new Color(255, 255, 255, 0.5),
          2 * Camera.currentScale,
          8 * Camera.currentScale,
        );
      }

      renderedNodes++;
    }
  }

  export function renderEdges() {
    renderedEdges = 0;
    for (const edge of NodeManager.edges) {
      const lineRect = Rectangle.fromPoints(
        edge.source.rectangle.getCenter(),
        edge.target.rectangle.getCenter(),
      );

      // RenderUtils.renderRect(
      //   lineRect,
      //   new Color(255, 255, 255, 0.5),
      //   new Color(255, 255, 255, 0.5),
      //   2 * Camera.currentScale,
      // );
      if (!canvasRect.isCollideWith(lineRect)) {
        continue;
      }
      RenderUtils.renderSolidLine(
        transformWorld2View(edge.source.rectangle.getCenter()),
        transformWorld2View(edge.target.rectangle.getCenter()),
        new Color(255, 255, 255),
        2 * Camera.currentScale,
      );
      // TODO: 这个没用
      RenderUtils.renderArrow(
        transformWorld2View(edge.source.rectangle.getCenter()),
        transformWorld2View(edge.target.rectangle.getCenter()),
        new Color(255, 255, 255),
        2 * Camera.currentScale,
      );

      renderedEdges++;
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
      RenderUtils.renderSolidLine(
        transformWorld2View(new Vector(0, y * gridSize)),
        transformWorld2View(new Vector(1000, y * gridSize)),
        new Color(255, 255, 255, 0.1),
        1,
      );
    }
    for (let x = 0; x < 100; x++) {
      RenderUtils.renderSolidLine(
        transformWorld2View(new Vector(x * gridSize, 0)),
        transformWorld2View(new Vector(x * gridSize, 1000)),
        new Color(255, 255, 255, 0.1),
        1,
      );
    }
  }

  export function renderDetails() {
    // BUG: 似乎点击左上角的时候会像被透明div挡住了一样
    const detailsData = [
      `scale: ${Camera.currentScale.toFixed(2)}`,
      `target: ${Camera.targetScale.toFixed(2)}`,
      `shake: ${Camera.shakeLocation.toString()}`,
      `location: ${Camera.location.x.toFixed(2)}, ${Camera.location.y.toFixed(2)}`,
      // `canvas rect: ${canvasRect.toString()}`,
      `window: ${w}x${h}`,
      `node count: ${renderedNodes} / ${NodeManager.nodes.length}`,
      `edge count: ${renderedEdges} / ${NodeManager.edges.length}`,
      `pressingKeys: ${Controller.pressingKeysString()}`,
      `鼠标按下情况: ${Controller.isMouseDown}`,
      `鼠标上次按下位置: ${Controller.lastMousePressLocationString()}`,
      `鼠标上次松开位置: ${Controller.lastMouseReleaseLocationString()}`,
      `框选框: ${Stage.selectingRectangle}`,
      `正在移动节点: ${Controller.isMovingNode}`
    ];
    for (const line of detailsData) {
      RenderUtils.renderText(
        line,
        new Vector(10, 48 + detailsData.indexOf(line) * 12),
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
