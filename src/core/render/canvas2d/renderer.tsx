import { getTextSize } from "../../../utils/font";
import { appScale } from "../../../utils/platform";
import { Color, mixColors } from "../../dataStruct/Color";
import { Vector } from "../../dataStruct/Vector";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Settings } from "../../service/Settings";
import { Controller } from "../../service/controller/Controller";
import { sine } from "../../service/effectEngine/mathTools/animateFunctions";
import { KeyboardOnlyEngine } from "../../service/keyboardOnlyEngine/keyboardOnlyEngine";
import { StageStyleManager } from "../../service/stageStyle/StageStyleManager";
import { Camera } from "../../stage/Camera";
import { Canvas } from "../../stage/Canvas";
import { Stage } from "../../stage/Stage";
import { StageHistoryManager } from "../../stage/stageManager/StageHistoryManager";
import { StageManager } from "../../stage/stageManager/StageManager";
import { TextNode } from "../../stage/stageObject/entity/TextNode";
import { CurveRenderer } from "./basicRenderer/curveRenderer";
import { ShapeRenderer } from "./basicRenderer/shapeRenderer";
import { TextRenderer } from "./basicRenderer/textRenderer";
import { CollisionBoxRenderer } from "./entityRenderer/CollisionBoxRenderer";
import { EntityRenderer } from "./entityRenderer/EntityRenderer";
import { EdgeRenderer } from "./entityRenderer/edge/EdgeRenderer";
import { WorldRenderUtils } from "./utilsRenderer/WorldRenderUtils";
import {
  renderCartesianBackground,
  renderDotBackground,
  renderHorizonBackground,
  renderVerticalBackground,
} from "./utilsRenderer/backgroundRenderer";

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
  const timings: { [key: string]: number } = {};

  // eslint-disable-next-line prefer-const
  export let deltaTime = 0;

  // 上一次记录fps的时间
  let lastTime = performance.now();
  // 自上一次记录fps以来的帧数是几
  let frameCount = 0;
  // 上一次记录的fps数值
  export let fps = 0;

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
   * 是否显示各种调试信息文字
   */
  export let isShowDebug = true;
  let isShowBackgroundHorizontalLines = false;
  let isShowBackgroundVerticalLines = false;
  let isShowBackgroundDots = false;
  let isShowBackgroundCartesian = false;
  export let isAlwaysShowDetails = false;
  let isRenderEffect = true;
  export let protectingPrivacy = false;
  let isRenderCenterPointer = true;

  // 确保这个函数在软件打开的那一次调用
  export function init() {
    Settings.watch("showDebug", (value) => (isShowDebug = value));
    Settings.watch("showBackgroundHorizontalLines", (value) => {
      isShowBackgroundHorizontalLines = value;
    });
    Settings.watch("showBackgroundVerticalLines", (value) => {
      isShowBackgroundVerticalLines = value;
    });
    Settings.watch("showBackgroundDots", (value) => {
      isShowBackgroundDots = value;
    });
    Settings.watch("showBackgroundCartesian", (value) => {
      isShowBackgroundCartesian = value;
    });

    Settings.watch(
      "alwaysShowDetails",
      (value) => (isAlwaysShowDetails = value),
    );
    Settings.watch("renderEffect", (value) => (isRenderEffect = value));
    Settings.watch("protectingPrivacy", (value) => (protectingPrivacy = value));
    Settings.watch(
      "isRenderCenterPointer",
      (value) => (isRenderCenterPointer = value),
    );
  }

  /**
   * 渲染总入口
   * 建议此函数内部的调用就像一个清单一样，全是函数（这些函数都不是export的）。
   * @returns
   */
  export function frameTick() {
    const viewRectangle = getCoverWorldRectangle();
    Camera.frameTick();
    Canvas.ctx.clearRect(0, 0, w, h);
    renderBackground();

    // 渲染舞台要素
    if (Camera.limitCameraInCycleSpace) {
      const originCameraLocation = Camera.location.clone();
      const LimitX = Camera.cameraCycleSpaceSizeX;
      const LimitY = Camera.cameraCycleSpaceSizeY;
      for (let yi = -1; yi <= 1; yi++) {
        for (let xi = -1; xi <= 1; xi++) {
          Camera.location.x = originCameraLocation.x + xi * LimitX;
          Camera.location.y = originCameraLocation.y + yi * LimitY;
          renderStageElements(viewRectangle);
        }
      }
      Camera.location = originCameraLocation;
      renderCycleSpaceBorder();
    } else {
      renderStageElements(viewRectangle);
    }

    // 不随摄像机移动的渲染要素
    renderViewElements(viewRectangle);
  }

  function renderCycleSpaceBorder() {
    ShapeRenderer.renderRect(
      new Rectangle(
        Vector.getZero(),
        new Vector(Camera.cameraCycleSpaceSizeX, Camera.cameraCycleSpaceSizeY),
      ).transformWorld2View(),
      Color.Transparent,
      StageStyleManager.currentStyle.SelectRectangleBorderColor,
      2 * Camera.currentScale,
    );
  }

  function renderViewElements(viewRectangle: Rectangle) {
    renderDraggingFileTips();
    renderSpecialKeys();
    renderCenterPointer();
    renderPrivacyBoard(viewRectangle);
    renderViewMoveByClickMiddle(viewRectangle, performance.now());
    renderDebugDetails();
  }

  function renderStageElements(viewRectangle: Rectangle) {
    renderEdges(viewRectangle);
    renderEntities(viewRectangle);
    renderTags();
    renderWarningEntities();
    renderHoverCollisionBox();
    renderSelectingRectangle();
    renderCuttingLine();
    renderConnectingLine();
    rendererLayerMovingLine();
    renderKeyboardOnly();
    renderClipboard();
    renderEffects();
    // renderViewRectangle(viewRectangle);
  }
  // 渲染中心准星
  function renderCenterPointer() {
    if (!isRenderCenterPointer) {
      return;
    }
    const viewCenterLocation = transformWorld2View(Camera.location);
    ShapeRenderer.renderCircle(
      viewCenterLocation,
      1,
      StageStyleManager.currentStyle.GridHeavyColor,
      Color.Transparent,
      0,
    );
    for (let i = 0; i < 4; i++) {
      const degrees = i * 90;
      const shortLineStart = viewCenterLocation.add(
        new Vector(10, 0).rotateDegrees(degrees),
      );
      const shortLineEnd = viewCenterLocation.add(
        new Vector(20, 0).rotateDegrees(degrees),
      );
      CurveRenderer.renderSolidLine(
        shortLineStart,
        shortLineEnd,
        StageStyleManager.currentStyle.GridHeavyColor,
        1,
      );
    }
  }

  // function renderViewRectangle(viewRectangle: Rectangle) {
  //   ShapeRenderer.renderRect(
  //     viewRectangle.transformWorld2View(),
  //     Color.Transparent,
  //     StageStyleManager.currentStyle.SelectRectangleBorderColor,
  //     50,
  //   );
  // }
  function renderPrivacyBoard(viewRectangle: Rectangle) {
    // 画隐私保护边
    if (protectingPrivacy) {
      ShapeRenderer.renderRect(
        viewRectangle.transformWorld2View(),
        Color.Transparent,
        new Color(33, 54, 167, 0.5),
        50,
      );
    }
  }
  /** 鼠标hover的边 */
  function renderHoverCollisionBox() {
    for (const edge of Stage.hoverEdges) {
      CollisionBoxRenderer.render(edge.collisionBox, new Color(0, 255, 0, 0.5));
    }
    for (const section of Stage.hoverSections) {
      CollisionBoxRenderer.render(
        section.collisionBox,
        new Color(0, 255, 0, 0.5),
      );
    }
  }
  /** 中键吸附拖动框 */
  function renderViewMoveByClickMiddle(viewRectangle: Rectangle, tMs: number) {
    if (Controller.isViewMoveByClickMiddle) {
      const color = new Color(23, 159, 255, sine(tMs, 0.2, 0.1, 0.01));
      ShapeRenderer.renderRect(
        viewRectangle.transformWorld2View(),
        Color.Transparent,
        color,
        50,
      );
      TextRenderer.renderText(
        "再次中键取消视野吸附,或移动到窗口边缘",
        new Vector(25, Renderer.h - 25 - 20),
        20,
        new Color(23, 159, 255, sine(tMs, 0.9, 0.7, 0.01)),
      );
    }
  }
  /** 框选框 */
  function renderSelectingRectangle() {
    if (Stage.selectMachine.isUsing) {
      if (Stage.selectMachine.selectingRectangle) {
        ShapeRenderer.renderRect(
          Stage.selectMachine.selectingRectangle.transformWorld2View(),
          StageStyleManager.currentStyle.SelectRectangleFillColor,
          StageStyleManager.currentStyle.SelectRectangleBorderColor,
          1,
        );
      }
    }
  }
  /** 切割线 */
  function renderCuttingLine() {
    if (Stage.cuttingMachine.isUsing && Stage.cuttingMachine.cuttingLine) {
      WorldRenderUtils.renderLaser(
        Stage.cuttingMachine.cuttingLine.start,
        Stage.cuttingMachine.cuttingLine.end,
        2,
        Color.Red,
      );
    }
  }

  /** 手动连接线 */
  function renderConnectingLine() {
    if (
      Stage.connectMachine.connectFromEntities.length > 0 &&
      Controller.lastMoveLocation
    ) {
      // 如果鼠标位置没有和任何节点相交
      let connectTargetNode = null;
      for (const node of StageManager.getConnectableEntity()) {
        if (node.collisionBox.isContainsPoint(Controller.lastMoveLocation)) {
          connectTargetNode = node;
          break;
        }
      }
      if (connectTargetNode === null) {
        for (const node of Stage.connectMachine.connectFromEntities) {
          EdgeRenderer.renderVirtualEdge(node, Controller.lastMoveLocation);
        }
      } else {
        // 画一条像吸住了的线
        for (const node of Stage.connectMachine.connectFromEntities) {
          EdgeRenderer.renderVirtualConfirmedEdge(node, connectTargetNode);
        }
      }
    }
  }

  /** 层级移动时，渲染移动指向线 */
  function rendererLayerMovingLine() {
    if (!Controller.pressingKeySet.has("alt")) {
      return;
    }
    if (StageManager.getSelectedEntities().length === 0) {
      return;
    }
    const selectedEntities = StageManager.getSelectedEntities();
    for (const selectedEntity of selectedEntities) {
      const startLocation = selectedEntity.collisionBox.getRectangle().center;
      const endLocation = Controller.mouseLocation;
      CurveRenderer.renderGradientLine(
        transformWorld2View(startLocation),
        transformWorld2View(endLocation),
        Color.Transparent,
        Color.Green,
        4 * Camera.currentScale,
      );
    }
    TextRenderer.renderTextFromCenter(
      "Jump To",
      transformWorld2View(Controller.mouseLocation).subtract(new Vector(0, 30)),
      16,
      Color.Green,
    );
  }

  /** 拖拽文件进入窗口时的提示效果 */
  function renderDraggingFileTips() {
    if (Stage.isDraggingFile) {
      ShapeRenderer.renderRect(
        Renderer.getCoverWorldRectangle().transformWorld2View(),
        new Color(0, 0, 0, 0.5),
        Color.Transparent,
        1,
      );
      ShapeRenderer.renderCircle(
        transformWorld2View(Stage.draggingLocation),
        100,
        Color.Transparent,
        Color.White,
        2,
      );
    }
  }

  // function renderGrid() {

  // }

  /** 待删除的节点和边 */
  function renderWarningEntities() {
    // 待删除的节点
    for (const node of Stage.cuttingMachine.warningEntity) {
      CollisionBoxRenderer.render(node.collisionBox, new Color(255, 0, 0, 0.5));
    }
    // 待删除的边
    for (const edge of Stage.cuttingMachine.warningEdges) {
      CollisionBoxRenderer.render(edge.collisionBox, new Color(255, 0, 0, 0.5));
    }
    for (const section of Stage.cuttingMachine.warningSections) {
      CollisionBoxRenderer.render(
        section.collisionBox,
        new Color(255, 0, 0, 0.5),
      );
    }
  }

  /** 画所有被标签了的节点的特殊装饰物和缩小视野时的直观显示 */
  function renderTags() {
    for (const tagString of StageManager.TagOptions.getTagUUIDs()) {
      const tagObject = StageManager.getEntitiesByUUIDs([tagString])[0];
      if (!tagObject) {
        continue;
      }
      const rect = tagObject.collisionBox.getRectangle();
      ShapeRenderer.renderPolygonAndFill(
        [
          transformWorld2View(rect.leftTop.add(new Vector(0, 8))),
          transformWorld2View(rect.leftCenter.add(new Vector(-15, 0))),
          transformWorld2View(rect.leftBottom.add(new Vector(0, -8))),
        ],
        new Color(255, 0, 0, 0.5),
        StageStyleManager.currentStyle.StageObjectBorderColor,
        2 * Camera.currentScale,
      );
      if (Camera.currentScale < 0.25 && tagObject instanceof TextNode) {
        const backRect = rect.clone();
        backRect.location = transformWorld2View(rect.center).add(
          new Vector(-rect.size.x / 2, -rect.size.y / 2),
        );
        const rectBgc = StageStyleManager.currentStyle.BackgroundColor.clone();
        rectBgc.a = 0.5;
        ShapeRenderer.renderRect(
          backRect,
          rectBgc,
          StageStyleManager.currentStyle.StageObjectBorderColor,
          1,
          NODE_ROUNDED_RADIUS,
        );
        TextRenderer.renderTextFromCenter(
          tagObject.text,
          transformWorld2View(rect.center),
          FONT_SIZE,
          StageStyleManager.currentStyle.StageObjectBorderColor,
        );
      }
    }
  }
  /**
   * 渲染和纯键盘操作相关的功能
   */
  function renderKeyboardOnly() {
    if (KeyboardOnlyEngine.isCreating()) {
      const isHaveEntity = KeyboardOnlyEngine.isTargetLocationHaveEntity();
      for (const node of StageManager.getTextNodes()) {
        if (node.isSelected) {
          {
            const startLocation = node.rectangle.center;
            const endLocation = KeyboardOnlyEngine.virtualTargetLocation();
            let rate = KeyboardOnlyEngine.getPressTabTimeInterval() / 100;
            rate = Math.min(1, rate);
            const currentLocation = startLocation.add(
              endLocation.subtract(startLocation).multiply(rate),
            );
            WorldRenderUtils.renderLaser(
              startLocation,
              currentLocation,
              2,
              rate < 1 ? Color.Yellow : isHaveEntity ? Color.Blue : Color.Green,
            );
            if (rate === 1 && !isHaveEntity) {
              ShapeRenderer.renderRectFromCenter(
                transformWorld2View(KeyboardOnlyEngine.virtualTargetLocation()),
                120 * Camera.currentScale,
                60 * Camera.currentScale,
                Color.Transparent,
                mixColors(
                  StageStyleManager.currentStyle.StageObjectBorderColor,
                  Color.Transparent,
                  0.5,
                ),
                2 * Camera.currentScale,
                NODE_ROUNDED_RADIUS * Camera.currentScale,
              );
            }
          }
          let hintText = "松开Tab键完成新节点创建,IKJL键移动生成位置";
          if (isHaveEntity) {
            hintText = "连接！";
          }
          // 在生成点下方写文字提示
          TextRenderer.renderText(
            hintText,
            transformWorld2View(
              KeyboardOnlyEngine.virtualTargetLocation().add(new Vector(0, 50)),
            ),
            15 * Camera.currentScale,
            StageStyleManager.currentStyle.StageObjectBorderColor,
          );
        }
      }
    }
  }

  function renderEntities(viewRectangle: Rectangle) {
    renderedNodes = 0;
    for (const entity of StageManager.getEntities()) {
      // 视线之外不画
      if (
        !Camera.limitCameraInCycleSpace &&
        !viewRectangle.isCollideWith(entity.collisionBox.getRectangle())
      ) {
        continue;
        // 这里littlefean居然曾经把continue写成return了，
        // 不知道是一股脑通过代码补全补出来的还是什么原因。
      }
      EntityRenderer.renderEntity(entity);
      renderedNodes++;
    }
  }

  function renderEdges(viewRectangle: Rectangle) {
    renderedEdges = 0;
    for (const edge of StageManager.getLineEdges()) {
      if (
        !Camera.limitCameraInCycleSpace &&
        !edge.isIntersectsWithRectangle(viewRectangle)
      ) {
        continue;
      }
      EdgeRenderer.renderEdge(edge);
      renderedEdges++;
    }
    for (const edge of StageManager.getCrEdges()) {
      if (
        !Camera.limitCameraInCycleSpace &&
        !edge.isIntersectsWithRectangle(viewRectangle)
      ) {
        continue;
      }
      EdgeRenderer.renderCrEdge(edge);
      renderedEdges++;
    }
  }

  /** 画粘贴板上的信息 */
  function renderClipboard() {
    if (Stage.copyBoardData.entities.length === 0) {
      return;
    }
    const clipboardBlue = new Color(156, 220, 254, 0.5);

    // 粘贴板有内容
    // 获取粘贴板中所有节点的外接矩形
    if (Stage.copyBoardDataRectangle) {
      // 画一个原位置
      ShapeRenderer.renderRect(
        Stage.copyBoardDataRectangle.transformWorld2View(),
        Color.Transparent,
        new Color(255, 255, 255, 0.5),
        1,
      );
      // 在原位置下写标注
      TextRenderer.renderText(
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
      ShapeRenderer.renderRect(
        new Rectangle(
          Stage.copyBoardDataRectangle.location.add(Stage.copyBoardMouseVector),
          Stage.copyBoardDataRectangle.size,
        ).transformWorld2View(),
        Color.Transparent,
        clipboardBlue,
        1,
      );
      // 写下标注
      TextRenderer.renderText(
        "ctrl+v 粘贴到鼠标位置，Esc键清空粘贴板",
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
        clipboardBlue,
      );
      for (const entity of Stage.copyBoardData.entities) {
        if (entity.type === "core:connect_point") {
          ShapeRenderer.renderCircle(
            transformWorld2View(new Vector(...entity.location)),
            10 * Camera.currentScale,
            Color.Transparent,
            Color.White,
            2 * Camera.currentScale,
          );
        } else {
          ShapeRenderer.renderRect(
            new Rectangle(
              new Vector(...entity.location).add(Stage.copyBoardMouseVector),
              new Vector(...entity.size),
            ).transformWorld2View(),
            Color.Transparent,
            clipboardBlue,
            2 * Camera.currentScale,
          );
        }
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

  /** 渲染所有特效 */
  function renderEffects() {
    if (!isRenderEffect) {
      return;
    }
    Stage.effectMachine.renderTick();
  }
  function renderBackground() {
    if (isShowBackgroundDots) {
      renderDotBackground(getCoverWorldRectangle());
    }
    if (isShowBackgroundHorizontalLines) {
      renderHorizonBackground(getCoverWorldRectangle());
    }
    if (isShowBackgroundVerticalLines) {
      renderVerticalBackground(getCoverWorldRectangle());
    }
    if (isShowBackgroundCartesian) {
      renderCartesianBackground(getCoverWorldRectangle());
    }
    // renderGridBackground(getCoverWorldRectangle());
  }

  /** 画debug信息 */
  function renderDebugDetails() {
    if (!isShowDebug) {
      return;
    }
    const currentTime = performance.now();
    frameCount++;
    if (currentTime - lastTime > 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime = currentTime;
    }
    const detailsData = [
      `scale: ${Camera.currentScale}`,
      `target: ${Camera.targetScale.toFixed(2)}`,
      `shake: ${Camera.shakeLocation.toString()}`,
      `location: ${Camera.location.x.toFixed(2)}, ${Camera.location.y.toFixed(2)}`,
      // `canvas rect: ${canvasRect.toString()}`,
      `window: ${w}x${h}`,
      `effect count: ${Stage.effectMachine.effectsCount}`,
      `node count: ${renderedNodes} , ${StageManager.getTextNodes().length}`,
      `edge count: ${renderedEdges} , ${StageManager.getLineEdges().length}`,
      `section count: ${StageManager.getSections().length}`,
      `selected nodeCount: ${StageManager.selectedNodeCount}`,
      `selected edgeCount: ${StageManager.selectedEdgeCount}`,
      `pressingKeys: ${Controller.pressingKeysString()}`,
      `鼠标按下情况: ${Controller.isMouseDown}`,
      `鼠标上次按下位置: ${Controller.lastMousePressLocationString()}`,
      `鼠标上次松开位置: ${Controller.lastMouseReleaseLocationString()}`,
      `lastMousePressLocation Right: ${Controller.lastMousePressLocation[2].toString()}`,
      `框选框: ${Stage.selectMachine.selectingRectangle}`,
      `正在移动节点: ${Controller.isMovingEntity}`,
      `正在切割: ${Stage.cuttingMachine.isUsing}`,
      `Stage.warningNodes: ${Stage.cuttingMachine.warningEntity.length}`,
      `Stage.warningEdges: ${Stage.cuttingMachine.warningEdges.length}`,
      `ConnectFromNodes: ${Stage.connectMachine.connectFromEntities}`,
      `lastSelectedNode: ${Controller.lastSelectedEntityUUID.size}`,
      `粘贴板: ${JSON.stringify(Stage.copyBoardData)}`,
      `历史: ${StageHistoryManager.statusText()}`,
      `fps: ${fps}`,
      `delta: ${deltaTime.toFixed(2)}`,
      `Controller.isViewMoveByClickMiddle: ${Controller.isViewMoveByClickMiddle}`,
      `path: ${Stage.Path.getFilePath()}`,
      `autoSavePaused: ${Stage.isAutoSavePaused}`,
      `isEnableEntityCollision: ${StageManager.isEnableEntityCollision}`,
      // `tags: ${StageManager.TagOptions.getTagUUIDs().toString()}`,
    ];
    for (const [k, v] of Object.entries(timings)) {
      detailsData.push(`time:${k}: ${v.toFixed(2)}`);
    }
    for (const line of detailsData) {
      TextRenderer.renderText(
        line,
        new Vector(10, 80 + detailsData.indexOf(line) * 12),
        10,
        StageStyleManager.currentStyle.DetailsDebugTextColor,
      );
    }
  }

  /**
   * 渲染左下角的文字
   * @returns
   */
  function renderSpecialKeys() {
    if (Controller.pressingKeySet.size === 0) {
      return;
    }

    const margin = 10;
    let x = margin;
    const fontSize = 30;

    for (const key of Controller.pressingKeySet) {
      const textLocation = new Vector(x, Renderer.h - 100);
      TextRenderer.renderText(
        key,
        textLocation,
        fontSize,
        StageStyleManager.currentStyle.StageObjectBorderColor,
      );
      const textSize = getTextSize(key, fontSize);
      x += textSize.x + margin;
    }
    if (
      !Camera.allowMoveCameraByWSAD &&
      (Controller.pressingKeySet.has("w") ||
        Controller.pressingKeySet.has("s") ||
        Controller.pressingKeySet.has("a") ||
        Controller.pressingKeySet.has("d"))
    ) {
      TextRenderer.renderText(
        "🔒方向键移动视野被禁止，可设置🔧更改",
        new Vector(margin, Renderer.h - 60),
        15,
        StageStyleManager.currentStyle.effects.flash,
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
}
