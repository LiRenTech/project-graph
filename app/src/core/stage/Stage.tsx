import { autoLayoutMainTick } from "../service/controlService/autoLayoutEngine/mainTick";
import { ControllerCutting } from "../service/controlService/controller/concrete/ControllerCutting";
import { ControllerDragFile } from "../service/controlService/controller/concrete/ControllerDragFile";
import { ControllerNodeConnection } from "../service/controlService/controller/concrete/ControllerNodeConnection";
import { ControllerDrawing } from "../service/controlService/controller/concrete/ControllerPenStrokeDrawing";
import { ControllerRectangleSelect } from "../service/controlService/controller/concrete/ControllerRectangleSelect";
import { Controller } from "../service/controlService/controller/Controller";
import { KeyboardOnlyEngine } from "../service/controlService/keyboardOnlyEngine/keyboardOnlyEngine";
import { SecretEngine } from "../service/controlService/secretEngine/secretEngine";
import { StageMouseInteractionCore } from "../service/controlService/stageMouseInteractionCore/stageMouseInteractionCore";
import { AutoBackupEngine } from "../service/dataFileService/autoSaveBackupEngine/autoBackupEngine";
import { AutoSaveEngine } from "../service/dataFileService/autoSaveBackupEngine/autoSaveEngine";
import { StageFilePathManager } from "../service/dataFileService/stageFilePathManager";
import { autoComputeEngineTick } from "../service/dataGenerateService/autoComputeEngine/mainTick";
import { StageExportEngine } from "../service/dataGenerateService/stageExportEngine/stageExportEngine";
import { ContentSearchEngine } from "../service/dataManageService/contentSearchEngine/contentSearchEngine";
import { EffectMachine } from "../service/feedbackService/effectEngine/effectMachine";
import { Settings } from "../service/Settings";
import { Camera } from "./Camera";
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
  /**
   * 路径管理器
   */
  export const path = new StageFilePathManager();
  /**
   * 特效机
   */
  export const effectMachine = EffectMachine.default();

  /**
   * 鼠标切割控制器
   */
  export const cuttingMachine = ControllerCutting;

  /**
   * 鼠标框选控制器
   */
  export const selectMachine = ControllerRectangleSelect;

  /**
   * 涂鸦控制器
   */
  export const drawingMachine = ControllerDrawing;
  /**
   * 鼠标连线控制器
   */
  export const connectMachine = ControllerNodeConnection;

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
  export const dragFileMachine = ControllerDragFile;

  /**
   * 自动保机
   */
  export const autoSaveEngine = new AutoSaveEngine();
  /**
   * 自动备份功能
   */
  export const autoBackupEngine = new AutoBackupEngine();

  export const exportEngine = new StageExportEngine();

  export const secretKeyEngine = new SecretEngine();

  /**
   * 逻辑总入口
   * 该函数在上游被频繁调用
   */
  export function logicTick() {
    connectMachine.mainTick();
    // 特效逻辑
    effectMachine.logicTick();

    // 计算引擎
    autoComputeEngineTick(tickNumber);
    // 自动布局
    autoLayoutMainTick();
    // 自动保存功能
    autoSaveEngine.mainTick();
    // 自动备份功能
    autoBackupEngine.mainTick();

    KeyboardOnlyEngine.logicTick();

    // 防止截屏无限滚屏
    if (Controller.pressingKeySet.size === 0) {
      Camera.clearMoveCommander(); // 直接动力切断
    }
    tickNumber++;
  }
  let tickNumber = 0;

  /** 当前鼠标右键拖拽空白部分的操作 */
  export let mouseRightDragBackground = "cut";
  export let enableDragAutoAlign = true;

  export let textNodeSelectAllWhenStartEditByMouseClick = true;
  export let rectangleSelectWhenLeft: "contain" | "intersect" = "contain";
  export let rectangleSelectWhenRight: "contain" | "intersect" = "intersect";
  export let enableWindowsTouchPad = true;

  export function init() {
    autoSaveEngine.init();
    autoBackupEngine.init();
    Settings.watch("mouseRightDragBackground", (value) => {
      mouseRightDragBackground = value;
    });
    Settings.watch("enableDragAutoAlign", (value) => {
      enableDragAutoAlign = value;
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
  }
}
