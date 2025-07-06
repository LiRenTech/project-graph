import { Color, mixColors } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { Effect } from "../effectObject";

/**
 * 屏幕闪颜色效果
 */
export class ViewFlashEffect extends Effect {
  getClassName(): string {
    return "ViewFlashEffect";
  }
  constructor(
    public color: Color,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 100),
  ) {
    super(timeProgress);
  }

  static SaveFile() {
    return new ViewFlashEffect(
      this.project.stageStyleManager.currentStyle.effects.windowFlash,
      new ProgressNumber(0, 10),
    );
  }
  static Portal() {
    return new ViewFlashEffect(new Color(127, 75, 124), new ProgressNumber(0, 10));
  }

  render(project: Project) {
    if (this.timeProgress.isFull) {
      return;
    }
    project.shapeRenderer.renderRect(
      new Rectangle(new Vector(-10000, -10000), new Vector(20000, 20000)),
      mixColors(this.color, new Color(0, 0, 0, 0), this.timeProgress.rate),
      Color.Transparent,
      0,
    );
  }
}
