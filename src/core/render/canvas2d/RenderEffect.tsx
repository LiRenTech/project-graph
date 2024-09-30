import Color from "../../Color";
import CircleFlameEffect from "../../effect/concrete/circleFlameEffect";
import TextRiseEffect from "../../effect/concrete/textRiseEffect";
import { Vector } from "../../Vector";
import { Render } from "./render";
import { RenderUtils } from "./RenderUtils";

export namespace RenderEffect {
  /**
   * 圆形火光特效
   * @param effect
   * @returns
   */
  export function rendCircleFlameEffect(
    render: Render,
    effect: CircleFlameEffect,
  ) {
    if (effect.timeProgress.isFull) {
      return;
    }
    effect.color.a = 1 - effect.timeProgress.rate;
    const rendRadius = effect.radius * effect.timeProgress.rate;
    RenderUtils.rendCircleTransition(
      render.canvas.ctx,
      render.transformWorld2View(effect.location),
      rendRadius * render.cameraCurrentScale,
      effect.color,
    );
  }
  
  /**
   * 屏幕中央的上升文字特效
   * @param render
   * @param effect
   * @returns
   */
  export function rendTextRiseEffect(render: Render, effect: TextRiseEffect) {
    if (effect.timeProgress.isFull) {
      return;
    }
    // 在画布中心缓缓升高一段距离
    const centerLocation = new Vector(render.w / 2, render.h / 2);
    const distance = 50 * render.cameraCurrentScale;

    render.canvas.ctx.font = `${20 * render.cameraCurrentScale}px Arial`;
    render.canvas.ctx.fillStyle = Color.White.toString();
    render.canvas.ctx.textAlign = "center";
    render.canvas.ctx.textBaseline = "middle";
    render.canvas.ctx.fillText(
      effect.text,
      centerLocation.x,
      centerLocation.y - distance * effect.timeProgress.rate,
    );
  }
}
