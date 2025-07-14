import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { EffectObject } from "../effectObject";
import { LineEffect } from "./LineEffect";
import { Random } from "../../../../algorithm/random";
import { Vector } from "../../../../dataStruct/Vector";

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
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 50),
    public color: Color = Color.Blue,
    public isHorizontal: boolean = true,
  ) {
    super(timeProgress);
    console.log("创建了特效");

    this.subEffects = [];
    const trailCount = 50; // 每条边显示5条尾翼线
    const minLength = 100;
    const maxLength = 200;

    if (isHorizontal) {
      // 水平移动：只显示移动方向相反侧的尾翼线
      const isMovingRight = endRect.left > startRect.left;
      const edgeX = isMovingRight ? endRect.left : endRect.right;

      // 在垂直边缘均匀分布尾翼线
      for (let i = 0; i < trailCount; i++) {
        const y = endRect.top + (endRect.height * i) / (trailCount - 1);
        const startPoint = new Vector(edgeX, y);
        const endPoint = isMovingRight
          ? startPoint.subtract(new Vector(Random.randomFloat(minLength, maxLength), 0))
          : startPoint.add(new Vector(Random.randomFloat(minLength, maxLength), 0));

        this.subEffects.push(
          new LineEffect(timeProgress.clone(), startPoint, endPoint, color.toNewAlpha(0.8), color.toNewAlpha(0.2), 2),
        );
      }
    } else {
      // 垂直移动：只显示移动方向相反侧的尾翼线
      const isMovingDown = endRect.top > startRect.top;
      const edgeY = isMovingDown ? endRect.top : endRect.bottom;

      // 在水平边缘均匀分布尾翼线
      for (let i = 0; i < trailCount; i++) {
        const x = endRect.left + (endRect.width * i) / (trailCount - 1);
        const startPoint = new Vector(x, edgeY);
        const endPoint = isMovingDown
          ? startPoint.subtract(new Vector(0, Random.randomFloat(minLength, maxLength)))
          : startPoint.add(new Vector(0, Random.randomFloat(minLength, maxLength)));

        this.subEffects.push(
          new LineEffect(timeProgress.clone(), startPoint, endPoint, color.toNewAlpha(0.8), color.toNewAlpha(0.2), 2),
        );
      }
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
