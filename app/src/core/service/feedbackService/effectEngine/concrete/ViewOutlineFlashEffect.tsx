import { Color, mixColors } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { Effect } from "../effectObject";

/**
 * 屏幕边缘闪颜色效果
 */
export class ViewOutlineFlashEffect extends Effect {
  getClassName(): string {
    return "ViewOutlineFlashEffect";
  }
  constructor(
    private readonly project: Project,
    public color: Color,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 100),
  ) {
    super(timeProgress);
  }

  static normal(project: Project, color: Color): ViewOutlineFlashEffect {
    return new ViewOutlineFlashEffect(project, color);
  }

  static short(project: Project, color: Color): ViewOutlineFlashEffect {
    return new ViewOutlineFlashEffect(project, color, new ProgressNumber(0, 5));
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    const viewRect = this.project.renderer.getCoverWorldRectangle();

    const currentColor = mixColors(this.color, new Color(0, 0, 0, 0), this.timeProgress.rate);
    // 左侧边缘

    this.project.shapeRenderer.renderRectWithShadow(
      this.project.renderer.transformWorld2View(new Rectangle(viewRect.leftTop, new Vector(20, viewRect.size.y))),
      currentColor,
      Color.Transparent,
      0,
      currentColor,
      200,
    );
    // 右侧边缘
    this.project.shapeRenderer.renderRectWithShadow(
      this.project.renderer.transformWorld2View(
        new Rectangle(new Vector(viewRect.left + viewRect.size.x - 20, viewRect.top), new Vector(20, viewRect.size.y)),
      ),
      currentColor,
      Color.Transparent,
      0,
      currentColor,
      50,
    );
    // 上侧边缘
    this.project.shapeRenderer.renderRectWithShadow(
      this.project.renderer.transformWorld2View(new Rectangle(viewRect.leftTop, new Vector(viewRect.size.x, 20))),
      currentColor,
      Color.Transparent,
      0,
      currentColor,
      50,
    );
    // 下侧边缘
    this.project.shapeRenderer.renderRectWithShadow(
      this.project.renderer.transformWorld2View(
        new Rectangle(new Vector(viewRect.left, viewRect.top + viewRect.size.y - 20), new Vector(viewRect.size.x, 20)),
      ),
      currentColor,
      Color.Transparent,
      0,
      currentColor,
      50,
    );
  }
}
