import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "../../render/canvas2d/renderer";
import { RenderUtils } from "../../render/canvas2d/RenderUtils";
import { Camera } from "../../stage/Camera";
import { Effect } from "../effect";

/**
 * 圆形火光特效
 * 中间有颜色，边缘透明，中心放射状过渡
 */
export class CircleFlameEffect extends Effect {
  constructor(
    /**
     * 一开始为0，每tick + 1
     */
    public override timeProgress: ProgressNumber,
    public location: Vector,
    public radius: number,
    public color: Color,
  ) {
    super(timeProgress);
  }

  override tick() {
    super.tick();
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    this.color.a = 1 - this.timeProgress.rate;
    const rendRadius = this.radius * this.timeProgress.rate;
    RenderUtils.renderCircleTransition(
      Renderer.transformWorld2View(this.location),
      rendRadius * Camera.currentScale,
      this.color,
    );
  }
}
