import { Random } from "../../algorithm/random";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/Rectangle";
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
        this.ashLocationArray[i]
          .subtract(this.rectangle.center)
          .normalize()
          .multiply(Random.randomFloat(0.5, 10)),
      );
    }
    console.log(this.ashSpeedArray);
  }

  override tick() {
    super.tick();
    for (let i = 0; i < this.ashLocationArray.length; i++) {
      this.ashLocationArray[i] = this.ashLocationArray[i].add(
        this.ashSpeedArray[i],
      );
    }
    // console.log(this.ashLocationArray);
  }
}
