import { family } from "@tauri-apps/plugin-os";
import { v4 as uuidv4 } from "uuid";
import { Serialized } from "../../types/node";
import { PathString } from "../../utils/pathString";
import { Controller } from "../controller/Controller";
import { ControllerGamepad } from "../controller/ControllerGamepad";
import { Color } from "../dataStruct/Color";
import { ProgressNumber } from "../dataStruct/ProgressNumber";
import { Line } from "../dataStruct/shape/Line";
import { Rectangle } from "../dataStruct/shape/Rectangle";
import { Vector } from "../dataStruct/Vector";
import { LineCuttingEffect } from "../effect/concrete/LineCuttingEffect";
import { PointDashEffect } from "../effect/concrete/PointDashEffect";
import { TextRiseEffect } from "../effect/concrete/TextRiseEffect";
import { Effect } from "../effect/effect";
import { Renderer } from "../render/canvas2d/renderer";
import { Settings } from "../Settings";
import { Edge } from "../stageObject/association/Edge";
import { Section } from "../stageObject/entity/Section";
import { TextNode } from "../stageObject/entity/TextNode";
import { ConnectableEntity, Entity } from "../stageObject/StageObject";
import { StageDumper } from "./StageDumper";
import { StageManager } from "./stageManager/StageManager";
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

  export let effects: Effect[] = [];
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

  /**
   * 是否正在进行层级移动
   * 即从选中一些实体，改变他们从属的Section
   */
  // eslint-disable-next-line prefer-const
  export let isLayerMovingMode = false;

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
  export let warningEdges: Edge[] = [];
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
  export let hoverEdges: Edge[] = [];
  /** 鼠标悬浮的框 */
  // eslint-disable-next-line prefer-const
  export let hoverSections: Section[] = [];

  /**
   * 键盘操作的生长新节点是否显示
   */
  // eslint-disable-next-line prefer-const
  export let isVirtualNewNodeShow = false;
  /**
   * 键盘操作的生长新节点的位置
   */
  // eslint-disable-next-line prefer-const
  export let keyOnlyVirtualNewLocation = Vector.getZero();

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
    nodes: [],
    edges: [],
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

  let controllerGamepad: ControllerGamepad | null = null;

  /**
   * 自动保存是否处于暂停状态
   * 主要用于防止自动保存出bug，产生覆盖文件的问题
   */
  // eslint-disable-next-line prefer-const
  export let isAutoSavePaused = false;
  /**
   * 逻辑总入口
   * 该函数在上游被频繁调用
   */
  export function logicTick() {
    if (Stage.connectFromEntities.length > 0 && Controller.lastMoveLocation) {
      let connectTargetNode = null;
      for (const node of StageManager.getConnectableEntity()) {
        if (
          node.collisionBox.isPointInCollisionBox(Controller.lastMoveLocation)
        ) {
          connectTargetNode = node;
          break;
        }
      }
      if (connectTargetNode === null) {
        // 如果鼠标位置没有和任何节点相交
        effects.push(
          PointDashEffect.fromMouseEffect(
            Controller.lastMoveLocation,
            connectFromEntities.length * 5,
          ),
        );
      } else {
        // 画一条像吸住了的线
      }
    }

    for (const effect of effects) {
      effect.tick();
    }
    // 清理过时特效
    effects = effects.filter((effect) => !effect.timeProgress.isFull);

    if (controllerGamepad) {
      controllerGamepad.tick();
    }

    // 计算引擎
    autoComputeEngineTick();

    // 自动保存功能
    autoSaveTick();
    // 自动备份功能
    autoBackupTick();
  }

  let lastAutoSaveTime = performance.now();
  let autoSave = false;
  let autoSaveInterval = 60_000; // ms

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

    controllerGamepad = new ControllerGamepad();
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
          const rect = Renderer.getCoverWorldRectangle();

          Stage.effects.push(
            new LineCuttingEffect(
              new ProgressNumber(0, 10),
              rect.leftTop,
              rect.rightTop,
              Color.Black,
              Color.Black,
            ),
          );
          StageSaveManager.saveHandleWithoutCurrentPath(
            StageDumper.dump(),
            () => {},
            () => {},
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
        StageSaveManager.backupHandle(
          backupPath,
          StageDumper.dump(),
          () => {},
          (err) => {
            console.warn(err);
            // 备份失败
            effects.push(
              new TextRiseEffect(
                "自动备份失败" + String(err),
                new ProgressNumber(0, 100),
              ),
            );
          },
        );
      } else {
        StageSaveManager.backupHandleWithoutCurrentPath(
          StageDumper.dump(),
          () => {},
          () => {},
          false,
        );
      }
      // 更新时间
      lastAutoBackupTime = now;
    }
  }

  function autoComputeEngineTick() {
    // debug 只有在按下x键才会触发
    if (!Controller.pressingKeySet.has("x")) {
      return;
    }
    // 自动计算引擎功能
    for (const node of StageManager.getTextNodes()) {
      if (node.text === "#TEST#") {
        node.rename("Hello World!!");
      }
      if (node.text === "#ADD#") {
        const parents = getParentTextNodes(node);
        let sumResult = 0;
        for (const parent of parents) {
          sumResult += stringToNumber(parent.text);
        }
        const resultText = String(sumResult);
        getNodeResult(node, resultText);
      } else if (node.text === "#MUL#") {
        const parents = getParentTextNodes(node);
        let productResult = 1;
        for (const parent of parents) {
          productResult *= stringToNumber(parent.text);
        }
        const resultText = String(productResult);
        getNodeResult(node, resultText);
      } else if (node.text === "#AND#") {
        const parents = getParentTextNodes(node);
        let result = 1;
        for (const parent of parents) {
          result = result && stringToNumber(parent.text);
        }
        const resultText = String(result);
        getNodeResult(node, resultText);
      } else if (node.text === "#OR#") {
        const parents = getParentTextNodes(node);
        let result = 0;
        for (const parent of parents) {
          result = result || stringToNumber(parent.text);
        }
        const resultText = String(result);
        getNodeResult(node, resultText);
      } else if (node.text === "#NOT#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 1) {
          const parent = parents[0];
          const resultText = String(stringToNumber(parent.text) === 0 ? 1 : 0);
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#RANDOM#") {
        const randomNumber = Math.random();
        const resultText = String(randomNumber);
        getNodeResult(node, resultText);
      } else if (node.text === "#FLOOR#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 1) {
          const parent = parents[0];
          const resultText = String(Math.floor(stringToNumber(parent.text)));
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#CEIL#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 1) {
          const parent = parents[0];
          const resultText = String(Math.ceil(stringToNumber(parent.text)));
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#MOD#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 2) {
          const parent1 = parents[0];
          const parent2 = parents[1];
          const resultText = String(
            stringToNumber(parent1.text) % stringToNumber(parent2.text),
          );
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#SUB#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 2) {
          const parent1 = parents[0];
          const parent2 = parents[1];
          const resultText = String(
            stringToNumber(parent1.text) - stringToNumber(parent2.text),
          );
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#DIV#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 2) {
          const parent1 = parents[0];
          const parent2 = parents[1];
          const resultText = String(
            stringToNumber(parent1.text) / stringToNumber(parent2.text),
          );
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#ABS#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 1) {
          const parent = parents[0];
          const resultText = String(Math.abs(stringToNumber(parent.text)));
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#COPY#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 1) {
          const parent = parents[0];
          const resultText = parent.text;
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#LEN#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 1) {
          const parent = parents[0];
          const resultText = String(parent.text.length);
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#UPPER#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 1) {
          const parent = parents[0];
          const resultText = parent.text.toUpperCase();
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#LOWER#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 1) {
          const parent = parents[0];
          const resultText = parent.text.toLowerCase();
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#SPLIT#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 2) {
          const parent1 = parents[0];
          const parent2 = parents[1];
          const resultText = parent1.text.split(parent2.text)[0];
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#REPLACE#") {
        const parents = getParentTextNodes(node);
        if (parents.length === 3) {
          const parent1 = parents[0];
          const parent2 = parents[1];
          const parent3 = parents[2];
          const resultText = parent1.text.replace(parent2.text, parent3.text);
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#CONNECT#") {
        const parents = getParentTextNodes(node);
        let result = "";
        for (const parent of parents) {
          result += parent.text;
        }
        getNodeResult(node, result);
      } else if (node.text === "#MAX#") {
        const parents = getParentTextNodes(node);
        let maxResult = -Infinity;
        for (const parent of parents) {
          const parentNumber = stringToNumber(parent.text);
          if (parentNumber > maxResult) {
            maxResult = parentNumber;
          }
        }
        const resultText = String(maxResult);
        getNodeResult(node, resultText);
      } else if (node.text === "#MIN#") {
        const parents = getParentTextNodes(node);
        let minResult = Infinity;
        for (const parent of parents) {
          const parentNumber = stringToNumber(parent.text);
          if (parentNumber < minResult) {
            minResult = parentNumber;
          }
          const resultText = String(minResult);
          getNodeResult(node, resultText);
        }
      } else if (node.text === "#COUNT#") {
        const parents = getParentTextNodes(node);
        const resultText = String(parents.length);
        getNodeResult(node, resultText);
      }
    }
  }
  function getParentTextNodes(node: TextNode): TextNode[] {
    const parents = StageManager.nodeParentArray(node).filter(
      (node) => node instanceof TextNode,
    );
    // 将parents按x的坐标排序，小的在前面
    parents.sort((a, b) => {
      return (
        a.collisionBox.getRectangle().location.x -
        b.collisionBox.getRectangle().location.x
      );
    });
    return parents;
  }
  function getNodeResult(node: TextNode, resultText: string) {
    const childrenList = StageManager.nodeChildrenArray(node).filter(
      (node) => node instanceof TextNode,
    );
    if (childrenList.length > 0) {
      for (const child of childrenList) {
        child.rename(resultText);
      }
    } else {
      // 新建一个节点生长出去
      const newNode = new TextNode({
        uuid: uuidv4(),
        text: resultText,
        location: [
          node.collisionBox.getRectangle().location.x,
          node.collisionBox.getRectangle().location.y + 100,
        ],
        size: [100, 100],
        color: [0, 0, 0, 0],
      });
      StageManager.addTextNode(newNode);
      StageManager.connectEntity(node, newNode);
    }
  }

  function stringToNumber(str: string) {
    return parseFloat(str);
  }
}
