import { Color, mixColors } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { ShapeRenderer } from "../../../../render/canvas2d/basicRenderer/shapeRenderer";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";

/**
 * 屏幕闪颜色效果
 */
export class ViewFlashEffect extends EffectObject {
  constructor(
    public color: Color,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 100),
  ) {
    super(timeProgress);
  }

  static SaveFile() {
    return new ViewFlashEffect(
      StageStyleManager.currentStyle.effects.windowFlash,
      new ProgressNumber(0, 10),
    );
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    ShapeRenderer.renderRect(
      new Rectangle(new Vector(-10000, -10000), new Vector(20000, 20000)),
      mixColors(this.color, new Color(0, 0, 0, 0), this.timeProgress.rate),
      Color.Transparent,
      0,
    );
  }
}
