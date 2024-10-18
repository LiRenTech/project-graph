import { Random } from "../../algorithm/random";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { Effect } from "../effect";

/**
 * 方块的爆炸粉尘效果
 */
export class ExplodeAshEffect extends Effect {
  constructor(
    /**
     * 一开始为0，每tick + 1
     */
    public override timeProgress: ProgressNumber,
    public rectangle: Rectangle,
    public ashLocationArray: Vector[],
    public ashSpeedArray: Vector[],
  ) {
    super(timeProgress);
    for (let i = 0; i < 50; i++) {
      this.ashLocationArray.push(
        new Vector(
          Random.randomFloat(rectangle.left, rectangle.right),
          Random.randomFloat(rectangle.top, rectangle.bottom),
        ),
      );
      this.ashSpeedArray.push(
        new Vector(1, 0)
          .rotate(Random.randomFloat(0, 2 * Math.PI))
          .multiply(Random.randomFloat(0.5, 1.5)),
      );
    }
  }

  override tick() {
    super.tick();
    for (let i = 0; i < this.ashLocationArray.length; i++) {
      this.ashLocationArray[i].add(this.ashSpeedArray[i]);
    }
  }
}
