import { Color, mixColors, ProgressNumber, Vector } from "@graphif/data-structures";
import { Project } from "../../../../Project";
import { Effect } from "../effectObject";

/**
 * 线段特效
 * 直接显示全部，随着时间推移逐渐透明
 */
export class LineEffect extends Effect {
  getClassName(): string {
    return "LineEffect";
  }
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
  static default(fromLocation: Vector, toLocation: Vector) {
    return new LineEffect(
      new ProgressNumber(0, 30),
      fromLocation,
      toLocation,
      this.project.stageStyleManager.currentStyle.StageObjectBorder,
      this.project.stageStyleManager.currentStyle.StageObjectBorder,
      1,
    );
  }
  render(project: Project) {
    if (this.timeProgress.isFull) {
      return;
    }
    const fromLocation = project.renderer.transformWorld2View(this.fromLocation);
    const toLocation = project.renderer.transformWorld2View(this.toLocation);
    const fromColor = mixColors(this.fromColor, this.fromColor.toTransparent(), this.timeProgress.rate);
    const toColor = mixColors(this.toColor, this.toColor.toTransparent(), this.timeProgress.rate);
    project.curveRenderer.renderGradientLine(
      fromLocation,
      toLocation,
      fromColor,
      toColor,
      this.lineWidth * project.camera.currentScale,
    );
  }
}
