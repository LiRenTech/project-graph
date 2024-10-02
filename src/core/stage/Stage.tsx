import { Edge } from "../Edge";
import { Effect } from "../effect/effect";
import { Line } from "../Line";
import { Node } from "../Node";
import { Rectangle } from "../Rectangle";
import { Vector } from "../Vector";

/**
 * 舞台对象
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
   */
  export let selectingRectangle: Rectangle | null = null;

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
