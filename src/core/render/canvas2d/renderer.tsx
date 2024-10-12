import { Color } from "../../dataStruct/Color";
import { Vector } from "../../dataStruct/Vector";
import { Stage } from "../../stage/Stage";
import { RenderUtils } from "./RenderUtils";
import { EffectRenderer } from "./EffectRenderer";
import { Canvas } from "../../stage/Canvas";
import { TextRiseEffect } from "../../effect/concrete/TextRiseEffect";
import { StageManager } from "../../stage/stageManager/StageManager";
import { appScale } from "../../../utils/platform";
import { Rectangle } from "../../dataStruct/Rectangle";
import { Camera } from "../../stage/Camera";
import { Controller } from "../../controller/Controller";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../effect/concrete/LineCuttingEffect";
import { LineEffect } from "../../effect/concrete/LineEffect";
import { ViewFlashEffect } from "../../effect/concrete/ViewFlashEffect";
import { Line } from "../../dataStruct/Line";

/**
 * 渲染器
 */
export namespace Renderer {
  /**
   * 节点上的文字大小
   */
  export const FONT_SIZE = 32;
  export const NODE_PADDING = 14;
  /**
   * 节点详细信息最大宽度
   */
  export const NODE_DETAILS_WIDTH = 200;

  export let w = 0;
  export let h = 0;
  // let canvasRect: Rectangle;
  export let renderedNodes: number = 0;
  export let renderedEdges: number = 0;
  export let backgroundAlpha = 1;

  /**
   * 解决Canvas模糊问题
   * 它能让画布的大小和屏幕的大小保持一致
   */
  export function resizeWindow(newW: number, newH: number) {
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

    // 画一个背景
    Canvas.ctx.fillStyle = "#111";
    Canvas.ctx.globalAlpha = backgroundAlpha;
    Canvas.ctx.fillRect(0, 0, w, h);
    Canvas.ctx.globalAlpha = 1;

    // 画网格
    renderGrid();
    const viewRectangle = getCoverWorldRectangle();

    renderEdges(viewRectangle);
    renderEntities(viewRectangle);
    // 待删除的节点和边
    renderWarningEntities();

    // 鼠标hover的边
    for (const edge of Stage.hoverEdges) {
      RenderUtils.renderSolidLine(
        transformWorld2View(edge.bodyLine.start),
        transformWorld2View(edge.bodyLine.end),
        new Color(0, 255, 0, 0.1),
        Controller.edgeHoverTolerance * 2 * Camera.currentScale,
      );
    }
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
      RenderUtils.renderGradientLine(
        transformWorld2View(Stage.selectStartLocation),
        transformWorld2View(Stage.selectEndLocation),
        new Color(255, 255, 255, 0),
        new Color(255, 255, 255, 0.5),
        2,
      );
    }
    // 切割线
    if (Stage.isCutting) {
      RenderUtils.renderGradientLine(
        transformWorld2View(Controller.lastMousePressLocation[2]),
        transformWorld2View(Controller.lastMoveLocation),
        new Color(255, 0, 0, 0),
        new Color(255, 0, 0, 1),
        2,
      );
    }
    // 手动连接线
    if (Stage.connectFromNodes.length > 0 && Controller.lastMoveLocation) {
      // 如果鼠标位置没有和任何节点相交
      let connectTargetNode = null;
      for (const node of StageManager.nodes) {
        if (node.rectangle.isPointInside(Controller.lastMoveLocation)) {
          connectTargetNode = node;
          break;
        }
      }
      if (connectTargetNode === null) {
        for (const node of Stage.connectFromNodes) {
          RenderUtils.renderGradientLine(
            transformWorld2View(node.rectangle.getCenter()),
            transformWorld2View(Controller.lastMoveLocation),
            new Color(255, 255, 255, 0),
            new Color(255, 255, 255, 0.5),
            2,
          );
        }
      } else {
        // 画一条像吸住了的线
        for (const node of Stage.connectFromNodes) {
          RenderUtils.renderGradientLine(
            transformWorld2View(node.rectangle.getCenter()),
            transformWorld2View(connectTargetNode.rectangle.getCenter()),
            new Color(255, 255, 255, 0),
            new Color(255, 255, 255, 0.5),
            2,
          );
        }
      }
    }
    // 纯键盘操作相关的
    renderKeyboardOnly();

