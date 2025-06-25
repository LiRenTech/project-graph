import { ControllerDragFileClass } from "../service/controlService/controller/concrete/ControllerDragFile";
import { KeyboardOnlyEngine } from "../service/controlService/keyboardOnlyEngine/keyboardOnlyEngine";
import { StageMouseInteractionCore } from "../service/controlService/stageMouseInteractionCore/stageMouseInteractionCore";
import { StageFilePathManager } from "../service/dataFileService/stageFilePathManager";
import { ContentSearchEngine } from "../service/dataManageService/contentSearchEngine/contentSearchEngine";
import { Settings } from "../service/Settings";

export enum LeftMouseModeEnum {
  selectAndMove = "selectAndMove",
  draw = "draw",
  connectAndCut = "connectAndCut",
}

/**
 * 舞台对象
 * 更广义的舞台，
 *
 * 舞台实体数据、以及舞台实体的操作方法全部存在StageManager里
 * 由于普遍采用全局的单例模式，所以StageManager也是一个单例，它不必在这里创建
 *
 * 但这个里面主要存一些动态的属性，以及特效交互等信息
 */
export namespace Stage {
  /** 左键模式 */
  export let leftMouseMode: LeftMouseModeEnum = LeftMouseModeEnum.selectAndMove;
  export function changeLeftMouseFunction(mode: LeftMouseModeEnum) {
    leftMouseMode = mode;
  }
  export namespace MouseModeManager {
    // eslint-disable-next-line prefer-const
    export let checkoutSelectAndMoveHook = () => {};
    // eslint-disable-next-line prefer-const
    export let checkoutDrawingHook = () => {};
    // eslint-disable-next-line prefer-const
    export let checkoutConnectAndCuttingHook = () => {};
  }
  /**
   * 路径管理器
   */
  export const path = new StageFilePathManager();

  /**
   * 鼠标交互管理器
   * 用于辅助其他控制器使用
   */
  export const mouseInteractionCore = new StageMouseInteractionCore();

  /**
   * 内容搜索引擎
   */
  export const contentSearchEngine = new ContentSearchEngine();

  /**
   * 拖拽文件进入窗口控制器
   */
  export const dragFileMachine = ControllerDragFileClass;

  /** 当前窗口是否处于激活状态 */
  // eslint-disable-next-line prefer-const
  export let isWindowFocused = true;
  /**
   * 逻辑总入口
   * 该函数在上游被频繁调用
   */
  export function logicTick() {
    KeyboardOnlyEngine.logicTick();
  }

  /** 当前鼠标右键拖拽空白部分的操作 */
  export let mouseRightDragBackground: Settings.Settings["mouseRightDragBackground"] = "cut";
  export let enableDragAutoAlign = true;
  export let enableDragAlignToGrid = false;

  export let textNodeSelectAllWhenStartEditByMouseClick = true;
  export let rectangleSelectWhenLeft: "contain" | "intersect" = "contain";
  export let rectangleSelectWhenRight: "contain" | "intersect" = "intersect";
  export let enableWindowsTouchPad = true;
  export let doubleClickMiddleMouseButton: Settings.Settings["doubleClickMiddleMouseButton"] = "adjustCamera";
  export let autoRefreshStageByMouseAction = true;

  export let macTrackpadAndMouseWheelDifference: Settings.Settings["macTrackpadAndMouseWheelDifference"] =
    "trackpadIntAndWheelFloat";
  export let macMouseWheelIsSmoothed: Settings.Settings["macMouseWheelIsSmoothed"] = false;

  export function init() {
    Settings.watch("mouseRightDragBackground", (value) => {
      mouseRightDragBackground = value;
    });
    Settings.watch("enableDragAutoAlign", (value) => {
      enableDragAutoAlign = value;
    });
    Settings.watch("enableDragAlignToGrid", (value) => {
      enableDragAlignToGrid = value;
    });
    Settings.watch("textNodeSelectAllWhenStartEditByMouseClick", (value) => {
      textNodeSelectAllWhenStartEditByMouseClick = value;
    });
    Settings.watch("rectangleSelectWhenLeft", (value) => {
      rectangleSelectWhenLeft = value;
    });
    Settings.watch("rectangleSelectWhenRight", (value) => {
      rectangleSelectWhenRight = value;
    });
    Settings.watch("enableWindowsTouchPad", (value) => {
      enableWindowsTouchPad = value;
    });
    Settings.watch("doubleClickMiddleMouseButton", (value) => {
      doubleClickMiddleMouseButton = value;
    });
    Settings.watch("autoRefreshStageByMouseAction", (value) => {
      autoRefreshStageByMouseAction = value;
    });
    Settings.watch("macTrackpadAndMouseWheelDifference", (value) => {
      macTrackpadAndMouseWheelDifference = value;
    });
    Settings.watch("macMouseWheelIsSmoothed", (value) => {
      macMouseWheelIsSmoothed = value;
    });
  }
}
