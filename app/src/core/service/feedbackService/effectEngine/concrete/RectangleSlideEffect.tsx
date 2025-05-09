import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { EffectObject } from "../effectObject";
import { LineEffect } from "./LineEffect";

/**
 * 专门处理矩形水平和垂直移动效果
 * 显示渐变直线作为视觉效果
 */
export class RectangleSlideEffect extends EffectObject {
  getClassName(): string {
    return "RectangleSlideEffect";
  }

  constructor(
    public startRect: Rectangle,
    public endRect: Rectangle,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 30),
    public color: Color = Color.Blue,
    public isHorizontal: boolean = true,
  ) {
    super(timeProgress);
    console.log("创建了特效");

    // 创建渐变直线效果
    if (isHorizontal) {
      // 水平移动：显示左右边缘的渐变线
      this.subEffects = [
        new LineEffect(timeProgress, startRect.leftCenter, endRect.leftCenter, color.toNewAlpha(0.5), color, 2),
        new LineEffect(timeProgress, startRect.rightCenter, endRect.rightCenter, color, color.toNewAlpha(0.5), 2),
      ];
    } else {
      // 垂直移动：显示上下边缘的渐变线
      this.subEffects = [
        new LineEffect(timeProgress, startRect.topCenter, endRect.topCenter, color.toNewAlpha(0.5), color, 2),
        new LineEffect(timeProgress, startRect.bottomCenter, endRect.bottomCenter, color, color.toNewAlpha(0.5), 2),
      ];
    }
  }

  protected subEffects: EffectObject[];

  render(): void {
    for (const effect of this.subEffects) {
      effect.render();
    }
  }

  /**
   * 创建水平滑动效果
   */
  static horizontalSlide(startRect: Rectangle, endRect: Rectangle, color?: Color) {
    const timeProgress = new ProgressNumber(0, 30);
    return new RectangleSlideEffect(startRect, endRect, timeProgress, color, true);
  }

  /**
   * 创建垂直滑动效果
   */
  static verticalSlide(startRect: Rectangle, endRect: Rectangle, color?: Color) {
    const timeProgress = new ProgressNumber(0, 30);
    return new RectangleSlideEffect(startRect, endRect, timeProgress, color, false);
  }
}
