import Effect from "../core/effect/effect";
import Camera from "./Camera";
// import { NodeManager } from "../core/NodeManager";

/**
 * 舞台对象
 */
export class Stage {
  public effects: Effect[];

  constructor(public camera: Camera) {
    this.effects = [];
  }

  /**
   * 逻辑总入口
   */
  logicTick() {
    for (let effect of this.effects) {
      effect.tick();
    }
    // 清理过时特效
    this.effects = this.effects.filter((effect) => !effect.timeProgress.isFull);
  }
}
