import { service } from "../../../Project";
import { Settings } from "../../Settings";
import { EffectObject } from "./effectObject";

/**
 * 特效机器
 *
 * 它将产生一个机器对象，并唯一附着在舞台上。
 * 如果有多页签多页面，则每个页面都有自己的唯一特效机器。
 */
@service("effects")
export class Effects {
  private effectsPerferences: Record<string, boolean> = {};

  constructor() {
    Settings.watch("effectsPerferences", (value) => {
      this.effectsPerferences = value;
    });
  }

  private effects: EffectObject[] = [];

  public addEffect(effect: EffectObject) {
    if (!(this.effectsPerferences[effect.getClassName()] ?? true)) {
      return;
    }
    this.effects.push(effect);
  }

  public get effectsCount() {
    return this.effects.length;
  }

  public addEffects(effects: EffectObject[]) {
    this.effects.push(...effects.filter((effect) => this.effectsPerferences[effect.getClassName()] ?? true));
  }

  tick() {
    for (const effect of this.effects) {
      effect.tick();
    }
    // 清理过时特效
    this.effects = this.effects.filter((effect) => !effect.timeProgress.isFull);
    for (const effect of this.effects) {
      effect.render();
    }
  }
}
