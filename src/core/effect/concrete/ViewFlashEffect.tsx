import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
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

  static SaveFile() {
    return new ViewFlashEffect(Color.Black, new ProgressNumber(0, 10));
  }
}
