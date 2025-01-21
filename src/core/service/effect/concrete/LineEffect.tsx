import { Color, mixColors } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Vector } from "../../../dataStruct/Vector";
import { CurveRenderer } from "../../../render/canvas2d/basicRenderer/curveRenderer";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Camera } from "../../../stage/Camera";
import { Effect } from "../effect";

/**
 * 线段特效
 * 直接显示全部，随着时间推移逐渐透明
 */
export class LineEffect extends Effect {
  constructor(
    public override timeProgress: ProgressNumber,
    public fromLocation: Vector,
    public toLocation: Vector,
    public fromColor: Color,
    public toColor: Color,
    public lineWidth: number,
  ) {
    super(timeProgress);
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    const fromLocation = Renderer.transformWorld2View(this.fromLocation);
    const toLocation = Renderer.transformWorld2View(this.toLocation);
    const fromColor = mixColors(
      this.fromColor,
      this.fromColor.toTransparent(),
      this.timeProgress.rate,
    );
    const toColor = mixColors(
      this.toColor,
      this.toColor.toTransparent(),
      this.timeProgress.rate,
    );
    CurveRenderer.renderGradientLine(
      fromLocation,
      toLocation,
      fromColor,
      toColor,
      this.lineWidth * Camera.currentScale,
    );
  }
}
