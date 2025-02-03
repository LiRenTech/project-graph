import { Color, mixColors } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { ShapeRenderer } from "../../../../render/canvas2d/basicRenderer/shapeRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";

export class RectangleRenderEffect extends EffectObject {
  constructor(
    public override timeProgress: ProgressNumber,
    private rectangle: Rectangle,
    private fillColor: Color,
    private strokeColor: Color,
    private strokeWidth: number,
  ) {
    super(timeProgress);
  }

  render() {
    ShapeRenderer.renderRect(
      this.rectangle.transformWorld2View(),
      this.fillColor,
      mixColors(this.strokeColor, this.strokeColor.toTransparent(), this.timeProgress.rate),
      this.strokeWidth * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
  }

  static fromPreAlign(rectangle: Rectangle): RectangleRenderEffect {
    return new RectangleRenderEffect(
      new ProgressNumber(0, 10),
      rectangle,
      Color.Transparent,
      StageStyleManager.currentStyle.CollideBoxPreSelectedColor,
      4,
    );
  }
}
