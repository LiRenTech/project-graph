import { Random } from "../../algorithm/random";
import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { Effect } from "../effect";

/**
 * 方块的爆炸粉尘效果
 */
export class ExplodeAshEffect extends Effect {
  ashLocationArray: Vector[] = [];
  ashSpeedArray: Vector[] = [];

  constructor(
    /**
     * 一开始为0，每tick + 1
     */
    public override timeProgress: ProgressNumber,
    public rectangle: Rectangle,
    public color: Color,
  ) {
    super(timeProgress);
    for (let i = 0; i < 1000; i++) {
      this.ashLocationArray.push(
        new Vector(
          Random.randomFloat(rectangle.left, rectangle.right),
          Random.randomFloat(rectangle.top, rectangle.bottom),
        ),
      );
      this.ashSpeedArray.push(
        this.ashLocationArray[i]
          .subtract(this.rectangle.center)
          .normalize()
          .multiply(Random.randomFloat(0.5, 10)),
      );
    }
  }

  override tick() {
    super.tick();
    for (let i = 0; i < this.ashLocationArray.length; i++) {
      this.ashLocationArray[i] = this.ashLocationArray[i].add(
        this.ashSpeedArray[i],
      );
    }
  }
}
