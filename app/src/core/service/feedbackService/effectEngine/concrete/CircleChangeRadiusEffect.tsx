import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { Effect } from "../effectObject";

/**
 * 圆形光圈缩放特效
 */
export class CircleChangeRadiusEffect extends Effect {
  constructor(
    private readonly project: Project,
    /**
     * 一开始为0，每tick + 1
     */
    public timeProgress: ProgressNumber,
    public location: Vector,
    public radiusStart: number,
    public radiusEnd: number,
    public color: Color,
  ) {
    super(timeProgress);
  }

  getClassName(): string {
    return "CircleChangeRadiusEffect";
  }

  get radius() {
    return this.radiusStart + (this.radiusEnd - this.radiusStart) * this.timeProgress.rate;
  }

  tick() {
    super.tick();
  }

  static fromConnectPointExpand(project: Project, location: Vector, expandRadius: number) {
    return new CircleChangeRadiusEffect(
      project,
      new ProgressNumber(0, 10),
      location,
      0.01,
      expandRadius,
      new Color(255, 255, 255),
    );
  }
  static fromConnectPointShrink(project: Project, location: Vector, currentRadius: number) {
    return new CircleChangeRadiusEffect(
      project,
      new ProgressNumber(0, 10),
      location,
      currentRadius,
      0.1,
      new Color(255, 255, 255),
    );
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    this.color.a = 1 - this.timeProgress.rate;
    this.project.shapeRenderer.renderCircle(
      this.project.renderer.transformWorld2View(this.location),
      this.radius * this.project.camera.currentScale,
      Color.Transparent,
      this.color,
      2 * this.project.camera.currentScale,
    );
  }
}
