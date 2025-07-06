import { Color, mixColors } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Project } from "../../../../Project";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Effect } from "../effectObject";

export class RectangleRenderEffect extends Effect {
  getClassName(): string {
    return "RectangleRenderEffect";
  }
  constructor(
    public override timeProgress: ProgressNumber,
    private rectangle: Rectangle,
    private fillColor: Color,
    private strokeColor: Color,
    private strokeWidth: number,
  ) {
    super(timeProgress);
  }

  render(project: Project) {
    project.shapeRenderer.renderRect(
      project.renderer.transformWorld2View(this.rectangle),
      this.fillColor,
      mixColors(this.strokeColor, this.strokeColor.toTransparent(), this.timeProgress.rate),
      this.strokeWidth * project.camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * project.camera.currentScale,
    );
  }

  static fromPreAlign(rectangle: Rectangle): RectangleRenderEffect {
    return new RectangleRenderEffect(
      new ProgressNumber(0, 10),
      rectangle,
      Color.Transparent,
      this.project.stageStyleManager.currentStyle.CollideBoxPreSelected,
      4,
    );
  }

  static fromShiftClickSelect(rectangle: Rectangle): RectangleRenderEffect {
    return new RectangleRenderEffect(
      new ProgressNumber(0, 100),
      rectangle,
      Color.Transparent,
      this.project.stageStyleManager.currentStyle.CollideBoxPreSelected.toSolid(),
      4,
    );
  }
}
