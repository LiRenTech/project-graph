import { ProgressNumber } from "../../../dataStruct/ProgressNumber";

/**
 * 一次性特效类
 * timeProgress 0~max 表示时间进度，0表示开始，单位：帧
 */
export abstract class EffectObject {
  constructor(
    /**
     * 注意这个进度条初始值应该是0
     */
    public timeProgress: ProgressNumber,
    public delay: number = 0,
  ) {}

  /** 子特效（构成树形组合模式） */
  protected subEffects: EffectObject[] = [];

  tick(): void {
    // 自动+1帧
    this.timeProgress.add(1);
    // 子特效tick
    for (const subEffect of this.subEffects) {
      subEffect.tick();
    }
  }

  /**
   * 渲染方法
   */
  abstract render(): void;
}
