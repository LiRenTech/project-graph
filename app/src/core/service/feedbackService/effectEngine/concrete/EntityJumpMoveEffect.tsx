import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { ShapeRenderer } from "../../../../render/canvas2d/basicRenderer/shapeRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";
import { RateFunctions } from "../mathTools/rateFunctions";

export class EntityJumpMoveEffect extends EffectObject {
  constructor(
    public time: number,
    public rectStart: Rectangle,
    public delta: Vector,
  ) {
    super(new ProgressNumber(0, time));
  }

  render() {
    const currentRect = this.rectStart.clone();
    currentRect.location = currentRect.location.add(this.delta.clone().multiply(this.timeProgress.rate));

    const groundShadowRect = currentRect.clone();

    const addHeight = RateFunctions.quadraticDownward(this.timeProgress.rate) * 100;
    currentRect.location.y -= addHeight;

    // 画地面阴影
    ShapeRenderer.renderRectWithShadow(
      groundShadowRect.transformWorld2View(),
      StageStyleManager.currentStyle.effects.windowFlash.toNewAlpha(0.2),
      Color.Transparent,
      2 * Camera.currentScale,
      StageStyleManager.currentStyle.effects.windowFlash.toNewAlpha(0.2),
      10,
      0,
      0,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );

    // 画跳高的框
    ShapeRenderer.renderRect(
      currentRect.transformWorld2View(),
      Color.Transparent,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
  }
}
