import Color from "../../Color";
import { ProgressNumber } from "../../ProgressNumber";
import { Vector } from "../../Vector";
import Effect from "../effect";

/**
 * 线段特效
 * 直接显示全部，随着时间推移逐渐透明
 */
export default class LineEffect extends Effect {
  constructor(
    public override timeProgress: ProgressNumber,
    public fromLocation: Vector,
    public toLocation: Vector,
    public fromColor: Color,
    public toColor: Color,
    public lineWidth: number,
  ) {
    super(timeProgress);
  }
}
