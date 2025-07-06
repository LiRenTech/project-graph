import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Effect } from "../effectObject";
import { RateFunctions } from "../mathTools/rateFunctions";

export class EntityJumpMoveEffect extends Effect {
  getClassName(): string {
    return "EntityJumpMoveEffect";
  }
  constructor(
    public time: number,
    public rectStart: Rectangle,
    public delta: Vector,
  ) {
    super(new ProgressNumber(0, time));
  }

  render(project: Project) {
    const currentRect = this.rectStart.clone();
    currentRect.location = currentRect.location.add(this.delta.clone().multiply(this.timeProgress.rate));

    const groundShadowRect = currentRect.clone();

    const addHeight = RateFunctions.quadraticDownward(this.timeProgress.rate) * 100;
    currentRect.location.y -= addHeight;

    // 画地面阴影
    project.shapeRenderer.renderRectWithShadow(
      project.renderer.transformWorld2View(groundShadowRect),
      this.project.stageStyleManager.currentStyle.effects.windowFlash.toNewAlpha(0.2),
      Color.Transparent,
      2 * project.camera.currentScale,
      this.project.stageStyleManager.currentStyle.effects.windowFlash.toNewAlpha(0.2),
      10,
      0,
      0,
      Renderer.NODE_ROUNDED_RADIUS * project.camera.currentScale,
    );

    // 画跳高的框
    project.shapeRenderer.renderRect(
      project.renderer.transformWorld2View(currentRect),
      Color.Transparent,
      this.project.stageStyleManager.currentStyle.StageObjectBorder,
      2 * project.camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * project.camera.currentScale,
    );
  }
}
