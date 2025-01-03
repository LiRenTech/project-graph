import { Color, mixColors } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { RenderUtils } from "../../render/canvas2d/RenderUtils";
import { Camera } from "../../stage/Camera";
import { Effect } from "../effect";

export class RectangleRenderEffect extends Effect {
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
    RenderUtils.renderRect(
      this.rectangle.transformWorld2View(),
      this.fillColor,
      mixColors(this.strokeColor, Color.Transparent, this.timeProgress.rate),
      this.strokeWidth * Camera.currentScale,
    );
  }

  static fromPreAlign(rectangle: Rectangle): RectangleRenderEffect {
    return new RectangleRenderEffect(
      new ProgressNumber(0, 10),
      rectangle,
      Color.Transparent,
      Color.Green,
      2,
    );
  }
}
