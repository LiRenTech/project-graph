import { Edge } from "../stageObject/Edge";
import { Effect } from "../effect/effect";
import { TextNode } from "../stageObject/TextNode";
import { Rectangle } from "../dataStruct/Rectangle";
import { Vector } from "../dataStruct/Vector";
import { Line } from "../dataStruct/Line";
import { Serialized } from "../../types/node";
import { StageDumper } from "./StageDumper";

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
  export let isSelecting = false;
  /**
   * 框选框
   * 这里必须一开始为null，否则报错，can not asses "Rectangle"
   * 这个框选框是基于世界坐标的。
   * 此变量会根据两个点的位置自动更新。
   */
  export let selectingRectangle: Rectangle | null = null;

  /**
   * 框选框的起点
   */
  export let selectStartLocation: Vector = Vector.getZero();
  /**
   * 框选框的终点
   */
  export let selectEndLocation: Vector = Vector.getZero();

  /**
   * 是否正在切断连线或切割
   */
  export let isCutting = false;
  export let cuttingLine: Line = new Line(Vector.getZero(), Vector.getZero());
  /**
   * 正在准备要删除的节点
   */
  export let warningNodes: TextNode[] = [];
  /**
   * 正在准备要删除的连线
   */
  export let warningEdges: Edge[] = [];
  /**
   * 用于多重连接
   */
  export let connectFromNodes: TextNode[] = [];
  export let connectToNode: TextNode | null = null;

  /**
   * 鼠标悬浮的边
   */
  export let hoverEdges: Edge[] = [];

  /**
   * 键盘操作的生长新节点是否显示
   */
  export let isVirtualNewNodeShow = false;
  /**
   * 键盘操作的生长新节点的位置
   */
  export let keyOnlyVirtualNewLocation = Vector.getZero();

  /**
   * 搜索结果
   */
  export let searchResultNodes: TextNode[] = [];
  /**
   * 搜索结果的索引
   */
  export let currentSearchResultIndex = 0;

  /**
   * 粘贴板数据
   */
  export let copyBoardData: Serialized.File = {
    version: StageDumper.latestVersion,
    nodes: [],
    edges: [],
  };
  /**
   * 粘贴板内容上的外接矩形
   * 当他为null时，表示没有粘贴板数据
   */
  export let copyBoardDataRectangle: Rectangle | null = null;
  /**
   * 表示从粘贴板外接矩形的矩形中心，到鼠标当前位置的向量
   * 用于计算即将粘贴的位置
   */
  export let copyBoardMouseVector: Vector = Vector.getZero();

  /**
   * 当前是否是拖拽文件入窗口的状态
   */
  export let isDraggingFile = false;

  /**
   * 当前鼠标所在的世界坐标
   */
  export let draggingLocation = Vector.getZero();

  /**
   * 逻辑总入口
   */
  export function logicTick() {
    for (let effect of effects) {
      effect.tick();
    }
    // 清理过时特效
    effects = effects.filter((effect) => !effect.timeProgress.isFull);
  }
}
