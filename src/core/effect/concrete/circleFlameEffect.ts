import Color from "../../Color";
import { ProgressNumber } from "../../ProgressNumber";
import { Vector } from "../../Vector";
import Effect from "../effect";

/**
 * 圆形火光特效
 * 中间有颜色，边缘透明，中心放射状过渡
 */
export default class CircleFlameEffect extends Effect {
  constructor(
    /**
     * 一开始为0，每tick + 1
     */
    public override timeProgress: ProgressNumber,
    public location: Vector,
    public radius: number,
    public color: Color,
  ) {
    super(timeProgress);
  }

  override tick() {
    super.tick();
  }
}
