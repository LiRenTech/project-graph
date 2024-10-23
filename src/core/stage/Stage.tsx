import { Edge } from "../stageObject/association/Edge";
import { Effect } from "../effect/effect";
import { TextNode } from "../stageObject/entity/TextNode";
import { Rectangle } from "../dataStruct/shape/Rectangle";
import { Vector } from "../dataStruct/Vector";
import { Serialized } from "../../types/node";
import { StageDumper } from "./StageDumper";
import { Line } from "../dataStruct/shape/Line";
import { Section } from "../stageObject/entity/Section";
import { ConnectableEntity, Entity } from "../stageObject/StageObject";

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
  export let effects: Effect[] = [];
  /**
   * 是否正在框选
   */
  export const isSelecting = false;
  /**
   * 框选框
   * 这里必须一开始为null，否则报错，can not asses "Rectangle"
   * 这个框选框是基于世界坐标的。
   * 此变量会根据两个点的位置自动更新。
   */
  export const selectingRectangle: Rectangle | null = null;

  /**
   * 框选框的起点
   */
  export const selectStartLocation: Vector = Vector.getZero();
  /**
   * 框选框的终点
   */
  export const selectEndLocation: Vector = Vector.getZero();

  /**
   * 是否正在切断连线或切割
   */
  export const isCutting = false;
  export const cuttingLine: Line | null = null;
  /**
   * 正在准备要删除的节点
   */
  export const warningEntity: Entity[] = [];
  /**
   * 正在准备要删除的连线
   */
  export const warningEdges: Edge[] = [];
  export const warningSections: Section[] = [];
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
  export const hoverSections: Section[] = [];

  /**
   * 键盘操作的生长新节点是否显示
   */
  export const isVirtualNewNodeShow = false;
  /**
   * 键盘操作的生长新节点的位置
   */
  export const keyOnlyVirtualNewLocation = Vector.getZero();

  /**
   * 搜索结果
   */
  export const searchResultNodes: TextNode[] = [];
  /**
   * 搜索结果的索引
   */
  export const currentSearchResultIndex = 0;

  /**
   * 粘贴板数据
   */
  export const copyBoardData: Serialized.File = {
    version: StageDumper.latestVersion,
    nodes: [],
    edges: [],
  };
  /**
   * 粘贴板内容上的外接矩形
   * 当他为null时，表示没有粘贴板数据
   */
  export const copyBoardDataRectangle: Rectangle | null = null;
  /**
   * 表示从粘贴板外接矩形的矩形中心，到鼠标当前位置的向量
   * 用于计算即将粘贴的位置
   */
  export const copyBoardMouseVector: Vector = Vector.getZero();

  /**
   * 当前是否是拖拽文件入窗口的状态
   */
  export const isDraggingFile = false;

  /**
   * 当前鼠标所在的世界坐标
   */
  export const draggingLocation = Vector.getZero();

  /**
   * 逻辑总入口
   */
  export function logicTick() {
    for (const effect of effects) {
      effect.tick();
    }
    // 清理过时特效
    effects = effects.filter((effect) => !effect.timeProgress.isFull);
  }
}
