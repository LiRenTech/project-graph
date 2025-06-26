import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { Effect } from "../effectObject";

type MouseTipType =
  | "shrink"
  | "expand"
  | "moveLeft"
  | "moveRight"
  | "moveUp"
  | "moveDown"
  | "move"
  | "drag"
  | "cameraMoveToMouse"
  | "cameraBackToMouse";

/**
 * 在鼠标上释放一个小特效，用于提示
 */
export class MouseTipFeedbackEffect extends Effect {
  constructor(
    public override timeProgress: ProgressNumber,
    public type: MouseTipType,
    private direction: Vector,
  ) {
    super(timeProgress);
  }

  static default(type: MouseTipType) {
    return new MouseTipFeedbackEffect(new ProgressNumber(0, 15), type, Vector.getZero());
  }

  /**
   * 视野自由移动时、触控板触发 的鼠标提示
   * @param direction
   * @returns
   */
  static directionObject(direction: Vector) {
    return new MouseTipFeedbackEffect(new ProgressNumber(0, 15), "move", direction);
  }

  render(project: Project) {
    for (const effect of this.subEffects) {
      effect.render();
    }

    if (this.type === "shrink") {
      const hintCenter = project.mouseLocation.vector().add(new Vector(30, 25));
      project.curveRenderer.renderSolidLine(
        hintCenter.add(new Vector(-5, 0)),
        hintCenter.add(new Vector(5, 0)),
        StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
        2,
      );
    } else if (this.type === "expand") {
      const hintCenter = project.mouseLocation.vector().add(new Vector(30, 25));
      project.curveRenderer.renderSolidLine(
        hintCenter.add(new Vector(-5, 0)),
        hintCenter.add(new Vector(5, 0)),
        StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
        2,
      );
      project.curveRenderer.renderSolidLine(
        hintCenter.add(new Vector(0, -5)),
        hintCenter.add(new Vector(0, 5)),
        StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
        2,
      );
    } else if (this.type === "moveLeft") {
      // 鼠标向左移动，右边应该出现幻影
      project.curveRenderer.renderGradientLine(
        project.mouseLocation.vector().clone(),
        project.mouseLocation.vector().add(new Vector(100 * (1 - this.timeProgress.rate), 0)),
        StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(1 - this.timeProgress.rate),
        StageStyleManager.currentStyle.effects.successShadow.toTransparent(),
        10 * (1 - this.timeProgress.rate),
      );
    } else if (this.type === "moveRight") {
      project.curveRenderer.renderGradientLine(
        project.mouseLocation.vector().clone(),
        project.mouseLocation.vector().add(new Vector(-100 * (1 - this.timeProgress.rate), 0)),
        StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(1 - this.timeProgress.rate),
        StageStyleManager.currentStyle.effects.successShadow.toTransparent(),
        10 * (1 - this.timeProgress.rate),
      );
    } else if (this.type === "moveUp") {
      project.curveRenderer.renderGradientLine(
        project.mouseLocation.vector().clone(),
        project.mouseLocation.vector().add(new Vector(0, 100 * (1 - this.timeProgress.rate))),
        StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(1 - this.timeProgress.rate),
        StageStyleManager.currentStyle.effects.successShadow.toTransparent(),
        10 * (1 - this.timeProgress.rate),
      );
    } else if (this.type === "moveDown") {
      project.curveRenderer.renderGradientLine(
        project.mouseLocation.vector().clone(),
        project.mouseLocation.vector().add(new Vector(0, -100 * (1 - this.timeProgress.rate))),
        StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(1 - this.timeProgress.rate),
        StageStyleManager.currentStyle.effects.successShadow.toTransparent(),
        10 * (1 - this.timeProgress.rate),
      );
    } else if (this.type === "move") {
      project.curveRenderer.renderGradientLine(
        project.mouseLocation.vector().clone(),
        project.mouseLocation.vector().add(this.direction.multiply(-5 * (1 - this.timeProgress.rate))),
        StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
        StageStyleManager.currentStyle.StageObjectBorder.toTransparent(),
        2 * (1 - this.timeProgress.rate),
      );
    } else if (this.type === "drag") {
      project.shapeRenderer.renderCircle(
        project.mouseLocation.vector().clone(),
        6 * (1 - this.timeProgress.rate),
        Color.Transparent,
        StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
        1,
      );
    } else if (this.type === "cameraMoveToMouse") {
      project.curveRenderer.renderDashedLine(
        project.renderer.transformWorld2View(project.camera.location),
        project.mouseLocation.vector().clone(),
        StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(1 - this.timeProgress.rate),
        1,
        8,
      );
    } else if (this.type === "cameraBackToMouse") {
      const mouseBackLocation = project.mouseLocation
        .vector()
        .add(
          project.renderer
            .transformWorld2View(project.camera.location)
            .subtract(project.mouseLocation.vector())
            .multiply(2),
        );
      project.curveRenderer.renderDashedLine(
        project.renderer.transformWorld2View(project.camera.location),
        mouseBackLocation,
        StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(1 - this.timeProgress.rate),
        1,
        8,
      );
    }
  }
  getClassName(): string {
    return "MouseTipFeedbackEffect";
  }
}
