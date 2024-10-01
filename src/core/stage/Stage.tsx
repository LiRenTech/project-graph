import { Effect } from "../effect/effect";
import { Rectangle } from "../Rectangle";

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
