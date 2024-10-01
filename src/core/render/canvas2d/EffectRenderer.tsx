import { Canvas } from "../../Canvas";
import Color from "../../Color";
import CircleFlameEffect from "../../effect/concrete/circleFlameEffect";
import TextRiseEffect from "../../effect/concrete/textRiseEffect";
import { easeInOutSine } from "../../effect/easings";
import { Camera } from "../../stage/Camera";
import { Vector } from "../../Vector";
import { Renderer } from "./renderer";
import { RenderUtils } from "./RenderUtils";

export namespace EffectRenderer {
  /**
   * 圆形火光特效
   * @param effect
   * @returns
   */
  export function renderCircleFlameEffect(effect: CircleFlameEffect) {
    if (effect.timeProgress.isFull) {
      return;
    }
    effect.color.a = 1 - effect.timeProgress.rate;
    const rendRadius = effect.radius * effect.timeProgress.rate;
    RenderUtils.rendCircleTransition(
      Canvas.ctx,
      Renderer.transformWorld2View(effect.location),
      rendRadius * Camera.currentScale,
      effect.color,
    );
  }

  /**
   * 屏幕中央的上升文字特效
   * @param render
   * @param effect
   * @returns
   */
  export function renderTextRiseEffect(effect: TextRiseEffect) {
    if (effect.timeProgress.isFull) {
      return;
    }
    // 在画布中心缓缓升高一段距离
    const centerLocation = new Vector(Renderer.w / 2, Renderer.h / 2);
    const distance = 50 * Camera.currentScale;

    Canvas.ctx.font = `${20 * Camera.currentScale}px Arial`;
    Canvas.ctx.fillStyle = Color.White.toString();
    Canvas.ctx.textAlign = "center";
    Canvas.ctx.textBaseline = "middle";
    Canvas.ctx.globalAlpha = 1 - easeInOutSine(effect.timeProgress.rate);
    Canvas.ctx.fillText(
      effect.text,
      centerLocation.x,
      centerLocation.y - distance * easeInOutSine(effect.timeProgress.rate),
    );
    Canvas.ctx.globalAlpha = 1;
  }
}
