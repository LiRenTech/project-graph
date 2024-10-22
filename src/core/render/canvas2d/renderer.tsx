import { Color } from "../../dataStruct/Color";
import { Vector } from "../../dataStruct/Vector";
import { Stage } from "../../stage/Stage";
import { RenderUtils } from "./RenderUtils";
import { EffectRenderer } from "./EffectRenderer";
import { Canvas } from "../../stage/Canvas";
import { TextRiseEffect } from "../../effect/concrete/TextRiseEffect";
import { StageManager } from "../../stage/stageManager/StageManager";
import { appScale } from "../../../utils/platform";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Camera } from "../../stage/Camera";
import { Controller } from "../../controller/Controller";
import { CircleFlameEffect } from "../../effect/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../effect/concrete/LineCuttingEffect";
import { LineEffect } from "../../effect/concrete/LineEffect";
import { ViewFlashEffect } from "../../effect/concrete/ViewFlashEffect";
import { RectangleNoteEffect } from "../../effect/concrete/RectangleNoteEffect";
import { StageHistoryManager } from "../../stage/stageManager/concreteMethods/StageHistoryManager";
import { EntityRenderer } from "./entityRenderer/EntityRenderer";
import { EdgeRenderer } from "./entityRenderer/edge/EdgeRenderer";
import { Settings } from "../../Settings";
import { ExplodeAshEffect } from "../../effect/concrete/ExplodeDashEffect";
import { NodeMoveShadowEffect } from "../../effect/concrete/NodeMoveShadowEffect";

/**
 * 渲染器
 */
export namespace Renderer {
  /**
   * 节点上的文字大小
   */
  export const FONT_SIZE = 32;
  /**
   * 节点详细信息的文字大小
   */
  export const FONT_SIZE_DETAILS = 18;
  export const NODE_PADDING = 14;
  /// 节点的圆角半径
  export const NODE_ROUNDED_RADIUS = 8;
  /**
   * 节点详细信息最大宽度
   */
  export const NODE_DETAILS_WIDTH = 200;

  export let w = 0;
  export let h = 0;
  // let canvasRect: Rectangle;
  export let renderedNodes: number = 0;
  export let renderedEdges: number = 0;

  /**
   * 记录每一项渲染的耗时
   * {
   *   [渲染项的名字]: ?ms
   * }
   */
  let timings: { [key: string]: number } = {};
  export let deltaTime = 0;

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

  let isShowDebug = true;
  let isShowGrid = true;
  // 确保这个函数在软件打开的那一次调用
  export function init() {
    Settings.watch("showDebug", (value) => (isShowDebug = value));
    Settings.watch("showGrid", (value) => (isShowGrid = value));
  }

  /**
   * 渲染总入口
   * @returns
   */
  export function frameTick() {
    timings = {};
    let start = performance.now();
    Camera.frameTick();
    timings.camera = performance.now() - start;

    Canvas.ctx.clearRect(0, 0, w, h);

    // 画网格
    start = performance.now();
    if (isShowGrid) {
      renderGrid();
    }
    timings.grid = performance.now() - start;

    const viewRectangle = getCoverWorldRectangle();
    // 画节点和边
    start = performance.now();
    renderEdges(viewRectangle);
    timings.edges = performance.now() - start;

    start = performance.now();

    renderEntities(viewRectangle);
    // 待删除的节点和边
    renderWarningEntities();
    // 鼠标hover的边
    for (const edge of Stage.hoverEdges) {
      EdgeRenderer.renderHoverShadow(edge);
    }
    timings.entities = performance.now() - start;

    start = performance.now();
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
      for (const node of StageManager.getTextNodes()) {
        if (node.rectangle.isPointIn(Controller.lastMoveLocation)) {
          connectTargetNode = node;
          break;
        }
      }
      if (connectTargetNode === null) {
        for (const node of Stage.connectFromNodes) {
          EdgeRenderer.renderVirtualEdge(node, Controller.lastMoveLocation);
        }
      } else {
        // 画一条像吸住了的线
        for (const node of Stage.connectFromNodes) {
          EdgeRenderer.renderVirtualConfirmedEdge(node, connectTargetNode);
        }
      }
    }
    if (Stage.isDraggingFile) {
      RenderUtils.renderRect(
        Renderer.getCoverWorldRectangle().transformWorld2View(),
        new Color(0, 0, 0, 0.5),
        Color.Transparent,
        1,
      );
      RenderUtils.renderCircle(
        transformWorld2View(Stage.draggingLocation),
        100,
        Color.Transparent,
        Color.White,
        2,
      );
    }
    // 纯键盘操作相关的
    renderKeyboardOnly();

