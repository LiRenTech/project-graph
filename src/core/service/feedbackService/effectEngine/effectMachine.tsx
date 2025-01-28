import { Renderable, Tickable } from "../../../interfaces/interfaces";
import { Settings } from "../../Settings";
import { EffectObject } from "./effectObject";

/**
 * 特效机器
 *
 * 它将产生一个机器对象，并唯一附着在舞台上。
 * 如果有多页签多页面，则每个页面都有自己的唯一特效机器。
 */
export class EffectMachine implements Tickable, Renderable {
  private effectsPerferences: Record<string, boolean> = {};

  private constructor() {
    Settings.watch("effectsPerferences", (value) => {
      this.effectsPerferences = value;
    });
  }

  static default(): EffectMachine {
    return new EffectMachine();
  }

  private effects: EffectObject[] = [];

  public addEffect(effect: EffectObject) {
    console.log("add effect", effect.constructor.name);
    if (!(this.effectsPerferences[effect.constructor.name] ?? true)) {
      console.log("effect not enabled");
      return;
    }
    this.effects.push(effect);
  }

  public get effectsCount() {
    return this.effects.length;
  }

  public addEffects(effects: EffectObject[]) {
    this.effects.push(
      ...effects.filter(
        (effect) => this.effectsPerferences[effect.constructor.name] ?? true,
      ),
    );
  }

  /**
   * 此函数放在舞台的逻辑循环中，每帧都会被调用。
   */
  public logicTick() {
    for (const effect of this.effects) {
      effect.tick();
    }
    // 清理过时特效
    this.effects = this.effects.filter((effect) => !effect.timeProgress.isFull);
  }

  /** 渲染所有特效 */
  public renderTick() {
    for (const effect of this.effects) {
      effect.render();
    }
  }
}