    // 画详细信息
    renderDetails();

    // 渲染所有特效
    renderEffects();
    // test
  }
  function renderWarningEntities() {
    // 待删除的节点
    for (const node of Stage.warningNodes) {
      RenderUtils.renderRect(
        new Rectangle(
          transformWorld2View(node.rectangle.location),
          node.rectangle.size.multiply(Camera.currentScale),
        ),
        new Color(255, 0, 0, 0.5),
        new Color(255, 0, 0, 0.5),
        2 * Camera.currentScale,
        8 * Camera.currentScale,
      );
    }
    // 待删除的边
    for (const edge of Stage.warningEdges) {
      RenderUtils.renderSolidLine(
        transformWorld2View(edge.source.rectangle.getCenter()),
        transformWorld2View(edge.target.rectangle.getCenter()),
        new Color(255, 0, 0, 0.5),
        2 * Camera.currentScale,
      );
    }
  }
  /**
   * 渲染和纯键盘操作相关的功能
   */
  function renderKeyboardOnly() {
    if (Stage.isVirtualNewNodeShow) {
      for (const node of StageManager.nodes) {
        if (node.isSelected) {
          // 连线
          RenderUtils.renderGradientLine(
            transformWorld2View(node.rectangle.center),
            transformWorld2View(Stage.keyOnlyVirtualNewLocation),
            new Color(255, 255, 255, 0),
            new Color(255, 255, 255, 0.5),
            1,
          );

          RenderUtils.renderCircle(
            transformWorld2View(Stage.keyOnlyVirtualNewLocation),
            25 * Camera.currentScale,
            Color.Transparent,
            Color.White,
            1,
          );
        }
      }
    }
  }

  function colorInvert(color: Color): Color {
    /**
     * 计算背景色的亮度 更精确的人眼感知亮度公式
     * 0.2126 * R + 0.7152 * G + 0.0722 * B，
     * 如果亮度较高，则使用黑色文字，
     * 如果亮度较低，则使用白色文字。
     * 这种方法能够确保无论背景色如何变化，文字都能保持足够的对比度。
     */

    const r = color.r;
    const g = color.g;
    const b = color.b;
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (brightness > 128) {
      return Color.Black; // 返回黑色
    } else {
      return Color.White; // 返回白色
    }
  }

  export function renderEntities(viewRectangle: Rectangle) {
    renderedNodes = 0;
    for (const node of StageManager.nodes) {
      // 过滤掉超出视野的节点
      if (!viewRectangle.isCollideWith(node.rectangle)) {
        continue;
      }

      // 节点身体矩形
      RenderUtils.renderRect(
        new Rectangle(
          transformWorld2View(node.rectangle.location),
          node.rectangle.size.multiply(Camera.currentScale),
        ),
        node.color ?? new Color(33, 33, 33, 1),
        new Color(204, 204, 204, 1),
        2 * Camera.currentScale,
        8 * Camera.currentScale,
      );

      if (!node.isEditing) {
        RenderUtils.renderText(
          node.text,
          transformWorld2View(
            node.rectangle.location.add(Vector.same(NODE_PADDING)),
          ),
          FONT_SIZE * Camera.currentScale,
          node.color ? colorInvert(node.color) : new Color(204, 204, 204),
        );
      }

      if (node.isSelected) {
        // 在外面增加一个框
        RenderUtils.renderRect(
          new Rectangle(
            transformWorld2View(
              node.rectangle.location.subtract(Vector.same(7.5)),
            ),
            node.rectangle.size
              .add(Vector.same(15))
              .multiply(Camera.currentScale),
          ),
          new Color(0, 0, 0, 0),
          new Color(255, 255, 255, 0.5),
          2 * Camera.currentScale,
          16 * Camera.currentScale,
        );
      }

      if (node.details) {
        RenderUtils.renderMultiLineText(
          node.details,
          transformWorld2View(
            node.rectangle.location.add(new Vector(0, node.rectangle.size.y)),
          ),
          FONT_SIZE * Camera.currentScale,
          NODE_DETAILS_WIDTH * Camera.currentScale,
        );
      }

      renderedNodes++;
    }
  }

  export function renderEdges(viewRectangle: Rectangle) {
    renderedEdges = 0;
    for (const edge of StageManager.edges) {
      if (!viewRectangle.isCollideWithLine(edge.bodyLine)) {
        continue;
      }
      if (edge.source.uuid == edge.target.uuid) {
        // 自环
      } else {
        if (edge.text.trim() === "") {
          // 没有文字的边
          RenderUtils.renderSolidLine(
            transformWorld2View(edge.bodyLine.start),
            transformWorld2View(edge.bodyLine.end),
            new Color(204, 204, 204),
            2 * Camera.currentScale,
          );
        } else {
          // 有文字的边
          const midPoint = edge.bodyLine.midPoint();
          const startHalf = new Line(edge.bodyLine.start, midPoint);
          const endHalf = new Line(midPoint, edge.bodyLine.end);
          RenderUtils.renderTextFromCenter(
            edge.text,
            transformWorld2View(midPoint),
            FONT_SIZE * Camera.currentScale,
          );
          const edgeTextRectangle = edge.textRectangle;

          RenderUtils.renderSolidLine(
            transformWorld2View(edge.bodyLine.start),
            transformWorld2View(
              edgeTextRectangle.getLineIntersectionPoint(startHalf),
            ),
            new Color(204, 204, 204),
            2 * Camera.currentScale,
          );
          RenderUtils.renderSolidLine(
            transformWorld2View(edge.bodyLine.end),
            transformWorld2View(
              edgeTextRectangle.getLineIntersectionPoint(endHalf),
            ),
            new Color(204, 204, 204),
            2 * Camera.currentScale,
          );

          // RenderUtils.renderRect(
          //   new Rectangle(
          //     transformWorld2View(edgeTextRectangle.location),
          //     edgeTextRectangle.size.multiply(Camera.currentScale),
          //   ),
          //   Color.Transparent,
          //   Color.White,
          //   2 * Camera.currentScale,
          // );
        }

        // 画箭头
        {
          const size = 15;
          const direction = edge.target.rectangle
            .getCenter()
            .subtract(edge.source.rectangle.getCenter())
            .normalize();
          const reDirection = direction.clone().multiply(-1);
          const location2 = edge.bodyLine.end.add(
            reDirection.multiply(size).rotateDegrees(15),
          );
          const location3 = edge.bodyLine.end.add(
            reDirection.multiply(size * 0.5),
          );
          const location4 = edge.bodyLine.end.add(
            reDirection.multiply(size).rotateDegrees(-15),
          );
          RenderUtils.renderPolygonAndFill(
            [
              Renderer.transformWorld2View(edge.bodyLine.end),
              Renderer.transformWorld2View(location2),
              Renderer.transformWorld2View(location3),
              Renderer.transformWorld2View(location4),
            ],
            new Color(204, 204, 204),
            new Color(204, 204, 204),
            0,
          );
        }

        if (edge.isSelected) {
          RenderUtils.renderSolidLine(
            transformWorld2View(edge.bodyLine.start),
            transformWorld2View(edge.bodyLine.end),
            new Color(0, 255, 0, 0.5),
            4 * Camera.currentScale,
          );
        }
      }

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
      } else if (effect instanceof LineEffect) {
        EffectRenderer.renderLineEffect(effect);
      } else if (effect instanceof LineCuttingEffect) {
        EffectRenderer.renderLineCuttingEffect(effect);
      } else if (effect instanceof ViewFlashEffect) {
        EffectRenderer.renderViewFlashEffect(effect);
      }
    }
  }
  export function renderGrid() {
    let gap = 50;
    if (Camera.currentScale < 1) {
      while (gap * Camera.currentScale < 49) {
        gap *= 2;
      }
    }
    const gridColor = new Color(255, 255, 255, 0.1);
    const mainColor = new Color(255, 255, 255, 0.5);

    const viewRect = getCoverWorldRectangle();
    let yStart = viewRect.location.y - (viewRect.location.y % gap);
    while (yStart < viewRect.bottom) {
      RenderUtils.renderSolidLine(
        transformWorld2View(new Vector(viewRect.left, yStart)),
        transformWorld2View(new Vector(viewRect.right, yStart)),
        yStart === 0 ? mainColor : gridColor,
        1,
      );
      yStart += gap;
    }
    let xStart = viewRect.location.x - (viewRect.location.x % gap);
    while (xStart < viewRect.right) {
      RenderUtils.renderSolidLine(
        transformWorld2View(new Vector(xStart, viewRect.top)),
        transformWorld2View(new Vector(xStart, viewRect.bottom)),
        xStart === 0 ? mainColor : gridColor,
        1,
      );
      xStart += gap;
    }
  }

  export function renderDetails() {
    const detailsData = [
      `scale: ${Camera.currentScale.toFixed(2)}`,
      `target: ${Camera.targetScale.toFixed(2)}`,
      `shake: ${Camera.shakeLocation.toString()}`,
      `location: ${Camera.location.x.toFixed(2)}, ${Camera.location.y.toFixed(2)}`,
      // `canvas rect: ${canvasRect.toString()}`,
      `window: ${w}x${h}`,
      `node count: ${renderedNodes} , ${StageManager.nodes.length}`,
      `edge count: ${renderedEdges} , ${StageManager.edges.length}`,
      `pressingKeys: ${Controller.pressingKeysString()}`,
      `鼠标按下情况: ${Controller.isMouseDown}`,
      `鼠标上次按下位置: ${Controller.lastMousePressLocationString()}`,
      `鼠标上次松开位置: ${Controller.lastMouseReleaseLocationString()}`,
      `框选框: ${Stage.selectingRectangle}`,
      `正在移动节点: ${Controller.isMovingNode}`,
      `正在切割: ${Stage.isCutting}`,
      `Stage.warningNodes: ${Stage.warningNodes.length}`,
      `Stage.warningEdges: ${Stage.warningEdges.length}`,
      `ConnectFromNodes: ${Stage.connectFromNodes}`,
      `lastSelectedNode: ${Controller.lastSelectedNode.size}`,
      `粘贴板: ${JSON.stringify(Stage.copyBoardData)}`,
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

  /**
   * 获取摄像机视野范围内所覆盖住的世界范围矩形
   * 返回的矩形是世界坐标下的矩形
   */
  export function getCoverWorldRectangle(): Rectangle {
    const size = new Vector(w / Camera.currentScale, h / Camera.currentScale);
    return new Rectangle(Camera.location.subtract(size.divide(2)), size);
  }

  /**
   * 创建一个输入框
   */
  export function input(
    location: Vector,
    defaultValue: string,
    onChange: (value: string) => void = () => {},
    style: Partial<CSSStyleDeclaration> = {},
  ): Promise<string> {
    return new Promise((resolve) => {
      const inputElement = document.createElement("input");
      inputElement.type = "text";
      inputElement.value = defaultValue;
      inputElement.style.position = "fixed";
      inputElement.style.top = `${location.y}px`;
      inputElement.style.left = `${location.x}px`;
      Object.assign(inputElement.style, style);
      document.body.appendChild(inputElement);
      inputElement.focus();
      inputElement.select();
      const onOutsideClick = (event: MouseEvent) => {
        if (!inputElement.contains(event.target as Node)) {
          resolve(inputElement.value);
          onChange(inputElement.value);
          document.body.removeEventListener("click", onOutsideClick);
          document.body.removeChild(inputElement);
        }
      };
      const onOutsideWheel = () => {
        resolve(inputElement.value);
        onChange(inputElement.value);
        document.body.removeEventListener("click", onOutsideClick);
        document.body.removeChild(inputElement);
      };
      setTimeout(() => {
        document.body.addEventListener("click", onOutsideClick);
        document.body.addEventListener("wheel", onOutsideWheel);
      }, 10);
      inputElement.addEventListener("input", () => {
        onChange(inputElement.value);
      });
      inputElement.addEventListener("blur", () => {
        resolve(inputElement.value);
        onChange(inputElement.value);
        document.body.removeEventListener("click", onOutsideClick);
        document.body.removeChild(inputElement);
      });
      inputElement.addEventListener("keydown", (event) => {
        event.stopPropagation();
        if (event.key === "Enter") {
          resolve(inputElement.value);
          onChange(inputElement.value);
          document.body.removeEventListener("click", onOutsideClick);
          document.body.removeChild(inputElement);
        }
      });
    });
  }
}
