import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { EffectObject } from "../effectObject";
import { LineCuttingEffect } from "./LineCuttingEffect";

/**
 * 用于某个节点进入了某个Section内部，四个角连向了父Section矩形的四个角
 */
export class RectanglePushInEffect extends EffectObject {
  constructor(
    public smallRectangle: Rectangle,
    public bigRectangle: Rectangle,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 50),
  ) {
    super(timeProgress);
    this.subEffects = [
      new LineCuttingEffect(
        timeProgress,
        smallRectangle.leftTop,
        bigRectangle.leftTop,
        Color.Green,
        Color.Green,
      ),
      new LineCuttingEffect(
        timeProgress,
        smallRectangle.rightTop,
        bigRectangle.rightTop,
        Color.Green,
        Color.Green,
      ),
      new LineCuttingEffect(
        timeProgress,
        smallRectangle.leftBottom,
        bigRectangle.leftBottom,
        Color.Green,
        Color.Green,
      ),
      new LineCuttingEffect(
        timeProgress,
        smallRectangle.rightBottom,
        bigRectangle.rightBottom,
        Color.Green,
        Color.Green,
      ),
    ];
  }

  protected subEffects: EffectObject[];

  render(): void {
    for (const effect of this.subEffects) {
      effect.render();
    }
  }
}
