import { getTextSize } from "../../../utils/font";
import { appScale, isFrame } from "../../../utils/platform";
import { Color, mixColors } from "../../dataStruct/Color";
import { Vector } from "../../dataStruct/Vector";
import { CubicBezierCurve } from "../../dataStruct/shape/Curve";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Settings } from "../../service/Settings";
import { MouseLocation } from "../../service/controlService/MouseLocation";
import { Controller } from "../../service/controlService/controller/Controller";
import { ControllerLayerMoving } from "../../service/controlService/controller/concrete/ControllerEntityLayerMoving";
import { KeyboardOnlyGraphEngine } from "../../service/controlService/keyboardOnlyEngine/keyboardOnlyGraphEngine";
import { CopyEngine } from "../../service/dataManageService/copyEngine/copyEngine";
import { StageStyleManager } from "../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../stage/Camera";
import { Canvas } from "../../stage/Canvas";
import { Stage } from "../../stage/Stage";
import { StageHistoryManager } from "../../stage/stageManager/StageHistoryManager";
import { StageManager } from "../../stage/stageManager/StageManager";
import { StageObjectSelectCounter } from "../../stage/stageManager/concreteMethods/StageObjectSelectCounter";
import { StageObject } from "../../stage/stageObject/abstract/StageObject";
import { CubicCatmullRomSplineEdge } from "../../stage/stageObject/association/CubicCatmullRomSplineEdge";
import { LineEdge } from "../../stage/stageObject/association/LineEdge";
import { MultiTargetUndirectedEdge } from "../../stage/stageObject/association/MutiTargetUndirectedEdge";
import { CurveRenderer } from "./basicRenderer/curveRenderer";
import { ShapeRenderer } from "./basicRenderer/shapeRenderer";
import { SvgRenderer } from "./basicRenderer/svgRenderer";
import { TextRenderer } from "./basicRenderer/textRenderer";
import { TextNodeRenderer } from "./entityRenderer/textNode/TextNodeRenderer";
import { DrawingControllerRenderer } from "./controllerRenderer/drawingRenderer";
import { CollisionBoxRenderer } from "./entityRenderer/CollisionBoxRenderer";
import { EntityRenderer } from "./entityRenderer/EntityRenderer";
import { EdgeRenderer } from "./entityRenderer/edge/EdgeRenderer";
import { MultiTargetUndirectedEdgeRenderer } from "./entityRenderer/multiTargetUndirectedEdge/MultiTargetUndirectedEdgeRenderer";
import { WorldRenderUtils } from "./utilsRenderer/WorldRenderUtils";
import {
  renderCartesianBackground,
  renderDotBackground,
  renderHorizonBackground,
  renderVerticalBackground,
} from "./utilsRenderer/backgroundRenderer";
import { searchContentHighlightRenderer } from "./utilsRenderer/searchContentHighlightRenderer";

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
  export let FONT_SIZE_DETAILS = 18;
  /**
   * 节点详细信息的文字行数限制
   */
  export let ENTITY_DETAILS_LIENS_LIMIT = 4;
  export const NODE_PADDING = 14;
  /// 节点的圆角半径
  export const NODE_ROUNDED_RADIUS = 8;

  /**
   * 节点详细信息最大宽度
   */
  export let ENTITY_DETAILS_WIDTH = 200;

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
  export let frameCount = 0;
  export let frameIndex = 0; // 无穷累加
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
  /**
   * 仅在导出png时开启
   */
  // eslint-disable-next-line prefer-const
  export let isRenderBackground = false;
  let isShowBackgroundCartesian = false;
  export let isAlwaysShowDetails = false;
  export let protectingPrivacy = false;
  export let enableTagTextNodesBigDisplay = false;
  let isRenderCenterPointer = true;
  export let textIntegerLocationAndSizeRender = false;
  export let isPauseRenderWhenManipulateOvertime = true;
  export let renderOverTimeWhenNoManipulateTime = 5; // s
  export let ignoreTextNodeTextRenderLessThanCameraScale = 0.065;
  export let windowBackgroundAlpha = 0.9;

  // 确保这个函数在软件打开的那一次调用
  export function init() {
    TextNodeRenderer.init();
    Settings.watch("entityDetailsFontSize", (value) => {
      FONT_SIZE_DETAILS = value;
    });
    Settings.watch("entityDetailsLinesLimit", (value) => {
      ENTITY_DETAILS_LIENS_LIMIT = value;
    });
    Settings.watch("entityDetailsWidthLimit", (value) => {
      ENTITY_DETAILS_WIDTH = value;
    });
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
    Settings.watch("windowBackgroundAlpha", (value) => {
      windowBackgroundAlpha = value;
    });

    Settings.watch("alwaysShowDetails", (value) => (isAlwaysShowDetails = value));
    Settings.watch("protectingPrivacy", (value) => (protectingPrivacy = value));
    Settings.watch("isRenderCenterPointer", (value) => (isRenderCenterPointer = value));
    Settings.watch("enableTagTextNodesBigDisplay", (value) => (enableTagTextNodesBigDisplay = value));
    Settings.watch("textIntegerLocationAndSizeRender", (value) => (textIntegerLocationAndSizeRender = value));
    Settings.watch("isPauseRenderWhenManipulateOvertime", (value) => (isPauseRenderWhenManipulateOvertime = value));
    Settings.watch("renderOverTimeWhenNoManipulateTime", (value) => (renderOverTimeWhenNoManipulateTime = value));
    Settings.watch(
      "ignoreTextNodeTextRenderLessThanCameraScale",
      (value) => (ignoreTextNodeTextRenderLessThanCameraScale = value),
    );
    EntityRenderer.init();
  }

  /**
   * 渲染总入口
   * 建议此函数内部的调用就像一个清单一样，全是函数（这些函数都不是export的）。
   * @returns
   */
  export function frameTick() {
    updateFPS();
    const viewRectangle = getCoverWorldRectangle();
    Camera.frameTick();
    Canvas.ctx.clearRect(0, 0, w, h);
    renderBackground();

    // 渲染舞台要素
    if (Camera.limitCameraInCycleSpace) {
      // 循环空间渲染
      const originCameraLocation = Camera.location.clone();
      const LimitX = Camera.cameraCycleSpaceSizeX;
      const LimitY = Camera.cameraCycleSpaceSizeY;
      for (let yi = -1; yi <= 1; yi++) {
        for (let xi = -1; xi <= 1; xi++) {
          Camera.location.x = originCameraLocation.x + xi * LimitX;
          Camera.location.y = originCameraLocation.y + yi * LimitY;
          renderMainStageElements(viewRectangle);
        }
      }
      Camera.location = originCameraLocation;
      renderCycleSpaceBorder();
    } else {
      // 正常模式渲染
      renderMainStageElements(viewRectangle);
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
      StageStyleManager.currentStyle.SelectRectangleBorder,
      2 * Camera.currentScale,
    );
  }

  function renderViewElements(viewRectangle: Rectangle) {
    renderDraggingFileTips();
    renderSpecialKeys();
    renderCenterPointer();
    renderPrivacyBoard(viewRectangle);
    renderDebugDetails();
  }

  function renderMainStageElements(viewRectangle: Rectangle) {
    // 先渲染主场景
    renderStageElementsWithoutReactions(viewRectangle);
    isRenderingChildStage = true;
    const cameraOldScale = Camera.currentScale;
    // 再渲染所有子场景
    for (const key of StageManager.getAllChildStageKeys()) {
      // key就是绝对路径
      const cameraData = StageManager.getChildStageCameraData(key);
      let diffLocation = Vector.getZero();
      const cameraOldLocation = Camera.location.clone();
      if (cameraData) {
        diffLocation = cameraData.targetLocation.subtract(cameraData.location);
        Camera.currentScale *= cameraData.zoom;
        Camera.location = Camera.location.add(diffLocation);
      } else {
        console.warn(key, "没有camera数据");
      }

      // 加载子场景
      StageManager.storeMainStage(); // 先保存主场景
      StageManager.destroy();
      StageManager.storeChildStageToMainStage(key); // 把子场景加到主场景位置上
      const viewChildRectangleLocation = Camera.location.clone().add(cameraData.location.subtract(cameraOldLocation));
      const childStageViewRectangle = new Rectangle(
        viewChildRectangleLocation,
        cameraData.size.multiply(cameraData.zoom),
      );
      renderStageElementsWithoutReactions(childStageViewRectangle); // 再渲染主场景
      StageManager.destroy();
      StageManager.restoreMainStage(); // 还原主场景位置
      Camera.location = Camera.location.subtract(diffLocation);
      Camera.currentScale = cameraOldScale;
    }
    isRenderingChildStage = false;
    // 交互相关的
    DrawingControllerRenderer.renderTempDrawing();
    renderWarningStageObjects();
    renderHoverCollisionBox();
    renderSelectingRectangle();
    renderCuttingLine();
    renderConnectingLine();
    renderKeyboardOnly();
    rendererLayerMovingLine();
    renderClipboard();
    renderEffects();
    searchContentHighlightRenderer(frameIndex);
    // renderViewRectangle(viewRectangle);
  }

  // 渲染一切实体相关的要素
  function renderStageElementsWithoutReactions(viewRectangle: Rectangle) {
    EntityRenderer.renderAllSectionsBackground(viewRectangle);
    renderEdges(viewRectangle);
    renderEntities(viewRectangle);
    EntityRenderer.renderAllSectionsBigTitle(viewRectangle);
    renderTags();
    // debug

    // debugRender();
  }

  /**
   * 是否正在渲染子场景
   * 如果是,则超出视野检测使用完全包含
   */
  let isRenderingChildStage = false;

  // 是否超出了视野之外
  export function isOverView(viewRectangle: Rectangle, entity: StageObject): boolean {
    if (!Camera.limitCameraInCycleSpace) {
      // 如果没有开循环空间，就要看看是否超出了视野
      if (isRenderingChildStage) {
        if (!entity.collisionBox.getRectangle().isAbsoluteIn(viewRectangle)) {
          return true;
        }
      } else {
        if (!viewRectangle.isCollideWith(entity.collisionBox.getRectangle())) {
          return true;
        }
      }
      return false;
    }
    // 如果开了循环空间，就永远不算超出视野
    return false;
  }

  // 渲染中心准星
  function renderCenterPointer() {
    if (!isRenderCenterPointer) {
      return;
    }
    const viewCenterLocation = transformWorld2View(Camera.location);
    ShapeRenderer.renderCircle(viewCenterLocation, 1, StageStyleManager.currentStyle.GridHeavy, Color.Transparent, 0);
    for (let i = 0; i < 4; i++) {
      const degrees = i * 90;
      const shortLineStart = viewCenterLocation.add(new Vector(10, 0).rotateDegrees(degrees));
      const shortLineEnd = viewCenterLocation.add(new Vector(20, 0).rotateDegrees(degrees));
      CurveRenderer.renderSolidLine(shortLineStart, shortLineEnd, StageStyleManager.currentStyle.GridHeavy, 1);
    }
  }

  function renderPrivacyBoard(viewRectangle: Rectangle) {
    // 画隐私保护边
    if (protectingPrivacy) {
      ShapeRenderer.renderRect(viewRectangle.transformWorld2View(), Color.Transparent, new Color(33, 54, 167, 0.5), 50);
    }
  }
  /** 鼠标hover的边 */
  function renderHoverCollisionBox() {
    for (const edge of Stage.mouseInteractionCore.hoverEdges) {
      CollisionBoxRenderer.render(edge.collisionBox, StageStyleManager.currentStyle.CollideBoxPreSelected);
    }
    for (const section of Stage.mouseInteractionCore.hoverSections) {
      CollisionBoxRenderer.render(section.collisionBox, StageStyleManager.currentStyle.CollideBoxPreSelected);
    }
    for (const multiTargetUndirectedEdge of Stage.mouseInteractionCore.hoverMultiTargetEdges) {
      CollisionBoxRenderer.render(
        multiTargetUndirectedEdge.collisionBox,
        StageStyleManager.currentStyle.CollideBoxPreSelected,
      );
    }
  }

  /** 框选框 */
  function renderSelectingRectangle() {
    const rectangle = Stage.rectangleSelectEngine.getRectangle();
    if (rectangle) {
      const selectMode = Stage.rectangleSelectEngine.getSelectMode();
      if (selectMode === "intersect") {
        ShapeRenderer.renderRect(
          rectangle.transformWorld2View(),
          StageStyleManager.currentStyle.SelectRectangleFill,
          StageStyleManager.currentStyle.SelectRectangleBorder,
          1,
        );
      } else if (selectMode === "contain") {
        ShapeRenderer.renderRect(
          rectangle.transformWorld2View(),
          StageStyleManager.currentStyle.SelectRectangleFill,
          Color.Transparent,
          0,
        );
        ShapeRenderer.renderCameraShapeBorder(
          rectangle.transformWorld2View(),
          StageStyleManager.currentStyle.SelectRectangleBorder,
          1,
        );
        // 完全覆盖框选的提示
        TextRenderer.renderOneLineText(
          "完全覆盖框选",
          transformWorld2View(rectangle.leftBottom).add(new Vector(20, 10)),
          10,
          StageStyleManager.currentStyle.SelectRectangleBorder,
        );
      }
    }
    // if (Stage.selectMachine.isUsing && Stage.selectMachine.selectingRectangle) {
    //   const selectMode = Stage.selectMachine.getSelectMode();
    //   if (selectMode === "intersect") {
    //     ShapeRenderer.renderRect(
    //       Stage.selectMachine.selectingRectangle.transformWorld2View(),
    //       StageStyleManager.currentStyle.SelectRectangleFill,
    //       StageStyleManager.currentStyle.SelectRectangleBorder,
    //       1,
    //     );
    //   } else if (selectMode === "contain") {
    //     ShapeRenderer.renderRect(
    //       Stage.selectMachine.selectingRectangle.transformWorld2View(),
    //       StageStyleManager.currentStyle.SelectRectangleFill,
    //       Color.Transparent,
    //       0,
    //     );
    //     ShapeRenderer.renderCameraShapeBorder(
    //       Stage.selectMachine.selectingRectangle.transformWorld2View(),
    //       StageStyleManager.currentStyle.SelectRectangleBorder,
    //       1,
    //     );
    //     // 完全覆盖框选的提示
    //     TextRenderer.renderOneLineText(
    //       "完全覆盖框选",
    //       transformWorld2View(Stage.selectMachine.selectingRectangle.leftBottom).add(new Vector(20, 10)),
    //       10,
    //       StageStyleManager.currentStyle.SelectRectangleBorder,
    //     );
    //   }
    // }
  }
  /** 切割线 */
  function renderCuttingLine() {
    if (Stage.cuttingMachine.isUsing && Stage.cuttingMachine.cuttingLine) {
      WorldRenderUtils.renderLaser(
        Stage.cuttingMachine.cuttingLine.start,
        Stage.cuttingMachine.cuttingLine.end,
        2,
        StageStyleManager.currentStyle.effects.warningShadow,
      );
    }
  }

  /** 手动连接线 */
  function renderConnectingLine() {
    if (Stage.connectMachine.isUsing) {
      // 如果鼠标位置没有和任何节点相交
      let connectTargetNode = null;
      const mouseLocation = transformView2World(MouseLocation.vector());
      for (const node of StageManager.getConnectableEntity()) {
        if (node.collisionBox.isContainsPoint(mouseLocation)) {
          connectTargetNode = node;
          break;
        }
      }
      if (connectTargetNode === null) {
        for (const node of Stage.connectMachine.connectFromEntities) {
          EdgeRenderer.renderVirtualEdge(node, mouseLocation);
        }
      } else {
        // 画一条像吸住了的线
        for (const node of Stage.connectMachine.connectFromEntities) {
          EdgeRenderer.renderVirtualConfirmedEdge(node, connectTargetNode);
        }
      }
      if (isShowDebug) {
        // 调试模式下显示右键连线轨迹
        const points = Stage.connectMachine.getMouseLocationsPoints().map((point) => transformWorld2View(point));
        if (points.length > 1) {
          CurveRenderer.renderSolidLineMultiple(
            Stage.connectMachine.getMouseLocationsPoints().map((point) => transformWorld2View(point)),
            StageStyleManager.currentStyle.effects.warningShadow,
            1,
          );
        }
      }
    }
  }

  /**
   * 渲染和纯键盘操作相关的功能
   */
  function renderKeyboardOnly() {
    if (KeyboardOnlyGraphEngine.isCreating()) {
      const isHaveEntity = KeyboardOnlyGraphEngine.isTargetLocationHaveEntity();
      for (const node of StageManager.getTextNodes()) {
        if (node.isSelected) {
          {
            const startLocation = node.rectangle.center;
            const endLocation = KeyboardOnlyGraphEngine.virtualTargetLocation();
            let rate = KeyboardOnlyGraphEngine.getPressTabTimeInterval() / 100;
            rate = Math.min(1, rate);
            const currentLocation = startLocation.add(endLocation.subtract(startLocation).multiply(rate));
            WorldRenderUtils.renderLaser(
              startLocation,
              currentLocation,
              2,
              rate < 1 ? Color.Yellow : isHaveEntity ? Color.Blue : Color.Green,
            );
            if (rate === 1 && !isHaveEntity) {
              ShapeRenderer.renderRectFromCenter(
                transformWorld2View(KeyboardOnlyGraphEngine.virtualTargetLocation()),
                120 * Camera.currentScale,
                60 * Camera.currentScale,
                Color.Transparent,
                mixColors(StageStyleManager.currentStyle.StageObjectBorder, Color.Transparent, 0.5),
                2 * Camera.currentScale,
                NODE_ROUNDED_RADIUS * Camera.currentScale,
              );
            }
          }
          let hintText = "松开 “生长自由节点键” 完成新节点创建,IKJL键移动生长位置";
          if (isHaveEntity) {
            hintText = "连接！";
          }
          // 在生成点下方写文字提示
          TextRenderer.renderMultiLineText(
            hintText,
            transformWorld2View(KeyboardOnlyGraphEngine.virtualTargetLocation().add(new Vector(0, 50))),
            15 * Camera.currentScale,
            Infinity,
            StageStyleManager.currentStyle.StageObjectBorder,
          );
        }
      }
    }
  }

  /** 层级移动时，渲染移动指向线 */
  function rendererLayerMovingLine() {
    if (!ControllerLayerMoving.isEnabled) {
      return;
    }
    // 有alt
    if (!Controller.pressingKeySet.has("alt")) {
      return;
    }
    // 有alt且仅按下了alt键
    if (Controller.pressingKeySet.size !== 1) {
      return;
    }
    if (StageManager.getSelectedEntities().length === 0) {
      return;
    }
    let lineWidth = 8;
    if (Controller.isMouseDown[0]) {
      lineWidth = 16;
    }

    const selectedEntities = StageManager.getSelectedEntities();
    for (const selectedEntity of selectedEntities) {
      const startLocation = selectedEntity.collisionBox.getRectangle().center;
      const endLocation = Controller.mouseLocation;
      const distance = startLocation.distance(endLocation);
      const height = distance / 2;
      // 影子
      CurveRenderer.renderGradientLine(
        transformWorld2View(startLocation),
        transformWorld2View(endLocation),
        Color.Transparent,
        new Color(0, 0, 0, 0.2),
        lineWidth * Camera.currentScale,
      );
      CurveRenderer.renderGradientBezierCurve(
        new CubicBezierCurve(
          transformWorld2View(startLocation),
          transformWorld2View(startLocation.add(new Vector(0, -height))),
          transformWorld2View(endLocation.add(new Vector(0, -height))),
          transformWorld2View(endLocation),
        ),
        StageStyleManager.currentStyle.CollideBoxPreSelected.toTransparent(),
        StageStyleManager.currentStyle.CollideBoxPreSelected.toSolid(),
        lineWidth * Camera.currentScale,
      );
      // 画箭头
      const arrowLen = 10 + distance * 0.01;
      CurveRenderer.renderBezierCurve(
        new CubicBezierCurve(
          transformWorld2View(endLocation),
          transformWorld2View(endLocation),
          transformWorld2View(endLocation),
          transformWorld2View(endLocation.add(new Vector(-arrowLen, -arrowLen * 2))),
        ),
        StageStyleManager.currentStyle.CollideBoxPreSelected.toSolid(),
        lineWidth * Camera.currentScale,
      );
      CurveRenderer.renderBezierCurve(
        new CubicBezierCurve(
          transformWorld2View(endLocation),
          transformWorld2View(endLocation),
          transformWorld2View(endLocation),
          transformWorld2View(endLocation.add(new Vector(arrowLen, -arrowLen * 2))),
        ),
        StageStyleManager.currentStyle.CollideBoxPreSelected.toSolid(),
        lineWidth * Camera.currentScale,
      );
    }
    TextRenderer.renderTextFromCenter(
      "Jump To",
      transformWorld2View(Controller.mouseLocation).subtract(new Vector(0, -30)),
      16,
      StageStyleManager.currentStyle.CollideBoxPreSelected.toSolid(),
    );
  }

  /** 拖拽文件进入窗口时的提示效果 */
  function renderDraggingFileTips() {
    if (Stage.dragFileMachine.isDraggingFile) {
      ShapeRenderer.renderRect(
        Renderer.getCoverWorldRectangle().transformWorld2View(),
        new Color(0, 0, 0, 0.5),
        Color.Transparent,
        1,
      );
      ShapeRenderer.renderCircle(
        transformWorld2View(Stage.dragFileMachine.draggingLocation),
        100,
        Color.Transparent,
        Color.White,
        2,
      );
    }
  }

  /** 待删除的节点和边 */
  function renderWarningStageObjects() {
    // 待删除的节点
    for (const node of Stage.cuttingMachine.warningEntity) {
      CollisionBoxRenderer.render(
        node.collisionBox,
        StageStyleManager.currentStyle.effects.warningShadow.toNewAlpha(0.5),
      );
    }
    // 待删除的边
    for (const association of Stage.cuttingMachine.warningAssociations) {
      CollisionBoxRenderer.render(
        association.collisionBox,
        StageStyleManager.currentStyle.effects.warningShadow.toNewAlpha(0.5),
      );
    }
    for (const section of Stage.cuttingMachine.warningSections) {
      CollisionBoxRenderer.render(
        section.collisionBox,
        StageStyleManager.currentStyle.effects.warningShadow.toNewAlpha(0.5),
      );
    }
  }

  /** 画所有被标签了的节点的特殊装饰物和缩小视野时的直观显示 */
  function renderTags() {
    for (const tagString of StageManager.TagOptions.getTagUUIDs()) {
      const tagObject = StageManager.getStageObjectByUUID(tagString);
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
        StageStyleManager.currentStyle.StageObjectBorder,
        2 * Camera.currentScale,
      );
    }
  }
  function renderEntities(viewRectangle: Rectangle) {
    renderedNodes = EntityRenderer.renderAllEntities(viewRectangle);
  }

  function renderEdges(viewRectangle: Rectangle) {
    renderedEdges = 0;
    for (const association of StageManager.getAssociations()) {
      if (isOverView(viewRectangle, association)) {
        continue;
      }
      if (association instanceof MultiTargetUndirectedEdge) {
        MultiTargetUndirectedEdgeRenderer.render(association);
      }
      if (association instanceof LineEdge) {
        EdgeRenderer.renderLineEdge(association);
      }
      if (association instanceof CubicCatmullRomSplineEdge) {
        EdgeRenderer.renderCrEdge(association);
      }
      renderedEdges++;
    }
  }

  /** 画粘贴板上的信息 */
  function renderClipboard() {
    if (CopyEngine.isVirtualClipboardEmpty()) {
      return;
    }
    const clipboardBlue = StageStyleManager.currentStyle.effects.successShadow;
    // 粘贴板有内容
    // 获取粘贴板中所有节点的外接矩形
    if (CopyEngine.copyBoardDataRectangle) {
      // 画一个原位置
      ShapeRenderer.renderRect(
        CopyEngine.copyBoardDataRectangle.transformWorld2View(),
        Color.Transparent,
        new Color(255, 255, 255, 0.5),
        1,
      );
      // 在原位置下写标注
      TextRenderer.renderOneLineText(
        "ctrl+shift+v 原位置叠加粘贴",
        transformWorld2View(
          new Vector(
            CopyEngine.copyBoardDataRectangle.location.x,
            CopyEngine.copyBoardDataRectangle.location.y + CopyEngine.copyBoardDataRectangle.size.y + 20,
          ),
        ),
        12,
        clipboardBlue,
      );
      // 画一个鼠标位置
      ShapeRenderer.renderRect(
        new Rectangle(
          CopyEngine.copyBoardDataRectangle.location.add(CopyEngine.copyBoardMouseVector),
          CopyEngine.copyBoardDataRectangle.size,
        ).transformWorld2View(),
        Color.Transparent,
        clipboardBlue,
        1,
      );
      // 写下标注
      TextRenderer.renderMultiLineText(
        "ctrl+v 粘贴\n点击左键粘贴\nEsc键清空粘贴板取消粘贴\n跨文件粘贴请直接在软件内切换文件",
        transformWorld2View(
          new Vector(
            CopyEngine.copyBoardDataRectangle.location.x + CopyEngine.copyBoardMouseVector.x,
            CopyEngine.copyBoardDataRectangle.location.y +
              CopyEngine.copyBoardDataRectangle.size.y +
              CopyEngine.copyBoardMouseVector.y +
              20,
          ),
        ),
        12,
        Infinity,
        clipboardBlue,
      );
      for (const entity of CopyEngine.copyBoardData.entities) {
        if (entity.type === "core:connect_point") {
          ShapeRenderer.renderCircle(
            transformWorld2View(new Vector(...entity.location)),
            10 * Camera.currentScale,
            Color.Transparent,
            Color.White,
            2 * Camera.currentScale,
          );
        } else if (entity.type === "core:pen_stroke") {
          ShapeRenderer.renderRect(
            new Rectangle(
              new Vector(...entity.location).add(CopyEngine.copyBoardMouseVector),
              new Vector(10, 10),
            ).transformWorld2View(),
            Color.Transparent,
            clipboardBlue,
            2 * Camera.currentScale,
          );
        } else {
          ShapeRenderer.renderRect(
            new Rectangle(
              new Vector(...entity.location).add(CopyEngine.copyBoardMouseVector),
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

  /** 渲染所有特效 */
  function renderEffects() {
    Stage.effectMachine.renderTick();
  }

  /**
   * 渲染背景
   */
  function renderBackground() {
    const rect = getCoverWorldRectangle();
    if (isRenderBackground) {
      ShapeRenderer.renderRect(
        rect.transformWorld2View(),
        StageStyleManager.currentStyle.Background,
        Color.Transparent,
        0,
      );
    }
    if (isShowBackgroundDots) {
      renderDotBackground(rect);
    }
    if (isShowBackgroundHorizontalLines) {
      renderHorizonBackground(rect);
    }
    if (isShowBackgroundVerticalLines) {
      renderVerticalBackground(rect);
    }
    if (isShowBackgroundCartesian) {
      renderCartesianBackground(rect);
    }
  }

  /**
   * 每次在frameTick最开始的时候调用一次
   */
  function updateFPS() {
    // 计算FPS
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000; // s
    Renderer.deltaTime = deltaTime;

    frameIndex++;
    const currentTime = performance.now();
    frameCount++;
    if (currentTime - lastTime > 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime = currentTime;
    }
  }

  /** 画debug信息 */
  function renderDebugDetails() {
    if (!isShowDebug || isFrame) {
      return;
    }

    const detailsData = [
      "调试信息已开启，可在设置中关闭，或快捷键关闭",
      `scale: ${Camera.currentScale}`,
      `target: ${Camera.targetScale}`,
      `shake: ${Camera.shakeLocation.toString()}`,
      `location: ${Camera.location.x.toFixed(2)}, ${Camera.location.y.toFixed(2)}`,
      `location: ${Camera.location.x}, ${Camera.location.y}`,
      `window: ${w}x${h}`,
      `effect count: ${Stage.effectMachine.effectsCount}`,
      `node count: ${renderedNodes} , ${StageManager.getTextNodes().length}`,
      `edge count: ${renderedEdges} , ${StageManager.getLineEdges().length}`,
      `section count: ${StageManager.getSections().length}`,
      `selected count: ${StageObjectSelectCounter.toDebugString()}`,
      `pressingKeys: ${Controller.pressingKeysString()}`,
      `鼠标按下情况: ${Controller.isMouseDown}`,
      `框选框: ${JSON.stringify(Stage.rectangleSelectEngine.getRectangle())}`,
      `正在切割: ${Stage.cuttingMachine.isUsing}`,
      `Stage.warningNodes: ${Stage.cuttingMachine.warningEntity.length}`,
      `Stage.warningAssociations: ${Stage.cuttingMachine.warningAssociations.length}`,
      `ConnectFromNodes: ${Stage.connectMachine.connectFromEntities}`,
      `lastSelectedNode: ${Controller.lastSelectedEntityUUID.size}`,
      `粘贴板: ${JSON.stringify(CopyEngine.copyBoardData)}`,
      `历史: ${StageHistoryManager.statusText()}`,
      `fps: ${fps}`,
      `delta: ${deltaTime.toFixed(2)}`,
      `path: ${Stage.path.getFilePath()}`,
      `autoSave: ${Stage.autoSaveEngine.toString()}`,
      `isEnableEntityCollision: ${StageManager.isEnableEntityCollision}`,
    ];
    for (const [k, v] of Object.entries(timings)) {
      detailsData.push(`render time:${k}: ${v.toFixed(2)}`);
    }
    for (const line of detailsData) {
      TextRenderer.renderOneLineText(
        line,
        new Vector(10, 80 + detailsData.indexOf(line) * 12),
        10,
        StageStyleManager.currentStyle.DetailsDebugText,
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
      TextRenderer.renderOneLineText(key, textLocation, fontSize, StageStyleManager.currentStyle.StageObjectBorder);
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
      TextRenderer.renderOneLineText(
        "      方向键移动视野被禁止，可通过快捷键或设置界面松开“手刹”",
        new Vector(margin, Renderer.h - 60),
        15,
        StageStyleManager.currentStyle.effects.flash,
      );

      SvgRenderer.renderSvgFromLeftTop(
        `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="${StageStyleManager.currentStyle.effects.warningShadow.toString()}"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M 12 12.5 C12 8.5 12 12 12 9" />
  <path d="M 12 15 C12 15 12 15 12 15" />
  <path d="M 12 18 C15.5 18 18 15.5 18 12" />
  <path d="M 12 6 C8.5 6 6 8.5 6 12" />
  <path d="M 18 12 C18 8.5 15.5 6 12 6" />
  <path d="M 19 18 C21 16 21.5 8.5 19 6" />
  <path d="M 4.5 18 C2.5 16 2.5 8.5 4.5 6" />
  <path d="M 6 12 C6 15.5 8.5 18 12 18" />
</svg>`,
        new Vector(margin, Renderer.h - 60),
        24,
        24,
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
