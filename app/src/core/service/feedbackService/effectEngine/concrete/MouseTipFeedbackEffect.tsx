import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { CurveRenderer } from "../../../../render/canvas2d/basicRenderer/curveRenderer";
import { ShapeRenderer } from "../../../../render/canvas2d/basicRenderer/shapeRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { MouseLocation } from "../../../controlService/MouseLocation";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";

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
export class MouseTipFeedbackEffect extends EffectObject {
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

  render(): void {
    for (const effect of this.subEffects) {
      effect.render();
    }

    if (this.type === "shrink") {
      const hintCenter = MouseLocation.vector().add(new Vector(30, 25));
      CurveRenderer.renderSolidLine(
        hintCenter.add(new Vector(-5, 0)),
        hintCenter.add(new Vector(5, 0)),
        StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
        2,
      );
    } else if (this.type === "expand") {
      const hintCenter = MouseLocation.vector().add(new Vector(30, 25));
      CurveRenderer.renderSolidLine(
        hintCenter.add(new Vector(-5, 0)),
        hintCenter.add(new Vector(5, 0)),
        StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
        2,
      );
      CurveRenderer.renderSolidLine(
        hintCenter.add(new Vector(0, -5)),
        hintCenter.add(new Vector(0, 5)),
        StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
        2,
      );
    } else if (this.type === "moveLeft") {
      // 鼠标向左移动，右边应该出现幻影
      CurveRenderer.renderGradientLine(
        MouseLocation.vector().clone(),
        MouseLocation.vector().add(new Vector(100 * (1 - this.timeProgress.rate), 0)),
        StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(1 - this.timeProgress.rate),
        StageStyleManager.currentStyle.effects.successShadow.toTransparent(),
        10 * (1 - this.timeProgress.rate),
      );
    } else if (this.type === "moveRight") {
      CurveRenderer.renderGradientLine(
        MouseLocation.vector().clone(),
        MouseLocation.vector().add(new Vector(-100 * (1 - this.timeProgress.rate), 0)),
        StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(1 - this.timeProgress.rate),
        StageStyleManager.currentStyle.effects.successShadow.toTransparent(),
        10 * (1 - this.timeProgress.rate),
      );
    } else if (this.type === "moveUp") {
      CurveRenderer.renderGradientLine(
        MouseLocation.vector().clone(),
        MouseLocation.vector().add(new Vector(0, 100 * (1 - this.timeProgress.rate))),
        StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(1 - this.timeProgress.rate),
        StageStyleManager.currentStyle.effects.successShadow.toTransparent(),
        10 * (1 - this.timeProgress.rate),
      );
    } else if (this.type === "moveDown") {
      CurveRenderer.renderGradientLine(
        MouseLocation.vector().clone(),
        MouseLocation.vector().add(new Vector(0, -100 * (1 - this.timeProgress.rate))),
        StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(1 - this.timeProgress.rate),
        StageStyleManager.currentStyle.effects.successShadow.toTransparent(),
        10 * (1 - this.timeProgress.rate),
      );
    } else if (this.type === "move") {
      CurveRenderer.renderGradientLine(
        MouseLocation.vector().clone(),
        MouseLocation.vector().add(this.direction.multiply(-5 * (1 - this.timeProgress.rate))),
        StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
        StageStyleManager.currentStyle.StageObjectBorder.toTransparent(),
        2 * (1 - this.timeProgress.rate),
      );
    } else if (this.type === "drag") {
      ShapeRenderer.renderCircle(
        MouseLocation.vector().clone(),
        6 * (1 - this.timeProgress.rate),
        Color.Transparent,
        StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
        1,
      );
    } else if (this.type === "cameraMoveToMouse") {
      CurveRenderer.renderDashedLine(
        Renderer.transformWorld2View(Camera.location),
        MouseLocation.vector().clone(),
        StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(1 - this.timeProgress.rate),
        1,
        8,
      );
    } else if (this.type === "cameraBackToMouse") {
      const mouseBackLocation = MouseLocation.vector().add(
        Renderer.transformWorld2View(Camera.location).subtract(MouseLocation.vector()).multiply(2),
      );
      CurveRenderer.renderDashedLine(
        Renderer.transformWorld2View(Camera.location),
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
