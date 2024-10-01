import { Effect } from "../effect/effect";

/**
 * 舞台对象
 */
export namespace Stage {
  export let effects: Effect[] = [];

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