    // 画粘贴板上的信息
    renderClipboard();

    // 画详细信息
    if (isShowDebug) {
      renderDetails();
    }

    // 渲染所有特效
    renderEffects();
    // test

    timings.others = performance.now() - start;
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
      EdgeRenderer.renderWarningShadow(edge);
    }
  }
  /**
   * 渲染和纯键盘操作相关的功能
   */
  function renderKeyboardOnly() {
    if (Stage.isVirtualNewNodeShow) {
      for (const node of StageManager.getTextNodes()) {
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

  export function renderEntities(viewRectangle: Rectangle) {
    renderedNodes = 0;
    for (const node of StageManager.getTextNodes()) {
      // 过滤掉超出视野的节点
      if (!viewRectangle.isCollideWith(node.rectangle)) {
        continue;
      }
      EntityRenderer.renderNode(node);
      renderedNodes++;
    }
    for (const section of StageManager.getSections()) {
      if (!viewRectangle.isCollideWith(section.rectangle)) {
        continue;
      }
      EntityRenderer.renderSection(section);
    }
  }

  export function renderEdges(viewRectangle: Rectangle) {
    renderedEdges = 0;
    for (const edge of StageManager.getEdges()) {
      if (!edge.isBodyLineIntersectWithRectangle(viewRectangle)) {
        continue;
      }
      EdgeRenderer.renderEdge(edge);
      renderedEdges++;
    }
  }

  export function renderClipboard() {
    if (Stage.copyBoardData.nodes.length === 0) {
      return;
    }
    // 粘贴板有内容
    // 获取粘贴板中所有节点的外接矩形
    if (Stage.copyBoardDataRectangle) {
      // 画一个原位置
      RenderUtils.renderRect(
        Stage.copyBoardDataRectangle.transformWorld2View(),
        Color.Transparent,
        new Color(255, 255, 255, 0.5),
        1,
      );
      // 在原位置下写标注
      RenderUtils.renderText(
        "ctrl+shift+v 原位置叠加粘贴",
        transformWorld2View(
          new Vector(
            Stage.copyBoardDataRectangle.location.x,
            Stage.copyBoardDataRectangle.location.y +
              Stage.copyBoardDataRectangle.size.y +
              20,
          ),
        ),
        12 * Camera.currentScale,
        new Color(255, 255, 255, 0.5),
      );
      // 画一个鼠标位置
      RenderUtils.renderRect(
        new Rectangle(
          Stage.copyBoardDataRectangle.location.add(Stage.copyBoardMouseVector),
          Stage.copyBoardDataRectangle.size,
        ).transformWorld2View(),
        Color.Transparent,
        new Color(156, 220, 254, 0.5),
        1,
      );
      // 写下标注
      RenderUtils.renderText(
        "ctrl+v 粘贴到鼠标位置，在没有选择节点时ctrl+c清空粘贴板",
        transformWorld2View(
          new Vector(
            Stage.copyBoardDataRectangle.location.x +
              Stage.copyBoardMouseVector.x,
            Stage.copyBoardDataRectangle.location.y +
              Stage.copyBoardDataRectangle.size.y +
              Stage.copyBoardMouseVector.y +
              20,
          ),
        ),
        12 * Camera.currentScale,
        new Color(156, 220, 254, 0.5),
      );
      for (const node of Stage.copyBoardData.nodes) {
        RenderUtils.renderRect(
          new Rectangle(
            new Vector(...node.location).add(Stage.copyBoardMouseVector),
            new Vector(...node.size),
          ).transformWorld2View(),
          Color.Transparent,
          new Color(156, 220, 254, 0.5),
          2 * Camera.currentScale,
        );
      }
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
      } else if (effect instanceof RectangleNoteEffect) {
        EffectRenderer.renderRectangleNoteEffect(effect);
      } else if (effect instanceof ExplodeAshEffect) {
        EffectRenderer.renderExplodeAshEffect(effect);
      } else if (effect instanceof NodeMoveShadowEffect) {
        EffectRenderer.renderNodeMoveShadowEffect(effect);
      }
    }
  }
  export function renderGrid() {
    const gap = 50;
    let currentGap = gap;
    if (Camera.currentScale < 1) {
      while (currentGap * Camera.currentScale < gap - 1) {
        currentGap *= 2;
      }
    }
    const gridColor = new Color(255, 255, 255, 0.2);
    const mainColor = new Color(255, 255, 255, 0.3);

    const viewRect = getCoverWorldRectangle();
    let yStart = viewRect.location.y - (viewRect.location.y % currentGap);
    while (yStart < viewRect.bottom) {
      let xStart = viewRect.location.x - (viewRect.location.x % currentGap);
      while (xStart < viewRect.right) {
        RenderUtils.renderCircle(
          transformWorld2View(new Vector(xStart, yStart)),
          1,
          xStart === 0 || yStart === 0? mainColor : gridColor,
          Color.Transparent,
          0,
        );
        xStart += currentGap;
      }
      yStart += currentGap;
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
      `node count: ${renderedNodes} , ${StageManager.getTextNodes().length}`,
      `edge count: ${renderedEdges} , ${StageManager.getEdges().length}`,
      `section count: ${StageManager.getSections().length}`,
      `selected nodeCount: ${StageManager.selectedNodeCount}`,
      `selected edgeCount: ${StageManager.selectedEdgeCount}`,
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
      `历史: ${StageHistoryManager.statusText()}`,
      `fps: ${(1 / deltaTime).toFixed()}`,
      `delta: ${deltaTime.toFixed(2)}`,
    ];
    for (const [k, v] of Object.entries(timings)) {
      detailsData.push(`time:${k}: ${v.toFixed(2)}`);
    }
    for (const line of detailsData) {
      RenderUtils.renderText(
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
      const removeElement = () => {
        if (document.body.contains(inputElement)) {
          try {
            // 暂时关闭频繁弹窗报错。
            document.body.removeChild(inputElement);
          } catch (error) {
            console.error(error);
          }
        }
      };

      const onOutsideClick = (event: MouseEvent) => {
        if (!inputElement.contains(event.target as Node)) {
          resolve(inputElement.value);
          onChange(inputElement.value);
          document.body.removeEventListener("click", onOutsideClick);
          removeElement();
        }
      };
      const onOutsideWheel = () => {
        resolve(inputElement.value);
        onChange(inputElement.value);
        document.body.removeEventListener("click", onOutsideClick);
        removeElement();
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
        removeElement();
      });
      inputElement.addEventListener("keydown", (event) => {
        event.stopPropagation();
        if (event.key === "Enter") {
          resolve(inputElement.value);
          onChange(inputElement.value);
          document.body.removeEventListener("click", onOutsideClick);
          removeElement();
        }
      });
    });
  }
  /**
   * 创建一个输入框
   */
  export function textarea(
    location: Vector,
    defaultValue: string,
    onChange: (value: string) => void = () => {},
    style: Partial<CSSStyleDeclaration> = {},
  ): Promise<string> {
    return new Promise((resolve) => {
      const inputElement = document.createElement("textarea");
      // inputElement.type = "text";
      inputElement.value = defaultValue;
      inputElement.style.position = "fixed";
      inputElement.style.top = `${location.y}px`;
      inputElement.style.left = `${location.x}px`;
      inputElement.style.fontSize = `${Renderer.FONT_SIZE_DETAILS}px`;
      Object.assign(inputElement.style, style);
      document.body.appendChild(inputElement);
      inputElement.focus();
      inputElement.select();
      const removeElement = () => {
        if (document.body.contains(inputElement)) {
          try {
            // 暂时关闭频繁弹窗报错。
            document.body.removeChild(inputElement);
          } catch (error) {
            console.error(error);
          }
        }
      };

      const onOutsideClick = (event: MouseEvent) => {
        if (!inputElement.contains(event.target as Node)) {
          resolve(inputElement.value);
          onChange(inputElement.value);
          document.body.removeEventListener("click", onOutsideClick);
          removeElement();
        }
      };
      const onOutsideWheel = () => {
        resolve(inputElement.value);
        onChange(inputElement.value);
        document.body.removeEventListener("click", onOutsideClick);
        removeElement();
      };

      setTimeout(() => {
        // 延迟10毫秒，防止鼠标点击事件先触发
        document.body.addEventListener("click", onOutsideClick);
        document.body.addEventListener("wheel", onOutsideWheel);
      }, 10);

      inputElement.addEventListener("input", () => {
        onChange(inputElement.value);
      });

      inputElement.addEventListener("blur", () => {
        // 失去交点
        resolve(inputElement.value);
        onChange(inputElement.value);
        document.body.removeEventListener("click", onOutsideClick);
        removeElement();
      });
      // inputElement.addEventListener("keydown", (event) => {
      //   event.stopPropagation();
      //   if (event.key === "Enter") {
      //     resolve(inputElement.value);
      //     onChange(inputElement.value);
      //     document.body.removeEventListener("click", onOutsideClick);
      //     removeElement();
      //   }
      // });
    });
  }
}
