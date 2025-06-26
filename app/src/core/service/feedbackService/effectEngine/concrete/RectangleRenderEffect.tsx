import { Color, mixColors } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Project } from "../../../../Project";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";

export class RectangleRenderEffect extends EffectObject {
  getClassName(): string {
    return "RectangleRenderEffect";
  }
  constructor(
    private readonly project: Project,
    public override timeProgress: ProgressNumber,
    private rectangle: Rectangle,
    private fillColor: Color,
    private strokeColor: Color,
    private strokeWidth: number,
  ) {
    super(timeProgress);
  }

  render() {
    this.project.shapeRenderer.renderRect(
      this.project.renderer.transformWorld2View(this.rectangle),
      this.fillColor,
      mixColors(this.strokeColor, this.strokeColor.toTransparent(), this.timeProgress.rate),
      this.strokeWidth * this.project.camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * this.project.camera.currentScale,
    );
  }

  static fromPreAlign(project: Project, rectangle: Rectangle): RectangleRenderEffect {
    return new RectangleRenderEffect(
      project,
      new ProgressNumber(0, 10),
      rectangle,
      Color.Transparent,
      StageStyleManager.currentStyle.CollideBoxPreSelected,
      4,
    );
  }

  static fromShiftClickSelect(project: Project, rectangle: Rectangle): RectangleRenderEffect {
    return new RectangleRenderEffect(
      project,
      new ProgressNumber(0, 100),
      rectangle,
      Color.Transparent,
      StageStyleManager.currentStyle.CollideBoxPreSelected.toSolid(),
      4,
    );
  }
}
