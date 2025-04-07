import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { ShapeRenderer } from "../../../../render/canvas2d/basicRenderer/shapeRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { EffectObject } from "../effectObject";

/**
 * 圆形火光特效
 * 中间有颜色，边缘透明，中心放射状过渡
 */
export class CircleFlameEffect extends EffectObject {
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
  getClassName(): string {
    return "CircleFlameEffect";
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
    ShapeRenderer.renderCircleTransition(
      Renderer.transformWorld2View(this.location),
      rendRadius * Camera.currentScale,
      this.color,
    );
  }
}
