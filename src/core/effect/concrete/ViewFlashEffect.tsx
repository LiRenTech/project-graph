import { Color, mixColors } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { RenderUtils } from "../../render/canvas2d/RenderUtils";
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

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    RenderUtils.renderRect(
      new Rectangle(new Vector(-10000, -10000), new Vector(20000, 20000)),
      mixColors(this.color, new Color(0, 0, 0, 0), this.timeProgress.rate),
      Color.Transparent,
      0,
    );
  }
}
