import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Project } from "../../../Project";

/**
 * 一次性特效类
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

  /** 子特效（构成树形组合模式） */
  protected subEffects: Effect[] = [];

  tick(project: Project): void {
    // 自动+1帧
    this.timeProgress.add(1);
    // 子特效tick
    for (const subEffect of this.subEffects) {
      subEffect.tick(project);
    }
  }

  /**
   * 渲染方法
   */
  abstract render(project: Project): void;

  /**
   * 获取对象的类名
   * 实测通过反射机制 effect.constructor.name 拿到的类名会被压缩，所以还要手写一次。
   * 用于特效的开关，需要手动控制返回的名称和类名保持一致。
   * 文件名也和类名保证一致
   */
  abstract getClassName(): string;
}
