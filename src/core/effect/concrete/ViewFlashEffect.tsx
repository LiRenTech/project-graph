import { Color } from "../../Color";
import { ProgressNumber } from "../../ProgressNumber";
import { Effect } from "../effect";

/**
 * 屏幕闪颜色效果
 */
export class ViewFlashEffect extends Effect {
  constructor(
    public color: Color,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 100),
  ) {
    super(timeProgress);
  }
}
