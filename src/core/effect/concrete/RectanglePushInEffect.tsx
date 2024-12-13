import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Effect } from "../effect";
import { LineCuttingEffect } from "./LineCuttingEffect";

export class RectanglePushInEffect extends Effect {
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

  protected subEffects: Effect[];

  render(): void {
    for (const effect of this.subEffects) {
      effect.render();
    }
  }
}
