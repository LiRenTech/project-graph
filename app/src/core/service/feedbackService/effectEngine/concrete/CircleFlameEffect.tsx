import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { EffectObject } from "../effectObject";

/**
 * 圆形火光特效
 * 中间有颜色，边缘透明，中心放射状过渡
 */
export class CircleFlameEffect extends EffectObject {
  constructor(
    private readonly project: Project,
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
    this.project.shapeRenderer.renderCircleTransition(
      this.project.renderer.transformWorld2View(this.location),
      rendRadius * this.project.camera.currentScale,
      this.color,
    );
  }
}
