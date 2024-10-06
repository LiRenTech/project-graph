import { ProgressNumber } from "../dataStruct/ProgressNumber";

/**
 * 特效类
 * timeProgress 0~max 表示时间进度，0表示开始，单位：帧
 */
export abstract class Effect {
  constructor(
    /**
     * 注意这个进度条初始值应该是0
     */
    public timeProgress: ProgressNumber,
    public delay: number = 0,
  ) {}

  tick(): void {
    // 自动+1帧
    this.timeProgress.add(1);
  }
}
