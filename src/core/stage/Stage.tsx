import { family } from "@tauri-apps/plugin-os";

import { autoComputeEngineTick } from "../service/autoComputeEngine/mainTick";
import { autoLayoutMainTick } from "../service/autoLayoutEngine/mainTick";
import { EffectMachine } from "../service/effectEngine/effectMachine";
import { KeyboardOnlyEngine } from "../service/keyboardOnlyEngine/keyboardOnlyEngine";
import { Settings } from "../service/Settings";
import { LineEdge } from "./stageObject/association/LineEdge";
import { Section } from "./stageObject/entity/Section";
import { ControllerCutting } from "../service/controller/concrete/ControllerCutting";
import { ControllerRectangleSelect } from "../service/controller/concrete/ControllerRectangleSelect";
import { ControllerNodeConnection } from "../service/controller/concrete/ControllerNodeConnection";
import { ContentSearchEngine } from "../service/contentSearchEngine/contentSearchEngine";
import { ControllerDragFile } from "../service/controller/concrete/ControllerDragFile";
import { AutoSaveEngine } from "../service/autoSaveBackupEngine/autoSaveEngine";
import { AutoBackupEngine } from "../service/autoSaveBackupEngine/autoBackupEngine";
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
   * 此Path存在的意义为摆脱状态管理只能在组件函数中的限制
   */
  export namespace Path {
    let currentPath = "Project Graph";
    export const draftName = "Project Graph";

    export function getSep(): string {
      const fam = family();
      if (fam === "windows") {
        return "\\";
      } else {
        return "/";
      }
    }

    /**
     * 是否是草稿
     * @returns
     */
    export function isDraft() {
      return currentPath === "Project Graph";
    }

    /**
     * 此函数唯一的调用：只能在app.tsx的useEffect检测函数中调用
     * 为了同步状态管理中的路径。
     * @param path
     */
    export function setPathInEffect(path: string) {
      currentPath = path;
    }

    /**
     * 提供一个函数供外部调用，获取当前路径
     * @returns
     */
    export function getFilePath() {
      return currentPath;
    }
  }

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
   * 鼠标连线控制器
   */
  export const connectMachine = ControllerNodeConnection;

  /**
   * 鼠标悬浮的边
   */
  // eslint-disable-next-line prefer-const
  export let hoverEdges: LineEdge[] = [];
  /** 鼠标悬浮的框 */
  // eslint-disable-next-line prefer-const
  export let hoverSections: Section[] = [];

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
    tickNumber++;
  }
  let tickNumber = 0;

  /** 当前鼠标右键拖拽空白部分的操作 */
  export let mouseRightDragBackground = "cut";
  export let enableDragAutoAlign = true;

  export function init() {
    autoSaveEngine.init();
    autoBackupEngine.init();
    Settings.watch("mouseRightDragBackground", (value) => {
      mouseRightDragBackground = value;
    });
    Settings.watch("enableDragAutoAlign", (value) => {
      enableDragAutoAlign = value;
    });
  }
}
