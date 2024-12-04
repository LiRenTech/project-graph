import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { Effect } from "../effect";
import { LineCuttingEffect } from "./LineCuttingEffect";

export class EntityCreateLineEffect extends Effect {
  constructor(
    public override timeProgress: ProgressNumber,
    public rect: Rectangle,
  ) {
    super(timeProgress);
    const fromColor = new Color(100, 100, 100, 0);
    const toColor = new Color(255, 255, 255, 1);
    const shiftingLength = 0;
    // 子特效
    this.subEffects = [
      new LineCuttingEffect(
        new ProgressNumber(0, timeProgress.maxValue),
        rect.leftTop.add(new Vector(-shiftingLength, -shiftingLength)),
        rect.rightTop,
        fromColor.clone(),
        toColor.clone(),
        10,
      ),
      new LineCuttingEffect(
        new ProgressNumber(0, timeProgress.maxValue),
        rect.rightTop.add(new Vector(shiftingLength, -shiftingLength)),
        rect.rightBottom,
        fromColor.clone(),
        toColor.clone(),
        10,
      ),
      new LineCuttingEffect(
        new ProgressNumber(0, timeProgress.maxValue),
        rect.rightBottom.add(new Vector(shiftingLength, shiftingLength)),
        rect.leftBottom,
        fromColor.clone(),
        toColor.clone(),
        10,
      ),
      new LineCuttingEffect(
        new ProgressNumber(0, timeProgress.maxValue),
        rect.leftBottom.add(new Vector(-shiftingLength, shiftingLength)),
        rect.leftTop,
        fromColor,
        toColor,
        10,
      ),
    ];
  }
  
  static from(rectangle: Rectangle): EntityCreateLineEffect {
    return new EntityCreateLineEffect(new ProgressNumber(0, 30), rectangle);
  }

  override tick() {
    super.tick();
  }

  render(): void {
    for (const subEffect of this.subEffects) {
      subEffect.render();
    }
  }
}
