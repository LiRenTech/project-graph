import { Edge } from "../Edge";
import { Effect } from "../effect/effect";
import { Node } from "../Node";
import { Rectangle } from "../dataStruct/Rectangle";
import { Vector } from "../dataStruct/Vector";
import { Line } from "../dataStruct/Line";

/**
 * 舞台对象
 * 更广义的舞台，舞台实体全部存在manager里，但这个里面主要存一些动态的属性
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
  export let warningNodes: Node[] = [];
  /**
   * 正在准备要删除的连线
   */
  export let warningEdges: Edge[] = [];
  /**
   * 用于多重连接
   */
  export let connectFromNodes: Node[] = [];
  export let connectToNode: Node | null = null;

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
