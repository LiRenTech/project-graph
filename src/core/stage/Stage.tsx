import { family } from "@tauri-apps/plugin-os";

import { Serialized } from "../../types/node";
import { PathString } from "../../utils/pathString";
import { Line } from "../dataStruct/shape/Line";
import { Rectangle } from "../dataStruct/shape/Rectangle";
import { Vector } from "../dataStruct/Vector";
import { autoComputeEngineTick } from "../service/autoComputeEngine/mainTick";
import { autoLayoutMainTick } from "../service/autoLayoutEngine/mainTick";
import { Controller } from "../service/controller/Controller";
import { PointDashEffect } from "../service/effectEngine/concrete/PointDashEffect";
import { EffectMachine } from "../service/effectEngine/effectMachine";
import { KeyboardOnlyEngine } from "../service/keyboardOnlyEngine/keyboardOnlyEngine";
import { Settings } from "../service/Settings";
import { StageDumper } from "./StageDumper";
import { StageManager } from "./stageManager/StageManager";
import { LineEdge } from "./stageObject/association/LineEdge";
import { Section } from "./stageObject/entity/Section";
import { TextNode } from "./stageObject/entity/TextNode";
import { ConnectableEntity, Entity } from "./stageObject/StageObject";
import { StageSaveManager } from "./StageSaveManager";
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

  export const effectMachine = EffectMachine.default();
  /**
   * 是否正在框选
   */
  // eslint-disable-next-line prefer-const
  export let isSelecting = false;

  /**
   * 框选框
   * 这里必须一开始为null，否则报错，can not asses "Rectangle"
   * 这个框选框是基于世界坐标的。
   * 此变量会根据两个点的位置自动更新。
   */
  // eslint-disable-next-line prefer-const
  export let selectingRectangle: Rectangle | null = null;

  /**
   * 框选框的起点
   */
  // eslint-disable-next-line prefer-const
  export let selectStartLocation: Vector = Vector.getZero();
  /**
   * 框选框的终点
   */
  // eslint-disable-next-line prefer-const
  export let selectEndLocation: Vector = Vector.getZero();

  /**
   * 是否正在切断连线或切割
   */
  // eslint-disable-next-line prefer-const
  export let isCutting = false;

  // eslint-disable-next-line prefer-const
  export let isConnecting = false;

  // eslint-disable-next-line prefer-const
  export let cuttingLine: Line | null = null;
  /**
   * 正在准备要删除的节点
   */
  // eslint-disable-next-line prefer-const
  export let warningEntity: Entity[] = [];
  /**
   * 正在准备要删除的连线
   */
  // eslint-disable-next-line prefer-const
  export let warningEdges: LineEdge[] = [];
  // eslint-disable-next-line prefer-const
  export let warningSections: Section[] = [];
  /**
   * 用于多重连接
   */
  // eslint-disable-next-line prefer-const
  export let connectFromEntities: ConnectableEntity[] = [];
  // eslint-disable-next-line prefer-const
  export let connectToEntity: ConnectableEntity | null = null;

  /**
   * 鼠标悬浮的边
   */
  // eslint-disable-next-line prefer-const
  export let hoverEdges: LineEdge[] = [];
  /** 鼠标悬浮的框 */
  // eslint-disable-next-line prefer-const
  export let hoverSections: Section[] = [];

  /**
   * 搜索结果
   */
  // eslint-disable-next-line prefer-const
  export let searchResultNodes: TextNode[] = [];
  /**
   * 搜索结果的索引
   */
  // eslint-disable-next-line prefer-const
  export let currentSearchResultIndex = 0;

  /**
   * 粘贴板数据
   */
  // eslint-disable-next-line prefer-const
  export let copyBoardData: Serialized.File = {
    version: StageDumper.latestVersion,
    entities: [],
    associations: [],
    tags: [],
  };
  /**
   * 粘贴板内容上的外接矩形
   * 当他为null时，表示没有粘贴板数据
   */
  // eslint-disable-next-line prefer-const
  export let copyBoardDataRectangle: Rectangle | null = null;
  /**
   * 表示从粘贴板外接矩形的矩形中心，到鼠标当前位置的向量
   * 用于计算即将粘贴的位置
   */
  // eslint-disable-next-line prefer-const
  export let copyBoardMouseVector: Vector = Vector.getZero();

  /**
   * 当前是否是拖拽文件入窗口的状态
   */
  // eslint-disable-next-line prefer-const
  export let isDraggingFile = false;

  /**
   * 当前鼠标所在的世界坐标
   */
  // eslint-disable-next-line prefer-const
  export let draggingLocation = Vector.getZero();

  /**
   * 自动保存是否处于暂停状态
   * 主要用于防止自动保存出bug，产生覆盖文件的问题
   */
  // eslint-disable-next-line prefer-const
  export let isAutoSavePaused = false;

  let tickNumber = 0;
  /**
   * 逻辑总入口
   * 该函数在上游被频繁调用
   */
  export function logicTick() {
    if (Stage.connectFromEntities.length > 0 && Controller.lastMoveLocation) {
      let connectTargetNode = null;
      for (const node of StageManager.getConnectableEntity()) {
        if (node.collisionBox.isContainsPoint(Controller.lastMoveLocation)) {
          connectTargetNode = node;
          break;
        }
      }
      if (connectTargetNode === null) {
        // 如果鼠标位置没有和任何节点相交
        effectMachine.addEffect(
          PointDashEffect.fromMouseEffect(
            Controller.lastMoveLocation,
            connectFromEntities.length * 5,
          ),
        );
      } else {
        // 画一条像吸住了的线
      }
    }

    // 特效逻辑
    effectMachine.logicTick();

    // 计算引擎
    autoComputeEngineTick(tickNumber);
    // 自动布局
    autoLayoutMainTick();
    // 自动保存功能
    autoSaveTick();
    // 自动备份功能
    autoBackupTick();

    KeyboardOnlyEngine.logicTick();
    tickNumber++;
  }

  let lastAutoSaveTime = performance.now();
  let autoSave = false;
  let autoSaveInterval = 60_000; // ms
  /** 当前鼠标右键拖拽空白部分的操作 */
  export let mouseRightDragBackground = "cut";
  export let enableDragAutoAlign = true;

  export function init() {
    Settings.watch("autoSave", (value) => {
      autoSave = value;
    });
    Settings.watch("autoSaveInterval", (value) => {
      autoSaveInterval = value * 1000; // s to ms
    });
    Settings.watch("autoBackup", (value) => {
      autoBackup = value;
    });
    Settings.watch("autoBackupInterval", (value) => {
      autoBackupInterval = value * 1000; // s to ms
    });
    Settings.watch("autoBackup", (value) => {
      autoBackup = value;
    });
    Settings.watch("autoBackupDraftPath", (value) => {
      autoBackupDraftPath = value;
    });
    Settings.watch("mouseRightDragBackground", (value) => {
      mouseRightDragBackground = value;
    });
    Settings.watch("enableDragAutoAlign", (value) => {
      enableDragAutoAlign = value;
    });
  }

  // private
  function autoSaveTick() {
    if (!autoSave) {
      return;
    }
    if (isAutoSavePaused) {
      return;
    }
    // 自动保存功能
    const now = performance.now();
    if (now - lastAutoSaveTime > autoSaveInterval) {
      if (Stage.Path.isDraft()) {
        // 自动保存无法对草稿进行，因为草稿没有路径
      } else {
        // 特殊情况，如果没有节点，则不保存

        if (StageManager.getTextNodes().length === 0) {
          // 没有节点，不保存
        } else {
          // 不要顶部白线提醒了。——joe以为是bug
          StageSaveManager.saveHandleWithoutCurrentPath(
            StageDumper.dump(),
            false,
            false,
          );
          // 更新时间
        }
      }
      lastAutoSaveTime = now;
    }
  }

  let lastAutoBackupTime = performance.now();
  let autoBackup = false;
  let autoBackupInterval = 60_000; // ms
  let autoBackupDraftPath = "";

  function autoBackupTick() {
    if (!autoBackup) {
      return;
    }
    // 自动备份功能
    const now = performance.now();
    if (now - lastAutoBackupTime > autoBackupInterval) {
      if (Stage.Path.isDraft()) {
        const backupPath = `${autoBackupDraftPath}${Stage.Path.getSep()}${PathString.getTime()}.json`;
        StageSaveManager.backupHandle(backupPath, StageDumper.dump());
      } else {
        StageSaveManager.backupHandleWithoutCurrentPath(
          StageDumper.dump(),
          false,
        );
      }
      // 更新时间
      lastAutoBackupTime = now;
    }
  }
}
